import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const res = NextResponse.next();

    res.headers.set(
        "Content-Security-Policy",
        `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://vercel.live https://va.vercel-scripts.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://utfs.io https://vercel.live https://lh3.googleusercontent.com https://images.unsplash.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    frame-src 'self' https://challenges.cloudflare.com https://vercel.live;
    connect-src 'self' https://challenges.cloudflare.com https://vercel.live https://va.vercel-scripts.com https://uploadthing.com https://*.uploadthing.com https://utfs.io https://*.ingest.uploadthing.com;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, " ").trim()
    );

    return res;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};