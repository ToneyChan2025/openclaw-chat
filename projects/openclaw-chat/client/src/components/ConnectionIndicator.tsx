import React from 'react';
import { cn } from '../utils/cn';
import type { ConnectionStatus } from '../types/message';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
  className?: string;
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({ 
  status, 
  className 
}) => {
  if (status.connecting) {
    return (
      <div className={cn("flex items-center gap-2 text-yellow-600", className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">连接中...</span>
      </div>
    );
  }

  if (status.connected) {
    return (
      <div className={cn("flex items-center gap-2 text-green-600", className)}>
        <Wifi className="w-4 h-4" />
        <span className="text-sm">已连接</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 text-red-600", className)}>
      <WifiOff className="w-4 h-4" />
      <span className="text-sm">{status.error || '未连接'}</span>
    </div>
  );
};
