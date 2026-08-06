import { Router } from "express";
import {
  createVolunteer,
  deleteVolunteer,
  getVolunteerById,
  getVolunteers,
  updateVolunteer,
} from "../controllers/volunteers.controller.js";

const router = Router();

router.get("/", getVolunteers);
router.get("/:id", getVolunteerById);
router.post("/", createVolunteer);
router.put("/:id", updateVolunteer);
router.delete("/:id", deleteVolunteer);

export default router;
