import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PerformanceTimeline from './PerformanceTimeline';
import PerformanceGrid from './PerformanceGrid';
import PerformanceCalendar from './PerformanceCalendar';
import { CalendarClock } from 'lucide-react';
import API_BASE_URL from '../config/api';

const RecentPerformances = () => {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchPerformances();
  }, []);

  const fetchPerformances = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/api/performances'
        : '/api/performances';

      const response = await fetch(apiUrl, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`获取演出数据失败: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Performance API Response:', responseData);

      if (responseData.success && responseData.data) {
        const sortedPerformances = responseData.data
          .map(perf => ({
            ...perf,
            date: new Date(perf.date)
          }))
          .sort((a, b) => b.date - a.date);

        console.log('处理后的演出数据:', sortedPerformances[0]);
        setPerformances(sortedPerformances);
      } else {
        throw new Error('数据格式不正确');
      }
    } catch (error) {
      console.error('获取演出数据失败:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const scrollToToday = () => {
    if (window.timelineScrollToToday) {
      window.timelineScrollToToday();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-red-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="bg-red-50 text-red-500 px-6 py-4 rounded-lg shadow-sm">
          <p className="font-medium">获取数据失败</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-black text-white">
      {/* 页面标题 */}
      <div className="flex items-center justify-between p-6 pb-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-purple-500">
          近期演出
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            共 {performances.length} 场演出
          </div>
          <button
            onClick={scrollToToday}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 text-white/80 rounded-full backdrop-blur-sm transition-colors border border-white/10"
          >
            <CalendarClock className="w-4 h-4" />
            <span>TODAY</span>
          </button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 min-h-0 p-6 pt-0 space-y-4">
        {/* 时间轴区域 */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <PerformanceTimeline
            performances={performances}
            onDateSelect={handleDateSelect}
          />
        </div>
        
        {/* 下半部分左右布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          {/* 左侧艺人分布 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 overflow-hidden">
            <h2 className="text-lg font-medium mb-4">重点艺人</h2>
            <div className="h-[calc(100%-2rem)] min-h-[400px]">
              <PerformanceGrid performances={performances} />
            </div>
          </div>

          {/* 右侧演出日历 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 overflow-hidden">
            <h2 className="text-lg font-medium mb-4">演出日历</h2>
            <div className="h-[calc(100%-2rem)] min-h-[400px]">
              <PerformanceCalendar 
                performances={performances}
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentPerformances;