import { ApartmentOutlined, UserOutlined } from '@ant-design/icons';
import { Modal, Tree, Input, message, Radio } from 'antd';
import request from '@/services/ant-design-pro/apiRequest';
import { SetStateAction, useState } from 'react';
const { Search } = Input;
import './index.less';
import e from 'express';
import { useEffect } from 'react';

export default (props: any) => {
  const {
    CardVisible,
    setCardVisible,
    setDepartment,
    CardContent,
    departments,
    parentIdTree,
    checkable = false,
    callbackRef,
    setchargePerson,
    setUserID,
    getUserList,
    departNameList = false
  } = props;
  let obj: any;
  let obj2: any = [];
  let CheckedKeys: any = [];
  let arr: any = [];
  const [expandedKeys, setexpandedKeys] = useState([]);
  const [searchValue, setsearchValue] = useState('');
  const [autoExpandParent, setautoExpandParent] = useState(true);
  const [value, setValue] = useState(false);
  const listFn = (data: any) => {
    const arr2: any = [];
    data.forEach((item: any, index: number) => {
      if ((item.enable || value) || item.departmentName) {
        let arr3: any = [];
        if (item.children) {
          arr3 = listFn(item.children);
        }
        let str = '';
        let icon: any;
        let disabled;
        // if (item.enable !== false) {
        if (item.departmentName) {
          str = item.departmentName;
          icon = <ApartmentOutlined />;
          disabled = false;
        } else {
          str = item.name;
          icon = <UserOutlined />;
          disabled = false;
        }
        if (arr3.length > 0) {
          arr2.push({
            title: str,
            key: index,
            userId: item.userId,
            children: arr3,
            icon: icon,
            disabled: disabled,
            id: item.id,
          });
        } else {
          arr2.push({
            title: str,
            key: index,
            userId: item.userId,
            icon: icon,
            disabled: disabled,
            id: item.id,
          });
        }
      }

      // }

    });
    return arr2;
  };
  const listF: any[] = []
  CardContent.content.forEach((item: any) => {
    if (item.departmentName) {
      if (item.departmentName.indexOf('离职') == -1) {
        listF.push(item)
      }
    } else {
      listF.push(item)
    }

  })

  if (CardContent) arr = listFn(listF);

  //处理tree key值
  const arrKey = (data: any, index?: number) => {
    data.forEach((items: any, indexs: number) => {
      items.key = index + '-' + indexs;
      // if (items.title == departments.name) {
      //   CheckedKeys.push(items.key);
      // }
      if (items.children) {
        arrKey(items.children, items.key);
      }
    });
  };

  const departmentsKey = (data: any, id: any) => {
    data.forEach((items: any, indexs: number) => {
      if (['role', 'user', 'achievement', 'Groups', 'projectDepartment','sysuser'].includes(CardContent.type)) {
        if (items.userId == id) {
          CheckedKeys.push(items.key);
          obj2.push(items)
        }
      } else {
        if (items.id == id) {
          CheckedKeys.push(items.key);
        }
      }

      if (items.children) {
        departmentsKey(items.children, id);
      }
    });
  };
  if (arr.length > 0) {
    arrKey(arr, 0);
    //回显tree勾选

    departments &&
      departments.forEach((item: any) => {
        departmentsKey(arr, item.id);
      });

    departNameList &&
      departNameList.split(',').forEach((item: any) => {
        departmentsKey(arr, item);
      });
  }
  const getParentKey = (title: any, tree: any[]): [] => {
    const parentKey = []
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some((item: any) => item.title.indexOf(title) != -1)) {
          parentKey.push(node.key);
        } else if (getParentKey(title, node.children)) {
          parentKey.push(...getParentKey(title, node.children));
        }
      }
    }
    return parentKey as [];
  };
  const onExpand = (expandedKeys: any) => {
    setexpandedKeys(expandedKeys);
    setautoExpandParent(false);
  };

  const onChange = (e: any) => {
    const { value } = e.target;

    setexpandedKeys(getParentKey(value, arr));
    setsearchValue(value);
    setautoExpandParent(true);
  };

  const onChangeRadio = (e: any) => {
    const { value } = e.target;
    setValue(value)

  };

  const loop = (data: any) => data.map((item: any) => {
    const index = item.title.indexOf(searchValue);
    const beforeStr = item.title.substring(0, index);
    const afterStr = item.title.slice(index + searchValue.length);
    const title =
      index > -1 ? (
        <span>
          {beforeStr}
          <span className="site-tree-search-value">{searchValue}</span>
          {afterStr}
        </span>
      ) : (
        <span>{item.title}</span>
      );
    if (item.children) {
      return {
        title,
        key: item.key,
        disabled: item.disabled,
        icon: item.icon,
        children: loop(item.children),
        userId: item.userId,
      };
    }

    return {
      title,
      key: item.key,
      icon: item.icon,
      userId: item.userId,
      titles: item.title,
      disabled: item.disabled,
    };
  });

  useEffect(() => {
    if (!searchValue) {
      const expandedKeyArr: any = []
      function initExpandedKey(e: []) {
        e.forEach((i: any) => {
          if (i.children) {
            expandedKeyArr.push(i.key)
            initExpandedKey(i.children)
          }
        });
      }
      initExpandedKey(arr)
      setexpandedKeys(expandedKeyArr)
    }
  }, [searchValue])
  return (
    <>
      <Radio.Group onChange={onChangeRadio} value={value} defaultValue={value}>
        <Radio value={false}>不查看离职</Radio>
        <Radio value={true}>查看离职</Radio>
      </Radio.Group>
      {CardContent?.type == 'performance' ? (
        <>
          <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={(e) => onChange(e)} />
          <Tree
            showIcon
            checkable={checkable}
            defaultExpandAll
            onExpand={(e) => onExpand(e)}
            autoExpandParent={autoExpandParent}
            defaultCheckedKeys={CheckedKeys}
            onCheck={(checkedKeysValue, e) => {
              const arr = e.checkedNodes
              const idsList: any = []
              arr.forEach((item: any) => {
                if (item.userId) {
                  idsList.push(item.userId)
                }
              })
              setUserID(idsList)
              // obj2 = e.checkedNodes;
            }}
            onSelect={(selectedKeys, e: any) => {
              e.node.userId && setUserID(e.node.userId);
            }}
            treeData={loop(arr)}
          />
        </>
      ) : (
        <Modal
          title="选择人员"
          visible={CardVisible}
          destroyOnClose={true}
          onCancel={() => {
            CheckedKeys = [];
            setCardVisible(false);
          }}
          onOk={() => {
            const arr: any = [];
            const arrid: any = [];
            //去掉部门。
            obj2?.forEach((item: any) => {
              if (item.userId) {
                arr.push(item);
                arrid.push(item.userId);
              }
            });
            if (CardContent.type == 'projectDepartment') {
              request.post('/sms/system/sysDepartment', {
                id: parentIdTree,
                projects: arrid.join(',')
              }).then((res: any) => {
                if (res.status == 'success') {
                  message.success('授权成功');
                  CheckedKeys = [];
                  callbackRef();
                  setTimeout(() => {
                    setCardVisible(false);
                  }, 500);
                }
              });
              return

            }
            if (CardContent.type == 'project') {
              request
                .post2(
                  '/sms/business/bizUserJob/updateFromTree',
                  {
                    id: parentIdTree,
                  },
                  {
                    array: arrid,
                  },
                )
                .then((res: any) => {
                  if (res.status == 'success') {
                    message.success('授权成功');
                    CheckedKeys = [];
                    callbackRef();
                    setTimeout(() => {
                      setCardVisible(false);
                    }, 500);
                  }
                });
            }
            if (CardContent.type == 'user') {
              request
                .post2(
                  '/sms/system/sysUserUser/updateFromTree',
                  {
                    id: parentIdTree,
                  },
                  { array: arrid },
                )
                .then((res: any) => {
                  if (res.status == 'success') {
                    message.success('授权成功');
                    CheckedKeys = [];
                    callbackRef();
                    setTimeout(() => {
                      setCardVisible(false);
                    }, 500);
                  }
                });
            }
            //order为订单收费人，只能选择一位
            if (CardContent.type == 'order') {

              if (arr.length > 1) {
                message.error('只能选择一位');
                return;
              } else if (arr.length == 0) {
                message.error('请选择收费人，收费人不能为部门');
              } else {
                setDepartment({ name: arr[0].titles, id: arr[0].userId });
                CheckedKeys = [];
                setCardVisible(false);
              }
            }
            if (CardContent.type == 'role') {
              request
                .post2(
                  '/sms/system/sysUserRole/updateFromTree',
                  {
                    id: parentIdTree,
                  },
                  {
                    array: arrid,
                  },
                )
                .then((res: any) => {
                  if (res.status == 'success') {
                    message.success('授权成功');
                    CheckedKeys = [];
                    callbackRef();
                    setTimeout(() => {
                      setCardVisible(false);
                    }, 500);
                  }
                });
            }
            if (CardContent.type == 'achievement') {
              const dataArr: any = arrid.map((item: any) => ({ id: item, newOrderType: CardContent.typeNum }));

              const ids: any = departments.map((item: any) => item.id);

              ids.forEach((item: any) => {
                if (!arrid.includes(item)) {
                  dataArr.push({ id: item, newOrderType: 0 });
                }
              });
              request.postAll('/sms/system/sysUser/saveArray', { array: dataArr }).then((res: any) => {
                if (res.status == 'success') {
                  message.success('授权成功');
                  CheckedKeys = [];
                  getUserList();
                  setTimeout(() => {
                    setCardVisible(false);
                  }, 500);
                }
              });
            }
            if (CardContent.type == 'Groups') {
              const dataArr: any = arrid.map((item: any) => ({ id: item, groupId: CardContent.groups }));
              const ids: any = departments.map((item: any) => item.id);
              ids.forEach((item: any) => {
                if (!arrid.includes(item)) {
                  dataArr.push({ id: item, groupId: -1 });
                }
              });
              request.postAll('/sms/system/sysUser/saveArray', { array: dataArr }).then((res: any) => {
                if (res.status == 'success') {
                  message.success('授权成功');
                  CheckedKeys = [];
                  callbackRef()
                  setTimeout(() => {
                    setCardVisible(false);
                  }, 500);
                }
              });
            }
            if (CardContent.type == 'sysuser') {
              request.postAll(
                `/sms/system/sysUserLevel/correlationUser/${parentIdTree}`,
                arrid,
              )
                .then((res: any) => {
                  if (res.status == 'success') {
                    message.success('授权成功');
                    CheckedKeys = [];
                    callbackRef();
                    setTimeout(() => {
                      setCardVisible(false);
                    }, 500);
                  }
                });
            }
          }}
        >
          <>
            <Search
              style={{ marginBottom: 8 }}
              placeholder="Search"
              onChange={(e) => onChange(e)}
            />
            <Tree
              showIcon
              checkable={CardContent?.type != 'pay'}
              defaultExpandAll
              onExpand={(e) => onExpand(e)}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              defaultCheckedKeys={CheckedKeys}
              onCheck={(checkedKeysValue, e) => {
                obj2 = e.checkedNodes;
              }}
              onSelect={(selectedKeys, e: any) => {
                obj = { name: e.node.title, id: e.node.userId };
                if (CardContent.type == 'pay' && e.node.userId) {
                  setchargePerson({ name: e.node.titles, id: e.node.userId });
                  setCardVisible(false);
                }
              }}
              treeData={loop(arr)}
            />
          </>
        </Modal>
      )}
    </>
  );
};
