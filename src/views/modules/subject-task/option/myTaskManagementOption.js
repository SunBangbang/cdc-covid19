import {getDictDataList} from '@/utils'
import tableTitleOptions from "@/utils/tableTitleOptions";
import AppConstant from "@/utils/AppConstant";

export default ()=>{
  const header = tableTitleOptions({
    menuWidth: AppConstant.MENU_BIG_WIDTH,
  })
  return {
    ...header,
    column: [
      {
        label: "发布机构",
        prop: "relDeptName",
        overHidden: true,
        minWidth: 100,
      },
      {
        label: "任务名称",
        prop: "name",
        search: true,
        searchSpan: 6,
        searchPlaceholder: "搜索任务",
        overHidden: true,
        minWidth: 150,
      }, {
        label: "质控员",
        prop: "leaderName",
        overHidden: true,
        minWidth: 60
      },
      {
        label: "开始时间",
        minWidth: 100,
        prop: "start",
        type: "date",
        format: 'yyyy-MM-dd HH:mm',
        valueFormat: 'yyyy-MM-dd hh:mm:ss',
      },
      {
        label: "结束时间",
        minWidth: 100,
        prop: "end",
        type: "date",
        format: 'yyyy-MM-dd HH:mm',
        valueFormat: 'yyyy-MM-dd hh:mm:ss',
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
        search: true,
        searchSpan: 6,
        slot: true
      },
      {
        label: "创建人",
        prop: "createBy",
        slot: true
      },{
        label: "创建时间",
        prop: "createAt",
        type: 'date',
        slot: true,
        format: 'yyyy-MM-dd HH:mm',
        valueFormat: 'yyyy-MM-dd hh:mm:ss',
        minWidth: 100,
      }]
  }
};
