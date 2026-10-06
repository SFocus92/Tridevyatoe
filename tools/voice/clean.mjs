// Удаляет из assets/voice файлы, которых нет в jobs.json (реплику убрали или изменили): node tools/voice/clean.mjs
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const DIR = path.dirname(fileURLToPath(import.meta.url)); const OUT = path.join(DIR, '..', '..', 'assets', 'voice');
const keep = new Set(JSON.parse(fs.readFileSync(path.join(DIR, 'jobs.json'), 'utf8')).map((j) => j.file)); let n = 0;
for (const d of fs.readdirSync(OUT)) { const p = path.join(OUT, d); if (!fs.statSync(p).isDirectory()) continue; for (const f of fs.readdirSync(p)) if (f.endsWith('.mp3') && !keep.has(d + '/' + f)) { fs.unlinkSync(path.join(p, f)); n++; } }
console.log('удалено файлов:', n);
