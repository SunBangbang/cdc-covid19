import {getDictDataList} from '@/utils'
import tableTitleOptions from "@/utils/tableTitleOptions";

export const reportCaseOption = (params) => {
  let {type} = params
  let isMySubmit = type.startsWith('s_')
  type = type.substring(2)
  const header = tableTitleOptions({
    selection: true,
    reserveSelection: true,
  })
  if(isMySubmit){
    return {
      ...header,
      column: [
        {
          label: "调查对象",
          prop: "name",
          searchSpan: 6,
          search: true,
          searchPlaceholder:'搜索调查对象姓名',
        },
        {
          label: "性别",
          prop: "gender",
          type: "select",
          dicData: getDictDataList('gender'),
          props: {
            label: 'dictLabel',
            value: 'dictValue'
          }
        },{
          label: "证件号",
          prop: "identity",
          minWidth: 160,
          search: true,
          searchPlaceholder:'搜索证件号',
        },{
          label: "上报时间",
          prop: "reptedDate",
          type: 'date',
          format: 'yyyy-MM-dd HH:mm:ss',
          minWidth: 160,
        },{
          label: "所在任务",
          prop: "taskName",
          overHidden: true,
          minWidth: 140
        },{
          label: "审核部门",
          prop: "deptName",
          //我的提交页面项
          hide: type === 'pass',
          minWidth: 160,
        },{
          label: "审核时间",
          prop: "updateDate",
          type: 'date',
          format: 'yyyy-MM-dd HH:mm:ss',
          minWidth: 160,
          hide: type !== 'reject',
        },{
          label: "审核意见",
          prop: "remark",
          hide: type !== 'reject',
          overHidden: true,
          minWidth: 160,
        }
      ]
    }
  }else if(type == 'todo'){
    //我的审核，待审核
    return {
      ...header,
      column: [
        {
          label: "报告组织",
          prop: "submitDeptName",
          search: true,
          searchSpan: 6,
          minWidth: 120
        },
        {
          label: "调查对象",
          prop: "name",
          searchSpan: 6,
          search: true,
          searchPlaceholder:'搜索调查对象姓名',
        },
        {
          label: "性别",
          prop: "gender",
          type: "select",
          dicData: getDictDataList('gender'),
          props: {
            label: 'dictLabel',
            value: 'dictValue'
          }
        },{
          label: "证件号",
          prop: "identity",
          minWidth: 160,
          search: true,
          searchPlaceholder:'搜索证件号',
        },{
          label: "上报时间",
          prop: "reptedDate",
          type: 'date',
          format: 'yyyy-MM-dd HH:mm:ss',
          minWidth: 120,
        },{
          label: "所在任务",
          prop: "taskName",
          overHidden: true,
          minWidth: 140
        }
      ]
    }
  }
  return {
    //我的审核，已审核，已驳回
    ...header,
    column: [
      {
        label: "报告组织",
        prop: "submitDeptName",
        search: true,
        searchSpan: 6,
        minWidth: 120
      },
      {
        label: "调查对象",
        prop: "name",
        searchSpan: 6,
        search: true,
        searchPlaceholder:'搜索调查对象姓名',
      },
      {
        label: "性别",
        minWidth: 50,
        prop: "gender",
        type: "select",
        dicData: getDictDataList('gender'),
        props: {
          label: 'dictLabel',
          value: 'dictValue'
        }
      },{
        label: "证件号",
        prop: "identity",
        minWidth: 160,
        search: true,
        searchPlaceholder:'搜索证件号',
      },{
        label: "上报时间",
        prop: "reptedDate",
        type: 'date',
        format: 'yyyy-MM-dd HH:mm:ss',
        minWidth: 120,
      },{
        label: "所在任务",
        prop: "taskName",
        overHidden: true,
        minWidth: 160
      },{
        label: "审核时间",
        prop: "updateDate",
        type: 'date',
        format: 'yyyy-MM-dd HH:mm:ss',
        minWidth: 120,
      },{
        label: "审核意见",
        prop: "remark",
        hide: type !== 'reject',
        overHidden: true,
        minWidth: 140,
      }
      ]
  }
}
