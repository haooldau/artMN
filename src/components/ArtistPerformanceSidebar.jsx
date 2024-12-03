import React from 'react';
import { X, Calendar, MapPin } from 'lucide-react';

const ArtistPerformanceSidebar = ({
  artist,
  performances,
  onClose
}) => {
  if (!artist) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-40 transform transition-transform duration-300">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">
            {artist}的演出信息
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {performances.length > 0 ? (
            <div className="p-4 space-y-4">
              {performances.map((performance, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(performance.date).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {performance.province} {performance.city}
                        {performance.venue && ` - ${performance.venue}`}
                      </span>
                    </div>
                    {performance.poster && (
                      <img
                        src={`http://localhost:3001${performance.poster}`}
                        alt="演出海报"
                        className="w-full h-40 object-cover rounded-lg mt-2"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/160?text=暂无图片';
                        }}
                      />
                    )}
                    {performance.notes && (
                      <div className="text-sm text-gray-500">
                        备注: {performance.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              暂无演出信息
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistPerformanceSidebar;