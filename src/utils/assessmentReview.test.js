import assert from 'node:assert/strict';
import { test } from 'node:test';
import { STAGE_QUESTIONS } from '../data/stageQuestionsData.js';
import { getSelectedStageChoice, getPipelinePlacement } from './assessmentReview.js';

const permutations = (items) => items.length === 0 ? [[]] : items.flatMap((item, index) =>
  permutations(items.filter((_, i) => i !== index)).map((rest) => [item, ...rest]));

test('every answer in every shuffled stage question resolves to the actual selected choice', () => {
  for (const question of Object.values(STAGE_QUESTIONS)) {
    for (const order of permutations(question.choices)) {
      const choices = order.map((choice, i) => ({ ...choice, displayLetter: String.fromCharCode(65 + i) }));
      for (const choice of choices) {
        // Both previously recorded display letters and new stable IDs must work.
        for (const selectedOptionId of [choice.displayLetter, choice.id]) {
          const resolved = getSelectedStageChoice({ selectedOptionId, selectedText: choice.text }, choices);
          assert.equal(resolved.id, choice.id);
          assert.equal(resolved.isCorrect, choice.isCorrect);
        }
        assert.equal(getSelectedStageChoice({ selectedOptionId: choice.id }, choices).id, choice.id);
      }
    }
  }
});

test('pipeline review agrees with assessment scoring for every possible order', () => {
  const correctOrder = ['boiling', 'grinding', 'mixing', 'molding', 'steaming', 'dehydration', 'frying', 'packaging'];
  const correctItems = correctOrder.map((id, i) => ({ id, stepNum: i + 1 }));
  for (const submittedItems of permutations(correctItems)) {
    const audit = { submittedItems, correctOrder, correctItems };
    for (let step = 1; step <= 8; step++) {
      const review = getPipelinePlacement(audit, step);
      assert.equal(review.isCorrect, submittedItems[step - 1].id === correctOrder[step - 1]);
      assert.equal(review.position, submittedItems.findIndex((item) => item.id === correctOrder[step - 1]) + 1);
    }
  }
});

test('missing answers remain unrecorded and stepNum is supported without order metadata', () => {
  assert.equal(getSelectedStageChoice(null, STAGE_QUESTIONS.mission1.choices), null);
  assert.deepEqual(getPipelinePlacement(null, 1), { isCorrect: false, position: null });
  assert.deepEqual(getPipelinePlacement({ submittedItems: [{ id: 'boiling', stepNum: 1 }] }, 1), { isCorrect: true, position: 1 });
});
