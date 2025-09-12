const tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
const tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
const obj = {};
obj[tokenName] = tokenValue;

const UpDownload = async (url: string, id: number, str: string, upDownType: string = 'look') => {
  return new Promise((resolve) => {
    fetch(url + '?id=' + id + '&fileName=' + str, {
      method: 'GET',
      headers: { ...obj },
    }).then((res: any) => {
      res.blob().then((ress: any) => {
        if (upDownType == 'look') {
          console.log('进入look');

          // let blob;
          // if (str.indexOf('pdf') >= 0) {
          //   blob = new Blob([ress], { type: 'application/pdf;charset=utf-8' });
          // } else if (str.indexOf('xlsx') >= 0 || str.indexOf('xls') >= 0) {
          //   blob = new Blob([ress], {
          //     type: 'application/vnd.ms-excel',
          //   });
          // } else if (
          //   str.indexOf('doc') >= 0 ||
          //   str.indexOf('docx') >= 0 ||
          //   str.indexOf('word') >= 0
          // ) {
          //   blob = new Blob([ress], {
          //     type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          //   });
          // } else {
          //   blob = new Blob([ress]);
          // }
          // console.log(URL.createObjectURL(blob))
          if (str.indexOf('.pdf') >= 0) resolve(URL.createObjectURL(ress))
          const reader = new FileReader();
          reader.readAsDataURL(ress);
          reader.onload = (e) => {
            resolve(e.target?.result);
          };
        } else {
          const blobUrl = window.URL.createObjectURL(ress);
          const a = document.createElement('a'); //获取a标签元素
          document.body.appendChild(a);
          const filename = upDownType; //设置文件名称
          a.href = blobUrl; //设置a标签路径
          a.download = filename;
          a.target = '_blank';
          console.log(blobUrl);

          resolve(blobUrl);
          a.click();
          a.remove();
        }
      });
    });
  });
};

export default UpDownload;
