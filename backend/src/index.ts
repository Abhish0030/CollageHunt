import { prisma } from "./lib/prisma";
import { auth0Enabled, getAuth0CallbackUrl } from "./lib/auth0";
import app from "./app";

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST?.trim() || "0.0.0.0";

const server = app.listen(port, host, () => {
  console.log(`CollageHunt backend running on http://${host}:${port}`);
  if (auth0Enabled()) {
    console.log(`Auth0 callback URL: ${getAuth0CallbackUrl()}`);
  }
});

const shutdown = async (signal: string) => {
  console.log(`${signal} received, shutting down CollageHunt backend...`);

  server.close(async (error) => {
    if (error) {
      console.error("HTTP server shutdown failed", error);
      process.exit(1);
    }

    try {
      await prisma.$disconnect();
      process.exit(0);
    } catch (disconnectError) {
      console.error("Prisma disconnect failed", disconnectError);
      process.exit(1);
    }
  });
};

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void shutdown(signal);
  });
}
