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
    editBtn: false,
    delBtn:false,
    searchMenuSpan: 4,
    align: 'center',
    menuAlign: 'center',
    menuPosition: 'left',
    column: [
        {
            label: '学校名称',
            prop: 'name',
            rules: [{
                required: true,
                message: "请输入名称",
                trigger: "blur"
            }],
            minWidth:100,
            labelWidth:130,
        },
        {
            label: '所在地址',
            prop: 'address',
            labelWidth:130,
            minWidth:150,
        },
        {
            label: '占地面积',
            prop: 'space',
            labelWidth:130,
            minWidth:100,
        },
        {
            label: '年级数量',
            prop: 'numOfGrades',
            addDisplay: false,
            editDisplay: false,
            minWidth:50,
        },
        {
            label: '班级数量',
            prop: 'numOfClasses',
            addDisplay: false,
            editDisplay: false,
            minWidth:50,
        },
        {
            label: '教师人数',
            prop: 'numOfTeachers',
            type:'number',
            minRows:0,
            controls:false,
            labelWidth:130,
            minWidth:50,
        },
        {
            label: '其他职工人数',
            prop: 'numOfOthers',
            type:'number',
            minRows:0,
            controls:false,
            labelWidth:130,
            minWidth:50,
        },
        {
            label: '教学楼数量',
            prop: 'numOfTeachingBuildings',
            type:'number',
            minRows:0,
            controls:false,
            labelWidth:130,
            minWidth:50,
        },
        {
            label: '宿舍楼数量',
            prop: 'numOfDormitoryBuildings',
            type:'number',
            minRows:0,
            controls:false,
            labelWidth:130,
            minWidth:50,
        },
        {
            label: '食堂数量',
            prop: 'numOfCanteens',
            type:'number',
            minRows:0,
            controls:false,
            labelWidth:130,
            minWidth:50,
        },
        {
            label: '食堂供餐情况',
            prop: 'conditionOfFoodSupply',
            formslot:true,
            labelWidth:130,
            minWidth:100,
        },
        {
            label: '供水情况',
            prop: 'conditionOfWaterSupply',
            labelWidth:130,
            minWidth:100,
        },
        {
            label: '公共厕所情况',
            prop: 'conditionOfPublicToilet',
            type: 'select',
            props: {
                label: 'label',
                value: 'value'
            },
            dicData: [
                {
                    label:"水冲厕",
                    value:"水冲厕"
                },
                {
                    label:"旱厕",
                    value:"旱厕"
                }
            ],
            labelWidth:130,
            minWidth:80,
        },
        {
            label: '创建修改时间',
            prop: 'updateDate',
            type: 'date',
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd hh:mm:ss',
            addDisplay: false,
            editDisplay: false,
            minWidth:150,
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
            minWidth:80,
        }
    ]
}