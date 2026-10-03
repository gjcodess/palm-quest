import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';
import { MultiStateContainer } from '../components/MultiStateContainer';
import { InventoryTray } from '../components/InventoryTray';
import { RecipeReferenceDrawer } from '../components/RecipeReferenceDrawer';
import { CheckpointQuestionModal } from '../components/CheckpointQuestionModal';
import { STAGE_QUESTIONS } from '../data/stageQuestionsData';

export const Mission2Grinding = () => {
  const { setScene, speak, showToast, completeMission, holdingItem, setHoldingItem, unlockBadge, missionsCompleted, maxUnlockedStage, stageAnswers, recordStageAnswer } = useGame();

  const isAlreadyCompleted = Boolean(missionsCompleted?.mission2);
  const [isCheckpointOpen, setIsCheckpointOpen] = useState(() => !isAlreadyCompleted && !stageAnswers?.mission2);

  const handleCheckpointComplete = (selectedChoice, questionChoices) => {
    const choicesList = questionChoices || STAGE_QUESTIONS.mission2.choices;
    const correctChoice = choicesList.find((c) => c.isCorrect);
    recordStageAnswer('mission2', {
      stageNum: 2,
      stageTitle: STAGE_QUESTIONS.mission2.stageTitle,
      question: STAGE_QUESTIONS.mission2.question,
      selectedOptionId: selectedChoice.displayLetter || selectedChoice.selectedOptionId || selectedChoice.id,
      selectedText: selectedChoice.text,
      isCorrect: selectedChoice.isCorrect,
      reason: selectedChoice.reason,
      explanation: STAGE_QUESTIONS.mission2.explanation,
      choices: choicesList,
      correctOptionId: correctChoice?.displayLetter || correctChoice?.id?.toUpperCase() || 'A',
    });
    setIsCheckpointOpen(false);
  };

  // Processor states: 
  // 0: Empty bowl on motor base -> accept boiled_ubod
  // 1: Boiled ubod in processor -> accept salt_portion
  // 2: Ubod + Salt in processor -> action: lock lid & blend
  // 3: Blending active (spinning vortex)
  // 4: Smooth ubod paste ready -> action: scrape into prep bowl
  // 5: Complete
  const [processorStep, setProcessorStep] = useState(() => (isAlreadyCompleted ? 5 : 0));
  const [blendProgress, setBlendProgress] = useState(0);
  const [isBlending, setIsBlending] = useState(false);
  const [isLidLocked, setIsLidLocked] = useState(() => isAlreadyCompleted);
  const [isScraping, setIsScraping] = useState(false);

  useEffect(() => {
    if (isAlreadyCompleted) {
      speak(
        'Stage 2 complete.',
        'neutral',
        {
          badge: 'Stage 2 Complete',
          note: 'Select proceed to stage 3: paste formulation',
          btnText: 'Select proceed to stage 3: paste formulation',
          onNext: () => setScene('mission3'),
        }
      );
    } else {
      speak(
        'Select the drained ubod from the bowl and place it in the food processor.',
        'neutral',
        {
          badge: 'Step 1: Load Processor',
          note: 'Select the drained ubod in the bowl and drop to the food processor.',
          hint: 'Select the drained ubod in the bowl and drop to the food processor.',
          hideButton: true,
        }
      );
    }
  }, []);

  const processorSteps = [
    {
      stepIndex: 0,
      acceptedItems: ['boiled_ubod'],
      prompt: 'Select the drained ubod from the bowl and place it in the food processor.',
      img: '/assets/processor_empty.webp',
      fallbackIcon: '⚙️',
      label: 'Processor Bowl & S-Blade',
    },
    {
      stepIndex: 1,
      acceptedItems: ['salt_portion', 'salt'],
      prompt: 'Select one teaspoon of salt then drop to the food processor.',
      img: '/assets/processor_with_boiled_ubod.webp',
      fallbackIcon: '🧂',
      label: 'Loaded Ubod in Bowl',
    },
    {
      stepIndex: 2,
      acceptedItems: !isLidLocked ? ['processor_lid', 'lid'] : [],
      prompt: isLidLocked
        ? 'Select “high speed puree” for it to be processed blend well.'
        : 'Select the processor safety lid and place it on the food processor.',
      img: isLidLocked ? '/assets/processor_close_lid.webp' : '/assets/processor_with_ubod_salt.webp',
      fallbackIcon: '🔒',
      label: isLidLocked ? 'Lid Locked & Ready to Puree' : 'Ubod + Salt (Awaiting Safety Lid)',
    },
    {
      stepIndex: 3,
      acceptedItems: [],
      prompt: 'Select “High-Speed Puree” to blend the mixture well.',
      img: '/assets/processor_running_blur.webp',
      fallbackIcon: '🌪️',
      label: 'High-Speed Pureeing',
    },
    {
      stepIndex: 4,
      acceptedItems: ['spatula', 'red_spatula'],
      prompt: 'Select the spatula and drop to the food processor.',
      img: '/assets/processor_open_paste.webp',
      fallbackIcon: '🥣',
      label: 'Silky Ubod Paste (Ready to Scrape)',
    },
    {
      stepIndex: 5,
      acceptedItems: [],
      prompt: 'Select “Proceed to Stage 3: Paste Formulation.”',
      img: '/assets/bowl_ubod_paste_fresh.webp',
      fallbackIcon: '✨',
      label: 'Pureed Ubod Paste (1 Cup Collected)',
    },
  ];

  const handleItemAccepted = (item, stepIndex) => {
    if (stepIndex === 0 && item.id === 'boiled_ubod') {
      soundManager.playPour();
      setProcessorStep(1);
      setHoldingItem(null);
      showToast('Boiled Ubod Loaded!', 'Select one teaspoon of salt then drop to the food processor.', 'success');
      speak(
        'Select one teaspoon of salt and add it to the food processor.',
        'neutral',
        {
          badge: 'Step 2',
          note: 'Select one teaspoon of salt then drop to the food processor.',
          hint: 'Select one teaspoon of salt then drop to the food processor.',
          hideButton: true,
        }
      );
    } else if (stepIndex === 1 && (item.id === 'salt_portion' || item.id === 'salt')) {
      soundManager.playClick();
      setProcessorStep(2);
      setHoldingItem(null);
      showToast('Salt Added!', 'Select the Processor safety lid the drop to the food processor.', 'success');
      speak(
        'Select the processor safety lid and place it on the food processor.',
        'neutral',
        {
          badge: 'Step 3',
          note: 'Select the Processor safety lid the drop to the food processor.',
          hint: 'Select the Processor safety lid the drop to the food processor.',
          hideButton: true,
        }
      );
    } else if (stepIndex === 2 && (item.id === 'processor_lid' || item.id === 'lid')) {
      handleLockLid();
    } else if (stepIndex === 4 && (item.id === 'spatula' || item.id === 'red_spatula')) {
      handleScrapePaste();
    }
  };

  const handleLockLid = () => {
    soundManager.playClick();
    soundManager.playSuccess();
    setHoldingItem(null);
    setIsLidLocked(true);
    showToast('Safety Lid Added!', 'Select “high speed puree” for it to be processed blend well.', 'success');
    speak(
      'Select “High-Speed Puree” to blend the mixture well.',
      'neutral',
      {
        badge: 'Step 4',
        note: 'Select “high speed puree” for it to be processed blend well.',
        hint: 'Select “high speed puree” for it to be processed blend well.',
        hideButton: true,
      }
    );
  };

  const handleStartBlending = () => {
    soundManager.playMotor();
    setIsBlending(true);
    setProcessorStep(3);
    showToast('Pureeing Active!', 'High-speed S-blade pureeing ubod fibers...', 'info');

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setBlendProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setIsBlending(false);
        setProcessorStep(4);
        soundManager.playSuccess();
        showToast('Pureeing Complete!', 'Ubod is now a smooth, lump-free paste', 'success');
        speak(
          'Select the spatula and place it in the food processor.',
          'neutral',
          {
            badge: 'Step 5',
            note: 'Select the spatula and drop to the food processor.',
            hint: 'Select the spatula and drop to the food processor.',
            hideButton: true,
          }
        );
      }
    }, 600);
  };

  const handleScrapePaste = () => {
    if (isScraping || processorStep !== 4) return;
    setHoldingItem(null);
    setIsScraping(true);
    soundManager.playPour();

    setTimeout(() => {
      setIsScraping(false);
      setProcessorStep(5);
      unlockBadge('grind_expert', 'Milling & Pureeing Specialist', '⚙️');
      completeMission('mission2');
      showToast('Stage 2 Complete!', '1 cup of smooth ubod paste collected in clean bowl', 'success');
      speak(
        'Select “Proceed to Stage 3: Paste Formulation.”',
        'neutral',
        {
          badge: 'Step 6',
          note: 'Select proceed to stage 3: paste formulation',
          btnText: 'Select proceed to stage 3: paste formulation',
          onNext: () => setScene('mission3'),
        }
      );
    }, 480);
  };

  const stage2Inventory = [
    {
      id: 'boiled_ubod',
      name: 'Drained Boiled Ubod',
      measure: '1 Cup (Cooked)',
      img: '/assets/colander_ubod_only.webp',
      fallbackIcon: '🥥',
      isUsed: processorStep >= 1,
      isNext: processorStep === 0,
      tooltip: 'Tender boiled ubod drained of cooking liquor, ready for cell rupture milling.',
    },
    {
      id: 'salt_portion',
      name: 'Measured Sea Salt',
      measure: '1 tsp (Per 1 Cup Ubod)',
      img: '/assets/portion_salt_1tsp.webp',
      fallbackIcon: '🧂',
      isUsed: processorStep >= 2,
      isNext: processorStep === 1,
      tooltip: '1 tsp pure sea salt added per cup of boiled ubod for osmotic extraction and seasoning.',
    },
    {
      id: 'processor_lid',
      name: 'Processor Safety Lid',
      measure: 'Interlock Cover',
      img: '/assets/processor_lid.webp',
      fallbackIcon: '🔒',
      isUsed: isLidLocked || processorStep >= 3,
      isNext: processorStep === 2 && !isLidLocked,
      tooltip: 'Safety cover with mechanical interlock tab. Must be locked before motor activates.',
    },
    {
      id: 'spatula',
      name: 'Red Spatula',
      measure: 'Scrape & Transfer',
      img: '/assets/tool_spatula_red.webp',
      fallbackIcon: '🥄',
      isUsed: processorStep >= 5,
      isNext: processorStep === 4,
      tooltip: 'Flexible silicone spatula to thoroughly scrape pureed paste into the prep bowl.',
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
        icon: item.fallbackIcon || '⚙️',
      });
      if (item.id === 'boiled_ubod') {
        showToast('Boiled Ubod Selected', 'Tap the food processor bowl to load.', 'info');
      } else if (item.id === 'salt_portion') {
        showToast('Sea Salt Selected', 'Tap the food processor to add 1 tsp salt.', 'info');
      } else if (item.id === 'processor_lid') {
        showToast('Safety Lid Selected', 'Tap the food processor to attach and lock lid.', 'info');
      } else if (item.id === 'spatula') {
        showToast('Spatula Selected', 'Tap the bowl to scrape pureed paste into prep bowl.', 'info');
      }
    }
  };

  const recipeItems = [
    { name: 'Boiled Ubod Palm', measure: '1 Cup', icon: '🥥', isCompleted: processorStep >= 1, isCurrent: processorStep === 0 },
    { name: 'Pure Sea Salt', measure: '1 tsp (Per Cup)', icon: '🧂', isCompleted: processorStep >= 2, isCurrent: processorStep === 1 },
  ];

  const safetyChecklist = [
    {
      title: 'Electrical & Appliance Check',
      desc: 'Check electrical wiring, wall outlet, and processor housing before plugging in.',
      icon: '🔌',
      isWarning: true,
    },
    {
      title: 'Safety Interlock Rule',
      desc: 'Always lock safety lid securely before starting motor; never operate exposed blades.',
      icon: '🔒',
      isWarning: true,
    },
    {
      title: 'Clean Towel Drying',
      desc: 'Ensure all parts are dried thoroughly with a clean towel after cleaning.',
      icon: '🧼',
      isWarning: false,
    },
  ];

  return (
    <div className="workstation-scene grinding-scene">
      <div className="workstation-overlay" />

      {/* Stage 2 Pre-Check Question Modal */}
      <CheckpointQuestionModal
        isOpen={isCheckpointOpen}
        stageTitle={STAGE_QUESTIONS.mission2.stageTitle}
        question={STAGE_QUESTIONS.mission2.question}
        choices={STAGE_QUESTIONS.mission2.choices}
        explanation={STAGE_QUESTIONS.mission2.explanation}
        onComplete={handleCheckpointComplete}
      />

      {/* Main Center Cooking Countertop */}
      <div className="stage-center-zone">
        {/* Floating Quick Recipe & Safety Drawer */}
        <RecipeReferenceDrawer
          stageTitle="Stage 2: Food Processing"
          recipeItems={recipeItems}
          safetyNotes={safetyChecklist}
          culinaryTip="Processing the boiled coconut palm until it becomes fine and paste-like ensures smooth starch incorporation in Stage 3, producing uniform crackers without hard fibrous pockets."
        />

        <div className="stage-content-row stage-single-workstation">
          {/* Centered Electric Food Processor Workstation */}
          <div className="station-center-card">
            <MultiStateContainer
              containerId="food_processor"
              title="Electric Food Processor"
              subtitle="Stage 2: High-Speed Pureeing to Fine Paste"
              currentStepIndex={processorStep}
              steps={processorSteps}
              stepNumber={processorStep + 1}
              stepTotal={6}
              onItemAccepted={handleItemAccepted}
              activeAnimation={isBlending ? 'blending' : null}
              containerWidth="100%"
              statusDotClass={processorStep >= 5 ? 'dot-success' : processorStep >= 1 ? 'dot-amber' : ''}
              statusText={
                isBlending
                  ? `⚡ Pureeing boiled fibers at high speed... ${blendProgress}%`
                  : isLidLocked && processorStep === 2
                  ? 'Select “high speed puree” for it to be processed blend well.'
                  : processorSteps[processorStep]?.prompt || 'Ready'
              }
              specBadge={
                <span
                  className={`spec-badge ${
                    processorStep >= 5
                      ? 'spec-success'
                      : processorStep >= 1
                      ? 'spec-amber'
                      : ''
                  }`}
                >
                  {processorStep >= 5
                    ? 'PASTE: COLLECTED (1 CUP)'
                    : processorStep === 4
                    ? 'ACTION: SCRAPE'
                    : processorStep === 3
                    ? 'MOTOR: HIGH (12,000 RPM)'
                    : processorStep === 2 && isLidLocked
                    ? 'LID: LOCKED & SAFE'
                    : processorStep === 2
                    ? 'LID: UNLOCKED (INTERLOCK)'
                    : processorStep === 1
                    ? 'SALT: 1 TSP / CUP'
                    : 'UBOD: 1 CUP'}
                </span>
              }
              interactiveAction={
                processorStep === 2 && isLidLocked
                  ? {
                      label: 'High-Speed Puree',
                      onClick: handleStartBlending,
                      icon: '⚡',
                      variant: 'processor-pulse',
                    }
                  : processorStep === 4
                  ? {
                      label: 'Scrape with Spatula',
                      onClick: handleScrapePaste,
                      icon: '🥄',
                      variant: 'btn-action-scrape',
                    }
                  : processorStep === 3
                  ? {
                      label: `Pureeing... ${blendProgress}%`,
                      disabled: true,
                      icon: '⚡',
                      variant: 'processor-pulse',
                      isActive: true,
                    }
                  : null
              }
            >
              {/* Spatula Scraping Motion Overlay */}
              {isScraping && (
                <div className="spatula-scraping-overlay">
                  <img
                    src="/assets/tool_spatula_red.webp"
                    alt="Scraping Spatula"
                    className="spatula-wiping-anim"
                  />
                </div>
              )}

              {/* Step 4 Spatula Guidance Guide */}
              {processorStep === 4 && !isScraping && (
                <div
                  className="spatula-scrape-guide"
                  onClick={() => {
                    if (holdingItem?.id === 'spatula' || holdingItem?.id === 'red_spatula') {
                      handleScrapePaste();
                    } else {
                      soundManager.playClick();
                      showToast('Select Spatula First', 'Click the Red Spatula in your inventory, then tap here to scrape!', 'info');
                    }
                  }}
                  title="Tap with Red Spatula to scrape"
                >
                  <span>
                    🥄 {holdingItem?.id === 'spatula' || holdingItem?.id === 'red_spatula' ? 'Tap Bowl to Scrape Paste' : 'Select Red Spatula from Inventory'}
                  </span>
                </div>
              )}

              {processorStep === 2 && !isLidLocked && (
                <div
                  className="lid-interlock-guide"
                  onClick={() => {
                    if (holdingItem?.id === 'processor_lid' || holdingItem?.id === 'lid') {
                      handleLockLid();
                    } else {
                      soundManager.playClick();
                      showToast('Select Safety Lid First', 'Click the Processor Safety Lid in your inventory, then place on bowl!', 'info');
                    }
                  }}
                  title="Place Processor Safety Lid onto bowl"
                >
                  <span>
                    🔒 {holdingItem?.id === 'processor_lid' || holdingItem?.id === 'lid' ? 'Tap Bowl to Lock Safety Lid' : 'Select Safety Lid from Inventory'}
                  </span>
                </div>
              )}
            </MultiStateContainer>
          </div>
        </div>
      </div>

      {/* DOCKED BOTTOM INVENTORY SHELF */}
      <InventoryTray
        title="Station 2 Processing Ingredients & Tools"
        items={stage2Inventory}
        onItemClick={handleInventoryClick}
      />
    </div>
  );
};
