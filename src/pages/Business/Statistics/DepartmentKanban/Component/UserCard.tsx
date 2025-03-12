import { useEffect, useMemo, useState } from "react";
import request from '@/services/ant-design-pro/apiRequest';
import UserManageCard from "@/pages/Admins/Department/UserManageCard";
import { useModel } from "umi";
export default (props: any) => {
    const [departNameList, setDepartNameList] = useState<any>({ content: [] })
    const [userId, setUserID] = useState<any>([]);
    const { initialState } = useModel('@@initialState');

    useMemo(() => {
        console.log(initialState);

    }, [userId])
    useEffect(() => {
        DepartmentAndUser()
    }, [])
    const DepartmentAndUser = async () => {
        let list = JSON.parse(localStorage.getItem('Department') as string);
        if (!list) {
            list = (await request.get('/sms/share/getDepartmentAndUser')).data;
            localStorage.setItem('Department', JSON.stringify(list));
        }
        let arrList: any = []
        list.map((item: { departmentName: string; children: any; }) => {
            if (item.departmentName == '汇德教育') {
                arrList = item.children
            }
        })
        arrList.forEach((itemList: any) => {
            if (itemList.children) {
                childernFn(itemList.children, itemList)

            }
        })
    }
    const childernFn = (children: [], departList: any[]) => {


        children.forEach((childernList: { userId: number, children: [] }) => {
            //获取当前登陆人所在部门
            //initialState.currentUser.userid
            if (childernList.userId == initialState?.currentUser?.userid) {
                //{ content: [operations], type: 'performance' }
                setDepartNameList({ content: [departList], type: 'performance' })
                return
            } else if (childernList.children) {

                childernFn(childernList.children, departList)
            }
        })
    }

    return (
        <UserManageCard
            CardVisible={true}
            checkable={true}
            CardContent={departNameList}
            setUserID={(e: any) => {
                setUserID(e);
            }}
        />
    )


}