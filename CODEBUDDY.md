# CODEBUDDY.md

This file provides guidance to CodeBuddy when working with code in this repository.

## 常用命令

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器，预览Timeline组件 |
| `npm run build` | 构建应用为生产环境代码 |
| `npm run build:lib` | 构建组件库为npm发包格式（ES和UMD） |
| `npm run lint` | 运行ESLint检查代码 |
| `npm run preview` | 预览生产环境构建 |

## 项目架构

本项目是一个类Cesium风格的React时间轴组件库。

### 核心模块

**组件结构 (`src/components/Timeline/`)**
- `Timeline.tsx` - 主组件，整合工具栏、播放控制和滑块
- `slider/TimelineSlider.tsx` - 时间滑块（拖拽时间轴，固定竖线）
- `controls/DatePicker.tsx` - 日期选择弹窗
- `controls/PlayControls.tsx` - 播放控制按钮
- `types.ts` - TypeScript类型定义
- `Timeline.css` - 组件样式

### 核心设计

**固定竖线机制**: 当前时间竖线始终固定在组件中间位置。拖拽时，时间轴相对移动，计算公式：
```
deltaTime = (鼠标X偏移 / 容器宽度) * 可见时间范围
新时间 = 拖拽起始时间 - deltaTime
```

**自适应时间范围**: 可见时间范围可配置（2小时~3天），刻度自动根据范围调整密度。

**日期选择**: 点击左侧按钮弹出日历，选择日期后保持当前时分秒不变。

### npm发包

- 运行 `npm run build:lib` 构建库
- `dist/index.es.js` - ES模块
- `dist/index.umd.js` - UMD模块
- peerDependencies: react >= 18.0.0

### 开发提示

- 播放间隔 `playbackInterval` 默认100ms，可调速度
- 拖拽时自动暂停播放
- 支持 `visibleDuration` 控制可见时间范围
