import React from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../../context/GameContext';

export const ObjectivesModal = () => {
  const { activeModal, closeModal } = useGame();

  if (activeModal !== 'objectives') return null;

  return createPortal(
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card quick-link-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎯 Learning Objectives & Competencies</h2>
          <button className="close-btn" onClick={closeModal}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="objective-card cognitive">
            <h4>🧠 1. Identification & Knowledge (Cognitive)</h4>
            <p><strong>Objective 1:</strong> Identify the ingredients, tools, equipment, and Personal Protective Equipment (PPE) needed in making <strong>Coconut Palm Crunch (Ubod Crunch)</strong>.</p>
          </div>
          <div className="objective-card psychomotor">
            <h4>🛠️ 2. Methodological Demonstration (Psychomotor)</h4>
            <p><strong>Objective 2:</strong> Demonstrate the proper procedures and food-processing methods in producing Coconut Palm Crunch — from raw preparation, boiling, grinding, mixing, and molding to steaming, dehydration, and frying.</p>
          </div>
          <div className="objective-card affective">
            <h4>🤝 3. Safety & Sanitation Practice (Affective)</h4>
            <p><strong>Objective 3:</strong> Apply proper food safety, kitchen sanitation, hazard prevention, and PPE practices throughout the preparation and processing of the product.</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={closeModal}>Start Learning</button>
        </div>
      </div>
    </div>,
    document.body
  );
};
