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
  // Development only: lets the dev server accept live-reload and asset
  // requests when the app is opened through an ngrok tunnel.
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok-free.dev", "*.ngrok.app", "*.ngrok.io"],
  // Traefik handles compression at the edge.
  compress: false,
  experimental: {
    serverActions: {
      // Receipts are capped at 5 MB and CSVs at 2 MB by the API; leave room
      // for multipart overhead.
      bodySizeLimit: "5.5mb",
    },
  },
};

export default nextConfig;
