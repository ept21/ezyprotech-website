'use client'

import { useEffect } from 'react'

export default function Analytics({ ga4Code, metaPixelId }) {
    useEffect(() => {
        // GA4
        if (ga4Code && !window.__GA4_LOADED__) {
            const gtagScript = document.createElement('script')
            gtagScript.async = true
            gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Code}`
            document.head.appendChild(gtagScript)

            const inline = document.createElement('script')
            inline.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${ga4Code}');
      `
            document.head.appendChild(inline)
            window.__GA4_LOADED__ = true
        }

        // Meta Pixel
        if (metaPixelId && !window.__META_PIXEL_LOADED__) {
            !(function(f,b,e,v,n,t,s){
                if(f.fbq) return; n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)}
                if(!f._fbq) f._fbq=n; n.push=n; n.loaded=!0; n.version='2.0'
                n.queue=[]; t=b.createElement(e); t.async=!0
                t.src=v; s=b.getElementsByTagName(e)[0]
                s.parentNode.insertBefore(t,s)
            })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

            window.fbq('init', metaPixelId)
            window.fbq('track', 'PageView')
            window.__META_PIXEL_LOADED__ = true
        }
    }, [ga4Code, metaPixelId])

    // noscript לגיבוי Meta Pixel
    return metaPixelId ? (
        <noscript>
            <img height="1" width="1" style={{display:"none"}}
                 src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`} />
        </noscript>
    ) : null
}
