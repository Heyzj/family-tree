import React, { useEffect, useRef, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as go from 'gojs'
import { Button, Card, Space, Statistic, Row, Col, Typography, Tooltip, Form, Input, DatePicker, Radio, message, Upload } from 'antd'
import { PlusOutlined, ExpandOutlined, CompressOutlined, DeleteOutlined, SaveOutlined, FullscreenOutlined, AimOutlined, UploadOutlined, DeleteOutlined as DeleteIcon } from '@ant-design/icons'
import type { FamilyData, Member } from '../types/family'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface FamilyConfigProps {
  familyData: FamilyData
  setFamilyData: React.Dispatch<React.SetStateAction<FamilyData>>
}

interface SpouseData {
  name?: string
  gender?: 'male' | 'female'
  birthDate?: string
  deathDate?: string
  relationship?: 'wife' | 'husband'
  bio?: string
  avatar?: string
}

interface TreeNodeData {
  key: string
  name: string
  isRoot: boolean
  parent?: string
  gender?: 'male' | 'female'
  birthDate?: string
  deathDate?: string
  generation?: number
  age?: number
  bio?: string
  avatar?: string
  spouse?: SpouseData
}

const FamilyConfig: React.FC<FamilyConfigProps> = ({ familyData, setFamilyData }) => {
  const navigate = useNavigate()
  const diagramDivRef = useRef<HTMLDivElement>(null)
  const diagramRef = useRef<go.Diagram | null>(null)
  const [selectedNode, setSelectedNode] = useState<go.Node | null>(null)
  const [stats, setStats] = useState({
    totalNodes: 0,
    treeDepth: 0,
  })
  const [form] = Form.useForm()

  // 将 FamilyData 转换为 GoJS TreeModel 数据
  const convertToTreeModel = useCallback((data: FamilyData): TreeNodeData[] => {
    const nodes: TreeNodeData[] = []

    data.members.forEach((member) => {
      // 跳过作为配偶独立存储的成员（通过 spouseId 识别）
      // 这些成员的配偶信息已经在对应的主成员中
      if (member.spouseId) {
        return
      }

      const isRoot = member.id === data.rootMemberId
      
      // 使用 spouse 对象（如果存在）
      const spouse: SpouseData | undefined = member.spouse
      
      nodes.push({
        key: member.id,
        name: member.name,
        isRoot,
        parent: member.fatherId || undefined,
        gender: member.gender,
        birthDate: member.birthDate,
        deathDate: member.deathDate,
        generation: member.generation,
        bio: member.bio,
        avatar: member.avatar,
        spouse,
      })
    })

    return nodes
  }, [])

  // 将 GoJS 数据转换回 FamilyData
  const convertToFamilyData = useCallback((diagram: go.Diagram): FamilyData => {
    const members: Member[] = []
    let rootMemberId: string | undefined

    diagram.nodes.each((node) => {
      const data = node.data as TreeNodeData
      if (data.isRoot) {
        rootMemberId = data.key
      }

      // 获取子节点
      const childrenIds: string[] = []
      node.findTreeChildrenNodes().each((child) => {
        childrenIds.push(child.data.key)
      })

      // 确定父节点ID
      const parentNode = node.findTreeParentNode()
      const fatherId = parentNode ? parentNode.data.key : null

      members.push({
        id: data.key,
        name: data.name,
        gender: data.gender || 'male',
        birthDate: data.birthDate,
        deathDate: data.deathDate,
        generation: data.generation,
        bio: data.bio,
        avatar: data.avatar,
        fatherId,
        childrenIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        spouse: data.spouse,
      })
    })

    return {
      version: familyData.version,
      lastModified: new Date().toISOString(),
      familyName: familyData.familyName,
      rootMemberId: rootMemberId || members[0]?.id,
      members,
    }
  }, [familyData.version, familyData.familyName])

  // 生成唯一键值
  const generateUniqueKey = useCallback((): string => {
    return uuidv4()
  }, [])

  // 添加子节点
  const addChildNode = useCallback((parentNode: go.Node | null) => {
    if (!parentNode || !diagramRef.current) return

    const diagram = diagramRef.current
    const parentKey = parentNode.data.key
    const newKey = generateUniqueKey()

    diagram.startTransaction('add child')

    // 添加新节点
    diagram.model.addNodeData({
      key: newKey,
      name: '新成员',
      parent: parentKey,
      isRoot: false,
      gender: 'male',
    })

    // 确保父节点展开
    parentNode.expandTree()

    diagram.commitTransaction('add child')

    // 选中新节点
    const newNode = diagram.findNodeForKey(newKey)
    if (newNode) {
      diagram.select(newNode)
      setSelectedNode(newNode)
    }

    updateStats(diagram)
  }, [generateUniqueKey])

  // 删除节点
  const deleteNode = useCallback((node: go.Node | null) => {
    if (!node || !diagramRef.current) return

    const diagram = diagramRef.current
    
    if (node.data.isRoot) {
      return
    }

    diagram.startTransaction('delete node')

    // 递归删除所有子节点
    const deleteRecursive = (n: go.Node) => {
      const children: go.Node[] = []
      n.findTreeChildrenNodes().each((child) => children.push(child))
      children.forEach((child) => deleteRecursive(child))
      diagram.model.removeNodeData(n.data)
    }

    deleteRecursive(node)

    diagram.commitTransaction('delete node')
    setSelectedNode(null)
    updateStats(diagram)
  }, [])

  // 更新统计信息
  const updateStats = useCallback((diagram: go.Diagram) => {
    let totalNodes = 0
    let maxDepth = 0

    diagram.nodes.each((node) => {
      totalNodes++
      let depth = 1
      let current = node
      while (current.findTreeParentNode()) {
        depth++
        current = current.findTreeParentNode()!
      }
      if (depth > maxDepth) maxDepth = depth
    })

    setStats({ totalNodes, treeDepth: maxDepth })
  }, [])

  // 展开所有
  const expandAll = useCallback(() => {
    if (!diagramRef.current) return
    diagramRef.current.nodes.each((node) => {
      node.expandTree()
    })
  }, [])

  // 折叠所有
  const collapseAll = useCallback(() => {
    if (!diagramRef.current) return
    diagramRef.current.nodes.each((node) => {
      if (!node.data.isRoot) {
        node.collapseTree()
      }
    })
  }, [])

  // 缩放至适应屏幕
  const zoomToFit = useCallback(() => {
    if (!diagramRef.current) return
    diagramRef.current.commandHandler.zoomToFit()
  }, [])

  // 定位到根节点
  const centerRoot = useCallback(() => {
    if (!diagramRef.current) return
    const diagram = diagramRef.current
    // 查找根节点
    let rootNode: go.Node | null = null
    diagram.nodes.each((node) => {
      if (node.data.isRoot) {
        rootNode = node
      }
    })
    if (rootNode) {
      diagram.scale = 1
      diagram.commandHandler.scrollToPart(rootNode)
    }
  }, [])

  // 保存数据
  const saveData = useCallback(async () => {
    if (!diagramRef.current) return

    const newFamilyData = convertToFamilyData(diagramRef.current)
    setFamilyData(newFamilyData)

    try {
      // 使用相对路径，后端会重定向到 userData 目录
      const filePath = 'modules/pages/family.json'
      await window.electronAPI?.writeFile(
        filePath,
        JSON.stringify(newFamilyData, null, 2)
      )
      message.success('保存成功')
      navigate('/members')
    } catch (error) {
      console.error('保存族谱数据失败:', error)
      message.error('保存失败')
    }
  }, [convertToFamilyData, setFamilyData, navigate])

  // 初始化 GoJS 图表
  useEffect(() => {
    if (!diagramDivRef.current) return

    const $ = go.GraphObject.make

    // 创建图表
    const diagram = $(go.Diagram, diagramDivRef.current, {
      'undoManager.isEnabled': true,
      layout: $(go.TreeLayout, {
        angle: 90,
        layerSpacing: 80,
        nodeSpacing: 40,
        alignment: go.TreeLayout.AlignmentCenterChildren,
        setsPortSpot: false,
        setsChildPortSpot: false,
      }),
      model: $(go.TreeModel),
      'animationManager.isEnabled': true,
    })

    // 隐藏 GoJS 水印
    diagram.toolManager.showToolTip = () => null

    // 定义节点模板
    diagram.nodeTemplate = $(
      go.Node,
      'Auto',
      {
        selectionAdorned: true,
        selectionObjectName: 'SHAPE',
        cursor: 'pointer',
        mouseEnter: (_e: go.InputEvent, node: go.GraphObject) => {
          const n = node as go.Node
          const shape = n.findObject('SHAPE') as go.Shape
          if (shape) {
            shape.stroke = '#667eea'
            shape.strokeWidth = 3
          }
        },
        mouseLeave: (_e: go.InputEvent, node: go.GraphObject) => {
          const n = node as go.Node
          const shape = n.findObject('SHAPE') as go.Shape
          if (shape) {
            const isRoot = n.data.isRoot
            shape.stroke = isRoot ? '#ff4d4f' : '#1890ff'
            shape.strokeWidth = isRoot ? 3 : 2
          }
        },
        click: (_e: go.InputEvent, node: go.GraphObject) => {
          const n = node as go.Node
          setSelectedNode(n)
          diagram.select(n)
        },
      },
      new go.Binding('isTreeExpanded').makeTwoWay(),
      // 节点形状
      $(
        go.Shape,
        'RoundedRectangle',
        {
          name: 'SHAPE',
          fill: 'white',
          strokeWidth: 2,
          width: 160,
          height: 70,
          parameter1: 10,
          portId: '',
          fromLinkable: false,
          toLinkable: false,
        },
        new go.Binding('stroke', 'isRoot', (r: boolean) =>
          r ? '#ff4d4f' : '#1890ff'
        ),
        new go.Binding('strokeWidth', 'isRoot', (r: boolean) => (r ? 3 : 2)),
        new go.Binding('fill', 'isRoot', (r: boolean) =>
          r ? '#fff1f0' : '#e6f7ff'
        )
      ),
      // 内容面板
      $(
        go.Panel,
        'Vertical',
        { margin: 8 },
        $(
          go.TextBlock,
          {
            font: 'bold 14px sans-serif',
            stroke: '#333',
            margin: new go.Margin(0, 0, 4, 0),
            maxSize: new go.Size(140, NaN),
            wrap: go.TextBlock.WrapFit,
            editable: true,
          },
          new go.Binding('text', 'name').makeTwoWay()
        ),
        $(
          go.TextBlock,
          {
            font: '11px sans-serif',
            stroke: '#666',
            maxSize: new go.Size(140, NaN),
          },
          new go.Binding('text', 'generation', (g: number | undefined) => g ?? '')
        )
      ),
      // 添加子节点按钮（右上角）
      $(
        go.Panel,
        'Auto',
        {
          alignment: go.Spot.TopRight,
          alignmentFocus: go.Spot.Center,
          cursor: 'pointer',
          click: (_e: go.InputEvent, obj: go.GraphObject) => {
            addChildNode(obj.part as go.Node)
          },
        },
        $(go.Shape, 'Circle', {
          width: 24,
          height: 24,
          fill: '#52c41a',
          stroke: 'white',
          strokeWidth: 2,
        }),
        $(go.TextBlock, '+', {
          font: 'bold 14px sans-serif',
          stroke: 'white',
        })
      ),
      // 折叠/展开按钮（左下角）
      $('TreeExpanderButton', {
        alignment: go.Spot.BottomLeft,
        alignmentFocus: go.Spot.Center,
        'ButtonBorder.fill': 'white',
        'ButtonBorder.stroke': '#1890ff',
        width: 24,
        height: 24,
      }),
      // 删除按钮（右下角，非根节点）
      $(
        go.Panel,
        'Auto',
        {
          alignment: go.Spot.BottomRight,
          alignmentFocus: go.Spot.Center,
          cursor: 'pointer',
          click: (_e: go.InputEvent, obj: go.GraphObject) => {
            deleteNode(obj.part as go.Node)
          },
          visible: false,
        },
        new go.Binding('visible', 'isRoot', (r: boolean) => !r),
        $(go.Shape, 'Circle', {
          width: 20,
          height: 20,
          fill: '#ff4d4f',
          stroke: 'white',
          strokeWidth: 1,
        }),
        $(go.TextBlock, '×', {
          font: 'bold 12px sans-serif',
          stroke: 'white',
        })
      )
    )

    // 定义连线模板
    diagram.linkTemplate = $(
      go.Link,
      {
        routing: go.Link.Orthogonal,
        corner: 10,
        curve: go.Link.JumpGap,
        fromEndSegmentLength: 30,
        toEndSegmentLength: 30,
        selectable: false,
      },
      $(go.Shape, { stroke: '#999', strokeWidth: 2 }),
      $(go.Shape, {
        toArrow: 'Standard',
        stroke: null,
        fill: '#999',
        scale: 1,
      })
    )

    // 监听选择变化
    diagram.addDiagramListener('ChangedSelection', (e: go.DiagramEvent) => {
      const selection = e.diagram.selection.first()
      if (selection instanceof go.Node) {
        setSelectedNode(selection)
        // 同步表单数据
        const data = selection.data as TreeNodeData
        form.setFieldsValue({
          name: data.name,
          gender: data.gender || 'male',
          birthDate: data.birthDate ? dayjs(data.birthDate) : null,
          deathDate: data.deathDate ? dayjs(data.deathDate) : null,
          generation: data.generation,
          bio: data.bio,
          avatar: data.avatar,
          spouse: data.spouse ? {
            name: data.spouse.name,
            gender: data.spouse.gender || 'female',
            birthDate: data.spouse.birthDate ? dayjs(data.spouse.birthDate) : null,
            deathDate: data.spouse.deathDate ? dayjs(data.spouse.deathDate) : null,
            relationship: data.spouse.relationship || 'wife',
            bio: data.spouse.bio,
            avatar: data.spouse.avatar,
          } : undefined,
        })
      } else {
        setSelectedNode(null)
        form.resetFields()
      }
    })

    // 监听模型变化以更新统计
    diagram.addModelChangedListener((e: go.ChangedEvent) => {
      if (e.isTransactionFinished) {
        updateStats(diagram)
      }
    })

    diagramRef.current = diagram

    return () => {
      diagram.div = null
      diagramRef.current = null
    }
  }, [addChildNode, deleteNode, updateStats, form])

  // 加载数据到图表
  useEffect(() => {
    if (!diagramRef.current) return

    const treeData = convertToTreeModel(familyData)
    
    // 如果没有数据，创建默认根节点
    if (treeData.length === 0) {
      const rootId = uuidv4()
      diagramRef.current.model = new go.TreeModel([
        {
          key: rootId,
          name: '始祖',
          isRoot: true,
        },
      ])
    } else {
      diagramRef.current.model = new go.TreeModel(treeData)
    }

    updateStats(diagramRef.current)
  }, [familyData, convertToTreeModel, updateStats])

  return (
    <div className="h-full flex flex-col">
      <Title level={4}>族谱配置</Title>

      {/* 工具栏 */}
      <Card
        className="mb-4 bg-white/25 backdrop-blur-md border border-white/30 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.4)]"
        bodyStyle={{ background: 'transparent' }}
      >
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space>
              <Tooltip title="全部展开">
                <Button icon={<ExpandOutlined />} onClick={expandAll}>
                  全部展开
                </Button>
              </Tooltip>
              <Tooltip title="全部折叠">
                <Button icon={<CompressOutlined />} onClick={collapseAll}>
                  全部折叠
                </Button>
              </Tooltip>
              <Tooltip title="缩放至适应屏幕">
                <Button icon={<FullscreenOutlined />} onClick={zoomToFit}>
                  适应屏幕
                </Button>
              </Tooltip>
              <Tooltip title="定位到根节点">
                <Button icon={<AimOutlined />} onClick={centerRoot}>
                  定位根节点
                </Button>
              </Tooltip>
              <Tooltip title="为选中节点添加子节点">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => addChildNode(selectedNode)}
                  disabled={!selectedNode}
                >
                  添加子节点
                </Button>
              </Tooltip>
              <Tooltip title="删除选中节点">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => deleteNode(selectedNode)}
                  disabled={!selectedNode || selectedNode?.data?.isRoot}
                >
                  删除节点
                </Button>
              </Tooltip>
            </Space>
          </Col>
          <Col>
            <Space size="large">
              <Statistic title="总人数" value={stats.totalNodes} />
              <Statistic title="辈分深度" value={stats.treeDepth} />
              <Button type="primary" icon={<SaveOutlined />} onClick={saveData}>
                保存
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 主内容区域：画布 + 右侧表单 */}
      <Row gutter={16} className="flex-1 min-h-[650px]">
        {/* 左侧画布 */}
        <Col flex="auto">
          <Card
            className="h-full bg-white/25 backdrop-blur-md border border-white/30 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.4)]"
            bodyStyle={{ padding: 0, height: '100%', background: 'transparent' }}
          >
            <div
              ref={diagramDivRef}
              className="w-full h-[650px] bg-[#fafafa]"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
                  linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
                  linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              }}
            />
          </Card>
        </Col>

        {/* 右侧表单面板 */}
        {selectedNode && (
          <Col span={320} className="w-[320px] flex-[0_0_320px]">
            <Card
              title="节点信息配置"
              className="h-full bg-white/25 backdrop-blur-md border border-white/30 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.4)]"
              headStyle={{
                background: 'transparent',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#26231e',
              }}
              bodyStyle={{
                background: 'transparent',
              }}
              extra={
                <Text className="text-[rgba(38,35,30,0.6)]">
                  {selectedNode.data.isRoot ? '根节点' : '普通节点'}
                </Text>
              }
            >
              <Form
                form={form}
                layout="vertical"
                onValuesChange={(changedValues) => {
                  if (!diagramRef.current || !selectedNode) return

                  const diagram = diagramRef.current
                  const nodeData = selectedNode.data as TreeNodeData

                  // 更新节点数据
                  diagram.startTransaction('update node')

                  if (changedValues.name !== undefined) {
                    diagram.model.setDataProperty(nodeData, 'name', changedValues.name)
                  }
                  if (changedValues.gender !== undefined) {
                    diagram.model.setDataProperty(nodeData, 'gender', changedValues.gender)
                  }
                  if (changedValues.birthDate !== undefined) {
                    diagram.model.setDataProperty(
                      nodeData,
                      'birthDate',
                      changedValues.birthDate ? changedValues.birthDate.format('YYYY-MM-DD') : undefined
                    )
                  }
                  if (changedValues.deathDate !== undefined) {
                    diagram.model.setDataProperty(
                      nodeData,
                      'deathDate',
                      changedValues.deathDate ? changedValues.deathDate.format('YYYY-MM-DD') : undefined
                    )
                  }
                  if (changedValues.generation !== undefined) {
                    diagram.model.setDataProperty(nodeData, 'generation', changedValues.generation)
                  }
                  if (changedValues.bio !== undefined) {
                    diagram.model.setDataProperty(nodeData, 'bio', changedValues.bio)
                  }
                  if (changedValues.avatar !== undefined) {
                    diagram.model.setDataProperty(nodeData, 'avatar', changedValues.avatar)
                  }

                  // 处理配偶信息更新
                  if (changedValues.spouse !== undefined) {
                    const spouseChange = changedValues.spouse
                    const currentSpouse = nodeData.spouse || {}
                    const newSpouse: SpouseData = { ...currentSpouse }

                    if (spouseChange.name !== undefined) {
                      newSpouse.name = spouseChange.name || undefined
                    }
                    if (spouseChange.gender !== undefined) {
                      newSpouse.gender = spouseChange.gender
                    }
                    if (spouseChange.birthDate !== undefined) {
                      newSpouse.birthDate = spouseChange.birthDate ? spouseChange.birthDate.format('YYYY-MM-DD') : undefined
                    }
                    if (spouseChange.deathDate !== undefined) {
                      newSpouse.deathDate = spouseChange.deathDate ? spouseChange.deathDate.format('YYYY-MM-DD') : undefined
                    }
                    if (spouseChange.relationship !== undefined) {
                      newSpouse.relationship = spouseChange.relationship
                    }
                    if (spouseChange.bio !== undefined) {
                      newSpouse.bio = spouseChange.bio || undefined
                    }
                    if (spouseChange.avatar !== undefined) {
                      newSpouse.avatar = spouseChange.avatar || undefined
                    }

                    // 如果没有配偶姓名，则清空整个 spouse 对象
                    if (!newSpouse.name) {
                      diagram.model.setDataProperty(nodeData, 'spouse', undefined)
                    } else {
                      diagram.model.setDataProperty(nodeData, 'spouse', newSpouse)
                    }
                  }

                  diagram.commitTransaction('update node')
                }}
              >
                <Form.Item
                  label="姓名"
                  name="name"
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <Input placeholder="请输入姓名" />
                </Form.Item>

                <Form.Item
                  label="性别"
                  name="gender"
                  rules={[{ required: true, message: '请选择性别' }]}
                >
                  <Radio.Group>
                    <Radio.Button value="male">男</Radio.Button>
                    <Radio.Button value="female">女</Radio.Button>
                  </Radio.Group>
                </Form.Item>

                <Form.Item label="出生日期" name="birthDate">
                  <DatePicker
                    className="w-full"
                    placeholder="选择出生日期"
                    format="YYYY-MM-DD"
                  />
                </Form.Item>

                <Form.Item label="死亡日期" name="deathDate">
                  <DatePicker
                    className="w-full"
                    placeholder="选择死亡日期"
                    format="YYYY-MM-DD"
                  />
                </Form.Item>

                <Form.Item label="辈分" name="generation">
                  <Input
                    className="w-full"
                    placeholder="请输入辈分"
                  />
                </Form.Item>

                <Form.Item label="照片" shouldUpdate={(prev, next) => prev.avatar !== next.avatar}>
                  {({ getFieldValue }) => (
                    <Upload
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/webp'
                        if (!isJpgOrPng) {
                          message.error('只支持 JPG、PNG、GIF、WebP 格式的图片!')
                          return false
                        }
                        const isLt2M = file.size / 1024 / 1024 < 2
                        if (!isLt2M) {
                          message.error('图片大小不能超过 2MB!')
                          return false
                        }
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          const base64 = e.target?.result as string
                          form.setFields([{ name: 'avatar', value: base64 }])
                          if (diagramRef.current && selectedNode) {
                            const diagram = diagramRef.current
                            const nodeData = selectedNode.data as TreeNodeData
                            diagram.startTransaction('update avatar')
                            diagram.model.setDataProperty(nodeData, 'avatar', base64)
                            diagram.commitTransaction('update avatar')
                          }
                        }
                        reader.readAsDataURL(file)
                        return false
                      }}
                    >
                      {getFieldValue('avatar') ? (
                        <div className="relative w-24 h-24 border rounded overflow-hidden cursor-pointer group">
                          <img
                            src={getFieldValue('avatar')}
                            alt="头像"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <DeleteIcon
                              className="text-white text-lg"
                              onClick={(e) => {
                                e.stopPropagation()
                                form.setFields([{ name: 'avatar', value: undefined }])
                                if (diagramRef.current && selectedNode) {
                                  const diagram = diagramRef.current
                                  const nodeData = selectedNode.data as TreeNodeData
                                  diagram.startTransaction('remove avatar')
                                  diagram.model.setDataProperty(nodeData, 'avatar', undefined)
                                  diagram.commitTransaction('remove avatar')
                                }
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                          <UploadOutlined className="text-2xl text-gray-400" />
                          <span className="text-xs text-gray-400 mt-1">上传照片</span>
                          <span className="text-[10px] text-gray-400 mt-1">JPG/PNG/GIF/WebP</span>
                        </div>
                      )}
                    </Upload>
                  )}
                </Form.Item>

                <Form.Item label="备注" name="bio">
                  <Input.TextArea
                    className="w-full"
                    placeholder="请输入备注"
                    maxLength={500}
                    showCount
                    rows={4}
                  />
                </Form.Item>

                <Form.Item
                  label="配偶姓名"
                  name={['spouse', 'name']}
                >
                  <Input placeholder="请输入配偶姓名" />
                </Form.Item>

                <Form.Item
                  label="配偶性别"
                  name={['spouse', 'gender']}
                >
                  <Radio.Group>
                    <Radio.Button value="male">男</Radio.Button>
                    <Radio.Button value="female">女</Radio.Button>
                  </Radio.Group>
                </Form.Item>

                <Form.Item label="配偶出生日期" name={['spouse', 'birthDate']}>
                  <DatePicker
                    className="w-full"
                    placeholder="选择配偶出生日期"
                    format="YYYY-MM-DD"
                  />
                </Form.Item>

                <Form.Item label="配偶死亡日期" name={['spouse', 'deathDate']}>
                  <DatePicker
                    className="w-full"
                    placeholder="选择配偶死亡日期"
                    format="YYYY-MM-DD"
                  />
                </Form.Item>

                <Form.Item
                  label="配偶关系"
                  name={['spouse', 'relationship']}
                >
                  <Radio.Group>
                    <Radio.Button value="wife">老婆</Radio.Button>
                    <Radio.Button value="husband">老公</Radio.Button>
                  </Radio.Group>
                </Form.Item>

                <Form.Item label="配偶照片" shouldUpdate={(prev, next) => prev.spouse?.avatar !== next.spouse?.avatar}>
                  {({ getFieldValue }) => {
                    const spouseAvatar = getFieldValue(['spouse', 'avatar'])
                    return (
                      <Upload
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        showUploadList={false}
                        beforeUpload={(file) => {
                          const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/webp'
                          if (!isJpgOrPng) {
                            message.error('只支持 JPG、PNG、GIF、WebP 格式的图片!')
                            return false
                          }
                          const isLt2M = file.size / 1024 / 1024 < 2
                          if (!isLt2M) {
                            message.error('图片大小不能超过 2MB!')
                            return false
                          }
                          const reader = new FileReader()
                          reader.onload = (e) => {
                            const base64 = e.target?.result as string
                            form.setFields([{ name: ['spouse', 'avatar'], value: base64 }])
                            if (diagramRef.current && selectedNode) {
                              const diagram = diagramRef.current
                              const nodeData = selectedNode.data as TreeNodeData
                              diagram.startTransaction('update spouseAvatar')
                              const currentSpouse = nodeData.spouse || {}
                              const newSpouse: SpouseData = { ...currentSpouse, avatar: base64 }
                              diagram.model.setDataProperty(nodeData, 'spouse', newSpouse)
                              diagram.commitTransaction('update spouseAvatar')
                            }
                          }
                          reader.readAsDataURL(file)
                          return false
                        }}
                      >
                        {spouseAvatar ? (
                          <div className="relative w-24 h-24 border rounded overflow-hidden cursor-pointer group">
                            <img
                              src={spouseAvatar}
                              alt="配偶头像"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <DeleteIcon
                                className="text-white text-lg"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  form.setFields([{ name: ['spouse', 'avatar'], value: undefined }])
                                  if (diagramRef.current && selectedNode) {
                                    const diagram = diagramRef.current
                                    const nodeData = selectedNode.data as TreeNodeData
                                    diagram.startTransaction('remove spouseAvatar')
                                    const currentSpouse = nodeData.spouse || {}
                                    const newSpouse: SpouseData = { ...currentSpouse }
                                    delete newSpouse.avatar
                                    // 如果配偶对象没有其他字段，则清空整个 spouse
                                    if (!newSpouse.name) {
                                      diagram.model.setDataProperty(nodeData, 'spouse', undefined)
                                    } else {
                                      diagram.model.setDataProperty(nodeData, 'spouse', newSpouse)
                                    }
                                    diagram.commitTransaction('remove spouseAvatar')
                                  }
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                            <UploadOutlined className="text-2xl text-gray-400" />
                            <span className="text-xs text-gray-400 mt-1">上传照片</span>
                            <span className="text-[10px] text-gray-400 mt-1">JPG/PNG/GIF/WebP</span>
                          </div>
                        )}
                      </Upload>
                    )
                  }}
                </Form.Item>

                <Form.Item label="配偶备注" name={['spouse', 'bio']}>
                  <Input.TextArea
                    className="w-full"
                    placeholder="请输入配偶备注"
                    maxLength={500}
                    showCount
                    rows={4}
                  />
                </Form.Item>
              </Form>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  )
}

export default FamilyConfig
