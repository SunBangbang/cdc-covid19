const titleColums = [
    {
        type: 'bigtitle',
        typeName: '主标题',
        title: '主标题',
        icon: 'icon-zhubiaoti',
        edit: true,
        labelWidth: '40',
        component: 'h1',
        span: 24,
        styles: {
            color: 'red',
            textAlign: 'center'
        },
        params: {
            html: '主标题',
        }
    },
    {
        type: 'description',
        typeName: '描述信息',
        title: '描述信息',
        edit: true,
        icon: 'icon-miaoshuxinxi',
        labelWidth: '40',
        component: 'p',
        span: 24,
        styles: {
            color: 'red',
            textAlign: 'center'
        },
        params: {
            html: '描述信息',
        }
    },
    {
        type: 'title',
        typeName: '标题',
        title: '标题',
        edit: true,
        icon: 'icon-biaoti',
        labelWidth: '40',
        component: 'h3',
        span: 24,
        styles: {
            color: 'red'
        },
        params: {
            html: '标题',
        }
    }
]

export default [
    {
        title: '布局字段',
        list: [
            ...titleColums,
            {
                type: 'group',
                typeName: '分组',
                label: '分组',
                edit: true,
                icon: 'icon-fenzu',
                display: true,
                arrow: false,
                collapse: true,
                children: {
                    column: []
                }
            },
            {
                type: 'dynamic',
                typeName: '子表单',
                label: '子表单',
                icon: 'icon-zibiaodan',
                span: 24,
                display: true,
                edit: true,
                children: {
                    type: 'form',
                    index: false,
                    align: 'center',
                    headerAlign: 'center',
                    addBtn: true,
                    delBtn: true,
                    column: []
                }
            }
        ]
    },
    {
        title: '通用组件',
        list: [
            {
                //component: 'avue-radio',
                type: 'radio',
                typeName: '单选框组',
                label: '单选框组',
                edit: true,
                icon: 'icon-danxuankuangzu',
                dicData: [
                    {label: '选项一', value: '0'},
                    {label: '选项二', value: '1'},
                    {label: '选项三', value: '2'},
                ],
                span: 24,
                display: true,
                dicOption: 'static'
            },
            {
                //component: 'el-checkbox',
                type: 'checkbox',
                typeName: '多选框组',
                label: '多选框组',
                edit: true,
                icon: 'icon-duoxuankuangzu',
                dicData: [
                    {label: '选项一', value: '0'},
                    {label: '选项二', value: '1'},
                    {label: '选项三', value: '2'},
                ],
                span: 24,
                display: true,
                dicOption: 'static'
            },
            {
                type: 'input',
                typeName: '单行文本',
                label: '单行文本',
                edit: true,
                icon: 'icon-danhangwenben',
                span: 24,
                display: true
            },
             {
                type: 'textarea',
                typeName: '多行文本',
                label: '多行文本',
                icon: 'icon-duohangwenben',
                edit: true,
                span: 24,
                display: true
            }, {
                type: 'number',
                typeName: '计数器',
                label: '计数器',
                edit: true,
                icon: 'icon-jishuqi',
                span: 24,
                display: true
            }, {
                type: 'select',
                typeName: '下拉选择器',
                label: '下拉选择器',
                edit: true,
                icon: 'icon-xialaxuanzeqi',
                dicData: [
                    {label: '选项一', value: '0'},
                    {label: '选项二', value: '1'},
                    {label: '选项三', value: '2'},
                ],
                span: 24,
                display: true,
                dicType: 'static'
            },
            {
                type: 'date',
                typeName: '日期',
                label: '日期',
                edit: true,
                icon: 'icon-riqi',
                span: 24,
                display: true,
                format: 'yyyy-MM-dd',
                valueFormat: 'yyyy-MM-dd'
            }, {
                type: 'time',
                typeName: '时间',
                label: '时间',
                edit: true,
                icon: 'icon-shijian',
                span: 24,
                display: true,
                format: 'HH:mm',
                valueFormat: 'HH:mm:ss'
            }, {
                type: 'datetime',
                typeName: '日期时间',
                label: '日期时间',
                edit: true,
                icon: 'icon-riqishijian',
                span: 24,
                display: true,
                format: 'yyyy-MM-dd HH:mm',
                valueFormat: 'yyyy-MM-dd HH:mm:ss'
            }, {
                type: 'daterange',
                typeName: '日期范围',
                label: '日期范围',
                edit: true,
                icon: 'icon-shijianfanwei',
                span: 24,
                display: true,
                format: 'yyyy-MM-dd',
                valueFormat: 'yyyy-MM-dd'
            }, {
                type: 'map',
                typeName: '地图选择器',
                component: 'MapSelectItem',
                label: '地图选择器',
                edit: true,
                icon: 'icon-dituxuanzeqi',
                span: 24,
                display: true
            }, {
                type: 'upload',
                typeName: '附件',
                component:'UploadItem',
                label: '附件',
                edit: true,
                icon: 'icon-fujian',
                span: 24,
                display: true,
                showFileList: true,
                multiple: true,
                limit: 10,
                props: {},
                propsHttp: {},
                canvasOption: {},
                headersConfig: [],
                dataConfig: []
            },
            {
                type: 'regionSelect',
                typeName: '地址选择',
                edit: true,
                component: 'RegionSelectItem',
                label: '地址选择',
                icon: 'icon-dizhixuanze',
                span: 24,
                display: true,
                showDetailedAddress:true
            },
            {
                type: 'table',
                typeName: '表格',
                edit: true,
                component: 'TableItem',
                label: '表格选择',
                icon: 'icon-zibiaodan',
                span: 24,
                display: true,
                showDetailedAddress:true
            },
        ]
    },
    {
        title: 'pc端组件',
        list: [
            {
                type: 'password',
                typeName: '密码',
                label: '密码',
                edit: true,
                icon: 'icon-mima',
                span: 24,
                display: true
            },
            {
                type: 'cascader',
                typeName: '级联选择器',
                label: '级联选择器',
                edit: true,
                icon: 'icon-jilianxuanzeqi',
                span: 24,
                display: true,
                dicData: [
                    {
                        label: '选项一',
                        value: 0,
                        children: [{
                            label: '选项1-1',
                            value: 11,
                        }, {
                            label: '选项1-2',
                            value: 12,
                        }]
                    },
                    {label: '选项二', value: 1},
                    {label: '选项三', value: 2},
                ],
                cascaderIndex: 1,
                showAllLevels: true,
                dicOption: 'static',
                separator: "/",
                props: {
                    label: 'label',
                    value: 'value'
                }
            },
            {
                type: 'timerange',
                typeName: '时间范围',
                label: '时间范围',
                edit: true,
                icon: 'icon-shijianfanwei',
                span: 24,
                display: true,
                format: 'HH:mm',
                valueFormat: 'HH:mm:ss'
            }, {
                type: 'datetimerange',
                typeName: '日期时间范围',
                label: '日期时间范围',
                edit: true,
                icon: 'icon-riqishijianfanwei',
                span: 24,
                display: true,
                format: 'yyyy-MM-dd HH:mm',
                valueFormat: 'yyyy-MM-dd HH:mm:ss'
            },
            {
                type: 'autoFill',
                typeName: '智能填写',
                component: 'AutoFill',
                label: '智能填写',
                icon: 'icon-zhinengtianxie',
                span: 24,
                display: true,
            }
        ]
    },
    // {
    //     title: '移动端组件',
    //     list: [
    //         {
    //             type: 'ASR',
    //             typeName: '语音识别',
    //             component: 'ASRItem',
    //             label: '语音识别',
    //             icon: 'icon-ASR',
    //             span: 24,
    //             display: true,
    //             environment: "mobile"
    //         },
    //         {
    //             type: 'measureTemperature',
    //             typeName: '测温',
    //             component: 'measureTemperatureItem',
    //             label: '测温',
    //             icon: 'icon-measureTemperature',
    //             span: 24,
    //             display: true,
    //             environment: "mobile"
    //         }
    //     ]
    // }
]
