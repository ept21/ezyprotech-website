export default function SectionHeading({ title, subtitle }) {
    return (
        <div className="mb-8">
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            {title && <h2 className="mt-1 text-2xl font-bold">{title}</h2>}
        </div>
    )
}
