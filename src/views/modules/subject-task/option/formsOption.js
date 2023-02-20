import { getDictDataList } from "@/utils";
import { isRegionAddress, isValidIdNo, validatePhone } from "@/utils/validate";
import tableTitleOptions from "@/utils/tableTitleOptions";

export const taskInfoOption = {
  size: "mini",
  labelWidth: 180,
  menuBtn: false,
  column: [
    {
      label: "任务名称",
      prop: "name",
      span: 24,
      maxlength: 50,
      showWordLimit:true,
      rules: [
        { required: true, message: "请输入任务名称" },
        { min: 1, max: 50, message: "长度在 1 到 50 个字符", trigger: "blur" },
      ],
    },
    {
      label: "工作群组名称",
      prop: "chatName",
      span: 24,
      maxlength: 10,
      showWordLimit:true,
      // disabled: true,
      // formslot: true
      rules: [
        { required: true, message: "请输入工作群组名称" },
        { min: 1, max: 10, message: "长度在 1 到 10 个字符", trigger: "blur" },
      ],
    },
    // {
    //   label: '任务发布机构',
    //   prop: 'relDeptId',
    //   type: 'tree',
    //   span: 24,
    //   rules:[{
    //     required: true,
    //     message: '请选择发布机构'
    //   }],
    //   formslot: true
    // },
    // {
    //   label: '起止时间',
    //   prop: 'dueDate',
    //   type: 'daterange',
    //   format: 'yyyy-MM-dd',
    //   valueFormat: 'yyyy-MM-dd HH:mm:ss',
    //   span: 24,
    //   rules:[{
    //     required: true,
    //     message: '请选择起止时间'
    //   }],
    //   formslot: true
    // },
    {
      label: "调查对象地址",
      prop: "address",
      formslot: true,
      span: 20,
      rules: [
        {
          required: true,
          message: "请选择调查对象地址",
          validator: isRegionAddress,
        },
      ],
    },
    {
      label: "任务要求",
      prop: "summary",
      type: "text",
      span: 24,
      formslot: true,
    },
    {
      label: "调查对象单位联系人",
      prop: "contacterObj",
      formslot: true,
      span: 24,
    },
    {
      label: "附件",
      prop: "attachment",
      span: 24,
      formslot: true,
    },
  ],
};

export const surveyFormOption = {
  size: "mini",
  labelWidth: 150,
  menuBtn: false,
  column: [
    {
      label: "调查表",
      prop: "",
      formslot: true,
      rule: [
        {
          required: true,
        },
      ],
    },
  ],
};
export const propSettingOption = {
  size: "mini",
  labelWidth: 180,
  menuBtn: false,
  column: [
    {
      label: "自动获取位置信息",
      prop: "autoLocate",
      type: "switch",
      span: 24,
      labelTip: "移动端自动获取位置需要开启GPS并授予获取应用位置信息权限",
      labelTipPlacement: "right",
      dicData: [true, false],
    },
    {
      label: "要求录制音视频",
      prop: "videoRequired",
      type: "switch",
      span: 24,
      labelTip: "录制现场音视频",
      labelTipPlacement: "right",
      dicData: [true, false],
    },
    {
      label: "要求确认签字",
      prop: "signRequired",
      type: "switch",
      span: 24,
      labelTip: "被调查者确认签字",
      labelTipPlacement: "right",
      dicData: [true, false],
    },
  ],
};

