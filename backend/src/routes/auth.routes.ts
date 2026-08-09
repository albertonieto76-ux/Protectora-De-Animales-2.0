import { Router } from "express";
import {
	disableAdminMfa,
	enableAdminMfa,
	loginAdmin,
	logoutAdmin,
	meAdmin,
	regenerateAdminRecoveryCodes,
	setupAdminMfa,
	verifyAdminMfa,
} from "../controllers/auth.controller.js";
import { loginRateLimit } from "../middleware/authRateLimit.js";
import { adminAuth } from "../admin/middleware/adminAuth.js";

const authRouter = Router();

authRouter.post("/login", loginRateLimit, loginAdmin);
authRouter.post("/mfa/verify", loginRateLimit, verifyAdminMfa);
authRouter.post("/logout", logoutAdmin);
authRouter.get("/me", meAdmin);
authRouter.get("/mfa/setup", adminAuth, setupAdminMfa);
authRouter.post("/mfa/enable", adminAuth, enableAdminMfa);
authRouter.post("/mfa/disable", adminAuth, disableAdminMfa);
authRouter.post("/mfa/recovery/regenerate", adminAuth, regenerateAdminRecoveryCodes);

export default authRouter;
