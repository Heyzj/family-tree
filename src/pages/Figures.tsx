import React from 'react'
import { Link } from 'react-router-dom'
import SectionTitle from '../components/ui-custom/SectionTitle'
import ScrollReveal from '../components/ui-custom/ScrollReveal'
import {
  homeStore,
  readHomePageData,
  type HomePageData,
} from '@modules/pages/home'

const Figures: React.FC = () => {
  const [data, setData] = React.useState<HomePageData>(homeStore().defaultData)

  React.useEffect(() => {
    let alive = true
    readHomePageData().then((next) => {
      if (alive) setData(next || homeStore().defaultData)
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-7xl mx-auto px-6 pt-5 pb-8">
        <ScrollReveal>
          <SectionTitle
            title={data.figures?.sectionTitle?.title}
            subtitle={data.figures?.sectionTitle?.subtitle}
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-16">
          {data.figures?.items?.map((person, idx) => (
            <ScrollReveal key={idx} delayMs={idx * 90}>
              <div className="bg-white/80 backdrop-blur-md border border-blue-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl group hover:-translate-y-2 transition-all duration-300">
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={person.img}
                    alt={person.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 sepia-[40%] will-change: transform"
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-serif font-bold text-primary">
                    {person.era}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-serif font-bold text-foreground mb-3">
                    {person.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {(() => {
                      const plainText = (person.desc || '').replace(/<[^>]*>/g, '')
                      return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText
                    })()}
                  </p>
                  <Link
                    to={`/figure/${person.name}`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50/60 backdrop-blur-md border border-blue-200 rounded-lg hover:bg-blue-100/80 hover:shadow-md transition-all"
                  >
                    了解更多
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Figures