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
