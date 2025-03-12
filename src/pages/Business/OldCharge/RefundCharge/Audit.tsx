import { PlusOutlined } from '@ant-design/icons';
import { Badge, Button, Modal, Space } from 'antd';
import { useState, useRef, useEffect } from 'react';
import OldCharge from '../index';
import ChargeModal from './ChargeModal';
import request from '@/services/ant-design-pro/apiRequest';
import DownTable from '@/services/util/timeFn';
import DownHeader from '@/pages/Admins/AdminCharge/DownHeader';
import { history } from 'umi';
export default () => {
  const [ModalsVisible, setModalsVisible] = useState<boolean>(false);
  const [renderData, setRenderData] = useState<any>(null);
  const [Params, setParams] = useState<any>({ 'auditNum-isNull': true, enable: true, isSubmit: true });
  const childRef: any = useRef(null);
  const [Badges, setBadges] = useState<any>([0, 0]);
  const [ChangeKey, setChangeKey] = useState<any>('4');
  useEffect(() => {
    BadgesNumbers();
  }, []);
  const callbackRef = () => {
    childRef.current.callbackRef();
  };
  const BadgesNumbers = () => {
    request
      .get('/sms/business/bizCharge/statistics', {
        array: JSON.stringify([
          { type: 3, 'auditNum-isNull': true, isSubmit: true },
          { auditNum: '1', type: 3, isSubmit: true },
          { auditNum: '2', type: 3, isSubmit: true },
          { auditNum: '3', type: 3, isSubmit: true },
          { enable: true, type: 3, isSubmit: false },
        ]),
      })
      .then((res) => {
        setBadges(res.data);
      });
  };
  const toolBarRender = [
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => {
        Modal.confirm({
          title: '注意',
          okText: '我已了解',
          content: <> 2023年4月后的订单禁止在此退费，请去
            <a
              onClick={() => history.push('/business/businessorder')}
            >
              订单列表
            </a>
            搜索对应订单进行退费!
          </>,
          onOk() {
            setRenderData({ eidtType: 'add', type: '3' });
            setModalsVisible(true);
          }
        }
        )
      }}
    >
      新增退费信息
    </Button>,
  ];
  const toolbar = {
    menu: {
      type: 'tab',
      // activeKey: activeKey,
      items: [
        {
          key: '-isNull',
          label: (
            <Badge count={Badges[0]} size="small" offset={[5, 3]}>
              {' '}
              <span>①教务主管/学籍审核</span>
            </Badge>
          ),
        },
        {
          key: '1',
          label: (
            <Badge count={Badges[1]} size="small" offset={[5, 3]}>
              <span>②事业部负责人审核</span>
            </Badge>
          ),
        },
        {
          key: '2',
          label: (
            <Badge count={Badges[2]} size="small" offset={[5, 3]}>
              <span>③财务审核</span>
            </Badge>
          ),
        },
        {
          key: '3',
          label: (
            <Badge count={Badges[3]} size="small" offset={[5, 3]}>
              <span>④总经办审核</span>
            </Badge>
          ),
        },
        {
          key: '4',
          label: <span>退费列表</span>,
        },
        {
          key: 'true',
          label: <span>审核通过</span>,
        },
        {
          key: 'false',
          label: (
            <Badge count={Badges[4]} size="small" offset={[5, 3]}>
              <span>审核未通过</span>
            </Badge>
          ),
        },
        {
          key: 'enable',
          label: <span>已废除</span>,
        },
      ],
      onChange: (key: any) => {
        setChangeKey(key);
        if (key === 'false') {
          setParams({ auditNum: 'All', enable: true, isSubmit: false });
        } else if (key === '-isNull') {
          setParams({ 'auditNum-isNull': true, enable: true, isSubmit: true });
        } else if (key === 'enable') {
          setParams({ enable: false });
        } else if (key == '4') {
          setParams({ enable: true });
        } else if (key == 'true') {
          setParams({ auditNum: 4 });
        } else {
          setParams({ auditNum: key, isSubmit: true, enable: true });
        }

        callbackRef();
      },
    },
  };

  return (
    <>
      <OldCharge
        params={{ type: 3, ...Params }}
        ref={childRef}
        toolbar={toolbar}
        setModalsVisible={(e: boolean) => setModalsVisible(e)}
        setRenderData={(e: any) => setRenderData(e)}
        toolBarRender={toolBarRender}
        BadgesNumbers={() => BadgesNumbers()}
        ChangeKey={ChangeKey}
        tableAlertOptionRender={({ selectedRows }: any) => {
          return (
            <Space size={24}>
              <a
                onClick={() => {
                  DownTable(selectedRows, DownHeader.OldRefundHeader, '退费信息', 'charge');
                }}
              >
                导出数据
              </a>
            </Space>
          );
        }}
      />

      {ModalsVisible && (
        <ChargeModal
          renderData={renderData}
          ModalsVisible={ModalsVisible}
          setModalsVisible={() => setModalsVisible(false)}
          callbackRef={() => callbackRef()}
        />
      )}
    </>
  );
};
