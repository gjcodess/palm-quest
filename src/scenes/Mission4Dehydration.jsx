import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';

export const Mission4Dehydration = () => {
  const { setScene, addScore, unlockBadge, speak, showToast, completeMission, holdingItem, setHoldingItem } = useGame();

  const [dehydrateStep, setDehydrateStep] = useState(0); // 0: Place discs on tray, 1: Set temperature, 2: Dehydrating loop, 3: Completed
  const [trayDiscs, setTrayDiscs] = useState(0); // 0 to 4 discs
  const [temperature, setTemperature] = useState(30); // Target: 60°C
  const [moistureLevel, setMoistureLevel] = useState(75); // Target: < 10%
  const [isDrying, setIsDrying] = useState(false);

  useEffect(() => {
    speak(
      'Stage 4: Moisture Control (Dehydration)! If we fry wet paste, it turns soggy. We must dehydrate our sliced cracker discs to remove free water down to under 10%.',
      'neutral',
      {
        badge: 'Stage 4: Dehydration',
        hint: 'Click the Sliced Raw Discs to hold them, then click the perforated drying tray to load.',
        hideButton: true,
      }
    );
  }, []);

  const handleCardClick = () => {
    if (trayDiscs >= 4) return;
    soundManager.playClick();
    if (holdingItem?.id === 'raw_discs') {
      setHoldingItem(null);
    } else {
      setHoldingItem({
        id: 'raw_discs',
        name: `Sliced Discs (${4 - trayDiscs} left)`,
        img: '/assets/icon_raw_discs.webp',
        actionHint: 'Click drying tray to arrange discs',
      });
    }
  };

  const handleAddDiscToTray = () => {
    if (dehydrateStep === 3) {
      soundManager.playSuccess();
      speak(
        'Sensational dehydration! Moisture has dropped from 75% down to 9%. The discs are now glassy, hard, and shelf-stable raw pellets, primed for puffing in Stage 5: Deep Frying!',
        'happy',
        {
          badge: 'Stage 4 Cleared',
          btnText: 'Proceed to Stage 5: Deep Frying ➔',
          onNext: () => setScene('mission5'),
        }
      );
      return;
    }
    if (dehydrateStep !== 0) return;
    soundManager.playPour();
    const count = trayDiscs + 1;
    setTrayDiscs(count);

    if (count >= 4) {
      setDehydrateStep(1);
      setHoldingItem(null);
      showToast('Tray Loaded!', 'Now set the cabinet dehydrator to 60°C.', 'success');
      speak(
        'The perforated tray is loaded with uniform discs! Now click the temperature dial to set the cabinet dehydrator to 60°C.',
        'thinking',
        {
          badge: 'Temperature Control',
          hint: 'Click the temperature control until it reaches 60°C.',
          hideButton: true,
        }
      );
    } else if (holdingItem?.id === 'raw_discs') {
      setHoldingItem({
        id: 'raw_discs',
        name: `Sliced Discs (${4 - count} left)`,
        img: '/assets/icon_raw_discs.webp',
        actionHint: 'Click drying tray to arrange discs',
      });
    }
  };

  const handleSetTemperature = () => {
    if (dehydrateStep !== 1) return;
    soundManager.playClick();
    const nextTemp = temperature + 10;
    setTemperature(nextTemp);

    if (nextTemp >= 60) {
      soundManager.playSuccess();
      setDehydrateStep(2);
      setIsDrying(true);
      showToast('60°C Set!', 'Dehydration cycle running...', 'success');
      speak(
        'Warm dry air at 60°C is circulating! Watch the moisture meter drop from 75% down below 10%.',
        'neutral',
        {
          badge: 'Moisture Evaporation',
          hint: 'Allow the dehydration cycle to reach under 10% moisture.',
          hideButton: true,
        }
      );
    }
  };

  // Dehydration cycle effect
  useEffect(() => {
    let interval;
    if (isDrying && dehydrateStep === 2) {
      interval = setInterval(() => {
        setMoistureLevel((prev) => {
          if (prev <= 9) {
            setIsDrying(false);
            setDehydrateStep(3);
            soundManager.playSuccess();
            addScore(50);
            unlockBadge('thermal_master', 'Thermal Processing Master', '🌡️');
            completeMission('mission4');
            showToast('Dehydration Complete!', '+50 Points! Moisture reduced to 9%.', 'success');
            speak(
              'Sensational dehydration! Moisture has dropped from 75% down to 9%. The discs are now glassy, hard, and shelf-stable raw pellets, primed for puffing in Stage 5: Deep Frying!',
              'happy',
              {
                badge: 'Stage 4 Cleared',
                btnText: 'Proceed to Stage 5: Deep Frying ➔',
                onNext: () => setScene('mission5'),
              }
            );
            return 9;
          }
          return prev - 3;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isDrying, dehydrateStep]);

  return (
    <div className="workstation-scene stage-4-bg">
      <div className="workstation-overlay" />
      <div className="stage-center-zone">
        <div className="active-vessel-card dehydration-workstation">
          <div className="vessel-header">
            <span className="vessel-title">
              <img src="/assets/icon_dehydrator.webp" alt="" className="vessel-header-icon" />
              Dehydration Cabinet Station
            </span>
            <span className="vessel-badge">Pillar 2: Dehydration</span>
          </div>

          <div className="dehydrator-layout">
            {/* The Perforated Tray */}
            <div
              className={`dropzone tray-zone ${dehydrateStep === 0 ? 'highlight-ready' : ''}`}
              onClick={handleAddDiscToTray}
              title="Perforated Stainless Drying Tray"
            >
              <div className="tray-surface">
                <span className="tray-mesh-label">Perforated Mesh Tray ({trayDiscs}/4 Discs)</span>
                <div className="discs-grid">
                  {[1, 2, 3, 4].map((idx) => {
                    const isPlaced = idx <= trayDiscs;
                    const isDried = dehydrateStep === 3;
                    return (
                      <div
                        key={idx}
                        className={`cracker-disc ${isPlaced ? 'placed' : 'empty'} ${isDried ? 'dried-glassy' : ''}`}
                      >
                        {isPlaced ? (
                          isDried ? (
                            <span className="disc-chip-label">✨ Hard Pellet</span>
                          ) : (
                            <span className="disc-chip-label">Raw Disc</span>
                          )
                        ) : '+'}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Instrument Panel: Temp & Moisture */}
            <div className="dehydrator-instrument-panel">
              <div className="instrument-card" onClick={handleSetTemperature}>
                <span className="instrument-label">🌡️ Cabinet Temperature</span>
                <span className={`instrument-value ${temperature >= 60 ? 'optimal' : ''}`}>
                  {temperature}°C
                </span>
                {dehydrateStep === 1 && <span className="action-tag">Click to set 60°C</span>}
              </div>

              <div className="instrument-card">
                <span className="instrument-label">💧 Product Moisture Level</span>
                <div className="moisture-meter-track">
                  <div
                    className="moisture-fill"
                    style={{ width: `${moistureLevel}%`, background: moistureLevel <= 10 ? '#2ecc71' : '#3498db' }}
                  />
                </div>
                <span className="instrument-value">{moistureLevel}% (Target: &lt;10%)</span>
              </div>
            </div>
          </div>

          {dehydrateStep === 3 && (
            <div className="dehydrate-complete-banner pop-in">
              <img src="/assets/icon_dried_pellets.webp" alt="Dried Pellets" className="dough-img" />
              <h4>✓ Dehydration Complete (9% Moisture)</h4>
              <p>Raw pellets are glassy, hard, and ready for deep frying</p>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Shelf */}
      <div className="inventory-tray">
        <div className="tray-title-bar">
          <span className="tray-label">🧰 Steamed Cracker Discs:</span>
          <span className="tray-hint">Click discs to load the perforated drying tray</span>
        </div>
        <div className="items-carousel">
          <div
            className={`drag-card ${holdingItem?.id === 'raw_discs' ? 'lifted selected-tap' : ''} ${trayDiscs >= 4 ? 'used' : ''}`}
            onClick={handleCardClick}
          >
            <img src="/assets/icon_raw_discs.webp" alt="Sliced Discs" className="card-icon-img" />
            <span className="card-title">Sliced Discs</span>
            <span className="card-measure">{4 - trayDiscs} Available</span>
          </div>

          <div className="drag-card used">
            <img src="/assets/icon_fan_airflow.webp" alt="Dry Air Fan" className="card-icon-img" />
            <span className="card-title">Dry Air Fan</span>
            <span className="card-measure">Automated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
