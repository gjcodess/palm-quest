import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../../context/GameContext';

const CURRICULUM_COMPETENCIES = [
  {
    category: 'Cognitive Domain (Knowledge)',
    icon: '🧠',
    items: [
      'Identify raw materials, formulation ratios (1:1 rice flour to palm paste), and standard seasoning proportions.',
      'Explain the thermal starch gelatinization and vitrification mechanisms behind crispy cracker puffing.',
      'Recognize potential kitchen hazards, equipment defects, and critical control points (HACCP).',
    ],
  },
  {
    category: 'Psychomotor Domain (Skills)',
    icon: '🛠️',
    items: [
      'Demonstrate proper execution of all 8 production stages in correct chronological sequence.',
      'Perform virtual tool calibration (temperature monitoring at 90°C & high-temperature, precise leveling, hermetic sealing).',
      'Execute sanitary 7-step handwashing technique according to international health standards.',
    ],
  },
  {
    category: 'Affective Domain (Values & Safety)',
    icon: '🤝',
    items: [
      'Adhere strictly to personal hygiene and Good Manufacturing Practices (GMP) without skipping safety steps.',
      'Demonstrate discipline and attention to detail in food formulation and quality control.',
    ],
  },
];

export const SystemOverviewModal = () => {
  const { activeModal, closeModal } = useGame();
  const [activeTab, setActiveTab] = useState('overview');

  if (activeModal !== 'system' && activeModal !== 'overview') return null;

  return createPortal(
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card quick-link-modal-card system-overview-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-with-badge">
            <span className="modal-top-pill">🌐 System & Instructional Overview</span>
            <h2>About PalmQuest & Learning Materials</h2>
          </div>
          <button className="close-btn" onClick={closeModal} title="Close Modal">&times;</button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="system-modal-nav">
          <button
            className={`system-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            🏛️ System Overview
          </button>
          <button
            className={`system-nav-btn ${activeTab === 'competencies' ? 'active' : ''}`}
            onClick={() => setActiveTab('competencies')}
          >
            🎯 Competencies
          </button>
        </div>

        <div className="modal-body system-overview-modal-body">
          {/* TAB 1: SYSTEM OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="system-tab-content">
              {/* Hero Banner */}
              <div className="system-hero-card">
                <div className="system-hero-tag">🥥 Virtual Food Processing Laboratory</div>
                <h3 className="system-hero-title">What is PalmQuest?</h3>
                <p className="system-hero-desc">
                  <strong>PalmQuest</strong> is an interactive web-based Virtual Food Processing Laboratory simulation
                  and instructional software designed for <strong>Home Economics (HE)</strong> and <strong>Food Technology</strong> students.
                  It transforms traditional food processing curriculum into a high-engagement, gamified digital laboratory experience.
                </p>
                <div className="system-highlight-pills">
                  <span className="highlight-pill">✨ Interactive Simulation</span>
                  <span className="highlight-pill">🔬 Science-Backed Ratios</span>
                  <span className="highlight-pill">🛡️ GMP & Safety Aligned</span>
                  <span className="highlight-pill">🎓 Academic Research Based</span>
                </div>
              </div>

              {/* Core Pillars Grid */}
              <div className="system-pillars-grid">
                <div className="system-pillar-card">
                  <div className="pillar-icon">👩‍🏫</div>
                  <h4>Pedagogical Support</h4>
                  <p>
                    Features virtual instructor <strong>Teacher Mia</strong> who guides learners with spoken dialogue,
                    real-time corrective feedback, and scientific explanations behind each step.
                  </p>
                </div>

              </div>

              {/* Research Affiliation Footer Callout */}
              <div className="system-affiliation-box">
                <span className="affil-icon">🎓</span>
                <div className="affil-text">
                  <strong>Academic Research Affiliation:</strong>
                  <p>
                    Developed as an undergraduate thesis instructional material by <strong>BSIE-HE-4A</strong> (Bachelor of Science in Industrial Education - Major in Home Economics) at the <strong>Technological University of the Philippines (TUP Manila)</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPETENCIES */}
          {activeTab === 'competencies' && (
            <div className="system-tab-content">
              <div className="competencies-intro-banner">
                <h4>🎯 Curriculum & Learning Competencies Addressed</h4>
                <p>
                  Aligned with standard Food Processing and Home Economics curriculum competencies across three core domains of learning:
                </p>
              </div>

              <div className="competencies-stack">
                {CURRICULUM_COMPETENCIES.map((comp, idx) => (
                  <div key={idx} className="competency-group-card">
                    <div className="competency-group-header">
                      <span className="comp-icon">{comp.icon}</span>
                      <h5>{comp.category}</h5>
                    </div>
                    <ul className="competency-items-list">
                      {comp.items.map((item, iIdx) => (
                        <li key={iIdx}>
                          <span className="check-bullet">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer system-modal-footer">
          <div className="footer-left-info">
            <span>🌿 PalmQuest • Interactive Food Technology Learning System</span>
          </div>
          <button className="btn-primary" onClick={closeModal}>
            Return to Title Screen
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
