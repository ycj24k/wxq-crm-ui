import React, { useEffect, useRef, useState } from 'react';
import { DownOutlined, PlusOutlined, SmileOutlined } from '@ant-design/icons';
import {
  Button,
  Tag,
  Popconfirm,
  message,
  Table,
  Tooltip,
  Switch,
  Space,
  Badge,
  Dropdown,
  MenuProps,
  Menu,
  Checkbox,
  Row,
  Col,
} from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import request from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';
import Dictionaries from '@/services/util/dictionaries';
import Tables from '@/components/Tables';
import Department from './department';
import TextContent from './TextContent';
import filter from '@/services/util/filter';
import type { CheckboxChangeEvent } from 'antd/lib/checkbox';
import Preview from '@/services/util/preview';

type GithubIssueItem = {
  studentName: string;
  sex: number;
  id: number;
  url: string;
  enable: boolean;
  confirm: boolean;
  source: string;
  type: string | number;
  auditType: any;
  isFormal: boolean;
  status: string | number;
  method: string;
  classType: string;
  classYear: string;
  examType: string;
  project: string | any;
  studentId: number;
  orderId: number;
  createTime: any;
  isSend: any;
  isCalculation: any;
  isSendOver: any;
  charge: any;
  files: string;
};
export default (props: any) => {
  const { admin, studentid = false, studentType = '0', auditType = '' } = props;
  const params: any = {};
  params.isSendOver = true;
  params.isSend = true;
  params.auditType = 0;
  params.confirm = true;
  params.enable = true;
  const actionRef = useRef<ActionType>();
  const [InfoVisibleFalg, setInfoVisible] = useState<boolean>(false);
  const [PreviewVisibles, setPreviewVisibles] = useState<boolean>(false);
  const [renderData, setRenderData] = useState<any>(null);
  const [Params, setParams] = useState<any>(params);
  const [Badges, setBadges] = useState<any>([0, 0]);
  const [switchLoding, setSwitchLoding] = useState<boolean>(false);
  const [openTrue, setOpenTrue] = useState<boolean>(false);
  const [selectedRowsList, setselectedRowsList] = useState<any>([]);
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [textVisibleFalg, setTextModalVisible] = useState<boolean>(false);
  const [previewurl, setPreviewurl] = useState<any>();

  const url = '/sms/business/bizCharge';
  const url2 = '/sms/business/bizStudent';
  const [imageURL0, setImageURL0] = useState('');
  const [imageURL1, setImageURL1] = useState('');
  const [arr, setArr] = useState([])
  const tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
  const tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
  const obj = {};
  obj[tokenName] = tokenValue;
  const callbackRef = (value: any = true) => {
    // @ts-ignore
    actionRef.current.reloadAndRest();
    BadgesNumbers();
  };
  const BadgesNumbers = () => {
    request
      .get('/sms/business/bizCharge/statistics', {
        array: JSON.stringify([{ auditType: 0, isSendOver: false, isSend: true, confirm: true }]),
      })
      .then((res) => {
        setBadges(res.data);
      });
  };
  useEffect(() => {
    callbackRef();
  }, [studentType, auditType]);
  const columns: ProColumns<API.GithubIssueItem>[] = [
    {
      title: '缴费编号',
      dataIndex: 'num',
      width: 130,
    },
    {
      title: '收费日期',
      key: 'chargeTime',
      dataIndex: 'chargeTime',
      valueType: 'dateRange',
      render: (text, record) => <span>{record.chargeTime}</span>,
    },
    {
      title: '到账日期',
      key: 'paymentTime',
      dataIndex: 'paymentTime',
      valueType: 'dateRange',
      render: (text, record) => (
        <span>{record.paymentTime}</span>
      ),
    },
    {
      title: '学员',
      dataIndex: 'studentName',
      // width: 100,
      // search: false,
      // fixed: 'left',
      render: (text, record) => (
        <a
          onClick={() => {
            request.get(url2, { id: record.studentId }).then((res: any) => {
              setRenderData({ ...res.data.content[0], admin: admin });
              setInfoVisible(true);
            });
          }}
        >
          {record.studentName}
        </a>
      ),
    },
    {
      title: '项目总称',
      dataIndex: 'parentProjects',
      key: 'parentProjects',
      sorter: true,
      valueType: 'cascader',
      fieldProps: {
        options: Dictionaries.getList('dict_reg_job'),
        showSearch: { filter },
      },
      width: 180,
      render: (text, record) => (
        <span key="parentProjects">
          {Dictionaries.getCascaderAllName('dict_reg_job', record.project)}
        </span>
      ),
    },
    {
      title: '收费项目',
      dataIndex: 'project',
      // search: false,
      key: 'project',
      valueType: 'cascader',
      fieldProps: {
        options: Dictionaries.getCascader('dict_reg_job'),
        showSearch: { filter },
      },
      render: (text, record) => (
        <span>
          {record.project &&
            [...new Set(record.project.split(','))].map((item: any, index: number) => {
              return (
                <span key={`project-${item}-${index}`}>
                  {Dictionaries.getCascaderName('dict_reg_job', item)} <br />
                </span>
              );
            })}
        </span>
      ),
    },
    {
      title: '收费金额',
      dataIndex: 'amount',
      sorter: true,
      search: false,
    },
    {
      title: '优惠金额',
      sorter: true,
      dataIndex: 'discount',
      search: false,
    },
    {
      title: '收费方式',
      dataIndex: 'method',
      valueType: 'select',
      valueEnum: Dictionaries.getSearch('dict_stu_refund_type'),
      render: (text, record) => (
        <span>{Dictionaries.getCascaderName('dict_stu_refund_type', record.method)}</span>
      ),
    },
    {
      title: '备注',
      dataIndex: 'description',
      search: false,
      ellipsis: true,
      tip: '备注过长会自动收缩',
    },

    {
      title: '收费人',
      dataIndex: 'userName',
      // search: false,
    },
    {
      title: '审核时间',
      key: 'auditTime',
      sorter: true,
      width: 120,
      dataIndex: 'auditTime',
      valueType: 'dateRange',
      render: (text, record) => (
        <span>{record.auditTime}</span>
      ),
    },
    {
      title: '审核建议',
      dataIndex: 'remark',
      search: false,
      ellipsis: true,
      tip: '建议过长会自动收缩',
    },
    {
      title: '是否已发喜报',
      dataIndex: 'isSendOver',
      // search: false,
      valueType: 'select',
      order: 9,
      width: 100,
      valueEnum: {
        false: {
          text: '未发送',
          status: 'Error',
        },
        true: {
          text: '已发送',
          status: 'Success',
        },
      },
      render: (text, record, _, action) => (
        <>
          {record.isSendOver ? (
            <Tag color={'#87d068'}>已发送</Tag>
          ) : (
            <Tag color={'#FF0000'}>未发送</Tag>
          )}
        </>
      ),
    },
    {
      title: '是否发送喜报',
      dataIndex: 'isSend',
      valueType: 'select',
      width: 100,
      search: false,
      order: 8,
      hideInTable: Params.isSendOver,
      valueEnum: {
        All: {
          text: '全部',
          status: 'All',
        },
        false: {
          text: '不发送',
          status: 'Error',
        },
        true: {
          text: '发送',
          status: 'Success',
        },
      },
      render: (text, record, _, action) => (
        <>
          {/* {record.isSend ? <Tag color={'#87d068'}>发送</Tag> : <Tag color={'#FF0000'}>不发送</Tag>} */}
          <Switch
            key={record.id}
            checkedChildren="发送"
            unCheckedChildren="不发送"
            // disabled={Params.isSendOver}
            defaultChecked={record.isSend}
            loading={switchLoding}
            onChange={async () => {
              setSwitchLoding(true);
              const status: any = await request.post('/sms/business/bizCharge/reports/setIsSend', {
                ids: record.id,
                isSend: !record.isSend,
              });
              if (status.status != 'success') {
                message.error(status.msg);
              }
              setSwitchLoding(false);
              callbackRef();
            }}
          />
        </>
      ),
    },
    {
      title: '是否计算业绩',
      dataIndex: 'isCalculation',
      valueType: 'select',
      width: 100,
      search: false,
      order: 8,
      valueEnum: {
        All: {
          text: '全部',
          status: 'All',
        },
        false: {
          text: '不计算',
          status: 'Error',
        },
        true: {
          text: '计算',
          status: 'Success',
        },
      },
      render: (text, record, _, action) => (
        <>
          {/* {record.isSend ? <Tag color={'#87d068'}>发送</Tag> : <Tag color={'#FF0000'}>不发送</Tag>} */}
          <Switch
            key={record.id}
            checkedChildren="计算"
            unCheckedChildren="不计算"
            // disabled={Params.isSendOver}
            defaultChecked={record.isCalculation}
            loading={switchLoding}
            onChange={async () => {
              setSwitchLoding(true);
              const status: any = await request.post(
                '/sms/business/bizCharge/reports/setIsCalculation',
                {
                  ids: record.id,
                  isCalculation: !record.isCalculation,
                },
              );
              if (status.status != 'success') {
                message.error(status.msg);
              }
              setSwitchLoding(false);
              callbackRef();
            }}
          />
        </>
      ),
    },
    // {
    //   title: '操作',
    //   valueType: 'option',
    //   key: 'option',
    //   fixed: 'right',
    //   // hideInTable: !admin,
    //   render: (text, record, _, action) => <></>,
    // },
  ];
  let toolbar = undefined;
  toolbar = {
    menu: {
      type: 'tab',
      // activeKey: activeKey,
      items: [
        {
          key: 'true',
          label: <span>已发送</span>,
        },
        {
          key: 'shenhe',
          label: (
            <Badge count={Badges[0]} size="small" offset={[5, 3]}>
              <span>待发送</span>
            </Badge>
          ),
        },

        {
          key: 'false',
          label: <span>不发送</span>,
        },
      ],
      onChange: (key: any) => {
        if (key == 'shenhe') {
          // params['auditType-isNull'] = true;
          setParams({ isSendOver: false, isSend: true, auditType: 0, confirm: true, enable: true });
        } else if (key == 'true') {
          setParams({ isSendOver: true, isSend: true, auditType: 0, confirm: true, enable: true });
          // params.confirm = true;
        } else if (key == 'false') {
          setParams({ isSend: false, auditType: 0, confirm: true, enable: true });
          // params.confirm = false;
        }
        callbackRef();
      },
    },
  };
  const sortList: any = {
    ['updateTime,num']: 'desc,asc',
  };
  // let arr: any = [];
  const onChanges = (value: CheckboxChangeEvent) => {
    const arrs = JSON.parse(JSON.stringify(arr))
    if (arrs.indexOf(value) >= 0) {
      arrs.splice(arrs.indexOf(value), 1);
    } else {
      arrs.push(value);
    }
    setArr(arrs)

  };
  const yulan = async (num: any) => {
    if (eval('imageURL' + num) == '') {
      const response = await fetch('/sms/business/bizCharge/reports/generatePerformanceRanking?type=' + num, {
        method: 'POST',
        headers: {
          ...obj,
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ type: 0 })

      })
      const blob = await response.blob();
      const imageURLs = URL.createObjectURL(blob);

      console.log('imageURL', eval('imageURL' + num));
      if (num == 0) {
        setImageURL0(imageURLs);
      } else {
        setImageURL1(imageURLs);
      }

      setPreviewurl(imageURLs)
    } else {
      setPreviewurl(eval('imageURL' + num))
    }

    setPreviewVisibles(true)
  }
  const menu = (
    <Menu
      items={[
        {
          key: '1',
          danger: true,
          label: (
            <Checkbox
              value="0"
              onChange={(e) => {
                onChanges(e.target.value);
              }}
            >
              本日个人业绩
            </Checkbox>
          ),
        },
        {
          key: '2',
          danger: true,
          label: (
            <Checkbox
              value="1"
              onChange={(e) => {
                onChanges(e.target.value);
              }}
            >
              本日部门业绩
            </Checkbox>
          ),
        },
        {
          key: '4',
          danger: true,
          label: (
            <Checkbox
              value="3"
              onChange={(e) => {
                onChanges(e.target.value);
              }}
            >
              本周业绩表彰
            </Checkbox>
          ),
        },
        {
          key: '3',
          danger: true,
          label: (
            <Checkbox
              value="2"
              onChange={(e) => {
                onChanges(e.target.value);
              }}
            >
              本月部门业绩
            </Checkbox>
          ),
        },
        {
          key: '5',
          danger: true,
          label: (
            <Checkbox
              value="4"
              disabled={imageURL0 == ''}
              onChange={(e) => {
                // 
                onChanges(e.target.value);
              }}
            >
              本日业绩排名  <a onClick={(e) => yulan(0)}>生成</a>
            </Checkbox>
          ),
        },
        {
          key: '6',
          danger: true,
          label: (
            <Checkbox
              value="5"
              disabled={imageURL1 == ''}
              onChange={(e) => {
                onChanges(e.target.value);
              }}
            >
              本月业绩排名 <a onClick={(e) => yulan(1)}>生成</a>
            </Checkbox>
          ),
        },
        {
          key: '4',
          label: [
            <Button size="small" onClick={() => setOpenTrue(false)}>
              取消
            </Button>,
            <Button
              size="small"
              type="primary"
              style={{ marginLeft: '20px' }}
              onClick={() => {
                if (arr.length == 0) {
                  message.error('请至少选择一种发送喜报的方式!', 5);
                  return;
                }
                const data: {
                  typeList: string;
                  idList?: string;
                } = {
                  typeList: arr.join(','),
                };
                if (selectedRowsList.length > 0) {
                  data.idList = selectedRowsList.join(',');
                }
                request.post('/sms/business/bizCharge/reports/send', data).then((res) => {
                  if (res.status === 'success') {
                    message.success('操作成功!');
                    setOpenTrue(false);
                    callbackRef();
                  }
                });
              }}
            >
              发送
            </Button>,

          ],
        },
      ]}
    />
  );
  return (
    <>
      <Tables
        columns={columns}
        actionRef={actionRef}
        cardBordered
        className="xibao"
        search={{
          labelWidth: 120,
          defaultCollapsed: true,
          defaultColsNumber: 6,
        }}
        request={{ url: url, params: Params, sortList: sortList }}
        toolbar={toolbar}
        pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        rowSelection={{
          // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
          // 注释该行则默认不显示下拉选项
          selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
          onChange: (e, selectedRows) => {
            setselectedRowsList(e);
          },
        }}
        tableAlertOptionRender={() => {
          return (
            <Space size={16}>
              <a
                hidden={Params.isSendOver}
                onClick={() => {
                  request
                    .post('/sms/business/bizCharge/reports/send', {
                      typeList: 0,
                      idList: selectedRowsList.join(','),
                    })
                    .then((res) => {
                      if (res.status === 'success') {
                        message.success('操作成功!');
                        callbackRef();
                      }
                    });
                }}
              >
                发送喜报
              </a>
              {/* <a
                style={{ color: 'orangered' }}
                onClick={() => {
                  console.log(selectedRowsList);
                  let num: any = [];
                  selectedRowsList.forEach((item: any) => {
                    num.push(item.id);
                  });
                  request
                    .post('/sms/business/bizCharge/reports/setIsSend', {
                      ids: num.join(','),
                      isSend: false,
                    })
                    .then((res) => {
                      if (res.status === 'success') {
                        message.success('操作成功!');
                        callbackRef();
                      }
                    });
                }}
              >
                取消发送喜报
              </a> */}
            </Space>
          );
        }}
        toolBarRender={[
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setTextModalVisible(true);
            }}
          >
            设置喜报语句
          </Button>,
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setModalVisible(true);
            }}
          >
            设置部门目标
          </Button>,
          <Dropdown menu={{ items: menu }} open={openTrue} destroyPopupOnHide={true}>
            <Button
              type="primary"
              icon={<DownOutlined />}
              onClick={() => {
                setOpenTrue(!openTrue);
              }}
            >
              发送喜报
            </Button>
          </Dropdown>,
          // <Button
          //   type="primary"
          //   onClick={() => {
          //     request.post('/sms/business/bizCharge/reports/send?type=2').then((res) => {
          //       if (res.status === 'success') {
          //         message.success('操作成功!');
          //         callbackRef();
          //       }
          //     });
          //   }}
          // >
          //   全部发送
          // </Button>,
          // <Button
          //   type="primary"
          //   onClick={() => {
          //     request.post('/sms/business/bizCharge/reports/send?type=1').then((res) => {
          //       if (res.status === 'success') {
          //         message.success('操作成功!');
          //         callbackRef();
          //       }
          //     });
          //   }}
          // >
          //   发送部门业绩
          // </Button>,
          // <Button
          //   type="primary"
          //   onClick={() => {
          //     request.post('/sms/business/bizCharge/reports/send?type=0').then((res) => {
          //       if (res.status === 'success') {
          //         message.success('操作成功!');
          //         callbackRef();
          //       }
          //     });
          //   }}
          // >
          //   发送个人喜报
          // </Button>,
        ]}
      />

      {modalVisibleFalg && (
        <Department
          setModalVisible={() => setModalVisible(false)}
          modalVisible={modalVisibleFalg}
          callbackRef={() => callbackRef()}
          renderData={renderData}
        />
      )}
      {textVisibleFalg && (
        <TextContent
          setModalVisible={() => setTextModalVisible(false)}
          modalVisible={textVisibleFalg}
          callbackRef={() => callbackRef()}
        />
      )}
      {PreviewVisibles && (
        <Preview
          imgSrc={previewurl}
          isModalVisibles={PreviewVisibles}
          setisModalVisibles={(e: boolean | ((prevState: boolean) => boolean)) =>
            setPreviewVisibles(e)
          }
        />
      )}
    </>
  );
};
