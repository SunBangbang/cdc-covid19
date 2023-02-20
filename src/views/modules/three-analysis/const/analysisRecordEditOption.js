export const headerTaskOption = {
    size: "mini",
    menu: false,
    addBtn: false,
    refreshBtn: false,
    columnBtn: false,
    column: [{
        label: "分析主题",
        prop: "name",
        span: 24,
        width: 260,
        overHidden: true

    }, {
        label: "调查表",
        prop: "formName",
        span: 24,
        width: '120',
        overHidden: true
    }, {
        label: "关联任务",
        prop: "tasks",
        slot: true
    }],
};

export const headerSampleOption = {
    size: "mini",
    menu: false,
    addBtn: false,
    refreshBtn: false,
    columnBtn: false,
    column: [{
        label: "过滤样本",
        prop: "sampleNum",
        slot: true
    }],
};

export const hoverOption = {
    size: "mini",
    menu: false,
    addBtn: false,
    refreshBtn: false,
    columnBtn: false,
    showHeader: false,
    border: false,
    column: [{
        label: "分析主题",
        prop: "taskName",
        slot: true,
        width: 280,
    }, {
        label: '样本数',
        prop: 'sampTotal',
        slot: true,
        width: 120
    }],
}
