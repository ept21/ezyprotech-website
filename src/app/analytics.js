'use client'
import Script from 'next/script'
export default function Analytics() {
    const id = process.env.NEXT_PUBLIC_GA4_ID || process.env.GA4_ID
    return id ? (
        <>
            <Script async src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
            <Script id="ga4">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);} gtag('js', new Date());
        gtag('config', '${id}');
      `}</Script>
        </>
    ) : null
}
