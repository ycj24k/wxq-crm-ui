import request from '../ant-design-pro/apiRequest';
import { message, Select } from 'antd';
import { values } from 'lodash';
import { useModel } from 'umi';
const { Option } = Select;
class dictionaries {
  version: string | null;
  dictionariesList: never[];
  list: any;
  departmeng: any;
  contentNews: string | null;
  constructor() {
    this.dictionariesList = [];
    this.version = localStorage.getItem('version');
    this.list = JSON.parse(localStorage.getItem('dictionariesList') as any);
    this.departmeng = '';
    this.contentNews = JSON.parse(localStorage.getItem('contentNews') as any);
  }
  //获取、储存字典
  get() {
    request.get('/sms/share/getDict').then((res: any) => {
      localStorage.removeItem('dictionariesList');
      this.dictionariesList = res.data;

      localStorage.setItem('dictionariesList', JSON.stringify(res.data));
    });
  }
  //获取通知
  getBizNotice() {
    request.get('/sms/business/bizNotice').then((res: any) => {
      sessionStorage.removeItem('bizNotice');
      sessionStorage.setItem('bizNotice', JSON.stringify(res));
    });
  }
  //根据code 和值 返回对应的名称
  getName(value: string, data?: any) {
    let arr: any[] = [];
    // const children: any[] = [];
    let str: string = '';
    if (!this.list) this.list = JSON.parse(localStorage.getItem('dictionariesList') as string);
    this.list?.forEach((item: any) => {
      if (item.code == value) {
        arr.push(item);
      }
    });

    if (arr.length == 0) {
      return '字典缺失';
    }
    arr[0].children?.forEach((item: any, index: number) => {
      if (item.value == data) str = item.name;
    });

    return str;
  }
  getDepartmentName(value: number = 49) {
    if (value == -1) {
      return ['无']
    } else {
      let list = JSON.parse(localStorage.getItem('Department') as string);
      if (!list) {
        request.get('/sms/share/getDepartmentAndUser').then((res) => {
          localStorage.setItem('Department', JSON.stringify(res.data));
          this.getDepartmentName(value);
          return;
        });
      }
      let departments: any = [];

      function getParentId(list: any, id: any) {
        for (let i in list) {
          if (list[i].id === id) {
            return [list[i]];
          }
          if (list[i].children != null) {
            let node: any = getParentId(list[i].children, id);
            if (node !== undefined) {
              return node.concat(list[i]);
            }
          }
        }
      }
      const department = getParentId(list, value);
      department?.forEach((item: any, index: number) => {
        if (item.departmentName) {
          departments.push(item.departmentName);
        }
      });

      return departments;
    }

  }
  //获取部门员工
  getDepartmentList(value: number) {
    value = value || JSON.parse(sessionStorage.getItem('userInfo') as string).data.id
    let list = JSON.parse(localStorage.getItem('Department') as string);
    if (!list) {
      request.get('/sms/share/getDepartmentAndUser').then((res) => {
        localStorage.setItem('Department', JSON.stringify(res.data));
        this.getDepartmentName(value);
        return;
      });
    }
    let departments: any = []
    function getDepartmens(list, parent) {
      for (let i in list) {
        // console.log('list', list[i], value);

        if (list[i].userId == value) {
          return parent;
        }
        if (list[i].children != null) {
          let node: any = getDepartmens(list[i].children, parent);
          if (node !== undefined) {

            return parent;
          }
        }
      }
    }
    list.forEach(async (item: any) => {
      if (item.departmentName == '汇德教育') {
        departments = item.children
      }
    });
    if (departments.length > 0) {
      let arr = undefined
      for (let i = 0; i < departments.length; i++) {
        arr = getDepartmens([departments[i]], departments[i])
        if (arr) return arr

      }

    }


  }
  //根据招生老师id获取部门
  getDepartmentNames(value: number = 2) {
    let list = JSON.parse(localStorage.getItem('Department') as string);
    if (!list) {
      request.get('/sms/share/getDepartmentAndUser').then((res) => {
        localStorage.setItem('Department', JSON.stringify(res.data));
        this.getDepartmentName(value);
        return;
      });
    }
    let departments: any = [];

    function getParentId(list: any, id: any) {
      for (let i in list) {
        if (list[i].userId == id) {
          return [list[i]];
        }
        if (list[i].children != null) {
          let node: any = getParentId(list[i].children, id);
          if (node !== undefined) {
            return node.concat(list[i]);
          }
        }
      }
    }
    const department = getParentId(list, value);
    department?.forEach((item: any, index: number) => {
      if (item.departmentName) {
        departments.push(item.departmentName);
      }
    });

    return departments;
  }
  //根据招生老师id获取部门id
  getDepartmentNamesId(value: number = 2) {
    let list = JSON.parse(localStorage.getItem('Department') as string);
    if (!list) {
      request.get('/sms/share/getDepartmentAndUser').then((res) => {
        localStorage.setItem('Department', JSON.stringify(res.data));
        this.getDepartmentName(value);
        return;
      });
    }
    let departments: any = [];

    function getParentId(list: any, id: any) {
      for (let i in list) {
        if (list[i].userId == id) {
          return [list[i]];
        }
        if (list[i].children != null) {
          let node: any = getParentId(list[i].children, id);
          if (node !== undefined) {
            return node.concat(list[i]);
          }
        }
      }
    }
    const department = getParentId(list, value);
    department?.forEach((item: any, index: number) => {
      if (item.id) {
        departments.push(item.id);
      }
    });

    return departments[departments.length - 2];
  }
  //获取所有部门
  getDepartmentTree(list: Array<any> = [], parent: any = {}) {
    if (list.length == 0) {
      list = JSON.parse(localStorage.getItem('Department') as string)
      if (!list) {
        request.get('/sms/share/getDepartmentAndUser').then((res) => {
          console.log(res.data)
          list = res.data
          localStorage.setItem('Department', JSON.stringify(list));
        });
      }
    }
    return list.filter(val => !val.userId).map(val => {
      val.departmentName = (parent.departmentName ? parent.departmentName + '-' : '') + val.departmentName
      // val.id = (parent.id ? parent.id + ',' : '') + val.id
      val.title = val.departmentName
      val.value = val.id
      if (val.children && val.children.length > 0) {
        val.children = this.getDepartmentTree(val.children, val)
        val.children.forEach((child: any) => {
          val.value = val.value + ',' + child.value
        });
      }
      return val
    })
  }
  //根据姓名获取id
  getUserId(value: string = '秘嘉赛') {
    let list = JSON.parse(localStorage.getItem('Department') as string);
    if (!list) {
      request.get('/sms/share/getDepartmentAndUser').then((res) => {
        localStorage.setItem('Department', JSON.stringify(res.data));
        this.getUserId(value);
        return;
      });
    }
    const departments: any = []
    function getParentId(list: any, id: any) {
      for (let i in list) {
        if (list[i].name === id && list[i].enable) {
          departments.push(list[i].userId)
        }
        if (list[i].children != null) {
          getParentId(list[i].children, id)
          // let node: any = getParentId(list[i].children, id);
          // if (node !== undefined) {
          //   return node.concat(list[i]);
          // }
        }
      }
    }
    getParentId(list, value);



    return departments;
  }
  //根据id获取姓名
  getDepartmentUserName(value: number, type = 'user') {
    let list = JSON.parse(localStorage.getItem('Department') as string);
    // if (!list) {
    //   request.get('/sms/share/getDepartmentAndUser').then((res) => {
    //     localStorage.setItem('Department', JSON.stringify(res.data));
    //     this.getDepartmentName(value);
    //     return;
    //   });
    // }
    let departments: any = '';

    function getParentId(list: any, id: any) {
      for (let i in list) {
        if (list[i].userId === id && type == 'user') {
          return [list[i]];
        }
        if (list[i].id == id && type == 'Dep') {


          return [list[i]];
        }
        if (list[i].children != null) {
          let node: any = getParentId(list[i].children, id);
          if (node !== undefined) {
            return node.concat(list[i]);
          }
        }
      }
    }
    const department = getParentId(list, value);

    if (type == 'user') {
      department?.forEach((item: any, index: number) => {
        if (item.userId) {
          departments = item.name;
        }
      });
    } else {
      department?.forEach((item: any, index: number) => {
        if (item.id && item.parentId != -1) {
          departments = item.departmentName;
        }
      });
    }


    return departments;
  }
  //批量导入时获取项目的value
  getProjectValue(value: string, ParentName: string, children?: string) {
    let arr: any[] = [];
    // const children: any[] = [];
    let str: string = '';
    if (!this.list) this.list = JSON.parse(localStorage.getItem('dictionariesList') as string);
    this.list?.forEach((item: any) => {
      if (item.code == value) {
        item.children.forEach((itemParent: any) => {
          if (itemParent.name == ParentName) {
            itemParent.children.forEach((itemChildren: any) => {
              if (itemChildren.name == children) str = itemChildren.value;
            });
          }
        });
      }
    });
    return str;
  }
  //更具字典 和 名称 获取 对应的value
  getValue(value: string, data?: any) {
    let arr: any[] = [];
    // const children: any[] = [];
    let str: string = '';
    if (!this.list) this.list = JSON.parse(localStorage.getItem('dictionariesList') as string);
    this.list?.forEach((item: any) => {
      if (item.code == value) {
        arr.push(item);
      }
    });

    if (arr.length == 0) {
      return '字典缺失';
    }
    arr[0].children?.forEach((item: any, index: number) => {
      if (item.name == data) str = item.value;
    });

    return str;
  }
  //更具字典 和 名称 获取 对应的Descriptio
  getDescription(value: string, data?: any) {
    let arr: any[] = [];
    // const children: any[] = [];
    let str: string = '';
    if (!this.list) this.list = JSON.parse(localStorage.getItem('dictionariesList') as string);
    this.list?.forEach((item: any) => {
      if (item.code == value) {
        arr.push(item);
      }
    });

    if (arr.length == 0) {
      return '字典缺失';
    }
    arr[0].children?.forEach((item: any, index: number) => {
      if (item.value == data) str = item.description;
    });

    return str;
  }
  //更加id查询 目前只能查顶级
  getIdName(id: number) {
    let str = '';
    if (!this.list) this.list = JSON.parse(localStorage.getItem('dictionariesList') as string);
    this.list?.forEach((item: any) => {
      if (item.id == id) {
        str = item.name;
      }
    });
    return str;
  }
  //返回字典存储的正则表达式
  getRegex(data?: string) {
    let arr: any[] = [];
    // const children: any[] = [];
    let str: string = '';
    if (!this.list) this.list = JSON.parse(localStorage.getItem('dictionariesList') as string);
    this.list?.forEach((item: any) => {
      if (item.code == 'regex') {
        arr.push(item);
      }
    });
    if (!arr[0]?.children) return;
    arr[0].children?.forEach((item: any, index: number) => {
      if (item.code == data) str = item.value;
    });

    return eval(`/${str}/`);
  }
  getTreeA(value: string = '') {
    if (value != '') {
      let arr: any[] = [];
      if (!this.list) this.list = JSON.parse(localStorage.getItem('dictionariesList') as string);
      this.list?.forEach((item: any) => {
        if (item.code == value) {
          arr.push(item);
        }
      });
      if (arr.length == 0) return;
      return arr;
    } else {
      return;
    }
  }
  getTree(value: string) {
    const arr = this.getTreeA(value);
    let arr1: { name: string; userId: number | string; children?: any }[] = [];
    function arrTree(data: any) {
      let arr2: any = [];
      data?.forEach((item: any) => {
        let arr3: { name: string; userId: number | string; children?: any }[] = [];
        if (item.children) {
          arr3 = arrTree(item.children);
        }
        if (arr3.length > 0) {
          arr2.push({ name: item.name, userId: item.value, children: arr3, id: item.id });
        } else {
          arr2.push({ name: item.name, userId: item.value, id: item.id });
        }
      });
      return arr2;
    }
    arr1 = arrTree(arr);
    return arr1;
  }

