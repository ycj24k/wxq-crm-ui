import { ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { message, Modal, notification } from 'antd';
import dictionaries from './dictionaries';
import { history, Link } from 'umi';
import request from '../ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';
import React from 'react';
import { getInfo, getSession } from './util';

let number = 0;
const loginPath = '/user/login';
class Socket {
  sockets: any;
  falg: boolean;

  constructor() {
    this.sockets = null;
    this.falg = false;
  }

  closeOpen() { }

  open(token = undefined) {
    clearTimeout();
    const tokenValue = token ? token : sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
    // if (!tokenValue) return;
    let socket: any;
    if (typeof WebSocket == 'undefined') {

      message.error('您的浏览器不支持WebSocket');
      console.log('您的浏览器不支持WebSocket',);
    } else {
      console.log('您的浏览器支持WebSocket', window.location.origin);
      let socketUrl = '';
      if (process.env.NODE_ENV == 'development') {
        socketUrl = (/^[0-9\.]+$/.test(window.location.hostname) ? getInfo().origin : window.location.origin + ':23424') + '/sms/public/server/' + tokenValue;
        // socketUrl = 'ws://10.168.1.11:8085/sms/public/server/' + tokenValue;
      } else {
        socketUrl = window.location.origin + ':8085/sms/public/server/' + tokenValue;
      }

      //实现化WebSocket对象，指定要连接的服务器地址与端口  建立连接
      //var socketUrl="${request.contextPath}/im/"+$("#userId").val();
      // var socketUrl = './server/' + tokenValue;
      // var socketUrl = 'http://10.168.1.10:80/sms/server/' + tokenValue;
      socketUrl = socketUrl.replace('https', 'wss').replace('http', 'ws');
      console.log(socketUrl);
      if (socket != null) {
        socket.close();
        socket = null;
      }
      socket = new WebSocket(socketUrl);
      this.sockets = socket;
      //打开事件

      socket.onopen = async () => {
        console.log('123321,socket打开');

        if (this.falg) {
          Modal.destroyAll();
        }
        if (tokenValue && !token) {
          if (!sessionStorage.getItem('userInfo')) {
            // const userInfo = await request.get('/sms/user');
            const bizNotice = await request.get('/sms/business/bizNotice');
            // sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
            sessionStorage.setItem('bizNotice', JSON.stringify(bizNotice));
          }
          Dictionaries.get();
          // Dictionaries.getDepartmentName(47);
          getSession()
        }
        this.falg = false;
        message.destroy();
        console.log('websocket已打开');

        //socket.send("这是来自客户端的消息" + location.href + new Date());
      };

      //获得消息事件
      socket.onmessage = async (msg: { data: any }) => {
        const contentList: any = dictionaries.contentNews;
        const content: any = JSON.parse(msg.data);
        console.log('content', content);
        number = 0;
        if (content.type == 'dataUpdated') {
          if (content.data == 'dict') {
            Dictionaries.get();
          }
          if (content.data == 'notice') {
            Dictionaries.getBizNotice();
          }
          if (content.data == 'user') {
            sessionStorage.removeItem('userInfo');
            console.log('123');

            const userInfo = await request.get('/sms/user');
            sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
          }
        }
        if (content.type == 'newOrder') {
          notification.open({
            message: (
              <span>
                <a className="xibaoimg" />
                喜报！
              </span>
            ),
            description: `恭喜${content.data.userName}成交了一笔${Dictionaries.getCascaderName(
              'dict_reg_job',
              content.data.project,
            )}${content.data.receivable}元`,
            duration: 5,
          });
        }
        if (content.type == 'noticeCreate' || content.type == 'noticeUpdate') {
          content.isConfirm = false;
          if (dictionaries.contentNews) {
            localStorage.setItem('contentNews', JSON.stringify([...contentList, content]));
          } else {
            localStorage.setItem('contentNews', JSON.stringify([content]));
          }
          notification.open({
            message:
              content.type == 'noticeCreate'
                ? '您有一条新通知，请注意查收'
                : '一条通知已修改，请注意查收',
            description: content.data,
            icon: <InfoCircleOutlined style={{ color: '#108ee9' }} />,
          });
          const c: any = document.getElementById('bage');
          if (c) c.children[1].style.display = 'block';
        }

        // newsSockect();
        //发现消息进入    开始处理前端触发逻辑
        // if (JSON.parse(msg.data).data != '连接成功') {
        //   const messages = JSON.parse(msg.data).data;
        //   console.log('messages', messages);

        //   notification.info({
        //     duration: null,
        //     message: `来自${messages.from}的通知`,
        //     placement: 'top',
        //     description: messages.msg,
        //   });
        // }
      };
      //关闭事件
      socket.onclose = () => {
        this.sockets = null;
        const time = setTimeout(() => {
          this.open();
          number++;
          clearTimeout(time);
        }, 3000);
        // if (number <= 10) {
        //   const time = setTimeout(() => {
        //     this.open();
        //     number++;
        //     clearTimeout(time);
        //   }, 3000);
        // } else {
        //   message.error({
        //     content: '链接超时，请刷新重试...',
        //     duration: 0,
        //   });
        // }
        if (!this.falg && history.location.pathname !== loginPath) {
          Modal.info({
            title: '系统维护中....',
            content: (
              <div>
                <p>请勿刷新页面导致导致当前页面数据丢失</p>
              </div>
            ),
            onOk() { },
            wrapClassName: 'aaaa1',
            keyboard: false,
          });
          this.falg = true;
        }

        console.log('websocket已关闭', number);
      };
      // 发生了错误事件
      socket.onerror = function (e: any) {
        this.sockets = null;
        // Modal.confirm({
        //   title: '系统正在维护...',
        //   icon: <ExclamationCircleOutlined />,
        //   content: '请耐心等待',
        //   okText: '确认',
        //   cancelText: '取消',
        // });
        console.log('websocket发生了错误', this.sockets);
      };
    }
  }
  send(value: any, content: any = '', type: string = 'text') {
    if (typeof WebSocket == 'undefined') {
      message.error('您的浏览器不支持WebSocket');
      console.log('您的浏览器不支持WebSocket');
    } else {
      console.log('您的浏览器支持WebSocket！！！', value, content);

      //type
      this.sockets.send(JSON.stringify({ type: type, to: value.id, data: content }));
    }
  }
}

export default new Socket();
