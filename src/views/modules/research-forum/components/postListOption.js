import tableTitleOptions from "@/utils/tableTitleOptions";

export default (safe) => {
  const header = tableTitleOptions()
  return {
    ...header,
    border:false,
    menu: false,
    column: [
      {
        label: "协查主题",
        prop: "name",
        search: true,
        searchSlot: true,
        searchPlaceholder: "帖子主题",
        overHidden: true,
        minWidth: 160,
        slot: true,
        searchSpan:5
      },
      {
        label: "发帖作者",
        search: true,
        searchSlot: true,
        prop: "creatorUserName",
        overHidden: true,
        minWidth: 100,
        searchSpan:5
      },
      {
        label: "发布时间",
        minWidth: 100,
        prop: "createDate",
        type: "date",
        search: true,
        searchSlot: true,
        searchPlaceholder: "发布时间",
        format: 'yyyy-MM-dd HH:mm',
        valueFormat: 'yyyy-MM-dd hh:mm:ss',
        searchSpan:8
      },
      {
        label: "回复/查看",
        prop: "replyView",
        minWidth: 100,
        slot: true,
        hide: false
      },
      {
        label: "最近回复",
        prop: "latestReplyName",
        minWidth: 100,
        hide: false
      }
    ]
  }
}
