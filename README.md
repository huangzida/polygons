# @bg-effects/polygons

[English](./README.md) | [简体中文](./README_CN.md)

A high-performance polygons background effect built with OGL and Vue.

[Live Demo](https://huangzida.github.io/polygons/)

---

### Features

- 🚀 **High Performance**: Built with OGL (a lightweight WebGL library) for smooth rendering.
- 🎨 **Highly Customizable**: Multiple sides, counts, rotation modes, and color options.
- 🛠️ **Debug Mode**: Built-in visual debug panel for real-time adjustments.
- 📦 **Ready to Use**: Easy-to-use Vue component with simple configuration.

### Installation

```bash
pnpm add @bg-effects/polygons ogl
```

> **Note**: `ogl` is a peer dependency and needs to be installed manually.

### Usage

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

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `sides` | `number` | `6` | Number of sides for each polygon |
| `count` | `number` | `8` | Number of polygons |
| `rotationSpeed` | `number` | `0.5` | Base rotation speed |
| `rotationIncrement` | `number` | `15` | Rotation offset between polygons |
| `colorMode` | `string` | `'hslCycle'` | Color mode (`'single'`, `'gradient'`, `'hslCycle'`, `'rainbow'`) |
| `color` | `string` | `'#00ffcc'` | Base color when applicable |
| `lineOpacity` | `number` | `0.9` | Opacity of lines |
| `glowIntensity` | `number` | `0.7` | Bloom/glow effect intensity |
| `scale` | `number` | `1.0` | Overall scale |
| `spacing` | `number` | `0.85` | Spacing between polygons |
| `innerRadius` | `number` | `0.2` | Inner radius ratio |
| `outerRadius` | `number` | `0.8` | Outer radius ratio |
| `rotationDirection` | `string` | `'outward'` | Direction of rotation (`'inward'`, `'outward'`, `'alternating'`) |
| `animateScale` | `boolean` | `false` | Enable scale animation (pulse) |
| `wireframe` | `boolean` | `true` | Show as wireframe |
| `fill` | `boolean` | `false` | Fill the polygons |
| `debug` | `boolean` | `false` | Enable debug panel |
| `lang` | `'zh-CN' \| 'en'` | `'zh-CN'` | UI language |

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### License

MIT
