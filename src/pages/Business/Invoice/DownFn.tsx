import request from '@/services/ant-design-pro/apiRequest';
import Dictionaries from '@/services/util/dictionaries';



export default {

    chargFn: async (id: string) => {
        const list = (await request.get('/sms/business/bizInvoice/getInfo', { idList: id, _isGetAll: true })).data
        const conetnt: any[] = []
        for (const item of list) {
            const str = `开票号:${item.childNum} 销售方:${Dictionaries.getName('companyInfo', item.childSeller)} 开票金额:${item.childAmount} 开票备注:${item.childRemark}`;

            if (conetnt.length === 0) {
                item.InvoiceChildren = str
                conetnt.push(item);
            } else {
                const foundIndex = conetnt.findIndex(obj => obj.chargeId === item.chargeId);
                if (foundIndex !== -1) {
                    const existingItem = conetnt[foundIndex];
                    existingItem.InvoiceChildren = existingItem.InvoiceChildren + ' ' + str;
                } else {
                    item.InvoiceChildren = str
                    conetnt.push(item);
                }
            }
        }
        return conetnt
    },
    InvoiceFn: async (id: string, type: string) => {
        const list = (await request.get('/sms/business/bizInvoice/getInfo', { idList: id, _isGetAll: true })).data
        const conetnt: any[] = []
        for (const item of list) {
            const str = `缴费编号:${item.chargeNum} 缴费方式:${Dictionaries.getName('dict_stu_refund_type', item.chargeMethod)} 缴费金额:${item.chargeAmount}`;
            if (conetnt.length === 0) {
                item.ChargeChildren = str
                conetnt.push(item);
            } else {
                const foundIndex = conetnt.findIndex(obj => obj.childId === item.childId);

                if (foundIndex !== -1) {
                    const existingItem = conetnt[foundIndex];

                    existingItem.ChargeChildren = existingItem.ChargeChildren + ' ' + str;
                } else {
                    item.ChargeChildren = str
                    conetnt.push(item);
                }
            }
        }
        if (type == 'all') {
            return list
        } else {
            return conetnt
        }


    },
    All: async (id: string) => {
        const list = (await request.get('/sms/business/bizInvoice/getInfo', { idList: id, _isGetAll: true })).data
        const sum = list.reduce((acc: any, obj: { childAmount: any; }) => acc + obj.childAmount, 0);
        list.forEach((item: { InvoiceAmount: any; }) => {
            item.InvoiceAmount = sum
        })
        return list
    }
}