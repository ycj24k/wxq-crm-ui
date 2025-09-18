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
  
  // 安全地获取 localStorage 数据
  const getContentNews = () => {
    try {
      const contentNews = localStorage.getItem('contentNews');
      return contentNews ? JSON.parse(contentNews) : null;
    } catch (e) {
      console.error('Error parsing contentNews from localStorage', e);
      return null;
    }
  };
  
  const [contentNews, setContentNews] = useState(getContentNews());

  const dropdownContent = (
    <div style={{ width: '300px', height: '366px', position: 'relative' }}>
      <Tabs
        defaultActiveKey="1"
        centered
        style={{ marginBottom: '0px' }}
        items={[
          { 
            key: '1', 
            label: '通知', 
            children: notice ? notice : <Empty style={{ marginTop: '45px' }} /> 
          },
          { 
            key: '2', 
            label: '消息', 
            children: menus ? menus : <Empty style={{ marginTop: '45px' }} /> 
          },
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
    // 安全地从 sessionStorage 获取数据
    let bizNotice = null;
    try {
      const bizNoticeStr = sessionStorage.getItem('bizNotice');
      bizNotice = bizNoticeStr ? JSON.parse(bizNoticeStr) : null;
    } catch (e) {
      console.error('Error parsing bizNotice from sessionStorage', e);
    }
    
    if (bizNotice && bizNotice.data && bizNotice.data.content) {
      setNotice(contentList(bizNotice.data.content));
      badgeFalg(bizNotice.data.content);
    } else {
      // 如果没有数据，显示空状态
      setNotice(<Empty style={{ marginTop: '45px' }} />);
      setFalg('none');
      
      // 注释掉的 API 调用
      // request.get('/sms/business/bizNotice').then((res: any) => {
      //   if (res.data && res.data.content && res.data.content.length > 0) {
      //     setNotice(contentList(res.data.content));
      //     badgeFalg(res.data.content);
      //   }
      // });
    }
  }, [dropdownFalg, isModalVisible]);
  
  const badgeFalg = (data: any = []) => {
    if (Array.isArray(data) && 
        data.slice(0, 4).some((item: any) => {
          return item.isConfirm == false;
        })) {
      setFalg('block');
    } else {
      setFalg('none');
    }
  };
  
  const contentList = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0) {
      return <Empty style={{ marginTop: '45px' }} />;
    }
    
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
                // 注释掉的 API 调用
                // request.get('/sms/business/bizNotice/confirm', { id: item.id }).then((res: any) => {
                //   if (res.status == 'success') {
                //     Dictionaries.getBizNotice();
                //     setisModalVisible(true);
                //     setmodalContent(item);
                //   }
                // });
                setisModalVisible(true);
                setmodalContent(item);
              }
            } else {
              try {
                const contentNewss = contentNews
                  ? [...contentNews].reverse()
                  : [];
                  
                if (contentNewss[index]) {
                  contentNewss[index].isConfirm = false;
                  localStorage.setItem('contentNews', JSON.stringify(contentNewss));
                  badgeFalg(contentNewss);
                }
              } catch (e) {
                console.error('Error updating content news', e);
              }
            }
          }}
          style={{
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
              {item.data || item.content || '无内容'}
              <div className="leftDiv">
                <p>{item.from || item.userName || '未知'}</p>
                <p style={{ color: '#ccc' }}>
                  {item.createTime ? moment(item.createTime).format('GGGG-MM-DD') : '刚刚'}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };
  
  return (
    <div
    onClick={() => {
      history.push('/users/usercenter');
    }}
    >
     <HeaderDropdown
        overlayClassName="newss"
        trigger={['click']}
        // 移除 menu 属性，直接使用 dropdownContent 作为 children
        dropdownRender={() => dropdownContent}
        // 或者如果你的 HeaderDropdown 支持直接传递 children：
        // children={dropdownContent}
        // @ts-ignore
        placement="bottom"
        onVisibleChange={(e) => {
          if (e) {
            setDropdownFalg(!dropdownFalg);
          }
        }}
      >
        <Badge dot>
        {/* <Badge count={0} dot> */}
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