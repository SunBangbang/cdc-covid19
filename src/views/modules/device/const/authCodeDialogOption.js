import tableTitleOptions from "@/utils/tableTitleOptions";

export const option = () => {
  const header = tableTitleOptions({
    searchMenuSpan: 8,
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
        searchSpan: 6,
      }
    ]
  }

}
