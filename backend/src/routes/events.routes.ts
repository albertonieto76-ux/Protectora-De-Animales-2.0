import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent,
} from "../controllers/events.controller.js";
import { uploadImages } from "../middleware/upload.js";
import { adminAuth } from "../admin/middleware/adminAuth.js";
import { auditCriticalAction } from "../middleware/criticalActionAudit.js";

const router = Router();

router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", adminAuth, auditCriticalAction("EVENT_CREATE"), uploadImages, createEvent);
router.put("/:id", adminAuth, auditCriticalAction("EVENT_UPDATE"), uploadImages, updateEvent);
router.delete("/:id", adminAuth, auditCriticalAction("EVENT_DELETE"), deleteEvent);

export default router;
