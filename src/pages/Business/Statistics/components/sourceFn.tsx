import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';

const sourceFn = async (start: any, end: any, userId: any) => {
    const obj: any = {}
    const data: any = {
        'status-isNot': 0,
        enable: true, parentId: -1,
        _isGetAll: true,
        'createTime-start': start,
        'createTime-end': end,
    }
    if (userId) {
        data.userId = userId
    }
    const order = (await request.get('/sms/business/bizOrder', data)).data
    // const arr :any= []

    const result = resultContent(order)

    obj.result = result
    obj.department = userContent(order)
    return obj
};

const resultContent = (order: any) => {
    const result = order.content.reduce((acc: { type: any; value: number; }[], curr: { source: any; }) => {
        const type = Dictionaries.getName('dict_source', curr.source);
        // const type = curr.source;
        const existingType = acc.find(item => item.type === type);

        if (existingType) {
            existingType.value += 1;
        } else {
            acc.push({ type, value: 1 });
        }

        return acc;
    }, []);

    result.forEach((item: any) => {
        // item.source = Dictionaries.getName('dict_source', item.type)
        // @ts-ignore
        const baifenbi: any = (item.value / order.content.length * 100).toFixed(2);
        console.log('baifenbi', baifenbi);
        item.sourceValue = `${item.type}${item.value}笔`
        item.source = `${item.type} ${baifenbi}%`
    })
    return result
}

const userContent = (order: any) => {
    let num = 0
    const departments2 = JSON.parse(localStorage.getItem('Department') as string)
    let departments: { departmentName: string; }[] = []
    departments2?.forEach((item: any) => {
        if (item.departmentName == '汇德教育') {
            departments = item.children
        }
    })
    const department: any = []
    const dep = ['中建事业部', '共赢未来事业部', '才子事业部', '汇才事业部', '中台', '后台']
    departments.forEach((item: { departmentName: string; }) => {
        if (dep.indexOf(item.departmentName) >= 0) {
            department.push(item)
        }
    })


    const getDepartemtNum = (content: any, item: any, parent: any) => {

        content.forEach((itemDepartment: any) => {


            if (itemDepartment.userId == item.userId) {
                if (parent.num) {
                    parent.num = parent.num + item.quantity
                } else {
                    parent.num = item.quantity
                }
                return
            }
            if (itemDepartment.children) {
                getDepartemtNum(itemDepartment.children, item, itemDepartment)
            }
        })
    }
    order.content.forEach((item: { quantity: number; userId: number }) => {
        num = num + item.quantity
        getDepartemtNum(department, item, department)
    })

    const Fns = (children: any) => {
        let num = 0
        if (children) {
            children.forEach((itemchildren: { num: number; children: any; }) => {
                if (itemchildren.num) {
                    num = num + itemchildren.num
                }
                if (itemchildren.children) {
                    num = num + Fns(itemchildren.children)
                }
            })


        }

        return num
    }
    department.forEach((item: { num: number; children: { children: any[]; }; }) => {
        item.num = item.num ? item.num : 0
        item.num = Fns(item.children) + item.num
    })
    return { department, num }


}
export default sourceFn;
