/* ==========================================================================
   PALMQUEST DIALOGUE & FEEDBACK SYSTEM
   Teacher Mia Visual Novel Controller & Audio-Visual Toasts
   ========================================================================== */

import { soundManager } from '../audio/soundManager.js';

class DialogueSystem {
  constructor() {
    this.box = null;
    this.textEl = null;
    this.avatarEl = null;
    this.btnAction = null;
    this.hintEl = null;
    this.badgeEl = null;
    this.toastEl = null;

    this.typewriterTimer = null;
    this.currentCallback = null;

    this.avatars = {
      neutral: '/assets/teacher_mia_neutral.webp',
      happy: '/assets/teacher_mia_happy.webp',
      thinking: '/assets/teacher_mia_thinking.webp',
      sad: '/assets/teacher_mia_sad.webp'
    };
  }

  init() {
    this.box = document.getElementById('dialogue-box');
    this.textEl = document.getElementById('dialogue-text');
    this.avatarEl = document.getElementById('dialogue-avatar');
    this.btnAction = document.getElementById('btn-dialogue-action');
    this.hintEl = document.getElementById('dialogue-hint-tag');
    this.badgeEl = document.getElementById('dialogue-badge');
    this.toastEl = document.getElementById('feedback-toast');

    if (this.btnAction) {
      this.btnAction.addEventListener('click', () => {
        soundManager.playClick();
        if (this.currentCallback) {
          const cb = this.currentCallback;
          this.currentCallback = null;
          cb();
        }
      });
    }
  }

  speak(text, avatarType = 'neutral', options = {}) {
    if (!this.box) this.init();
    if (!this.box) return;

    this.box.classList.remove('hidden');

    // Update avatar image
    if (this.avatarEl && this.avatars[avatarType]) {
      this.avatarEl.src = this.avatars[avatarType];
    }

    // Set badge text
    if (this.badgeEl) {
      this.badgeEl.textContent = options.badge || 'Instructor';
    }

    // Set hint text
    if (this.hintEl) {
      this.hintEl.textContent = options.hint ? `💡 Hint: ${options.hint}` : '';
    }

    // Set button text & callback
    if (this.btnAction) {
      this.btnAction.textContent = options.btnText || 'Next ➔';
      this.btnAction.style.display = options.hideButton ? 'none' : 'inline-flex';
    }
    this.currentCallback = options.onNext || null;

    // Typewriter effect
    this.typewrite(text);
  }

  typewrite(fullText) {
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    if (!this.textEl) return;

    this.textEl.textContent = '';
    let i = 0;
    this.typewriterTimer = setInterval(() => {
      if (i < fullText.length) {
        this.textEl.textContent += fullText.charAt(i);
        i++;
      } else {
        clearInterval(this.typewriterTimer);
        this.typewriterTimer = null;
      }
    }, 15);
  }

  hide() {
    if (this.box) {
      this.box.classList.add('hidden');
    }
  }

  showToast(title, message, type = 'success') {
    if (!this.toastEl) this.init();
    if (!this.toastEl) return;

    const iconEl = document.getElementById('toast-icon');
    const titleEl = document.getElementById('toast-title');
    const msgEl = document.getElementById('toast-message');

    this.toastEl.className = `feedback-toast ${type}`;

    if (type === 'success') {
      soundManager.playSuccess();
      iconEl.textContent = '✨';
    } else if (type === 'danger') {
      soundManager.playError();
      iconEl.textContent = '⚠️';
    } else {
      soundManager.playClick();
      iconEl.textContent = '💡';
    }

    titleEl.textContent = title;
    msgEl.textContent = message;

    this.toastEl.classList.remove('hidden');

    setTimeout(() => {
      this.toastEl.classList.add('hidden');
    }, 2800);
  }
}

export const dialogueSystem = new DialogueSystem();
