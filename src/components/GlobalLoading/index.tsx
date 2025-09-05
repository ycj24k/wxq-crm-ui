/**
 * 全局Loading组件
 */
import React from 'react';
import { Spin } from 'antd';
import './index.less';

interface GlobalLoadingProps {
  loading?: boolean;
  tip?: string;
  size?: 'small' | 'default' | 'large';
  fullScreen?: boolean;
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({
  loading = true,
  tip = '加载中...',
  size = 'large',
  fullScreen = true,
}) => {
  if (!loading) return null;

  return (
    <div className={`global-loading ${fullScreen ? 'full-screen' : ''}`}>
      <Spin size={size} tip={tip} />
    </div>
  );
};

export default GlobalLoading;