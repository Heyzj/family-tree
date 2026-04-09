import React, { useMemo, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Segmented } from 'antd'
import type { SegmentedProps } from 'antd'
import {
  HomeOutlined,
  BookOutlined,
  TeamOutlined,
  PictureOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import navigationConfig from '../../../modules/pages/navigation.json'
import { readHomePageData, type HomePageDataOrEmpty } from '@modules/pages/home'

interface HeroConfig {
  familyName?: string
  navTitle?: string
  navSubtitle?: string
}

const Header: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [heroConfig, setHeroConfig] = useState<HeroConfig>({})

  // 从 home.json 读取 hero 配置
  useEffect(() => {
    let alive = true
    readHomePageData().then((data: HomePageDataOrEmpty) => {
      if (alive && data?.hero) {
        setHeroConfig({
          familyName: data.hero.familyName,
          navTitle: data.hero.navTitle,
          navSubtitle: data.hero.navSubtitle,
        })
      }
    })
    return () => {
      alive = false
    }
  }, [])

  const familyName = heroConfig.familyName || ''
  const navTitle = heroConfig.navTitle || ''
  const navSubtitle = heroConfig.navSubtitle || ''

  // Add scroll listener to add shadow on scroll
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const iconMap = useMemo(
    () => ({
      HomeOutlined: HomeOutlined,
      BookOutlined: BookOutlined,
      TeamOutlined: TeamOutlined,
      PictureOutlined: PictureOutlined,
      SettingOutlined: SettingOutlined,
    }),
    [],
  )

  // 获取当前路由路径
  const currentPath = useMemo(() => {
    return location.pathname
  }, [location.pathname])

  // 判断当前页面是否使用 homeNav（首页或家族成员页面）
  const isHomeNavActive = useMemo(() => {
    // 首页使用 homeNav
    if (currentPath === '/') {
      return true
    }
    // 家族成员页面也使用 homeNav
    if (currentPath === '/members') {
      return true
    }
    return false
  }, [currentPath])

  const navLinks = useMemo(() => {
    const config = isHomeNavActive
      ? navigationConfig.homeNav
      : navigationConfig.otherNav
    return config.map((link) => {
      const iconName = link.icon as keyof typeof iconMap
      return {
        ...link,
        icon: iconMap[iconName],
      }
    })
  }, [iconMap, isHomeNavActive])

  // 获取当前选中的导航值
  const currentNavValue = useMemo<SegmentedProps['value']>(() => {
    // 在首页，根据 hash 判断当前选中的锚点
    if (currentPath === '/') {
      const pageHash = location.hash || '#top'
      const currentLink = navLinks.find((link) => link.path === `/${pageHash}`)
      return currentLink?.path ?? '__no_selection__'
    } else {
      // 对于 FigureDetail 和 History 页面，不选中任何导航项
      if (currentPath.startsWith('/figure/') || currentPath === '/history') {
        return '__no_selection__'
      }
      // 其他页面
      const currentLink = navLinks.find((link) => link.path === currentPath)
      return currentLink?.path ?? '__no_selection__'
    }
  }, [currentPath, location.hash, navLinks])

  // 处理 Segmented 切换
  const handleSegmentedChange: SegmentedProps['onChange'] = (value) => {
    const path = value as string
    const hashIndex = path.indexOf('#')

    if (hashIndex !== -1) {
      const hash = path.substring(hashIndex)
      const targetPath = path.substring(0, hashIndex) || '/'

      // 如果已经在目标页面（首页），直接滚动到锚点
      if (location.pathname === targetPath) {
        const element = document.querySelector(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
        // 使用 navigate 更新 URL hash，确保 React Router 状态同步
        navigate(path, { replace: true })
      } else {
        // 需要跳转到其他页面，先导航再滚动
        navigate(path)
        // 延迟滚动，等待页面渲染完成
        setTimeout(() => {
          const element = document.querySelector(hash)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      }
    } else {
      // 没有 hash 的普通路由跳转
      navigate(path)
    }
  }

  return (
    <header
      data-cmp="Header"
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 py-4 ${
        isScrolled
          ? 'bg-background/92 backdrop-blur-md shadow-custom border-b border-border/60'
          : 'bg-transparent'
      }`}
    >
      <div className="px-12 flex items-center justify-between">
        {/* Logo Area */}
        <Link to="/" className="flex items-center gap-3 group">
          {familyName && (
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif text-2xl font-bold group-hover:scale-105 transition-transform shadow-sm ring-1 ring-primary/30">
              {familyName}
            </div>
          )}
          {(navTitle || navSubtitle) && (
            <div className="flex flex-col">
              {navTitle && (
                <span className="text-2xl font-serif font-bold text-foreground tracking-widest">
                  {navTitle}
                </span>
              )}
              {navSubtitle && (
                <span className="text-xs text-muted-foreground tracking-[0.3em]">
                  {navSubtitle}
                </span>
              )}
            </div>
          )}
        </Link>

        {/* Desktop Navigation - Segmented with Glassmorphism */}
        <nav className="hidden md:block">
          <Segmented
            value={currentNavValue}
            onChange={handleSegmentedChange}
            options={navLinks.map((link) => {
              const Icon = link.icon
              return {
                label: (
                  <div className="flex items-center gap-1.5 px-1">
                    <Icon style={{ fontSize: 14 }} />
                    <span>{link.label}</span>
                  </div>
                ),
                value: link.path,
              }
            })}
            className="header-segmented"
          />
        </nav>
      </div>
    </header>
  )
}

export default Header
