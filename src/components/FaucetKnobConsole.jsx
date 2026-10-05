import React, { useState } from 'react';
import { soundManager } from '../audio/soundManager';

/**
 * FaucetKnobConsole: Interactive water tap rotary knob for the Washing Station
 * Features authentic 4-arm chrome cross valve handle with rotatable indicator dial (0deg OFF -> 90deg FLOW).
 */
export const FaucetKnobConsole = ({
  isReady = true,
  isUbodLoaded = true,
  isFlowing = false,
  isComplete = false,
  potStep = 0,
  onTurnOn,
  disabled = false,
  isCoolingRinsePhase = false,
  isCoolingRinseReady = false,
  isCoolingRinseFlowing = false,
  isCoolingRinseComplete = false,
  onTurnOnCoolingRinse,
}) => {
  const [isWiggling, setIsWiggling] = useState(false);

  const isPostBoil = potStep >= 5 || isCoolingRinsePhase;

  const handleClick = (e) => {
    e.stopPropagation();

    if (disabled) return;

    // Post-Boil Cooling Rinse Handling
    if (isPostBoil) {
      if (isCoolingRinseFlowing) return;
      if (isCoolingRinseComplete) {
        soundManager.playClick();
        return;
      }
      if (isCoolingRinseReady) {
        if (onTurnOnCoolingRinse) {
          onTurnOnCoolingRinse();
        }
        return;
      }
      soundManager.playError();
      setIsWiggling(true);
      setTimeout(() => setIsWiggling(false), 450);
      return;
    }

    // Initial Pre-Boil Raw Ubod Wash Handling
    if (isFlowing) return;

    if (isComplete) {
      soundManager.playClick();
      return;
    }

    if (!isUbodLoaded) {
      soundManager.playError();
      setIsWiggling(true);
      setTimeout(() => setIsWiggling(false), 450);
      return;
    }

    if (!isReady) {
      soundManager.playError();
      setIsWiggling(true);
      setTimeout(() => setIsWiggling(false), 450);
      return;
    }

    // Trigger faucet wash sequence!
    if (onTurnOn) {
      onTurnOn();
    }
  };

  const isSanitizedWaitingPick = !isPostBoil && isComplete && potStep === 0;
  const isAnyFlowing = isFlowing || isCoolingRinseFlowing;
  const isKnobReady =
    (!isPostBoil && isReady && isUbodLoaded && !isFlowing && !isComplete) ||
    (isPostBoil && isCoolingRinseReady && !isCoolingRinseFlowing && !isCoolingRinseComplete);

  return (
    <div
      className={`faucet-knob-console ${
        isKnobReady ? 'ready-to-wash' : ''
      } ${isAnyFlowing ? 'flow-active' : ''} ${
        isSanitizedWaitingPick || (isPostBoil && isCoolingRinseComplete) ? 'sanitized-active' : ''
      } ${isWiggling ? 'knob-shake' : ''} ${
        disabled || (!isPostBoil && !isUbodLoaded) ? 'disabled' : ''
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title={
        isAnyFlowing
          ? 'Faucet Running (Potable Tap Water)'
          : isPostBoil
          ? !isCoolingRinseComplete
            ? 'Click cross handle to rinse residue & cool boiled ubod'
            : 'Boiled ubod washed clean & cooled down'
          : !isUbodLoaded
          ? 'Place fresh cut raw ubod in colander first'
          : !isComplete
          ? 'Click cross handle to turn 90° to -FLOW and rinse ubod'
          : isSanitizedWaitingPick
          ? 'Ubod is Sanitized! Pick up Washed Ubod from inventory'
          : 'Faucet Closed (Standby)'
      }
    >
      <div className="knob-assembly faucet-knob-assembly">
        {/* Stationary baseplate with OFF tick at 12 o'clock and -FLOW at 3 o'clock */}
        <img
          src="/assets/faucet_knob_base.webp"
          alt="Faucet Escutcheon Baseplate"
          className="knob-base-img"
        />
        {/* 4-Arm Chrome Cross Valve Dial turning from 0deg (OFF) to 90deg (FLOW) */}
        <img
          src="/assets/faucet_knob_rotor.webp"
          alt="Chrome Cross Valve Handle"
          className={`knob-rotor-img ${
            isAnyFlowing ? 'turned-high' : 'turned-off'
          }`}
        />
        {/* Glowing water beacon rings when ready to turn */}
        {isKnobReady && (
          <>
            <span className="faucet-beacon-ring r1" />
            <span className="faucet-beacon-ring r2" />
          </>
        )}
      </div>

      <div className="burner-panel-text faucet-panel-text">
        <div className="burner-badge-row">
          <span
            className={`burner-led ${
              isAnyFlowing
                ? 'flowing'
                : isSanitizedWaitingPick || (isPostBoil && isCoolingRinseComplete)
                ? 'sanitized-led'
                : isKnobReady
                ? 'blinking-water'
                : 'cold'
            }`}
          />
          <span className="burner-mode-title faucet-title">
            {isAnyFlowing
              ? isPostBoil
                ? '💧 FAUCET: COOLING RINSE'
                : '💧 FAUCET: RUNNING'
              : isPostBoil
              ? isCoolingRinseComplete
                ? '✅ COOLED & DRAINED READY'
                : '💧 6. TURN FAUCET TO COOL'
              : isSanitizedWaitingPick
              ? '✅ SANITIZED & CLEAN'
              : !isUbodLoaded
              ? '1. PLACE UBOD IN SINK'
              : !isComplete
              ? '2. CLICK CROSS TO RINSE'
              : 'FAUCET: STANDBY'}
          </span>
        </div>

        <div className="burner-sub-row">
          {isAnyFlowing ? (
            <span className="faucet-action-hint flowing-text">
              {isPostBoil
                ? '🌊 Washing residue & cooling boiled ubod...'
                : '🌊 Rinsing raw ubod under running faucet...'}
            </span>
          ) : isPostBoil ? (
            isCoolingRinseComplete ? (
              <span className="faucet-action-hint sanitized-text">
                ✓ Residue removed & drained for Stage 2
              </span>
            ) : (
              <span className="faucet-action-hint ready-water-text">
                👉 Click cross handle to wash & cool boiled ubod
              </span>
            )
          ) : isSanitizedWaitingPick ? (
            <span className="faucet-action-hint sanitized-text">
              👉 Pick up Washed Ubod from inventory
            </span>
          ) : !isUbodLoaded ? (
            <span className="faucet-action-hint standby-text">
              👉 Drop Raw Ubod into empty colander
            </span>
          ) : !isComplete ? (
            <span className="faucet-action-hint ready-water-text">
              👉 Turn cross handle 90° to -FLOW
            </span>
          ) : (
            <span className="faucet-action-hint complete-water-text">
              ✓ Ready for cooling boiled ubod
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
