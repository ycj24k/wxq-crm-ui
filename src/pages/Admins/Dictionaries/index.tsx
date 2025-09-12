import React, { useEffect, useRef, useState } from 'react';
import { PlusOutlined, RedoOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Button, message, Popconfirm, Input, Divider, Tree, Switch } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
import request from '@/services/ant-design-pro/apiRequest';
import ProCard from '@ant-design/pro-card';
import Modals from './Modal';
import dictionaries from '@/services/util/dictionaries';
import Upload from './upload';
const { Search } = Input;
type GithubIssueItem = {
  name: string;
  id: number;
  parentId: number;
  description: string;
  enable: boolean;
  isDel?: number;
  code: string;
  children?: [];
  value: string;
};

export default () => {
  const actionRef = useRef<ActionType>();
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [renderData, setRenderData] = useState<object>({});
  const [loadingBtn, setLoadingBtn] = useState<boolean>(false);
  const [parentIdTree, setParentIdTree] = useState<string | number>('-1');
  const [parentIdFalg, setParentIdFalg] = useState<boolean>(false);
  const [UploadFalg, setUploadVisible] = useState<boolean>(false);
  const [switchLoding, setSwitchLoding] = useState<boolean>(false);
  const [treeData, setTreeData] = useState();
  const [titleName, setTitleName] = useState<any>();
  const [searchValue, setSearchValue] = useState<any>('');
  const [dataArr, setDataArr] = useState<any>([]);
  const [selectedRowsList, setselectedRowsList] = useState<any>([]);

  const callbackRef = () => {
    setTimeout(() => {
      // @ts-ignore
      actionRef.current.reloadAndRest();
      contentTree();
    }, 100);
  };
  const deleteContent = async (id: number | string) => {
    const msg: any = await request.delete('/sms/system/sysDict', { id: id });
    if (msg.status == 'success') {
      message.success('删除成功');
      callbackRef();
    } else {
      message.error(msg.msg);
    }
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '字典名称',
      dataIndex: 'name',
      render: (text, record) => (
        <a
          onClick={() => {
            dataArr.push(record.id);
            setParentIdTree(dataArr[dataArr.length - 1]);
            callbackRef();
          }}
        >
          {record.name}
        </a>
      ),
    },
    {
      title: '代码',
      dataIndex: 'code',
      copyable: true,
      // search: false,
    },
    {
      title: '值',
      dataIndex: 'value',
      width: 300,
      ellipsis: true,
      // search: false,
      tip: '标题过长会自动收缩',
    },
    {
      title: '父级',
      dataIndex: 'parentId',
      search: false,
      render: (text, record) => (
        <>{record.parentId && <span>{dictionaries.getIdName(record.parentId)}</span>}</>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      search: false,
    },
    {
      title: '描述',
      dataIndex: 'description',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'enable',
      valueEnum: {
        true: '启用',
        false: '禁用'
      },
      // search: false,
      render: (text, record) => (
        <Switch
          key={record.id}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          defaultChecked={record.enable}
          loading={switchLoding}
          onChange={async () => {
            setSwitchLoding(true);
            const status: any = await request.post('/sms/system/sysDict', {
              id: record.id,
              enable: !record.enable,
            });
            if (status.status != 'success') {
              message.error(status.msg);
            }
            setSwitchLoding(false);
            callbackRef();
          }}
        />
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 300,
      fixed: 'right',
      render: (text, record, _, action) => (
        <span>
          <a
            onClick={(e) => {
              e.stopPropagation();
              setRenderData({ type: 'eidt', ...record });
              setModalVisible(true);
            }}
          >
            编辑
          </a>

          <Divider type="vertical" />
          <a
            onClick={(e) => {
              e.stopPropagation();
              setRenderData(record);
              setUploadVisible(true);
            }}
          >
            批量添加子类
          </a>
          <Divider type="vertical" />
          <a
            onClick={(e) => {
              e.stopPropagation();
              setRenderData({ type: 'addChild', ...record });
              setModalVisible(true);
            }}
          >
            添加子类
          </a>

          <Divider type="vertical" />
          <Popconfirm
            title="是否生产value？"
            onConfirm={(e) => {
              // deleteContent(record.id);
              if (record.value) return;
              request
                .post('/sms/system/sysDict/randomGenerateValue', { id: record.id })
                .then((res: any) => {
                  if (res.status == 'success') {
                    message.success('生成成功');
                    callbackRef();
                  }
                });
            }}
            okText="确定"
            cancelText="取消"
          >
            <a
              href="#"
              onClick={(e) => {
                e.stopPropagation();
                if (record.value) return;
              }}
              style={{ color: record.value ? '#ccc' : '' }}
            >
              生成value
            </a>
          </Popconfirm>
          <Divider type="vertical" />
          <Popconfirm
            title="是否确定删除？"
            onConfirm={(e) => {
              deleteContent(record.id);
            }}
            okText="删除"
            cancelText="取消"
          >
            <a
              href="#"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              删除
            </a>
          </Popconfirm>
        </span>
      ),
    },
  ];
  useEffect(() => {
    contentTree();
  }, []);
  const contentTree = async () => {
    const contentList: any = await request.get('/sms/system/sysDict', {
      parentId: '-1',
      _isGetAll: true,
    });
    const arr: any = [];
    contentList.data.content.forEach((item: any) => {
      arr.push({ title: item.name, key: item.id });
    });
    setTreeData(arr);
  };
  function updateTreeData(list: any, key: React.Key, children: any): any {
    return list.map((node: any) => {
      if (node.key === key) {
        return {
          ...node,
          children,
        };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }
      return node;
    });
  }
  const onLoadData = ({ key, children }: any) =>
    new Promise<void>((resolve) => {
      if (children) {
        resolve();
        return;
      }
      if (!key) {
        resolve();
        return;
      }
      const arr = key.toString().split('-');
      const id = arr[arr.length - 1];
      request.get('/sms/system/sysDict', { parentId: id }).then((res: any) => {
        if (res.data.content.length > 0) {
          const arr: any = [];
          res.data.content.forEach((item: any) => {
            arr.push({ title: item.name, key: `${key}-${item.id}` });
          });

          setTreeData((origin) => updateTreeData(origin, key, arr));
          resolve();
        } else {
          setTreeData((origin) =>
            updateTreeData(origin, key, [{ title: '空', key: `${key}-0`, isLeaf: true }]),
          );
          resolve();
        }
      });
    });
  const onchange = (e: any) => {
    const { value } = e.target;
    setSearchValue(value);
  };
  const loop = (data: any = []) => {
    const arr: any = [];
    data.forEach((item: any) => {
      const index = item.title.indexOf(searchValue);

      if (index > -1) {
        arr.push(item);
      }
    });
    return arr;
  };
  return (
    <PageContainer>
      <ProCard split="vertical">
        <ProCard title="字典" colSpan="25%">
          <Search style={{ marginBottom: 30 }} placeholder="Search" onChange={(e) => onchange(e)} />
          <Tree
            loadData={onLoadData}
            treeData={loop(treeData)}
            // showLine
            height={600}
            onSelect={(selectedKeys, e) => {
              if (!selectedKeys[0]) return;
              const arr = selectedKeys[0].toString().split('-');
              const id = arr[arr.length - 1];
              setParentIdTree(id);
              setParentIdFalg(false);
              setTitleName(e.node.title);
              callbackRef();
            }}
          />
        </ProCard>
        <ProCard headerBordered>
          <ProTable<GithubIssueItem>
            columns={columns}
            actionRef={actionRef}
            cardBordered
            rowSelection={{
              onChange: (e, selectedRows) => {
                setselectedRowsList(e);
              },
            }}
            tableAlertOptionRender={() => {
              return (
                <a
                  style={{ color: 'red' }}
                  onClick={() => {
                    request
                      .delete('/sms/system/sysDict/deleteArray', {
                        ids: selectedRowsList.join(','),
                      })
                      .then((res) => {
                        if (res.status == 'success') {
                          message.success('操作成功!');
                          callbackRef();
                        }
                      });
                  }}
                >
                  批量删除
                </a>
              );
            }}
            request={async (
              params: { current?: any; name?: string; code?: string } = {},
              sort,
              filter,
            ) => {
              let options: any = {};
              if (parentIdFalg) {
                options = params;
                if (parentIdTree != '-1') options.parentId = parentIdTree;
              } else {
                delete params.code;
                delete params.name;
                options = {
                  parentId: parentIdTree,
                  ...params,
                };
              }

              const datalist: any = await request.get('/sms/system/sysDict', options);

              // datalist.data.content.forEach((item: any) => {
              //   item.children = [];
              // });
              return {
                data: datalist.data.content,
                success: datalist.success,
                total: datalist.data.totalElements,
              };
            }}
            onSubmit={() => {
              setParentIdFalg(true);
            }}
            onReset={() => {
              setParentIdFalg(false);
              setParentIdTree('-1');
              callbackRef();
            }}
            // dataSource={contentList.data}
            rowKey="id"
            search={{
              labelWidth: 'auto',
            }}
            pagination={{
              pageSize: 10,
            }}
            dateFormatter="string"
            headerTitle="数据字典"
            toolBarRender={() => [
              <Button
                key="button"
                type="primary"
                style={{ display: dataArr.length > 0 ? '' : 'none' }}
                icon={<ArrowLeftOutlined />}
                onClick={async () => {
                  dataArr.splice(dataArr.length - 1);
                  console.log('dataArr', dataArr);

                  setParentIdTree(dataArr.length == 0 ? '-1' : dataArr[dataArr.length - 1]);
                  callbackRef();
                }}
              >
                返回上层
              </Button>,
              <Button
                key="button"
                type="primary"
                icon={<RedoOutlined />}
                onClick={async () => {
                  setLoadingBtn(true);
                  const msg: any = await request.post('/sms/system/sysDict/reload');
                  if (msg.status == 'success') {
                    message.success('操作成功');
                    setLoadingBtn(false);
                  } else {
                    message.error(msg.msg);
                  }
                }}
                loading={loadingBtn}
              >
                重载字典
              </Button>,
              <Button
                key="button"
                type="primary"
                icon={<RedoOutlined />}
                onClick={async () => {
                  setLoadingBtn(true);
                  setTimeout(() => {
                    dictionaries.get();
                    setLoadingBtn(false);
                    message.success('操作成功');
                  }, 1000);
                }}
                loading={loadingBtn}
              >
                刷新本地字典
              </Button>,
              <Button
                key="button"
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => {
                  setRenderData({ type: 'addChildern', parentId2: parentIdTree, title: titleName });
                  setModalVisible(true);
                }}
              >
                新建子类
              </Button>,
              <Button
                key="button"
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => {
                  setRenderData({ type: 'add' });
                  setModalVisible(true);
                }}
              >
                新建字典
              </Button>,
              <Button
                key="button"
                type="primary"
                onClick={() => {
                  setUploadVisible(true)
                }}
              >
                批量修改
              </Button>,
            ]}
          />
        </ProCard>
      </ProCard>

      <Modals
        modalVisible={modalVisibleFalg}
        setModalVisible={() => setModalVisible(false)}
        callbackRef={() => callbackRef()}
        renderData={renderData}
      />
      {UploadFalg && (
        <Upload
          setModalVisible={() => setUploadVisible(false)}
          modalVisible={UploadFalg}
          url={'/sms/system/sysDict/saveArray'}
          type="student"
          propsData={renderData}
          callbackFn={() => callbackRef()}
        />
      )}
    </PageContainer>
  );
};
