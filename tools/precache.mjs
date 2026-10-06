// Список файлов игры для офлайна (без озвучки — её список в assets/voice/index.json): node tools/precache.mjs → precache.json
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = ['./', 'index.html', 'style.css'];
const walk = (d) => { for (const f of fs.readdirSync(path.join(ROOT, d))) { const p = d + '/' + f; const st = fs.statSync(path.join(ROOT, p)); if (st.isDirectory()) { if (p !== 'assets/voice') walk(p); } else if (!/\.(md|txt|py|map)$/i.test(f) && !/License/i.test(f)) out.push(p); } };
['src', 'vendor', 'assets'].forEach(walk);
fs.writeFileSync(path.join(ROOT, 'precache.json'), JSON.stringify(out));
console.log('precache.json:', out.length, 'файлов');
