import React from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';
import { SidebarPortal } from './SidebarPortal';

export const SequencingSidebar = ({ isCompleted = false }) => {
  const { isInventoryCollapsed, setIsInventoryCollapsed } = useGame();

  const protocolGuidelines = [
    {
      id: 'pipeline',
      icon: '🔄',
      title: 'Full Pipeline Scope',
      desc: 'Order all 8 production stages from initial raw ubod preparation through to retail packaging.',
      tag: '8 Stages',
    },
    {
      id: 'interaction',
      icon: '👆',
      title: 'Interaction Method',
      desc: 'Drag cards into target slots or tap one card then another to swap positions.',
      tag: 'Drag / Tap',
    },
    {
      id: 'scoring',
      icon: '📊',
      title: 'Competency Check',
      desc: 'Order each production stage chronologically to validate your comprehensive process mastery.',
      tag: '8 Stages',
    },
    {
      id: 'report',
      icon: '📋',
      title: 'Master Review',
      desc: 'Detailed itemized audit, food science rationales, and comparison will be generated in the review.',
      tag: 'Final Review',
    },
  ];

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
          title="Click to open Post-Test Protocol Reference (◀)"
          role="button"
          tabIndex={0}
        >
          <div className="inventory-tab-icon-wrapper">
            <span style={{ fontSize: '1.4rem' }}>📝</span>
            <span className="inventory-tab-count-pill">8</span>
          </div>
          <div className="inventory-tab-label-stack">
            <span className="inventory-tab-name">POST-TEST</span>
            <span className="inventory-tab-sub">RULES</span>
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
              <span className="rack-title-text">Exam Protocol</span>
              <span className="rack-count-pill">{isCompleted ? '✓ Submitted' : 'Assessment'}</span>
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
          <span>{isCompleted ? 'Post-Test response recorded' : 'Post-Test Assessment Guidelines'}</span>
        </div>

        {/* Vertical Guidelines Stack */}
        <div className="inventory-vertical-stack">
          {protocolGuidelines.map((item) => (
            <div
              key={item.id}
              className={`drag-card horizontal-item-card ${isCompleted ? 'used' : ''}`}
            >
              <div className="card-icon-col">
                <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
              </div>
              <div className="card-info-col">
                <div className="card-title-row">
                  <span className="card-title">{item.title}</span>
                  <span className="card-measure">{item.tag}</span>
                </div>
                <p className="card-desc-text">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SidebarPortal>
  );
};
