export const revalidate = 60

import Container from '@/components/common/Container'
import { getClient } from '@/lib/graphql/client'
import { HOME_QUERY, FRONT_PAGE_QUERY } from '@/lib/graphql/queries'
import { getAcfImageUrl } from '@/lib/wp'

// Cache פנימי למניעת בקשות כפולות (שרת בלבד)
let cachedHomePageId = null

export default async function HomePage() {
  const client = getClient()

  // 1) משוך את ה-ID של דף הבית (רק פעם אחת לכל ריסטארט של השרת)
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

  // 2) משוך נתוני דף הבית
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

  const heroBgUrl = getAcfImageUrl(hp?.hero?.heroBgImage)
  const heroBgMobileUrl = getAcfImageUrl(hp?.hero?.heroBgImageMobile)

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

  return (
      <main>

        {/* HERO (match schema you posted) */}
        {hp?.hero?.heroTitle && (() => {
          const h = hp.hero
          const bg = getAcfImageUrl(h?.heroBgImage)
          const bgMobile = getAcfImageUrl(h?.heroBgImageMobile)

          // כפתורים מתוך שני שדות ה-Link בלבד
          const ctas = []
          if (h?.herocta1url?.url) {
            ctas.push({
              title: h.herocta1url.title || 'Get Started',
              url:   h.herocta1url.url,
              target: h.herocta1url.target || '_self',
            })
          }
          if (h?.cta2url?.url) {
            ctas.push({
              title: h.cta2url.title || 'Learn More',
              url:   h.cta2url.url,
              target: h.cta2url.target || '_self',
            })
          }

          const getRel = (t) => (t === '_blank' ? 'noopener noreferrer' : undefined)

          return (
              <section id="home" className="hero bg-fixed bg-cover bg-center w-full" style={bg ? { backgroundImage: `url(${bg})` } : undefined}>
                {bgMobile && (
                    <style
                        dangerouslySetInnerHTML={{
                          __html: `
              @media (max-width: 768px) {
                #home.hero { background-image: url(${bgMobile}) !important; }
              }
            `,
                        }}
                    />
                )}

                <div className="hero-content">
                  <div className="text-rotator">
                    <div className="text-set active">
                      <h1 className="glitch-text" data-text={h.heroTitle}>{h.heroTitle}</h1>
                      {h.heroSubtitle && <p className="subtitle">{h.heroSubtitle}</p>}
                    </div>
                  </div>

                  {h.heroContent && (
                      <div className="prose mt-6  mx-auto text-center" dangerouslySetInnerHTML={{ __html: h.heroContent }} />
                  )}
                </div>

                {ctas.length > 0 && (
                    <div className="cta-container">
                      {ctas.map((btn, idx) => (
                          <a
                              key={idx}
                              href={btn.url}
                              className={`cta-button ${idx === 0 ? 'cta-primary' : 'cta-secondary'}`}
                              target={btn.target}
                              rel={getRel(btn.target)}
                          >
                            {btn.title}
                          </a>
                      ))}
                    </div>
                )}
                Hello
              </section>
          )
        })()}








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
