# План реализации: каркас сайта-штаба + интерактивный планировщик квартиры

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Рабочий планировщик квартиры (масштабный план по техплану, drag&drop мебели, слой розеток, экспорт layout.json) + главная страница, опубликованные на GitHub Pages.

**Architecture:** Статический сайт без сборки: HTML + ES-модули + SVG. Чистая логика (геометрия, модель раскладки, каталог) — в отдельных модулях `js/*.js`, тестируемых через `node --test`; DOM/SVG-обвязка — в `js/planner.js`, проверяется вручную в браузере. Данные — `data/apartment.json` (геометрия квартиры, мм) и `layout.json` (раскладка, экспорт/импорт + localStorage).

**Tech Stack:** Vanilla JS (ES modules), SVG, node:test для юнит-тестов, GitHub Pages (ветка main, корень). Никаких npm-зависимостей и сборки.

**Спека:** `docs/superpowers/specs/2026-07-13-remont-design.md` (раздел 8). План 2 (works/estimate/notes) — отдельным документом после обкатки планировщика.

---

### Task 1: Каркас проекта

**Files:**
- Create: `package.json`
- Create: `assets/style.css`
- Create: `index.html`

- [ ] **Step 1: package.json (только ради ESM в node:test)**

```json
{
  "name": "remont-hq",
  "private": true,
  "type": "module",
  "scripts": { "test": "node --test tests/" }
}
```

- [ ] **Step 2: assets/style.css**

```css
:root {
  --bg: #faf9f7; --card: #ffffff; --text: #2c2c2a; --muted: #6f6e69;
  --border: #e3e0d8; --accent: #1d9e75; --accent2: #d85a30;
  --radius: 10px; font-size: 16px;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  background: var(--bg); color: var(--text); }
a { color: var(--accent); text-decoration: none; }
header { display: flex; flex-wrap: wrap; align-items: center; gap: 12px;
  padding: 10px 16px; border-bottom: 1px solid var(--border); background: var(--card); }
header h1 { font-size: 18px; margin: 0; font-weight: 600; }
button, .btn { font: inherit; padding: 6px 12px; border: 1px solid var(--border);
  border-radius: var(--radius); background: var(--card); cursor: pointer; }
button.active { background: var(--accent); color: #fff; border-color: var(--accent); }
button:disabled { opacity: .4; cursor: default; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px; padding: 24px; max-width: 1100px; margin: 0 auto; }
.card { background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 18px; }
.card h2 { margin: 0 0 6px; font-size: 17px; }
.card p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.5; }
.planner-layout { display: flex; height: calc(100vh - 58px); }
#palette { width: 220px; overflow-y: auto; border-right: 1px solid var(--border);
  background: var(--card); padding: 10px; }
#palette h3 { font-size: 12px; text-transform: uppercase; color: var(--muted); margin: 12px 0 6px; }
#palette button { display: block; width: 100%; text-align: left; margin-bottom: 4px; font-size: 13px; }
#plan { flex: 1; touch-action: none; background: var(--bg); }
.toolbar { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: 13px; }
@media (max-width: 720px) {
  .planner-layout { flex-direction: column; height: auto; }
  #palette { width: 100%; display: flex; overflow-x: auto; border-right: none;
    border-bottom: 1px solid var(--border); }
  #palette section { min-width: 180px; padding-right: 10px; }
  #plan { height: 70vh; }
}
```

- [ ] **Step 3: index.html**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Штаб ремонта — Воткинское 53к1, кв. 104</title>
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <header><h1>🏠 Штаб ремонта · Воткинское шоссе 53к1, кв. 104</h1></header>
  <main class="cards">
    <a class="card" href="planner.html">
      <h2>📐 Планировщик</h2>
      <p>План квартиры в масштабе, расстановка мебели, розетки, экспорт раскладки.</p>
    </a>
    <div class="card">
      <h2>🧾 Смета</h2>
      <p>В разработке (план 2): категории, план/факт, техника, приоритеты.</p>
    </div>
    <div class="card">
      <h2>📋 План работ</h2>
      <p>В разработке (план 2): этапы, зависимости, калькулятор «сам vs наём».</p>
    </div>
    <div class="card">
      <h2>📝 Заметки</h2>
      <p>В разработке (план 2): журнал решений, чеклисты, контакты.</p>
    </div>
  </main>
