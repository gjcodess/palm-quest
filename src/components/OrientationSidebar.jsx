import React from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';
import { SidebarPortal } from './SidebarPortal';

export const OrientationSidebar = ({
  phase = 'ppe',
  ppeEquipped = {},
  completedHandwashSteps = [],
  ppeDone = false,
  handwashingDone = false,
  toolSafetyDone = false,
  qualityInspectionDone = false,
}) => {
  const { isInventoryCollapsed, setIsInventoryCollapsed } = useGame();

  const ppeCount = Object.values(ppeEquipped).filter(Boolean).length;
  const washCount = completedHandwashSteps.length;

  if (isInventoryCollapsed) {
    return (
      <SidebarPortal>
        <div
          className="right-inventory-rack collapsed"
          onClick={() => {
            soundManager.playClick();
            setIsInventoryCollapsed(false);
            if (window.matchMedia('(max-width: 950px) and (orientation: landscape), (max-width: 1200px) and (orientation: landscape) and (pointer: coarse)').matches) {
              setIsDialogueCollapsed(true);
            }
          }}
          title="Click to open Pre-Test Assessment Guide (◀)"
          role="button"
          tabIndex={0}
        >
          <div className="inventory-tab-icon-wrapper">
            <span style={{ fontSize: '1.4rem' }}>📋</span>
            <span className="inventory-tab-count-pill">4</span>
          </div>
          <div className="inventory-tab-label-stack">
            <span className="inventory-tab-name">PRE-TEST</span>
            <span className="inventory-tab-sub">GUIDE</span>
          </div>
          <div className="inventory-tab-chevron-box">
            <span className="inventory-tab-chevron">◀</span>
          </div>
        </div>
      </SidebarPortal>
    );
  }

  return (
    <SidebarPortal>
      <div className="right-inventory-rack expanded">
        {/* Header Bar */}
        <div className="rack-header">
          <div className="rack-title-group">
            <div className="rack-icon-box">
              <span style={{ fontSize: '1.4rem' }}>📋</span>
            </div>
            <div className="rack-titles">
              <span className="rack-title-text">Pre-Test Diagnostic</span>
              <span className="rack-count-pill">4 Tasks</span>
            </div>
          </div>
          <button
            className="rack-collapse-btn"
            onClick={(e) => {
              e.stopPropagation();
              soundManager.playClick();
              setIsInventoryCollapsed(true);
            }}
            title="Minimize Sidebar (▶)"
            aria-label="Minimize Sidebar"
          >
            <span>▶</span>
          </button>
        </div>
        <div className="rack-header-divider" />

        <div className="rack-hint-bar">
          <span>Complete all 4 diagnostic tasks to proceed to Stage 1</span>
        </div>

        {/* Scrollable Checklist Stack */}
        <div className="inventory-vertical-stack">
          {/* Task 1: PPE */}
          <div className={`drag-card horizontal-item-card ${ppeDone ? 'used' : ''}`}>
            <div className="card-icon-col">
              <span style={{ fontSize: '1.6rem' }}>🥼</span>
            </div>
            <div className="card-info-col">
              <div className="card-title-row">
                <span className="card-title">1. PPE Equipment</span>
                <span className="card-measure">{ppeDone ? '✓ SELECTED' : `${ppeCount} SELECTED`}</span>
              </div>
              <p className="card-desc-text">Hairnet, apron, mask, gloves, heat mitts & safety shoes.</p>
            </div>
          </div>

          {/* Task 2: Handwashing */}
          <div className={`drag-card horizontal-item-card ${handwashingDone ? 'used' : ''}`}>
            <div className="card-icon-col">
              <span style={{ fontSize: '1.6rem' }}>🧼</span>
            </div>
            <div className="card-info-col">
              <div className="card-title-row">
                <span className="card-title">2. Handwashing Protocol</span>
                <span className="card-measure">{handwashingDone ? '✓ 7/7 ASSIGNED' : `${washCount}/7 STEPS`}</span>
              </div>
              <p className="card-desc-text">7-step sanitary sequence from initial wetting to drying.</p>
            </div>
          </div>

          {/* Task 3: Tools */}
          <div className={`drag-card horizontal-item-card ${toolSafetyDone ? 'used' : ''}`}>
            <div className="card-icon-col">
              <span style={{ fontSize: '1.6rem' }}>🛠️</span>
            </div>
            <div className="card-info-col">
              <div className="card-title-row">
                <span className="card-title">3. Tool Safety Inspection</span>
                <span className="card-measure">{toolSafetyDone ? '✓ INSPECTED' : 'INSPECT'}</span>
              </div>
              <p className="card-desc-text">Food-grade steel blades, sanitized bowls, inspected appliances.</p>
            </div>
          </div>

          {/* Task 4: Raw Ingredients */}
          <div className={`drag-card horizontal-item-card ${qualityInspectionDone ? 'used' : ''}`}>
            <div className="card-icon-col">
              <span style={{ fontSize: '1.6rem' }}>🥥</span>
            </div>
            <div className="card-info-col">
              <div className="card-title-row">
                <span className="card-title">4. Ubod Quality Audit</span>
                <span className="card-measure">{qualityInspectionDone ? '✓ AUDITED' : 'INSPECT'}</span>
              </div>
              <p className="card-desc-text">Fresh ivory coconut palm, crisp texture, zero discoloration.</p>
            </div>
          </div>
        </div>
      </div>
    </SidebarPortal>
  );
};
