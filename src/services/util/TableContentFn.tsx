import request from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';
import { getFirstAndLastDayOfMonth } from '../../pages/Department/AchievementUser/getTime'
const TableContentFn = async (type = 'user', vStartDate: moment.MomentInput, vEndDate: undefined) => {
  let list: any = [];
  let data1: any = '';
  let target: []
  const time = getFirstAndLastDayOfMonth()

  if (type == 'user') {
    data1 = (
      await request.get('/sms/share/getDepartment', {
        _isGetAll: true,
        // _orderBy: 'chargeTarget',
        _direction: 'desc',
      })
    ).data;
  } else {
    data1 = (
      await request.get('/sms/system/sysDepartment', {
        _isGetAll: true,
        // _orderBy: 'chargeTarget',
        _direction: 'asc',
        parentId: 15,
      })
    ).data.content;

  }
  const content = data1;
  const arr: any = [];
  const childrenId: any[] = []
  content.forEach((item: any) => {
    childrenId.push(item.id)
    arr.push(item.id);
  });
  if (type != 'user') {
    target = (await request.get('/sms/business/bizTarget', {
      'departmentId-in': childrenId.join(','),
      startTime: time.firstDay,
      endTime: time.lastDay,
      _isGetAll: true,
    })).data.content
  }
  const vStartDates = vStartDate ? vStartDate : moment().add('month', 0).format('YYYY-MM') + '-01';
  const vEndM = moment(vStartDate).add('month', 1).add('days', -1);
  const vEndDates = vEndDate ? vEndDate : moment(vEndM).format('YYYY-MM-DD');
  const str2 = moment().format('YYYY-MM-DD');
  const str3 = moment(new Date()).add(1, 'days').format('YYYY-MM-DD');
  const data2 = (
    await request.get('/sms/business/bizCharge/reports/getDepartmentNewOrder', {
      idList: arr.join(','),
      start: str2,
      end: str3,
    })
  ).data;
  const data3 = (
    await request.get('/sms/business/bizCharge/reports/getDepartmentNewOrder', {
      idList: arr.join(','),
      start: vStartDates,
      end: vEndDates,
    })
  ).data;

  content.forEach((item: any) => {
    if (target) {
      target.forEach((childrenItem: any) => {
        if (item.id == childrenItem.departmentId) {
          if (childrenItem.type == 2) {
            item.chargeTarget = childrenItem.count
            item.chargeTargetId = childrenItem.id
          }
          if (childrenItem.type == 3) {
            item.bottomTarget = childrenItem.count
            item.bottomTargetId = childrenItem.id
          }
          if (childrenItem.type == 4) {
            item.secondaryTarget = childrenItem.count
            item.secondaryTargetId = childrenItem.id
          }
          if (childrenItem.type == 5) {
            item.sprintTarget = childrenItem.count
            item.sprintTargetId = childrenItem.id
          }
          if (childrenItem.type == 6) {
            item.challengeTarget = childrenItem.count
            item.challengeTargetId = childrenItem.id
          }
        }
      })
    }

    Object.keys(data2).forEach((keys) => {
      if (item.id == keys) {
        item.chargeTargetDay = data2[keys];
      }
    });
    Object.keys(data3).forEach((keys) => {
      if (item.id == keys) {
        item.chargeMonth = data3[keys];
      }
    });
  });
  list = content;
  return list;
};

export default TableContentFn;
