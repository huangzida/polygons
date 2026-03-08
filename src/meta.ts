import { rand, generateRandomPalette } from '@bg-effects/shared'
import type { EffectMeta } from '@bg-effects/core'
import type { PolygonsProps } from './types'

export const meta: EffectMeta<PolygonsProps> = {
  id: 'polygons',
  name: {
    en: 'Polygons',
    'zh-CN': '多边形'
  },
  category: 'geometric',
  version: '1.0.0',
  defaultConfig: {
    debug: false,
    lang: 'zh-CN',
    // 核心配置
    sides: 6,
    count: 8,
    rotationSpeed: 0.5,
    rotationIncrement: 15,
    colorMode: 'hslCycle',
    color: '#00ffcc',
    // 线条样式
    lineOpacity: 0.9,
    glowIntensity: 0.7,
    antialias: true,
    // 缩放与间距
    scale: 1.0,
    spacing: 0.85,
    innerRadius: 0.2,
    outerRadius: 0.8,
    // 旋转方向
    rotationDirection: 'outward',
    // 动画
    animateScale: false,
    scaleSpeed: 0.3,
    pulseFrequency: 0.5,
    revealMode: 'none',
    revealSpeed: 0.5,
    // 高级效果
    wireframe: true,
    fill: false,
    fillOpacity: 0.2,
    // 背景
    backgroundColor: '#000000',
    backgroundOpacity: 0.0
  },
  randomize: (current: PolygonsProps, tab?: string) => {
    const result = { ...current }
    
    if (!tab) {
      // 随机所有配置
      result.sides = rand(3, 12, 0)
      result.count = rand(3, 20, 0)
      result.rotationSpeed = rand(0.1, 2.0)
      result.rotationIncrement = rand(5, 45)
      result.lineOpacity = rand(0.3, 1.0)
      result.glowIntensity = rand(0.2, 1.5)
      result.scale = rand(0.5, 1.5)
      result.spacing = rand(0.7, 0.95)
      result.innerRadius = rand(0.1, 0.4)
      result.outerRadius = rand(0.6, 0.9)
      
      const colorModes = ['single', 'gradient', 'hslCycle', 'rainbow']
      result.colorMode = colorModes[Math.floor(Math.random() * colorModes.length)] as any
      if (result.colorMode === 'single') {
        const colors = ['#ff3333', '#ff5500', '#ffcc00', '#ffff33', '#33ff33', '#00ffcc', '#33ffff', '#3333ff', '#7733ff', '#ff33ff']
        result.color = colors[Math.floor(Math.random() * colors.length)]
      }
      
      const directions = ['inward', 'outward', 'alternating']
      result.rotationDirection = directions[Math.floor(Math.random() * directions.length)] as any
      result.animateScale = Math.random() > 0.5
      result.wireframe = Math.random() > 0.3
      result.fill = Math.random() > 0.7
      result.fillOpacity = rand(0.1, 0.5)
      result.antialias = Math.random() > 0.2
      result.backgroundOpacity = rand(0.0, 0.2)
    } else if (tab === 'core') {
      result.sides = rand(3, 12, 0)
      result.count = rand(3, 20, 0)
      result.rotationSpeed = rand(0.1, 2.0)
      result.rotationIncrement = rand(5, 45)
      result.scale = rand(0.5, 1.5)
      result.spacing = rand(0.7, 0.95)
      result.innerRadius = rand(0.1, 0.4)
      result.outerRadius = rand(0.6, 0.9)
    } else if (tab === 'style') {
      const colorModes = ['single', 'gradient', 'hslCycle', 'rainbow']
      result.colorMode = colorModes[Math.floor(Math.random() * colorModes.length)] as any
      if (result.colorMode === 'single') {
        const colors = ['#ff3333', '#ff5500', '#ffcc00', '#ffff33', '#33ff33', '#00ffcc', '#33ffff', '#3333ff', '#7733ff', '#ff33ff']
        result.color = colors[Math.floor(Math.random() * colors.length)]
      }
      result.lineOpacity = rand(0.3, 1.0)
      result.glowIntensity = rand(0.2, 1.5)
      result.wireframe = Math.random() > 0.3
      result.fill = Math.random() > 0.7
      result.fillOpacity = rand(0.1, 0.5)
      result.antialias = Math.random() > 0.2
    } else if (tab === 'animation') {
      result.rotationSpeed = rand(0.1, 2.0)
      result.rotationIncrement = rand(5, 45)
      const directions = ['inward', 'outward', 'alternating']
      result.rotationDirection = directions[Math.floor(Math.random() * directions.length)] as any
      result.animateScale = Math.random() > 0.5
      result.scaleSpeed = rand(0.1, 1.0)
      result.pulseFrequency = rand(0.2, 2.0)
      result.glowIntensity = rand(0.2, 1.5)
    }
    
    return result
  },
  presets: [
    {
      id: 'hexagon-spiral',
      name: { en: 'Hexagon Spiral', 'zh-CN': '六边形螺旋' },
      config: { sides: 6, count: 12, rotationSpeed: 0.8, rotationIncrement: 30, colorMode: 'hslCycle', wireframe: true, fill: false }
    },
    {
      id: 'triangular-cascade',
      name: { en: 'Triangular Cascade', 'zh-CN': '三角瀑布' },
      config: { sides: 3, count: 16, rotationSpeed: 1.2, rotationIncrement: 10, colorMode: 'gradient', color: '#ff5500', glowIntensity: 1.0, rotationDirection: 'inward' }
    },
    {
      id: 'neon-octagon',
      name: { en: 'Neon Octagon', 'zh-CN': '霓虹八边形' },
      config: { sides: 8, count: 6, rotationSpeed: 0.3, rotationIncrement: 45, colorMode: 'rainbow', glowIntensity: 1.5, animateScale: true, scaleSpeed: 0.5 }
    }
  ]
}