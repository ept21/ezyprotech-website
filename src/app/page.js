// /src/app/page.js
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
         PROJECTS_HOME_PAGE_QUERY
            } from "@/app/lib/graphql/queries";
import { getAcfImageUrl } from "@/app/lib/wp";

import "@/styles/electric-xtra.css";

/** NOTE: All comments must remain in English only. */
const getAcfLinkUrl = (l) => (typeof l === "string" ? l : (l?.url ?? null));
const stripHtml = (html) =>
    typeof html === "string" ? html.replace(/<[^>]*>/g, "").trim() : "";

/** Prefer featured image URL safely */
const getFeaturedUrl = (node) =>
    node?.featuredImage?.node?.mediaItemUrl ||
    node?.featuredImage?.node?.sourceUrl ||
    null;

/** Derive a presentable title from ACF override or core title */
const getServiceTitle = (node) =>
    node?.serviceFields?.title?.trim?.() || node?.title || "Untitled";

/** Choose excerpt: ACF excerpt → ACF content → core content (stripped) */
const getServiceExcerpt = (node) => {
    const acfEx = node?.serviceFields?.excerpt;
    if (acfEx) return acfEx;
    const acfContent = node?.serviceFields?.content;
    if (acfContent) return stripHtml(acfContent).slice(0, 220);
    const coreContent = node?.content;
    if (coreContent) return stripHtml(coreContent).slice(0, 220);
    return "";
};

