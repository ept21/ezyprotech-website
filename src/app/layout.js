import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getSiteData } from '@/lib/site'

export const revalidate = 300

export default async function RootLayout({ children }) {
    const { headerMenu, footerMenu, opts } = await getSiteData()
    const primary = opts?.brandPrimary || '#22d3ee'
    const accent  = opts?.brandAccent || '#7c3aed'
    const gradient = { backgroundImage: `linear-gradient(90deg, ${primary}, ${accent})` }

    return (
        <html lang="en" className="h-full">
        <head>
            {opts?.trackingHead && <script dangerouslySetInnerHTML={{ __html: opts.trackingHead }} />}
        </head>
        <body className="min-h-screen bg-base-900 text-white antialiased">
        <Header menu={headerMenu} logoText={opts?.siteLogoText || 'EzyProTech'} gradient={gradient} />
        <main className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            {children}
        </main>
        <Footer menu={footerMenu} social={opts?.social} gradient={gradient} />
        {opts?.trackingBody && <script dangerouslySetInnerHTML={{ __html: opts.trackingBody }} />}
        </body>
        </html>
    )
}
