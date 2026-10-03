import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';
import { MultiStateContainer } from '../components/MultiStateContainer';
import { InventoryTray } from '../components/InventoryTray';
import { StoveBurnerConsole } from '../components/StoveBurnerConsole';
import { CheckpointQuestionModal } from '../components/CheckpointQuestionModal';
import { RecipeReferenceDrawer } from '../components/RecipeReferenceDrawer';
import { STAGE_QUESTIONS } from '../data/stageQuestionsData';

export const Mission7Frying = () => {
  const { setScene, unlockBadge, speak, showToast, completeMission, holdingItem, setHoldingItem, missionsCompleted, stageAnswers, recordStageAnswer } = useGame();

  const isAlreadyCompleted = Boolean(missionsCompleted?.mission7);
  const [isCheckpointOpen, setIsCheckpointOpen] = useState(() => !isAlreadyCompleted && !stageAnswers?.mission7);

  const handleCheckpointComplete = (selectedChoice, questionChoices) => {
    const choicesList = questionChoices || STAGE_QUESTIONS.mission7.choices;
    const correctChoice = choicesList.find((c) => c.isCorrect);
    recordStageAnswer('mission7', {
      stageNum: 7,
      stageTitle: STAGE_QUESTIONS.mission7.stageTitle,
      question: STAGE_QUESTIONS.mission7.question,
      selectedOptionId: selectedChoice.displayLetter || selectedChoice.selectedOptionId || selectedChoice.id,
      selectedText: selectedChoice.text,
      isCorrect: selectedChoice.isCorrect,
      reason: selectedChoice.reason,
      explanation: STAGE_QUESTIONS.mission7.explanation,
      choices: choicesList,
      correctOptionId: correctChoice?.displayLetter || correctChoice?.id?.toUpperCase() || 'A',
    });
    setIsCheckpointOpen(false);
  };

  // Frying states:
  // 0: Empty pan on stove -> accept cooking_oil (5 cups)
  // 1: Oil in pan -> click burner dial to preheat oil
  // 2: Oil preheated over medium heat -> accept dehydrated_pellets
  // 3: Pellets in oil -> 10-second flash expansion active
  // 4: Flash puff complete (10s) -> accept colander / tongs to lift & drain
  // 5: Crackers in colander draining excess oil -> action: allow to cool completely / transfer to platter
  // 6: Cooled & Crispy on Platter -> Complete!
  const [fryStep, setFryStep] = useState(() => (isAlreadyCompleted ? 6 : 0));
  const [oilTemp, setOilTemp] = useState(() => (isAlreadyCompleted ? 180 : 25));
  const [isHeatingOil, setIsHeatingOil] = useState(false);
  const [puffProgress, setPuffProgress] = useState(0);
  const [isPuffing, setIsPuffing] = useState(false);
  const isBurnerOn = isHeatingOil || fryStep === 2 || fryStep === 3;

  useEffect(() => {
    if (isAlreadyCompleted) {
      speak(
        'Stage 7 complete.',
        'neutral',
        {
          badge: 'Stage 7 Complete: Flash Expansion',
          note: 'Click “Proceed to stage 8”',
          btnText: 'Click “Proceed to stage 8”',
          onNext: () => setScene('mission8'),
        }
      );
    } else {
      speak(
        'Select the oil and add it to the pan.',
        'neutral',
        {
          badge: 'Step 1: Oil Loading & Preheating',
          note: 'Select oil then drop to the pan',
          hint: 'Select oil then drop to the pan',
          hideButton: true,
        }
      );
    }
  }, []);

  const frySteps = [
    {
      stepIndex: 0,
      acceptedItems: ['cooking_oil', 'portion_oil_5cups', 'oil_pitcher', 'vegetable_oil', 'oil', 'ing_oil_fresh'],
      prompt: 'Select oil then drop to the pan',
      img: '/assets/frying_pan_empty.webp',
      fallbackIcon: '🍳',
      label: 'Empty Frying Pan',
    },
    {
      stepIndex: 1,
      acceptedItems: [],
      prompt: 'Click stove medium heat',
      img: '/assets/frying_pan_with_oil.webp',
      fallbackIcon: '🛢️',
      label: 'Pan with 5 Cups Oil (Cold)',
    },
    {
      stepIndex: 2,
      acceptedItems: ['dehydrated_pellets', 'pellets', 'tongs_chip', 'container_dehydrated_chips', 'dehydrated_chips', 'storage_container'],
      prompt: 'Select the dehydrated ubod then drop to the pan and cook for 10 seconds',
      img: '/assets/frying_pan_oil_hot.webp',
      fallbackIcon: '🔥',
      label: 'Preheated Oil (Medium Heat)',
    },
    {
      stepIndex: 3,
      acceptedItems: [],
      prompt: 'Select the dehydrated ubod then drop to the pan and cook for 10 seconds',
      img: '/assets/frying_pan_frying_puffing.webp',
      fallbackIcon: '💥',
      label: '10-Second Flash Expansion',
    },
    {
      stepIndex: 4,
      acceptedItems: ['colander', 'tool_colander_safe', 'skimmer', 'tongs', 'tool_tongs_stainless'],
      prompt: 'Select stainless colander then drop to the pan with cooked crackers',
      img: '/assets/tongs_holding_puffed_cracker.webp',
      fallbackIcon: '🥢',
      label: 'Expanded Cracker on Tongs',
    },
    {
      stepIndex: 5,
      acceptedItems: ['platter', 'icon_cracker_platter', 'platter_empty'],
      prompt: 'Select the plate and drop to center to cool down',
      img: '/assets/colander_fried_crackers_draining.webp',
      fallbackIcon: '🥣',
      label: 'Draining Oil in Colander',
    },
    {
      stepIndex: 6,
      acceptedItems: [],
      prompt: 'Click “Proceed to stage 8”',
      img: '/assets/platter_crackers_cooled.webp',
      fallbackIcon: '✨',
      label: 'Cooled Crispy Crackers',
    },
  ];

  const handleItemAccepted = (item, stepIndex) => {
    if (stepIndex === 0 && (item.id === 'cooking_oil' || item.id === 'portion_oil_5cups' || item.id === 'oil_pitcher' || item.id === 'vegetable_oil' || item.id === 'oil' || item.id === 'ing_oil_fresh')) {
      soundManager.playPour();
      setFryStep(1);
      setHoldingItem(null);
      showToast('Oil Added!', '5 Cups of oil loaded. Click the burner dial to preheat.', 'success');
      speak(
        'Set the stove to medium heat.',
        'neutral',
        {
          badge: 'Step 2',
          note: 'Click stove medium heat',
          hint: 'Click stove medium heat',
          hideButton: true,
        }
      );
    } else if (stepIndex === 2 && (item.id === 'dehydrated_pellets' || item.id === 'pellets' || item.id === 'tongs_chip' || item.id === 'container_dehydrated_chips' || item.id === 'dehydrated_chips' || item.id === 'storage_container')) {
      handleStartFlashFrying();
    } else if (stepIndex === 4 && (item.id === 'colander' || item.id === 'tool_colander_safe' || item.id === 'skimmer' || item.id === 'tongs' || item.id === 'tool_tongs_stainless')) {
      handleLiftToColander();
    } else if (stepIndex === 5 && (item.id === 'platter' || item.id === 'icon_cracker_platter' || item.id === 'platter_empty')) {
      handleTransferToPlatter();
    }
  };

  const handlePreheatOil = () => {
    soundManager.playIgnite?.() || soundManager.playBoil();
    setIsHeatingOil(true);
    showToast('Burner Ignited!', 'Preheating 5 cups vegetable oil over medium heat...', 'info');

    let current = 25;
    const interval = setInterval(() => {
      current += 31;
      setOilTemp(Math.min(180, current));
      if (current >= 180) {
        clearInterval(interval);
        setOilTemp(180);
        setIsHeatingOil(false);
        setFryStep(2);
        soundManager.playSuccess();
        showToast('Oil Ready!', 'Optimal frying temperature reached. Drop dehydrated pieces!', 'success');
        speak(
          'Select the dehydrated ubod, add it to the pan, and cook it for 10 seconds.',
          'neutral',
          {
            badge: 'Step 3',
            note: 'Select the dehydrated ubod then drop to the pan and cook for 10 seconds',
            hint: 'Select the dehydrated ubod then drop to the pan and cook for 10 seconds',
            hideButton: true,
          }
        );
      }
    }, 400);
  };

  const handleStartFlashFrying = () => {
    soundManager.playSizzle();
    setIsPuffing(true);
    setFryStep(3);
    setHoldingItem(null);
    showToast('Flash Frying!', '10-second flash expansion active! Starches puffing...', 'info');
    speak(
      'Select the dehydrated ubod, add it to the pan, and cook it for 10 seconds.',
      'neutral',
      {
        badge: 'Step 3',
        note: 'Select the dehydrated ubod then drop to the pan and cook for 10 seconds',
        hint: 'Select the dehydrated ubod then drop to the pan and cook for 10 seconds',
        hideButton: true,
      }
    );

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setPuffProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsPuffing(false);
        setFryStep(4);
        soundManager.playSuccess();
        showToast('Frying Complete!', 'Crackers are golden and crispy. Use colander to lift and drain!', 'success');
        speak(
          'Select the stainless colander and place it in the pan with the cooked crackers.',
          'neutral',
          {
            badge: 'Step 4',
            note: 'Select stainless colander then drop to the pan with cooked crackers',
            hint: 'Select stainless colander then drop to the pan with cooked crackers',
            hideButton: true,
          }
        );
      }
    }, 400);
  };

  const handleLiftToColander = () => {
    soundManager.playClick();
    setFryStep(5);
    setHoldingItem(null);
    showToast('Draining in Colander!', 'Excess oil draining. Step 4: Allow crackers to cool completely.', 'info');
    speak(
      'Select the plate and place it in the center to cool down.',
      'neutral',
      {
        badge: 'Step 5',
        note: 'Select the plate and drop to center to cool down',
        hint: 'Select the plate and drop to center to cool down',
        hideButton: true,
      }
    );
  };

  const handleTransferToPlatter = () => {
    soundManager.playClick();
    setFryStep(6);
    setHoldingItem(null);
    unlockBadge('fry_artisan', 'Flash Expansion Specialist', '🍳');
    completeMission('mission7');
    showToast('Stage 7 Complete!', 'Crackers are crispy, drained of oil, and completely cooled', 'success');
    speak(
      'Click “Proceed to Stage 8.”',
      'neutral',
      {
        badge: 'Step 6',
        note: 'Click “Proceed to stage 8”',
        btnText: 'Click “Proceed to stage 8”',
        onNext: () => setScene('mission8'),
      }
    );
  };

  const stage7Inventory = [
    {
      id: 'cooking_oil',
      name: 'Vegetable Cooking Oil',
      measure: '5 Cups (Deep Frying)',
      img: '/assets/portion_oil_5cups.webp',
      fallbackIcon: '🫗',
      isUsed: fryStep >= 1,
      isNext: fryStep === 0,
      tooltip: 'High smoke-point vegetable oil heated to high-temperature range for instantaneous expansion.',
    },
    {
      id: 'dehydrated_pellets',
      name: 'Dehydrated Pellets',
      measure: '<8% Moisture Pellets',
      img: '/assets/container_dehydrated_chips.webp',
      fallbackIcon: '📦',
      isUsed: fryStep >= 3,
      isNext: fryStep === 2,
      tooltip: 'Glassy dry pellets whose internal moisture flashes to steam, ballooning the cracker.',
    },
    {
      id: 'colander',
      name: 'Draining Colander',
      measure: 'Paper Towel Lined',
      img: '/assets/tool_colander_safe.webp',
      fallbackIcon: '🥣',
      isUsed: fryStep >= 5,
      isNext: fryStep === 4,
      tooltip: 'Perforated colander with absorbent paper to drain excess oil and preserve crispness.',
    },
    {
      id: 'platter',
      name: 'Presentation Platter',
      measure: 'Finished Batch Platter',
      img: '/assets/platter_empty.webp',
      fallbackIcon: '✨',
      isUsed: fryStep >= 6,
      isNext: fryStep === 5,
      tooltip: 'Sanitized tray for cooling golden, airy, non-greasy ubod kropek crackers.',
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
        icon: item.fallbackIcon || '🍳',
      });
      if (item.id === 'cooking_oil' || item.id === 'oil_pitcher') {
        showToast('Oil Selected', 'Tap the frying pan to pour 5 cups oil.', 'info');
      } else if (item.id === 'dehydrated_pellets' || item.id === 'dehydrated_chips') {
        showToast('Dehydrated Pellets Selected', 'Tap the preheated oil to flash fry.', 'info');
      } else if (item.id === 'colander' || item.id === 'tongs') {
        showToast('Colander Selected', 'Tap the pan to remove fried crackers to colander.', 'info');
      } else if (item.id === 'platter') {
        showToast('Platter Selected', 'Tap the colander to transfer crackers to cool.', 'info');
      }
    }
  };

  const recipeItems = [
    { name: 'Vegetable Oil', measure: '5 Cups', icon: '🛢️', isCompleted: fryStep >= 1, isCurrent: fryStep === 0 },
    { name: 'Frying Duration', measure: '~10 Seconds', icon: '⏱️', isCompleted: fryStep >= 4, isCurrent: fryStep === 3 },
    { name: 'Oil Drainage', measure: 'Colander Drain', icon: '🥣', isCompleted: fryStep >= 5, isCurrent: fryStep === 4 },
  ];

  const safetyChecklist = [
    {
      title: 'Hot Oil Safety Distance',
      desc: 'Keep a safe distance from the hot oil and always use long tongs when handling crackers.',
      icon: '🔥',
      isWarning: true,
    },
    {
      title: 'No Thin Gloves Near Oil',
      desc: 'Never wear thin disposable plastic gloves near hot oil as they can melt; use stainless tongs.',
      icon: '🥢',
      isWarning: true,
    },
    {
      title: 'Complete Cooling (Step 22)',
      desc: 'Allow crackers to cool completely to room temperature before proceeding to packaging.',
      icon: '❄️',
      isWarning: false,
    },
  ];

  return (
    <div className="workstation-scene frying-scene">
      <div className="workstation-overlay" />

      {/* Stage 7 Pre-Check Question Modal */}
      <CheckpointQuestionModal
        isOpen={isCheckpointOpen}
        stageTitle={STAGE_QUESTIONS.mission7.stageTitle}
        question={STAGE_QUESTIONS.mission7.question}
        choices={STAGE_QUESTIONS.mission7.choices}
        explanation={STAGE_QUESTIONS.mission7.explanation}
        onComplete={handleCheckpointComplete}
      />

      {/* Main Center Cooking Countertop */}
      <div className="stage-center-zone">
        {/* Floating Quick Recipe & Safety Drawer */}
        <RecipeReferenceDrawer
          stageTitle="Stage 7: Flash Frying"
          recipeItems={recipeItems}
          safetyNotes={safetyChecklist}
          culinaryTip="Flash frying takes only 10 seconds in preheated oil. The remaining moisture inside the dehydrated pieces expands rapidly into steam, creating a light, airy, ultra-crisp texture."
        />

        <div className="stage-content-row stage-single-workstation">
          {/* Center: Frying Pan MultiStateContainer */}
          <div className="station-center-card">
            <MultiStateContainer
              containerId="frying_pan"
              title="Heavy-Gauge Frying Pan"
              subtitle="Stage 7: high-temperature Flash Frying (10 sec) & Oil Drainage"
              currentStepIndex={fryStep}
              steps={frySteps}
              stepNumber={fryStep === 3 ? 3 : fryStep >= 4 ? fryStep : fryStep + 1}
              stepTotal={6}
              onItemAccepted={handleItemAccepted}
              activeAnimation={isHeatingOil || isPuffing ? 'sizzling' : fryStep === 2 || fryStep === 3 ? 'sizzling' : null}
              containerWidth="100%"
              statusDotClass={fryStep >= 6 ? 'dot-success' : fryStep >= 2 ? 'dot-amber' : ''}
              statusText={
                isPuffing
                  ? `💥 Flash expansion in progress... ${puffProgress}%`
                  : isHeatingOil
                  ? `🔥 Preheating oil over medium heat... ${oilTemp}°C`
                  : frySteps[fryStep]?.prompt || 'Ready'
              }
              specBadge={
                <span
                  className={`spec-badge ${
                    fryStep >= 6 ? 'spec-success' : fryStep >= 2 ? 'spec-amber' : ''
                  }`}
                >
                  {fryStep >= 6
                    ? 'CRISP: COOLED'
                    : fryStep === 5
                    ? 'DRAIN: COLANDER'
                    : fryStep === 4
                    ? 'STATUS: PUFFED'
                    : fryStep === 3
                    ? 'TIME: 10 SEC'
                    : fryStep === 2
                    ? 'OIL: PREHEATED'
                    : fryStep === 1
                    ? 'OIL: 5 CUPS'
                    : 'HEAT: MEDIUM'}
                </span>
              }
              customFooter={
                <StoveBurnerConsole
                  isIgnited={isBurnerOn}
                  isActive={isBurnerOn}
                  isReady={fryStep === 1}
                  isComplete={fryStep >= 4}
                  progress={
                    isHeatingOil
                      ? Math.round((oilTemp / 180) * 100)
                      : isPuffing
                      ? puffProgress
                      : 100
                  }
                  onIgnite={handlePreheatOil}
                  standbyHint={fryStep === 0 ? 'Pour 5 cups vegetable oil first' : 'Turn dial to ignite'}
                  readyHint="👉 Click dial to preheat oil"
                  activeHint={
                    isHeatingOil
                      ? '🔥 Preheating oil...'
                      : isPuffing
                      ? () => `💥 Flash frying... ${puffProgress}%`
                      : '🔥 Oil at high-temperature — Add dehydrated pellets!'
                  }
                  completeHint="✓ Frying complete • Burner extinguished"
                  modeTitleIgnited={
                    isHeatingOil
                      ? 'MEDIUM HEAT: PREHEATING'
                      : isPuffing
                      ? 'FLASH EXPANSION (10s)'
                      : 'MEDIUM HEAT: high-temperature READY'
                  }
                  modeTitleActive={
                    isHeatingOil
                      ? 'MEDIUM HEAT: PREHEATING'
                      : isPuffing
                      ? 'FLASH EXPANSION (10s)'
                      : 'MEDIUM HEAT: high-temperature READY'
                  }
                  modeTitleReady="IGNITE BURNER"
                  modeTitleStandby="BURNER: OFF"
                  modeTitleComplete="BURNER: OFF (COOKED)"
                  disabled={isBurnerOn || fryStep >= 4}
                />
              }
            />
          </div>
        </div>
      </div>

      {/* DOCKED BOTTOM INVENTORY SHELF */}
      <InventoryTray
        title="Station 7 Frying Materials & Tongs"
        items={stage7Inventory}
        onItemClick={handleInventoryClick}
      />
    </div>
  );
};
