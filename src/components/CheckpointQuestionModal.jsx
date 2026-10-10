import React, { useState, useEffect } from 'react';
import { soundManager } from '../audio/soundManager';

/**
 * Fisher-Yates shuffle algorithm for fair, unbiased choice randomization
 */
const shuffleChoices = (items) => {
  if (!Array.isArray(items)) return [];
  const copy = items.map((item) => ({ ...item }));
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  const LETTERS = ['A', 'B', 'C', 'D', 'E'];
  return copy.map((item, idx) => ({
    ...item,
    displayLetter: LETTERS[idx] || String.fromCharCode(65 + idx),
  }));
};

/**
 * CheckpointQuestionModal:
 * Displays curriculum checkpoint pre-check questions for Stages 1 to 8.
 * Option B: Instant single-click reveal gives immediate instructional feedback
 * showing whether the answer chosen was right or wrong, why, and the underlying
 * Food Science Principle before proceeding to the workstation.
 */
export const CheckpointQuestionModal = ({
  isOpen,
  question,
  choices = [],
  explanation = '',
  onComplete,
  stageTitle = 'Food Technology Checkpoint',
}) => {
  const [selectedId, setSelectedId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [randomizedChoices, setRandomizedChoices] = useState(() =>
    isOpen && Array.isArray(choices) && choices.length > 0 ? shuffleChoices(choices) : []
  );

  useEffect(() => {
    if (isOpen && Array.isArray(choices) && choices.length > 0) {
      setSelectedId(null);
      setIsAnswered(false);
      setRandomizedChoices(shuffleChoices(choices));
    }
  }, [isOpen, question]);

  if (!isOpen) return null;

  const currentChoice = randomizedChoices.find((c) => c.id === selectedId);
  const correctChoice = randomizedChoices.find((c) => c.isCorrect);

  const handleSelect = (choice) => {
    if (isAnswered) return; // Prevent changing after initial click

    setSelectedId(choice.id);
    setIsAnswered(true);

    if (choice.isCorrect) {
      soundManager.playSuccess();
    } else {
      soundManager.playError();
    }
  };

  const handleProceed = () => {
    if (!currentChoice) return;
    soundManager.playClick();
    if (onComplete) {
      onComplete(
        {
          ...currentChoice,
          selectedOptionId: currentChoice.id,
        },
        randomizedChoices
      );
    }
  };

  return (
    <div className="checkpoint-modal-backdrop">
      <div className="checkpoint-modal-card">
        {/* Header Pill */}
        <div className="checkpoint-header">
          <div className="checkpoint-teacher-badge">
            <span className="teacher-avatar-mini">👩‍🍳</span>
            <span className="teacher-badge-text">Teacher Mia's Stage Pre-Check</span>
          </div>
          <span className="checkpoint-stage-tag">{stageTitle}</span>
        </div>

        {/* Question Body */}
        <div className="checkpoint-body">
          <h3 className="checkpoint-question-title">{question}</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            {isAnswered
              ? 'Review the food technology principle below before starting your workstation tasks:'
              : 'Select your answer to immediately verify the scientific principle:'}
          </p>

          {/* Interactive Choices Grid */}
          <div className="checkpoint-choices-stack">
            {randomizedChoices.map((choice) => {
              const isSelected = selectedId === choice.id;
              const isCorrectTarget = choice.isCorrect;

              let choiceClass = 'checkpoint-choice-btn';
              if (isAnswered) {
                if (isSelected) {
                  choiceClass += choice.isCorrect ? ' choice-correct' : ' choice-wrong';
                } else if (isCorrectTarget) {
                  choiceClass += ' choice-reveal-correct';
                } else {
                  choiceClass += ' choice-dimmed';
                }
              } else if (isSelected) {
                choiceClass += ' choice-selected';
              }

              return (
                <button
                  key={choice.id}
                  type="button"
                  className={choiceClass}
                  onClick={() => handleSelect(choice)}
                  disabled={isAnswered}
                >
                  <span className="choice-letter-badge">{choice.displayLetter}</span>
                  <div className="choice-content-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <span className="choice-text">{choice.text}</span>
                    {isAnswered && isCorrectTarget && !isSelected && (
                      <span className="choice-standard-hint" style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 800 }}>
                        ✓ Standard Commercial Procedure
                      </span>
                    )}
                  </div>
                  {isAnswered && isSelected && (
                    <span className="choice-status-icon" style={{ fontSize: '1.2rem', marginLeft: 'auto', flexShrink: 0 }}>
                      {choice.isCorrect ? '✅' : '❌'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Instant Instructional Feedback Card (Revealed on Click) */}
          {isAnswered && currentChoice && (
            <div
              className={`checkpoint-feedback-box ${
                currentChoice.isCorrect ? 'feedback-correct' : 'feedback-alert'
              }`}
            >
              <div className="feedback-icon-col">
                {currentChoice.isCorrect ? '💡' : '🔬'}
              </div>
              <div className="feedback-text-col">
                <strong>
                  {currentChoice.isCorrect
                    ? '✓ Correct Standard Procedure!'
                    : '⚠️ Scientific Principle Alert'}
                </strong>
                <p style={{ marginBottom: '6px' }}>
                  {currentChoice.reason || (currentChoice.isCorrect ? 'This aligns with commercial food processing standards.' : 'This choice is not aligned with standard processing parameters.')}
                </p>
                {explanation && (
                  <div className="feedback-science-principle" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed currentColor', opacity: 0.95 }}>
                    <span style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>
                      Food Science Principle:
                    </span>
                    <span>{explanation}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Button */}
        {isAnswered && (
          <div className="checkpoint-footer">
            <button
              type="button"
              className="btn-checkpoint-proceed"
              onClick={handleProceed}
            >
              <span>Proceed to Workstation</span>
              <span className="proceed-arrow">➔</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


