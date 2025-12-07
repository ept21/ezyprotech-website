// app/service/[slug]/head.js

import { gqlRequest } from "@/app/lib/graphql/client";
import { SERVICE_QUERY, GLOBALS_QUERY } from "@/app/lib/graphql/queries";
import { getAcfImageUrl } from "@/app/lib/wp";
import HeadMeta from "@/app/components/seo/HeadMeta";

export default async function Head({ params }) {
    const resolved = await (typeof params.then === "function"
        ? params
        : Promise.resolve(params));

    const slug = resolved.slug;

    if (!slug) {
        // fallback head (very defensive)
        return (
            <HeadMeta
                seo={null}
                faviconUrl="/favicon.ico"
                defaultOgImage={null}
                seoEnhancements={null}
                siteTitle="Veltiqo"
                siteUrl=""
                tagline="Build the Future of Your Business"
            />
        );
    }

    const [globalsRes, serviceRes] = await Promise.all([
        gqlRequest(GLOBALS_QUERY),
        gqlRequest(SERVICE_QUERY, { slug }),
    ]);

    const siteTitle = globalsRes?.generalSettings?.title ?? "Veltiqo";
    const siteUrl = globalsRes?.generalSettings?.url ?? "";
    const pageNode = globalsRes?.page;
    const gs = pageNode?.globalSettings;

    const faviconUrl = getAcfImageUrl(gs?.favicon) || "/favicon.ico";
    const defaultOg = getAcfImageUrl(gs?.defaultogimage);

    const service = serviceRes?.service || null;

    const seo = service?.seo || null;
    const seoEnhancements = service?.seoEnhancements || null;

    return (
        <HeadMeta
            seo={seo}
            faviconUrl={faviconUrl}
            defaultOgImage={defaultOg}
            seoEnhancements={seoEnhancements}
            siteTitle={siteTitle}
            siteUrl={siteUrl}
            tagline="Build the Future of Your Business"
        />
    );
}
