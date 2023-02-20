<template>
  <div>
    <el-row>
      <el-col>
        <div>
          <i class="el-icon-arrow-left back-button" @click="goBack">返回</i>
        </div>
      </el-col>
    </el-row>
    <el-card>
      <el-form
        :model="dataForm"
        :rules="dataRule"
        ref="dataForm"
        label-width="120px"
        size="mini"
        style="width: 90%"
      >
        <el-row>
          <el-col :span="18">
            <el-form-item prop="name" label="名称">
              <el-input v-model="dataForm.name" placeholder="名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item prop="type" label="类型">
              <el-select
                v-model="dataForm.type"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="item in typeOptions"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="content" label="内容">
              <div id="editor"></div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item prop="receiverList" label="接收对象">
          <span v-if="dataForm.receiverList"
            >已选择 {{ dataForm.receiverList.length }} 人&nbsp;&nbsp;</span
          >
          <el-button size="mini" @click="handleReceiverSelect">
            <svg class="icon-svg" aria-hidden="true">
              <use xlink:href="#icon-addteam"></use>
            </svg>
            选择
          </el-button>
        </el-form-item>
        <el-form-item>
          <div v-for="item in dataForm.formList" :key="item.id">
            <div style="height: 5px" />
            <el-tag size="medium" @close="closeTag(item)" closable
              >{{ item.name }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item label="附件">
          <multi-upload
            v-model="attachment"
            list-type="text"
            uploadBtnText="添加附件"
            type="message"
            :maxCount="limit"
            :fileType="fileType"
            tip="最多5个附件，单个附件最大10M，支持格式：PDF、Word、Excel、Txt、JPG、PNG、ZIP"
          >
          </multi-upload>
        </el-form-item>
        <el-form-item style="text-align: center">
          <el-button @click="handleDraft()">存草稿</el-button>
          <el-button type="primary" @click="handleSend()">发送</el-button>
        </el-form-item>
      </el-form>
      <receiver-select-dialog
        ref="receiverSelectDialog"
        @callback="handleReceiverSelectCallback"
      >
      </receiver-select-dialog>
      <survey-form-select-dialog
        v-if="surveyFormSelectDialogVisible"
        ref="surveyFormSelectDialog"
        @callback="handleSurveyFormSelectCallback"
      >
      </survey-form-select-dialog>
    </el-card>
  </div>
</template>

<script>
import Editor from "wangeditor";
import Cookies from "js-cookie";
import sm4Utils from "@/utils/sm4";
import {
  detail,
  saveOrUpdate,
  getSurveyFormDetail,
} from "@/api/message/message";
import { getDictDataList } from "@/utils";
import AppConstant from "@/utils/AppConstant";
import ReceiverSelectDialog from "./components/receiver-select-dialog";
import MultiUpload from "@/components/upload/multiUpload";
import SurveyFormSelectDialog from "./components/survey-form-select-dialog";
import { editorOptions } from "@/utils/editorOptions";

export default {
  components: {
    ReceiverSelectDialog,
    MultiUpload,
    SurveyFormSelectDialog,
  },
  data() {
    return {
      editorOptions: editorOptions(),
      surveyFormSelectDialogVisible: false,
      limit: 5,
      fileType: [
        "pdf",
        "doc",
        "docx",
        "xlsx",
        "xls",
        "txt",
        "jpg",
        "jpeg",
        "png",
        "zip",
      ],
      dataForm: {
        id: "",
        name: "",
        content: "",
        type: AppConstant.MESSAGE_TYPE_ORDINARY,
        receiverList: [],
        surveyFormList: [],
      },
      typeOptions: getDictDataList("message_type"),
      attachment: [],
      varEditor: null,
    };
  },
  computed: {
    dataRule() {
      return {
        name: [{ required: true, message: "名称不可为空" }],
        content: [{ required: true, message: "内容不可为空" }],
        receiverList: [{ required: true, message: "接收人不可为空" }],
      };
    },
  },
  created() {
    let id = this.$route.params.id;
    if (null != id) {
      this.getInfo(id);
    }
  },
  activated() {
    // console.log("activated");
    const cryptoOpen = this.$store.state.cryptoOpen;
    const key = this.$store.state.key;
    this.varEditor = new Editor("#editor");
    this.varEditor.config.zIndex = 10;
    this.varEditor.config.showFullScreen = false;
    this.varEditor.config.customUploadImg = function (
      resultFiles,
      insertImgFn
    ) {
      console.log(resultFiles);
      const url = window.SITE_CONFIG["uploadURL"] + "/single?type=task";
      let param = new FormData();
      param.append("file", resultFiles[0]);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + Cookies.get("access_token"),
        },
      };
      axios.post(url, param, config).then((res) => {
        if (cryptoOpen) {
          let tmpData = sm4Utils.decrypt(res.data, key);
          res.data = JSON.parse(tmpData);
        }
        console.log(res);
        if (res.data.code === 0) {
          insertImgFn(res.data.data.url);
        } else {
          console.error(res.data.msg);
          this.$message.error("请检查上传文件！失败原因: " + res.data.msg);
        }
      });
    };
    this.varEditor.create();

    if (!!this.dataForm.content) {
      this.varEditor.txt.html(this.dataForm.content);
    }
  },
  beforeDestroy() {
    if (this.varEditor !== null) {
      this.varEditor.destroy();
      this.varEditor = null;
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    // 获取信息
    getInfo(id) {
      let params = {
        id: id,
      };
      detail(params).then((res) => {
        this.dataForm = res.data.data;
        this.dataForm.formList = [];
        this.dataForm.surveyFormList.forEach((item) => {
          getSurveyFormDetail(item, "surveyName").then((res) => {
            this.dataForm.formList.push({
              id: res.data.data.oid,
              name: res.data.data.surveyName,
            });
            this.$forceUpdate();
          });
        });

        this.attachment = JSON.parse(res.data.data.attachment);
        if (!!this.dataForm.content) {
          this.varEditor.txt.html(this.dataForm.content);
        }
      });
    },
    // 保存草稿
    handleDraft() {
      const content = this.varEditor.txt.html();
      this.dataForm.content = content;
      this.$nextTick(() => {
        this.dataForm.status = AppConstant.MESSAGE_STATUS_DRAFT;
      });
      this.handleSave();
    },
    // 消息发送
    handleSend() {
      const content = this.varEditor.txt.html();
      this.dataForm.content = content;
      let reg1 = new RegExp("<p><br> *</p>", "g");
      this.dataForm.content = this.dataForm.content.replace(reg1, "");
      let reg2 = new RegExp("<p>(&nbsp; *)*</p>", "g");
      this.dataForm.content = this.dataForm.content.replace(reg2, "");

      this.$refs["dataForm"].validate((valid) => {
        if (!valid) {
          return false;
        }
        this.$nextTick(() => {
          this.dataForm.status = AppConstant.MESSAGE_STATUS_SEND;
        });
        // console.log('submit message..................', this.dataForm)
        this.handleSave();
      });
    },
    // 保存数据
    handleSave() {
      this.dataForm.attachment = JSON.stringify(this.attachment);
      saveOrUpdate(this.dataForm)
        .then(() => {
          let msg =
            this.dataForm.status === AppConstant.MESSAGE_STATUS_DRAFT
              ? "保存成功"
              : "发送成功";
          this.$message.success(msg);
          // 关闭编辑或修改标签页
          this.$store.state.contentTabs = this.$store.state.contentTabs.filter(
            (item) =>
              item.name !== "message-create" && item.name !== "message-edit"
          );

          this.$router.push("/message-message");
        })
        .catch(() => {});
    },
    // 选择消息接收人
    handleReceiverSelect() {
      if (
        null !== this.dataForm.receiverList &&
        this.dataForm.receiverList.length > 0
      ) {
        this.$refs["receiverSelectDialog"].value = this.dataForm.receiverList;
      }
      this.$refs["receiverSelectDialog"].dialogVisible = true;
    },
    // 选择消息接收人回调
    handleReceiverSelectCallback(ids) {
      this.dataForm.receiverList = ids;
      this.$forceUpdate();
    },
    // 选择关联调查表
    handleSurveyFormSelect() {
      this.surveyFormSelectDialogVisible = true;
      this.$nextTick(() => {
        this.$refs["surveyFormSelectDialog"].receiverData =
          this.dataForm.surveyFormList;
        this.$refs["surveyFormSelectDialog"].getSurveyFormTreeList();
      });
    },
    // 关联调查表回调
    handleSurveyFormSelectCallback(ids, tempData) {
      this.dataForm.surveyFormList = ids;
      this.dataForm.formList = tempData;
      this.surveyFormSelectDialogVisible = false;
    },
    closeTag(val) {
      for (let i = 0; i < this.dataForm.surveyFormList.length; i++) {
        if (this.dataForm.surveyFormList[i] === val.id) {
          this.dataForm.surveyFormList.splice(i, 1);
          i--;
        }
      }
      for (let i = 0; i < this.dataForm.formList.length; i++) {
        if (this.dataForm.formList[i].id === val.id) {
          this.dataForm.formList.splice(i, 1);
          i--;
        }
      }
      this.$forceUpdate();
    },
  },
};
</script>

<style lang="scss" scoped>
.back-button {
  padding: 10px;
  color: #00bfbf;
  cursor: pointer;
}
</style>
