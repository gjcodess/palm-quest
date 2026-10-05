import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';

const AVATARS = {
  neutral: '/assets/teacher_mia_neutral.webp',
  happy: '/assets/teacher_mia_happy.webp',
  thinking: '/assets/teacher_mia_thinking.webp',
  sad: '/assets/teacher_mia_sad.webp',
};

export const DialogueBox = () => {
  const { dialogue, scene, isDialogueCollapsed, setIsDialogueCollapsed, effectiveZoom } = useGame();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const timerRef = useRef(null);
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);
  const lastReadTextRef = useRef('');

  const finishTyping = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setDisplayedText(dialogue.text || '');
    setIsTyping(false);
  };

  // When new dialogue text arrives, trigger unread indicator only if dialogue is collapsed
  useEffect(() => {
    if (dialogue.text) {
      if (dialogue.text !== lastReadTextRef.current) {
        if (isDialogueCollapsed) {
          setHasUnread(true);
        } else {
          lastReadTextRef.current = dialogue.text;
          setHasUnread(false);
        }
      }
    }
  }, [dialogue.text, isDialogueCollapsed]);

  // Click outside to auto-collapse
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isDialogueCollapsed) return;

      const isInsidePopover = popoverRef.current && popoverRef.current.contains(e.target);
      const isInsideButton = buttonRef.current && buttonRef.current.contains(e.target);

      if (!isInsidePopover && !isInsideButton) {
        setIsDialogueCollapsed(true);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isDialogueCollapsed) {
        setIsDialogueCollapsed(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDialogueCollapsed, setIsDialogueCollapsed]);

  // Typing effect when dialogue text changes
  useEffect(() => {
    if (!dialogue.visible || !dialogue.text) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    let i = 0;
    const fullText = dialogue.text;
    setDisplayedText('');
    setIsTyping(true);

    timerRef.current = setInterval(() => {
      if (i < fullText.length) {
        setDisplayedText(fullText.slice(0, i + 1));
        i++;
      } else {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsTyping(false);
      }
    }, 12);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [dialogue.text, dialogue.visible]);

  if (!dialogue.visible || scene === 'title') return null;

  const avatarSrc = AVATARS[dialogue.avatar] || AVATARS.neutral;

  const handleToggleOpen = (e) => {
    e.stopPropagation();
    soundManager.playClick();
    const willOpen = isDialogueCollapsed;
    setIsDialogueCollapsed(!willOpen);
    if (willOpen) {
      lastReadTextRef.current = dialogue.text || '';
      setHasUnread(false);
    }
  };

  const handleNextClick = (e) => {
    e.stopPropagation();
    finishTyping();
    soundManager.playClick();
    if (typeof dialogue.onNext === 'function') {
      dialogue.onNext();
    } else {
      setIsDialogueCollapsed(true);
    }
  };

  const handleBoxClick = () => {
    if (isTyping) {
      finishTyping();
    }
  };

  return (
    <div
      className="floating-companion-wrapper"
      style={{
        zoom: effectiveZoom,
      }}
    >
      {/* 1. Floating Circular Avatar Trigger (Bottom Left) */}
      <button
        ref={buttonRef}
        type="button"
        className={`floating-companion-btn ${!isDialogueCollapsed ? 'active-open' : ''} ${hasUnread ? 'has-unread' : ''}`}
        onClick={handleToggleOpen}
        title={
          hasUnread
            ? "Teacher Mia has guidance for you! (Click to open)"
            : isDialogueCollapsed
            ? "Teacher Mia's Guide (Click to open)"
            : "Close Guide"
        }
        aria-label="Toggle Teacher Mia Guidance"
      >
        <div className="companion-avatar-frame">
          <img src={avatarSrc} alt="Teacher Mia" className="companion-avatar-img" />
          <span className={`companion-mood-indicator ${dialogue.avatar || 'neutral'}`} />
        </div>

        {/* Pulse / Tip Indicator Bubble: ONLY visible when there is an unread message */}
        {hasUnread && isDialogueCollapsed && (
          <div className="companion-notification-bubble" title="New guidance from Teacher Mia">
            <span className="bubble-icon">💡</span>
          </div>
        )}

        {/* Hover / Hint Tooltip */}
        <span className="companion-tooltip-tag">
          {hasUnread ? '💡 New Guidance!' : 'Teacher Mia'}
        </span>
      </button>

      {/* 2. Expanded Floating Dialogue Popover Card */}
      <aside
        ref={popoverRef}
        className={`companion-popover-card ${isDialogueCollapsed ? 'is-closed' : 'is-open'} ${isTyping ? 'is-typing' : ''}`}
        onClick={handleBoxClick}
        title={isTyping ? 'Click to reveal full text instantly' : undefined}
        role="dialog"
        aria-hidden={isDialogueCollapsed}
        aria-label="Teacher Mia Guidance"
      >
        {/* Card Top Header */}
        <div className="companion-card-header">
          <div className="companion-header-identity">
            <div className="companion-mini-avatar">
              <img src={avatarSrc} alt="Teacher Mia" />
            </div>
            <div className="companion-name-stack">
              <span className="companion-mentor-name">Teacher Mia</span>
              <span className="companion-mentor-role">Food Science Mentor</span>
            </div>
          </div>

          <div className="companion-header-actions">
            {dialogue.badge && (
              <span className="companion-stage-badge">{dialogue.badge}</span>
            )}
            <button
              type="button"
              className="companion-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playClick();
                setIsDialogueCollapsed(true);
              }}
              title="Close Guide (Esc)"
              aria-label="Close Guide"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Speech Bubble Content */}
        <div className="companion-speech-content">
          <p className="companion-dialogue-text">
            {displayedText}
            {isTyping && <span className="dialogue-typing-cursor">▌</span>}
          </p>
        </div>

        {/* Notes & Hints Callouts */}
        {(dialogue.note || dialogue.hint) && (
          <div className="companion-callouts-box">
            {dialogue.note && (
              <div className="companion-note-item">
                <span className="callout-icon">📝</span>
                <div className="callout-text">
                  <strong>{dialogue.noteTitle || 'Standard Note'}:</strong> {dialogue.note}
                </div>
              </div>
            )}
            {dialogue.hint && (
              <div className="companion-hint-item">
                <span className="callout-icon">💡</span>
                <div className="callout-text">
                  <strong>Lab Hint:</strong> {dialogue.hint}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action / Next Stage Button */}
        {!dialogue.hideButton && Boolean(dialogue.btnText) && (
          <div className="companion-card-footer">
            <button
              type="button"
              className="btn-primary companion-action-btn"
              onClick={handleNextClick}
            >
              <span>{dialogue.btnText}</span>
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};
