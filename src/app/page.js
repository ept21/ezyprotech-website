// /src/app/page.js

export const revalidate = 60;

import Container from "@/components/common/Container";
import ServicesSection from "@/components/sections/home/ServicesSection";
import { getClient } from "@/lib/graphql/client";
import { HOME_QUERY, FRONT_PAGE_QUERY } from "@/lib/graphql/queries";
import { getAcfImageUrl } from "@/lib/wp";

import "@/styles/electric-xtra.css";

// Cache פנימי למניעת בקשות כפולות (שרת בלבד)
let cachedHomePageId = null;

export default async function HomePage() {
    const client = getClient();

    // 1) משוך את ה-ID של דף הבית (פעם אחת לכל ריסטארט שרת)
    if (!cachedHomePageId) {
        const frontData = await client.request(FRONT_PAGE_QUERY);
        const allPages = frontData?.pages?.nodes || [];
        const frontPage = allPages.find((p) => p.isFrontPage);
        cachedHomePageId = frontPage?.id || null;
    }

    const homePageId = cachedHomePageId;

    if (!homePageId) {
        return (
            <main className="text-center py-20 text-white">
                <h1 className="text-3xl font-bold">⚠️ לא נמצא דף בית</h1>
                <p>ודא שדף הבית מוגדר בוורדפרס תחת Settings → Reading</p>
            </main>
        );
    }

    // 2) משוך נתוני דף הבית
    const vars = {
        id: homePageId,
        servicesFirst: 12, // הגדלתי ליתר ביטחון
        projectsFirst: 6,
        bundlesFirst: 6,
        articlesFirst: 3,
        techNewsFirst: 3,
        eventsFirst: 3,
        faqFirst: 6,
    };

    const data = await client.request(HOME_QUERY, vars);
    const hp = data?.page?.homePageFields;

    // HERO assets מה־CMS
    const heroBgUrl = getAcfImageUrl(hp?.hero?.heroBgImage);
    const heroBgMobileUrl = getAcfImageUrl(hp?.hero?.heroBgImageMobile);

    // ===== SERVICES: שליפה + מיפוי בטוח =====
    const servicesConf = hp?.services;
    let servicesList = Array.isArray(data?.services?.nodes) ? data.services.nodes : [];

    // אם ה-query לא החזיר כלום בכלל – ננסה מקור חלופי (חלק מאנשים שמים CPT בשם אחר)
    if (!servicesList.length && Array.isArray(data?.service?.nodes)) {
        servicesList = data.service.nodes;
    }

    // בחירה ידנית: לעתים servicesItems.nodes מחזיר databaseId בזמן שהרשימה הראשית מחזירה id (Relay)
    if (servicesConf?.servicesSource === "manual" && servicesConf?.servicesItems?.nodes?.length) {
        const wantedRelayIds = new Set(
            servicesConf.servicesItems.nodes
                .map((n) => (n?.id ? String(n.id) : null))
                .filter(Boolean)
        );
        const wantedDbIds = new Set(
            servicesConf.servicesItems.nodes
                .map((n) => (typeof n?.databaseId === "number" ? n.databaseId : null))
                .filter((v) => v !== null)
        );

        servicesList = servicesList.filter((n) => {
            const relayOk = n?.id && wantedRelayIds.has(String(n.id));
            const dbOk = typeof n?.databaseId === "number" && wantedDbIds.has(n.databaseId);
            return relayOk || dbOk;
        });
    }

    // הגבלת כמות להצגה
    if (servicesConf?.servicesDisplayLimit) {
        const lim = Math.max(1, Math.min(24, servicesConf.servicesDisplayLimit));
        servicesList = servicesList.slice(0, lim);
    }

    // כלי עזר
    const stripHtml = (html) =>
        typeof html === "string" ? html.replace(/<[^>]*>/g, "").trim() : "";

    const getFeatured = (n) =>
        n?.featuredImage?.node?.mediaItemUrl ||
        n?.featuredImage?.node?.sourceUrl ||
        null;

    // מיפוי ל־ServicesSection
    const icons = ["🧭", "⚡", "🕸️", "🤖", "📊", "🔧", "🌐", "🚀", "🧪", "🧩"];
    const servicesTabs =
        servicesList.map((s, i) => {
            const id = (s?.id ?? s?.databaseId ?? i).toString();
            const title = s?.title ?? `Service ${i + 1}`;
            const uri = s?.uri ?? "#";
            const excerpt =
                stripHtml(s?.excerpt) || "Click “Learn more” to explore details.";
            const img = getFeatured(s);

            return {
                id,
                label: title,
                icon: icons[i % icons.length],
                heading: title,
                copy: excerpt,
                bullets: [], // אפשר למפות בהמשך ACF bullets
                linkText: "Learn more →",
                linkHref: uri,
                _featured: img,
            };
        }) ?? [];

    // האם להציג? — מציגים אם יש פריטים, גם אם showServices כבוי בטעות
    const shouldShowServices = servicesTabs.length > 0;

    return (
        <main>
            {/* ===== HERO ===== */}
            <section
                className="relative isolate min-h-[80vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden"
                aria-label="Hero"
            >
                {/* רקע תמונה: מובייל/דסקטופ */}
                <div className="absolute inset-0 -z-10">
                    {(heroBgMobileUrl || heroBgUrl) ? (
                        <picture>
                            {heroBgMobileUrl && (
                                <source media="(max-width: 640px)" srcSet={heroBgMobileUrl} />
                            )}
                            <img
                                src={heroBgUrl || heroBgMobileUrl}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="eager"
                            />
                        </picture>
                    ) : (
                        <div className="h-full w-full bg-[var(--bg-default)]" />
                    )}
                    <div className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(0,0,0,0.35),rgba(0,0,0,0.65))]" />
                </div>

                {/* אפקטים (לא חוסם קליקים) */}
                <div className="fx-electric pointer-events-none absolute inset-0 -z-10">
                    <div className="grid-bg fx-layer" />
                    <div className="shapes-container fx-layer">
                        <div className="shape shape-circle" />
                        <div className="shape shape-triangle" />
                        <div className="shape shape-square" />
                    </div>
                    <div className="scanlines fx-layer" />
                </div>

                {/* תוכן */}
                <div className="container mx-auto max-w-5xl px-4 md:px-6 text-center relative z-10">
                    <p className="text-sm text-[var(--text-secondary)]">AI Driven Growth</p>
                    <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-[-0.02em]">
                        Build the Future of Your Business
                    </h1>
                    <p className="mt-4 text-lg text-[var(--text-secondary)]">
                        Headless web, AI systems, and automated marketing.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <a href="/contact" className="btn-brand">Get Started</a>
                        <a href="#pricing" className="btn-brand-outline">See Pricing</a>
                    </div>
                </div>
            </section>

            {/* ===== SERVICES (Tabbed) ===== */}
            {shouldShowServices && (
                <ServicesSection
                    title="Services that actually move the needle"
                    subtitle="Built for speed, designed for outcomes."
                    bgImage="/images/sections/services-bg.webp"
                    tabs={[
                        {
                            id: "svc-1",
                            label: "Headless Websites",
                            icon: "🚀",
                            heading: "Headless Websites",
                            copy: "Next.js frontend + WordPress (WPGraphQL) for speed, SEO and full control. Pixel-faithful to your Figma.",
                            bullets: ["Next.js App Router · RSC", "WPGraphQL + ACF", "Core Web Vitals 90+"],
                            linkText: "Learn more →",
                            linkHref: "/#services",
                            _featured: "/images/services/headless.webp",
                        },
                        // ...שאר הכרטיסיות בדיוק כפי שהדבקתי לך מקודם
                    ]}
                    ctaText="TALK TO AN EXPERT"
                    ctaHref="/contact"
                />
            )}

            {/* ===== BUNDLES ===== */}
            {hp?.bundles?.showBundles && (
                <section
                    id="bundles"
                    className="py-16"
                    style={
                        getAcfImageUrl(hp.bundles.bundlesBgImage)
                            ? {
                                backgroundImage: `url(${getAcfImageUrl(
                                    hp.bundles.bundlesBgImage
                                )})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }
                            : undefined
                    }
                >
                    <Container>
                        <h2 className="text-2xl font-bold">{hp.bundles.bundlesTitle}</h2>
                        {hp.bundles.bundlesSubtitle && <p>{hp.bundles.bundlesSubtitle}</p>}
                        {hp.bundles.bundlesContent && (
                            <div
                                className="prose mt-4"
                                dangerouslySetInnerHTML={{ __html: hp.bundles.bundlesContent }}
                            />
                        )}
                    </Container>
                </section>
            )}

            {/* ===== PROJECTS ===== */}
            {hp?.projects?.showProjects && (
                <section id="projects" className="py-16 bg-gray-950">
                    <Container>
                        <h2 className="text-2xl font-bold">{hp.projects.projectsTitle}</h2>
                        {hp.projects.projectsSubtitle && <p>{hp.projects.projectsSubtitle}</p>}
                        {hp.projects.projectsContent && (
                            <div
                                className="prose mt-4"
                                dangerouslySetInnerHTML={{ __html: hp.projects.projectsContent }}
                            />
                        )}
                    </Container>
                </section>
            )}
        </main>
    );
}
