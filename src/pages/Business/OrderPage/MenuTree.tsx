import './index.less';
import { message, Modal, Tree, Input } from 'antd';
import { useEffect, useState } from 'react';
import type { CheckInfo } from 'antd/es/tree';
const { Search } = Input;
import request from '@/services/ant-design-pro/apiRequest';

export default (props: any) => {
  const { MenuVisible, setMenuVisible, MenuContent, callbackRef, menuRenderData,backProject } = props;

  console.log(backProject, 'this.MenuContent')

  const [treeData, setTreeData] = useState<any[]>([]);
  const [filteredTreeData, setFilteredTreeData] = useState<any[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');

  useEffect(() => {
    const dictionariesList = localStorage.getItem('dictionariesList');
    if (dictionariesList) {
      let dictionariesArray = JSON.parse(dictionariesList)[1].children
      const formattedData = convertToTreeData(dictionariesArray)
      setTreeData(formattedData);
      setFilteredTreeData(formattedData);
    }
  }, [])

  // 将岗位转换为Tree组件可用的格式
  const convertToTreeData = (data: any[]): any[] => {
    if (!data || !Array.isArray(data)) return [];

    return data.map((item) => ({
      key: item.value,
      title: item.name,
      children: item.children ? convertToTreeData(item.children) : [],
    }));
  };

  // 过滤树节点的函数
  const filterTreeNode = (nodes: any[], keyword: string): any[] => {
    if (!keyword) return nodes;

    return nodes
      .map(node => {
        // 创建节点的副本，以避免修改原始数据
        const newNode = { ...node };

        // 检查当前节点的标题是否包含关键字
        const matchesKeyword = node.title.toLowerCase().includes(keyword.toLowerCase());

        // 如果有子节点，递归过滤
        if (node.children && node.children.length > 0) {
          newNode.children = filterTreeNode(node.children, keyword);
          // 如果子节点有匹配项或当前节点匹配，则保留该节点
          return (newNode.children.length > 0 || matchesKeyword) ? newNode : null;
        }

        // 如果是叶子节点，根据是否匹配关键字决定是否保留
        return matchesKeyword ? newNode : null;
      })
      .filter(Boolean); // 过滤掉空值
  };

  // useEffect(() => {
  //   if (MenuContent && MenuContent.data) {
  //     const formattedData = convertToTreeData(MenuContent.data);
  //     setTreeData(formattedData);
  //     setFilteredTreeData(formattedData); // 初始化过滤后的树数据
  //   }
  // }, [MenuContent.data]);

  // 当搜索值或树数据变化时，更新过滤后的树数据
  useEffect(() => {
    setFilteredTreeData(filterTreeNode(treeData, searchValue));
  }, [searchValue, treeData]);

  // 处理菜单回显
  useEffect(() => {
    if (backProject && backProject.length > 0) {
      // 从menuRenderData中提取菜单ID作为checkedKeys
      // console.log(backProject, '菜单回显')
      // const menuIds = backProject.map((item: any) => console.log(item.value,'gfjhiaooias'));
      // console.log(menuIds, 'menuIds')
      setCheckedKeys(backProject);
      setSelectedIds(backProject);
    } else {
      // 如果没有菜单列表，则清空选中状态
      setCheckedKeys([]);
      setSelectedIds([]);
    }
  }, [backProject]);

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
    console.log(newCheckedKeys, 'newCheckedKeys')
    // 更新选中的ID列表
    setSelectedIds(newCheckedKeys);
  };

  const handleSure = () => {
    console.log(selectedIds, 'selectedIds')
    request.postAll('/sms/commonProjects', selectedIds).then((res: any) => {
      if (res.status == 'success') {
        message.success('操作成功');
      }
    });
    // request
    //   .post2(
    //     '/sms/system/sysRoleMenu/updateFromTree',
    //     {
    //       id: menuRenderData.id,
    //     },
    //     {
    //       array: selectedIds,
    //     },
    //   )
    //   .then((res: any) => {
    //     if (res.status == 'success') {
    //       message.success('授权成功');
    //       setSelectedIds([]);
    //       callbackRef();
    //       setTimeout(() => {
    //         setMenuVisible(false);
    //         setTreeData([])
    //       }, 500);
    //     }
    //   });
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
        width={400}
        destroyOnClose={true}
      >
        <div className="menu-tree-container">
          <Search
            placeholder="搜索菜单"
            allowClear
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ marginBottom: 8 }}
          />

          {treeData.length > 0 ? (
            filteredTreeData.length > 0 ? (
              <Tree
                showIcon
                checkable
                defaultExpandAll
                treeData={filteredTreeData}
                checkedKeys={checkedKeys}
                onCheck={handleCheck}
                checkStrictly={true}
              />
            ) : (
              <div>没有匹配的菜单项</div>
            )
          ) : (
            <div>暂无菜单数据</div>
          )}
        </div>
      </Modal>
    </>
  );
};