// /src/app/page.js
export const revalidate = 60;

/**
 * NOTE: All comments must remain in English only.
 * Static home page for the “design pass”. No GraphQL calls yet.
 */

import "@/styles/electric-xtra.css";

import HeroSection from "@/components/sections/home/HeroSection";
import ServicesSection from "@/components/sections/home/ServicesSection";
import BundelsSection from "@/components/sections/home/BundlesSection";
import AboutSection from "@/components/sections/home/AboutSection";
import ProjectsSection from "@/components/sections/home/ProjectsSection";
import TestimonialsSection from "@/components/sections/home/TestimonialsSection";
import CtaWideSection from "@/components/sections/home/CtaWideSection";
import ContactSection from "@/components/sections/home/ContactSection";

export default function HomePage() {
    return (
        <main>
            {/* HERO  */}
            <HeroSection

                kicker="AI Driven Growth"
                title="Build the Future of Your Business"
                subtitle="Headless web, AI systems, and automated marketing."
                primaryHref="/contact"
                primaryLabel="Get Started"
                secondaryHref="#pricing"
                secondaryLabel="See Pricing"
            />

            {/* SERVICES */}
            <ServicesSection />

            {/* BUNDLES / PRICING */}
            <BundelsSection />

            {/* ABOUT */}
            <AboutSection />

            {/* PROJECTS */}
            <ProjectsSection />

            {/* TESTIMONIALS */}
            <TestimonialsSection />

            {/* CTA WIDE */}
            <CtaWideSection />

            {/* CONTACT */}
            <ContactSection />
        </main>
    );
}
