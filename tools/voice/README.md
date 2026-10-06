# Озвучка «Тридевятого»

Все реплики игры записаны заранее: `assets/voice/<край>/<персонаж>_<ключ>.mp3`, список — `assets/voice/index.json`
(ключ → файл). Читаемый список всех реплик — `tools/voice/lines.tsv`.

- Голос — нейросеть **Silero TTS `v5_5_ru`** (дикторы aidar, eugene, baya, kseniya, xenia), CPU, без интернета.
- Ударения и ё — **Silero Stress** (омографы по контексту) + словарь `STRESS` в `synth.py` для сказочных слов.
- Голоса персонажей (диктор, высота в полутонах, темп, эхо) — `voices.mjs`; эмоции — по ремаркам в скобках
  («шёпотом», «тоненький голосок», «хихикает», «из окошка»…).
- В игре: `src/voice.js` ищет запись по ключу «кто | текст без ремарок» (`src/voicekey.js`). Если игрок назвался
  своим именем — играет вариант без обращения «Сказитель»; на телефоне — вариант «нажми кнопку с глазом» вместо «нажми Q».
  Реплики с числами склеиваются из записанных предложений. Нет записи — читает `speechSynthesis` браузера.

## Перезаписать после правки текстов

```bash
python3 -m venv venv && . venv/bin/activate
pip install torch --index-url https://download.pytorch.org/whl/cpu && pip install silero-stress numpy
curl -L -o /tmp/v5_5_ru.pt https://models.silero.ai/models/tts/ru/v5_5_ru.pt
node tools/voice/build.mjs                       # собрать реплики → tools/voice/jobs.json, lines.tsv
python3 tools/voice/synth.py --model /tmp/v5_5_ru.pt   # синтез только новых/изменённых (≈2 реплики в секунду)
node tools/voice/clean.mjs                       # удалить записи реплик, которых больше нет
```

- Реплика с числом или данными из таблицы (`${…}`) не нашлась сборщиком — добавь её в `hints.js`
  (`node tools/voice/extract.js >/dev/null` печатает число предупреждений, подробности — `warn.json`).
- Новый персонаж — строка в `VOICES` (`voices.mjs`). Неправильное ударение — слово в `STRESS` (`synth.py`) с `+` перед ударной гласной.
- Перезаписать часть: `python3 tools/voice/synth.py --where "j['who'] == 'Кощей Бессмертный'"`.
- После перезаписи поднимать версию `CACHE` в `sw.js` не обязательно: у изменённой реплики новый ключ, значит новый файл.

Лицензия модели Silero `v5_5_ru` — CC BY-NC 4.0 (игра некоммерческая). Для коммерции — модель `v5_cis_base` (MIT) с теми же ударениями.
