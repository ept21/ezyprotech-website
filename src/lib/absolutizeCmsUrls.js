// src/lib/absolutizeCmsUrls.js
// Makes image/link URLs from WP absolute to the CMS host, including srcset urls.
// Uses NEXT_PUBLIC_CMS_URL and keeps http(s) intact.

const CMS = process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/+$/, '') || ''

function absolutizeOne(url) {
    if (!url) return url
    if (/^https?:\/\//i.test(url)) return url
    // handle //host paths
    if (/^\/\//.test(url)) return `https:${url}`
    // handle relative /wp-content and other site-relative paths
    if (url.startsWith('/')) return `${CMS}${url}`
    return url
}

export function absolutizeCmsUrls(html) {
    if (!html || !CMS) return html || ''
    let out = html

    // src / href
    out = out.replace(
        /\s(src|href)\s*=\s*("(.*?)"|'(.*?)')/gi,
        (m, attr, q, u1, u2) => {
            const raw = u1 ?? u2 ?? ''
            const abs = absolutizeOne(raw)
            const quote = q?.startsWith('"') ? '"' : "'"
            return ` ${attr}=${quote}${abs}${quote}`
        }
    )

    // srcset (comma-separated)
    out = out.replace(
        /\ssrcset\s*=\s*("(.*?)"|'(.*?)')/gi,
        (m, q, v1, v2) => {
            const val = v1 ?? v2 ?? ''
            const parts = val.split(',').map(s => {
                const [url, w] = s.trim().split(/\s+/)
                const abs = absolutizeOne(url)
                return w ? `${abs} ${w}` : abs
            })
            const quote = q?.startsWith('"') ? '"' : "'"
            return ` srcset=${quote}${parts.join(', ')}${quote}`
        }
    )

    return out
}
