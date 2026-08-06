import { Router } from "express";
import {
  createAdoptionController,
  deleteAdoptionController,
  getAdoption,
  getAdoptions,
  updateAdoptionController,
} from "../controllers/adoption.controller.js";

const router = Router();

router.get("/", getAdoptions);
router.get("/:id", getAdoption);
router.post("/", createAdoptionController);
router.put("/:id", updateAdoptionController);
router.delete("/:id", deleteAdoptionController);

export default router;
