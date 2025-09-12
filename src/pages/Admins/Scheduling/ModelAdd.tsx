import type {
    ProFormInstance} from '@ant-design/pro-form';
import ProForm, {
    ModalForm,
    ProFormDateTimePicker,
    ProFormGroup,
    ProFormList,
    ProFormSwitch,
    ProFormText,
    ProFormTimePicker,
} from '@ant-design/pro-form';
import { message, Space } from 'antd';
import request from '@/services/ant-design-pro/apiRequest';
import { FocusEvent, useEffect, useRef, useState } from 'react';
import UserTreeSelect from '@/components/ProFormUser/UserTreeSelect';
import ProCard from '@ant-design/pro-card';
import { CloseCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import Dictionaries from '@/services/util/dictionaries';

export default (props: any) => {
    const { setModalVisible, modalVisible, callbackRef, renderData, SetListData } = props;
    const userRef: any = useRef(null);
    const [data, setData] = useState<any>();
    const [statusList, setstatusList] = useState<any>([])
    const formRef = useRef<ProFormInstance>();

    useEffect(() => {
        formRef?.current?.setFieldValue('isWork', renderData.isWork)
    }, []);
    const submitok = (values: any) => {
        SetListData({
            date: renderData.date,
            isWork: values.isWork
        })
        setModalVisible()
    };

    return (
        <ModalForm
            width={300}
            formRef={formRef}
            onFinish={async (values) => {
                await submitok(values);
            }}
            modalProps={{
                destroyOnClose: true,
                onCancel: () => {
                    setModalVisible();
                },
                maskClosable: false,
            }}
            visible={modalVisible}
        >
            <ProFormSwitch name="isWork" label="工作日" />

        </ModalForm>
    );
};
