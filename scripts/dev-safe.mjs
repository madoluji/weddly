import { existsSync } from "node:fs";
import { rm, readFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const freshRestart = process.argv.includes("--fresh");
const projectRoot = process.cwd();
const lockPath = path.join(projectRoot, ".next", "dev", "lock");
const devLogPath = path.join(projectRoot, ".next", "dev", "logs", "next-development.log");
const devMaxOldSpaceMb = process.env.DEV_MAX_OLD_SPACE_MB ?? "4096";
const existingNodeOptions = process.env.NODE_OPTIONS?.trim() ?? "";
const maxOldSpaceFlag = `--max-old-space-size=${devMaxOldSpaceMb}`;
const nodeOptions = existingNodeOptions.includes("--max-old-space-size=")
  ? existingNodeOptions
  : [existingNodeOptions, maxOldSpaceFlag].filter(Boolean).join(" ");
const nextCpuBudget = process.env.NEXT_BUILD_CPUS ?? "2";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isServerAlive(appUrl) {
  try {
    const response = await fetch(appUrl, {
      method: "GET",
      signal: AbortSignal.timeout(1200),
    });
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

async function checkExistingServer() {
  if (!existsSync(lockPath)) return false;

  try {
    const content = await readFile(lockPath, "utf8");
    const lock = JSON.parse(content);

    if (lock?.appUrl && (await isServerAlive(lock.appUrl))) {
      if (freshRestart && typeof lock?.pid === "number") {
        console.log(`Stopping existing Next dev server at ${lock.appUrl} (pid ${lock.pid})...`);
        try {
          process.kill(lock.pid, "SIGTERM");
        } catch {
          console.log("Could not send SIGTERM to existing process; continuing with cleanup.");
        }

        for (let attempt = 0; attempt < 12; attempt += 1) {
          if (!(await isServerAlive(lock.appUrl))) break;
          await sleep(250);
        }

        if (await isServerAlive(lock.appUrl)) {
          console.error("Existing dev server is still running. Stop it manually, then run npm run dev:restart again.");
          process.exit(1);
        }

        await rm(lockPath, { force: true });
        await rm(devLogPath, { force: true });
        console.log("Previous dev server stopped. Starting a fresh server.");
        return false;
      }

      console.log(`Next dev is already running at ${lock.appUrl} (pid ${lock.pid}).`);
      console.log("Reusing existing server. Stop it first if you want a fresh restart.");
      return true;
    }

    await rm(lockPath, { force: true });
    await rm(devLogPath, { force: true });
    console.log("Removed stale Next dev lock; starting a fresh server.");
    return false;
  } catch {
    await rm(lockPath, { force: true });
    await rm(devLogPath, { force: true });
    console.log("Recovered from unreadable Next dev lock; starting a fresh server.");
    return false;
  }
}

const alreadyRunning = await checkExistingServer();
if (alreadyRunning) process.exit(0);

const child = spawn("/opt/homebrew/opt/node@22/bin/npm", ["run", "dev:app"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_OPTIONS: nodeOptions,
    NEXT_BUILD_CPUS: nextCpuBudget,
    NEXT_TELEMETRY_DISABLED: "1",
  },
});

child.on("exit", (code, signal) => {
  if (typeof code === "number") {
    process.exit(code);
  }
  console.error(`dev:app terminated with signal: ${signal}`);
  process.exit(1);
});
