import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PerformanceTimeline = ({ performances, onDateSelect }) => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [centerDate, setCenterDate] = useState(new Date());
  const [showConfetti, setShowConfetti] = useState(false);

  // 获取日期范围（前1个月到后3个月）
  const getDates = (centerDate) => {
    const dates = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 1); // 从一个月前开始
    
    // 生成120天的日期
    for (let i = 0; i < 120; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = getDates(centerDate);

  // 根据日期获取演出信息
  const getPerformancesByDate = (date) => {
    if (!date) return [];
    return performances.filter(perf => {
      const perfDate = new Date(perf.date);
      return perfDate.toDateString() === date.toDateString();
    });
  };

  // 处理滚动
  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // 监听滚动位置更新箭头显示状态
  const handleScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // 创建彩带
  const createConfetti = () => {
    const confetti = [];
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    for (let i = 0; i < 100; i++) {
      const left = Math.random() * 100;
      const animationDuration = 1 + Math.random() * 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      confetti.push(
        <div
          key={i}
          className="absolute w-2 h-8 origin-top"
          style={{
            left: `${left}%`,
            top: '-20px',
            backgroundColor: color,
            transform: `rotate(${Math.random() * 360}deg)`,
            animation: `confetti ${animationDuration}s ease-out forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      );
    }
    return confetti;
  };

  // 回到今天
  const scrollToToday = () => {
    setCenterDate(new Date());
    if (scrollRef.current) {
      // 计算今天的位置
      const todayIndex = dates.findIndex(date => 
        date.toDateString() === new Date().toDateString()
      );
      const dayWidth = 102; // 日期卡片宽度 + gap
      const scrollPosition = todayIndex * dayWidth;
      scrollRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      
      // 触发彩带动画
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  // 暴露scrollToToday方法给父组件
  useEffect(() => {
    window.timelineScrollToToday = scrollToToday;
    return () => {
      delete window.timelineScrollToToday;
    };
  }, []);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScrollPosition);
      // 初始滚动到今天
      setTimeout(scrollToToday, 100);
    }
    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScrollPosition);
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* 彩带动画 */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {createConfetti()}
        </div>
      )}

      {/* 左箭头 */}
      {showLeftArrow && (
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 backdrop-blur-sm transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* 右箭头 */}
      {showRightArrow && (
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 backdrop-blur-sm transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* 时间轴内容 */}
      <div
        ref={scrollRef}
        className="overflow-x-auto hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-2 p-2 min-w-max">
          {dates.map((date, index) => {
            const datePerformances = getPerformancesByDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const showMonth = date.getDate() === 1 || index === 0;
            const hasPerformances = datePerformances.length > 0;

            return (
              <button
                key={date.toISOString()}
                className={`
                  flex-shrink-0 w-[100px] rounded-xl p-3 transition-all
                  ${isToday ? 'bg-red-500/20 ring-1 ring-red-500/50' : hasPerformances ? 'bg-white/5 hover:bg-white/10' : 'hover:bg-white/5'}
                `}
                onClick={() => onDateSelect && onDateSelect(date)}
              >
                {showMonth && (
                  <div className="text-xs font-medium mb-1 text-center opacity-60">
                    {date.toLocaleDateString('zh-CN', { month: 'long' })}
                  </div>
                )}
                <div className="text-center mb-2">
                  <div className="text-xs opacity-60">
                    {date.toLocaleDateString('zh-CN', { weekday: 'short' })}
                  </div>
                  <div className={`text-lg font-medium ${isToday ? 'text-red-500' : ''}`}>
                    {date.getDate()}
                  </div>
                </div>
                {hasPerformances && (
                  <div className="space-y-1">
                    {datePerformances.slice(0, 3).map((perf, idx) => (
                      <div
                        key={idx}
                        className="text-[10px] text-white/80 text-center bg-white/10 backdrop-blur-sm 
                          rounded-full px-2 py-0.5 truncate"
                        title={perf.venue || '未知场馆'}
                      >
                        {perf.venue || '未知场馆'}
                      </div>
                    ))}
                    {datePerformances.length > 3 && (
                      <div className="text-[10px] text-center text-white/60">
                        +{datePerformances.length - 3} 场演出
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 彩带动画样式 */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PerformanceTimeline;