</body>
</html>
```

- [ ] **Step 4: Проверка** — открыть `index.html` в браузере: сетка из 4 карточек, ссылка планировщика ведёт на пока несуществующую страницу (ок).

- [ ] **Step 5: Commit**

```bash
git add package.json assets/style.css index.html
git commit -m "Каркас сайта-штаба: стили, главная страница"
```

---

### Task 2: Геометрия квартиры — data/apartment.json

Координаты в мм, восстановлены из выписки техплана (габариты точные, взаимное расположение приблизительное — сверка в Task 7).

**Files:**
- Create: `data/apartment.json`

- [ ] **Step 1: Записать файл**

```json
{
  "meta": {
    "units": "mm",
    "source": "Выписка из технического плана, кв. 104",
    "note": "Габариты комнат точные; взаимное расположение и проёмы приблизительные — уточнить обмерами"
  },
  "rooms": [
    { "id": "detskaya",   "name": "Детская",        "area": 12.8, "x": 0,    "y": 0,     "w": 4010, "h": 3180 },
    { "id": "spalnya",    "name": "Спальня",        "area": 14.4, "x": 4090, "y": 40,    "w": 4590, "h": 3140 },
    { "id": "kuhnya",     "name": "Кухня-гостиная", "area": 20.9, "x": 8760, "y": 0,     "w": 3620, "h": 6030 },
    { "id": "koridor",    "name": "Коридор",        "area": 5.2,  "x": 1500, "y": 3260,  "w": 4690, "h": 1110 },
    { "id": "vannaya",    "name": "Ванная",         "area": 4.1,  "x": 1500, "y": 4450,  "w": 2320, "h": 1760 },
    { "id": "tualet",     "name": "Туалет",         "area": 2.5,  "x": 3900, "y": 4450,  "w": 1360, "h": 1840 },
    { "id": "prihozhaya", "name": "Прихожая",       "area": 4.2,  "x": 5340, "y": 4450,  "w": 2230, "h": 1920 },
    { "id": "lodzhiya",   "name": "Лоджия",         "area": 3.2,  "x": 9060, "y": -1150, "w": 3000, "h": 1070, "cold": true }
  ],
  "doors": [
    { "room": "prihozhaya", "side": "bottom", "offset": 800, "width": 900, "entry": true },
    { "room": "detskaya",   "side": "bottom", "offset": 3100, "width": 800 },
    { "room": "spalnya",    "side": "bottom", "offset": 400,  "width": 800 },
    { "room": "vannaya",    "side": "top",    "offset": 1100, "width": 700 },
    { "room": "tualet",     "side": "top",    "offset": 300,  "width": 600 },
    { "room": "kuhnya",     "side": "top",    "offset": 500,  "width": 800, "toBalcony": true }
  ],
  "windows": [
    { "room": "detskaya", "side": "left",  "offset": 900,  "width": 1400 },
    { "room": "detskaya", "side": "top",   "offset": 1300, "width": 1400 },
    { "room": "spalnya",  "side": "top",   "offset": 1600, "width": 1400 },
    { "room": "kuhnya",   "side": "right", "offset": 2600, "width": 1600 }
  ]
}
```

- [ ] **Step 2: Валидация JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('data/apartment.json','utf8')); console.log('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add data/apartment.json
git commit -m "Геометрия квартиры из техплана (черновые координаты)"
```

---

### Task 3: js/geometry.js (TDD)

**Files:**
- Create: `tests/geometry.test.mjs`
- Create: `js/geometry.js`

- [ ] **Step 1: Написать падающий тест**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { snap, clamp, footprint, rectsOverlap, pointInRect } from '../js/geometry.js';

test('snap округляет к сетке 50 мм', () => {
  assert.equal(snap(1024), 1000);
  assert.equal(snap(1026), 1050);
  assert.equal(snap(0), 0);
});

test('clamp ограничивает диапазон', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-5, 0, 10), 0);
  assert.equal(clamp(15, 0, 10), 10);
});

test('footprint учитывает поворот на 90°', () => {
  const cat = { w: 1600, d: 700 };
  assert.deepEqual(footprint({ x: 100, y: 200, rot: 0 }, cat),
    { x: 100, y: 200, w: 1600, h: 700 });
  assert.deepEqual(footprint({ x: 100, y: 200, rot: 90 }, cat),
    { x: 100, y: 200, w: 700, h: 1600 });
  assert.deepEqual(footprint({ x: 0, y: 0, rot: 180 }, cat),
    { x: 0, y: 0, w: 1600, h: 700 });
});

test('rectsOverlap: пересечение и касание', () => {
  const a = { x: 0, y: 0, w: 100, h: 100 };
  assert.equal(rectsOverlap(a, { x: 50, y: 50, w: 100, h: 100 }), true);
  assert.equal(rectsOverlap(a, { x: 100, y: 0, w: 100, h: 100 }), false);
});

