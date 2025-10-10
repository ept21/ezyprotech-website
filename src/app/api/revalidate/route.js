import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
export async function POST(req){
    const secret = req.headers.get('x-revalidate-secret')
    if (secret !== process.env.REVALIDATE_SECRET) return NextResponse.json({ ok:false }, { status:401 })
    const { slug, path } = await req.json().catch(()=>({}))
    if (path) revalidatePath(path)
    if (slug) {
        revalidatePath(`/blog/${slug}`)
        revalidatePath(`/services/${slug}`)
        revalidatePath(`/projects/${slug}`)
        revalidatePath(`/${slug}`)
    }
    revalidatePath('/')
    return NextResponse.json({ revalidated:true, now: Date.now() })
}
