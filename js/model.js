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
