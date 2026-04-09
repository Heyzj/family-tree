import React from 'react'
import { Link } from 'react-router-dom'
import SectionTitle from '../components/ui-custom/SectionTitle'
import ScrollReveal from '../components/ui-custom/ScrollReveal'
import {
  homeStore,
  readHomePageData,
  type HomePageData,
} from '@modules/pages/home'

const Events: React.FC = () => {
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
      <div className="max-w-7xl mx-auto px-6 py-24">
        <ScrollReveal>
          <SectionTitle
            title={data.events?.sectionTitle?.title}
            subtitle={data.events?.sectionTitle?.subtitle}
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16">
          {data.events?.items?.map((event, idx) => (
            <ScrollReveal key={idx} delayMs={idx * 100}>
              <Link to={`/event/${encodeURIComponent(event?.name || `event-${idx}`)}`} className="block h-[200px]">
                <div className="flex h-full bg-white/80 backdrop-blur-md border border-blue-200 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 group rounded-xl overflow-hidden">
                  <div className="w-2/5 overflow-hidden">
                    <img
                      src={event?.img || ''}
                      alt={event?.name || `事件 ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="w-3/5 p-6 flex flex-col justify-center">
                    <h3 className="text-xl font-bold font-serif mb-4 text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {event?.name || `事件 ${idx + 1}`}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <span>{event?.time || ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{event?.location || ''}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Events