import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../audio/soundManager';

const ASSETS_TO_PRELOAD = [
  '/assets/he_lab_workstation.webp',
  '/assets/bg_stage1_prep.webp',
  '/assets/bg_stage2_boiling.webp',
  '/assets/bg_stage3_formulation.webp',
  '/assets/bg_stage4_dehydration.webp',
  '/assets/bg_stage5_frying.webp',
  '/assets/bg_evaluation_hall.webp',
  '/assets/teacher_mia_neutral.webp',
  '/assets/teacher_mia_happy.webp',
  '/assets/teacher_mia_thinking.webp',
  '/assets/icon_coconut_palm.webp',
  '/assets/icon_fresh_ubod.webp',
  '/assets/icon_ubod_puree.webp',
  '/assets/colander_ubod_only.webp',
  '/assets/icon_puffed_crackers.webp',
  '/assets/platter_crackers_cooled.webp',
  '/assets/pouch_sealed_labeled.webp',
  '/assets/box_of_packaged_crackers.webp',
  '/assets/icon_puffed_crackers.webp',
  '/assets/platter_crackers_cooled.webp',
  '/assets/icon_gold_medal_front.webp',
  '/assets/card_step_boiling.webp',
  '/assets/card_step_grinding.webp',
  '/assets/card_step_mixing.webp',
  '/assets/card_step_molding.webp',
  '/assets/card_step_steaming.webp',
  '/assets/card_step_dehydration.webp',
  '/assets/card_step_frying.webp',
  '/assets/card_step_packaging.webp',
  '/assets/bg_prep.webp',
  '/assets/bg_boiling.webp',
  '/assets/bg_formulation.webp',
  '/assets/bg_dehydration.webp',
  '/assets/bg_frying.webp',
  '/assets/bg_evaluation_hall.webp',
  '/assets/processor_lid.webp',
];

export const LoadingScreen = ({ onLoaded }) => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const audioUnlockedRef = useRef(false);

  useEffect(() => {
    let currentProgress = 0;
    let loadedCount = 0;
    const totalAssets = ASSETS_TO_PRELOAD.length;

    // Parallel Asset Preloading
    ASSETS_TO_PRELOAD.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = img.onerror = () => {
        loadedCount++;
      };
    });

    // Simulated organic progress timer for smooth calibration animation
    const interval = setInterval(() => {
      const increment = Math.floor(Math.random() * 5) + 3;
      currentProgress = Math.min(currentProgress + increment, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsReady(true);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  const handleEnter = () => {
    if (isFadingOut) return;
    if (!audioUnlockedRef.current) {
      try {
        soundManager.init();
        soundManager.playSuccess();
        audioUnlockedRef.current = true;
      } catch (err) {
        console.warn('Audio unlock notice', err);
      }
    }
    setIsFadingOut(true);
    setTimeout(() => {
      if (onLoaded) onLoaded();
    }, 220);
  };

  return (
    <div className={`loading-screen-backdrop ${isFadingOut ? 'fade-out' : ''}`}>
      {/* Background Animated Floating Blurred Stage Cards */}
      <div className="loading-ambient-particles">
        <img src="/assets/card_step_boiling.webp" alt="Boiling Step" className="particle-card p1" />
        <img src="/assets/card_step_grinding.webp" alt="Grinding Step" className="particle-card p2" />
        <img src="/assets/card_step_mixing.webp" alt="Mixing Step" className="particle-card p3" />
        <img src="/assets/card_step_molding.webp" alt="Molding Step" className="particle-card p4" />
        <img src="/assets/card_step_steaming.webp" alt="Steaming Step" className="particle-card p5" />
        <img src="/assets/card_step_dehydration.webp" alt="Dehydration Step" className="particle-card p6" />
        <img src="/assets/card_step_frying.webp" alt="Frying Step" className="particle-card p7" />
        <img src="/assets/card_step_packaging.webp" alt="Packaging Step" className="particle-card p8" />
        <img src="/assets/icon_fresh_ubod.webp" alt="Fresh coconut palm" className="particle-ubod p9" aria-hidden="true" />
        <img src="/assets/icon_ubod_puree.webp" alt="Coconut palm puree" className="particle-ubod p10" aria-hidden="true" />
        <img src="/assets/colander_ubod_only.webp" alt="Prepared coconut palm" className="particle-ubod p11" aria-hidden="true" />
        <img src="/assets/icon_puffed_crackers.webp" alt="Coconut palm crackers" className="particle-ubod p12" aria-hidden="true" />
      </div>

      {/* Main Minimalist Clean Loading Container */}
      <div className="title-container loading-title-container">
          <div className="title-card loading-card-minimal">
          {/* PALMQUEST Title */}
          <div className="loading-title-group">
            <h1 className="game-logo loading-game-logo">
              PALM<span>QUEST</span>
            </h1>
            <p className="game-subtitle loading-game-subtitle">
              The Coconut Palm Crackers Virtual Laboratory Challenge
            </p>
            <div className="title-divider" />
          </div>

          <div className="loading-product-feature">
            <img src="/assets/platter_crackers_cooled.webp" alt="Cooled coconut palm crackers" />
            <img src="/assets/pouch_sealed_labeled.webp" alt="Sealed labeled coconut palm crackers" />
            <img src="/assets/box_of_packaged_crackers.webp" alt="Box of packaged coconut palm crackers" />
          </div>

          {/* Loading Progress Bar */}
          <div className="loading-progress-wrapper">
            <div className="loading-progress-header">
              <span className="progress-label">Loading Simulation</span>
              <span className="progress-percent">{progress}%</span>
            </div>

            <div className="loading-progress-track">
              <div
                className="loading-progress-fill"
                style={{ width: `${progress}%` }}
              >
                <div className="progress-light-sweep" />
              </div>
            </div>
          </div>

          {/* Enter Button / Status */}
          <div className="loading-footer">
            {isReady ? (
              <button
                type="button"
                className="btn-primary btn-start btn-enter-lab-pulsing"
                onClick={handleEnter}
                disabled={isFadingOut}
                autoFocus
              >
                <span className="btn-icon">▶</span>
                <span>{isFadingOut ? 'Entering Laboratory...' : 'Enter Laboratory Activity'}</span>
              </button>
            ) : (
              <div className="loading-hint-text">
                <span className="hint-pulse-dot" />
                <span>Loading virtual laboratory assets & interactive stations...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