test('pointInRect', () => {
  const r = { x: 10, y: 10, w: 20, h: 20 };
  assert.equal(pointInRect(15, 15, r), true);
  assert.equal(pointInRect(5, 15, r), false);
});
```

- [ ] **Step 2: Убедиться, что тест падает**

Run: `node --test tests/`
Expected: FAIL — `Cannot find module ... js/geometry.js`

- [ ] **Step 3: Реализация**

```js
export const snap = (v, grid = 50) => Math.round(v / grid) * grid;

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export function footprint(item, cat) {
  const rotated = item.rot % 180 !== 0;
  return { x: item.x, y: item.y, w: rotated ? cat.d : cat.w, h: rotated ? cat.w : cat.d };
}

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}
```

- [ ] **Step 4: Тесты зелёные**

Run: `node --test tests/`
Expected: PASS, 5 tests

- [ ] **Step 5: Commit**

```bash
git add js/geometry.js tests/geometry.test.mjs
git commit -m "Геометрические хелперы планировщика (TDD)"
```

---

### Task 4: js/catalog.js — каталог мебели

**Files:**
- Create: `tests/catalog.test.mjs`
- Create: `js/catalog.js`

- [ ] **Step 1: Падающий тест**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG, getItem } from '../js/catalog.js';

test('каталог: id уникальны, размеры положительные', () => {
  const ids = CATALOG.map(c => c.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const c of CATALOG) {
    assert.ok(c.w > 0 && c.d > 0, c.id);
    assert.ok(c.name && c.cat, c.id);
  }
});

test('getItem находит по id и кидает на неизвестном', () => {
  assert.equal(getItem('bed-160').w, 1600);
  assert.throws(() => getItem('nope'));
});
```

- [ ] **Step 2: Убедиться, что падает**

Run: `node --test tests/`
Expected: FAIL — `Cannot find module ... js/catalog.js`

- [ ] **Step 3: Реализация (размеры в мм: w — ширина, d — глубина)**

```js
export const CATALOG = [
  { id: 'bed-160',      name: 'Кровать 160×200',        w: 1600, d: 2000, cat: 'Спальня',  color: '#9fc7e8' },
  { id: 'crib',         name: 'Кроватка детская 60×120', w: 600,  d: 1200, cat: 'Детская',  color: '#9fc7e8' },
  { id: 'bed-90',       name: 'Кровать детская 90×200', w: 900,  d: 2000, cat: 'Детская',  color: '#9fc7e8' },
  { id: 'wardrobe-200', name: 'Шкаф 200×60',            w: 2000, d: 600,  cat: 'Хранение', color: '#d9c8a9' },
  { id: 'wardrobe-160', name: 'Шкаф 160×60',            w: 1600, d: 600,  cat: 'Хранение', color: '#d9c8a9' },
  { id: 'wardrobe-120', name: 'Шкаф 120×60',            w: 1200, d: 600,  cat: 'Хранение', color: '#d9c8a9' },
  { id: 'dresser',      name: 'Комод 100×50',           w: 1000, d: 500,  cat: 'Хранение', color: '#d9c8a9' },
  { id: 'desk',         name: 'Стол рабочий 140×70',    w: 1400, d: 700,  cat: 'Спальня',  color: '#c4b5d9' },
  { id: 'sofa',         name: 'Диван 220×95',           w: 2200, d: 950,  cat: 'Гостиная', color: '#a7cbb8' },
  { id: 'armchair',     name: 'Кресло 85×85',           w: 850,  d: 850,  cat: 'Гостиная', color: '#a7cbb8' },
  { id: 'tv-stand',     name: 'Тумба ТВ 160×40',        w: 1600, d: 400,  cat: 'Гостиная', color: '#c4b5d9' },
  { id: 'vinyl-stand',  name: 'Тумба винил 100×45',     w: 1000, d: 450,  cat: 'Гостиная', color: '#c4b5d9' },
  { id: 'shelf',        name: 'Стеллаж 80×30',          w: 800,  d: 300,  cat: 'Гостиная', color: '#d9c8a9' },
  { id: 'table',        name: 'Стол обеденный 120×80',  w: 1200, d: 800,  cat: 'Кухня',    color: '#e8c9a8' },
  { id: 'kitchen-60',   name: 'Кухня, модуль 60×60',    w: 600,  d: 600,  cat: 'Кухня',    color: '#e8c9a8' },
  { id: 'fridge',       name: 'Холодильник 70×70',      w: 700,  d: 700,  cat: 'Кухня',    color: '#b8c4cc' },
  { id: 'bath-170',     name: 'Ванна 170×75',           w: 1700, d: 750,  cat: 'Санузлы',  color: '#b8d4e0' },
  { id: 'washer',       name: 'Стиралка 60×60',         w: 600,  d: 600,  cat: 'Санузлы',  color: '#b8c4cc' },
  { id: 'dryer',        name: 'Сушилка 60×60',          w: 600,  d: 600,  cat: 'Санузлы',  color: '#b8c4cc' },
  { id: 'sink',         name: 'Раковина 50×45',         w: 500,  d: 450,  cat: 'Санузлы',  color: '#b8d4e0' },
  { id: 'wc',           name: 'Унитаз 37×60',           w: 370,  d: 600,  cat: 'Санузлы',  color: '#b8d4e0' },
  { id: 'robot-dock',   name: 'База робота 35×40',      w: 350,  d: 400,  cat: 'Техника',  color: '#b8c4cc' }
];

export function getItem(id) {
  const item = CATALOG.find(c => c.id === id);
  if (!item) throw new Error('Нет в каталоге: ' + id);
  return item;
}
```

