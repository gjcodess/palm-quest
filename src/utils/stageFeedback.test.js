import assert from 'node:assert/strict';
import { test } from 'node:test';
import { STAGE_QUESTIONS } from '../data/stageQuestionsData.js';
import { formatStageFeedback } from './stageFeedback.js';

const permutations = (items) => items.length === 0 ? [[]] : items.flatMap((item, index) =>
  permutations(items.filter((_, i) => i !== index)).map((rest) => [item, ...rest]));

test('feedback and correct explanations match every shuffled question order', () => {
  for (const question of Object.values(STAGE_QUESTIONS)) {
    for (const order of permutations(question.choices)) {
      const choices = order.map((choice, i) => ({ ...choice, displayLetter: String.fromCharCode(65 + i) }));
      for (const choice of choices) {
        const formatted = formatStageFeedback(choice.reason, choice);
        if (/^[A-Z]\.\s+/.test(choice.reason)) {
          assert.ok(formatted.startsWith(`${choice.displayLetter}. `));
          assert.equal(formatted.slice(3), choice.reason.slice(3));
        } else {
          assert.equal(formatted, choice.reason);
        }
      }
      const correctChoice = choices.find((choice) => choice.isCorrect);
      // Duplicate suppression must still work after adjusting the letters.
      assert.equal(formatStageFeedback(question.explanation, correctChoice), formatStageFeedback(correctChoice.reason, correctChoice));
    }
  }
});

test('unshuffled answer keys and text without letter prefixes remain valid', () => {
  assert.equal(formatStageFeedback('B. Correct - Explanation.', { id: 'b' }), 'B. Correct - Explanation.');
  assert.equal(formatStageFeedback('Boiling softens fibers.', { displayLetter: 'D' }), 'Boiling softens fibers.');
  assert.equal(formatStageFeedback('B. Correct - Explanation.'), 'B. Correct - Explanation.');
});
