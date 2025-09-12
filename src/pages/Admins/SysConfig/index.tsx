import { useEffect, useRef, useState } from 'react';
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  RedoOutlined,
  StopOutlined,
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { Button, message, Tag, Input, Popconfirm, Switch, Spin, Select } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import Modals from './Modal';
import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import ProCard from '@ant-design/pro-card';
import { getCompanyRequest } from '@/services/util/util';
import dictionaries from '@/services/util/dictionaries';
type GithubIssueItem = {
  value: any;
  id: number;
  enable: boolean;
  isError: boolean;
  isPass: boolean;
  method: string;
};

export default () => {
  const [switchLoding, setSwitchLoding] = useState<boolean>(false);
  const [contentList, setContentList] = useState<any>([]);
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [Falg, setFalg] = useState<boolean>(false);
  const [IndexNum, setIndexNum] = useState<any>([]);
  const [InputValue, setInputValue] = useState<any>([]);
  const [renderData, setRenderData] = useState<object>({});
  const [falgs, setFalgs] = useState<any>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const callbackRef = () => {
    contentFn();
  };
  const Code = [
    'groupDealEnable',
    'personDealEnable',
    'groupVisitEnable',
    'personVisitEnable',
    'personReceiveEnable',
    'groupReceiveEnable',
    'formalPersonDealEnable',
    'formalPersonReceiveEnable',
    'formalPersonVisitEnable',
    'formalGroupReceiveEnable',
    'formalGroupDealEnable',
    'formalGroupVisitEnable',
  ];
  const contentFn = () => {
    setSwitchLoding(true);
    setContentList([]);
    request.get('/sms/system/sysConfig', { _isGetAll: true }).then((res) => {
      res.data?.content.sort((a: any, b: any) => {
        return b.type - a.type;
      });
      const a = res.data.content;
      let aa: any = [];
      aa = Object.values(
        res.data.content.reduce(
          (res: Record<string, any[]>, item: { configGroup: string | number }) => {
            res[item.configGroup]
              ? res[item.configGroup].push(item)
              : (res[item.configGroup] = [item]);
            return res;
          },
          {},
        ),
      );
      const b = JSON.parse(JSON.stringify(aa));
      console.log('bb', b);

      setContentList(b);
      setSwitchLoding(false);
    });
  };

  useEffect(() => {
    contentFn();
  }, []);
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '代码',
      dataIndex: 'code',
      // copyable: true,
      ellipsis: true,
    },
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (text, record: any) => <>{Dictionaries.getName('sysConfig', record.type)}</>,
    },
    {
      title: '值',
      dataIndex: 'value',
      search: false,
      render: (text, record: any) => (
        <>
          {record.type == '1' ? (
            <span>{record.value}</span>
          ) : (
            <Switch
              checkedChildren="开启"
              unCheckedChildren="关闭"
              loading={switchLoding}
              defaultChecked={record.value}
              onChange={(e) => {
                setSwitchLoding(true);
                const content = JSON.parse(JSON.stringify(record));
                content.value = record.value;
                delete content.isDel;
                request.post('/sms/system/sysConfig', content).then((res) => {
                  if (res.status == 'success') {
                    message.success('操作成功');
                    setSwitchLoding(false);
                  }
                });
              }}
            />
          )}
        </>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      tip: '描述过长会自动收缩',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      render: (text, record, _, action) => (
        <>
          <Button
            key="view"
            type="primary"
            size="small"
            icon={<EditOutlined />}
            style={{ marginRight: '10px', marginBottom: '8px' }}
            onClick={() => {
              setModalVisible(true);
              setRenderData({ types: 'eidt', ...record });
            }}
          >
            编辑
          </Button>
          <Popconfirm
            key={record.id}
            title="是否确定删除？"
            onConfirm={() => {
              request.delete('/sms/system/sysConfig', { id: record.id }).then((res: any) => {
                if (res.status == 'success') {
                  message.success('删除成功');
                  callbackRef();
                }
              });
            }}
            okText="删除"
            cancelText="取消"
          >
            <Button type="primary" key="delete" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];
  return (
    <PageContainer>
      <Spin spinning={switchLoding}>
        {/* <ProTable<GithubIssueItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (
          params: {
            current?: any;
            page?: number;
          } = {},
          sort,
          filter,
        ) => {
          const dataList: any = await request.get('/sms/system/sysConfig', params);
          return {
            data: dataList.data.content,
            success: dataList.success,
            total: dataList.data.totalElements,
          };
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          collapsed: false,
        }}
        pagination={{
          pageSize: 10,
        }}
        dateFormatter="string"
        headerTitle="系统设置"
        toolBarRender={() => [
          <Button
            type="primary"
            icon={<RedoOutlined />}
            onClick={() => {
              request.post('/sms/system/sysConfig/reload').then((res: any) => {
                if (res.status == 'success') {
                  message.success('操作成功');
                }
              });
            }}
          >
            重载系统设置
          </Button>,
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setRenderData({ type: 'add' });
              setModalVisible(true);
            }}
          >
            新建
          </Button>,
        ]}
      /> */}
        <ProCard
          title={<h3>系统设置</h3>}
          hoverable
          style={{ minHeight: '900px' }}
          extra={
            <>
              <Button
                type="primary"
                icon={<RedoOutlined />}
                onClick={() => {
                  request.post('/sms/system/sysConfig/reload').then((res: any) => {
                    if (res.status == 'success') {
                      message.success('操作成功');
                    }
                  });
                }}
              >
                重载系统设置
              </Button>
              <Button
                type="primary"
                style={{ marginLeft: '20px' }}
                icon={<RedoOutlined />}
                onClick={() => {
                  contentFn();
                }}
              >
                刷新
              </Button>
              <Button
                type="primary"
                ghost
                icon={Falg ? <StopOutlined /> : <EditOutlined />}
                style={{ margin: '0 20px' }}
                onClick={() => {
                  setFalg(!Falg);
                }}
              >
                {Falg ? '取消' : '编辑'}
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setRenderData({ type: 'add' });
                  setModalVisible(true);
                }}
              >
                新建
              </Button>
            </>
          }
        >
          <div className="contents">
            {contentList &&
              contentList.map((items: any, indexs: number) => {
                return (
                  <div
                    key={indexs}
                    className={'contents' + indexs}
                    style={{
                      overflow: 'hidden',
                      transition: 'height 0.5s ',
                      height: `${items.length * 75 + 30}px`,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 'bold',
                        marginBottom: '10px',
                        fontSize: '16px',
                        height: '30px',
                        lineHeight: '30px',
                        background: '#eee',
                      }}
                      onClick={() => {
                        const dom: any = document.getElementsByClassName('contents' + indexs);
                        const icons: any = document.getElementsByClassName('icons' + indexs);
                        const a = JSON.parse(JSON.stringify(falgs));
                        a[indexs] = !a[indexs];
                        if (dom[0].style.height == '30px') {
                          dom[0].style.height = `${items.length * 75 + 30}px`;
                          icons[0].style.transform = 'rotate(0deg)';
                        } else {
                          dom[0].style.height = '30px';
                          icons[0].style.transform = 'rotate(180deg)';
                        }
                        setFalgs(a);
                      }}
                    >
                      {Dictionaries.getName('configGroup', items[0].configGroup)}
                      {/* {falgs[indexs] ? <UpOutlined /> : <DownOutlined />} */}
                      <div
                        style={{
                          display: 'inline-block',
                          transform: 'rotate(0deg)',
                          transition: 'all 0.5s',
                        }}
                        className={'icons' + indexs}
                      >
                        <DownOutlined />
                      </div>
                    </div>
                    {items.map((item: any, index: number) => {
                      return (
                        <div
                          style={{ display: 'flex', marginBottom: '30px', alignItems: 'center' }}
                          key={`sys-config-${index}`}
                        >
                          <div className="lables" style={{ width: '300px', color: 'black' }}>
                            <div>{item.name}</div>
                            <div>({item.code})</div>
                          </div>
                          <div className="content" style={{ width: '170px', marginRight: '30px' }}>
                            {item.type == 1 && (
                              <Input
                                onChange={(e) => {
                                  const arr = JSON.parse(JSON.stringify(IndexNum));
                                  const values = JSON.parse(JSON.stringify(InputValue));
                                  values[index] = e.target.value;
                                  if (arr.indexOf(index) >= 0) {
                                  } else {
                                    arr.push(indexs + '-' + index);
                                    setIndexNum(arr);
                                  }
                                  setInputValue(values);
                                }}
                                defaultValue={item.value}
                               />
                            )}
                            {item.type == 2 && (
                              <Switch
                                checkedChildren="开启"
                                unCheckedChildren="关闭"
                                loading={switchLoding}
                                defaultChecked={item.value === 'true'}
                                onChange={(e) => {
                                  setSwitchLoding(true);
                                  const content = JSON.parse(JSON.stringify(item));
                                  content.value = e;
                                  delete content.isDel;
                                  request.post('/sms/system/sysConfig', content).then((res) => {
                                    if (res.status == 'success') {
                                      message.success('操作成功');
                                      setSwitchLoding(false);
                                    }
                                  });
                                }}
                              />
                            )}
                            {item.type == 3 && (
                              <Select
                                style={{ width: '170px' }}
                                options={dictionaries.getList('bankType')}
                                defaultValue={item.value}
                                onChange={(e) => {
                                  const arr = JSON.parse(JSON.stringify(IndexNum));
                                  const values = JSON.parse(JSON.stringify(InputValue));
                                  values[index] = e;
                                  if (arr.indexOf(index) >= 0) {
                                  } else {
                                    arr.push(indexs + '-' + index);
                                    setIndexNum(arr);
                                  }
                                  setInputValue(values);
                                }}
                              />
                            )}
                          </div>

                          <div className="description" style={{ color: '#7e7e7e' }}>
                            ({item.description})
                          </div>
                          {Code.indexOf(item.code) >= 0 ? (
                            <Popconfirm
                              key={`sys-config-flow-${index}`}
                              title="立即流转？"
                              onConfirm={() => {
                                let a = '';
                                switch (item.code) {
                                  case 'groupDealEnable':
                                    a = 'groupDealCirculation';
                                    break;
                                  case 'personDealEnable':
                                    a = 'personDealCirculation';
                                    break;
                                  case 'groupVisitEnable':
                                    a = 'groupVisitCirculation';
                                    break;
                                  case 'personVisitEnable':
                                    a = 'personVisitCirculation';
                                    break;
                                  case 'groupReceiveEnable':
                                    a = 'groupReceiveCirculation';
                                    break;
                                  case 'personReceiveEnable':
                                    a = 'personReceiveCirculation';
                                    break;
                                  case 'formalPersonDealEnable':
                                    a = 'formalPersonDealCirculation';
                                    break;
                                  case 'formalPersonReceiveEnable':
                                    a = 'formalPersonReceiveCirculation';
                                    break;
                                  case 'formalPersonVisitEnable':
                                    a = 'formalPersonVisitCirculation';
                                    break;
                                  case 'formalGroupReceiveEnable':
                                    a = 'formalGroupReceiveCirculation';
                                    break;
                                  case 'formalGroupDealEnable':
                                    a = 'formalGroupDealCirculation';
                                    break;
                                  case 'formalGroupVisitEnable':
                                    a = 'formalGroupVisitCirculation';
                                    break;
                                }
                                request.post('/sms/system/sysConfig/' + a).then((res) => {
                                  if (res.status == 'success') {
                                    message.success('操作成功');
                                  }
                                });
                              }}
                              okText="流转"
                              cancelText="取消"
                            >
                              <Button type="primary" style={{ margin: '0 20px' }}>
                                立即流转
                              </Button>
                            </Popconfirm>
                          ) : (
                            ''
                          )}
                          <div
                            style={{ margin: '0 20px' }}
                            hidden={IndexNum.indexOf(indexs + '-' + index) == -1}
                          >
                            <a
                              onClick={() => {
                                const content = JSON.parse(JSON.stringify(item));
                                content.value = InputValue[index];
                                delete content.isDel;
                                request.post('/sms/system/sysConfig', content).then((res) => {
                                  if (res.status == 'success') {
                                    message.success('操作成功');
                                  }
                                });
                              }}
                            >
                              修改
                            </a>
                            <a
                              style={{ color: 'red', paddingLeft: '20px' }}
                              onClick={() => {
                                const arr = JSON.parse(JSON.stringify(IndexNum));
                                arr.splice(arr.indexOf(indexs + '-' + index), 1);
                                setIndexNum(arr);
                              }}
                            >
                              取消
                            </a>
                          </div>
                          <div style={{ marginLeft: '30px' }} hidden={!Falg}>
                            <a
                              onClick={() => {
                                setModalVisible(true);
                                setRenderData({ types: 'eidt', ...item });
                              }}
                            >
                              编辑
                            </a>
                            <Popconfirm
                              key={`sys-config-delete-${index}`}
                              title="是否确定删除？"
                              onConfirm={() => {
                                request
                                  .delete('/sms/system/sysConfig', { id: item.id })
                                  .then((res: any) => {
                                    if (res.status == 'success') {
                                      message.success('删除成功');
                                      callbackRef();
                                    }
                                  });
                              }}
                              okText="删除"
                              cancelText="取消"
                            >
                              <a style={{ color: 'red', paddingLeft: '20px' }}>删除</a>
                            </Popconfirm>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
          </div>
        </ProCard>
        <Modals
          modalVisible={modalVisibleFalg}
          setModalVisible={() => setModalVisible(false)}
          callbackRef={() => callbackRef()}
          renderData={renderData}
        />
      </Spin>
    </PageContainer>
  );
};
