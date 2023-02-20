import {getDictDataList} from '@/utils'
import {getUserList} from '@/api/user/user'
import tableTitleOptions from "@/utils/tableTitleOptions";
import AppConstant from "@/utils/AppConstant";

export const deviceOpt = () => {
  const header = tableTitleOptions({
    searchMenuSpan: 24,
    selection: true,
    editBtn: true,
    addBtn: true,
    saveBtnText: '确定',
    submitText: '确定',
    updateBtnText: '确定'
  })
  return {
    option: {
      ...header,
      column:[
        {
          label:'设备序列号',
          prop:'serialNumber',
          rules:[{
            required:true,
            message:"请输入序列号",
            trigger:"blur"
          }],
          minWidth: 120,
          search: true,
        },
        {
          label:'设备编号',
          prop:'number',
          rules:[{
            required:true,
            message:"请输入设备编号",
            trigger:"blur"
          }],
          minWidth: 100,
          search: true,
        },
        {
          label:'所属分组',
          prop:'groupId',
          type:'tree',
          minWidth: 120,
          clearable: false,
          dicData:[],
          props:{
            label:'name',
            value:'id'
          },
          rules:[{
            required:true,
            message:"请选择所属分组",
            trigger:"blur"
          }],
          search:true,
          overHidden: true,
        },
        {
          label:'生产厂商',
          prop:'manufacturer',
          overHidden: true,
        },
        {
          label:'APP客户端版本号',
          minWidth: 120,
          prop:'version'
        },
        {
          label:'激活状态',
          prop:'activeStatus',
          type:'select',
          props: {
            label: 'dictLabel',
            value: 'dictValue'
          },
          dicData: getDictDataList('active_status'),
          search:true,
        },
        {
          label:'首次登录时间',
          prop:'startTime',
          type: 'date',
          minWidth: 160,
          format: 'yyyy-MM-dd HH:mm:ss',
          valueFormat: 'yyyy-MM-dd HH:mm:ss',
          addDisplay:false,
          editDisplay:false
        },
        {
          label:'最后登录时间',
          prop:'recentTime',
          type: 'date',
          minWidth: 95,
          format: 'yyyy-MM-dd HH:mm:ss',
          valueFormat: 'yyyy-MM-dd HH:mm:ss',
          addDisplay:false,
          editDisplay:false
        },
        {
          label:'最后登录者',
          prop:'loginName',
          minWidth: 90,
          addDisplay:false,
          editDisplay:false,
          props: {
            label: 'realName',
            value: 'username'
          },
          dicData: getUserList()
        },
        {
          label:'备注',
          prop:'remarks',
          overHidden: true,
          type: 'textarea'
        }]
    }
  }
}
