import React from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../../context/GameContext';

const HELP_SECTIONS = [
  {
    icon: '🥼',
    title: 'Safety and Quality Inspection',
    description:
      'Students must complete the four parts of safety and quality inspection. PPE verification. 7 step sanitary handwashing. Tools and equipment inspection. Ingredients quality.',
  },
  {
    icon: '🧪',
    title: 'Laboratory Workstations',
    description:
      'Students will be able to interact with 8 laboratory workstations.',
  },
  {
    icon: '👩‍🏫',
    title: 'Teacher Mia',
    description:
      'There is a teacher in the left side of the screen wherein the students will be able to read teacher Mia’s instructions.',
  },
  {
    icon: '🧩',
    title: 'Post Test',
    description:
      'Before the game ends, students will need to arrange coconut palm cracker production from Stage 1 to 8.',
  },
];

export const HelpModal = () => {
  const { activeModal, closeModal } = useGame();

  if (activeModal !== 'help') return null;

  return createPortal(
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card quick-link-modal-card help-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>❓ How to Play & Laboratory User Guide</h2>
          <button className="close-btn" onClick={closeModal} title="Close Modal">&times;</button>
        </div>

        <div className="modal-body help-modal-body">
          <p className="help-intro-text">
            Welcome to <strong>PalmQuest</strong>! This interactive virtual laboratory simulates the scientific preparation
            and commercial manufacturing of <strong>Coconut Palm (Ubod) Crackers</strong>. Here is your quick start guide:
          </p>

          <div className="help-sections-grid">
            {HELP_SECTIONS.map((sec, idx) => (
              <div key={idx} className="help-card-item">
                <div className="help-card-icon">{sec.icon}</div>
                <div className="help-card-content">
                  <h4 className="help-card-title">{sec.title}</h4>
                  <p className="help-card-desc">{sec.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="help-tip-box">
            <span className="tip-icon">💡</span>
            <div className="tip-content">
              <strong>Need instant assistance during a stage?</strong>
              <p>Click Teacher Mia’s floating avatar in the bottom-left corner at any time to check lab hints or standard operating procedures.</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={closeModal}>
            Got It! Back to Lab
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
