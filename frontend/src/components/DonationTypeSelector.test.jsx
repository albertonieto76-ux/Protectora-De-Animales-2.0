import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DonationTypeSelector } from "./DonationTypeSelector";

describe("DonationTypeSelector", () => {
  it("emite un cambio cuando se pulsa un tipo de donación", () => {
    const onChange = vi.fn();

    render(<DonationTypeSelector value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Aporte puntual" }));

    expect(onChange).toHaveBeenCalledWith("puntual");
  });
});
