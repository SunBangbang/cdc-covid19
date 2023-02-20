import {getDictDataList} from '@/utils'
import tableTitleOptions from "@/utils/tableTitleOptions"

export const investigationCaseOption = (params) => {
  const header = tableTitleOptions({
    searchMenuSpan: 8
  })
  return {
    ...header,
    column: [
      {
        label: "调查对象",
        prop: "name",
        minWidth: 80
      },
      {
        label: "调查对象",
        prop: "participant",
        search: true,
        hide: true,
        searchPlaceholder:'搜索调查对象姓名',
        searchSpan: 8,
        maxlength: 30
      },
      {
        label: "性别",
        prop: "gender",
        type: "select",
        dicData: getDictDataList('gender'),
        props: {
          label: 'dictLabel',
          value: 'dictValue'
        },
        width: 55
      },{
        label: "证件号",
        prop: "identity",
        minWidth: 160,
        search: true,
        searchPlaceholder:'搜索证件号',
        searchSpan: 8,
        maxlength: 20
      },
      {
        label: "所属任务",
        prop: "taskName",
        minWidth: 160,
      },
      {
        label: "调查表",
        prop: "formName",
        minWidth: 160,
      },{
        label: "调查时间",
        prop: "createAt",
        type: 'date',
        format: 'yyyy-MM-dd HH:mm',
        minWidth: 130,
      },
    ]
  }
}
