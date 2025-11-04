// /src/app/components/sections/home/ServicesSection.jsx
'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Container from '@/components/common/Container'

function idSafe(v = '') {
    return String(v).replace(/[^a-zA-Z0-9_\-:.]/g, '_')
}

export default function ServicesSection({
                                            title = 'Core Capabilities',
                                            subtitle = 'From strategy to execution — engineered for AI-driven growth.',
                                            tabs = [],
                                            ctaText = 'Talk to an Expert',
                                            ctaHref = '#contact',
                                            bgImage
                                        }) {
    const items = Array.isArray(tabs) && tabs.length ? tabs : []
    const [active, setActive] = React.useState(
        idSafe(items[0]?.id ?? 'tab0')
    )

    React.useEffect(() => {
        // אם הרשימה השתנתה מהשרת – שמור אקטיב חדש תקין
        if (!items.find(t => idSafe(t.id) === active)) {
            setActive(idSafe(items[0]?.id ?? 'tab0'))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(items)])

    const activeItem = items.find(t => idSafe(t.id) === active) ?? items[0]

    return (
        <section
            id="services"
            className=" relative isolate py-28 md:py-36 lg:py-40"
            style={
                bgImage
                    ? {backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center'}
                    : undefined
            }
        >
            {/* BACKGROUND LAYERS */}
            <div className="absolute inset-0 -z-10 bg-[var(--bg-default,#0D1117)] pointer-events-none"/>
            <div
                className="absolute inset-0 -z-10 pointer-events-none bg-[linear-gradient(transparent_95%,rgba(255,255,255,0.05)_96%),linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.05)_96%)] bg-[length:24px_24px] opacity-20"/>
            <div className="svc-scanlines absolute inset-0 -z-10 pointer-events-none opacity-[0.07]"/>
            <div
                className=" abslute inset-0 -z-10 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/40"/>

            <Container className="service-section-container relative z-10 mx-auto max-w-7xl px-6 text-[var(--text-primary,#C9D1D9)]">
                {/* HEADER */}
                <div className="mx-auto max-w-3xl text-center">
                    {title && (
                        <h2 className="tracking-tight font-semibold text-3xl sm:text-4xl md:text-5xl [letter-spacing:-0.01em]">
              <span
                  className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--brand-primary,#00C293)] via-[var(--brand-accent,#00E0A6)] to-[var(--brand-primary,#00C293)]">
                {title}
              </span>
                        </h2>
                    )}
                    {subtitle && (
                        <p className="mt-4 text-base sm:text-lg text-[var(--text-secondary,#8B949E)]">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* TABS */}
                {items.length > 0 && (
                    <div className="mt-12">
                        <div
                            role="tablist"
                            aria-label="Services tabs"
                            className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-3"
                        >
                            {items.map((t) => {
                                const isActive = idSafe(t.id) === active
                                const tabId = `tab-${idSafe(t.id)}`
                                const panelId = `panel-${idSafe(t.id)}`
                                return (
                                    <button
                                        key={tabId}
                                        id={tabId}
                                        type="button"
                                        role="tab"
                                        aria-selected={isActive}
                                        aria-controls={panelId}
                                        onClick={() => setActive(idSafe(t.id))}
                                        className={[
                                            'group relative rounded-full px-4 py-2 text-sm md:text-base transition border',
                                            isActive
                                                ? 'border-[var(--brand-primary,#00C293)]/60 bg-white/5 text-white shadow-[0_0_0_2px_rgba(0,194,147,0.15)_inset]'
                                                : 'border-white/10 bg-white/0 text-[var(--text-secondary,#8B949E)] hover:bg-white/[0.04]'
                                        ].join(' ')}
                                    >
                                        {t.icon && <span className="mr-2">{t.icon}</span>}
                                        <span className="font-medium">{t.label ?? 'Tab'}</span>
                                        <span
                                            aria-hidden
                                            className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                            style={{
                                                boxShadow:
                                                    '0 0 0 1px rgba(0,226,166,0.2) inset, 0 0 24px rgba(0,226,166,0.15)'
                                            }}
                                        />
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* ACTIVE PANEL */}
                <div className="mt-10 md:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
                    {/* Copy side */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`copy-${active}`}
                            role="tabpanel"
                            id={`panel-${active}`}
                            aria-labelledby={`tab-${active}`}
                            initial={{opacity: 0, y: 18}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -12}}
                            transition={{duration: 0.25}}
                            className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 flex flex-col"
                        >
                            <h3 className="text-2xl md:text-3xl font-semibold">
                                {activeItem?.heading ?? activeItem?.label ?? '—'}
                            </h3>

                            {activeItem?.copy && (
                                <p className="mt-3 text-[var(--text-secondary,#8B949E)]">
                                    {activeItem.copy}
                                </p>
                            )}

                            {Array.isArray(activeItem?.bullets) && activeItem.bullets.length > 0 && (
                                <ul className="mt-5 space-y-2.5 text-sm md:text-base">
                                    {activeItem.bullets.map((b, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span
                                                className="mt-1 inline-block h-2 w-2 rounded-full bg-gradient-to-r from-[var(--brand-primary,#00C293)] to-[var(--brand-accent,#00E0A6)]"/>
                                            <span>{b}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="mt-6 flex gap-3">
                                <a href={activeItem?.linkHref || '#'} className="btn-brand">
                                    {activeItem?.linkText || 'Learn more →'}
                                </a>
                                <a href={ctaHref} className="btn-brand-outline">
                                    {ctaText}
                                </a>
                            </div>

                            {/* soft glow */}
                            <div
                                aria-hidden
                                className="pointer-events-none absolute -inset-0.5 -z-10 rounded-2xl blur-xl opacity-30"
                                style={{
                                    background:
                                        'linear-gradient(135deg, rgba(0,194,147,0.18), rgba(0,224,166,0.12))'
                                }}
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Visual side */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`visual-${active}`}
                            initial={{opacity: 0, y: 18}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -12}}
                            transition={{duration: 0.25}}
                            className="relative min-h-[280px] md:min-h-[360px] rounded-2xl border border-white/10 overflow-hidden"
                        >
                            {/* Visual grid */}
                            <div
                                className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(0,226,166,0.1),transparent_60%),radial-gradient(closest-side,rgba(10,132,255,0.1),transparent_60%)] [background-position:left_20%_top_20%,right_10%_bottom_10%]"/>
                            <div
                                className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(255,255,255,0.06)_96%),linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.06)_96%)] bg-[length:22px_22px] opacity-30"/>

                            {/* Optional featured image */}
                            {activeItem?._featured && (
                                <img
                                    src={activeItem._featured}
                                    alt={activeItem?.heading ?? 'Service visual'}
                                    className="absolute inset-0 h-full w-full object-cover opacity-35"
                                />
                            )}

                            {/* moving highlight line */}
                            <motion.div
                                aria-hidden
                                initial={{x: '-30%', opacity: 0}}
                                animate={{x: '140%', opacity: 0.7}}
                                transition={{duration: 3.2, repeat: Infinity, ease: 'easeInOut'}}
                                className="absolute top-1/3 h-[2px] w-1/2 rotate-12 bg-gradient-to-r from-transparent via-[var(--brand-accent,#00E0A6)] to-transparent"
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* SECTION CTA */}
                <div className="mt-12 flex justify-center">
                    <a href={ctaHref} className="btn-brand px-7">
                        {ctaText}
                    </a>
                </div>
            </Container>
        </section>
    )
}
