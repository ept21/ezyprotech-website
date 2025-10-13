// src/lib/getHomeData.js
import { wp } from './wp'
import {
    Q_HOME_FIELDS,
    Q_POSTS_BY_CATEGORY,
    Q_HERO_SLIDES,
    Q_SERVICES,
    Q_PROJECTS,
    Q_TESTIMONIALS,
    Q_FAQ,
    Q_BADGES,
} from './queries-home'
import { sanitizeHtml, absolutizeCmsUrls } from './sanitize'
import { ensureCmsUrl } from './url'

/** === helpers === */
function pickImage(node) {
    const img = node?.featuredImage?.node
    if (!img) return { url: '', alt: '' }
    const url = img.mediaItemUrl || img.sourceUrl || ''
    return { url: ensureCmsUrl(url), alt: img.altText || node?.title || '' }
}
function mapPostNode(n) {
    const { url, alt } = pickImage(n)
    return {
        id: n.id,
        title: n.title || '',
        uri: n.uri || '#',
        image: url,
        alt,
        excerpt: n.excerpt ? sanitizeHtml(n.excerpt) : '',
        html: n.content ? absolutizeCmsUrls(sanitizeHtml(n.content)) : '',
    }
}
function mapFaqNode(n) {
    return {
        id: n.id,
        question: n.title || '',
        answerHtml: n.content ? absolutizeCmsUrls(sanitizeHtml(n.content)) : '',
        uri: n.uri || '#',
    }
}
async function safeQuery(query, variables) {
    try {
        const { data } = await wp.query({ query, variables, fetchPolicy: 'no-cache' })
        return data
    } catch (e) {
        console.error('[getHomeData] query failed:', e?.message || e)
        return null
    }
}
function firstVal(v) { return Array.isArray(v) ? v[0] : v }

