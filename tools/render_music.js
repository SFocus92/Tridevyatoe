// node tools/render_music.js  (нужны playwright, chromium, ffmpeg; сервер на :8765) → assets/music/*.mp3
const { chromium } = require('playwright'); const fs = require('fs'); const { execSync } = require('child_process');
(async () => {
  const b = await chromium.launch({ executablePath: execSync('which chromium').toString().trim(), args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage(); p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/tools/render_music.html'); await p.waitForFunction(() => window.ready);
  const names = process.argv.slice(2).length ? process.argv.slice(2) : ['luk', 'forest', 'mountains', 'rivers', 'koschei', 'boss', 'finale', 'night', 'sea', 'bridge'];
  for (const n of names) {
    const r = await p.evaluate((n) => window.renderTheme(n, n === 'night' || n === 'mountains' ? 2 : 3), n);
    const pcm = Buffer.from(r.b64, 'base64'); const wav = `/tmp/${n}.raw`; fs.writeFileSync(wav, pcm);
    execSync(`ffmpeg -y -loglevel error -f s16le -ar ${r.sr} -ac 2 -i ${wav} -c:a libmp3lame -b:a 112k assets/music/${n}.mp3`);
    console.log(n, r.seconds.toFixed(1) + 's', 'peak', r.peak.toFixed(2), (fs.statSync(`assets/music/${n}.mp3`).size / 1024).toFixed(0) + 'KB');
  }
  await b.close(); process.exit(0);
})();
