import net from "node:net";

const DEFAULT_PORT = 4000;

export const resolvePort = async (preferredPort?: string | number): Promise<number> => {
  const initialPort = Number(preferredPort ?? process.env.PORT ?? DEFAULT_PORT);

  if (!Number.isInteger(initialPort) || initialPort <= 0) {
    return DEFAULT_PORT;
  }

  const candidate = await findAvailablePort(initialPort);
  return candidate;
};

const findAvailablePort = (startPort: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const tryPort = (port: number) => {
      const server = net.createServer();
      server.once("error", (error: NodeJS.ErrnoException) => {
        if (error.code === "EADDRINUSE") {
          tryPort(port + 1);
          return;
        }

        reject(error);
      });

      server.once("listening", () => {
        server.close(() => resolve(port));
      });

      server.listen(port);
    };

    tryPort(startPort);
  });
};
