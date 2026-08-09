import { Router } from "express";
import { adminAuth } from "../admin/middleware/adminAuth.js";
import { auditCriticalAction } from "../middleware/criticalActionAudit.js";
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
router.put("/:id", adminAuth, auditCriticalAction("ADOPTION_UPDATE"), updateAdoptionController);
router.delete("/:id", adminAuth, auditCriticalAction("ADOPTION_DELETE"), deleteAdoptionController);

export default router;
