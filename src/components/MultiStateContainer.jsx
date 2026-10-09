import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';

/**
 * MultiStateContainer: High-fidelity interactive workstation container
 * Supports 1-by-1 tap-and-drop mechanics where each accepted ingredient
 * seamlessly updates the visual container state.
 */
export const MultiStateContainer = ({
  containerId,
  title,
  subtitle,
  currentStepIndex = 0,
  steps = [],
  onItemAccepted,
  onWrongItem,
  activeAnimation = null, // 'boiling' | 'steaming' | 'sizzling' | 'blending' | null
  interactiveAction = null, // { label: string, onClick: func, icon?: string, disabled?: boolean }
  customFooter = null,
  specBadge = null,
  stepNumber = null,
  stepTotal = null,
  statusDotClass = '',
  statusText = null,
  className = '',
  containerWidth = '100%',
  containerHeight = 'auto',
  children = null,
}) => {
  const { holdingItem, setHoldingItem, showToast, recordMistake } = useGame();
  const [isDragOver, setIsDragOver] = useState(false);
  const [shake, setShake] = useState(false);
  const [justAccepted, setJustAccepted] = useState(false);
  const shakeTimeoutRef = React.useRef(null);

  const currentStep = steps[currentStepIndex] || steps[steps.length - 1] || {};
  const acceptedIds = currentStep.acceptedItems || [];

  const triggerErrorFeedback = (droppedItem) => {
    soundManager.playError();
    recordMistake();

    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }

    setShake(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setShake(true);
        shakeTimeoutRef.current = setTimeout(() => {
          setShake(false);
        }, 450);
      });
    });
    
    if (onWrongItem) {
      onWrongItem(droppedItem);
    } else {
      showToast('Incorrect Order', `This item cannot be added right now. Check Teacher Mia's instructions!`, 'danger');
    }
  };

  const handleSuccessfulDrop = (item) => {
    soundManager.playSuccess();
    setJustAccepted(true);
    setTimeout(() => setJustAccepted(false), 600);
    setHoldingItem(null);

    if (onItemAccepted) {
      onItemAccepted(item, currentStepIndex);
    }
  };

  // HTML5 Drag handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = e.dataTransfer.getData('text/plain');
      if (!data) return;
      const parsedItem = JSON.parse(data);

      if (acceptedIds.includes(parsedItem.id)) {
        handleSuccessfulDrop(parsedItem);
      } else {
        triggerErrorFeedback(parsedItem);
      }
    } catch (err) {
      console.error('Failed to parse dropped item', err);
    }
  };

  // Tap-to-Place click handler (when holdingItem is active in GameContext)
  const handleContainerClick = () => {
    if (holdingItem) {
      if (acceptedIds.includes(holdingItem.id)) {
        handleSuccessfulDrop(holdingItem);
      } else {
        triggerErrorFeedback(holdingItem);
      }
      return;
    }

    if (interactiveAction && typeof interactiveAction.onClick === 'function' && !interactiveAction.disabled && !interactiveAction.isLocked) {
      interactiveAction.onClick();
    }
  };

  const isCompatibleHolding = holdingItem && acceptedIds.includes(holdingItem.id);

  return (
    <div
      className={`multi-state-workstation ${className} ${shake ? 'error-shake' : ''} ${isDragOver ? 'drag-hover' : ''} ${isCompatibleHolding ? 'compatible-target' : ''} ${justAccepted ? 'item-added-burst' : ''}`}
      style={{ width: containerWidth && containerWidth !== '520px' ? containerWidth : '100%' }}
      onClick={handleContainerClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header Bar */}
      <div className="workstation-header">
        <div className="workstation-titles">
          <h4 className="workstation-name">{title}</h4>
          {subtitle && <span className="workstation-sub">{subtitle}</span>}
        </div>
        <div
          className={`workstation-step-badge ${
            currentStepIndex >= steps.length - 1
              ? 'badge-success-glow'
              : currentStepIndex > 0
              ? 'badge-amber-glow'
              : ''
          }`}
        >
          Step {stepNumber ?? Math.min(currentStepIndex + 1, steps.length)} of {stepTotal ?? steps.length}
        </div>
      </div>

      {/* Main Container Viewport */}
      <div
        className={`workstation-viewport ${activeAnimation ? `viewport-anim-${activeAnimation}` : ''}`}
        style={containerHeight && containerHeight !== 'auto' && containerHeight !== '330px' ? { minHeight: containerHeight } : {}}
      >
        {/* Animated Visual Effects Overlay */}
        {activeAnimation === 'boiling' && (
          <div className="fx-overlay boiling-fx">
            <span className="bubble b1" />
            <span className="bubble b2" />
            <span className="bubble b3" />
            <span className="steam-line s1" />
            <span className="steam-line s2" />
          </div>
        )}

        {activeAnimation === 'steaming' && (
          <div className="fx-overlay steaming-fx">
            <div className="steam-puff p1">♨️</div>
            <div className="steam-puff p2">♨️</div>
            <div className="steam-puff p3">♨️</div>
          </div>
        )}

        {activeAnimation === 'sizzling' && (
          <div className="fx-overlay sizzling-fx">
            <div className="sparkle sp1">✨</div>
            <div className="sparkle sp2">✨</div>
            <div className="sparkle sp3">✨</div>
            <div className="oil-shimmer" />
          </div>
        )}

        {activeAnimation === 'mixing' && (
          <div className="fx-overlay mixing-fx">
            <div className="mixing-whirl whirl-1" />
            <div className="mixing-whirl whirl-2" />
            <div className="knead-puff kp-1">💨</div>
            <div className="knead-puff kp-2">✨</div>
          </div>
        )}

        {activeAnimation === 'convection' && (
          <div className="fx-overlay convection-fx">
            <div className="air-flow af-1">💨</div>
            <div className="air-flow af-2">💨</div>
            <div className="air-flow af-3">💨</div>
            <div className="heat-shimmer-line hl-1" />
            <div className="heat-shimmer-line hl-2" />
          </div>
        )}

        {/* Primary Asset Image / Visual State */}
        <div className="container-visual-wrapper">
          {currentStep.img ? (
            <img
              src={currentStep.img}
              alt={currentStep.label || title}
              className={`container-state-img ${activeAnimation ? `anim-${activeAnimation}` : ''}`}
              style={{
                opacity: currentStep.imgOpacity !== undefined ? currentStep.imgOpacity : 1,
                ...(currentStep.imgStyle || {}),
              }}
              onError={(e) => {
                // Graceful fallback to CSS icon if image asset is not yet created
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}

          {/* Clean SVG/CSS Fallback representation */}
          <div
            className="container-fallback-icon"
            style={{ display: currentStep.img ? 'none' : 'flex' }}
          >
            <span className="fallback-emoji">{currentStep.fallbackIcon || '🥣'}</span>
            <span className="fallback-label">{currentStep.label || 'Workstation Container'}</span>
          </div>
        </div>

        {/* Target Dropzone Hint Overlay */}
        {isCompatibleHolding && (
          <div className="dropzone-guide-pill">
            <span>Tap or Drop {holdingItem.name} here!</span>
          </div>
        )}

        {/* Custom Station Overlays (e.g. Interlock status, badges, guides) */}
        {children}
      </div>

      {/* Footer / Status / Action */}
      <div className={`workstation-footer ${customFooter ? 'has-custom-footer' : ''}`}>
        {customFooter ? (
          customFooter
        ) : (
          <>
            <div className="workstation-status">
              <span className={`status-dot ${statusDotClass}`} />
              <span className="status-text">{statusText || currentStep.prompt || currentStep.label || 'Ready'}</span>
            </div>

            {interactiveAction && (() => {
              if (typeof interactiveAction.render === 'function') {
                return interactiveAction.render();
              }
              let icon = interactiveAction.icon;
              let label = interactiveAction.label || '';
              if (icon && label.startsWith(icon)) {
                label = label.slice(icon.length).trim();
              } else if (!icon) {
                const emojiMatch = label.match(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation})\s*/u);
                if (emojiMatch) {
                  icon = emojiMatch[1];
                  label = label.slice(emojiMatch[0].length);
                }
              }

              // Special retro food processor switch variant matching Sanyo machine
              if (interactiveAction.variant === 'processor-pulse') {
                return (
                  <button
                    className={`btn-processor-pulse ${interactiveAction.disabled ? 'disabled' : ''} ${interactiveAction.isActive ? 'is-active-puree' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!interactiveAction.disabled && interactiveAction.onClick) {
                        interactiveAction.onClick();
                      }
                    }}
                    disabled={interactiveAction.disabled}
                    title="HIGH / PULSE (Push to Puree)"
                  >
                    {icon && <span className="action-icon">{icon}</span>}
                    <span className="action-label">{label}</span>
                  </button>
                );
              }

              // Special safety interlock button variant
              if (interactiveAction.variant === 'interlock-lock') {
                return (
                  <button
                    className={`btn-interlock-lock ${interactiveAction.disabled ? 'disabled' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!interactiveAction.disabled && interactiveAction.onClick) {
                        interactiveAction.onClick();
                      }
                    }}
                    disabled={interactiveAction.disabled}
                    title="Twist & lock safety lid to engage motor interlock"
                  >
                    <span className="interlock-pip-indicator" />
                    {icon && <span className="action-icon">{icon}</span>}
                    <span className="action-label">{label}</span>
                  </button>
                );
              }

              const customClass = interactiveAction.className || interactiveAction.variant || '';

              return (
                <button
                  className={`btn-workstation-action ${customClass} ${interactiveAction.disabled ? 'disabled' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!interactiveAction.disabled && interactiveAction.onClick) {
                      interactiveAction.onClick();
                    }
                  }}
                  disabled={interactiveAction.disabled}
                >
                  {icon && <span className="action-icon">{icon}</span>}
                  <span className="action-label">{label}</span>
                </button>
              );
            })()}

            {specBadge && !interactiveAction && (
              typeof specBadge === 'string' ? (
                <span className="spec-badge">{specBadge}</span>
              ) : (
                specBadge
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};
