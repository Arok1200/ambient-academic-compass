import React, { useState } from "react";

export default function SettingsModal({ isOpen, onClose }) {
  const [timeFormat, setTimeFormat] = useState("12hr");
  const [appearance, setAppearance] = useState("system");
  const [notifications, setNotifications] = useState(true);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.className === 'sync-modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="sync-modal-overlay" onClick={handleOverlayClick}>
      <div className="sync-modal-content">

        <h2 className="sync-modal-title">Settings</h2>
        <p className="sync-modal-subtitle">
          Customize how the Ambient Academic Compass looks and behaves.
        </p>

        {/* ===================== TIME FORMAT ===================== */}
        <div className="sync-modal-options">
          <div className="sync-modal-option" onClick={() => setTimeFormat("12hr")}>
            <input
              type="radio"
              checked={timeFormat === "12hr"}
              onChange={() => setTimeFormat("12hr")}
            />
            <span>Time Format: 12-hour</span>
          </div>

          <div className="sync-modal-option" onClick={() => setTimeFormat("24hr")}>
            <input
              type="radio"
              checked={timeFormat === "24hr"}
              onChange={() => setTimeFormat("24hr")}
            />
            <span>Time Format: 24-hour <i>(Coming soon!)</i></span>
          </div>
        </div>

        {/* ===================== APPEARANCE ===================== */}
        <h3 className="sync-modal-title" style={{ fontSize: "1.2rem", marginTop: "1.5rem" }}>
          Appearance
        </h3>

        <div className="sync-modal-options">
          <div className="sync-modal-option" onClick={() => setAppearance("light")}>
            <input
              type="radio"
              checked={appearance === "light"}
              onChange={() => setAppearance("light")}
            />
            <span>Light Mode</span>
          </div>

          <div className="sync-modal-option" onClick={() => setAppearance("dark")}>
            <input
              type="radio"
              checked={appearance === "dark"}
              onChange={() => setAppearance("dark")}
            />
            <span>Dark Mode <i>(Coming soon!)</i></span>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="sync-modal-buttons">
          <button className="sync-modal-btn sync-modal-close" onClick={onClose}>
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
