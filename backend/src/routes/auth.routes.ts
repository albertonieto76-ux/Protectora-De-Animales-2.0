import { Router } from "express";
import { loginAdmin, logoutAdmin, meAdmin } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/login", loginAdmin);
authRouter.post("/logout", logoutAdmin);
authRouter.get("/me", meAdmin);

export default authRouter;
