# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2026-04-23

### Fixed
- 播放到达边界时正确回调 `onAutoPlayChange`
- 拖拽时间轴时使用 ref 替代 state，避免闭包问题
- 修复标签页隐藏后返回时的时间跳跃问题
- `stepForward`/`stepBackward` 完整边界检查

### Changed
- `TimelineRef.isPlaying` 改为 getter，确保返回最新值
- DatePicker useEffect 依赖优化，使用 ref 避免警告
- 时间格式化选项提取为常量，避免重复创建
- DatePicker days 数组使用 useMemo 缓存
- TimelineSlider 刻度 key 使用 `tick.time.getTime()` 替代 index

### Added
- 新增 `onPlaybackSpeedChange` 事件回调
- 播放状态时禁用日期选择器
- 响应式字体，使用 clamp() 自适应尺寸

### Removed
- 删除未使用的 TimeSlider.tsx 文件

## [1.0.2] - 2026-04-23

### Fixed
- React 作为外部依赖正确配置，解决多 React 实例报错

## [1.0.1] - 2026-04-23

### Changed
- 更新 README.md 为组件相关文档

## [1.0.0] - 2026-04-23

### Added
- 初始版本发布
- 类 Cesium 风格时间轴组件
- 拖拽定位功能（固定竖线在中间）
- 播放控制（播放/暂停、倍速调节）
- 日期选择器快速切换
- 自适应时间刻度
- 支持 `startTime`/`endTime` 边界限制
