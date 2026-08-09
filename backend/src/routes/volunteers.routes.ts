import { Router } from "express";
import { adminAuth } from "../admin/middleware/adminAuth.js";
import { auditCriticalAction } from "../middleware/criticalActionAudit.js";
import {
  createVolunteerAppointmentEntry,
  createVolunteer,
  deleteVolunteerAppointmentEntry,
  deleteVolunteer,
  getVolunteerById,
  getVolunteerAppointments,
  getVolunteers,
  updateVolunteerAppointmentEntry,
  updateVolunteer,
} from "../controllers/volunteers.controller.js";

const router = Router();

router.get("/appointments", getVolunteerAppointments);
router.post("/appointments", createVolunteerAppointmentEntry);
router.put("/appointments/:appointmentId", adminAuth, auditCriticalAction("VOLUNTEER_APPOINTMENT_UPDATE"), updateVolunteerAppointmentEntry);
router.delete("/appointments/:appointmentId", adminAuth, auditCriticalAction("VOLUNTEER_APPOINTMENT_DELETE"), deleteVolunteerAppointmentEntry);
router.get("/", getVolunteers);
router.get("/:id", getVolunteerById);
router.post("/", createVolunteer);
router.put("/:id", adminAuth, auditCriticalAction("VOLUNTEER_UPDATE"), updateVolunteer);
router.delete("/:id", adminAuth, auditCriticalAction("VOLUNTEER_DELETE"), deleteVolunteer);

export default router;
