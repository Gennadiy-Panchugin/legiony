// Builds layouts2.html: the page shell + helper drawing code from layouts.html + the new mock-up code.
const fs = require('fs'), path = require('path');
const old = fs.readFileSync(path.join(__dirname, 'layouts.html'), 'utf8');
const a = old.indexOf('const DPR = 2'), b = old.indexOf('function hud(g, sub, chip, bar)');
const helpers = old.slice(a, b);
const ui = fs.readFileSync(path.join(__dirname, 'ui_new.js'), 'utf8');
const card = (id, tag, title, text, plus, minus) => `    <article class="card"><div class="phone"><canvas id="${id}" width="640" height="1120" aria-label="Макет: ${title}"></canvas></div>
      <span class="tag">${tag}</span><h2>${title}</h2><p>${text}</p>
      <ul><li class="plus"><b>Плюс:</b> ${plus}</li><li class="minus"><b>Минус:</b> ${minus}</li></ul></article>`;
const html = `<title>Интерфейс боя</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+SC:wght@600;700&family=Alegreya+Sans:wght@400;500;700&display=swap">
<style>
  /* the same studio wall as the screen-layout board: dark command tent, parchment-gold accents */
  :root { --bg: #17130e; --panel: #1e1913; --ink: #efe6d2; --muted: #b8aa8c; --gold: #d9a441; --line: #3a3024;
          --display: 'Cormorant SC', Georgia, serif; --body: 'Alegreya Sans', system-ui, sans-serif; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--body); line-height: 1.45; }
  .wrap { max-width: 1240px; margin: 0 auto; padding: 28px 16px 56px; }
  header { max-width: 760px; margin-bottom: 26px; }
  h1 { font-family: var(--display); font-size: 40px; line-height: 1.05; margin: 0 0 8px; letter-spacing: .02em; text-wrap: balance; }
  header p { margin: 0; color: var(--muted); font-size: 16px; }
  section { margin-top: 38px; }
  section > h2 { font-family: var(--display); font-size: 30px; margin: 0 0 4px; letter-spacing: .02em; }
  section > .lead { margin: 0 0 18px; color: var(--muted); max-width: 760px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 22px; }
  .card { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
  .phone { width: 100%; max-width: 320px; border-radius: 22px; overflow: hidden; background: #3f2717; box-shadow: 0 0 0 1px var(--line), 0 14px 36px rgba(0,0,0,.55); line-height: 0; }
  .sheetbox { max-width: 960px; border-radius: 14px; overflow: hidden; box-shadow: 0 0 0 1px var(--line); line-height: 0; }
  canvas { display: block; width: 100%; height: auto; }
  .card h2 { margin: 2px 0 0; font-family: var(--display); font-size: 25px; letter-spacing: .03em; }
  .tag { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--gold); }
  .card p { margin: 0; font-size: 14.5px; }
  .card ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 5px; font-size: 14px; color: var(--muted); }
  .card li b { font-weight: 700; } .card li.plus b { color: #8fd18f; } .card li.minus b { color: #f0a090; }
  .notes { max-width: 820px; margin: 16px 0 0; padding: 0; list-style: none; display: grid; gap: 7px; color: var(--muted); font-size: 15px; }
  .notes b { color: var(--ink); }
  .reco { margin-top: 38px; padding: 18px 20px; border: 1px solid var(--gold); border-radius: 14px; background: var(--panel); max-width: 820px; }
  .reco h3 { margin: 0 0 6px; font-family: var(--display); font-size: 26px; }
  .reco p { margin: 0 0 6px; color: var(--muted); } .reco p:last-child { margin: 0; } .reco b { color: var(--ink); }
</style>
<div class="wrap">
  <header>
    <h1>Интерфейс боя</h1>
    <p>Знамёна отрядов, пять вариантов панели управления и три уровня зума. Все макеты на карте «Секции города», красные, зелёные, фиолетовые и жёлтые знамёна ваши, синие вражеские.</p>
  </header>

  <section>
    <h2>Знамёна отрядов</h2>
    <p class="lead">У каждого отряда своё знамя: своя форма полотнища, свой цвет и своя эмблема. Отряд виден издалека, и его не спутаешь по одному цвету, даже в чёрно-белом. Те же знамёна стоят на карточках, жетонах и в меню.</p>
    <div class="sheetbox"><canvas id="sheet" width="1920" height="660" aria-label="Знамёна четырёх отрядов"></canvas></div>
    <ul class="notes">
      <li><b>Форма читается без цвета:</b> перекладина с полотнищем, вымпел, ласточкин хвост, квадрат. Это важно для людей, которые плохо различают цвета.</li>
      <li><b>Враг всегда синий,</b> а форма знамени повторяет его класс, так видно, кто перед вами.</li>
      <li><b>Выбранный отряд</b> подсвечивается золотым кольцом, раненый отряд опускает знамя ниже.</li>
    </ul>
  </section>

  <section>
    <h2>Панели управления</h2>
    <p class="lead">Где живут карточки отрядов и кнопка навыка. Выбранный отряд на всех макетах Велиты, время при этом замедляется.</p>
    <div class="grid">
${card('u1', 'Панель 1', 'Карточки снизу', 'Как сейчас в прототипе: четыре карточки со знамёнами и здоровьем, справа большая кнопка навыка. Нижние 70 px заняты панелью.', 'привычно и надёжно, все четыре отряда всегда видны.', 'забирает место, поле короче на 70 px.')}
${card('u2', 'Панель 2', 'Знамёна слева', 'Четыре круглые кнопки со знамёнами и кольцом здоровья в колонке слева, большая круглая кнопка навыка в правом нижнем углу. Поле идёт до самого низа.', 'под большим пальцем, много места на поле.', 'левая колонка может закрывать край карты.')}
${card('u3', 'Панель 3', 'Меню у отряда', 'Нет нижней панели. Касаетесь отряда, и вокруг него кольцо: «Залп», «Стоять», «Назад». Жетоны отрядов в верхней строке.', 'всё внимание на поле, меню там, где смотрите.', 'у края экрана меню приходится сдвигать, пальцем можно закрыть отряд.')}
${card('u4', 'Панель 4', 'Знамёна на верёвке', 'Четыре знамени вывешены на верёвке сверху, как в военном лагере. Касание знамени выбирает отряд, раненый опускает знамя, навык по двойному касанию.', 'красиво, тема Рима, ничего лишнего.', 'знамёна мелкие, в бою можно промахнуться.')}
${card('u5', 'Панель 5', 'Мини-карта и зум', 'Компактная панель: мини-карта с рамкой экрана, четыре узких карточки и круглая кнопка навыка. Справа на поле кнопки зума.', 'хорошо для больших карт, видно, где враг вне экрана.', 'самая плотная, мелкие элементы.')}
    </div>
  </section>

  <section>
    <h2>Зум</h2>
    <p class="lead">Карта целиком помещается на экран, зум нужен для деталей: рассмотреть отряды и выбрать точное место. Три уровня на одной сцене.</p>
    <div class="grid">
${card('z1', 'Зум 1,0×', 'Общий вид', 'Весь город. Знамёна крупнее, чем сами воины: так отряды читаются сразу.', 'виден весь бой и все районы.', 'воины мелкие, деталей почти нет.')}
${card('z2', 'Зум 1,6×', 'Крупнее', 'Камера на нижних районах. Различимы щиты и оружие, виден рельеф. Отряды ещё помещаются целиком.', 'удобно командовать у реки.', 'верхний край города уходит за экран.')}
${card('z3', 'Зум 2,4×', 'Вплотную', 'Один отряд и его цель. Видны кровь, павшие, анимации. Маршрут рисуется поверх.', 'красота, лучше видно, кто кого бьёт.', 'тесно, лишь для разглядывания.')}
    </div>
    <ul class="notes">
      <li><b>Жесты:</b> щипок двумя пальцами, двойное касание по отряду приближает на него, двойное касание по пустому месту возвращает общий вид.</li>
      <li><b>Автозум:</b> при выборе отряда камера мягко приближается на 1,3×, а при отдаче приказа отъезжает назад. Можно отключить в настройках.</li>
      <li><b>Следить за отрядом:</b> кнопка рядом со шкалой зума, камера идёт за выбранным отрядом.</li>
      <li><b>Интерфейс не масштабируется:</b> знамёна, карточки и кнопки всегда одного размера, меняется только карта.</li>
    </ul>
  </section>

  <section class="reco">
    <h3>Что бы я взял</h3>
    <p><b>Панель 2 (знамёна слева) и зум 1,0×–1,6×.</b> Колонка слева даёт больше всего места на поле и удобна большому пальцу. Знамёна на кнопках те же, что на поле, поэтому не надо искать соответствие.</p>
    <p>Панель 3 (меню у отряда) хороша для тех, кому важно, чтобы глаза не бегали по экрану. Её можно сделать вариантом в настройках.</p>
  </section>
</div>
<script>
${helpers}
${ui}
</script>
`;
fs.writeFileSync(path.join(__dirname, 'layouts2.html'), html);
console.log('ok', html.length);
