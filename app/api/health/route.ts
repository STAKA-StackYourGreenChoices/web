// Hit by the container HEALTHCHECK, Traefik, and post-deploy smoke tests.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    status: "ok",
    sha: process.env.GIT_SHA ?? "dev",
    env: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
  });
}
