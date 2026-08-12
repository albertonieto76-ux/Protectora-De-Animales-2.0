import React from "react";

export const VOLUNTEER_AVAILABILITY_OPTIONS = [
  "Fines de semana",
  "Entre semana",
  "Mañanas",
  "Tardes",
  "Flexible",
];

export function VolunteerAvailabilitySelector({
  value = "",
  onChange,
  options = VOLUNTEER_AVAILABILITY_OPTIONS,
  className = "",
}) {
  return (
    <div className={`volunteer-availability-selector ${className}`.trim()}>
      {options.map((option) => {
        const isActive = value === option;

        return (
          <button
            key={option}
            type="button"
            className={`volunteer-availability-chip ${isActive ? "active" : ""}`.trim()}
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
