import React from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../../context/GameContext';

export const RecipeModal = () => {
  const { activeModal, closeModal } = useGame();

  if (activeModal !== 'recipe') return null;

  return createPortal(
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card quick-link-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🥥 Recipe Standard</h2>
          <button className="close-btn" onClick={closeModal}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="recipe-grid recipe-grid-single">
            <div className="recipe-col">
              <h3>📋 Recipe Standard</h3>
              <ul className="recipe-ingredient-list">
                <li>
                  <strong>1. Ubod ng niyog -</strong> Main ingredient provides fiber and structure for the kropek
                </li>
                <li>
                  <strong>2. Rice flour -</strong> Acts as binder and improves texture of the ubod crunch
                </li>
                <li>
                  <strong>3. Salt -</strong> Enhances flavor of the kropek
                </li>
                <li>
                  <strong>4. Vegetable oil -</strong> Used for frying the ubod crunch kropek
                </li>
                <li>
                  <strong>5. Water -</strong> helps binding the ingredients together.
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={closeModal}>Got it!</button>
        </div>
      </div>
    </div>,
    document.body
  );
};
