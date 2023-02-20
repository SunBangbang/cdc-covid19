import AppConstant from "@/utils/AppConstant"
import {getDictDataList} from '@/utils'

export const option = {
    border: true,
    index: true,
    indexLabel: '序号',
    stripe: true,
    menuPosition: "left",
    align: "center",
    menuType: 'text',
    editBtn: false,
    addBtn: false,
    // addBtnText: '新增',
    delBtn: false,
    viewBtn: false,
    columnBtn: false,
    searchShowBtn: false,
    size: "mini",
    searchSize: "mini",
    searchMenuSpan: 6,
    searchBtnText: "查询",
    emptyBtnText: "重置",
    dialogWidth: '40%',
    menuWidth: AppConstant.MENU_WIDTH,
    column: [{
        label: "姓名",
        prop: "participant",
        span: 24,
        overHidden: true
    }, {
        label: "证件号",
        prop: "identity",
        span: 24,
        overHidden: true
    }, {
        label: "性别",
        prop: "gender",
        type: "select",
        dicData: getDictDataList('gender'),
        props: {
            label: 'dictLabel',
            value: 'dictValue'
        }
    }, {
        label: "密接数量",
        prop: "total",
        minWidth: 120,
    }],
}
