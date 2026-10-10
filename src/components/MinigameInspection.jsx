import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';

/**
 * MinigameInspection: Diagnostic safety inspection assessment component
 * Learners identify the requested item from one correct option and two plausible distractors.
 * In assessment mode:
 * - The first choice for each item is final, even when it is incorrect.
 * - Previous choices are saved and remembered when returning to this screen.
 * - When pre-test is completed (isLocked = true), choices are read-only.
 */
export const MinigameInspection = ({
  title = "Tool Safety Inspection",
  items = [],
  initialAnswers = [], // Array of recorded choice objects from context / state
  onAnswersChange,
  onComplete,
  isLocked = false,
  mode = "tools", // "tools" | "ingredients"
}) => {
  const { speak, setIsDialogueCollapsed } = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const lockedClicksRef = React.useRef(0);

  // Map of answers keyed by item id: { [itemId]: { chosen, isCorrect, selectedSide, optionLabel } }
  const [answers, setAnswers] = useState(() => {
    const map = {};
    if (Array.isArray(initialAnswers)) {
      initialAnswers.forEach((ans) => {
        if (ans && ans.id) {
          map[ans.id] = ans;
        }
      });
    }
    return map;
  });
  // Guard immediately, including multiple input events before React renders.
  const answersRef = React.useRef(answers);

  // Keep the three options stable for each item while still randomizing their positions.
  const [pairsByItemId, setPairsByItemId] = useState(() => {
    const pairs = {};
    const shuffle = (values) => {
      const shuffled = [...values];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
      }
      return shuffled;
    };

    items.forEach((item) => {
      const options = [
        { ...item.correctOption, isCorrect: true },
        ...(item.distractors || []).map((distractor) => ({ ...distractor, isCorrect: false })),
      ];
      pairs[item.id] = shuffle(options).map((card, index) => ({
        ...card,
        // Keep the old field as a compatibility alias for existing assessment records.
        isSafe: card.isCorrect,
        side: `option-${index}`,
        optionLabel: `Option ${String.fromCharCode(65 + index)}`,
      }));
    });
    return pairs;
  });

  const currentItem = items[currentIndex] || items[0];
  const isLastItem = currentIndex + 1 >= items.length;
  const currentPair = pairsByItemId[currentItem?.id] || [];
  const currentAnswer = answers[currentItem?.id] || null;
  const isAnswerLocked = isLocked || Boolean(currentAnswer);
  const targetTypeLabel = mode === 'tools' ? 'Correct Tool' : 'Correct Ingredient';
  const targetTypePlural = mode === 'tools' ? 'tools' : 'ingredients';

  useEffect(() => {
    if (!currentItem) return;
    speak(
      `Inspect these three ${targetTypePlural}. Select the option that best matches the required item for this task.`,
      'neutral',
      { hint: isLocked ? 'Pre-Test is completed. You are reviewing your submitted choices.' : 'Compare all three options carefully. Your first answer is final.' }
    );
  }, [currentIndex, currentItem, isLocked, targetTypePlural]);

  const handleCardClick = (card) => {
    if (isLocked) {
      soundManager.playError();
      lockedClicksRef.current += 1;
      if (lockedClicksRef.current >= 2) {
        speak(
          `You've already completed the Pre-Test! Your diagnostic choices for ${mode === 'tools' ? 'equipment' : 'ingredients'} are saved in your audit record and cannot be modified.`,
          'thinking',
          {
            badge: 'Pre-Test Completed',
            note: 'Inspection answers are locked to preserve your pre-test diagnostic assessment.',
            hint: 'Use the buttons at the bottom to navigate between items or proceed to the missions!',
          }
        );
        setIsDialogueCollapsed(false);
        lockedClicksRef.current = 0;
      }
      return;
    }
    if (!currentItem || answersRef.current[currentItem.id]) return;

    if (card.isCorrect) {
      soundManager.playSuccess();
    } else {
      soundManager.playError();
    }

    speak(
      card.isCorrect
        ? `Correct! ${card.name} is the requested ${currentItem.name.toLowerCase()}.`
        : `That is ${card.name}, but it is not the requested ${currentItem.name.toLowerCase()}. The requested item is ${currentItem.correctOption.name}.`,
      card.isCorrect ? 'happy' : 'thinking',
      {
        badge: card.isCorrect ? 'Correct Choice' : 'Check the Target',
        note: card.isCorrect ? card.reason : `Requested item: ${currentItem.correctOption.name}.`,
        hint: 'Your first answer has been recorded and cannot be changed. Review the feedback, then continue.',
      }
    );

    const answerObj = {
      id: currentItem.id,
      name: currentItem.name,
      toolType: currentItem.toolType || currentItem.category,
      chosen: card,
      isCorrect: card.isCorrect,
      // Preserve the existing assessment field for compatibility with current state consumers.
      isSafe: card.isCorrect,
      selectedSide: card.side,
      optionLabel: card.optionLabel,
      correctOption: currentItem.correctOption,
      // Keep the old field as a compatibility alias for existing assessment records.
      safeOption: currentItem.correctOption,
      distractorOptions: currentItem.distractors,
    };
    const updatedAnswers = {
      ...answersRef.current,
      [currentItem.id]: answerObj,
    };

    answersRef.current = updatedAnswers;
    setAnswers(updatedAnswers);
    if (onAnswersChange) {
      onAnswersChange(Object.values(updatedAnswers));
    }
  };

  const handleNextItem = () => {
    if (!isLocked && (!currentAnswer || (isLastItem && answeredCount !== items.length))) return;
    soundManager.playClick();
    if (isLastItem) {
      if (onComplete) {
        onComplete(Object.values(answers));
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevItem = () => {
    if (currentIndex > 0) {
      soundManager.playClick();
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="inspection-minigame-container">
      <div className="vessel-header">
        <span className="vessel-title">{title}</span>
        <span className="vessel-badge">
          {isLocked ? '🔒 Completed (Review)' : `Item ${currentIndex + 1} of ${items.length}`}
        </span>
      </div>
      <div className="vessel-header-divider" />

      {/* Progress & Item Quick-Selector Bar */}
      <div className="inspection-header-row">
        <div className="inspection-title-box">
          <h3 className="item-target-title">Target: Choose the {targetTypeLabel}</h3>
        </div>
        <div className="inspection-counter">
          Answered: {answeredCount} / {items.length}
        </div>
      </div>

      <p className="inspection-prompt">
        {isAnswerLocked
          ? 'Your answer is locked. Review your selection below, then continue.'
          : 'Choose carefully: your first answer is final. Click Option A, B, or C to identify the requested item:'}
      </p>

      {/* Comparison Grid */}
      <div className="inspection-cards-grid">
        {currentPair.map((card, idx) => {
          // Display positions can change when the activity is revisited.
          const isSelected = currentAnswer?.chosen?.id
            ? currentAnswer.chosen.id === card.id
            : currentAnswer?.selectedSide === card.side;
          const isCorrect = card.isCorrect;

          let cardClass = 'inspection-card';
          if (isSelected) {
            cardClass += isCorrect ? ' selected card-safe' : ' selected card-hazard';
          } else if (currentAnswer) {
            // Keep the correct option visible as the reference after a selection.
            cardClass += isCorrect ? ' card-safe-reference' : ' choice-dimmed';
          }

          if (isAnswerLocked) cardClass += ' is-locked-view';

          return (
            <div
              key={idx}
              className={cardClass}
              onClick={() => handleCardClick(card)}
              role="button"
              tabIndex={isAnswerLocked ? -1 : 0}
              aria-disabled={isAnswerLocked}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(card);
                }
              }}
              style={{ cursor: isAnswerLocked ? 'default' : 'pointer' }}
            >
              <div className="card-badge-tag">{card.optionLabel}</div>
              <div className="card-img-wrapper">
                <img
                  src={card.img}
                  alt={card.name}
                  className="inspection-card-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
                <div className="card-fallback-icon" style={{ display: 'none' }}>
                  <span className="emoji">{card.fallbackIcon || '🔍'}</span>
                </div>
              </div>

              <div className="card-info">
                <h4 className="card-title">{card.name}</h4>
                <p className="card-desc">{card.description}</p>
              </div>

              <div className={`card-verdict-banner ${
                isSelected
                  ? isCorrect
                    ? 'selected-banner banner-safe'
                    : 'selected-banner banner-hazard'
                  : currentAnswer && isCorrect
                  ? 'select-prompt reference-safe'
                  : 'select-prompt'
              }`}>
                <span>
                  {isSelected
                    ? isCorrect
                      ? '✓ Correct Target'
                      : '⚠️ Not the Requested Item'
                    : currentAnswer && isCorrect
                    ? '✓ Correct Target'
                    : isAnswerLocked
                    ? 'Answer Locked'
                    : '👆 Click to Select & Check'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instant Instructional Feedback Lesson Box */}
      {currentAnswer && (
        <div
          className={`inspection-feedback-box ${(currentAnswer.isCorrect ?? currentAnswer.isSafe) ? 'safe' : 'hazard'}`}
          style={{ marginTop: '12px' }}
        >
          <div style={{ fontSize: '1.4rem', flexShrink: 0 }}>
            {(currentAnswer.isCorrect ?? currentAnswer.isSafe) ? '✅' : '🔎'}
          </div>
          <div style={{ flex: 1 }}>
            <strong style={{ display: 'block', fontSize: '0.92rem', marginBottom: '4px', fontWeight: 800 }}>
              {(currentAnswer.isCorrect ?? currentAnswer.isSafe)
                ? `✓ Correct ${currentItem.name} Selected`
                : `🔎 Compare the ${currentItem.name} Options`}
            </strong>
            <p style={{ margin: '0 0 6px', fontSize: '0.86rem', lineHeight: 1.4 }}>
              {currentAnswer.chosen.reason}
            </p>
            {!(currentAnswer.isCorrect ?? currentAnswer.isSafe) && (currentAnswer.correctOption || currentAnswer.safeOption) && (
              <div style={{ fontSize: '0.82rem', background: '#ffffff', padding: '6px 10px', borderRadius: '8px', border: '1px solid #86efac', color: '#15803d' }}>
                <strong>Requested item:</strong> {(currentAnswer.correctOption || currentAnswer.safeOption).name}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Row */}
      <div
        className="inspection-actions-row"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '14px',
          marginBottom: '8px',
          paddingBottom: 'max(24px, calc(16px + env(safe-area-inset-bottom, 0px)))',
        }}
      >
        <button
          className="btn-secondary"
          onClick={handlePrevItem}
          disabled={currentIndex === 0}
          style={{ opacity: currentIndex === 0 ? 0.4 : 1, cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', padding: '10px 18px' }}
        >
          <span>◀ Previous Item</span>
        </button>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn-primary btn-gold btn-next-inspection"
            onClick={handleNextItem}
            disabled={!isLocked && (!currentAnswer || (isLastItem && answeredCount !== items.length))}
            style={{ opacity: !isLocked && (!currentAnswer || (isLastItem && answeredCount !== items.length)) ? 0.6 : 1 }}
          >
            <span>
              {isLastItem
                ? mode === 'tools'
                  ? 'Proceed to Ingredient Inspection ➔'
                  : 'Finish Pre-Test & Enter Laboratory ➔'
                : `Next Item (${currentIndex + 2} of ${items.length}) ▶`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
