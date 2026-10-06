# agent.md — памятка для будущих агентов

«Тридевятое: Сказитель» — добрая 3D-игра по русским народным сказкам (8–16 лет). Чистый браузер: Three.js + ES-модули, **без сборки и без npm-зависимостей в рантайме**. Сайт: https://sfocus92.github.io/Tridevyatoe/ (GitHub Pages из ветки `main`, корень репо).

## Главные правила
1. **Не ломать работающее.** Правки точечные; новое — отдельным модулем с `try/catch` (как `extra.js`, `tales.js`), чтобы ошибка не роняла игру.
2. После каждой правки: проверить синтаксис, прогнать тест, **обновить README («Что нового…») и `docs/PLAN.md`**, поднять версию `CACHE` в `sw.js`, закоммитить и запушить в `main`.
3. Сохранения игроков не ломать: ключ `localStorage` `tridevyatoe_save_v1` (`SAVE_KEY` в `main.js`). Новые поля добавлять с значением по умолчанию, старые не переименовывать.
4. Тон — добрый: без крови и страшилок; враги «расколдовываются», а не умирают. Тексты — по-русски.
5. Не коммитить токены и секреты. Ассеты — только CC0/OFL (см. `CREDITS.md`); исключение — озвучка Silero TTS (CC BY-NC 4.0, игра некоммерческая).

## Что где лежит
| Путь | Что это |
|---|---|
| `index.html`, `style.css` | Разметка HUD/меню/диалогов и стили. Мобильная версия — правила `body.touch …` в конце `style.css`. |
| `sw.js` | Service worker: кэш `assets/` и `vendor/`, отдельный кэш озвучки `VOICE` (не стирается при релизе), докачка всего для офлайна по `precache.json` (`node tools/precache.mjs`). **Меняй `CACHE`** при каждом релизе. |
| `src/main.js` | Ядро (~1400 строк): сцена, герой, камера, управление (клавиатура/мышь/тач), Лукоморье (стартовый край), сохранения, трекер заданий (`trackerHtml`), телепорт, загрузка глав, игровой цикл. В конце — `ctx` (API для модулей) и `window.__game` (для тестов). |
| `src/chapters/*.js` | Края-главы: `forest`, `mount` (Ледяные горы), `river`, `kosh` (Кощеево царство), `sea` (Морское царство), `bridge` (Калинов мост). Каждый `export default (ctx) => ({ id, name, center, radius, group, sky, music, spawn, tp, objective, tracker, update, init, onEnter, … })`. Грузятся лениво через `import()`. `common.js` — общие помощники (арка-портал, небо, `near`). |
| `src/extra.js` | Побочные сказы Лукоморья и Сивка-Бурка (`player.ride === true`). |
| `src/tales.js` | v1.4–v1.6 «Новые сказки в старых краях»: 11 сказов, Сундук чудес, Серый волк (`player.ride === 'wolf'`). Сказы в краях строятся в `BUILD[id]` и появляются, только когда край пройден. |
| `src/evening.js` | Вечер у костра: пересказы (`RETELL`), обереги (`CHARMS`), сказки на ночь (`NIGHT_TALES`), смена дня и ночи. |
| `src/characters.js` | Персонажи на Kenney Blocky Characters: `KINDS` (скин + аксессуары), `makeChar`. Превью — `preview.html`. |
| `src/ui.js` | HUD, диалоги, Книга сказов, тосты; `touchText` подменяет подсказки клавиш на тач-версии. |
| `src/audio.js` | Звуки и музыка (`assets/music/*.mp3`, длины петель — `MUSIC_LEN`). |
| `src/assets.js`, `src/life.js` | Загрузка GLB-моделей/китов; шейдер «оживания» мира (серое → цветное). |
| `assets/` | `models/` (Kenney GLB), `kits/` (наборы персонажей и построек, `blocky/skins/*.png` — наши скины), `music/`, `fonts/`, `ui/` (заставка). |
| `vendor/` | Three.js и аддоны (не трогать без нужды). |
| `tools/skins.py` | Генератор скинов персонажей (Pillow) → `assets/kits/blocky/skins/`. |
| `tools/render_music.*` | Рендер музыки в mp3 (Playwright + ffmpeg). |
| `tools/test/` | Тестовый запускатель Playwright, бот-проходчик (`bot_inject.js`) и дымовой тест. |
| `docs/PLAN.md` | План по версиям. README — описание и «Что нового». |

