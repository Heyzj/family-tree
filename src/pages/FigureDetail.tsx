import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Image } from 'antd'
import {
  homeStore,
  readHomePageData,
  type HomePageData,
} from '@modules/pages/home'

const FigureDetail: React.FC = () => {
  const { name } = useParams<{ name: string }>()
  const [, setData] = React.useState<HomePageData>(homeStore().defaultData)
  const [figure, setFigure] = React.useState<{
    name: string
    era?: string
    desc?: string
    img?: string
    to?: string
  } | null>(null)

  React.useEffect(() => {
    let alive = true
    readHomePageData().then((next) => {
      if (alive) {
        setData(next || homeStore().defaultData)
        const found = next?.figures?.items?.find((item) => item.name === name)
        setFigure(found || null)
      }
    })
    return () => {
      alive = false
    }
  }, [name])

  if (!figure) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">未找到先贤信息</h1>
          <Link to="/" className="text-primary hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary rounded-full -z-10 blur-2xl"></div>
            <Image
              src={figure.img}
              alt={figure.name}
              className="rounded-sm shadow-custom w-full h-auto object-cover"
              preview={{ mask: '点击查看' }}
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                {figure.name}
              </h1>
              {figure.era && (
                <div className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium">
                  {figure.era}
                </div>
              )}
            </div>

            <div className="prose prose-lg max-w-none text-foreground">
              <div dangerouslySetInnerHTML={{ __html: figure.desc || '' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FigureDetail
