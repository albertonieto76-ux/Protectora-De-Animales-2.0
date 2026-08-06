import type { Request, Response } from "express";
import {
  createNewAnimal,
  deleteExistingAnimal,
  findAllAnimals,
  findAnimalById,
  updateExistingAnimal,
} from "../services/animals.service.js";

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
    const newAnimal = await createNewAnimal(req.body);
    res.status(201).json(newAnimal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear animal" });
  }
};

export const updateAnimal = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = await updateExistingAnimal(id, req.body);

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
