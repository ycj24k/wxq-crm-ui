import React, { useEffect, useRef, useState } from 'react';
import { Button, Divider, Descriptions, Tabs, Drawer, Image } from 'antd';
import Dictionaries from '@/services/util/dictionaries';
import request from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';
import ImgUrl from '@/services/util/UpDownload';
import ChargeIframe from '@/pages/Admins/AdminCharge/ChargeIframe';
export default (props: any) => {
  const { modalVisible, setModalVisible, renderData, setAuditVisible, setRenderData } = props;
  const [signUpData, setSiginUpData] = useState<any>(null);
  const [imgSrc, setImgSrc] = useState();
  const [isModalVisibles, setisModalVisibles] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  useEffect(() => {
    let arr1: any = [];
    let arr2: any = [];
    if (renderData.signUp.length > 0) {
      renderData.signUp.forEach((item: any) => {
        if (item.valueType == 0) {
          arr1.push(item);
        } else {
          arr2.push(item);
        }
      });
    }

    setSiginUpData([arr1, arr2]);
  }, []);
  const look = async (id: any, item: any) => {
    const type = item.slice(item.indexOf('.'));
    await ImgUrl('/sms/business/bizOrderField/download', id, item).then((res: any) => {
      console.log('ress', res);
      setImgSrc(res);
      if (type == '.png' || type == '.jpg' || type == '.jpeg') {
        setisModalVisibles(true);
      } else {
        setPreviewVisible(true);
      }
    });
  };
  let nameInfo = '学员';
  return (
    <Drawer
      onClose={() => {
        setModalVisible();
      }}
      width={1200}
      visible={modalVisible}
      destroyOnClose={true}
    >
      {renderData && (
        <>
          <Descriptions title={nameInfo + '基本信息'} bordered size="small">
            <Descriptions.Item label={nameInfo == '企业' ? '企业名称' : nameInfo + '姓名'}>
              {renderData.name}
            </Descriptions.Item>
            <Descriptions.Item label="类型">
              {Dictionaries.getName('studentType', renderData.type)}
            </Descriptions.Item>
            {renderData.parentName ? (
              <Descriptions.Item label="所属企业">{renderData.parentName}</Descriptions.Item>
            ) : (
              <Descriptions.Item label="企业负责人">
                {renderData.chargePersonName}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="性别">
              {renderData.sex == null ? '未知' : renderData.sex ? '女' : '男'}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话">{renderData.mobile}</Descriptions.Item>
            <Descriptions.Item label="身份证">{renderData.idCard}</Descriptions.Item>
            <Descriptions.Item label="微信">{renderData.weChat}</Descriptions.Item>
            <Descriptions.Item
              label="是否正式学员"
              contentStyle={{ color: renderData.isFormal ? 'rgb(0,172,132)' : 'red' }}
            >
              {renderData.isFormal ? '正式' + nameInfo : '潜在' + nameInfo}
            </Descriptions.Item>

            <Descriptions.Item label="客户来源">
              {Dictionaries.getName('dict_source', renderData.source)}
            </Descriptions.Item>
            <Descriptions.Item label="流转次数">{renderData.receiveNum}</Descriptions.Item>
            <Descriptions.Item label="资源类型">
              {Dictionaries.getName('circulationType', renderData.resourceType)}
            </Descriptions.Item>
            <Descriptions.Item
              label="用户状态"
              contentStyle={{ color: renderData.enable === false ? 'red' : 'rgb(0,172,132)' }}
            >
              {renderData.enable === false ? '禁用' : '使用中'}
            </Descriptions.Item>
            <Descriptions.Item label="咨询时间">
              {renderData.createTime}
            </Descriptions.Item>
            <Descriptions.Item label="联系地址" span={2}>
              {renderData.address}
            </Descriptions.Item>

            <Descriptions.Item label="备注">{renderData.description}</Descriptions.Item>
          </Descriptions>
          <Divider />
          <Descriptions title="报名信息" bordered size="small">
            <Descriptions.Item label="报考班型">
              {Dictionaries.getName('dict_class_type', renderData.record.classType)}
            </Descriptions.Item>
            <Descriptions.Item label="班型年限">
              {Dictionaries.getName('dict_class_year', renderData.record.classYear)}
            </Descriptions.Item>
            <Descriptions.Item label="考试类型">
              {Dictionaries.getName('dict_exam_type', renderData.record.examType)}
            </Descriptions.Item>
            <Descriptions.Item label="报名项目">
              {Dictionaries.getCascaderName('dict_reg_job', renderData.record.project)}
            </Descriptions.Item>
          </Descriptions>
          <Divider />
          <Descriptions title="缴费信息" bordered size="small">
            <Descriptions.Item label="订单金额">{renderData.record.receivable}</Descriptions.Item>
            <Descriptions.Item label="累计实收">{renderData.record.charge}</Descriptions.Item>
            <Descriptions.Item label="累计优惠">
              {renderData.record.averageDiscount}
            </Descriptions.Item>
            <Descriptions.Item label="欠费">
              <span style={{ color: 'red' }}>{renderData.record.arrears}</span>
            </Descriptions.Item>
          </Descriptions>
          <Divider />
          <Descriptions title="报名资料信息" bordered size="small">
            {signUpData &&
              signUpData[0].map((item: any, index: number) => {
                return (
                  <Descriptions.Item label={item.name} key={index}>
                    {item?.value?.indexOf('.') > 0 ? (
                      <a
                        onClick={() => {
                          look(item.orderFieldId, item.value);
                        }}
                      >
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </Descriptions.Item>
                );
              })}
          </Descriptions>
          <Divider />
          <Descriptions title="考试资料信息" bordered size="small">
            {signUpData &&
              signUpData[1].length &&
              signUpData[1].map((item: any, index: number) => {
                return (
                  <Descriptions.Item label={item.name} key={index}>
                    {item?.value?.indexOf('.') > 0 ? (
                      <a
                        onClick={() => {
                          look(item.orderFieldId, item.value);
                        }}
                      >
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </Descriptions.Item>
                );
              })}
          </Descriptions>
        </>
      )}
      <div style={{ textAlign: 'right', margin: '30px' }}>
        <Button
          danger
          type="primary"
          onClick={() => {
            setRenderData({ ...renderData.record, confirm: false });
            setAuditVisible(true);
          }}
        >
          审核不通过
        </Button>
        <Button
          type="primary"
          style={{ marginLeft: '30px' }}
          onClick={() => {
            setRenderData({ ...renderData.record, confirm: true });
            setAuditVisible(true);
          }}
        >
          审核通过
        </Button>
      </div>
      <div style={{ display: 'none' }}>
        <Image
          width={200}
          style={{ display: 'none' }}
          preview={{
            visible: isModalVisibles,
            src: imgSrc,
            onVisibleChange: (value: any) => {
              setisModalVisibles(value);
            },
          }}
        />
      </div>
      {previewVisible && (
        <ChargeIframe
          previewImage={imgSrc}
          previewVisible={previewVisible}
          setPreviewVisible={() => {
            setPreviewVisible(false);
          }}
        />
      )}
    </Drawer>
  );
};
