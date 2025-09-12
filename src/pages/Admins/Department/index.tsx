import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PlusOutlined, RedoOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Button, message, Popconfirm, Input, Divider, Tree } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable, { TableDropdown } from '@ant-design/pro-table';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import ProCard from '@ant-design/pro-card';
import Modals from './Modal';
import DepartmentCards from './DepartmentCards';
import Groups from './Groups';
import UserManageCard from './UserManageCard';
type GithubIssueItem = {
  name: string;
  id: number;
  description: string;
  isDel?: number;
  code: string;
  projects: string;
  children?: [];
};
export default () => {
  const actionRef = useRef<ActionType>();
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [renderData, setRenderData] = useState<object>({});
  const [parentIdTree, setParentIdTree] = useState<any>();
  const [parentIdTrees, setParentIdTrees] = useState<any>();
  const [parentIdFalg, setParentIdFalg] = useState<boolean>(false);
  const [dataArr, setDataArr] = useState<any>([]);
  const [ActiveKey, setActiveKey] = useState<any>('tab1');
  const [TabListNuber, setTabListNuber] = useState<any>('1');
  const [departNameList, setDepartNameList] = useState<any>([])
  const [CardContent, setCardContent] = useState<any>();
  const [CardVisible, setCardVisible] = useState<boolean>(false);


  useEffect(() => {
    DepartmentAndUser();

  }, []);
  const DepartmentAndUser = async () => {
    let list = JSON.parse(localStorage.getItem('Department') as string);
    if (!list) {
      list = (await request.get('/sms/share/getDepartmentAndUser')).data;
      localStorage.setItem('Department', JSON.stringify(list));
    }
  };
  const callbackRef = () => {
    setTimeout(() => {
      // @ts-ignore
      actionRef?.current?.reload();
      // contentTree();
    }, 100);
  };
  const deleteContent = async (id: number | string) => {
    const msg: any = await request.delete('/sms/system/sysDepartment', { id: id });
    if (msg.status == 'success') {
      message.success('删除成功');
      callbackRef();
    } else {
      message.error(msg.msg);
    }
  };
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '部门名称',
      dataIndex: 'name',
      render: (text, record) => (
        <a
          onClick={() => {
            dataArr.push({ id: record.id, name: record.name });
            setParentIdTree({ id: record.id, name: record.name });
            callbackRef();
          }}
        >
          {record.name}
        </a>
      ),
    },
    {
      title: '授权项目',
      dataIndex: 'projects',
      search: false,
      render: (text, record) => (
        <span>
          {
            record.projects ? record.projects.split(',').map((item) => {
              return (
                <span>
                  {Dictionaries.getCascaderName('dict_reg_job', item)},
                </span>
              )
            }) : ''
          }
        </span>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      render: (text, record, _, action) => (
        <span>
          <a
            onClick={() => {
              setRenderData({ type: 'eidt', ...record });
              setModalVisible(true);
            }}
          >
            编辑
          </a>

          <Divider type="vertical" />
          <a
            onClick={async () => {
              const arr = Dictionaries.getTree('dict_reg_job');
              setCardContent({ content: arr, type: 'projectDepartment' });
              setParentIdTrees(record.id);
              setDepartNameList(record.projects)
              setCardVisible(true);
            }}
          >
            关联项目
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              setRenderData({ type: 'addChild', ...record });
              setModalVisible(true);
            }}
          >
            添加下属部门
          </a>

          <Divider type="vertical" />
          <Popconfirm
            title="是否确定删除？"
            onConfirm={() => {
              deleteContent(record.id);
            }}
            okText="删除"
            cancelText="取消"
          >
            <a href="#">删除</a>
          </Popconfirm>
        </span>
      ),
    },
  ];
  const columns1: ProColumns<GithubIssueItem>[] = [
    {
      title: '部门名称',
      dataIndex: 'name',
      render: (text, record) => (
        <a
          onClick={() => {
            dataArr.push({ id: record.id, name: record.name });
            setParentIdTree({ id: record.id, name: record.name });
            callbackRef();
          }}
        >
          {record.name}
        </a>
      ),
    },
    {
      title: '个人回访超时天数',
      dataIndex: 'personVisitTimeout',
      search: false,
    },
    {
      title: '个人成交超时天数',
      dataIndex: 'personDealTimeout',
      search: false,
    },
    {
      title: '个人未领取超时天数',
      dataIndex: 'personReceiveTimeout',
      search: false,
    },
    {
      title: '团组回访超时天数',
      dataIndex: 'groupVisitTimeout',
      search: false,
    },
    {
      title: '团组成交超时天数',
      dataIndex: 'groupDealTimeout',
      search: false,
    },
    {
      title: '团组未领取超时天数',
      dataIndex: 'groupReceiveTimeout',
      search: false,
    },
    {
      title: '正式个人回访超时天数',
      dataIndex: 'formalPersonVisitTimeout',
      search: false,
    },
    {
      title: '正式个人成交超时天数',
      dataIndex: 'formalPersonDealTimeout',
      search: false,
    },
    {
      title: '正式个人未领取超时天数',
      dataIndex: 'formalPersonReceiveTimeout',
      search: false,
    },
    {
      title: '正式团组回访超时天数',
      dataIndex: 'formalGroupVisitTimeout',
      search: false,
    },
    {
      title: '正式团组成交超时天数',
      dataIndex: 'formalGroupDealTimeout',
      search: false,
    },
    {
      title: '正式团组未领取超时天数',
      dataIndex: 'formalGroupReceiveTimeout',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      render: (text, record, _, action) => (
        <span>
          <a
            onClick={() => {
              setRenderData({ type: 'eidt', ...record });
              setModalVisible(true);
            }}
          >
            编辑
          </a>
        </span>
      ),
    },
  ];
  return (
    <PageContainer
      onTabChange={(e) => {
        setTabListNuber(e);
        callbackRef();
      }}
      tabList={[
        {
          tab: '部门管理',
          key: '1',
        },
        {
          tab: '小组管理',
          key: '2',
        },
      ]}
    >
      {TabListNuber == 1 ? (
        <>
          <ProCard split="vertical" style={{ minHeight: 800 }}>
            <DepartmentCards
              setParentIdTree={(e: any) => {
                setParentIdTree(e);
              }}
              setParentIdFalg={() => {
                setParentIdFalg(false);
              }}
              callbackRef={() => {
                callbackRef();
              }}
            />

            <ProCard headerBordered>
              <ProTable<GithubIssueItem>
                columns={ActiveKey == 'tab1' ? columns : columns1}
                actionRef={actionRef}
                cardBordered
                request={async (
                  params: { current?: any; name?: string; code?: string } = {},
                  sort,
                  filter,
                ) => {
                  let options: any = {};
                  if (parentIdFalg) {
                    options = params;
                  } else {
                    if (parentIdTree) {
                      options = {
                        parentId: parentIdTree.id,
                        ...params,
                      };
                    } else {
                      options = {
                        ...params,
                        parentId: '-1',
                      };
                    }
                  }

                  const datalist: any = await request.get('/sms/system/sysDepartment', options);

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
                  setParentIdTree(false);
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
                toolbar={{
                  menu: {
                    type: 'tab',
                    // activeKey: activeKey,
                    items: [
                      {
                        key: 'tab1',
                        label: <span>部门管理</span>,
                      },
                      {
                        key: 'tab2',
                        label: <span>流转配置</span>,
                      },
                    ],
                    onChange: (key) => {
                      setActiveKey(key as string);
                    },
                  },
                }}
                dateFormatter="string"
                // headerTitle="部门管理"
                toolBarRender={() => [
                  <Button
                    key="button"
                    type="primary"
                    style={{ display: dataArr.length > 0 ? '' : 'none' }}
                    icon={<ArrowLeftOutlined />}
                    onClick={async () => {
                      dataArr.splice(dataArr.length - 1);
                      console.log('dataArr', dataArr);

                      setParentIdTree(dataArr[dataArr.length - 1]);
                      callbackRef();
                    }}
                  >
                    返回上层
                  </Button>,
                  <Button
                    key="button"
                    style={{ display: parentIdTree ? 'block' : 'none' }}
                    icon={<PlusOutlined />}
                    type="primary"
                    onClick={() => {
                      if (!parentIdTree) {
                        message.error('请先选着部门在添加下属部门');
                        return;
                      }
                      setRenderData({ type: 'addChild', ...parentIdTree });
                      setModalVisible(true);
                    }}
                  >
                    添加下属部门
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
                    新建顶级部门
                  </Button>,
                ]}
              />
            </ProCard>
          </ProCard>
        </>
      ) : (
        <>
          <Groups />
        </>
      )}

      <Modals
        modalVisible={modalVisibleFalg}
        setModalVisible={() => setModalVisible(false)}
        callbackRef={() => callbackRef()}
        renderData={renderData}
      />
      {CardVisible && (
        <UserManageCard
          CardVisible={CardVisible}
          CardContent={CardContent}
          callbackRef={() => callbackRef()}
          setCardVisible={() => setCardVisible(false)}
          departNameList={departNameList}
          // setDepartment={(e: any) => setDepartment(e)}
          parentIdTree={parentIdTrees}
        />
      )}
    </PageContainer>
  );
};
