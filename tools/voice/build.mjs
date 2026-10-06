// Готовит задания для синтеза: node tools/voice/build.mjs  →  tools/voice/jobs.json
// Для каждой реплики: ключ (как в игре), чистый текст, текст для синтеза (числа и клавиши словами), голос персонажа.
import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process'; import { fileURLToPath } from 'url';
import { spoken, stripAddress, hasAddress, hasKeys, keyOf, hash } from '../../src/voicekey.js';
import { voiceFor, slug, folderFor, mood } from './voices.mjs';
const DIR = path.dirname(fileURLToPath(import.meta.url)); const ROOT = path.join(DIR, '..', '..');
const lines = JSON.parse(execFileSync('node', [path.join(DIR, 'extract.js')], { maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'inherit'] }).toString());
// ---- текст для синтеза ----
const NUM = ['ноль', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
const TENS = { 20: 'двадцать', 30: 'тридцать' };
const num = (n, fem = false, neut = false) => { n = +n; if (n >= 20) { const t = Math.floor(n / 10) * 10, u = n % 10; return TENS[t] + (u ? ' ' + num(u, fem, neut) : ''); } if (n === 1) return fem ? 'одна' : neut ? 'одно' : 'один'; if (n === 2) return fem ? 'две' : 'два'; return NUM[n]; };
const ORD = ['', 'первая', 'вторая', 'третья'];
const KEY_DESK = { F: 'эф', Q: 'кью', R: 'эр', T: 'тэ', B: 'бэ', J: 'джей', K: 'кей', H: 'аш', P: 'пэ' };
const KEY_TOUCH = { F: 'кнопку с ладошкой', Q: 'кнопку с глазом', R: 'кнопку со звёздочками', T: 'кнопку с рыбкой', B: 'кнопку с книгой', J: 'кнопку с мечом', K: 'кнопку со щитом' };
function ttsText(clean, touch) {
  let t = clean;
  t = t.replace(/Загадка (\d): /g, (m, n) => `Загадка ${ORD[n]}: `);
  t = t.replace(/Вижу (\d) из трёх/g, (m, n) => `Вижу ${['ни одной', 'одну', 'две'][n]} из трёх`);
  t = t.replace(/(\d)\/3 ниток/g, (m, n) => `${num(n, true)} из трёх ниток`);
  t = t.replace(/Спят: (\d)\/3/g, (m, n) => `Спят: ${num(n, true)} из трёх`);
  t = t.replace(/Струн у меня (\d) из 3/g, (m, n) => `Струн у меня ${num(n, true)} из трёх`);
  t = t.replace(/Брёвна (\d)\/3/g, (m, n) => `Брёвна: ${num(n, false, true)} из трёх`).replace(/мох (\d)\/2/g, (m, n) => `Мох: ${num(n)} из двух`).replace(/глина (\d)\/1/g, (m, n) => `Глина: ${num(n, true)} из одной`);
  t = t.replace(/сказов: (\d+) из 31/g, (m, n) => `сказов: ${num(n)} из тридцати одного`).replace(/слов: (\d+) из 9/g, (m, n) => `слов: ${num(n, false, true)} из девяти`);
  t = t.replace(/(\d+)\/(\d+)/g, (m, a, b) => `${num(a)} из ${num(b)}`).replace(/\d+/g, (m) => num(m));
  const K = touch ? KEY_TOUCH : KEY_DESK;
  if (touch) t = t.replace(/([Нн]ажми|[Нн]ажать) кнопк[аеуи] ([FQRBTJK])/g, '$1 $2');
  t = t.replace(/ЛКМ\/J|ЛКМ/g, touch ? 'кнопку с мечом' : 'левую кнопку мыши').replace(/ПКМ\/K|ПКМ/g, touch ? 'кнопку со щитом' : 'правую кнопку мыши');
  t = t.replace(/(^|[^A-Za-z])([FQRBTJKHP])(?![A-Za-z])/g, (m, a, k) => a + (K[k] || k));
  if (touch) t = t.replace(/(^|[.!?…] )?[Пп]робел/g, (m, a) => (a !== undefined ? a + 'Кнопку прыжка' : 'кнопку прыжка'));
  t = t.replace(/ \/ /g, ' или ').replace(/[*_#~`|<>\[\]{}]/g, ' ').replace(/[“”„"]/g, '').replace(/\s+/g, ' ').trim();
  return t;
}
// ---- задания ----
const jobs = new Map(); let skipped = 0;
function add(l, rawText, flag) {
  const clean = spoken(rawText); if (!clean || !/[А-Яа-яЁё]/.test(clean)) { skipped++; return; }
  const touch = flag === 't';
  const key = keyOf(l.who, clean, touch); if (jobs.has(key)) return;
  const v = voiceFor(l.who); const m = mood(rawText, v);
  const folder = folderFor(l.loc);
  const file = `${folder}/${slug(l.who)}_${key.slice(0, 8)}${touch ? '_t' : ''}.mp3`;
  jobs.set(key, { key, who: l.who, loc: l.loc, raw: rawText, clean, tts: ttsText(clean, touch), voice: m, file, kind: flag || 'base' });
}
const still = [];
for (const l of lines) {
  if (/^Загадка 0\d/.test(l.text)) continue; // артефакт сборщика (i + 1 как строка)
  add(l, l.text);
  if (hasAddress(l.text)) { const s = stripAddress(l.text); if (hasAddress(s)) still.push(l.text); add(l, s, 'n'); }
  if (hasKeys(l.text)) add(l, l.text, 't');
}
const out = [...jobs.values()];
fs.writeFileSync(path.join(DIR, 'jobs.json'), JSON.stringify(out, null, 1));
// читаемый список всех реплик: файл, персонаж, что звучит
fs.writeFileSync(path.join(DIR, 'lines.tsv'), 'файл\tперсонаж\tвариант\tтекст\n' + out.map((j) => [j.file, j.who === '*' ? 'герой (мысли)' : j.who, { base: '', n: 'без «Сказителя»', t: 'телефон' }[j.kind], j.clean].join('\t')).join('\n') + '\n');
console.error('jobs', out.length, 'skipped', skipped, 'chars', out.reduce((a, j) => a + j.tts.length, 0));
if (still.length) console.error('обращение не снято:\n' + still.join('\n'));