  //根据code 返回对应的下拉选项lable 名称 value 值 不传值返回当前字典所有父级
  getList(value: string = '', data?: string, type = true, enable = true) {
    if (value != '') {
      let arr: any[] = [];
      const children: any[] = [];
      const ProChildren: any[] = [];
      if (!this.list) this.list = JSON.parse(localStorage.getItem('dictionariesList') as string);
      this.list?.forEach((item: any) => {
        if (item.code == value) {
          arr.push(item);
        }
      });

      if (arr.length == 0) return;
      if (type) {
        if (data) {
          arr[0].children?.forEach((items: any, indexs: number) => {
            if (items.value == data) {
              items.children?.forEach((item: any, index: number) => {
                children.push(
                  <Option key={index} value={item.value}>
                    {item.name}
                  </Option>,
                );
                ProChildren.push({ label: item.name, value: item.value });
              });
            }
          });
        } else {
          arr[0].children?.forEach((item: any, index: number) => {
            if (item.enable == enable) {
              children.push(
                <Option key={index} value={item.value}>
                  {item.name}
                </Option>,
              );
              ProChildren.push({ label: item.name, value: item.value });
            }
          });
        }
      } else {
        if (data) {
          arr[0].children?.forEach((items: any, indexs: number) => {
            if (items.value == data) {
              items.children.forEach((item: any, index: number) => {
                children.push(
                  <Option key={index} value={item.name}>
                    {item.name}
                  </Option>,
                );
                ProChildren.push({ label: item.name, value: item.name });
              });
            }
          });
        } else {
          arr[0].children?.forEach((items: any, indexs: number) => {

            children.push(
              <Option key={indexs} value={items.name}>
                {items.name}
              </Option>,
            );
            ProChildren.push({ label: items.name, value: items.name });

          });
        }

      }

      return ProChildren;
    } else {
      const children: any[] = [];
      if (!this.list) this.list = JSON.parse(localStorage.getItem('dictionariesList') as string);
      this.list?.forEach((item: any, index: number) => {
        children.push({ label: item.name, value: item.code });
      });

      return children;
    }
  }

