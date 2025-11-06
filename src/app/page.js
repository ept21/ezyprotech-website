// /src/app/page.js
export const revalidate = 60;

import HeroSection from "@/components/sections/home/HeroSection";
import ServicesSection from "@/components/sections/home/ServicesSection";
import BundlesSection from "@/components/sections/home/BundlesSection";
import AboutSection from "@/components/sections/home/AboutSection";
import ProjectsSection from "@/components/sections/home/ProjectsSection";
import TestimonialsSection from "@/components/sections/home/TestimonialsSection";
import CtaWideSection from "@/components/sections/home/CtaWideSection";
import ContactSection from "@/components/sections/home/ContactSection";

import { gqlRequest } from "@/lib/graphql/client";
import { HERO_QUERY } from "@/lib/graphql/queries";
import { getAcfImageUrl } from "@/lib/wp";

import "@/styles/electric-xtra.css";

/** Helper to normalize ACF link fields */
const getAcfLinkUrl = (l) => (typeof l === "string" ? l : (l?.url ?? null));

export default async function HomePage() {
    // Use a stable DB ID for the front page (set it in .env.local)
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

    // Fetch only the hero block for the home page
    const data = await gqlRequest(HERO_QUERY, { id: homePageDbId });
    const hp = data?.page?.homePageFields;
    const hero = hp?.hero || {};

    // Backgrounds / video
    const heroBgUrl = getAcfImageUrl(hero?.heroBgImage);
    const heroBgMobileUrl = getAcfImageUrl(hero?.heroBgImageMobile);
    const heroVideoUrl = hero?.heroVideoUrl || null;
    const heroVideoUrlMobile = hero?.heroVideoUrlMobile || null;

    // Texts (fallbacks are temporary until CMS content is filled)
    const heroTitle = hero?.heroTitle || "Build the Future of Your Business";
    const heroSubtitle =
        hero?.heroSubtitle || "Headless web, AI systems, and automated marketing.";
    const kicker = hero?.kicker || "Default Kicker";
    const heroContent = hero?.heroContent || "";

    // CTAs
    const cta1Label = hero?.herocta1url.title || "Get Started";
    const cta1Href = getAcfLinkUrl(hero?.herocta1url) || "/contact";
    const cta2Label = hero?.herocta2url.title || "See Pricing";
    const cta2Href = getAcfLinkUrl(hero?.herocta2url) || "#pricing";


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

            {/* Static sections for now — will be wired to CMS next */}
            <ServicesSection />
            <BundlesSection />
            <AboutSection />
            <ProjectsSection />
            <TestimonialsSection />
            <CtaWideSection />
            <ContactSection />
        </main>
    );
}
