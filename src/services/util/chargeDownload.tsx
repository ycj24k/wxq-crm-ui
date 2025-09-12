import DownHeader from '@/pages/Admins/AdminCharge/DownHeader';
import request from '@/services/ant-design-pro/apiRequest';
import DownTable from './timeFn';

function convertCurrency(idList: any, arr: any = []) {
  console.log('idList', idList);
  console.log('arr', arr);
  if (idList) {
    request
      .get('/sms/business/bizCharge/getListOfFinance', {
        idList: idList,
      }).then((ress) => {
        if (ress.status == 'success') {
          //缴费信息
          const chargeList: any = ress.data
          // request
          //   .get('/sms/business/bizInvoice/getByChargeIds', {
          //     idList: idList, _isGetAll: true
          //   })
          //   .then((res) => {
          // if (res.status == 'success') {
          //发票信息
          // const list = res.data;
          // chargeList.forEach((item: any) => {
          // const itemList = list.find((itemList: any) => itemList.chargeNum.includes(item.num));
          // list.forEach((itemList: any) => {
          //   console.log('list', list);

          //   if (itemList?.chargeNum?.indexOf(item.num) >= 0) {
          //     item.title = item.title ? `${itemList.title}` : itemList.title;
          //     item.productType = item.productType ? `${itemList.productType}` : itemList.productType + '';
          //     item.taxCode = item.taxCode ? `${itemList.taxCode}` : itemList.taxCode;
          //     item.invoiceAmount = item.invoiceAmount ? `${itemList.amount}` : itemList.amount;
          //     item.cautions = item.cautions ? `${itemList.cautions}` : itemList.cautions;
          //     item.email = item.email ? `${itemList.email}` : itemList.email;
          //     item.invoiceType = item.invoiceType ? `${itemList.type}` : itemList.type + '';
          //     item.address = item.address ? `${itemList.address}` : itemList.address;
          //     item.mobile = item.mobile ? `${itemList.mobile}` : itemList.mobile;
          //     item.account = item.account ? `${itemList.account}` : itemList.account;
          //     item.remark = item.remark ? `${itemList.remark}` : itemList.remark;
          //     item.bank = item.bank ? `${itemList.bank}` : itemList.bank;
          //   }
          // if (itemList?.chargeNum?.indexOf(item.num) >= 0) {
          //   item.title = item.title ? `${item.title},${itemList.title}` : itemList.title;
          //   item.productType = item.productType ? `${item.productType},${itemList.productType}` : itemList.productType + '';
          //   item.taxCode = item.taxCode ? `${item.taxCode},${itemList.taxCode}` : itemList.taxCode;
          //   item.invoiceAmount = item.invoiceAmount ? `${item.invoiceAmount},${itemList.amount}` : itemList.amount;
          //   item.cautions = item.cautions ? `${item.cautions},${itemList.cautions}` : itemList.cautions;
          //   item.email = item.email ? `${item.email},${itemList.email}` : itemList.email;
          //   item.invoiceType = item.invoiceType ? `${item.invoiceType},${itemList.type}` : itemList.type + '';
          //   item.address = item.address ? `${item.address},${itemList.address}` : itemList.address;
          //   item.mobile = item.mobile ? `${item.mobile},${itemList.mobile}` : itemList.mobile;
          //   item.account = item.account ? `${item.account},${itemList.account}` : itemList.account;
          //   item.remark = item.remark ? `${item.remark},${itemList.remark}` : itemList.remark;
          //   item.bank = item.bank ? `${item.bank},${itemList.bank}` : itemList.bank;
          // }
          // })
          // });

          DownTable([...chargeList, ...arr], DownHeader.PayHeader, '缴费信息', 'charge');
          // }
          // });


        }
      })
  } else {
    DownTable(arr, DownHeader.PayHeader, '缴费信息', 'charge');
  }

}

export default convertCurrency;
