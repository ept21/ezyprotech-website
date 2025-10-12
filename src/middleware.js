// src/middleware.js
import { NextResponse } from 'next/server'

export function middleware(req) {
    const res = NextResponse.next()

    const isDev = process.env.NODE_ENV !== 'production'
    if (isDev) {
        // בפיתוח - אל תגדיר CSP כדי לא לשבור HMR/Dev Overlay
        return res
    }

    // ייצור: CSP שמאפשר GA ותמונות מה־CMS
    const csp = [
        "default-src 'self'",
        "script-src 'self' https://www.googletagmanager.com",
        "img-src 'self' https://cms.ezyprotech.com data:",
        "style-src 'self' 'unsafe-inline'",
        "connect-src 'self' https://cms.ezyprotech.com https://www.google-analytics.com",
        "frame-ancestors 'none'"
    ].join('; ')

    res.headers.set('Content-Security-Policy', csp)
    return res
}
