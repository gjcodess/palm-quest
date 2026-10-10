// Choice IDs stay stable when the displayed answer letters are shuffled.
export const getSelectedStageChoice = (answer, choices) => {
  if (!answer) return null;
  // Older records stored the display letter as selectedOptionId. Their text
  // identifies the actual choice without confusing that letter with an ID.
  if (answer.selectedText) {
    const selected = choices.find((choice) => choice.text === answer.selectedText);
    if (selected) return selected;
  }
  const selectedId = answer.selectedOptionId?.toLowerCase();
  return choices.find((choice) => choice.id?.toLowerCase() === selectedId) || null;
};

export const getPipelinePlacement = (audit, step) => {
  const items = audit?.submittedItems || [];
  const expectedId = audit?.correctOrder?.[step - 1] || audit?.correctItems?.[step - 1]?.id;
  const position = items.findIndex((item) => expectedId
    ? item.id === expectedId
    : item.stepNum === step);
  return {
    isCorrect: position === step - 1,
    position: position === -1 ? null : position + 1,
  };
};
