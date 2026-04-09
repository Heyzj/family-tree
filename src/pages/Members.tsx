import React, { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as go from 'gojs'
import { Button, Space, Drawer, Tag, Image } from 'antd'
import { AimOutlined, CompressOutlined, CloseOutlined, SettingOutlined } from '@ant-design/icons'
import type { FamilyData, Member } from '../types/family'

const Members: React.FC = () => {
  const navigate = useNavigate()
  const diagramRef = useRef<HTMLDivElement>(null)
  const diagram = useRef<go.Diagram | null>(null)
  const [familyData, setFamilyData] = React.useState<FamilyData | null>(null)
  const [selectedMember, setSelectedMember] = React.useState<Member | null>(
    null,
  )
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  // 主题颜色配置
  const theme = React.useMemo(
    () => ({
      colors: {
        femaleBadgeBackground: '#FFCBEA',
        maleBadgeBackground: '#A2DAFF',
        femaleBadgeText: '#7A005E',
        maleBadgeText: '#001C76',
        personText: '#383838',
        personNodeBackground: '#FFFFFF',
        selectionStroke: '#485670',
        link: '#686E76',
      },
      fonts: {
        badgeFont: 'bold 12px sans-serif',
        birthDeathFont: '14px sans-serif',
        nameFont: '500 18px sans-serif',
      },
    }),
    [],
  )

  const STROKE_WIDTH = 3
  const CORNER_ROUNDNESS = 12

  // 加载家族数据
  useEffect(() => {
    const loadFamilyData = async () => {
      try {
        // 使用相对路径，后端会重定向到 userData 目录
        const filePath = 'modules/pages/family.json'

        // 读取现有文件内容
        const existingData =
          (await window.electronAPI?.readFile(filePath)) || '{}'
        const familyJson = JSON.parse(existingData)

        if (familyJson.version && familyJson.members) {
          setFamilyData(familyJson)
        }
      } catch (error) {
        console.error('读取family.json文件失败:', error)
      }
    }

    loadFamilyData()
  }, [])

  // 更新图表数据
  const updateDiagramData = useCallback(() => {
    if (!diagram.current || !familyData) return

    const nodes: Array<{
      key: string
      name: string
      gender: string
      birthDate?: string
      deathDate?: string
    }> = []
    const links: Array<{ from: string; to: string }> = []

    familyData.members.forEach((member) => {
      if (!member || !member.id) return
      nodes.push({
        key: member.id,
        name: member.name || '未知',
        gender: member.gender || 'male',
        birthDate: member.birthDate,
        deathDate: member.deathDate,
      })

      if (member.fatherId) {
        links.push({
          from: member.fatherId,
          to: member.id,
        })
      }
    })

    diagram.current.model = new go.GraphLinksModel(nodes, links)

    // 自动调整视图
    setTimeout(() => {
      if (diagram.current) {
        diagram.current.scale = 0.8
        diagram.current.commandHandler.zoomToFit()
      }
    }, 100)
  }, [familyData])

  // 初始化gojs图表
  const initDiagram = useCallback(() => {
    if (!diagramRef.current || !familyData) return

    const $ = go.GraphObject.make

    diagram.current = $(go.Diagram, diagramRef.current, {
      layout: $(go.TreeLayout, {
        angle: 90,
        nodeSpacing: 30,
        layerSpacing: 60,
      }),
      'undoManager.isEnabled': false,
      // 优化缩放性能
      'animationManager.isEnabled': false,
      // 限制缩放范围
      minScale: 0.1,
      maxScale: 3,
      // 允许滚轮缩放
      allowZoom: true,
    })

    // 性别徽章
    const personBadge = () =>
      $(
        go.Panel,
        'Auto',
        {
          alignmentFocus: go.Spot.TopRight,
          alignment: new go.Spot(1, 0, -25, STROKE_WIDTH - 0.5),
        },
        $(
          go.Shape,
          {
            figure: 'RoundedRectangle',
            parameter1: CORNER_ROUNDNESS,
            parameter2: 4 | 8, // 只圆角底部
            desiredSize: new go.Size(NaN, 22.5),
            stroke: null,
          },
          new go.Binding('fill', 'gender', (gender) =>
            gender === 'male'
              ? theme.colors.maleBadgeBackground
              : theme.colors.femaleBadgeBackground,
          ),
        ),
        $(
          go.TextBlock,
          {
            font: theme.fonts.badgeFont,
            margin: new go.Margin(0, 8, 0, 8),
          },
          new go.Binding('stroke', 'gender', (gender) =>
            gender === 'male'
              ? theme.colors.maleBadgeText
              : theme.colors.femaleBadgeText,
          ),
          new go.Binding('text', 'gender', (gender) =>
            gender === 'male' ? '男' : '女',
          ),
        ),
      )

    // 出生-死亡日期文本
    const personBirthDeathTextBlock = () =>
      $(
        go.TextBlock,
        {
          stroke: theme.colors.personText,
          font: theme.fonts.birthDeathFont,
          alignmentFocus: go.Spot.Top,
          alignment: new go.Spot(0.5, 1, 0, -35),
        },
        new go.Binding(
          'text',
          '',
          (data: { birthDate?: string; deathDate?: string }) => {
            if (!data.birthDate) return ''
            const deathText = data.deathDate ? data.deathDate : '至今'
            return `${data.birthDate} - ${deathText}`
          },
        ),
      )

    // 主形状
    const personMainShape = () =>
      $(
        go.Shape,
        'RoundedRectangle',
        {
          name: 'mainShape',
          desiredSize: new go.Size(215, 110),
          portId: '',
          parameter1: CORNER_ROUNDNESS,
          fill: theme.colors.personNodeBackground,
          strokeWidth: STROKE_WIDTH,
          stroke: '#58ADA7',
        },
        new go.Binding('stroke', 'isSelected', (selected) =>
          selected ? theme.colors.selectionStroke : '#58ADA7',
        ).ofObject(),
      )

    // 姓名文本
    const personNameTextBlock = () =>
      $(
        go.TextBlock,
        {
          stroke: theme.colors.personText,
          font: theme.fonts.nameFont,
          desiredSize: new go.Size(160, 50),
          overflow: go.TextOverflow.Ellipsis,
          textAlign: 'center',
          verticalAlignment: go.Spot.Center,
          alignmentFocus: go.Spot.Top,
          alignment: new go.Spot(0.5, 0, 0, 25),
        },
        new go.Binding('text', 'name'),
      )

    // 节点点击事件处理
    const handleNodeClick = (
      _event: go.InputEvent,
      thisObj: go.GraphObject,
    ) => {
      const node = thisObj.part as go.Node
      const nodeData = node.data as { key: string }
      const member = familyData?.members.find((m) => m.id === nodeData.key)
      if (member) {
        setSelectedMember(member)
        setIsModalOpen(true)
      }
    }

    // 定义节点模板
    diagram.current.nodeTemplate = $(
      go.Node,
      'Spot',
      {
        selectionAdorned: false,
        movable: false,
        selectable: true,
        click: handleNodeClick,
        cursor: 'pointer',
      },
      $(
        go.Panel,
        'Spot',
        personMainShape(),
        personNameTextBlock(),
        personBirthDeathTextBlock(),
      ),
      personBadge(),
    )

    // 定义连线模板
    diagram.current.linkTemplate = $(
      go.Link,
      {
        routing: go.Routing.Orthogonal,
        layerName: 'Background',
      },
      $(go.Shape, {
        stroke: theme.colors.link,
        strokeWidth: 1,
      }),
    )

    // 更新图表数据
    updateDiagramData()
  }, [familyData, theme, updateDiagramData])

  // 初始化gojs图表
  useEffect(() => {
    if (familyData && diagramRef.current) {
      initDiagram()
    }

    return () => {
      if (diagram.current) {
        diagram.current.div = null
        diagram.current = null
      }
    }
  }, [familyData, initDiagram])

  // 自适应缩放
  const zoomToFit = () => {
    if (diagram.current) {
      diagram.current.commandHandler.zoomToFit()
    }
  }

  // 居中根节点
  const centerRoot = () => {
    if (!diagram.current || !familyData) return

    // 找到根节点（没有fatherId的成员）
    const rootMember = familyData.members.find((m) => !m.fatherId)
    if (rootMember) {
      const rootNode = diagram.current.findNodeForKey(rootMember.id)
      if (rootNode) {
        diagram.current.centerRect(rootNode.actualBounds)
      }
    }
  }

  return (
    <div className="py-10 px-10 min-h-[80vh]">
      <h1 className="text-3xl font-bold text-center mb-8">家族成员关系图</h1>
      {familyData && familyData.members.length > 0 ? (
        <>
          <Space className="mb-4 justify-center w-full">
            <Button icon={<CompressOutlined />} onClick={zoomToFit}>
              自适应
            </Button>
            <Button icon={<AimOutlined />} onClick={centerRoot}>
              居中根节点
            </Button>
          </Space>
          <div className="relative">
            <div
              ref={diagramRef}
              className="h-[70vh] border border-gray-300 rounded-lg bg-[#fafafa]"
            />
            <div className="absolute w-[300px] h-[100px] z-[2] left-[10px] top-[10px] bg-[#FAFAFA]" />
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 text-xl py-20">
          <div className="mb-4">暂无家族成员数据，请先在数据配置中添加成员</div>
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={() => navigate('/data-config?tab=4')}
          >
            前往族谱配置
          </Button>
        </div>
      )}

      {/* 全屏抽屉展示成员详情 */}
      <Drawer
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="90%"
        closable={false}
        maskClosable={true}
        bodyStyle={{ padding: '40px', overflow: 'auto' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">成员详细信息</h2>
            <Button
              type="text"
              icon={<CloseOutlined className="text-2xl" />}
              onClick={() => setIsModalOpen(false)}
              className="w-12 h-12"
            />
          </div>

          {selectedMember && (
            <div
              className="bg-white/25 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[0_8px_32px_rgba(31,110,180,0.15),inset_0_1px_0_rgba(255,255,255,0.6)] p-10 max-w-[800px] mx-auto"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, rgba(230, 245, 255, 0.4) 0%, rgba(240, 248, 255, 0.3) 100%)',
              }}
            >
              {/* 姓名和辈分区域 */}
              <div className="text-center mb-8 p-5 bg-white/50 rounded-2xl border border-[rgba(100,180,255,0.2)]">
                <div className="text-4xl font-bold bg-gradient-to-r from-[#1a5fb4] via-[#3584e4] to-[#62a0ea] bg-clip-text text-transparent mb-2 tracking-wider">
                  {selectedMember.name}
                </div>
                {selectedMember.generationName && (
                  <Tag color="#62a0ea" className="text-sm px-3 py-1">
                    字辈：{selectedMember.generationName}
                  </Tag>
                )}
              </div>

              {/* 左右分栏布局 */}
              <div className="flex gap-6 flex-wrap">
                {/* 左侧：基本信息 */}
                <div className="flex-1 min-w-[280px]">
                  <div className="text-sm text-[#5b7ba3] font-semibold mb-3 uppercase tracking-wider">
                    基本信息
                  </div>
                  <div className="bg-white/60 rounded-xl px-5 py-4 border border-[rgba(100,180,255,0.15)]">
                    {/* 照片 */}
                    {selectedMember.avatar && (
                      <div className="mb-4 flex justify-center">
                        <Image
                          src={selectedMember.avatar}
                          alt={selectedMember.name}
                          width={96}
                          height={96}
                          className="rounded-lg overflow-hidden border-2 border-[rgba(100,180,255,0.3)] hover:border-[#3584e4] transition-colors cursor-pointer"
                          preview={{ mask: '点击查看' }}
                        />
                      </div>
                    )}
                    <div className="flex justify-between mb-3">
                      <span className="text-[#6b7b8f] font-medium">性别</span>
                      <Tag
                        color={
                          selectedMember.gender === 'male'
                            ? '#3584e4'
                            : '#e04f88'
                        }
                        className="text-[13px]"
                      >
                        {selectedMember.gender === 'male' ? '男' : selectedMember.gender === 'female' ? '女' : '未知'}
                      </Tag>
                    </div>
                    <div className="flex justify-between mb-3">
                      <span className="text-[#6b7b8f] font-medium">
                        出生日期
                      </span>
                      <span className="text-[#2c3e50] font-semibold">
                        {selectedMember.birthDate || '未知'}
                      </span>
                    </div>
                    <div className="flex justify-between mb-0">
                      <span className="text-[#6b7b8f] font-medium">
                        死亡日期
                      </span>
                      <span className="text-[#2c3e50] font-semibold">
                        {selectedMember.deathDate || '至今'}
                      </span>
                    </div>
                    {selectedMember.bio && (
                      <div className="mt-3 pt-3 border-t border-[rgba(100,180,255,0.2)]">
                        <span className="text-[#6b7b8f] font-medium block mb-1">
                          简介
                        </span>
                        <span className="text-[#2c3e50] text-sm leading-relaxed">
                          {selectedMember.bio}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 右侧：父母信息 + 配偶信息 + 子女信息 */}
                <div className="flex-1 min-w-[280px]">
                  {/* 父母信息 */}
                  {selectedMember.fatherId && (
                    <div className="mb-6">
                      <div className="text-sm text-[#5b7ba3] font-semibold mb-3 uppercase tracking-wider">
                        父母
                      </div>
                      <div className="bg-white/60 rounded-xl px-5 py-4 border border-[rgba(100,180,255,0.15)]">
                        <div className="flex justify-between mb-2">
                          <span className="text-[#6b7b8f] font-medium">
                            父亲
                          </span>
                          {(() => {
                            const father = familyData?.members?.find(
                              (m) => m?.id === selectedMember.fatherId,
                            )
                            return father ? (
                              <Tag color="#3584e4" className="text-[13px]">
                                男-{father.name || '未知'}
                              </Tag>
                            ) : (
                              <span className="text-[#2c3e50] font-semibold">
                                未知
                              </span>
                            )
                          })()}
                        </div>
                        {(() => {
                          // 通过父亲的配偶信息获取母亲
                          const father = familyData?.members?.find(
                            (m) => m?.id === selectedMember.fatherId,
                          )
                          if (father?.spouse?.name) {
                            return (
                              <div className="flex justify-between">
                                <span className="text-[#6b7b8f] font-medium">
                                  母亲
                                </span>
                                <Tag color="#e04f88" className="text-[13px]">
                                  女-{father.spouse.name}
                                </Tag>
                              </div>
                            )
                          }
                          return null
                        })()}
                      </div>
                    </div>
                  )}

                  {/* 配偶信息 */}
                  {selectedMember.spouse?.name && (
                    <div className="mb-6">
                      <div className="text-sm text-[#5b7ba3] font-semibold mb-3 uppercase tracking-wider">
                        配偶
                      </div>
                      <div className="bg-white/60 rounded-xl px-5 py-4 border border-[rgba(100,180,255,0.15)]">
                        {/* 配偶照片 */}
                        {selectedMember.spouse?.avatar && (
                          <div className="mb-4 flex justify-center">
                            <Image
                              src={selectedMember.spouse.avatar}
                              alt={selectedMember.spouse.name}
                              width={96}
                              height={96}
                              className="rounded-lg overflow-hidden border-2 border-[rgba(100,180,255,0.3)] hover:border-[#3584e4] transition-colors cursor-pointer"
                              preview={{ mask: '点击查看' }}
                            />
                          </div>
                        )}
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[#6b7b8f] font-medium">
                            {selectedMember.gender === 'male' ? '妻子' : '丈夫'}
                          </span>
                          <Tag
                            color={
                              selectedMember.spouse?.gender === 'male'
                                ? '#3584e4'
                                : '#e04f88'
                            }
                            className="text-[13px]"
                          >
                            {selectedMember.spouse?.gender === 'male'
                              ? '男'
                              : '女'}
                            -{selectedMember.spouse.name}
                          </Tag>
                        </div>
                        {selectedMember.spouse?.birthDate && (
                          <div className="flex justify-between mb-2">
                            <span className="text-[#6b7b8f] font-medium">
                              出生日期
                            </span>
                            <span className="text-[#2c3e50] font-semibold">
                              {selectedMember.spouse.birthDate}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between mb-0">
                          <span className="text-[#6b7b8f] font-medium">
                            死亡日期
                          </span>
                          <span className="text-[#2c3e50] font-semibold">
                            {selectedMember.spouse?.deathDate || '至今'}
                          </span>
                        </div>
                        {selectedMember.spouse?.bio && (
                          <div className="mt-3 pt-3 border-t border-[rgba(100,180,255,0.2)]">
                            <span className="text-[#6b7b8f] font-medium block mb-1">
                              简介
                            </span>
                            <span className="text-[#2c3e50] text-sm leading-relaxed">
                              {selectedMember.spouse.bio}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 子女信息 */}
                  {selectedMember.childrenIds &&
                    selectedMember.childrenIds.length > 0 && (
                      <div>
                        <div className="text-sm text-[#5b7ba3] font-semibold mb-3 uppercase tracking-wider">
                          子女
                        </div>
                        <div className="bg-white/60 rounded-xl px-5 py-4 border border-[rgba(100,180,255,0.15)] flex flex-wrap gap-2.5">
                          {selectedMember.childrenIds.map((childId) => {
                            const child = familyData?.members?.find(
                              (m) => m?.id === childId,
                            )
                            if (!child || !child.id) return null
                            return (
                              <Tag
                                key={childId}
                                color={
                                  child.gender === 'male'
                                    ? '#3584e4'
                                    : '#e04f88'
                                }
                                className="text-[13px] px-3 py-1 rounded-lg"
                              >
                                {child.gender === 'male' ? '男' : child.gender === 'female' ? '女' : '未知'}-
                                {child.name || '未知'}
                              </Tag>
                            )
                          })}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  )
}

export default Members
