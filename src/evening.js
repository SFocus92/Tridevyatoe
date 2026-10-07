// v1.1 «Вечера Лукоморья»: день и ночь, звёзды, светлячки, Жар-птица, «Сказка на ночь»,
// пересказ сказов (крафт оберегов), доверие героев, озвучка диалогов голосом браузера.
import { createVoice } from './voice.js';
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const CAT = 'Кот учёный';

// вопрос для пересказа каждого сказа: [вопрос, верный ответ, неверный, неверный]
export const RETELL = {
  'У лукоморья дуб зелёный': ['Что висело на дубе у Лукоморья?', 'Златая цепь', 'Серебряный колокол', 'Сундук с иглой'],
  'Репка': ['Кто помог вытянуть репку последним?', 'Мышка-норушка', 'Жучка', 'Бабка'],
  'По щучьему велению': ['Какие слова подарила щука?', '«По щучьему велению, по моему хотению»', '«Сим-сим, откройся»', '«Горшочек, вари»'],
  'Колобок': ['Что сделал Иван, догнав Колобка?', 'Не съел, а предложил дружбу', 'Съел его', 'Отнёс бабушке'],
  'Жар-птица': ['Сколько перьев Жар-птицы нужно было собрать?', 'Семь', 'Три', 'Двенадцать'],
  'Леший и рубаха наизнанку': ['Как не дать Лешему себя запутать?', 'Вывернуть рубаху наизнанку', 'Громко свистеть', 'Бежать без оглядки'],
  'Баба-Яга': ['Что попросил Сказитель у избушки?', '«Повернись к лесу задом, ко мне передом»', '«Улетай за тридевять земель»', '«Спрячься в болоте»'],
  'Морозко': ['Как отвечать Морозко на «Тепло ли тебе?»', '«Тепло, батюшка»', '«Холодно, отстань!»', 'Промолчать'],
  'Финист — Ясный Сокол': ['Где томился Финист — Ясный Сокол?', 'В ледяной глыбе у озера', 'В сундуке Кощея', 'В печке'],
  'Молочные реки, кисельные берега': ['Как получить помощь Печки, Яблоньки и Речки?', 'Вежливо отведать угощение', 'Сказать «некогда!»', 'Потребовать силой'],
  'Гуси-лебеди': ['Кого унесли гуси-лебеди?', 'Иванушку', 'Колобка', 'Емелю'],
  'Кощей Бессмертный': ['Где смерть Кощея?', 'На конце иглы, игла в яйце', 'В хвосте у зайца', 'Под дубовым корнем'],
  'Сказитель': ['Отчего Тридевятое снова ожило?', 'Сказитель вспомнил сказки', 'Пришла весна', 'Кощей передумал'],
  'Теремок': ['Кто не поместился в теремке?', 'Медведь косолапый', 'Мышка-норушка', 'Лягушка-квакушка'],
  'Курочка Ряба': ['Кто разбил золотое яичко?', 'Мышка хвостиком махнула', 'Дед', 'Курочка'],
  'Заюшкина избушка': ['Кто выгнал лису из заюшкиной избушки?', 'Петух с косой', 'Собаки', 'Медведь'],
  'Сивка-Бурка': ['Как позвать Сивку-Бурку?', '«Встань передо мной, как лист перед травой!»', '«Но, лошадка, вперёд!»', '«Сим-сим, откройся»'],
  'Царевна-лягушка': ['Кем обернулась лягушка?', 'Василисой Премудрой', 'Бабой-Ягой', 'Снегурочкой'],
  'Лиса и журавль': ['Чем лиса угостила журавля?', 'Кашей, размазанной по тарелке', 'Пирогами', 'Окрошкой в кувшине'],
  'Морозко и две сестры': ['Чем наградил Морозко добрую падчерицу?', 'Шубой и сундуком с приданым', 'Ледяной короной', 'Ничем'],
  'Двенадцать месяцев': ['Кто помог падчерице найти фиалки зимой?', 'Братья-месяцы у костра', 'Морозко', 'Баба-Яга'],
  'Садко': ['На чём играл Садко Морскому царю?', 'На гуслях', 'На балалайке', 'На дудочке'],
  'Чудо-юдо Рыба-кит': ['Что разбудило Рыбу-кита?', 'Сказитель разбил ракушки-забудки', 'Громкая песня', 'Щекотка'],
  'Сказка о рыбаке и рыбке': ['Что первым попросила старуха у рыбки?', 'Новое корыто', 'Терем', 'Стать царицей'],
  'Сивка-Бурка, вещая каурка': ['С какой попытки конь допрыгнул до окошка царевны?', 'С третьей', 'С первой', 'С десятой'],
  'Царевна-лягушка и ковёр-самолёт': ['Почему не надо было жечь лягушачью кожу?', 'Чудо нельзя торопить', 'Она красивая', 'Её можно продать'],
  'Илья Муромец': ['Что подняло Илью Муромца на ноги?', 'Живая вода', 'Горячий чай', 'Звон колоколов'],
  'Змей Горыныч и Калинов мост': ['Кем оказался Змей Горыныч?', 'Стражем Калинова моста', 'Разбойником', 'Кощеевым братом'],
  'Вершки и корешки': ['Что посеял мужик, когда медведь выбрал вершки?', 'Репу', 'Пшеницу', 'Горох'],
  'Каша из топора': ['Из чего солдат «сварил» кашу?', 'Из топора — с крупой, солью и маслом', 'Из камня', 'Из сапога'],
  'Петушок — золотой гребешок': ['Чем выманили лису из норы?', 'Игрой на гуслях', 'Горохом', 'Пирожком'],
  'Маша и медведь': ['Что кричала Маша из короба?', '«Вижу-вижу! Не садись на пенёк!»', '«Помогите!»', '«Ку-ка-ре-ку!»'],
  'Волк и семеро козлят': ['Как козлята узнали волка во второй раз?', 'По серой лапе в окошке', 'По хвосту', 'По шапке'],
  'Лиса и волк': ['Чем лиса велела волку ловить рыбу?', 'Хвостом в проруби', 'Сетью', 'Удочкой'],
  'Зимовье зверей': ['Из чего построили зимовье?', 'Из брёвен, мха и глины', 'Из снега', 'Из соломы'],
  'Крошечка-Хаврошечка': ['Какой глаз забыла убаюкать Хаврошечка в сказке?', 'Третий глаз Трёхглазки', 'Глаз Одноглазки', 'Глаз коровушки'],
  'Марья Моревна': ['Чего нельзя было делать по наказу Марьи Моревны?', 'Заглядывать в чулан', 'Открывать сундук', 'Ходить к замку'],
  'Илья Муромец и Соловей-разбойник': ['Чем Соловей-разбойник валил всех с ног?', 'Свистом', 'Огнём', 'Дубиной'],
  'Иван-царевич и Серый волк': ['Как надо было взять Жар-птицу?', 'Без золотой клетки', 'Вместе с клеткой', 'Сетью ночью'],
  'Лиса со скалочкой': ['Кого хозяева посадили в мешок вместо девочки?', 'Злую собаку', 'Петуха', 'Кота'],
  'Петушок и бобовое зёрнышко': ['Чем курочка спасла петушка?', 'Маслом — смазала горлышко', 'Водой', 'Песней'],
  'Лиса и тетерев': ['Чем тетерев напугал лису?', 'Сказал, что бегут собаки', 'Закричал', 'Улетел'],
  'Журавль и цапля': ['Чем кончилась сказка о журавле и цапле?', 'Они до сих пор ходят свататься друг к другу', 'Поженились', 'Поссорились навсегда'],
};

