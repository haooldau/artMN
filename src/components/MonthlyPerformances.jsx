import React from 'react';
import { X } from 'lucide-react';

const MonthlyPerformances = ({ month, performances, onClose }) => {
  // 按省份分组
  const groupByProvince = performances.reduce((groups, performance) => {
    const province = performance.province || '未知省份';
    if (!groups[province]) {
      groups[province] = [];
    }
    groups[province].push(performance);
    return groups;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">
            {month} 演出统计
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 max-h-[calc(80vh-4rem)]">
          {Object.entries(groupByProvince).map(([province, provincePerformances]) => (
            <div key={province} className="mb-6">
              <h4 className="text-lg font-medium text-gray-800 mb-3 sticky top-0 bg-white py-2">
                {province} ({provincePerformances.length}场演出)
              </h4>
              <div className="space-y-4">
                {provincePerformances.map((performance, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="font-medium text-blue-600 mb-2">
                      {performance.artist}
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>日期: {new Date(performance.date).toLocaleDateString('zh-CN')}</div>
                      <div>场馆: {performance.venue || '未设置'}</div>
                      {performance.type && <div>类型: {performance.type}</div>}
                    </div>
                    {performance.poster && (
                      <img
                        src={`http://localhost:3001${performance.poster}`}
                        alt="演出海报"
                        className="mt-2 w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/160?text=暂无图片';
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyPerformances;