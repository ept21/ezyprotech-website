// app/page.js (or app/(site)/page.js – depending on your structure)

export const revalidate = 60;

import HeroSection from "@/app/components/sections/home/HeroSection";
import ServicesSection from "@/app/components/sections/home/ServicesSection";
import BundlesSection from "@/app/components/sections/home/BundlesSection";
import AboutSection from "@/app/components/sections/home/AboutSection";
import ProjectsSection from "@/app/components/sections/home/ProjectsSection";
import TestimonialsSection from "@/app/components/sections/home/TestimonialsSection";
import CtaWideSection from "@/app/components/sections/home/CtaWideSection";
import ContactSection from "@/app/components/sections/home/ContactSection";

import { gqlRequest } from "@/app/lib/graphql/client";
import {
    HERO_QUERY,
    SERVICES_HOME_PAGE_QUERY,
    BUNDLES_HOME_PAGE_QUERY,
    ABOUT_HOME_PAGE_QUERY,
    PROJECTS_HOME_PAGE_QUERY,
    TESTIMONIALS_HOME_PAGE_QUERY,
    CTA_HOME_PAGE_QUERY,
    CONTACT_HOME_PAGE_QUERY,
    GLOBALS_QUERY,
    FRONT_PAGE_QUERY,
    PAGE_BY_SLUG_QUERY,
} from "@/app/lib/graphql/queries";
import { getAcfImageUrl } from "@/app/lib/wp";
import { yoastToMetadata } from "@/app/lib/seo";

import "@/styles/electric-xtra.css";

/** NOTE: All comments must remain in English only. */
const getAcfLinkUrl = (l) => (typeof l === "string" ? l : l?.url ?? null);

const stripHtml = (html) =>
    typeof html === "string" ? html.replace(/<[^>]*>/g, "").trim() : "";

/** Prefer featured image URL safely */
const getFeaturedUrl = (node) =>
    node?.featuredImage?.node?.mediaItemUrl ||
    node?.featuredImage?.node?.sourceUrl ||
    null;

/** Normalize base site URL (ensure no trailing slash) */
const normalizeSiteUrl = (url) =>
    (url || "").replace(/\/+$/, "");

/** Parse citations textarea into an array of URLs */
function parseCitations(value) {
    if (!value) return [];
    return value
        .split(/\r?\n|,/)
        .map((l) => l.trim())
        .filter(Boolean);
}

/** Parse FAQ textarea into an array of { question, answer } */
function parseFaqSchema(value) {
    if (!value) return [];

    // Split by double line-breaks to blocks
    const blocks = value.split(/\n{2,}/);
    const faqs = [];

    for (const block of blocks) {
        const lines = block
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);

        if (lines.length === 0) continue;

        // Prefer explicit Q:/A:, but fall back to first/second line
        let qLine = lines.find((l) => /^Q[:\-]/i.test(l)) || lines[0];
        let aLine =
            lines.find((l) => /^A[:\-]/i.test(l)) ||
            lines[1] ||
            "";

        const question = qLine.replace(/^Q[:\-]\s*/i, "").trim();
        const answer = aLine.replace(/^A[:\-]\s*/i, "").trim();

        if (!question || !answer) continue;

        faqs.push({ question, answer });
    }

    return faqs;
}

/**
 * Build Authority Schema JSON-LD string for a given page.
 * This uses:
 * - page.title
 * - page.seo.metaDesc
 * - page.uri
 * - page.featuredImage
 * - page.authoritySchema (ACF group)
 * - siteUrl + logoUrl from globals
 */
function generateAuthoritySchemaJson(page, siteUrl, logoUrl) {
    if (!page?.authoritySchema) return null;

    const authority = page.authoritySchema;
    const type = authority.schemaType || "WebPage";
    const normalizedSiteUrl = normalizeSiteUrl(siteUrl);

    const uri = page.uri || "/";
    const fullUrl =
        uri === "/" ? normalizedSiteUrl || undefined : `${normalizedSiteUrl}${uri}`;

    const featuredNode = page.featuredImage?.node;
    const imageUrl =
        featuredNode?.sourceUrl || featuredNode?.mediaItemUrl || undefined;

    const description =
        page.seo?.metaDesc || authority.aiSummary || undefined;

    const schema = {
        "@context": "https://schema.org",
        "@type": type,
        name: page.title,
        description,
        url: fullUrl,
        image: imageUrl,
        abstract: authority.aiSummary || undefined,
        about: authority.primaryEntity
            ? {
                "@type": "Thing",
                name: authority.primaryEntity,
            }
            : undefined,
        provider: {
            "@type": "Organization",
            name: "Veltiqo",
            logo: {
                "@type": "ImageObject",
                url: logoUrl || `${normalizedSiteUrl}/assets/logo-main.png`,
            },
        },
    };

    if (authority.targetAudience) {
        schema.audience = {
            "@type": "BusinessAudience",
            audienceType: authority.targetAudience,
        };
    }

    // Only add aggregateRating when it is relevant and valid
    const ratingValue = authority.reviewRating;
    const ratingCount = authority.reviewCount;
    if (
        ratingValue &&
        Number(ratingValue) > 0 &&
        (type === "Service" || type === "Product")
    ) {
        schema.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: Number(ratingValue),
            reviewCount: Number(ratingCount || 1),
        };
    }

    const citations = parseCitations(authority.citations);
    if (citations.length > 0) {
        schema.citation = citations;
    }

    const faqItems = parseFaqSchema(authority.faqSchema);
    if (faqItems.length > 0) {
        schema.mainEntity = faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
            },
        }));
    }

    // Product/Offer block – only for Product pages
    if (type === "Product" && authority.productPrice) {
        schema.offers = {
            "@type": "Offer",
            price: Number(authority.productPrice),
            priceCurrency: authority.currencyCode || "USD",
        };
    }

    if (authority.videoUrl) {
        schema.subjectOf = {
            "@type": "VideoObject",
            contentUrl: authority.videoUrl,
            name: page.title,
        };
    }

    return JSON.stringify(schema);
}

/** Home page metadata */
export async function generateMetadata() {
    // Fetch globals + front page
    const [globalsRes, frontRes] = await Promise.all([
        gqlRequest(GLOBALS_QUERY),
        gqlRequest(FRONT_PAGE_QUERY),
    ]);

    const siteTitle = globalsRes?.generalSettings?.title ?? "Veltiqo";
    const wpSiteUrl = globalsRes?.generalSettings?.url ?? "";
    const globalsPage = globalsRes?.page;
    const gs = globalsPage?.globalSettings;

    const faviconUrl = getAcfImageUrl(gs?.favicon) || "/favicon.ico";
    const defaultOg = getAcfImageUrl(gs?.defaultogimage);

    // Prefer explicit frontend domain if defined (e.g. https://veltiqo.com)
    const frontendSiteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || wpSiteUrl || "";

    // Find the WP page that is marked as front page
    const frontNode =
        frontRes?.pages?.nodes?.find((n) => n?.isFrontPage) || null;

    let homePage = null;

    if (frontNode?.uri) {
        const homeRes = await gqlRequest(PAGE_BY_SLUG_QUERY, {
            slug: frontNode.uri,
        });
        homePage = homeRes?.page || null;
    }

    const wpSeo = homePage?.seo || null;

    const fallbackDescription =
        (homePage?.content && stripHtml(homePage.content).slice(0, 160)) ||
        "AI-driven web, marketing, and automation systems that move the needle.";

    const baseMeta = yoastToMetadata({
        wpSeo,
        fallbackTitle: wpSeo?.title || `${siteTitle} | AI Driven Growth`,
        fallbackDescription,
        fallbackImage: homePage?.featuredImage?.node || null,
        siteUrl: frontendSiteUrl,
    });

    return {
        ...baseMeta,
        // Ensure we always have sensible title/description
        title: baseMeta.title || `${siteTitle} | AI Driven Growth`,
        description: baseMeta.description || fallbackDescription,

        // Strengthen OG block with siteName, URL, and fallback image
        openGraph: {
            ...(baseMeta.openGraph || {}),
            url: baseMeta.openGraph?.url || frontendSiteUrl,
            siteName: siteTitle,
            images:
                baseMeta.openGraph?.images?.length > 0
                    ? baseMeta.openGraph.images
                    : defaultOg
                        ? [{ url: defaultOg }]
                        : undefined,
        },

        // Basic Twitter card (we are not over-optimizing this now)
        twitter: {
            ...(baseMeta.twitter || {}),
            card: baseMeta.twitter?.card || "summary_large_image",
        },

        // No "keywords" field here – so no <meta name="keywords"> at all.
        // No ai:* meta. JSON-LD is handled separately.

        icons: {
            icon: faviconUrl,
            shortcut: faviconUrl,
        },
    };
}

