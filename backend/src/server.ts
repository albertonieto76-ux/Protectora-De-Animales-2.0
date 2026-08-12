import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${port}`);
}).on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`El puerto ${port} ya está en uso. Si ya tienes otra instancia arrancada, deténla o cambia PORT en el archivo .env.`);
  } else {
    console.error("No se pudo iniciar el servidor:", error);
  }
  process.exit(1);
});
