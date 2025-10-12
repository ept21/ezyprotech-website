// src/lib/url.js
export function ensureCmsUrl(url, base = process.env.NEXT_PUBLIC_CMS_URL || '') {
    if (!url) return null
    if (/^https?:\/\//i.test(url)) return url
    const root = base.replace(/\/+$/, '')
    if (url.startsWith('/')) return `${root}${url}`
    return `${root}/${url}`
}
