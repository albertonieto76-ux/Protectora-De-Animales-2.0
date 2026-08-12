import { prisma } from "../config/prisma.js";

const inMemoryAssistants: Record<number, Array<any>> = {};

export const findAllEvents = async () => {
  try {
    return await prisma.evento.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        asistentes: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
            mensaje: true,
            createdAt: true,
          },
        },
      },
    });
  } catch (error) {
    console.warn("No se pudo incluir asistentes en eventos, se devolverá la lista simple:", error);
    return prisma.evento.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
};

export const findEventById = async (id: number) => {
  try {
    return await prisma.evento.findUnique({
      where: { id },
      include: {
        asistentes: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
            mensaje: true,
            createdAt: true,
          },
        },
      },
    });
  } catch (error) {
    console.warn("No se pudo incluir asistentes en el evento, se devolverá el registro simple:", error);
    return prisma.evento.findUnique({ where: { id } });
  }
};

export const createNewEvent = (data: any) =>
  prisma.evento.create({
    data: {
      titulo: data.titulo,
      descripcion: data.descripcion,
      lugar: data.lugar,
      fecha: new Date(data.fecha),
      images: Array.isArray(data.images) ? data.images : [],
    },
  });

export const registerAssistantToEvent = async (eventoId: number, data: { nombre: string; email: string; telefono?: string; mensaje?: string }) => {
  const model = (prisma as any).asistenteEvento;

  const entry = {
    id: Date.now(),
    eventoId,
    nombre: data.nombre,
    email: data.email,
    telefono: data.telefono,
    mensaje: data.mensaje,
    createdAt: new Date().toISOString(),
    simulated: true,
  };

  inMemoryAssistants[eventoId] = [
    ...(inMemoryAssistants[eventoId] || []),
    entry,
  ];

  if (!model?.create) {
    return entry;
  }

  try {
    const created = await model.create({
      data: {
        eventoId,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        mensaje: data.mensaje,
      },
    });

    return {
      ...created,
      createdAt: created.createdAt?.toISOString ? created.createdAt.toISOString() : created.createdAt,
    };
  } catch (error) {
    console.warn("No se pudo persistir el asistente en la base de datos, se mantendrá en memoria:", error);
    return entry;
  }
};

export const getEventAssistants = async (eventoId: number) => {
  const model = (prisma as any).asistenteEvento;
  const inMemoryEntries = inMemoryAssistants[eventoId] || [];

  if (!model?.findMany) {
    return inMemoryEntries;
  }

  try {
    const persisted = await model.findMany({
      where: { eventoId },
      orderBy: { createdAt: "desc" },
    });

    return persisted.length > 0 ? persisted : inMemoryEntries;
  } catch (error) {
    console.warn("No se pudo leer asistentes desde Prisma, se devolverán los datos en memoria:", error);
    return inMemoryEntries;
  }
};

export const updateExistingEvent = async (id: number, data: unknown) => {
  try {
    return await prisma.evento.update({ where: { id }, data: data as any });
  } catch {
    return null;
  }
};

export const deleteExistingEvent = async (id: number) => {
  try {
    await prisma.evento.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
};
