import { useState, useEffect, useRef } from 'react';
import { Timeline } from './components/Timeline';
import dayjs from 'dayjs';

// 任务类型
type TaskMode = 'none' | 'light' | 'heavy';

// 模拟复杂任务：用于测试帧率对 Timeline 组件的影响
function useFrameRateTest(taskMode: TaskMode) {
  const frameCountRef = useRef(0);
  const lastFpsRef = useRef(Date.now());
  const [fps, setFps] = useState(60);
  const [heavyTaskTime, setHeavyTaskTime] = useState(0);

  useEffect(() => {
    let animationId: number;
    let isRunning = true;

    // 不同任务模式的配置
    const taskConfig = {
      none: { loop: 0, extraChance: 0, extraLoop: 0 },
      light: { loop: 500000, extraChance: 0.05, extraLoop: 1000000 },
      heavy: { loop: 2000000, extraChance: 0.15, extraLoop: 4000000 },
    };

    const config = taskConfig[taskMode];

    const runFrame = () => {
      if (!isRunning) return;
      
      const startTime = performance.now();
      let result = 0;

      // 执行计算任务
      if (config.loop > 0) {
        for (let i = 1; i < config.loop; i++) {
          result += Math.sqrt(i) * Math.sin(i) * Math.cos(i / 1000);
        }
        // 额外负载
        if (Math.random() < config.extraChance) {
          for (let i = 1; i < config.extraLoop; i++) {
            result += Math.sqrt(i) * Math.cos(i) * Math.tan(i / 10000);
          }
        }
      }
      
      void result;
      
      const duration = performance.now() - startTime;
      setHeavyTaskTime(duration);
      
      // FPS 计数
      frameCountRef.current++;
      const now = Date.now();
      const elapsed = now - lastFpsRef.current;
      if (elapsed >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed));
        frameCountRef.current = 0;
        lastFpsRef.current = now;
      }
      
      // 继续下一帧
      animationId = requestAnimationFrame(runFrame);
    };

    // 重置 FPS 计数
    frameCountRef.current = 0;
    lastFpsRef.current = Date.now();

    animationId = requestAnimationFrame(runFrame);

    return () => {
      cancelAnimationFrame(animationId);
      isRunning = false;
    };
  }, [taskMode]);

  return { fps, heavyTaskTime };
}

function App() {
  // 任务模式状态
  const [taskMode, setTaskMode] = useState<TaskMode>('none');
  
  // 帧率测试
  const { fps, heavyTaskTime } = useFrameRateTest(taskMode);

  // const [currentTime, setCurrentTime] = useState(() => {
  //   const now = new Date();
  //   now.setHours(0, 0, 0, 0);
  //   return now;
  // });
  // const [currentTime, setCurrentTime] = useState(dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'))
  const [currentTime, setCurrentTime] = useState(new Date());
  // const [autoPlay, setAutoPlay] = useState(false);

  const startTime = new Date();
  startTime.setDate(startTime.getDate() - 7); // 支持往前7天
  startTime.setHours(0, 0, 0, 0);
  
  const endTime = new Date();
  endTime.setDate(endTime.getDate() + 7);
  endTime.setHours(23, 59, 59, 999);

  const formatTime = (date: Date) => {
    // return date.toLocaleString('zh-CN', {
    //   month: '2-digit',
    //   day: '2-digit',
    //   hour: '2-digit',
    //   minute: '2-digit',
    //   second: '2-digit'
    // });
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
  };
  function onTimeChange(time:Date){
    console.log(dayjs(time).format('YYYY-MM-DD HH:mm:ss'))
    setCurrentTime(time)
  }

  return (
    <div className="app">
      <h1>Timeline 组件演示</h1>
      
      {/* 帧率监控面板 */}
      <div className="fps-monitor" style={{
        display: 'flex',
        gap: '20px',
        padding: '10px',
        background: fps < 30 ? '#fee' : fps < 50 ? '#ffa' : '#efe',
        borderRadius: '4px',
        marginBottom: '10px',
        alignItems: 'center'
      }}>
        <span>FPS: <strong style={{ color: fps < 30 ? 'red' : 'inherit' }}>{fps}</strong></span>
        <span>任务耗时: <strong>{heavyTaskTime.toFixed(2)}ms</strong></span>
        
        {/* 任务模式切换 */}
        <div style={{ display: 'flex', gap: '8px', marginLeft: '20px' }}>
          <span style={{ fontSize: '14px' }}>测试任务:</span>
          <button 
            onClick={() => setTaskMode('none')}
            style={{
              padding: '4px 12px',
              background: taskMode === 'none' ? '#4CAF50' : '#ddd',
              color: taskMode === 'none' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            无任务 (60 FPS)
          </button>
          <button 
            onClick={() => setTaskMode('light')}
            style={{
              padding: '4px 12px',
              background: taskMode === 'light' ? '#FF9800' : '#ddd',
              color: taskMode === 'light' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            轻量任务 (~40 FPS)
          </button>
          <button 
            onClick={() => setTaskMode('heavy')}
            style={{
              padding: '4px 12px',
              background: taskMode === 'heavy' ? '#f44336' : '#ddd',
              color: taskMode === 'heavy' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            重量任务 (~15 FPS)
          </button>
        </div>
      </div>
      
      <div className="current-time-display">
        当前时间: {dayjs(currentTime).format('YYYY-MM-DD HH:mm:ss')}
      </div>
      <Timeline
        // startTime={startTime}
        // endTime={endTime}
        defaultCurrentTime={currentTime}
        onTimeChange={onTimeChange}
        autoPlay={true}
        playbackSpeed={1}
        isControlByLastedTime = {true}
        formatTime={formatTime}
        // playbackInterval={1000}
        height={100}
        // onAutoPlayChange={setPlay}
      />
    </div>
  );
}

export default App;
