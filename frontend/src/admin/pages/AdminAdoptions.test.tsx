import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminAdoptions } from "./AdminAdoptions";
import { getAdopciones, updateAdopcion, updateAdopcionStatus } from "../../api.js";

vi.mock("../../api.js", () => ({
  getAdopciones: vi.fn(),
  updateAdopcion: vi.fn(),
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

  it("enables actions for the first imported adoption even when it is not from today", async () => {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - 1);
    vi.mocked(getAdopciones).mockResolvedValue([{
      id: 11,
      nombre: "Solicitud importada",
      email: "importada@example.com",
      animalId: 2,
      estado: "pendiente",
      createdAt: createdAt.toISOString(),
    }]);

    render(<AdminAdoptions />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Aprobar" })).toBeEnabled();
      expect(screen.queryByRole("button", { name: "Modificar adopción" })).not.toBeInTheDocument();
      expect(screen.getAllByText("Solicitud importada")).toHaveLength(3);
    });
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

  it("saves a later appointment with the selected adopter", async () => {
    const createdAt = new Date().toISOString();
    vi.mocked(getAdopciones).mockResolvedValue([{
      id: 12,
      nombre: "Maria",
      email: "maria@example.com",
      animalId: 3,
      estado: "aprobado",
      fechaCita: null,
      createdAt,
    }]);
    vi.mocked(updateAdopcion).mockResolvedValue({
      id: 12,
      fechaCita: "2026-08-25T08:30:00.000Z",
      estado: "pendiente_cita",
    });

    render(<AdminAdoptions />);

    fireEvent.click(await screen.findByRole("button", { name: "Pendiente de cita" }));
    fireEvent.change(screen.getByLabelText("Fecha y hora de la cita"), {
      target: { value: "2026-08-25T10:30" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cita" }));

    await waitFor(() => {
      expect(updateAdopcion).toHaveBeenCalledWith(12, {
        fechaCita: new Date("2026-08-25T10:30").toISOString(),
        estado: "pendiente_cita",
      });
      expect(screen.getByText(/25\/08\/2026/)).toBeInTheDocument();
      expect(screen.getAllByText("pendiente de cita")).toHaveLength(2);
      expect(screen.getByText("C 1")).toBeInTheDocument();
    });
  });

  it("hides the appointment date editor when another status is selected", async () => {
    const createdAt = new Date().toISOString();
    vi.mocked(getAdopciones).mockResolvedValue([{
      id: 14,
      nombre: "Elena",
      email: "elena@example.com",
      animalId: 5,
      estado: "pendiente",
      fechaCita: null,
      createdAt,
    }]);
    vi.mocked(updateAdopcionStatus).mockResolvedValue({ id: 14, estado: "aprobado" });

    render(<AdminAdoptions />);

    fireEvent.click(await screen.findByRole("button", { name: "Pendiente de cita" }));
    expect(screen.getByLabelText("Fecha y hora de la cita")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Aprobar" }));

    await waitFor(() => {
      expect(updateAdopcionStatus).toHaveBeenCalledWith(14, "aprobado");
      expect(screen.queryByLabelText("Fecha y hora de la cita")).not.toBeInTheDocument();
    });
  });

  it("sets pending appointment directly when a date already exists", async () => {
    const createdAt = new Date().toISOString();
    vi.mocked(getAdopciones).mockResolvedValue([{
      id: 13,
      nombre: "Pedro",
      email: "pedro@example.com",
      animalId: 4,
      estado: "aprobado",
      fechaCita: "2026-08-28T09:00:00.000Z",
      createdAt,
    }]);
    vi.mocked(updateAdopcionStatus).mockResolvedValue({ id: 13, estado: "pendiente_cita" });

    render(<AdminAdoptions />);

    fireEvent.click(await screen.findByRole("button", { name: "Pendiente de cita" }));

    await waitFor(() => {
      expect(updateAdopcionStatus).toHaveBeenCalledWith(13, "pendiente_cita");
      expect(screen.getAllByText("pendiente de cita")).toHaveLength(2);
    });
  });
});