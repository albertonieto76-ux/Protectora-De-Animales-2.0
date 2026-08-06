import { Router } from "express";
import { getDashboardStats } from "../controllers/admin.controller.js";
import { adminAuth } from "../admin/middleware/adminAuth.js";

const adminRouter = Router();

adminRouter.use(adminAuth);
adminRouter.get("/dashboard", getDashboardStats);

export default adminRouter;