// обереги, которые мастерят герои, когда доверие дорастает до 2
export const CHARMS = {
  cat: { name: 'Перо Сказителя', icon: '🪶', text: 'удары сильнее на треть' },
  mermaid: { name: 'Жемчужина русалки', icon: '🦪', text: '+1 ❤ к здоровью' },
  kiki: { name: 'Болотный огонёк', icon: '🟢', text: 'Сказительский взгляд тратит вдвое меньше Слова' },
  ded: { name: 'Репяное семечко', icon: '🌱', text: 'здоровье понемногу восстанавливается само' },
};
const NPC = {
  cat: { name: CAT, hi: 'Мур? О чём поговорим, Сказитель?', ok: ['Мур-р-р! Ты рассказываешь лучше меня. Не говори никому.', 'Вот это сказ! Даже хвост распушился.'], bad: 'Мур… Что-то ты путаешь. Перечитай Книгу Сказов (B) и приходи.' },
  mermaid: { name: 'Русалка', hi: 'Ой, Сказитель! Расскажешь мне что-нибудь? Я так люблю сказки…', ok: ['Ах, как красиво! Я запою эту сказку волнам.', 'Ещё, ещё! Нет, лучше потом — я хочу запомнить.'], bad: 'Хи-хи, ты перепутал! Волны так не шумят.' },
  kiki: { name: 'Кикимора', hi: 'Опять ты? Ну, давай, рассказывай. Только чтоб интересно!', ok: ['Хм. Неплохо. Болото даже забулькало от удовольствия.', 'Хи-хи! Ладно, признаю — хорошо рассказываешь.'], bad: 'Враньё! Я эту сказку знаю, там всё не так.' },
  ded: { name: 'Дед', hi: 'А, внучок! Присядь, старику сказку расскажи.', ok: ['Эх, хорошо! Как в детстве, на печи.', 'Вот спасибо, уважил старика.'], bad: 'Ась? Что-то не так, внучок. Бабка рассказывала иначе.' },
};
const GIFT = {
  cat: 'Мур. Ты рассказал мне две сказки — значит, ты настоящий Сказитель. Держи моё перо: им пишутся сказки, а в бою оно делает удар крепче.',
  mermaid: 'Ты мне как друг теперь. Возьми жемчужину со дна морского — она бережёт сердце.',
  kiki: 'Тьфу, расчувствовалась. На вот, болотный огонёк: с ним Сказительский взгляд не так устаёт.',
  ded: 'Держи, внучок, семечко от нашей репки. Носи с собой — и силы будут прибывать сами.',
};

