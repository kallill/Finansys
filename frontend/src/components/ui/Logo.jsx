import React from 'react';

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-gradient-to-tr from-red-600 to-red-600 rounded-lg flex items-center justify-center">
      <span className="text-white font-bold text-lg">C</span>
    </div>
    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
      Cerasus
    </span>
  </div>
);

export default Logo;
