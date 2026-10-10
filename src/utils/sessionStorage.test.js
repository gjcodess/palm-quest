import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { SESSION_KEY, readSession, saveSessionValue, clearSession } from './sessionStorage.js';

beforeEach(() => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
});

test('progress, answers, and incomplete steps survive a fresh read', () => {
  saveSessionValue('game.scene', 'mission3');
  saveSessionValue('game.stageAnswers', { mission3: { selectedOptionId: 'a', isCorrect: false } });
  saveSessionValue('mission3.bowlStep', 4);
  saveSessionValue('orientation.handwashingDone', false);
  assert.deepEqual(readSession(), {
    'game.scene': 'mission3',
    'game.stageAnswers': { mission3: { selectedOptionId: 'a', isCorrect: false } },
    'mission3.bowlStep': 4,
    'orientation.handwashingDone': false,
  });
});

test('restarting a stage clears only its workstation and checkpoint', () => {
  saveSessionValue('mission3.bowlStep', 4);
  saveSessionValue('mission3.checkpoint.selectedId', 'b');
  saveSessionValue('mission4.moldStep', 2);
  saveSessionValue('game.stageAnswers', { mission3: { isCorrect: false } });
  clearSession('mission3');
  assert.deepEqual(readSession(), { 'mission4.moldStep': 2, 'game.stageAnswers': { mission3: { isCorrect: false } } });
});

test('new batch clears progress without clearing the saved student name', () => {
  localStorage.setItem('palmquest_name', 'Student');
  saveSessionValue('game.scene', 'results');
  clearSession();
  assert.deepEqual(readSession(), {});
  assert.equal(localStorage.getItem('palmquest_name'), 'Student');
});

test('corrupt or unsupported saves fall back to an empty session', () => {
  for (const text of ['invalid JSON', 'null', '{"version":2,"values":{}}', '{"version":1,"values":[]}']) {
    localStorage.setItem(SESSION_KEY, text);
    assert.deepEqual(readSession(), {});
  }
});
