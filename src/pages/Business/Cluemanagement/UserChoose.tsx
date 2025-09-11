import { ApartmentOutlined, UserOutlined } from '@ant-design/icons';
import { Modal, Tree, Input, message, Radio } from 'antd';
import request from '@/services/ant-design-pro/apiRequest';
import { SetStateAction, useState } from 'react';
const { Search } = Input;
import './index.less';
import { useEffect } from 'react';

export default (props: any) => {
    const {
        UserChooseVisible,
        setUserChooseVisible,
        callbackRef,
        CardContent,
        departments,
        checkable = false,
        setUserID,
        renderData,
        departNameList = false,
        // 新增：仅选择模式，确认时把选择的用户ID回传给调用方，不触发接口
        onConfirmSelected
    } = props;
    interface CustomDataNode {
        title: string;
        key: string;
        userId?: string | number;
        children?: CustomDataNode[];
        // 其他可能需要的属性
    }
    let obj: any;
    let obj2: any = [];
    let CheckedKeys: any = [];
    let arr: any = [];
    const [expandedKeys, setexpandedKeys] = useState([]);
    const [searchValue, setsearchValue] = useState('');
    const [autoExpandParent, setautoExpandParent] = useState(true);
    const [checkedID, setCheckedID] = useState<any>();
    const [value, setValue] = useState(false);
    const [prevCheckedKeys, setPrevCheckedKeys] = useState<React.Key[]>([]);
    // 记录初始与当前选中的人员 userId 列表（仅限人员节点）
    const [initialUserIds, setInitialUserIds] = useState<number[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const listFn = (data: any) => {
        let arr2: any = [];
        data.forEach((item: any, index: number) => {
            if ((item.enable || value) || item.departmentName) {
                let arr3: any = [];
                if (item.children) {
                    arr3 = listFn(item.children);
                }
                let str = '';
                let icon: any;
                let disabled;
                // if (item.enable !== false) {
                if (item.departmentName) {
                    str = item.departmentName;
                    icon = <ApartmentOutlined />;
                    disabled = false;
                } else {
                    str = item.name;
                    icon = <UserOutlined />;
                    disabled = false;
                }
                if (arr3.length > 0) {
                    arr2.push({
                        title: str,
                        key: index,
                        userId: item.userId,
                        children: arr3,
                        icon: icon,
                        disabled: disabled,
                        id: item.id,
                    });
                } else {
                    arr2.push({
                        title: str,
                        key: index,
                        userId: item.userId,
                        icon: icon,
                        disabled: disabled,
                        id: item.id,
                    });
                }
            }

            // }

        });
        return arr2;
    };
    const listF: any[] = []
    CardContent.content.forEach((item: any) => {
        if (item.departmentName) {
            if (item.departmentName.indexOf('离职') == -1) {
                listF.push(item)
            }
        } else {
            listF.push(item)
        }

    })


    if (CardContent) arr = listFn(listF);

    //处理tree key值
    const arrKey = (data: any, index?: number) => {
        data.forEach((items: any, indexs: number) => {
            items.key = index + '-' + indexs;
            // if (items.title == departments.name) {
            //   CheckedKeys.push(items.key);
            // }
            if (items.children) {
                arrKey(items.children, items.key);
            }
        });
    };

    const departmentsKey = (data: any, id: any) => {
        data.forEach((items: any, indexs: number) => {
            if (['role', 'user', 'achievement', 'Groups', 'projectDepartment'].includes(CardContent.type)) {
                if (items.userId == id) {
                    CheckedKeys.push(items.key);
                    obj2.push(items)
                }
            } else {
                if (items.id == id) {
                    CheckedKeys.push(items.key);
                }
            }

            if (items.children) {
                departmentsKey(items.children, id);
            }
        });
    };
    if (arr.length > 0) {
        arrKey(arr, 0);
        //回显tree勾选

        departments &&
            departments.forEach((item: any) => {
                departmentsKey(arr, item.id);
            });

        departNameList &&
            departNameList.split(',').forEach((item: any) => {
                departmentsKey(arr, item);
            });
    }

    // 初始化初始与当前勾选的人员 userId 列表
    useEffect(() => {
        if (departments && Array.isArray(departments)) {
            const initIds = departments
                .map((d: any) => Number(d?.id))
                .filter((n: number) => !Number.isNaN(n));
            setInitialUserIds(initIds);
            setSelectedUserIds(initIds);
        } else {
            setInitialUserIds([]);
            setSelectedUserIds([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [UserChooseVisible]);
    const getParentKey = (title: any, tree: any[]): [] => {
        let parentKey = []
        for (let i = 0; i < tree.length; i++) {
            const node = tree[i];
            if (node.children) {
                if (node.children.some((item: any) => item.title.indexOf(title) != -1)) {
                    parentKey.push(node.key);
                } else if (getParentKey(title, node.children)) {
                    parentKey.push(...getParentKey(title, node.children));
                }
            }
        }
        return parentKey as [];
    };
    const onExpand = (expandedKeys: any) => {
        setexpandedKeys(expandedKeys);
        setautoExpandParent(false);
    };

    const onChange = (e: any) => {
        const { value } = e.target;

        setexpandedKeys(getParentKey(value, arr));
        setsearchValue(value);
        setautoExpandParent(true);
    };

    const loop = (data: any) => data.map((item: any) => {
        const index = item.title.indexOf(searchValue);
        const beforeStr = item.title.substring(0, index);
        const afterStr = item.title.slice(index + searchValue.length);
        const title =
            index > -1 ? (
                <span>
                    {beforeStr}
                    <span className="site-tree-search-value">{searchValue}</span>
                    {afterStr}
                </span>
            ) : (
                <span>{item.title}</span>
            );
        if (item.children) {
            return {
                title,
                key: item.key,
                disabled: item.disabled,
                icon: item.icon,
                children: loop(item.children),
                userId: item.userId,
            };
        }

        return {
            title,
            key: item.key,
            icon: item.icon,
            userId: item.userId,
            titles: item.title,
            disabled: item.disabled,
        };
    });

    useEffect(() => {
        if (!searchValue) {
            const expandedKeyArr: any = []
            function initExpandedKey(e: []) {
                e.forEach((i: any) => {
                    if (i.children) {
                        expandedKeyArr.push(i.key)
                        initExpandedKey(i.children)
                    }
                });
            }
            initExpandedKey(arr)
            setexpandedKeys(expandedKeyArr)
        }
    }, [searchValue])
    return (
        <>
            {CardContent?.type == 'performance' ? (
                <>
                    <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={(e) => onChange(e)} />
                    <Tree
                        showIcon
                        checkable={checkable}
                        defaultExpandAll
                        onExpand={(e) => onExpand(e)}
                        autoExpandParent={autoExpandParent}
                        defaultCheckedKeys={CheckedKeys}
                        onCheck={(checkedKeysValue, e) => {
                            const arr = e.checkedNodes
                            let idsList: any = []
                            arr.forEach((item: any) => {
                                if (item.userId) {
                                    idsList.push(item.userId)
                                }
                            })
                            setUserID(idsList)
                            // obj2 = e.checkedNodes;
                        }}
                        onSelect={(selectedKeys, e: any) => {
                            e.node.userId && setUserID(e.node.userId);
                        }}
                        treeData={loop(arr)}
                    />
                </>
            ) : (
                <Modal
                    title="选择人员"
                    open={UserChooseVisible}
                    destroyOnClose={true}
                    onCancel={() => {
                        CheckedKeys = [];
                        setUserChooseVisible(false);
                    }}
                    confirmLoading={confirmLoading}
                    onOk={async () => {
                        // 仅选择模式：直接把选中ID回传并关闭
                        if (typeof onConfirmSelected === 'function') {
                            onConfirmSelected(selectedUserIds);
                            setUserChooseVisible(false);
                            return;
                        }
                        // 计算差异：新增与移除
                        const setInit = new Set(initialUserIds);
                        const setCurr = new Set(selectedUserIds);
                        const toAdd: number[] = [];
                        const toRemove: number[] = [];
                        selectedUserIds.forEach((id) => { if (!setInit.has(id)) toAdd.push(id); });
                        initialUserIds.forEach((id) => { if (!setCurr.has(id)) toRemove.push(id); });

                        if (toAdd.length === 0 && toRemove.length === 0) {
                            setUserChooseVisible(false);
                            return;
                        }

                        setConfirmLoading(true);
                        try {
                            const groupId = renderData?.record?.id;
                            const addCalls = toAdd.map((id) => {
                                if (renderData?.type === 'sale') {
                                    return request.post('/sms/lead/ladUserGroupUser', { userGroupId: groupId, userId: id });
                                }
                                if (renderData?.type === 'newMedia') {
                                    return request.post('/sms/lead/ladUserGroupProvider', { userGroupId: groupId, provider: id });
                                }
                                return Promise.resolve(null);
                            });
                            const removeCalls = toRemove.map((id) => {
                                if (renderData?.type === 'sale') {
                                    return request.delete('/sms/lead/ladUserGroupUser/deleteByParam', { userGroupId: groupId, userId: id });
                                }
                                if (renderData?.type === 'newMedia') {
                                    return request.delete('/sms/lead/ladUserGroupProvider/deleteByParam', { userGroupId: groupId, provider: id });
                                }
                                return Promise.resolve(null);
                            });

                            await Promise.allSettled([...addCalls, ...removeCalls]);
                            message.success('操作成功！');
                            setUserChooseVisible(false);
                            callbackRef();
                        } catch (e) {
                            message.error('操作失败！');
                        } finally {
                            setConfirmLoading(false);
                        }
                    }}
                >
                    <>
                        <Search
                            style={{ marginBottom: 8 }}
                            placeholder="Search"
                            onChange={(e) => onChange(e)}
                        />
                        <Tree
                            showIcon
                            checkable={CardContent?.type != 'pay'}
                            defaultExpandAll
                            onExpand={(e) => onExpand(e)}
                            expandedKeys={expandedKeys}
                            autoExpandParent={autoExpandParent}
                            defaultCheckedKeys={CheckedKeys}
                            onCheck={(checkedKeysValue, e: any) => {
                                // 仅在本地收集选中的人员 userId 列表，等“确定”时再统一提交
                                const nodes = e.checkedNodes || [];
                                const ids: number[] = nodes
                                    .map((n: any) => Number(n?.userId))
                                    .filter((n: any) => !!n && !Number.isNaN(n));
                                setSelectedUserIds(ids);
                                obj2 = e.checkedNodes;
                            }}
                            treeData={loop(arr)}
                        />
                    </>
                </Modal>
            )}
        </>
    );
};