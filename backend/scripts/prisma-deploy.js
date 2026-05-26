const { spawnSync } = require("child_process");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const projectRoot = path.resolve(__dirname, "..");
const env = {
  ...process.env,
  DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL,
};

if (!env.DATABASE_URL) {
  console.error("DATABASE_URL is required before running prisma migrate deploy.");
  process.exit(1);
}

if (!env.DIRECT_URL) {
  console.error("DIRECT_URL or DATABASE_URL is required before running prisma migrate deploy.");
  process.exit(1);
}

const result =
  process.platform === "win32"
    ? spawnSync("cmd.exe", ["/c", "prisma", "migrate", "deploy"], {
        cwd: projectRoot,
        stdio: "inherit",
        env,
      })
    : spawnSync("prisma", ["migrate", "deploy"], {
        cwd: projectRoot,
        stdio: "inherit",
        env,
      });

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
