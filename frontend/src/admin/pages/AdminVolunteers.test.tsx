import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminVolunteers } from "./AdminVolunteers";
import {
  createVolunteerAppointment,
  deleteVolunteerAppointment,
  getVolunteerAppointments,
  getVoluntarios,
  updateVolunteerAppointment,
} from "../../api.js";

vi.mock("../../api.js", () => ({
  createVolunteerAppointment: vi.fn(),
  deleteVolunteerAppointment: vi.fn(),
  deleteVoluntario: vi.fn(),
  getVolunteerAppointments: vi.fn(),
  getVoluntarios: vi.fn(),
  updateVolunteerAppointment: vi.fn(),
}));

vi.mock("../layout/AdminLayout", () => ({
  AdminLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("AdminVolunteers calendar actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["confirmada", "calendar-day-selected-range"],
    ["pendiente", "calendar-day-selected-range-pending"],
    ["cancelada", "calendar-day-selected-range-cancelled"],
  ])("shows the %s status color and hours on the selected appointment", async (estado, statusClass) => {
    const dateKey = new Date().toISOString().slice(0, 10);
    vi.mocked(getVoluntarios).mockResolvedValue([{
      id: 4,
      nombre: "Lucia Gomez",
      email: "lucia@example.com",
    }]);
    vi.mocked(getVolunteerAppointments).mockResolvedValue([{
      id: 8,
      voluntarioId: 4,
      voluntario: { id: 4, nombre: "Lucia Gomez" },
      inicio: `${dateKey}T09:00:00`,
      fin: `${dateKey}T11:00:00`,
      estado,
      notas: "Cita importada",
    }]);

    render(<AdminVolunteers />);

    const calendarAppointment = await screen.findByRole("button", {
      name: /1 prestación.*09:00.*11:00/i,
    });
    expect(calendarAppointment).toHaveClass(statusClass);
  });

  it("selects an imported morning appointment and enables its actions", async () => {
    const dateKey = new Date().toISOString().slice(0, 10);
    vi.mocked(getVoluntarios).mockResolvedValue([{
      id: 4,
      nombre: "Lucia Gomez",
      email: "lucia@example.com",
    }]);
    vi.mocked(getVolunteerAppointments).mockResolvedValue([{
      id: 8,
      voluntarioId: 4,
      voluntario: { id: 4, nombre: "Lucia Gomez" },
      inicio: `${dateKey}T09:00:00`,
      fin: `${dateKey}T11:00:00`,
      estado: "confirmada",
      notas: "Cita importada",
    }]);

    render(<AdminVolunteers />);

    await waitFor(() => {
      expect(screen.getByText("Citas de todos los voluntarios")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Alta", exact: true })).toBeEnabled();
      expect(screen.getByRole("button", { name: "Modificar voluntariado" })).toBeEnabled();
      expect(screen.getByRole("button", { name: "Borrar" })).toBeEnabled();
      expect(screen.getByRole("heading", { name: "Modificar voluntariado" })).toBeInTheDocument();
    });

    vi.mocked(updateVolunteerAppointment).mockResolvedValue({ id: 8 });
    vi.mocked(getVolunteerAppointments).mockResolvedValueOnce([{
      id: 8,
      voluntarioId: 4,
      voluntario: { id: 4, nombre: "Lucia Gomez" },
      inicio: `${dateKey}T09:00:00`,
      fin: `${dateKey}T11:00:00`,
      estado: "confirmada",
      notas: "Cita importada",
    }]);
    fireEvent.click(screen.getByRole("button", { name: "Modificar voluntariado" }));

    await waitFor(() => {
      expect(updateVolunteerAppointment).toHaveBeenCalledWith(8, expect.objectContaining({ voluntarioId: 4 }));
    });

    fireEvent.click(screen.getByRole("button", { name: "Alta", exact: true }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Alta de nuevo voluntariado" })).toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: "Voluntario" })).toHaveValue("4");
      expect(screen.getByRole("button", { name: "Guardar alta" })).toBeEnabled();
    });

    vi.mocked(createVolunteerAppointment).mockResolvedValue({ id: 9 });
    vi.mocked(getVolunteerAppointments).mockResolvedValueOnce([]);
    fireEvent.click(screen.getByRole("button", { name: "Guardar alta" }));

    await waitFor(() => {
      expect(createVolunteerAppointment).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("button", { name: "Crear prestación" })).not.toBeInTheDocument();
    });
  });

  it("deletes the selected appointment from the top action bar", async () => {
    const dateKey = new Date().toISOString().slice(0, 10);
    vi.stubGlobal("confirm", vi.fn(() => true));
    vi.mocked(getVoluntarios).mockResolvedValue([{
      id: 4,
      nombre: "Lucia Gomez",
      email: "lucia@example.com",
    }]);
    vi.mocked(getVolunteerAppointments).mockResolvedValue([{
      id: 8,
      voluntarioId: 4,
      voluntario: { id: 4, nombre: "Lucia Gomez" },
      inicio: `${dateKey}T09:00:00`,
      fin: `${dateKey}T11:00:00`,
      estado: "confirmada",
      notas: "Cita importada",
    }]);
    vi.mocked(deleteVolunteerAppointment).mockResolvedValue({ id: 8 });

    render(<AdminVolunteers />);

    const deleteButton = await screen.findByRole("button", { name: "Borrar" });
    await waitFor(() => expect(deleteButton).toBeEnabled());
    vi.mocked(getVolunteerAppointments).mockResolvedValueOnce([]);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteVolunteerAppointment).toHaveBeenCalledWith(8);
    });
  });
});