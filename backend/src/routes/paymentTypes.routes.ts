import { Router } from "express";
import {
  createPaymentTypeController,
  deletePaymentTypeController,
  getPaymentTypes,
  updatePaymentTypeController,
} from "../controllers/paymentTypes.controller.js";

const router = Router();

router.get("/", getPaymentTypes);
router.post("/", createPaymentTypeController);
router.put("/:id", updatePaymentTypeController);
router.delete("/:id", deletePaymentTypeController);

export default router;
