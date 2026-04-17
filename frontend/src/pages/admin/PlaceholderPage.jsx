import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Construction } from 'lucide-react';

const PlaceholderPage = ({ title }) => {
  return (
    <AdminLayout title={title}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-3xl mb-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-red-600/5 group-hover:bg-red-600/10 transition-colors"></div>
          <Construction size={80} className="text-red-500 relative z-10 animate-bounce" />
        </div>
        <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-white">
          MÃƒÂ³dulo em Desenvolvimento
        </h2>
        <p className="text-gray-400 max-w-md text-lg leading-relaxed">
          O mÃƒÂ³dulo de <span className="text-red-500 font-semibold">{title}</span> estÃƒÂ¡ sendo preparado para oferecer a melhor experiÃƒÂªncia operacional da Cerasus.
        </p>
        <div className="mt-8 flex gap-4">
          <div className="h-1 w-12 bg-gray-800 rounded-full"></div>
          <div className="h-1 w-24 bg-red-600 rounded-full"></div>
          <div className="h-1 w-12 bg-gray-800 rounded-full"></div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PlaceholderPage;
