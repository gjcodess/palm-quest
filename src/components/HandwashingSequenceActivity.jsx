import { useSessionState } from '../hooks/useSessionState';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';
import { HANDWASHING_STEPS } from '../data/orientationData';

export const HandwashingSequenceActivity = ({
  initialSlots = null,
  initialPool = null,
  onSequenceChange,
  onComplete,
  isLocked = false,
}) => {
  const { speak, setIsDialogueCollapsed } = useGame();
  const lockedClicksRef = useRef(0);

  const handleLockedInteraction = () => {
    soundManager.playError();
    lockedClicksRef.current += 1;
    if (lockedClicksRef.current >= 2) {
      speak(
        "You've already completed the Pre-Test! Your submitted handwashing sequence is locked in your assessment records and cannot be reorganized.",
        'thinking',
        {
          badge: 'Pre-Test Completed',
          note: 'Handwashing benchmark results are saved for your final diagnostic audit.',
          hint: 'Click "Proceed to Tool Safety Inspection" below or choose a section from the subnav above.',
        }
      );
      setIsDialogueCollapsed(false);
      lockedClicksRef.current = 0;
    }
  };

  // 10 Total Cards (7 correct steps + 3 distractors)
  const [pool, setPool] = useSessionState('handwashing.pool', () => {
    if (initialPool && Array.isArray(initialPool)) return initialPool;
    if (initialSlots && Array.isArray(initialSlots)) {
      const placedIds = new Set(initialSlots.filter(Boolean).map((s) => s.id));
      return HANDWASHING_STEPS.filter((s) => !placedIds.has(s.id)).sort(() => Math.random() - 0.5);
    }
    return [...HANDWASHING_STEPS].sort(() => Math.random() - 0.5);
  });

  // 7 Sequence Slots (null or step object)
  const [slots, setSlots] = useSessionState('handwashing.slots', () => {
    if (initialSlots && Array.isArray(initialSlots) && initialSlots.length === 7) {
      return initialSlots;
    }
    return Array(7).fill(null);
  });

  // Selection states for click-to-place / tap-to-swap
  const [selectedPoolId, setSelectedPoolId] = useState(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

  // Live Dynamic Drag States
  const [draggedSlotIndex, setDraggedSlotIndex] = useState(null);
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState(null);
  const [draggedPoolItem, setDraggedPoolItem] = useState(null);
  const [isDragOverPool, setIsDragOverPool] = useState(false);
  const touchOriginRef = useRef(null);
  const [touchPreview, setTouchPreview] = useState(null);
  const suppressClickUntilRef = useRef(0);

  const setLiftedDragImage = (e) => {
    const preview = e.currentTarget.cloneNode(true);
    preview.className = 'hw-drag-preview';
    preview.setAttribute('aria-hidden', 'true');
    Object.assign(preview.style, { position: 'fixed', left: '-1000px', top: '0', width: '190px' });
    document.body.appendChild(preview);
    e.dataTransfer.setDragImage(preview, 95, 110);
    setTimeout(() => preview.remove(), 0);
  };

  // Notify parent of updates
  const notifyChange = (newSlots, newPool) => {
    if (onSequenceChange) {
      const submittedSteps = newSlots.filter(Boolean);
      const correctSteps = HANDWASHING_STEPS.filter((s) => s.isCorrect);
      const distractorsIncluded = submittedSteps.filter((s) => !s.isCorrect);
      const isAllCorrect =
        submittedSteps.length === 7 &&
        submittedSteps.every((step, idx) => step.isCorrect && step.step === idx + 1);

      onSequenceChange({
        submittedSteps,
        correctSequence: correctSteps,
        distractorsIncluded,
        isAllCorrect,
        slots: newSlots,
        pool: newPool,
      });
    }
  };

  // Assign an item from pool to a slot
  const placeItemInSlot = (item, targetSlotIndex) => {
    if (isLocked) {
      handleLockedInteraction();
      return;
    }
    soundManager.playClick();
    const newSlots = [...slots];
    const newPool = pool.filter((p) => p.id !== item.id);

    // If target slot already has an item, return that item to pool
    if (newSlots[targetSlotIndex]) {
      newPool.push(newSlots[targetSlotIndex]);
    }

    newSlots[targetSlotIndex] = item;
    setSlots(newSlots);
    setPool(newPool);
    setSelectedPoolId(null);
    setSelectedSlotIndex(null);
    notifyChange(newSlots, newPool);
  };

  // Remove item from slot back to pool
  const removeItemFromSlot = (slotIndex) => {
    if (isLocked) {
      handleLockedInteraction();
      return;
    }
    soundManager.playClick();
    const item = slots[slotIndex];
    if (!item) return;

    const newSlots = [...slots];
    newSlots[slotIndex] = null;
    const newPool = [...pool, item];
    setSlots(newSlots);
    setPool(newPool);
    setSelectedSlotIndex(null);
    notifyChange(newSlots, newPool);
  };

  // Handle pool card click
  const handlePoolCardClick = (item) => {
    if (isLocked) {
      handleLockedInteraction();
      return;
    }
    if (selectedSlotIndex !== null) {
      placeItemInSlot(item, selectedSlotIndex);
      return;
    }

    if (selectedPoolId === item.id) {
      setSelectedPoolId(null);
      return;
    }

    // Auto-place in first empty slot if available
    const firstEmptyIndex = slots.findIndex((s) => s === null);
    if (firstEmptyIndex !== -1) {
      placeItemInSlot(item, firstEmptyIndex);
    } else {
      setSelectedPoolId(item.id);
      soundManager.playClick();
    }
  };

  // Handle slot click (Tap-to-Swap / Tap-to-Place)
  const handleSlotClick = (slotIndex) => {
    if (isLocked) {
      handleLockedInteraction();
      return;
    }
    if (selectedPoolId) {
      const item = pool.find((p) => p.id === selectedPoolId);
      if (item) {
        placeItemInSlot(item, slotIndex);
      }
      return;
    }

    if (selectedSlotIndex === null) {
      if (slots[slotIndex]) {
        soundManager.playClick();
        setSelectedSlotIndex(slotIndex);
      }
    } else if (selectedSlotIndex === slotIndex) {
      setSelectedSlotIndex(null);
    } else {
      // Instant Tap-to-Swap between two slots
      soundManager.playClick();
      const newSlots = [...slots];
      const temp = newSlots[selectedSlotIndex];
      newSlots[selectedSlotIndex] = newSlots[slotIndex];
      newSlots[slotIndex] = temp;
      setSlots(newSlots);
      setSelectedSlotIndex(null);
      notifyChange(newSlots, pool);
    }
  };

  // Active drag payload ref (avoids any React state timing/render cancellation)
  const dragInfoRef = useRef(null);

  // Global dragend safety net: ensures state is cleaned up even if drag ends outside component
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      if (dragInfoRef.current !== null || draggedSlotIndex !== null || draggedPoolItem !== null) {
        dragInfoRef.current = null;
        setDraggedSlotIndex(null);
        setDragOverSlotIndex(null);
        setDraggedPoolItem(null);
        setIsDragOverPool(false);
      }
    };
    window.addEventListener('dragend', handleGlobalDragEnd);
    return () => window.removeEventListener('dragend', handleGlobalDragEnd);
  }, [draggedSlotIndex, draggedPoolItem]);

  // ==========================================
  // Desktop Drag Handlers (Robust HTML5 DnD)
  // ==========================================
  const handleSlotDragStart = (e, index) => {
    if (isLocked || !slots[index]) return;
    setLiftedDragImage(e);
    setSelectedSlotIndex(null);
    setSelectedPoolId(null);
    const dragData = { source: 'slot', index, id: slots[index].id, item: slots[index] };
    dragInfoRef.current = dragData;
    setDraggedSlotIndex(index);
    setDragOverSlotIndex(index);
    try {
      e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    } catch {
      e.dataTransfer.setData('text/plain', `slot:${index}`);
    }
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePoolDragStart = (e, item) => {
    if (isLocked) return;
    setLiftedDragImage(e);
    setSelectedSlotIndex(null);
    setSelectedPoolId(null);
    const dragData = { source: 'pool', id: item.id, item };
    dragInfoRef.current = dragData;
    setDraggedPoolItem(item);
    try {
      e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    } catch {
      e.dataTransfer.setData('text/plain', `pool:${item.id}`);
    }
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSlotDragEnter = (e, targetIndex) => {
    if (isLocked) return;
    e.preventDefault();
    if (dragOverSlotIndex !== targetIndex) {
      setDragOverSlotIndex(targetIndex);
    }
  };

  const handleSlotDragOver = (e, targetIndex) => {
    if (isLocked) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverSlotIndex !== targetIndex) {
      setDragOverSlotIndex(targetIndex);
    }
  };

  const handleSlotDragLeave = (e, targetIndex) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverSlotIndex === targetIndex) {
      setDragOverSlotIndex(null);
    }
  };

  const handleSlotDrop = (e, targetIndex) => {
    if (isLocked) return;
    e.preventDefault();
    setDragOverSlotIndex(null);

    // Retrieve drag data from ref or dataTransfer
    let dragData = dragInfoRef.current;
    if (!dragData) {
      try {
        const raw = e.dataTransfer.getData('text/plain');
        if (raw) {
          if (raw.startsWith('{')) {
            dragData = JSON.parse(raw);
          } else if (raw.startsWith('pool:')) {
            dragData = { source: 'pool', id: raw.replace('pool:', '') };
          } else if (raw.startsWith('slot:')) {
            dragData = { source: 'slot', index: parseInt(raw.replace('slot:', ''), 10) };
          }
        }
      } catch {
        // ignore
      }
    }

    if (dragData) {
      if (dragData.source === 'pool') {
        const poolItem = dragData.item || pool.find((p) => p.id === dragData.id);
        if (poolItem) {
          placeItemInSlot(poolItem, targetIndex);
        }
      } else if (dragData.source === 'slot') {
        const sourceIndex = dragData.index !== undefined ? dragData.index : draggedSlotIndex;
        if (sourceIndex !== null && sourceIndex !== undefined && sourceIndex !== targetIndex && sourceIndex >= 0 && sourceIndex < slots.length) {
          soundManager.playClick();
          const newSlots = [...slots];
          const temp = newSlots[targetIndex];
          newSlots[targetIndex] = newSlots[sourceIndex];
          newSlots[sourceIndex] = temp;
          setSlots(newSlots);
          notifyChange(newSlots, pool);
        }
      }
    } else if (draggedPoolItem) {
      placeItemInSlot(draggedPoolItem, targetIndex);
    } else if (draggedSlotIndex !== null && draggedSlotIndex !== targetIndex) {
      soundManager.playClick();
      const newSlots = [...slots];
      const temp = newSlots[targetIndex];
      newSlots[targetIndex] = newSlots[draggedSlotIndex];
      newSlots[draggedSlotIndex] = temp;
      setSlots(newSlots);
      notifyChange(newSlots, pool);
    }

    dragInfoRef.current = null;
    setDraggedSlotIndex(null);
    setDraggedPoolItem(null);
  };

  const handleDragEnd = () => {
    dragInfoRef.current = null;
    setDraggedSlotIndex(null);
    setDragOverSlotIndex(null);
    setDraggedPoolItem(null);
    setIsDragOverPool(false);
  };

  // Drag over pool to remove
  const handlePoolDragOver = (e) => {
    if (isLocked) return;
    const isFromSlot = dragInfoRef.current?.source === 'slot' || draggedSlotIndex !== null;
    if (!isFromSlot) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOverPool) setIsDragOverPool(true);
  };

  const handlePoolDragLeave = (e) => {
    if (e.currentTarget && e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragOverPool(false);
  };

  const handlePoolDrop = (e) => {
    if (isLocked) return;
    e.preventDefault();
    setIsDragOverPool(false);

    let dragData = dragInfoRef.current;
    if (!dragData) {
      try {
        const raw = e.dataTransfer.getData('text/plain');
        if (raw) {
          if (raw.startsWith('{')) {
            dragData = JSON.parse(raw);
          } else if (raw.startsWith('slot:')) {
            dragData = { source: 'slot', index: parseInt(raw.replace('slot:', ''), 10) };
          }
        }
      } catch {
        // ignore
      }
    }

    const slotIndexToRemove = dragData?.source === 'slot' && dragData.index !== undefined
      ? dragData.index
      : draggedSlotIndex;

    if (slotIndexToRemove !== null && slotIndexToRemove !== undefined) {
      removeItemFromSlot(slotIndexToRemove);
    }

    dragInfoRef.current = null;
    setDraggedSlotIndex(null);
    setDraggedPoolItem(null);
  };

  // ==========================================
  // Tablet Touch Drag Handlers (Dynamic Reorder)
  // ==========================================
  const handleTouchStart = (e, index) => {
    touchOriginRef.current = null;
    if (isLocked || isVerified || !slots[index] || e.target.closest('button')) return;
    const touch = e.touches[0];
    touchOriginRef.current = { source: 'slot', index, item: slots[index], startX: touch.clientX, startY: touch.clientY, hasMoved: false };
  };

  const handlePoolTouchStart = (e, item) => {
    touchOriginRef.current = null;
    if (isLocked || isVerified || !e.target.closest('.hw-touch-drag-handle')) return;
    const touch = e.touches[0];
    touchOriginRef.current = { source: 'pool', item, startX: touch.clientX, startY: touch.clientY, hasMoved: false };
  };

  const handleTouchMove = (e) => {
    if (isLocked || !touchOriginRef.current) return;
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchOriginRef.current.startX);
    const deltaY = Math.abs(touch.clientY - touchOriginRef.current.startY);

    if (deltaX > 8 || deltaY > 8) {
      touchOriginRef.current.hasMoved = true;
      if (e.cancelable) e.preventDefault();
    }

    if (!touchOriginRef.current.hasMoved) return;

    setTouchPreview({ item: touchOriginRef.current.item, x: touch.clientX, y: touch.clientY });
    if (touchOriginRef.current.source === 'pool') {
      setDraggedPoolItem(touchOriginRef.current.item);
    } else if (draggedSlotIndex === null) {
      setDraggedSlotIndex(touchOriginRef.current.index);
    }

    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!targetElement) return;

    const wrapper = targetElement.closest('.hw-slot-box');
    setIsDragOverPool(touchOriginRef.current.source === 'slot' && Boolean(targetElement.closest('.hw-pool-section')));
    if (wrapper && wrapper.dataset.slotIndex !== undefined) {
      const targetIndex = parseInt(wrapper.dataset.slotIndex, 10);
      if (!isNaN(targetIndex) && targetIndex >= 0 && targetIndex < slots.length) {
        setDragOverSlotIndex(targetIndex);
      }
    } else {
      setDragOverSlotIndex(null);
    }
  };

  const handleTouchEnd = () => {
    if (touchOriginRef.current) {
      // Simple taps use onClick once; dragging must not trigger a second action.
      if (touchOriginRef.current.hasMoved && touchOriginRef.current.source === 'pool' && dragOverSlotIndex !== null) {
        placeItemInSlot(touchOriginRef.current.item, dragOverSlotIndex);
      } else if (touchOriginRef.current.hasMoved && isDragOverPool) {
        removeItemFromSlot(touchOriginRef.current.index);
      } else if (touchOriginRef.current.hasMoved && dragOverSlotIndex !== null && dragOverSlotIndex !== touchOriginRef.current.index) {
        const sourceIndex = touchOriginRef.current.index;
        const targetIndex = dragOverSlotIndex;
        soundManager.playClick();
        const newSlots = [...slots];
        const temp = newSlots[targetIndex];
        newSlots[targetIndex] = newSlots[sourceIndex];
        newSlots[sourceIndex] = temp;
        setSlots(newSlots);
        notifyChange(newSlots, pool);
      }
    }
    handleTouchCancel();
  };

  const handleTouchCancel = () => {
    if (touchOriginRef.current?.hasMoved) suppressClickUntilRef.current = Date.now() + 500;
    touchOriginRef.current = null;
    setTouchPreview(null);
    setDraggedSlotIndex(null);
    setDraggedPoolItem(null);
    setDragOverSlotIndex(null);
    setIsDragOverPool(false);
  };

  const [isVerified, setIsVerified] = useSessionState('handwashing.isVerified', () => isLocked);

  const handleReset = () => {
    if (isLocked || isVerified) {
      handleLockedInteraction();
      return;
    }
    soundManager.playClick();
    const newPool = [...HANDWASHING_STEPS].sort(() => Math.random() - 0.5);
    const newSlots = Array(7).fill(null);
    setPool(newPool);
    setSlots(newSlots);
    setSelectedPoolId(null);
    setSelectedSlotIndex(null);
    notifyChange(newSlots, newPool);
  };

  const handleSubmit = () => {
    if (!isLocked && filledCount < 7) {
      soundManager.playError();
      return;
    }

    const submittedSteps = slots.filter(Boolean);
    const correctSteps = HANDWASHING_STEPS.filter((s) => s.isCorrect);
    const distractorsIncluded = submittedSteps.filter((s) => !s.isCorrect);
    const isAllCorrect =
      submittedSteps.length === 7 &&
      submittedSteps.every((step, idx) => step.isCorrect && step.step === idx + 1);

    const payload = {
      submittedSteps,
      correctSequence: correctSteps,
      distractorsIncluded,
      isAllCorrect,
      slots,
      pool,
    };

    if (!isVerified) {
      if (isAllCorrect) {
        soundManager.playSuccess();
      } else {
        soundManager.playError();
      }
      setIsVerified(true);
      notifyChange(slots, pool);
      return;
    }

    // If already verified, proceed to next task
    soundManager.playClick();
    if (onComplete) {
      onComplete(payload);
    }
  };

  const filledCount = slots.filter(Boolean).length;

  return (
    <div className="handwash-sequence-container">
      {/* Unified Clean Header Row */}
      <div className="inspection-header-row hw-main-header-row">
        <div className="inspection-title-box">
          <h3 className="item-target-title">7-Step Sanitary Handwashing Sequence</h3>
        </div>
        <div className="hw-header-badges">
          <div className="inspection-counter hw-counter-badge">
            Assigned: {filledCount} / 7 Steps
          </div>
          <span className="vessel-badge hw-task-badge">
            {isLocked ? '🔒 Submitted' : 'Task 2 of 4'}
          </span>
        </div>
      </div>

      <p className="inspection-prompt hw-prompt">
        {isLocked
          ? 'Review your submitted handwashing sequence below:'
          : 'Drag steps between slots to arrange in chronological order (or tap to swap). Beware of 3 hazardous distractors!'}
      </p>

      {/* Target Slots (1 to 7) with Live Interactive Reordering & Instant Verification */}
      <div className="hw-slots-grid">
        {slots.map((item, idx) => {
          const isSelected = selectedSlotIndex === idx;
          const isDragging = draggedSlotIndex === idx;
          const isHoverTarget = dragOverSlotIndex === idx && !isDragging;

          const isStepCorrect = item && item.isCorrect && item.step === idx + 1;
          const isMisplaced = item && item.isCorrect && item.step !== idx + 1;
          const isDistractor = item && !item.isCorrect;

          let verifyClass = '';
          if (isVerified || isLocked) {
            if (isStepCorrect) verifyClass = ' slot-correct';
            else if (isMisplaced) verifyClass = ' slot-misplaced';
            else if (isDistractor) verifyClass = ' slot-distractor';
          }

          return (
            <div
              key={idx}
              data-slot-index={idx}
              className={`hw-slot-box ${item ? 'filled' : 'empty'} ${isSelected ? 'selected' : ''} ${
                isDragging ? 'is-dragging-slot is-drag-origin' : ''
              } ${isHoverTarget ? 'drag-over-target' : ''} ${isLocked || isVerified ? 'is-locked' : ''}${verifyClass}`}
              onClick={() => { if (Date.now() >= suppressClickUntilRef.current) handleSlotClick(idx); }}
              onDragOver={(e) => handleSlotDragOver(e, idx)}
              onDragEnter={(e) => handleSlotDragEnter(e, idx)}
              onDragLeave={(e) => handleSlotDragLeave(e, idx)}
              onDrop={(e) => handleSlotDrop(e, idx)}
              draggable={!isLocked && !isVerified && Boolean(item)}
              onDragStart={(e) => handleSlotDragStart(e, idx)}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => handleTouchStart(e, idx)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
            >
              <div className="slot-top-row">
                <div className="slot-number-tag">Step {idx + 1}</div>
                {item && !isLocked && !isVerified && (
                  <button
                    className="slot-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItemFromSlot(idx);
                    }}
                    title="Remove back to pool"
                    aria-label="Remove step"
                  >
                    ✕
                  </button>
                )}
              </div>

              {item ? (
                <div className={`slot-card-content ${isDragging ? 'is-dragging' : ''}`}>
                  <div className="slot-card-text">
                    <h5 className="slot-card-action">{item.action}</h5>
                  </div>
                  {(isVerified || isLocked) && (
                    <div
                      style={{
                        marginTop: '6px',
                        padding: '3px 6px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        background: isStepCorrect ? '#dcfce7' : isDistractor ? '#fee2e2' : '#fef3c7',
                        color: isStepCorrect ? '#15803d' : isDistractor ? '#b91c1c' : '#b45309',
                        border: `1px solid ${isStepCorrect ? '#86efac' : isDistractor ? '#fca5a5' : '#fde68a'}`,
                      }}
                    >
                      {isStepCorrect
                        ? '✓ Correct'
                        : isDistractor
                        ? '🚫 Hazard'
                        : `Expected #${item.step}`}
                    </div>
                  )}
                  {!isLocked && !isVerified && (
                    <div className="slot-drag-handle-hint">
                      <span className="drag-dots">⋮⋮</span>
                      <span>{isSelected ? 'Selected' : 'Drag/Tap'}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="slot-placeholder">
                  <span className="placeholder-icon">↓</span>
                  <span className="placeholder-label">
                    {selectedPoolId ? 'Tap to Place' : 'Empty Slot'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Verified WHO Standard 7-Step Sequence Lesson Box */}
      {(isVerified || isLocked) && (
        <div
          className="hw-verified-lesson-box"
          style={{
            background: '#ffffff',
            border: '2px solid #86efac',
            borderRadius: '14px',
            padding: '12px 16px',
            boxShadow: '0 2px 0 #bbf7d0',
            animation: 'fadeInSlideUp 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🧼</span>
            <h4 style={{ margin: 0, fontSize: '0.96rem', color: '#15803d', fontWeight: 800 }}>
              WHO 7-Step Standard Hand Hygiene Lesson
            </h4>
          </div>
          <p style={{ margin: '0 0 10px', fontSize: '0.84rem', color: '#475569', lineHeight: 1.4 }}>
            In commercial food processing, aseptic hand hygiene requires at least 20 seconds of mechanical friction. Each step removes specific microbial reservoirs:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
            {HANDWASHING_STEPS.filter((s) => s.isCorrect).map((step) => (
              <div
                key={step.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '0.78rem',
                }}
              >
                <strong style={{ color: '#15803d' }}>Step {step.step}: {step.action}</strong>
                <span style={{ display: 'block', color: '#64748b', marginTop: '2px' }}>{step.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Cards Pool */}
      {!isLocked && !isVerified && (
        <div
          className={`hw-pool-section ${isDragOverPool ? 'pool-drop-target' : ''}`}
          onDragOver={handlePoolDragOver}
          onDragLeave={handlePoolDragLeave}
          onDrop={handlePoolDrop}
        >
          <div className="hw-pool-header">
            <h4 className="hw-pool-title">
              {isDragOverPool
                ? 'Drop here to remove card back to pool'
                : `Available Technique Cards Pool (${pool.length} remaining)`}
            </h4>
            {filledCount > 0 && (
              <button className="btn-secondary hw-reset-btn" onClick={handleReset}>
                ↺ Reset All Slots
              </button>
            )}
          </div>

          {pool.length === 0 ? (
            <div className="hw-pool-empty-message">
              <span>All 7 handwashing sequence slots have been assigned! Click Verify below to check your hygiene protocol.</span>
            </div>
          ) : (
            <div className="hw-pool-grid">
              {pool.map((item) => {
                const isSelected = selectedPoolId === item.id;
                const isBeingDragged = draggedPoolItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`hw-pool-card ${isSelected ? 'selected' : ''} ${isBeingDragged ? 'is-dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handlePoolDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                    onClick={() => { if (Date.now() >= suppressClickUntilRef.current) handlePoolCardClick(item); }}
                    onTouchStart={(e) => handlePoolTouchStart(e, item)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchCancel}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="pool-card-top">
                      <h5 className="pool-card-action">{item.action}</h5>
                    </div>
                    <p className="pool-card-desc">{item.desc}</p>
                    <div className="pool-card-hint hw-touch-drag-handle">
                      {selectedSlotIndex !== null
                        ? 'Assign to Step ' + (selectedSlotIndex + 1)
                        : '⋮⋮ Drag here or tap to place'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {touchPreview && createPortal(
        <div
          className="hw-drag-preview hw-touch-preview"
          aria-hidden="true"
          style={{ left: touchPreview.x, top: touchPreview.y }}
        >
          <strong>{touchPreview.item.action}</strong>
          <p>{touchPreview.item.desc}</p>
        </div>,
        document.body
      )}

      {/* Action Footer */}
      <div className="hw-sequence-footer">
        <button
          className="btn-primary btn-submit-sequence"
          onClick={handleSubmit}
          disabled={!isLocked && !isVerified && filledCount < 7}
        >
          {isLocked || isVerified
            ? 'Proceed to Tool Safety Inspection ➔'
            : `Verify Handwashing Sequence (${filledCount}/7 Placed) ➔`}
        </button>
      </div>
    </div>
  );
};
