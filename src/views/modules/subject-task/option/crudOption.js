import { getDictDataList } from "@/utils";
import { isValidIdNo, validatePhone } from "@/utils/validate";
import tableTitleOptions from "@/utils/tableTitleOptions";
import AppConstant from "@/utils/AppConstant";

export const option = (disabled, showMenu, respondent) => {
  console.log(disabled, showMenu);
  const header = tableTitleOptions({
    selection: !showMenu,
    menu: showMenu,
    addBtn: showMenu,
    menuBtn: !disabled,
    menuWidth: AppConstant.MENU_BIG_WIDTH,
    labelWidth: 140,
    dialogWidth: "50%",
    saveBtnText: "确定",
    submitText: "确定",
    updateBtnText: "确定"
  });
  return {
    ...header,
    selectable: row => {
      if (respondent && respondent.length > 0) {
        return respondent.filter(v => v.id === row.id).length <= 0;
      } else {
        return true;
      }
    },
    column: [
      {
        label: "姓名",
        disabled: disabled,
        prop: "name",
        search: true,
        searchSlot: true,
        searchPlaceholder: "搜索姓名",
        minWidth: 60,
        searchSpan: 6,
        maxlength: 20,
        showWordLimit: true,
        overHidden: true,
        rules: [
          {
            required: true,
            message: "请输入姓名",
            trigger: "blur"
          }
        ]
      },
      {
        label: "监护人姓名",
        disabled: disabled,
        prop: "parentName",
        minWidth: 60,
        searchSpan: 6,
        maxlength: 20,
        showWordLimit: true,
        overHidden: true,
      },
      {
        label: "传报卡号",
        prop: "reportCardId",
        search: true,
        disabled: true,
        addDisplay: false,
        addDisabled: true,
        searchSlot: true,
        searchPlaceholder: "搜索传报卡号",
        searchSpan: 6,
        overHidden: true
      },
      {
        label: "年龄",
        disabled: disabled,
        prop: "age",
        type: "number",
        overHidden: true,
        minWidth: 60,
        minRows: 0,
        maxRows: 100
      },
      {
        label: "性别",
        prop: "gender",
        search: true,
        disabled: disabled,
        type: "select",
        searchPlaceholder: "搜索性别",
        minWidth: 60,
        searchSpan: 6,
        dicData: getDictDataList("gender"),
        props: {
          label: "dictLabel",
          value: "dictValue"
        }
      },
      {
        label: "证件类型",
        prop: "idType",
        disabled: disabled,
        type: "select",
        minWidth: 90,
        dicData: [],
        props: {
          label: "dictLabel",
          value: "dictValue"
        }
      },
      {
        label: "证件号",
        prop: "identity",
        disabled: disabled,
        search: true,
        searchSlot: true,
        searchPlaceholder: "搜索证件号",
        minWidth: 150,
        searchSpan: 6,
        maxlength: 18,
        showWordLimit: true,
        overHidden: true,
        rules: [
          { required: true, message: "请输入证件号", trigger: "blur" },
          {
            validator: isValidIdNo,
            message: "请输入正确的证件号",
            trigger: "blur"
          }
        ]
      },
      {
        label: "手机号",
        disabled: disabled,
        prop: "phone",
        search: true,
        searchSlot: true,
        searchPlaceholder: "搜索手机号",
        searchSpan: 6,
        maxlength: 11,
        minWidth: 100,
        showWordLimit: true,
        overHidden: true,
        rules: [{ required: false, validator: validatePhone, trigger: "blur" }]
      },
      {
        label: "出生日期",
        disabled: disabled,
        prop: "birthDate",
        type: "date",
        minWidth: 90,
        format: 'yyyy-MM-dd',
        valueFormat: 'yyyy-MM-dd',
      },
      {
        label: "工作单位/学校名称",
        disabled: disabled,
        prop: "company",
        showWordLimit: true,
        overHidden: true,
        span: 24,
      },
      {
        label: "现住址",
        disabled: disabled,
        prop: "address",
        minWidth: 120,
        formslot: true,
        overHidden: true,
        span: 24,
      },
      {
        label: "人群分类",
        disabled: disabled,
        prop: "crowd",
        overHidden: true,
        type: "select",
        dicData: [],
        props: {
          label: "dictLabel",
          value: "dictValue"
        }
      },
      {
        label: "发病日期",
        disabled: disabled,
        prop: "morbidityDate",
        overHidden: true,
        type: "date",
        format: 'yyyy-MM-dd',
        valueFormat: 'yyyy-MM-dd',
      },
      {
        label: "诊断时间",
        disabled: disabled,
        prop: "diagnosisDate",
        overHidden: true,
        type: "datetime",
        format: 'yyyy-MM-dd HH:mm',
        valueFormat: 'yyyy-MM-dd HH:mm:ss',
      },
      {
        label: "病例分类",
        disabled: disabled,
        prop: "caseType",
        overHidden: true,
        type: "select",
        dicData: [],
        props: {
          label: "dictLabel",
          value: "dictValue"
        }
      },
      {
        label: "是否为输入病例",
        disabled: disabled,
        prop: "overseas",
        overHidden: true,
        type: "select",
        dicData: [
          {label:"是", value:"1"},
          {label:"否", value:"0"},
          ],
      },
      {
        label: "来源",
        prop: "source",
        search: true,
        searchSlot: true,
        disabled: disabled,
        minWidth: 60,
        type: "select",
        addDisplay: false,
        addDisabled: true,
        display: false,
        dicData: getDictDataList("respondent-source"),
        props: {
          label: "dictLabel",
          value: "dictValue"
        },
        searchPlaceholder: "搜索来源",
        searchSpan: 6,
        overHidden: true
      },
      {
        label: "备注",
        type: "textarea",
        span: 24,
        disabled: disabled,
        prop: "remark",
        maxlength: 250,
        showWordLimit: true,
        overHidden: true
      }
    ]
  };
};
export const respondentOption = enableEdit => {
  const header = tableTitleOptions({
    reserveSelection: false,
    selection: enableEdit,
    menu: enableEdit,
    addBtnText: "新增调查对象",
    dialogWidth: "50%",
    refreshBtn: false,
    labelWidth: 140,
    saveBtnText: "确定",
    submitText: "确定",
    updateBtnText: "确定"
  });
  return {
    ...header,
    column: [
      {
        label: "传报卡号",
        prop: "reportCardId",
        disabled: true,
        overHidden: true
      },
      {
        label: "姓名",
        prop: "name",
        maxlength: 20,
        showWordLimit: true,
        overHidden: true,
        rules: [
          {
            required: true,
            message: "请输入姓名",
            trigger: "blur"
          }
        ]
      },
      {
        label: "监护人姓名",
        prop: "parentName",
        minWidth: 60,
        searchSpan: 6,
        maxlength: 20,
        showWordLimit: true,
        overHidden: true,
      },
      {
        label: "年龄",
        prop: "age",
        overHidden: true,
        type: "number",
        minRows: 0,
        maxRows: 100
      },
      {
        label: "性别",
        prop: "gender",
        type: "select",
        dicData: getDictDataList("gender"),
        props: {
          label: "dictLabel",
          value: "dictValue"
        }
      },
      {
        label: "证件类型",
        prop: "idType",
        type: "select",
        minWidth: 90,
        dicData: [],
        props: {
          label: "dictLabel",
          value: "dictValue"
        }
      },
      {
        label: "证件号",
        prop: "identity",
        maxlength: 18,
        overHidden: true,
        showWordLimit: true,
        rules: [
          { required: true, message: "请输入证件号", trigger: "blur" },
          {
            validator: isValidIdNo,
            message: "请输入正确的证件号",
            trigger: "blur"
          }
        ]
      },
      {
        label: "手机号",
        prop: "phone",
        maxlength: 11,
        showWordLimit: true,
        overHidden: true,
        rules: [{ required: false, validator: validatePhone, trigger: "blur" }]
      },
      {
        label: "出生日期",
        prop: "birthDate",
        type: "date",
        minWidth: 90,
        format: 'yyyy-MM-dd',
        valueFormat: 'yyyy-MM-dd',
      },
      {
        label: "工作单位/学校名称",
        prop: "company",
        showWordLimit: true,
        overHidden: true,
        span: 24,
      },
      {
        label: "现住址",
        prop: "address",
        minWidth: 120,
        formslot: true,
        overHidden: true,
        span: 24,
      },
      {
        label: "人群分类",
        prop: "crowd",
        overHidden: true,
        type: "select",
        dicData: [],
        props: {
          label: "dictLabel",
          value: "dictValue"
        }
      },
      {
        label: "发病日期",
        prop: "morbidityDate",
        overHidden: true,
        type: "date",
        format: 'yyyy-MM-dd',
        valueFormat: 'yyyy-MM-dd HH:mm:ss',
      },
      {
        label: "诊断时间",
        prop: "diagnosisDate",
        overHidden: true,
        type: "datetime",
        format: 'yyyy-MM-dd HH:mm',
        valueFormat: 'yyyy-MM-dd HH:mm:ss',
      },
      {
        label: "病例分类",
        prop: "caseType",
        overHidden: true,
        type: "select",
        dicData: [],
        props: {
          label: "dictLabel",
          value: "dictValue"
        }
      },
      {
        label: "是否为输入病例",
        prop: "overseas",
        overHidden: true,
        type: "select",
        dicData: [
          {label:"是", value:"1"},
          {label:"否", value:"0"},
        ],
      },
      {
        label: "备注",
        prop: "remark",
        type: "textarea",
        span: 24,
        maxlength: 250,
        showWordLimit: true,
        overHidden: true
      }
    ]
  };
};

