import {getDictDataList} from '@/utils'
import tableTitleOptions from "@/utils/tableTitleOptions";

export default (params) => {
  const header = tableTitleOptions({
    selection: true,
    rowKey: "oid",
  })
  return {
    ...header,
    column: [
      {
        label: "任务名称",
        prop: "name",
        search: true,
        searchPlaceholder: "搜索任务",
        searchSpan: 6,
        overHidden: true,
        minWidth: 160,
      }, {
        label: "质控员",
        prop: "leaderName",
        overHidden: true,
        minWidth: 100
      },
      {
        label: "状态",
        prop: "status",
        type: 'select',
        dicData: getDictDataList('task-status'),
        props: {
          label: 'dictLabel',
          value: 'dictValue'
        },
        slot: true,
        search: true,
        searchSpan: 6,
      },
      {
        label: "开始时间",
        minWidth: 90,
        prop: "start",
        type: "date",
        format: 'yyyy-MM-dd HH:mm',
        valueFormat: 'yyyy-MM-dd hh:mm:ss',
      },
      {
        label: "结束时间",
        minWidth: 90,
        prop: "end",
        type: "date",
        format: 'yyyy-MM-dd HH:mm',
        valueFormat: 'yyyy-MM-dd hh:mm:ss',
      },
      {
        label: "创建人",
        prop: "createBy",
        slot: true
      }, {
        label: "创建时间",
        prop: "createAt",
        type: 'date',
        slot: true,
        format: 'yyyy-MM-dd HH:mm',
        valueFormat: 'yyyy-MM-dd hh:mm:ss',
        minWidth: 120,
      }]
  }
};
