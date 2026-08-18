import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminAdoptions } from "./AdminAdoptions";
import { getAdopciones, updateAdopcionStatus } from "../../api.js";

vi.mock("../../api.js", () => ({
  getAdopciones: vi.fn(),
  updateAdopcionStatus: vi.fn(),
  deleteAdopcion: vi.fn(),
}));

vi.mock("../layout/AdminLayout", () => ({
  AdminLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("AdminAdoptions calendar actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    { initialStatus: "pendiente", buttonName: "Aprobar", nextStatus: "aprobado" },
    { initialStatus: "pendiente", buttonName: "Rechazar", nextStatus: "rechazado" },
    { initialStatus: "aprobado", buttonName: "Pendiente", nextStatus: "pendiente" },
  ])("updates the selected adoption to $nextStatus", async ({ initialStatus, buttonName, nextStatus }) => {
    const createdAt = new Date().toISOString();
    vi.mocked(getAdopciones).mockResolvedValue([{
      id: 7,
      nombre: "Ana",
      email: "ana@example.com",
      animalId: 2,
      estado: initialStatus,
      createdAt,
    }]);
    vi.mocked(updateAdopcionStatus).mockResolvedValue({ id: 7, estado: nextStatus });

    render(<AdminAdoptions />);

    const actionButton = await screen.findByRole("button", { name: buttonName });
    fireEvent.click(actionButton);

    await waitFor(() => {
      expect(updateAdopcionStatus).toHaveBeenCalledWith(7, nextStatus);
      expect(screen.getAllByText(nextStatus)).toHaveLength(2);
    });
  });
});