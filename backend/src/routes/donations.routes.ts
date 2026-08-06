import { Router } from "express";
import {
  createDonation,
  deleteDonationController,
  getDonationById,
  getDonations,
  updateDonationController,
} from "../controllers/donations.controller.js";

const router = Router();

router.get("/", getDonations);
router.get("/:id", getDonationById);
router.post("/", createDonation);
router.put("/:id", updateDonationController);
router.delete("/:id", deleteDonationController);

export default router;
