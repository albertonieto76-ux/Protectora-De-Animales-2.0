import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../src/config/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads");
const seedAssetsDir = path.join(__dirname, "../test-assets");
const SHOULD_CLEAN = process.argv.includes("--clean");
const filesToDelete = new Set<string>();

const mimeByExt: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const toDataUrlFromLocalPath = (filePath: string, originalValue: string): string => {
  if (!fs.existsSync(filePath)) {
    console.warn(`[WARN] Archivo no encontrado: ${filePath}`);
    return originalValue;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = mimeByExt[ext];
  if (!mime) {
    console.warn(`[WARN] Extension no soportada para ${filePath}`);
    return originalValue;
  }

  const base64 = fs.readFileSync(filePath).toString("base64");
  return `data:${mime};base64,${base64}`;
};

const toDataUrlFromStoragePath = (value: string): string => {
  if (!value || typeof value !== "string") return value;
  if (value.startsWith("data:")) return value;
  if (value.startsWith("/uploads/")) {
    const fileName = value.replace("/uploads/", "");
    const filePath = path.join(uploadsDir, fileName);
    const dataUrl = toDataUrlFromLocalPath(filePath, value);
    if (dataUrl !== value) {
      filesToDelete.add(filePath);
    }
    return dataUrl;
  }

  if (value.startsWith("/seed-assets/")) {
    const relativePath = value.replace("/seed-assets/", "");
    const filePath = path.join(seedAssetsDir, relativePath);
    return toDataUrlFromLocalPath(filePath, value);
  }

  return value;
};

const listFilesRecursively = (root: string): string[] => {
  if (!fs.existsSync(root)) {
    return [];
  }

  const entries = fs.readdirSync(root, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursively(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
};

const cleanupMigratedFiles = () => {
  if (!SHOULD_CLEAN) {
    return;
  }

  let deleted = 0;
  for (const filePath of filesToDelete) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deleted += 1;
      }
    } catch (error) {
      console.warn(`[WARN] No se pudo eliminar ${filePath}:`, error);
    }
  }

  const allUploadFiles = listFilesRecursively(uploadsDir);
  let orphanDeleted = 0;
  for (const filePath of allUploadFiles) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        orphanDeleted += 1;
      }
    } catch (error) {
      console.warn(`[WARN] No se pudo eliminar huerfano ${filePath}:`, error);
    }
  }

  console.log(`[OK] Archivos eliminados de uploads: ${deleted}`);
  console.log(`[OK] Archivos huerfanos eliminados de uploads: ${orphanDeleted}`);
};

const migrateAnimals = async () => {
  const animals = await prisma.animal.findMany({ select: { id: true, images: true } });
  let updated = 0;

  for (const animal of animals) {
    const mapped = (animal.images || []).map((img) => toDataUrlFromStoragePath(img));
    const changed = JSON.stringify(mapped) !== JSON.stringify(animal.images || []);

    if (changed) {
      await prisma.animal.update({ where: { id: animal.id }, data: { images: mapped } });
      updated += 1;
    }
  }

  console.log(`[OK] Animals actualizados: ${updated}`);
};

const migrateEvents = async () => {
  const events = await prisma.evento.findMany({ select: { id: true, images: true } });
  let updated = 0;

  for (const event of events) {
    const mapped = (event.images || []).map((img) => toDataUrlFromStoragePath(img));
    const changed = JSON.stringify(mapped) !== JSON.stringify(event.images || []);

    if (changed) {
      await prisma.evento.update({ where: { id: event.id }, data: { images: mapped } });
      updated += 1;
    }
  }

  console.log(`[OK] Eventos actualizados: ${updated}`);
};

const main = async () => {
  try {
    await migrateAnimals();
    await migrateEvents();
    cleanupMigratedFiles();
    console.log("[DONE] Migracion de imagenes a DB finalizada.");
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((err) => {
  console.error("[ERROR] Fallo en migracion de imagenes:", err);
  process.exit(1);
});
