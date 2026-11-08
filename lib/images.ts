/**
 * The catalog illustrations (public/catalog-images) are served by this web
 * app, but product records store them as absolute URLs such as
 * http://localhost:3000/catalog-images/tee.svg. Rendering them as a relative
 * path makes them load from whatever address the app is opened at (localhost,
 * an ngrok tunnel, production). Other image URLs are left untouched.
 */
export function imageSrc(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const { pathname } = new URL(url);
    if (pathname.startsWith("/catalog-images/")) return pathname;
  } catch {
    return url.startsWith("/") ? url : undefined;
  }
  return url;
}
