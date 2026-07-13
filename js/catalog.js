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
