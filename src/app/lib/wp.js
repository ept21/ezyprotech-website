export function getAcfImageUrl(acfImage) {
    if (!acfImage) return null
    if (acfImage.node) return acfImage.node.mediaItemUrl || acfImage.node.sourceUrl || null
    if (acfImage.mediaItemUrl || acfImage.sourceUrl) return acfImage.mediaItemUrl || acfImage.sourceUrl
    if (acfImage.url) return acfImage.url // ← הוספה חשובה
    return null
}


// בונה עץ תפריט מתוך רשימה שטוחה של menuItems
export function buildMenuTree(items, { onlySlug } = {}) {
    if (!Array.isArray(items)) return []

    // אם ביקשנו רק תפריט מסוים (לפי slug), נסנן
    const filtered = onlySlug
        ? items.filter(i => i?.menu?.node?.slug === onlySlug)
        : items

    const byId = new Map()
    filtered.forEach(i => byId.set(i.id, { ...i, children: [] }))

    const tree = []
    filtered.forEach(i => {
        const node = byId.get(i.id)
        if (i.parentId && byId.has(i.parentId)) {
            byId.get(i.parentId).children.push(node)
        } else {
            tree.push(node)
        }
    })

    // סדר לפי order אם קיים
    const sortRec = list => {
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        list.forEach(n => sortRec(n.children))
        return list
    }
    return sortRec(tree)
}

// עוזר לזהות קישור פנימי (נשתמש ב-<Link/> רק לפנימיים)
export function isInternalUrl(url, siteUrl) {
    if (!url) return false
    try {
        const u = new URL(url, siteUrl || 'http://localhost')
        if (!siteUrl) return u.pathname?.startsWith('/')
        return u.origin === new URL(siteUrl).origin
    } catch {
        return url.startsWith('/')
    }
}
