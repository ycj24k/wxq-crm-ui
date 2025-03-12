let tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
let obj = {};
obj[tokenName] = tokenValue;

const ImgUrl = async (url: string, id: number, str: string, upDownType: string = 'look') => {
  let arr = str.split(',');
  let arr1: any = [];
  let Url: any = {
    pdfUrl: [],
    imgUrl: [],
  };
  arr.forEach((item: any) => {
    arr1.push(
      new Promise((resolve) => {
        fetch(url + '?id=' + id + '&fileName=' + item, {
          method: 'GET',
          headers: { ...obj, 'Content-Type': 'application/x-www-form-urlencoded' },
        }).then((res: any) => {
          res.blob().then((ress: any) => {
            if (upDownType == 'look') {
              let blob;
              if (item.indexOf('pdf') >= 0) {
                blob = new Blob([ress], { type: 'application/pdf;charset=utf-8' });
              } else {
                blob = new Blob([ress]);
              }
              let reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onload = (e) => {
                resolve(reader.result);
              };
            } else {
              let blobUrl = window.URL.createObjectURL(ress);
              const a = document.createElement('a'); //获取a标签元素
              document.body.appendChild(a);
              let filename = '附件'; //设置文件名称
              a.href = blobUrl; //设置a标签路径
              a.download = filename;
              a.target = '_blank';
              a.click();
              a.remove();
            }
          });
        });
      }),
    );
  });
  const res_1 = await Promise.all(arr1);
  res_1.forEach((item_1: any) => {
    if (item_1.indexOf('application/pdf') >= 0) {
      Url.pdfUrl.push(item_1);
    } else {
      Url.imgUrl.push(item_1);
    }
  });

  return Url;
};

export default ImgUrl;
