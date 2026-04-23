import { useState } from 'react';
import { Timeline } from './components/Timeline';

function App() {
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  });
  // const [autoPlay, setAutoPlay] = useState(false);

  const startTime = new Date();
  startTime.setDate(startTime.getDate() - 7); // 支持往前7天
  startTime.setHours(0, 0, 0, 0);
  
  const endTime = new Date();
  endTime.setDate(endTime.getDate() + 7);
  endTime.setHours(23, 59, 59, 999);

  const formatTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="app">
      <h1>Timeline 组件演示</h1>
      <div className="current-time-display">
        当前时间: {formatTime(currentTime)}
      </div>
      <Timeline
        // startTime={startTime}
        // endTime={endTime}
        currentTime={currentTime}
        onTimeChange={setCurrentTime}
        autoPlay={false}
        playbackSpeed={1}
        formatTime={formatTime}
        playbackInterval={1000}
        height={100}
        // onAutoPlayChange={setPlay}
      />
    </div>
  );
}

export default App;
