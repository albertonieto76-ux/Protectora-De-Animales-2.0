import { Router } from "express";
import { exportDatabaseBackup, getDashboardStats, getSecurityAuditLogs, importDatabaseBackup } from "../controllers/admin.controller.js";
import { adminAuth } from "../admin/middleware/adminAuth.js";

const adminRouter = Router();

adminRouter.use(adminAuth);
adminRouter.get("/dashboard", getDashboardStats);
adminRouter.get("/security-audit", getSecurityAuditLogs);
adminRouter.get("/backup/export", exportDatabaseBackup);
adminRouter.post("/backup/import", importDatabaseBackup);

export default adminRouter;
