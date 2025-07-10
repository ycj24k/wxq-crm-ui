import ProCard from '@ant-design/pro-card';
import { Modal, Tree, Input } from 'antd';
import { useState, useEffect } from 'react';
const { Search } = Input;
import request from '@/services/ant-design-pro/apiRequest';
let CheckedKeys: any = [];
export default (props: any) => {
  const { setParentIdTree, setParentIdFalg, callbackRef, type } = props;
  const [treeData, setTreeData] = useState([]);
  // const [searchValue, setSearchValue] = useState<any>('');
  const [expandedKeys, setexpandedKeys] = useState([]);
  const [searchValue, setsearchValue] = useState('');
  const [autoExpandParent, setautoExpandParent] = useState(true);
  useEffect(() => {
    contentTree();
  }, []);
  const contentTree2 = (data: any) => {
    data.forEach((item: any, index: number) => {
      item.children = [];
      item.title = item.name;
      data.forEach((items: any, indexs: number) => {
        if (item.id == Math.abs(items.parentId) && index != indexs) {
          item.children.push(items);
        }
      });
      if (item.children.length == 0) {
        delete item.children;
      }
    });

    return data;
  };
  const contentTreeKey = (data: any, idKey: any) => {
    data.forEach((item: any, index: number) => {
      item.key = index + '-' + idKey;
      if (item.children) {
        contentTreeKey(item.children, item.key);
      }
    });
    return data;
  };
  
  // 递归过滤掉 isDel < 0 的节点
  const filterDeletedNodes = (data:any) => {
    return data.filter((item:any) => item.isDel >= 0) // 保留 isDel >= 0 的节点
      .map((item:any) => {
        // 如果有子节点，递归处理子节点
        if (item.children && item.children.length) {
          return {
            ...item,
            children: filterDeletedNodes(item.children)
          };
        }
        return item;
      });
  }


  const contentTree = async () => {
    const contentList: any = await request.get('/sms/share/getDepartment', {
      _isGetAll: true,
    });
    let arr: any = [];
    let arr2 = contentList.data.reverse();
    arr2 = filterDeletedNodes(arr2);

    arr2.forEach((item: any) => {
      arr.push({ title: item.name, key: item.id });
    });
    const arr3: any = contentTree2(arr2);
    const content: any = contentTreeKey(arr3, 0);

    setTreeData(content);
  };
  const onExpand = (expandedKeys: any) => {
    setexpandedKeys(expandedKeys);
    setautoExpandParent(false);
  };

  const onChange = (e: any) => {
    const { value } = e.target;

    setsearchValue(value);
    setautoExpandParent(true);
  };
  const loop = (data: any = []) => {
    let arr: any = [];
    data.forEach((item: any) => {
      const index = item.title?.indexOf(searchValue);
      if (item.children && searchValue.length > 0) {
        arr.push(...loop(item.children));
      }
      if (index > -1 && searchValue.length > 0) {
        arr.push({ title: item.title, id: item.id, key: item.key });
      }
      if (searchValue.length == 0) {
        arr = [];
        arr.push(item);
      }
    });
    // console.log('arr', arr);
    return arr;
  };
  return (
    <ProCard title="部门列表" colSpan="25%" style={{ width: type == 'modal' ? '100%' : '25%' }}>
      <Search style={{ marginBottom: 30 }} placeholder="Search" onChange={(e) => onChange(e)} />
      {treeData.length > 0 && (
        <Tree
          showIcon
          // checkable
          defaultExpandAll={true}
          onExpand={(e) => onExpand(e)}
          autoExpandParent={autoExpandParent}
          defaultCheckedKeys={CheckedKeys}
          onSelect={(selectedKeys, e: any) => {
            setParentIdTree({ id: e.node.id, name: e.node.title });
            setParentIdFalg && setParentIdFalg(false);
            callbackRef && callbackRef();
          }}
          treeData={loop(treeData)}
        />
      )}
    </ProCard>
  );
};
