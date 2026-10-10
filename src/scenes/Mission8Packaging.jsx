import { useActivityInterval } from '../hooks/useActivityInterval';
import { useSessionState } from '../hooks/useSessionState';
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';
import { MultiStateContainer } from '../components/MultiStateContainer';
import { InventoryTray } from '../components/InventoryTray';
import { RecipeReferenceDrawer } from '../components/RecipeReferenceDrawer';
import { CheckpointQuestionModal } from '../components/CheckpointQuestionModal';
import { STAGE_QUESTIONS } from '../data/stageQuestionsData';

export const Mission8Packaging = () => {
  const { isRestoringSession, setScene, unlockBadge, speak, showToast, completeMission, holdingItem, setHoldingItem, missionsCompleted, maxUnlockedStage, stageAnswers, recordStageAnswer } = useGame();

  const isAlreadyCompleted = Boolean(missionsCompleted?.mission8);
  const [isCheckpointOpen, setIsCheckpointOpen] = useState(() => !isAlreadyCompleted && !stageAnswers?.mission8);

  const handleCheckpointComplete = (selectedChoice, questionChoices) => {
    const choicesList = questionChoices || STAGE_QUESTIONS.mission8.choices;
    const correctChoice = choicesList.find((c) => c.isCorrect);
    recordStageAnswer('mission8', {
      stageNum: 8,
      stageTitle: STAGE_QUESTIONS.mission8.stageTitle,
      question: STAGE_QUESTIONS.mission8.question,
      selectedOptionId: selectedChoice.id,
      selectedDisplayLetter: selectedChoice.displayLetter,
      selectedText: selectedChoice.text,
      isCorrect: selectedChoice.isCorrect,
      reason: selectedChoice.reason,
      explanation: STAGE_QUESTIONS.mission8.explanation,
      choices: choicesList,
      correctOptionId: correctChoice?.id,
      correctDisplayLetter: correctChoice?.displayLetter,
    });
    setIsCheckpointOpen(false);
  };

  // Streamlined 3-step packaging flow:
  // 0: Empty stand-up kraft pouch -> accept crispy_crackers (50g)
  // 1: Pouch filled with crackers -> accept brand_label OR click "Seal & Apply Label"
  // 2: Branded commercial pouch -> accept retail_box OR click "Pack into Retail Carton" (8 pouches)
  // 3: Retail countertop display box packed (8 pouches) -> complete
  const [packStep, setPackStep] = useSessionState('mission8.packStep', () => (isAlreadyCompleted ? 3 : 0));
  const [isSealing, setIsSealing] = useSessionState('mission8.isSealing', false);
  const [sealProgress, setSealProgress] = useSessionState('mission8.sealProgress', 0);

  useEffect(() => {
    if (isRestoringSession && !isAlreadyCompleted) return;
    if (isAlreadyCompleted) {
      speak(
        'Stage 8 complete.',
        'neutral',
        {
          badge: 'Stage 8 Complete: Commercial QA',
          note: 'Select “Proceed to Laboratory Review”',
          btnText: 'Select “Proceed to Laboratory Review”',
          onNext: () => setScene('sequencing'),
        }
      );
    } else {
      speak(
        'Step 1: Select the ubod crackers and place them in the center of the packaging.',
        'neutral',
        {
          badge: 'Step 1: 50g Portion Loading',
          note: 'Step 1: Select the ubod crackers then drop to the center of the packaging',
          hint: 'Step 1: Select the ubod crackers then drop to the center of the packaging',
          hideButton: true,
        }
      );
    }
  }, []);

  const pouchSteps = [
    {
      stepIndex: 0,
      acceptedItems: ['crispy_crackers', 'crackers', 'platter_crackers_cooled'],
      prompt: 'Step 1: Select the ubod crackers then drop to the center of the packaging',
      img: '/assets/pouch_empty.webp',
      fallbackIcon: '📦',
      label: 'Open Kraft Pouch with Window',
    },
    {
      stepIndex: 1,
      acceptedItems: ['brand_label', 'label', 'pouch_sealed_labeled'],
      prompt: 'Step 2: Select the Label then drop to the center of the packaging',
      img: '/assets/pouch_with_crackers.webp',
      fallbackIcon: '🏷️',
      label: 'Portioned Pouch (Ready to Seal & Label)',
    },
    {
      stepIndex: 2,
      acceptedItems: ['retail_box', 'carton_box', 'box_of_packaged_crackers'],
      prompt: 'Commercial pouch finished! Pack into 8-pouch retail display carton',
      img: '/assets/pouch_sealed_labeled.webp',
      fallbackIcon: '✨',
      label: 'Commercial Single Pouch (Ubod CRUNCH)',
    },
    {
      stepIndex: 3,
      acceptedItems: [],
      prompt: 'Retail display box complete! 8 pouches ready for distribution',
      img: '/assets/box_of_packaged_crackers.webp',
      fallbackIcon: '📦',
      label: 'Retail Countertop Display Box (8 Pouches)',
    },
  ];

  const handleItemAccepted = (item, stepIndex) => {
    if (stepIndex === 0 && (item.id === 'crispy_crackers' || item.id === 'crackers' || item.id === 'platter_crackers_cooled')) {
      soundManager.playPour();
      setPackStep(1);
      setHoldingItem(null);
      showToast('Crackers Portioned!', 'Pouch filled with 50g crackers. Now seal & apply brand label', 'success');
      speak(
        'Step 2: Select the label and place it in the center of the packaging.',
        'neutral',
        {
          badge: 'Step 2',
          note: 'Step 2: Select the Label then drop to the center of the packaging',
          hint: 'Step 2: Select the Label then drop to the center of the packaging',
          hideButton: true,
        }
      );
    } else if (stepIndex === 1 && (item.id === 'brand_label' || item.id === 'label' || item.id === 'pouch_sealed_labeled')) {
      handleCombinedSealAndLabel();
    } else if (stepIndex === 2 && (item.id === 'retail_box' || item.id === 'carton_box' || item.id === 'box_of_packaged_crackers')) {
      handlePackIntoBox();
    }
  };

  const handleCombinedSealAndLabel = () => {
    if (isSealing) return;
    soundManager.playClick();
    setIsSealing(true);
    setSealProgress(0);
    setHoldingItem(null);
    showToast('Sealing & Labeling...', 'Applying thermal impulse clamp & product label...', 'info');

  };

  useActivityInterval(isSealing, () => {
      const current = sealProgress + 25;
      setSealProgress(current);
      if (current >= 100) {
        setIsSealing(false);
        setPackStep(2);
        soundManager.playSuccess();
        showToast('Airtight & Labeled!', 'Commercial Ubod CRUNCH pouch complete', 'success');
        speak(
          'Step 2 complete.',
          'neutral',
          {
            badge: 'Step 2 Complete',
            note: 'Step 2: Select the Label then drop to the center of the packaging',
            hint: 'Step 2: Select the Label then drop to the center of the packaging',
            hideButton: true,
          }
        );
      }
  }, 250);

  const handlePackIntoBox = () => {
    soundManager.playSuccess();
    setPackStep(3);
    setHoldingItem(null);
    unlockBadge('packaging_specialist', 'Packaging & Quality Assurance Specialist', '🏷️');
    completeMission('mission8');
    showToast('Retail Display Ready!', '8 pouches packed in master display box', 'success');
    speak(
      'Select “Proceed to Laboratory Review.”',
      'neutral',
      {
        badge: 'Production Master: All 8 Stages Complete',
        note: 'Select “Proceed to Laboratory Review”',
        btnText: 'Select “Proceed to Laboratory Review”',
        onNext: () => setScene('sequencing'),
      }
    );
  };

  const stage8Inventory = [
    {
      id: 'crispy_crackers',
      name: 'Crispy Ubod Crackers',
      measure: '50g Portions',
      img: '/assets/platter_crackers_cooled.webp',
      fallbackIcon: '✨',
      isUsed: packStep >= 1,
      isNext: packStep === 0,
      tooltip: 'Golden, crispy, room-temperature crackers ready for calibrated 50g pouch filling.',
    },
    {
      id: 'brand_label',
      name: 'Official Brand Label',
      measure: 'Seal & Label',
      img: '/assets/pouch_sealed_labeled.webp',
      fallbackIcon: '🏷️',
      isUsed: packStep >= 2,
      isNext: packStep === 1,
      tooltip: 'NUDAZAR HONORE - Ubod CRUNCH brand label & 150°C impulse moisture-barrier heat seal.',
    },
    {
      id: 'retail_box',
      name: 'Retail Display Box',
      measure: '8-Pouch Carton',
      img: '/assets/box_of_packaged_crackers.webp',
      fallbackIcon: '📦',
      isUsed: packStep >= 3,
      isNext: packStep === 2,
      tooltip: 'Corrugated master retail display box packed with 8 sealed pouches for commercial distribution.',
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
        icon: item.fallbackIcon || '📦',
      });
      if (item.id === 'crispy_crackers') {
        showToast('Crackers Selected', 'Tap the open kraft pouch to fill 50g.', 'info');
      } else if (item.id === 'brand_label') {
        showToast('Label Selected', 'Tap the pouch to heat seal & apply label.', 'info');
      } else if (item.id === 'retail_box') {
        showToast('Display Box Selected', 'Tap the pouch to pack 8 units into carton.', 'info');
      }
    }
  };

  const recipeItems = [
    { name: 'Pouch Net Weight', measure: '50g Portion', icon: '⚖️', isCompleted: packStep >= 1, isCurrent: packStep === 0 },
    { name: 'Airtight Seal', measure: 'Impulse Sealer', icon: '🏷️', isCompleted: packStep >= 2, isCurrent: packStep === 1 },
    { name: 'Master Retail Carton', measure: '8 Pouches', icon: '📦', isCompleted: packStep >= 3, isCurrent: packStep === 2 },
  ];

  const safetyChecklist = [
    {
      title: 'Mandatory Final PPE',
      desc: 'Wear hairnet, spit guard/face mask, clean apron, and clean food-grade gloves.',
      icon: '🥼',
      isWarning: true,
    },
    {
      title: 'Complete Cooling Before Sealing',
      desc: 'Ensure crackers are completely cooled before sealing to prevent condensation and loss of crispness.',
      icon: '❄️',
      isWarning: false,
    },
    {
      title: 'Clean Packaging Materials',
      desc: 'Pack using clean and appropriate food-grade barrier pouches.',
      icon: '🧼',
      isWarning: false,
    },
  ];

  return (
    <div className="workstation-scene packaging-scene">
      <div className="workstation-overlay" />

      {/* Stage 8 Pre-Check Question Modal */}
      <CheckpointQuestionModal
        persistenceKey="mission8.checkpoint"
        isOpen={isCheckpointOpen}
        stageTitle={STAGE_QUESTIONS.mission8.stageTitle}
        question={STAGE_QUESTIONS.mission8.question}
        choices={STAGE_QUESTIONS.mission8.choices}
        explanation={STAGE_QUESTIONS.mission8.explanation}
        onComplete={handleCheckpointComplete}
      />

      {/* Main Center Cooking Countertop */}
      <div className="stage-center-zone">
        {/* Floating Quick Recipe & Safety Drawer */}
        <RecipeReferenceDrawer
          stageTitle="Stage 8: Packaging Process"
          recipeItems={recipeItems}
          safetyNotes={safetyChecklist}
          culinaryTip="Hermetically sealing the kraft pouch prevents moisture absorption and preserves the crisp texture. Always make sure the crackers are completely cooled down before sealing to prevent steam condensation inside the bag."
        />

        <div className="stage-content-row stage-single-workstation">
          {/* Center: Packaging MultiStateContainer */}
          <div className="station-center-card">
            <MultiStateContainer
              containerId="packaging_pouch"
              title="Airtight Stand-Up Kraft Pouch"
              subtitle="Stage 8: 50g Barrier Packaging & Display Carton"
              currentStepIndex={packStep}
              steps={pouchSteps}
              stepNumber={packStep === 0 ? 1 : 2}
              stepTotal={2}
              onItemAccepted={handleItemAccepted}
              containerWidth="100%"
              statusDotClass={packStep >= 3 ? 'dot-success' : packStep >= 1 ? 'dot-amber' : ''}
              statusText={
                isSealing
                  ? `🏷️ Thermal impulse sealing in progress... ${sealProgress}%`
                  : pouchSteps[packStep]?.prompt || 'Ready'
              }
              specBadge={
                <span
                  className={`spec-badge ${packStep >= 3 ? 'spec-success' : packStep >= 1 ? 'spec-amber' : ''
                    }`}
                >
                  {packStep >= 3
                    ? 'CARTON: 8 PACK'
                    : packStep === 2
                      ? 'BRAND: LABELED'
                      : packStep === 1
                        ? 'SEAL: READY'
                        : 'WEIGHT: 50G'}
                </span>
              }
              interactiveAction={
                packStep === 1
                  ? {
                    label: 'Seal & Apply Label',
                    onClick: handleCombinedSealAndLabel,
                    icon: '🏷️',
                    variant: 'pouch-seal',
                  }
                  : packStep === 2
                    ? {
                      label: 'Pack into Retail Carton',
                      onClick: handlePackIntoBox,
                      icon: '📦',
                      variant: 'box-pack',
                    }
                    : null
              }
            />
          </div>
        </div>
      </div>

      {/* DOCKED BOTTOM INVENTORY SHELF */}
      <InventoryTray
        title="Station 8 Packaging Materials & Display Carton"
        items={stage8Inventory}
        onItemClick={handleInventoryClick}
      />
    </div>
  );
};
