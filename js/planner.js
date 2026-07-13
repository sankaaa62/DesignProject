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
