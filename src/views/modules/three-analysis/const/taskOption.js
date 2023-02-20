export default (safe) => {
    console.log(safe);
    return {
        index: true,
        indexLabel: '序号',
        stripe: true,
        menu: false,
        size: "mini",
        searchSize: "mini",
        searchMenuSpan: 6,
        searchBtnText: "查询",
        emptyBtnText: "重置",
        selection: true,
        column: [{
            label: "分类",
            prop: "categoryName",
        }, {
            label: "任务名称",
            prop: "name",
            search: true,
            searchSlot: true,
            searchPlaceholder: "搜索任务"
        },
            /*{
            label: "调查数量",
            prop: "surveyCount",
            minWidth: 80,
            slot: true
        }, */
            {
            label: "任务状态",
            prop: "status",
            slot: true
        }, {
            label: "任务开始时间",
            minWidth: 100,
            prop: "start",
            type: "date",
            format: 'yyyy-MM-dd HH:mm',
            valueFormat: 'yyyy-MM-dd hh:mm:ss',
        }, {
            label: "任务结束时间",
            minWidth: 100,
            prop: "end",
            type: "date",
            format: 'yyyy-MM-dd HH:mm',
            valueFormat: 'yyyy-MM-dd hh:mm:ss',
        }, {
            label: "计划样本",
            prop: "minSample",
            minWidth: 80
        }, {
            label: "回收样本",
            prop: "actualSample",
            minWidth: 80
        }, {
            label: "最近修改",
            prop: "modifyBy",
            slot: true
        }, {
            label: "创建/修改时间",
            prop: "modifyAt",
            type: 'date',
            slot: true,
            format: 'yyyy-MM-dd HH:mm',
            valueFormat: 'yyyy-MM-dd hh:mm:ss',
            minWidth: 120,
        }]
    }
};
