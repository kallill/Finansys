import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TransactionRow = ({ name, date, amount, type, category }) => (
  <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type === 'income' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-500 dark:text-rose-400'}`}>
        {type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
      </div>
      <div>
        <p className="font-semibold text-slate-900 dark:text-white">{name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{date} • {category}</p>
      </div>
    </div>
    <span className={`font-bold ${type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
      {type === 'income' ? '+' : '-'} R$ {amount}
    </span>
  </div>
);

export default TransactionRow;
