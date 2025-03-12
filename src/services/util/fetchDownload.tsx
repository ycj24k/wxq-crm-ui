import { message } from 'antd';

let tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
let obj = {};
obj[tokenName] = tokenValue;
const fetchDownload = (
  url: string,
  id: string | number,
  type: any = undefined,
  doc: string = '.doc',
) => {
  let url2 = '';
  if (type) {
    url2 = url + '?id=' + id;
    Object.keys(type).forEach((key) => {
      url2 = url2 + `&${key}=` + type[key];
    });
  } else {
    url2 = url + '?id=' + id;
  }

  fetch(url2, {
    method: 'GET',
    headers: { ...obj },
  }).then((res: any) => {
    res.blob().then((ress: any) => {
      let blob;
      blob = new Blob([ress], { type: 'text/piain' });
      var reader: any = new FileReader();
      reader.readAsText(blob, 'utf-8');
      reader.onload = function () {
        if (reader.result.indexOf('error') > 0) {
          const err = JSON.parse(reader.result);
          message.error(err.msg);
          return;
        } else {
          let blobUrl = window.URL.createObjectURL(ress);
          const a = document.createElement('a'); //获取a标签元素
          document.body.appendChild(a);
          let filename = '附件' + doc; //设置文件名称
          a.href = blobUrl; //设置a标签路径
          a.download = filename;
          a.target = '_blank';
          a.click();
          a.remove();
        }
      };
    });
  });
};

export default fetchDownload;
