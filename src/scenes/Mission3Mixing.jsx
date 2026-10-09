import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';
import { MultiStateContainer } from '../components/MultiStateContainer';
import { InventoryTray } from '../components/InventoryTray';
import { CheckpointQuestionModal } from '../components/CheckpointQuestionModal';
import { RecipeReferenceDrawer } from '../components/RecipeReferenceDrawer';
import { STAGE_QUESTIONS } from '../data/stageQuestionsData';

export const Mission3Mixing = () => {
  const { setScene, unlockBadge, speak, showToast, completeMission, holdingItem, setHoldingItem, missionsCompleted, maxUnlockedStage, stageAnswers, recordStageAnswer } = useGame();

  const isAlreadyCompleted = Boolean(missionsCompleted?.mission3);
  const [isCheckpointOpen, setIsCheckpointOpen] = useState(() => !isAlreadyCompleted && !stageAnswers?.mission3);

  const handleCheckpointComplete = (selectedChoice, questionChoices) => {
    const choicesList = questionChoices || STAGE_QUESTIONS.mission3.choices;
    const correctChoice = choicesList.find((c) => c.isCorrect);
    recordStageAnswer('mission3', {
      stageNum: 3,
      stageTitle: STAGE_QUESTIONS.mission3.stageTitle,
      question: STAGE_QUESTIONS.mission3.question,
      selectedOptionId: selectedChoice.displayLetter || selectedChoice.selectedOptionId || selectedChoice.id,
      selectedText: selectedChoice.text,
      isCorrect: selectedChoice.isCorrect,
      reason: selectedChoice.reason,
      explanation: STAGE_QUESTIONS.mission3.explanation,
      choices: choicesList,
      correctOptionId: correctChoice?.displayLetter || correctChoice?.id?.toUpperCase() || 'A',
    });
    setIsCheckpointOpen(false);
  };

  // Mixing bowl states:
  // 0: Empty stainless bowl -> accept rice_flour
  // 1: Bowl with rice flour -> accept salt
  // 2: Bowl with flour + salt -> accept ubod_paste
  // 3: Bowl with flour + salt + paste -> accept water
  // 4: All ingredients in bowl -> action: fold & mix paste
  // 5: Mixing in progress
  // 6: Smooth uniform paste ready
  const [bowlStep, setBowlStep] = useState(() => (isAlreadyCompleted ? 6 : 0));
  const [kneadProgress, setKneadProgress] = useState(0);
  const [isKneading, setIsKneading] = useState(false);
  const [quizSelected, setQuizSelected] = useState(null);

  useEffect(() => {
    if (isAlreadyCompleted) {
      speak(
        'Stage 3 complete.',
        'neutral',
        {
          badge: 'Stage 3 Complete',
          note: 'Select “Proceed to stage 4: portioning and molding”',
          btnText: 'Select “Proceed to stage 4: portioning and molding”',
          onNext: () => setScene('mission4'),
        }
      );
    } else {
      speak(
        'Select the rice flour and add it to the bowl.',
        'neutral',
        {
          badge: 'Step 1: Formulation',
          note: 'Select the rice flour and drop to the bowl',
          hint: 'Select the rice flour and drop to the bowl',
          hideButton: true,
        }
      );
    }
  }, []);

  const bowlSteps = [
    {
      stepIndex: 0,
      acceptedItems: ['rice_flour'],
      prompt: 'Select the rice flour and drop to the bowl',
      img: '/assets/mixing_bowl_empty.webp',
      fallbackIcon: '🥣',
      label: 'Empty Stainless Mixing Bowl',
    },
    {
      stepIndex: 1,
      acceptedItems: ['salt'],
      prompt: 'Select 1 teaspoon of salt and drop to the bowl.',
      img: '/assets/mixing_bowl_flour_added.webp',
      fallbackIcon: '🌾',
      label: 'Bowl with Rice Flour',
    },
    {
      stepIndex: 2,
      acceptedItems: ['ubod_paste'],
      prompt: 'Select 1 cup of ubod paste and drop to the bowl.',
      img: '/assets/mixing_bowl_dry_ingredients.webp',
      fallbackIcon: '🧂',
      label: 'Flour + Salt Dry Mix',
    },
    {
      stepIndex: 3,
      acceptedItems: ['water_hydration', 'water'],
      prompt: 'Select 1 cup water and drop to the bowl.',
      img: '/assets/mixing_bowl_paste_added.webp',
      fallbackIcon: '🥥',
      label: 'Flour + Paste Mixture',
    },
    {
      stepIndex: 4,
      acceptedItems: ['spatula', 'red_spatula'],
      prompt: 'Select spatula to mix the ingredients all together.',
      img: '/assets/mixing_bowl_water_pouring.webp',
      fallbackIcon: '💧',
      label: 'Hydrated Formulation Mix',
    },
    {
      stepIndex: 5,
      acceptedItems: [],
      prompt: 'Select spatula to mix the ingredients all together.',
      img: '/assets/mixing_bowl_mixing_in_progress.webp',
      fallbackIcon: '🥣',
      label: 'Mixing in Progress',
    },
    {
      stepIndex: 6,
      acceptedItems: [],
      prompt: 'Select “Proceed to stage 4: portioning and molding”',
      img: '/assets/mixing_bowl_dough_uniform.webp',
      fallbackIcon: '✨',
      label: 'Uniform Cracker Dough',
    },
  ];

  const handleItemAccepted = (item, stepIndex) => {
    if (stepIndex === 0 && item.id === 'rice_flour') {
      soundManager.playPour();
      setBowlStep(1);
      setHoldingItem(null);
      showToast('Rice Flour Added!', 'Next: Add 1 tsp Sea Salt to combine dry ingredients.', 'success');
      speak(
        'Select 1 teaspoon of salt and add it to the bowl.',
        'neutral',
        {
          badge: 'Step 2',
          note: 'Select 1 teaspoon of salt and drop to the bowl.',
          hint: 'Select 1 teaspoon of salt and drop to the bowl.',
          hideButton: true,
        }
      );
    } else if (stepIndex === 1 && item.id === 'salt') {
      soundManager.playClick();
      setBowlStep(2);
      setHoldingItem(null);
      showToast('Salt Added!', 'Next: Add 1 Cup Ubod Paste (1:1 Ratio).', 'success');
      speak(
        'Select 1 cup of ubod paste and add it to the bowl.',
        'neutral',
        {
          badge: 'Step 3',
          note: 'Select 1 cup of ubod paste and drop to the bowl.',
          hint: 'Select 1 cup of ubod paste and drop to the bowl.',
          hideButton: true,
        }
      );
    } else if (stepIndex === 2 && item.id === 'ubod_paste') {
      soundManager.playPour();
      setBowlStep(3);
      setHoldingItem(null);
      showToast('Ubod Paste Added!', 'Next: Pour in 1 Cup Water gradually.', 'success');
      speak(
        'Select 1 cup of water and add it to the bowl.',
        'neutral',
        {
          badge: 'Step 4',
          note: 'Select 1 cup water and drop to the bowl.',
          hint: 'Select 1 cup water and drop to the bowl.',
          hideButton: true,
        }
      );
    } else if (stepIndex === 3 && (item.id === 'water_hydration' || item.id === 'water')) {
      soundManager.playPour();
      setBowlStep(4);
      setHoldingItem(null);
      showToast('Water Added!', 'All ingredients combined! Select the Red Spatula to mix.', 'success');
      speak(
        'Select the spatula to mix all the ingredients together.',
        'neutral',
        {
          badge: 'Step 5',
          note: 'Select spatula to mix the ingredients all together.',
          hint: 'Select spatula to mix the ingredients all together.',
          hideButton: true,
        }
      );
    } else if (stepIndex === 4 && (item.id === 'spatula' || item.id === 'red_spatula')) {
      handleMixDough();
    }
  };

  const handleMixDough = () => {
    if (isKneading || bowlStep !== 4) return;
    setIsKneading(true);
    setBowlStep(5);
    soundManager.playMix();
    showToast('Mixing Active!', 'Gently folding dough into uniform consistency...', 'info');

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setKneadProgress(current);
      if (current < 100) {
        soundManager.playMix();
      }
      if (current >= 100) {
        clearInterval(interval);
        setIsKneading(false);
        setBowlStep(6);
        setHoldingItem(null);
        soundManager.playSuccess();
        unlockBadge('formulation_specialist', '1:1 Dough Master', '🥣');
        completeMission('mission3');
        showToast('Stage 3 Complete!', 'Uniform ubod cracker dough successfully formulated', 'success');
        speak(
          'Select “Proceed to Stage 4: Portioning and Molding.”',
          'neutral',
          {
            badge: 'Step 6',
            note: 'Select “Proceed to stage 4: portioning and molding”',
          btnText: 'Select “Proceed to stage 4: portioning and molding”',
            onNext: () => setScene('mission4'),
          }
        );
      }
    }, 600);
  };

  const stage3Inventory = [
    {
      id: 'rice_flour',
      name: 'Erawan Rice Flour',
      measure: '1 Cup (1:1 Base)',
      img: '/assets/portion_rice_flour_1cup.webp',
      fallbackIcon: '🌾',
      isUsed: bowlStep >= 1,
      isNext: bowlStep === 0,
      tooltip: 'Fine white rice flour providing amylose and amylopectin starches for structural expansion.',
    },
    {
      id: 'salt',
      name: 'Pure Sea Salt',
      measure: '1 tsp (Sea Salt)',
      img: '/assets/ing_salt_fresh.webp',
      fallbackIcon: '🧂',
      isUsed: bowlStep >= 2,
      isNext: bowlStep === 1,
      tooltip: '1 tsp pure sea salt to enhance savoriness and reinforce paste binding.',
    },
    {
      id: 'ubod_paste',
      name: 'Silky Ubod Paste',
      measure: '1 Cup Puree',
      img: '/assets/portion_ubod_paste_1cup.webp',
      fallbackIcon: '🥥',
      isUsed: bowlStep >= 3,
      isNext: bowlStep === 2,
      tooltip: 'Smooth boiled ubod puree adding dietary fiber, moisture, and delicate flavor notes.',
    },
    {
      id: 'water_hydration',
      name: 'Hydration Water',
      measure: '1 Cup (Gradual)',
      img: '/assets/portion_water_1cup.webp',
      fallbackIcon: '💧',
      isUsed: bowlStep >= 4,
      isNext: bowlStep === 3,
      tooltip: 'Potable water added incrementally to hydrate starch granules into smooth paste.',
    },
    {
      id: 'spatula',
      name: 'Red Spatula',
      measure: 'Fold & Mix',
      img: '/assets/tool_spatula_red.webp',
      fallbackIcon: '🥄',
      isUsed: bowlStep >= 6,
      isNext: bowlStep === 4,
      tooltip: 'Silicone spatula for thorough folding, mixing, and homogeneous blending.',
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
      if (item.id === 'rice_flour') {
        showToast('Rice Flour Selected', 'Tap the mixing bowl to add.', 'info');
      } else if (item.id === 'salt') {
        showToast('Sea Salt Selected', 'Tap the mixing bowl to add salt.', 'info');
      } else if (item.id === 'ubod_paste') {
        showToast('Ubod Paste Selected', 'Tap the mixing bowl to add paste.', 'info');
      } else if (item.id === 'water_hydration') {
        showToast('Water Selected', 'Tap the mixing bowl to pour water.', 'info');
      } else if (item.id === 'spatula') {
        showToast('Spatula Selected', 'Tap the bowl to mix dough.', 'info');
      }
    }
  };

  const recipeItems = [
    { name: 'Rice Flour', measure: '1 Cup', icon: '🌾', isCompleted: bowlStep >= 1, isCurrent: bowlStep === 0 },
    { name: 'Pure Sea Salt', measure: '1 tsp', icon: '🧂', isCompleted: bowlStep >= 2, isCurrent: bowlStep === 1 },
    { name: 'Ubod Paste', measure: '1 Cup', icon: '🥥', isCompleted: bowlStep >= 3, isCurrent: bowlStep === 2 },
    { name: 'Potable Water', measure: '1 Cup', icon: '💧', isCompleted: bowlStep >= 4, isCurrent: bowlStep === 3 },
  ];

  const safetyChecklist = [
    {
      title: 'Gradual Water Addition',
      desc: 'Add water little by little while mixing gently to prevent lumps and over-wetting.',
      icon: '💧',
      isWarning: false,
    },
    {
      title: 'Uniform Dispersion',
      desc: 'Mix until all ingredients are well combined and a uniform dough is formed.',
      icon: '🥣',
      isWarning: false,
    },
  ];

  return (
    <div className="workstation-scene mixing-scene">
      <div className="workstation-overlay" />

      {/* Stage 3 Pre-Check Question Modal */}
      <CheckpointQuestionModal
        isOpen={isCheckpointOpen}
        stageTitle={STAGE_QUESTIONS.mission3.stageTitle}
        question={STAGE_QUESTIONS.mission3.question}
        choices={STAGE_QUESTIONS.mission3.choices}
        explanation={STAGE_QUESTIONS.mission3.explanation}
        onComplete={handleCheckpointComplete}
      />

      {/* Main Center Cooking Countertop */}
      <div className="stage-center-zone">
        {/* Floating Quick Recipe & Safety Drawer */}
        <RecipeReferenceDrawer
          stageTitle="Stage 3: Paste Formulation"
          recipeItems={recipeItems}
          safetyNotes={safetyChecklist}
          culinaryTip="Rice flour acts as a structural binder that traps starch granules. Adding the water little by little ensures maximum hydration without making the dough soggy."
        />

        <div className="stage-content-row stage-single-workstation">
          {/* Center: Stainless Mixing Bowl MultiStateContainer */}
          <div className="station-center-card">
            <MultiStateContainer
              containerId="mixing_bowl"
              title="Large Stainless Mixing Bowl"
              subtitle="Stage 3: 1:1 Rice Flour & Ubod Paste Formulation"
              currentStepIndex={bowlStep}
              steps={bowlSteps}
              stepNumber={Math.min(bowlStep + 1, 6)}
              stepTotal={6}
              onItemAccepted={handleItemAccepted}
              activeAnimation={isKneading ? 'mixing' : null}
              containerWidth="100%"
              statusDotClass={bowlStep >= 6 ? 'dot-success' : bowlStep >= 1 ? 'dot-amber' : ''}
              statusText={
                isKneading
                  ? `🥣 Mixing ingredients into uniform dough... ${kneadProgress}%`
                  : bowlSteps[bowlStep]?.prompt || 'Ready'
              }
              specBadge={
                <span
                  className={`spec-badge ${
                    bowlStep >= 6 ? 'spec-success' : bowlStep >= 1 ? 'spec-amber' : ''
                  }`}
                >
                  {bowlStep >= 6
                    ? 'DOUGH: UNIFORM'
                    : bowlStep === 5
                    ? 'MIXING: ACTIVE'
                    : bowlStep === 4
                    ? 'ACTION: MIX'
                    : bowlStep === 3
                    ? 'WATER: 1 CUP'
                    : bowlStep === 2
                    ? 'PASTE: 1 CUP'
                    : bowlStep === 1
                    ? 'SALT: 1 TSP'
                    : 'FLOUR: 1 CUP'}
                </span>
              }
            >
              {/* Step 4 Mixing Guidance Guide */}
              {bowlStep === 4 && !isKneading && (
                <div
                  className="spatula-scrape-guide"
                  onClick={() => {
                    if (holdingItem?.id === 'spatula' || holdingItem?.id === 'red_spatula') {
                      handleMixDough();
                    } else {
                      soundManager.playClick();
                      showToast('Select Spatula First', 'Click the Red Spatula in your inventory, then tap the bowl!', 'info');
                    }
                  }}
                  title="Tap with Red Spatula to mix dough"
                >
                  <span>
                    🥄 {holdingItem?.id === 'spatula' || holdingItem?.id === 'red_spatula' ? 'Tap Bowl to Mix Dough' : 'Select Red Spatula from Inventory'}
                  </span>
                </div>
              )}
            </MultiStateContainer>
          </div>
        </div>
      </div>

      {/* DOCKED BOTTOM INVENTORY SHELF */}
      <InventoryTray
        title="Station 3 Formulation Ingredients & Mixing Tools"
        items={stage3Inventory}
        onItemClick={handleInventoryClick}
      />
    </div>
  );
};
