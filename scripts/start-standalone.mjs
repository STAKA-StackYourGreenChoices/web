/**
 * Runs the standalone server the way the Docker image does.
 *
 * `next start` does not work with output:'standalone', and the standalone
 * bundle does NOT include public/ or .next/static — Next expects you to copy
 * them yourself. Doing it here means local Playwright runs exercise exactly the
 * same server that ships in the container.
 */
import { cpSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";

const root = ".next/standalone";

if (!existsSync(`${root}/server.js`)) {
  console.error("No standalone build found — run `pnpm build` first.");
  process.exit(1);
}

if (existsSync("public")) cpSync("public", `${root}/public`, { recursive: true });
cpSync(".next/static", `${root}/.next/static`, { recursive: true });

spawn("node", [`${root}/server.js`], {
  stdio: "inherit",
  env: { ...process.env, HOSTNAME: process.env.HOSTNAME ?? "127.0.0.1" },
}).on("exit", (code) => process.exit(code ?? 0));
