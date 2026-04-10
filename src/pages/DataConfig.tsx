import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Layout,
  Menu,
  Button,
  Input,
  Upload,
  message,
  Form,
  Card,
  Space,
  Alert,
} from 'antd'
import type { FormInstance } from 'antd/es/form'
import {
  UploadOutlined,
  DownloadOutlined,
  ImportOutlined,
} from '@ant-design/icons'
import QuillEditor from '../components/quil-editor'
import { fileToBase64 } from '../common/imageUtils'
import { v4 as uuidv4 } from 'uuid'
import type { FamilyData, Member } from '../types/family'
import FamilyConfig from '../components/FamilyConfig'

const { Sider, Content } = Layout
const { TextArea } = Input

const DataConfig: React.FC = () => {
  const [searchParams] = useSearchParams()
  const [selectedKey, setSelectedKey] = useState(() => {
    const tabParam = searchParams.get('tab')
    return tabParam && ['0', '1', '2', '3', '4', '5'].includes(tabParam)
      ? tabParam
      : '0'
  })
  const formRef = useRef<FormInstance>(null)

  // 首页文案配置表单状态
  const [heroFormData, setHeroFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    backgroundImage: '',
    buttonLabel: '',
    familyName: '',
    navTitle: '',
    navSubtitle: '',
  })

  // 渊源与传承表单状态
  const [originFormData, setOriginFormData] = useState({
    title: '',
    description: '',
    image: '',
    content: '',
    ctaLabel: '',
  })

  // 先贤风采表单状态
  interface FigureItem {
    name: string
    era?: string
    desc?: string
    img?: string
    to?: string
  }

  const [figuresFormData, setFiguresFormData] = useState<FigureItem[]>([])
  const [figuresMoreCtaLabel, setFiguresMoreCtaLabel] =
    useState('查看更多先祖条目')

  // 家族纪事表单状态
  interface EventItem {
    name: string
    time?: string
    location?: string
    img?: string
    desc?: string
  }

  const [eventsFormData, setEventsFormData] = useState<EventItem[]>([])
  const [eventsMoreCtaLabel, setEventsMoreCtaLabel] =
    useState('查看更多家族纪事条目')

  // 族谱数据状态
  const [familyData, setFamilyData] = useState<FamilyData>({
    version: '1.0',
    lastModified: new Date().toISOString(),
    familyName: '',
    members: [],
  })

  const menuItems = [
    { key: '0', label: '首页文案配置' },
    { key: '1', label: '渊源与传承' },
    { key: '2', label: '先贤风采' },
    { key: '3', label: '家族纪事' },
    { key: '4', label: '族谱配置' },
    { key: '5', label: '一键配置' },
  ]

  // 读取home.json文件并回填数据
  const loadHomeData = useCallback(async () => {
    try {
      // 使用相对路径，后端会重定向到 userData 目录
      const filePath = 'modules/pages/home.json'

      // 读取现有文件内容
      const existingData =
        (await window.electronAPI?.readFile(filePath)) || '{}'
      const homeData = JSON.parse(existingData)

      // 使用异步回调更新状态，避免同步setState导致级联渲染
      setTimeout(() => {
        // 更新首页文案数据
        if (homeData.hero) {
          setHeroFormData({
            title: homeData.hero.title || '',
            subtitle: homeData.hero.subtitle || '',
            description: homeData.hero.description || '',
            backgroundImage: homeData.hero.backgroundImage || '',
            buttonLabel: homeData.hero.primaryCta?.label || '',
            familyName: homeData.hero.familyName || '趙',
            navTitle: homeData.hero.navTitle || '威宁赵氏',
            navSubtitle: homeData.hero.navSubtitle || 'WeiNing Zhao',
          })
        }

        // 更新状态
        if (homeData.origins) {
          const { origins } = homeData
          setOriginFormData({
            title: origins.sectionTitle?.title || '',
            description: origins.sectionTitle?.subtitle || '',
            image: origins.image?.src || '',
            content: origins.paragraphs?.join('\n\n') || '',
            ctaLabel: origins.cta?.label || '',
          })
        }

        // 更新状态
        if (homeData.figures && homeData.figures.items) {
          setFiguresFormData(homeData.figures.items)
          setFiguresMoreCtaLabel(homeData.figures.moreCta?.label || '')
        }

        // 更新家族纪事数据
        if (homeData.events && homeData.events.items) {
          setEventsFormData(homeData.events.items)
          setEventsMoreCtaLabel(homeData.events.moreCta?.label || '')
        }
      }, 0)
    } catch {
      message.error('读取数据失败，请重试')
    }
  }, [])

  // 加载族谱数据
  const loadFamilyData = useCallback(async () => {
    try {
      // 使用相对路径，后端会重定向到 userData 目录
      const filePath = 'modules/pages/family.json'

      // 读取现有文件内容
      const existingData =
        (await window.electronAPI?.readFile(filePath)) || '{}'
      const familyJson = JSON.parse(existingData)

      if (
        familyJson.version &&
        familyJson.members &&
        familyJson.members.length > 0
      ) {
        // 使用异步回调更新状态，避免同步setState导致级联渲染
        setTimeout(() => {
          setFamilyData(familyJson)
        }, 0)
      } else {
        // 如果没有数据，创建默认根节点
        const rootMember: Member = {
          id: uuidv4(),
          name: '始祖',
          gender: 'male',
          childrenIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        // 使用异步回调更新状态，避免同步setState导致级联渲染
        setTimeout(() => {
          setFamilyData({
            version: '1.0',
            lastModified: new Date().toISOString(),
            familyName: '',
            rootMemberId: rootMember.id,
            members: [rootMember],
          })
        }, 0)
      }
    } catch {
      // 如果文件不存在，创建默认根节点
      const rootMember: Member = {
        id: uuidv4(),
        name: '始祖',
        gender: 'male',
        childrenIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      // 使用异步回调更新状态，避免同步setState导致级联渲染
      setTimeout(() => {
        setFamilyData({
          version: '1.0',
          lastModified: new Date().toISOString(),
          familyName: '',
          rootMemberId: rootMember.id,
          members: [rootMember],
        })
      }, 0)
    }
  }, [])

  // 组件挂载时加载home数据
  useEffect(() => {
    loadHomeData()
  }, [loadHomeData])

  // 切换到族谱配置标签时加载族谱数据
  useEffect(() => {
    if (selectedKey === '4') {
      loadFamilyData()
    }
  }, [selectedKey, loadFamilyData])

  // 当状态更新时，更新表单值
  useEffect(() => {
    // 确保表单引用存在
    if (formRef.current) {
      if (selectedKey === '0') {
        formRef.current.setFieldsValue({
          heroTitle: heroFormData.title,
          heroSubtitle: heroFormData.subtitle,
          heroDescription: heroFormData.description,
          heroButtonLabel: heroFormData.buttonLabel,
          familyName: heroFormData.familyName,
          navTitle: heroFormData.navTitle,
          navSubtitle: heroFormData.navSubtitle,
        })
      } else if (selectedKey === '1') {
        formRef.current.setFieldsValue({
          title: originFormData.title,
          description: originFormData.description,
          content: originFormData.content,
          ctaLabel: originFormData.ctaLabel,
        })
      } else if (selectedKey === '2') {
        formRef.current.setFieldsValue({
          figures: figuresFormData,
          moreCtaLabel: figuresMoreCtaLabel,
        })
      } else if (selectedKey === '3') {
        formRef.current.setFieldsValue({
          events: eventsFormData,
          moreCtaLabel: eventsMoreCtaLabel,
        })
      }
    }
  }, [
    selectedKey,
    heroFormData,
    originFormData,
    figuresFormData,
    figuresMoreCtaLabel,
    eventsFormData,
    eventsMoreCtaLabel,
  ])

  // 图片上传处理
  const handleImageUpload = async (file: File) => {
    try {
      const base64 = await fileToBase64(file)
      setOriginFormData((prev) => ({ ...prev, image: base64 }))
      message.success('图片上传成功')
    } catch {
      message.error('图片上传失败')
    }
    return false // 阻止默认上传行为
  }

  // 首页背景图片上传处理
  const handleHeroBackgroundUpload = async (file: File) => {
    try {
      const base64 = await fileToBase64(file)
      setHeroFormData((prev) => ({ ...prev, backgroundImage: base64 }))
      message.success('背景图片上传成功')
    } catch {
      message.error('背景图片上传失败')
    }
    return false // 阻止默认上传行为
  }

  // 先贤图片上传处理
  const handleFigureImageUpload = async (file: File, index: number) => {
    try {
      const base64 = await fileToBase64(file)
      setFiguresFormData((prev) => {
        const newData = [...prev]
        newData[index] = { ...newData[index], img: base64 }
        return newData
      })
      message.success('图片上传成功')
    } catch {
      message.error('图片上传失败')
    }
    return false // 阻止默认上传行为
  }

  // 家族纪事图片上传处理
  const handleEventImageUpload = async (file: File, index: number) => {
    try {
      const base64 = await fileToBase64(file)
      setEventsFormData((prev) => {
        const newData = [...prev]
        newData[index] = { ...newData[index], img: base64 }
        return newData
      })
      message.success('图片上传成功')
    } catch {
      message.error('图片上传成功')
    }
    return false // 阻止默认上传行为
  }

  // 保存首页文案数据
  const handleSaveHeroData = async () => {
    if (formRef.current) {
      formRef.current
        .validateFields()
        .then(async (values) => {
          try {
            // 使用相对路径，后端会重定向到 userData 目录
            const filePath = 'modules/pages/home.json'

            // 读取现有文件内容
            const existingData =
              (await window.electronAPI?.readFile(filePath)) || '{}'
            const homeData = JSON.parse(existingData)

            // 更新首页文案数据
            homeData.hero = {
              title: values.heroTitle,
              subtitle: values.heroSubtitle,
              description: heroFormData.description,
              backgroundImage: heroFormData.backgroundImage,
              primaryCta: {
                label: values.heroButtonLabel,
                to: homeData.hero?.primaryCta?.to || '/history',
              },
              familyName: values.familyName,
              navTitle: values.navTitle,
              navSubtitle: values.navSubtitle,
            }

            // 写入文件
            await window.electronAPI?.writeFile(
              filePath,
              JSON.stringify(homeData, null, 2),
            )

            message.success('数据保存成功')
          } catch {
            message.error('保存失败，请重试')
          }
        })
        .catch(() => {
          message.error('表单验证失败，请检查必填项')
        })
    }
  }

  // 保存数据到JSON文件
  const handleSaveOriginData = async () => {
    if (formRef.current) {
      formRef.current
        .validateFields()
        .then(async (values) => {
          try {
            // 使用相对路径，后端会重定向到 userData 目录
            const filePath = 'modules/pages/home.json'

            // 读取现有文件内容
            const existingData =
              (await window.electronAPI?.readFile(filePath)) || '{}'
            const homeData = JSON.parse(existingData)

            // 更新渊源与传承数据
            homeData.origins = {
              sectionTitle: {
                title: values.title,
                subtitle: values.description,
                align: 'left',
              },
              image: {
                src: originFormData.image,
                alt: values.title,
              },
              paragraphs: values.content
                .split('\n\n')
                .filter((p: string) => p.trim()),
              cta: { label: values.ctaLabel, to: '/history' },
            }

            // 写入文件
            await window.electronAPI?.writeFile(
              filePath,
              JSON.stringify(homeData, null, 2),
            )

            message.success('数据保存成功')
          } catch {
            message.error('保存失败，请重试')
          }
        })
        .catch(() => {
          message.error('表单验证失败，请检查必填项')
        })
    }
  }

  // 保存先贤风采数据
  const handleSaveFiguresData = async () => {
    if (formRef.current) {
      formRef.current
        .validateFields()
        .then(async () => {
          try {
            // 使用相对路径，后端会重定向到 userData 目录
            const filePath = 'modules/pages/home.json'

            // 读取现有文件内容
            const existingData =
              (await window.electronAPI?.readFile(filePath)) || '{}'
            const homeData = JSON.parse(existingData)

            // 更新先贤风采数据
            homeData.figures = {
              sectionTitle: {
                title: '历代先贤风采',
                subtitle: 'Prominent Figures',
              },
              items: figuresFormData.map((item: FigureItem) => ({
                name: item.name,
                era: item.era || '',
                desc: item.desc || '',
                img: item.img || '',
                to: item.to || `/figure/${encodeURIComponent(item.name)}`,
              })),
              moreCta: { label: figuresMoreCtaLabel, to: '/figures' },
            }

            // 写入文件
            await window.electronAPI?.writeFile(
              filePath,
              JSON.stringify(homeData, null, 2),
            )

            message.success('数据保存成功')
          } catch {
            message.error('保存失败，请重试')
          }
        })
        .catch(() => {
          message.error('表单验证失败，请检查必填项')
        })
    }
  }

  // 保存家族纪事数据
  const handleSaveEventsData = async () => {
    if (formRef.current) {
      formRef.current
        .validateFields()
        .then(async () => {
          try {
            // 使用相对路径，后端会重定向到 userData 目录
            const filePath = 'modules/pages/home.json'

            // 读取现有文件内容
            const existingData =
              (await window.electronAPI?.readFile(filePath)) || '{}'
            const homeData = JSON.parse(existingData)

            // 更新家族纪事数据
            homeData.events = {
              sectionTitle: {
                title: '家族纪事',
                subtitle: 'Family Events',
              },
              items: eventsFormData.map((item: EventItem) => ({
                name: item.name,
                time: item.time || '',
                location: item.location || '',
                img: item.img || '',
                desc: item.desc || '',
              })),
              moreCta: { label: eventsMoreCtaLabel, to: '/events' },
            }

            // 写入文件
            await window.electronAPI?.writeFile(
              filePath,
              JSON.stringify(homeData, null, 2),
            )

            message.success('数据保存成功')
          } catch {
            message.error('保存失败，请重试')
          }
        })
        .catch(() => {
          message.error('表单验证失败，请检查必填项')
        })
    }
  }

  // 导出文案配置（home.json）
  const handleExportHomeConfig = async () => {
    try {
      // 使用相对路径，后端会重定向到 userData 目录
      const filePath = 'modules/pages/home.json'
      const existingData =
        (await window.electronAPI?.readFile(filePath)) || '{}'

      const result = await window.electronAPI?.showSaveDialog({
        title: '导出文案配置',
        defaultPath: 'home.json',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
      })

      if (result && !result.canceled && result.filePath) {
        await window.electronAPI?.writeFile(result.filePath, existingData)
        message.success('文案配置导出成功')
      }
    } catch {
      message.error('导出失败，请重试')
    }
  }

  // 导入文案配置（覆盖 home.json）
  const handleImportHomeConfig = async (file: File) => {
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string
          const jsonData = JSON.parse(content)

          // 验证 JSON 格式是否符合 home.json 的结构
          if (
            !jsonData.hero ||
            !jsonData.origins ||
            !jsonData.figures ||
            !jsonData.events
          ) {
            message.error('JSON 文件格式不正确，缺少必要字段')
            return
          }

          // 使用相对路径，后端会重定向到 userData 目录
          const filePath = 'modules/pages/home.json'

          // 检查文件是否存在，不存在则先创建空文件
          const existingContent = await window.electronAPI?.readFile(filePath)
          if (existingContent === null || existingContent === undefined || existingContent === '') {
            await window.electronAPI?.writeFile(filePath, '{}')
          }

          await window.electronAPI?.writeFile(
            filePath,
            JSON.stringify(jsonData, null, 2),
          )

          message.success('文案配置导入成功')
          // 重新加载数据
          loadHomeData()
        } catch {
          message.error('JSON 文件格式不正确')
        }
      }
      reader.readAsText(file)
    } catch {
      message.error('导入失败，请重试')
    }
    return false
  }

  // 导出族谱（family.json）
  const handleExportFamilyConfig = async () => {
    try {
      // 使用相对路径，后端会重定向到 userData 目录
      const filePath = 'modules/pages/family.json'
      const existingData =
        (await window.electronAPI?.readFile(filePath)) || '{}'

      const result = await window.electronAPI?.showSaveDialog({
        title: '导出族谱',
        defaultPath: 'family.json',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
      })

      if (result && !result.canceled && result.filePath) {
        await window.electronAPI?.writeFile(result.filePath, existingData)
        message.success('族谱导出成功')
      }
    } catch {
      message.error('导出失败，请重试')
    }
  }

  // 导入族谱（覆盖 family.json）
  const handleImportFamilyConfig = async (file: File) => {
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string
          const jsonData = JSON.parse(content)

          // 验证 JSON 格式是否符合 family.json 的结构
          if (!jsonData.version || !jsonData.members) {
            message.error('JSON 文件格式不正确，缺少必要字段')
            return
          }

          // 使用相对路径，后端会重定向到 userData 目录
          const filePath = 'modules/pages/family.json'

          // 检查文件是否存在，不存在则先创建空文件
          const existingContent = await window.electronAPI?.readFile(filePath)
          if (existingContent === null || existingContent === undefined || existingContent === '') {
            await window.electronAPI?.writeFile(filePath, '{}')
          }

          await window.electronAPI?.writeFile(
            filePath,
            JSON.stringify(jsonData, null, 2),
          )

          message.success('族谱导入成功')
          // 重新加载数据
          loadFamilyData()
        } catch {
          message.error('JSON 文件格式不正确')
        }
      }
      reader.readAsText(file)
    } catch {
      message.error('导入失败，请重试')
    }
    return false
  }

  const getContent = () => {
    switch (selectedKey) {
      case '0':
        return (
          <Form
            ref={formRef}
            layout="vertical"
            initialValues={{
              heroTitle: heroFormData.title,
              heroSubtitle: heroFormData.subtitle,
              heroDescription: heroFormData.description,
              heroButtonLabel: heroFormData.buttonLabel,
              familyName: heroFormData.familyName,
              navTitle: heroFormData.navTitle,
              navSubtitle: heroFormData.navSubtitle,
            }}
          >
            <h2 className="text-2xl font-bold mb-4">首页文案配置</h2>

            <Form.Item
              name="familyName"
              label="姓氏"
              rules={[
                { required: true, message: '请输入姓氏' },
                { max: 2, message: '姓氏不能超过2个字符' },
              ]}
            >
              <Input placeholder="请输入姓氏（最大2字符）" />
            </Form.Item>

            <Form.Item
              name="navTitle"
              label="导航标题"
              rules={[
                { required: true, message: '请输入导航标题' },
                { max: 10, message: '导航标题不能超过10个字符' },
              ]}
            >
              <Input placeholder="请输入导航标题（最大10字符）" />
            </Form.Item>

            <Form.Item
              name="navSubtitle"
              label="导航副标题"
              rules={[
                { required: true, message: '请输入导航副标题' },
                { max: 20, message: '导航副标题不能超过20个字符' },
              ]}
            >
              <Input placeholder="请输入导航副标题（最大20字符）" />
            </Form.Item>

            <Form.Item
              name="heroTitle"
              label="标题"
              rules={[
                { required: true, message: '请输入标题' },
                { max: 100, message: '标题不能超过100个字符' },
              ]}
            >
              <Input placeholder="请输入标题（最大100字符）" />
            </Form.Item>

            <Form.Item
              name="heroSubtitle"
              label="副标题"
              rules={[
                { required: true, message: '请输入副标题' },
                { max: 200, message: '副标题不能超过200个字符' },
              ]}
            >
              <TextArea rows={4} placeholder="请输入副标题（最大200字符）" />
            </Form.Item>

            <Form.Item label="背景图片">
              <Upload
                name="backgroundImage"
                beforeUpload={handleHeroBackgroundUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>上传背景图片</Button>
              </Upload>
              {heroFormData.backgroundImage ? (
                <div className="mt-2">
                  <img
                    src={heroFormData.backgroundImage}
                    alt="背景预览"
                    style={{ maxWidth: '300px', maxHeight: '200px' }}
                  />
                </div>
              ) : (
                <div className="mt-2 text-gray-500">
                  未上传背景图片，将使用默认背景
                </div>
              )}
            </Form.Item>

            <Form.Item
              name="heroButtonLabel"
              label="按钮文案"
              rules={[
                { required: true, message: '请输入按钮文案' },
                { max: 50, message: '按钮文案不能超过50个字符' },
              ]}
            >
              <Input placeholder="请输入按钮文案（最大50字符）" />
            </Form.Item>

            <Form.Item name="heroDescription" label="描述信息">
              <QuillEditor
                value={heroFormData.description}
                onChange={(value) =>
                  setHeroFormData((prev) => ({ ...prev, description: value }))
                }
                style={{ minHeight: '400px', border: 'none' }}
              />
            </Form.Item>

            <div className="flex justify-end">
              <Button
                type="primary"
                onClick={handleSaveHeroData}
                className="px-6 py-2"
              >
                保存
              </Button>
            </div>
          </Form>
        )
      case '1':
        return (
          <Form
            ref={formRef}
            layout="vertical"
            initialValues={{
              title: originFormData.title,
              description: originFormData.description,
              content: originFormData.content,
            }}
          >
            <h2 className="text-2xl font-bold mb-4">渊源与传承</h2>

            <Form.Item
              name="title"
              label="标题名称"
              rules={[
                { required: true, message: '请输入标题名称' },
                { max: 100, message: '标题名称不能超过100个字符' },
              ]}
            >
              <Input placeholder="请输入标题名称（最大100字符）" />
            </Form.Item>

            <Form.Item
              name="description"
              label="说明"
              rules={[
                { required: true, message: '请输入说明' },
                { max: 200, message: '说明不能超过200个字符' },
              ]}
            >
              <TextArea rows={4} placeholder="请输入说明（最大200字符）" />
            </Form.Item>

            <Form.Item label="主页图片">
              <Upload
                name="image"
                beforeUpload={handleImageUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>上传图片</Button>
              </Upload>
              {originFormData.image && (
                <div className="mt-2">
                  <img
                    src={originFormData.image}
                    alt="预览"
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                  />
                </div>
              )}
            </Form.Item>

            <Form.Item
              name="ctaLabel"
              label="按钮文案"
              rules={[
                { required: true, message: '请输入按钮文案' },
                { max: 50, message: '按钮文案不能超过50个字符' },
              ]}
            >
              <Input placeholder="请输入按钮文案（最大50字符）" />
            </Form.Item>

            <Form.Item name="content" label="内容">
              <QuillEditor
                value={originFormData.content}
                onChange={(value) =>
                  setOriginFormData((prev) => ({ ...prev, content: value }))
                }
                style={{ minHeight: '400px', border: 'none' }}
              />
            </Form.Item>

            <div className="flex justify-end">
              <Button
                type="primary"
                onClick={handleSaveOriginData}
                className="px-6 py-2"
              >
                保存
              </Button>
            </div>
          </Form>
        )
      case '2':
        return (
          <Form
            ref={formRef}
            layout="vertical"
            initialValues={{
              figures: figuresFormData,
              moreCtaLabel: figuresMoreCtaLabel,
            }}
          >
            <h2 className="text-2xl font-bold mb-4">先贤风采</h2>

            <Form.Item
              name="moreCtaLabel"
              label="按钮文案"
              rules={[
                { required: true, message: '请输入按钮文案' },
                { max: 50, message: '按钮文案不能超过50个字符' },
              ]}
            >
              <Input
                placeholder="请输入按钮文案（最大50字符）"
                onChange={(e) => setFiguresMoreCtaLabel(e.target.value)}
              />
            </Form.Item>

            <Form.List name="figures">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="border p-4 mb-4 rounded-md">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">先贤 {name + 1}</h3>
                        <Button danger onClick={() => remove(name)}>
                          删除
                        </Button>
                      </div>

                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label="姓名"
                        rules={[
                          { required: true, message: '请输入姓名' },
                          { max: 20, message: '姓名不能超过20个字符' },
                        ]}
                      >
                        <Input placeholder="请输入姓名（最大20字符）" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'era']}
                        label="朝代"
                        rules={[{ max: 10, message: '朝代不能超过10个字符' }]}
                      >
                        <Input placeholder="请输入朝代（最大10字符）" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'img']}
                        label="图片"
                      >
                        <Upload
                          name="image"
                          beforeUpload={(file) =>
                            handleFigureImageUpload(file, name)
                          }
                          showUploadList={false}
                          accept="image/*"
                        >
                          <Button icon={<UploadOutlined />}>上传图片</Button>
                        </Upload>
                        {figuresFormData[name]?.img && (
                          <div className="mt-2">
                            <img
                              src={figuresFormData[name].img}
                              alt="预览"
                              style={{ maxWidth: '200px', maxHeight: '200px' }}
                            />
                          </div>
                        )}
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'desc']}
                        label="简介"
                      >
                        <QuillEditor
                          value={figuresFormData[name]?.desc || ''}
                          onChange={(value) => {
                            setFiguresFormData((prev) => {
                              const newData = [...prev]
                              newData[name] = { ...newData[name], desc: value }
                              return newData
                            })
                          }}
                          style={{ minHeight: '300px', border: 'none' }}
                        />
                      </Form.Item>
                    </div>
                  ))}

                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block>
                      添加先贤
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <div className="flex justify-end">
              <Button
                type="primary"
                onClick={handleSaveFiguresData}
                className="px-6 py-2"
              >
                保存
              </Button>
            </div>
          </Form>
        )
      case '3':
        return (
          <Form
            ref={formRef}
            layout="vertical"
            initialValues={{
              events: eventsFormData,
              moreCtaLabel: eventsMoreCtaLabel,
            }}
          >
            <h2 className="text-2xl font-bold mb-4">家族纪事</h2>

            <Form.Item
              name="moreCtaLabel"
              label="按钮文案"
              rules={[
                { required: true, message: '请输入按钮文案' },
                { max: 50, message: '按钮文案不能超过50个字符' },
              ]}
            >
              <Input
                placeholder="请输入按钮文案（最大50字符）"
                onChange={(e) => setEventsMoreCtaLabel(e.target.value)}
              />
            </Form.Item>

            <Form.List name="events">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="border p-4 mb-4 rounded-md">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">纪事 {name + 1}</h3>
                        <Button danger onClick={() => remove(name)}>
                          删除
                        </Button>
                      </div>

                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label="事迹名称"
                        rules={[
                          { required: true, message: '请输入事迹名称' },
                          { max: 100, message: '事迹名称不能超过100个字符' },
                        ]}
                      >
                        <Input placeholder="请输入事迹名称（最大100字符）" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'time']}
                        label="时间"
                      >
                        <Input
                          placeholder="请输入时间"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'location']}
                        label="地址"
                        rules={[{ max: 100, message: '地址不能超过100个字符' }]}
                      >
                        <Input placeholder="请输入地址（最大100字符）" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'img']}
                        label="图片"
                      >
                        <Upload
                          name="image"
                          beforeUpload={(file) =>
                            handleEventImageUpload(file, name)
                          }
                          showUploadList={false}
                          accept="image/*"
                        >
                          <Button icon={<UploadOutlined />}>上传图片</Button>
                        </Upload>
                        {eventsFormData[name]?.img && (
                          <div className="mt-2">
                            <img
                              src={eventsFormData[name].img}
                              alt="预览"
                              style={{ maxWidth: '200px', maxHeight: '200px' }}
                            />
                          </div>
                        )}
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, 'desc']}
                        label="描述"
                      >
                        <QuillEditor
                          value={eventsFormData[name]?.desc || ''}
                          onChange={(value) => {
                            setEventsFormData((prev) => {
                              const newData = [...prev]
                              newData[name] = { ...newData[name], desc: value }
                              return newData
                            })
                          }}
                          style={{ minHeight: '300px', border: 'none' }}
                        />
                      </Form.Item>
                    </div>
                  ))}

                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block>
                      添加纪事
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <div className="flex justify-end">
              <Button
                type="primary"
                onClick={handleSaveEventsData}
                className="px-6 py-2"
              >
                保存
              </Button>
            </div>
          </Form>
        )
      case '4':
        return (
          <FamilyConfig familyData={familyData} setFamilyData={setFamilyData} />
        )
      case '5':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">一键配置</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="文案配置" className="shadow-sm">
                <Space direction="vertical" size="middle" className="w-full">
                  <div>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={handleExportHomeConfig}
                      className="w-full"
                    >
                      导出文案配置
                    </Button>
                    <p className="text-gray-500 text-sm mt-2">
                      将 /modules/pages/home.json 导出到本地
                    </p>
                  </div>
                  <div>
                    <Upload
                      beforeUpload={handleImportHomeConfig}
                      showUploadList={false}
                      accept=".json"
                    >
                      <Button
                        type="default"
                        icon={<ImportOutlined />}
                        className="w-full"
                      >
                        导入文案配置
                      </Button>
                    </Upload>
                    <p className="text-gray-500 text-sm mt-2">
                      选择 JSON 文件导入并覆盖 home.json
                    </p>
                  </div>
                </Space>
              </Card>

              <Card title="族谱数据" className="shadow-sm">
                <Space direction="vertical" size="middle" className="w-full">
                  <div>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={handleExportFamilyConfig}
                      className="w-full"
                    >
                      导出族谱
                    </Button>
                    <p className="text-gray-500 text-sm mt-2">
                      将 /modules/pages/family.json 导出到本地
                    </p>
                  </div>
                  <div>
                    <Upload
                      beforeUpload={handleImportFamilyConfig}
                      showUploadList={false}
                      accept=".json"
                    >
                      <Button
                        type="default"
                        icon={<ImportOutlined />}
                        className="w-full"
                      >
                        导入族谱
                      </Button>
                    </Upload>
                    <p className="text-gray-500 text-sm mt-2">
                      选择 JSON 文件导入并覆盖 family.json
                    </p>
                  </div>
                </Space>
              </Card>
            </div>
            <div className="mt-10">
              <Alert
                type="info"
                showIcon
                title="数据文件存储位置"
                description={
                  <div className="space-y-1">
                    <p>数据文件（home.json、family.json）存储在以下位置：</p>
                    <ul className="list-disc list-inside ml-4 text-gray-600">
                      <li>
                        Mac: ~/Library/Application Support/family-tree/data/
                      </li>
                      <li>Windows: %APPDATA%/family-tree/data/</li>
                    </ul>
                  </div>
                }
              />
            </div>
          </div>
        )
      default:
        return <div>请选择菜单</div>
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="light">
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => setSelectedKey(key)}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Content style={{ padding: '24px' }}>{getContent()}</Content>
      </Layout>
    </Layout>
  )
}

export default DataConfig
