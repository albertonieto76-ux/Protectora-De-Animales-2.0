import { Router } from "express";
import { getDashboardStats, getSecurityAuditLogs } from "../controllers/admin.controller.js";
import { adminAuth } from "../admin/middleware/adminAuth.js";

const adminRouter = Router();

adminRouter.use(adminAuth);
adminRouter.get("/dashboard", getDashboardStats);
adminRouter.get("/security-audit", getSecurityAuditLogs);

export default adminRouter;