## Как устроены задания
- Строка задания в HUD: `objective()` у края/модуля; список в правом верхнем углу: `tracker()` → `trackerHtml()` в `main.js`.
- Состояние — в объекте `st` (сохраняется целиком). Сказы в Книге — `st.book`, всего `BOOK_TOTAL` в `main.js` (сейчас 31) — **увеличь, если добавляешь сказ**, и добавь пересказ в `RETELL` (`evening.js`).
- Взаимодействия (F / кнопка ✋): объекты `{ label, pos(), r, cond(), act: async () => … }` в списке `interactables`.
- Имя игрока — `st.name` (спрашивает Кот в `catTalk`, меняется в настройках). Функция `personal()` в `ui.js` подставляет имя только в **обращения** («, Сказитель!», «Сказитель, …») во всех диалогах и тостах. Рассказ в 3-м лице («Сказитель собрал…») и «Сказительский взгляд» не трогаются — пиши обращения через запятую, и имя подставится само.
- **Записанная озвучка (v1.5)** — `src/voice.js` + `src/voicekey.js`, файлы `assets/voice/<край>/<персонаж>_<ключ>.mp3`, манифест `assets/voice/index.json`. Ключ = хэш «кто | текст без ремарок». **Изменил или добавил реплику — перезапиши озвучку** (`tools/voice/README.md`): `node tools/voice/build.mjs && python3 tools/voice/synth.py` — пересинтезируются только новые реплики. Реплики с числами/данными из таблиц — в `tools/voice/hints.js`. Новый персонаж — голос в `tools/voice/voices.mjs`.
- Запасная озвучка — `speechSynthesis` в `evening.js` (`VOICE`: высота и темп по имени говорящего; держи pitch 0.5–1.5, rate 0.88–1.1). Печать текста в такт — `ui.dialog` (`ui.js`): по часам с заученной скоростью `tri_voice_cps` и подстройкой по `onboundary`. Тест — `tools/test/voice.js`.
- Новый персонаж: скин в `tools/skins.py` → запустить → добавить в `KINDS`.
- Новое место на карте Лукоморья: занеси его в `ZONES` (`main.js`), иначе туда насадятся деревья.

## Как проверять
```bash
python3 -m http.server 8765                      # из корня репо
for f in src/*.js src/chapters/*.js sw.js; do cp $f /tmp/x.mjs; node --check /tmp/x.mjs || echo BAD $f; done
node tools/test/run.js tools/test/smoke.js       # нужен playwright и chromium
```
- Сценарий — `module.exports = async (page, { url, errs }) => {…}`; итог смотри по `ERRORS 0`.
- Быстрый старт с нужного места: положить сейв в `localStorage['tridevyatoe_save_v1']`, перезагрузить, нажать `#btnCont`. Переход в край: `window.__game.travel('forest')`.
- Бот: после загрузки `page.addScriptTag({ path: 'tools/test/bot_inject.js' })`, затем `window.__bot({...})`, — он сам ходит и отвечает в диалогах.
- Телефон: Playwright-контекст `{ isMobile: true, hasTouch: true, viewport: { width: 844, height: 390 } }` — включается `body.touch`, джойстик и кнопки.
- Обязательно смотри скриншоты: в headless WebGL идёт через swiftshader (медленно, но работает).

## Релиз
```bash
git add -A && git commit -m "vX.Y: …" && git push origin main
curl -s https://sfocus92.github.io/Tridevyatoe/sw.js | grep CACHE   # Pages обновляется ~1–2 мин
```
Игрокам — обновить страницу с Ctrl+F5 (на телефоне — переоткрыть вкладку).
