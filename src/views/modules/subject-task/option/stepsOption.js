export default (safe) =>{
  // console.log(safe);
  return [{
    title: "任务信息",
    icon: "el-icon-info",
    label: "info"
  },
    {
      title: "关联调查对象",
      icon: "el-icon-user",
      label: "respondent"
    },
  {
    title: "关联调查表",
    icon: "el-icon-document",
    label: "surveyForm"
  },{
    title: "关联调查员",
    icon: "el-icon-user",
    label: "investigator"
  },
  // {
  //   title: "属性设置",
  //   icon: "el-icon-setting"
  // },
  {
    title: "预览任务信息",
    icon: "el-icon-finished"
  }
  ];
};
