import { request } from 'umi';
const loginPath = '/user/login';
import { history } from 'umi';
import { message } from 'antd';
import Socket from '../util/websocket';
import Dictionaries from '@/services/util/dictionaries';
import moment, { isMoment } from 'moment';
var num = 0;
class httpRequest {
  request = request;

  throttle(fn: () => void, delay: number | undefined) {
    var flag = true;
    return () => {
      if (flag) {
        setTimeout(() => {
          fn.call(this);
          flag = true;
        }, delay);
      }
      flag = false;
    };
  }

  async baseOptions(param: any, method = 'GET', type = '', err = true): Promise<any> {
    let tokenName = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
    let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
    let { url, data, params } = param;
    const option: any = {
      data: data ? data : '',
      // params: params ? params : '',
      method: method,
      headers: {
        'Content-Type': type ? 'application/json' : 'application/x-www-form-urlencoded',
      },
    };
    if (tokenName != undefined && tokenName != '') option.headers[tokenName] = tokenValue;
    // console.log('Socket.sockets', Socket.sockets);
    // console.log('Socket.sockets', Socket.sockets);

    // if (!Socket.sockets) {
    //   Socket.open();

    //   return this.baseOptions(param, method, type);
    // }
    return new Promise((resolve, reject) => {
      request(url, option)
        .then((res: any) => {
          console.log(res);
          if (err) {
            if (res.status === 'success' || res.status === 'pleaseRefreshDict') {
              resolve(res);
            } else {
              // if (res.status == 'connectError' && num < 1) {
              //   num++;
              //   Socket.open();
              //   if (url == '/sms/share/getDict') return;

              //   return this.baseOptions(param, method, type);
              // }
              if (res.status == 'loginError') {
                history.push(loginPath);
              }
              if (res.status == 'seriousError') {
                reject(res);
                message.error(res.msg + '，已发送错误信息给管理员..');
                return;
              }
              reject(res);
              message.error(res.msg, 5);
            }
          } else {
            resolve(res);
          }
        })
        .catch(() => {
          message.error('系统更新中', 5);
        });
    });
  }

  async get(url: string, data: any = '', unData: any = '', buildTime: boolean = true) {
    // console.log('get', data);
    //自定义page
    if (data.current) {
      data._page = data.current - 1;
      delete data.current;
    }
    //按项目查询时，只需要查最后的子类
    if (data.project && typeof data.project != 'string') {
      data.project = data.project[data.project.length - 1];
    }
    if (data.pageSize) {
      data._size = data.pageSize;
      delete data.pageSize;
    }
    const TimeArr = [
      'createTime',
      'auditTime',
      'servedTime',
      'chargeTime',
      'receiveTime',
      'dealTime',
      'dateTime',
      // 'nextVisitDate',
      'paymentTime',
      'circulationTime',
      'consultationTime',
      'certStartDate',
      'certEndDate',
      'time',
      'date',
      'startDate',
      'endDate',
    ];

    //时间查询通用
    Object.keys(data).forEach((key: any) => {
      if (buildTime && TimeArr.indexOf(key) >= 0) {
        //yyyy-MM-dd HH:mm:ss
        if (isMoment(data[key][0])) {
          data[`${key}-start`] = moment(data[key][0]).format('YYYY-MM-DD') + ' 00:00:00';
          data[`${key}-end`] = moment(data[key][1]).format('YYYY-MM-DD') + ' 23:59:59';
          delete data[key];
        } else {
          data[`${key}-start`] =
            data[key][0]?.length == 10 ? data[key][0] + ' 00:00:00' : data[key][0];
          data[`${key}-end`] =
            data[key][1]?.length == 10 ? data[key][1] + ' 23:59:59' : data[key][1];
          delete data[key];
        }
      }
    });
    if (data.parentProjects) {
      const dataParent = data.parentProjects;
      let list: any = [];
      dataParent.forEach((item: string | undefined) => {
        const Projects = Dictionaries.getList('dict_reg_job', item);
        if (Projects) {
          Projects?.forEach((item) => {
            list.push(item.value);
          });
        }
        console.log('list', list);
      });
      data['project-in'] = list.join(',') + ',' + data.parentProjects;
    }
    if (data.dealParentProjects) {
      const dataParent = data.dealParentProjects;
      let list: any = [];
      dataParent.forEach((item: string | undefined) => {
        const Projects = Dictionaries.getList('dict_reg_job', item);
        if (Projects) {
          Projects?.forEach((item) => {
            list.push(item.value);
          });
        }
        console.log('list', list);
      });
      data['dealProject-in'] = list.join(',') + ',' + data.dealParentProjects;
    }
    if (data) {
      let arr: string[] = [];
      let arr2: string[] = [];
      Object.keys(data).forEach((key: any) => {
        arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
      });
      if (unData) {
        Object.keys(unData).forEach((key: string | number) => {
          arr2.push(key + '!=' + unData[key]);
        });
        url = url + '?' + arr.join('&') + '&' + arr2.join('&');
      } else {
        url = url + '?' + arr.join('&');
      }
    }
    let option = { url };

    // return this.throttle(await this.baseOptions(option), 1000);
    return this.baseOptions(option);
  }

  post(url: string, data: any = '') {
    // let params = { url, data };
    // return this.baseOptions(params, 'POST');

    if (data) {
      let arr: string[] = [];
      Object.keys(data).forEach((key: string | number) => {
        arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
      });
      url = url + '?' + arr.join('&');
    }
    let option = { url };
    return this.baseOptions(option, 'POST');
  }
  postAll(url: string, data: any = '') {
    let option = { url, data };
    return this.baseOptions(option, 'POST', 'up');
  }
  getAll(url: string, data: any = '') {
    let option = { url, data };
    return this.baseOptions(option, 'GET', 'up');
  }
  /**
   *
   * @param url 地址
   * @param data2 这部分是放在接口上的
   * @param data 这部分是放在data里的
   * @returns 一部分拼接一部分data传参
   */
  post2(url: string, data2: any = '', data: any = '') {
    if (data2) {
      let arr: string[] = [];
      Object.keys(data2).forEach((key: string | number) => {
        arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(data2[key]));
      });
      url = url + '?' + arr.join('&');
    }
    let option = { url, data };

    return this.baseOptions(option, 'POST', 'up');
  }
  delete(url: string, data: any = '') {
    // let params = { url, data };
    // return this.baseOptions(params, 'POST');
    if (data) {
      let arr: string[] = [];
      Object.keys(data).forEach((key: string | number) => {
        arr.push(key + '=' + data[key]);
      });
      url = url + '?' + arr.join('&');
    }
    let option = { url };
    return this.baseOptions(option, 'DELETE');
  }
}

export default new httpRequest();
