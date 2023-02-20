import {getDictDataList} from "@/utils"
import tableTitleOptions from "@/utils/tableTitleOptions";

export const respondentOption = () => {
  const header = tableTitleOptions({
    searchMenuSpan: 24
  })
  return {
    ...header,
    column: [
      {
        label: "姓名",
        prop: "name",
        search: true
      },
      {
        label: "传报卡号",
        prop: "reportCardId",
        search: true,
        overHidden: true,
      },
      {
        label: "性别",
        prop: "gender",
        type: 'select',
        dicData: getDictDataList('gender'),
        props: {
          label: 'dictLabel',
          value: 'dictValue'
        },
      },
      {
        label: "证件类型",
        prop: "idType",
        type: "select",
        minWidth: 90,
        dicData: [],
        props: {
          label: "dictLabel",
          value: "dictValue"
        }
      },
      {
        label: "证件号",
        prop: "identity",
        search: true,
        overHidden: true,
      },
      {
        label: "手机号",
        prop: "phone",
        search: true,
        overHidden: true,
      },
      {
        label: "工作单位/学校名称",
        prop: "company",
        showWordLimit: true,
        overHidden: true,
        span: 24,
      },
      {
        label: "现住址",
        prop: "address",
        minWidth: 120,
        formslot: true,
        overHidden: true,
        span: 24,
      },
      {
        label: "人群分类",
        prop: "crowd",
        overHidden: true,
        type: "select",
        dicData: [],
        props: {
          label: "dictLabel",
          value: "dictValue"
        }
      },
      {
        label: "发病日期",
        prop: "morbidityDate",
        overHidden: true,
        type: "date",
        format: 'yyyy-MM-dd',
        valueFormat: 'yyyy-MM-dd HH:mm:ss',
      },
      {
        label: "诊断时间",
        prop: "diagnosisDate",
        overHidden: true,
        type: "datetime",
        format: 'yyyy-MM-dd HH:mm',
        valueFormat: 'yyyy-MM-dd HH:mm:ss',
      },
      {
        label: "病例分类",
        prop: "caseType",
        overHidden: true,
        type: "select",
        dicData: [],
        props: {
          label: "dictLabel",
          value: "dictValue"
        }
      },
      {
        label: "是否为输入病例",
        prop: "overseas",
        overHidden: true,
        type: "select",
        dicData: [
          {label:"是", value:"1"},
          {label:"否", value:"0"},
        ],
      },
    ]
  }
}

export const trackOption = (title) => { return {
  indexLabel: '序号',
  index: true,
  stripe: true,
  menuPosition: "left",
  menuType: 'text',
  menuWidth: 120,
  editBtn: false,
  addBtn: false,
  delBtn: false,
  menu: false,
  refreshBtn: false,
  columnBtn: false,
  viewBtn: false,
  size: "mini",
  searchSize: "mini",
  searchMenuSpan: 4,
  searchBtnText: "查询",
  emptyBtnText: "重置",
  selection: false,
  headerAlign: 'center',
  align: 'center',
  title: title,
  titleSize: 'h4',
  titleStyle: {
    'margin-top': '3vh'
  },
  column: [
    {
      label: '开始时间',
      prop: 'start',
      type: 'date',
      format: 'yyyy-MM-dd HH:mm',
      valueFormat: 'yyyy-MM-dd HH:mm:ss'
    },
    {
      label: '结束时间',
      prop: 'end',
      type: 'date',
      format: 'yyyy-MM-dd HH:mm',
      valueFormat: 'yyyy-MM-dd HH:mm:ss'
    },
    {
      label: '地址',
      prop: 'address',
      overHidden: true
    },
    /*{
      label: '是否疫点',
      prop: 'epidSpot',
      filters:true,
      dicData:[{ label: '是', value: '0' }, { label: '否', value: '1' }],
      filterMethod: function(value, row, column) {
        return row.epidSpot === value;
      }
    }*/
  ]
 }
}

