import tableTitleOptions from "@/utils/tableTitleOptions"
import AppConstant from "@/utils/AppConstant"

export const countryFormOptions = (params) => {
  const header = tableTitleOptions()
  return {
    ...header,
    column: [
      {
        label: '调查表名',
        prop: 'surveyName',
        search: true,
        searchSpan: 6,
        overHidden: true,
        searchPlaceholder: '搜索调查表',
        minWidth:160,
      },
      {
        label: '表单文档',
        prop: 'uploadFile',
        slot: true,
        overHidden: true,
        minWidth: 100
      },
      {
        label: '创建人',
        prop: 'createBy',
        formatter: (row,value) => {
          return value.realName ? value.realName : value.name
        },
        width:120,
      },
      {
        label: '创建时间',
        prop: 'createAt',
        minWidth: 100,
        width: 150,
        type: 'date',
        format: 'yyyy-MM-dd HH:mm'
      },{
        label: '使用次数',
        prop: 'usedNum',
        width: 100
      }, {
        label: '文档模板',
        prop: 'ftl',
        slot: true,
        overHidden: true,
        width: 100,
      },
      {
        label: '备注',
        prop: 'remark',
        overHidden: true,
        width: 120
      }]
  }
}

export const placeFormOptions = (params) => {
  const header = tableTitleOptions()
  return {
    ...header,
    column: [
      {
        width: 60,
        label: '类别',
        prop: 'extend',
        search: true,
        type: 'select',
        searchSpan: 6,
        dicData: [
          {label: '引用', value: AppConstant.FORM_CATEGORY_OTHER},
          {label: '自建', value: AppConstant.FORM_CATEGORY_SELF}
        ],
      },
      {
        label: '调查表名',
        prop: 'surveyName',
        search: true,
        searchSpan: 6,
        overHidden: true,
        searchPlaceholder: '搜索调查表',
        minWidth: 130
      },
      {
        label: '父调查表名称',
        prop: 'parentSurveyName',
        overHidden: true,
        minWidth: 130
      },
      {
        label: '表单文档',
        prop: 'uploadFile',
        slot: true,
        overHidden: true,
        minWidth: 100
      },
      {
        label: '创建人',
        prop: 'createBy',
        formatter: (row,value) => {
          return value.realName ? value.realName : value.name
        },
        width: 70
      },
      {
        label: '创建时间',
        prop: 'createAt',
        minWidth: 100,
        overHidden: true,
        type: 'date',
        format: 'yyyy-MM-dd HH:mm'
      },{
        label: '使用次数',
        prop: 'usedNum',
        width: 100
      },{
        label: '文档模板',
        prop: 'ftl',
        slot: true,
        overHidden: true,
        width: 100,
      },{
        label: '备注',
        prop: 'remark',
        overHidden: true,
        width: 100
      }]
  }
}

export const formModuleOptions = (params) => {
  const header = tableTitleOptions()
  return {
    ...header,
    column: [
      {
        label: '模板名称',
        prop: 'name',
        search: true,
        overHidden: true,
        searchPlaceholder: '模板名称',
        searchSpan: 6,
        minWidth: 160
      },
      {
        label: '创建人',
        prop: 'createBy',
        formatter: (row, value) => {
          return value.realName ? value.realName : value.name
        }
      },
      {
        label: '创建时间',
        prop: 'createAt',
        minWidth: 90
      }]
  }
}

export const preinstallOptions = (params) => {
  const header = tableTitleOptions()
  return {
    ...header,
    column: [
      {
        label: '模板名称',
        prop: 'name',
        search: true,
        searchPlaceholder: '模板名称',
        searchSpan: 6,
      },
      {
        label: '创建人',
        prop: 'createName',
        minWidth: 90
      },
      {
        label: '创建时间',
        prop: 'createDate',
        minWidth: 90,
        type: 'datetime',
        format: 'yyyy-MM-dd HH:mm',
        valueFormat: 'yyyy-MM-dd HH:mm:ss'
      }]

  }
}
