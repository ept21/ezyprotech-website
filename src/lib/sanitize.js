// src/lib/sanitize.js
import sanitize from 'sanitize-html'

const allowedTags = [
    'a','p','br','strong','b','em','i','u','span','div','blockquote','code','pre',
    'ul','ol','li','h1','h2','h3','h4','h5','h6','img','figure','figcaption','picture','source',
    'table','thead','tbody','tr','th','td','hr'
]

const allowedAttributes = {
    a: ['href','title','target','rel','class','id'],
    img: ['src','alt','width','height','loading','decoding','srcset','sizes'],
    source: ['srcset','type','sizes','media'],
    '*': ['class','id','style']
}

export function sanitizeHtml(html) {
    if (!html) return ''
    return sanitize(html, {
        allowedTags,
        allowedAttributes,
        allowedSchemes: ['http', 'https', 'mailto', 'tel', 'data'],
        allowProtocolRelative: false,
        transformTags: {
            a: (tagName, attribs) => {
                const a = { ...attribs }
                const href = (a.href || '').trim().toLowerCase()
                if (href.startsWith('javascript:')) a.href = '#'
                if (a.target === '_blank') {
                    a.rel = a.rel ? `${a.rel} noopener noreferrer` : 'noopener noreferrer'
                }
                return { tagName: 'a', attribs: a }
            },
            img: (tagName, attribs) => {
                const img = { ...attribs }
                if (!img.loading)  img.loading = 'lazy'
                if (!img.decoding) img.decoding = 'async'
                return { tagName: 'img', attribs: img }
            }
        }
    })
}

/**
 * 1) ממיר href/src יחסיים → מוחלטים
 * 2) מחליף כתובות מוחלטות עם host לא נכון (למשל http://localhost:3000/wp-content/...)
 *    ל־CMS_BASE + path (ל־/wp-content ו־/wp-includes)
 * 3) מטפל גם ב-srcset
 */
export function absolutizeCmsUrls(html, cmsBase = process.env.NEXT_PUBLIC_CMS_URL || '') {
    if (!html || !cmsBase) return html
    const BASE = cmsBase.replace(/\/+$/, '')
    let out = html

    // --- יחסיים → מוחלטים ---
    out = out
        .replace(/\s(href|src)\s*=\s*"\/([^"]*)"/gi, (_m, attr, path) => ` ${attr}="${BASE}/${path}"`)
        .replace(/\s(href|src)\s*=\s*'\/([^']*)'/gi, (_m, attr, path) => ` ${attr}='${BASE}/${path}'`)

    // --- מוחלטים עם host שגוי אבל path של WordPress → תקן ל-CMS ---
    // דוגמה: http://localhost:3000/wp-content/...  → https://cms.ezyprotech.com/wp-content/...
    const wpPath = /(\/wp-content\/[^"']+|\/wp-includes\/[^"']+)/i
    out = out
        .replace(/\s(href|src)\s*=\s*"https?:\/\/[^"']+?((?:\/wp-content\/|\/wp-includes\/)[^"]+)"/gi,
            (_m, attr, path) => ` ${attr}="${BASE}${path}"`)
        .replace(/\s(href|src)\s*=\s*'https?:\/\/[^"']+?((?:\/wp-content\/|\/wp-includes\/)[^']+)'/gi,
            (_m, attr, path) => ` ${attr}='${BASE}${path}'`)

    // --- srcset (רשימת URLs) ---
    const fixSrcset = (list) => list.split(',').map(part => {
        const seg = part.trim()
        const [url, descriptor] = seg.split(/\s+/, 2)
        if (!url) return seg
        let newUrl = url
        // יחסיים
        if (url.startsWith('/')) newUrl = `${BASE}${url}`
        // מוחלטים עם host שגוי אבל path של WP
        else {
            const m = url.match(/https?:\/\/[^/]+(\/wp-(?:content|includes)\/.+)$/i)
            if (m && m[1]) newUrl = `${BASE}${m[1]}`
        }
        return `${newUrl} ${descriptor || ''}`.trim()
    }).join(', ')

    out = out
        .replace(/\ssrcset\s*=\s*"([^"]+)"/gi, (_m, list) => ` srcset="${fixSrcset(list)}"`)
        .replace(/\ssrcset\s*=\s*'([^']+)'/gi, (_m, list) => ` srcset='${fixSrcset(list)}'`)

    return out
}
