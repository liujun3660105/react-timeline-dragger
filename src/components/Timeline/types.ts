export interface TimelineProps {
  /** 开始时间（可选，不设置则无左边界限制） */
  startTime?: Date;
  /** 结束时间（可选，不设置则无右边界限制） */
  endTime?: Date;
  /** 当前时间 */
  currentTime: Date;
  /** 时间变化回调 */
  onTimeChange: (time: Date) => void;
  /** 是否自动播放 */
  autoPlay?: boolean;
  /** 播放状态变化回调（当用户点击播放/暂停时触发） */
  onAutoPlayChange?: (isPlaying: boolean) => void;
  /** 播放速度倍率 */
  playbackSpeed?: number;
  /** 时间轴高度 */
  height?: number;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 时间格式化函数 */
  formatTime?: (date: Date) => string;
  /** 播放间隔（毫秒） */
  playbackInterval?: number;
}

export interface TimePoint {
  time: Date;
  label?: string;
}

/** Timeline 组件暴露的方法 */
export interface TimelineRef {
  /** 开始播放 */
  play: () => void;
  /** 暂停播放 */
  pause: () => void;
  /** 当前播放状态 */
  isPlaying: boolean;
}
