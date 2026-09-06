import React from 'react';
import { Package, CheckCircle, Truck, MapPin, Home, XCircle } from 'lucide-react';

export interface OrderTimelineProps {
  currentStatus?: string;
  status?: string;
}

const steps = [
  { status: 'PLACED', label: 'Order Placed', icon: Package, description: 'Your order has been placed successfully' },
  { status: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, description: 'Order confirmed by coordinator' },
  { status: 'ASSIGNED', label: 'Assigned', icon: Truck, description: 'Coordinator assigned for delivery' },
  { status: 'PICKUP', label: 'Pickup from Farmer', icon: MapPin, description: 'Produce being picked up from farm' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck, description: 'Your order is on the way' },
  { status: 'DELIVERED', label: 'Delivered', icon: Home, description: 'Order delivered successfully' },
];

const statusOrder = ['PLACED', 'CONFIRMED', 'ASSIGNED', 'PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function OrderTimeline({ currentStatus, status }: OrderTimelineProps) {
  const activeStatus = currentStatus || status || 'PLACED';
  const currentIndex = statusOrder.indexOf(activeStatus);
  const isCancelled = activeStatus === 'CANCELLED';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
        <XCircle className="w-6 h-6 text-red-500" />
        <div>
          <p className="font-semibold text-red-700">Order Cancelled</p>
          <p className="text-sm text-red-500">This order has been cancelled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                isCompleted
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'bg-white border-gray-200 text-gray-400'
              } ${isCurrent ? 'ring-4 ring-primary-100' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-12 ${isCompleted ? 'bg-primary-500' : 'bg-gray-200'}`} />
              )}
            </div>
            <div className="pb-12">
              <p className={`font-semibold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                {step.label}
              </p>
              <p className={`text-sm ${isCompleted ? 'text-gray-500' : 'text-gray-300'}`}>
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
