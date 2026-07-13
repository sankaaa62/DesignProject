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
