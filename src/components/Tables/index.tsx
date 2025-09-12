import type { ActionType, ListToolBarProps} from '@ant-design/pro-table';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import requests from '@/services/ant-design-pro/apiRequest';
import type { FormInstance, TablePaginationConfig } from 'antd';
import type { ExpandableConfig, GetRowKey, TableRowSelection } from 'antd/lib/table/interface';
import type { AlertRenderType } from '@ant-design/pro-table/lib/components/Alert';
import { SearchConfig } from '@ant-design/pro-form/lib/components/Submitter';
import { useState } from 'react';
import './index.less';
type propsType = {
  className?: string;
  columns: any;
  actionRef?: React.Ref<ActionType | undefined> | undefined;
  cardBordered?: boolean | undefined;
  scroll?: any;
  onRow?: any;
  toolbar?: ListToolBarProps | undefined | any;
  request?: any;
  pagination?: false | TablePaginationConfig | undefined;
  rowKey?: string | GetRowKey<Record<string, any>> | undefined;
  toolBarRender?: any;
  expandable?: ExpandableConfig<Record<string, any>> | undefined;
  rowSelection?:
  | false
  | (TableRowSelection<Record<string, any>> & {
    alwaysShowAlert?: boolean | undefined;
  })
  | undefined;
  dateFormatter?:
  | false
  | 'string'
  | 'number'
  | ((value: moment.Moment, valueType: string) => string | number)
  | undefined;
  tableAlertOptionRender?: AlertRenderType<Record<string, any>> | undefined;
  onReset?: (() => void) | undefined;
  onDataSourceChange?: (() => void) | undefined;
  search?: any;
  beforeSearchSubmit?: any;
  onSubmit?: ((params: any) => void) | undefined;
  onFn?: ((e: any) => void) | undefined;
  getTotalElements?: ((e: any) => void) | undefined;
  getData?: ((e: any) => void) | undefined;
  loding?: ((e: any) => void) | undefined;
  tableStyle?: React.CSSProperties | undefined;
  headerTitle?: React.ReactNode;
  editable?: any;
  dataSource?: readonly Record<string, any>[] | undefined;
  params?: any;
  formRef?: React.MutableRefObject<FormInstance<any> | undefined> | undefined;
  rowClassName?: any;
  footer?: any;
  pagesizes?: any
  searchData?: any
};

export default (props: propsType) => {

  const {
    columns,
    actionRef,
    formRef,
    cardBordered = true,
    scroll = false,
    request,
    beforeSearchSubmit,
    toolbar = undefined,
    pagesizes = 10,
    rowKey = 'id',
    toolBarRender = [],
    dateFormatter = 'string',
    rowSelection = false,
    expandable = undefined,
    tableAlertOptionRender = undefined,
    onRow,
    params = '',
    dataSource = undefined,
    tableStyle = undefined,
    footer = undefined,
    onReset = undefined,
    onSubmit = undefined,
    onFn = undefined,
    getTotalElements = undefined,
    getData = undefined,
    loding = undefined,
    search = undefined,
    searchData = {},
    headerTitle,
    editable = undefined,
    className = 'tables',
    rowClassName = undefined
  } = props;
  // const { sortList = false } = request;
  let sortList: any = false;
  if (request) sortList = request.sortList;
  let sortLists = {
    _orderBy: '',
    _direction: '',
  };
  const [pagesize, setPageSize] = useState<number>(pagesizes);
  const [dataParams, setDataParams] = useState<any>({})
  return (
    <ProTable
      columns={columns}
      className={className}
      actionRef={actionRef}
      formRef={formRef}
      cardBordered={cardBordered}
      scroll={scroll}
      headerTitle={headerTitle}
      tableStyle={tableStyle}
      dataSource={dataSource}
      rowClassName={rowClassName}
      request={async (params, sort, filter) => {
        Object.keys(params).forEach((key) => {
          if (params[key] == 'null' || params[key] == null) {
            params[`${key}-isNull`] = true;
            delete params[key];
          }
        });
        if (Object.keys(sort).length > 0) {
          Object.keys(sort).forEach((key: any) => {
            sortLists._orderBy = key;
            if (sort[key]?.indexOf('desc') == 0) {
              sortLists._direction = 'desc';
            } else {
              sortLists._direction = 'asc';
            }
          });
        } else if (sortList) {
          Object.keys(request.sortList as {}).forEach((key: any) => {
            sortLists._orderBy = key;
            // @ts-ignore
            sortLists._direction = request.sortList[key];
          });
        } else {
          sortLists = {
            _orderBy: '',
            _direction: '',
          };
        }
        const searchParams = params;
        Object.keys(searchParams).forEach((key) => {
          if (searchParams[key] === '') {
            delete searchParams[key];
          }
        });
        const paramsAll = { ...filter, ...request.params, ...searchParams, ...searchData };
        Object.keys(paramsAll).forEach((key: any) => {
          if (
            (paramsAll[key] == '' || paramsAll[key] == [''] || paramsAll[key] == '-isNull') &&
            paramsAll[key] !== 0 &&
            paramsAll[key] !== false
          ) {
            paramsAll[`${key}` + '-isNull'] = true;
            delete paramsAll[key];
          }
          if (paramsAll[key] === null) {
            delete paramsAll[key];
          }
          if (paramsAll[key] == 'All') {
            delete paramsAll[key];
          }
        });
        if (sortLists._orderBy !== '') {
          Object.assign(paramsAll, sortLists);
        }
        setDataParams(paramsAll)
        const dataList: any = await requests.get(request.url, {
          ...paramsAll,
          // ...sortLists,
          //   _orderBy: 'createTime',
          //   _direction: 'desc',
        });
        if (onFn) {
          onFn(dataList.data.content)
        }
        if (getData) {
          // getData(params)
          getData(paramsAll)
        }
        if (loding) {
          loding(false)
        }
        if (getTotalElements) {
          getTotalElements(dataList.data.totalElements)
        }
        return {
          data: dataList.data.content,
          success: dataList.success,
          total: dataList.data.totalElements,
        };
      }}
      rowKey={rowKey}
      pagination={{
        pageSize: pagesize,
        // defaultCurrent: 6,
        showSizeChanger: true,
        onChange: (page, pageSize) => {
          setPageSize(pageSize);
        },
      }}
      toolBarRender={() => toolBarRender}
      rowSelection={rowSelection}
      params={params}
      expandable={expandable}
      dateFormatter={dateFormatter}
      tableAlertOptionRender={tableAlertOptionRender}
      toolbar={toolbar}
      onRow={onRow}
      beforeSearchSubmit={beforeSearchSubmit}
      onReset={onReset}
      onSubmit={onSubmit}
      search={search}
      editable={editable}
      footer={footer}
      // options={false}
      columnsState={{
        // onChange: (e) => {
        //   console.log(e);
        // },
        persistenceKey: className,
        persistenceType: 'localStorage',
      }}
    />
  );
};