  //省市联动类型
  getCascader(value: string) {
    let arr: any = [];
    let cascader: any = [];
    const CascaderList = (arrList: any) => {
      let arr2: any = [];
      arrList?.forEach((item: any) => {
        let arr3: any = [];
        if (item.children) {
          arr3 = CascaderList(item.children);
        }
        if (arr3.length > 0) {
          arr2.push({ label: item.name, value: item.value, children: arr3, key: item.id });
        } else {
          arr2.push({ label: item.name, value: item.value, key: item.id });
        }
      });

      return arr2;
    };

    if (!this.list) this.list = JSON.parse(localStorage.getItem('dictionariesList') as string);
    this.list?.forEach((item: any) => {
      if (item.code == value) {
        arr.push(item);
      }
    });

    cascader = CascaderList(arr);
    // if (!cascader[0].children) return;

    if (cascader.length == 0) return;
    return cascader[0].children;
  }
  //省市联动类型Id
  getCascaderId(value: string) {
    let arr: any = [];
    let cascader: any = [];
    const CascaderList = (arrList: any) => {
      let arr2: any = [];
      arrList?.forEach((item: any) => {
        let arr3: any = [];
        if (item.children) {
          arr3 = CascaderList(item.children);
        }
        if (arr3.length > 0) {
          arr2.push({ label: item.name, value: item.id, children: arr3, key: item.id });
        } else {
          arr2.push({ label: item.name, value: item.id, key: item.id });
        }
      });

      return arr2;
    };

    if (!this.list) this.list = JSON.parse(localStorage.getItem('dictionariesList') as string);
    this.list?.forEach((item: any) => {
      if (item.code == value) {
        arr.push(item);
      }
    });

    cascader = CascaderList(arr);
    // if (!cascader[0].children) return;

    if (cascader.length == 0) return;
    return cascader[0].children;
  }
  //表格搜索格式
  getCascaderSearch(value: string) {
    let arr: any = [];
    let cascader: any = [];
    const CascaderList = (arrList: any) => {
      let arr2: any = [];
      arrList?.forEach((item: any) => {
        let arr3: any = [];
        if (item.children) {
          arr3 = CascaderList(item.children);
        }
        if (arr3.length > 0) {
          arr2.push({ field: item.name, value: item.value, language: arr3 });
        } else {
          arr2.push({ field: item.name, value: item.value });
        }
      });

      return arr2;
    };
    if (!this.list) this.list = JSON.parse(localStorage.getItem('dictionariesList') as string);
    this.list?.forEach((item: any) => {
      if (item.code == value) {
        arr.push(item);
      }
    });

    cascader = CascaderList(arr);
    // if (!cascader[0].children) return;

    if (cascader.length == 0) return;

    return cascader[0].language;
  }
  getCascaderName(value: string, data: string) {
    let arr: any = this.getCascader(value);
    let cascader: any = [];
    let str = '';
    const CascaderList = (arrList: any) => {
      arrList?.forEach((item: any) => {
        let arr3: any = [];
        if (item.children) {
          arr3 = CascaderList(item.children);
        }
        cascader.push(item);
      });
      // return arr2;
    };
    CascaderList(arr);
    cascader?.forEach((item: any) => {
      if (item.value == data) {
        str = item.label;
      }
    });

    return str;
  }
  /**
   *
   * @param value 字典名称
   * @param data project
   * @returns 通过project 查找对应的项目总称
   */
  getCascaderAllName = (value: string, data: string, type: string = 'label') => {
    let arr: any = this.getCascader(value);
    let cascader: any = [];
    let str = '';
    const CascaderList = (arrList: any, a?: any) => {
      arrList?.forEach((item: any) => {
        let arr3: any = [];
        if (item.children) {
          arr3 = CascaderList(item.children, item);
        }
        if (item.value == data && a) {
          cascader.push(a);
        }
        if (item.value == data && !a) {
          cascader.push(item);
        }

        // cascader.push(item);
      });
      // return cascader;
    };

    CascaderList(arr);
    if (cascader[0]) {
      if (type == 'label') {
        return cascader[0].label;
      } else if (type == 'value') {
        return cascader[0].value;
      }
    }
  };
  getCascaderValue(value: string, data: string, names?: string) {
    let arrList: any = this.getCascader(value);
    const findIndexArray = (list: any, data: string, indexArray: any) => {
      // 根据自身节点寻找父级
      let arr = Array.from(indexArray);
      for (let i = 0, len = list.length; i < len; i++) {
        arr.push(list[i]);
        if (list[i].value === data) {
          return arr;
        }
        let children = list[i].children;
        if (children && children.length) {
          let result: any = findIndexArray(children, data, arr);
          if (result) return result;
        }
        arr.pop();
      }
      return false;
    };

    let name = findIndexArray(arrList, data, []);

    let arr: any = [];
    if (names) {
      name &&
        name?.forEach((item: any) => {
          arr.push(item.label);
        });

      return arr[arr.length - 1];
    } else {
      name &&
        name?.forEach((item: any) => {
          arr.push(item.value);
        });
      return arr;
    }
  }
  getChildren(value: string, data: string) {
    let arrList: any = this.getCascader(value);
    let arr: any = [];
    arrList.forEach((item: any) => {
      if (item.label == data) arr.push(item);
    });
    return arr;
  }
  //批量导入时根据名字 获取value
  getCascaderValues(value: string, data: string, names?: string) {
    let arrList: any = this.getCascader(value);
    const findIndexArray = (list: any, data: string, indexArray: any) => {
      // 根据自身节点寻找父级
      let arr = Array.from(indexArray);
      for (let i = 0, len = list.length; i < len; i++) {
        arr.push(list[i]);

        if (list[i].label === data) {
          return list[i].value;
        }
        let children = list[i].children;
        if (children && children.length) {
          let result: any = findIndexArray(children, data, arr);
          if (result) return result;
        }
        arr.pop();
      }
      return false;
    };

    let name = findIndexArray(arrList, data, []);
    return name;
    // let arr: any = [];
    // if (names) {
    //   name &&
    //     name?.forEach((item: any) => {
    //       arr.push(item.label);
    //     });

    //   return arr[arr.length - 1];
    // } else {
    //   name &&
    //     name?.forEach((item: any) => {
    //       arr.push(item.value);
    //     });
    //   return arr;
    // }
  }
  //表格头部搜索框使用
  getSearch(value: string) {
    let arr: any[] = [];
    const searchChildren: any = {};
    if (!this.list) this.list = JSON.parse(localStorage.getItem('dictionariesList') as string);
    this.list?.forEach((item: any) => {
      if (item.code == value) {
        arr.push(item);
      }
    });

    if (arr.length == 0) return;
    arr[0].children?.forEach((item: any, index: number) => {
      searchChildren[item.value] = { text: item.name };
    });
    return searchChildren;
  }
  // isLatestDict(versions = this.version) {
  //   if (!versions) {
  //     this.get();
  //     return;
  //   }
  //   // request
  //   //   .get('/sms/share/isLatestDict', { version: localStorage.getItem('version') })
  //   //   .then((res: any) => {
  //   //     if (!res.data) this.get();
  //   //   });
  // }
  /**
   * 根据id获取部门信息进行回显{title:'部门名称,id:'部门id'}
   *
   */
  getDepartment = async (value: string) => {
    let obj: any = {};
    obj = await request.get('/sms/system/sysDepartment', { id: value });
    return obj;
  };
  getUserName = async (value: any) => {
    let obj: any;
    // @ts-ignore
    obj = (await request.get('/sms/system/sysUser', { id: value })).data.content[0];
    return obj;
  };
  phoneCall = async (id: any) => {
    request.post('/sms/business/bizStudent/ecCall', { id: id }).then((res) => {
      if (res.status == 'success') {
        message.success('正在拨打电话...')
      }
    })
  }
}

export default new dictionaries();
