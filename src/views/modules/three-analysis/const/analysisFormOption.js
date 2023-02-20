export const analysisFormOption = {
    size: "mini",
    submitBtn: false,
    emptyBtn: false,
    column: [{
        label: "分析主题",
        prop: "name",
        span: 23,
        maxlength: 50,
        rules: [
            // {
            //     "required": true,
            //     "message": "请输入分析主题",
            //     "trigger": "blur"
            // }
        ]
    }, {
        label: "调查表",
        prop: "formId",
        span: 23,
        formslot: true,
        rules: [
            // {
            //     "required": true,
            //     "message": "请选择调查表",
            //     "trigger": "blur"
            // }
        ]
    }, {
        label: '选择任务',
        prop: 'task',
        formslot: true,
        span: 23,
        rules: [
            // {
            //     "required": true,
            //     "message": "请选择任务",
            //     "trigger": "blur"
            // }
        ]
    }],
};
