import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';

export interface TimelineSliderProps {
  /** 开始时间（内部使用 Date 处理，外部可传 undefined 表示无限制） */
  startTime: Date;
  /** 结束时间（内部使用 Date 处理，外部可传 undefined 表示无限制） */
  endTime: Date;
  currentTime: Date;
  onTimeChange: (time: Date) => void;
  visibleDuration?: number;
  formatTime?: (date: Date) => string;
  /** 是否正在播放，播放时禁止拖动 */
  isPlaying?: boolean;
}

export const TimelineSlider: React.FC<TimelineSliderProps> = ({
  startTime,
  endTime,
  currentTime,
  onTimeChange,
  visibleDuration = 24 * 60 * 60 * 1000,
  formatTime = (d) => d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
  isPlaying = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(currentTime);

  // 监听容器宽度变化
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    
    resizeObserver.observe(containerRef.current);
    setContainerWidth(containerRef.current.offsetWidth);
    
    return () => resizeObserver.disconnect();
  }, []);

  // 计算可见范围的边界（考虑currentTime在中间的情况）
  const visibleStart = useMemo(() => {
    const offset = visibleDuration / 2;
    return new Date(currentTime.getTime() - offset);
  }, [currentTime, visibleDuration]);

  const visibleEnd = useMemo(() => {
    const offset = visibleDuration / 2;
    return new Date(currentTime.getTime() + offset);
  }, [currentTime, visibleDuration]);

  // 根据宽度自适应计算刻度间隔
  const ticks = useMemo(() => {
    const result: { time: Date; position: number; major: boolean }[] = [];
    const startMs = visibleStart.getTime();
    const endMs = visibleEnd.getTime();
    const duration = endMs - startMs;

    // 根据容器宽度计算理想刻度数量（每60-100px一个刻度）
    const idealTickCount = Math.max(5, Math.floor(containerWidth / 80));
    
    // 计算合适的刻度间隔
    const intervals = [
      5 * 60 * 1000,      // 5分钟
      10 * 60 * 1000,     // 10分钟
      15 * 60 * 1000,     // 15分钟
      30 * 60 * 1000,     // 30分钟
      60 * 60 * 1000,     // 1小时
      2 * 60 * 60 * 1000, // 2小时
      3 * 60 * 60 * 1000, // 3小时
      6 * 60 * 60 * 1000, // 6小时
      12 * 60 * 60 * 1000, // 12小时
      24 * 60 * 60 * 1000, // 1天
    ];

    // 找到最接近理想间隔的刻度间隔
    const idealInterval = duration / idealTickCount;
    let tickInterval = intervals[0];
    for (const interval of intervals) {
      if (interval >= idealInterval) {
        tickInterval = interval;
        break;
      }
      tickInterval = interval;
    }

    // 大刻度间隔
    const hourInMs = 60 * 60 * 1000;
    let majorInterval = tickInterval * 2;
    for (const interval of intervals) {
      if (interval >= majorInterval && interval % hourInMs === 0) {
        majorInterval = interval;
        break;
      }
    }
    if (majorInterval < hourInMs) majorInterval = hourInMs;

    const firstTickTime = Math.ceil(startMs / tickInterval) * tickInterval;
    for (let ms = firstTickTime; ms <= endMs; ms += tickInterval) {
      const position = ((ms - startMs) / duration) * 100;
      const isMajor = ms % majorInterval === 0 && ms % hourInMs === 0;
      result.push({ time: new Date(ms), position, major: isMajor });
    }
    return result;
  }, [visibleStart, visibleEnd, containerWidth]);

  // 拖动边界：允许在startTime和endTime之间自由拖动，播放时禁止拖动
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    // 播放状态下禁止拖动
    if (isPlaying) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartTime(currentTime);
  }, [isPlaying, currentTime]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const deltaX = e.clientX - dragStartX;
    // 计算拖动偏移对应的时间变化
    const deltaTimeMs = (deltaX / containerWidth) * visibleDuration;
    const newTime = new Date(dragStartTime.getTime() - deltaTimeMs);

    // 在startTime和endTime之间限制
    const clampedTime = new Date(
      Math.max(startTime.getTime(), Math.min(endTime.getTime(), newTime.getTime()))
    );
    onTimeChange(clampedTime);
  }, [isDragging, dragStartX, dragStartTime, visibleDuration, startTime, endTime, onTimeChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="timeline-slider" ref={containerRef} onMouseDown={handleMouseDown}>
      <div className="slider-viewport">
        {/* 时间刻度 */}
        <div className="slider-ticks">
          {ticks.map((tick, index) => (
            <div
              key={index}
              className="slider-tick"
              style={{ left: `${tick.position}%` }}
            >
              <div className={`tick-line ${tick.major ? 'major' : ''}`} />
              {tick.major && (
                <span className="tick-label">{formatTime(tick.time)}</span>
              )}
            </div>
          ))}
        </div>

        {/* 当前时间竖线 - 固定在50%位置（中间） */}
        <div className="current-time-line" style={{ left: '50%' }} />
      </div>
    </div>
  );
};
