import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  className = ''
}) => {
  const variantStyles = {
    primary: 'bg-[#0A4A3D]/10 text-[#0A4A3D] border border-[#0A4A3D]/25 font-semibold',
    success: 'bg-[#D1FAE5] text-[#167A58] border border-[#167A58]/20 font-medium',
    warning: 'bg-[#FEF3C7] text-[#B45309] border border-[#B45309]/20 font-medium',
    danger: 'bg-[#FEE2E2] text-[#C2413B] border border-[#C2413B]/20 font-medium',
    info: 'bg-blue-50 text-blue-700 border border-blue-200 font-medium',
    neutral: 'bg-[#F2F5F3] text-[#68756F] border border-[#E2E8E4] font-medium'
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-1 rounded-full'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
