import React from 'react'
import { Link } from 'react-router-dom'
import SectionTitle from '../components/ui-custom/SectionTitle'
import ScrollReveal from '../components/ui-custom/ScrollReveal'
import {
  readHomePageData,
  hasHomePageData,
  type HomePageDataOrEmpty,
} from '@modules/pages/home'
import heroBg from '../assets/bg.png'
import originsDefault from '../assets/origins.jpeg'

const Home: React.FC = () => {
  const [data, setData] = React.useState<HomePageDataOrEmpty>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let alive = true
    readHomePageData().then((next) => {
      if (alive) {
        setData(next)
        setLoading(false)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (!data || !hasHomePageData()) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="text-center px-6">
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
            欢迎使用家族树
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            您还没有配置首页数据，请先录入数据以展示家族信息
          </p>
          <Link
            to="/data-config"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-blue-700 transition-all shadow-lg hover:-translate-y-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            录入数据
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div id="top" className="w-full">
      <section className="relative w-full h-[700px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${data.hero?.backgroundImage || heroBg}")`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/55 via-foreground/40 to-background"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_55%)]" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-widest drop-shadow-lg">
            {data.hero?.title}
          </h1>
          <p className="text-xl text-white/90 mb-10 font-light tracking-wider leading-relaxed">
            {data.hero?.subtitle}
          </p>
          {data.hero?.primaryCta && (
            <Link
              to={data.hero.primaryCta.to}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-white/30 transition-all shadow-lg hover:-translate-y-1 border border-white/30"
            >
              {data.hero.primaryCta.label}
            </Link>
          )}
        </div>
      </section>

      {/* Intro / History Teaser */}
      {data.origins && (
        <section id="origins" className="py-24 px-20 scroll-mt-28 bg-gradient-to-br from-blue-50 via-white to-blue-100">
          <ScrollReveal>
            <div className="grid grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary rounded-full -z-10 blur-2xl"></div>
                <img
                  src={data.origins?.image?.src ? data.origins.image.src : originsDefault}
                  alt={data.origins?.image?.alt || '家族渊源'}
                  className="rounded-sm shadow-custom w-full h-[500px] object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700 will-change: filter"
                  loading="lazy"
                />
              </div>

              <div>
                {data.origins?.sectionTitle && (
                  <SectionTitle
                    title={data.origins?.sectionTitle?.title}
                    subtitle={data.origins?.sectionTitle?.subtitle}
                    align={data.origins?.sectionTitle?.align}
                  />
                )}
                {data.origins?.paragraphs?.map((html, idx) => {
                  const plainText = html?.replace(/<[^>]*>/g, '') || '';
                  const truncatedText = plainText.length > 300 
                    ? plainText.substring(0, 300) + '...'
                    : plainText;
                  
                  return (
                    <p
                      key={idx}
                      className={
                        idx === (data.origins?.paragraphs?.length || 0) - 1
                          ? 'text-foreground/80 leading-loose mb-10 text-lg'
                          : 'text-foreground/80 leading-loose mb-6 text-lg'
                      }
                    >
                      {truncatedText}
                    </p>
                  );
                })}
                {data.origins?.cta && (
                  <Link
                    to={data.origins.cta.to}
                    className="inline-flex items-center gap-2 px-6 py-3 text-blue-600 font-bold bg-white/60 backdrop-blur-md border border-blue-200 rounded-xl hover:bg-white/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    {data.origins.cta.label}
                  </Link>
                )}
              </div>
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* Prominent Figures Teaser */}
      {data.figures && (
        <section
          id="figures"
          className="py-24 px-20 bg-gradient-to-br from-blue-100 via-blue-50 to-white border-y border-blue-200/50 scroll-mt-28"
        >
          <ScrollReveal>
            {data.figures?.sectionTitle && (
              <SectionTitle
                title={data.figures?.sectionTitle?.title}
                subtitle={data.figures?.sectionTitle?.subtitle}
              />
            )}
          </ScrollReveal>

          {data.figures?.items && data.figures.items.length > 0 && (
            <div className="grid grid-cols-3 gap-10 mt-16">
              {data.figures?.items?.slice(0, 3).map((person, idx) => (
                <ScrollReveal key={idx} delayMs={idx * 90}>
                  <div className="bg-white/70 backdrop-blur-md border border-blue-200 rounded-xl overflow-hidden shadow-lg group hover:-translate-y-2 hover:bg-white/90 transition-all duration-300">
                    <div className="h-64 bg-gradient-to-br from-blue-200/50 to-blue-100/50 overflow-hidden relative">
                      {person?.img && (
                        <img
                          src={person.img}
                          alt={person?.name || ''}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                      )}
                      {person?.era && (
                        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-serif font-bold text-blue-600 border border-blue-200">
                          {person.era}
                        </div>
                      )}
                    </div>
                    <div className="p-8">
                      <h3 className="text-2xl font-serif font-bold text-foreground mb-3">
                        {person?.name}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {(() => {
                          const plainText = person?.desc?.replace(/<[^>]*>/g, '') || ''
                          return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText
                        })()}
                      </p>
                      {person?.to && (
                        <Link
                          to={person.to}
                          className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                        >
                          了解更多
                        </Link>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}

          {data.figures?.moreCta && (
            <ScrollReveal delayMs={250}>
              <div className="text-center mt-16">
                <Link
                  to={data.figures?.moreCta?.to}
                  className="inline-block bg-white/60 backdrop-blur-md border border-blue-200 text-blue-600 px-8 py-3 rounded-xl font-medium hover:bg-white/80 hover:shadow-lg transition-all"
                >
                  {data.figures?.moreCta?.label}
                </Link>
              </div>
            </ScrollReveal>
          )}
        </section>
      )}

      {/* Recent Events / News */}
      {data.events && (
        <section id="events" className="py-24 px-20 scroll-mt-28 bg-gradient-to-br from-blue-50 via-white to-blue-100">
          <ScrollReveal>
            <div className="flex justify-between items-end mb-12">
              {data.events?.sectionTitle && (
                <SectionTitle
                  title={data.events?.sectionTitle?.title}
                  subtitle={data.events?.sectionTitle?.subtitle}
                  align={data.events?.sectionTitle?.align}
                />
              )}
            </div>
          </ScrollReveal>

          {data.events?.items && data.events.items.length > 0 && (
            <div className="grid grid-cols-2 gap-10">
              {data.events?.items?.slice(0, 2).map((event, idx) => (
                <ScrollReveal key={idx} delayMs={idx * 100}>
                  <Link to={`/event/${encodeURIComponent(event?.name || `event-${idx}`)}`} className="block h-[200px]">
                    <div className="flex h-full bg-white/80 backdrop-blur-md border border-blue-200 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 group rounded-xl overflow-hidden">
                      <div className="w-2/5 overflow-hidden">
                        {event?.img && (
                          <img
                            src={event.img}
                            alt={event?.name || `事件 ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="w-3/5 p-6 flex flex-col justify-center">
                        <h3 className="text-xl font-bold font-serif mb-4 text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {event?.name || `事件 ${idx + 1}`}
                        </h3>
                        {event?.time && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span>{event.time}</span>
                          </div>
                        )}
                        {event?.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}

          <ScrollReveal delayMs={250}>
            <div className="text-center mt-16">
              <Link
                to={data.events?.moreCta?.to || data.events?.moreLink?.to || '/'}
                className="inline-block bg-white/60 backdrop-blur-md border border-blue-200 text-blue-600 px-8 py-3 rounded-xl font-medium hover:bg-white/80 hover:shadow-lg transition-all"
              >
                {data.events?.moreCta?.label || data.events?.moreLink?.label || '查看更多家族纪事'}
              </Link>
            </div>
          </ScrollReveal>
        </section>
      )}
    </div>
  )
}

export default Home
