import Link from 'next/link'
import Media from './Media'

export default function Card({ title, href, image, excerpt }) {
    return (
        <Link href={href} className="group block rounded-xl overflow-hidden border hover:shadow-md transition">
            {image && <div className="aspect-[16/9] relative"><Media src={image} alt={title} fill /></div>}
            <div className="p-4">
                <h3 className="font-semibold group-hover:text-brand-600">{title}</h3>
                {excerpt && <p className="mt-2 text-sm text-gray-600 line-clamp-3" dangerouslySetInnerHTML={{__html: excerpt}} />}
            </div>
        </Link>
    )
}
