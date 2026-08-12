import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VolunteerAvailabilitySelector } from "./VolunteerAvailabilitySelector";

describe("VolunteerAvailabilitySelector", () => {
  it("emite un cambio cuando se pulsa una disponibilidad", () => {
    const onChange = vi.fn();

    render(<VolunteerAvailabilitySelector value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Mañanas" }));

    expect(onChange).toHaveBeenCalledWith("Mañanas");
  });
});
