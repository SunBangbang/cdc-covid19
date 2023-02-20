import tableTitleOptions from "@/utils/tableTitleOptions";
import { getDictDataList } from "@/utils";
import AppConstant from "@/utils/AppConstant";
import { validatePhone } from "@/utils/validate";

export const investigationReleaseOption = () => {
  const header = tableTitleOptions({ 
    index: false, 
    menuWidth: 160,
    selection: true,
    reserveSelection: true,
  });
  return {
    ...header,
    selectable: row => {
      return row.hasChildren;
    },
    lazy: true,
    rowKey: "id",
    column: [
      {
        label: "序号",
        prop: "index",
        fixed: true
      },
      {
        label: "协查主题",
        prop: "name",
        search: true,
        searchPlaceholder: "搜索协查主题",
        overHidden: true,
        searchSpan: 8
      },
      {
        label: "调查对象",
        prop: "pName",
        search: true,
        searchPlaceholder: "搜索调查对象",
        width: 100,
        searchSpan: 8
      },
      /* {
        label: '性别',
        prop: 'pgender',
      },*/
      {
        label: "证件号",
        prop: "pIdentity",
        search: true,
        searchPlaceholder: "搜索证件号",
        width: 170,
        searchSpan: 8
      },
      {
        label: "接收人",
        prop: "receiverName",
        width: 100,
        minWidth: 80
      },
      {
        label: "接收组织",
        prop: "deptName",
        search: false,
        searchPlaceholder: "搜索接收组织",
        width: 200,
        overHidden: true,
        searchSpan: 6,
        type: "select"
      },
      {
        label: "申请时间",
        prop: "reqDate",
        search: true,
        searchPlaceholder: "搜索申请日期",
        searchSpan: 8,
        searchSlot: true,
        width: 130,
        type: "date",
        format: "yyyy-MM-dd HH:mm",
        valueFormat: "yyyy-MM-dd HH:mm"
      },
      {
        label: "状态",
        prop: "accept",
        search: false,
        slot: true,
        width: 100,
        searchPlaceholder: "搜索状态",
        searchSpan: 6,
        type: "select",
        dicData: getDictDataList("assist-task-accept-status"),
        props: {
          label: "dictLabel",
          value: "dictValue"
        }
      }
    ]
  };
};

export const investigationDetailOption = () => {
  const header = tableTitleOptions({
    menuWidth: AppConstant.MENU_BIG_WIDTH
  });
  return {
    ...header,
    column: [
      {
        label: "协查主题",
        prop: "name",
        search: true,
        searchPlaceholder: "搜索协查主题",
        overHidden: true,
        minWidth: 200,
        searchSpan: 6
      },
      {
        label: "申请人",
        prop: "applicant",
        width: 70
      },
      {
        label: "申请组织",
        prop: "reqDeptName",
        overHidden: true,
        minWidth: 120,
        search: true,
        searchPlaceholder: "搜索申请组织",
        searchSpan: 6,
        searchSlot: true
      },

      {
        label: "调查对象",
        prop: "pName",
        width: 80,
        search: true,
        searchPlaceholder: "搜索调查对象",
        searchSpan: 6
      },
      {
        label: "性别",
        prop: "pGender",
        width: 70,
        type: "select",
        dicData: getDictDataList("gender"),
        props: {
          label: "dictLabel",
          value: "dictValue"
        }
      },
      {
        label: "证件号",
        prop: "pIdentity",
        overHidden: true,
        minWidth: 100,
        search: true,
        searchPlaceholder: "搜索证件号",
        searchSpan: 6
      },
      {
        label: "申请时间",
        prop: "reqDate",
        search: true,
        searchPlaceholder: "搜索申请日期",
        searchSpan: 12,
        searchSlot: true,
        type: "date",
        format: "yyyy-MM-dd HH:mm",
        valueFormat: "yyyy-MM-dd HH:mm"
      }
    ]
  };
};

export const deptAssistTaskOption = () => {
  const header = tableTitleOptions({
    columnBtn: false,
    menuWidth: 190
  });
  return {
    ...header,
    column: [
      {
        label: "协查主题",
        prop: "name",
        search: true,
        searchPlaceholder: "搜索协查主题",
        searchSpan: 6,
        width: 300,
        overHidden: true
      },
      {
        label: "申请人",
        prop: "applicant",
        width: 100
      },
      {
        label: "申请组织",
        prop: "reqDeptName",
        search: true,
        searchPlaceholder: "搜索申请组织",
        searchSpan: 6,
        searchSlot: true,
        width: 200,
        overHidden: true
      },
      {
        label: "调查对象",
        prop: "pName",
        search: true,
        searchPlaceholder: "搜索调查对象",
        searchSpan: 6,
        width: 100,
        overHidden: true
      },
      {
        label: "性别",
        prop: "pGender",
        width: 50
      },
      {
        label: "证件号",
        prop: "pIdentity",
        search: true,
        searchPlaceholder: "搜索证件号",
        searchSpan: 6,
        width: 150,
        overHidden: true
      },
      {
        label: "申请时间",
        prop: "reqDate",
        width: 130,
        search: true,
        searchPlaceholder: "搜索申请日期",
        searchSpan: 12,
        searchSlot: true,
        type: "date",
        format: "yyyy-MM-dd HH:mm",
        valueFormat: "yyyy-MM-dd HH:mm"
      },
      {
        label: "流调员",
        prop: "investNames",
        overHidden: true
      },
      {
        label: "状态",
        prop: "accept",
        width: 80,
        slot: true,
        search: true,
        searchPlaceholder: "搜索状态",
        searchSpan: 6,
        type: "select",
        dicData: getDictDataList("assist-task-accept-status"),
        props: {
          label: "dictLabel",
          value: "dictValue"
        }
      }
    ]
  };
};

export const investigatorOption = enableEdit => {
  const header = tableTitleOptions({
    selection: true,
    reserveSelection: false,
    refreshBtn: false
  });
  return {
    ...header,
    column: [
      {
        label: "姓名",
        prop: "realName",
        maxlength: 20,
        overHidden: true
      }
    ]
  };
};

export const investigatorDialogOption = investigator => {
  const header = tableTitleOptions({
    selection: true,
    menu: false,
    reserveSelection: true
  });
  return {
    ...header,
    selectable: row => {
      if (investigator) {
        return investigator.filter(v => v.id === row.id).length <= 0;
      } else {
        return true;
      }
    },
    column: [
      {
        label: "姓名",
        prop: "realName",
        search: true,
        searchPlaceholder: "搜索姓名",
        searchSpan: 6,
        overHidden: true
      },
      {
        label: "用户名",
        prop: "username",
        maxlength: 20,
        search: true,
        searchPlaceholder: "搜索用户名",
        searchSpan: 6,
        overHidden: true
      },
      {
        label: "手机号",
        prop: "mobile",
        maxlength: 11,
        search: true,
        searchPlaceholder: "搜索手机号",
        searchSpan: 6,
        overHidden: true
      }
    ]
  };
};
