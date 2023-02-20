import {
  getAssistShareModule,
  getAuditSample,
  getAssistSample,
} from "@/api/assistant/assistant";
import AppConstant from "@/utils/AppConstant";

const FormModuleOperType = AppConstant.FormModuleOperType;
export default {
  data() {
    return {
      //协查申请ID
      appId: null,
      surveyFormId: null,
      taskId: null,
      sampleId: null,
      historyId: null,
      //协查样本ID
      asid: null,
      operType: null,
      //协查任务ID
      aTaskId: null,
    };
  },
  methods: {
    /**
     * 根据列title分割表单json，生成多个小表单json,同时根据协查分享模块设置决定表单如何展示, 或隐藏，或只读，或可编辑
     * @json 表单json
     */
    async handleAssistFormjson(json) {
      let shareModule = await this.getAssistShareModule(this.appId);

      let configMap = new Map();
      shareModule.forEach((item) => {
        configMap.set(item.prop, item.type);
      });

      //表单json除去column其他元素,先保存准备后面使用
      let nonClnJson = {};
      Object.keys(json).forEach((itm) => {
        if (itm !== "column") {
          nonClnJson[itm] = json[itm];
        }
      });
      //集体置false
      nonClnJson.emptyBtn = false;
      nonClnJson.saveDraftBtn = false;
      nonClnJson.submitBtn = false;
      nonClnJson.rejectBtn = false;

      let clnsAfterTitle = null;
      let bigTitle = null;
      let smallFormJsons = [];
      let num = 0;
      json.column.forEach((item, index) => {
        if (item.type === "title" || item.typeName === "标题") {
          clnsAfterTitle = [];
          if (bigTitle !== null && num === 0) {
            clnsAfterTitle.push(bigTitle);
            num++;
          }
          clnsAfterTitle.push(item);
          let newJson = Object.assign({}, nonClnJson);
          newJson.column = clnsAfterTitle;
          let type = configMap.get(item.prop);
          if (FormModuleOperType.HIDE === type) {
            newJson = null;
          } else if (FormModuleOperType.READONLY === type) {
            newJson.disabled = true;
            newJson.visible = true;
            newJson.add = false;
            newJson.share = type;
          } else if (FormModuleOperType.EDIT === type) {
            newJson.disabled = false;
            newJson.visible = true;
            newJson.add = false;
            newJson.share = type;
          } else {
            newJson.disabled = false;
            newJson.visible = true;
            newJson.add = true;
            newJson.share = type;
          }
          if (item.coreItem) {
            if (newJson !== null) {
              newJson.coreItem = item.coreItem;
            }
          } else {
            if (newJson !== null) {
              newJson.coreItem = false;
            }
          }

          if (newJson) {
            newJson.title = item.params.html;
            smallFormJsons.push(newJson);
          }
        } else if (item.type === "bigtitle") {
          // big title 应该是表单第一行元素
          if (index === 0) {
            bigTitle = item;
          }
        } else {
          clnsAfterTitle.push(item);
        }
      });

      // console.log('smallFormJsons:', smallFormJsons)
      smallFormJsons.forEach((itm) => {
        console.log(
          "title:",
          itm.title,
          "disabled:",
          itm.disabled,
          "add:",
          itm.add,
          "coreItem:",
          itm.coreItem
        );
      });
      return smallFormJsons;
    },
    async getAssistShareModule(appId) {
      let res = await getAssistShareModule(appId);
      if (res.data.code === 0) {
        this.logShareModule(res.data.data);
        // console.log("---------", res.data.data, "00000000")
        return res.data.data;
      } else {
        console.error("err:", res.data.msg);
        throw new Error("不能获取协查分享模块设置");
      }
    },
    async getAssistSampleData() {
      console.log(
        "operType:",
        this.operType,
        "historyId:",
        this.historyId,
        " asid:",
        this.asid
      );
      if ("create" === this.operType) {
        //创建新的协查样本
        let res = await getAuditSample(
          this.surveyFormId,
          this.historyId,
          this.aTaskId
        );
        if (res.data.code === 0) {
          return res.data.data;
        } else {
          console.error("err:", res.data.msg);
          throw new Error("不能获取协查审核合并样本数据");
        }
      } else {
        //编辑协查样本，查看协查样本
        let res = await getAssistSample(this.surveyFormId, this.asid);
        if (res.data.code === 0) {
          return res.data.data;
        } else {
          console.error("err:", res.data.msg);
          throw new Error("不能获取协查填写样本数据");
        }
      }
    },
    async getAssistSample() {
      let res = await getAssistSample(this.surveyFormId, this.historyId);
      if (res.data.code === 0) {
        return res.data.data;
      } else {
        console.error("err:", res.data.msg);
        throw new Error("不能获取协查审核合并样本数据");
      }
    },
    logShareModule(list) {
      console.log("协查分享模块:");
      list.forEach((item) => {
        let type = item.type;
        if (FormModuleOperType.HIDE === type) {
          console.log(item, "不可见");
        } else if (FormModuleOperType.READONLY === type) {
          console.log(item, "只读");
        } else if (FormModuleOperType.EDIT === type) {
          console.log(item, "编辑");
        } else {
          console.log(item, "编辑");
        }
      });
    },
  },
};
