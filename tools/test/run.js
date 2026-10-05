// node tools/test/run.js сценарий.js — открыть игру в headless Chromium (сервер на :8765) и выполнить сценарий
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: require('child_process').execSync('which chromium').toString().trim(), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  p.on('console', (m) => { if (m.type() === 'error' || m.text().startsWith('LOG')) { console.log(m.type(), m.text().slice(0, 400)); if (m.type() === 'error') errs.push(m.text()); } });
  p.on('pageerror', (e) => { console.log('PAGEERR', e.message, (e.stack || '').split('\n').slice(0, 3).join(' | ')); errs.push(e.message); });
  const sc = require(require('path').resolve(process.argv[2]));
  try { await sc(p, { errs, url: 'http://localhost:8765/index.html' }); } catch (e) { console.log('SCENARIO FAIL', e.message); }
  await b.close(); process.exit(0);
})();
