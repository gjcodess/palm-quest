import { useSessionState } from '../hooks/useSessionState';
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';
import { MultiStateContainer } from '../components/MultiStateContainer';
import { InventoryTray } from '../components/InventoryTray';
import { CheckpointQuestionModal } from '../components/CheckpointQuestionModal';
import { RecipeReferenceDrawer } from '../components/RecipeReferenceDrawer';
import { STAGE_QUESTIONS } from '../data/stageQuestionsData';

export const Mission4Molding = () => {
  const { isRestoringSession, setScene, unlockBadge, speak, showToast, completeMission, holdingItem, setHoldingItem, missionsCompleted, maxUnlockedStage, stageAnswers, recordStageAnswer } = useGame();

  const isAlreadyCompleted = Boolean(missionsCompleted?.mission4);
  const [isCheckpointOpen, setIsCheckpointOpen] = useState(() => !isAlreadyCompleted && !stageAnswers?.mission4);

  const handleCheckpointComplete = (selectedChoice, questionChoices) => {
    const choicesList = questionChoices || STAGE_QUESTIONS.mission4.choices;
    const correctChoice = choicesList.find((c) => c.isCorrect);
    recordStageAnswer('mission4', {
      stageNum: 4,
      stageTitle: STAGE_QUESTIONS.mission4.stageTitle,
      question: STAGE_QUESTIONS.mission4.question,
      selectedOptionId: selectedChoice.id,
      selectedDisplayLetter: selectedChoice.displayLetter,
      selectedText: selectedChoice.text,
      isCorrect: selectedChoice.isCorrect,
      reason: selectedChoice.reason,
      explanation: STAGE_QUESTIONS.mission4.explanation,
      choices: choicesList,
      correctOptionId: correctChoice?.id,
      correctDisplayLetter: correctChoice?.displayLetter,
    });
    setIsCheckpointOpen(false);
  };

  // Mold Step States:
  // 0: Empty Mold -> accept measuring spoon / paste portion
  // 1: 1 Cavity Calibrated -> accept measuring spoon OR quick fill button
  // 2: 24 Cavities Filled (Unleveled) -> accept leveling spatula
  // 3: 24 Cavities Completely Leveled -> Complete!
  const [moldStep, setMoldStep] = useSessionState('mission4.moldStep', () => (isAlreadyCompleted ? 3 : 0));
  const [isLeveling, setIsLeveling] = useState(false);
  const [quizSelected, setQuizSelected] = useSessionState('mission4.quizSelected', null);

  useEffect(() => {
    if (isRestoringSession && !isAlreadyCompleted) return;
    if (isAlreadyCompleted) {
      speak(
        'Stage 4 complete.',
        'neutral',
        {
          badge: 'Stage 4 Complete',
          note: 'Click “Proceed to stage 5”',
          btnText: 'Click “Proceed to stage 5”',
          onNext: () => setScene('mission5'),
        }
      );
    } else {
      speak(
        'Select the mixture and place it in the mold.',
        'neutral',
        {
          badge: 'Step 1: Portioning & Molding',
          note: 'Select the mixture and drop to the molder',
          hint: 'Select the mixture and drop to the molder',
          hideButton: true,
        }
      );
    }
  }, []);

  const moldSteps = [
    {
      stepIndex: 0,
      acceptedItems: ['dough_bowl', 'dough_portion', 'measuring_spoon'],
      prompt: 'Select the mixture and place it in the mold.',
      img: '/assets/molder_empty.webp',
      fallbackIcon: '🌸',
      label: 'Clean 24-Cavity Silicone Mold',
    },
    {
      stepIndex: 1,
      acceptedItems: ['dough_bowl', 'dough_portion', 'measuring_spoon'],
      prompt: 'Select the leveling spatula.',
      img: '/assets/molder_single_piece.webp',
      fallbackIcon: '🧈',
      label: '1 Cavity Calibrated (3 tsp)',
    },
    {
      stepIndex: 2,
      acceptedItems: ['leveling_spatula', 'spatula'],
      prompt: 'Cavities filled! Select the Leveling Spatula to scrape and level flat',
      img: '/assets/molder_partially_filled.webp',
      fallbackIcon: '🥄',
      label: 'Cavities Portioned (Unleveled)',
    },
    {
      stepIndex: 3,
      acceptedItems: [],
      prompt: 'All 24 rectangular crackers uniformly leveled and ready for steaming!',
      img: '/assets/molder_completely_filled.webp',
      fallbackIcon: '✨',
      label: 'All 24 Pieces Uniform & Leveled',
    },
  ];

  const handleItemAccepted = (item, stepIndex) => {
    if (stepIndex === 0 && (item.id === 'dough_bowl' || item.id === 'dough_portion' || item.id === 'measuring_spoon')) {
      soundManager.playSuccess();
      setMoldStep(1);
      setHoldingItem(null);
      showToast('Cavity Calibrated!', 'First cavity filled with 3 tsp portion', 'success');
      speak(
        'Select the leveling spatula.',
        'neutral',
        {
          badge: 'Step 2',
          note: 'Select Spatula level',
          hint: 'Select Spatula level',
          hideButton: true,
        }
      );
    } else if (stepIndex === 1 && (item.id === 'dough_bowl' || item.id === 'dough_portion' || item.id === 'measuring_spoon')) {
      handleFillBatch();
    } else if (stepIndex === 2 && (item.id === 'leveling_spatula' || item.id === 'spatula')) {
      handleLevelDough();
    }
  };

  const handleFillBatch = () => {
    soundManager.playPour();
    setMoldStep(2);
    setHoldingItem(null);
    showToast('All 24 Cavities Portioned!', 'Now select the Leveling Spatula to level the surfaces flat.', 'info');
    speak(
      'Select the leveling spatula.',
      'neutral',
      {
        badge: 'Step 2',
        note: 'Select Spatula level',
        hint: 'Select Spatula level',
        hideButton: true,
      }
    );
  };

  const handleLevelDough = () => {
    if (isLeveling || moldStep !== 2) return;
    setIsLeveling(true);
    soundManager.playPour();
    showToast('Leveling Surfaces...', 'Scraping excess dough flush with mold edges...', 'info');

    setTimeout(() => {
      setIsLeveling(false);
      setMoldStep(3);
      setHoldingItem(null);
      soundManager.playSuccess();
      unlockBadge('mold_artisan', 'Uniform Wafer Shaper', '📐');
      completeMission('mission4');
      showToast('Stage 4 Complete!', '24 rectangular crackers uniformly molded & leveled', 'success');
      speak(
        'Click “Proceed to stage 5”',
        'neutral',
        {
          badge: 'Stage 4 Complete',
          note: 'Click “Proceed to stage 5”',
          btnText: 'Click “Proceed to stage 5”',
          onNext: () => setScene('mission5'),
        }
      );
    }, 700);
  };

  const stage4Inventory = [
    {
      id: 'dough_bowl',
      name: 'Ubod Dough',
      measure: '3 tsp Standard Portion',
      img: '/assets/mixing_bowl_ubod_only.webp',
      fallbackIcon: '🥣',
      isUsed: moldStep >= 2,
      isNext: moldStep < 2,
      tooltip: 'Formulated dough batch. Calibrated 3 tsp portion per rectangular cavity.',
    },
    {
      id: 'leveling_spatula',
      name: 'Leveling Spatula',
      measure: 'Flat Edge Scraper',
      img: '/assets/tool_spatula_red.webp',
      fallbackIcon: '📐',
      isUsed: moldStep >= 3,
      isNext: moldStep === 2,
      tooltip: 'Flat straight-edge scraper to level dough flush with silicone rims for identical thickness.',
    },
  ];

  const handleInventoryClick = (item) => {
    if (item.isUsed) return;
    soundManager.playClick();

    if (holdingItem?.id === item.id) {
      setHoldingItem(null);
    } else {
      setHoldingItem({
        id: item.id,
        name: item.name,
        img: item.img,
        icon: item.fallbackIcon || '🥣',
      });
      if (item.id === 'dough_bowl') {
        showToast('Ubod Dough Selected', '3 tsp portion ready. Tap the silicone mold to place!', 'info');
      } else if (item.id === 'leveling_spatula') {
        showToast('Leveling Spatula Selected', 'Tap the silicone mold to scrape and level flat!', 'info');
      }
    }
  };

  const recipeItems = [
    { name: 'Portion per Piece', measure: '~3 Teaspoons', icon: '🥄', isCompleted: moldStep >= 2, isCurrent: moldStep < 2 },
    { name: 'Total Batch', measure: '24 Pieces', icon: '🧈', isCompleted: moldStep >= 3, isCurrent: moldStep === 2 },
  ];

  const safetyChecklist = [
    {
      title: 'Food-Grade Gloves Required',
      desc: "Don't forget to wear clean food-grade gloves when portioning and handling room-temperature dough.",
      icon: '🧤',
      isWarning: true,
    },
    {
      title: 'Uniform Thickness Standard',
      desc: 'Using the same amount of dough per piece promotes more even cooking in the steamer and even drying in the dehydrator.',
      icon: '📐',
      isWarning: false,
    },
  ];

  return (
    <div className="workstation-scene molding-scene">
      <div className="workstation-overlay" />

      {/* Stage 4 Pre-Check Question Modal */}
      <CheckpointQuestionModal
        persistenceKey="mission4.checkpoint"
        isOpen={isCheckpointOpen}
        stageTitle={STAGE_QUESTIONS.mission4.stageTitle}
        question={STAGE_QUESTIONS.mission4.question}
        choices={STAGE_QUESTIONS.mission4.choices}
        explanation={STAGE_QUESTIONS.mission4.explanation}
        onComplete={handleCheckpointComplete}
      />

      {/* Main Center Cooking Countertop */}
      <div className="stage-center-zone">
        {/* Floating Quick Recipe & Safety Drawer */}
        <RecipeReferenceDrawer
          stageTitle="Stage 4: Portioning & Molding"
          recipeItems={recipeItems}
          safetyNotes={safetyChecklist}
          culinaryTip="Using the exact same amount of dough (~3 tsp) per mold ensures every cracker cooks at the same speed in the steamer and dehydrates uniformly without brittle edges."
        />

        <div className="stage-content-row stage-single-workstation">
          {/* Center: 24-Slot Rectangular Silicone Mold MultiStateContainer */}
          <div className="station-center-card">
            <MultiStateContainer
              containerId="silicone_mold"
              title="Rectangular Silicone Mold"
              subtitle="Stage 4: 24-Cavity Portioning (3 tsp) & Thickness Leveling"
              currentStepIndex={moldStep}
              steps={moldSteps}
              stepNumber={moldStep === 0 ? 1 : 2}
              stepTotal={2}
              onItemAccepted={handleItemAccepted}
              containerWidth="100%"
              statusDotClass={moldStep >= 3 ? 'dot-success' : moldStep >= 1 ? 'dot-amber' : ''}
              statusText={
                isLeveling
                  ? 'Scraping and leveling dough flush with cavity rims...'
                  : moldSteps[moldStep]?.prompt || 'Ready'
              }
              specBadge={
                <span
                  className={`spec-badge ${
                    moldStep >= 3 ? 'spec-success' : moldStep >= 1 ? 'spec-amber' : ''
                  }`}
                >
                  {moldStep >= 3
                    ? 'BATCH: LEVELED'
                    : moldStep === 2
                    ? 'TOOL: SPATULA'
                    : moldStep === 1
                    ? 'CAL: 1/24'
                    : 'SPEC: 3 TSP'}
                </span>
              }
            >
              {/* Spatula Leveling Motion Overlay */}
              {isLeveling && (
                <div className="mold-scraping-overlay">
                  <img
                    src="/assets/tool_spatula_red.webp"
                    alt="Leveling Spatula"
                    className="mold-leveling-anim"
                  />
                </div>
              )}

              {/* Step 1 Quick-Fill Action Prompt inside mold */}
              {moldStep === 1 && (
                <div
                  className="spatula-scrape-guide"
                  onClick={handleFillBatch}
                  title="Click to fill all remaining 23 cavities"
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    borderColor: '#0284c7',
                  }}
                >
                  <span>⚡ Click to Fill Remaining Tray</span>
                </div>
              )}

              {/* Step 2 Leveling Guidance Guide */}
              {moldStep === 2 && !isLeveling && (
                <div
                  className="spatula-scrape-guide"
                  onClick={() => {
                    if (holdingItem?.id === 'leveling_spatula' || holdingItem?.id === 'spatula') {
                      handleLevelDough();
                    } else {
                      soundManager.playClick();
                      showToast('Select Spatula First', 'Click the Leveling Spatula in your inventory, then tap the mold!', 'info');
                    }
                  }}
                  title="Tap with Leveling Spatula to scrape"
                >
                  <span>
                    📐 {holdingItem?.id === 'leveling_spatula' || holdingItem?.id === 'spatula' ? 'Tap Mold to Scrape & Level' : 'Select Leveling Spatula from Inventory'}
                  </span>
                </div>
              )}
            </MultiStateContainer>
          </div>
        </div>
      </div>

      {/* DOCKED BOTTOM INVENTORY SHELF */}
      <InventoryTray
        title="Station 4 Portioning & Leveling Tools"
        items={stage4Inventory}
        onItemClick={handleInventoryClick}
      />
    </div>
  );
};
