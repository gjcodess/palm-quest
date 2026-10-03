import React from 'react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../audio/soundManager';

import { SidebarPortal } from './SidebarPortal';

/**
 * InventoryTray: Vertical right-sidebar rack of draggable and clickable tools & ingredients
 * Features item descriptions, measure badges, collapsible state, and rich tactile kitchen cabinetry styling.
 */
export const InventoryTray = ({
  title = "Station Inventory",
  hint = "Click item to hold, then drop or tap into workstation",
  items = [],
  onItemClick,
  onItemSelect,
  activeItemId,
}) => {
  const { holdingItem, setHoldingItem, isInventoryCollapsed, setIsInventoryCollapsed } = useGame();

  const closeCompactRack = () => {
    if (window.matchMedia('(max-width: 950px) and (orientation: landscape)').matches) {
      setIsInventoryCollapsed(true);
    }
  };

  const handleCardClick = (item) => {
    if (item.isUsed) return;
    if (item.disabled && !item.onClick) return;
    soundManager.playClick();

    if (item.onClick) {
      item.onClick();
      closeCompactRack();
      return;
    }

    const clickHandler = onItemClick || onItemSelect;
    if (clickHandler) {
      clickHandler(item);
      closeCompactRack();
      return;
    }

    if (holdingItem?.id === item.id) {
      setHoldingItem(null);
    } else {
      setHoldingItem({
        id: item.id,
        name: item.name,
        img: item.img,
        icon: item.fallbackIcon || '🥣',
      });
    }
    closeCompactRack();
  };

  // Render Collapsed Slim Vertical Tab (Right Edge)
  if (isInventoryCollapsed) {
    const availableCount = items.filter((i) => !i.isUsed).length;
    return (
      <SidebarPortal>
        <div
          className="right-inventory-rack collapsed"
          onClick={() => {
            soundManager.playClick();
            setIsInventoryCollapsed(false);
            if (window.matchMedia('(max-width: 950px) and (orientation: landscape), (max-width: 1200px) and (orientation: landscape) and (pointer: coarse)').matches) {
              setIsDialogueCollapsed(true);
            }
          }}
          title="Click to open Cookware & Ingredients Rack (◀)"
          role="button"
          tabIndex={0}
        >
          <div className="inventory-tab-icon-wrapper">
            <img src="/assets/icon_inventory_crate.webp" alt="Inventory" className="inventory-tab-icon-img" />
            <span className="inventory-tab-count-pill">{availableCount}</span>
          </div>
          <div className="inventory-tab-label-stack">
            <span className="inventory-tab-name">ITEMS</span>
            <span className="inventory-tab-sub">RACK</span>
          </div>
          <div className="inventory-tab-chevron-box">
            <span className="inventory-tab-chevron">◀</span>
          </div>
        </div>
      </SidebarPortal>
    );
  }

  // Render Full Expanded Right Inventory Rack
  return (
    <SidebarPortal>
      <div className="right-inventory-rack expanded">
      {/* Header Bar */}
      <div className="rack-header">
        <div className="rack-title-group">
          <div className="rack-icon-box">
            <img src="/assets/icon_inventory_crate.webp" alt="Inventory" className="rack-icon-img" />
          </div>
          <div className="rack-titles">
            <span className="rack-title-text">{title}</span>
            <span className="rack-count-pill">{items.filter(i => !i.isUsed).length} Available</span>
          </div>
        </div>
        <button
          className="rack-collapse-btn"
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playClick();
            setIsInventoryCollapsed(true);
          }}
          title="Minimize Inventory Rack (▶)"
          aria-label="Minimize Inventory"
        >
          <span>▶</span>
        </button>
      </div>
      <div className="rack-header-divider" />

      <div className="rack-hint-bar">
        <span>{hint}</span>
      </div>

      {/* Vertical Item Cards Stack with Rich Descriptions */}
      <div className="inventory-vertical-stack">
        {items.map((item) => {
          const isHeld = activeItemId ? activeItemId === item.id : holdingItem?.id === item.id;
          const isUsed = item.isUsed;
          const isNext = item.isNext;
          const descriptionText = item.tooltip || item.desc || item.description || '';

          return (
            <div
              key={item.id}
              className={`drag-card horizontal-item-card ${isHeld ? 'lifted selected-tap' : ''} ${isUsed ? 'used' : ''} ${isNext ? 'guide-pulse' : ''} ${item.disabled ? 'card-disabled' : ''}`}
              onClick={() => handleCardClick(item)}
              draggable={!isUsed && !item.disabled}
              onDragStart={(e) => {
                if (isUsed || item.disabled) return;
                e.dataTransfer.setData('text/plain', JSON.stringify({ id: item.id, name: item.name }));
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }}
              title={descriptionText || item.name}
              role="button"
              tabIndex={0}
            >
              <div
                className="card-icon-col"
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }}
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="card-icon-img"
                  draggable={false}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span className="card-fallback-icon" style={{ display: 'none', fontSize: '1.6rem' }}>
                  {item.fallbackIcon || '🥣'}
                </span>
              </div>

              <div className="card-info-col">
                <div className="card-title-row">
                  <span className="card-title">{item.name}</span>
                  {item.measure && <span className="card-measure">{item.measure}</span>}
                </div>
                {descriptionText && (
                  <p className="card-desc-text">{descriptionText}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </SidebarPortal>
  );
};
