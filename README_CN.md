# @bg-effects/polygons

[English](./README.md) | [简体中文](./README_CN.md)

基于 OGL 和 Vue 构建的高性能多边形背景特效。

[在线演示](https://huangzida.github.io/polygons/)

---

### 特性

- 🚀 **高性能**: 基于 OGL (轻量级 WebGL 库) 构建，运行流畅。
- 🎨 **高度可定制**: 多边形边数、数量、旋转模式及丰富的颜色选项。
- 🛠️ **调试模式**: 内置可视化调试面板，方便实时调整效果。
- 📦 **开箱即用**: 作为 Vue 组件，简单配置即可使用。

### 安装

```bash
pnpm add @bg-effects/polygons ogl
```

> **注意**: `ogl` 是 peer dependency，需要手动安装。

### 使用

```vue
<script setup>
import { Polygons } from '@bg-effects/polygons'
</script>

<template>
  <div style="width: 100vw; height: 100vh; background: #000;">
    <Polygons 
      :sides="6"
      :count="8"
      color-mode="hslCycle"
    />
  </div>
</template>
```

### 属性 (Props)

| 属性名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `sides` | `number` | `6` | 每个多边形的边数 |
| `count` | `number` | `8` | 多边形数量 |
| `rotationSpeed` | `number` | `0.5` | 基础旋转速度 |
| `rotationIncrement` | `number` | `15` | 多边形之间的旋转偏移 |
| `colorMode` | `string` | `'hslCycle'` | 颜色模式 (`'single'`, `'gradient'`, `'hslCycle'`, `'rainbow'`) |
| `color` | `string` | `'#00ffcc'` | 基础颜色（适用时） |
| `lineOpacity` | `number` | `0.9` | 线条不透明度 |
| `glowIntensity` | `number` | `0.7` | 辉光效果强度 |
| `scale` | `number` | `1.0` | 整体缩放比例 |
| `spacing` | `number` | `0.85` | 多边形之间的间距 |
| `innerRadius` | `number` | `0.2` | 内半径比例 |
| `outerRadius` | `number` | `0.8` | 外半径比例 |
| `rotationDirection` | `string` | `'outward'` | 旋转方向 (`'inward'`, `'outward'`, `'alternating'`) |
| `animateScale` | `boolean` | `false` | 是否开启缩放动画（脉冲效果） |
| `wireframe` | `boolean` | `true` | 是否显示为线框 |
| `fill` | `boolean` | `false` | 是否填充多边形 |
| `debug` | `boolean` | `false` | 是否开启调试面板 |
| `lang` | `'zh-CN' \| 'en'` | `'zh-CN'` | 界面语言 |

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发环境
pnpm dev
```

### 许可

MIT