// «Сказки на ночь»: кот у костра рассказывает, а ты подсказываешь, что было дальше
export const NIGHT_TALES = [
  { id: 'teremok', title: 'Теремок', moral: 'Мур… Вот и сказке конец. Места хватит всем, если строить вместе.', steps: [
    { say: 'Стоит в поле теремок. Он не низок, не высок…', show: ['terem'] },
    { say: 'Бежала мимо мышка-норушка: «Терем-теремок! Кто в тереме живёт?» Никто не отзывается. Стала мышка в теремке жить.', show: ['mouse'] },
    { ask: 'Прискакала к теремку… кто?', right: 'Лягушка-квакушка', wrong: ['Медведь косолапый', 'Курочка Ряба'], show: ['frog'], after: '«Я мышка-норушка, а ты кто?» — «А я лягушка-квакушка». — «Иди ко мне жить!»' },
    { ask: 'Бежит мимо… кто?', right: 'Зайчик-побегайчик', wrong: ['Волчок — серый бочок', 'Колобок'], show: ['bunny'] },
    { ask: 'А потом пришла…', right: 'Лисичка-сестричка', wrong: ['Жар-птица', 'Баба-Яга'], show: ['fox'] },
    { ask: 'За ней прибежал…', right: 'Волчок — серый бочок', wrong: ['Кот учёный', 'Медведь'], show: ['wolf'], after: 'Живут они впятером, песни поют. Вдруг идёт медведь косолапый…' },
    { say: '«Терем-теремок! Кто в тереме живёт?» — «А ты кто?» — «А я медведь, всех давишь!»', show: ['bear'] },
    { ask: 'Полез медведь в теремок — и что случилось?', right: 'Раздавил теремок', wrong: ['Поместился и стал жить', 'Испугался и убежал'], act: 'crush' },
    { ask: 'Что же сделали звери?', right: 'Построили новый теремок — больше прежнего', wrong: ['Разбежались кто куда', 'Поругались'], act: 'rebuild', after: 'Еле-еле успели выскочить. А потом взяли брёвна, напилили досок — и выстроили новый терем, лучше прежнего!' },
  ] },
  { id: 'ryaba', title: 'Курочка Ряба', moral: 'Мур. Простое — не значит хуже. Самое дорогое то, что рядом каждый день.', steps: [
    { say: 'Жили-были дед да баба, и была у них курочка Ряба.', show: ['hen'] },
    { say: 'Снесла курочка яичко — да не простое, а золотое.', show: ['goldEgg'] },
    { ask: 'Дед бил-бил — не разбил. Баба била-била — не разбила. Кто же разбил?', right: 'Мышка бежала, хвостиком махнула', wrong: ['Курочка клюнула', 'Кот учёный лапкой'], show: ['mouse'], act: 'breakEgg', after: 'Яичко упало и разбилось. Плачет дед, плачет баба.' },
    { ask: 'А что сказала курочка?', right: '«Снесу вам яичко простое»', wrong: ['«Снесу два золотых»', '«Больше нести не буду»'], show: ['egg'], after: '«Не плачь, дед, не плачь, баба: снесу вам яичко не золотое — простое!»' },
  ] },
  { id: 'zayka', title: 'Заюшкина избушка', moral: 'Мур. Смел не тот, кто силён, а тот, кто за друга стоит.', steps: [
    { say: 'Жили-были лиса да заяц. У лисы избушка ледяная, у зайчика — лубяная.', show: ['iceHut', 'hut', 'fox', 'bunny'] },
    { ask: 'Пришла весна. Что стало с избушкой лисы?', right: 'Растаяла', wrong: ['Выросла', 'Улетела'], act: 'melt', after: 'Попросилась лиса к зайчику погреться — да его же и выгнала. Идёт заяц, плачет.' },
    { ask: 'Кто первым взялся помочь зайчику?', right: 'Собаки', wrong: ['Петух', 'Ёжик'], show: ['dog'], after: '«Гав-гав! Пойди, лиса, вон!» А лиса с печи: «Как выскочу, как выпрыгну — пойдут клочки по закоулочкам!» Испугались собаки, убежали.', hide: ['dog'] },
    { ask: 'Кто пришёл потом — и тоже испугался?', right: 'Медведь, а за ним бык', wrong: ['Колобок', 'Кот учёный'], show: ['bear', 'bull'], hide: ['bear', 'bull'], after: 'И медведь убежал, и бык убежал. Сидит зайчик под кустом, плачет.' },
    { ask: 'А кто не побоялся и прогнал лису?', right: 'Петух с косой', wrong: ['Мышка', 'Лягушка'], show: ['rooster'], act: 'foxRun', after: '«Ку-ка-реку! Несу косу на плечи, хочу лису посечи!» Испугалась лиса — и убежала. А зайчик с петухом стали жить-поживать.' },
  ] },
  { id: 'crane', title: 'Лиса и журавль', moral: 'Мур. Угощай друга так, чтобы и ему было удобно.', steps: [
    { say: 'Подружилась лиса с журавлём и позвала его в гости.', show: ['fox', 'crane'] },
    { ask: 'Чем угостила лиса журавля?', right: 'Кашей, размазанной по тарелке', wrong: ['Пирогами', 'Окрошкой в кувшине'], show: ['plate'], after: 'Журавль стучит-стучит носом по тарелке — ничего не склюёт. А лиса всю кашу сама слизала.' },
    { ask: 'Чем ответил журавль, когда позвал лису к себе?', right: 'Окрошкой в кувшине с узким горлышком', wrong: ['Кашей на тарелке', 'Мёдом в бочке'], show: ['jug'], hide: ['plate'], after: 'Лиса вертится вокруг кувшина — ни лизнуть, ни понюхать. А журавль клюёт себе да клюёт.' },
    { ask: 'Чем кончилась их дружба?', right: 'Как аукнулось, так и откликнулось', wrong: ['Стали лучшими друзьями', 'Открыли харчевню'], after: 'С тех пор и дружба у лисы с журавлём врозь.' },
  ] },
  { id: 'sivka', title: 'Сивка-Бурка', moral: 'Мур. Доброе сердце и верное слово сильнее насмешек.', steps: [
    { say: 'Перед смертью отец велел сыновьям три ночи стеречь его могилу. Старшие испугались, а пошёл младший — Иванушка-дурачок.' },
    { ask: 'В полночь пришёл чудесный конь. Какими словами его зовут?', right: '«Сивка-бурка, вещая каурка, встань передо мной, как лист перед травой!»', wrong: ['«Конь-огонь, скачи ко мне!»', '«По щучьему велению»'], show: ['horse'], after: 'Влез Иван коню в одно ухо, а из другого вылез — да таким молодцем, что ни в сказке сказать, ни пером описать!' },
    { say: 'А царь объявил: кто на коне допрыгнет до высокого терема и поцелует царевну в окошке — тот на ней и женится.', show: ['tower'] },
    { ask: 'С какой попытки допрыгнул Иван до окошка?', right: 'С третьей', wrong: ['С первой', 'Так и не допрыгнул'], act: 'jump', after: 'Раз — не допрыгнул, два — чуть-чуть, а на третий раз — до самого окошка! Поцеловал царевну, а она приложила ему ко лбу свой перстень.' },
    { ask: 'Как царевна узнала Ивана на пиру?', right: 'По печати от перстня на лбу', wrong: ['По голосу', 'По красным сапогам'], show: ['ring'], after: 'Братья смеялись над дурачком, а царевна сразу увидела печать — и сыграли весёлую свадьбу.' },
  ] },
  { id: 'frog', title: 'Царевна-лягушка', moral: 'Мур. Не по виду судят — по делам. И не торопи чудо: оно приходит в своё время.', steps: [
    { say: 'Велел царь трём сыновьям пустить по стреле: куда упадёт стрела — там и невесту искать.', show: ['arrow'] },
    { ask: 'Куда упала стрела Ивана-царевича?', right: 'В болото, к лягушке', wrong: ['На купеческий двор', 'В царский сад'], show: ['frog'], after: '«Квак! Возьми меня замуж, Иван-царевич». Делать нечего — взял он лягушку.' },
    { ask: 'Что лягушка испекла царю за одну ночь?', right: 'Пышный белый каравай', wrong: ['Горелый блин', 'Ничего не испекла'], show: ['loaf'] },
    { say: 'На пиру лягушка обернулась Василисой Премудрой: махнула левым рукавом — разлилось озеро, махнула правым — поплыли белые лебеди.', act: 'princess' },
    { ask: 'Что натворил Иван, пока Василиса плясала?', right: 'Сжёг лягушачью кожу', wrong: ['Спрятал кожу в сундук', 'Отдал кожу царю'], act: 'burn', after: 'И пропала Василиса: «Ищи меня за тридевять земель, в царстве Кощея Бессмертного…»' },
    { ask: 'Чем кончилась сказка?', right: 'Иван нашёл Василису и одолел Кощея', wrong: ['Василиса осталась лягушкой', 'Иван про неё забыл'], act: 'dance', after: 'Добрые звери помогли ему, достал он Кощееву смерть — и вернулся домой с Василисой. Тут и сказке конец!' },
  ] },
  { id: 'morozko2', title: 'Морозко и две сестры', moral: 'Мур. Доброе слово и терпение греют лучше любой шубы.', steps: [
    { say: 'Жила-была мачеха, и было у неё две девушки: падчерица — работящая да добрая, и родная дочка — ленивая да капризная.', show: ['girl', 'sister'] },
    { say: 'Невзлюбила мачеха падчерицу и велела старику отвезти её в зимний лес и оставить под ёлкой.', show: ['sled', 'fir'], hide: ['sister'] },
    { ask: 'Пришёл Морозко, потрескивает, пощёлкивает: «Тепло ли тебе, девица?» Что ответила падчерица?', right: '«Тепло, Морозушко, тепло, батюшка»', wrong: ['«Холодно! Уходи!»', 'Ничего не ответила'], show: ['morozko'], after: 'Пожалел её Морозко, укутал в шубу, одарил сундуком с приданым.' },
    { ask: 'Что увидел старик, когда приехал за дочкой?', right: 'Румяную девицу в шубе, с сундуком', wrong: ['Ледяную статую', 'Пустую поляну'], show: ['chest'], after: 'Обрадовался старик, привёз падчерицу домой. А собачка под столом тявкает: «Тяф-тяф! Стариковой дочке в золоте ходить!»' },
    { ask: 'Позавидовала мачеха и отправила в лес родную дочку. Что та ответила Морозко?', right: '«Убирайся, мне и так холодно!»', wrong: ['«Тепло, батюшка»', 'Спела ему песенку'], show: ['sister'], hide: ['girl', 'chest'], after: 'Рассердился Морозко — и не дал ей ни шубы, ни сундука. Вернулась она домой ни с чем, дрожа от холода.' },
    { ask: 'Чему научилась мачехина дочка?', right: 'Что грубостью добра не получишь', wrong: ['Что Морозко злой', 'Что в лес ходить нельзя'], act: 'dance', after: 'С той поры, говорят, и она стала вежливой. А падчерица вышла замуж и жила припеваючи.' },
  ] },
  { id: 'months', title: 'Двенадцать месяцев', moral: 'Мур. Всему своё время: кто чтит порядок мира, тому и мир поможет.', steps: [
    { say: 'Посреди зимы, в лютый январь, злая мачеха послала падчерицу в лес: «Принеси фиалок — не вернёшься без них!»', show: ['girl', 'fir'] },
    { say: 'Шла девочка по сугробам и увидела на поляне большой костёр, а вокруг сидят двенадцать братьев — двенадцать месяцев.', show: ['months'] },
    { ask: 'Кто из братьев взял посох и уступил место весне?', right: 'Старший брат Январь — передал посох Марту', wrong: ['Самый младший — Декабрь', 'Никто не уступил'], act: 'spring', after: 'Махнул Март посохом — растаял снег, и на поляне расцвели фиалки!' },
    { ask: 'Потом мачеха потребовала земляники. Какой месяц помог?', right: 'Июнь', wrong: ['Февраль', 'Ноябрь'], show: ['berries'], after: 'Июнь махнул посохом — и поляна покраснела от земляники. А потом Сентябрь дал ей румяных яблок.' },
    { ask: 'Мачеха с дочкой сами пошли к костру и грубо потребовали всего сразу. Что случилось?', right: 'Январь махнул рукавом — и началась метель', wrong: ['Месяцы подарили им лето', 'Они нашли сундук'], act: 'snow', after: 'Замело их метелью, долго плутали они по лесу и вернулись домой — притихшие и уже не такие сердитые.' },
    { ask: 'А что получила падчерица?', right: 'Месяцы стали ей друзьями и каждую весну приходили в гости', wrong: ['Ничего', 'Корону'], act: 'dance', after: 'С тех пор у её крыльца первыми в округе распускаются цветы. Вот и сказке конец.' },
  ] },
  { id: 'rollpin', title: 'Лиса со скалочкой', moral: 'Мур. Кто хитростью наживается, тот на хитрость и нарвётся.', steps: [
    { say: 'Шла лиса по дорожке и нашла скалочку. Подняла и пошла дальше.', show: ['fox', 'rollpin'] },
    { say: 'Пришла в деревню, постучалась: «Пустите переночевать, а скалочку мою положите к курочкам». А ночью лиса скалочку в печку бросила.', show: ['hut'], hide: ['rollpin'] },
    { ask: 'Утром лиса кричит: «Где моя скалочка? Отдавайте за неё…» Что?', right: 'Курочку', wrong: ['Корову', 'Пирожок'], show: ['hen'] },
    { ask: 'В другой избе лиса курочку «потеряла». Что потребовала взамен?', right: 'Гусочку', wrong: ['Скалочку', 'Ведро'], show: ['goose'] },
    { ask: 'Так лиса меняла да меняла и потребовала девочку. Кого хозяева посадили в мешок вместо девочки?', right: 'Злую собаку', wrong: ['Камень', 'Подушку'], show: ['dog'], act: 'foxRun', after: 'Развязала лиса мешок — а оттуда собака как выскочит! Лиса — бежать, только хвост мелькнул.' },
  ] },
  { id: 'bean', title: 'Петушок и бобовое зёрнышко', moral: 'Мур. Не спеши — подавишься. А друг в беде и через три двора добежит.', steps: [
    { say: 'Жили-были петушок и курочка. Петушок всё торопился, клевал зёрнышки впопыхах…', show: ['rooster', 'hen'] },
    { ask: 'Что случилось с петушком?', right: 'Подавился бобовым зёрнышком', wrong: ['Улетел за море', 'Потерял гребешок'], show: ['bean'] },
    { ask: 'Побежала курочка к хозяйке: «Дай маслица — петушку горлышко смазать». А хозяйка: «Беги к корове, пусть даст…»', right: 'Молочка', wrong: ['Яблочко', 'Скалочку'], show: ['bull'] },
    { ask: 'А корова говорит: «Беги к хозяину — пусть даст мне…»', right: 'Свежей травы', wrong: ['Пирожок', 'Перо'] },
    { ask: 'Хозяин дал травы, корова — молока, хозяйка сбила масло. Что сделала курочка?', right: 'Смазала петушку горлышко — зёрнышко проскочило', wrong: ['Отдала масло лисе', 'Съела масло сама'], act: 'dance', after: 'Петушок вскочил и запел во всё горло: «Ку-ка-ре-ку!»' },
  ] },
  { id: 'grouse', title: 'Лиса и тетерев', moral: 'Мур. На хитрость найдётся смекалка: думай, кто и зачем тебе сладко поёт.', steps: [
    { say: 'Сидел тетерев на дереве. Подошла лиса: «Здравствуй, тетеревочек, мой дружочек! Слыхал новость?»', show: ['grouse', 'fox'] },
    { ask: 'Какой «указ» выдумала лиса?', right: 'Звери и птицы больше друг друга не трогают — спускайся!', wrong: ['Все птицы улетают на юг', 'Деревья рубить нельзя'] },
    { ask: 'Что ответил хитрый тетерев?', right: '«Вон собаки бегут — им, верно, тоже указ объявили?»', wrong: ['Спустился к лисе', 'Заплакал'], show: ['dog'] },
    { ask: 'А что лиса?', right: '«Может, они указа не слыхали» — и убежала', wrong: ['Подружилась с собаками', 'Полезла на дерево'], act: 'foxRun' },
  ] },
  { id: 'heron', title: 'Журавль и цапля', moral: 'Мур. Гордость да упрямство счастье за порог гонят. Сказал «да» — не тяни.', steps: [
    { say: 'Жили на болоте журавль и цапля — по разным концам. Скучно журавлю одному…', show: ['crane', 'heron'] },
    { ask: 'Пошёл журавль свататься. Что ответила цапля?', right: '«Не пойду за тебя: ноги долгие, платье короткое!»', wrong: ['«Пойду с радостью!»', 'Промолчала'] },
    { ask: 'Ушёл журавль. А цапля передумала и пришла к нему. Что ответил журавль?', right: '«Не надо мне тебя!»', wrong: ['«Иди скорее!»', 'Спел песню'] },
    { ask: 'А потом журавль снова передумал… Чем кончилось?', right: 'Так и ходят они друг к другу свататься до сих пор', wrong: ['Поженились на другой день', 'Улетели за море'], act: 'dance' },
  ] },
];
export const NIGHT_TOTAL = NIGHT_TALES.length;

