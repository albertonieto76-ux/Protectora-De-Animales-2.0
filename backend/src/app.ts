import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { router } from "./routes/index.js";
import { enforceCsrfForCookieAuth, getCorsOptions, setSecurityHeaders } from "./middleware/httpSecurity.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("trust proxy", 1);
app.use(setSecurityHeaders);
app.use(cors(getCorsOptions()));
app.use(express.json({ limit: "256kb" }));
app.use(cookieParser());
app.use(enforceCsrfForCookieAuth);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/seed-assets", express.static(path.join(__dirname, "../test-assets")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", router);

export default app;
