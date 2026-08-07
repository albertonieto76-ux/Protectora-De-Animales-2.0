import { Router } from "express";
import { uploadImages } from "../middleware/upload.js";
import {
  createAnimal,
  deleteAnimal,
  getAnimalById,
  getAnimals,
  updateAnimal,
} from "../controllers/animals.controller.js";

const router = Router();

router.get("/", getAnimals);
router.get("/:id", getAnimalById);
router.post("/", uploadImages, createAnimal);
router.put("/:id", uploadImages, updateAnimal);
router.delete("/:id", deleteAnimal);

export default router;
