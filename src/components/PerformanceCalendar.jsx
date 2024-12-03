import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Music, X, Calendar } from 'lucide-react';

const PerformanceCalendar = ({ performances, onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCell, setSelectedCell] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPerformances, setSelectedPerformances] = useState([]);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const calendarRef = useRef(null);

  // 获取当月的第一天
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  // 获取当月的最后一天
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  // 获取当月第一天是星期几（0-6）
  const firstDayWeekday = firstDayOfMonth.getDay();
  // 获取当月的天数
  const daysInMonth = lastDayOfMonth.getDate();

  // 处理月份切换
  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    setSelectedCell(null);
  };

  // 获取指定日期的演出
  const getPerformancesByDate = (date) => {
    if (!date) return [];
    return performances.filter(perf => {
      const perfDate = new Date(perf.date);
      return perfDate.toDateString() === date.toDateString();
    });
  };

  // 处理日期点击
  const handleDateClick = (date, event) => {
    const datePerformances = getPerformancesByDate(date);
    if (datePerformances.length > 0) {
      // 获取点击元素的位置
      const cellRect = event.currentTarget.getBoundingClientRect();
      const calendarRect = calendarRef.current.getBoundingClientRect();
      
      // 计算相对于日历容器的位置
      setModalPosition({
        x: cellRect.left - calendarRect.left + (cellRect.width / 2),
        y: cellRect.top - calendarRect.top + (cellRect.height / 2)
      });
      
      setSelectedPerformances(datePerformances);
      setShowModal(true);
    }
    setSelectedCell(date);
    onDateSelect && onDateSelect(date);
  };

  // 生成日历网格
  const generateCalendarDays = () => {
    const days = [];

    // 添加上个月的日期
    for (let i = 0; i < firstDayWeekday; i++) {
      const prevMonthDate = new Date(firstDayOfMonth);
      prevMonthDate.setDate(prevMonthDate.getDate() - (firstDayWeekday - i));
      days.push({ date: prevMonthDate, isCurrentMonth: false });
    }

    // 添加当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      days.push({ date, isCurrentMonth: true });
    }

    // 添加下个月的日期（填充到35个格子，即5行）
    const remainingDays = 35 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDate = new Date(lastDayOfMonth);
      nextMonthDate.setDate(nextMonthDate.getDate() + i);
      days.push({ date: nextMonthDate, isCurrentMonth: false });
    }

    return days.map(({ date, isCurrentMonth }) => {
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedCell?.toDateString() === date.toDateString();
      const datePerformances = getPerformancesByDate(date);
      const hasPerformances = datePerformances.length > 0;

      return (
        <button
          key={date.toISOString()}
          onClick={(e) => handleDateClick(date, e)}
          className={`
            relative p-2 h-24 text-left transition-all
            ${isCurrentMonth ? 'bg-white/5' : 'bg-black/20 opacity-50'}
            ${isToday ? 'ring-1 ring-red-500' : ''}
            ${isSelected ? 'bg-red-500/20' : 'hover:bg-white/10'}
            ${hasPerformances ? 'ring-1 ring-white/20' : ''}
          `}
        >
          <div className={`
            text-sm font-medium mb-1
            ${isToday ? 'text-red-500' : ''}
            ${isCurrentMonth ? '' : 'opacity-50'}
          `}>
            {date.getDate()}
          </div>
          
          {hasPerformances && (
            <div className="space-y-1">
              {datePerformances.slice(0, 2).map((perf, idx) => (
                <div
                  key={idx}
                  className="text-[10px] bg-white/10 backdrop-blur-sm rounded-full px-2 py-0.5 truncate"
                  title={`${perf.venue} (${perf.artist})`}
                >
                  {perf.venue}
                </div>
              ))}
              {datePerformances.length > 2 && (
                <div className="text-[10px] text-center opacity-60">
                  +{datePerformances.length - 2} 场演出
                </div>
              )}
            </div>
          )}
        </button>
      );
    });
  };

  return (
    <div className="h-full flex flex-col" ref={calendarRef}>
      {/* 日历头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMonthChange('prev')}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg">
            {currentDate.toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long'
            })}
          </span>
          <button
            onClick={() => handleMonthChange('next')}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 日历主体 */}
      <div className="flex-1 grid grid-cols-7 gap-px bg-white/10 rounded-lg overflow-hidden">
        {/* 星期标题 */}
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium bg-white/5">
            {day}
          </div>
        ))}
        {/* 日期格子 */}
        {generateCalendarDays()}
      </div>

      {/* 演出详情弹窗 */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 animate-fadeIn" 
            onClick={() => setShowModal(false)} 
          />
          <div 
            className="relative bg-gray-900/90 w-[800px] max-h-[80vh] rounded-xl border border-white/10 overflow-hidden opacity-0 animate-modalIn"
            style={{
              transformOrigin: `${modalPosition.x}px ${modalPosition.y}px`
            }}
          >
            {/* 弹窗头部 */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-white/10 bg-gray-900/90 backdrop-blur-sm">
              <h3 className="text-xl font-medium">
                {selectedCell?.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}日演出
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* 弹窗内容 */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-5rem)] custom-scrollbar">
              <div className="space-y-6">
                {selectedPerformances.map((performance, index) => (
                  <div 
                    key={index} 
                    className="flex gap-6 bg-white/5 rounded-xl p-4 backdrop-blur-sm opacity-0 animate-cardIn"
                    style={{ '--card-delay': `${index * 100 + 300}ms` }}
                  >
                    {/* 海报 */}
                    {performance.poster && (
                      <div className="w-1/4 flex-shrink-0">
                        <img
                          src={performance.poster ? 
                            (process.env.NODE_ENV === 'development' 
                              ? `http://localhost:3001${performance.poster}`
                              : performance.poster)
                            : 'https://via.placeholder.com/300x400?text=暂无海报'
                          }
                          alt="演出海报"
                          className="w-full aspect-[3/4] object-cover rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x400?text=暂无海报';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* 演出信息 */}
                    <div className="flex-1 space-y-4">
                      <div className="text-xl font-medium">{performance.artist}</div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white/80">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(performance.date).toLocaleDateString('zh-CN')}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-white/80">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {performance.province} {performance.city}
                            {performance.venue && ` · ${performance.venue}`}
                          </span>
                        </div>
                        
                        {performance.type && (
                          <div className="flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            <span className="text-white/80">{performance.type}</span>
                          </div>
                        )}
                      </div>

                      {performance.notes && (
                        <div className="text-sm text-white/60 mt-2">
                          {performance.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes cardIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease forwards;
        }

        .animate-modalIn {
          animation: modalIn 0.3s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
        }

        .animate-cardIn {
          animation: cardIn 0.4s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
          animation-delay: var(--card-delay, 0ms);
        }
      `}</style>
    </div>
  );
};

export default PerformanceCalendar;