import { Router } from "express";
import { adminAuth } from "../admin/middleware/adminAuth.js";
import { auditCriticalAction } from "../middleware/criticalActionAudit.js";
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
router.put("/:id", adminAuth, auditCriticalAction("DONATION_UPDATE"), updateDonationController);
router.delete("/:id", adminAuth, auditCriticalAction("DONATION_DELETE"), deleteDonationController);

export default router;
