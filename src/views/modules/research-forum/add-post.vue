<template>
  <div>
    <el-row>
      <el-col>
        <div>
          <i class="el-icon-arrow-left back-button" @click="goBack">返回</i>
        </div>
      </el-col>
    </el-row>
    <el-card class="add-card">
      <div class="title">
        <span>发表帖子</span>
      </div>
      <el-form
        :model="dataForm"
        :rules="dataRule"
        ref="dataForm"
        label-width="120px"
        size="mini"
        style="width: 90%; margin-top: 20px"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item prop="name" label="名称">
              <el-input v-model="dataForm.name" placeholder="名称"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item prop="content" label="内容" style="z-index: 100">
              <!-- <avue-ueditor
                v-model="dataForm.content"
                :options="editorOptions"
              ></avue-ueditor> -->
              <div id="editor"></div>
            </el-form-item>
          </el-col>
        </el-row>
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
          <el-button type="primary" size="large" @click="handleSend(1)"
            >发布</el-button
          >
          <el-button
            type="danger"
            size="large"
            plain
            v-if="dataForm.id"
            @click="del"
            >删除</el-button
          >
          <el-button
            size="large"
            @click="handleSend(0)"
            v-if="dataForm.type !== 1 && $route.query.source !== 'survey'"
            >保存草稿</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import Editor from "wangeditor";
import Cookies from "js-cookie";
import MultiUpload from "@/components/upload/multiUpload";
// import { editorOptions } from "@/utils/editorOptions";
import {
  getDetailInfo,
  saveOrUpdate,
  remove,
} from "@/api/research-forum/research-forum";
import moment from "moment/moment";
import sm4Utils from "@/utils/sm4";

export default {
  components: {
    MultiUpload,
  },
  data() {
    return {
      // editorOptions: editorOptions(),
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
        appId: null,
      },
      attachment: [],
      from: "",
      varEditor: null,
    };
  },
  computed: {
    dataRule() {
      return {
        name: [{ required: true, message: "名称不可为空" }],
        content: [{ required: true, message: "内容不可为空" }],
      };
    },
  },
  created() {
    // console.log("created");
  },
  mounted() {
    // console.log("mounted");
  },
  activated() {
    // console.log("activated");
    const cryptoOpen = this.$store.state.cryptoOpen;
    const key = this.$store.state.key;
    if (this.varEditor === null) {
      this.varEditor = new Editor("#editor");
      this.varEditor.config.showFullScreen = false;
      this.varEditor.config.zIndex = 10;
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
    } else {
      this.dataForm = {name: "",content: ""};
      this.varEditor.txt.html("");
    }

    const { id, appId, sampleId } = this.$route.params;
    this.dataForm.appId = appId;
    this.dataForm.sampleId = sampleId;

    if (null != id) {
      this.getInfo(id);
    }
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      console.log("beforeRouteEnter");
      vm.from = from.name;
    });
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    // 获取信息
    async getInfo(id) {
      await getDetailInfo(id).then((res) => {
        if (res.data.data) {
          this.dataForm = res.data.data;
          if (this.varEditor !== null) {
            this.varEditor.txt.html(this.dataForm.content);
          }
          this.attachment = []
          let aList = this.dataForm.fileUrls
            ? this.dataForm.fileUrls.split(",")
            : [];
          if (aList.length > 0) {
            aList.map((v) => {
              let arr = v.split("/");
              this.attachment.push({
                name: arr[arr.length - 1],
                url: v,
              });
            });
          }
        } else {
          this.dataForm = {
            name: "",
            content: "",
          };
        }
      });
    },
    // 消息发送
    handleSend(key) {
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
        this.handleSave(key);
      });
    },
    // 保存数据
    handleSave(type) {
      console.log("save: ", this.dataForm);
      const params = {
        ...this.dataForm,
      };
      params.type = type;
      params.fileUrls =
        this.attachment.length > 0
          ? this.attachment.map((s) => s.url).join(",")
          : "";
      params.updateDate = moment().format("YYYY-MM-DD HH:mm:ss");
      saveOrUpdate(params)
        .then((res) => {
          if (res.data.code == 0) {
            type === 0
              ? this.$message.success("保存成功")
              : this.$message.success("发布成功");
            // 关闭编辑或修改标签页
            this.$store.state.contentTabs =
              this.$store.state.contentTabs.filter(
                (item) =>
                  item.name !== "create-post" && item.name !== "edit-post"
              );
            // this.$router.push('/research-forum')
            this.$router.go(-1);
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch(() => {});
    },
    del() {
      this.$confirm("确定将选择数据删除?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning",
      })
        .then(() => {
          remove(this.dataForm.id).then((res) => {
            if (res.data.code === 0) {
              this.$message.success("操作成功");
              if (this.from === "post-detail") {
                this.$router.push({ path: "/research-forum-index" });
              } else {
                this.$router.back(-1);
              }
            } else {
              this.$message.error(res.data.msg);
            }
          });
        })
        .catch(() => {});
    },
  },
  beforeDestroy() {
    console.log("add-post.vue beforeDestroy");
    if (this.varEditor !== null) {
      this.varEditor.destroy();
      this.varEditor = null;
    }
  },
};
</script>
<style lang="scss" scoped>
.back-button {
  padding: 10px;
  color: #00bfbf;
  cursor: pointer;
}
.title {
  font-size: 16px;
  padding: 15px;
  border-bottom: 1px #eee solid;
}
.add-card {
  min-height: 780px;
}
</style>
