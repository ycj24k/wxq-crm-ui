import { Image, Modal } from 'antd';
import ImgUrl from '@/services/util/UpDownload';
import { useEffect, useState } from 'react';




export default (props: any) => {
    const { modalVisible, setModalVisible, callbackRef, renderData, setPModalVisible } = props;
    const [imgs, setImgs] = useState('')
    const [isModalVisibles, setisModalVisibles] = useState(false)
    useEffect(() => {
        ImgUrl('/sms/business/bizFile/download', 4, '4aafebdc44d249c89c8406b196f7e079.jpg').then((res: any) => {
            setImgs(res);
            setisModalVisibles(true)
        });
    }, [])

    const close = () => {
        setPModalVisible()
        callbackRef()
        setModalVisible()
    }
    return (
        <Modal title="合同二维码" open={modalVisible} onOk={() => close()} onCancel={() => close()}>
            {/* <Image
                width={200}
                style={{ display: 'none' }}
                preview={{
                    visible: isModalVisibles,
                    src: imgs,
                    onVisibleChange: (value: any) => {
                        setisModalVisibles(value);
                    },
                }}
            /> */}
            <img src={imgs} />
        </Modal>
    )
}