import { ModuleJsonStore } from '../_core/ModuleJsonStore'
import homeJson from './home.json'

export type HomePageData = {
  hero: {
    title: string
    subtitle: string
    description: string
    backgroundImage?: string
    primaryCta: { label: string; to: string }
    familyName: string
    navTitle: string
    navSubtitle: string
  }
  origins: {
    sectionTitle: { title: string; subtitle: string; align: 'left' | 'center' }
    image: { src: string; alt: string }
    paragraphs: string[]
    cta: { label: string; to: string }
  }
  figures: {
    sectionTitle: { title: string; subtitle: string }
    items: Array<{
      name: string
      era: string
      desc: string
      img: string
      to: string
    }>
    moreCta: { label: string; to: string }
  }
  events: {
    moreCta: { label: string; to: string }
    sectionTitle: { title: string; subtitle: string; align: 'left' | 'center' }
    moreLink: { label: string; to: string }
    items: Array<{
      name?: string
      time?: string
      location?: string
      img?: string
      desc?: string
    }>
  }
}

export type HomePageDataOrEmpty = HomePageData | null

function isEmptyData(): boolean {
  const json = homeJson as Record<string, unknown>
  return !json || Object.keys(json).length === 0
}

export function homeStore() {
  return new ModuleJsonStore<HomePageData>({
    key: 'pages/home',
    defaultData: homeJson as HomePageData,
  })
}

export async function readHomePageData(): Promise<HomePageDataOrEmpty> {
  if (isEmptyData()) {
    return null
  }
  return await homeStore().read()
}

export function hasHomePageData(): boolean {
  return !isEmptyData()
}

export async function writeHomePageData(next: HomePageData) {
  await homeStore().write(next)
}
