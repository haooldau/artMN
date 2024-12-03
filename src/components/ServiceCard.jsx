import React from 'react';
import { ArrowRight } from 'lucide-react';

const ServiceCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-black/50 backdrop-blur-sm rounded-xl p-8 border border-white/10 
      hover:border-white/20 transition-all duration-300 group hover:transform 
      hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-red-500/10 to-purple-500/10 
        rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 
        transition-transform duration-300 border border-white/10"
      >
        <Icon className="w-6 h-6 text-white group-hover:text-red-500 transition-colors duration-300" />
      </div>
      
      <h3 className="text-white text-xl font-semibold mb-4 group-hover:text-red-500 
        transition-colors duration-300"
      >
        {title}
      </h3>
      
      <p className="text-gray-400 mb-6 leading-relaxed">
        {description}
      </p>
      
      <button className="flex items-center text-white opacity-0 group-hover:opacity-100 
        transition-all duration-300 hover:text-red-500"
      >
        了解更多
        <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 
          transition-transform duration-300" 
        />
      </button>
    </div>
  );
};

export default ServiceCard; 