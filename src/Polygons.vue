<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineAsyncComponent, computed } from 'vue'
import type { PolygonsProps } from './types'
import { PolygonsEngine } from './engine'
import { meta } from './meta'
import { DebugShell } from '@bg-effects/debug-ui'
import { defu } from 'defu'

const props = defineProps<PolygonsProps & { 
  debug?: boolean,
  lang?: 'zh-CN' | 'en'
}>()

defineEmits(['update:sides', 'update:count', 'update:rotationSpeed', 'update:rotationIncrement', 'update:colorMode', 'update:color'])

// 动态调试配置面板内部组件
const ConfigContent = defineAsyncComponent(() => import('./ui/ConfigPanel.vue'))
const configContentRef = ref<any>(null)

// 内部代理 props 以便支持调试面板的双向绑定 (如果开启 debug)
const resolveInitialConfig = () => {
    return defu(props, meta.defaultConfig) as PolygonsProps
}
const config = ref<PolygonsProps>(resolveInitialConfig())
// Internal lang state for debug panel
const internalLang = ref<'zh-CN' | 'en'>(config.value.lang || 'zh-CN')

watch(() => props, (newProps) => {
  // 仅在非 debug 模式下同步 props 或合并
  if (!props.debug) {
    config.value = defu(newProps, meta.defaultConfig) as PolygonsProps
  }
}, { deep: true })

// Effective config to use (props or debug config)
const effectiveConfig = computed(() => {
  return props.debug ? config.value : props
})

const handleRandomize = () => {
  if (meta.randomize) {
    // 获取当前配置面板的activeTab（defineExpose暴露的ref可以直接访问）
    const currentTab = configContentRef.value?.activeTab as any
    const tabValue = typeof currentTab === 'object' && currentTab?.value ? currentTab.value : currentTab
    // @ts-ignore - meta.randomize now supports optional tab parameter
    const newConfig = meta.randomize(config.value, tabValue)
    // 保持 debug 和 lang 状态
    config.value = { 
      ...newConfig,
      debug: config.value.debug,
      lang: config.value.lang
    }
  }
}

const containerRef = ref<HTMLElement | null>(null)
let engine: PolygonsEngine | null = null

// 过渡状态
const isTransitioning = ref(false)
const canvasOpacity = ref(1)

const engineInterface = computed(() => ({
  pause: () => engine?.pause(),
  resume: () => engine?.resume(),
  restart: () => engine?.restart(),
}))

// 保存上次的 sides 和 count 用于比较
const lastSides = ref<number | undefined>(config.value.sides)
const lastCount = ref<number | undefined>(config.value.count)

// 监听effectiveConfig变化并更新引擎
watch(effectiveConfig, (newConfig) => {
  if (!engine || !containerRef.value) return
  
  // 检查是否需要重新创建引擎（sides或count改变）
  const needsRecreate =
    newConfig.sides !== lastSides.value ||
    newConfig.count !== lastCount.value
  
  if (needsRecreate) {
    isTransitioning.value = true
    
    // 淡出 -> 重建 -> 淡入
    canvasOpacity.value = 0
    
    // 等待淡出动画完成（300ms）
    setTimeout(() => {
      const wasPaused = engine.isPaused
      engine.destroy()
      engine = new PolygonsEngine(containerRef.value, newConfig as any)
      if (wasPaused) {
        engine.pause()
      }
      // 更新保存的值
      lastSides.value = newConfig.sides
      lastCount.value = newConfig.count
      
      // 立即淡入
      setTimeout(() => {
        canvasOpacity.value = 1
        isTransitioning.value = false
      }, 50)
    }, 300)
  } else {
    // 只更新配置（不重建引擎）
    engine.updateConfig(newConfig)
  }
}, { deep: true })

onMounted(() => {
  if (!containerRef.value) return
  engine = new PolygonsEngine(containerRef.value, effectiveConfig.value as any)
  // 初始化保存的值
  lastSides.value = effectiveConfig.value.sides
  lastCount.value = effectiveConfig.value.count
  
  // 为canvas添加过渡样式并监听透明度变化
  const canvas = containerRef.value.querySelector('canvas')
  if (canvas) {
    canvas.style.transition = 'opacity 0.3s ease-in-out'
    
    // 实时同步透明度
    watch(canvasOpacity, (opacity) => {
      canvas.style.opacity = opacity.toString()
    })
  }
})

onUnmounted(() => {
  engine?.destroy()
  engine = null
})
</script>

<template>
  <div ref="containerRef" class="polygons-container absolute inset-0 z-0" :class="props.className">
    <DebugShell 
      v-if="debug" 
      v-model:config="config"
      v-model:lang="internalLang"
      :meta="meta"
      :engine="engineInterface"
      @randomize="handleRandomize"
    >
      <template #settings>
        <ConfigContent ref="configContentRef" v-model:config="config" :lang="internalLang" />
      </template>
    </DebugShell>
  </div>
</template>

<style scoped>
.polygons-container {
  overflow: hidden;
}
</style>