- [ ] **Step 4: Тесты зелёные**

Run: `node --test tests/`
Expected: PASS, 7 tests

- [ ] **Step 5: Commit**

```bash
git add js/catalog.js tests/catalog.test.mjs
git commit -m "Каталог мебели с реальными габаритами"
```

---

### Task 5: js/model.js — модель раскладки (TDD)

**Files:**
- Create: `tests/model.test.mjs`
- Create: `js/model.js`

- [ ] **Step 1: Падающий тест**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../js/model.js';

test('createLayout: пустая раскладка v1', () => {
  assert.deepEqual(M.createLayout(), { version: 1, seq: 0, items: [], outlets: [] });
});

test('addItem/moveItem/rotateItem/removeItem', () => {
  let l = M.createLayout();
  l = M.addItem(l, 'bed-160', 1000, 2000);
  assert.equal(l.items.length, 1);
  const id = l.items[0].id;
  assert.deepEqual(l.items[0], { id, catalogId: 'bed-160', x: 1000, y: 2000, rot: 0 });

  l = M.moveItem(l, id, 1500, 2500);
  assert.equal(l.items[0].x, 1500);

  l = M.rotateItem(l, id);
  assert.equal(l.items[0].rot, 90);
  l = M.rotateItem(l, id); l = M.rotateItem(l, id); l = M.rotateItem(l, id);
  assert.equal(l.items[0].rot, 0);

  l = M.removeItem(l, id);
  assert.equal(l.items.length, 0);
});

test('outlets: add/remove', () => {
  let l = M.createLayout();
  l = M.addOutlet(l, 300, 400, 'socket');
  assert.equal(l.outlets.length, 1);
  assert.equal(l.outlets[0].kind, 'socket');
  l = M.removeOutlet(l, l.outlets[0].id);
  assert.equal(l.outlets.length, 0);
});

test('serialize/parse: round-trip', () => {
  let l = M.createLayout();
  l = M.addItem(l, 'sofa', 9000, 3000);
  l = M.addOutlet(l, 9100, 3100);
  const restored = M.parse(M.serialize(l));
  assert.deepEqual(restored, l);
});

test('parse отвергает мусор', () => {
  assert.throws(() => M.parse('{"foo": 1}'));
  assert.throws(() => M.parse('не json'));
});

test('id уникальны между items и outlets', () => {
  let l = M.createLayout();
  l = M.addItem(l, 'sofa', 0, 0);
  l = M.addOutlet(l, 0, 0);
  l = M.addItem(l, 'table', 0, 0);
  const ids = [...l.items.map(i => i.id), ...l.outlets.map(o => o.id)];
  assert.equal(new Set(ids).size, 3);
});
```

- [ ] **Step 2: Убедиться, что падает**

Run: `node --test tests/`
Expected: FAIL — `Cannot find module ... js/model.js`

- [ ] **Step 3: Реализация**

```js
export function createLayout() {
  return { version: 1, seq: 0, items: [], outlets: [] };
}

export function addItem(layout, catalogId, x, y) {
  const seq = layout.seq + 1;
  return { ...layout, seq,
    items: [...layout.items, { id: 'i' + seq, catalogId, x, y, rot: 0 }] };
}

export function moveItem(layout, id, x, y) {
  return { ...layout,
    items: layout.items.map(it => it.id === id ? { ...it, x, y } : it) };
}

export function rotateItem(layout, id) {
  return { ...layout,
    items: layout.items.map(it => it.id === id ? { ...it, rot: (it.rot + 90) % 360 } : it) };
}

export function removeItem(layout, id) {
  return { ...layout, items: layout.items.filter(it => it.id !== id) };
}

export function addOutlet(layout, x, y, kind = 'socket') {
  const seq = layout.seq + 1;
  return { ...layout, seq,
    outlets: [...layout.outlets, { id: 'o' + seq, x, y, kind }] };
}

