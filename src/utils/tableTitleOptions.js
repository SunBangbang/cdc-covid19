import AppConstant from "@/utils/AppConstant";

/**
 * 避免冗余重复的属性
 */
export default (params) => {
  return {
    index: getValue(true, 'index', params),
    indexLabel: getValue('序号', 'indexLabel', params),
    stripe: getValue(true, 'stripe', params),
    border: getValue(true, 'border', params),
    size: getValue('mini', 'size', params),
    headerAlign: getValue('center', 'headerAlign', params),
    align: getValue('center', 'align', params),
    tree: getValue(false, 'tree', params),
    enter: getValue(false, 'enter', params),
    rowKey: getValue('id', 'rowKey', params),
    defaultExpandAll: getValue(false, 'defaultExpandAll', params),

    cellBtn: getValue(false, 'cellBtn', params),
    editBtn: getValue(false, 'editBtn', params),
    editBtnText: getValue('编辑', 'editBtnText', params),
    addBtn: getValue(false, 'addBtn', params),
    delBtn: getValue(false, 'delBtn', params),
    refreshBtn: getValue(true, 'refreshBtn', params),
    columnBtn: getValue(false, 'columnBtn', params),
    viewBtn: getValue(false, 'viewBtn', params),
    addBtnText: getValue('新增', 'addBtnText', params),
    emptyBtnText: getValue('重置', 'emptyBtnText', params),
    editBtnIcon: getValue(' ', 'editBtnIcon', params),

    searchShowBtn: getValue(false, 'searchShowBtn', params),
    searchBtn: getValue(true, 'searchBtn', params),
    searchSize: getValue('mini', 'searchSize', params),
    searchBtnText: getValue('查询', 'searchBtnText', params),
    searchMenuPosition: getValue('center', 'searchMenuPosition', params),
    searchLabelWidth: getValue(100, 'searchLabelWidth', params),
    searchMenuSpan: getValue(6, 'searchMenuSpan', params),

    selection: getValue(false, 'selection', params),
    reserveSelection: getValue(true, 'reserveSelection', params),

    labelWidth: getValue(110, 'labelWidth', params),
    labelPosition: getValue('right', 'labelPosition', params),

    dialogWidth: getValue('69%', 'dialogWidth', params),
    addTitle: getValue('新增', 'addTitle', params),
    submitBtn: getValue(true, 'submitBtn', params),
    emptyBtn: getValue(true, 'emptyBtn', params),
    emptyText: getValue('暂无数据', 'emptyText', params),
    submitText: getValue('确认', 'submitText', params),
    saveBtnText: getValue('确认', 'saveBtnText', params),
    cancelBtnText: getValue('取消', 'cancelBtnText', params),
    editTitle: getValue('编辑', 'editTitle', params),
    updateBtnText: getValue('修改', 'updateBtnText', params),

    menu: getValue(true, 'menu', params),
    menuWidth: getValue(AppConstant.MENU_WIDTH,'menuWidth', params),
    menuPosition: getValue('left','menuPosition', params),

    menuType: getValue('text','menuType', params),
    menuSpan: getValue(24, 'menuSpan', params),

    lazy: getValue(false, 'lazy', params),
    tip: getValue(false, 'tip', params),

    saveBtn:getValue(true, 'saveBtn', params),
    updateBtn:getValue(true, 'updateBtn', params),
    cancelBtn:getValue(true, 'cancelBtn', params),
  }
}
const getValue = (defaultValue, propName, realValue) => {
  if (hasAnyValue(realValue)) {
    if (hasAnyValue(realValue[propName])) {
      return realValue[propName]
    } else {
      return defaultValue
    }
  } else {
    return defaultValue
  }
}
const hasAnyValue = (value) => {
  if (value !== undefined && value !== null) {
    return true
  } else {
    return false
  }
}
