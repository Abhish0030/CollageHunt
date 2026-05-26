const { spawnSync } = require("child_process");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const projectRoot = path.resolve(__dirname, "..");
const nodeBin = process.execPath;
const deployScript = path.join(projectRoot, "scripts", "prisma-deploy.js");
const entryFile = path.join(projectRoot, "dist", "src", "index.js");

const deploy = spawnSync(nodeBin, [deployScript], {
  cwd: projectRoot,
  stdio: "inherit",
  env: process.env,
});

if (deploy.error) {
  console.error(deploy.error);
  process.exit(1);
}

if (deploy.status !== 0) {
  process.exit(deploy.status ?? 1);
}

const app = spawnSync(nodeBin, [entryFile], {
  cwd: projectRoot,
  stdio: "inherit",
  env: process.env,
});

if (app.error) {
  console.error(app.error);
  process.exit(1);
}

process.exit(app.status ?? 0);
