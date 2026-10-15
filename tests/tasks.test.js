import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readTasks, visibleTasks } from '../src/tasks.js';
const tasks = [{ id: '1', text: 'Plan today', completed: false }, { id: '2', text: 'Read', completed: true }];
test('stored tasks survive loading and malformed data is rejected', () => {
  assert.deepEqual(readTasks({ getItem: () => JSON.stringify(tasks) }), tasks);
  for (const value of ['bad json', '{}', '[null, {"id":2}]']) {
    assert.deepEqual(readTasks({ getItem: () => value }), []);
  }
  assert.deepEqual(readTasks({ getItem() { throw Error('Denied'); } }), []);
});
test('filters select active and completed tasks without changing the list', () => {
  assert.deepEqual(visibleTasks(tasks, 'active'), [tasks[0]]);
  assert.deepEqual(visibleTasks(tasks, 'completed'), [tasks[1]]);
  assert.deepEqual(visibleTasks(tasks, 'all'), tasks);
});
