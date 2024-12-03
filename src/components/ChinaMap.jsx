import React from 'react';

const ChinaMap = ({ 
  mapData, 
  performanceData, 
  selectedProvince, 
  selectedArtist,
  onProvinceClick 
}) => {
  // 辅助函数 - 计算边界
  const getBounds = (features) => {
    let bounds = {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY
    };

    features.forEach(feature => {
      if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(polygon => {
          polygon[0].forEach(coord => {
            bounds.minX = Math.min(bounds.minX, coord[0]);
            bounds.minY = Math.min(bounds.minY, coord[1]);
            bounds.maxX = Math.max(bounds.maxX, coord[0]);
            bounds.maxY = Math.max(bounds.maxY, coord[1]);
          });
        });
      } else if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates[0].forEach(coord => {
          bounds.minX = Math.min(bounds.minX, coord[0]);
          bounds.minY = Math.min(bounds.minY, coord[1]);
          bounds.maxX = Math.max(bounds.maxX, coord[0]);
          bounds.maxY = Math.max(bounds.maxY, coord[1]);
        });
      }
    });

    return bounds;
  };

  // 辅助函数 - 投影坐标
  const projectPoint = (coord, bounds) => {
    const width = 800;
    const height = 600;
    const padding = 40;
    
    const scaleX = (width - padding * 2) / (bounds.maxX - bounds.minX);
    const scaleY = (height - padding * 2) / (bounds.maxY - bounds.minY);
    const scale = Math.min(scaleX, scaleY);

    const x = padding + (coord[0] - bounds.minX) * scale;
    const y = height - (padding + (coord[1] - bounds.minY) * scale);
    
    return [x, y];
  };

  // 辅助函数 - 生成SVG路径
  const generatePath = (geometry, bounds) => {
    try {
      let pathData = '';

      if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach(polygon => {
          pathData += polygon[0].map((coord, index) => {
            const [x, y] = projectPoint(coord, bounds);
            return `${index === 0 ? 'M' : 'L'}${x},${y}`;
          }).join(' ');
          pathData += 'Z ';
        });
      } else if (geometry.type === 'Polygon') {
        pathData = geometry.coordinates[0].map((coord, index) => {
          const [x, y] = projectPoint(coord, bounds);
          return `${index === 0 ? 'M' : 'L'}${x},${y}`;
        }).join(' ') + 'Z';
      }

      return pathData.trim();
    } catch (error) {
      console.error('生成路径错误:', error);
      return '';
    }
  };

  // 判断省份是否有选中艺人的演出
  const hasArtistPerformance = (provinceName) => {
    if (!selectedArtist) return false;
    return performanceData[provinceName]?.some(p => p.artist === selectedArtist);
  };

  const bounds = getBounds(mapData.features);

  return (
    <svg viewBox="0 0 800 600" className="w-full h-auto border border-gray-200">
      {mapData.features.map((feature, index) => {
        const provinceName = feature.properties.name
          .replace(/省|自治区|维吾尔|回族|壮族|特别行政区/g, '')
          .trim();
        
        const hasPerformances = !!performanceData[provinceName]?.length;

        return (
          <path
            key={index}
            d={generatePath(feature.geometry, bounds)}
            fill={
              hasArtistPerformance(provinceName)
                ? '#ef4444'
                : selectedProvince?.properties?.name === feature.properties.name
                  ? '#4299e1'
                  : hasPerformances 
                    ? '#93c5fd' 
                    : '#e2e8f0'
            }
            stroke="#fff"
            strokeWidth="1"
            className="transition-colors duration-200 hover:fill-blue-300 cursor-pointer"
            onClick={() => onProvinceClick(feature)}
          />
        );
      })}
    </svg>
  );
};

export default ChinaMap;