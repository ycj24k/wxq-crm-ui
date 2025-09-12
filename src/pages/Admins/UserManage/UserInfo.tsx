import { DrawerForm } from "@ant-design/pro-form";
import { Descriptions, Drawer } from "antd"
import moment from "moment"
import './index.less'
import Dictionaries from '@/services/util/dictionaries';
import { useEffect, useState } from "react";
import look from '@/services/util/viewLook';
import Preview from '@/services/util/preview';




export default (props: any) => {
    const { modalVisible, setModalVisible, renderData } = props
    const [previewurl, setPreviewurl] = useState<any>();
    const [PreviewVisibles, setPreviewVisibles] = useState<boolean>(false);
    const getStatue = {
        0: 'probation',
        1: 'formal',
        2: 'partTimeJob',
        3: 'resignation'
    }
    const contentTitle = (
        <div>用户:{renderData.level != null ? Dictionaries.getName('ProfessionalTitle', renderData.level) : '专员'} - {renderData.name} <span className={`statusTitle ${getStatue[renderData.status]}`}>{Dictionaries.getName('onJobStatus', renderData.status)}员工</span></div>
    )
    const getAgeFromIdCard = (idCard: string) => {
        const birthYear = idCard.substring(6, 10);
        const birthMonth = idCard.substring(10, 12);
        const birthDay = idCard.substring(12, 14);

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDay = currentDate.getDate();

        let age = currentYear - parseInt(birthYear);

        if (currentMonth < parseInt(birthMonth) || (currentMonth == parseInt(birthMonth) && currentDay < parseInt(birthDay))) {
            age--;
        }

        return age;
    }
    const getEmploymentDuration = (startDate: { getFullYear: () => any; getMonth: () => number; getDate: () => any; }) => {
        const currentDate = new Date();
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth() + 1;
        const startDay = startDate.getDate();

        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDay = currentDate.getDate();

        let years = currentYear - startYear;
        let months = currentMonth - startMonth;

        if (currentMonth < startMonth || (currentMonth == startMonth && currentDay < startDay)) {
            years--;
            months = 12 - (startMonth - currentMonth);
        }

        if (months < 0) {
            years--;
            months = 12 + months;
        }

        return years + "年" + months + "月";
    }
    const filesDom = (value: any) => {

        let dom = <span />
        if (value) {
            dom = value.split(',').map((items: any, indexs: number) => {
                return (
                    <div key={indexs} className="notice-files">
                        <a
                            onClick={() => {
                                look(
                                    renderData.id,
                                    items,
                                    '/sms/system/sysUser/download',
                                    setPreviewurl,
                                    setPreviewVisibles,
                                );
                            }}
                        >
                            {items}
                        </a>
                    </div>
                );
            })
        }
        return dom
    }
    return (
        <DrawerForm
            visible={modalVisible}
            width={1400}
            drawerProps={{
                destroyOnClose: true,
                onClose: () => {
                    setModalVisible();
                },
            }}
        >
            <Descriptions title={contentTitle} bordered size="middle" column={6} >
                {/* <Descriptions.Item label="姓名">{renderData.name}</Descriptions.Item> */}
                <Descriptions.Item label="账号" span={2}>{renderData.userName}</Descriptions.Item>
                <Descriptions.Item label="性别">{renderData.sex ? '女' : '男'}</Descriptions.Item>
                <Descriptions.Item label="民族">{Dictionaries.getName('dict_nation', renderData.ethnic)}</Descriptions.Item>
                <Descriptions.Item label="年龄" >{getAgeFromIdCard(renderData.idCard)}</Descriptions.Item>
                <Descriptions.Item label="工龄" >{getEmploymentDuration(new Date(renderData.entryTime))}</Descriptions.Item>
                <Descriptions.Item label="已婚未婚" >{renderData.marriageInfo}</Descriptions.Item>
                <Descriptions.Item label="政治面貌" >{Dictionaries.getName('PoliticalLandscape', renderData.formalAppearance)}</Descriptions.Item>
                <Descriptions.Item label="籍贯" span={2}>{renderData.nativePlace}</Descriptions.Item>
                <Descriptions.Item label="生日日期" span={2}>
                    {renderData.birthday && renderData.birthday}
                </Descriptions.Item>
                <Descriptions.Item label="工作电话" span={2}>{renderData.mobile}</Descriptions.Item>
                <Descriptions.Item label="私人电话" span={2}>{renderData.privateMobile}</Descriptions.Item>
                <Descriptions.Item label="邮箱" span={2}>{renderData.email}</Descriptions.Item>
                <Descriptions.Item label="微信" span={2}>{renderData.weChat}</Descriptions.Item>
                <Descriptions.Item label="身份证" span={4}>{renderData.idCard}</Descriptions.Item>
                <Descriptions.Item label="入职时间" span={2}>
                    {renderData.entryTime}
                </Descriptions.Item>
                <Descriptions.Item label="转正时间" span={2}>
                    {renderData.formalTime}
                </Descriptions.Item>
                <Descriptions.Item label="离职时间" span={2}>
                    {renderData.turnoverTime}
                </Descriptions.Item>
                <Descriptions.Item label="办公地点" span={2}>{Dictionaries.getName('officeLocation', renderData.officeAddress)}</Descriptions.Item>
                <Descriptions.Item label="管理岗" span={2}>{renderData.isMiddle ? '是' : '否'}</Descriptions.Item>
                <Descriptions.Item label="推荐人" span={2}>{Dictionaries.getDepartmentUserName(renderData.presenter)}</Descriptions.Item>
                <Descriptions.Item label="部门" span={3}>{renderData.topDepartmentName.slice(0, renderData.topDepartmentName.length - 1).join('-')}</Descriptions.Item>
                <Descriptions.Item label="最后登录时间" span={2}>
                    {renderData.lastLoginTime}
                </Descriptions.Item>
                <Descriptions.Item
                    label="状态"
                    contentStyle={{ color: renderData.enable ? 'rgb(0,172,132)' : 'red' }}
                >
                    {renderData.enable ? '使用中' : '禁用'}
                </Descriptions.Item>
                <Descriptions.Item label="毕业院校" span={2}>{renderData.graduationSchool}</Descriptions.Item>
                <Descriptions.Item label="专业" span={2}>{renderData.profession}</Descriptions.Item>
                <Descriptions.Item label="学历" span={2}>{Dictionaries.getName('dict_education', renderData.degree)}</Descriptions.Item>
                <Descriptions.Item label="毕业时间" span={6}>
                    {renderData.graduationTime}
                </Descriptions.Item>
                <Descriptions.Item label="现住地址" span={6}>{renderData.residentialAddress}</Descriptions.Item>
                <Descriptions.Item label="身份证地址" span={6}>{renderData.idCardAddress}</Descriptions.Item>
                <Descriptions.Item label="户籍所在地" span={6}>{renderData.householdRegistrationAddress}</Descriptions.Item>
                <Descriptions.Item label="家属联系方式" span={6}>{renderData.familyInfo}</Descriptions.Item>
                <Descriptions.Item label="描述" span={6}>{renderData.description}</Descriptions.Item>
                <Descriptions.Item label="身份证照片" span={6}>{filesDom(renderData.idCardPhoto)}</Descriptions.Item>
                <Descriptions.Item label="毕业证照片" span={6}>{filesDom(renderData.graduationPhoto)}</Descriptions.Item>
                <Descriptions.Item label="技能等级证书" span={6}>{filesDom(renderData.gradePhoto)}</Descriptions.Item>
            </Descriptions>

            {PreviewVisibles && (
                <Preview
                    imgSrc={previewurl}
                    isModalVisibles={PreviewVisibles}
                    setisModalVisibles={(e: boolean | ((prevState: boolean) => boolean)) =>
                        setPreviewVisibles(e)
                    }
                />
            )}
        </DrawerForm>
    )

}