import React from 'react';
import { X } from 'lucide-react';
import PerformanceInfo from './PerformanceInfo';

const ProvincePerformanceCard = ({ 
  selectedProvince, 
  onClose, 
  onArtistClick 
}) => {
  if (!selectedProvince) return null;

  return (
    <div 
      className="absolute top-[10%] left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-2xl z-50"
      style={{
        width: '450px',
        maxHeight: '80vh'
      }}
    >
      {/* 卡片头部 */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          {selectedProvince.properties.name}演出信息
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* 卡片内容区域 - 可滚动 */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 4rem)' }}>
        <PerformanceInfo
          performances={selectedProvince.performances}
          onArtistClick={onArtistClick}
        />
      </div>
    </div>
  );
};

export default ProvincePerformanceCard;