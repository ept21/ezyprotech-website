// src/lib/getHomeData.js
import { wp } from './wp'
import {
    Q_HOME_FIELDS,
    Q_HERO_SLIDES,
    Q_POSTS_BY_CATEGORY,
    Q_SERVICES,
    Q_PROJECTS,
    Q_TESTIMONIALS,
    Q_FAQ,
} from './queries-home'
import { absolutizeCmsUrls } from './absolutizeCmsUrls'
import sanitizeHtml from './sanitize' // עדכן נתיב אם שונה
import { ensureCmsUrl } from './url'       // עדכן נתיב אם שונה

// אם דף הבית שלך הוא ב-URI אחר (למשל "/home/"), עדכן כאן:
const HOME_URI = "/"

export async function getHomeData() {
    // 1) הבא שדות דף הבית
    const { data } = await wp.query({
        query: Q_HOME_FIELDS,
        variables: { uri: HOME_URI },
        fetchPolicy: 'no-cache',
    })
    const page = data?.page || null
    const f = page?.homepage || {}

    // 2) דיפולטים בטוחים
    const heroLimit            = Number(f.heroLimit ?? 5) || 5
    const heroCategory         = f.heroCategorySlug || null
    const badgesLimit          = Number(f.badgesLimit ?? 6) || 6
    const badgesCategory       = f.badgesCategorySlug || null
    const servicesLimit        = Number(f.servicesLimit ?? 6) || 6
    const projectsLimit        = Number(f.projectsLimit ?? 3) || 3
    const newsLimit            = Number(f.newsLimit ?? 4) || 4
    const newsCategory         = f.newsCategorySlug || null
    const testimonialsLimit    = Number(f.socialproofLimit ?? 6) || 6
    const testimonialsCategory = f.socialproofCategorySlug || null
    const faqLimit             = Number(f.faqLimit ?? 6) || 6
    const faqCategory          = f.faqCategorySlug || null
    const mediaLimit           = Number(f.mediaLimit ?? 8) || 8
    const mediaCategory        = f.mediaCategorySlug || null

    // 3) תוצאות (נאתחל ריקות)
    const heroSlides   = []
    const badges       = []
    const services     = []
    const projects     = []
    const news         = []
    const testimonials = []
    const faq          = []
    const media        = []

    // 4) HERO – מריצים רק אם heroEnable true
    if (f.heroEnable) {
        const { data: h } = await wp.query({
            query: Q_HERO_SLIDES,
            variables: { cat: heroCategory || null, limit: heroLimit },
            fetchPolicy: 'no-cache',
        })
        const nodes = h?.posts?.nodes || []
        for (const n of nodes) {
            const img = n?.featuredImage?.node || {}
            heroSlides.push({
                id: n.id,
                title: n.title,
                uri: n.uri,
                image: ensureCmsUrl(img.mediaItemUrl || img.sourceUrl || ''),
                alt: img.altText || '',
            })
        }
    }

    // 5) BADGES – אם badgesEnable true
    if (f.badgesEnable) {
        const { data: b } = await wp.query({
            query: Q_POSTS_BY_CATEGORY,
            variables: { cat: badgesCategory || null, limit: badgesLimit },
            fetchPolicy: 'no-cache',
        })
        const nodes = b?.posts?.nodes || []
        for (const n of nodes) {
            const img = n?.featuredImage?.node || {}
            badges.push({
                id: n.id,
                title: n.title,
                uri: n.uri,
                image: ensureCmsUrl(img.mediaItemUrl || img.sourceUrl || ''),
                alt: img.altText || '',
            })
        }
    }

    // 6) SERVICES – אם servicesEnable true
    if (f.servicesEnable) {
        const { data: s } = await wp.query({
            query: Q_SERVICES,
            variables: { limit: servicesLimit },
            fetchPolicy: 'no-cache',
        })
        const nodes = s?.services?.nodes || []
        for (const n of nodes) {
            const img = n?.featuredImage?.node || {}
            services.push({
                id: n.id,
                title: n.title,
                uri: n.uri,
                image: ensureCmsUrl(img.mediaItemUrl || img.sourceUrl || ''),
                alt: img.altText || '',
            })
        }
    }

    // 7) PROJECTS – אם projectsEnable true
    if (f.projectsEnable) {
        const { data: p } = await wp.query({
            query: Q_PROJECTS,
            variables: { limit: projectsLimit },
            fetchPolicy: 'no-cache',
        })
        const nodes = p?.projects?.nodes || []
        for (const n of nodes) {
            const img = n?.featuredImage?.node || {}
            projects.push({
                id: n.id,
                title: n.title,
                uri: n.uri,
                image: ensureCmsUrl(img.mediaItemUrl || img.sourceUrl || ''),
                alt: img.altText || '',
            })
        }
    }

    // 8) NEWS – אם newsEnable true
    if (f.newsEnable) {
        const { data: nw } = await wp.query({
            query: Q_POSTS_BY_CATEGORY,
            variables: { cat: newsCategory || null, limit: newsLimit },
            fetchPolicy: 'no-cache',
        })
        const nodes = nw?.posts?.nodes || []
        for (const n of nodes) {
            const img = n?.featuredImage?.node || {}
            news.push({
                id: n.id,
                title: n.title,
                uri: n.uri,
                image: ensureCmsUrl(img.mediaItemUrl || img.sourceUrl || ''),
                alt: img.altText || '',
                excerpt: absolutizeCmsUrls(sanitizeHtml(n.excerpt || '')),
            })
        }
    }

    // 9) TESTIMONIALS – אם socialproofEnable true
    if (f.socialproofEnable) {
        const { data: t } = await wp.query({
            query: Q_TESTIMONIALS,
            variables: { cat: testimonialsCategory || null, limit: testimonialsLimit },
            fetchPolicy: 'no-cache',
        })
        const nodes = t?.posts?.nodes || []
        for (const n of nodes) {
            const img = n?.featuredImage?.node || {}
            testimonials.push({
                id: n.id,
                title: n.title,
                html: absolutizeCmsUrls(sanitizeHtml(n.content || '')),
                image: ensureCmsUrl(img.mediaItemUrl || img.sourceUrl || ''),
                alt: img.altText || '',
            })
        }
    }

    // 10) FAQ – אם faqEnable true
    if (f.faqEnable) {
        const { data: fq } = await wp.query({
            query: Q_FAQ,
            variables: { cat: faqCategory || null, limit: faqLimit },
            fetchPolicy: 'no-cache',
        })
        const nodes = fq?.posts?.nodes || []
        for (const n of nodes) {
            faq.push({
                id: n.id,
                question: n.title,
                answerHtml: absolutizeCmsUrls(sanitizeHtml(n.content || '')),
            })
        }
    }

    // 11) MEDIA – אם mediaEnable true
    if (f.mediaEnable) {
        const { data: md } = await wp.query({
            query: Q_POSTS_BY_CATEGORY,
            variables: { cat: mediaCategory || null, limit: mediaLimit },
            fetchPolicy: 'no-cache',
        })
        const nodes = md?.posts?.nodes || []
        for (const n of nodes) {
            const img = n?.featuredImage?.node || {}
            media.push({
                id: n.id,
                title: n.title,
                uri: n.uri,
                image: ensureCmsUrl(img.mediaItemUrl || img.sourceUrl || ''),
                alt: img.altText || '',
            })
        }
    }

    return {
        fields: f,
        heroSlides,
        badges,
        services,
        projects,
        news,
        testimonials,
        faq,
        media,
    }
}
