import React from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';
import { SidebarPortal } from './SidebarPortal';

export const EvaluationSidebar = () => {
  const { score, stars, badges, studentName, isInventoryCollapsed, setIsInventoryCollapsed } = useGame();

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
          title="Click to open Quality Awards & Credentials (◀)"
          role="button"
          tabIndex={0}
        >
          <div className="inventory-tab-icon-wrapper">
            <span style={{ fontSize: '1.4rem' }}>🏆</span>
            <span className="inventory-tab-count-pill">{badges.length}</span>
          </div>
          <div className="inventory-tab-label-stack">
            <span className="inventory-tab-name">AWARDS</span>
            <span className="inventory-tab-sub">BADGES</span>
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
              <span style={{ fontSize: '1.4rem' }}>🏆</span>
            </div>
            <div className="rack-titles">
              <span className="rack-title-text">Credentials & Awards</span>
              <span className="rack-count-pill">Lab Accreditations</span>
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
          <span>Official Food Technology Laboratory Graduation Record</span>
        </div>

        {/* Vertical Score & Badges Stack */}
        <div className="inventory-vertical-stack">
          {/* Card 1: Score & Technologist Rank */}
          <div className="drag-card horizontal-item-card" style={{ borderColor: '#d97706', background: 'linear-gradient(135deg, #3d2311 0%, #29160a 100%)' }}>
            <div className="card-icon-col">
              <span style={{ fontSize: '1.6rem' }}>🎖️</span>
            </div>
            <div className="card-info-col">
              <div className="card-title-row">
                <span className="card-title" style={{ color: '#fef08a' }}>{studentName || 'Technologist'}</span>
                <span className="card-measure">{stars === 3 ? '⭐⭐⭐' : stars === 2 ? '⭐⭐' : '⭐'}</span>
              </div>
              <p className="card-desc-text" style={{ color: '#fde68a' }}>
                Total Score: <strong>{score} pts</strong> • Status: <strong>Graduated Master</strong>
              </p>
            </div>
          </div>

          {/* Card 2: Ubod CRUNCH Certified Specs */}
          <div className="drag-card horizontal-item-card">
            <div className="card-icon-col">
              <span style={{ fontSize: '1.6rem' }}>🥥</span>
            </div>
            <div className="card-info-col">
              <div className="card-title-row">
                <span className="card-title">Commercial Standard</span>
                <span className="card-measure">PASSED</span>
              </div>
              <p className="card-desc-text">
                Portion: 50g • Moisture: &lt;10% • Packaging: Nitrogen-flushed Kraft-PE Pouch.
              </p>
            </div>
          </div>

          {/* Card 3: Earned Badges Showcase */}
          <div className="drag-card horizontal-item-card">
            <div className="card-icon-col">
              <span style={{ fontSize: '1.6rem' }}>🏅</span>
            </div>
            <div className="card-info-col">
              <div className="card-title-row">
                <span className="card-title">Earned Badges</span>
                <span className="card-measure">{badges.length} BADGES</span>
              </div>
              <p className="card-desc-text">
                {badges.length > 0
                  ? badges.map(b => b.title).join(' • ')
                  : 'Master Food Technologist, PPE Certified, Thermal Mastery'}
              </p>
            </div>
          </div>

          {/* Card 4: Quality & Safety Audit */}
          <div className="drag-card horizontal-item-card">
            <div className="card-icon-col">
              <span style={{ fontSize: '1.6rem' }}>✅</span>
            </div>
            <div className="card-info-col">
              <div className="card-title-row">
                <span className="card-title">HACCP Compliance</span>
                <span className="card-measure">100% AUDIT</span>
              </div>
              <p className="card-desc-text">
                Zero biological contamination, compliant thermal frying curve, hermetic pouch weld.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SidebarPortal>
  );
};
