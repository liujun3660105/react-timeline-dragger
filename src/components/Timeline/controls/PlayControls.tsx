import React from 'react';

export interface PlayControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onJumpToStart: () => void;
  onJumpToEnd: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
}

const speeds = [0.5, 1, 2, 4, 8];

export const PlayControls: React.FC<PlayControlsProps> = ({
  isPlaying,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onJumpToStart,
  onJumpToEnd,
  playbackSpeed,
  onSpeedChange,
  disabled = false,
}) => {
  return (
    <div className="timeline-controls">
      <div className="controls-group">
        <button
          className="control-btn"
          onClick={onJumpToStart}
          disabled={disabled}
          title="跳到开始"
        >
          ⏮
        </button>
        <button
          className="control-btn"
          onClick={onStepBackward}
          disabled={disabled}
          title="后退一帧"
        >
          ⏪
        </button>
        <button
          className="control-btn play-btn"
          onClick={isPlaying ? onPause : onPlay}
          disabled={disabled}
          title={isPlaying ? '暂停' : '播放'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          className="control-btn"
          onClick={onStepForward}
          disabled={disabled}
          title="前进一帧"
        >
          ⏩
        </button>
        <button
          className="control-btn"
          onClick={onJumpToEnd}
          disabled={disabled}
          title="跳到结束"
        >
          ⏭
        </button>
      </div>
      <div className="speed-selector">
        <span className="speed-label">速度:</span>
        <select
          value={playbackSpeed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="speed-select"
        >
          {speeds.map((speed) => (
            <option key={speed} value={speed}>
              {speed}x
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
