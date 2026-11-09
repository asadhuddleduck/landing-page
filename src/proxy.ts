import { NextResponse, type NextRequest } from "next/server";

// One app, two sites. asadshah.co.uk serves the MR. ASAD consultation page at
// "/" (and its terms at "/privacy"); huddleduck.co.uk keeps everything else.
// Deployment URLs (*.vercel.app) and localhost are left untouched for testing.
const ASAD_APEX = "asadshah.co.uk";
const ASAD_ORIGIN = `https://${ASAD_APEX}`;
const HUDDLE_ORIGIN = "https://huddleduck.co.uk";
const HUDDLE_HOSTS = new Set(["huddleduck.co.uk", "www.huddleduck.co.uk", "start.huddleduck.co.uk"]);

// Paths that asadshah.co.uk passes straight through: its API, Next assets,
// MR. ASAD brand files, the page's OG image and the consultation route files.
const ASAD_PASSTHROUGH = /^\/(api\/consultation(\/|$)|_next\/|fonts\/mr-asad\/|brand\/mr-asad\/|asad-shah\.jpg$|talk-to-asad\/opengraph-image|logos\/|brand\/clients\/)/;

export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase().split(":")[0];
  const { pathname, search } = request.nextUrl;

  if (host === `www.${ASAD_APEX}`) {
    return NextResponse.redirect(`${ASAD_ORIGIN}${pathname}${search}`, 308);
  }

  if (host === ASAD_APEX) {
    if (pathname === "/") return NextResponse.rewrite(new URL(`/talk-to-asad${search}`, request.url));
    if (pathname === "/privacy") return NextResponse.rewrite(new URL("/talk-to-asad/privacy", request.url));
    if (pathname === "/favicon.ico") return NextResponse.rewrite(new URL("/brand/mr-asad/icon.png", request.url));
    if (pathname === "/robots.txt" || pathname === "/sitemap.xml") return NextResponse.next();
    if (pathname === "/talk-to-asad") return NextResponse.redirect(`${ASAD_ORIGIN}/${search}`, 308);
    if (pathname === "/talk-to-asad/privacy") return NextResponse.redirect(`${ASAD_ORIGIN}/privacy`, 308);
    if (ASAD_PASSTHROUGH.test(pathname) || /\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next();
    // Anything else belongs to Huddle Duck.
    return NextResponse.redirect(`${HUDDLE_ORIGIN}${pathname}${search}`, 308);
  }

  if (HUDDLE_HOSTS.has(host)) {
    // The consultation moved to asadshah.co.uk on 9 November 2026. Browsers keep
    // the #booking= fragment across this redirect, so private links still work.
    if (pathname === "/talk-to-asad") return NextResponse.redirect(`${ASAD_ORIGIN}/${search}`, 308);
    if (pathname === "/talk-to-asad/privacy") return NextResponse.redirect(`${ASAD_ORIGIN}/privacy`, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
