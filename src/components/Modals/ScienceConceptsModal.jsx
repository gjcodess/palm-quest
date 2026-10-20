import React from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../../context/GameContext';
import { LECTURE_CONCEPTS } from '../../data/orientationData';

export const ScienceConceptsModal = () => {
  const { activeModal, closeModal } = useGame();

  if (activeModal !== 'science') return null;

  return createPortal(
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card quick-link-modal-card science-concepts-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔬 Science Concept</h2>
          <button className="close-btn" onClick={closeModal}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="science-concepts-grid">
            {LECTURE_CONCEPTS.map((concept, index) => (
              <div key={concept.id} className="science-concept-card">
                <div className="science-card-header">
                  <div className="science-card-icon">{concept.icon}</div>
                  <div className="science-card-title-group">
                    {concept.tag && <span className="science-card-tag">{concept.tag}</span>}
                    <h4 className="science-card-title">{index + 1}. {concept.title}</h4>
                  </div>
                </div>
                <div className="science-card-deepdive">
                  <strong>Science Insight:</strong> {concept.details}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={closeModal}>Got It! Return to Menu</button>
        </div>
      </div>
    </div>,
    document.body
  );
};
