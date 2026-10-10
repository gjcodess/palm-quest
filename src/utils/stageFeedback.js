// Feedback authored with A/B/C/D prefixes must follow the shuffled display order.
export const formatStageFeedback = (text = '', choice) => {
  const letter = choice?.displayLetter || choice?.id?.toUpperCase();
  return letter ? text.replace(/^[A-Z]\.\s+/, `${letter}. `) : text;
};