/** === main === */
export async function getHomeData() {
    // 1) ACF fields (homepage)
    const dataFields = await safeQuery(Q_HOME_FIELDS, {})
    const fields = dataFields?.page?.homepage || {}

    // Sources
    const heroSource          = firstVal(fields.heroSource)
    const badgesSource        = firstVal(fields.badgesSource)
    const testimonialsSource  = firstVal(fields.socialproofSource)
    const faqSource           = firstVal(fields.faqSource)
    const mediaSource         = firstVal(fields.mediaSource)

    // Targets
    let heroSlides = []
    let badges = []
    let services = []
    let projects = []
    let news = []
    let testimonials = []
    let faq = []
    let media = []

    // 2) Services / Projects (CPT)
    if (fields?.servicesEnable) {
        const lim = fields.servicesLimit || 6
        const d = await safeQuery(Q_SERVICES, { limit: lim })
        services = (d?.services?.nodes || []).map(mapPostNode)
    }
    if (fields?.projectsEnable) {
        const lim = fields.projectsLimit || 3
        const d = await safeQuery(Q_PROJECTS, { limit: lim })
        projects = (d?.projects?.nodes || []).map(mapPostNode)
    }

    // 3) HERO
    if (fields?.heroEnable) {
        if (heroSource === 'posts_category' && fields.heroCategorySlug && fields.heroLimit) {
            const d = await safeQuery(Q_POSTS_BY_CATEGORY, {
                cat: fields.heroCategorySlug,
                limit: fields.heroLimit,
            })
            heroSlides = (d?.posts?.nodes || []).map(mapPostNode)
        } else if (heroSource === 'cpt') {
            const lim = fields.heroHeroLimit || fields.heroLimit || 5
            const d = await safeQuery(Q_HERO_SLIDES, { limit: lim })
            const fromCpt = (d?.heroSlides?.nodes || []).map(mapPostNode)
            if (fromCpt.length) {
                heroSlides = fromCpt
            } else {
                // fallback: קטגוריית פוסטים hero (אם קיימת)
                const slug = fields.heroCategorySlug || 'hero'
                const d2 = await safeQuery(Q_POSTS_BY_CATEGORY, { cat: slug, limit: lim })
                heroSlides = (d2?.posts?.nodes || []).map(mapPostNode)
            }
        } else if (heroSource === 'projects' && projects.length) {
            const lim = fields.heroProjectsLimit || 5
            heroSlides = projects.slice(0, lim)
        } else if (heroSource === 'services' && services.length) {
            const lim = fields.heroServicesLimit || 5
            heroSlides = services.slice(0, lim)
        } else if (fields.heroGalleryJson) {
            try {
                const arr = JSON.parse(fields.heroGalleryJson)
                heroSlides = Array.isArray(arr) ? arr.map(x => ({
                    id: x.id || x.url || Math.random().toString(36).slice(2),
                    title: x.title || '',
                    uri: x.uri || '#',
                    image: ensureCmsUrl(x.url || ''),
                    alt: x.alt || '',
                })) : []
            } catch {}
        }
    }

    // 4) BADGES
    if (fields?.badgesEnable) {
        if (badgesSource === 'posts_category' && fields.badgesCategorySlug && fields.badgesLimit) {
            const d = await safeQuery(Q_POSTS_BY_CATEGORY, { cat: fields.badgesCategorySlug, limit: fields.badgesLimit })
            badges = (d?.posts?.nodes || []).map(mapPostNode)
        } else if (badgesSource === 'cpt') {
            const lim = fields.badgesLimitCpt || fields.badgesLimit || 6
            const d = await safeQuery(Q_BADGES, { limit: lim })
            const fromCpt = (d?.badges?.nodes || []).map(mapPostNode)
            if (fromCpt.length) {
                badges = fromCpt
            } else {
                const slug = fields.badgesCategorySlug || 'badges'
                const d2 = await safeQuery(Q_POSTS_BY_CATEGORY, { cat: slug, limit: lim })
                badges = (d2?.posts?.nodes || []).map(mapPostNode)
            }
        } else if (fields.badgesJson) {
            try {
                const arr = JSON.parse(fields.badgesJson)
                badges = Array.isArray(arr) ? arr.map(x => ({
                    id: x.id || x.url || Math.random().toString(36).slice(2),
                    title: x.title || '',
                    uri: x.uri || '#',
                    image: ensureCmsUrl(x.url || ''),
                    alt: x.alt || '',
                })) : []
            } catch {}
        }
    }

    // 5) NEWS (פוסטים בקטגוריה)
    if (fields?.newsEnable && fields.newsCategorySlug) {
        const lim = fields.newsLimit || 4
        const d = await safeQuery(Q_POSTS_BY_CATEGORY, { cat: fields.newsCategorySlug, limit: lim })
        news = (d?.posts?.nodes || []).map(mapPostNode)
    }

    // 6) TESTIMONIALS
    if (fields?.socialproofEnable) {
        const lim = fields.socialproofLimit || 6
        const slug = fields.socialproofCategorySlug || 'testimonials'
        if (testimonialsSource === 'posts_category') {
            const d = await safeQuery(Q_POSTS_BY_CATEGORY, { cat: slug, limit: lim })
            testimonials = (d?.posts?.nodes || []).map(mapPostNode)
        } else {
            const d = await safeQuery(Q_TESTIMONIALS, { limit: lim })
            const fromCpt = (d?.testimonials?.nodes || []).map(mapPostNode)
            if (fromCpt.length) {
                testimonials = fromCpt
            } else {
                const d2 = await safeQuery(Q_POSTS_BY_CATEGORY, { cat: slug, limit: lim })
                testimonials = (d2?.posts?.nodes || []).map(mapPostNode)
            }
        }
    }

    // 7) FAQ  — CPT אם קיים, אחרת קטגוריה
    if (fields?.faqEnable) {
        const lim = fields.faqLimit || 6
        const slug = fields.faqCategorySlug || 'faq'
        if (faqSource === 'posts_category') {
            const d = await safeQuery(Q_POSTS_BY_CATEGORY, { cat: slug, limit: lim })
            faq = (d?.posts?.nodes || []).map(mapFaqNode)
        } else {
            const d = await safeQuery(Q_FAQ, { limit: lim })
            const fromCpt = (d?.faqs?.nodes || []).map(mapFaqNode) // אם אין faqs בסכמה, fromCpt יהיה []
            if (fromCpt.length) {
                faq = fromCpt
            } else {
                const d2 = await safeQuery(Q_POSTS_BY_CATEGORY, { cat: slug, limit: lim })
                faq = (d2?.posts?.nodes || []).map(mapFaqNode)
            }
        }
    }

    // 8) MEDIA (גלריה/פרויקטים/שירותים/JSON/קטגוריה)
    if (fields?.mediaEnable) {
        const lim = fields.mediaLimit || 8
        if (mediaSource === 'posts_category' && fields.mediaCategorySlug) {
            const d = await safeQuery(Q_POSTS_BY_CATEGORY, { cat: fields.mediaCategorySlug, limit: lim })
            media = (d?.posts?.nodes || []).map(mapPostNode)
        } else if (mediaSource === 'projects' && projects.length) {
            const x = fields.mediaLimitProjects || lim
            media = projects.slice(0, x)
        } else if (mediaSource === 'services' && services.length) {
            const x = fields.mediaLimitServices || lim
            media = services.slice(0, x)
        } else if (fields.mediaItemsJson) {
            try {
                const arr = JSON.parse(fields.mediaItemsJson)
                media = Array.isArray(arr) ? arr.map(x => ({
                    id: x.id || x.url || Math.random().toString(36).slice(2),
                    title: x.title || '',
                    uri: x.uri || '#',
                    image: ensureCmsUrl(x.url || ''),
                    alt: x.alt || '',
                })) : []
            } catch {}
        }
    }

    return { fields, heroSlides, badges, services, projects, news, testimonials, faq, media }
}
