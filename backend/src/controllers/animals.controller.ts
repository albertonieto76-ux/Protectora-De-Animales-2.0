import type { Request, Response } from "express";
import {
  createNewAnimal,
  deleteExistingAnimal,
  findAllAnimals,
  findAnimalById,
  updateExistingAnimal,
} from "../services/animals.service.js";

const getImagesFromRequest = (req: Request) => {
  const files = (req.files as Express.Multer.File[] | undefined) || [];
  return files.map((file) => `/uploads/${file.filename}`);
};

const normalizeAnimalPayload = (req: Request) => {
  const body = req.body as Record<string, any>;
  const imagesFromBody = typeof body.images === "string"
    ? [body.images]
    : Array.isArray(body.images)
    ? body.images
    : undefined;
  const existingImages = typeof body.existingImages === "string"
    ? (() => {
        try {
          const parsed = JSON.parse(body.existingImages);
          return Array.isArray(parsed) ? parsed : undefined;
        } catch {
          return undefined;
        }
      })()
    : Array.isArray(body.existingImages)
    ? body.existingImages
    : undefined;
  const replaceIndex =
    body.replaceIndex !== undefined && body.replaceIndex !== null && body.replaceIndex !== ""
      ? Number(body.replaceIndex)
      : undefined;
  const uploadedImages = getImagesFromRequest(req);

  let normalizedImages = uploadedImages.length > 0 ? uploadedImages : imagesFromBody;

  if (
    existingImages &&
    uploadedImages.length > 0 &&
    Number.isInteger(replaceIndex) &&
    replaceIndex! >= 0 &&
    replaceIndex! < existingImages.length
  ) {
    const mergedImages = [...existingImages];
    mergedImages[replaceIndex!] = uploadedImages[0];
    normalizedImages = mergedImages;
  }

  return {
    ...body,
    age: body.age !== undefined && body.age !== null && body.age !== "" ? Number(body.age) : undefined,
    images: normalizedImages,
  };
};

export const getAnimals = async (_req: Request, res: Response) => {
  try {
    const animals = await findAllAnimals();
    res.json(animals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener animales" });
  }
};

export const getAnimalById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const animal = await findAnimalById(id);

    if (!animal) {
      return res.status(404).json({ error: "Animal no encontrado" });
    }

    res.json(animal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener animal" });
  }
};

export const createAnimal = async (req: Request, res: Response) => {
  try {
    const payload = normalizeAnimalPayload(req);
    const newAnimal = await createNewAnimal(payload);
    res.status(201).json(newAnimal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear animal" });
  }
};

export const updateAnimal = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const payload = normalizeAnimalPayload(req);
    const updated = await updateExistingAnimal(id, payload);

    if (!updated) {
      return res.status(404).json({ error: "Animal no encontrado" });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar animal" });
  }
};

export const deleteAnimal = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteExistingAnimal(id);

    if (!deleted) {
      return res.status(404).json({ error: "Animal no encontrado" });
    }

    res.json({ message: "Animal eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar animal" });
  }
};
