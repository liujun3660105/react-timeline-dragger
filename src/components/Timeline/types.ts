export interface TimelineProps {
  /** 开始时间（可选，不设置则无左边界限制） */
  startTime?: Date;
  /** 结束时间（可选，不设置则无右边界限制） */
  endTime?: Date;
  /** 初始当前时间（仅用于初始化，后续时间由组件内部管理） */
  defaultCurrentTime?: Date;
  /** 时间变化回调（仅通知，不影响组件内部时间状态） */
  onTimeChange?: (time: Date) => void;
  /** 是否自动播放 */
  autoPlay?: boolean;
  /** 播放状态变化回调（当用户点击播放/暂停时触发） */
  onAutoPlayChange?: (isPlaying: boolean) => void;
  /** 播放速度倍率 */
  playbackSpeed?: number;
  /** 倍速播放变化回调 */
  onPlaybackSpeedChange?: (speed: number) => void;
  /** 时间轴高度 */
  height?: number;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 时间格式化函数 */
  formatTime?: (date: Date) => string;
  /** 播放间隔（毫秒） */
  playbackInterval?: number;
  /** 是否受最新时间限制（暂停时拖拽/选择日期不能超过当前真实时间） */
  isControlByLastedTime?: boolean;
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
  /** 外部设置当前时间 */
  setTime: (time: Date) => void;
  /** 当前播放状态（getter，确保返回最新值） */
  get isPlaying(): boolean;
}
