import Link from 'next/link'
export default function Footer({ menu = [], social = [], gradient }) {
    const roots = menu.filter(i=>!i.parentId)
    return (
        <footer className="mt-16 border-t border-white/10 bg-base-900">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-white/70 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <span className="font-extrabold text-white">EzyProTech</span>
                    <span className="h-2 w-2 rounded-full" style={gradient} />
                </div>
                <nav className="flex flex-wrap gap-4">
                    {roots.map(i=>(
                        <Link key={i.id} href={i.path} className="hover:text-white">{i.label}</Link>
                    ))}
                </nav>
                <div className="flex items-center gap-3">
                    {social?.map((s,i)=>(
                        <a key={i} href={s.url} className="hover:text-white" target="_blank" rel="noreferrer">{s.name}</a>
                    ))}
                </div>
            </div>
        </footer>
    )
}
