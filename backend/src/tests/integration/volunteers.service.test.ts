import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "./prisma.mock.ts";
import { createNewVolunteer, findAllVolunteers } from "../../services/volunteers.service.ts";

vi.mock("../../config/prisma.ts", () => ({
  prisma: prismaMock
}));

describe("Volunteers Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllVolunteers devuelve voluntarios", async () => {
    prismaMock.voluntario.findMany.mockResolvedValue([
      { id: 1, nombre: "Ana" }
    ]);

    const result = await findAllVolunteers();

    expect(result).toEqual([{ id: 1, nombre: "Ana" }]);
    expect(prismaMock.voluntario.findMany).toHaveBeenCalled();
  });

  it("createNewVolunteer crea una cita inicial para que aparezca en el calendario", async () => {
    const volunteerInput = {
      nombre: "Ana",
      email: "ana@test.com",
      telefono: "600000000",
      disponibilidad: "Mañanas",
    };

    const createdVolunteer = {
      id: 7,
      ...volunteerInput,
    };

    prismaMock.voluntario.create.mockResolvedValue(createdVolunteer as any);
    prismaMock.citaVoluntariado.create.mockResolvedValue({ id: 1, voluntarioId: 7 } as any);

    const result = await createNewVolunteer(volunteerInput);

    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(prismaMock.voluntario.create).toHaveBeenCalledWith({
      data: {
        nombre: volunteerInput.nombre,
        email: volunteerInput.email,
        telefono: volunteerInput.telefono,
        disponibilidad: volunteerInput.disponibilidad,
        mensaje: null,
      },
    });
    expect(prismaMock.citaVoluntariado.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        voluntarioId: createdVolunteer.id,
        estado: "pendiente",
      }),
    });
    expect(result).toEqual(createdVolunteer);
  });
});
