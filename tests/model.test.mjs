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
