import { Router } from "express";
import { uploadImages } from "../middleware/upload.js";
import { adminAuth } from "../admin/middleware/adminAuth.js";
import { auditCriticalAction } from "../middleware/criticalActionAudit.js";
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
router.post("/", adminAuth, auditCriticalAction("ANIMAL_CREATE"), uploadImages, createAnimal);
router.put("/:id", adminAuth, auditCriticalAction("ANIMAL_UPDATE"), uploadImages, updateAnimal);
router.delete("/:id", adminAuth, auditCriticalAction("ANIMAL_DELETE"), deleteAnimal);

export default router;
