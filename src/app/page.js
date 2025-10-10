// src/app/page.js

import { wp } from '@/lib/wp'
import { HOME_QUERY } from '@/lib/home'
import Sections from '@/components/sections/HomeSections'
import { getSiteData } from '@/lib/site'

export const revalidate = 300

export default async function Home() {
  // ברירות מחדל בטוחות, כדי שהדף יעבוד גם אם ה־CMS עוד לא מוכן
  let blocks = []
  let primary = '#22d3ee'
  let accent  = '#7c3aed'

  // 1) משיכת בלוקים לעמוד הבית מ-WordPress (GraphQL)
  try {
    const { data } = await wp.query({ query: HOME_QUERY, fetchPolicy: 'no-cache' })
    blocks = data?.page?.homepage?.pageBuilder ?? []
  } catch (err) {
    console.error('HOME_QUERY failed:', err)
  }

  // 2) משיכת אופציות גלובליות של האתר (לא חובה; אם נופל נשאר עם דיפולטים)
  try {
    const site = await getSiteData().catch(() => null)
    if (site?.opts?.brandPrimary) primary = site.opts.brandPrimary
    if (site?.opts?.brandAccent)  accent  = site.opts.brandAccent
  } catch (err) {
    console.warn('getSiteData failed (using defaults):', err)
  }

  const gradient = { backgroundImage: `linear-gradient(90deg, ${primary}, ${accent})` }

  // 3) רנדר של הסקשנים הדינמיים (נשלטים מה־CMS)
  return <Sections blocks={blocks} gradient={gradient} />
}
