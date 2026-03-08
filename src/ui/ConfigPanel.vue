<script setup lang="ts">
import { ref, computed } from 'vue'
import zhCN from '../locales/zh-CN.json'
import en from '../locales/en.json'
import { ButtonGroup, SubTabs } from '@bg-effects/shared'

const props = defineProps<{
  config: any
  lang?: 'zh-CN' | 'en'
}>()

const activeTab = ref('core')

// 暴露activeTab供父组件使用
defineExpose({
  activeTab
})

const i18n = {
  'zh-CN': zhCN,
  'en': en
}

const t = (path: string) => {
  const dict = i18n[props.lang || 'zh-CN']
  return path.split('.').reduce((obj: any, key) => obj?.[key], dict) || path
}

interface SubTabItem {
  id: string
  label: string
}

const subTabs = computed((): SubTabItem[] => [
  { id: 'core', label: t('tabs.core') },
  { id: 'style', label: t('tabs.style') },
  { id: 'animation', label: t('tabs.animation') },
])
</script>

<template>
  <div class="flex flex-col gap-6 text-white/90">
    <!-- Sub Tabs (Segmented Control Style) -->
    <SubTabs v-model="activeTab" :tabs="subTabs" />

    <!-- Controls Container -->
    <div class="flex flex-col gap-6 p-1 pointer-events-auto overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
      <!-- Core Tab -->
      <div v-if="activeTab === 'core'" class="flex flex-col gap-6">
        <div v-for="prop in [
          {id: 'sides', min:3, max:20, step:1, label: 'sides'},
          {id: 'count', min:1, max:30, step:1, label: 'count'},
          {id: 'scale', min:0.2, max:2.0, step:0.05, label: 'scale'},
          {id: 'spacing', min:0.5, max:1.0, step:0.01, label: 'spacing'},
          {id: 'innerRadius', min:0.0, max:0.5, step:0.01, label: 'innerRadius'},
          {id: 'outerRadius', min:0.5, max:1.0, step:0.01, label: 'outerRadius'},
        ]" :key="prop.id" 
          class="flex flex-col gap-3 group/item">
          <div class="flex justify-between items-center px-1">
            <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 group-hover/item:text-white/40 transition-colors">{{ t(`labels.${prop.label}`) }}</label>
            <span class="text-[11px] font-black font-mono text-white/40 group-hover/item:text-blue-400 transition-colors">
              {{ typeof config[prop.id] === 'number' ? config[prop.id].toFixed(prop.step < 1 ? 2 : 0) : config[prop.id] }}
            </span>
          </div>
          <input v-model.number="config[prop.id]" type="range" :min="prop.min" :max="prop.max" :step="prop.step" class="w-full accent-blue-500 bg-white/5 hover:bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer transition-all border border-white/5">
        </div>
      </div>
      
      <!-- Style Tab -->
      <div v-if="activeTab === 'style'" class="flex flex-col gap-5">
        <div class="flex flex-col gap-3">
          <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 px-1">{{ t('labels.colorMode') }}</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="m in ['single', 'gradient', 'hslCycle', 'rainbow']"
              :key="m"
              class="py-2.5 text-[9px] font-bold border rounded-lg transition-all shadow-sm cursor-pointer"
              :class="config.colorMode === m ? 'bg-blue-600 text-white border-blue-400/50 ring-1 ring-blue-400/30' : 'bg-white/[0.03] text-white/25 border-white/5 hover:bg-white/10 hover:text-white/60'"
              @click="config.colorMode = m"
            >
              {{ t(`styles.${m}`) }}
            </button>
          </div>
        </div>
        <div v-if="config.colorMode === 'single'" class="flex flex-col gap-3 group/item bg-white/[0.02] p-4 rounded-xl border border-white/5 shadow-inner">
          <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">{{ t('labels.color') }}</label>
          <div class="flex gap-4 items-center">
            <div class="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 shadow-lg">
              <input v-model="config.color" type="color" class="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer scale-125">
            </div>
            <span class="text-xs font-mono font-bold text-white/40 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">{{ config.color }}</span>
          </div>
        </div>
        <div v-for="prop in [
          {id: 'lineOpacity', min:0.1, max:1, step:0.05, label: 'lineOpacity'},
          {id: 'glowIntensity', min:0, max:3, step:0.1, label: 'glowIntensity'},
        ]" :key="prop.id"
          class="flex flex-col gap-3 group/item border-t border-white/5 pt-4">
          <div class="flex justify-between items-center px-1">
            <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 group-hover/item:text-white/40 transition-colors">{{ t(`labels.${prop.label}`) }}</label>
            <span class="text-[11px] font-black font-mono text-white/40 group-hover/item:text-blue-400 transition-colors">
              {{ (config[prop.id] ?? 1).toFixed(prop.id === 'lineOpacity' ? 2 : 1) }}
            </span>
          </div>
          <input v-model.number="config[prop.id]" type="range" :min="prop.min" :max="prop.max" :step="prop.step" class="w-full accent-blue-500 bg-white/5 hover:bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer transition-all border border-white/5">
        </div>
        <ButtonGroup
          v-model="config.rotationDirection"
          :options="[
            { value: 'inward', label: t('directions.inward') },
            { value: 'outward', label: t('directions.outward') },
            { value: 'alternating', label: t('directions.alternating') }
          ]"
          :label="t('labels.rotationDirection')"
          layout="horizontal"
        />
        <div class="flex items-center justify-between">
          <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">{{ t('labels.wireframe') }}</label>
          <input v-model="config.wireframe" type="checkbox" class="w-4 h-4 accent-blue-500">
        </div>
        <div class="flex items-center justify-between">
          <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">{{ t('labels.fill') }}</label>
          <input v-model="config.fill" type="checkbox" class="w-4 h-4 accent-blue-500">
        </div>
        <div v-if="config.fill" class="flex flex-col gap-3 group/item">
          <div class="flex justify-between items-center px-1">
            <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">{{ t('labels.fillOpacity') }}</label>
            <span class="text-[11px] font-black font-mono text-white/40">{{ (config.fillOpacity ?? 0.2).toFixed(2) }}</span>
          </div>
          <input v-model.number="config.fillOpacity" type="range" min="0" max="1" step="0.05" class="w-full accent-blue-500 bg-white/5 h-1.5 rounded-full">
        </div>
      </div>

      <!-- Animation Tab -->
      <div v-if="activeTab === 'animation'" class="flex flex-col gap-6">
        <div v-for="prop in [
          {id: 'rotationSpeed', min:0, max:5, step:0.1, label: 'rotationSpeed'},
          {id: 'rotationIncrement', min:0, max:90, step:1, label: 'rotationIncrement'},
          {id: 'scaleSpeed', min:0, max:2, step:0.1, label: 'scaleSpeed'},
          {id: 'pulseFrequency', min:0, max:5, step:0.1, label: 'pulseFrequency'},
          {id: 'revealSpeed', min:0.1, max:2, step:0.1, label: 'revealSpeed'},
        ]" :key="prop.id"
          class="flex flex-col gap-3 group/item">
          <div class="flex justify-between items-center px-1">
            <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 group-hover/item:text-white/40 transition-colors">{{ t(`labels.${prop.label}`) }}</label>
            <span class="text-[11px] font-black font-mono text-white/40 group-hover/item:text-blue-400 transition-colors">
              {{ (config[prop.id] ?? 0).toFixed(prop.id === 'rotationSpeed' || prop.id === 'pulseFrequency' || prop.id === 'revealSpeed' ? 1 : 0) }}
            </span>
          </div>
          <input v-model.number="config[prop.id]" type="range" :min="prop.min" :max="prop.max" :step="prop.step" class="w-full accent-blue-500 bg-white/5 hover:bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer transition-all border border-white/5">
        </div>
        <ButtonGroup
          v-model="config.revealMode"
          :options="[
            { value: 'none', label: t('revealModes.none') },
            { value: 'centerOut', label: t('revealModes.centerOut') },
            { value: 'centerIn', label: t('revealModes.centerIn') },
            { value: 'sequential', label: t('revealModes.sequential') }
          ]"
          :label="t('labels.revealMode')"
          layout="horizontal"
        />
        <div class="flex items-center justify-between">
          <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">{{ t('labels.animateScale') }}</label>
          <input v-model="config.animateScale" type="checkbox" class="w-4 h-4 accent-blue-500">
        </div>
        <div class="flex items-center justify-between">
          <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">{{ t('labels.antialias') }}</label>
          <input v-model="config.antialias" type="checkbox" class="w-4 h-4 accent-blue-500">
        </div>
      </div>
    </div>
  </div>
</template>
