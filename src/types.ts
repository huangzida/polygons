export interface PolygonsProps {
  className?: string
  debug?: boolean
  lang?: 'zh-CN' | 'en'
  // 核心配置
  sides?: number
  count?: number
  rotationSpeed?: number
  rotationIncrement?: number
  colorMode?: 'single' | 'gradient' | 'hslCycle' | 'rainbow'
  color?: string
  // 线条样式
  lineOpacity?: number
  glowIntensity?: number
  antialias?: boolean
  // 缩放与间距
  scale?: number
  spacing?: number
  innerRadius?: number
  outerRadius?: number
  // 旋转方向
  rotationDirection?: 'inward' | 'outward' | 'alternating'
  // 动画
  animateScale?: boolean
  scaleSpeed?: number
  pulseFrequency?: number
  revealMode?: 'none' | 'centerOut' | 'centerIn' | 'sequential'
  revealSpeed?: number
  // 高级效果
  wireframe?: boolean
  fill?: boolean
  fillOpacity?: number
  // 背景
  backgroundColor?: string
  backgroundOpacity?: number
}