export const investItemFormOption = {
  labelWidth: 0,
  submitBtn: false,
  emptyBtn: false,
  column: [
    {
      label: "",
      prop: "dynamic",
      type: "dynamic",
      span: 24,
      children: {
        align: "center",
        headerAlign: "center",
        column: [
          {
            label: "联系人",
            prop: "name",
            span: 24,
            maxlength: 30,
            row: true,
          },
          {
            label: "联系电话",
            prop: "phone",
            span: 24,
            formslot: true,
          },
        ],
      },
    },
  ],
};
export const respondentFromOption = (disabled) => {
  const header = tableTitleOptions({
    submitBtn: !disabled,
    emptyBtn: !disabled,
    menuPosition: "right",
    menuSpan: 24,
    labelWidth: 140,
    emptyText: "取消",
    submitText: "确定",
  });
  return {
    ...header,
    column: [
      {
        label: "姓名",
        disabled: disabled,
        prop: "name",
        maxlength: 20,
        showWordLimit: true,
        rules: [
          {
            required: true,
            message: "请输入姓名",
            trigger: "blur",
          },
        ],
      },
      {
        label: "监护人姓名",
        disabled: disabled,
        prop: "parentName",
        maxlength: 20,
        showWordLimit: true,
      },
      {
        label: "传报卡号",
        prop: "reportCardId",
        disabled: true,
        overHidden: true,
      },
      {
        label: "年龄",
        disabled: disabled,
        type: "number",
        prop: "age",
        minRows: 0,
        maxRows: 100,
      },
      {
        label: "性别",
        prop: "gender",
        disabled: disabled,
        type: "select",
        dicData: getDictDataList("gender"),
        props: {
          label: "dictLabel",
          value: "dictValue",
        },
      },
      {
        label: "证件类型",
        prop: "idType",
        disabled: disabled,
        type: "select",
        minWidth: 40,
        searchSpan: 6,
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
        maxlength: 18,
        showWordLimit: true,
        overHidden: true,
        rules: [
          { required: true, message: "请输入证件号", trigger: "blur" },
          {
            validator: isValidIdNo,
            message: "请输入正确的证件号",
            trigger: "blur",
          },
        ],
      },
      {
        label: "手机号",
        disabled: disabled,
        prop: "phone",
        overHidden: true,
        maxlength: 11,
        showWordLimit: true,
        rules: [{ required: false, validator: validatePhone, trigger: "blur" }],
      },
      /*{
        label: "调查状态",
        prop: "status",
        disabled: disabled,
        type: 'select',
        display:false,
        dicData: getDictDataList('investigation-status'),
        props: {
          label: 'dictLabel',
          value: 'dictValue'
        },
        overHidden: true,
      },*/
      // {
      //     label: "责任机构",
      //     prop: "deptId",
      //     dicData: getDictDataList('gender'),
      //     props: {
      //         label: 'dictLabel',
      //         value: 'dictValue'
      //     },
      //     overHidden: true,
      // },
      {
        label: "出生日期",
        disabled: disabled,
        prop: "birthDate",
        type: "date",
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
        formslot: true,
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
        disabled: disabled,
        type: "select",
        display: false,
        dicData: getDictDataList("respondent-source"),
        props: {
          label: "dictLabel",
          value: "dictValue",
        },
        overHidden: true,
      },
      {
        label: "备注",
        type: "textarea",
        span: 24,
        disabled: disabled,
        prop: "remark",
        maxlength: 250,
        showWordLimit: true,
        overHidden: true,
      },
    ],
  };
};
export const surveyFormsTreeOption = () => {
  return {
    border: true,
    stripe: true,
    menu: false,
    editBtn: false,
    addBtn: false,
    delBtn: false,
    refreshBtn: false,
    columnBtn: false,
    viewBtn: false,
    headerAlign: 'left',
    align: 'left',
    rowKey:'id',
    defaultExpandAll: true,
    column: [
      {
        label: "表单名称",
        prop: "name",
        overHidden: true,
      },
    ]
  }
};

export const contactersOption = () => {
  return {
    border: true,
    index: true,
    indexLabel: '序号',
    stripe: true,
    menu: false,
    editBtn: false,
    addBtn: false,
    delBtn: false,
    refreshBtn: false,
    columnBtn: false,
    viewBtn: false,
    selection: false,
    align: 'center',
    maxHeight: 300,
    column: [
      {
        label: "联系人",
        prop: "name",
        overHidden: true,
      },
      {
        label: "联系电话",
        prop: "phone",
        overHidden: true,
      }
    ]
  }
};
