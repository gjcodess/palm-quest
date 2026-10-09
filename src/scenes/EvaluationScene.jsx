import React, { useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';
import { EvaluationSidebar } from '../components/EvaluationSidebar';

export const EvaluationScene = () => {
  const { studentName, score, stars, badges, resetGame, speak, setScene, completeMission } = useGame();
  const certRef = useRef(null);

  useEffect(() => {
    completeMission('sequencing');
    completeMission('evaluation');
    soundManager.playFanfare();
    speak(
      `Laboratory Graduation & Sensory Audit, ${studentName || 'Food Technologist'}!\n\nYou have officially completed the comprehensive Coconut Palm Cracker (Ubod CRUNCH) manufacturing course and demonstrated full mastery of food processing unit operations!\n\nThroughout the 8 stages, you applied rigorous food hygiene, calibrated 1:1 ingredient ratios, mastered hydrothermal softening, high-speed pureeing, uniform geometric molding, steam gelatinization, convective moisture vitrification, flash deep-frying, and hermetic barrier packaging.\n\nInspect your sensory audit score breakdown, review your earned competency badges, and click "Print Official Certificate" below to claim your credential!`,
      'happy',
      {
        badge: 'Graduation & Mastery Certification',
        note: 'Professional Validation: You have mastered all HACCP guidelines, safe thermal parameters, and commercial quality assurance standards.',
        hint: 'Review your sensory audit metrics and print your official certificate below.',
        hideButton: true,
      }
    );
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrintCertificate = () => {
    soundManager.playClick();
    window.print();
  };

  return (
    <div className="evaluation-scene">
      <div className="eval-container">
        {/* Header Banner */}
        <div className="eval-header-card">
          <div className="cert-ribbon">
            <img src="/assets/icon_gold_medal_front.webp" alt="Medal" className="eval-ribbon-medal-img" />
            <span>LABORATORY MASTERY ACHIEVED</span>
          </div>
          <div className="eval-hero-showcase">
            <div className="eval-showcase-item">
              <img src="/assets/platter_crackers_cooled.webp" alt="Freshly Fried Ubod Crackers" className="eval-showcase-img" />
              <span className="eval-showcase-label">Golden Crisp Ubod Crunch</span>
            </div>
            <div className="eval-showcase-item">
              <img src="/assets/pouch_sealed_labeled.webp" alt="Branded Kraft Pouch" className="eval-showcase-img" />
              <span className="eval-showcase-label">Airtight Stand-Up Pouch (50g)</span>
            </div>
            <div className="eval-showcase-item">
              <img src="/assets/box_of_packaged_crackers.webp" alt="Retail Master Carton" className="eval-showcase-img" />
              <span className="eval-showcase-label">Retail Display Box (8 Pouches)</span>
            </div>
          </div>
          <h2>Coconut Palm Crackers Quality Audit</h2>
          <p className="eval-sub">NUDAZAR HONORE - Ubod CRUNCH Comprehensive Evaluation Report</p>
        </div>

        {/* Sensory Evaluation Checklist & Score Breakdown */}
        <div className="eval-metrics-grid">
          <div className="metric-box">
            <span className="metric-icon">✨</span>
            <h4>Appearance & Uniformity</h4>
            <div className="stars-row">⭐⭐⭐⭐⭐</div>
            <p>Pale golden rectangular wafers, uniform 50mm x 25mm dimensions without scorching.</p>
          </div>

          <div className="metric-box">
            <span className="metric-icon">🔊</span>
            <h4>Crispiness & Fracture Snap</h4>
            <div className="stars-row">⭐⭐⭐⭐⭐</div>
            <p>Airy, brittle, high acoustic crunch with no gummy or chewy core.</p>
          </div>

          <div className="metric-box">
            <span className="metric-icon">🪶</span>
            <h4>Starch Matrix Expansion</h4>
            <div className="stars-row">⭐⭐⭐⭐⭐</div>
            <p>Rice flour and pureed ubod matrix successfully puffed 3x upon 10-sec flash frying.</p>
          </div>

          <div className="metric-box">
            <span className="metric-icon">🧼</span>
            <h4>Packaging & Oil Drainage</h4>
            <div className="stars-row">⭐⭐⭐⭐⭐</div>
            <p>Drained effectively in colander, hermetically heat-sealed in branded kraft pouch.</p>
          </div>
        </div>

        {/* The Official Certificate (Printable) */}
        <div className="certificate-wrapper" ref={certRef}>
          <div className="cert-border-outer">
            <div className="cert-border-inner">
              <div className="cert-header">
                <span className="cert-dept">DEPARTMENT OF HOME ECONOMICS • FOOD PROCESSING TECHNOLOGY</span>
                <h1 className="cert-title">Certificate of Laboratory Completion</h1>
                <p className="cert-presented">This certifies that</p>
                <h2 className="cert-student-name">{studentName || 'Food Technology Student'}</h2>
                <p className="cert-body">
                  has successfully performed and demonstrated comprehensive mastery in the complete 8-stage food processing lifecycle of
                  <strong> Coconut Palm Crackers (Ubod ng Niyog - Ubod Crunch)</strong>, including hygiene inspection, washing & boiling, food processing puree,
                  1:1 Erawan rice flour paste formulation, rectangular molding, 10-minute steam gelatinization, 90°C cabinet dehydration,
                  10-second flash deep-frying expansion, airtight barrier packaging, and pipeline sequence validation.
                </p>
              </div>

              {/* Badges Display */}
              <div className="cert-badges-showcase">
                {badges.map((b) => (
                  <div key={b.id} className="cert-badge-item">
                    <span className="cert-badge-icon">{b.icon}</span>
                    <span className="cert-badge-title">{b.title}</span>
                  </div>
                ))}
              </div>

              {/* Score & Signatures */}
              <div className="cert-footer">
                <div className="cert-sig-block">
                  <div className="sig-line">
                    <span className="sig-handwritten">Teacher Mia</span>
                  </div>
                  <span className="sig-title">Teacher Mia</span>
                  <span className="sig-role">HE Laboratory Instructor</span>
                </div>

                <div className="cert-seal-block">
                  <img src="/assets/icon_certificate_seal.webp" alt="Official Seal" className="cert-gold-seal-img" />
                  <span className="cert-date">{currentDate}</span>
                </div>

                <div className="cert-sig-block">
                  <div className="sig-line">
                    <span className="sig-handwritten">NUDAZAR HONORE</span>
                  </div>
                  <span className="sig-title">Nudazar Honore</span>
                  <span className="sig-role">Master Food Technologist</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="eval-actions">
          <button className="btn-gold btn-print" onClick={handlePrintCertificate}>
            <span>Print / Save Certificate as PDF</span>
          </button>
          <button className="btn-primary" onClick={() => setScene('sequencing')}>
            <span>Review Step Sequence Challenge</span>
          </button>
          <button className="btn-secondary" onClick={resetGame}>
            <span>Process Another Batch</span>
          </button>
        </div>

        {/* Guaranteed bottom scroll clearance spacer */}
        <div className="eval-bottom-spacer" style={{ height: '36px', flexShrink: 0 }} />
      </div>

      {/* 20% Right Column Evaluation & Badges Sidebar */}
      <EvaluationSidebar />
    </div>
  );
};
