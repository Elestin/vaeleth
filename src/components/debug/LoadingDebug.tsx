import React from 'react';
import { useUI, useAuth } from '@/store';

const LoadingDebug: React.FC = () => {
  const { isLoading, error } = useUI();
  const { user } = useAuth();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded text-xs z-50">
      <div>Loading: {isLoading ? 'TRUE' : 'FALSE'}</div>
      <div>User: {user ? `${user.email}` : 'NULL'}</div>
      <div>Error: {error || 'None'}</div>
    </div>
  );
};

export default LoadingDebug;