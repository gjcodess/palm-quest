import React from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';
import { SidebarPortal } from './SidebarPortal';

export const ResultsSidebar = () => {
  const {
    studentName,
    isInventoryCollapsed,
    setIsInventoryCollapsed,
  } = useGame();

  const scrollToSection = (sectionId) => {
    soundManager.playClick();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
          title="Click to open Lesson Directory (◀)"
          role="button"
          tabIndex={0}
        >
          <div className="inventory-tab-icon-wrapper">
            <span style={{ fontSize: '1.4rem' }}>📖</span>
            <span className="inventory-tab-count-pill">6</span>
          </div>
          <div className="inventory-tab-label-stack">
            <span className="inventory-tab-name">LESSONS</span>
            <span className="inventory-tab-sub">INDEX</span>
          </div>
          <div className="inventory-tab-chevron-box">
            <span className="inventory-tab-chevron">◀</span>
          </div>
        </div>
      </SidebarPortal>
    );
  }

  const lessonSections = [
    {
      id: 'section-ppe',
      part: 'Part 1',
      title: 'PPE Attire & Hygiene',
      icon: '🥼',
      desc: '6 sanitary protective barriers & GMP standards',
    },
    {
      id: 'section-handwashing',
      part: 'Part 2',
      title: '7-Step Handwashing',
      icon: '🧼',
      desc: 'WHO aseptic friction sequence & biofilm removal',
    },
    {
      id: 'section-tools',
      part: 'Part 3',
      title: 'Tool & Equipment QC',
      icon: '🔍',
      desc: 'Food contact surfaces & sanitary metallurgy',
    },
    {
      id: 'section-ingredients',
      part: 'Part 4',
      title: 'Raw Material Quality',
      icon: '🥥',
      desc: 'Critical receiving limits & quality assurance',
    },
    {
      id: 'section-stage-questions',
      part: 'Part 5',
      title: 'Stage Answer Key (1–8)',
      icon: '📝',
      desc: 'Full 4-choice review & food chemistry principles',
    },
    {
      id: 'section-pipeline',
      part: 'Part 6',
      title: 'Manufacturing Flow',
      icon: '🔄',
      desc: 'Authentic 8-stage industrial unit operations',
    },
  ];

  return (
    <SidebarPortal>
      <div className="right-inventory-rack expanded results-inventory-rack">
        {/* Header Bar */}
        <div className="rack-header">
          <div className="rack-title-group">
            <div className="rack-icon-box">
              <span style={{ fontSize: '1.4rem' }}>📖</span>
            </div>
            <div className="rack-titles">
              <span className="rack-title-text">Lesson Directory</span>
              <span className="rack-count-pill">Study Guide</span>
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
          <span>Click any topic to jump directly to its lesson</span>
        </div>

        {/* Vertical Audit Stack */}
        <div className="inventory-vertical-stack">
          {/* Candidate Profile Card */}
          <div
            className="drag-card horizontal-item-card"
            style={{
              borderColor: '#f59e0b',
              borderBottom: '4px solid #d97706',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              boxShadow: '0 2px 0 #d97706',
              cursor: 'default',
            }}
          >
            <div className="card-icon-col">
              <span style={{ fontSize: '1.6rem' }}>🎓</span>
            </div>
            <div className="card-info-col">
              <div className="card-title-row">
                <span className="card-title" style={{ color: '#78350f', fontWeight: 800 }}>
                  {studentName || 'Student'}
                </span>
                <span className="card-measure" style={{ color: '#92400e', fontWeight: 800 }}>
                  STUDY MODE
                </span>
              </div>
              <p className="card-desc-text" style={{ color: '#854d0e', fontWeight: 600 }}>
                Food Technologist • Instructional Master Debrief
              </p>
            </div>
          </div>

          {/* Directory Navigation Items */}
          {lessonSections.map((sec) => (
            <div
              key={sec.id}
              className="drag-card horizontal-item-card lesson-dir-card"
              onClick={() => scrollToSection(sec.id)}
              role="button"
              tabIndex={0}
              title={`Jump to ${sec.title}`}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-icon-col">
                <span style={{ fontSize: '1.5rem' }}>{sec.icon}</span>
              </div>
              <div className="card-info-col">
                <div className="card-title-row">
                  <span className="card-title">{sec.title}</span>
                  <span className="card-measure">{sec.part}</span>
                </div>
                <p className="card-desc-text">{sec.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SidebarPortal>
  );
};
