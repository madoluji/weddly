import { spawn } from "node:child_process";

const defaultMb = process.env.BUILD_MAX_OLD_SPACE_MB ?? "3072";
const existingNodeOptions = process.env.NODE_OPTIONS?.trim() ?? "";
const maxOldSpaceFlag = `--max-old-space-size=${defaultMb}`;
const nodeOptions = existingNodeOptions.includes("--max-old-space-size=")
  ? existingNodeOptions
  : [existingNodeOptions, maxOldSpaceFlag].filter(Boolean).join(" ");

const child = spawn("/opt/homebrew/opt/node@22/bin/npm", ["run", "build:app"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_OPTIONS: nodeOptions,
    NEXT_TELEMETRY_DISABLED: "1",
  },
});

child.on("exit", (code, signal) => {
  if (typeof code === "number") {
    process.exit(code);
  }
  console.error(`build:app terminated with signal: ${signal}`);
  process.exit(1);
});
