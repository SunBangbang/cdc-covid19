export const dataOption = {
  span:6,
  data: [
    {
      title: '调查表',
      count: 604,
      color: 'rgb(46,104,234)',
    },
    {

      title: '样本数量',
      count: 83749,
      color: 'rgb(46,104,234)',
      recentCount: 82,
      text: '昨日',
      icon: 'el-icon-caret-top',
      iconColor: '#33CA00'
    },
    {
      title: '调研人数',
      count: 78401,
      color: 'rgb(46,104,234)',
      recentCount: 82,
      text: '昨日',
      icon: 'el-icon-caret-top',
      iconColor: '#33CA00'
    },
    {
      title: '分析次数',
      count: 890,
      color: 'rgb(46,104,234)',
    },
  ]
}

export const collectDistriOption = {
  indexLabel: '序号',
  index: true,
  indexWidth: 50,
  stripe: true,
  border: true,
  saveBtn:false,
  updateBtn:false,
  cancelBtn:false,
  editBtn: false,
  addBtn: false,
  delBtn: false,
  menu: false,
  menuBtn: false,
  refreshBtn: false,
  columnBtn: false,
  viewBtn: false,
  // searchBtn: false,
  size: "mini",
  searchSize: "mini",
  searchMenuSpan: 14,
  searchBtnText: "查询",
  emptyBtnText: "重置",
  selection: false,
  headerAlign: 'center',
  align: 'center',
  column: [
    {
      label: '姓名',
      prop: 'name',
    },
    {
      label: '调查次数',
      prop: 'investTotal'
    },
    {
      label: '调查人数',
      prop: 'investPeople'
    }
  ]
}
