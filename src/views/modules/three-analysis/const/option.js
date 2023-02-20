import AppConstant from "@/utils/AppConstant"
import {getDictDataList} from '@/utils'
import {getUserList} from '@/api/user/user'
import tableTitleOptions from "@/utils/tableTitleOptions";

export const option = {
    border: true,
    index: true,
    indexLabel: '序号',
    stripe: true,
    menuPosition: "left",
    menuType: 'text',
    editBtn: false,
    addBtn: false,
    addBtnText: '新增',
    delBtn: false,
    viewBtn: false,
    columnBtn: false,
    searchShowBtn: false,
    size: "mini",
    searchSize: "mini",
    searchMenuSpan: 6,
    searchBtnText: "查询",
    emptyBtnText: "重置",
    dialogWidth: '40%',
    menuWidth: AppConstant.MENU_WIDTH,
    column: [{
        label: "分析主题",
        prop: "name",
        span: 24,
        search: true,
        overHidden: true
    }, {
        label: "调查表",
        prop: "formName",
        span: 24,
        overHidden: true
        // type: 'select',
        // props: {
        //     value: 'oid',
        //     label: 'surveyName'
        // },
        // dicData: window.SITE_CONFIG['surveyForm']
    }, {
        label: "最近修改",
        prop: "modifyBy",
        slot: true,
        display: false
    }, {
        label: "创建/修改时间",
        prop: "modifyAt",
        type: 'date',
        slot: true,
        format: 'yyyy-MM-dd HH:mm:ss',
        valueFormat: 'yyyy-MM-dd HH:mm:ss',
        minWidth: 120,
        display: false
    }],
};

export const tableOption = () => {
  const header = tableTitleOptions({
    refreshBtn: false,
    selection: true,
    menu: false
  })
  return {
    ...header,
    column: [
      {
        label: "参与者",
        prop: "participant",
        search: false,
        searchPlaceholder:'搜索参与者姓名',
        searchSpan: 6,
        minWidth: 200,
      },{
        label: "性别",
        prop: "sex",
        slot: true
      },{
        label: "证件号",
        prop: "identity",
        minWidth: 160,
        search: false,
        searchPlaceholder:'搜索证件号码',
        // searchSpan: 4
      },{
        label: "审核时间",
        minWidth: 100,
        prop: "updateAt",
        type: "date",
        format: 'yyyy-MM-dd',
        valueFormat: 'yyyy-MM-dd hh:mm:ss',
      },
      /*{
      label: "状态",
      prop: "status",
      type: 'select',
      slot: true,
      search: false,
      searchPlaceholder:'状态',
      props: {
          label: 'dictLabel',
          value: 'dictValue'
      },
      dicData: getDictDataList('sample-status')
  },*/
      {
        label: '调查员',
        prop: 'investigator',
        search: false,
        searchPlaceholder: '全部调查员',
        overHidden: true,
        props: {
          label: 'realName',
          value: 'username'
        },
        dicData: getUserList()
        // searchSpan: 4
      }]
  }
}
// export const tableOption = {
//     index: true,
//     border: true,
//     indexLabel: '序号',
//     stripe: true,
//     menuPosition: "left",
//     menuType: 'text',
//     menuWidth: 280,
//     editBtn:false,
//     addBtn: false,
//     delBtn: false,
//     menu: false,
//     refreshBtn: false,
//     columnBtn: false,
//     viewBtn: false,
//     size: "mini",
//     searchSize: "mini",
//     searchMenuSpan: 4,
//     searchBtnText: "查询",
//     emptyBtnText: "重置",
//     selection: true,
//     headerAlign: 'center',
//     align: 'center',
// }