export const investigatorOption = enableEdit => {
  const header = tableTitleOptions({
    reserveSelection: false,
    selection: enableEdit,
    menu: enableEdit,
    menuWidth: AppConstant.MENU_BIG_WIDTH,
    refreshBtn: false
  });
  return {
    ...header,
    column: [
      {
        label: "姓名",
        prop: "realName",
        slot: true,
        maxlength: 20,
        overHidden: true
      },
      {
        label: "用户名",
        prop: "username",
        maxlength: 20,
        overHidden: true
      },
      {
        label: "手机号",
        prop: "mobile",
        maxlength: 11,
        overHidden: true,
        rules: [{ validator: validatePhone, trigger: "blur" }]
      },
      {
        label: "所在机构",
        prop: "deptId",
        dicData: [],
        // hide: true,
        props: {
          label: "label",
          value: "value"
        },
        overHidden: true
      }
    ]
  };
};

export const investigatorDialogOption = (includeAllDept, investigator) => {
  const header = tableTitleOptions({
    selection: true,
    menu: false,
    reserveSelection: true,
    searchMenuSpan: includeAllDept ? 24 : 6,
    searchMenuPosition: includeAllDept ? "right" : "center"
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
        searchSpan: 5,
        overHidden: true
      },
      {
        label: "用户名",
        prop: "username",
        maxlength: 20,
        search: true,
        searchPlaceholder: "搜索用户名",
        searchSpan: 5,
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
      },
      {
        label: "所在机构",
        prop: "deptId",
        type: "selected",
        search: includeAllDept ? true : false,
        searchSlot: true,
        searchPlaceholder: "搜索机构名称",
        searchSpan: 7,
        searchOrder: 6,
        dicData: [],
        // hide: true,
        showColumn: false,
        props: {
          label: "label",
          value: "value"
        },
        overHidden: true
      },
      // {
      //   label: "所在机构",
      //   prop: "deptId",
      //   type: "selected",
      //   dicData: [],
      //   hide: false,
      //   props: {
      //     label: "label",
      //     value: "value"
      //   },
      //   overHidden: true
      // }
    ]
  };
};

