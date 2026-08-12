import React from "react";

export const DONATION_TYPE_OPTIONS = [
  { key: "puntual", label: "Aporte puntual" },
  { key: "veterinaria", label: "Veterinaria" },
  { key: "alimentacion", label: "Alimentación" },
];

export function DonationTypeSelector({ value = "", onChange, className = "" }) {
  return (
    <div className={`donation-type-selector ${className}`.trim()}>
      {DONATION_TYPE_OPTIONS.map((option) => {
        const isActive = value === option.key;

        return (
          <button
            key={option.key}
            type="button"
            className={`modal-typology-pill pill-button ${isActive ? "active" : ""}`.trim()}
            onClick={() => onChange?.(option.key)}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
