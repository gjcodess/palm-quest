import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../../context/GameContext';
import sourceBlocks from '../../data/learningCornerContent.json';

// Keep the client document's wording, capitalization, and section numbering intact.
const SECTION_TITLES = [
  '1. Food Safety and Sanitation',
  '2. Ingredients and Their Functions',
  '4. Basic Food-Processing Methods',
  '5. Step-by-Step Preparation of Coconut Palm Crackers',
  '6. Quality and Final Product',
];

const SUBHEADINGS = new Set([
  'Personal Protective Equipment (PPE)',
  'Proper Handwashing',
  'Proper Tools and Equipment needed',
  'Safe Food-Handling Practices',
  'Care and Safety Reminders',
  'A. Boiling',
  'B. Steaming',
  'C. Dehydration',
  'D. Frying',
  'Learning Corner Summary',
]);

const sections = SECTION_TITLES.map((title, index) => {
  const start = sourceBlocks.findIndex((block) => block.type === 'paragraph' && block.text === title);
  const next = index + 1 < SECTION_TITLES.length
    ? sourceBlocks.findIndex((block) => block.type === 'paragraph' && block.text === SECTION_TITLES[index + 1])
    : sourceBlocks.length;
  return { title, blocks: sourceBlocks.slice(start, next) };
});

const DocumentBlock = ({ block }) => {
  if (block.type === 'table') {
    const [header, ...rows] = block.rows;
    return (
      <div className="learning-corner-table-scroll">
        <table className="learning-corner-table">
          <thead><tr>{header.map((cell, cellIndex) => <th key={cellIndex}>{cell}</th>)}</tr></thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => <td key={cellIndex}>{cell.trim()}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!block.text.trim()) return null;
  if (SECTION_TITLES.includes(block.text)) return <h3>{block.text}</h3>;
  if (SUBHEADINGS.has(block.text) || block.text.startsWith('Stage ')) return <h4>{block.text}</h4>;
  if (block.text.startsWith('Important') || block.text.startsWith('Remember:')) {
    return <p className="learning-corner-callout">{block.text}</p>;
  }
  return <p className="learning-corner-source-paragraph">{block.text}</p>;
};

export const LearningCornerModal = () => {
  const { activeModal, closeModal } = useGame();
  const [activeSection, setActiveSection] = useState(0);
  const bodyRef = useRef(null);

  if (activeModal !== 'learning-corner') return null;

  const selectSection = (index) => {
    setActiveSection(index);
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  };

  return createPortal(
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card quick-link-modal-card learning-corner-modal-card" role="dialog" aria-modal="true" aria-labelledby="learning-corner-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2 id="learning-corner-title">LEARNING CORNER</h2>
          <button className="close-btn" onClick={closeModal} aria-label="Close Learning Corner">&times;</button>
        </div>

        <nav className="learning-corner-tabs" aria-label="Learning Corner sections">
          {sections.map((section, index) => (
            <button
              key={section.title}
              type="button"
              className={`learning-corner-tab ${activeSection === index ? 'active' : ''}`}
              aria-current={activeSection === index ? 'page' : undefined}
              onClick={() => selectSection(index)}
            >
              {section.title}
            </button>
          ))}
        </nav>

        <div className="modal-body learning-corner-body" ref={bodyRef}>
          <section className="learning-corner-section" key={sections[activeSection].title}>
            {sections[activeSection].blocks.map((block, index) => <DocumentBlock block={block} key={index} />)}
          </section>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={closeModal}>Back to Title Screen</button>
        </div>
      </div>
    </div>,
    document.body
  );
};