export const investigatorHistGroupDialogOption = () => {
  return {
    reserveSelection: true,
    tip: false,
    selection: true,
    selectable: row => {
      return !row.hasChildren;
    },
    addBtn: false,
    addRowBtn: false,
    cellBtn: false,
    border: true,
    index: false,
    stripe: true,
    menu: false,
    menuType: "text",
    menuWidth: 150,
    editBtn: false,
    delBtn: false,
    refreshBtn: false,
    columnBtn: false,
    viewBtn: false,
    size: "mini",
    searchMenuSpan: 12,
    searchMenuPosition: "right",
    menuPosition: "right",
    headerAlign: "left",
    align: "left",
    lazy: true,
    rowKey: "id",
    emptyBtnText: "重置",
    column: [
      {
        label: "任务名称",
        prop: "taskName",
        overHidden: true,
        slot: true
      },
      {
        label: "姓名",
        prop: "realName",
        search: false,
        searchPlaceholder: "搜索姓名",
        searchSpan: 12,
        overHidden: true
      },
      {
        label: "用户名",
        prop: "username",
        search: false,
        searchPlaceholder: "搜索用户名",
        searchSpan: 12,
        overHidden: true
      },
      {
        label: "手机号",
        prop: "mobile",
        search: false,
        searchPlaceholder: "搜索手机号",
        searchSpan: 6,
        overHidden: true
      }
    ]
  };
};

export const investigatorHistTasksDialogOption = () => {
  const header = tableTitleOptions({
    lazy: true,
    menu: false,
    index: false,
    rowKey: "id"
  });
  return {
    ...header,
    selectable: row => {
      return !row.hasChildren;
    },
    column: [
      {
        label: "序号",
        prop: "index",
        fixed: true
      },
      {
        label: "姓名",
        prop: "realName",
        search: true,
        searchPlaceholder: "搜索姓名",
        searchSpan: 6,
        overHidden: true
      },
      {
        label: "隶属组织",
        prop: "trueDeptName",
        search: false,
        searchPlaceholder: "搜索隶属组织",
        searchSpan: 6,
        overHidden: true
      },
      {
        label: "手机号",
        prop: "mobile",
        search: false,
        width: 100,
        overHidden: true
      },
      {
        label: "任务名称",
        prop: "taskName",
        overHidden: true,
        slot: true
      },
      {
        label: "调查对象名称",
        prop: "participant",
        overHidden: true,
        slot: true
      },
      {
        label: "调查时间",
        prop: "createAt",
        overHidden: true,
        slot: true,
        width: 150
      }
    ]
  };
};
