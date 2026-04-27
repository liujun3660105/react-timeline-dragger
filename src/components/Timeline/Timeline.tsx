import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { TimelineProps, TimelineRef } from './types';
import { DatePicker } from './controls/DatePicker';
import { TimelineSlider } from './slider/TimelineSlider';
import dayjs from 'dayjs';

import './Timeline.css';

const durationOptions = [
  { label: '2h', value: 2 * 60 * 60 * 1000 },
  { label: '6h', value: 6 * 60 * 60 * 1000 },
  { label: '12h', value: 12 * 60 * 60 * 1000 },
  { label: '24h', value: 24 * 60 * 60 * 1000 },
  { label: '2d', value: 48 * 60 * 60 * 1000 },
  { label: '3d', value: 72 * 60 * 60 * 1000 },
];

const speedOptions = [0.5, 1, 2, 4, 8];

// 时间格式化选项（避免每次渲染创建新对象）
const defaultTimeFormatOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
};

export const Timeline = forwardRef<TimelineRef, TimelineProps>(({
  startTime,
  endTime,
  currentTime,
  onTimeChange,
  autoPlay = false,
  onAutoPlayChange,
  playbackSpeed = 1,
  onPlaybackSpeedChange,
  height = 80,
  style,
  formatTime,
}, ref) => {
  // 规范化边界值，避免 undefined
  const effectiveStartTime = startTime ?? new Date(0); // 默认1970年
  const effectiveEndTime = endTime ?? new Date(8640000000000000); // 默认2099年
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [localSpeed, setLocalSpeed] = useState(playbackSpeed);
  const [visibleDuration, setVisibleDuration] = useState(24 * 60 * 60 * 1000);
  
  // 使用ref存储不需要触发重渲染的值
  const isPlayingRef = useRef(isPlaying);
  const currentTimeRef = useRef(currentTime);
  const localSpeedRef = useRef(localSpeed);
  const animationRef = useRef<number | null>(null);
  
  // 上一帧的时间戳（使用 performance.now() 单调时钟）
  const lastFrameTimeRef = useRef<number>(0);

  // 保持ref同步
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // 同步外部传入的 currentTime 到 ref
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    localSpeedRef.current = localSpeed;
  }, [localSpeed]);

  // 核心播放循环 - 基于 Time-based 的 delta time 方案
  // 使用 performance.now() 单调时钟计算真实流逝时间，与帧率完全解耦
  // currentTimeRef 是动画期间的唯一时间源，不依赖 React 更新周期
  const animate = useCallback(() => {
    if (!isPlayingRef.current) return;

    // 【关键】：计算真实流逝的时间差 (Delta Time)
    // 无论帧率是多少，这里算出来的都是真实的毫秒数
    const currentTime = performance.now()
    const deltaTime = currentTime - lastFrameTimeRef.current;
    
    // 更新基准时间，为下一帧做准备
    lastFrameTimeRef.current = currentTime;

    // 跳过异常大的 delta（标签页隐藏后返回、首帧等）
    if (deltaTime > 1000 || deltaTime <= 0) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    // 根据真实流逝时间和倍速更新模拟时间
    // 公式：当前时间 += 真实流逝时间 * 倍速
    const newTimeMs = currentTimeRef.current.getTime() + deltaTime * localSpeedRef.current;
    let newSimulatedTime = newTimeMs;
    
    // 检查边界
    let stopped = false;
    if (startTime && newSimulatedTime <= startTime.getTime()) {
      newSimulatedTime = startTime.getTime();
      stopped = true;
    } else if (endTime && newSimulatedTime >= endTime.getTime()) {
      newSimulatedTime = endTime.getTime();
      stopped = true;
    }

    let newTime = new Date(newSimulatedTime);
    console.log('time',deltaTime,newTimeMs,dayjs(newTime).format('YYYY-MM-DD HH:mm:ss.SSS'));
    // 【关键】：先同步更新 ref，保证下一帧的计算基于最新值
    // 这样即使 React 还没完成重渲染，下一帧的计算也是正确的
    currentTimeRef.current = newTime;

    if (stopped) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      onTimeChange(newTime);
      setIsPlaying(false);
      onAutoPlayChange?.(false);
      return;
    }

    // 通知父组件更新（不依赖父组件的更新来驱动下一帧）
    onTimeChange(newTime);

    animationRef.current = requestAnimationFrame(animate);
  }, [startTime, endTime, onTimeChange, onAutoPlayChange]);

  // 启动/停止动画
  useEffect(() => {
    if (isPlaying) {
      // 记录开始时的基准时间
      lastFrameTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animate]);

  const stepForward = useCallback(() => {
    // 每次快进1%的可见范围
    const step = visibleDuration * 0.01 * localSpeed;
    let newTime = new Date(currentTime.getTime() + step);
    // 检查边界
    const minTime = startTime?.getTime() ?? -Infinity;
    const maxTime = endTime?.getTime() ?? Infinity;
    newTime = new Date(Math.max(minTime, Math.min(maxTime, newTime.getTime())));
    onTimeChange(newTime);
  }, [currentTime, startTime, endTime, onTimeChange, visibleDuration, localSpeed]);

  const stepBackward = useCallback(() => {
    const step = visibleDuration * 0.01 * localSpeed;
    let newTime = new Date(currentTime.getTime() - step);
    // 检查边界
    const minTime = startTime?.getTime() ?? -Infinity;
    const maxTime = endTime?.getTime() ?? Infinity;
    newTime = new Date(Math.max(minTime, Math.min(maxTime, newTime.getTime())));
    onTimeChange(newTime);
  }, [currentTime, startTime, endTime, onTimeChange, visibleDuration, localSpeed]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onAutoPlayChange?.(true);
  }, [onAutoPlayChange]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    onAutoPlayChange?.(false);
  }, [onAutoPlayChange]);

  // 暴露方法给外部调用
  useImperativeHandle(ref, () => ({
    play: handlePlay,
    pause: handlePause,
    get isPlaying() {
      return isPlaying;
    },
  }), [handlePlay, handlePause, isPlaying]);

  const handleDateChange = useCallback((date: Date) => {
    // 保持原始时间的时分秒，但切换到新日期
    const newDate = new Date(date);
    newDate.setHours(currentTime.getHours());
    newDate.setMinutes(currentTime.getMinutes());
    newDate.setSeconds(currentTime.getSeconds());
    newDate.setMilliseconds(currentTime.getMilliseconds());
    
    // 仅当设置了边界时才限制
    let clampedDate = newDate;
    if (startTime || endTime) {
      const minTime = startTime?.getTime() ?? -Infinity;
      const maxTime = endTime?.getTime() ?? Infinity;
      clampedDate = new Date(
        Math.max(minTime, Math.min(maxTime, newDate.getTime()))
      );
    }
    onTimeChange(clampedDate);
  }, [currentTime, startTime, endTime, onTimeChange]);

  return (
    <div className="timeline-container" style={{ height, ...style }}>
      {/* 顶部工具栏 */}
      <div className="timeline-toolbar">
        <DatePicker
          value={currentTime}
          onChange={handleDateChange}
          minDate={startTime}
          maxDate={endTime}
          disabled={isPlaying}
        />

        {/* 播放控制 */}
        <div className="playback-controls">
          <button className="control-btn" onClick={stepBackward} title="后退">
            ◀
          </button>
          <button
            className="control-btn play-btn"
            onClick={isPlaying ? handlePause : handlePlay}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="control-btn" onClick={stepForward} title="前进">
            ▶
          </button>
        </div>

        {/* 中间当前时间显示 */}
        <div className="toolbar-current-time">
          {currentTime.toLocaleString('zh-CN', defaultTimeFormatOptions)}
        </div>

        {/* 右侧控制区 */}
        <div className="control-right">
          {/* 时间范围选择 */}
          <div className="duration-control">
            <select
              value={visibleDuration}
              onChange={(e) => setVisibleDuration(parseInt(e.target.value))}
              className="duration-select"
            >
              {durationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* 倍速选择 */}
          <div className="speed-control">
            <select
              value={localSpeed}
              onChange={(e) => {
                const newSpeed = parseFloat(e.target.value);
                setLocalSpeed(newSpeed);
                onPlaybackSpeedChange?.(newSpeed);
              }}
              className="speed-select"
            >
              {speedOptions.map((speed) => (
                <option key={speed} value={speed}>{speed}x</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 时间轴滑块 */}
      <TimelineSlider
        startTime={effectiveStartTime}
        endTime={effectiveEndTime}
        currentTime={currentTime}
        onTimeChange={onTimeChange}
        visibleDuration={visibleDuration}
        formatTime={formatTime}
        isPlaying={isPlaying}
      />
    </div>
  );
});
