import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';

export const Mission5Frying = () => {
  const { setScene, addScore, unlockBadge, speak, showToast, completeMission, recordMistake, holdingItem, setHoldingItem } = useGame();

  const [fryStep, setFryStep] = useState(0); // 0: Heat oil, 1: Drop chips, 2: Puffing & sizzling, 3: Scoop with skimmer, 4: Done
  const [oilTemp, setOilTemp] = useState(120); // Target: high-temperature (Green zone 175-190°C)
  const [isHeating, setIsHeating] = useState(false);
  const [crackersPuffed, setCrackersPuffed] = useState(false);

  useEffect(() => {
    speak(
      'Stage 5: The Grand Finale (Deep Frying)! When dried pellets enter hot oil at high-temperature, trapped micro-moisture flashes into steam, instantly puffing the starch matrix into golden, crispy crackers.',
      'neutral',
      {
        badge: 'Stage 5: Deep Frying',
        hint: 'Click the Burner Control to heat the cooking oil to high-temperature.',
        hideButton: true,
      }
    );
  }, []);

  const handleStartHeating = () => {
    if (fryStep !== 0) return;
    soundManager.playClick();
    setIsHeating(true);
    showToast('Oil Heating Up', 'Watch the oil thermometer.', 'warning');
  };

  // Temperature rise loop
  useEffect(() => {
    let interval;
    if (isHeating && fryStep === 0) {
      interval = setInterval(() => {
        setOilTemp((prev) => {
          if (prev >= 185) {
            setIsHeating(false);
            setFryStep(1);
            soundManager.playSuccess();
            showToast('Optimal high-temperature Reached!', 'Click the pellets to hold them, then click the wok!', 'success');
            speak(
              'Oil is at the optimal high-temperature frying temperature! Click the Dried Pellets to hold them, then click into the sizzling wok!',
              'happy',
              {
                badge: 'Thermal Optimum',
                hint: 'Click Dried Pellets, then click wok to drop into oil.',
                hideButton: true,
              }
            );
            return 185;
          }
          return prev + 5;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isHeating, fryStep]);

  const handlePelletsClick = () => {
    if (fryStep !== 1) return;
    soundManager.playClick();
    if (holdingItem?.id === 'dried_pellets') {
      handleDropPellets();
    } else {
      setHoldingItem({
        id: 'dried_pellets',
        name: 'Dried Pellets (9% Moisture)',
        img: '/assets/icon_dried_pellets.webp',
        actionHint: 'Click sizzling wok to flash puff!',
      });
    }
  };

  const handleDropPellets = () => {
    if (fryStep !== 1) return;

    soundManager.playSizzle();
    setHoldingItem(null);
    setFryStep(2);
    setCrackersPuffed(true);
    showToast('Flash Puffing!', 'Steam expansion in action!', 'success');

    setTimeout(() => {
      soundManager.playSuccess();
      setFryStep(3);
      speak(
        'Look at that instant 3x expansion! Now click the Spider Skimmer to scoop the golden crackers onto the paper-towel cooling rack.',
        'happy',
        {
          badge: 'Scoop & Drain',
          hint: 'Click the Spider Skimmer to drain excess oil.',
          hideButton: true,
        }
      );
    }, 2000);
  };

  const handleScoopSkimmer = () => {
    if (fryStep === 4) {
      soundManager.playSuccess();
      speak(
        'Outstanding culinary execution! The Coconut Palm Crackers are light, bubbly, golden, and drained dry of excess oil. You have completed the entire food processing sequence!',
        'happy',
        {
          badge: 'All Missions Cleared',
          btnText: 'Proceed to Sensory & Certification ➔',
          onNext: () => setScene('evaluation'),
        }
      );
      return;
    }

    if (fryStep !== 3) return;

    soundManager.playCrunch();
    soundManager.playFanfare();
    addScore(50);
    unlockBadge('golden_crunch_master', 'Master of the Golden Crunch', '👑');
    setHoldingItem(null);
    setFryStep(4);
    completeMission('mission5');
    speak(
      'Outstanding culinary execution! The Coconut Palm Crackers are light, bubbly, golden, and drained dry of excess oil. You have completed the entire food processing sequence!',
      'happy',
      {
        badge: 'All Missions Cleared',
        btnText: 'Proceed to Sensory & Certification ➔',
        onNext: () => setScene('evaluation'),
      }
    );
  };

  return (
    <div className="workstation-scene stage-5-bg">
      <div className="workstation-overlay" />
      <div className="stage-center-zone">
        <div className="workstation-card frying-workstation">
          <div className="vessel-header">
            <span className="vessel-title">
              <img src="/assets/icon_frying_wok.webp" alt="" className="vessel-header-icon" />
              Deep Frying Wok: Thermal Expansion
            </span>
            <span className="vessel-badge">Pillar 3: Frying</span>
          </div>

          <div className="frying-station-layout">
            {/* The Wok / Frying Vessel */}
            <div
              className={`dropzone wok-zone ${fryStep === 1 ? 'highlight-ready' : ''} ${fryStep >= 2 ? 'sizzling-wok' : ''}`}
              onClick={fryStep === 1 ? handleDropPellets : (fryStep === 3 || fryStep === 4) ? handleScoopSkimmer : null}
            >
              <div className="wok-graphic">
                <img src="/assets/icon_frying_wok.webp" alt="Frying Wok" className="wok-appliance-img" />

                {fryStep === 0 && (
                  <div className="oil-heating-prompt" onClick={handleStartHeating}>
                    <span className="oil-temp-badge">Oil Temp: {oilTemp}°C</span>
                    <button className="btn-gold btn-heat-oil">
                      🔥 {isHeating ? 'Heating Oil...' : 'Click to Heat Oil to high-temperature'}
                    </button>
                  </div>
                )}

                {fryStep === 1 && (
                  <div className="oil-ready-alert pop-in">
                    <span className="temp-ready">✓ high-temperature Ready!</span>
                    <p>Tap here or tap tray to drop chips</p>
                  </div>
                )}

                {fryStep >= 2 && (
                  <div className="in-wok-contents">
                    <div className="oil-bubbles">
                      <span className="bubble">🫧</span>
                      <span className="bubble">🫧</span>
                      <span className="bubble">🫧</span>
                      <span className="bubble">🫧</span>
                      <span className="bubble">🫧</span>
                      <span className="bubble">🫧</span>
                    </div>

                    <div className={`crackers-in-oil ${crackersPuffed ? 'puffed-up' : ''}`}>
                      <img src="/assets/icon_puffed_crackers.webp" alt="Puffed Crackers" className="puffed-cracker-img" />
                      <span className="puff-multiplier-tag">3x Starch Expansion! ✨</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Frying Tools Panel */}
            <div className="frying-tools-sidebar">
              <div className="thermometer-gauge">
                <img src="/assets/icon_oil_thermometer.webp" alt="Thermometer" className="thermometer-gauge-img" />
                <div className="therm-bar">
                  <div className="therm-target-band" style={{ bottom: '70%', height: '15%' }} />
                  <div className="therm-fill" style={{ height: `${(oilTemp / 220) * 100}%` }} />
                </div>
                <span className="therm-readout">{oilTemp}°C</span>
                <span className="therm-sub">Target: high-temperature</span>
              </div>

              {fryStep >= 3 && (
                <div className="skimmer-tool-box pop-in" onClick={handleScoopSkimmer}>
                  <img src="/assets/icon_spider_skimmer.webp" alt="Skimmer" className="skimmer-tool-img" />
                  <button className="btn-primary btn-skimmer">
                    {fryStep === 4 ? 'Crackers Drained ✓' : 'Scoop with Skimmer!'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {fryStep === 4 && (
            <div className="frying-complete-banner pop-in">
              <img src="/assets/icon_cracker_platter.webp" alt="Platter" className="dough-img" />
              <h4>🎉 Laboratory Complete! Golden Puffed Crackers Ready!</h4>
              <p>3x starch expansion achieved with crispy sensory texture</p>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Shelf */}
      <div className="inventory-tray">
        <div className="tray-title-bar">
          <span className="tray-label">🧰 Frying Supplies:</span>
          <span className="tray-hint">Click dried pellets when oil is high-temperature</span>
        </div>
        <div className="items-carousel">
          <div
            className={`drag-card ${holdingItem?.id === 'dried_pellets' ? 'lifted selected-tap' : fryStep === 1 ? 'selected-tap pulse' : ''} ${fryStep > 1 ? 'used' : ''}`}
            onClick={fryStep === 1 ? handlePelletsClick : null}
          >
            <img src="/assets/icon_dried_pellets.webp" alt="Dried Pellets" className="card-icon-img" />
            <span className="card-title">Dried Pellets</span>
            <span className="card-measure">Glassy 9%</span>
          </div>

          <div
            className={`drag-card ${fryStep < 3 ? 'used' : holdingItem?.id === 'skimmer' ? 'lifted selected-tap' : fryStep === 3 ? 'selected-tap pulse' : 'used'}`}
            onClick={() => {
              if (fryStep === 3) {
                if (holdingItem?.id === 'skimmer') {
                  handleScoopSkimmer();
                } else {
                  soundManager.playClick();
                  setHoldingItem({
                    id: 'skimmer',
                    name: 'Spider Skimmer',
                    img: '/assets/icon_spider_skimmer.webp',
                    actionHint: 'Click wok to scoop crackers',
                  });
                }
              }
            }}
          >
            <img src="/assets/icon_spider_skimmer.webp" alt="Spider Skimmer" className="card-icon-img" />
            <span className="card-title">Spider Skimmer</span>
            <span className="card-measure">{fryStep >= 4 ? 'Used' : 'Scoop & Drain'}</span>
          </div>

          <div className="drag-card used">
            <img src="/assets/icon_cooking_oil.webp" alt="Cooking Oil" className="card-icon-img" />
            <span className="card-title">Cooking Oil</span>
            <span className="card-measure">500ml in Wok</span>
          </div>
        </div>
      </div>
    </div>
  );
};
