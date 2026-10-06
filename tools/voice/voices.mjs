// Голоса персонажей: диктор Silero (aidar, eugene — мужские; baya, kseniya, xenia — женские),
// сдвиг высоты в полутонах (st), темп (rate), громкость (gain, дБ). Эмоции — по ремаркам в скобках (mood).
const V = (speaker, st = 0, rate = 1, extra = {}) => ({ speaker, st, rate, gain: 0, ...extra });
export const VOICES = {
  'Сказитель': V('baya', 0, 0.97), '*': V('kseniya', 0, 1), 'Камень на распутье': V('aidar', -2, 0.9, { echo: 1 }), 'Камень у моста': V('aidar', -2, 0.9, { echo: 1 }),
  'Костёр': V('baya', 0, 0.95), 'Портал': V('baya', 0, 1), 'По щучьему велению': V('kseniya', -1, 0.95, { echo: 1 }), 'Избушка': V('aidar', -3, 0.95),
  'Кот учёный': V('aidar', 1, 0.95), 'Кот': V('aidar', 1, 0.95),
  'Русалка': V('xenia', 1, 0.97), 'Кикимора': V('xenia', 3, 1.04), 'Жар-птица': V('xenia', 3, 1), 'Снегурочка': V('xenia', 1, 0.97), 'Алёнушка': V('xenia', 0, 0.98),
  'Дед': V('aidar', -3, 0.9), 'Дедушка': V('aidar', -3, 0.9), 'Старик': V('aidar', -3, 0.9), 'Старый селянин': V('eugene', -3, 0.9),
  'Баба-Яга': V('kseniya', 2, 0.95), 'Бабка': V('baya', -1, 0.92), 'Старуха': V('baya', -2, 0.94),
  'Кощей Бессмертный': V('eugene', -4, 0.9), 'Кощей': V('eugene', -4, 0.9), 'Кощеева тень': V('eugene', -4, 0.9, { echo: 1 }), 'Голос из чулана': V('eugene', -4, 0.9, { echo: 1 }),
  'Морозко': V('aidar', -4, 0.88), 'Леший': V('eugene', -3, 0.95), 'Щука': V('kseniya', -1, 0.96),
  'Колобок': V('xenia', 4, 1.04), 'Мышка-норушка': V('xenia', 5, 1.05), 'Иванушка': V('xenia', 3, 1), 'Жучка': V('xenia', 3, 1.05),
  'Финист — Ясный Сокол': V('eugene', 1, 1), 'Василиса Премудрая': V('kseniya', 1, 0.96), 'Иван': V('eugene', 0, 1), 'Иван-царевич': V('aidar', 1, 1), 'Иван?': V('eugene', -2, 1),
  'Илья Муромец': V('aidar', -2, 0.92),
  'Змей Горыныч': V('eugene', -4, 0.94), 'Голова-загадочница': V('eugene', -4, 0.95), 'Голова огненная': V('aidar', -4, 0.92), 'Голова хитрая': V('eugene', -2, 0.97),
  'Морской царь': V('aidar', -4, 0.92), 'Садко': V('eugene', 0, 1), 'Чудо-юдо Рыба-кит': V('aidar', -4, 0.9, { echo: 1 }), 'Золотая рыбка': V('xenia', 2, 1),
  'Медведь': V('aidar', -4, 0.92), 'Волк': V('eugene', -3, 0.96), 'Серый волк': V('eugene', -3, 0.96), 'Тук-тук!': V('eugene', -3, 0.96), 'Лиса': V('kseniya', 2, 1),
  'Петушок': V('eugene', 4, 1.04), 'Коза': V('baya', 2, 1), 'Бык': V('aidar', -4, 0.92), 'Лягушка': V('xenia', 2, 1.02), 'Царевна-лягушка': V('kseniya', 1, 0.98),
  'Сивка-Бурка': V('aidar', -1, 0.95, { echo: 1 }), 'Солдат': V('aidar', 0, 1), 'Мужик': V('eugene', -1, 1), 'Маша': V('xenia', 2, 1), 'Крошечка-Хаврошечка': V('xenia', 1, 0.98),
  'Одноглазка': V('kseniya', 2, 1), 'Двуглазка': V('baya', 1, 1), 'Трёхглазка': V('xenia', 3, 1), 'Бурёнушка': V('baya', -2, 0.94),
  'Марья Моревна': V('baya', 1, 0.97), 'Царевна Елена': V('kseniya', 0, 0.98), 'Соловей-разбойник': V('eugene', -1, 1.04),
  'Молочная речка': V('baya', 1, 0.97), 'Печка': V('kseniya', -1, 0.95), 'Яблонька': V('xenia', 1, 0.98),
};
export function voiceFor(who) {
  if (VOICES[who]) return { ...VOICES[who] };
  return /[ая]$/.test(who) ? V('kseniya') : V('eugene'); // незнакомец: по окончанию имени
}
// эмоции по ремаркам: «(шёпотом)», «(тоненький голосок)», «(хихикает)», «(издалека)»…
export function mood(raw, v) {
  // высота не ниже −4 полутонов: детям важнее разборчивость, чем «страшность»
  const r = (String(raw).match(/\(([^)]*)\)/g) || []).join(' ').toLowerCase(); const m = { ...v, tags: [] };
  const has = (re) => re.test(r);
  if (has(/шёпот|шепч|тихоньк|тихо|вполголоса/)) { m.rate *= 0.94; m.gain -= 4; m.tags.push('тихо'); }
  if (has(/тоненьк|писк/)) { m.st += 5; m.tags.push('тоненько'); }
  if (has(/грубый|толстый|басом|рычит|рявк/)) { m.st -= 1; m.tags.push('грубо'); }
  if (has(/хихик|смеётся|смеясь|хохоч|гогоч|ха-ха/)) { m.rate *= 1.04; m.st += 1; m.tags.push('весело'); }
  if (has(/сердит|гневн|кричит|грозно|громко/)) { m.rate *= 1.04; m.gain += 1; m.tags.push('сердито'); }
  if (has(/плач|груст|вздыха|печальн|всхлип/)) { m.rate *= 0.92; m.st -= 1; m.tags.push('грустно'); }
  if (has(/сонн|зева|засыпа|сквозь сон/)) { m.rate *= 0.88; m.tags.push('сонно'); }
  if (has(/издалека|из-за двери|за дверью|из норы|из окошка/)) { m.gain -= 3; m.echo = 1; m.tags.push('издалека'); }
  m.st = Math.max(-4, Math.min(6, m.st));
  return m;
}
const TR = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' };
export const slug = (who) => (who === '*' ? 'geroy' : [...who.toLowerCase()].map((c) => TR[c] ?? (/[a-z0-9]/.test(c) ? c : '-')).join('').replace(/-+/g, '-').replace(/^-|-$/g, '')) || 'golos';
const FOLD = { 'src/main.js': 'lukomorye', 'src/extra.js': 'lukomorye-skazy', 'src/tales.js': 'novye-skazki', 'src/evening.js': 'vecher-u-kostra', 'src/chapters/forest.js': 'dremuchiy-les', 'src/chapters/mount.js': 'ledyanye-gory', 'src/chapters/river.js': 'molochnye-reki', 'src/chapters/kosh.js': 'koscheevo-tsarstvo', 'src/chapters/sea.js': 'morskoe-tsarstvo', 'src/chapters/bridge.js': 'kalinov-most' };
export const folderFor = (loc) => FOLD[loc.split(':')[0]] || 'prochee';
