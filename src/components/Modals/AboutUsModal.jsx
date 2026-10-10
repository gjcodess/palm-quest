import React from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../../context/GameContext';

const RESEARCH_TEAM = [
  {
    name: 'Mary Ann Mercullo Catalo',
    role: 'Lead Researcher / Product Developer',
    phone: '09707093459',
    email: 'maryann.catalo@tup.edu.ph',
    avatarLetter: 'MC',
    badgeColor: '#10b981',
  },
  {
    name: 'Jessica Ann Beltran Corpus',
    role: 'Lead Researcher / Quality & Formulation',
    phone: '09214193358',
    email: 'jessicaann.corpus@tup.edu.ph',
    avatarLetter: 'JC',
    badgeColor: '#059669',
  },
  {
    name: 'Pauline Expedita Anita S. David',
    role: 'Lead Researcher / Process Technologist',
    phone: '09312146338',
    email: 'paulineexpeditaanita.david@tup.edu.ph',
    avatarLetter: 'PD',
    badgeColor: '#047857',
  },
  {
    name: 'Carl Emmanuel M. De Honor',
    role: 'Lead Researcher / Technical & Operations',
    phone: '09669023940',
    email: 'carlemmanuel.dehonor@tup.edu.ph',
    avatarLetter: 'CD',
    badgeColor: '#0d9488',
  },
  {
    name: 'Princess Marian L. Nazar',
    role: 'Lead Researcher / Food Safety & Documentation',
    phone: '09568827810',
    email: 'princessmarian.nazar@tup.edu.ph',
    avatarLetter: 'PN',
    badgeColor: '#14532d',
  },
];

export const AboutUsModal = () => {
  const { activeModal, closeModal } = useGame();

  if (activeModal !== 'about') return null;

  return createPortal(
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card about-us-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👥 About Us & The Coconut Palm Research Project</h2>
          <button className="close-btn" onClick={closeModal} title="Close Modal">&times;</button>
        </div>

        <div className="modal-body about-modal-body">
          {/* Hero Story Card */}
          <div className="about-hero-banner">
            <div className="about-hero-badge">🎓 BSIE-HE-4A • Academic Thesis & Product Innovation</div>
            <h3 className="about-hero-title">The Coconut Palm (Ubod) Cracker Initiative</h3>
            <p className="about-hero-text">
              <strong>PalmQuest</strong> was conceptualized and developed as an instructional material and interactive
              virtual laboratory for the undergraduate thesis of <strong>BSIE-HE-4A</strong> (Bachelor of Science in Industrial
              Education - Major in Home Economics, Section 4A) at the <strong>Technological University of the Philippines (TUP Manila)</strong>.
            </p>
            <p className="about-hero-text">
              The project showcases the scientific formulation and commercial processing of
              <strong> "Coconut Palm Crackers"</strong>—an innovative snack product designed to valorize fibrous coconut palm
              (<em>ubod ng niyog</em>) into nutritious, crispy, and shelf-stable food-grade crackers using standardized
              blending, steam gelatinization, dehydration, and frying technologies.
            </p>
          </div>

          {/* Research Group Owners Section */}
          <div className="about-section-header">
            <h4 className="about-subheading">🏛️ Research Team & Group Owners</h4>
            <span className="about-subheading-tag">BSIE-HE-4A • TUP Manila</span>
          </div>

          <div className="about-owners-grid">
            {RESEARCH_TEAM.map((member, idx) => (
              <div key={idx} className="about-owner-card">
                <div className="owner-card-header">
                  <div className="owner-avatar-badge" style={{ background: member.badgeColor }}>
                    {member.avatarLetter}
                  </div>
                  <div className="owner-name-stack">
                    <h5 className="owner-name">{member.name}</h5>
                    <span className="owner-role">{member.role}</span>
                  </div>
                </div>

                <div className="owner-contact-row">
                  <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <a href={`tel:${member.phone}`} className="contact-link">{member.phone}</a>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">✉️</span>
                    <a href={`mailto:${member.email}`} className="contact-link email-link" title={member.email}>
                      {member.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Educational Purpose Callout */}
          <div className="about-purpose-box">
            <div className="purpose-icon">💡</div>
            <div className="purpose-text">
              <strong>Educational & Instructional Vision:</strong>
              <p>
                This virtual simulation serves as an interactive instructional tool for food technology students,
                educators, and researchers to simulate laboratory procedures, practice Good Manufacturing Practices (GMP),
                and understand thermal starch transformation in a safe, repeatable environment.
              </p>
            </div>
          </div>

          {/* Subtle Developer Attribution */}
          <div className="about-developer-credit">
            <span>Developed by </span>
            <a
              href="https://www.gjcodes.me/portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="dev-credit-link"
              title="Visit Developer Portfolio"
            >
              gjcodes ↗
            </a>
          </div>
        </div>

        <div className="modal-footer">
          <a href="https://palm-quest.vercel.app/privacy/" target="_blank" rel="noopener noreferrer" className="contact-link" style={{ marginRight: 'auto' }}>
            Privacy Policy ↗
          </a>
          <button className="btn-primary" onClick={closeModal}>
            Return to Virtual Laboratory
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
