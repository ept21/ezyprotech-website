import Link from 'next/link'
import Image from 'next/image'

export default function Sections({ blocks = [], gradient = { backgroundImage:'linear-gradient(90deg,#22d3ee,#7c3aed)'} }) {
    if (!blocks.length) return null
    return (
        <div className="space-y-20 md:space-y-24">
            {blocks.map((b, i) => {
                switch (b.__typename) {
                    case 'Hero': return <Hero key={i} {...b} gradient={gradient} />
                    case 'LogoStrip': return <LogoStrip key={i} {...b} />
                    case 'Features': return <Features key={i} {...b} />
                    case 'ServicesGrid': return <ServicesGrid key={i} {...b} />
                    case 'ProjectsGrid': return <ProjectsGrid key={i} {...b} />
                    case 'Testimonials': return <Testimonials key={i} {...b} />
                    case 'Cta': return <CTA key={i} {...b} gradient={gradient} />
                    default: return null
                }
            })}
        </div>
    )
}

function Section({ className='', children }) {
    return <section className={`section-surface ${className}`}>{children}</section>
}
function Card({ className='', children }) {
    return <div className={`card-glass ${className}`}>{children}</div>
}

/* HERO */
function Hero({ eyebrow, title, subtitle, primaryCtaText, primaryCtaLink, secondaryCtaText, secondaryCtaLink, bgImage, gradient }) {
    return (
        <Section className="overflow-hidden angled-divider">
            <div className="pointer-events-none absolute inset-0 bg-hero-radial opacity-60" />
            <div className="relative grid gap-8 p-6 sm:p-8 md:grid-cols-[1.25fr,1fr] md:p-12">
                <div className="flex flex-col justify-center">
                    {eyebrow && <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">{eyebrow}</span>}
                    {title && <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl leading-tight" dangerouslySetInnerHTML={{__html:title}} />}
                    {subtitle && <p className="mt-3 max-w-prose text-[15px] leading-6 text-white/70 md:mt-5" dangerouslySetInnerHTML={{__html:subtitle}} />}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        {primaryCtaText && <Link href={primaryCtaLink || '/contact'} className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-black glow-edge" style={gradient}>{primaryCtaText}</Link>}
                        {secondaryCtaText && <Link href={secondaryCtaLink || '/services'} className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">{secondaryCtaText}</Link>}
                    </div>
                </div>
                <div className="relative">
                    <Card className="h-full min-h-[260px] p-0 overflow-hidden">
                        {bgImage?.mediaItemUrl && <Image src={bgImage.mediaItemUrl} alt={bgImage.altText || ''} fill className="object-cover opacity-90" />}
                    </Card>
                </div>
            </div>
        </Section>
    )
}

/* LOGO STRIP */
function LogoStrip({ logos = [] }) {
    return (
        <Section>
            <div className="px-4 py-5 sm:px-6 sm:py-7 bg-grid-faint bg-grid-size rounded-3xl">
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-8 opacity-90">
                    {logos.map((l,i)=>(
                        <div key={i} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">{l?.text || 'Brand'}</div>
                    ))}
                </div>
            </div>
        </Section>
    )
}

/* FEATURES */
function Features({ items = [] }) {
    return (
        <Section className="p-6 sm:p-8 md:p-10">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">What we do best</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((it, i)=>(
                    <Card key={i} className="hover:shadow-neon transition">
                        <div className="flex items-center gap-3">
                            <div className="neon-ring rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-lg">{it.iconKey || '⚡'}</div>
                            <div className="text-lg font-semibold">{it.title}</div>
                        </div>
                        <p className="mt-2 text-sm text-white/70">{it.desc}</p>
                    </Card>
                ))}
            </div>
        </Section>
    )
}

/* SERVICES */
function ServicesGrid({ services }) {
    const nodes = services?.nodes ?? []
    return (
        <Section className="p-6 sm:p-8 md:p-10">
            <div className="mb-6 flex items-end justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">Services</h2>
                <Link href="/services" className="text-sm text-white hover:underline">View all →</Link>
            </div>
            {nodes.length === 0 ? <Empty label="Add Services in WP & publish." /> :
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {nodes.map(n=>(
                        <Card key={n.id} className="hover:shadow-neon transition">
                            <div className="text-lg font-semibold" dangerouslySetInnerHTML={{__html:n.title}} />
                            {n.excerpt && <div className="mt-2 text-sm text-white/70 line-clamp-3" dangerouslySetInnerHTML={{__html:n.excerpt}} />}
                            <Link href={`/services/${n.slug}`} className="mt-4 inline-block text-sm font-semibold text-white">Learn more →</Link>
                        </Card>
                    ))}
                </div>}
        </Section>
    )
}

/* PROJECTS */
function ProjectsGrid({ projects }) {
    const nodes = projects?.nodes ?? []
    return (
        <Section className="p-6 sm:p-8 md:p-10">
            <div className="mb-6 flex items-end justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
                <Link href="/projects" className="text-sm text-white hover:underline">View all →</Link>
            </div>
            {nodes.length === 0 ? <Empty label="Add Projects in WP & publish." /> :
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {nodes.map(n=>(
                        <Card key={n.id} className="hover:shadow-neon transition">
                            <div className="text-lg font-semibold" dangerouslySetInnerHTML={{__html:n.title}} />
                            {n.excerpt && <div className="mt-2 text-sm text-white/70 line-clamp-3" dangerouslySetInnerHTML={{__html:n.excerpt}} />}
                            <Link href={`/projects/${n.slug}`} className="mt-4 inline-block text-sm font-semibold text-white">Case study →</Link>
                        </Card>
                    ))}
                </div>}
        </Section>
    )
}

/* TESTIMONIALS */
function Testimonials({ items = [] }) {
    return (
        <Section className="p-6 sm:p-8 md:p-10">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">Words from clients</h2>
            {items.length === 0 ? <Empty label="Add testimonials in WP." /> :
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((t,i)=>(
                        <Card key={i} className="hover:shadow-neon transition">
                            <div className="text-sm text-white/85">“{t.quote}”</div>
                            <div className="mt-3 text-xs text-white/60">{t.author} • {t.role}</div>
                        </Card>
                    ))}
                </div>}
        </Section>
    )
}

/* CTA */
function CTA({ title, text, ctaText, ctaLink, gradient }) {
    return (
        <Section className="overflow-hidden">
            <div className="px-6 py-8 sm:px-8 md:px-12 md:py-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title || 'Ready to build?'}</h2>
                    <p className="mt-2 max-w-prose text-sm text-white/75">{text || 'Get a fast, no-fluff proposal in 48 hours.'}</p>
                </div>
                <div className="flex gap-3">
                    <Link href={ctaLink || '/contact'} className="rounded-xl px-5 py-3 text-sm font-semibold text-black glow-edge" style={gradient}>{ctaText || 'Book intro call'}</Link>
                </div>
            </div>
        </Section>
    )
}

function Empty({ label }) {
    return <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/70">{label}</div>
}
