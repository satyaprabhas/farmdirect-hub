import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  PLACED: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  CONFIRMED: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  ASSIGNED: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  PICKUP: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  OUT_FOR_DELIVERY: { bg: 'bg-cyan-100', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  DELIVERED: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
  SOLDOUT: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const safeStatus = status || 'UNKNOWN';
  const config = statusConfig[safeStatus] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' };
  const label = safeStatus.replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} ${className || ''}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
}
