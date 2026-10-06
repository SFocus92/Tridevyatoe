// Ключи записанной озвучки: одинаково считаются в игре и в сборщике (tools/voice/build.mjs).
// Озвучивается «чистый» текст: без ремарок в скобках, эмодзи и кавычек-ёлочек — ровно то, что раньше читал speechSynthesis.
export function spoken(text) {
  const s = String(text ?? ''); const out = []; let depth = 0;
  for (let j = 0; j < s.length;) {
    const ch = String.fromCodePoint(s.codePointAt(j));
    if (ch === '(') { depth++; out.push(' '); } else if (ch === ')' && depth) depth--; else if (depth) { /* ремарка */ } else if (/[\u{1F300}-\u{1FAFF}\u2600-\u27BF\uFE0F]/u.test(ch)) out.push(' '); else if (ch !== '«' && ch !== '»') out.push(ch);
    j += ch.length;
  }
  return out.join('').replace(/\s+/g, ' ').replace(/\s+([,.!?…:;])/g, '$1').trim();
}
// обращение «, Сказитель!» → «!» — запись без имени, когда игрок назвался своим именем
export function stripAddress(text) {
  if (typeof text !== 'string') return text;
  let t = text.replace(/^Сказитель, (\S)/, (m, ch) => ch.toUpperCase());
  t = t.replace(/([.!?…] )Сказитель, (\S)/g, (m, a, ch) => a + ch.toUpperCase());
  t = t.replace(/^Сказитель[!.…]+ ?/, '').replace(/([.!?…] )Сказитель[!.…]+( |$)/g, '$1');
  t = t.replace(/, Сказитель(?=[,.!?…:)]|$)/g, '');
  t = t.replace(/(\() ?Сказитель(?=[,.!?…:)])/g, '$1');
  return t;
}
export const hasAddress = (text) => typeof text === 'string' && /(^|[,!?.…(] )Сказитель(?=[,.!?…:)]|$)|^Сказитель(?=[,!])/.test(text);
// предложения — для склейки реплик с числами и именами из готовых кусочков
export function sentences(clean) {
  return String(clean).split(/(?<=[.!?…])\s+|\s+·\s+/).map((x) => x.replace(/^[—–-]\s*/, '').trim()).filter(Boolean);
}
// cyrb53 → base36: короткий устойчивый хэш
export function hash(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
export const keyOf = (who, clean, touch = false) => hash((touch ? 't|' : '') + who + '|' + clean);
// есть ли в тексте клавиши, которые на телефоне заменяются значками (тогда для телефона своя запись)
export const hasKeys = (text) => /\(([FQRBTJK])\)|([Нн]ажми|[Нн]ажать|клавиш[аеуиы]?|кнопк[аеуи]) ([FQRBTJK])(?![a-zA-Z])|(^|[\s«(>])([FQRBTJK]) — |[Пп]робел|ЛКМ|ПКМ/.test(spoken(text));
