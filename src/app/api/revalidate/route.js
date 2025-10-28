import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req) {
    const secret = req.headers.get('x-revalidate-secret')
    if (secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ ok: false }, { status: 401 })
    }
    const { paths = ['/'] } = await req.json().catch(() => ({ paths: ['/'] }))
    paths.forEach(p => revalidatePath(p))
    return NextResponse.json({ revalidated: true, paths })
}
