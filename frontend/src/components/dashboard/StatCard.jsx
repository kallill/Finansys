import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, change, isPositive, icon: Icon }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all group shadow-sm dark:shadow-none">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
      </div>
      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-emerald-500/10 dark:group-hover:bg-emerald-500/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-slate-500 dark:text-slate-400">
        <Icon size={20} />
      </div>
    </div>
    <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
      {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
      <span className="font-medium">{change}</span>
      <span className="text-slate-500 dark:text-slate-500 ml-1">vs. mês anterior</span>
    </div>
  </div>
);

export default StatCard;
