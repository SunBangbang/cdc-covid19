import {getUserList} from "@/api/user/user";
import tableTitleOptions from "@/utils/tableTitleOptions";

export const messageOption = (params) => {
  const header = tableTitleOptions({})
  return {
    ...header,
    column:[
      {
        label:'名称',
        prop:'name',
        search: true,
        searchSlot: true,
        overHidden: true,
        searchSpan: 6
      },
      {
        label:'类型',
        prop:'type',
        slot: true,
        type: 'select',
        search: true,
        searchSpan: 6,
        props: {
          label: 'dictLabel',
          value: 'dictValue'
        },
        dicData: []
      },
      {
        label: '最近修改',
        prop: 'updateName',
        props: {
          label: 'realName',
          value: 'username'
        },
        dicData: getUserList()
      },
      {
        label: '创建/修改时间',
        prop: 'updateDate',
        type: 'date',
        minWidth: 100,
        format: 'yyyy-MM-dd HH:mm:ss',
        valueFormat: 'yyyy-MM-dd hh:mm:ss'
      },
      {
        label: '状态',
        prop: 'status',
        type: 'select',
        search: true,
        searchSpan: 6,
        props: {
          label: 'dictLabel',
          value: 'dictValue'
        },
        dicData: []
      }
    ]
  }
}
