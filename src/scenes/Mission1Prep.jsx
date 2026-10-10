import { useActivityInterval } from '../hooks/useActivityInterval';
import { useSessionState } from '../hooks/useSessionState';
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';
import { MultiStateContainer } from '../components/MultiStateContainer';
import { InventoryTray } from '../components/InventoryTray';
import { StoveBurnerConsole } from '../components/StoveBurnerConsole';
import { FaucetKnobConsole } from '../components/FaucetKnobConsole';
import { RecipeReferenceDrawer } from '../components/RecipeReferenceDrawer';
import { CheckpointQuestionModal } from '../components/CheckpointQuestionModal';
import { STAGE_QUESTIONS } from '../data/stageQuestionsData';

export const Mission1Prep = () => {
  const { isRestoringSession, setScene, speak, showToast, completeMission, holdingItem, setHoldingItem, unlockBadge, missionsCompleted, maxUnlockedStage, stageAnswers, recordStageAnswer, recordMistake } = useGame();

  const isAlreadyCompleted = Boolean(missionsCompleted?.mission1);
  const [isCheckpointOpen, setIsCheckpointOpen] = useState(() => !isAlreadyCompleted && !stageAnswers?.mission1);

  const handleCheckpointComplete = (selectedChoice, questionChoices) => {
    const choicesList = questionChoices || STAGE_QUESTIONS.mission1.choices;
    const correctChoice = choicesList.find((c) => c.isCorrect);
    recordStageAnswer('mission1', {
      stageNum: 1,
      stageTitle: STAGE_QUESTIONS.mission1.stageTitle,
      question: STAGE_QUESTIONS.mission1.question,
      selectedOptionId: selectedChoice.id,
      selectedDisplayLetter: selectedChoice.displayLetter,
      selectedText: selectedChoice.text,
      isCorrect: selectedChoice.isCorrect,
      reason: selectedChoice.reason,
      explanation: STAGE_QUESTIONS.mission1.explanation,
      choices: choicesList,
      correctOptionId: correctChoice?.id,
      correctDisplayLetter: correctChoice?.displayLetter,
    });
    setIsCheckpointOpen(false);
  };

  // Wash step states:
  // 1. isUbodInColander (false -> place raw_ubod into sink colander -> becomes sink_colander_ubod)
  // 2. isWashingActive (running water animation with sink_colander_washing)
  // 3. isWashed (true -> ubod sanitized, ready to load in pot)
  const [isUbodInColander, setIsUbodInColander] = useSessionState('mission1.isUbodInColander', () => isAlreadyCompleted);
  const [isWashed, setIsWashed] = useSessionState('mission1.isWashed', () => isAlreadyCompleted);
  const [isWashingActive, setIsWashingActive] = useState(false);

  // Pot state: 0: empty, 1: +ubod, 2: +water, 3: +salt, 4: boiling complete, 5: drained in sink
  const [potStep, setPotStep] = useSessionState('mission1.potStep', () => (isAlreadyCompleted ? 5 : 0));
  const [isBoilingTimerActive, setIsBoilingTimerActive] = useSessionState('mission1.isBoilingTimerActive', false);
  const [boilProgress, setBoilProgress] = useSessionState('mission1.boilProgress', 0);

  // Post-Boil Step 6: Cooling Rinse & Residue Wash in Sink
  const [isCoolingRinseActive, setIsCoolingRinseActive] = useState(false);
  const [isCoolingRinseComplete, setIsCoolingRinseComplete] = useSessionState('mission1.isCoolingRinseComplete', () => isAlreadyCompleted);

  // Single-workstation sequential phase: 'wash' -> 'boil' -> 'drain_rinse'
  const [currentPhase, setCurrentPhase] = useSessionState('mission1.currentPhase', () => {
    if (isAlreadyCompleted || potStep >= 5) return 'drain_rinse';
    if (isWashed || potStep >= 1) return 'boil';
    return 'wash';
  });

  // Active colander draining transition state
  const [isDrainingActive, setIsDrainingActive] = useState(false);

  useEffect(() => {
    // Recover a reload between the completed rinse and its delayed phase change.
    if (isRestoringSession && isWashed && currentPhase === 'wash') setCurrentPhase('boil');
  }, [isRestoringSession, isWashed, currentPhase]);

  // Error Shake & Nudge Feedback
  const [sinkShake, setSinkShake] = useState(false);
  const sinkShakeTimeoutRef = React.useRef(null);

  const triggerSinkError = (msg = "This action cannot be done right now. Check Teacher Mia's instructions!") => {
    soundManager.playError();
    if (recordMistake) recordMistake();

    if (sinkShakeTimeoutRef.current) {
      clearTimeout(sinkShakeTimeoutRef.current);
    }

    setSinkShake(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSinkShake(true);
        sinkShakeTimeoutRef.current = setTimeout(() => {
          setSinkShake(false);
        }, 450);
      });
    });

    showToast('Incorrect Order', msg, 'danger');
  };

  useEffect(() => {
    if (isRestoringSession && !isAlreadyCompleted) return;
    if (isAlreadyCompleted) {
      speak(
        'Stage 1 complete.',
        'neutral',
        {
          badge: 'Stage 1 Complete',
          note: 'Click the “Proceed to stage 2”',
          btnText: 'Click the “Proceed to stage 2”',
          onNext: () => setScene('mission2'),
        }
      );
    } else {
      speak(
        'Select the raw ubod and place it in the sink',
        'neutral',
        {
          badge: 'Step 1',
          note: 'Select the raw ubod and place it in the sink',
          hint: 'Select the raw ubod and place it in the sink',
          hideButton: true,
        }
      );
    }
  }, []);

  // MultiStateContainer step configurations for the Boiling Pot
  const potSteps = [
    {
      stepIndex: 0,
      acceptedItems: ['washed_ubod'],
      prompt: 'Select the washed ubod. Put in the pot.',
      img: '/assets/pot_empty.webp',
      fallbackIcon: '🥣',
      label: 'Empty Cooking Pot',
    },
    {
      stepIndex: 1,
      acceptedItems: ['water_pitcher', 'water', 'portion_water'],
      prompt: 'Select water then drop to the pot.',
      img: '/assets/pot_with_ubod.webp',
      fallbackIcon: '💧',
      label: 'Cooking Pot with Ubod',
    },
    {
      stepIndex: 2,
      acceptedItems: ['sea_salt', 'salt', 'ing_salt_fresh'],
      prompt: 'Select salt then drop to the pot.',
      img: '/assets/pot_with_ubod_water.webp',
      fallbackIcon: '🧂',
      label: 'Submerged Ubod in Water',
    },
    {
      stepIndex: 3,
      acceptedItems: [],
      prompt: 'Click “Ignite burner” to boil the ubod',
      img: isBoilingTimerActive ? '/assets/pot_boiling_on_stove.webp' : '/assets/pot_with_ubod_water_salt.webp',
      fallbackIcon: '♨️',
      label: isBoilingTimerActive ? 'Rolling Boil (100°C)' : 'Seasoned Ubod Ready to Boil',
    },
    {
      stepIndex: 4,
      acceptedItems: ['colander', 'stainless_colander', 'tool_colander_safe'],
      prompt: isDrainingActive
        ? 'Select stainless colander then drop to the pot.'
        : 'Select stainless colander then drop to the pot.',
      img: isDrainingActive ? '/assets/colander_boiled_ubod_draining.webp' : '/assets/pot_boiling_done.webp',
      fallbackIcon: '🥘',
      label: isDrainingActive ? 'Draining in Colander...' : 'Fork-Tender Boiled Ubod (Ready to Drain)',
    },
    {
      stepIndex: 5,
      acceptedItems: [],
      prompt: isCoolingRinseComplete
        ? 'Click “Turn faucet to cool” so the ubod will be cooled and drained'
        : 'Click “Turn faucet to cool” so the ubod will be cooled and drained',
      img: '/assets/pot_empty.webp',
      fallbackIcon: '✨',
      label: 'Emptied Cooking Pot (Contents Drained)',
    },
  ];

  const handlePlaceRawUbodInColander = () => {
    if (isUbodInColander) return;
    soundManager.playClick();
    soundManager.playPour();
    setIsUbodInColander(true);
    setHoldingItem(null);
    showToast('Step 1', 'Select the raw ubod and place it in the sink', 'success');
    speak(
      'Select the raw ubod and place it in the sink.\n\nClick the cross handle to rinse the ubod thoroughly.',
      'happy',
      {
        badge: 'Step 2',
        note: 'Click the “Click cross to rinse” to full washed the ubod',
        hint: 'Click the “Click cross to rinse” to full washed the ubod',
        hideButton: true,
      }
    );
  };

  const handleWashUbod = () => {
    if (isWashingActive || isWashed || !isUbodInColander) return;
    setIsWashingActive(true);
    soundManager.playPour();

    setTimeout(() => {
      setIsWashingActive(false);
      setIsWashed(true);
      soundManager.playSuccess();
      showToast('Step 2', 'Click the “Click cross to rinse” to full washed the ubod', 'success');
      setTimeout(() => {
        setCurrentPhase('boil');
        speak(
        'Select the washed ubod and place it in the pot.',
          'happy',
          {
            badge: 'Step 3',
            note: 'Select the washed ubod. Put in the pot.',
            hint: 'Select the washed ubod. Put in the pot.',
            hideButton: true,
          }
        );
      }, 700);
    }, 1200);
  };

  const handleItemAccepted = (item, stepIndex) => {
    if (stepIndex === 0 && item.id === 'washed_ubod') {
      soundManager.playPour();
      setPotStep(1);
      showToast('Step 3', 'Select the washed ubod. Put in the pot.', 'success');
      speak(
        'Select the water and add it to the pot.',
        'neutral',
        {
          badge: 'Step 4',
          note: 'Select water then drop to the pot.',
          hint: 'Select water then drop to the pot.',
          hideButton: true,
        }
      );
    } else if (stepIndex === 1 && (item.id === 'water_pitcher' || item.id === 'water' || item.id === 'portion_water')) {
      soundManager.playPour();
      setPotStep(2);
      showToast('Step 4', 'Select water then drop to the pot.', 'success');
      speak(
        'Select the salt and add it to the pot.',
        'neutral',
        {
          badge: 'Step 5',
          note: 'Select salt then drop to the pot.',
          hint: 'Select salt then drop to the pot.',
          hideButton: true,
        }
      );
    } else if (stepIndex === 2 && (item.id === 'sea_salt' || item.id === 'salt' || item.id === 'ing_salt_fresh')) {
      soundManager.playClick();
      setPotStep(3);
      showToast('Step 5', 'Select salt then drop to the pot.', 'success');
      speak(
        'Click “Ignite burner” to boil the ubod',
        'thinking',
        {
          badge: 'Step 6',
          note: 'Click “Ignite burner” to boil the ubod',
          hint: 'Click “Ignite burner” to boil the ubod',
          hideButton: true,
        }
      );
    } else if (stepIndex === 4 && (item.id === 'colander' || item.id === 'stainless_colander' || item.id === 'tool_colander_safe')) {
      handleDrainUbod();
    }
  };

  const handleIgniteBurner = () => {
    soundManager.playBoil();
    setIsBoilingTimerActive(true);
    showToast('Step 6', 'Click “Ignite burner” to boil the ubod', 'info');

  };

  useActivityInterval(isBoilingTimerActive, () => {
      const current = boilProgress + 20;
      setBoilProgress(current);
      if (current >= 100) {
        setIsBoilingTimerActive(false);
        setPotStep(4);
        soundManager.playSuccess();
        showToast('Step 7', 'Select stainless colander then drop to the pot.', 'success');
        speak(
          'Select the stainless colander and place it in the pot.',
          'happy',
          {
            badge: 'Step 7',
            note: 'Select stainless colander then drop to the pot.',
            hint: 'Select stainless colander then drop to the pot.',
            hideButton: true,
          }
        );
      }
  }, 600);

  const handleDrainUbod = () => {
    if (isDrainingActive) return;
    setIsDrainingActive(true);
    soundManager.playClick();
    soundManager.playPour();
    soundManager.playSuccess();
    setHoldingItem(null);
    showToast('Step 7', 'Select stainless colander then drop to the pot.', 'success');

    setTimeout(() => {
      setIsDrainingActive(false);
      setPotStep(5);
      setCurrentPhase('drain_rinse');
      showToast('Step 8', 'Click “Turn faucet to cool” so the ubod will be cooled and drained', 'info');
      speak(
        'Click “Turn faucet to cool” so the ubod can cool and drain.',
        'neutral',
        {
          badge: 'Step 8',
          note: 'Click “Turn faucet to cool” so the ubod will be cooled and drained',
          hint: 'Click “Turn faucet to cool” so the ubod will be cooled and drained',
          hideButton: true,
        }
      );
    }, 850);
  };

  const handleCoolingRinse = () => {
    if (isCoolingRinseActive || isCoolingRinseComplete || potStep < 5) return;
    setIsCoolingRinseActive(true);
    soundManager.playPour();

    setTimeout(() => {
      setIsCoolingRinseActive(false);
      setIsCoolingRinseComplete(true);
      soundManager.playSuccess();
      unlockBadge('boil_master', 'Thermal Softening Specialist', '🥣');
      completeMission('mission1');
      showToast('Step 9', 'Click the “Proceed to stage 2”', 'success');
      speak(
        'Click the “Proceed to stage 2”',
        'happy',
        {
          badge: 'Step 9',
          note: 'Click the “Proceed to stage 2”',
          btnText: 'Click the “Proceed to stage 2”',
          onNext: () => setScene('mission2'),
        }
      );
    }, 1400);
  };

  const handleSinkClick = () => {
    // 1. Loading raw ubod
    if (!isUbodInColander) {
      if (holdingItem?.id === 'raw_ubod' || holdingItem?.id === 'washed_ubod') {
        handlePlaceRawUbodInColander();
      } else {
        triggerSinkError(
          holdingItem
            ? 'Select the raw ubod and place it in the sink'
            : 'Select the raw ubod and place it in the sink'
        );
        speak(
          'First, pick up the freshly cut raw ubod from your inventory, then tap the sink colander to place it inside!',
          'thinking',
          {
            badge: 'Step 1',
            hint: 'Select the raw ubod and place it in the sink',
            hideButton: true,
          }
        );
      }
      return;
    }

    // 2. Initial raw wash
    if (!isWashed && !isWashingActive) {
      if (holdingItem?.id === 'water_pitcher' || holdingItem?.id === 'water' || holdingItem?.id === 'portion_water' || holdingItem?.id === 'sea_salt' || holdingItem?.id === 'salt') {
        triggerSinkError('Click the “Click cross to rinse” to full washed the ubod');
        speak(
          'Click the cross handle to rinse the ubod thoroughly.',
          'thinking',
          {
            badge: 'Wash Ubod First',
            hint: 'Click the “Click cross to rinse” to full washed the ubod',
            hideButton: true,
          }
        );
        return;
      }
      handleWashUbod();
      return;
    }

    // 2b. Pick up Washed Ubod directly from the sink colander
    if (isWashed && potStep === 0) {
      soundManager.playClick();
      if (holdingItem?.id === 'washed_ubod') {
        setHoldingItem(null);
      } else {
        const washedItem = stage1Inventory.find((i) => i.id === 'washed_ubod') || {
          id: 'washed_ubod',
          name: 'Washed Ubod',
          measure: '1 Cup (Sanitized)',
          img: '/assets/colander_ubod_raw.webp',
          fallbackIcon: '🥣',
          tooltip: 'Sanitized coconut palm strips, rinsed clean of surface soil & starch residues.',
        };
        setHoldingItem(washedItem);
        showToast('Holding Washed Ubod!', 'Moving to Stove Boil...', 'info');
        setCurrentPhase('boil');
        speak(
          'Select the washed ubod and place it in the pot.',
          'happy',
          {
            badge: 'Step 3',
            note: 'Select the washed ubod. Put in the pot.',
            hint: 'Select the washed ubod. Put in the pot.',
            hideButton: true,
          }
        );
      }
      return;
    }

    // 3. Draining boiled ubod into colander
    if (potStep === 4) {
      if (holdingItem?.id === 'colander' || holdingItem?.id === 'stainless_colander' || holdingItem?.id === 'tool_colander_safe') {
        handleDrainUbod();
      } else {
        triggerSinkError('Select stainless colander then drop to the pot.');
        speak(
          'First, pick up the stainless colander from your inventory, then tap the sink to drain the boiling pot!',
          'thinking',
          {
            badge: 'Step 7',
            hint: 'Select stainless colander then drop to the pot.',
            hideButton: true,
          }
        );
      }
      return;
    }

    // 4. Post-boil cooling rinse
    if (potStep >= 5 && !isCoolingRinseComplete && !isCoolingRinseActive) {
      if (holdingItem && holdingItem.id !== 'colander') {
        triggerSinkError('Turn the faucet knob below to rinse & cool the boiled ubod!');
        return;
      }
      handleCoolingRinse();
      return;
    }
  };

  const handleSinkDragOver = (e) => {
    if (!isUbodInColander || potStep === 4) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleSinkDrop = (e) => {
    e.preventDefault();
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (!data) return;
      const item = JSON.parse(data);
      if (!isUbodInColander && (item.id === 'raw_ubod' || item.id === 'washed_ubod')) {
        handlePlaceRawUbodInColander();
      } else if (!isUbodInColander) {
        triggerSinkError('Place the Raw Ubod Strips into the sink colander first before adding other items!');
      } else if (isUbodInColander && !isWashed) {
        triggerSinkError('Click the “Click cross to rinse” to full washed the ubod');
      } else if (potStep === 4 && (item.id === 'colander' || item.id === 'stainless_colander' || item.id === 'tool_colander_safe')) {
        handleDrainUbod();
      } else if (potStep === 4) {
        triggerSinkError('Select stainless colander then drop to the pot.');
      } else if (potStep >= 5 && !isCoolingRinseComplete) {
        triggerSinkError('Turn the faucet cross-handle knob below to run the cooling rinse!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stage1Inventory = [
    {
      id: isWashed ? 'washed_ubod' : 'raw_ubod',
      name: isWashed ? 'Washed Ubod' : 'Raw Ubod Strips',
      measure: isWashed
        ? '1 Cup (Sanitized)'
        : !isUbodInColander
        ? '1 Cup (Fresh Cut)'
        : 'In Sink (Washing)',
      img: isWashed ? '/assets/colander_ubod_raw.webp' : '/assets/ing_ubod_fresh.webp',
      fallbackIcon: '🥥',
      isUsed: isUbodInColander && !isWashed ? true : potStep >= 1,
      isNext: !isUbodInColander ? true : isWashed && potStep === 0,
      disabled: isUbodInColander && !isWashed,
      onClick:
        isUbodInColander && !isWashed
          ? () => {
              soundManager.playClick();
              showToast('Step 2', 'Click the “Click cross to rinse” to full washed the ubod', 'info');
              speak('Click the cross handle to rinse the ubod thoroughly.', 'thinking', {
                badge: 'Step 2',
                hint: 'Click the “Click cross to rinse” to full washed the ubod',
                hideButton: true,
              });
            }
          : undefined,
      tooltip: isWashed
        ? 'Sanitized coconut palm strips, rinsed clean of surface soil & starch residues.'
        : !isUbodInColander
        ? 'Fresh cut raw coconut palm strips. Place in sink colander to wash.'
        : 'Ubod is in the sink colander. Turn on faucet to rinse.',
    },
    {
      id: 'water_pitcher',
      name: 'Potable Water',
      measure: '1 Cup (To Submerge)',
      img: '/assets/portion_water_1cup.webp',
      fallbackIcon: '💧',
      isUsed: potStep >= 2,
      isNext: potStep === 1,
      tooltip: 'Clean potable water to fully submerge ubod for uniform thermal softening.',
    },
    {
      id: 'sea_salt',
      name: 'Pure Sea Salt',
      measure: '1 tsp (Pinch)',
      img: '/assets/ing_salt_fresh.webp',
      fallbackIcon: '🧂',
      isUsed: potStep >= 3,
      isNext: potStep === 2,
      tooltip: 'Pure mineral sea salt for osmotic balance, seasoning, and fiber tenderization.',
    },
    {
      id: 'colander',
      name: 'Stainless Colander',
      measure: 'Drain & Rinse',
      img: '/assets/tool_colander_safe.webp',
      fallbackIcon: '🥣',
      isUsed: potStep >= 5,
      isNext: potStep === 4,
      tooltip: 'Perforated stainless colander to drain boiling water and allow cooling rinse in sink.',
    },
  ];

  const recipeItems = [
    { name: 'Raw Ubod', measure: '1 Cup', icon: '🥥' },
    { name: 'Potable Water', measure: '1 Cup', icon: '💧' },
    { name: 'Pure Sea Salt', measure: '1 tsp (Pinch)', icon: '🧂' },
  ];

  const safetyChecklist = [
    {
      title: 'Stove & Gas Inspection (Step 4)',
      desc: 'Check stove, gas smell, gas hose & regulator, and nearby flammable materials before igniting.',
      icon: '🔥',
    },
    {
      title: 'Heat Protection Protocol (Step 5)',
      desc: 'Wear heat-resistant gloves or oven mitts when handling hot pan (never thin disposable gloves).',
      icon: '🧤',
    },
    {
      title: 'Double Colander Wash (Steps 1 & 6)',
      desc: 'Wash in colander before boiling to remove dirt, and after boiling to remove residue and cool down.',
      icon: '🧼',
    },
  ];

  const sinkImgSrc = isWashingActive
    ? '/assets/sink_colander_washing.webp'
    : isCoolingRinseActive
    ? '/assets/colander_boiled_ubod_cooling_rinse.webp'
    : isCoolingRinseComplete
    ? '/assets/colander_boiled_ubod_ready.webp'
    : potStep >= 5
    ? '/assets/colander_boiled_ubod_draining.webp'
    : potStep >= 1
    ? '/assets/sink_colander_empty.webp'
    : isUbodInColander
    ? '/assets/sink_colander_ubod.webp'
    : '/assets/sink_colander_empty.webp';

  const sinkStatusText = isWashingActive
    ? 'Click the “Click cross to rinse” to full washed the ubod'
    : isCoolingRinseActive
    ? 'Click “Turn faucet to cool” so the ubod will be cooled and drained'
    : isCoolingRinseComplete
    ? 'Click the “Proceed to stage 2”'
    : potStep >= 5
    ? 'Click “Turn faucet to cool” so the ubod will be cooled and drained'
    : potStep >= 1
    ? 'Select stainless colander then drop to the pot.'
    : isWashed && potStep === 0
    ? 'Select the washed ubod. Put in the pot.'
    : isWashed
    ? 'Select the washed ubod. Put in the pot.'
    : isUbodInColander
    ? 'Click the “Click cross to rinse” to full washed the ubod'
    : 'Select the raw ubod and place it in the sink';

  const sinkStatusClass = isWashingActive || isCoolingRinseActive
    ? 'washing'
    : isCoolingRinseComplete
    ? 'washed'
    : potStep >= 5
    ? 'unwashed'
    : potStep >= 1
    ? 'empty'
    : isWashed
    ? 'washed'
    : isUbodInColander
    ? 'unwashed'
    : 'empty';

  return (
    <div className="workstation-scene prep-scene">
      <div className="workstation-overlay" />

      {/* Stage 1 Pre-Check Question Modal */}
      <CheckpointQuestionModal
        persistenceKey="mission1.checkpoint"
        isOpen={isCheckpointOpen}
        stageTitle={STAGE_QUESTIONS.mission1.stageTitle}
        question={STAGE_QUESTIONS.mission1.question}
        choices={STAGE_QUESTIONS.mission1.choices}
        explanation={STAGE_QUESTIONS.mission1.explanation}
        onComplete={handleCheckpointComplete}
      />

      {/* Main Center Cooking Countertop */}
      <div className="stage-center-zone">
        {/* Floating Quick Recipe & Safety Drawer */}
        <RecipeReferenceDrawer
          stageTitle="Stage 1: Washing & Boiling"
          recipeItems={recipeItems}
          safetyNotes={safetyChecklist}
          culinaryTip="Boiling the coconut palm for 10–15 minutes softens the tough plant fibers so they can be smoothly pureed into a fine paste in Stage 2 without coarse lumps."
        />

        <div className="stage-content-row stage-single-workstation">
          <div className="station-center-card">
            {/* Dynamic Single Workstation Apparatus */}
            {currentPhase === 'wash' ? (
              <div
                className={`multi-state-workstation washing-workstation ${sinkShake ? 'error-shake' : ''} ${
                  !isUbodInColander && (holdingItem?.id === 'raw_ubod' || holdingItem?.id === 'washed_ubod')
                    ? 'compatible-target'
                    : ''
                }`}
              >
                {/* Workstation Header */}
                <div className="workstation-header">
                  <div className="workstation-titles">
                    <h4 className="workstation-name">Washing & Draining Sink</h4>
                    <span className="workstation-sub">
                      {!isUbodInColander
                        ? 'Step 1: Select the raw ubod and place it in the sink'
                        : !isWashed
                        ? 'Step 2: Click the “Click cross to rinse” to full washed the ubod'
                        : 'Step 3: Select the washed ubod. Put in the pot.'}
                    </span>
                  </div>
                  <div
                    className={`workstation-step-badge ${
                      isWashed
                        ? 'badge-success-glow'
                        : isWashingActive
                        ? 'badge-flow-glow'
                        : isUbodInColander
                        ? 'badge-amber-glow'
                        : ''
                    }`}
                  >
                    Step {!isUbodInColander ? '1' : !isWashed ? '2' : '3'} of 3
                  </div>
                </div>

                {/* Workstation Viewport */}
                <div
                  className={`workstation-viewport washing-viewport ${
                    !isUbodInColander || (!isWashed && !isWashingActive) || (isWashed && potStep === 0)
                      ? 'interactive-sink'
                      : ''
                  }`}
                  style={{ flex: '1 1 auto' }}
                  onClick={handleSinkClick}
                  onDragOver={handleSinkDragOver}
                  onDrop={handleSinkDrop}
                  title={
                    !isUbodInColander
                      ? 'Select the raw ubod and place it in the sink'
                      : !isWashed
                      ? 'Click the “Click cross to rinse” to full washed the ubod'
                      : isWashed && potStep === 0
                      ? 'Select the washed ubod. Put in the pot.'
                      : 'Select the washed ubod. Put in the pot.'
                  }
                >
                  {/* Active Water Spray Splash Animation Overlay */}
                  {isWashingActive && (
                    <div className="water-spray-overlay">
                      <span className="water-drop d1">💧</span>
                      <span className="water-drop d2">💧</span>
                      <span className="water-drop d3">💧</span>
                    </div>
                  )}

                  {/* Step 2 Pick Up / Advance Guidance Pill */}
                  {isWashed && (
                    <div
                      className="sink-drain-guidance-pill"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundManager.playClick();
                        setCurrentPhase('boil');
                      }}
                      title="Proceed to Stove Boil"
                    >
                      <span>3. Select the washed ubod. Put in the pot.</span>
                    </div>
                  )}

                  <div className="container-visual-wrapper">
                    <img
                      src={sinkImgSrc}
                      alt="Washing Sink & Colander"
                      className="sink-preview-img container-asset-img container-state-img"
                      style={{
                        filter: isWashingActive ? 'drop-shadow(0 0 14px rgba(59, 130, 246, 0.45))' : undefined,
                      }}
                      onError={(e) => {
                        e.target.src = '/assets/sink_colander_empty.webp';
                      }}
                    />
                  </div>

                  <div className={`sink-status-pill ${sinkStatusClass}`}>
                    <span>{sinkStatusText}</span>
                  </div>
                </div>

                {/* Workstation Footer */}
                <div className="workstation-footer has-custom-footer">
                  <FaucetKnobConsole
                    isReady={isUbodInColander && !isWashed}
                    isUbodLoaded={isUbodInColander}
                    isFlowing={isWashingActive}
                    isComplete={isWashed}
                    potStep={potStep}
                    onTurnOn={handleWashUbod}
                    isCoolingRinsePhase={false}
                    isCoolingRinseReady={false}
                    isCoolingRinseFlowing={false}
                    isCoolingRinseComplete={false}
                    onTurnOnCoolingRinse={() => {}}
                  />
                </div>
              </div>
            ) : currentPhase === 'boil' ? (
              <MultiStateContainer
                containerId="stockpot"
                title="Stainless Steel Boiling Pot"
                subtitle="Stage 1: Thermal Boiling & Softening on Gas Stove"
                currentStepIndex={potStep}
                steps={potSteps}
                stepNumber={potStep + 3}
                stepTotal={9}
                onItemAccepted={handleItemAccepted}
                activeAnimation={isBoilingTimerActive ? 'boiling' : isDrainingActive ? 'boiling' : potStep === 4 ? 'steaming' : null}
                containerWidth="100%"
                customFooter={
                  <StoveBurnerConsole
                    isReady={potStep === 3}
                    isIgnited={isBoilingTimerActive}
                    isComplete={potStep >= 4}
                    progress={boilProgress}
                    onIgnite={handleIgniteBurner}
                    disabled={potStep !== 3 || isBoilingTimerActive}
                    standbyHint="Select salt then drop to the pot."
                    readyHint="Click “Ignite burner” to boil the ubod"
                    modeTitleReady="Click “Ignite burner” to boil the ubod"
                    modeTitleActive="Click “Ignite burner” to boil the ubod"
                    modeTitleStandby="Select salt then drop to the pot."
                    modeTitleComplete="Select stainless colander then drop to the pot."
                  />
                }
                specBadge={
                  <span
                    className={`spec-badge ${
                      potStep >= 4
                        ? 'spec-success'
                        : potStep >= 1
                        ? 'spec-amber'
                        : ''
                    }`}
                  >
                    {isDrainingActive
                      ? 'DRAINING IN COLANDER'
                      : potStep >= 4
                      ? 'BOILED TENDER'
                      : potStep === 3
                      ? 'HEAT: MEDIUM'
                      : potStep === 2
                      ? 'SALT: 1 PINCH'
                      : potStep === 1
                      ? 'WATER: 1 CUP'
                      : 'EMPTY POT'}
                  </span>
                }
              />
            ) : (
              /* Phase 3: Draining & Cooling Sink */
              <div
                className={`multi-state-workstation washing-workstation ${sinkShake ? 'error-shake' : ''} ${
                  (potStep === 4 && (holdingItem?.id === 'colander' || holdingItem?.id === 'stainless_colander' || holdingItem?.id === 'tool_colander_safe')) ||
                  (potStep >= 5 && !isCoolingRinseComplete)
                    ? 'compatible-target'
                    : ''
                }`}
              >
                {/* Workstation Header */}
                <div className="workstation-header">
                  <div className="workstation-titles">
                    <h4 className="workstation-name">Washing & Draining Sink</h4>
                    <span className="workstation-sub">
                      {potStep === 4
                        ? 'Step 7: Select stainless colander then drop to the pot.'
                        : !isCoolingRinseComplete
                        ? 'Step 8: Click “Turn faucet to cool” so the ubod will be cooled and drained'
                        : 'Step 9: Click the “Proceed to stage 2”'}
                    </span>
                  </div>
                  <div
                    className={`workstation-step-badge ${
                      isCoolingRinseComplete
                        ? 'badge-success-glow'
                        : isCoolingRinseActive
                        ? 'badge-flow-glow'
                        : potStep >= 5
                        ? 'badge-amber-glow'
                        : ''
                    }`}
                  >
                    Step {potStep === 4 ? '7' : !isCoolingRinseComplete ? '8' : '9'} of 9
                  </div>
                </div>

                {/* Workstation Viewport */}
                <div
                  className={`workstation-viewport washing-viewport ${
                    potStep === 4 || (potStep >= 5 && !isCoolingRinseComplete && !isCoolingRinseActive)
                      ? 'interactive-sink'
                      : ''
                  }`}
                  style={{ flex: '1 1 auto' }}
                  onClick={handleSinkClick}
                  onDragOver={handleSinkDragOver}
                  onDrop={handleSinkDrop}
                  title={
                    potStep === 4
                      ? holdingItem?.id === 'colander' || holdingItem?.id === 'stainless_colander' || holdingItem?.id === 'tool_colander_safe'
                        ? 'Select stainless colander then drop to the pot.'
                        : 'Select stainless colander then drop to the pot.'
                      : potStep >= 5 && !isCoolingRinseComplete
                      ? 'Click “Turn faucet to cool” so the ubod will be cooled and drained'
                      : isCoolingRinseComplete
                      ? 'Click the “Proceed to stage 2”'
                      : 'Select stainless colander then drop to the pot.'
                  }
                >
                  {/* Active Water Spray Splash Animation Overlay */}
                  {isCoolingRinseActive && (
                    <div className="water-spray-overlay">
                      <span className="water-drop d1">💧</span>
                      <span className="water-drop d2">💧</span>
                      <span className="water-drop d3">💧</span>
                    </div>
                  )}


                  {/* Step 6 Cooling Rinse Guidance Pill */}
                  {potStep >= 5 && !isCoolingRinseComplete && !isCoolingRinseActive && (
                    <div
                      className="sink-drain-guidance-pill sink-cooling-guidance-pill"
                      onClick={handleSinkClick}
                      title="Click to wash residue & cool boiled ubod"
                    >
                      <span>8. Click “Turn faucet to cool” so the ubod will be cooled and drained</span>
                    </div>
                  )}

                  <div className="container-visual-wrapper">
                    <img
                      src={sinkImgSrc}
                      alt="Washing Sink & Colander"
                      className="sink-preview-img container-asset-img container-state-img"
                      style={{
                        filter: isCoolingRinseActive ? 'drop-shadow(0 0 14px rgba(59, 130, 246, 0.45))' : undefined,
                      }}
                      onError={(e) => {
                        e.target.src = '/assets/sink_colander_empty.webp';
                      }}
                    />
                  </div>

                  <div className={`sink-status-pill ${sinkStatusClass}`}>
                    <span>{sinkStatusText}</span>
                  </div>
                </div>

                {/* Workstation Footer */}
                <div className="workstation-footer has-custom-footer">
                  <FaucetKnobConsole
                    isReady={potStep >= 5 && !isCoolingRinseComplete}
                    isUbodLoaded={true}
                    isFlowing={isCoolingRinseActive}
                    isComplete={isCoolingRinseComplete}
                    potStep={potStep}
                    onTurnOn={() => {}}
                    isCoolingRinsePhase={true}
                    isCoolingRinseReady={potStep >= 5 && !isCoolingRinseComplete}
                    isCoolingRinseFlowing={isCoolingRinseActive}
                    isCoolingRinseComplete={isCoolingRinseComplete}
                    onTurnOnCoolingRinse={handleCoolingRinse}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Inventory Shelf */}
      <InventoryTray
        title="Station 1 Boiling Ingredients & Tools"
        items={stage1Inventory}
        onItemClick={(item) => {
          if (item.disabled) {
            if (item.onClick) item.onClick();
            return;
          }
          soundManager.playClick();
          if (holdingItem?.id === item.id) {
            setHoldingItem(null);
          } else {
            setHoldingItem(item);
            if (item.id === 'raw_ubod') {
              showToast('Raw Ubod Selected', 'Drop or tap into the sink colander to wash.', 'info');
            } else if (item.id === 'washed_ubod') {
              showToast('Washed Ubod Selected', 'Drop or tap into the cooking pot.', 'info');
            } else if (item.id === 'water_pitcher') {
              showToast('Potable Water Selected', 'Used to submerge ubod in the cooking pot.', 'info');
            } else if (item.id === 'sea_salt') {
              showToast('Sea Salt Selected', 'Used for seasoning in the cooking pot.', 'info');
            } else if (item.id === 'colander') {
              showToast('Stainless Colander Selected', 'Drop or tap into the cooking pot to drain boiled ubod.', 'info');
            }
          }
        }}
      />
    </div>
  );
};