export default async function HomePage() {
    const homePageDbId = process.env.NEXT_PUBLIC_FRONT_PAGE_ID
        ? Number(process.env.NEXT_PUBLIC_FRONT_PAGE_ID)
        : null;

    if (!homePageDbId) {
        return (
            <main className="text-center py-20 text-white">
                <h1 className="text-3xl font-bold">⚠️ Missing NEXT_PUBLIC_FRONT_PAGE_ID</h1>
                <p>Set your front page databaseId in .env.local</p>
            </main>
        );
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
        hero?.heroSubtitle || "Headless web, AI systems, and automated marketing.";
    const kicker = hero?.kicker || "Default Kicker";
    const heroContent = hero?.heroContent || "";

    const cta1Label = hero?.herocta1url?.title || "Get Started";
    const cta1Href = getAcfLinkUrl(hero?.herocta1url) || "/contact";
    const cta2Label = hero?.herocta2url?.title || "See Pricing";
    const cta2Href = getAcfLinkUrl(hero?.herocta2url) || "#pricing";

    /* ---- SERVICES (Home section) ---- */
    const firstDefault = 12;
    const servicesRes = await gqlRequest(SERVICES_HOME_PAGE_QUERY, {
        id: homePageDbId,
        first: firstDefault,
    });

    const servicesSlice = servicesRes?.page?.homePageFields?.services || {};
    const showServices = servicesSlice?.showServices ?? true;

    const servicesBgUrl = getAcfImageUrl(servicesSlice?.servicesBgImage);
    const servicesKicker = servicesSlice?.kicker || "Accelerate";
    const servicesTitle = servicesSlice?.servicesTitle || "Our core services";
    const servicesSubtitle =
        servicesSlice?.servicesSubtitle ||
        "Innovative solutions designed to drive your business forward with precision and intelligence.";
    const servicesContentHtml = servicesSlice?.servicesContent || "";

    const displayLimit = Math.max(
        1,
        Math.min(24, servicesSlice?.servicesDisplayLimit || firstDefault)
    );

    // Manual vs Auto source
    let rawItems = [];
    if (servicesSlice?.servicesSource === "manual") {
        rawItems = servicesSlice?.servicesItems?.nodes || [];
    } else {
        // AUTO fallback list
        rawItems = servicesRes?.services?.nodes || [];
    }

    // Trim to limit
    rawItems = rawItems.slice(0, displayLimit);

    // Map to UI-friendly shape (without changing your visual layout)
    const serviceCards = rawItems.map((n, i) => {
        const title = getServiceTitle(n);
        const kicker = n?.serviceFields?.kicker || "Service";
        const subtitle = n?.serviceFields?.subtitle || null;
        const excerpt = n?.serviceFields?.excerpt || getServiceExcerpt(n);
        const image = getFeaturedUrl(n);
        const href = n?.uri || "#";
        const cta = n?.serviceFields?.ctaurl1 || null;

        return {
            id: n?.id || String(i),
            title,
            kicker,
            subtitle,
            excerpt,
            image,
            href,
            cta, // { url, title, target } or null
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

    const bundlesBgUrl    = getAcfImageUrl(bundlesSlice?.bundlesBgImage);
    const bundlesKicker   = bundlesSlice?.kicker || "Scale";
    const bundlesTitle    = bundlesSlice?.bundlesTitle || "Pricing plans";
    const bundlesSubtitle = bundlesSlice?.bundlesSubtitle || "Flexible packages designed to match your business growth trajectory.";
    const bundlesContent  = bundlesSlice?.bundlesContent || "";

    const bundlesDisplayLimit = Math.max(
        1,
        Math.min(24, bundlesSlice?.bundlesDisplayLimit || bundlesFirstDefault)
    );

// Manual vs Auto
    let rawBundles = [];
    if (bundlesSlice?.bundlesSource === "manual") {
        rawBundles = bundlesSlice?.bundlesItems?.nodes || [];
    } else {
        rawBundles = bundlesRes?.bundles?.nodes || [];
    }
    rawBundles = rawBundles.slice(0, bundlesDisplayLimit);

// Map WP → UI
    const bundleCards = rawBundles.map((n, i) => {
        const bf = n?.bundlesFields || {};
        const title = bf?.title?.trim?.() || n?.title || "Untitled";
        const price = bf?.price || null;
        const per   = bf?.textNearPriceMonthlyYearlyOrOther || "";
        const featuresHtml = bf?.productsIncludes || "";
        const image = n?.featuredImage?.node?.mediaItemUrl || n?.featuredImage?.node?.sourceUrl || null;
        const href  = n?.uri || "#";
        const cta1  = bf?.ctaurl1 || null;
        const cta2  = bf?.ctaurl2 || null;

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
    const aboutRes = await gqlRequest(ABOUT_HOME_PAGE_QUERY, { id: homePageDbId });
    const aboutSlice = aboutRes?.page?.homePageFields?.about || {};
    const showAbout = aboutSlice?.showabout ?? true;

    const aboutBgUrl   = getAcfImageUrl(aboutSlice?.aboutBgImage);
    const aboutKicker  = aboutSlice?.kicker || "Transform";
    const aboutTitle   = aboutSlice?.aboutTitle || "Intelligent technology meets strategic vision";
    const aboutSubtitle= aboutSlice?.aboutSubtitle || "We bridge the gap between cutting-edge AI technologies and practical business solutions.";
    const aboutContent = aboutSlice?.aboutContent || "";

    // Resolve up to 4 images (null-safe)
    const aboutImages = [
        getAcfImageUrl(aboutSlice?.image1),
        getAcfImageUrl(aboutSlice?.image2),
        getAcfImageUrl(aboutSlice?.image3),
        getAcfImageUrl(aboutSlice?.image4),
    ].filter(Boolean);

    console.log(aboutImages)

    const aboutCta1 = aboutSlice?.ctaurl1 || null; // {url,title,target}
    const aboutCta2 = aboutSlice?.ctaurl2 || null;

    /* ---- PROJECTS (Home section) ---- */
    const projectsFirstDefault = 8;
    const projectsRes = await gqlRequest(PROJECTS_HOME_PAGE_QUERY, {
        id: homePageDbId,
        first: projectsFirstDefault,
    });

    const projectsSlice = projectsRes?.page?.homePageFields?.projects || {};
    const showProjects = projectsSlice?.showProjects ?? true;

    const projectsBgUrl   = getAcfImageUrl(projectsSlice?.projectsBgImage);
    const projectsKicker  = projectsSlice?.kicker || "Deliver";
    const projectsTitle   = projectsSlice?.projectsTitle || "Featured projects";
    const projectsSubtitle= projectsSlice?.projectsSubtitle || "A snapshot of recent work — fast, scalable, and designed for growth.";
    const projectsContent = projectsSlice?.projectsContent || "";

    const projectsDisplayLimit = Math.max(
        1,
        Math.min(24, projectsSlice?.projectsDisplayLimit || projectsFirstDefault)
    );

    // Manual vs Auto
    let rawProjects = [];
    if (projectsSlice?.projectsSource === "manual") {
        rawProjects = projectsSlice?.projectsItems?.nodes || [];
    } else {
        rawProjects = projectsRes?.projects?.nodes || [];
    }
    rawProjects = rawProjects.slice(0, projectsDisplayLimit);

    // Map WP → UI shape that matches your current cards
    const projectCards = rawProjects.map((n, i) => {
        const pf = n?.projectsFields || {};
        const title    = (pf?.title || n?.title || "Untitled").trim?.() || "Untitled";
        const category = pf?.categorylabel || pf?.kicker || "Project";
        const desc     = pf?.excerpt || "";
        const image    = getAcfImageUrl(pf?.projectimage) || getFeaturedUrl(n);
        const href     = getAcfLinkUrl(pf?.projectlink) || n?.uri || "#";

        const cta1 = pf?.ctaurl1 || null; // { url, title, target }
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






    return (
        <main>
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
                    items={serviceCards}
                    sectionCta={sectionCta}
                />
            )}


            {/* BUNDLES (pricing) */}
            {showBundles && (
                <BundlesSection
                    eyebrow={bundlesKicker}
                    title={bundlesTitle}
                    subtitle={bundlesSubtitle}
                    contentHtml={bundlesContent}
                    bgUrl={bundlesBgUrl}
                    items={bundleCards}
                    sectionCta={bundlesSectionCta}
                />
            )}



            {/* ABOUT */}
            {showAbout && (
                <AboutSection
                    eyebrow={aboutKicker}
                    title={aboutTitle}
                    subtitle={aboutSubtitle}
                    contentHtml={aboutContent}
                    bgUrl={aboutBgUrl}
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
                    items={projectCards}
                    ctas={projectsCtas}
                />
            )}
            <TestimonialsSection />
            <CtaWideSection />
            <ContactSection />
        </main>
    );
}
