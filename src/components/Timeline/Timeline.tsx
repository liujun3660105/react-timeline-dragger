import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { TimelineProps, TimelineRef } from './types';
import { DatePicker } from './controls/DatePicker';
import { TimelineSlider } from './slider/TimelineSlider';
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

// 基础播放速度：1x时每秒推进的时间（毫秒）
// 1x = 1:1 实时，即 1秒真实时间 = 1秒模拟时间
const BASE_SPEED = 1;

export const Timeline = forwardRef<TimelineRef, TimelineProps>(({
  startTime,
  endTime,
  currentTime,
  onTimeChange,
  autoPlay = false,
  onAutoPlayChange,
  playbackSpeed = 1,
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
  const lastTimeRef = useRef<number>(performance.now());

  // 保持ref同步
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    localSpeedRef.current = localSpeed;
  }, [localSpeed]);

  // 播放动画循环 - 使用requestAnimationFrame实现丝滑播放
  const animate = useCallback((timestamp: number) => {
    if (!isPlayingRef.current) return;

    const deltaReal = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // 根据真实流逝时间和倍速计算时间推进量
    const deltaSimulated = deltaReal * BASE_SPEED * localSpeedRef.current;

    let newTime = new Date(currentTimeRef.current.getTime() + deltaSimulated);
    
    // 到达结束时间停止（仅当设置了 endTime 时）
    if (endTime && newTime.getTime() >= endTime.getTime()) {
      newTime = new Date(endTime);
      onTimeChange(newTime);
      setIsPlaying(false);
      return;
    }

    // 直接更新状态，保证实时性
    onTimeChange(newTime);

    animationRef.current = requestAnimationFrame(animate);
  }, [endTime, onTimeChange]);

  // 启动/停止动画
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
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
    // 仅当设置了 endTime 时限制
    if (endTime) {
      newTime = new Date(Math.min(newTime.getTime(), endTime.getTime()));
    }
    onTimeChange(newTime);
  }, [currentTime, endTime, onTimeChange, visibleDuration, localSpeed]);

  const stepBackward = useCallback(() => {
    const step = visibleDuration * 0.01 * localSpeed;
    let newTime = new Date(currentTime.getTime() - step);
    // 仅当设置了 startTime 时限制
    if (startTime) {
      newTime = new Date(Math.max(newTime.getTime(), startTime.getTime()));
    }
    onTimeChange(newTime);
  }, [currentTime, startTime, onTimeChange, visibleDuration, localSpeed]);

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
    isPlaying,
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
          {currentTime.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })}
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
              onChange={(e) => setLocalSpeed(parseFloat(e.target.value))}
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
