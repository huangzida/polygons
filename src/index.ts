import Polygons from './Polygons.vue'
import { meta } from './meta'
import en from './locales/en.json'
import zhCN from './locales/zh-CN.json'

export { Polygons, meta }
export * from './types'

export const locales = {
  en,
  'zh-CN': zhCN
}