import {getUserList} from '@/api/user/user'

export const options = {
    dialogDrag: true,
    menuWidth: 200,
    size: 'mini',
    border: true,
    index: true,
    indexLabel: '序号',
    columnBtn:false,
    refreshBtn:false,
    delBtn:false,
    searchMenuSpan: 4,
    align: 'center',
    menuAlign: 'center',
    menuPosition: 'left',
    addBtn:false,
    addRowBtn:false,
    cellBtn:true,
    column: [
        {
            label: '年级名称',
            prop: 'name',
            rules: [{
                required: true,
                message: "请输入名称",
                trigger: "blur"
            }],
            minWidth:100,
            labelWidth:130,
            cell: true,
        },
        {
            label: '走读人数',
            prop: 'numOfDayStudents',
            labelWidth:130,
            minWidth:100,
            addDisplay: false,
            editDisplay: false,
        },
        {
            label: '住校人数',
            prop: 'numOfResidentStudent',
            labelWidth:130,
            minWidth:100,
            addDisplay: false,
            editDisplay: false,
        },
        {
            label: '总人数',
            prop: 'totalNum',
            addDisplay: false,
            editDisplay: false,
            minWidth:100,
        },
        {
            label: '创建修改时间',
            prop: 'updateDate',
            type: 'date',
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd hh:mm:ss',
            addDisplay: false,
            editDisplay: false,
            minWidth:100,
        },
        {
            label: '最近修改',
            prop: 'updater',
            addDisplay: false,
            editDisplay: false,
            type: 'select',
            props: {
                label: 'realName',
                value: 'id'
            },
            dicData: getUserList(),
            minWidth:100,
        }
    ]
}