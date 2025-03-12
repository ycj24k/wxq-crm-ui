import { message, Modal } from "antd";
import { history } from "umi";
import apiRequest from "../ant-design-pro/apiRequest";

export function judgeDivisor(m: any, n: any) {
  var num = {};
  var i = 0;
  var x: any = parseInt(m / n);
  m = m % n;
  var result = '';
  while (m != 0 && !(m in num)) {
    num[m] = i++;
    result += parseInt((m * 10) / n);
    m = (m * 10) % n;
  }
  return m == 0;
}

export function biuldDataFromExcelJson(data: any) {
  const keys = data[0];
  const objs: any = []
  data.slice(2).forEach((val: any) => {
    const obj = {}
    keys.forEach((key: string, i: number) => {
      obj[key] = val[i]
    })
    objs.push(obj)
  })
  return objs;
}

export function deleteUndefined(data: any) {
  for (const key in data) {
    if (data[key] === undefined) delete data[key]
  }
}

export function getSession() {
  const user = JSON.parse(sessionStorage.getItem('userInfo') as string)?.data
  if (!user) return
  let loading = false
  setInterval(() => {
    if (loading) return
    loading = true
    apiRequest.get("/sms/business/bizCharge", { confirm: false, isSubmit: false, enable: true, type: 0, createBy: user.id }).then(res => {
      if (res.status != 'success') return
      if (res.data && res.data.content && res.data.content.length > 0) {
        Modal.confirm({
          // title: '尚未上传企业授权信息!',
          content: <p>您有缴费审核未通过，请前往重新提交</p>,
          okText: '前往重新提交',
          cancelText: '我知道了',
          onOk() {
            loading = false
            history.push('/business/businesscharge/list')
          },
          onCancel() {
            loading = false
          }
        })
      }
    })
  }, 1000 * 60 * 10)
}