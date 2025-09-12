import { useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, message, Tag, Modal, Descriptions } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
// import ImgUrl from '@/services/util/ImgUrl';
import UpDownload from '@/services/util/UpDownload';
import request from '@/services/ant-design-pro/apiRequest';
import moment from 'moment';
import Tables from '@/components/Tables';
type GithubIssueItem = {
  url: string;
  uri: string;
  id: number;
  timeLength: number;
  startTime: string;
  isError: boolean;
  isPass: boolean;
  file: string;
};
let audio: any
let timeTimeOut: any
export default () => {
  const actionRef = useRef<ActionType>();
  const [modalVisibleFalg, setModalVisible] = useState<boolean>(false);
  const [mp3Url, setMp3Url] = useState<any>('');
  const [Previous, setPrevious] = useState<any>({});

  const callbackRef = () => {
    // @ts-ignore
    actionRef.current.reload();
  };
  const getSecond = (second: any, secondAll: any) => {
    let num = second - 1
    if (second <= 0) {
      num = secondAll
      clearInterval(timeTimeOut)
      setMp3Url('')
    }

    return num
  }
  const playSecond = (record: any) => {
    const a: any = document.getElementById('timeLength' + record.id)
    timeTimeOut = setInterval(() => {

      const content = a.innerText
      a.innerHTML = getSecond(content, record.timeLength)
    }, 1000)
  }
  const playAudio = (record: { file: string; id: number; timeLength: number; }) => {
    const audios: any = document.getElementById('audio')
    if (!record.file) return
    let flieMp3 = ''
    record.file.split(',').forEach((item) => {
      if (item.indexOf('.mp3') >= 0) {
        flieMp3 = item
      }
    })
    if (flieMp3 == '') {
      message.error('当前通话没有录音')
      return
    }
    if (mp3Url == flieMp3 && mp3Url != '') {
      if (audios.paused === false) {
        audios.pause()
        clearInterval(timeTimeOut)
      } else {
        audios.play()
        playSecond(record)
      }
      return
    }
    if (mp3Url != flieMp3 && mp3Url != '') {
      const b: any = document.getElementById('timeLength' + Previous.id)
      b.innerHTML = Previous.timeLength
      clearInterval(timeTimeOut)
      play(record, flieMp3, audios)
    } else {
      play(record, flieMp3, audios)
    }

  }
  const play = (record: any, flieMp3: string, audios: any) => {
    UpDownload('/sms/ec/ecCallLog/download', record.id, flieMp3, '.mp3').then((res: any) => {
      setMp3Url(flieMp3)
      audios.src = res
      audios.load()
      audios.play()
      playSecond(record)
      setPrevious(record)
    })
  }
  const columns: ProColumns<GithubIssueItem>[] = [
    {
      title: '学员姓名',
      dataIndex: 'studentName',
      copyable: true,
      ellipsis: true,
    },
    {
      title: '学员手机号',
      dataIndex: 'mobile',
      copyable: true,
      ellipsis: true,
    },
    {
      title: '沟通人',
      dataIndex: 'userName',
      ellipsis: true,
    },
    {
      title: '通话时长(秒)',
      dataIndex: 'timeLength',
      render: (text, record) => (
        <div>
          <a
            id={'timeLength' + record.id}
            onClick={(e) => playAudio(record)}>
            {record.timeLength}
          </a>
          <a>″</a>
        </div>
      ),
    },
    {
      title: '请求时间',
      key: 'startTime',
      dataIndex: 'startTime',
      valueType: 'dateRange',
      sorter: true,
      render: (text, record) => (
        <span>
          {record.startTime}
        </span>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      render: (text, record, _, action) => [
        <Button
          key="view"
          type="primary"
          size="small"
          icon={<SearchOutlined />}
          onClick={async () => {


          }}
        >
          查看
        </Button>,
      ],
    },
  ];
  const toolBarRender = [
    <Button
      type="primary"
      onClick={() => {
        request.post('/sms/ec/ecCallLog/synchronize').then((res) => {
          if (res.status == 'success') {
            message.success('同步成功')
            callbackRef()
          }
        })
      }}
    >
      立即同步通话记录
    </Button>,
    <audio id='audio' />
  ];
  const sortList = {
    ['startTime']: 'desc',
  };
  return (
    <PageContainer>
      <Tables
        actionRef={actionRef}
        columns={columns}
        request={{ url: '/sms/ec/ecCallLog', sortList }}
        toolBarRender={toolBarRender}
      />
    </PageContainer>
  );
};
