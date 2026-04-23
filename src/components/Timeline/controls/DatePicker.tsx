import React, { useState, useRef, useEffect } from 'react';

export interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => new Date(value));
  const containerRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);

  // 同步isOpen ref
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // 当弹窗打开且value跨月时，同步viewDate
  useEffect(() => {
    if (isOpenRef.current) {
      const valueYear = value.getFullYear();
      const valueMonth = value.getMonth();
      const viewYear = viewDate.getFullYear();
      const viewMonth = viewDate.getMonth();
      
      if (valueYear !== viewYear || valueMonth !== viewMonth) {
        setViewDate(new Date(value));
      }
    }
  }, [value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const day = value.getDate();

  // 生成月份天数
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const selectDay = (d: number) => {
    const newDate = new Date(value);
    newDate.setFullYear(year, month, d);
    
    // 应用minDate/maxDate限制
    if (minDate && newDate < minDate) {
      newDate.setTime(minDate.getTime());
    }
    if (maxDate && newDate > maxDate) {
      newDate.setTime(maxDate.getTime());
    }
    
    onChange(newDate);
    setIsOpen(false);
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  return (
    <div className="date-picker" ref={containerRef}>
      <button className="date-picker-trigger" onClick={() => setIsOpen(!isOpen)}>
        📅 {value.toLocaleDateString('zh-CN')}
      </button>
      {isOpen && (
        <div className="date-picker-popup">
          <div className="picker-header">
            <button onClick={prevMonth}>&lt;</button>
            <span>{year}年 {monthNames[month]}</span>
            <button onClick={nextMonth}>&gt;</button>
          </div>
          <div className="picker-weekdays">
            {['日', '一', '二', '三', '四', '五', '六'].map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
          <div className="picker-days">
            {days.map((d, index) => (
              <button
                key={index}
                className={d !== null && d === day ? 'selected' : ''}
                onClick={() => d !== null && selectDay(d)}
                disabled={d === null}
              >
                {d || ''}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
