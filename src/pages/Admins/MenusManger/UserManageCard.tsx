import './index.less';
import { message, Modal, Tree } from 'antd';
import { useEffect, useState } from 'react';
import type { CheckInfo } from 'antd/es/tree';
import request from '@/services/ant-design-pro/apiRequest';

export default (props: any) => {
  const { MenuVisible, setMenuVisible, MenuContent, callbackRef, menuRenderData } = props;
  console.log(menuRenderData,'renderData')
  const [treeData, setTreeData] = useState<any[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);

  // 将MenuContent.content转换为Tree组件可用的格式
  const convertToTreeData = (data: any[]): any[] => {
    if (!data || !Array.isArray(data)) return [];

    return data.map((item) => ({
      key: item.id,
      title: item.name,
      children: item.children ? convertToTreeData(item.children) : [],
    }));
  };

  useEffect(() => {
    if (MenuContent && MenuContent.content) {
      const formattedData = convertToTreeData(MenuContent.content);
      setTreeData(formattedData);
    }
  }, [MenuContent]);

  // 处理菜单回显
  useEffect(() => {
    if (menuRenderData && menuRenderData.menuList && menuRenderData.menuList.length > 0) {
      // 从menuRenderData中提取菜单ID作为checkedKeys
      const menuIds = menuRenderData.menuList.map((item: any) => item.id);
      setCheckedKeys(menuIds);
      setSelectedIds(menuIds);
    } else {
      // 如果没有菜单列表，则清空选中状态
      setCheckedKeys([]);
      setSelectedIds([]);
    }
  }, [menuRenderData]);

  // 获取所有子节点的key
  const getChildKeys = (node: any): React.Key[] => {
    const keys: React.Key[] = [];
    const traverse = (n: any) => {
      if (!n) return;
      if (n.key) keys.push(n.key);
      if (n.children && n.children.length > 0) {
        n.children.forEach((child: any) => traverse(child));
      }
    };
    traverse(node);
    return keys;
  };

  // 查找节点
  const findNode = (key: React.Key, nodes: any[]): any => {
    for (const node of nodes) {
      if (node.key === key) return node;
      if (node.children && node.children.length > 0) {
        const found = findNode(key, node.children);
        if (found) return found;
      }
    }
    return null;
  };

  // 自定义onCheck处理
  const handleCheck = (checked: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }, info: CheckInfo) => {
    const { node, checked: isChecked } = info;
    const nodeKey = node.key as React.Key;

    let newCheckedKeys = [...checkedKeys];

    if (isChecked) {
      // 选中节点时，添加当前节点及其所有子节点
      const nodeToAdd = findNode(nodeKey, treeData);
      if (nodeToAdd) {
        const childKeys = getChildKeys(nodeToAdd);
        newCheckedKeys = [...new Set([...newCheckedKeys, ...childKeys])];
      }
    } else {
      // 取消选中节点时，只移除当前节点及其子节点，不影响父节点
      const nodeToRemove = findNode(nodeKey, treeData);
      if (nodeToRemove) {
        const childKeys = getChildKeys(nodeToRemove);
        newCheckedKeys = newCheckedKeys.filter(key => !childKeys.includes(key));
      }
    }

    setCheckedKeys(newCheckedKeys);

    // 更新选中的ID列表
    setSelectedIds(newCheckedKeys);
  };

  const handleSure = () => {
    request
      .post2(
        '/sms/system/sysRoleMenu/updateFromTree',
        {
          id: menuRenderData.id,
        },
        {
          array: selectedIds,
        },
      )
      .then((res: any) => {
        if (res.status == 'success') {
          message.success('授权成功');
          setSelectedIds([]);
          callbackRef();
          setTimeout(() => {
            setMenuVisible(false);
            setTreeData([])
          }, 500);
        }
      });
  }

  return (
    <>
      <Modal
        title="菜单授权"
        open={MenuVisible}
        onCancel={() => {
          setMenuVisible(false)
          setTreeData([])
        }}
        onOk={() => {
          handleSure()
        }}
        width={800}
        destroyOnClose={true}
      >
        <div className="menu-tree-container">
          {treeData.length > 0 ? (
            <Tree
              showIcon
              checkable
              defaultExpandAll
              treeData={treeData}
              checkedKeys={checkedKeys}
              onCheck={handleCheck}
              checkStrictly={true} // 父子节点选中状态不再关联
            />
          ) : (
            <div>暂无菜单数据</div>
          )}
        </div>
      </Modal>
    </>
  );
};