import React from 'react';

// Browsers cannot force a device to rotate. The Android activity requests
// landscape; this prompt is only for a phone opened in a browser in portrait.
export const ScreenRestrictionOverlay = () => (
  <aside className="screen-restriction-overlay" role="status" aria-live="polite">
    <div className="restriction-modal-card">
      <span className="restriction-rotate-icon" aria-hidden="true">↻</span>
      <h2>Rotate your phone</h2>
      <p>PALMQuest is ready to play on your phone. Turn it sideways to use the laboratory.</p>
    </div>
  </aside>
);
