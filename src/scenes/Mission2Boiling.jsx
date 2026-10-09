import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';

export const Mission2Boiling = () => {
  const { setScene, addScore, speak, showToast, completeMission, holdingItem, setHoldingItem } = useGame();

  const [boilStep, setBoilStep] = useState(0); // 0: Add water, 1: Turn on stove, 2: Add ubod, 3: Boiling gauge, 4: Puree in blender, 5: Done
  const [selectedItem, setSelectedItem] = useState(null);
  const [tenderProgress, setTenderProgress] = useState(0);
  const [isBoiling, setIsBoiling] = useState(false);
  const [knobWiggle, setKnobWiggle] = useState(false);

  useEffect(() => {
    speak(
      'Stage 2: Thermal Softening (Boiling)! Coconut palm fibers are tough. We must boil them in our stockpot until tender before pureeing.',
      'neutral',
      {
        badge: 'Stage 2: Boiling',
        hint: 'Click the Water Pitcher to hold it, then click the stockpot to pour 500ml water.',
        hideButton: true,
      }
    );
  }, []);

  const handleItemClick = (item) => {
    soundManager.playClick();
    if (holdingItem?.id === item.id) {
      setHoldingItem(null);
      setSelectedItem(null);
    } else {
      setHoldingItem(item);
      setSelectedItem(item);
    }
  };

  const handlePotClick = () => {
    const activeItem = holdingItem || selectedItem;

    if (boilStep === 0) {
      if (activeItem?.id === 'water_pitcher') {
        soundManager.playPour();
        setBoilStep(1);
        setHoldingItem(null);
        setSelectedItem(null);
        showToast('Water Added! (500ml)', 'Now turn the stove burner knob to ignite heat.', 'success');
        speak(
          'Great! 500ml water is in the pot. Click the burner knob below the stove to ignite the heat and bring it to a boil.',
          'thinking',
          {
            badge: 'Ignition Step',
            hint: 'Click the stove heat control knob to ignite flame.',
            hideButton: true,
          }
        );
      } else {
        soundManager.playError();
        showToast('Add Water First!', 'Pick up the Water Pitcher to fill the pot.', 'danger');
      }
    } else if (boilStep === 1) {
      soundManager.playClick();
      showToast('Turn Knob to Ignite!', 'Water is ready in the pot. Click the burner knob below to ignite the flame.', 'info');
    } else if (boilStep === 2) {
      if (activeItem?.id === 'sliced_ubod') {
        soundManager.playPour();
        soundManager.playBoil();
        setBoilStep(3);
        setHoldingItem(null);
        setSelectedItem(null);
        setIsBoiling(true);
        showToast('Boiling Ubod Cubes!', 'Softening coconut palm fibers. Watch the tenderness gauge.', 'success');
        speak(
          'The sliced ubod is in boiling water! Watch the tenderness gauge. When it hits the green TENDER zone (between 70% and 90%), click STOP BOILING!',
          'neutral',
          {
            badge: 'Boiling Science',
            hint: 'Click the Stop button when the needle reaches the green zone.',
            hideButton: true,
          }
        );
      } else {
        soundManager.playError();
        showToast('Add Ubod!', 'Pick up the Sliced Ubod and add it to the boiling pot.', 'danger');
      }
    } else if (boilStep === 4) {
      handleBlenderClick();
    }
  };

  const handleBurnerToggle = () => {
    if (boilStep === 0) {
      soundManager.playError();
      setKnobWiggle(true);
      setTimeout(() => setKnobWiggle(false), 500);
      showToast('Safety First!', 'Lab Safety: Never heat a dry, empty pot. Pour 500ml water first.', 'warning');
      speak(
        'Home Economics Safety Rule: Always add water to the stockpot before turning on the burner to prevent scorching the metal!',
        'thinking',
        {
          badge: 'Safety First',
          hint: 'Select the Water Pitcher from the tray and click the pot.',
          hideButton: true,
        }
      );
      return;
    }

    if (boilStep === 1) {
      soundManager.playIgnite();
      soundManager.playBoil();
      setBoilStep(2);
      showToast('Burner Ignited at High Heat!', 'Flame is ON (100°C). Water is reaching a rolling boil!', 'success');
      speak(
        'The burner is roaring at high heat! The water has reached a rolling 100°C boil. Now pick up the Sliced Ubod and drop it into the boiling stockpot.',
        'happy',
        {
          badge: 'Boiling Active',
          hint: 'Select Sliced Ubod from the tray and tap the boiling pot.',
          hideButton: true,
        }
      );
      return;
    }

    if (boilStep === 2) {
      soundManager.playClick();
      showToast('Flame Active (100°C HIGH)', 'Add the sliced ubod from the tray into the boiling water.', 'info');
      return;
    }

    if (boilStep === 3) {
      // User can click knob to extinguish flame / stop boiling
      handleStopBoil();
      return;
    }

    if (boilStep >= 4) {
      soundManager.playClick();
      showToast('Burner Extinguished', 'The burner is turned off and cooled. Ubod is ready for pureeing.', 'info');
    }
  };

  // Tenderness gauge loop
  useEffect(() => {
    let interval;
    if (isBoiling && boilStep === 3) {
      interval = setInterval(() => {
        setTenderProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + 2;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isBoiling, boilStep]);

  const handleStopBoil = () => {
    if (boilStep !== 3) return;
    setIsBoiling(false);

    if (tenderProgress >= 65 && tenderProgress <= 95) {
      soundManager.playSuccess();
      addScore(30);
      setBoilStep(4);
      showToast('Perfect Softness!', '+30 Points! Now transfer to the blender.', 'success');
      speak(
        'Perfect tenderness! The cellulose fibers are softened. Now click the Blender to puree the softened ubod into a smooth paste.',
        'happy',
        {
          badge: 'Puree Step',
          hint: 'Click the food processor/blender on the right.',
          hideButton: true,
        }
      );
    } else {
      soundManager.playClick();
      addScore(15);
      setBoilStep(4);
      showToast('Boiled Soft', '+15 Points. Proceeding to pureeing.', 'warning');
    }
  };

  const handleBlenderClick = () => {
    if (boilStep === 5) {
      soundManager.playSuccess();
      speak(
        'Excellent! The ubod is pureed into a smooth, homogenous paste. This will bind flawlessly with our starch and seasonings in Stage 3: Formulation!',
        'happy',
        {
          badge: 'Stage 2 Cleared',
          btnText: 'Proceed to Stage 3: Mixing ➔',
          onNext: () => setScene('mission3'),
        }
      );
      return;
    }

    if (boilStep === 4) {
      soundManager.playPour();
      soundManager.playSuccess();
      addScore(20);
      setBoilStep(5);
      completeMission('mission2');
      showToast('Puree Ready!', '+20 Points! Smooth ubod pulp achieved.', 'success');
      speak(
        'Excellent! The ubod is pureed into a smooth, homogenous paste. This will bind flawlessly with our starch and seasonings in Stage 3: Formulation!',
        'happy',
        {
          badge: 'Stage 2 Cleared',
          btnText: 'Proceed to Stage 3: Mixing ➔',
          onNext: () => setScene('mission3'),
        }
      );
    }
  };

  const getStockpotImg = () => {
    if (boilStep === 0) return '/assets/icon_stockpot.webp';
    if (boilStep === 1) return '/assets/icon_stockpot_with_water.webp';
    if (boilStep === 2) return '/assets/icon_stockpot_with_boiling_water.webp';
    if (boilStep === 3 || boilStep === 4) return '/assets/icon_stockpot_boiling_ubod.webp';
    return '/assets/icon_stockpot.webp';
  };

  return (
    <div className="workstation-scene stage-2-bg">
      <div className="workstation-overlay" />
      <div className="stage-center-zone">
        <div className="active-vessel-card boiling-workstation">
          <div className="vessel-header">
            <span className="vessel-title">
              <img src="/assets/icon_stockpot.webp" alt="" className="vessel-header-icon" />
              Stovetop Station: Boiling & Softening
            </span>
            <span className="vessel-badge">Pillar 1: Boiling</span>
          </div>

          <div className="stovetop-layout">
            {/* The Stockpot */}
            <div
              className={`dropzone stockpot-zone ${selectedItem ? 'highlight-ready' : ''} ${boilStep >= 2 && boilStep <= 3 ? 'simmering' : ''}`}
              onClick={handlePotClick}
            >
              {boilStep >= 2 && boilStep <= 3 && (
                <div className="steam-particles">
                  <div className="steam s1" />
                  <div className="steam s2" />
                  <div className="steam s3" />
                </div>
              )}

              <div className="pot-graphic">
                {/* Stove burner flame ring beneath the pot when ignited */}
                {(boilStep === 2 || boilStep === 3) && (
                  <div className="burner-flame-underglow">
                    <div className="flame-corona" />
                    <div className="gas-flame-ring">
                      <span className="flame-jet fj1" />
                      <span className="flame-jet fj2" />
                      <span className="flame-jet fj3" />
                      <span className="flame-jet fj4" />
                      <span className="flame-jet fj5" />
                      <span className="flame-jet fj6" />
                      <span className="flame-jet fj7" />
                    </div>
                  </div>
                )}

                <img
                  src={getStockpotImg()}
                  alt="Stockpot"
                  className={`pot-img ${boilStep >= 2 && boilStep <= 3 ? 'pot-simmering' : ''}`}
                />

                {boilStep === 0 && <span className="pot-status-text">Empty Stockpot (Needs Water)</span>}
                {boilStep === 1 && <span className="pot-status-text">Water Added (Turn Knob to Ignite)</span>}
                {boilStep === 2 && <span className="pot-status-text">Water Boiling at 100°C 🔥 (Add Ubod)</span>}
                {boilStep === 3 && (
                  <div className="boiling-active-info">
                    <span className="pot-status-text">Boiling Ubod: Softening Fibers...</span>
                    {/* Tenderness Gauge */}
                    <div className="tenderness-meter">
                      <div className="gauge-track">
                        <div className="gauge-green-zone" style={{ left: '65%', width: '30%' }} />
                        <div className="gauge-fill" style={{ width: `${tenderProgress}%` }} />
                      </div>
                      <span className="gauge-label">{tenderProgress}% Tender (Target: 70-90%)</span>
                    </div>
                    <button className="btn-gold btn-stop-boil pulse" onClick={(e) => { e.stopPropagation(); handleStopBoil(); }}>
                      Stop Boiling!
                    </button>
                  </div>
                )}
                {boilStep === 4 && (
                  <div className="pot-ready-callout" onClick={(e) => { e.stopPropagation(); handleBlenderClick(); }}>
                    <span className="pot-status-text">✓ Softened Ubod Ready</span>
                    <span className="transfer-hint-pill">Click Pot or Blender to Puree ➔</span>
                  </div>
                )}
                {boilStep >= 5 && <span className="pot-status-text">✓ Ubod Pulp Pureed in Blender</span>}
              </div>

              {/* Enhanced Stove Burner Console with Rotary Knob */}
              <div
                className={`stove-burner-console ${boilStep === 1 ? 'ready-to-ignite' : ''} ${boilStep === 2 || boilStep === 3 ? 'flame-active' : ''} ${knobWiggle ? 'knob-shake' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBurnerToggle();
                }}
                role="button"
                tabIndex={0}
                title={
                  boilStep === 0
                    ? 'Stove Burner (Pour water first)'
                    : boilStep === 1
                    ? 'Click to Ignite Burner to HIGH'
                    : boilStep === 2 || boilStep === 3
                    ? 'Flame Active at 100°C HIGH'
                    : 'Stove Burner (Off)'
                }
              >
                <div className="knob-assembly">
                  {/* Stationary faceplate with -HIGH and tick marks */}
                  <img
                    src="/assets/stove_knob_base.webp"
                    alt="Knob Faceplate"
                    className="knob-base-img"
                  />
                  {/* Inner rotary cylinder turning from 0deg to 90deg */}
                  <img
                    src="/assets/stove_knob_rotor.webp"
                    alt="Knob Dial"
                    className={`knob-rotor-img ${boilStep === 2 || boilStep === 3 ? 'turned-high' : 'turned-off'}`}
                  />
                  {/* Glowing invitation ring when ready to ignite */}
                  {boilStep === 1 && (
                    <>
                      <span className="knob-beacon-ring r1" />
                      <span className="knob-beacon-ring r2" />
                    </>
                  )}
                </div>

                <div className="burner-panel-text">
                  <div className="burner-badge-row">
                    <span className={`burner-led ${boilStep === 1 ? 'blinking' : boilStep === 2 || boilStep === 3 ? 'burning' : 'cold'}`} />
                    <span className="burner-mode-title">
                      {boilStep === 0 && 'BURNER: OFF'}
                      {boilStep === 1 && 'CLICK TO IGNITE'}
                      {(boilStep === 2 || boilStep === 3) && 'FLAME ON (100°C)'}
                      {boilStep >= 4 && 'BURNER: OFF'}
                    </span>
                  </div>
                  <span className="burner-action-hint">
                    {boilStep === 0 && 'Fill water first'}
                    {boilStep === 1 && '🔥 Click dial to ignite flame'}
                    {(boilStep === 2 || boilStep === 3) && 'Active Flame • 100°C HIGH'}
                    {boilStep >= 4 && '✓ Heat extinguished'}
                  </span>
                </div>
              </div>
            </div>

            {/* The Blender / Pureer Appliance */}
            <div
              className={`blender-appliance ${boilStep === 4 ? 'pulse-blender' : ''} ${boilStep >= 5 ? 'blender-ready' : ''}`}
              onClick={handleBlenderClick}
              title="Food Processor / Blender"
            >
              <img
                src={boilStep >= 5 ? '/assets/icon_ubod_puree.webp' : '/assets/icon_blender.webp'}
                alt="Puree Blender"
                className="blender-img"
              />
              <h4>Puree Blender</h4>
              <p>{boilStep >= 5 ? '✓ Smooth Ubod Pulp Ready' : boilStep === 4 ? 'Tap to Puree Soft Ubod!' : 'Awaiting Boiled Ubod'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Tray */}
      <div className="inventory-tray">
        <div className="tray-title-bar">
          <span className="tray-label">Boiling Station Supplies:</span>
          <span className="tray-hint">Click item, then click the stockpot</span>
        </div>
        <div className="items-carousel">
          <div
            className={`drag-card ${(holdingItem?.id === 'water_pitcher' || selectedItem?.id === 'water_pitcher') ? 'lifted selected-tap' : ''} ${boilStep > 0 ? 'used' : ''}`}
            onClick={() =>
              boilStep === 0 &&
              handleItemClick({
                id: 'water_pitcher',
                name: 'Water Pitcher (500ml)',
                img: '/assets/icon_water_pitcher.webp',
                actionHint: 'Click stockpot to pour water',
              })
            }
          >
            <img src="/assets/icon_water_pitcher.webp" alt="Water Pitcher" className="card-icon-img" />
            <span className="card-title">Water Pitcher</span>
            <span className="card-measure">500ml</span>
          </div>

          <div
            className={`drag-card ${(holdingItem?.id === 'sliced_ubod' || selectedItem?.id === 'sliced_ubod') ? 'lifted selected-tap' : ''} ${boilStep !== 2 ? 'used' : ''}`}
            onClick={() =>
              boilStep === 2 &&
              handleItemClick({
                id: 'sliced_ubod',
                name: 'Sliced Ubod (200g)',
                img: '/assets/icon_prep_bowl_filled.webp',
                actionHint: 'Click stockpot to add ubod',
              })
            }
          >
            <img src="/assets/icon_prep_bowl_filled.webp" alt="Sliced Ubod" className="card-icon-img" />
            <span className="card-title">Sliced Ubod</span>
            <span className="card-measure">200g</span>
          </div>
        </div>
      </div>
    </div>
  );
};
