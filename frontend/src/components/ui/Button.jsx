import React from 'react';

const Button = ({ children, variant = 'primary', className = '', type = 'button', disabled = false, onClick, ...props }) => {
  const baseStyle = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95";
  const variants = {
    primary: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:bg-emerald-500/60 disabled:cursor-not-allowed",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 disabled:bg-slate-800/60 disabled:cursor-not-allowed",
    outline: "bg-transparent border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-60 disabled:cursor-not-allowed",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
  };

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
