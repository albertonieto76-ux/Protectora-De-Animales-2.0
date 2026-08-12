import { prisma } from "../src/services/prisma.js";

const INTERNAL_SEED_PREFIX = "loadtest";
const PHOTOS_PER_ANIMAL = 10;
const PHOTOS_PER_EVENT = 10;
const DOWNLOAD_TIMEOUT_MS = 8000;
const DOWNLOAD_RETRIES = 1;

const SPECIES_PLAN: Array<{ species: string; count: number }> = [
  { species: "Perro", count: 3 },
  { species: "Gato", count: 3 },
  { species: "Loro", count: 1 },
  { species: "Conejo", count: 2 },
  { species: "Serpiente", count: 2 },
];

const VOLUNTEER_NAMES = [
  "Lucia Gomez",
  "Carlos Ruiz",
  "Marta Perez",
  "Javier Torres",
  "Irene Diaz",
  "David Moreno",
  "Paula Martin",
  "Sergio Navarro",
  "Alba Soto",
  "Adrian Castro",
];

const EVENT_TITLES = [
  "Jornada de adopcion urbana",
  "Paseo solidario canino",
  "Mercadillo benefico",
  "Taller de cuidados basicos",
  "Charlas de bienestar animal",
  "Recaudacion en parque central",
  "Dia de puertas abiertas",
  "Vacunacion comunitaria",
  "Campana de esterilizacion",
  "Encuentro de familias adoptantes",
];

const DONOR_NAMES = [
  "Ana Lopez",
  "Mario Vidal",
  "Elena Campos",
  "Raul Fuentes",
  "Sonia Marquez",
  "Diego Santos",
  "Rocio Ortega",
  "Pablo Rivas",
  "Noelia Gil",
  "Hugo Carrasco",
];

const TOTAL_ANIMALS = SPECIES_PLAN.reduce((acc, item) => acc + item.count, 0);

const SPECIES_QUERY: Record<string, string> = {
  Perro: "dog",
  Gato: "cat",
  Loro: "parrot",
  Conejo: "rabbit",
  Serpiente: "snake",
};

const EVENT_IMAGE_QUERY = [
  "animal shelter event",
  "pet adoption fair",
  "dog charity",
  "cat rescue",
  "animal volunteering",
  "pet community event",
  "animal fundraiser",
  "pet care workshop",
  "shelter volunteers",
  "adoption campaign",
];

