import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminDonations } from "./AdminDonations";
import { getDonaciones, getPaymentTypes } from "../../api.js";

vi.mock("../../api.js", () => ({
  createPaymentType: vi.fn(),
  deletePaymentType: vi.fn(),
  getDonaciones: vi.fn(),
  getPaymentTypes: vi.fn(),
  updatePaymentType: vi.fn(),
}));

vi.mock("../layout/AdminLayout", () => ({
  AdminLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("AdminDonations donation types", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPaymentTypes).mockResolvedValue([]);
  });

  it("shows the selected public donation type and identifies legacy records", async () => {
    vi.mocked(getDonaciones).mockResolvedValue([
      { id: 1, cantidad: 20, tipoDonacion: "puntual", createdAt: "2026-08-18T10:00:00Z" },
      { id: 2, cantidad: 35, tipoDonacion: "veterinaria", createdAt: "2026-08-18T10:00:00Z" },
      { id: 3, cantidad: 25, tipoDonacion: "alimentacion", createdAt: "2026-08-18T10:00:00Z" },
      { id: 4, cantidad: 15, tipoDonacion: null, createdAt: "2026-08-18T10:00:00Z" },
    ]);

    render(<AdminDonations />);

    expect(await screen.findByRole("columnheader", { name: "Tipo de donación" })).toBeInTheDocument();
    expect(screen.getByText("Aporte puntual")).toBeInTheDocument();
    expect(screen.getByText("Veterinaria")).toBeInTheDocument();
    expect(screen.getByText("Alimentación")).toBeInTheDocument();
    expect(screen.getByText("Sin tipo registrado")).toBeInTheDocument();
  });

  it("shows every donation from one donor and sums only their donations", async () => {
    vi.mocked(getDonaciones).mockResolvedValue([
      { id: 1, nombre: "Ana López", email: "ana@example.com", cantidad: 20, tipoDonacion: "puntual", createdAt: "2026-08-15T10:00:00Z" },
      { id: 2, nombre: "Ana López", email: "ana@example.com", cantidad: 35, tipoDonacion: "veterinaria", createdAt: "2026-08-18T10:00:00Z" },
      { id: 3, nombre: "Mario Vidal", email: "mario@example.com", cantidad: 25, tipoDonacion: "alimentacion", createdAt: "2026-08-18T10:00:00Z" },
    ]);

    render(<AdminDonations />);

    fireEvent.change(await screen.findByRole("searchbox", { name: "Buscar por donante" }), {
      target: { value: "ana" },
    });

    const donationTable = screen.getByRole("table");
    expect(within(donationTable).getAllByText("Ana López")).toHaveLength(2);
    expect(within(donationTable).queryByText("Mario Vidal")).not.toBeInTheDocument();
    expect(screen.getByTestId("donation-total")).toHaveTextContent("55.00 €");
    expect(screen.getByRole("columnheader", { name: "Fecha" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Fecha")).not.toBeInTheDocument();
  });
});