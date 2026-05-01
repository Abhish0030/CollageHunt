const { spawnSync } = require("node:child_process");

const run = (args) => {
  const result = spawnSync("npm", args, {
    stdio: "inherit",
    shell: true,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

if (process.env.NETLIFY) {
  run(["run", "build:frontend"]);
  process.exit(0);
}

run(["run", "build:backend"]);
run(["run", "build:frontend"]);
