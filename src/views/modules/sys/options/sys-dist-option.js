import {getUserList} from '@/api/user/user'
import Cookies from "js-cookie"

export const distOptions = {
    // dialogDrag: true,
    menuWidth: 200,
    size: 'mini',
    border: true,
    index: true,
    indexLabel: '序号',
    columnBtn:false,
    refreshBtn:false,
    addBtn: false,
    editBtn: false,
    searchMenuSpan: 4,
    align: 'center',
    menuAlign: 'center',
    menuPosition: 'left',
    column: [
        {
            label: '名称',
            prop: 'name',
            rules: [{
                required: true,
                message: "请输入名称",
                trigger: "blur"
            }],
            row:true,
            labelWidth:130,
        }, {
            label: '离线包上传',
            prop: 'link',
            labelWidth:130,
            rules: [{
                required: true,
                message: "请上传离线包",
                trigger: "blur"
            }],
            type: 'upload',
            accept:'.zip,.rar',
            action:window.SITE_CONFIG['singleUploadURL'],
            headers: {Authorization: Cookies.get('access_token')},
            propsHttp:{
                // res:"data",
                // url:"url",
                // name:"name",
            },
            fileSize: 50*1024*1024,  //50MB
            tip: '支持文件格式：zip,rar',
            limit:1,
            data:{
                type:"other"
            },
            hide: true,
            row:true,
        },
        {
            label: '版本',
            prop: 'version',
            row:true,
            labelWidth:130,
        },
        {
            label: '状态',
            prop: 'status',
            slot: true,
            row:true,
            labelWidth:130,
            addDisplay: false,
            editDisplay: false
        },
        {
            label: '上传时间',
            prop: 'createDate',
            type: 'date',
            format: 'yyyy-MM-dd HH:mm:ss',
            valueFormat: 'yyyy-MM-dd hh:mm:ss',
            addDisplay: false,
            editDisplay: false
        },
        {
            label: '上传者',
            prop: 'creator',
            addDisplay: false,
            editDisplay: false,
            type: 'select',
            props: {
                label: 'realName',
                value: 'id'
            },
            dicData: getUserList()
        }
    ]
}