export function initEvening(c, X) {
  const { THREE, S, ui, player } = c; const lukGroup = c.REGIONS.luk.group; const H = X.H;
  const OPT = X.OPT; const scene = c.scene;
  let tod = 0.35, night = 0, elev = 1, lastSt = null, regenAcc = 0, sndAcc = 0, stage = null, stageTimer = 0, telling = false;
  const CYCLE = 540; // секунд на сутки
  const ensure = (s) => { s.nightTales ??= []; s.trust ??= {}; s.told ??= {}; s.charms ??= []; return s; };

  // ---------- небо: звёзды и луна ----------
  const dot = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d'); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,.6)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); })();
  const starGeo = new THREE.BufferGeometry(); { const a = []; for (let i = 0; i < 700; i++) { const u = Math.random() * Math.PI * 2, v = Math.random() * 0.9 + 0.08; a.push(Math.cos(u) * Math.cos(v) * 380, Math.sin(v) * 380, Math.sin(u) * Math.cos(v) * 380); } starGeo.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); }
  const starMat = new THREE.PointsMaterial({ map: dot, size: 3, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false, color: 0xfff6d8 });
  const stars = new THREE.Points(starGeo, starMat); stars.renderOrder = -0.5; stars.frustumCulled = false; scene.add(stars);
  const moon = new THREE.Mesh(new THREE.CircleGeometry(14, 32), new THREE.MeshBasicMaterial({ color: 0xfff3c8, transparent: true, opacity: 0, fog: false, depthWrite: false })); scene.add(moon);
  const WHITE = new THREE.Color(0xffffff), NIGHTH = new THREE.Color(0x6f86d8); let hemiTinted = false;
  const NT = new THREE.Color(0x0a1436), NB = new THREE.Color(0x26345f), DUSK = new THREE.Color(0xff9a5a), MOONC = new THREE.Color(0x9fb4ff);

  // ---------- светлячки ----------
  const FF = 110, ffBase = [], ffGeo = new THREE.BufferGeometry(); const ffPos = new Float32Array(FF * 3);
  const spots = [[-30, 14, 9], [9, 9, 6], [-6, 30, 8], [0, 0, 14], [27, -24, 10]];
  for (let i = 0; i < FF; i++) { const [x, z, r] = spots[i % spots.length]; const a = Math.random() * 6.28, d = Math.sqrt(Math.random()) * r; ffBase.push([x + Math.cos(a) * d, z + Math.sin(a) * d, Math.random() * 6.28, 0.6 + Math.random() * 1.6]); }
  ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
  const ffMat = new THREE.PointsMaterial({ map: dot, size: 0.45, color: 0xd9ff70, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const fireflies = new THREE.Points(ffGeo, ffMat); fireflies.frustumCulled = false; lukGroup.add(fireflies);

  // ---------- Жар-птица ----------
  const fb = new THREE.Group(); lukGroup.add(fb); fb.visible = false;
  { const B = (col) => new THREE.MeshBasicMaterial({ color: col });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), B(0xff9a1e)); body.scale.set(0.8, 0.8, 1.5); fb.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), B(0xffd23a)); head.position.set(0, 0.35, 0.8); fb.add(head);
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 6), B(0xff4a1a)); crest.position.set(0, 0.75, 0.75); fb.add(crest);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 5), B(0xfff0a0)); beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.32, 1.15); fb.add(beak);
    const wingShape = new THREE.Shape(); wingShape.moveTo(0, 0); wingShape.quadraticCurveTo(1.2, 0.5, 2.2, -0.2); wingShape.lineTo(1.4, -0.5); wingShape.lineTo(0, -0.5);
    const wg = new THREE.ShapeGeometry(wingShape); const wm = new THREE.MeshBasicMaterial({ color: 0xff6a1a, side: THREE.DoubleSide });
    fb.userData.wings = [1, -1].map((sd) => { const piv = new THREE.Group(); piv.position.set(0.3 * sd, 0.15, 0); const w = new THREE.Mesh(wg, wm); w.rotation.x = -Math.PI / 2; w.scale.x = sd; piv.add(w); fb.add(piv); return piv; });
    [[0, 0xffc040], [0.35, 0xff5020], [-0.35, 0xff5020]].forEach(([a, col]) => { const t = new THREE.Mesh(new THREE.ConeGeometry(0.16, 2.4, 6), B(col)); t.rotation.x = -Math.PI / 2 - 0.25; t.rotation.z = a; t.position.set(a * 0.8, 0.1, -1.7); fb.add(t); });
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dot, color: 0xffa040, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })); glow.scale.setScalar(5); fb.add(glow); fb.userData.glow = glow; }
  const PERCH = X.FIREBIRD_SEAT ? X.FIREBIRD_SEAT.clone().add(new THREE.Vector3(0, 0.45, 0)) : new THREE.Vector3(-4.5, H(-4.5, 6.5) + 2.4, 6.5); // ветка дуба напротив русалки
  let perched = false;

  // ---------- сцена «Сказки на ночь» у костра ----------
  const STAGE = X.FIRE3.clone().add(new THREE.Vector3(-2.2, 0, 3.4)); STAGE.y = H(STAGE.x, STAGE.z);
  const T3 = (col) => c.toon(col, {}, true);
  const tint = (o, col) => { o.traverse((m) => { if (m.material) { m.material = m.material.clone(); m.material.color?.multiply(new THREE.Color(col)); } }); return o; };
  const blob = (col, sx, sy, sz) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), T3(col)); m.scale.set(sx, sy, sz); return m; };
  const ACTORS = {
    terem: () => { const g = new THREE.Group(); const w = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 1.6), T3(0xb5793a)); w.position.y = 0.7; g.add(w); const r = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.1, 4), T3(0xc0392b)); r.position.y = 1.95; r.rotation.y = Math.PI / 4; g.add(r); const win = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.45), new THREE.MeshBasicMaterial({ color: 0xffd76a })); win.position.set(0, 0.85, 0.81); g.add(win); g.userData.slot = 0; return g; },
    hut: () => { const g = ACTORS.terem(); g.children[1].material = T3(0x8a6a3a); g.scale.setScalar(0.8); return g; },
    iceHut: () => { const g = new THREE.Group(); const m = new THREE.MeshToonMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.8, gradientMap: c.grad }); const w = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 1.3), m); w.position.y = 0.55; g.add(w); const r = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.9, 4), m); r.position.y = 1.55; r.rotation.y = Math.PI / 4; g.add(r); return g; },
    mouse: () => { const g = new THREE.Group(); g.add(blob(0x9a9a9a, 0.45, 0.35, 0.6)); const h = blob(0xa8a8a8, 0.3, 0.3, 0.3); h.position.set(0, 0.08, 0.32); g.add(h); [-1, 1].forEach((s) => { const e = blob(0xf0a0b0, 0.16, 0.16, 0.05); e.position.set(0.12 * s, 0.25, 0.3); g.add(e); }); g.children.forEach((m) => (m.position.y += 0.18)); return g; },
    frog: () => { const g = new THREE.Group(); const b = blob(0x4caf50, 0.6, 0.4, 0.6); b.position.y = 0.2; g.add(b); [-1, 1].forEach((s) => { const e = blob(0xffffff, 0.16, 0.16, 0.16); e.position.set(0.15 * s, 0.42, 0.18); g.add(e); }); return g; },
    crane: () => { const g = new THREE.Group(); const b = blob(0xf4f4f4, 0.5, 0.45, 0.8); b.position.y = 1.2; g.add(b); const n = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.8), T3(0xf4f4f4)); n.position.set(0, 1.7, 0.3); n.rotation.x = 0.4; g.add(n); const hd = blob(0xe03030, 0.18, 0.18, 0.2); hd.position.set(0, 2.05, 0.45); g.add(hd); const bk = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.6, 5), T3(0x444444)); bk.rotation.x = Math.PI / 2; bk.position.set(0, 2.0, 0.8); g.add(bk); [-1, 1].forEach((s) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1), T3(0x333333)); l.position.set(0.12 * s, 0.5, 0); g.add(l); }); return g; },
    goldEgg: () => { const m = blob(0xffc93a, 0.3, 0.4, 0.3); m.material = c.toon(0xffc93a, { emissive: 0x553300 }, true); m.position.y = 0.6; const g = new THREE.Group(); g.add(m); return g; },
    egg: () => { const g = new THREE.Group(); const m = blob(0xfaf6ea, 0.3, 0.4, 0.3); m.position.y = 0.6; g.add(m); return g; },
    plate: () => { const g = new THREE.Group(); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.06, 16), T3(0xf0e6d0)); p.position.y = 0.1; g.add(p); const k = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.02, 16), T3(0xe8c070)); k.position.y = 0.14; g.add(k); return g; },
    jug: () => { const g = new THREE.Group(); const b = blob(0xc0703a, 0.6, 0.7, 0.6); b.position.y = 0.4; g.add(b); const n = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.7), T3(0xc0703a)); n.position.y = 1.0; g.add(n); return g; },
    horse: () => c.horse(1.35, 0x9a6a3a).root,
    tower: () => { const g = new THREE.Group(); const w = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 3.4, 8), T3(0xe8d8b0)); w.position.y = 1.7; g.add(w); const r = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.4, 8), T3(0x2e7d32)); r.position.y = 4.1; g.add(r); const win = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), new THREE.MeshBasicMaterial({ color: 0xffd76a })); win.position.set(0, 2.9, 0.86); g.add(win); return g; },
    ring: () => { const g = new THREE.Group(); const t = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 8, 20), c.toon(0xffc93a, { emissive: 0x553300 }, true)); t.position.y = 1.4; g.add(t); return g; },
    arrow: () => { const g = new THREE.Group(); const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4), T3(0x8a5a2a)); sh.rotation.z = 1.2; sh.position.y = 0.45; g.add(sh); const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.25, 6), T3(0x777777)); tip.position.set(-0.68, 0.18, 0); tip.rotation.z = 1.2 + Math.PI; g.add(tip); return g; },
    loaf: () => { const g = new THREE.Group(); const b = blob(0xe0a050, 0.9, 0.5, 0.9); b.position.y = 0.3; g.add(b); return g; },
    princess: () => { const ch = c.npc('vasilisa'); return ch.root; },
    bunny: () => c.pet('pets/bunny', 0.75).root, fox: () => c.pet('pets/fox', 0.85).root,
    wolf: () => tint(c.pet('pets/dog', 0.95).root, 0x9aa0aa), dog: () => c.pet('pets/dog', 0.85).root,
    bear: () => (c.makeBear ? c.makeBear(0.62) : tint(c.pet('pets/hog', 1.5).root, 0x8a5a33)), bull: () => c.pet('pets/cow', 1.0).root,
    girl: () => c.npc('alyonushka', { scale: 0.5 }).root, sister: () => c.npc('ivan_false', { scale: 0.5 }).root, morozko: () => c.npc('morozko', { scale: 0.6 }).root,
    sled: () => c.kit('holiday/sled', 0, 0, 1.4, 0, 0, new THREE.Group(), () => 0), chest: () => c.kit('survival/chest', 0, 0, 1.4, 0, 0, new THREE.Group(), () => 0),
    fir: () => { const g = new THREE.Group(); const t = c.kit('holiday/tree-snow-a', 0, 0, 2.2, 0, 0, g, () => 0); return g; },
    months: () => { const g = new THREE.Group(); const f = blob(0xff8a2a, 0.5, 0.7, 0.5); f.material = new THREE.MeshBasicMaterial({ color: 0xffa040 }); f.position.y = 0.35; g.add(f); const cols = [0xbfe6ff, 0xbfe6ff, 0x9ae86a, 0x9ae86a, 0x9ae86a, 0xffd23f, 0xffd23f, 0xffd23f, 0xe39b3a, 0xe39b3a, 0xe39b3a, 0xbfe6ff]; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const m = blob(cols[i], 0.28, 0.6, 0.28); m.position.set(Math.cos(a) * 1.1, 0.3, Math.sin(a) * 1.1); g.add(m); const h = blob(0xf2c49b, 0.2, 0.2, 0.2); h.position.set(Math.cos(a) * 1.1, 0.72, Math.sin(a) * 1.1); g.add(h); } g.userData.months = true; return g; },
    berries: () => { const g = new THREE.Group(); for (let i = 0; i < 9; i++) { const m = blob(0xe0302a, 0.14, 0.14, 0.14); m.position.set((Math.random() - 0.5) * 0.9, 0.12, (Math.random() - 0.5) * 0.9); g.add(m); } return g; },
    rollpin: () => { const g = new THREE.Group(); const r = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1, 10), T3(0xd8b07a)); r.rotation.z = Math.PI / 2; r.position.y = 0.12; g.add(r); return g; },
    goose: () => { const g = new THREE.Group(); const b = blob(0xf6f6f2, 0.7, 0.55, 0.95); b.position.y = 0.45; g.add(b); const n = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.5), T3(0xf6f6f2)); n.position.set(0, 0.85, 0.3); g.add(n); const hd = blob(0xf6f6f2, 0.22, 0.22, 0.26); hd.position.set(0, 1.12, 0.36); g.add(hd); const bk = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 5), T3(0xff9a2a)); bk.rotation.x = Math.PI / 2; bk.position.set(0, 1.1, 0.55); g.add(bk); return g; },
    bean: () => { const g = new THREE.Group(); const b = blob(0xa86a3a, 0.22, 0.14, 0.14); b.position.y = 0.5; g.add(b); return g; },
    grouse: () => { const g = new THREE.Group(); const b = blob(0x3a3030, 0.6, 0.5, 0.8); b.position.y = 1.3; g.add(b); const hd = blob(0x3a3030, 0.3, 0.3, 0.3); hd.position.set(0, 1.65, 0.3); g.add(hd); const br = blob(0xe03030, 0.12, 0.06, 0.1); br.position.set(0, 1.78, 0.36); g.add(br); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.1), T3(0x6b4423)); st.position.y = 0.55; g.add(st); return g; },
    heron: () => { const g = ACTORS.crane(); g.traverse((m) => { if (m.material && m.material.color && m.material.color.getHex() === 0xf4f4f4) { m.material = T3(0xa8b0b8); } }); return g; },
    hen: () => c.pet('pets/chick', 1.0).root, rooster: () => tint(c.pet('pets/chick', 1.25).root, 0xff8a6a),
  };
  const SLOT = { tower: [0.4, 0, -1.6], ring: [0, 0, 0.6], arrow: [-0.4, 0, 0.6], loaf: [0.5, 0, 0.5], terem: [0, 0, -1.2], hut: [1.4, 0, -1.2], iceHut: [-1.5, 0, -1.2], goldEgg: [0, 0, 0.3], egg: [0.5, 0, 0.3], plate: [0, 0, 0.5], jug: [0.6, 0, 0.5], months: [0, 0, -0.6], fir: [-1.4, 0, -1.4], sled: [1.2, 0, 0.4], chest: [0.4, 0, 0.7], berries: [0.6, 0, 0.6] };
  let slotI = 0;
  function show(key) {
    if (!stage) { stage = new THREE.Group(); stage.position.copy(STAGE); stage.lookAt(X.FIRE3.x, STAGE.y, X.FIRE3.z); lukGroup.add(stage); stage.userData.a = {}; slotI = 0; }
    const o = ACTORS[key](); let p = SLOT[key];
    if (!p) { const a = -1.1 + (slotI++ % 7) * 0.37, r = 1.9; p = [Math.sin(a) * r, 0, Math.cos(a) * r * 0.55 - 0.2]; }
    o.position.set(p[0], 0, p[2]);
    o.userData.base = o.position.clone(); o.userData.born = 0; o.scale.multiplyScalar(0.01); o.userData.k = o.scale.x / 0.01;
    stage.add(o); stage.userData.a[key] = o; c.burst(stage.localToWorld(o.position.clone()).add(new THREE.Vector3(0, 0.6, 0)), 0xffe08a, 14, 2, 0.8, 0.14); S.click();
  }
  function hide(key) { const o = stage?.userData.a[key]; if (o) { o.userData.leave = 1; } }
  function act(name) {
    const A = stage?.userData.a || {}; const w = (o) => o && stage.localToWorld(o.position.clone());
    if (name === 'crush' && A.terem) { A.terem.userData.squash = 1; S.stomp && S.stomp(); c.shake(0.3); c.burst(w(A.terem), 0xb5793a, 30, 4, 1, 0.2); }
    if (name === 'rebuild' && A.terem) { A.terem.userData.squash = 0; A.terem.userData.grow = 1.45; S.chime(); c.burst(w(A.terem).add(new THREE.Vector3(0, 1.5, 0)), 0xffd76a, 40, 4, 1.2, 0.2); Object.values(A).forEach((o) => (o.userData.dance = 1)); }
    if (name === 'breakEgg' && A.goldEgg) { c.burst(w(A.goldEgg).add(new THREE.Vector3(0, 0.6, 0)), 0xffc93a, 30, 3, 1, 0.16); A.goldEgg.visible = false; S.crack && S.crack(); }
    if (name === 'melt' && A.iceHut) { A.iceHut.userData.melt = 1; S.splash && S.splash(); }
    if (name === 'jump' && A.horse) { A.horse.userData.hop = 1; S.stomp && S.stomp(); }
    if (name === 'princess' && A.frog) { c.burst(w(A.frog).add(new THREE.Vector3(0, 0.6, 0)), 0x9ae86a, 40, 4, 1.2, 0.18); A.frog.visible = false; show('princess'); S.magic(); }
    if (name === 'burn') { c.burst(X.FIRE3.clone().add(new THREE.Vector3(0, 1.2, 0)), 0x4caf50, 30, 4, 1, 0.16); c.burst(X.FIRE3.clone().add(new THREE.Vector3(0, 1.4, 0)), 0xff9a2a, 30, 5, 1, 0.2); if (A.princess) A.princess.userData.leave = 1; S.dark && S.dark(); }
    if (name === 'dance') { Object.values(A).forEach((o) => (o.userData.dance = 1)); if (A.princess) { A.princess.visible = true; A.princess.userData.leave = 0; A.princess.position.copy(A.princess.userData.base); } S.chime(); }
    if (name === 'spring' && A.months) { c.burst(w(A.months).add(new THREE.Vector3(0, 0.8, 0)), 0x9ae86a, 50, 4, 1.4, 0.18); c.burst(w(A.months).add(new THREE.Vector3(0, 0.4, 0)), 0xb07aff, 30, 3, 1.2, 0.16); S.chime(); }
    if (name === 'snow') { const p = (A.months ? w(A.months) : X.FIRE3.clone()).add(new THREE.Vector3(0, 1.5, 0)); c.burst(p, 0xffffff, 120, 6, 2, 0.2); S.freeze && S.freeze(); c.shake(0.2); }
    if (name === 'foxRun' && A.fox) { A.fox.userData.leave = 1; Object.values(A).forEach((o) => (o.userData.dance = 1)); S.chime(); }
  }
  function updateStage(dt) {
    if (!stage) return;
    for (const o of Object.values(stage.userData.a)) {
      const u = o.userData; if (u.born < 1) { u.born = Math.min(1, u.born + dt * 2.5); o.scale.setScalar(u.k * (0.01 + 0.99 * u.born * (1 + Math.sin(u.born * Math.PI) * 0.25))); }
      if (u.squash) o.scale.y = Math.max(0.15 * u.k, o.scale.y - dt * 3);
      if (u.grow) o.scale.setScalar(Math.min(u.grow * u.k, o.scale.x + dt));
      if (u.melt) { o.scale.y = Math.max(0.01, o.scale.y - dt * 0.6); if (o.scale.y <= 0.01) o.visible = false; }
      if (u.leave) { o.position.x += dt * 3; o.position.z += dt * 2; u.leave += dt; if (u.leave > 2.5) o.visible = false; }
      if (u.hop) { u.hop += dt; const k = (u.hop - 1) % 1.2; o.position.y = Math.max(0, Math.sin(Math.min(1, k / 0.8) * Math.PI)) * (1 + Math.floor((u.hop - 1) / 1.2) * 0.9); if (u.hop > 4.6) { u.hop = 0; o.position.y = 0; } }
      if (u.dance) o.position.y = Math.abs(Math.sin(c.T() * 6 + o.position.x)) * 0.35;
    }
    if (!telling) { stageTimer -= dt; if (stageTimer <= 0) { lukGroup.remove(stage); stage = null; } }
  }

  // ---------- озвучка ----------
  // v1.4.3: высота и темп голосов — умеренные (сильный сдвиг pitch/rate звучит «мультяшно» и ломает синхронизацию с текстом)
  const VOICE = { 'Кот учёный': [0.85, 0.96], 'Русалка': [1.25, 0.98], 'Кикимора': [1.35, 1.04], 'Дед': [0.7, 0.92], 'Баба-Яга': [1.2, 0.94], 'Кощей': [0.55, 0.9], 'Кощей Бессмертный': [0.55, 0.9], 'Морозко': [0.6, 0.9], 'Снегурочка': [1.3, 0.98], 'Леший': [0.65, 0.95], 'Жар-птица': [1.4, 1], 'Щука': [0.9, 0.96], 'Колобок': [1.2, 1.04], 'Мышка-норушка': [1.45, 1.05], 'Алёнушка': [1.25, 0.98], 'Финист — Ясный Сокол': [0.9, 1], 'Василиса Премудрая': [1.15, 0.96], 'Иван': [1, 1] };
  const vparams = (who) => { const v = VOICE[who] || [1, 1]; return [Math.min(1.5, Math.max(0.5, v[0])), Math.min(1.1, Math.max(0.88, v[1]))]; };
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null; let ruVoice = null;
  // предпочитаем голоса устройства (localService): они начинают говорить сразу, сетевые (Google) запаздывают на 0,5–2 с
  const pickVoice = () => { if (!synth) return; const vs = synth.getVoices().filter((v) => /^ru/i.test(v.lang)); ruVoice = vs.find((v) => v.localService && /milena|yandex|natural|irina|pavel|anna|katya/i.test(v.name)) || vs.find((v) => v.localService) || vs.find((v) => /google|natural/i.test(v.name)) || vs[0] || null; };
  if (synth) { pickVoice(); synth.onvoiceschanged = pickVoice; }
  // текст для голоса + карта «буква голоса → буква на экране» (ремарки в скобках, эмодзи и «» не читаются)
  const cleanMap = (text) => { const s = String(text); const out = [], map = []; let depth = 0;
    for (let j = 0; j < s.length;) { const ch = String.fromCodePoint(s.codePointAt(j));
      if (ch === '(') { depth++; out.push(' '); map.push(j); } else if (ch === ')' && depth) depth--; else if (depth) {} else if (/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(ch)) { out.push(' '); map.push(j); } else if (ch !== '«' && ch !== '»') { out.push(ch); map.push(j); }
      j += ch.length; }
    let a = 0, b = out.length; while (a < b && /\s/.test(out[a])) a++; while (b > a && /\s/.test(out[b - 1])) b--;
    return { clean: out.slice(a, b).join(''), map: map.slice(a, b) }; };
  const clean = (text) => cleanMap(text).clean;
  let keep = null, warmed = false, cur = null;
  const warm = () => { if (warmed || !synth || !ruVoice || !OPT.voice) return; warmed = true; try { const u = new SpeechSynthesisUtterance(' '); u.voice = ruVoice; u.volume = 0; synth.speak(u); } catch {} }; // «прогрев» движка речи по первому касанию
  addEventListener('pointerdown', warm, { once: false, passive: true }); addEventListener('keydown', warm, { passive: true });
  // v1.5: записанные голоса (assets/voice) — главные; speechSynthesis — запасной вариант
  const REC = createVoice();
  addEventListener('pointerdown', () => REC.unlock(), { passive: true }); addEventListener('keydown', () => REC.unlock(), { passive: true });
  const hush = () => { cur = null; REC.stop(); clearInterval(keep); keep = null; if (synth && (synth.speaking || synth.pending)) synth.cancel(); };
  ui.cleanLen = (text) => clean(text).length || 1;
  ui.voiceRate = () => OPT.voiceRate || 1;
  ui.speechMap = (text) => cleanMap(text).map;
  ui.voiceRateFor = (who) => vparams(who)[1] * (OPT.voiceRate || 1);
  const synthSpeak = (who, text, hooks) => {
    if (!synth || !OPT.voice || !ruVoice) return false;
    const c = clean(text); if (!c) return false;
    const u = new SpeechSynthesisUtterance(c); u.voice = ruVoice; u.lang = ruVoice.lang; const [pi, ra] = vparams(who); u.pitch = pi; u.rate = ra * (OPT.voiceRate || 1); u.volume = Math.min(1, (OPT.master ?? 0.7) * 1.3);
    cur = u; const mine = (f) => (e) => { if (cur === u) f(e); };
    u.onstart = mine(() => hooks?.start()); u.onboundary = mine((e) => { if (e.name && e.name !== 'word') return; hooks?.word(e.charIndex + (e.charLength || 0), e.charIndex); }); u.onend = u.onerror = mine(() => { hooks?.end(); clearInterval(keep); keep = null; });
    synth.speak(u); if (synth.paused) synth.resume();
    if (!ruVoice.localService) keep = setInterval(() => { if (synth.speaking && !synth.paused) { synth.pause(); synth.resume(); } }, 9000); // Chrome обрывает длинные фразы сетевых голосов
    return true;
  };
  ui.onSpeak = (who, text, hooks, raw) => {
    hush(); if (!OPT.voice) return false;
    let list = null; try { list = REC.find(who, raw ?? text, c.st?.name || '', document.body.classList.contains('touch')); } catch {}
    if (list) {
      const mine = {}; cur = mine;
      REC.play(list, { rate: OPT.voiceRate || 1, volume: Math.min(1, (OPT.master ?? 0.7) * 1.3), chars: clean(text).length }, hooks, () => { if (cur === mine) synthSpeak(who, text, hooks); });
      return true;
    }
    return synthSpeak(who, text, hooks);
  };
  ui.onHush = () => hush();
  ui.voiceFind = (who, raw) => REC.find(who, raw, c.st?.name || '', document.body.classList.contains('touch')); // для тестов: есть ли запись
  ui.voiceOff = () => hush();
  const hasVoice = () => !!ruVoice || REC.has();

  // ---------- обереги и доверие ----------
  function applyCharms() { const s = c.st; ensure(s); player.sightCost = s.charms.includes('kiki') ? 0.5 : 1; player.dmgK = s.charms.includes('cat') ? 1.33 : 1; }
  const hpBonus = () => (ensure(c.st).charms.includes('mermaid') ? 1 : 0);
  const known = () => { const s = ensure(c.st); return [...s.book.map((b) => b.title), ...s.nightTales].filter((t) => RETELL[t]); };
  const canTell = (key) => { const s = ensure(c.st); return s.restored && (s.trust[key] || 0) < 3 && known().some((t) => !(s.told[key] || []).includes(t)); };
  async function retell(key) {
    const s = ensure(c.st); const N = NPC[key]; const told = (s.told[key] ||= []);
    const opts = known().filter((t) => !told.includes(t)).slice(-5);
    const k = await ui.dialog(N.name, 'Какую сказку расскажешь?', [...opts.map((t) => `«${t}»`), 'Потом']);
    if (k < 0 || k >= opts.length) return;
    const title = opts[k]; const [q, right, ...wrong] = RETELL[title]; const answers = shuffle([right, ...wrong]);
    const a = await ui.dialog(N.name, `«${title}», говоришь? А ну-ка: ${q}`, answers);
    if (answers[a] !== right) { S.wrong(); await ui.say(N.name, [N.bad]); return; }
    told.push(title); s.trust[key] = (s.trust[key] || 0) + 1; S.chime(); c.save();
    await ui.say(N.name, [N.ok[(s.trust[key] - 1) % N.ok.length]]);
    ui.toast(`Доверие: ${N.name} ${'💛'.repeat(Math.min(3, s.trust[key]))}`, false, 2600);
    if (s.trust[key] >= 2 && !s.charms.includes(key)) {
      s.charms.push(key); c.save(); applyCharms();
      if (key === 'mermaid') { player.maxHp += 1; player.hp = player.maxHp; }
      await ui.say(N.name, [GIFT[key]]); S.magic(); c.burst(player.pos.clone().add(new THREE.Vector3(0, 1.5, 0)), 0xffe08a, 40, 4, 1.2, 0.18);
      ui.toast(`${CHARMS[key].icon} Оберег «${CHARMS[key].name}»: ${CHARMS[key].text}`, true, 4500);
    }
  }
  function wrap(it, key) { const orig = it.act; it.act = async () => { if (!canTell(key)) return orig(); const c2 = await ui.dialog(NPC[key].name, NPC[key].hi, ['Поговорить', 'Пересказать сказку', 'Уйти']); if (c2 === 0) return orig(); if (c2 === 1) return retell(key); }; }
  for (const it of c.interactables) { if (it.label === 'Поговорить с Котом учёным') wrap(it, 'cat'); if (it.label === 'Поговорить с Дедом') wrap(it, 'ded'); }
  c.interactables.push(
    { label: 'Пересказать сказку русалке', pos: () => X.MERMAID_GROUND, r: 3.5, cond: () => c.st.links?.mermaid && canTell('mermaid'), act: () => retell('mermaid') },
    { label: 'Пересказать сказку Кикиморе', pos: () => X.KIKI_POS, r: 3.5, cond: () => c.st.links?.kiki && canTell('kiki'), act: () => retell('kiki') },
    { label: 'Поговорить с Жар-птицей', pos: () => PERCH, r: 4.5, prio: 3, cond: () => perched, act: () => firebirdTalk() },
  );
  async function firebirdTalk() {
    const s = ensure(c.st);
    await ui.say('Жар-птица', s.fbMet ? ['Ночь тиха, Сказитель. Я стерегу сказки, пока все спят. Отдохни у костра — Кот расскажет новую.'] : ['Курлы-ы… Это ты вернул мне перья? Спасибо, Сказитель.', 'Днём я прячусь в солнце, а ночью облетаю Лукоморье, чтобы сказки не забылись во сне.', 'Возьми немного моего света.']);
    if (!s.fbMet) { s.fbMet = true; c.save(); }
    player.word = 100; player.hp = player.maxHp; S.magic(); c.burst(PERCH.clone(), 0xffa030, 50, 5, 1.5, 0.2);
  }

  // ---------- костёр: ночь, сон, сказка ----------
  async function sleepTo(t, msg) { c.fade(1); await c.wait(900); tod = t; c.st.tod = tod; player.hp = player.maxHp; player.word = 100; S.sleep(); await c.wait(700); c.fade(0); if (msg) ui.toast(msg, false, 3000); }
  async function fireMenu() {
    const s = ensure(c.st); if (!s.restored) return;
    const isNight = night > 0.5; const want = s.extra?.sivkaAsk && !s.nightTales.includes('Сивка-Бурка') && NIGHT_TALES.find((t) => t.title === 'Сивка-Бурка'); // царевна попросила — Кот расскажет её первой
    const next = want || NIGHT_TALES.find((t) => !s.nightTales.includes(t.title));
    if (!isNight) {
      const k = await ui.dialog('Костёр', 'Над Лукоморьем светло. Кот обещал вечером рассказать сказку на ночь.', ['Подождать у костра до ночи 🌙', 'Пойти дальше']);
      if (k === 0) await sleepTo(0.86, 'Стемнело. Над дубом зажглись звёзды…');
      return;
    }
    const opts = [next ? `Слушать сказку на ночь: «${next.title}» 🌙` : 'Послушать сказку ещё раз', 'Лечь спать до утра ☀', 'Посидеть ещё'];
    const k = await ui.dialog('Костёр', 'Трещат угольки, пахнет дымком. Кот учёный уже устроился у огня.', opts);
    if (k === 0) await bedtime(next);
    else if (k === 1) await sleepTo(0.24, 'Доброе утро, Сказитель! Здоровье и Слово восполнены.');
  }
  async function bedtime(tale) {
    const s = ensure(c.st);
    if (!tale) { const done = NIGHT_TALES.filter((t) => s.nightTales.includes(t.title)); const k = await ui.dialog(CAT, 'Какую рассказать снова?', [...done.map((t) => t.title), 'Никакую — спать']); if (k < 0 || k >= done.length) { await sleepTo(0.24); return; } tale = done[k]; }
    telling = true; if (stage) { lukGroup.remove(stage); stage = null; }
    c.setCam({ pos: camFor(), look: STAGE.clone().add(new THREE.Vector3(0, 0.8, 0)) });
    try {
      await ui.say(CAT, [`Мур-р… Слушай сказку на ночь — «${tale.title}». А ты подсказывай, что было дальше.`]);
      for (const st of tale.steps) {
        if (st.say) { (st.show || []).forEach(show); if (st.act) act(st.act); await ui.say(CAT, [st.say]); }
        if (st.ask) {
          const ans = shuffle([st.right, ...st.wrong]); let tries = 0;
          for (;;) { const k = await ui.dialog(CAT, st.ask, ans); if (ans[k] === st.right || tries >= 3) break; if (k < 0) continue; S.wrong(); tries++; await ui.say(CAT, [tries > 1 ? `Мур, подскажу: «${st.right}».` : 'Мур-мур, нет-нет. Вспомни-ка получше.']); }
          (st.show || []).forEach(show); if (st.act) act(st.act); S.click(); if (st.after) await ui.say(CAT, [st.after]); (st.hide || []).forEach(hide);
        }
      }
      await ui.say(CAT, [tale.moral]);
      if (!s.nightTales.includes(tale.title)) { s.nightTales.push(tale.title); c.save(); S.chime(); ui.toast(`🌙 Сказка на ночь «${tale.title}» — в Книге Сказов (${s.nightTales.length}/${NIGHT_TOTAL})`, true, 4500); if (s.nightTales.length === NIGHT_TOTAL) setTimeout(() => ui.toast('Все сказки на ночь собраны! Их можно пересказать друзьям в Лукоморье.', false, 4500), 4800); }
      else ui.toast('Хорошая сказка второй раз ещё лучше.', false, 2500);
    } finally { telling = false; stageTimer = 25; c.setCam(null); }
    const k = await ui.dialog(CAT, 'А теперь — спать. Утро вечера мудренее.', ['Спокойной ночи, Кот! ☀', 'Ещё посижу']);
    if (k === 0) await sleepTo(0.24, 'Доброе утро! Сказка приснилась ещё раз.');
  }
  function camFor() { const d = new THREE.Vector3(X.FIRE3.x - STAGE.x, 0, X.FIRE3.z - STAGE.z).normalize(); return STAGE.clone().addScaledVector(d, 5.5).add(new THREE.Vector3(0, 2.6, 0)); }

  // ---------- кадр ----------
  function tintSky(top, bot, inLuk) { if (!inLuk || night + Math.max(0, 1 - Math.abs(elev + 0.15) / 0.35) < 0.001) return; const dusk = Math.max(0, 1 - Math.abs(elev + 0.15) / 0.35) * (1 - night * 0.6); top.lerp(NT, night * 0.92); bot.lerp(NB, night * 0.88); bot.lerp(DUSK, dusk * 0.4); }
  function update(dt, inLuk) {
    const s = c.st; if (s !== lastSt) { lastSt = s; ensure(s); tod = s.tod ?? 0.35; applyCharms(); }
    // оберег деда: здоровье прибывает само
    if (s.charms?.includes('ded') && player.hp < player.maxHp) { regenAcc += dt; if (regenAcc > 14) { regenAcc = 0; player.hp += 1; } } else regenAcc = 0;
    const live = inLuk && s.restored;
    if (live && OPT.daynight !== false && !telling) { tod = (tod + dt / CYCLE) % 1; s.tod = tod; }
    elev = live ? -Math.cos(tod * Math.PI * 2) + 0.35 : 1;
    const nT = live ? 1 - sm(-0.45, 0.05, elev) : 0; night += (nT - night) * Math.min(1, dt * 3);
    if (telling) night = Math.max(night, 0.85);
    const camp = c.camera.position;
    stars.visible = moon.visible = inLuk && night > 0.02; starMat.opacity = night; stars.position.copy(camp);
    if (moon.visible) { moon.material.opacity = night; moon.position.copy(camp).add(new THREE.Vector3(-0.45, 0.55, -0.7).normalize().multiplyScalar(340)); moon.lookAt(camp); }
    if (inLuk && s.restored) {
      X.sun.intensity = 2.3 * (1 - 0.88 * night); X.sun.color.copy(X.SUN_LIVE).lerp(MOONC, night * 0.8); X.hemi.intensity = 1.2 * (1 - 0.68 * night); X.hemi.color.copy(WHITE).lerp(NIGHTH, night); hemiTinted = true;
      // музыка: колыбельная ночью
      if (!s.festival) { if (night > 0.6 && S.theme === 'luk') S.setTheme('night'); else if (night < 0.4 && S.theme === 'night') S.setTheme('luk'); }
      sndAcc += dt; if (night > 0.5 && sndAcc > 1) { sndAcc = 0; if (Math.random() < 0.45) S.cricket(); if (Math.random() < 0.04) S.owl(); }
    } else { if (S.theme === 'night') S.setTheme('luk'); if (hemiTinted) { X.hemi.color.copy(WHITE); hemiTinted = false; } }
    // светлячки
    fireflies.visible = inLuk && night > 0.05; if (fireflies.visible) { ffMat.opacity = night; const t = c.T(); for (let i = 0; i < FF; i++) { const [x, z, ph, hh] = ffBase[i]; ffPos[i * 3] = x + Math.sin(t * 0.4 + ph) * 1.2; ffPos[i * 3 + 2] = z + Math.cos(t * 0.33 + ph * 1.3) * 1.2; ffPos[i * 3 + 1] = H(x, z) + hh + Math.sin(t * 1.3 + ph) * 0.4; } ffGeo.attributes.position.needsUpdate = true; ffMat.size = 0.35 + Math.sin(c.T() * 3) * 0.08; }
    // Жар-птица ночью облетает дуб; если все перья собраны — садится поговорить
    fb.visible = inLuk && night > 0.25; perched = false;
    if (fb.visible) {
      const t = c.T(); const want = s.feathers?.every(Boolean) && night > 0.5 && player.pos.distanceTo(PERCH) < 16 && !telling;
      const a = t * 0.32; const orbit = new THREE.Vector3(Math.cos(a) * 12, H(0, 0) + 13 + Math.sin(t * 0.7) * 1.5, Math.sin(a) * 12);
      const tgt = want ? PERCH : orbit; const prev = fb.position.clone(); fb.position.lerp(tgt, Math.min(1, dt * (want ? 1.5 : 2.5)));
      const v = fb.position.clone().sub(prev); if (v.lengthSq() > 1e-6 && !want) fb.rotation.y = Math.atan2(v.x, v.z); else if (want) fb.rotation.y = Math.atan2(player.pos.x - fb.position.x, player.pos.z - fb.position.z);
      perched = want && fb.position.distanceTo(PERCH) < 0.6;
      const fl = Math.sin(t * (perched ? 2 : 7)) * (perched ? 0.25 : 0.7); fb.userData.wings[0].rotation.z = fl; fb.userData.wings[1].rotation.z = -fl;
      fb.userData.glow.material.opacity = 0.75 * night; if (Math.random() < dt * 12) c.burst(fb.position.clone(), Math.random() < 0.5 ? 0xffc040 : 0xff6a20, 1, 0.6, 0.9, 0.12);
    }
    updateStage(dt);
  }
  // раздел Книги Сказов
  function bookHtml() {
    const s = ensure(c.st); const nt = NIGHT_TALES.map((t) => s.nightTales.includes(t.title) ? `<div class="entry"><b>🌙 ${t.title}</b> — ${t.moral.replace(/^Мур[.…]*\s*/, '')}</div>` : '<div class="entry muted">🌙 ??? — ещё не рассказана</div>').join('');
    const tr = Object.keys(NPC).map((k) => `<div class="entry">${NPC[k].name}: ${'💛'.repeat(Math.min(3, s.trust[k] || 0))}${'🤍'.repeat(Math.max(0, 3 - (s.trust[k] || 0)))}${s.charms.includes(k) ? ` · ${CHARMS[k].icon} <b>${CHARMS[k].name}</b> — ${CHARMS[k].text}` : ''}</div>`).join('');
    return `<h3>Сказки на ночь (${s.nightTales.length}/${NIGHT_TOTAL})</h3>${nt}<p class="muted small">Ночью у костра Кот рассказывает новую сказку. Чтобы дождаться ночи, посиди у костра.</p><h3>Доверие и обереги</h3>${tr}<p class="muted small">Перескажи сказ из Книги Коту, Русалке, Кикиморе или Деду. Две верно пересказанные сказки — и друг смастерит оберег.</p>`;
  }
  return { canTell, retell, update, tintSky, night: () => night, fireMenu, applyCharms, hpBonus, bookHtml, hasVoice, setTod: (t) => (tod = t), tod: () => tod, bedtime, NIGHT_TALES, fb: () => fb };
}
