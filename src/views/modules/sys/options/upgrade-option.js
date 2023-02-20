import { getUserList } from "@/api/user/user";
import Cookies from "js-cookie";
import { hasPermission } from "@/utils";
import tableTitleOptions from "@/utils/tableTitleOptions";
import AppConstant from "@/utils/AppConstant";

export const upgradeOptions = params => {
  const header = tableTitleOptions({
    // addBtn: hasPermission("sys:androidUpgrade:add"),
    menuWidth: AppConstant.MENU_BIG_WIDTH,
    dialogWidth: "50%",
    saveBtnText: "确定",
    submitText: "确定",
    updateBtnText: "确定",
    selection: true,
    reserveSelection: true,
  });
  return {
    ...header,
    column: [
      {
        label: "名称",
        prop: "name",
        row: true,
        rules: [
          {
            required: true,
            message: "请输入名称",
            trigger: "blur"
          }
        ]
      },
      {
        label: "升级包上传",
        prop: "link",
        rules: [
          {
            required: true,
            message: "请上传升级包",
            trigger: "blur"
          }
        ],
        type: "upload",
        action: window.SITE_CONFIG["singleUploadURL"],
        headers: { Authorization: Cookies.get("access_token") },
        propsHttp: {
          res: "data",
          url: "url",
          name: "name"
        },
        fileSize: 100 * 1024 * 1024, //100MB
        tip: "支持文件格式：apk",
        limit: 1,
        data: {
          type: "apk"
        },
        hide: true,
        row: true
      },
      {
        label: "是否强制升级",
        prop: "mandatory",
        hide: true,
        row: true,
      },
      {
        label: "版本号",
        prop: "version",
        row: true,
        search: true,
        searchPlaceholder: "搜索版本号",
        searchSpan: 6,
        rules: [
          {
            required: true,
            message: "请输入版本号",
            trigger: "blur"
          }
        ]
      },
      {
        label: "迭代内容",
        prop: "content",
        type: "textarea",
        row: true,
        overHidden: true,
        rules: [
          {
            required: true,
            message: "请输入迭代内容",
            trigger: "blur"
          }
        ]
      },
      {
        label: "状态",
        prop: "status",
        slot: true,
        row: true,
        addDisplay: false,
        editDisplay: false
      },
      {
        label: "创建时间",
        prop: "createDate",
        type: "date",
        format: "yyyy-MM-dd HH:mm:ss",
        valueFormat: "yyyy-MM-dd hh:mm:ss",
        addDisplay: false,
        editDisplay: false
      },
      {
        label: "发布时间",
        prop: "publishDate",
        type: "date",
        format: "yyyy-MM-dd",
        valueFormat: "yyyy-MM-dd",
        addDisplay: false,
        editDisplay: false,
        search: true,
        searchPlaceholder: "搜索发布时间",
        searchSpan: 6,
        slot: true
      },
      {
        label: "更新人",
        prop: "updater",
        addDisplay: false,
        editDisplay: false,
        props: {
          label: "realName",
          value: "id"
        },
        dicData: getUserList(),
        search: true,
        searchPlaceholder: "搜索更新人",
        searchSpan: 6
      }
    ]
  };
};
