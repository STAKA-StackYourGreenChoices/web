import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Emits .next/standalone/server.js with a minimal node_modules.
  // NOTE: public/ and .next/static are NOT copied automatically — the
  // Dockerfile copies them explicitly.
  output: "standalone",
  // This directory contains a pnpm-workspace.yaml, so Next would otherwise
  // infer a workspace root. Pin the tracing root to keep tracing deterministic.
  outputFileTracingRoot: path.join(__dirname),
  poweredByHeader: false,
  // Traefik handles compression at the edge.
  compress: false,
};

export default nextConfig;
