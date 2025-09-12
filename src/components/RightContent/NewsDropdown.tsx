import React, { useEffect, useState } from 'react';
import { BellOutlined, MailOutlined } from '@ant-design/icons';
import { Badge, Empty, Modal, Tabs } from 'antd';
import './index.less';
import HeaderDropdown from '../HeaderDropdown';
import request from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';
import NewsModal from './NewsModal';
import Notice from '@/pages/Admins/Notice';
import Dictionaries from '@/services/util/dictionaries';
export type GlobalHeaderRightProps = {
  menu?: boolean;
};
import { history } from 'umi';
// Tabs.TabPane 废弃，使用 items

const NewsDropdown: React.FC<GlobalHeaderRightProps> = () => {
  // const { initialState, setInitialState } = useModel('@@initialState');
  const [menus, setMenus] = useState();
  const [falg, setFalg] = useState<any>('none');
  const [notice, setNotice] = useState<any>();
  const [modalContent, setmodalContent] = useState<any>();
  const [isModalVisible, setisModalVisible] = useState<boolean>(false);
  const [dropdownFalg, setDropdownFalg] = useState<any>(false);
  const [newsList, setNewsList] = useState(false);
  const [contentNews, setContentNews] = useState(
    // @ts-ignore
    JSON.parse(localStorage.getItem('contentNews')),
  );
  const menuHeaderDropdown = (
    <div style={{ width: '300px', height: '366px', position: 'relative' }}>
      <Tabs
        defaultActiveKey="1"
        centered
        style={{ marginBottom: '0px' }}
        items={[
          { key: '1', label: '通知', children: notice ? notice : <Empty style={{ marginTop: '45px' }} /> },
          { key: '2', label: '消息', children: menus ? menus : <Empty style={{ marginTop: '45px' }} /> },
        ]}
      />
      <div className="menuBot">
        <div
          style={{ borderRight: '1px solid #eee', width: '50%', cursor: 'pointer' }}
          onClick={() => {
            localStorage.removeItem('contentNews');
            setFalg('none');
          }}
        >
          清空 通知
        </div>
        <div
          style={{ width: '50%', cursor: 'pointer' }}
          onClick={() => {
            history.push('/users/usercenter?key=3');
          }}
        >
          查看更多
        </div>
      </div>
    </div>
  );
  useEffect(() => {
    const bizNotice: any = JSON.parse(sessionStorage.getItem('bizNotice') as string);
    if (bizNotice) {
      setNotice(contentList(bizNotice?.data?.content));
      badgeFalg(bizNotice?.data?.content);
    } else {
      // request.get('/sms/business/bizNotice').then((res: any) => {
      //   if (res.data.content.length > 0) {
      //     setNotice(contentList(res.data.content));
      //     badgeFalg(res.data.content);
      //   }
      // });
    }

    // contentNews && badgeFalg(contentNews);
  }, [dropdownFalg || isModalVisible]);
  const badgeFalg = (data: any = []) => {
    if (
      data.slice(0, 4).some((item: any) => {
        return item.isConfirm == false;
      })
    ) {
      setFalg('block');
    } else {
      setFalg('none');
    }
  };
  const contentList = (data: []) => {
    return data.slice(0, 4).map((item: any, index: number) => {
      return (
        <div
          id="newsss"
          key={`news-dropdown-${index}`}
          onClick={() => {
            if (item.userName) {
              if (item.isConfirm) {
                setisModalVisible(true);
                setmodalContent(item);
              } else {
                request.get('/sms/business/bizNotice/confirm', { id: item.id }).then((res: any) => {
                  if (res.status == 'success') {
                    Dictionaries.getBizNotice();
                    setisModalVisible(true);
                    setmodalContent(item);
                  }
                });
              }
            } else {
              const contentNewss = contentNews
                ? // @ts-ignore
                JSON.parse(localStorage.getItem('contentNews')).reverse()
                : '';
              contentNewss[index].isConfirm = false;

              localStorage.setItem('contentNews', JSON.stringify(contentNewss));
              // @ts-ignore
              badgeFalg(JSON.parse(localStorage.getItem('contentNews')));
            }
          }}
          style={{
            // backgroundColor: item.falg ? '' : 'rgb(247, 245, 245)',
            position: 'relative',
          }}
        >
          <div
            hidden={!item.isConfirm}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'rgb(247, 245, 245)',
              position: 'absolute',
              opacity: '0.5',
            }}
           />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="newsDiv">
              <MailOutlined className="icons" />
            </div>
            <div className="left">
              {item.data || item.content}
              <div className="leftDiv">
                <p>{item.from || item.userName}</p>
                <p style={{ color: '#ccc' }}>
                  {moment(item.createTime).format('GGGG-MM-DD') || '刚刚'}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };
  return (
    <div>
      <HeaderDropdown
        overlayClassName="newss"
        trigger={['click']}
        overlay={menuHeaderDropdown}
        // @ts-ignore
        placement="bottom"
        onVisibleChange={(e) => {
          const arr: any = [];
          if (e) {
            // if (localStorage.getItem('contentNews')) {
            //   // @ts-ignore
            //   arr = JSON.parse(localStorage.getItem('contentNews')).reverse();
            //   badgeFalg(arr);
            //   // @ts-ignore
            //   setMenus(contentList(arr));
            //   setContentNews(arr);
            // }
            setDropdownFalg(!dropdownFalg);
          }
        }}
      >
        {/* @ts-ignore */}
        <Badge dot id="bage" style={{ display: falg }}>
          <BellOutlined id="bell" style={{ cursor: 'pointer' }} />
        </Badge>
      </HeaderDropdown>
      {isModalVisible && (
        <NewsModal
          isModalVisible={isModalVisible}
          setisModalVisible={() => {
            setisModalVisible(false);
          }}
          modalContent={modalContent}
        />
      )}
      {newsList && (
        <Modal
          title="通知列表"
          width={1300}
          visible={newsList}
          onOk={() => {
            setNewsList(false);
          }}
          onCancel={() => {
            setNewsList(false);
          }}
        >
          <Notice type="list" />
        </Modal>
      )}
    </div>
  );
};

export default NewsDropdown;
