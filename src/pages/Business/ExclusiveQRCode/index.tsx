import QrcodeInfo from "@/pages/Admins/AdminCharge/QrcodeInfo"
import apiRequest from "@/services/ant-design-pro/apiRequest"
import ProCard from "@ant-design/pro-card"
import { PageContainer } from "@ant-design/pro-layout"
import { Button } from "antd"
import { request } from "express"
import { useState } from "react"
import { useModel } from "umi"
import ChargeLog from "../ChargeLog"
// import "./index.less"


export default () => {
    const { initialState } = useModel('@@initialState');
    const [src, setSrc] = useState<string>()
    const [companyName, setCompanyName] = useState<string>()

    const get = (param: object = {}, reload = false) => {
        apiRequest.get('/sms/business/bizFile/chargeQRCode', param).then(res => {
            let tokenName: any = sessionStorage.getItem('tokenName'); // 从本地缓存读取tokenName值
            let tokenValue = sessionStorage.getItem('tokenValue'); // 从本地缓存读取tokenValue值
            const src = '/sms/business/bizFile/download?id=' + res.data.id + '&fileName=' + res.data.files + '&' + tokenName + '=' + tokenValue;
            setSrc(src);
            setCompanyName(res.data.name)
            if (reload) location.reload()
        })
    }
    get()
    const reBuild = () => {
        get({ reBuild: true }, true)
    }
    return (
        <PageContainer title="专属收款二维码">
            <ProCard>
                <ProCard
                    colSpan={{
                        // xs: 8,
                        // sm: 12,
                        // md: 12,
                        // lg: 12,
                        // xl: 12,
                        xxl: 8,
                    }}
                >
                    <img src={src} />
                    <Button
                        style={{ display: 'block', margin: 'auto' }}
                        type='primary'
                        onClick={() => {
                            apiRequest.request(src, {
                                method: 'GET',
                                // 必须加responseType: 'blob',
                                responseType: 'blob',
                            }).then((res: any) => {
                                const blob = new Blob([res]);   //注意拿到的是数据流！！
                                const objectURL = URL.createObjectURL(blob);
                                let btn = document.createElement('a');
                                btn.download = initialState?.currentUser?.name + '专属收款二维码.jpg'; //文件类型
                                btn.href = objectURL;
                                btn.click();
                                URL.revokeObjectURL(objectURL);
                            });
                            // html2canvas(document.querySelector('.payment-card') as HTMLElement).then(canvas => {
                            //     const imgUrl = canvas.toDataURL('image/jpeg')
                            // const image = document.createElement('img')
                            // image.src = imgUrl
                            // 将生成的图片放到 类名为 content 的元素中
                            // document.querySelector('.content').appendChild(image)
                            // const a = document.createElement('a')
                            // document.body.appendChild(a);
                            // a.href = src || ''
                            // a.target = '_blank';
                            // a.download = initialState?.currentUser?.name + '专属收款二维码.jpg'
                            // a.click()
                            // a.remove()
                        }}
                    >下载收款码</Button>
                    {/* <QrcodeInfo src={src} companyName={companyName} showInfo={false} /> */}
                </ProCard>
                <ProCard
                    colSpan={{
                        // xs: 16,
                        // sm: 16,
                        // md: 16,
                        // lg: 16,
                        // xl: 16,
                        xxl: 16,
                    }}
                >
                    <ChargeLog reBuild={reBuild} getAll={true} />
                </ProCard>
            </ProCard>
        </PageContainer>
        
    )
}