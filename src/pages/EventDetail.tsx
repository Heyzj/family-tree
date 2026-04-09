import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Image } from 'antd'
import { homeStore, readHomePageData, type HomePageData } from '@modules/pages/home'

const EventDetail: React.FC = () => {
  const { name } = useParams<{ name: string }>()
  const [, setData] = React.useState<HomePageData>(homeStore().defaultData)
  const [event, setEvent] = React.useState<{
    name: string
    time?: string
    location?: string
    img?: string
    desc?: string
  } | null>(null)

  React.useEffect(() => {
    let alive = true
    readHomePageData().then((next) => {
      if (alive) {
        setData(next || homeStore().defaultData)
        let found = null
        // 尝试通过 name 字段查找
        found = next?.events?.items?.find(item => item.name === name)
        // 如果没有找到，尝试通过索引查找（处理没有 name 字段的情况）
        if (!found && name?.startsWith('event-')) {
          const index = parseInt(name.replace('event-', ''))
          if (!isNaN(index) && index >= 0 && index < (next?.events?.items?.length || 0)) {
            found = next?.events?.items?.[index] || {}
          }
        }
        setEvent(found ? { ...found, name: found.name || '' } : null)
      }
    })
    return () =>{
      alive = false
    }
  }, [name])

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">未找到事迹信息</h1>
          <Link to="/" className="text-primary hover:underline">返回首页</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="space-y-12">
          <div className="relative">
            {event.img && (
              <div className="max-w-4xl">
                <div className="h-[300px] overflow-hidden rounded-sm shadow-custom">
                  <Image
                    src={event.img}
                    alt={event.name}
                    className="w-full h-full object-contain"
                    preview={{ mask: '点击查看' }}
                  />
                </div>
                <div className="mt-2 text-sm text-muted-foreground text-center">
                  点击图片放大查看
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-serif font-bold text-foreground mb-6">
                {event.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {event.time && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{event.time}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>

            {event.desc && (
              <div className="prose prose-lg max-w-none text-foreground">
                <div dangerouslySetInnerHTML={{ __html: event.desc }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetail