import React, { useState } from 'react';
import { soundManager } from '../audio/soundManager';

/**
 * StoveBurnerConsole: Interactive rotary knob & stove control console
 * Features authentic brushed stainless baseplate and rotatable rotor knob (0deg OFF -> 90deg HIGH).
 */
export const StoveBurnerConsole = ({
  isReady = false,
  isIgnited = false,
  isActive = false,
  isComplete = false,
  progress = 0,
  onIgnite,
  onLockedClick,
  disabled = false,
  standbyHint = 'Add ubod, water & salt first',
  readyHint = '👉 Click dial to turn to HIGH',
  activeHint = null,
  completeHint = '✓ Thermal softening complete',
  modeTitleStandby = 'BURNER: STANDBY',
  modeTitleReady = 'CLICK TO IGNITE',
  modeTitleIgnited = 'FLAME ON • 100°C HIGH',
  modeTitleActive = null,
  modeTitleComplete = 'BURNER: OFF',
  title = null,
  actionButton = null,
}) => {
  const [isWiggling, setIsWiggling] = useState(false);
  const burning = isIgnited || isActive;
  const activeTitle = modeTitleActive || modeTitleIgnited;

  const handleClick = (e) => {
    e.stopPropagation();

    if (disabled || isComplete) return;

    if (burning) {
      // Already actively boiling/steaming/heating
      return;
    }

    if (!isReady) {
      soundManager.playError();
      setIsWiggling(true);
      setTimeout(() => setIsWiggling(false), 450);
      if (onLockedClick) {
        onLockedClick();
      }
      return;
    }

    // Trigger gas ignition spark and flame whoosh
    soundManager.playIgnite();
    if (onIgnite) {
      onIgnite();
    }
  };

  const defaultTitle = burning
    ? 'Burner Active at HIGH'
    : isReady
    ? 'Click knob to turn to HIGH and ignite burner'
    : isComplete
    ? 'Burner Extinguished'
    : `Stove Burner Control (${standbyHint})`;

  return (
    <div
      className={`stove-burner-console ${
        isReady && !burning ? 'ready-to-ignite' : ''
      } ${burning ? 'flame-active' : ''} ${isWiggling ? 'knob-shake' : ''} ${
        disabled ? 'disabled' : ''
      } ${actionButton ? 'has-extra-action' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title={title || defaultTitle}
    >
      <div className="knob-assembly">
        {/* Stationary baseplate with OFF red tick at 12 o'clock and -HIGH at 3 o'clock */}
        <img
          src="/assets/stove_knob_base.webp"
          alt="Knob Baseplate"
          className="knob-base-img"
        />
        {/* Rotary dial turning from 0deg (OFF) to 90deg (HIGH) */}
        <img
          src="/assets/stove_knob_rotor.webp"
          alt="Knob Rotor"
          className={`knob-rotor-img ${
            burning ? 'turned-high' : 'turned-off'
          }`}
        />
        {/* Glowing invite beacon rings when ready to turn */}
        {isReady && !burning && (
          <>
            <span className="knob-beacon-ring r1" />
            <span className="knob-beacon-ring r2" />
          </>
        )}
      </div>

      <div className="burner-panel-text">
        <div className="burner-badge-row">
          <span
            className={`burner-led ${
              burning ? 'burning' : isReady ? 'blinking' : 'cold'
            }`}
          />
          <span className="burner-mode-title">
            {burning
              ? activeTitle
              : isReady
              ? modeTitleReady
              : isComplete
              ? modeTitleComplete
              : modeTitleStandby}
          </span>
        </div>

        <div className="burner-sub-row">
          {burning ? (
            <div className="burner-progress-container">
              <span className="burner-action-hint flame-text">
                {typeof activeHint === 'function'
                  ? activeHint(Math.round(progress))
                  : activeHint
                  ? `${activeHint} ${Math.round(progress)}%`
                  : `🔥 Heating... ${Math.round(progress)}%`}
              </span>
              <div className="burner-progress-track">
                <div
                  className="burner-progress-fill"
                  style={{ width: `${Math.min(100, Math.max(0, Math.round(progress)))}%` }}
                />
              </div>
            </div>
          ) : isReady ? (
            <span className="burner-action-hint ready-text">
              {readyHint}
            </span>
          ) : isComplete ? (
            <span className="burner-action-hint">{completeHint}</span>
          ) : (
            <span className="burner-action-hint">{standbyHint}</span>
          )}
        </div>
      </div>

      {actionButton && (
        <div className="burner-extra-action" style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <button
            type="button"
            className={`btn-workstation-action ${actionButton.className || ''} ${actionButton.disabled ? 'disabled' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!actionButton.disabled && actionButton.onClick) {
                actionButton.onClick();
              }
            }}
            disabled={actionButton.disabled}
            title={actionButton.title || actionButton.label}
            style={{
              padding: '8px 14px',
              fontSize: '0.82rem',
              borderRadius: '10px',
              gap: '6px',
            }}
          >
            {actionButton.icon && <span className="action-icon">{actionButton.icon}</span>}
            <span className="action-label">{actionButton.label}</span>
          </button>
        </div>
      )}
    </div>
  );
};
