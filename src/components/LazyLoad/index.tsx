/**
 * 懒加载组件 - 用于异步加载组件
 */
import React, { Suspense } from 'react';
import { Spin } from 'antd';
import ErrorBoundary from '../ErrorBoundary';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

const DefaultFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '200px' 
  }}>
    <Spin tip="加载中..." />
  </div>
);

const LazyLoad: React.FC<LazyLoadProps> = ({ 
  children, 
  fallback = <DefaultFallback />,
  errorFallback
}) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyLoad;