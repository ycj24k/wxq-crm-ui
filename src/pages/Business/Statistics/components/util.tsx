import Dictionaries from '@/services/util/dictionaries';
const contentData = (content: any) => {
  let arr2: any = []; //
  let arr3: any = { amount: 0, num: 0 }; //饼图业绩和人数
  let arr4: any = []; //业绩排名
  let arrProject: any = [];
  content.forEach((item: any) => {
    if (arrProject.indexOf(item.project) == '-1') {
      arrProject.push(item.project);
    }
    let a = item.project ? item.project.split(',') : [''];
    let dataItem = {
      project: Dictionaries.getCascaderName('dict_reg_job', a[0]),
      amount: item.amount,
      num: item.quantity ? item.quantity : 1,
      name: item.userName,
      userId: item.userId,
    };
    if (arr2.length > 0) {
      let filterValue = arr2.filter((v: any) => {
        return v.project == dataItem.project;
      });
      let filterName = arr4.filter((v: any) => {
        return v.name == dataItem.name;
      });

      if (filterName.length > 0) {
        arr4.forEach((f: any) => {
          if (f.name == filterName[0].name) {
            f.amount = dataItem.amount + filterName[0].amount;
          }
        });
      } else {
        arr4.push({ name: item.userName, amount: item.amount, userId: item.userId });
      }
      if (filterValue.length > 0) {
        arr2.forEach((n: any) => {
          if (n.project == filterValue[0].project) {
            n.amount = filterValue[0].amount + dataItem.amount;
            if (n.quantity) {
              n.num = n.num + n.quantity;
            } else {
              n.num = n.num + 1;
            }

            arr3.amount = arr3.amount + dataItem.amount;
            arr3.num = arr3.num + dataItem.num;
          }
        });
      } else {
        arr2.push(dataItem);
        arr3.amount = arr3.amount + dataItem.amount;
        arr3.num = arr3.num + dataItem.num;
      }
    } else {
      arr2.push(dataItem);
      arr3.amount = arr3.amount + dataItem.amount;
      arr3.num = arr3.num + dataItem.num;
      arr4.push({ name: item.userName, amount: item.amount, userId: item.userId });
    }
  });
  arr4.sort((a: any, b: any) => {
    return b.amount - a.amount;
  });
  if (arr3.num) arr3.num = eval(arr3.num.toString().split('').join('+'));

  return { arr2, arr3, arr4, arrProject };
};

export default contentData;
