import React, { useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';
import { ResultsSidebar } from '../components/ResultsSidebar';
import { PPE_ITEMS, HANDWASHING_STEPS } from '../data/orientationData';
import { TOOL_INSPECTION_ITEMS, INGREDIENT_INSPECTION_ITEMS } from '../data/inspectionData';
import { STAGE_QUESTIONS } from '../data/stageQuestionsData';

const STAGE_SCIENCE_FACTS = [
  {
    step: 1,
    name: 'Washing & Hydrothermal Softening',
    img: '/assets/card_step_boiling.webp',
    fallbackIcon: '🥥',
    foodScience:
      'Hydrothermal softening at 100°C breaks down stubborn cellulosic fibers in coconut palm, solubilizing hemicellulose cell walls for smooth pureeing while thermally denaturing polyphenol oxidase (PPO) enzymes to prevent enzymatic browning.',
  },
  {
    step: 2,
    name: 'Pureeing & Fiber Homogenization',
    img: '/assets/card_step_grinding.webp',
    fallbackIcon: '⚡',
    foodScience:
      'High-shear mechanical grinding ruptures parenchymal cells to homogenize boiled palm fibers into a uniform microscopic slurry, preventing grittiness and ensuring consistent hydration with starch polymers.',
  },
  {
    step: 3,
    name: 'Dough Formulation (1:1 Ratio)',
    img: '/assets/card_step_mixing.webp',
    fallbackIcon: '🥣',
    foodScience:
      'The 1:1 formulation of pureed ubod to Erawan pure rice flour creates an optimal balance of insoluble plant fiber and amylose/amylopectin starch chains, providing the viscoelastic dough matrix required for structural steam expansion.',
  },
  {
    step: 4,
    name: 'Rectangular Molding (50mm × 25mm)',
    img: '/assets/card_step_molding.webp',
    fallbackIcon: '🥖',
    foodScience:
      'Uniform dimensional geometry (50mm length × 25mm width × 2mm thickness) establishes predictable thermal conductivity and moisture diffusion paths during steaming and dehydration, preventing blistering or raw ungelatinized cores.',
  },
  {
    step: 5,
    name: 'Starch Steaming (Gelatinization)',
    img: '/assets/card_step_steaming.webp',
    fallbackIcon: '♨️',
    foodScience:
      'Moist atmospheric heat at 100°C for 10 minutes drives water into starch granules until they swell and irreversibly burst, transforming crystalline amylose into an elastic gel network that locks the wafer shape.',
  },
  {
    step: 6,
    name: 'Cabinet Dehydration (Moisture < 10%)',
    img: '/assets/card_step_dehydration.webp',
    fallbackIcon: '☀️',
    foodScience:
      'Convective hot-air drying at 90°C evaporates free water until moisture drops below the critical 10% threshold, transitioning the gelatinized starch gel into a glassy, brittle solid matrix essential for puffing.',
  },
  {
    step: 7,
    name: 'Flash Deep Frying (high-temperature Puffing)',
    img: '/assets/card_step_frying.webp',
    fallbackIcon: '🍳',
    foodScience:
      'Immersion in high-temperature hot oil causes tightly trapped residual bound water to instantaneously vaporize into superheated steam. The resulting explosive vapor pressure inflates the starch matrix ~3x into an airy, crispy honeycomb cracker.',
  },
  {
    step: 8,
    name: 'Airtight Packaging & Quality Seal',
    img: '/assets/card_step_packaging.webp',
    fallbackIcon: '📦',
    foodScience:
      'Nitrogen-flushed, heat-sealed aluminum-laminated Kraft barrier pouches block water vapor, oxygen, and UV light penetration, preventing lipid oxidation (rancidity) and preserving crispness over a 6-month shelf life.',
  },
];

export const ResultsScene = () => {
  const {
    studentName,
    assessmentResults,
    stageAnswers,
    resetGame,
    completeMission,
    speak,
  } = useGame();

  const reportRef = useRef(null);

  useEffect(() => {
    try {
      completeMission('sequencing');
      completeMission('evaluation');
      soundManager.playFanfare();
      speak(
        `Welcome to your Laboratory Instructional Debrief, ${studentName || 'Food Technologist'}!\n\nHere is your comprehensive study guide and complete answer key for the Ubod CRUNCH manufacturing curriculum.\n\nEvery test question, personal protective equipment decision, sanitary handwashing step, equipment inspection, and stage principle is compiled below with its full food science rationale and quality assurance standard. No scores or pressure—just deep learning!\n\nUse the quick-jump directory or scroll down to explore each lesson.`,
        'happy',
        {
          badge: 'Instructional Debrief & Answer Key',
          note: 'Interactive Study Guide: Explore the complete answer key, scientific principles, and standard operating procedures for each stage.',
          hint: 'Click any section in the directory or scroll to review the lessons, then print your study guide below.',
          hideButton: true,
        }
      );
    } catch (err) {
      console.warn('ResultsScene mount error:', err);
    }
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

  const scrollToSection = (sectionId) => {
    soundManager.playClick();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Pre-Test PPE Audit Data
  const ppeAudit = assessmentResults?.preTest?.ppe;
  const ppeDistractors = Array.isArray(ppeAudit?.distractorsPicked) ? ppeAudit.distractorsPicked : [];
  const ppeCorrectSelected = Array.isArray(ppeAudit?.correctSelected) ? ppeAudit.correctSelected : [];

  // Pre-Test Handwashing Audit Data
  const handwashAudit = assessmentResults?.preTest?.handwashing;
  const handwashSubmitted = Array.isArray(handwashAudit?.submittedSteps) ? handwashAudit.submittedSteps : [];

  // Pre-Test Tools Audit Data
  const toolAudit = Array.isArray(assessmentResults?.preTest?.toolSafety) ? assessmentResults.preTest.toolSafety : [];

  // Pre-Test Ingredients Audit Data
  const ingredientAudit = Array.isArray(assessmentResults?.preTest?.qualityInspection) ? assessmentResults.preTest.qualityInspection : [];

  // Stage Pre-Checks Audit Data
  const stageKeys = ['mission1', 'mission2', 'mission3', 'mission4', 'mission5', 'mission6', 'mission7', 'mission8'];

  // Post-Test Sequencing Audit Data
  const sequenceAudit = assessmentResults?.postTest?.sequencing;
  const sequenceSubmitted = Array.isArray(sequenceAudit?.submittedItems) ? sequenceAudit.submittedItems : [];

  return (
    <div className="results-scene">
      <div className="results-container" ref={reportRef}>
        {/* ========================================================================= */}
        {/* HERO HEADER CARD (Score-Free Study Reference) */}
        {/* ========================================================================= */}
        <div className="results-header-card">
          <div className="results-ribbon">
            <span>📖 LABORATORY INSTRUCTIONAL DEBRIEF & COMPLETE ANSWER KEY</span>
          </div>

          <h2 className="results-main-title">Coconut Palm Processing: Master Answer Key & Lessons</h2>
          <p className="results-sub-title">
            <span>Curriculum: Coconut Palm Utilization for Cracker Development</span>
            <br />
            <span>
              Student: <strong>{studentName || 'Food Technology Student'}</strong> • Reference Date: {currentDate}
            </span>
          </p>

          <div className="results-showcase-section">
            <span className="results-showcase-heading">Manufactured Industrial Deliverables</span>
            <div className="results-hero-showcase">
              <div className="results-showcase-item">
                <img
                  src="/assets/platter_crackers_cooled.webp"
                  alt="Freshly Fried Ubod Crackers"
                  className="results-showcase-img"
                />
                <span className="results-showcase-label">Golden Crisp Ubod Crunch</span>
              </div>
              <div className="results-showcase-item">
                <img
                  src="/assets/pouch_sealed_labeled.webp"
                  alt="Branded Kraft Pouch"
                  className="results-showcase-img"
                />
                <span className="results-showcase-label">Airtight Stand-Up Pouch (50g)</span>
              </div>
              <div className="results-showcase-item">
                <img
                  src="/assets/box_of_packaged_crackers.webp"
                  alt="Retail Master Carton"
                  className="results-showcase-img"
                />
                <span className="results-showcase-label">Retail Master Box (8 Pouches)</span>
              </div>
            </div>
          </div>

          <div className="results-study-banner">
            <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>💡</span>
            <div>
              <strong>Pressure-Free Learning Space:</strong> This debrief presents every pre-test question,
              laboratory safety standard, workstation pre-check question, and manufacturing stage with full
              food science principles. Review what you chose, examine standard operating procedures, and
              deepen your food technology knowledge!
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* QUICK JUMP DIRECTORY */}
        {/* ========================================================================= */}
        <div className="results-quick-jump-bar">
          <div className="quick-jump-title">
            <span>🧭</span>
            <span>Jump to Section:</span>
          </div>
          <div className="quick-jump-buttons">
            <button
              type="button"
              className="quick-jump-btn"
              onClick={() => scrollToSection('section-ppe')}
            >
              <span>🥼</span> Part 1: PPE Attire
            </button>
            <button
              type="button"
              className="quick-jump-btn"
              onClick={() => scrollToSection('section-handwashing')}
            >
              <span>🧼</span> Part 2: Handwashing
            </button>
            <button
              type="button"
              className="quick-jump-btn"
              onClick={() => scrollToSection('section-tools')}
            >
              <span>🔍</span> Part 3: Tool Safety
            </button>
            <button
              type="button"
              className="quick-jump-btn"
              onClick={() => scrollToSection('section-ingredients')}
            >
              <span>🥥</span> Part 4: Ingredient QC
            </button>
            <button
              type="button"
              className="quick-jump-btn"
              onClick={() => scrollToSection('section-stage-questions')}
            >
              <span>📝</span> Part 5: Stage Questions (1–8)
            </button>
            <button
              type="button"
              className="quick-jump-btn"
              onClick={() => scrollToSection('section-pipeline')}
            >
              <span>🔄</span> Part 6: Pipeline Flow
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: PRE-TEST TASK 1 — PPE ATTIRE SELECTION */}
        {/* ========================================================================= */}
        <section id="section-ppe" className="results-section-card results-diagnostic-audit-card">
          <div className="section-card-header">
            <div className="section-title-wrap">
              <span className="section-num-badge">Part 1</span>
              <h3>Personal Protective Equipment (PPE) Selection & Hygiene Standard</h3>
            </div>
            <span className="section-status-tag">Sanitary Barrier Protocol</span>
          </div>

          <div className="audit-content-block">
            <p className="audit-lead-text">
              Under Good Manufacturing Practices (GMP) and Philippine Food Safety Regulations, personnel must establish 6 critical protective barriers before handling food contact surfaces:
            </p>

            <div className="ppe-audit-grid">
              {PPE_ITEMS.map((item) => {
                const wasSelected = ppeAudit?.selectedIds?.includes(item.id);
                const isCorrect = item.isCorrect;
                const isDistractor = !isCorrect;

                return (
                  <div
                    key={item.id}
                    className={`ppe-audit-item ${
                      isCorrect && wasSelected
                        ? 'item-correct'
                        : isCorrect && !wasSelected
                        ? 'item-missed'
                        : isDistractor && wasSelected
                        ? 'item-distractor-picked'
                        : 'item-distractor-avoided'
                    }`}
                  >
                    <div className="ppe-audit-img-box">
                      <img src={item.img} alt={item.name} className="ppe-audit-img" />
                    </div>
                    <div className="ppe-audit-details">
                      <h5>{item.name}</h5>
                      <p className="ppe-audit-role">{item.role}</p>

                      <div className="ppe-audit-verdict-wrap">
                        {isCorrect && wasSelected && (
                          <span className="ppe-audit-verdict verdict-good">✓ You Equipped This (Required Standard)</span>
                        )}
                        {isCorrect && !wasSelected && (
                          <span className="ppe-audit-verdict verdict-warn">⚠️ Missed Required Gear (Standard)</span>
                        )}
                        {isDistractor && wasSelected && (
                          <span className="ppe-audit-verdict verdict-bad">🚫 Selected Hazard: {item.reason}</span>
                        )}
                        {isDistractor && !wasSelected && (
                          <span className="ppe-audit-verdict verdict-good">✓ Correctly Avoided Hazard</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lesson-principle-card">
              <div className="principle-header">
                <span>🛡️</span>
                <strong>Food Safety Principle: Personal Protective Equipment (GMP Standard)</strong>
              </div>
              <p>
                Food handlers are the primary vector for physical hazards (hair, jewelry, loose threads) and microbiological contaminants (Staphylococcus aureus, fungal spores). Complete donning of clean lab coats, disposable hairnets, nitrile gloves, surgical face masks, closed-toe safety shoes, and spill aprons ensures zero direct biological contact with food formulations.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: PRE-TEST TASK 2 — WHO 7-STEP SANITARY HANDWASHING PROTOCOL */}
        {/* ========================================================================= */}
        <section id="section-handwashing" className="results-section-card results-diagnostic-audit-card">
          <div className="section-card-header">
            <div className="section-title-wrap">
              <span className="section-num-badge">Part 2</span>
              <h3>WHO 7-Step Sanitary Handwashing Protocol</h3>
            </div>
            <span className="section-status-tag">Aseptic Hygiene Standard</span>
          </div>

          <div className="audit-content-block">
            <p className="audit-lead-text">
              Comparison of your submitted hand hygiene steps against the official World Health Organization 7-step sanitary sequence:
            </p>

            {/* Student's Sequence */}
            <div className="sequence-comparison-container">
              <h4 className="table-sub-header">Your Submitted Handwashing Sequence:</h4>
              <div className="submitted-sequence-row">
                {handwashSubmitted.length > 0 ? (
                  handwashSubmitted.map((step, idx) => {
                    const isStepCorrect = step.isCorrect && step.step === idx + 1;
                    const isDistractor = !step.isCorrect;

                    return (
                      <div
                        key={idx}
                        className={`submitted-step-card ${
                          isStepCorrect
                            ? 'step-correct'
                            : isDistractor
                            ? 'step-distractor'
                            : 'step-misplaced'
                        }`}
                      >
                        <div className="step-badge">Position {idx + 1}</div>
                        <div className="step-icon-box">{step.icon}</div>
                        <h6>{step.action}</h6>
                        <p className="step-status-text">
                          {isStepCorrect
                            ? '✓ Correct Step & Order'
                            : isDistractor
                            ? `🚫 Hazard: ${step.reason}`
                            : `⚠️ Misplaced (Belongs at Step ${step.step})`}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-data-msg">Handwashing sequence recorded via interactive workstation.</div>
                )}
              </div>

              {/* Official Reference Timeline */}
              <h4 className="table-sub-header" style={{ marginTop: '24px' }}>
                Official WHO 7-Step Standard Reference Sequence:
              </h4>
              <div className="official-standard-row">
                {HANDWASHING_STEPS.filter((s) => s.isCorrect).map((step) => (
                  <div key={step.id} className="official-step-card">
                    <div className="official-step-num">Step {step.step}</div>
                    <div className="official-step-icon">{step.icon}</div>
                    <h6>{step.action}</h6>
                    <p className="official-step-desc">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lesson-principle-card">
              <div className="principle-header">
                <span>🧼</span>
                <strong>Food Hygiene Principle: Aseptic Friction & Biofilm Removal</strong>
              </div>
              <p>
                Microorganisms survive in lipid and sebum layers secreted by the skin. A 20-second mechanical scrub following the 7-step sequence (palms, dorsum, interdigital webs, knuckles, thumbs, fingernails, wrists) breaks down lipid envelopes through soap surfactant action, dislodging transient bacteria (Salmonella, E. coli, Norovirus) that casual rinsing leaves behind. Single-use paper towels prevent recontamination.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: PRE-TEST TASK 3 — TOOL & EQUIPMENT SAFETY */}
        {/* ========================================================================= */}
        <section id="section-tools" className="results-section-card results-diagnostic-audit-card">
          <div className="section-card-header">
            <div className="section-title-wrap">
              <span className="section-num-badge">Part 3</span>
              <h3>Food Contact Tool & Equipment Safety Inspection</h3>
            </div>
            <span className="section-status-tag">Sanitary Equipment Standards</span>
          </div>

          <div className="audit-content-block">
            <p className="audit-lead-text">
              Food processing equipment must be constructed from non-porous, corrosion-resistant materials with zero physical damage or electrical hazards:
            </p>

            <div className="audit-table-responsive inspection-audit-table-wrap">
              <table className="diagnostic-table audit-table">
                <thead>
                  <tr>
                    <th style={{ width: '22%' }}>Equipment / Tool</th>
                    <th style={{ width: '22%' }}>Requested Option</th>
                    <th style={{ width: '18%', textAlign: 'center' }}>Your Inspection Result</th>
                    <th style={{ width: '38%' }}>Target Requirement & Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  {TOOL_INSPECTION_ITEMS.map((item) => {
                    const recorded = toolAudit.find((t) => t.id === item.id);
                    const isCorrect = recorded !== undefined
                      ? Boolean(recorded.isCorrect ?? recorded.isSafe)
                      : true;
                    const selectedName = recorded?.chosen?.name;

                    return (
                      <tr key={item.id} className={isCorrect ? 'row-pass' : 'row-fail'}>
                        <td>
                          <strong>{item.name}</strong>
                        </td>
                        <td>{item.correctOption?.name || 'Requested Tool'}</td>
                        <td style={{ textAlign: 'center' }}>
                          {isCorrect ? (
                            <span className="badge-safe">✓ CORRECT TARGET</span>
                          ) : (
                            <span className="badge-hazard">⚠️ DIFFERENT ITEM</span>
                          )}
                        </td>
                        <td>
                          {isCorrect
                            ? item.correctOption?.reason
                            : `Selected: ${selectedName || 'No selection'}. Requested: ${item.correctOption?.name}.`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="lesson-principle-card">
              <div className="principle-header">
                <span>🔧</span>
                <strong>Engineering Principle: Hygienic Design & Food Contact Metallurgy</strong>
              </div>
              <p>
                Food-grade 304/316 austenitic stainless steel is resistant to pitting corrosion from organic acids and chlorine sanitizers. Scratched plastic cutting boards, rusted carbon steel blades, and cracked plastic spatulas harbor bacterial biofilms within microscopic fissures, which sanitize chemical washings cannot penetrate.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: PRE-TEST TASK 4 — RAW MATERIAL QUALITY INSPECTION */}
        {/* ========================================================================= */}
        <section id="section-ingredients" className="results-section-card results-diagnostic-audit-card">
          <div className="section-card-header">
            <div className="section-title-wrap">
              <span className="section-num-badge">Part 4</span>
              <h3>Raw Material Quality Assurance & Organoleptic Inspection</h3>
            </div>
            <span className="section-status-tag">Raw Material Receiving Protocol</span>
          </div>

          <div className="audit-content-block">
            <p className="audit-lead-text">
              Quality assurance inspection verifying incoming ingredients against sensory, microbiological, and moisture thresholds:
            </p>

            <div className="audit-table-responsive inspection-audit-table-wrap">
              <table className="diagnostic-table audit-table">
                <thead>
                  <tr>
                    <th style={{ width: '20%' }}>Raw Material</th>
                    <th style={{ width: '22%' }}>Requested Ingredient</th>
                    <th style={{ width: '18%', textAlign: 'center' }}>Your Inspection Result</th>
                    <th style={{ width: '40%' }}>Target Requirement & Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  {INGREDIENT_INSPECTION_ITEMS.map((item) => {
                    const recorded = ingredientAudit.find((i) => i.id === item.id);
                    const isCorrect = recorded !== undefined
                      ? Boolean(recorded.isCorrect ?? recorded.isSafe)
                      : true;
                    const selectedName = recorded?.chosen?.name;

                    return (
                      <tr key={item.id} className={isCorrect ? 'row-pass' : 'row-fail'}>
                        <td>
                          <strong>{item.name}</strong>
                        </td>
                        <td>{item.correctOption?.name}</td>
                        <td style={{ textAlign: 'center' }}>
                          {isCorrect ? (
                            <span className="badge-safe">✓ CORRECT TARGET</span>
                          ) : (
                            <span className="badge-hazard">⚠️ DIFFERENT INGREDIENT</span>
                          )}
                        </td>
                        <td>
                          {isCorrect
                            ? item.correctOption?.reason
                            : `Selected: ${selectedName || 'No selection'}. Requested: ${item.correctOption?.name}.`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="lesson-principle-card">
              <div className="principle-header">
                <span>🥥</span>
                <strong>Quality Assurance Principle: Incoming Ingredient Critical Limits</strong>
              </div>
              <p>
                Coconut palm is highly susceptible to enzymatic browning and bacterial souring once harvested due to high moisture and polyphenol oxidase (PPO) activity. Pure Erawan rice flour must remain below 12% moisture to prevent mold (Aspergillus flavus) and weevil proliferation. Frying oil must exhibit low free fatty acid (FFA &lt; 0.1%) to prevent hydroperoxide formation and acrid off-flavors during deep frying.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: STAGE PRE-CHECK QUESTIONS (STAGES 1–8) COMPLETE ANSWER KEY */}
        {/* ========================================================================= */}
        <section id="section-stage-questions" className="results-section-card results-diagnostic-audit-card">
          <div className="section-card-header">
            <div className="section-title-wrap">
              <span className="section-num-badge">Part 5</span>
              <h3>Stage Pre-Check Questions: Complete Master Answer Key (Stages 1–8)</h3>
            </div>
            <span className="section-status-tag">Food Technology Theory Review</span>
          </div>

          <div className="audit-content-block">
            <p className="audit-lead-text">
              Complete answer key for each stage pre-check question, detailing all 4 options, the standard correct answer, your submitted selection, and the comprehensive food science rationale:
            </p>

            <div className="stage-questions-review-stack">
              {stageKeys.map((stageKey, idx) => {
                const qData = STAGE_QUESTIONS[stageKey];
                const studentAnswer = stageAnswers?.[stageKey];
                const isAnswered = Boolean(studentAnswer);
                const isCorrect = Boolean(studentAnswer?.isCorrect);
                const activeChoices = studentAnswer?.choices || qData.choices;

                return (
                  <div key={stageKey} className="stage-question-review-card">
                    <div className="stage-question-review-body">
                      {/* Header */}
                      <div className="stage-question-review-header">
                        <div className="stage-question-title-group">
                          <span className="stage-question-stage-tag">{qData.stageTitle}</span>
                          <h4 className="stage-question-title">
                            {idx + 1}. {qData.question}
                          </h4>
                        </div>
                        {isAnswered ? (
                          <span
                            className={`stage-question-verdict ${
                              isCorrect ? 'verdict-correct' : 'verdict-wrong'
                            }`}
                          >
                            {isCorrect ? '✓ Correct Choice Selected' : '⚠️ Review Recommended Procedure'}
                          </span>
                        ) : (
                          <span className="stage-question-verdict verdict-correct">
                            ✓ Standard Procedure Lesson
                          </span>
                        )}
                      </div>

                      {/* All 4 Choices Full Review (2x2 Balanced Grid) */}
                      <div className="stage-choices-full-review">
                        <div className="review-choices-label">Complete Options & Standard Procedure Status:</div>
                        <div className="review-choices-grid">
                          {activeChoices.map((choice) => {
                            const choiceLetter = choice.displayLetter || choice.id?.toUpperCase();
                            const isThisCorrect = choice.isCorrect;
                            const isThisUserSelected =
                              studentAnswer?.selectedOptionId?.toLowerCase() === choice.id?.toLowerCase();

                            let cardClass = 'choice-review-card';
                            if (isThisCorrect) {
                              cardClass += ' choice-review-correct';
                            } else if (isThisUserSelected && !isThisCorrect) {
                              cardClass += ' choice-review-user-wrong';
                            } else {
                              cardClass += ' choice-review-neutral';
                            }

                            return (
                              <div key={choice.id} className={cardClass}>
                                <div className="choice-review-top">
                                  <span className="choice-review-letter">{choiceLetter}</span>
                                  {isThisCorrect && !isThisUserSelected && (
                                    <span className="choice-badge-correct">✓ Correct Standard</span>
                                  )}
                                  {isThisUserSelected && !isThisCorrect && (
                                    <span className="choice-badge-wrong">⚠️ Your Selection (Incorrect)</span>
                                  )}
                                  {isThisUserSelected && isThisCorrect && (
                                    <span className="choice-badge-user-correct">✓ Your Selection (Correct Standard)</span>
                                  )}
                                </div>
                                <p className="choice-review-text">{choice.text}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Food Science Explanation */}
                      <div className="stage-science-rationale">
                        <div className="stage-rationale-title">
                          <span>🔬</span>
                          <strong>Food Science Principle & Quality Control Lesson:</strong>
                        </div>
                        <p className="stage-rationale-text">{qData.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6: POST-TEST MANUFACTURING PIPELINE CHRONOLOGY */}
        {/* ========================================================================= */}
        <section id="section-pipeline" className="results-section-card results-diagnostic-audit-card">
          <div className="section-card-header">
            <div className="section-title-wrap">
              <span className="section-num-badge">Part 6</span>
              <h3>Manufacturing Pipeline: Authentic 8-Stage Unit Operations Sequence</h3>
            </div>
            <span className="section-status-tag">Industrial Processing Flow</span>
          </div>

          <div className="audit-content-block">
            <p className="audit-lead-text">
              The authentic chronological sequence of unit operations required to transform raw coconut palm into shelf-stable Ubod CRUNCH crackers:
            </p>

            <div className="stage-science-cards-stack">
              {STAGE_SCIENCE_FACTS.map((stage) => {
                const userStageAtPos = sequenceSubmitted[stage.step - 1];
                const wasCorrectAtPos = userStageAtPos?.step === stage.step;

                return (
                  <div key={stage.step} className="stage-science-card">
                    <div className="stage-science-left">
                      <div className="stage-science-num">Stage {stage.step}</div>
                      <img src={stage.img} alt={stage.name} className="stage-science-img" />
                    </div>
                    <div className="stage-science-body">
                      <div className="stage-science-title-row">
                        <h4>{stage.name}</h4>
                        {sequenceSubmitted.length > 0 && (
                          <span
                            className={`stage-order-verdict ${
                              wasCorrectAtPos ? 'order-pass' : 'order-misplaced'
                            }`}
                          >
                            {wasCorrectAtPos
                              ? '✓ You Ordered This Correctly'
                              : `⚠️ Placed at Position: ${userStageAtPos?.title || 'Misplaced'}`}
                          </span>
                        )}
                      </div>
                      <p className="stage-science-explanation">
                        <strong>Food Science Principle:</strong> {stage.foodScience}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ACTION CONTROLS */}
        {/* ========================================================================= */}
        <div className="results-actions-bar">
          <button type="button" className="btn-primary" onClick={handlePrint}>
            <span>🖨️ Print / Save Comprehensive Study Guide (PDF)</span>
          </button>
          <button type="button" className="btn-secondary" onClick={resetGame}>
            <span>🔄 Process New Laboratory Batch</span>
          </button>
        </div>

        {/* Scroll bottom clearance spacer */}
        <div className="results-scroll-spacer" style={{ height: '40px', flexShrink: 0 }} />
      </div>

      {/* Right Column Lesson Directory Sidebar */}
      <ResultsSidebar />
    </div>
  );
};
