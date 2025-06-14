import ProForm, { ProFormCheckbox, ProFormText, ProFormTreeSelect } from '@ant-design/pro-form';
import { Button, Row, Checkbox } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import request from '@/services/ant-design-pro/apiRequest';
import UserManageCard from '../../pages/Admins/Department/UserManageCard';
import { useModel } from 'umi';

let content: any = null;
export default forwardRef((props: any, ref) => {
  const {
    userLabel,
    userNames,
    userPlaceholder,
    setUserNameId,
    width = 'md',
    setDepartId = () => { },
    setFalgUser = () => { },
    flag = false,
    enable = true,
    filter = (e: Array<any>) => e,
    userName,
    formRefs,
    userNameChange = false,
    newMedia = false,
    recruit = true,
    disabled = false
  } = props;
  //   const { initialState } = useModel('@@initialState');
  const [DepartmentList, setDepartments] = useState<any>(
    JSON.parse(localStorage.getItem('Department') as string),
  );
  const [DepartmentValue, setDepartmentValue] = useState<any>('');
  const [UserNameValue, setUserNameValue] = useState<any>(undefined);
  const [cheboxTrue, setCheboxTrue] = useState<boolean>(false);
  const [TreeStatusU, setTreeStatusU] = useState<'' | 'error' | 'warning' | undefined>('');
  const [TreeStatusD, setTreeStatusD] = useState<'' | 'error' | 'warning' | undefined>('');
  // const depFn = async () => {
  //   const list = ;
  //   await setDepartments(list);
  // };
  useEffect(() => {
    // depFn();
    // if (userName) {
    //   setDepartment(userName);
    // }
  }, []);
  useImperativeHandle(ref, () => ({
    setDepartment: async (e: any) => {
      // depFn();
      if (e.id == '-1') {
        // setCheboxTrue(true);
      }
      setUserNameValue(e.name);
      setDepartmentValue(e.departmentId);
    },
  }));
  const getDepartment = async () => {
    // const list = (await request.get('/sms/share/getDepartmentAndUser')).data;
    const listFn = (data: any) => {
      let arr2: any = [];
      data.forEach((item: any, index: number) => {
        let arr3: any = [];
        if (item.children) {
          arr3 = listFn(item.children);
        }
        let str = '';
        let add = false;
        let obj: any = {};
        if (item.departmentName) {
          str = item.departmentName;
          obj.id = item.id;
          add = true
        } else if (item.enable || !enable) {
          str = item.name;
          obj.userId = item.userId;
          add = true
        }
        if (add) {
          if (arr3.length > 0) {
            arr2.push({
              ...obj,
              title: str,
              parentId: item.parentId,
              children: arr3,
            });
          } else {
            arr2.push({
              ...obj,
              title: str,
              parentId: item.parentId,
            });
          }
        }
      });


      return arr2;
    };
    const arrKey = (data: any, index?: number) => {
      data.forEach((items: any, indexs: number) => {
        items.value = index + '-' + indexs;
        if (items.children) {
          arrKey(items.children, items.value);
        }
      });
    };
    const lists = listFn(DepartmentList);
    arrKey(lists, 0);
    return lists.reverse();
  };
  const onSelectUser = (node: any) => {
    if (!node.userId) {
      setTreeStatusU('error');
      setFalgUser(true);
      return;
    }
    setFalgUser(false);
    setTreeStatusU('');
    setUserNameId({ name: node.title, id: node.userId, departmentId: node.parentId });
    setUserNameValue(node.value);
    if (!recruit) return
    setDepartmentValue(node.value.slice(0, node.value.length - 2));

    setDepartId(node.parentId);
  };
  const onSelectDep = (node: any) => {
    if (!node.id) {
      setTreeStatusD('error');
      setFalgUser(true);
      return;
    }
    setFalgUser(false);

    setDepartmentValue(node.value);
    setDepartId(node.id);
    if (!recruit) return
    setTreeStatusD('');
    setUserNameValue('');
  };
  const onChangeUser = (e: string) => {
    setUserNameId({ name: e, id: -1 });
  };
  return (
    <Row>
      {DepartmentList.length > 0 && (
        <ProForm.Group>
          <ProFormText
            name={userNames}
            label={userLabel}
            placeholder={userPlaceholder}
            width={width}
            hidden={!cheboxTrue}
            fieldProps={{
              onChange: (e) => {
                onChangeUser(e.target.value);
              },
              defaultValue: UserNameValue,
              disabled: disabled
            }}
            rules={[
              {
                required: cheboxTrue,
              },
            ]}
          />
          <ProFormTreeSelect
            name={userNames}
            label={userLabel}
            placeholder={userPlaceholder}
            allowClear
            width={width}
            secondary
            hidden={cheboxTrue}
            request={async () => {
              return filter(await getDepartment());
            }}
            // tree-select args
            required
            fieldProps={{
              disabled: disabled || newMedia,
              status: TreeStatusU,
              onSelect: (e: any, node: any) => {
                onSelectUser(node);
              },
              value: [UserNameValue],
              treeDefaultExpandAll: true,
              filterTreeNode: true,
              showSearch: true,
              dropdownMatchSelectWidth: false,
              labelInValue: true,
              // autoClearSearchValue: true,
              // multiple: true,
              treeNodeFilterProp: 'title',
              fieldNames: {
                label: 'title',
              },

            }}
          />

          <ProFormTreeSelect
            name="departmentId"
            hidden={flag}
            label={'部门'}
            placeholder="请选择部门"
            allowClear
            width={width}
            secondary
            request={async () => {
              return filter(await getDepartment());
            }}
            rules={[
              {
                required: cheboxTrue || !recruit,
              },
            ]}
            // tree-select args
            fieldProps={{
              disabled: (!cheboxTrue && recruit),
              //   style: { marginLeft: '30px' },
              status: TreeStatusD,
              onSelect: (e: any, node: any) => {
                onSelectDep(node);
              },
              value: [DepartmentValue],
              treeDefaultExpandAll: true,
              filterTreeNode: true,
              showSearch: true,
              dropdownMatchSelectWidth: false,
              labelInValue: true,
              // autoClearSearchValue: true,
              // multiple: true,
              treeNodeFilterProp: 'title',
              fieldNames: {
                label: 'title',
              },
            }}
          />
          <ProFormCheckbox
            hidden={flag || !recruit}
            label="是否是离职老师（不在系统里的老师）"
            fieldProps={{
              onChange: (e) => {
                setCheboxTrue(e.target.checked);
              },
              defaultChecked: cheboxTrue,
            }}
          />
        </ProForm.Group>
      )}
    </Row>
  );
});
