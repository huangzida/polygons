import { Color, Geometry, Mesh, Program, Renderer } from 'ogl'
import vertexShader from './shaders/vertex.glsl?raw'
import fragmentShader from './shaders/fragment.glsl?raw'
import { meta } from '../meta'
import { defu } from 'defu'
import type { PolygonsProps } from '../types'
import { hslToHex, hexToRgbNormalized } from '@bg-effects/shared'

/**
 * 线性插值两个颜色 (RGB 空间)
 */
function lerpColor(color1: Color, color2: Color, t: number): Color {
  const r = color1.r + (color2.r - color1.r) * t
  const g = color1.g + (color2.g - color1.g) * t
  const b = color1.b + (color2.b - color1.b) * t
  return new Color(r, g, b)
}

/**
 * 通过 HSL 设置颜色 (h: 0-1, s: 0-1, l: 0-1)
 */
function setHSLColor(color: Color, h: number, s: number, l: number): Color {
  const hex = hslToHex(h * 360, s * 100, l * 100)
  const [r, g, b] = hexToRgbNormalized(hex)
  color.r = r
  color.g = g
  color.b = b
  return color
}

export interface PolygonsConfig extends PolygonsProps {
  sides: number
  count: number
  rotationSpeed: number
  rotationIncrement: number
  colorMode: 'single' | 'gradient' | 'hslCycle' | 'rainbow'
  color: string
  lineOpacity: number
  glowIntensity: number
  antialias: boolean
  scale: number
  spacing: number
  innerRadius: number
  outerRadius: number
  rotationDirection: 'inward' | 'outward' | 'alternating'
  animateScale: boolean
  scaleSpeed: number
  pulseFrequency: number
  revealMode: 'none' | 'centerOut' | 'centerIn' | 'sequential'
  revealSpeed: number
  wireframe: boolean
  fill: boolean
  fillOpacity: number
  backgroundColor: string
  backgroundOpacity: number
}

const COLOR_PALETTE = [
  '#ff3333', '#ff5500', '#ffcc00', '#ffff33',
  '#33ff33', '#00ffcc', '#33ffff', '#3333ff',
  '#7733ff', '#ff33ff', '#ff66aa', '#ffffff'
].map(c => new Color(c))

export class PolygonsEngine {
  private renderer: Renderer
  private gl: any
  private geometry: Geometry | null = null
  private program: Program
  private mesh: Mesh | null = null
  private container: HTMLElement
  
  private animationId: number = 0
  private timeStart: number = 0
  public isPaused: boolean = false
  private config: PolygonsConfig

  // 实例数据
  private instanceCount: number
  private instanceColors: Float32Array
  private instanceRotations: Float32Array

  constructor(container: HTMLElement, config: PolygonsConfig) {
    this.container = container
    this.config = defu(config, meta.defaultConfig) as PolygonsConfig
    
    this.renderer = new Renderer({ dpr: 2, alpha: true })
    this.gl = this.renderer.gl
    this.container.appendChild(this.gl.canvas as HTMLCanvasElement)

    this.instanceCount = this.config.count
    this.instanceColors = new Float32Array(this.instanceCount * 3)
    this.instanceRotations = new Float32Array(this.instanceCount)

    // 创建几何体
    this.createGeometry()

    // 创建着色器程序
    this.program = new Program(this.gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uRotationSpeed: { value: this.config.rotationSpeed },
        uRotationIncrement: { value: this.config.rotationIncrement },
        uScale: { value: this.config.scale },
        uCount: { value: this.config.count },
        uSpacing: { value: this.config.spacing },
        uInnerRadius: { value: this.config.innerRadius },
        uOuterRadius: { value: this.config.outerRadius },
        uLineOpacity: { value: this.config.lineOpacity },
        uGlowIntensity: { value: this.config.glowIntensity },
        uAspect: { value: 1.0 },
        uRotationDirection: { value: this.config.rotationDirection === 'outward' ? 1.0 : this.config.rotationDirection === 'inward' ? -1.0 : 0.0 },
        uAnimateScale: { value: this.config.animateScale ? 1.0 : 0.0 },
        uScaleSpeed: { value: this.config.scaleSpeed },
        uPulseFrequency: { value: this.config.pulseFrequency },
        uAntialias: { value: this.config.antialias ? 1.0 : 0.0 },
        uBackgroundOpacity: { value: this.config.backgroundOpacity },
        uFillOpacity: { value: this.config.fillOpacity },
        uRevealMode: { value: this.config.revealMode === 'centerOut' ? 1.0 : this.config.revealMode === 'centerIn' ? 2.0 : this.config.revealMode === 'sequential' ? 3.0 : 0.0 },
        uRevealSpeed: { value: this.config.revealSpeed },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    })