export function removeOutlet(layout, id) {
  return { ...layout, outlets: layout.outlets.filter(o => o.id !== id) };
}

export function serialize(layout) {
  return JSON.stringify(layout, null, 2);
}

export function parse(text) {
  const data = JSON.parse(text);
  if (data.version !== 1 || !Array.isArray(data.items) || !Array.isArray(data.outlets)
    || typeof data.seq !== 'number') {
    throw new Error('Неверный формат layout.json');
  }
  return data;
}
```

- [ ] **Step 4: Тесты зелёные**

Run: `node --test tests/`
Expected: PASS, 13 tests

- [ ] **Step 5: Commit**

```bash
git add js/model.js tests/model.test.mjs
git commit -m "Модель раскладки: мебель, розетки, сериализация (TDD)"
```

---

### Task 6: planner.html + отрисовка плана

**Files:**
- Create: `planner.html`
- Create: `js/planner.js` (часть 1: загрузка, отрисовка, зум/пан)
- Create: `.claude/launch.json`

- [ ] **Step 1: planner.html**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Планировщик — Воткинское 53к1</title>
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <header>
    <a href="index.html">← Штаб</a>
    <h1>Планировщик</h1>
    <div class="toolbar">
      <button id="mode-furniture" class="active">Мебель</button>
      <button id="mode-outlets">Розетки</button>
      <label><input type="checkbox" id="layer-dims" checked> Размеры</label>
      <button id="zoom-in">+</button>
      <button id="zoom-out">−</button>
      <button id="zoom-fit">⤢</button>
      <button id="btn-rotate" disabled>Повернуть (R)</button>
      <button id="btn-delete" disabled>Удалить (Del)</button>
      <button id="btn-export">Экспорт</button>
      <label class="btn">Импорт<input type="file" id="file-import" accept=".json" hidden></label>
    </div>
  </header>
  <main class="planner-layout">
    <aside id="palette"></aside>
    <svg id="plan" xmlns="http://www.w3.org/2000/svg"></svg>
  </main>
  <script type="module" src="js/planner.js"></script>
</body>
</html>
```

- [ ] **Step 2: js/planner.js — часть 1 (файл создаётся целиком, интерактив добавит Task 7)**

