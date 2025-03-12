import React, { useEffect, useRef, useState } from 'react';
import { Button, message, Transfer } from 'antd';
import ProForm, {
  ModalForm,
  ProFormText,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormTextArea,
  ProFormCascader,
} from '@ant-design/pro-form';
import Dictionaries from '@/services/util/dictionaries';
import type { ProFormInstance } from '@ant-design/pro-form';
import request from '@/services/ant-design-pro/apiRequest';
import { TransferDirection } from 'antd/lib/transfer';
interface RecordType {
  key: string;
  title: string;
  // description: string;
}

export default (props: any) => {
  const { modalVisible, setModalVisible, callbackRef, renderData, signUpType } = props;
  const [projects, setprojects] = useState(
    renderData.types == 'edit' ? renderData.parentProject : '',
  );
  const [TransferData, setTransferData] = useState<RecordType[]>([]);
  const [targetKeys, setTargetKeys] = useState<any>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    request.get('/sms/business/bizField', { _isGetAll: true }).then((res: any) => {
      const data = res.data.content;
      const DataList: RecordType[] = [];
      data.forEach((item: any) => {
        DataList.push({
          key: item.id.toString(),
          title: item.name,
        });
      });
      setTransferData(DataList);
    });
    request
      .get('/sms/business/fieldStandard', {
        standardId: renderData.split(',')[0],
        _isGetAll: true,
        type: signUpType,
      })
      .then((res: any) => {
        const targetData: any[] = [];
        if (res.data.content.length > 0) {
          res.data.content.forEach((item: any) => {
            targetData.push(item.fieldId.toString());
          });
        }
        setTargetKeys(targetData);
      });
  }, []);

  const onChange1 = (
    nextTargetKeys: string[],
    direction: TransferDirection,
    moveKeys: string[],
  ) => {
    setTargetKeys(nextTargetKeys);
  };

  const onSelectChange = (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const onScroll = (direction: TransferDirection, e: React.SyntheticEvent<HTMLUListElement>) => {};
  const formRef = useRef<ProFormInstance>();
  const handleSearch = (dir: TransferDirection, value: string) => {};
  return (
    <ModalForm<{
      name: string;
      company: string;
    }>
      title="关联字段"
      formRef={formRef}
      visible={modalVisible}
      width={800}
      autoFocusFirstInput
      modalProps={{
        onCancel: () => setModalVisible(),
        destroyOnClose: true,
      }}
      onFinish={async (values: any) => {
        let arr: any = [];
        let array: any = [];
        let types: any = [];
        if (targetKeys.length > 0) {
          targetKeys.forEach((item: any) => {
            arr.push(Number(item));
            // types.push(signUpType);
          });
        } else {
          // types.push(signUpType);
        }

        renderData.split(',').forEach((item: any) => {
          array.push({ array: arr });
          types.push(signUpType);
        });

        request
          .post2(
            '/sms/business/fieldStandard/updateTreeFromTree',
            { ids: renderData, types: types.join(',') },
            array,
          )
          .then((res: any) => {
            if (res.status == 'success') {
              message.success('操作成功');
              setModalVisible();
              callbackRef();
            }
            return true;
          })
          .catch((err: any) => {
            return true;
          });
      }}
    >
      <ProForm.Group title="报考所需资料（将所需要的资料字段选中放入右侧栏点击确定即可）："></ProForm.Group>
      <div>
        注意：默认报名学员信息：学员姓名、手机号、身份证、报考岗位、招生老师、招生老师部门，不需要重复添加；非必要可以不用勾选。
      </div>
      <div>注意：如果需要添加没有的资料字段，请联系管理员添加。</div>
      <Transfer
        dataSource={TransferData}
        titles={['未选', '已选']}
        listStyle={{
          width: 500,
          height: 300,
        }}
        //targetKeys 显示在右侧框数据的 key 集合
        targetKeys={targetKeys}
        // selectedKeys 设置哪些项应该被选中
        selectedKeys={selectedKeys}
        onChange={onChange1}
        onSelectChange={onSelectChange}
        onScroll={onScroll}
        render={(item) => item.title}
        showSearch
        onSearch={handleSearch}
      />
    </ModalForm>
  );
};
