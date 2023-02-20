import tableTitleOptions from "@/utils/tableTitleOptions";

export const draftOption = () => {
  const header = tableTitleOptions()
    return {
        ...header,
        column: [
            {
            label: "任务名称",
            prop: "taskName",
            search: true,
            searchPlaceholder: "搜索任务",
            searchSpan: 8,
            overHidden: true,
            minWidth: 160,
        },{
            label: "更新时间",
            prop: "createDate",
            type: 'date',
            slot: true,
            format: 'yyyy-MM-dd HH:mm',
            valueFormat: 'yyyy-MM-dd hh:mm:ss',
            minWidth: 120,
        }]
    }
};