```js
import { CATALOG, getItem } from './catalog.js';
import * as M from './model.js';
import { snap, footprint } from './geometry.js';

const NS = 'http://www.w3.org/2000/svg';
const LS_KEY = 'remont.layout.v1';
const svg = document.getElementById('plan');

let apartment = null;
let layout = M.createLayout();
let selectedId = null;
let mode = 'furniture';
let view = { x: 0, y: 0, w: 1000, h: 1000 };

init();

async function init() {
  apartment = await (await fetch('data/apartment.json')).json();
  layout = loadLocal() ?? M.createLayout();
  fitView();
  render();
}

function loadLocal() {
  try {
    const t = localStorage.getItem(LS_KEY);
    return t ? M.parse(t) : null;
  } catch { return null; }
}

function persist() { localStorage.setItem(LS_KEY, M.serialize(layout)); }

function bounds() {
  const rs = apartment.rooms;
  const x1 = Math.min(...rs.map(r => r.x)), y1 = Math.min(...rs.map(r => r.y));
  const x2 = Math.max(...rs.map(r => r.x + r.w)), y2 = Math.max(...rs.map(r => r.y + r.h));
  const pad = 400;
  return { x: x1 - pad, y: y1 - pad, w: x2 - x1 + pad * 2, h: y2 - y1 + pad * 2 };
}

function fitView() { view = bounds(); applyView(); }
function applyView() { svg.setAttribute('viewBox', `${view.x} ${view.y} ${view.w} ${view.h}`); }

function zoom(factor) {
  const cx = view.x + view.w / 2, cy = view.y + view.h / 2;
  view.w *= factor; view.h *= factor;
  view.x = cx - view.w / 2; view.y = cy - view.h / 2;
  applyView();
}

function el(name, attrs = {}, parent) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
}

function render() {
  svg.innerHTML = '';
  renderRooms();
  renderFurniture();
  renderOutlets();
}

function renderRooms() {
  const g = el('g', { id: 'g-rooms' }, svg);
  const showDims = document.getElementById('layer-dims').checked;
  for (const r of apartment.rooms) {
    el('rect', { x: r.x, y: r.y, width: r.w, height: r.h,
      fill: r.cold ? '#f0efec' : '#ffffff', stroke: '#5f5e5a', 'stroke-width': 60,
      'stroke-dasharray': r.cold ? '120 80' : 'none' }, g);
    const label = el('text', { x: r.x + r.w / 2, y: r.y + r.h / 2 - 60,
      'text-anchor': 'middle', 'font-size': 240, fill: '#6f6e69' }, g);
    label.textContent = `${r.name} · ${r.area} м²`;
    if (showDims) {
      const dims = el('text', { x: r.x + r.w / 2, y: r.y + r.h / 2 + 220,
        'text-anchor': 'middle', 'font-size': 180, fill: '#b0aea6' }, g);
      dims.textContent = `${(r.w / 1000).toFixed(2)} × ${(r.h / 1000).toFixed(2)} м`;
    }
  }
  for (const d of apartment.doors ?? []) renderOpening(d, '#d85a30', g);
  for (const w of apartment.windows ?? []) renderOpening(w, '#378add', g);
}

function renderOpening(o, color, g) {
  const r = apartment.rooms.find(rm => rm.id === o.room);
  if (!r) return;
  let x, y, w, h;
  const t = 80;
  if (o.side === 'top')    { x = r.x + o.offset; y = r.y - t;       w = o.width; h = t * 2; }
  if (o.side === 'bottom') { x = r.x + o.offset; y = r.y + r.h - t; w = o.width; h = t * 2; }
  if (o.side === 'left')   { x = r.x - t;        y = r.y + o.offset; w = t * 2;  h = o.width; }
  if (o.side === 'right')  { x = r.x + r.w - t;  y = r.y + o.offset; w = t * 2;  h = o.width; }
  el('rect', { x, y, width: w, height: h, fill: color, opacity: 0.85 }, g);
}

function renderFurniture() {
  const g = el('g', { id: 'g-furniture' }, svg);
  for (const item of layout.items) {
    const cat = getItem(item.catalogId);
    const f = footprint(item, cat);
    const isSel = item.id === selectedId;
    const grp = el('g', { 'data-id': item.id, cursor: 'move' }, g);
    el('rect', { x: f.x, y: f.y, width: f.w, height: f.h, rx: 60,
      fill: cat.color, stroke: isSel ? '#d85a30' : '#5f5e5a',
      'stroke-width': isSel ? 90 : 40 }, grp);
    const t = el('text', { x: f.x + f.w / 2, y: f.y + f.h / 2 + 60,
      'text-anchor': 'middle', 'font-size': 170, fill: '#2c2c2a',
      'pointer-events': 'none' }, grp);
    t.textContent = cat.name.split(' ')[0];
    if (isSel) {
      const d = el('text', { x: f.x + f.w / 2, y: f.y - 100, 'text-anchor': 'middle',
        'font-size': 180, fill: '#d85a30', 'pointer-events': 'none' }, grp);
      d.textContent = `${f.w}×${f.h} мм`;
    }
  }
}

function renderOutlets() {
  const g = el('g', { id: 'g-outlets' }, svg);
  for (const o of layout.outlets) {
    const isSel = o.id === selectedId;
    const grp = el('g', { 'data-id': o.id, cursor: 'pointer' }, g);
    el('circle', { cx: o.x, cy: o.y, r: 140, fill: '#fff',
      stroke: isSel ? '#d85a30' : '#1d9e75', 'stroke-width': isSel ? 80 : 50 }, grp);
    const t = el('text', { x: o.x, y: o.y + 60, 'text-anchor': 'middle',
      'font-size': 160, fill: '#1d9e75', 'pointer-events': 'none' }, grp);
    t.textContent = '⚡';
  }
}
```

- [ ] **Step 3: .claude/launch.json — локальный сервер (ES-модули не работают с file://)**

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "site",
      "runtimeExecutable": "python",
      "runtimeArgs": ["-m", "http.server", "8000"],
      "port": 8000
    }
  ]
}
```

- [ ] **Step 4: Проверка в браузере**

Запустить сервер (preview_start `site`), открыть `http://localhost:8000/planner.html`.
Expected: план из 8 помещений с подписями и размерами, лоджия пунктиром, двери терракотовые, окна синие. Пропорции похожи на техплан. Кнопки зума пока не работают (обработчики — Task 7).

- [ ] **Step 5: Commit**

```bash
git add planner.html js/planner.js .claude/launch.json
git commit -m "Планировщик: отрисовка плана квартиры из apartment.json"
```

---

### Task 7: Интерактив планировщика + сверка геометрии

**Files:**
- Modify: `js/planner.js` (дописать в конец файла)
- Modify: `data/apartment.json` (поправки по итогам визуальной сверки)

- [ ] **Step 1: Дописать интерактив в js/planner.js**

