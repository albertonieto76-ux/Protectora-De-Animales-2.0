import { Router } from "express";
import animalsRoutes from "./animals.routes.js";
import adoptionRoutes from "./adoption.routes.js";
import volunteersRoutes from "./volunteers.routes.js";
import eventsRoutes from "./events.routes.js";
import donationsRoutes from "./donations.routes.js";
import adminRoutes from "./admin.routes.js";
import paymentTypesRoutes from "./paymentTypes.routes.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "API ready" });
});

router.use("/animals", animalsRoutes);
router.use("/adoptions", adoptionRoutes);
router.use("/volunteers", volunteersRoutes);
router.use("/events", eventsRoutes);
router.use("/donations", donationsRoutes);
router.use("/payment-types", paymentTypesRoutes);
router.use("/admin", adminRoutes);

export { router };
