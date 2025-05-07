import apiRequest from '@/services/ant-design-pro/apiRequest';
import { Button, Form, Input, message, Modal } from 'antd';
import { history } from 'umi';
import './index.less'
export default (props: any) => {
    const param: any = history.location.query
    if (!param.u || !param.c) {
        Modal.error({
            title: '错误',
            content: '请扫描正确二维码！',
        })
        return <></>
    }
    const onFinish = (e: any) => {
        console.log(e)
        apiRequest.post('/sms/public/charge/buildUrl', e).then(res => {
            location = res.data
        })
    }
    return <div className="root">
        <div className="container">
            <div className="company-name">{param.c ? param.c.slice(0, 6) + '\n' + param.c.slice(6) : '汇德教育'}</div>

            <Form
                id="paymentForm"
                initialValues={{
                    userId: param.u
                }}
                onFinish={onFinish}
            >
                <Form.Item
                    hidden={true}
                    name="userId"
                >
                    <Input />
                </Form.Item>
                <div className="form-group">
                    <label htmlFor="amount" className="required">支付金额(元)</label>
                    <Form.Item
                        className="form-group"
                        // label="支付金额(元)"
                        name="amount"
                        rules={[{ required: true, message: '请输入支付金额' }]}
                    >
                        <Input type="number" min="0.01" step="0.01" />
                    </Form.Item>
                </div>
                <div className="form-group" >
                    <label htmlFor="name" className="required">姓名</label>
                    <Form.Item
                        // label="姓名"
                        name="name"
                        rules={[{ required: true, message: '请输入您的姓名' }]}
                    >
                        <Input type="text" />
                    </Form.Item>
                </div>
                <div className="form-group" >
                    <label htmlFor="phone" className="required">手机号码</label>
                    <Form.Item
                        className="form-group"
                        // label="手机号码"
                        name="phone"
                        rules={[{ required: true, message: '请输入您的手机号码' }]}
                    >
                        <Input type="tel" pattern="[0-9]{11}" />
                    </Form.Item>
                </div>
                {/* <div className="form-group">
                    <label htmlFor="name" className="required">姓名</label>
                    <Input type="text" id="name" name="name" placeholder="请输入您的姓名" required />
                </div> */}

                <button type="submit" className="submit-btn">确认支付</button>
            </Form>

        </div>
    </div>
}