// Подсказки сборщику реплик (extract.js): значения, которые статически не вычислить
// (параметры функций, счётчики, данные из таблиц). Каждая запись — [кто говорит, узел-значение].
const L = (arr) => ({ type: '__Lit', v: { s: arr } });
// вычислить константу-литерал из исходника файла: const NAME = <литерал>;
function data(c, name, env = {}) {
  const d = (c.decl[name] || [])[0]; if (!d) throw new Error('нет ' + name + ' в ' + c.file);
  const code = c.src.slice(d.start, d.end);
  return new Function(...Object.keys(env), 'return (' + code + ');')(...Object.values(env));
}
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String(a + i));
const subsets = (xs) => { const r = []; for (let m = 1; m < 1 << xs.length; m++) r.push(xs.filter((_, i) => m & (1 << i))); return r; };
// все строковые «цели» из функций objective(): return [pos, 'текст']
function objectives(src) {
  // тела функций objective() { … }: все строковые литералы внутри return [ … ]
  const res = new Set(); const re = /objective\(\)\s*\{/g; let m;
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length, d = 1; const a = i; while (i < src.length && d) { const ch = src[i]; if (ch === '{') d++; else if (ch === '}') d--; else if (ch === "'" || ch === '`') { const q = ch; i++; while (i < src.length && src[i] !== q) { if (src[i] === '\\') i++; i++; } } i++; }
    const body = src.slice(a, i); const rr = /return \[/g; let r;
    while ((r = rr.exec(body))) { let j = r.index + r[0].length, dd = 1; const b = j; while (j < body.length && dd) { const ch = body[j]; if (ch === '[') dd++; else if (ch === ']') dd--; else if (ch === "'") { j++; while (body[j] !== "'") { if (body[j] === '\\') j++; j++; } } j++; }
      const seg = body.slice(b, j - 1); const lit = /'((?:[^'\\]|\\.)*)'/g; let l; while ((l = lit.exec(seg))) if (/[А-Яа-яЁё]/.test(l[1])) res.add(l[1]); }
  }
  return [...res];
}
module.exports = {
  'src/extra.js': (c) => { c.ext['thrN()'] = L(range(0, 3)); },
    'src/chapters/forest.js': (c) => {
    c.ext['runeCount()'] = L(range(0, 2));
    c.ext.miss = L(subsets(['у старого пня', 'на мышиной поляне', 'у Лешего']).map((s) => s.join(', ')));
  },
  attrib: {}, // текст → кто (заполняется в extra)
  extra: {
    'src/evening.js': (c) => {
      const CAT = 'Кот учёный';
      const RETELL = data(c, 'RETELL'); const NPC = data(c, 'NPC', { CAT }); const GIFT = data(c, 'GIFT'); const NT = data(c, 'NIGHT_TALES');
      const out = [];
      for (const N of Object.values(NPC)) { for (const [t, [q]] of Object.entries(RETELL)) out.push([N.name, L([`«${t}», говоришь? А ну-ка: ${q}`])]); for (const t of [N.hi, N.bad, ...N.ok]) module.exports.attrib[t] = N.name; }
      for (const [k, t] of Object.entries(GIFT)) module.exports.attrib[t] = NPC[k].name;
      for (const tale of NT) {
        out.push([CAT, L([`Мур-р… Слушай сказку на ночь — «${tale.title}». А ты подсказывай, что было дальше.`, tale.moral])]);
        for (const st of tale.steps) { const s = [st.say, st.ask, st.after, st.right && `Мур, подскажу: «${st.right}».`].filter(Boolean); out.push([CAT, L(s)]); }
      }
      return out;
    },
    'src/main.js': (c) => {
      const CAT = 'Кот учёный', MER = 'Русалка', KOLO = 'Колобок';
      const out = [];
      // финал: число сказов и слов — отдельными предложениями (склеиваются при проигрывании)
      const BT = 31, WT = 9;
      out.push([CAT, L([...range(1, BT).map((n) => `Ты собрал сказов: ${n} из ${BT}.`), ...range(0, WT).map((n) => `Заветных слов: ${n} из ${WT}.`), 'Начни сказку заново — может, найдёшь другой финал!'])]);
      out.push([CAT, L(['Какое славное имя. Так и буду тебя звать.'])]);
      const hints = ['Русалка на ветвях бормочет загадки. Подойди к дубу с той стороны, где ветка над морем.', 'В берёзовой роще звено спрятано от простых глаз. Смотри Сказительским взглядом.', 'В берёзовой роще завелись забудки — серые, сонные. Взглядом увидишь их слабость: бей — и уснут.', 'Кикимора на болоте что-то стащила. Силой её не возьмёшь — Кикимор надо смешить.'];
      out.push([CAT, L([...hints, ...hints.map((h) => h + ' А ещё… мур, забыл. Нажми Q — нити подскажут.')])]);
      const R = [['Без окон, без дверей — полна горница людей.'], ['Сидит дед, во сто шуб одет. Кто его раздевает — тот слёзы проливает.'], ['Не лает, не кусает, а в дом не пускает.']];
      out.push([MER, L(R.map(([q], i) => `Загадка ${i + 1}: ${q}`))]);
      // Колобок: «Покатили <цель>! Я впереди.» — цели из objective() всех модулей Лукоморья
      const objs = new Set(); for (const f of ['src/main.js', 'src/extra.js', 'src/tales.js']) objectives(require('fs').readFileSync(require('path').join(__dirname, '../..', f), 'utf8')).forEach((t) => objs.add(t));
      out.push([KOLO, L([...objs].map((t) => `Покатили ${t}! Я впереди.`))]);
      out.push([KOLO, L(['Я впереди.'])]);
      return out;
    },
    'src/tales.js': (c, val) => {
      const who = (name) => { const v = val({ type: 'Identifier', name }, c); return v && v.s ? v.s : ['*']; };
      const out = [];
      // «Ещё не всё… Брёвна 1/3 · мох 0/2 · глина 1/1» — части через «·» звучат отдельно
      out.push([who('BU'), L(['Ещё не всё…', ...range(0, 3).map((n) => `Брёвна ${n}/3`), ...range(0, 2).map((n) => `мох ${n}/2`), ...range(0, 1).map((n) => `глина ${n}/1`)])]);
      out.push([who('KH'), L(range(0, 3).map((n) => `Спят: ${n}/3. Как уснут все три — я к коровушке.`))]);
      return out;
    },
    'src/chapters/bridge.js': (c, val) => {
      const R = data(c, 'RIDDLES'); const v = val({ type: 'Identifier', name: 'G1' }, c);
      return [[v && v.s ? v.s : ['*'], L(R.map(([q], i) => `Загадка ${i + 1}: ${q}`))]];
    },
    'src/chapters/kosh.js': (c) => [['Сказитель', L(['Лукоморье.', 'Распутье.', 'Жар-птица.', 'Смородина.', 'Навь.', 'Тридевятое.', 'Весна.', 'Правь.', 'Явь.', 'Буян.', 'Ты сложил семь заветных слов в сказку и рассказал её Кощею.'])]],
    'src/chapters/river.js': (c, val) => {
      // helper(key, who, text, choices, after)
      const out = []; const re = /helper\('\w+', (\w+), '([^']*)', \[[^\]]*\], '([^']*)'\)/g; let m;
      while ((m = re.exec(c.src))) { const v = val({ type: 'Identifier', name: m[1], start: m.index }, c); out.push([v && v.s ? v.s : ['*'], L([m[2], m[3]])]); }
      return out;
    },
    'src/chapters/sea.js': (c) => {
      const out = [];
      const objs = objectives(c.src); out.push(['Русалка', L([...objs.map((t) => `Плыви ${t}! Я рядом.`), 'Я рядом.'])]);
      out.push(['Садко', L([...range(0, 3).map((n) => `Струн у меня ${n} из 3.`), 'В гроте медузы…', 'Сундук на корабле крепкий — бей сильнее.', 'А в водорослях смотри взглядом.'])]);
      return out;
    },
  },
};
