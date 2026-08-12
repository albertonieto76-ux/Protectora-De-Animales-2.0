import React from "react";

export const ANIMAL_SPECIES_OPTIONS = ["Todos", "Perros", "Gatos", "Otros"];

export function AnimalSpeciesSelector({ value = "Todos", onChange, className = "" }) {
  return (
    <div className={`animal-species-selector ${className}`.trim()}>
      {ANIMAL_SPECIES_OPTIONS.map((option) => {
        const isActive = value === option;

        return (
          <button
            key={option}
            type="button"
            className={`modal-typology-pill pill-button ${isActive ? "active" : ""}`.trim()}
            onClick={() => onChange?.(option)}
            aria-pressed={isActive}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