function toAnimalSpecs() {
  const result: Array<{ species: string; name: string }> = [];

  for (const plan of SPECIES_PLAN) {
    for (let i = 0; i < plan.count; i++) {
      result.push({
        species: plan.species,
        name: `${plan.species} ${i + 1}`,
      });
    }
  }

  return result;
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function buildInternetUrl(species: string, animalIndex: number, photoIndex: number) {
  const query = SPECIES_QUERY[species] || "animal";
  const salt = `${animalIndex + 1}-${photoIndex + 1}-${Date.now()}`;
  return `https://source.unsplash.com/1200x900/?${encodeURIComponent(query)}&sig=${encodeURIComponent(salt)}`;
}

function buildFallbackUrl(species: string, animalIndex: number, photoIndex: number) {
  const query = SPECIES_QUERY[species] || "animal";
  const seed = `${INTERNAL_SEED_PREFIX}-${query}-${animalIndex + 1}-${photoIndex + 1}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/900`;
}

async function downloadOneImage(url: string) {
  const response = await fetchWithTimeout(url, DOWNLOAD_TIMEOUT_MS);
  if (!response.ok) {
    throw new Error(`Respuesta ${response.status} al descargar ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const mime = response.headers.get("content-type") || "image/jpeg";
  return {
    buffer: Buffer.from(arrayBuffer),
    mime: mime.split(";")[0],
  };
}

function imageToDataUrl(buffer: Buffer, mime: string) {
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function downloadImageWithRetry(species: string, animalIndex: number, photoIndex: number) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= DOWNLOAD_RETRIES; attempt++) {
    try {
      const primaryUrl = buildInternetUrl(species, animalIndex, photoIndex);
      return await downloadOneImage(primaryUrl);
    } catch (error) {
      lastError = error;

      try {
        const fallbackUrl = buildFallbackUrl(species, animalIndex, photoIndex);
        return await downloadOneImage(fallbackUrl);
      } catch (fallbackError) {
        lastError = fallbackError;
      }
    }
  }

  throw new Error(`No se pudo descargar foto ${photoIndex + 1} para ${species}. ${String(lastError)}`);
}

async function prepareAnimalImages(species: string, animalIndex: number) {
  const jobs = Array.from({ length: PHOTOS_PER_ANIMAL }, async (_, i) => {
    const { buffer, mime } = await downloadImageWithRetry(species, animalIndex, i);
    return imageToDataUrl(buffer, mime);
  });

  return await Promise.all(jobs);
}

function buildEventInternetUrl(eventIndex: number, photoIndex: number) {
  const query = EVENT_IMAGE_QUERY[eventIndex % EVENT_IMAGE_QUERY.length];
  const salt = `event-${eventIndex + 1}-${photoIndex + 1}-${Date.now()}`;
  return `https://source.unsplash.com/1200x900/?${encodeURIComponent(query)}&sig=${encodeURIComponent(salt)}`;
}

function buildEventFallbackUrl(eventIndex: number, photoIndex: number) {
  const query = EVENT_IMAGE_QUERY[eventIndex % EVENT_IMAGE_QUERY.length].replace(/\s+/g, "-");
  const seed = `${INTERNAL_SEED_PREFIX}-event-${query}-${eventIndex + 1}-${photoIndex + 1}`;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/900`;
}

async function downloadEventImageWithRetry(eventIndex: number, photoIndex: number) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= DOWNLOAD_RETRIES; attempt++) {
    try {
      const primaryUrl = buildEventInternetUrl(eventIndex, photoIndex);
      return await downloadOneImage(primaryUrl);
    } catch (error) {
      lastError = error;

      try {
        const fallbackUrl = buildEventFallbackUrl(eventIndex, photoIndex);
        return await downloadOneImage(fallbackUrl);
      } catch (fallbackError) {
        lastError = fallbackError;
      }
    }
  }

  throw new Error(`No se pudo descargar foto ${photoIndex + 1} para evento ${eventIndex + 1}. ${String(lastError)}`);
}

async function prepareEventImages(eventIndex: number) {
  const jobs = Array.from({ length: PHOTOS_PER_EVENT }, async (_, i) => {
    const { buffer, mime } = await downloadEventImageWithRetry(eventIndex, i);
    return imageToDataUrl(buffer, mime);
  });

  return await Promise.all(jobs);
}

async function ensurePaymentTypes() {
  const paymentTypes = [
    { tipo: "bizum", label: "Bizum" },
    { tipo: "transferencia", label: "Transferencia" },
    { tipo: "paypal", label: "PayPal" },
    { tipo: "tarjeta", label: "Tarjeta" },
  ];

  const result = [];
  for (const item of paymentTypes) {
    const type = await prisma.tipoPago.upsert({
      where: { tipo: item.tipo },
      update: { label: item.label },
      create: {
        tipo: item.tipo,
        label: item.label,
      },
    });
    result.push(type);
  }

  return result;
}

async function cleanPreviousSeedData() {
  await prisma.$transaction([
    prisma.donacion.deleteMany(),
    prisma.citaVoluntariado.deleteMany(),
    prisma.solicitudAdopcion.deleteMany(),
    prisma.voluntario.deleteMany(),
    prisma.evento.deleteMany(),
    prisma.animal.deleteMany(),
    prisma.tipoPago.deleteMany(),
  ]);
}

async function createAnimals() {
  const animals = [];
  const specs = toAnimalSpecs();

  if (specs.length !== TOTAL_ANIMALS) {
    throw new Error(`Plan de especies invalido: esperados ${TOTAL_ANIMALS} animales.`);
  }

  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    const images = await prepareAnimalImages(spec.species, i);

    const animal = await prisma.animal.create({
      data: {
        name: spec.name,
        species: spec.species,
        age: 1 + (i % 12),
        description: `Animal de prueba ${i + 1}. Fotos descargadas de internet para testing.`,
        images,
      },
    });

    animals.push(animal);
  }

  return animals;
}

async function createVolunteers() {
  const volunteers = [];

  for (let i = 0; i < 10; i++) {
    const volunteer = await prisma.voluntario.create({
      data: {
        nombre: `${VOLUNTEER_NAMES[i]}`,
        email: `load.vol${i + 1}@example.com`,
        telefono: `60000${String(i + 1).padStart(4, "0")}`,
        disponibilidad: i % 2 === 0 ? "Mananas y fines de semana" : "Tardes entre semana",
        mensaje: `Voluntario de prueba ${i + 1}.`,
      },
    });

    volunteers.push(volunteer);
  }

  return volunteers;
}

async function createEvents() {
  const events = [];
  const today = new Date();

  for (let i = 0; i < 10; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + 3 * (i + 1));
    eventDate.setHours(10 + (i % 4), 15 + (i % 3) * 15, 0, 0);
    const images = await prepareEventImages(i);

    const event = await prisma.evento.create({
      data: {
        titulo: `${EVENT_TITLES[i]}`,
        descripcion: `Evento de prueba numero ${i + 1}.`,
        fecha: eventDate,
        lugar: `Centro comunitario ${i + 1}`,
        images,
      },
    });

    events.push(event);
  }

  return events;
}

async function createDonations(paymentTypes: Array<{ id: number }>) {
  const donations = [];

  for (let i = 0; i < 10; i++) {
    const amount = Number((15 + i * 7.5).toFixed(2));
    const paymentTypeId = paymentTypes[i % paymentTypes.length].id;

    const donation = await prisma.donacion.create({
      data: {
        cantidad: amount,
        nombre: `${DONOR_NAMES[i]}`,
        email: `load.donor${i + 1}@example.com`,
        metodoId: paymentTypeId,
      },
    });

    donations.push(donation);
  }

  return donations;
}

async function createAdoptions(animals: Array<{ id: number; name: string }>) {
  const adoptions = [];

  for (let i = 0; i < animals.length; i++) {
    const animal = animals[i];
    const adoption = await prisma.solicitudAdopcion.create({
      data: {
        animalId: animal.id,
        nombre: `Solicitud ${i + 1}`,
        email: `load.adoption${i + 1}@example.com`,
        telefono: `61111${String(i + 1).padStart(4, "0")}`,
        mensaje: `Solicitud de prueba para ${animal.name}`,
        estado: i % 3 === 0 ? "aprobado" : i % 3 === 1 ? "pendiente" : "rechazado",
      },
    });
    adoptions.push(adoption);
  }

  return adoptions;
}

async function createVolunteerAppointments(volunteers: Array<{ id: number }>) {
  const appointments = [];
  const now = new Date();

  for (let i = 0; i < volunteers.length; i++) {
    const start = new Date(now);
    start.setDate(now.getDate() + i + 1);
    start.setHours(9 + (i % 6), 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 2);

    const appointment = await prisma.citaVoluntariado.create({
      data: {
        voluntarioId: volunteers[i].id,
        inicio: start,
        fin: end,
        estado: i % 2 === 0 ? "confirmada" : "pendiente",
        notas: `Cita de prueba ${i + 1}`,
      },
    });

    appointments.push(appointment);
  }

  return appointments;
}

async function main() {
  console.log("Iniciando carga de prueba...");
  console.log("Origen de fotos: internet (guardadas en BBDD como data URL)");

  await cleanPreviousSeedData();
  const paymentTypes = await ensurePaymentTypes();

  const animals = await createAnimals();
  const volunteers = await createVolunteers();
  const appointments = await createVolunteerAppointments(volunteers);
  const events = await createEvents();
  const adoptions = await createAdoptions(animals);
  const donations = await createDonations(paymentTypes);

  console.log("Carga completada:");
  console.log(`- Animales creados: ${animals.length} (10 fotos reales por animal)`);
  console.log("- Distribucion de especies: 3 Perro, 3 Gato, 1 Loro, 2 Conejo, 2 Serpiente");
  console.log(`- Voluntarios creados: ${volunteers.length}`);
  console.log(`- Citas de voluntariado creadas: ${appointments.length}`);
  console.log(`- Eventos creados: ${events.length} (10 fotos por evento)`);
  console.log(`- Solicitudes de adopcion creadas: ${adoptions.length}`);
  console.log(`- Donaciones creadas: ${donations.length}`);
  console.log("Listo.");
}

main()
  .catch((error) => {
    console.error("Error en carga de prueba:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
