import React, { useState } from 'react';
import { useGame } from './context/GameContext';
import { HeaderHUD } from './components/HeaderHUD';
import { TeacherMiaSidebar } from './components/TeacherMiaSidebar';
import { StageNextButton } from './components/StageNextButton';
import { Toast } from './components/Toast';
import { RecipeModal } from './components/Modals/RecipeModal';
import { ObjectivesModal } from './components/Modals/ObjectivesModal';
import { ScienceConceptsModal } from './components/Modals/ScienceConceptsModal';
import { AboutUsModal } from './components/Modals/AboutUsModal';
import { HelpModal } from './components/Modals/HelpModal';
import { SystemOverviewModal } from './components/Modals/SystemOverviewModal';
import { ConfirmModal } from './components/Modals/ConfirmModal';
import { FloatingItemCursor } from './components/FloatingItemCursor';
import { LoadingScreen } from './components/LoadingScreen';
import { ScreenRestrictionOverlay } from './components/ScreenRestrictionOverlay';

// Scenes
import { TitleScene } from './scenes/TitleScene';
import { OrientationScene } from './scenes/OrientationScene';
import { Mission1Prep } from './scenes/Mission1Prep';
import { Mission2Grinding } from './scenes/Mission2Grinding';
import { Mission3Mixing } from './scenes/Mission3Mixing';
import { Mission4Molding } from './scenes/Mission4Molding';
import { Mission5Steaming } from './scenes/Mission5Steaming';
import { Mission6Dehydration } from './scenes/Mission6Dehydration';
import { Mission7Frying } from './scenes/Mission7Frying';
import { Mission8Packaging } from './scenes/Mission8Packaging';
import { SequencingScene } from './scenes/SequencingScene';
import { ResultsScene } from './scenes/ResultsScene';

export const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { scene, stageKey, isDialogueCollapsed, isInventoryCollapsed, effectiveZoom } = useGame();

  const renderScene = () => {
    switch (scene) {
      case 'title':
        return <TitleScene />;
      case 'orientation':
        return <OrientationScene key={`orientation-${stageKey}`} />;
      case 'mission1':
        return <Mission1Prep key={`mission1-${stageKey}`} />;
      case 'mission2':
        return <Mission2Grinding key={`mission2-${stageKey}`} />;
      case 'mission3':
        return <Mission3Mixing key={`mission3-${stageKey}`} />;
      case 'mission4':
        return <Mission4Molding key={`mission4-${stageKey}`} />;
      case 'mission5':
        return <Mission5Steaming key={`mission5-${stageKey}`} />;
      case 'mission6':
        return <Mission6Dehydration key={`mission6-${stageKey}`} />;
      case 'mission7':
        return <Mission7Frying key={`mission7-${stageKey}`} />;
      case 'mission8':
        return <Mission8Packaging key={`mission8-${stageKey}`} />;
      case 'sequencing':
        return <SequencingScene key={`sequencing-${stageKey}`} />;
      case 'evaluation':
      case 'results':
        return <ResultsScene key={`results-${stageKey}`} />;
      default:
        return <TitleScene />;
    }
  };

  if (isLoading) {
    return (
      <>
        <ScreenRestrictionOverlay />
        <LoadingScreen onLoaded={() => setIsLoading(false)} />
      </>
    );
  }

  return (
    <div className="game-app">
      <ScreenRestrictionOverlay />
      <HeaderHUD />
      <main
        className={`game-viewport scene-${scene} ${
          isDialogueCollapsed ? 'dialogue-collapsed' : 'dialogue-expanded'
        } ${
          isInventoryCollapsed ? 'inventory-collapsed' : 'inventory-expanded'
        }`}
        style={{
          zoom: effectiveZoom,
        }}
      >
        {scene === 'title' ? (
          <div className="scene-container scene-container-full">
            {renderScene()}
          </div>
        ) : (
          <div className="viewport-layout-grid">
            {/* Left Column: Teacher Mia Mentor Guide Sidebar (Collapsible) */}
            <aside
              className={`viewport-mentor-column ${
                isDialogueCollapsed ? 'collapsed' : 'expanded'
              }`}
              id="viewport-mentor-slot"
            >
              <TeacherMiaSidebar />
            </aside>

            {/* Center Column: Workstation Scene Canvas */}
            <div className="viewport-center-column viewport-left-column">
              <div className="scene-container">
                {renderScene()}
              </div>
              <StageNextButton />
            </div>

            {/* Right Column: Sidebar (Inventory / Orientation / Exam / Cert) */}
            <aside
              className={`viewport-right-column ${
                isInventoryCollapsed ? 'collapsed' : 'expanded'
              }`}
              id="viewport-sidebar-slot"
            />
          </div>
        )}
      </main>
      <Toast />
      <RecipeModal />
      <ObjectivesModal />
      <ScienceConceptsModal />
      <AboutUsModal />
      <HelpModal />
      <SystemOverviewModal />
      <ConfirmModal />
      <FloatingItemCursor />
    </div>
  );
};