    // 选择渲染模式：线框或填充
    let mode = this.gl.LINES
    if (this.config.fill && !this.config.wireframe) {
      mode = this.gl.TRIANGLES
    } else if (this.config.fill && this.config.wireframe) {
      // 需要两个mesh，这里简化：只渲染线框
      mode = this.gl.LINES
    }

    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry!,
      program: this.program,
      mode,
    })

    this.resize()
    window.addEventListener('resize', this.resize)
    this.animationId = requestAnimationFrame(this.update)
  }

  private createGeometry() {
    // 如果已有mesh，先移除
    if (this.mesh) {
      this.mesh = null
    }
    if (this.geometry) {
      this.geometry = null
    }

    // 创建单个多边形的几何数据（线框）
    const sides = this.config.sides
    const vertices: number[] = []
    const indices: number[] = []
    const uvs: number[] = []

    // 生成正多边形顶点（在模型空间，半径1）
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2
      const x = Math.cos(angle)
      const y = Math.sin(angle)
      vertices.push(x, y, 0)
      uvs.push(i / sides, 0)
    }
    // 中心点（用于填充）
    vertices.push(0, 0, 0)
    uvs.push(0.5, 0.5)

    // 线框索引：连接相邻顶点
    for (let i = 0; i < sides; i++) {
      const a = i
      const b = (i + 1) % sides
      indices.push(a, b)
    }
    // 填充三角形（如果启用填充）
    for (let i = 0; i < sides; i++) {
      const a = i
      const b = (i + 1) % sides
      const c = sides // 中心点索引
      indices.push(a, b, c)
    }

    // 为每个实例生成颜色和旋转偏移
    for (let i = 0; i < this.instanceCount; i++) {
      const t = i / Math.max(this.instanceCount - 1, 1)
      let color = new Color(this.config.color)
      
      switch (this.config.colorMode) {
        case 'gradient':
          color = lerpColor(COLOR_PALETTE[0], COLOR_PALETTE[COLOR_PALETTE.length - 1], t)
          break
        case 'hslCycle': {
          const hue = (t * 360 + i * 30) % 360
          color = setHSLColor(color, hue / 360, 0.8, 0.6)
          break
        }
        case 'rainbow': {
          const hue2 = (i * 360 / this.instanceCount) % 360
          color = setHSLColor(color, hue2 / 360, 1.0, 0.7)
          break
        }
        default: // single
          color = new Color(this.config.color)
      }
      
      this.instanceColors[i * 3 + 0] = color.r
      this.instanceColors[i * 3 + 1] = color.g
      this.instanceColors[i * 3 + 2] = color.b
      this.instanceRotations[i] = i * 0.1 // 初始旋转偏移
    }

    // 创建几何体
    this.geometry = new Geometry(this.gl, {
      position: { size: 3, data: new Float32Array(vertices) },
      uv: { size: 2, data: new Float32Array(uvs) },
      color: { size: 3, data: this.instanceColors, instanced: 1 },
      instanceIndex: { size: 1, data: new Float32Array(this.instanceCount).map((_, i) => i), instanced: 1 },
      rotationOffset: { size: 1, data: this.instanceRotations, instanced: 1 },
      index: { data: new Uint16Array(indices) }
    })

    // 重新创建mesh
    let mode = this.gl.LINES
    if (this.config.fill && !this.config.wireframe) {
      mode = this.gl.TRIANGLES
    } else if (this.config.fill && this.config.wireframe) {
      mode = this.gl.LINES
    }

    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
      mode,
    })
  }

  public updateConfig(newConfig: Partial<PolygonsConfig>) {
    const oldConfig = { ...this.config }
    this.config = { ...this.config, ...newConfig }

    // 更新Uniforms
    this.program.uniforms.uRotationSpeed.value = this.config.rotationSpeed
    this.program.uniforms.uRotationIncrement.value = this.config.rotationIncrement
    this.program.uniforms.uScale.value = this.config.scale
    this.program.uniforms.uCount.value = this.config.count
    this.program.uniforms.uSpacing.value = this.config.spacing
    this.program.uniforms.uInnerRadius.value = this.config.innerRadius
    this.program.uniforms.uOuterRadius.value = this.config.outerRadius
    this.program.uniforms.uLineOpacity.value = this.config.lineOpacity
    this.program.uniforms.uGlowIntensity.value = this.config.glowIntensity
    this.program.uniforms.uRotationDirection.value =
      this.config.rotationDirection === 'outward' ? 1.0 :
      this.config.rotationDirection === 'inward' ? -1.0 : 0.0
    this.program.uniforms.uAnimateScale.value = this.config.animateScale ? 1.0 : 0.0
    this.program.uniforms.uScaleSpeed.value = this.config.scaleSpeed
    this.program.uniforms.uPulseFrequency.value = this.config.pulseFrequency
    this.program.uniforms.uAntialias.value = this.config.antialias ? 1.0 : 0.0
    this.program.uniforms.uBackgroundOpacity.value = this.config.backgroundOpacity
    this.program.uniforms.uFillOpacity.value = this.config.fillOpacity
    this.program.uniforms.uRevealMode.value =
      this.config.revealMode === 'centerOut' ? 1.0 :
      this.config.revealMode === 'centerIn' ? 2.0 :
      this.config.revealMode === 'sequential' ? 3.0 : 0.0
    this.program.uniforms.uRevealSpeed.value = this.config.revealSpeed

    // 如果渲染模式改变（wireframe 或 fill），需要重建 mesh
    if (oldConfig.wireframe !== this.config.wireframe || oldConfig.fill !== this.config.fill) {
      let mode = this.gl.LINES
      if (this.config.fill && !this.config.wireframe) {
        mode = this.gl.TRIANGLES
      } else if (this.config.fill && this.config.wireframe) {
        mode = this.gl.LINES
      }
      
      // 重新创建 mesh
      if (this.mesh) {
        this.mesh = null
      }
      this.mesh = new Mesh(this.gl, {
        geometry: this.geometry!,
        program: this.program,
        mode,
      })
    }

    // 如果边数或数量改变，需要重建几何体
    if (oldConfig.sides !== this.config.sides || oldConfig.count !== this.config.count) {
      // 重新创建几何体
      this.instanceCount = this.config.count
      this.instanceColors = new Float32Array(this.instanceCount * 3)
      this.instanceRotations = new Float32Array(this.instanceCount)
      
      // 重新生成实例颜色
      for (let i = 0; i < this.instanceCount; i++) {
        const t = i / Math.max(this.instanceCount - 1, 1)
        let color = new Color(this.config.color)
        
        switch (this.config.colorMode) {
          case 'gradient':
            color = lerpColor(COLOR_PALETTE[0], COLOR_PALETTE[COLOR_PALETTE.length - 1], t)
            break
          case 'hslCycle': {
            const hue = (t * 360 + i * 30) % 360
            color = setHSLColor(color, hue / 360, 0.8, 0.6)
            break
          }
          case 'rainbow': {
            const hue2 = (i * 360 / this.instanceCount) % 360
            color = setHSLColor(color, hue2 / 360, 1.0, 0.7)
            break
          }
          default: // single
            color = new Color(this.config.color)
        }
        
        this.instanceColors[i * 3 + 0] = color.r
        this.instanceColors[i * 3 + 1] = color.g
        this.instanceColors[i * 3 + 2] = color.b
        this.instanceRotations[i] = i * 0.1
      }
      
      // 重新创建几何体
      this.createGeometry()
    }

    // 更新实例颜色
    if (oldConfig.colorMode !== this.config.colorMode || oldConfig.color !== this.config.color) {
      for (let i = 0; i < this.instanceCount; i++) {
        const t = i / Math.max(this.instanceCount - 1, 1)
        let color = new Color(this.config.color)
        
        switch (this.config.colorMode) {
          case 'gradient':
            color = lerpColor(COLOR_PALETTE[0], COLOR_PALETTE[COLOR_PALETTE.length - 1], t)
            break
          case 'hslCycle': {
            const hue = (t * 360 + i * 30) % 360
            color = setHSLColor(color, hue / 360, 0.8, 0.6)
            break
          }
          case 'rainbow': {
            const hue2 = (i * 360 / this.instanceCount) % 360
            color = setHSLColor(color, hue2 / 360, 1.0, 0.7)
            break
          }
          default: // single
            color = new Color(this.config.color)
        }
        
        this.instanceColors[i * 3 + 0] = color.r
        this.instanceColors[i * 3 + 1] = color.g
        this.instanceColors[i * 3 + 2] = color.b
      }
      this.geometry!.attributes.color.needsUpdate = true
    }
  }

  public resize = () => {
    if (!this.container) return
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight)
    this.program.uniforms.uAspect.value = this.container.offsetWidth / this.container.offsetHeight
  }

  private update = (time: number) => {
    if (this.isPaused) return
    if (!this.timeStart) this.timeStart = time
    this.animationId = requestAnimationFrame(this.update)
    this.program.uniforms.uTime.value = ((time - this.timeStart) % 1000000) * 0.001
    this.renderer.render({ scene: this.mesh })
  }

  public pause() {
    this.isPaused = true
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = 0
    }
  }

  public resume() {
    if (!this.isPaused) return
    this.isPaused = false
    this.animationId = requestAnimationFrame(this.update)
  }

  public restart() {
    this.timeStart = 0
    if (this.isPaused) {
      this.resume()
    }
  }

  public destroy() {
    this.pause()
    window.removeEventListener('resize', this.resize)
    if (this.geometry) {
      this.geometry = null
    }
    if (this.mesh) {
      this.mesh = null
    }
    if (this.container.contains(this.gl.canvas as HTMLCanvasElement)) {
      this.container.removeChild(this.gl.canvas as HTMLCanvasElement)
    }
    this.gl.getExtension('WEBGL_lose_context')?.loseContext()
  }
}