export default async function HomePage() {
    const homePageDbId = process.env.NEXT_PUBLIC_FRONT_PAGE_ID
        ? Number(process.env.NEXT_PUBLIC_FRONT_PAGE_ID)
        : null;

    if (!homePageDbId) {
        return (
            <main className="text-center py-20 text-white">
                <h1 className="text-3xl font-bold">
                    ⚠️ Missing NEXT_PUBLIC_FRONT_PAGE_ID
                </h1>
                <p>Set your front page databaseId in .env.local</p>
            </main>
        );
    }

    // Globals for contact details + site URL + logo
    const [globalsRes, frontRes] = await Promise.all([
        gqlRequest(GLOBALS_QUERY),
        gqlRequest(FRONT_PAGE_QUERY),
    ]);

    const wpSiteUrl = globalsRes?.generalSettings?.url || "";
    const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || wpSiteUrl || "";
    const gs = globalsRes?.page?.globalSettings;

    const contactGlobals = {
        email: gs?.email || null,
        phone: gs?.phoneNumber || null,
        whatsapp: gs?.whatsapp || null,
        address: gs?.address || null,
    };

    const logoUrl = getAcfImageUrl(gs?.sitelogo) || null;

    // Fetch the actual front page node (for Authority Schema)
    const frontNode =
        frontRes?.pages?.nodes?.find((n) => n?.isFrontPage) || null;

    let authoritySchemaJson = null;

    if (frontNode?.uri) {
        const homeRes = await gqlRequest(PAGE_BY_SLUG_QUERY, {
            slug: frontNode.uri,
        });
        const homePage = homeRes?.page || null;

        if (homePage) {
            authoritySchemaJson = generateAuthoritySchemaJson(
                homePage,
                siteUrl,
                logoUrl
            );
        }
    }

    /* ---- HERO ---- */
    const heroData = await gqlRequest(HERO_QUERY, { id: homePageDbId });
    const hp = heroData?.page?.homePageFields;
    const hero = hp?.hero || {};

    const heroBgUrl = getAcfImageUrl(hero?.heroBgImage);
    const heroBgMobileUrl = getAcfImageUrl(hero?.heroBgImageMobile);
    const heroVideoUrl = hero?.heroVideoUrl || null;
    const heroVideoUrlMobile = hero?.heroVideoUrlMobile || null;

    const heroTitle = hero?.heroTitle || "Build the Future of Your Business";
    const heroSubtitle =
        hero?.heroSubtitle ||
        "Headless web, AI systems, and automated marketing.";
    const kicker = hero?.kicker || "Default Kicker";
    const heroContent = hero?.heroContent || "";

    const cta1Label = hero?.herocta1url?.title || "Get Started";
    const cta1Href = getAcfLinkUrl(hero?.herocta1url) || "/contact";
    const cta2Label = hero?.herocta2url?.title || "See Pricing";
    const cta2Href = getAcfLinkUrl(hero?.herocta2url) || "#pricing";

    /* ---- SERVICES (Home section) ---- */
    const servicesRes = await gqlRequest(SERVICES_HOME_PAGE_QUERY, {
        id: homePageDbId,
    });

    const servicesSlice = servicesRes?.page?.homePageFields?.services || {};
    const showServices = servicesSlice?.showServices ?? true;

    const servicesBgUrl = getAcfImageUrl(servicesSlice?.servicesBgImage);
    const servicesBgMobileUrl = getAcfImageUrl(
        servicesSlice?.mobileBackgroundImage
    );
    const servicesKicker = servicesSlice?.kicker || "Accelerate";
    const servicesTitle = servicesSlice?.servicesTitle || "Our core services";
    const servicesSubtitle =
        servicesSlice?.servicesSubtitle ||
        "Innovative solutions designed to drive your business forward with precision and intelligence.";
    const servicesContentHtml = servicesSlice?.servicesContent || "";

    const rawCategories = servicesSlice?.servicesItems?.nodes || [];
    const rawLimit =
        servicesSlice?.servicesdisplaylimit || rawCategories.length || 0;

    const displayLimit = Math.max(1, Math.min(24, rawLimit));

    const serviceCards = rawCategories.slice(0, displayLimit).map((term, i) => {
        const fields = term?.servicesCategory || {};

        const title =
            (fields.title && fields.title.trim()) ||
            (term.name && term.name.trim()) ||
            "Untitled category";

        const catKicker = fields.kicker?.trim?.() || "Category";

        const excerpt =
            fields.bullets || (term.description ? term.description : "");

        const image = getAcfImageUrl(fields.serviceCategoryImage) || null;

        const href = term?.uri || "#";

        const cta = fields.ctaButton || null;

        return {
            id: term?.id || String(i),
            title,
            kicker: catKicker,
            excerpt,
            image,
            href,
            cta,
        };
    });

    const sectionCta = {
        href: servicesSlice?.ctaurl?.url || "/services",
        label: servicesSlice?.ctaurl?.title || "View all services",
        target: servicesSlice?.ctaurl?.target || null,
    };

    /* ---- BUNDLES (Home section) ---- */
    const bundlesFirstDefault = 12;
    const bundlesRes = await gqlRequest(BUNDLES_HOME_PAGE_QUERY, {
        id: homePageDbId,
        first: bundlesFirstDefault,
    });

    const bundlesSlice = bundlesRes?.page?.homePageFields?.bundles || {};
    const showBundles = bundlesSlice?.showBundles ?? true;

    const bundlesBgUrl = getAcfImageUrl(bundlesSlice?.bundlesBgImage);
    const bundlesBgMobileUrl = getAcfImageUrl(
        bundlesSlice?.mobileBackgroundImage
    );
    const bundlesKicker = bundlesSlice?.kicker || "Scale";
    const bundlesTitle = bundlesSlice?.bundlesTitle || "Pricing plans";
    const bundlesSubtitle =
        bundlesSlice?.bundlesSubtitle ||
        "Flexible packages designed to match your business growth trajectory.";
    const bundlesContent = bundlesSlice?.bundlesContent || "";

    const bundlesDisplayLimit = Math.max(
        1,
        Math.min(24, bundlesSlice?.bundlesDisplayLimit || bundlesFirstDefault)
    );

    let rawBundles = [];
    if (bundlesSlice?.bundlesSource === "manual") {
        rawBundles = bundlesSlice?.bundlesItems?.nodes || [];
    } else {
        rawBundles = bundlesRes?.bundles?.nodes || [];
    }
    rawBundles = rawBundles.slice(0, bundlesDisplayLimit);

    const bundleCards = rawBundles.map((n, i) => {
        const bf = n?.bundlesFields || {};
        const title = bf?.title?.trim?.() || n?.title || "Untitled";
        const price = bf?.price || null;
        const per = bf?.textNearPriceMonthlyYearlyOrOther || "";
        const featuresHtml = bf?.productsIncludes || "";
        const image =
            n?.featuredImage?.node?.mediaItemUrl ||
            n?.featuredImage?.node?.sourceUrl ||
            null;
        const href = n?.uri || "#";
        const cta1 = bf?.ctaurl1 || null;
        const cta2 = bf?.ctaurl2 || null;

        return {
            id: n?.id || String(i),
            title,
            price,
            per,
            featuresHtml,
            image,
            href,
            ctas: [cta1, cta2].filter(Boolean),
        };
    });

    const bundlesSectionCta = {
        href: bundlesSlice?.ctaurl?.url || "#pricing",
        label: bundlesSlice?.ctaurl?.title || "Compare packages",
        target: bundlesSlice?.ctaurl?.target || null,
    };

    /* ---- ABOUT (Home section) ---- */
    const aboutRes = await gqlRequest(ABOUT_HOME_PAGE_QUERY, {
        id: homePageDbId,
    });
    const aboutSlice = aboutRes?.page?.homePageFields?.about || {};
    const showAbout = aboutSlice?.showabout ?? true;

    const aboutBgUrl = getAcfImageUrl(aboutSlice?.aboutBgImage);
    const aboutMobileBgUrl = getAcfImageUrl(aboutSlice?.mobileBackgroundImage);

    const aboutKicker = aboutSlice?.kicker || "Transform";
    const aboutTitle =
        aboutSlice?.aboutTitle ||
        "Intelligent technology meets strategic vision";
    const aboutSubtitle =
        aboutSlice?.aboutSubtitle ||
        "We bridge the gap between cutting-edge AI technologies and practical business solutions.";
    const aboutContent = aboutSlice?.aboutContent || "";

    const rawAboutImages = [
        aboutSlice?.image1,
        aboutSlice?.image2,
        aboutSlice?.image3,
        aboutSlice?.image4,
    ];

    const aboutImages = rawAboutImages
        .map((img) => {
            const node = img?.node;
            const src = getAcfImageUrl(img);
            if (!src) return null;

            const alt = node?.altText || "";
            const label = node?.altText || "";

            return { src, alt, label };
        })
        .filter(Boolean);

    const aboutCta1 = aboutSlice?.ctaurl1 || null;
    const aboutCta2 = aboutSlice?.ctaurl2 || null;

    /* ---- PROJECTS (Home section) ---- */
    const projectsFirstDefault = 8;
    const projectsRes = await gqlRequest(PROJECTS_HOME_PAGE_QUERY, {
        id: homePageDbId,
        first: projectsFirstDefault,
    });

    const projectsSlice = projectsRes?.page?.homePageFields?.projects || {};
    const showProjects = projectsSlice?.showProjects ?? true;

    const projectsBgUrl = getAcfImageUrl(projectsSlice?.projectsBgImage);
    const MobileprojectsBgUrl = getAcfImageUrl(
        projectsSlice?.mobileBackgroundImage
    );
    const projectsKicker = projectsSlice?.kicker || "Deliver";
    const projectsTitle =
        projectsSlice?.projectsTitle || "Featured projects";
    const projectsSubtitle =
        projectsSlice?.projectsSubtitle ||
        "A snapshot of recent work — fast, scalable, and designed for growth.";
    const projectsContent = projectsSlice?.projectsContent || "";

    const projectsDisplayLimit = Math.max(
        1,
        Math.min(24, projectsSlice?.projectsDisplayLimit || projectsFirstDefault)
    );

    let rawProjects = [];
    if (projectsSlice?.projectsSource === "manual") {
        rawProjects = projectsSlice?.projectsItems?.nodes || [];
    } else {
        rawProjects = projectsRes?.projects?.nodes || [];
    }
    rawProjects = rawProjects.slice(0, projectsDisplayLimit);

    const projectCards = rawProjects.map((n, i) => {
        const pf = n?.projectsFields || {};
        const title =
            (pf?.title || n?.title || "Untitled").trim?.() || "Untitled";
        const category = pf?.categorylabel || pf?.kicker || "Project";
        const desc = pf?.excerpt || "";
        const image =
            getAcfImageUrl(pf?.projectimage) || getFeaturedUrl(n);
        const href = getAcfLinkUrl(pf?.projectlink) || n?.uri || "#";

        const cta1 = pf?.ctaurl1 || null;
        const cta2 = pf?.ctaurl2 || null;

        return {
            id: n?.id || String(i),
            title,
            category,
            desc,
            image,
            href,
            ctas: [cta1, cta2].filter(Boolean),
        };
    });

    const projectsCtas = [
        projectsSlice?.ctaurl1 || null,
        projectsSlice?.ctaurl2 || null,
    ].filter(Boolean);

    /* ---- TESTIMONIALS (Home section) ---- */
    const testimonialsFirstDefault = 12;
    const testimonialsRes = await gqlRequest(
        TESTIMONIALS_HOME_PAGE_QUERY,
        {
            id: homePageDbId,
            first: testimonialsFirstDefault,
        }
    );

    const testimonialsSlice =
        testimonialsRes?.page?.homePageFields?.testimonials || {};
    const showTestimonials =
        testimonialsSlice?.showTestimonials ?? true;

    const testimonialsBgUrl = getAcfImageUrl(
        testimonialsSlice?.testimonialsBgImage
    );

    const mobileTestimonialsBgUrl = getAcfImageUrl(
        testimonialsSlice?.mobileBackgroundImage
    );

    const testimonialsKicker =
        testimonialsSlice?.kicker || "Trust";
    const testimonialsTitle =
        testimonialsSlice?.testimonialsTitle ||
        "Client success stories";
    const testimonialsSubtitle =
        testimonialsSlice?.testimonialsSubtitle ||
        "Real results from businesses that trusted Veltiqo.";
    const testimonialsContent =
        testimonialsSlice?.testimonialsContent || "";

    const testimonialsDisplayLimit = Math.max(
        1,
        Math.min(
            24,
            testimonialsSlice?.testimonialsDisplayLimit ||
            testimonialsFirstDefault
        )
    );

    let rawTestimonials = [];
    if (testimonialsSlice?.testimonialsSource === "manual") {
        rawTestimonials = testimonialsSlice?.testimonialsItems?.nodes || [];
    } else {
        rawTestimonials = testimonialsRes?.testimonials?.nodes || [];
    }
    rawTestimonials = rawTestimonials.slice(
        0,
        testimonialsDisplayLimit
    );

    const testimonialCards = rawTestimonials.map((n, i) => {
        const tf = n?.testimonialsFields || {};

        const stars = Number(tf?.starranking) || 0;
        const name =
            tf?.fullname?.trim?.() ||
            n?.title?.trim?.() ||
            "Anonymous";
        const company = tf?.companyname || "";
        const businessType = tf?.typeofbusiness || "";
        const tk = tf?.kicker || null;

        const quote =
            tf?.excerpt ||
            stripHtml(tf?.content || n?.content || "").slice(0, 280);

        const avatar = getFeaturedUrl(n);
        const singleReview = tf?.singlereviewlink || null;
        const googleReview = tf?.linktogooglereview || null;
        const videoUrl = tf?.testimonialvideolink || null;

        return {
            id: n?.id || String(i),
            stars,
            kicker: tk,
            quote,
            name,
            company,
            businessType,
            avatar,
            singleReview,
            googleReview,
            videoUrl,
        };
    });

    const testimonialsCtas = [
        testimonialsSlice?.ctaurl1 || null,
        testimonialsSlice?.ctaurl2 || null,
    ].filter(Boolean);

    /* ---- CTA (Home section) ---- */
    const ctaRes = await gqlRequest(CTA_HOME_PAGE_QUERY, {
        id: homePageDbId,
    });

    const ctaSlice = ctaRes?.page?.homePageFields?.ctaSection || {};
    const showCtaSection = ctaSlice?.showCtaSection ?? true;

    const ctaBgUrl = getAcfImageUrl(ctaSlice?.backgroundImage);
    const ctaMobileBgUrl = getAcfImageUrl(ctaSlice?.mobileBackgroundImage);

    const ctaImageUrl =
        getAcfImageUrl(ctaSlice?.ctaImage) ||
        (typeof ctaSlice?.ctaImage === "string"
            ? ctaSlice?.ctaImage
            : null);

    const ctaKicker = ctaSlice?.kicker || "Accelerate";
    const ctaTitle =
        ctaSlice?.title || "Ready to accelerate your business?";
    const ctaSubtitle =
        ctaSlice?.subtitle ||
        "Let's discuss how our AI-driven solutions can transform your business strategy and performance.";
    const ctaContentHtml = ctaSlice?.content || "";

    const ctaPrimary = ctaSlice?.ctaurl1 || null;
    const ctaSecondary = ctaSlice?.ctaurl2 || null;

    /* ---- CONTACT (Home section) ---- */
    const contactRes = await gqlRequest(CONTACT_HOME_PAGE_QUERY, {
        id: homePageDbId,
    });

    const contactSlice = contactRes?.page?.homePageFields?.contact || {};
    const showContact = contactSlice?.showContact ?? true;

    const contactBgUrl = getAcfImageUrl(contactSlice?.contactBgImage);
    const contactMobileBgUrl = getAcfImageUrl(
        contactSlice?.mobileBackgroundImage
    );
    const contactKicker = contactSlice?.kicker || "Connect";
    const contactTitle =
        contactSlice?.contactTitle || "Contact Veltiqo";
    const contactSubtitle =
        contactSlice?.contactSubtitle ||
        "We're ready to help you navigate the future of intelligent business solutions.";
    const contactContentHtml = contactSlice?.contactContent || "";

    const useGlobalContact = contactSlice?.useGlobalContact ?? true;
    const contactImageUrl = getAcfImageUrl(contactSlice?.contactimage);

    return (
        <main>
            {/* Authority JSON-LD */}
            {authoritySchemaJson && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: authoritySchemaJson }}
                />
            )}

            {/* HERO */}
            <HeroSection
                bgUrl={heroBgUrl}
                bgMobileUrl={heroBgMobileUrl}
                videoUrl={heroVideoUrl}
                videoUrlMobile={heroVideoUrlMobile}
                kicker={kicker}
                title={heroTitle}
                subtitle={heroSubtitle}
                contentHtml={heroContent}
                primaryHref={cta1Href}
                primaryLabel={cta1Label}
                secondaryHref={cta2Href}
                secondaryLabel={cta2Label}
            />

            {/* SERVICES (carousel) */}
            {showServices && (
                <ServicesSection
                    eyebrow={servicesKicker}
                    title={servicesTitle}
                    subtitle={servicesSubtitle}
                    contentHtml={servicesContentHtml}
                    bgUrl={servicesBgUrl}
                    bgMobileUrl={servicesBgMobileUrl}
                    items={serviceCards}
                    sectionCta={sectionCta}
                />
            )}

            {/* BUNDLES */}
            {showBundles && (
                <BundlesSection
                    eyebrow={bundlesKicker}
                    title={bundlesTitle}
                    subtitle={bundlesSubtitle}
                    contentHtml={bundlesContent}
                    bgUrl={bundlesBgUrl}
                    bgMobileUrl={bundlesBgMobileUrl}
                    items={bundleCards}
                    sectionCta={bundlesSectionCta}
                />
            )}

            {showAbout && (
                <AboutSection
                    eyebrow={aboutKicker}
                    title={aboutTitle}
                    subtitle={aboutSubtitle}
                    contentHtml={aboutContent}
                    bgUrl={aboutBgUrl}
                    bgMobileUrl={aboutMobileBgUrl}
                    images={aboutImages}
                    ctas={[aboutCta1, aboutCta2].filter(Boolean)}
                />
            )}

            {/* PROJECTS */}
            {showProjects && (
                <ProjectsSection
                    eyebrow={projectsKicker}
                    title={projectsTitle}
                    subtitle={projectsSubtitle}
                    contentHtml={projectsContent}
                    bgUrl={projectsBgUrl}
                    MobilebgUrl={MobileprojectsBgUrl}
                    items={projectCards}
                    ctas={projectsCtas}
                />
            )}

            {/* TESTIMONIALS */}
            {showTestimonials && (
                <TestimonialsSection
                    eyebrow={testimonialsKicker}
                    title={testimonialsTitle}
                    subtitle={testimonialsSubtitle}
                    contentHtml={testimonialsContent}
                    bgUrl={testimonialsBgUrl}
                    mobileBgUrl={mobileTestimonialsBgUrl}
                    items={testimonialCards}
                    ctas={testimonialsCtas}
                />
            )}

            {showCtaSection && (
                <CtaWideSection
                    eyebrow={ctaKicker}
                    title={ctaTitle}
                    subtitle={ctaSubtitle}
                    contentHtml={ctaContentHtml}
                    bgUrl={ctaBgUrl}
                    mobileBgUrl={ctaMobileBgUrl}
                    imageUrl={ctaImageUrl}
                    primaryCta={ctaPrimary}
                    secondaryCta={ctaSecondary}
                />
            )}

            {showContact && (
                <ContactSection
                    bgUrl={contactBgUrl}
                    mobileBgUrl={contactMobileBgUrl}
                    eyebrow={contactKicker}
                    title={contactTitle}
                    subtitle={contactSubtitle}
                    contentHtml={contactContentHtml}
                    useGlobalContact={useGlobalContact}
                    imageUrl={contactImageUrl}
                    contactInfo={contactGlobals}
                />
            )}
        </main>
    );
}
