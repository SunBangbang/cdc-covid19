import tableTitleOptions from "@/utils/tableTitleOptions";

export const userAuditOptions = () => {
  const header = tableTitleOptions({
      editTitle: '填写驳回原因',
      updateBtnText: '提交',
      menuWidth: 150,
      selection: true,
      reserveSelection: true,
  })
  return {
    ...header,
    column: [
      {
        label: '账号',
        prop: 'username',
        editDisplay: false,
        search: true
      },
      {
        label: '姓名',
        prop: 'realName',
        editDisplay: false,
        search: true
      },
      {
        label: '手机号',
        prop: 'mobile',
        editDisplay: false
      },
      {
        label: '部门',
        prop: 'deptId',
        type: 'tree',
        dicData: [],
        props: {
          label: 'name',
          value: 'id'
        },
        editDisplay: false,
        search: true
      },
/*      {
        label: '是否超管',
        prop: 'superAdmin',
        dicData: [
          {
            label: '否',
            value: 0
          },
          {
            label: '是',
            value: 1
          }
        ],
        editDisplay: false
      },*/
      {
        label: '是否调查员',
        prop: 'investigator',
        dicData: [
          {
            label: '否',
            value: 0
          },
          {
            label: '是',
            value: 1
          }
        ],
        editDisplay: false
      },
      {
        label: '审核状态',
        prop: 'status',
        type: 'select',
        props: {
          label: 'label',
          value: 'value'
        },
        dicData: [
          {
            label: '未审核',
            value: 0
          },
          {
            label: '审核通过',
            value: 1
          },
          {
            label: '审核驳回',
            value: 2
          }
        ],
        editDisplay: false
      },
      {
        label: '驳回原因',
        prop: 'reason',
        hide: true,
        type: "textarea",
        rules: [{
          required: true,
          message: "请填写驳回原因",
          trigger: "blur"
        }],
        span: 24
      }
    ]
  }
}
