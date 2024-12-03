import React from 'react';
import ServiceCard from './ServiceCard';
import { MapPin, Calendar, ChartBar } from 'lucide-react';

const ServicesPage = () => {
  const services = [
    {
      icon: MapPin,
      title: '演出分布',
      description: '通过交互式地图直观展示全国演出分布情况，帮助您了解各地区的演出活跃度和市场动态。支持按省份查看详细演出信息。'
    },
    {
      icon: Calendar,
      title: '近期演出',
      description: '多维度展示近期演出信息，包括时间轴视图、艺人分布和日历视图。方便您快速掌握演出动态和规划安排。'
    },
    {
      icon: ChartBar,
      title: '数据统计',
      description: '提供全面的数据分析和可视化统计，包括演出数量趋势、艺人活跃度和地区分布等多个维度的统计图表。'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-red-500">•</span>
          <span className="text-gray-400">演出数据可视化</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          全方位展示<br />
          演出市场动态
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <ServiceCard
            key={index}
            icon={service.icon}
            title={service.title}
            description={service.description}
          />
        ))}
      </div>
    </div>
  );
};

export default ServicesPage; 