```js
// ---------- Палитра ----------
buildPalette();

function buildPalette() {
  const aside = document.getElementById('palette');
  aside.innerHTML = '';
  const cats = [...new Set(CATALOG.map(c => c.cat))];
  for (const cat of cats) {
    const section = document.createElement('section');
    const h = document.createElement('h3');
    h.textContent = cat;
    section.appendChild(h);
    for (const item of CATALOG.filter(c => c.cat === cat)) {
      const b = document.createElement('button');
      b.textContent = item.name;
      b.addEventListener('click', () => {
        const cx = snap(view.x + view.w / 2), cy = snap(view.y + view.h / 2);
        layout = M.addItem(layout, item.id, cx, cy);
        selectedId = layout.items.at(-1).id;
        persist(); render(); updateToolbar();
      });
      section.appendChild(b);
    }
    aside.appendChild(section);
  }
}

// ---------- Координаты указателя в мм ----------
function svgPoint(evt) {
  const pt = new DOMPoint(evt.clientX, evt.clientY);
  const p = pt.matrixTransform(svg.getScreenCTM().inverse());
  return { x: p.x, y: p.y };
}

// ---------- Выбор, drag, pan ----------
let drag = null; // { id, dx, dy } | { pan: true, startX, startY, viewX, viewY }

svg.addEventListener('pointerdown', evt => {
  const grp = evt.target.closest('g[data-id]');
  const p = svgPoint(evt);
  if (mode === 'outlets' && !grp) {
    layout = M.addOutlet(layout, snap(p.x), snap(p.y));
    selectedId = layout.outlets.at(-1).id;
    persist(); render(); updateToolbar();
    return;
  }
  if (grp) {
    selectedId = grp.dataset.id;
    const item = layout.items.find(i => i.id === selectedId);
    drag = item
      ? { id: selectedId, dx: p.x - item.x, dy: p.y - item.y }
      : { id: selectedId, outlet: true };
    svg.setPointerCapture(evt.pointerId);
  } else {
    selectedId = null;
    drag = { pan: true, startX: evt.clientX, startY: evt.clientY,
      viewX: view.x, viewY: view.y };
    svg.setPointerCapture(evt.pointerId);
  }
  render(); updateToolbar();
});

svg.addEventListener('pointermove', evt => {
  if (!drag) return;
  if (drag.pan) {
    const scale = view.w / svg.clientWidth;
    view.x = drag.viewX - (evt.clientX - drag.startX) * scale;
    view.y = drag.viewY - (evt.clientY - drag.startY) * scale;
    applyView();
    return;
  }
  const p = svgPoint(evt);
  if (drag.outlet) {
    layout = { ...layout, outlets: layout.outlets.map(o =>
      o.id === drag.id ? { ...o, x: snap(p.x), y: snap(p.y) } : o) };
  } else {
    layout = M.moveItem(layout, drag.id, snap(p.x - drag.dx), snap(p.y - drag.dy));
  }
  render();
});

svg.addEventListener('pointerup', () => {
  if (drag && !drag.pan) persist();
  drag = null;
});

// ---------- Тулбар ----------
function updateToolbar() {
  const isItem = layout.items.some(i => i.id === selectedId);
  const isOutlet = layout.outlets.some(o => o.id === selectedId);
  document.getElementById('btn-rotate').disabled = !isItem;
  document.getElementById('btn-delete').disabled = !isItem && !isOutlet;
}

function deleteSelected() {
  if (!selectedId) return;
  layout = layout.items.some(i => i.id === selectedId)
    ? M.removeItem(layout, selectedId)
    : M.removeOutlet(layout, selectedId);
  selectedId = null;
  persist(); render(); updateToolbar();
}

function rotateSelected() {
  if (!layout.items.some(i => i.id === selectedId)) return;
  layout = M.rotateItem(layout, selectedId);
  persist(); render();
}

document.getElementById('btn-rotate').addEventListener('click', rotateSelected);
document.getElementById('btn-delete').addEventListener('click', deleteSelected);
document.getElementById('zoom-in').addEventListener('click', () => zoom(0.8));
document.getElementById('zoom-out').addEventListener('click', () => zoom(1.25));
document.getElementById('zoom-fit').addEventListener('click', fitView);
document.getElementById('layer-dims').addEventListener('change', render);

document.addEventListener('keydown', evt => {
  if (evt.target.tagName === 'INPUT') return;
  if (evt.key === 'r' || evt.key === 'R' || evt.key === 'к' || evt.key === 'К') rotateSelected();
  if (evt.key === 'Delete' || evt.key === 'Backspace') deleteSelected();
});

// ---------- Режимы ----------
for (const m of ['furniture', 'outlets']) {
  document.getElementById('mode-' + m).addEventListener('click', () => {
    mode = m;
    document.getElementById('mode-furniture').classList.toggle('active', m === 'furniture');
    document.getElementById('mode-outlets').classList.toggle('active', m === 'outlets');
  });
}

// ---------- Экспорт / импорт ----------
document.getElementById('btn-export').addEventListener('click', () => {
  const blob = new Blob([M.serialize(layout)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'layout.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('file-import').addEventListener('change', async evt => {
  const file = evt.target.files[0];
  if (!file) return;
  try {
    layout = M.parse(await file.text());
    selectedId = null;
    persist(); render(); updateToolbar();
  } catch (e) {
    alert('Не удалось импортировать: ' + e.message);
  }
  evt.target.value = '';
});
```

