"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Header({ menu = [], logoText = 'EzyProTech', gradient }) {
    const [open, setOpen] = useState(false)
    useEffect(() => {
        document.documentElement.classList.toggle('overflow-hidden', open)
        return () => document.documentElement.classList.remove('overflow-hidden')
    }, [open])

    const roots = menu.filter(i => !i.parentId)

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-base-900/70 backdrop-blur-xl">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
          <span className="select-none text-xl sm:text-2xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent" style={gradient}>{logoText.slice(0,3)}</span>
            <span className="text-white">{logoText.slice(3,6)}</span>
            <span className="text-white/60">{logoText.slice(6)}</span>
          </span>
                </Link>

                <nav className="hidden md:flex items-center gap-7 text-sm text-white/80">
                    {roots.map(item => (
                        <Link key={item.id} href={item.path} className="hover:text-white">{item.label}</Link>
                    ))}
                    <Link href="/contact" className="rounded-xl px-4 py-2 text-sm font-semibold text-black glow-edge" style={gradient}>Contact</Link>
                </nav>

                <button onClick={()=>setOpen(true)} className="md:hidden inline-flex items-center justify-center rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white/90" aria-label="Open menu">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </button>
            </div>

            <div className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                <div onClick={()=>setOpen(false)} className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity ${open?'opacity-100':'opacity-0'}`} />
                <aside className={`absolute right-0 top-0 h-full w-[82%] max-w-xs bg-base-900 shadow-2xl ring-1 ring-white/10 transition-transform duration-300 ${open?'translate-x-0':'translate-x-full'}`}>
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                        <div className="font-extrabold text-white">{logoText}</div>
                        <button onClick={()=>setOpen(false)} className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-base-800 px-3 py-2 text-white/90" aria-label="Close menu">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                        </button>
                    </div>
                    <nav className="flex flex-col p-4 text-[15px] text-white/90">
                        {roots.map(item => (
                            <Link key={item.id} href={item.path} onClick={()=>setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/5">{item.label}</Link>
                        ))}
                        <Link href="/contact" onClick={()=>setOpen(false)} className="mt-4 rounded-xl px-4 py-2 text-center text-sm font-semibold text-black" style={gradient}>Contact</Link>
                    </nav>
                </aside>
            </div>
        </header>
    )
}
