import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';
import { MultiStateContainer } from '../components/MultiStateContainer';
import { InventoryTray } from '../components/InventoryTray';
import { RecipeReferenceDrawer } from '../components/RecipeReferenceDrawer';
import { CheckpointQuestionModal } from '../components/CheckpointQuestionModal';
import { STAGE_QUESTIONS } from '../data/stageQuestionsData';

export const Mission6Dehydration = () => {
  const { setScene, unlockBadge, speak, showToast, completeMission, holdingItem, setHoldingItem, missionsCompleted, stageAnswers, recordStageAnswer } = useGame();

  const isAlreadyCompleted = Boolean(missionsCompleted?.mission6);
  const [isCheckpointOpen, setIsCheckpointOpen] = useState(() => !isAlreadyCompleted && !stageAnswers?.mission6);

  const handleCheckpointComplete = (selectedChoice, questionChoices) => {
    const choicesList = questionChoices || STAGE_QUESTIONS.mission6.choices;
    const correctChoice = choicesList.find((c) => c.isCorrect);
    recordStageAnswer('mission6', {
      stageNum: 6,
      stageTitle: STAGE_QUESTIONS.mission6.stageTitle,
      question: STAGE_QUESTIONS.mission6.question,
      selectedOptionId: selectedChoice.id,
      selectedDisplayLetter: selectedChoice.displayLetter,
      selectedText: selectedChoice.text,
      isCorrect: selectedChoice.isCorrect,
      reason: selectedChoice.reason,
      explanation: STAGE_QUESTIONS.mission6.explanation,
      choices: choicesList,
      correctOptionId: correctChoice?.id,
      correctDisplayLetter: correctChoice?.displayLetter,
    });
    setIsCheckpointOpen(false);
  };

  // Dehydration states based on client game.docx (Steps 15–18):
  // 0: Empty counter -> accept mesh_tray
  // 1: Tray on counter -> accept steamed_pieces (Step 16: arrange with space between pieces)
  // 2: Loaded tray -> action / accept dehydrator_cabinet (slide tray into dehydrator)
  // 3: Loaded in cabinet dehydrator -> action: start 12-hour 90°C cycle (Step 17)
  // 4: Dehydrating at 90°C for ~12 hours
  // 5: Completely dehydrated pieces -> accept storage_container (Step 18: clean dry container)
  // 6: Dried pieces transferred to clean, dry container -> complete & proceed to frying
  const [dehydrateStep, setDehydrateStep] = useState(() => (isAlreadyCompleted ? 6 : 0));
  const [dehydrateProgress, setDehydrateProgress] = useState(0);
  const [isDehydrating, setIsDehydrating] = useState(false);

  useEffect(() => {
    if (isAlreadyCompleted) {
      speak(
        'Stage 6 complete.',
        'neutral',
        {
          badge: 'Stage 6 Complete',
          note: 'Click “Proceed to stage 7”',
          btnText: 'Click “Proceed to stage 7”',
          onNext: () => setScene('mission7'),
        }
      );
    } else {
      speak(
        'Select the tray and place it in the center.',
        'neutral',
        {
          badge: 'Step 1: Tray Spacing',
          note: 'Select the tray and drop to the center',
          hint: 'Select the tray and drop to the center',
          hideButton: true,
        }
      );
    }
  }, []);

  const dehydratorSteps = [
    {
      stepIndex: 0,
      acceptedItems: ['mesh_tray', 'wire_tray', 'icon_drying_tray', 'dehydrator_tray_empty', 'dehydrator_tray'],
      prompt: 'Select the tray and drop to the center',
      img: '/assets/dehydrator_tray_empty.webp',
      imgOpacity: 0.35,
      fallbackIcon: '🔲',
      label: 'Workstation Prep Counter',
    },
    {
      stepIndex: 1,
      acceptedItems: ['steamed_pieces', 'steamed_ubod', 'cracker_piece_unmolded', 'molded_tray', 'steamed_ubod_tray'],
      prompt: 'Select the steamed ubod then drop to the tray',
      img: '/assets/dehydrator_tray_empty.webp',
      fallbackIcon: '🔲',
      label: 'Empty Dehydrator Tray',
    },
    {
      stepIndex: 2,
      acceptedItems: ['dehydrator_cabinet', 'equip_dehydrator_safe', 'cabinet', 'dehydrator', 'dehydrator_assembled_empty'],
      prompt: 'Select the cabinet dehydrator then drop to the tray',
      img: '/assets/dehydrator_tray_arranged.webp',
      fallbackIcon: '🧈',
      label: 'Arranged Tray (Spaced Pieces)',
    },
    {
      stepIndex: 3,
      acceptedItems: [],
      prompt: 'Click start at the center of the dehydrator',
      img: '/assets/dehydrator_assembled_empty.webp',
      fallbackIcon: '💨',
      label: 'Dehydrator Cabinet (Ready)',
    },
    {
      stepIndex: 4,
      acceptedItems: [],
      prompt: 'Click start at the center of the dehydrator',
      img: '/assets/dehydrator_assembled_running.webp',
      fallbackIcon: '⏳',
      label: '12-Hour 90°C Dehydration Active',
    },
    {
      stepIndex: 5,
      acceptedItems: ['storage_container', 'storage_tray', 'container_dehydrated_chips', 'container_empty'],
      prompt: 'Select the dry container then drop to the center',
      img: '/assets/dehydrator_tray_dried.webp',
      fallbackIcon: '✨',
      label: 'Completely Dehydrated Pieces',
    },
    {
      stepIndex: 6,
      acceptedItems: [],
      prompt: 'Click “Proceed to stage 7”',
      img: '/assets/container_dehydrated_chips.webp',
      fallbackIcon: '📦',
      label: 'Clean, Dry Storage Container',
    },
  ];

  const handleItemAccepted = (item, stepIndex) => {
    if (stepIndex === 0 && (item.id === 'mesh_tray' || item.id === 'wire_tray' || item.id === 'icon_drying_tray' || item.id === 'dehydrator_tray_empty' || item.id === 'dehydrator_tray')) {
      soundManager.playClick();
      setDehydrateStep(1);
      setHoldingItem(null);
      showToast('Tray Prepared!', 'Dehydrator tray placed on counter.', 'success');
      speak(
        'Select the steamed ubod and place it on the tray.',
        'neutral',
        {
          badge: 'Step 2',
          note: 'Select the steamed ubod then drop to the tray',
          hint: 'Select the steamed ubod then drop to the tray',
          hideButton: true,
        }
      );
    } else if (stepIndex === 1 && (item.id === 'steamed_pieces' || item.id === 'steamed_ubod' || item.id === 'cracker_piece_unmolded' || item.id === 'molded_tray' || item.id === 'steamed_ubod_tray')) {
      soundManager.playClick();
      setDehydrateStep(2);
      setHoldingItem(null);
      showToast('Pieces Arranged!', 'Pieces arranged with space to prevent sticking.', 'success');
      speak(
        'Select the cabinet dehydrator and place it on the tray.',
        'neutral',
        {
          badge: 'Step 3',
          note: 'Select the cabinet dehydrator then drop to the tray',
          hint: 'Select the cabinet dehydrator then drop to the tray',
          hideButton: true,
        }
      );
    } else if (stepIndex === 2 && (item.id === 'dehydrator_cabinet' || item.id === 'equip_dehydrator_safe' || item.id === 'cabinet' || item.id === 'dehydrator' || item.id === 'dehydrator_assembled_empty')) {
      handleSlideIntoCabinet();
    } else if (stepIndex === 5 && (item.id === 'storage_container' || item.id === 'storage_tray' || item.id === 'container_dehydrated_chips' || item.id === 'container_empty')) {
      handleTransferToStorage();
    }
  };

  const handleSlideIntoCabinet = () => {
    soundManager.playClick();
    setDehydrateStep(3);
    setHoldingItem(null);
    showToast('Tray Inserted!', 'Tray secured inside cabinet dehydrator.', 'success');
    speak(
      'Click Start in the center of the dehydrator.',
      'neutral',
      {
        badge: 'Step 4',
        note: 'Click start at the center of the dehydrator',
        hint: 'Click start at the center of the dehydrator',
        hideButton: true,
      }
    );
  };

  const handleStartDehydration = () => {
    soundManager.playBoil();
    setIsDehydrating(true);
    setDehydrateStep(4);
    setHoldingItem(null);
    showToast('Dehydration Active...', 'Dehydrating at 90°C for approximately 12 hours...', 'info');
    speak(
      'Click start at the center of the dehydrator',
      'neutral',
      {
        badge: 'Step 4',
        note: 'Click start at the center of the dehydrator',
        hint: 'Click start at the center of the dehydrator',
        hideButton: true,
      }
    );

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setDehydrateProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setIsDehydrating(false);
        setDehydrateStep(5);
        soundManager.playSuccess();
        showToast('Dehydration Complete!', 'Pieces are completely dehydrated.', 'success');
        speak(
          'Select the dry container and place it in the center.',
          'neutral',
          {
            badge: 'Step 5',
            note: 'Select the dry container then drop to the center',
            hint: 'Select the dry container then drop to the center',
            hideButton: true,
          }
        );
      }
    }, 650);
  };

  const handleTransferToStorage = () => {
    soundManager.playClick();
    setDehydrateStep(6);
    setHoldingItem(null);
    unlockBadge('vitrification_master', 'Dehydration Specialist', '💨');
    completeMission('mission6');
    showToast('Dry Container Stored!', 'Dried ubod pieces transferred to clean, dry container.', 'success');
    speak(
      'Click “Proceed to Stage 7.”',
      'neutral',
      {
        badge: 'Step 6',
        note: 'Click “Proceed to stage 7”',
        btnText: 'Click “Proceed to stage 7”',
        onNext: () => setScene('mission7'),
      }
    );
  };

  const stage6Inventory = [
    {
      id: 'mesh_tray',
      name: 'Dehydrator Tray',
      measure: 'Wire Mesh Tray',
      img: '/assets/dehydrator_tray_empty.webp',
      fallbackIcon: '🔲',
      isUsed: dehydrateStep >= 1,
      isNext: dehydrateStep === 0,
      tooltip: 'Dehydrator Trays – Used to hold and arrange the molded ubod pieces during dehydration.',
    },
    {
      id: 'steamed_pieces',
      name: 'Steamed Ubod Pieces',
      measure: 'Cooled Pieces',
      img: '/assets/cracker_piece_unmolded.webp',
      fallbackIcon: '🧈',
      isUsed: dehydrateStep >= 2,
      isNext: dehydrateStep === 1,
      tooltip: 'Cooled steamed ubod pieces ready to be arranged on the dehydrator tray with enough space between each piece.',
    },
    {
      id: 'dehydrator_cabinet',
      name: 'Cabinet Dehydrator',
      measure: '90°C / 12 Hours',
      img: '/assets/dehydrator_assembled_empty.webp',
      fallbackIcon: '💨',
      isUsed: dehydrateStep >= 3,
      isNext: dehydrateStep === 2,
      tooltip: 'Dehydrator – Used to remove moisture from the steamed ubod pieces for approximately 12 hours at 90°C.',
    },
    {
      id: 'storage_container',
      name: 'Clean Dry Container',
      measure: 'Airtight Container',
      img: '/assets/container_empty.webp',
      fallbackIcon: '📦',
      isUsed: dehydrateStep >= 6,
      isNext: dehydrateStep === 5,
      tooltip: 'Clean, dry container used to store completely dehydrated ubod pieces before frying.',
    },
  ];

  const handleInventoryClick = (item) => {
    if (item.isUsed) return;
    if (holdingItem?.id === item.id) {
      setHoldingItem(null);
    } else {
      setHoldingItem(item);
    }
  };

  const recipeItems = [
    {
      name: 'Steamed Ubod Pieces',
      measure: 'Cooled Pieces',
      icon: '🧈',
      isCompleted: dehydrateStep >= 2,
      isCurrent: dehydrateStep === 1,
    },
    {
      name: 'Piece Spacing',
      measure: 'Spaced (Prevent Sticking)',
      icon: '📐',
      isCompleted: dehydrateStep >= 3,
      isCurrent: dehydrateStep === 2,
    },
    {
      name: 'Dehydration Temperature',
      measure: '90°C',
      icon: '🔥',
      isCompleted: dehydrateStep >= 4,
      isCurrent: dehydrateStep === 3,
    },
    {
      name: 'Dehydration Time',
      measure: 'Approx. 12 Hours',
      icon: '⏱️',
      isCompleted: dehydrateStep >= 5,
      isCurrent: dehydrateStep === 4,
    },
    {
      name: 'Storage Container',
      measure: 'Clean, Dry Container',
      icon: '📦',
      isCompleted: dehydrateStep >= 6,
      isCurrent: dehydrateStep === 5,
    },
  ];

  const safetyChecklist = [
    {
      title: 'Electrical & Equipment Check',
      desc: 'Check the wirings, outlets and the dehydrator itself before turning on the power.',
      icon: '🔌',
      isWarning: true,
    },
    {
      title: 'Spacing Protocol (Step 16)',
      desc: 'Arrange the pieces on the dehydrator tray with enough space between each piece to prevent them from sticking together.',
      icon: '📐',
      isWarning: false,
    },
    {
      title: 'Laboratory Supervision (Step 17)',
      desc: 'Since dehydration requires approximately 12 hours, the dehydrator may be operated under the supervision of the teacher or laboratory personnel. Students may check the product before and after the scheduled laboratory activity.',
      icon: '👩‍🍳',
      isWarning: false,
    },
    {
      title: 'Clean Dry Storage (Step 18)',
      desc: 'Once completely dehydrated, transfer the dried ubod pieces to a clean, dry container.',
      icon: '📦',
      isWarning: false,
    },
  ];

  return (
    <div className="workstation-scene dehydration-scene">
      <div className="workstation-overlay" />

      {/* Stage 6 Pre-Check Question Modal */}
      <CheckpointQuestionModal
        isOpen={isCheckpointOpen}
        stageTitle={STAGE_QUESTIONS.mission6.stageTitle}
        question={STAGE_QUESTIONS.mission6.question}
        choices={STAGE_QUESTIONS.mission6.choices}
        explanation={STAGE_QUESTIONS.mission6.explanation}
        onComplete={handleCheckpointComplete}
      />

      {/* Main Center Cooking Countertop */}
      <div className="stage-center-zone">
        {/* Floating Quick Recipe & Safety Drawer */}
        <RecipeReferenceDrawer
          stageTitle="Stage 6: Cabinet Dehydration"
          recipeItems={recipeItems}
          safetyNotes={safetyChecklist}
          culinaryTip="Dehydration: Refers to the process of removing moisture from the steamed ubod pieces using a dehydrator for approximately 12 hours at 90°C to produce dried cracker pieces suitable for frying."
        />

        <div className="stage-content-row stage-single-workstation">
          {/* Centered Cabinet Dehydrator Workstation */}
          <div className="station-center-card">
            <MultiStateContainer
              containerId="dehydrator"
              title="Cabinet Dehydrator"
              subtitle="Stage 6: 12-Hour 90°C Convection Dehydration & Dry Storage"
              currentStepIndex={dehydrateStep}
              steps={dehydratorSteps}
              stepNumber={dehydrateStep === 4 ? 4 : dehydrateStep === 5 ? 5 : Math.min(dehydrateStep + 1, 6)}
              stepTotal={6}
              onItemAccepted={handleItemAccepted}
              activeAnimation={isDehydrating ? 'convection' : null}
              containerWidth="100%"
              statusDotClass={dehydrateStep >= 6 ? 'dot-success' : isDehydrating ? 'dot-amber' : ''}
              statusText={
                dehydrateStep >= 6
                  ? 'Dried pieces stored in clean, dry container ready for frying'
                  : dehydrateStep === 5
                  ? 'Step 4: Completely dehydrated. Select Clean Dry Container to store.'
                  : dehydrateStep === 4
                  ? `Dehydrating... ${dehydrateProgress}% (12 Hours at 90°C Time-Lapse)`
                  : dehydrateStep === 3
                  ? 'Step 3: Tray loaded. Click dial to dehydrate for 12 hours at 90°C.'
                  : dehydrateStep === 2
                  ? 'Step 2: Pieces spaced. Slide loaded tray into cabinet.'
                  : dehydrateStep === 1
                  ? 'Step 1: Arrange pieces on tray with space between them.'
                  : 'Place dehydrator tray onto workstation prep counter'
              }
              specBadge={
                <span
                  className={`spec-badge ${
                    dehydrateStep >= 6
                      ? 'spec-success'
                      : dehydrateStep >= 4
                      ? 'spec-amber'
                      : ''
                  }`}
                >
                  {dehydrateStep >= 6
                    ? 'STORAGE: CLEAN & DRY'
                    : dehydrateStep === 5
                    ? 'STATUS: DRIED'
                    : dehydrateStep === 4
                    ? 'TIME: 12 HOURS'
                    : dehydrateStep === 3
                    ? 'TEMP: 90°C'
                    : dehydrateStep === 2
                    ? 'SPACING: SEPARATE'
                    : dehydrateStep === 1
                    ? 'PIECES: COOLED'
                    : 'TRAY: PREPARE'}
                </span>
              }
              customFooter={
                (dehydrateStep === 3 || dehydrateStep === 4) ? (
                  <div
                    className={`dehydrator-appliance-console ${
                      dehydrateStep === 3 ? 'ready-to-start' : 'is-running'
                    }`}
                    onClick={dehydrateStep === 3 ? handleStartDehydration : undefined}
                    role="button"
                    tabIndex={0}
                    title={
                      dehydrateStep === 3
                        ? 'Click dial to start 12-Hour 90°C Dehydration Cycle'
                        : '12-Hour Dehydration in progress'
                    }
                  >
                    <div className="dehydrator-dial-assembly">
                      <span className={`dehydrator-dial-icon ${dehydrateStep === 4 ? 'spinning' : ''}`}>
                        {dehydrateStep === 4 ? (
                          <svg
                            className="convection-turbine-svg"
                            viewBox="0 0 24 24"
                            width="28"
                            height="28"
                            fill="none"
                          >
                            <circle cx="12" cy="12" r="3" fill="#6ee7b7" stroke="#059669" strokeWidth="1" />
                            <path d="M12 9 C11 4.5 15 2.5 17.5 3 C17 6.5 14.5 8.5 12 9 Z" fill="#34d399" />
                            <path d="M15 12 C19.5 11 21.5 15 21 17.5 C17.5 17 15.5 14.5 15 12 Z" fill="#10b981" />
                            <path d="M12 15 C13 19.5 9 21.5 6.5 21 C7 17.5 9.5 15.5 12 15 Z" fill="#34d399" />
                            <path d="M9 12 C4.5 13 2.5 9 3 6.5 C6.5 7 8.5 9.5 9 12 Z" fill="#10b981" />
                          </svg>
                        ) : (
                          <svg
                            className="power-btn-svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                            <line x1="12" y1="2" x2="12" y2="12" />
                          </svg>
                        )}
                      </span>
                      {dehydrateStep === 3 && (
                        <>
                          <span className="knob-beacon-ring r1" />
                          <span className="knob-beacon-ring r2" />
                        </>
                      )}
                    </div>

                    <div className="dehydrator-panel-text">
                      <div className="dehydrator-badge-row">
                        <span
                          className={`dehydrator-led ${
                            dehydrateStep === 4 ? 'active-running' : 'blinking'
                          }`}
                        />
                        <span className="dehydrator-mode-title">
                          {dehydrateStep === 4
                            ? '90°C CONVECTION ACTIVE'
                            : 'CLICK TO START (90°C)'}
                        </span>
                      </div>

                      <div className="dehydrator-sub-row">
                        {dehydrateStep === 4 ? (
                          <div className="dehydrator-progress-container">
                            <div className="dehydrator-progress-bar-bg">
                              <div
                                className="dehydrator-progress-bar-fill"
                                style={{ width: `${dehydrateProgress}%` }}
                              />
                            </div>
                            <div className="dehydrator-progress-label-row">
                              <span className="progress-pct-badge">{dehydrateProgress}% Complete</span>
                              <span className="progress-time-remaining">⏳ {Math.max(1, Math.round(12 * (1 - dehydrateProgress / 100)))}h Remaining</span>
                            </div>
                          </div>
                        ) : (
                          <span className="dehydrator-action-hint">
                            👉 Click dial to start 12-hour 90°C dehydration
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null
              }
            />
          </div>
        </div>
      </div>

      {/* DOCKED BOTTOM INVENTORY SHELF */}
      <InventoryTray
        title="Station 6 Dehydration Trays & Storage Containers"
        items={stage6Inventory}
        onItemClick={handleInventoryClick}
      />
    </div>
  );
};
