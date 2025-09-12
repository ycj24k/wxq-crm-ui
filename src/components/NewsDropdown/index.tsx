import type { DropDownProps } from 'antd/es/dropdown';
import { Dropdown } from 'antd';
import React from 'react';
import classNames from 'classnames';
import styles from './index.less';

export type HeaderDropdownProps = {
  overlayClassName?: string;
  overlay?: React.ReactNode | (() => React.ReactNode) | any;
  menu?: any;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight' | 'bottomCenter';
} & Omit<DropDownProps, 'overlay'>;

const NewsDropdown: React.FC<HeaderDropdownProps> = ({ overlayClassName: cls, overlay, menu, ...restProps }) => {
  // 如果提供了 menu 属性，使用新的 API
  if (menu) {
    return (
      <Dropdown 
        overlayClassName={classNames(styles.container, cls)} 
        menu={menu}
        {...restProps} 
      />
    );
  }
  
  // 否则使用旧的 overlay API（向后兼容）
  return (
    <Dropdown 
      overlayClassName={classNames(styles.container, cls)} 
      dropdownRender={typeof overlay === 'function' ? (menu) => (overlay as any)(menu) : () => overlay}
      {...restProps} 
    />
  );
};

export default NewsDropdown;
