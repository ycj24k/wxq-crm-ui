import type { DropDownProps } from 'antd/es/dropdown';
import { Dropdown } from 'antd';
import React from 'react';
import classNames from 'classnames';
import styles from './index.less';

export type HeaderDropdownProps = {
  overlayClassName?: string;
  overlay: React.ReactNode | (() => React.ReactNode) | any;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight' | 'bottomCenter';
} & Omit<DropDownProps, 'overlay' | 'dropdownRender' | 'onOpenChange' | 'open'> & {
  onVisibleChange?: (open: boolean) => void;
  visible?: boolean;
};

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({ overlayClassName: cls, overlay, onVisibleChange, visible, ...restProps }) => (
  <Dropdown
    overlayClassName={classNames(styles.container, cls)}
    dropdownRender={typeof overlay === 'function' ? (menu) => (overlay as any)(menu) : () => overlay}
    onOpenChange={onVisibleChange}
    open={visible}
    {...restProps}
  />
);

export default HeaderDropdown;
