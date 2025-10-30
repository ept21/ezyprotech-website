'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { isInternalUrl } from '@/app/lib/wp'



export default function Header({
                                   menu = [],
                                   siteTitle = 'EzyProTech',
                                   faviconUrl = null,
                                   siteUrl = '',
                               }) {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    const topLevel = useMemo(() => {
        return (menu || [])
            .filter(i => !i.parentId)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    }, [menu])

    // scroll & active section
    useEffect(() => {
        const navbar = document.getElementById('navbar')

        const onScroll = () => {
            if (navbar) {
                if (window.scrollY > 50) navbar.classList.add('scrolled')
                else navbar.classList.remove('scrolled')
            }
            const sections = document.querySelectorAll('section[id]')
            const scrollPosition = window.pageYOffset + 100
            sections.forEach(section => {
                const top = section.offsetTop
                const height = section.offsetHeight
                const id = section.getAttribute('id')
                if (scrollPosition >= top && scrollPosition < top + height) {
                    document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'))
                    const current = document.querySelector(`.nav-link[href="#${id}"]`)
                    if (current) current.classList.add('active')
                }
            })
        }

        window.addEventListener('scroll', onScroll)
        onScroll()
        return () => window.removeEventListener('scroll', onScroll)
    }, [pathname])

    // smooth anchors + סגירת מובייל אחרי לחיצה
    useEffect(() => {
        const anchors = document.querySelectorAll('a[href^="#"]')
        const handler = (e) => {
            const href = e.currentTarget.getAttribute('href')
            if (!href) return
            const target = document.querySelector(href)
            if (!target) return
            e.preventDefault()
            target.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setOpen(false)
        }
        anchors.forEach(a => a.addEventListener('click', handler))
        return () => anchors.forEach(a => a.removeEventListener('click', handler))
    }, [])

    const NavItem = ({ item }) => {
        const label = item?.label ?? ''
        const href = item?.url ?? '#'
        const classes = 'nav-link'

        if (isInternalUrl(href, siteUrl)) {
            const url = href?.startsWith('http') ? new URL(href, siteUrl).pathname : href
            return <Link href={url} className={classes}>{label}</Link>
        }
        return <a href={href} className={classes} target="_blank" rel="noopener noreferrer">{label}</a>
    }

    return (
        <header className="sticky top-0 z-50 text-white ">
            {/* רקעי הטמפלייט */}
            <div className="grid-bg" />
            <div className="scanlines" />
            <div className="shapes-container">
                <div className="shape shape-circle" />
                <div className="shape shape-triangle" />
                <div className="shape shape-square" />
            </div>
            <div id="particles" />

            <nav id="navbar">
                <div className="nav-container">
                    <Link href="/" className="logo-link">
                        {faviconUrl ? (
                            <img src={faviconUrl} alt={siteTitle} className="w-8 h-8" />
                        ) : (
                            <div className="w-8 h-8 rounded" style={{ background: 'linear-gradient(45deg, var(--brand-primary), var(--brand-accent))' }} />
                        )}
                        <span className="logo-text font-heading">
              <span className="logo-ezy">EzyPro</span><span className="logo-tech">Tech</span>
            </span>
                    </Link>

                    <ul className={`nav-links ${open ? 'active' : ''}`} id="navLinks">
                        {topLevel.map(item => (
                            <li key={item.id}>
                                <NavItem item={item} />
                            </li>
                        ))}
                    </ul>

                    <div
                        className={`menu-toggle ${open ? 'active' : ''}`}
                        id="menuToggle"
                        role="button"
                        aria-label="Toggle navigation"
                        aria-expanded={open}
                        onClick={() => setOpen(v => !v)}
                    >
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </nav>
        </header>
    )
}
