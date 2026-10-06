// Сборщик реплик для озвучки: проходит по src/**/*.js, находит ui.say / ui.dialog и вычисляет все возможные тексты.
// node tools/voice/extract.js > tools/voice/lines.json
const fs = require('fs'), path = require('path');
let acorn; try { acorn = require('acorn'); } catch { acorn = require('/vercel/sandbox/node_modules/acorn'); }
const ROOT = path.join(__dirname, '..', '..');
const FILES = [...fs.readdirSync(path.join(ROOT, 'src')).filter((f) => f.endsWith('.js')).map((f) => 'src/' + f), ...fs.readdirSync(path.join(ROOT, 'src/chapters')).filter((f) => f.endsWith('.js')).map((f) => 'src/chapters/' + f)];
const CAP = 64; const UNK = null;
const warn = []; const out = [];
function walk(n, f, parent) { if (!n || typeof n.type !== 'string') return; n.parent = parent; f(n); for (const k in n) { if (k === 'parent' || k.startsWith('__')) continue; const v = n[k]; if (Array.isArray(v)) v.forEach((x) => x && typeof x.type === 'string' && walk(x, f, n)); else if (v && typeof v.type === 'string') walk(v, f, n); } }
const prod = (a, b) => { if (!a || !b) return UNK; const r = []; for (const x of a) for (const y of b) { r.push(x + y); if (r.length > CAP) return 'BIG'; } return r; };
const uniq = (a) => [...new Set(a)];
function makeCtx(file, src, ast) {
  const decl = {}; // имя → [init]
  const scopeOf = (n) => { let p = n.parent; while (p && !['BlockStatement', 'Program', 'ArrowFunctionExpression', 'FunctionDeclaration', 'FunctionExpression', 'ForStatement', 'ForOfStatement'].includes(p.type)) p = p.parent; return p || ast; };
  walk(ast, (n) => { if (n.type !== 'VariableDeclarator' || !n.init) return; const sc = scopeOf(n);
    if (n.id.type === 'Identifier') { const d = n.init; d.__scope = sc; (decl[n.id.name] ||= []).push(d); }
    if (n.id.type === 'ArrayPattern') n.id.elements.forEach((e, i) => { if (e && e.type === 'Identifier') (decl[e.name] ||= []).push({ type: '__Index', obj: n.init, i, __scope: sc }); }); });
  return { file, src, decl, ext: {} };
}
const CTX = {};
// значение узла: строки | массив/объект (структура) | UNK
function val(n, c, depth = 0) {
  if (!n || depth > 12) return UNK;
  switch (n.type) {
    case 'Literal': return typeof n.value === 'string' || typeof n.value === 'number' ? { s: [String(n.value)] } : UNK;
    case 'TemplateLiteral': { let acc = ['']; for (let i = 0; i < n.quasis.length; i++) { acc = prod(acc, [n.quasis[i].value.cooked]); if (acc === 'BIG') return { big: true, n }; if (i < n.expressions.length) { const v = strs(n.expressions[i], c, depth + 1); if (v === 'BIG') return { big: true, n }; if (!v) { const before = n.quasis.slice(0, i + 1).map((q) => q.value.cooked).join(''); const open = (before.match(/\(/g) || []).length - (before.match(/\)/g) || []).length; if (open > 0) { acc = prod(acc, ['0']); continue; } return { unk: true, n }; } acc = prod(acc, v); if (acc === 'BIG') return { big: true, n }; } } return { s: acc }; }
    case 'BinaryExpression': { if (n.operator !== '+') return UNK; const a = strs(n.left, c, depth + 1), b = strs(n.right, c, depth + 1); if (!a || !b) return { unk: true, n }; const p = prod(a, b); return p === 'BIG' ? { big: true, n } : { s: p }; }
    case 'ConditionalExpression': return merge(val(n.consequent, c, depth + 1), val(n.alternate, c, depth + 1), n);
    case 'LogicalExpression': return n.operator === '&&' ? val(n.right, c, depth + 1) : merge(val(n.left, c, depth + 1), val(n.right, c, depth + 1), n);
    case 'ArrayExpression': return { arr: n.elements.map((e) => (e && e.type === 'SpreadElement' ? { spread: val(e.argument, c, depth + 1) } : val(e, c, depth + 1))) };
    case 'ObjectExpression': { const o = {}; for (const p of n.properties) { if (p.type !== 'Property') continue; const k = p.key.name ?? p.key.value; o[k] = p.value; } return { obj: o, c }; }
    case 'Identifier': { if (c.ext[n.name]) return val(c.ext[n.name], c, depth + 1); let d = c.decl[n.name]; if (!d) return UNK;
      if (n.start != null) { const inS = d.filter((x) => x.__scope && x.__scope.start <= n.start && n.start <= x.__scope.end); if (inS.length) { const best = Math.min(...inS.map((x) => x.__scope.end - x.__scope.start)); d = inS.filter((x) => x.__scope.end - x.__scope.start === best); } } if (d.length === 1) return val(d[0].type === '__Index' ? idx(d[0], c) : d[0], c, depth + 1); return d.map((x) => val(x.type === '__Index' ? idx(x, c) : x, c, depth + 1)).reduce((a, b) => merge(a, b, n)); }
    case '__Lit': return n.v;
    case 'MemberExpression': {
      const o = val(n.object, c, depth + 1); if (!o) return UNK;
      if (o.arr) { if (!n.computed && n.property.name === 'length') return UNK; if (n.computed && n.property.type === 'Literal') return val0(o.arr[n.property.value]); return o.arr.map(val0).reduce((a, b) => merge(a, b, n), { s: [] }); }
      if (o.obj) { if (!n.computed) { const p = o.obj[n.property.name]; return p ? val(p, o.c, depth + 1) : UNK; } if (n.property.type === 'Literal') { const p = o.obj[n.property.value]; return p ? val(p, o.c, depth + 1) : UNK; } return Object.values(o.obj).map((p) => val(p, o.c, depth + 1)).reduce((a, b) => merge(a, b, n), { s: [] }); }
      if (o.each) return o.each.map((e) => val({ type: 'MemberExpression', object: { type: '__Lit', v: e }, property: n.property, computed: n.computed }, c, depth + 1)).reduce((a, b) => merge(a, b, n), { s: [] });
      return UNK;
    }
    case 'ChainExpression': return val(n.expression, c, depth);
    case 'CallExpression': { // ['a','b'].join(', ') и т.п. не вычисляем
      if (n.callee.type === 'Identifier' && c.ext[n.callee.name + '()']) return val(c.ext[n.callee.name + '()'], c, depth + 1);
      if (n.callee.type === 'MemberExpression' && !n.callee.computed && n.callee.property.name === 'join') return UNK;
      return UNK; }
  }
  return UNK;
}
const val0 = (v) => v;
function idx(d, c) { return { type: 'MemberExpression', object: d.obj, property: { type: 'Literal', value: d.i }, computed: true }; }
function merge(a, b, n) { if (!a || !b) return a && a.s && b === UNK ? { unk: true, n, s: a.s } : b && b.s && a === UNK ? { unk: true, n, s: b.s } : UNK; if (a.big || b.big) return { big: true, n }; if (a.unk || b.unk) return { unk: true, n, s: [...(a.s || []), ...(b.s || [])] }; if (a.s && b.s) return { s: uniq([...a.s, ...b.s]) }; if (a.s && !a.s.length) return b; if (b.s && !b.s.length) return a; return { each: [a, b] }; }
function strs(n, c, depth = 0) { const v = val(n, c, depth); if (!v) return UNK; if (v.big) return 'BIG'; if (v.unk) return UNK; if (v.s) return v.s; return UNK; }
// реплики из аргумента say (массив) / dialog (строка)
function lines(n, c, isSay, loc) {
  const res = [];
  const add = (v, nn) => {
    if (!v) { warn.push({ loc, why: 'unknown', src: c.src.slice(nn.start, nn.end).slice(0, 160) }); return; }
    if (v.big || v.unk) { warn.push({ loc, why: v.big ? 'big' : 'partial', src: c.src.slice((v.n || nn).start, (v.n || nn).end).slice(0, 160) }); if (v.s) res.push(...v.s); return; }
    if (v.s) res.push(...v.s); else if (v.arr) v.arr.forEach((e) => (e && e.spread ? addArr(e.spread, nn) : add(e, nn))); else if (v.each) v.each.forEach((e) => add(e, nn)); else warn.push({ loc, why: 'struct', src: c.src.slice(nn.start, nn.end).slice(0, 160) });
  };
  const addArr = (v, nn) => { if (v && v.arr) v.arr.forEach((e) => (e && e.spread ? addArr(e.spread, nn) : add(e, nn))); else if (v && v.each) v.each.forEach((e) => addArr(e, nn)); else add(v, nn); };
  const v = val(n, c);
  if (isSay) addArr(v, n); else add(v, n);
  return res;
}
for (const file of FILES) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module' });
  const c = (CTX[file] = makeCtx(file, src, ast));
  const HINT = require('./hints.js')[file]; if (HINT) HINT(c, val);
  walk(ast, (n) => {
    if (n.type !== 'CallExpression') return; const cl = n.callee; const name = cl.type === 'MemberExpression' ? cl.property.name : cl.name;
    if (!['say', 'dialog'].includes(name) || n.arguments.length < 2) return; if (cl.type === 'MemberExpression' && cl.object.type === 'ThisExpression') return;
    const loc = file + ':' + (src.slice(0, n.start).split('\n').length);
    const sp = strs(n.arguments[0], c) || ['*'];
    const ls = lines(n.arguments[1], c, name === 'say', loc);
    for (const t of ls) for (const s of sp) out.push({ who: s, text: t, loc });
  });
  // дополнительные реплики (данные, которые произносятся через параметры функций)
  const H = require('./hints.js').extra[file]; if (H) for (const [who, expr] of H(c, val)) { const sp = Array.isArray(who) ? who : [who]; const ls = lines(expr, c, true, file + ':extra'); for (const t of ls) for (const s of sp) out.push({ who: s, text: t, loc: file + ':extra' }); }
}
const AT = require('./hints.js').attrib; const seen = new Set(); const res = out.filter((o) => { if (AT[o.text] && AT[o.text] !== o.who) return false; const k = o.who + '|' + o.text; if (seen.has(k)) return false; seen.add(k); return true; });
fs.writeFileSync(path.join(__dirname, 'warn.json'), JSON.stringify(warn, null, 1));
process.stdout.write(JSON.stringify(res, null, 1));
console.error('lines', res.length, 'warnings', warn.length);
