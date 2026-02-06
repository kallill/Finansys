import React from 'react';

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-gradient-to-tr from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
      <span className="text-white font-bold text-lg">F</span>
    </div>
    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
      Finansys
    </span>
  </div>
);

export default Logo;
