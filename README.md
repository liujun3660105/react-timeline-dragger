# React Timeline Dragger

一个类 Cesium 风格的 React 时间轴组件，支持拖拽定位、播放控制和日期切换。

## 特性

- 🎚️ **拖拽定位** - 固定竖线在中间，拖拽时间轴改变时间
- ▶️ **播放控制** - 支持播放/暂停、倍速调节
- 📅 **日期选择** - 弹出日历快速切换日期
- 🎯 **自适应刻度** - 根据可见范围自动调整刻度密度
- 📦 **轻量无依赖** - 仅依赖 React，无其他运行时依赖

## 安装

```bash
npm install react-timeline-dragger
```

## 使用

```tsx
import Timeline from 'react-timeline-dragger';
import 'react-timeline-dragger/dist/index.css';

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());

  return (
    <Timeline
      currentTime={currentTime}
      onTimeChange={setCurrentTime}
      visibleDuration={2 * 60 * 60 * 1000} // 可见范围：2小时
    />
  );
}
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `currentTime` | `Date` | - | 当前时间（受控） |
| `onTimeChange` | `(time: Date) => void` | - | 时间变化回调 |
| `visibleDuration` | `number` | `2 * 60 * 60 * 1000` | 可见时间范围（毫秒） |
| `minDuration` | `number` | `2 * 60 * 60 * 1000` | 最小可见范围 |
| `maxDuration` | `number` | `3 * 24 * 60 * 60 * 1000` | 最大可见范围 |
| `playbackInterval` | `number` | `100` | 播放间隔（毫秒） |
| `showControls` | `boolean` | `true` | 显示控制栏 |
| `dateFormat` | `string` | `'YYYY-MM-DD HH:mm:ss'` | 日期格式 |

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建库
npm run build:lib
```

## License

MIT
