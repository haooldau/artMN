import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PerformanceTimeline from './PerformanceTimeline';
import PerformanceGrid from './PerformanceGrid';
import PerformanceCalendar from './PerformanceCalendar';
import API_BASE_URL from '../config/api';

const ProvincePerformances = () => {
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
      const response = await axios.get(`${API_BASE_URL}/performances`);
      if (response.data.success) {
        const sortedPerformances = response.data.data.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        setPerformances(sortedPerformances);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        错误: {error}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden p-6">
      {/* 顶部时间轴 */}
      <div className="flex-shrink-0">
        <PerformanceTimeline
          performances={performances}
          onDateSelect={handleDateSelect}
        />
      </div>
      
      {/* 下半部分左右布局 */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* 左侧艺人云图 */}
        <div className="h-full overflow-hidden">
          <PerformanceGrid performances={performances} />
        </div>

        {/* 右侧演出日历 */}
        <div className="h-full overflow-hidden">
          <PerformanceCalendar 
            performances={performances}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        </div>
      </div>
    </div>
  );
};

export default ProvincePerformances;