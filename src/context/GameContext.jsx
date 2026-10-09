import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { soundManager } from '../audio/soundManager.js';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [scene, setScene] = useState('title');
  const [studentName, setStudentName] = useState(() => localStorage.getItem('palmquest_name') || '');
  const [stageAnswers, setStageAnswers] = useState({
    mission1: null,
    mission2: null,
    mission3: null,
    mission4: null,
    mission5: null,
    mission6: null,
    mission7: null,
    mission8: null,
  });

  const recordStageAnswer = (stageKey, answerData) => {
    setStageAnswers(prev => ({
      ...prev,
      [stageKey]: answerData,
    }));
  };

  const [badges, setBadges] = useState([]);
  const [isMuted, setIsMuted] = useState(() => soundManager.isMuted);

  // Diagnostic & Formative Assessment Tracking (Pre-Test & Post-Test)
  const [assessmentResults, setAssessmentResults] = useState({
    preTest: {
      ppe: null, // { selectedIds: [], correctCount: 0, totalCorrect: 6, distractorsPicked: [] }
      handwashing: null, // { submittedSteps: [], correctSequence: [], score: 0, distractorsPicked: [] }
      toolSafety: [], // Array<{ id, toolName, selectedOption, isCorrect, reason, correctOption, distractorOptions }>
      qualityInspection: [], // Array<{ id, ingredientName, selectedOption, isCorrect, reason, correctOption, distractorOptions }>
    },
    postTest: {
      sequencing: null, // { submittedOrder: [], correctOrder: [], score: 0, totalStages: 8 }
    },
  });

  const recordPreTestPpe = (ppeData) => {
    setAssessmentResults(prev => ({
      ...prev,
      preTest: { ...prev.preTest, ppe: ppeData },
    }));
  };

  const recordPreTestHandwash = (handwashData) => {
    setAssessmentResults(prev => ({
      ...prev,
      preTest: { ...prev.preTest, handwashing: handwashData },
    }));
  };

  const recordPreTestTool = (toolChoiceOrList) => {
    setAssessmentResults((prev) => {
      if (Array.isArray(toolChoiceOrList)) {
        return {
          ...prev,
          preTest: { ...prev.preTest, toolSafety: toolChoiceOrList },
        };
      }
      const existing = (prev.preTest.toolSafety || []).filter((t) => t.id !== toolChoiceOrList.id);
      return {
        ...prev,
        preTest: { ...prev.preTest, toolSafety: [...existing, toolChoiceOrList] },
      };
    });
  };

  const recordPreTestIngredient = (ingredientChoiceOrList) => {
    setAssessmentResults((prev) => {
      if (Array.isArray(ingredientChoiceOrList)) {
        return {
          ...prev,
          preTest: { ...prev.preTest, qualityInspection: ingredientChoiceOrList },
        };
      }
      const existing = (prev.preTest.qualityInspection || []).filter((i) => i.id !== ingredientChoiceOrList.id);
      return {
        ...prev,
        preTest: { ...prev.preTest, qualityInspection: [...existing, ingredientChoiceOrList] },
      };
    });
  };

  const recordPostTestSequence = (sequenceData) => {
    setAssessmentResults(prev => ({
      ...prev,
      postTest: { ...prev.postTest, sequencing: sequenceData },
    }));
  };

  const [dialogue, setDialogue] = useState({
    visible: false,
    text: '',
    avatar: 'neutral', // 'neutral', 'happy', 'thinking'
    badge: 'Instructor',
    hint: '',
    note: '',
    noteTitle: '',
    btnText: 'Next ➔',
    onNext: null,
    hideButton: false,
  });

  const [toast, setToast] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success', // 'success', 'danger', 'warning'
  });

  const [activeModal, setActiveModal] = useState(null); // 'recipe', 'objectives', null
  const [holdingItem, setHoldingItem] = useState(null); // { id, name, img, ... }

  // Sidebar collapse states for 3-zone panoramic layout
  const [isDialogueCollapsed, setIsDialogueCollapsed] = useState(() => {
    const assessmentScenes = ['orientation', 'sequencing', 'results', 'evaluation'];
    if (assessmentScenes.includes(scene)) return true;
    return false;
  });
  const [isInventoryCollapsed, setIsInventoryCollapsed] = useState(() => {
    const assessmentScenes = ['orientation', 'sequencing', 'results', 'evaluation'];
    if (assessmentScenes.includes(scene)) return true;
    return false;
  });

  const [stageKey, setStageKey] = useState(0);
  const [maxUnlockedStage, setMaxUnlockedStage] = useState(0);

  // Zoom level state (default 1.0 = 100% true physical scale)
  const [zoomLevel, setZoomLevel] = useState(1);
  const effectiveZoom = zoomLevel;

  useEffect(() => {
    try {
      localStorage.removeItem('palmquest_zoom');
    } catch {}
  }, []);

  const updateZoom = (val) => {
    const clamped = Math.min(Math.max(val, 0.5), 1.6);
    const rounded = Math.round(clamped * 100) / 100;
    setZoomLevel(rounded);
  };

  const zoomIn = () => updateZoom(zoomLevel + 0.05);
  const zoomOut = () => updateZoom(zoomLevel - 0.05);
  const resetZoom = () => {
    try {
      localStorage.removeItem('palmquest_zoom');
    } catch {}
    setZoomLevel(1.0);
  };

  useEffect(() => {
    // Reset any held cursor item when changing scenes
    setHoldingItem(null);
    if (typeof window !== 'undefined') {
      window.__setPalmQuestScene = setScene;
    }

    const assessmentScenes = ['orientation', 'sequencing', 'results', 'evaluation'];
    const stageScenes = [
      'mission1',
      'mission2',
      'mission3',
      'mission4',
      'mission5',
      'mission6',
      'mission7',
      'mission8',
    ];

    // Collapse both sidebars by default on Pre-Test, Post-Test, and Results
    if (assessmentScenes.includes(scene)) {
      setIsDialogueCollapsed(true);
      setIsInventoryCollapsed(true);
    } else if (stageScenes.includes(scene)) {
      // In stages 1-8, sidebars should always be showing/expanded unless collapsed by user
      setIsDialogueCollapsed(false);
      setIsInventoryCollapsed(false);
    }
  }, [scene]);

  const resetStageScore = (targetScene = scene) => {
    setMissionsCompleted(prev => ({ ...prev, [targetScene]: false }));
  };

  const restartStage = (targetScene = scene) => {
    soundManager.playClick();
    setHoldingItem(null);
    resetStageScore(targetScene);
    setStageKey(prev => prev + 1);
    showToast('Stage Reset', 'Workstation progress has been reset. You can restart the activity.', 'info');
  };

  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    title: 'Return to Main Menu?',
    message: 'Your progress in this session will be preserved.',
    confirmText: 'Yes, Return to Menu',
    cancelText: 'Stay in Lab',
    icon: '🏠',
    onConfirm: null,
  });

  const [missionsCompleted, setMissionsCompleted] = useState({
    orientation: false,
    mission1: false,
    mission2: false,
    mission3: false,
    mission4: false,
    mission5: false,
    mission6: false,
    mission7: false,
    mission8: false,
    sequencing: false,
    evaluation: false,
  });

  // Sound Mute Toggle
  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) soundManager.playClick();
  };

  // Safe no-op stubs for backward compatibility
  const addScore = () => {};
  const recordMistake = () => {};

  const unlockBadge = (badgeId, badgeTitle, icon = '🎖️') => {
    setBadges(prev => {
      if (prev.some(b => b.id === badgeId)) return prev;
      soundManager.playFanfare();
      return [...prev, { id: badgeId, title: badgeTitle, icon }];
    });
  };

  const completeMission = (missionKey) => {
    setMissionsCompleted(prev => ({ ...prev, [missionKey]: true }));
    const NEXT_STAGE_UNLOCKED = {
      orientation: 1,
      mission1: 2,
      mission2: 3,
      mission3: 4,
      mission4: 5,
      mission5: 6,
      mission6: 7,
      mission7: 8,
      mission8: 9,
      sequencing: 10,
      evaluation: 10,
    };
    if (NEXT_STAGE_UNLOCKED[missionKey] !== undefined) {
      setMaxUnlockedStage(prev => Math.max(prev, NEXT_STAGE_UNLOCKED[missionKey]));
    }
  };

  const speak = (text, avatar = 'neutral', options = {}) => {
    const hasNext = typeof options.onNext === 'function';
    const hasExplicitBtn = Boolean(options.btnText);
    setDialogue({
      visible: true,
      text,
      avatar,
      badge: options.badge || 'Instructor',
      hint: options.hint || '',
      note: options.note || '',
      noteTitle: options.noteTitle || '',
      btnText: options.btnText || (hasNext ? 'Next ➔' : ''),
      onNext: options.onNext || null,
      hideButton: options.hideButton !== undefined ? options.hideButton : (!hasNext && !hasExplicitBtn),
    });
  };

  const hideDialogue = () => {
    setDialogue(prev => ({ ...prev, visible: false }));
  };

  // Automatically dismiss floating dialogue whenever on title scene
  useEffect(() => {
    if (scene === 'title') {
      hideDialogue();
    }
  }, [scene]);

  const toastTimerRef = useRef(null);

  const hideToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(prev => ({ ...prev, visible: false }));
  };

  const showToast = (title, message, type = 'success', duration = 5500) => {
    if (type === 'success') soundManager.playSuccess();
    else if (type === 'danger') soundManager.playError();
    else soundManager.playClick();

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ visible: true, title, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
      toastTimerRef.current = null;
    }, duration);
  };

  const openModal = (modalName) => {
    soundManager.playClick();
    setActiveModal(modalName);
  };

  const closeModal = () => {
    soundManager.playClick();
    setActiveModal(null);
  };

  const requestConfirm = ({
    title = 'Return to Main Menu?',
    message = 'Your progress in this session will be preserved. Would you like to return to the title screen?',
    confirmText = 'Return to Menu',
    cancelText = 'Stay in Lab',
    icon = '🏠',
    onConfirm = null,
  }) => {
    soundManager.playClick();
    setConfirmDialog({
      visible: true,
      title,
      message,
      confirmText,
      cancelText,
      icon,
      onConfirm,
    });
  };

  const closeConfirm = () => {
    soundManager.playClick();
    setConfirmDialog(prev => ({ ...prev, visible: false }));
  };

  const saveStudentName = (name) => {
    setStudentName(name);
    localStorage.setItem('palmquest_name', name);
  };

  const resetGame = () => {
    setStageAnswers({
      mission1: null,
      mission2: null,
      mission3: null,
      mission4: null,
      mission5: null,
      mission6: null,
      mission7: null,
      mission8: null,
    });
    setBadges([]);
    setAssessmentResults({
      preTest: {
        ppe: null,
        handwashing: null,
        toolSafety: [],
        qualityInspection: [],
      },
      postTest: {
        sequencing: null,
      },
    });
    setMaxUnlockedStage(0);
    setMissionsCompleted({
      orientation: false,
      mission1: false,
      mission2: false,
      mission3: false,
      mission4: false,
      mission5: false,
      mission6: false,
      mission7: false,
      mission8: false,
      sequencing: false,
      evaluation: false,
    });
    setHoldingItem(null);
    setStageKey(prev => prev + 1);
    hideDialogue();
    setScene('title');
  };

  return (
    <GameContext.Provider
      value={{
        scene,
        setScene,
        studentName,
        saveStudentName,
        score: 0,
        addScore,
        mistakes: 0,
        recordMistake,
        stars: 0,
        badges,
        unlockBadge,
        missionsCompleted,
        completeMission,
        dialogue,
        speak,
        hideDialogue,
        toast,
        showToast,
        hideToast,
        activeModal,
        openModal,
        closeModal,
        confirmDialog,
        requestConfirm,
        closeConfirm,
        holdingItem,
        setHoldingItem,
        isDialogueCollapsed,
        setIsDialogueCollapsed,
        isInventoryCollapsed,
        setIsInventoryCollapsed,
        isMuted,
        toggleSound,
        resetGame,
        stageKey,
        restartStage,
        resetStageScore,
        maxUnlockedStage,
        setMaxUnlockedStage,
        zoomLevel,
        effectiveZoom,
        setZoomLevel: updateZoom,
        zoomIn,
        zoomOut,
        resetZoom,
        // Stage Pre-Check Questions Tracking
        stageAnswers,
        recordStageAnswer,
        // Diagnostic & Formative Assessment State & Helpers
        assessmentResults,
        recordPreTestPpe,
        recordPreTestHandwash,
        recordPreTestTool,
        recordPreTestIngredient,
        recordPostTestSequence,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
