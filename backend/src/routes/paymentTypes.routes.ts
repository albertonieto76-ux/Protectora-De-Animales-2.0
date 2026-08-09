import { Router } from "express";
import { adminAuth } from "../admin/middleware/adminAuth.js";
import { auditCriticalAction } from "../middleware/criticalActionAudit.js";
import {
  createPaymentTypeController,
  deletePaymentTypeController,
  getPaymentTypes,
  updatePaymentTypeController,
} from "../controllers/paymentTypes.controller.js";

const router = Router();

router.get("/", getPaymentTypes);
router.post("/", adminAuth, auditCriticalAction("PAYMENT_TYPE_CREATE"), createPaymentTypeController);
router.put("/:id", adminAuth, auditCriticalAction("PAYMENT_TYPE_UPDATE"), updatePaymentTypeController);
router.delete("/:id", adminAuth, auditCriticalAction("PAYMENT_TYPE_DELETE"), deletePaymentTypeController);

export default router;
