import Image from 'next/image'
export default function Media({ src, alt='', fill=false, w=1200, h=630 }) {
    if (!src) return null
    if (fill) return <div className="relative w-full h-[50vh]"><Image src={src} alt={alt} fill priority /></div>
    return <Image src={src} alt={alt} width={w} height={h} />
}
