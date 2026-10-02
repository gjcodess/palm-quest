import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';
import { RestartIcon, ZoomInIcon, ZoomOutIcon } from './Icons';

const STAGE_CONFIG = {
  orientation: { num: 'PRE-TEST', title: 'Orientation & Safety', step: 0 },
  mission1: { num: 'Stage 1', title: 'Washing & Boiling', step: 1 },
  mission2: { num: 'Stage 2', title: 'Pureeing & Grinding', step: 2 },
  mission3: { num: 'Stage 3', title: 'Paste Formulation', step: 3 },
  mission4: { num: 'Stage 4', title: 'Rectangular Molding', step: 4 },
  mission5: { num: 'Stage 5', title: 'Starch Steaming', step: 5 },
  mission6: { num: 'Stage 6', title: 'Cabinet Dehydration', step: 6 },
  mission7: { num: 'Stage 7', title: 'Deep Frying', step: 7 },
  mission8: { num: 'Stage 8', title: 'Packaging & Labeling', step: 8 },
  sequencing: { num: 'POST-TEST', title: 'Sequence Puzzle', step: 9 },
  evaluation: { num: 'REVIEW', title: 'Answer Key & Lessons', step: 10 },
  results: { num: 'REVIEW', title: 'Answer Key & Lessons', step: 10 },
};

const HUD_STEPS = [
  { id: 'orientation', label: 'PRE', step: 0, isText: true, title: 'Pre-Test: Orientation & Safety' },
  { id: 'mission1', label: '1', step: 1, isText: false, title: 'Stage 1: Washing & Boiling' },
  { id: 'mission2', label: '2', step: 2, isText: false, title: 'Stage 2: Pureeing & Grinding' },
  { id: 'mission3', label: '3', step: 3, isText: false, title: 'Stage 3: Paste Formulation' },
  { id: 'mission4', label: '4', step: 4, isText: false, title: 'Stage 4: Rectangular Molding' },
  { id: 'mission5', label: '5', step: 5, isText: false, title: 'Stage 5: Starch Steaming' },
  { id: 'mission6', label: '6', step: 6, isText: false, title: 'Stage 6: Cabinet Dehydration' },
  { id: 'mission7', label: '7', step: 7, isText: false, title: 'Stage 7: Deep Frying' },
  { id: 'mission8', label: '8', step: 8, isText: false, title: 'Stage 8: Packaging & Labeling' },
  { id: 'sequencing', label: 'POST', step: 9, isText: true, title: 'Post-Test: Process Sequencing' },
  { id: 'evaluation', label: 'REVIEW', step: 10, isText: true, title: 'Review: Master Answer Key & Lessons' },
];

