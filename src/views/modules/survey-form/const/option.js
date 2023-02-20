import {getDictDataList} from '@/utils'
import {getUserList} from '@/api/user/user'
import tableTitleOptions from "@/utils/tableTitleOptions"
import AppConstant from "@/utils/AppConstant"

export const tabsOption = {
  column:[{
    label: '新冠肺炎流行病学调查表(5000)',
    icon: 'el-icon-document',
  }]
};

// export const tableOption = {
//   index: true,
//   border: true,
//   indexLabel: '序号',
//   stripe: true,
//   menuPosition: "left",
//   menuType: 'text',
//   menuWidth: 300,
//   editBtn:false,
//   addBtn: false,
//   delBtn: false,
//   refreshBtn: true,
//   columnBtn: false,
//   viewBtn: false,
//   size: "mini",
//   searchSize: "mini",
//   searchMenuSpan: 4,
//   searchBtnText: "查询",
//   emptyBtnText: "重置",
//   selection: false,
//   headerAlign: 'center',
//   align: 'center',
// }
export const surveySampleOption = (params) => {
  console.log("isGroupLeader:", params.isGroupLeader)
  const header = tableTitleOptions({
    menuWidth: params.isGroupLeader ? AppConstant.MENU_LARGEST_WIDTH + 50 : 150,
    selection: true,
    rowKey: "identity",
  })
  return {
    ...header,
    column: [
      {
        label: "调查对象",
        prop: "name",
        searchSpan: 6
      },
      {
        label: "调查对象",
        prop: "participant",
        search: true,
        hide: true,
        searchPlaceholder:'搜索调查对象姓名',
        searchSpan: 6
      },
      {
        label: "性别",
        prop: "sex",
        slot: true
      },{
        label: "证件号",
        prop: "identity",
        minWidth: 160,
        search: true,
        searchPlaceholder:'搜索证件号码',
        // searchSpan: 4
      },{
        label: "状态",
        prop: "status",
        type: 'select',
        slot: true,
        search: true,
        searchPlaceholder:'状态',
        props: {
          label: 'dictLabel',
          value: 'dictValue'
        },
        dicData: getDictDataList('sample-confirm-status')
      }]
  }
}
// export const moreOption = {
//   index: true,
//   border: true,
//   indexLabel: '序号',
//   stripe: true,
//   menuPosition: "left",
//   menuType: 'text',
//   menuWidth:120,
//   editBtn:false,
//   addBtn: false,
//   delBtn: false,
//   refreshBtn: true,
//   columnBtn: false,
//   viewBtn: false,
//   size: "mini",
//   selection: true,
//   selectable:(row, index)=>{
//     //审核按钮勾选使用: 非合并记录, 已提交
//     return row.add !== '合并' && row.submitStatus === '已提交'
//   },
//   searchBtn: false,
//   searchShowBtn:false,
//   searchIcon: false,
//   searchShow:false,
//   headerAlign: 'center',
//   align: 'center',
//   column: [
//     {
//       label: '调查员',
//       prop: 'investigator',
//       search: true,
//       searchPlaceholder: '全部调查员',
//       overHidden: true,
//       props: {
//         label: 'realName',
//         value: 'username'
//       },
//       dicData: getUserList()
//       // searchSpan: 4
//     },
//     {
//       label: "创建/更新时间",
//       minWidth: 100,
//       prop: "updateAt",
//       type: "date",
//       format: 'yyyy-MM-dd HH:mm',
//       valueFormat: 'yyyy-MM-dd hh:mm:ss',
//    },{
//       label: "来源",
//       prop: "source",
//       type: 'select',
//       // searchSpan: 4
//       props: {
//         label: 'dictLabel',
//         value: 'dictValue'
//       },
//      dicData: getDictDataList('sample-channel')
//   },{
//     label: "提交状态",
//     prop: "submitStatus",
//     slot: true,
//     props: {
//       label: 'dictLabel',
//       value: 'dictValue'
//     },
//     dicData: getDictDataList('sample-submit-status')
//   },{
//       label: "审核状态",
//       prop: "auditStatus",
//     },{
//       label: "类型",
//       prop: "add",
//     },{
//     label: '视频数量',
//     prop: 'videoNum',
//   },{
//     label: '音频数量',
//     prop: 'audioNum',
//   }]
// }

