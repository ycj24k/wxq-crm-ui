import { message } from 'antd';
import moment from 'moment';

import ExportJsonExcel from 'js-export-excel';
import Dictionaries from './dictionaries';
import dictionaries from './dictionaries';
//data 为所需要导出的表格数据
//dataTables {key:value} key 为表头数据， value 为每一列data表格的key
//type为区分，后端很多地方使用了type 在取值时做区分使用
const DownTable = (
  data: any[],
  dataTables: {},
  fileName: string = '导出信息',
  type: any = null,
) => {
  if (data.length == 0) {
    message.error('没有选中数据导出');
    return;
  }

  let option: any = { fileName: '', datas: [] };
  let dataTable = [];
  let header: any[] = [];
  // const headerTables = []
  Object.keys(dataTables).forEach((item: any) => {
    header.push(item);
  });
  const IsTrue = ['hasReferrer', 'isConfirm', 'isCalculation', 'isReset', 'enable', 'hasChild', 'isOver'];
  const actions = {
    studentNames: (data: any) => {
      if (data.studentType != 0 && data.studentType != null) {
        return data.name;
      }
    },
    //项目总称
    project: (data: any) => {
      let str = ''
      if (data.project) str = Dictionaries.getCascaderAllName('dict_reg_job', data.project)
      return str;
    },
    //成交项目总称
    dealProject: (data: any) => {
      let str = ''
      if (data.dealProject) str = Dictionaries.getCascaderAllName('dict_reg_job', data.dealProject)
      return str;
    },
    //证书种类
    kind: (data: any) => {
      let str = ''
      if (data.kind || data.kind === 0) str = Dictionaries.getName('certificateKind', data.kind)
      return str;
    },
    hasInvoice: (data: any) => {
      let str = data.hasInvoice ? '是' : '否'
      return str
    },
    //项目岗位
    projects: (data: any) => {
      let str = ''
      if (data.project) str = Dictionaries.getCascaderName('dict_reg_job', data.project);
      return str
    },
    //成交项目岗位
    dealProjects: (data: any) => {
      let str = ''
      if (data.dealProject) str = Dictionaries.getCascaderName('dict_reg_job', data.dealProject);
      return str
    },
    invoiceProductType: (data: any) => {
      return Dictionaries.getName('invoiceProductType', data.invoiceProductType);
    },
    post: (data: any) => {
      return Dictionaries.getName('Recruitment_Positions', data.post);
    },
    invoiceType: (data: any) => {
      let str = '';
      if (!data.invoiceType) {
        return ''
      }
      if (type == 'charge') {
        // str = Dictionaries.getName('invoiceType', data.invoiceType);
        if (data.invoiceType.indexOf(',') >= 0) {
          let arr = data.invoiceType.split(',')
          arr.forEach((item: any) => {
            str = str + Dictionaries.getName('invoiceType', item) + ','
          })
        } else {
          str = Dictionaries.getName('invoiceType', data.invoiceType)
        }
      }
      if (type == 'chargeInvoice') {
        str = Dictionaries.getName('invoiceType', data.type);
      }
      return str;
    },
    percent: (data: any) => {
      let str = '';
      if (type == 'charge' && data.ownerName != null && data.percent != null) {
        if (data.percent != null) {
          str = (data.percent * 100) + '%'
        }
      }
      return str;
    },
    percentAmount: (data: any) => {
      let str = null;
      if (type == 'charge' && data.ownerName != null && data.percent != null) {
        if (data.percent != null) {
          str = data.percent * data.amount
        }
      }
      return str;
    },
    // productType: (data: any) => {
    //   let str = ''
    //   if (!data.productType) {
    //     return ''
    //   }
    //   if (data?.productType?.indexOf(',') >= 0) {
    //     let arr = data.productType.split(',')
    //     arr.forEach((item: any) => {
    //       str = str + Dictionaries.getName('invoiceProductType', item) + ','
    //     })
    //   } else {
    //     str = Dictionaries.getName('invoiceProductType', data.productType)
    //   }
    //   return str;
    // },
    productType: (data: any) => {
      return Dictionaries.getName('invoiceProductType', data.productType);
    },
    childSeller: (data: any) => {
      const str = data.childSeller.length > 2 ? data.childSeller : Dictionaries.getName('companyInfo', data.childSeller)
      return str;
    },
    method: (data: any) => {
      return Dictionaries.getName('dict_stu_refund_type', data.method);
    },
    isUseUp: (data: any) => {
      let str = ''
      if (type == 'chargeLog') str = data.isUseUp ? '已下单' : '未下单';
      return str
    },

    provider: (data: any) => {
      let str = ''
      str = Dictionaries.getDepartmentUserName(data.provider)
      return str;
    },
    sex: (data: any) => {
      let str = data.sex === false ? '男' : data.sex === true ? '女' : '未知'

      return str;
    },
    chargeMethod: (data: any) => {
      let str = '';
      if (data.chargeMethod) {
        str = data.chargeMethod.split(',').map((item: String) => Dictionaries.getName('dict_stu_refund_type', item)).join(',')
      }
      return str;
    },
    type: (data: any) => {
      let str = '';
      if (type == 'student') {
        str = Dictionaries.getName('studentType', data.type);
      } else if (type == 'charge' || type == 'refund') {
        str = Dictionaries.getCascaderName('chargeType', data.type);
        if (data.amount) {
          data.amount = [1, 3].includes(data.type) ? -data.amount : data.amount;
        }
        if (data.performanceAmount) {
          data.performanceAmount = [1, 3].includes(data.type) ? -data.performanceAmount : data.performanceAmount;
        }
        if (data.commissionBase) {
          data.commissionBase = [1, 3].includes(data.type) ? -data.commissionBase : data.commissionBase;
        }
      } else if (type == 'invoice') {
        str = Dictionaries.getName('invoiceType', data.type);
      }
      return str;
    },
    studentType: (data: any) => {
      let str = '';
      str = Dictionaries.getName('studentType', data.studentType);
      return str;
    },
    refundType: (data: any) => {
      return Dictionaries.getName('dict_refundType', data.refundType);
    },
    paymentTime: (data: any) => {
      let str = ''
      if (data.paymentTime) str = moment(data.paymentTime).format('YYYY-MM-DD HH:mm:ss')
      return str;
    },
    birthday: (data: any) => {
      return moment(data.birthday).format('YYYY-MM-DD');
    },
    entryTime: (data: any) => {
      let str = data.entryTime ? moment(data.entryTime).format('YYYY-MM-DD') : ''

      return str;
    },
    formalTime: (data: any) => {
      return moment(data.formalTime).format('YYYY-MM-DD ');
    },
    turnoverTime: (data: any) => {
      return moment(data.turnoverTime).format('YYYY-MM-DD ');
    },
    otherSignTime: (data: any) => {
      return moment(data.otherSignTime).format('YYYY-MM-DD ');
    },
    createTime: (data: any) => {
      return moment(data.createTime).format('YYYY-MM-DD');
    },
    confirmTime: (data: any) => {
      return moment(data.confirmTime).format('YYYY-MM-DD');
    },
    chargeTime: (data: any) => {
      let str = ''
      if (data.chargeTime) str = moment(data.chargeTime).format('YYYY-MM-DD');
      return str
    },
    time: (data: any) => {
      let str = ''

      if (data.time) str = moment(data.time).format('YYYY-MM-DD');
      // if (type == 'recruit' || type == 'charge') str = data.time ? moment(data.time).format('YYYY-MM-DD') : ''
      return str
      // return moment(data.chargeTime).format('YYYY-MM-DD');
    },
    classType: (data: any) => {
      return Dictionaries.getName('dict_class_type', data.classType);
    },
    classYear: (data: any) => {
      return Dictionaries.getName('dict_class_year', data.classYear);
    },
    examType: (data: any) => {
      return Dictionaries.getName('dict_exam_type', data.examType);
    },
    level: (data: any) => {
      return Dictionaries.getName('ProfessionalTitle', data.level);
    },
    // performanceAmount: (data: any) => {
    //   let str = data.performanceAmount + ''
    //   if (type == 'refund') str = -data.performanceAmount + ''
    //   return str
    // },
    // commissionBase: (data: any) => {
    //   let str = data.commissionBase + ''
    //   if (type == 'refund') str = -data.commissionBase + ''
    //   return str
    // },
    degree: (data: any) => {
      return Dictionaries.getName('dict_education', data.degree);
    },
    interviewer: (data: any) => {
      return Dictionaries.getDepartmentUserName(data.interviewer);
    },
    ethnic: (data: any) => {
      return Dictionaries.getName('dict_nation', data.ethnic);
    },
    officeAddress: (data: any) => {
      return Dictionaries.getName('officeLocation', data.officeAddress);
    },
    formalAppearance: (data: any) => {
      return Dictionaries.getName('PoliticalLandscape', data.formalAppearance);
    },
    isComplete2: (data: any) => {
      return data.isComplete2 ? '齐全' : '不齐全';
    },
    isComplete: (data: any) => {
      return data.isComplete ? '齐全' : '不齐全';
    },
    isSubmit: (data: any) => {
      return data.isSubmit ? '通过' : '未通过';
    },
    status: (data: any) => {
      let str = '';
      if (type == 'user') {
        str = Dictionaries.getName('onJobStatus', data.status)
      } else if (type == 'recruit') {
        switch (data.status) {
          case 0:
            str = '初试';
            break
          case 1:
            str = '复试';
            break
          case 2:
            str = '储备';
            break
          case 3:
            str = '通过等待回复';
            break
          case 4:
            str = '通过';
            break
          case 5:
            str = '不通过/失联';
            break
          case 6:
            str = '已入职';
            break
        }
      }
      else {
        if (data.status == 2) {
          str = '已缴完';
        } else if (data.status == 1) {
          str = '未缴完';
        } else {
          str = '未缴费';
        }
      }

      return str;
    },
    //部门
    departmentId: async (data: any) => {
      let str = ''
      if (data.departmentId) {
        let depart = await Dictionaries.getDepartmentName(data.departmentId);
        const departs = await depart.splice(0, depart.length - 1).reverse();
        str = departs.join('-')
      }

      return str;
    },
    //根据用户id获取部门
    userNamedepartment: async (data: any) => {

      let depart = await Dictionaries.getDepartmentNames(data.userId);
      const departs = await depart.splice(0, depart.length - 1).reverse();
      return departs.join('-');
    },
    providerDepartment: async (data: any) => {
      let depart = await Dictionaries.getDepartmentNames(data.provider);
      const departs = await depart.splice(0, depart.length - 1).reverse();
      return departs.join('-');
    },
    //来源
    source: (data: any) => {
      let str = '';
      if (type == 'payment') {
        str = Dictionaries.getName('dict_stu_refund_type', data.source);
      } else if (type == 'recruit') {
        str = Dictionaries.getName('Recruitment_channels', data.source);
      } else {
        str = Dictionaries.getName('dict_source', data.source);
      }
      return str;
    },
    //学员来源
    studentSource: (data: any) => {
      let str = '';
      if (data.source) str = Dictionaries.getName('dict_source', data.source);
      return str;
    },
    chargeAccount: (data: any) => {
      let str = '';
      if (data.chargeAccount) {
        str = (data.chargeAccount + '').split(',').map((item: String) => Dictionaries.getName('dict_stu_refund_type', item)).join(',')
      }
      return str;
    },
  };
  IsTrue.forEach((item: any) => {
    actions[item] = (data: any) => {
      let str = data[item] ? '是' : '否';
      return str;
    };
  });
  if (data) {

    for (let i in data) {
      if (data) {
        let obj: any = {};
        Object.keys(dataTables).forEach(async (item: any) => {
          if (actions[dataTables[item]]) {
            obj[item] = await actions[dataTables[item]](data[i]);
          } else {
            obj[item] = data[i][dataTables[item]];
          }
        });
        dataTable.push(obj);
      }
    }
  }
  option.fileName = fileName; //导出的Excel 文件名
  option.datas = [
    {
      sheetData: dataTable,
      sheetName: 'sheet',
      sheetFilter: header,
      sheetHeader: header, //表头
    },
  ];

  setTimeout(() => {
    var toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  }, 1000);
};

export default DownTable;