export const HeaderHUD = () => {
  const {
    scene,
    setScene,
    studentName,
    openModal,
    isMuted,
    toggleSound,
    resetGame,
    requestConfirm,
    hideDialogue,
    restartStage,
    resetStageScore,
    maxUnlockedStage,
    missionsCompleted,
    setHoldingItem,
    showToast,
    zoomLevel,
    effectiveZoom,
    setZoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useGame();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  if (scene === 'title') return null;

  const currentStage = STAGE_CONFIG[scene] || { num: 'Lab', title: 'Activity', step: 1 };
  const isStageScene = [
    'mission1',
    'mission2',
    'mission3',
    'mission4',
    'mission5',
    'mission6',
    'mission7',
    'mission8',
  ].includes(scene);

  const handleStepClick = (stepObj) => {
    if (currentStage.step === stepObj.step) return;

    const isUnlocked =
      stepObj.step === 0 ||
      stepObj.step <= (maxUnlockedStage || 0) ||
      (stepObj.step === 10 && Boolean(missionsCompleted?.sequencing));

    if (isUnlocked) {
      soundManager.playClick();
      hideDialogue();
      setHoldingItem(null);
      setIsMenuOpen(false);
      setScene(stepObj.id);
      const targetConfig = STAGE_CONFIG[stepObj.id];
      showToast(`Navigated to ${targetConfig?.num || stepObj.label}`, targetConfig?.title || '', 'info');
    } else {
      soundManager.playError();
      showToast('Stage Locked', `Complete earlier stages first to unlock ${stepObj.label}!`, 'warning');
    }
  };

  const handleHomeClick = () => {
    setIsMenuOpen(false);
    soundManager.playClick();
    requestConfirm({
      title: 'Return to Main Menu?',
      message: 'Your progress in this session will be preserved. Would you like to return to the title screen?',
      confirmText: 'Return to Menu',
      cancelText: 'Stay in Lab',
      icon: '🏠',
      onConfirm: () => {
        hideDialogue();
        setScene('title');
      },
    });
  };

  const handleRestartClick = () => {
    setIsMenuOpen(false);
    soundManager.playClick();
    requestConfirm({
      title: `Restart ${currentStage.title}?`,
      message: `Would you like to reset your progress on this workstation? The stage will be reset to the beginning so you can try again.`,
      confirmText: 'Yes, Restart Stage',
      cancelText: 'Continue Activity',
      icon: <RestartIcon size={38} strokeWidth={2.6} className="modal-restart-icon" />,
      onConfirm: () => {
        restartStage();
      },
    });
  };

  const zoomPercent = Math.round(zoomLevel * 100);

  return (
    <header className="game-hud" style={{ zoom: effectiveZoom }}>
      {/* Left: Website Brand Logo */}
      <div className="hud-left">
        <button
          type="button"
          className="hud-brand-title"
          onClick={handleHomeClick}
          title="PalmQuest - Return to Main Menu"
          aria-label="PalmQuest Main Menu"
        >
          <span className="brand-palm">PALM</span>
          <span className="brand-quest">QUEST</span>
        </button>
      </div>

      {/* Center: Stepper (PREP, 1 to 8, EXAM, CERT) */}
      <div className="hud-stepper">
        {HUD_STEPS.map((stepObj, idx) => {
          const isCompleted = Boolean(missionsCompleted?.[stepObj.id]);
          const isActive = currentStage.step === stepObj.step;
          const isUnlocked =
            stepObj.step === 0 ||
            stepObj.step <= (maxUnlockedStage || 0) ||
            isActive ||
            (stepObj.step === 10 && Boolean(missionsCompleted?.sequencing));
          const isClickable = isUnlocked && !isActive;

          const nodeClass = `step-node ${stepObj.isText ? 'node-text' : ''} ${isCompleted && !isActive ? 'completed' : ''} ${isActive ? 'active' : ''} ${isClickable ? 'clickable' : ''} ${!isUnlocked && !isActive ? 'locked' : ''}`;
          const lineClass = `step-line ${isCompleted ? 'filled' : ''}`;

          const tooltipTitle = isActive
            ? `Current Stage: ${stepObj.title}`
            : isUnlocked
            ? `Jump to ${stepObj.label}: ${stepObj.title}`
            : `${stepObj.label} (Locked - Complete earlier stages)`;

          return (
            <React.Fragment key={stepObj.id}>
              <div
                className={nodeClass}
                data-step={stepObj.label}
                title={tooltipTitle}
                onClick={() => handleStepClick(stepObj)}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    handleStepClick(stepObj);
                  }
                }}
              >
                <span>{stepObj.label}</span>
              </div>
              {idx < HUD_STEPS.length - 1 && <div className={lineClass} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Right: Mission Pill & Menu Button Container */}
      <div className="hud-right" ref={menuRef}>
        <div
          className="mission-pill"
          title={`Current Stage: ${currentStage.num} — ${currentStage.title}`}
        >
          <span className="pill-badge">{currentStage.num}</span>
          <span className="pill-title">{currentStage.title}</span>
        </div>

        <button
          className={`hud-btn hud-btn-menu ${isMenuOpen ? 'menu-active' : ''}`}
          onClick={() => {
            soundManager.playClick();
            setIsMenuOpen(!isMenuOpen);
          }}
          title={isMenuOpen ? 'Close Menu' : 'Open Laboratory Menu & Settings'}
          aria-expanded={isMenuOpen}
        >
          <span className="icon">{isMenuOpen ? '✕' : '☰'}</span>
          <span className="label">Menu</span>
        </button>

        {/* Flyout Menu Dropdown Panel (Portal to document.body so modal remains 100% unscaled) */}
        {isMenuOpen && createPortal(
          <>
            <div
              className="hud-menu-backdrop"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="hud-menu-panel" role="dialog" aria-label="Laboratory Menu">
              {/* Menu Top Hero Header */}
              <div className="hud-menu-header">
                <div className="hud-menu-header-content">
                  <div className="hud-menu-top-badge">Virtual Laboratory Controls</div>
                  <div className="hud-menu-brand-row">
                    <h3 className="hud-menu-logo">PALM<span>QUEST</span></h3>
                    <button
                      className="hud-menu-close-btn"
                      onClick={() => setIsMenuOpen(false)}
                      title="Close Menu"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="hud-menu-stage-strip">
                    <span className="stage-strip-badge">{currentStage.num}</span>
                    <span className="stage-strip-title">{currentStage.title}</span>
                  </div>
                </div>
                <div className="hud-menu-divider" />
              </div>

              <div className="hud-menu-body">
                <nav className="hud-menu-progress" aria-label="Stage progress">
                  {HUD_STEPS.map((stepObj) => {
                    const isActive = currentStage.step === stepObj.step;
                    const isUnlocked = stepObj.step === 0 || stepObj.step <= (maxUnlockedStage || 0) || isActive ||
                      (stepObj.step === 10 && Boolean(missionsCompleted?.sequencing));
                    return (
                      <button
                        key={stepObj.id}
                        type="button"
                        className={`hud-menu-progress-step ${isActive ? 'active' : ''} ${missionsCompleted?.[stepObj.id] ? 'completed' : ''}`}
                        title={stepObj.title}
                        aria-label={stepObj.title}
                        aria-current={isActive ? 'step' : undefined}
                        disabled={!isUnlocked}
                        onClick={() => handleStepClick(stepObj)}
                      >
                        {stepObj.label}
                      </button>
                    );
                  })}
                </nav>
                {/* Full-width Mini Hero Card: Teacher Mia greeting */}
                <div className="hud-menu-hero-card">
                  <img
                    src="/images/teacher_mia_neutral.png"
                    alt="Teacher Mia"
                    className="hud-menu-avatar"
                  />
                  <div className="hud-menu-greeting">
                    <strong>{studentName || 'Food Technologist'}</strong>
                    <p>Keep following standard procedures & safe thermal handling!</p>
                  </div>
                </div>

                {/* 2-Column Grid */}
                <div className="hud-menu-grid-columns">
                  {/* Column 1: Activity & Navigation */}
                  <div className="hud-menu-col">
                    <span className="hud-menu-section-title">📋 Activity & Navigation</span>

                    {/* Primary Action: Recipe & Standards */}
                    <button
                      className="hud-menu-item-btn recipe-card-btn"
                      onClick={() => {
                        setIsMenuOpen(false);
                        soundManager.playClick();
                        openModal('recipe');
                      }}
                    >
                      <div className="menu-btn-icon-box recipe-icon-box">📖</div>
                      <div className="menu-item-text">
                        <strong>View Recipe & Standards</strong>
                        <small>1:1 Ubod-to-Rice Flour ratios & portioning</small>
                      </div>
                      <span className="menu-item-arrow">➔</span>
                    </button>

                    {/* Primary Action: Science Concepts */}
                    <button
                      className="hud-menu-item-btn recipe-card-btn"
                      onClick={() => {
                        setIsMenuOpen(false);
                        soundManager.playClick();
                        openModal('science');
                      }}
                    >
                      <div className="menu-btn-icon-box recipe-icon-box" style={{ background: '#ecfdf5', color: '#047857' }}>🔬</div>
                      <div className="menu-item-text">
                        <strong>Food Science Concepts</strong>
                        <small>Gelatinization & puffing</small>
                      </div>
                      <span className="menu-item-arrow">➔</span>
                    </button>

                    {/* Primary Action: Restart Stage */}
                    {isStageScene && (
                      <button
                        className="hud-menu-item-btn restart-card-btn"
                        onClick={handleRestartClick}
                      >
                        <div className="menu-btn-icon-box restart-icon-box">
                          <RestartIcon size={20} strokeWidth={2.5} />
                        </div>
                        <div className="menu-item-text">
                          <strong>Restart Current Stage</strong>
                          <small>Reset workstation progress for {currentStage.title}</small>
                        </div>
                        <span className="menu-item-arrow">➔</span>
                      </button>
                    )}

                    {/* Navigation: Return to Menu */}
                    <button
                      className="hud-menu-item-btn exit-card-btn"
                      onClick={handleHomeClick}
                    >
                      <div className="menu-btn-icon-box exit-icon-box">🏠</div>
                      <div className="menu-item-text">
                        <strong>Exit to Title Screen</strong>
                        <small>Save progress & return to main menu</small>
                      </div>
                      <span className="menu-item-arrow">➔</span>
                    </button>
                  </div>

                  {/* Column 2: Audio & Display Settings */}
                  <div className="hud-menu-col">
                    <span className="hud-menu-section-title">⚙️ Audio & Display</span>

                    {/* Sound Settings Toggle */}
                    <div className="hud-menu-row sound-setting-card">
                      <div className="hud-menu-row-info">
                        <div className="menu-btn-icon-box sound-icon-box">
                          {isMuted ? '🔇' : '🔊'}
                        </div>
                        <div className="menu-item-text">
                          <strong>Sound Effects & Voice</strong>
                          <small>{isMuted ? 'Muted / Silent mode' : 'Active (SFX & Voice)'}</small>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`menu-switch-btn ${!isMuted ? 'is-on' : 'is-off'}`}
                        onClick={() => {
                          toggleSound();
                        }}
                        title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
                      >
                        <span className="switch-thumb" />
                        <span className="switch-text">{isMuted ? 'OFF' : 'ON'}</span>
                      </button>
                    </div>

                    {/* Screen & HUD Zoom Scaling Section */}
                    <div className="hud-menu-zoom-card">
                      <div className="hud-menu-zoom-head">
                        <div className="zoom-title-stack">
                          <div className="menu-btn-icon-box zoom-icon-box">🔍</div>
                          <div>
                            <strong>Screen & UI Scale</strong>
                            <small>Scale workspace to fit your monitor</small>
                          </div>
                        </div>
                        <span className={`zoom-live-badge ${zoomPercent !== 100 ? 'is-custom' : ''}`}>
                          {zoomPercent}%
                        </span>
                      </div>

                      <div className="hud-menu-zoom-controls">
                        <button
                          type="button"
                          className="zoom-tactile-btn"
                          onClick={zoomOut}
                          disabled={zoomLevel <= 0.5}
                          title="Zoom Out (-5%)"
                          aria-label="Zoom Out"
                        >
                          <ZoomOutIcon size={16} strokeWidth={2.6} />
                        </button>

                        <div className="zoom-slider-wrap">
                          <input
                            type="range"
                            min="50"
                            max="150"
                            step="5"
                            value={zoomPercent}
                            onChange={(e) => setZoomLevel(Number(e.target.value) / 100)}
                            className="zoom-slider-input"
                            aria-label="Screen zoom level"
                            title={`Zoom: ${zoomPercent}%`}
                          />
                        </div>

                        <button
                          type="button"
                          className="zoom-tactile-btn"
                          onClick={zoomIn}
                          disabled={zoomLevel >= 1.5}
                          title="Zoom In (+5%)"
                          aria-label="Zoom In"
                        >
                          <ZoomInIcon size={16} strokeWidth={2.6} />
                        </button>

                        <button
                          type="button"
                          className={`zoom-reset-pill ${zoomPercent === 100 ? 'is-default' : ''}`}
                          onClick={resetZoom}
                          title="Reset Zoom to 100%"
                        >
                          100% Reset
                        </button>
                      </div>
                    </div>

                    {/* Information & Guide Cards (Full Width) */}
                    <button
                      className="hud-menu-item-btn about-card-btn"
                      onClick={() => {
                        setIsMenuOpen(false);
                        soundManager.playClick();
                        openModal('about');
                      }}
                    >
                      <div className="menu-btn-icon-box" style={{ background: '#ecfdf5', color: '#047857' }}>👥</div>
                      <div className="menu-item-text">
                        <strong>About Us & Research Team</strong>
                        <small>BSIE-HE-4A • TUP Manila Capstone</small>
                      </div>
                      <span className="menu-item-arrow">➔</span>
                    </button>

                    <button
                      className="hud-menu-item-btn help-card-btn"
                      onClick={() => {
                        setIsMenuOpen(false);
                        soundManager.playClick();
                        openModal('help');
                      }}
                    >
                      <div className="menu-btn-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>❓</div>
                      <div className="menu-item-text">
                        <strong>How to Play & Lab Guide</strong>
                        <small>SOPs, walkthrough & controls</small>
                      </div>
                      <span className="menu-item-arrow">➔</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
      </div>
    </header>
  );
};
