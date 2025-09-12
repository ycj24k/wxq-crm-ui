import { Button, Modal } from 'antd';
import './QrcodeInfo.less'
import html2canvas from 'html2canvas'
import dictionaries from '@/services/util/dictionaries';
import ProForm from '@ant-design/pro-form';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import { getCompanyRequest } from '@/services/util/util';

export default (props: any) => {
    const { src, companyName, order = {}, charge = {}, showInfo = true } = props;
    const { initialState } = useModel('@@initialState');
    const [loading, setLoading] = useState<boolean>(false)
    const [thisCompanyName, setThisCompanyName] = useState<string>()
    useEffect(() => {
        if (companyName) setThisCompanyName(companyName.slice(0, 6) + '\n' + companyName.slice(6))
        else getCompanyRequest().then((res: any[]) => {
            const companyId = initialState?.currentUser?.companyId
            res.forEach(e => {
                if (e.value == companyId) setThisCompanyName(e.label.slice(0, 6) + '\n' + e.label.slice(6))
            })
        })
    })
    return (
        <div className="qrcodeInfo">

            <div className="payment-card">
                <div className="header">
                    <h1 style={{ whiteSpace: 'pre' }}>{thisCompanyName}</h1>
                    <p>二维码快捷支付</p>
                </div>

                <div className="amount" hidden={!showInfo}>￥{charge.amount}</div>

                <div className="qr-container">
                    <div className="qr-code">
                        {/* <!-- 这里替换为实际的二维码图片 --> */}
                        <img src={src} />
                    </div>
                </div>

                <div className="payment-method">
                    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1448" width="32" height="32"><path d="M1024.0512 701.0304V196.864A196.9664 196.9664 0 0 0 827.136 0H196.864A196.9664 196.9664 0 0 0 0 196.864v630.272A196.9152 196.9152 0 0 0 196.864 1024h630.272a197.12 197.12 0 0 0 193.8432-162.0992c-52.224-22.6304-278.528-120.32-396.4416-176.64-89.7024 108.6976-183.7056 173.9264-325.3248 173.9264s-236.1856-87.2448-224.8192-194.048c7.4752-70.0416 55.552-184.576 264.2944-164.9664 110.08 10.3424 160.4096 30.8736 250.1632 60.5184 23.1936-42.5984 42.496-89.4464 57.1392-139.264H248.064v-39.424h196.9152V311.1424H204.8V267.776h240.128V165.632s2.1504-15.9744 19.8144-15.9744h98.4576V267.776h256v43.4176h-256V381.952h208.8448a805.9904 805.9904 0 0 1-84.8384 212.6848c60.672 22.016 336.7936 106.3936 336.7936 106.3936zM283.5456 791.6032c-149.6576 0-173.312-94.464-165.376-133.9392 7.8336-39.3216 51.2-90.624 134.4-90.624 95.5904 0 181.248 24.4736 284.0576 74.5472-72.192 94.0032-160.9216 150.016-253.0816 150.016z" fill="#009FE8" p-id="1449" /></svg>支付宝
                    &nbsp;&nbsp;
                    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1609" width="32" height="32"><path d="M404.511405 600.865957c-4.042059 2.043542-8.602935 3.223415-13.447267 3.223415-11.197016 0-20.934798-6.169513-26.045189-15.278985l-1.959631-4.296863-81.56569-178.973184c-0.880043-1.954515-1.430582-4.14746-1.430582-6.285147 0-8.251941 6.686283-14.944364 14.938224-14.944364 3.351328 0 6.441713 1.108241 8.94165 2.966565l96.242971 68.521606c7.037277 4.609994 15.433504 7.305383 24.464181 7.305383 5.40101 0 10.533914-1.00284 15.328104-2.75167l452.645171-201.459315C811.496653 163.274644 677.866167 100.777241 526.648117 100.777241c-247.448742 0-448.035176 167.158091-448.035176 373.361453 0 112.511493 60.353576 213.775828 154.808832 282.214547 7.582699 5.405103 12.537548 14.292518 12.537548 24.325012 0 3.312442-0.712221 6.358825-1.569752 9.515724-7.544837 28.15013-19.62599 73.202209-20.188808 75.314313-0.940418 3.529383-2.416026 7.220449-2.416026 10.917654 0 8.245801 6.692423 14.933107 14.944364 14.933107 3.251044 0 5.89015-1.202385 8.629541-2.7793l98.085946-56.621579c7.377014-4.266164 15.188934-6.89913 23.790846-6.89913 4.577249 0 9.003048 0.703011 13.174044 1.978051 45.75509 13.159718 95.123474 20.476357 146.239666 20.476357 247.438509 0 448.042339-167.162184 448.042339-373.372709 0-62.451354-18.502399-121.275087-51.033303-173.009356L407.778822 598.977957 404.511405 600.865957z" fill="#00C800" p-id="1610" /></svg>微信支付
                    {/* <img src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/us.svg" alt="银联"/> */}
                    {/* <img src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/cn.svg" /> */}
                </div>

                <div className="expire-time">“为每一位学员提供最值得信赖的服务”</div>

                <div className="order-info" hidden={!showInfo}>
                    <div className="info-row">
                        <span className="info-label">订单编号</span>
                        <span className="info-value">{charge.num2}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">学员姓名</span>
                        <span className="info-value">{charge.studentName}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">服务项目</span>
                        <span className="info-value">{dictionaries.getCascaderAllName('dict_reg_job', order.project)}—{dictionaries.getCascaderName('dict_reg_job', order.project)}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">招生老师</span>
                        <span className="info-value">{charge.userName}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">创建时间</span>
                        <span className="info-value">{charge.createTime}</span>
                    </div>
                    {/* <div className="info-row">
                        <span className="info-label">支付方式</span>
                        <span className="info-value">扫码支付</span>
                    </div> */}
                </div>

                <div className="footer">
                    支付完成后，系统将自动处理您的订单
                </div>
            </div>
            <Button
                style={{ display: 'block', margin: 'auto' }}
                type='primary'
                loading={loading}
                onClick={() => {
                    setLoading(true)
                    html2canvas(document.querySelector('.payment-card') as HTMLElement).then(canvas => {
                        const imgUrl = canvas.toDataURL('image/jpeg')
                        // const image = document.createElement('img')
                        // image.src = imgUrl
                        // 将生成的图片放到 类名为 content 的元素中
                        // document.querySelector('.content').appendChild(image)
                        const a = document.createElement('a')
                        a.href = imgUrl
                        // a.download 后面的内容为自定义图片的名称
                        if (charge.studentName) a.download = charge.studentName + '支付二维码.jpg'
                        else {
                            a.download = initialState?.currentUser?.name + '专属收款二维码.jpg'
                        }
                        a.click()
                        setLoading(false)
                    })
                }}
            >下载收款码</Button>
        </div>
    );
};
