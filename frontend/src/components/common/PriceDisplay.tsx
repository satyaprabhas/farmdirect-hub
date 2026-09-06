import React from 'react';
import { BadgeIndianRupee } from 'lucide-react';

interface PriceDisplayProps {
  price?: number;
  amount?: number;
  unit?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PriceDisplay({ price, amount, unit, label, size = 'md', className }: PriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  const displayPrice = price ?? amount ?? 0;

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center gap-1 mb-1">
          <BadgeIndianRupee className="w-3.5 h-3.5 text-primary-600" />
          <span className="text-xs font-medium text-primary-600">{label}</span>
        </div>
      )}
      <span className={`font-bold text-primary-700 ${sizeClasses[size]}`}>
        ₹{displayPrice}
      </span>
      {unit && <span className="text-gray-500 text-sm">/{unit}</span>}
    </div>
  );
}
