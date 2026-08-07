import { Router } from "express";
import { registerAdmin } from "../controllers/register.controller.js";

const registerRouter = Router();

registerRouter.post("/admin", registerAdmin);

export default registerRouter;
