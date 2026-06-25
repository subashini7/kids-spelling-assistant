import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MASTERY_STREAK,
  SR_INTERVAL_UNASSISTED,
  SR_INTERVAL_ASSISTED,
  computeSRInterval,
  updateLifetimeEntry,
  buildMaskedHint,
} from '../scripts/logic.js';

// ─── computeSRInterval ───────────────────────────────────────────────────────

test('wrong answer schedules after 2 words', () => {
  assert.equal(computeSRInterval(false), 2);
  assert.equal(computeSRInterval(false, true), 2);
});

test('unassisted correct schedules after SR_INTERVAL_UNASSISTED words', () => {
  assert.equal(computeSRInterval(true), SR_INTERVAL_UNASSISTED); // 10
});

test('assisted correct schedules after SR_INTERVAL_ASSISTED words', () => {
  assert.equal(computeSRInterval(true, true), SR_INTERVAL_ASSISTED); // 3
});

// ─── updateLifetimeEntry ──────────────────────────────────────────────────────

test('correct answer increments correct count and streak', () => {
  const result = updateLifetimeEntry({ correct: 1, errors: 0, streak: 1 }, true);
  assert.equal(result.correct, 2);
  assert.equal(result.streak, 2);
  assert.equal(result.errors, 0);
});

test('wrong answer resets streak and increments errors', () => {
  const result = updateLifetimeEntry({ correct: 2, errors: 0, streak: 2 }, false);
  assert.equal(result.streak, 0);
  assert.equal(result.errors, 1);
  assert.equal(result.correct, 2);
});

test('entry defaults to zero counts when called with no prior entry', () => {
  const result = updateLifetimeEntry(undefined, true);
  assert.equal(result.correct, 1);
  assert.equal(result.streak, 1);
  assert.equal(result.errors, 0);
});

test('does not mutate the original entry', () => {
  const original = { correct: 1, errors: 0, streak: 1 };
  updateLifetimeEntry(original, true);
  assert.equal(original.correct, 1);
  assert.equal(original.streak, 1);
});

test('mastery is reached after MASTERY_STREAK consecutive corrects', () => {
  let entry;
  for (let i = 0; i < MASTERY_STREAK; i++) {
    entry = updateLifetimeEntry(entry, true);
  }
  assert.ok(entry.streak >= MASTERY_STREAK, 'streak should reach mastery threshold');
});

test('one wrong resets streak so mastery requires starting over', () => {
  let entry = updateLifetimeEntry(undefined, true); // streak 1
  entry = updateLifetimeEntry(entry, false);         // streak 0
  entry = updateLifetimeEntry(entry, true);          // streak 1 again
  assert.equal(entry.streak, 1);
  assert.ok(entry.streak < MASTERY_STREAK);
});

// ─── buildMaskedHint ─────────────────────────────────────────────────────────

test('short words (≤2 chars) are returned as-is', () => {
  assert.equal(buildMaskedHint('a'), 'a');
  assert.equal(buildMaskedHint('it'), 'it');
});

test('first and last letters are revealed, middle is masked', () => {
  const hint = buildMaskedHint('running');   // 7 letters
  assert.ok(hint.startsWith('r'), 'should start with first letter');
  assert.ok(hint.includes('g'), 'should include last letter');
  assert.ok(hint.includes('_'), 'should mask middle letters');
  assert.ok(hint.includes('(7 letters)'), 'should show letter count');
});

test('hint for a 3-letter word reveals first and last only', () => {
  const hint = buildMaskedHint('cat');
  assert.ok(hint.startsWith('c'));
  assert.ok(hint.includes('t'));
  assert.ok(hint.includes('_'));
});
