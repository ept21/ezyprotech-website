export const revalidate = 60

import Container from '@/app/components/common/Container'
import { getClient } from '@/app/lib/graphql/client'
import { HOME_QUERY, FRONT_PAGE_QUERY } from '@/app/lib/graphql/queries'
import { getAcfImageUrl } from '@/app/lib/wp'

// Cache פנימי למניעת בקשות כפולות
let cachedHomePageId = null

export default async function HomePage() {
  const client = getClient()

  // 1️⃣ משוך את ה-ID של דף הבית (רק פעם אחת)
  if (!cachedHomePageId) {
    const frontData = await client.request(FRONT_PAGE_QUERY)
    const allPages = frontData?.pages?.nodes || []
    const frontPage = allPages.find(p => p.isFrontPage)
    cachedHomePageId = frontPage?.id || null
  }

  const homePageId = cachedHomePageId

  if (!homePageId) {
    return (
        <main className="text-center py-20 text-white">
          <h1 className="text-3xl font-bold">⚠️ לא נמצא דף בית</h1>
          <p>ודא שדף הבית מוגדר בוורדפרס תחת Settings → Reading</p>
        </main>
    )
  }

  // 2️⃣ משוך נתוני דף הבית בפועל
  const vars = {
    id: homePageId,
    servicesFirst: 6,
    projectsFirst: 6,
    bundlesFirst: 6,
    articlesFirst: 3,
    techNewsFirst: 3,
    eventsFirst: 3,
    faqFirst: 6,
  }

  const data = await client.request(HOME_QUERY, vars)
  const hp = data?.page?.homePageFields


  // 3️⃣ הוצא תמונות Hero (ACF)
  const heroBgUrl = getAcfImageUrl(hp?.hero?.heroBgImage)
  const heroBgMobileUrl = getAcfImageUrl(hp?.hero?.heroBgImageMobile)

  // 4️⃣ שירותים (Services)
  const servicesConf = hp?.services
  let servicesList = data?.services?.nodes || []

  if (
      servicesConf?.servicesSource === 'manual' &&
      servicesConf?.servicesItems?.nodes?.length
  ) {
    const idSet = new Set(servicesConf.servicesItems.nodes.map(n => String(n.id)))
    servicesList = servicesList.filter(n => idSet.has(String(n.id)))
  }

  if (servicesConf?.servicesDisplayLimit) {
    const lim = Math.max(1, Math.min(24, servicesConf.servicesDisplayLimit))
    servicesList = servicesList.slice(0, lim)
  }

  const getFeatured = n =>
      n?.featuredImage?.node?.mediaItemUrl ||
      n?.featuredImage?.node?.sourceUrl ||
      null

  // 5️⃣ הצגה
  return (
      <main>
        {/*<h1 className="text-white">✅ דף הבית נטען בהצלחה!</h1>*/}

        {/* HERO */}
        {hp?.hero?.heroTitle && (
            <section
                className="relative"
                style={
                  heroBgUrl
                      ? { backgroundImage: `url(${heroBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : undefined
                }
            >
              <Container className="py-16 text-white">
                <h1 className="text-4xl font-bold">{hp.hero.heroTitle}</h1>
                {hp.hero.heroSubtitle && (
                    <p className="mt-2 text-lg opacity-80">{hp.hero.heroSubtitle}</p>
                )}
                {hp.hero.heroContent && (
                    <div className="prose mt-4" dangerouslySetInnerHTML={{ __html: hp.hero.heroContent }} />
                )}
              </Container>
            </section>
        )}


        {/* SERVICES */}
        {hp?.services?.showServices && (
            <section id="services" className="py-16">
              <Container>
                <h2 className="text-2xl font-bold">{hp.services.servicesTitle || 'Services'}</h2>

                {servicesList.length ? (
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {servicesList.map(n => {
                        const img = getFeatured(n)
                        return (
                            <div key={n.id} className="border rounded-xl overflow-hidden">
                              {img && (
                                  <img
                                      src={img}
                                      alt={n.title}
                                      className="aspect-[16/9] object-cover w-full"
                                  />
                              )}
                              <div className="p-4">
                                <a href={n.uri} className="font-semibold hover:text-brand-600">
                                  {n.title}
                                </a>
                              </div>
                            </div>
                        )
                      })}
                    </div>
                ) : (
                    <p className="mt-4 text-gray-500">No services yet.</p>
                )}
              </Container>
            </section>
        )}

        {/* BUNDLES */}
        {hp?.bundles?.showBundles && (
            <section
                id="bundles"
                className="py-16"
                style={
                  getAcfImageUrl(hp.bundles.bundlesBgImage)
                      ? { backgroundImage: `url(${getAcfImageUrl(hp.bundles.bundlesBgImage)})`, backgroundSize: 'cover' }
                      : undefined
                }
            >
              <Container>
                <h2 className="text-2xl font-bold">{hp.bundles.bundlesTitle}</h2>
                {hp.bundles.bundlesSubtitle && <p>{hp.bundles.bundlesSubtitle}</p>}
                {hp.bundles.bundlesContent && (
                    <div className="prose mt-4" dangerouslySetInnerHTML={{ __html: hp.bundles.bundlesContent }} />
                )}
              </Container>
            </section>
        )}

        {/* PROJECTS */}
        {hp?.projects?.showProjects && (
            <section id="projects" className="py-16 bg-gray-950">
              <Container>
                <h2 className="text-2xl font-bold">{hp.projects.projectsTitle}</h2>
                {hp.projects.projectsSubtitle && <p>{hp.projects.projectsSubtitle}</p>}
                {hp.projects.projectsContent && (
                    <div className="prose mt-4" dangerouslySetInnerHTML={{ __html: hp.projects.projectsContent }} />
                )}
              </Container>
            </section>
        )}



      </main>
  )
}