- [ ] **Step 2: Юнит-тесты не сломаны**

Run: `node --test tests/`
Expected: PASS, 13 tests

- [ ] **Step 3: Ручная проверка в браузере** (`http://localhost:8000/planner.html`)

Чеклист:
- клик по «Кровать 160×200» в палитре — появляется в центре, выделена, видны размеры;
- перетаскивание мышью — двигается с прилипанием к сетке 50 мм;
- R — поворот 90°; Delete — удаление; кнопки тулбара работают;
- режим «Розетки»: клик по плану ставит маркер ⚡, маркер перетаскивается и удаляется;
- перезагрузка страницы — раскладка сохранилась (localStorage);
- «Экспорт» скачивает layout.json; «Импорт» его же восстанавливает;
- зум +/−/⤢ и панорамирование перетаскиванием фона;
- на узком окне (мобильная ширина) палитра сверху горизонтальной лентой, drag работает пальцем (pointer events).

- [ ] **Step 4: Сверка геометрии со сканом техплана**

Открыть рядом `Документы/Квартира (Воткинское 53 к1)/Выписка из технического плана/Выписка из технического плана (крупно).jpg` и план в браузере. Проверить взаимное расположение помещений, положение дверей/окон/входа. Поправить координаты в `data/apartment.json`, обновить страницу, повторять до визуального совпадения.

- [ ] **Step 5: Commit**

```bash
git add js/planner.js data/apartment.json
git commit -m "Планировщик: палитра, drag&drop, розетки, экспорт/импорт; сверка геометрии"
```

---

### Task 8: Публикация на GitHub Pages

**Files:**
- Create: `README.md`

- [ ] **Step 1: README.md**

```markdown
# Штаб ремонта — Воткинское шоссе 53к1, кв. 104

Инструменты планирования ремонта: интерактивный планировщик, смета, план работ.

**Сайт:** https://<owner>.github.io/<repo>/ (подставить после включения Pages)

- `planner.html` — планировщик квартиры (мебель, розетки, экспорт layout.json)
- `data/` — геометрия квартиры и данные
- `docs/superpowers/` — спека и планы
- Тесты: `node --test tests/`

Папка `Документы/` содержит персональные данные и в репозиторий не попадает (.gitignore).
```

- [ ] **Step 2: Проверить remote и подтвердить пуш у пользователя**

Run: `git remote -v`
Если remote нет — спросить у пользователя URL созданного с телефона репозитория и выполнить `git remote add origin <url>`. Перед первым push подтвердить у пользователя: репозиторий публичный, `Документы/` в него не попадают (проверить `git ls-files | grep -i документ` — пусто).

- [ ] **Step 3: Push**

```bash
git add README.md
git commit -m "README со ссылкой на сайт"
git push -u origin main
```

- [ ] **Step 4: Включить Pages**

Попробовать через CLI: `gh api repos/{owner}/{repo}/pages -X POST -f build_type=legacy -f "source[branch]=main" -f "source[path]=/"`.
Если `gh` не авторизован — попросить пользователя: Settings → Pages → Source: `main`, папка `/ (root)` → Save.

- [ ] **Step 5: Проверка публикации**

Открыть `https://<owner>.github.io/<repo>/planner.html` (первая сборка Pages — до 5 минут). Проверить главную и планировщик, попросить пользователя открыть с телефона. Вписать финальный URL в README, закоммитить и запушить.

```bash
git add README.md
git commit -m "README: финальный URL сайта"
git push
```

---

## Self-review

- **Покрытие спеки (раздел 8):** planner.html — Tasks 6–7; данные apartment/layout — Tasks 2, 5; index.html — Task 1; Pages + приватность — Task 8 (+ .gitignore уже в репо). works/estimate/notes — сознательно вынесены в план 2.
- **Плейсхолдеров нет:** весь код приведён полностью; «часть 1/часть 2» — это один файл, дописываемый в Task 7 конкретным кодом.
- **Согласованность типов:** `footprint(item, cat)` использует `cat.w/cat.d` (каталог) и `item.rot` (модель) — совпадает между Tasks 3–5 и 6–7; `M.parse/serialize` — единые точки I/O (localStorage, импорт/экспорт).
