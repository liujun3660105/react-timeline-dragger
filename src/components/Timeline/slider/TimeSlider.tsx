import React, { useRef, useState, useCallback, useEffect } from 'react';

export interface TimeSliderProps {
  startTime: Date;
  endTime: Date;
  currentTime: Date;
  onTimeChange: (time: Date) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  formatTime?: (date: Date) => string;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({
  startTime,
  endTime,
  currentTime,
  onTimeChange,
  onDragStart,
  onDragEnd,
  formatTime = (d) => d.toLocaleString(),
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localTime, setLocalTime] = useState(currentTime);

  useEffect(() => {
    if (!isDragging) {
      setLocalTime(currentTime);
    }
  }, [currentTime, isDragging]);

  const getTimeFromPosition = useCallback(
    (clientX: number): Date => {
      if (!trackRef.current) return currentTime;

      const rect = trackRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

      const startMs = startTime.getTime();
      const endMs = endTime.getTime();
      const newTimeMs = startMs + (endMs - startMs) * percentage;

      return new Date(newTimeMs);
    },
    [startTime, endTime, currentTime]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      onDragStart?.();
      const newTime = getTimeFromPosition(e.clientX);
      setLocalTime(newTime);
      onTimeChange(newTime);
    },
    [getTimeFromPosition, onTimeChange, onDragStart]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const newTime = getTimeFromPosition(e.clientX);
      setLocalTime(newTime);
      onTimeChange(newTime);
    },
    [isDragging, getTimeFromPosition, onTimeChange]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd?.();
    }
  }, [isDragging, onDragEnd]);

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

  const startMs = startTime.getTime();
  const endMs = endTime.getTime();
  const currentMs = localTime.getTime();
  const percentage = ((currentMs - startMs) / (endMs - startMs)) * 100;

  const generateTicks = () => {
    const ticks: React.ReactElement[] = [];
    const duration = endMs - startMs;
    const tickCount = 10;
    const tickInterval = duration / tickCount;

    for (let i = 0; i <= tickCount; i++) {
      const tickTime = new Date(startMs + tickInterval * i);
      const left = (i / tickCount) * 100;
      ticks.push(
        <div
          key={i}
          className="tick"
          style={{ left: `${left}%` }}
        >
          <div className="tick-line" />
          <span className="tick-label">{formatTime(tickTime)}</span>
        </div>
      );
    }
    return ticks;
  };

  return (
    <div className="time-slider">
      <div
        ref={trackRef}
        className="slider-track"
        onMouseDown={handleMouseDown}
      >
        <div className="track-background" />
        <div
          className="track-progress"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="track-thumb"
          style={{ left: `${percentage}%` }}
        >
          <div className="thumb-tooltip">{formatTime(localTime)}</div>
        </div>
        <div className="tick-container">{generateTicks()}</div>
      </div>
    </div>
  );
};
