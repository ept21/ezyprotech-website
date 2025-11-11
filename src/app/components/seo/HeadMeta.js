export default function HeadMeta({
                                     siteTitle = 'Veltiqo',
                                     siteUrl = '',
                                     faviconUrl = '',
                                     defaultOgImage = '',
                                     tagline = 'Build the Future of Your Business'
                                 }) {
    // יצירת URL מלא לתמונת OG אם צריך
    const ogImage = defaultOgImage || ''


    return (
        <>
            {/* Favicon */}
            {faviconUrl && <link rel="icon" href={faviconUrl} sizes="32x32" />}
            {/* Title בסיסי */}
            <title>{siteTitle}</title>
            <meta name="description" content={tagline} />

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            {siteUrl && <meta property="og:url" content={siteUrl} />}
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={tagline} />
            {ogImage && <meta property="og:image" content={ogImage} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={tagline} />
            {ogImage && <meta name="twitter:image" content={ogImage} />}

            {/* צבעי רקע לדפדפנים תומכים */}
            <meta name="theme-color" content="#0D1117" />
        </>
    )
}
