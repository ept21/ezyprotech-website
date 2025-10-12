// src/lib/url.js
// Robust helpers for URL normalization relative to the WP CMS.

const CMS = process.env.NEXT_PUBLIC_CMS_URL
    ? process.env.NEXT_PUBLIC_CMS_URL.replace(/\/+$/, '')
    : ''

export function ensureCmsUrl(input) {
    if (!input) return ''
    const url = String(input).trim()

    // absolute http(s)
    if (/^https?:\/\//i.test(url)) return url

    // protocol-relative //host
    if (url.startsWith('//')) return `https:${url}`

    // site-root absolute (/wp-content/...)
    if (url.startsWith('/')) return CMS ? `${CMS}${url}` : url

    // wp-content relative (no leading slash)
    if (/^wp-content\//i.test(url)) return CMS ? `${CMS}/${url}` : `/${url}`

    // otherwise, return as-is
    return url
}

// In case you used default import somewhere:
// export default ensureCmsUrl;
// (We keep named export per your current imports)
