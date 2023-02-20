import tableTitleOptions from "@/utils/tableTitleOptions";

export const option = () => {
  const header = tableTitleOptions({
    searchMenuSpan: 6,
    menu: false
  })
  return {
    ...header,
    column: [
      {
        label: '授权码',
        prop: 'authCode',
      },
      {
        label: '状态',
        prop: 'status',
        type: 'select',
        dicData:[{label: "未使用", value: 0}, {label: "已使用", value: 1}],
        search: true,
        slot:true,
        searchSpan: 5,
      },
      {
        label: '隶属组织',
        prop: 'deptName',
        search: true,
        searchSlot: true,
        searchSpan: 6,
      },
      {
        label: '包含下级',
        prop: 'includeSub',
        search: true,
        searchSlot: true,
        searchSpan: 2,
        hide: true
      },
      {
        label: '姓名',
        prop: 'personName',
        search: true,
        searchSpan: 5,
      },
    ]
  }

}
