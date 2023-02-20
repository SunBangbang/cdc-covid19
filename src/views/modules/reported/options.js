import {getDictDataList} from '@/utils'
import tableTitleOptions from "@/utils/tableTitleOptions"

export const auditRecordOption = () => {
  const header = tableTitleOptions({
    searchMenuSpan: 8
  })
  return {
    ...header,
    column: [
      {
        label: "调查对象",
        prop: "name",
        search: true,
        searchSpan: 8,
        maxlength: 30,
        minWidth: 80
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
        label: "审核进度",
        prop: "progress",
        minWidth: 200,
      }
    ]
  }
}
