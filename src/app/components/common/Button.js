import Link from 'next/link'
export default function Button({ href, children, external }) {
    const base = 'inline-block rounded-md px-4 py-2 bg-brand-600 text-white hover:bg-brand-700'
    if (external) return <a className={base} href={href} target="_blank" rel="noreferrer noopener">{children}</a>
    return <Link className={base} href={href}>{children}</Link>
}
