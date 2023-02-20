<template>
  <div>
    <back-bar></back-bar>
    <el-card class="post-card">
      <!-- 标题 -->
      <div class="card-head">
        <span class="title">{{ dataDetail.name }}</span>
        <div class="title-detail">
          <div>
            <span>{{ dataDetail.updateDate | formatDate }}</span>
            <div
              class="edit-box"
              v-if="
                dataDetail.creator == $store.state.user.id &&
                $route.query.source !== 'inves' &&
                $route.query.source !== 'survey'
              "
            >
              <el-divider direction="vertical"></el-divider>
              <el-button type="text" @click="edit">编辑</el-button>
              <el-divider direction="vertical"></el-divider>
              <el-link type="danger" :underline="false" @click="del"
                >删除</el-link
              >
            </div>
          </div>
          <div>
            <span class="view">查看:{{ dataDetail.viewCount }}人</span>
            <span>回复:{{ dataDetail.replyCount }}人</span>
          </div>
        </div>
      </div>
      <!-- 帖子内容 -->
      <div class="content-box">
        <div class="card-content" v-html="dataDetail.content"></div>
      </div>
      <!-- 附件 -->
      <div class="attachment-box">
        <div v-if="attachment && attachment.length > 0">
          <span style="font-size: 14px">附件:</span>
          <div v-for="item in attachment" :key="item.index">
            <div v-if="item.name !== null && item.name !== undefined">
              <el-link type="primary" :href="item.url" :underline="false">{{
                item.name
              }}</el-link>
            </div>
          </div>
        </div>
      </div>
      <!-- 评论 -->
      <div class="comment-box" id="comment-box">
        <span class="comment-title">评论</span>
        <!-- 主评论 -->
        <div v-if="replyList && replyList.length > 0" style="padding: 15px">
          <div v-for="(reply, index) in replyList" :key="index" class="f-box">
            <el-avatar
              v-if="reply.headUrl"
              :size="40"
              :src="reply.headUrl"
              style="margin-top: 10px"
            ></el-avatar>
            <el-avatar
              v-else
              :size="40"
              :src="headImgUrl"
              style="margin-top: 10px"
            ></el-avatar>
            <div class="f-detail">
              <span class="member-name m-r">{{ reply.memberName }}</span>
              <span class="m-r">{{ reply.deptName }}</span>
              <span class="update-time"
                >发表于{{ reply.updateDate | formatDate }}</span
              >
              <div v-html="reply.content" class="reply-content"></div>
              <div class="reply-btn">
                <span
                  class="m-r"
                  @click="delReply(reply)"
                  v-show="reply.memberId == $store.state.user.id"
                  >删除</span
                >
                <span @click="handleSend(reply)">回复</span>
              </div>
            </div>
            <!-- 子评论 -->
            <div
              v-if="
                reply.assistForumThreadDTO &&
                reply.assistForumThreadDTO.length > 0
              "
            >
              <div
                v-for="(assist, idx) in reply.assistForumThreadDTO"
                :key="idx"
                class="a-box"
                :class="{ 'b-gray': idx % 2 == 0 }"
              >
                <el-avatar
                  v-if="assist.headUrl"
                  :size="40"
                  :src="assist.headUrl"
                  style="margin-top: 10px"
                ></el-avatar>
                <el-avatar
                  v-else
                  :size="40"
                  :src="headImgUrl"
                  style="margin-top: 10px"
                ></el-avatar>
                <div class="f-detail a-detail">
                  <span class="member-name m-r">{{ assist.memberName }}</span>
                  <span class="m-r">{{ assist.deptName }}</span>
                  <span v-show="assist.pid"
                    >回复 {{ assist.pmemberName }} {{ assist.pdeptName }}</span
                  >
                  <span>:</span>
                  <div v-html="assist.content" class="assist-content"></div>
                  <div class="assist-right">
                    <span class="update-time m-r">{{
                      assist.updateDate | formatDate
                    }}</span>
                    <span
                      @click="delReply(assist)"
                      class="assist-btn m-r"
                      v-show="assist.memberId == $store.state.user.id"
                      >删除</span
                    >
                    <span @click="handleSend(reply, assist)" class="assist-btn"
                      >回复</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
          <el-pagination
            @current-change="handleCurrentChange"
            :current-page.sync="page.currentPage"
            :page-size="page.pageSize"
            layout="total, prev, pager, next"
            :total="page.total"
          >
          </el-pagination>
        </div>
      </div>
      <!-- 发表回复 -->
      <div class="reply-box">
        <el-form
          :model="replyForm"
          :rules="dataRule"
          ref="replyForm"
          size="mini"
          style="width: 90%; margin-top: 20px"
        >
          <el-form-item prop="content">
            <div id="reply-ueditor"></div>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="handleSend" style="margin-top: 20px"
          >发表回复</el-button
        >
      </div>
    </el-card>
    <el-dialog
      :title="replyTitle"
      :visible.sync="showReplyDialog"
      width="60%"
      :destroy-on-close="true"
      @opened="showEditor()"
      @closed="hideEditor()"
    >
      <div id="dialog-ueditor"></div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onDialogSubmit" :loading="btnLoading"
          >确 定</el-button
        >
        <el-button @click="onClose">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Editor from "wangeditor";
import Cookies from "js-cookie";
import {
  getDetail,
  getDetailInfo,
  getReplyList,
  sendReply,
  removeReply,
} from "@/api/research-forum/research-forum";
import moment from "moment";
import BackBar from "@/components/back-bar/back-bar";
import { remove } from "@/api/research-forum/research-forum";
import sm4Utils from "@/utils/sm4";

export default {
  components: { BackBar },
  data() {
    return {
      replyForm: {
        content: "",
      },
      dataDetail: {},
      replyList: [],
      attachment: [],
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
      },
      headImgUrl: "",
      currentReply: {},
      currentAssist: {},
      dialogContent: "",
      showReplyDialog: false,
      btnLoading: false,
      replyTitle: "回复",
      replyEditor: null,
      dialogEditor: null,
      userDefHeadImg: require("@/assets/img/userDefHeadImg.png"),
      from: ""
    };
  },
  activated() {
    const cryptoOpen = this.$store.state.cryptoOpen;
    const key = this.$store.state.key;
    if (this.replyEditor === null) {
      this.replyEditor = new Editor("#reply-ueditor");
      this.replyEditor.config.zIndex = 10;
      this.replyEditor.config.showFullScreen = false;
      this.replyEditor.config.customUploadImg = function (
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
      this.replyEditor.create();
    }

    this.init();
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.from = from.name;
    });
  },
  computed: {
    dataRule() {
      return {
        content: [{ required: true, message: "内容不可为空" }],
      };
    },
  },
  filters: {
    formatDate(value) {
      return moment(value).format("YYYY-MM-DD HH:mm");
    },
  },
  methods: {
    init() {
      let id = this.$route.params.id;
      if (null != id) {
        this.getInfo(id);
        this.getReplyList(id);
      }
      this.headImgUrl = this.userDefHeadImg;
    },
    // 获取帖子详情
    getInfo(id) {
      this.attachment = [];
      if (this.from === "edit-post") {
        getDetailInfo(id).then((res) => {
          if (res.data.code == 0) {
            this.dataDetail = res.data.data;
            let aList = this.dataDetail.fileUrls
              ? this.dataDetail.fileUrls.split(",")
              : [];
            if (aList.length > 0) {
              aList.map((v) => {
                let arr = v.split("/");
                let name = arr[arr.length - 1]
                arr[arr.length - 1] = encodeURIComponent(arr.pop())
                this.attachment.push({
                  name: name,
                  url: arr.join('/'),
                });
              });
            }
          } else {
            this.$message.error(res.data.msg);
          }
        });
      } else {
        getDetail(id).then((res) => {
          if (res.data.code == 0) {
            this.dataDetail = res.data.data;
            let aList = this.dataDetail.fileUrls
              ? this.dataDetail.fileUrls.split(",")
              : [];
            if (aList.length > 0) {
              aList.map((v) => {
                let arr = v.split("/");
                let name = arr[arr.length - 1]
                arr[arr.length - 1] = encodeURIComponent(arr.pop())
                this.attachment.push({
                  name: name,
                  url: arr.join('/'),
                });
              });
            }
          } else {
            this.$message.error(res.data.msg);
          }
        });
      }
    },
    // 获取回复列表
    getReplyList(id) {
      getReplyList(this.page.currentPage, this.page.pageSize, id).then(
        (res) => {
          if (res.data.code == 0) {
            this.replyList = res.data.data.list;
            this.page.total = res.data.data.total;
          } else {
            this.$message.error(res.data.msg);
          }
        }
      );
    },
    edit() {
      this.$router.push({
        name: "edit-post",
        params: { id: this.dataDetail.id },
      });
    },
    del() {
      this.$confirm("确定将选择数据删除?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning",
      })
        .then(() => {
          remove(this.dataDetail.id).then((res) => {
            if (res.data.code === 0) {
              this.$message.success("操作成功");
              this.$router.back(-1);
            } else {
              this.$message.error(res.data.msg);
            }
          });
        })
        .catch(() => {});
    },
    handleCurrentChange(val) {
      this.page.currentPage = val;
      this.getReplyList(this.$route.params.id);
    },
    showEditor() {
      const cryptoOpen = this.$store.state.cryptoOpen;
      const key = this.$store.state.key;
      this.dialogEditor = new Editor("#dialog-ueditor");
      this.dialogEditor.config.zIndex = 10;
      this.dialogEditor.config.showFullScreen = false;
      this.dialogEditor.config.customUploadImg = function (
        resultFiles,
        insertImgFn
      ) {
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
      this.dialogEditor.create();
    },
    hideEditor() {
      if (this.dialogEditor !== null) {
        this.dialogEditor.destroy();
        this.dialogEditor = null;
      }
    },
    handleSend(reply, assist) {
      if (reply && reply.content) {
        this.currentReply = reply;
        if (assist && assist.content) {
          this.currentAssist = assist;
        }

        this.showReplyDialog = true;

        if (this.currentReply && this.currentReply.content) {
          this.replyTitle =
            "回复: " +
            this.currentReply.memberName +
            " " +
            this.currentReply.deptName;
        }
        if (this.currentAssist && this.currentAssist.content) {
          console.log(this.currentAssist);
          this.replyTitle =
            "回复: " +
            this.currentAssist.memberName +
            " " +
            this.currentAssist.deptName;
        }
        return;
      }
      const content = this.replyEditor.txt.html();
      this.replyForm.content = content;
      let reg1 = new RegExp("<p><br> *</p>", "g");
      this.replyForm.content = this.replyForm.content.replace(reg1, "");
      let reg2 = new RegExp("<p>(&nbsp; *)*</p>", "g");
      this.replyForm.content = this.replyForm.content.replace(reg2, "");
      if (this.replyForm.content.length > 3000) {
        this.$message.warning("内容过长，请重新输入");
        return;
      }
      this.$refs["replyForm"].validate((valid) => {
        if (!valid) {
          return false;
        }
        this.handleSave();
      });
    },
    handleSave() {
      try {
        let params = {
          fid: this.$route.params.id,
          content: this.replyForm.content,
        };
        if (this.showReplyDialog && this.dialogContent) {
          params.content = this.dialogContent;
        }
        if (this.currentReply && this.currentReply.content) {
          params.mid = this.currentReply.id;
        }
        if (this.currentAssist && this.currentAssist.content) {
          params.pid = this.currentAssist.id;
        }
        sendReply(params)
          .then((res) => {
            if (res.data.code == 0) {
              this.$message.success("发布成功");
              this.getReplyList(this.$route.params.id);
              this.dataDetail.replyCount = res.data.data.replyCount;
              this.replyForm.content = "";
              this.dialogContent = "";
              this.showReplyDialog = false;
              this.currentReply = {};
              this.currentAssist = {};

              this.replyEditor.txt.clear();
            } else {
              this.$message.error(res.data.msg);
            }
            this.btnLoading = false;
          })
          .catch(() => {});
      } catch (error) {}
    },
    delReply(data) {
      this.$confirm("确定删除该条回复?", "提示", {
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning",
      })
        .then(() => {
          removeReply(data.id).then(({ data: res }) => {
            if (res.code === 0) {
              this.$message({ message: "删除成功", type: "success" });
              this.getReplyList(this.$route.params.id);
              this.dataDetail.replyCount = res.data.replyCount;
            } else {
              this.$message({
                message: res.msg,
                type: "error",
                duration: 1500,
              });
            }
          });
        })
        .catch(() => {});
    },
    onDialogSubmit() {
      this.btnLoading = true;

      const content = this.dialogEditor.txt.html();
      this.dialogContent = content;

      let reg1 = new RegExp("<p><br> *</p>", "g");
      this.dialogContent = this.dialogContent.replace(reg1, "");
      let reg2 = new RegExp("<p>(&nbsp; *)*</p>", "g");
      this.dialogContent = this.dialogContent.replace(reg2, "");
      if (!this.dialogContent) {
        this.$message.warning("内容不能为空");
        this.btnLoading = false;
        return;
      }
      if (this.dialogContent.length > 3000) {
        this.$message.warning("内容过长，请重新输入");
        this.btnLoading = false;
        return;
      }
      this.handleSave();
    },
    onClose() {
      this.showReplyDialog = false;
      this.dialogContent = "";
    },
  },
  beforeDestroy() {
    console.log("post-detail.vue beforeDestroy");
    if (this.replyEditor !== null) {
      this.replyEditor.destroy();
      this.replyEditor = null;
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
.post-card {
  .card-head {
    padding: 15px;
    border-bottom: 1px #eee solid;
    .title {
      font-size: 16px;
    }
    .title-detail {
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      color: #aaa;
      margin-top: 12px;
      .view {
        margin-right: 20px;
      }
      div {
        display: inline-block;
      }
      .edit-box {
        a {
          text-decoration: none !important;
          position: relative;
          top: -2px;
        }
        a:hover {
          text-decoration: none !important;
        }
      }
    }
  }
  .content-box {
    min-height: 55px;
    display: flex;
    border: 1px #eee solid;
    align-items: center;
    margin: 20px 15px;
    padding: 15px 20px;
    .card-content {
      width: 100%;
    }
  }
  .attachment-box {
    padding: 15px;
    line-height: 30px;
  }
  .comment-box {
    .comment-title {
      display: inline-block;
      padding: 15px;
      width: 100%;
      border-bottom: 1px #eee solid;
      font-size: 16px;
    }
    .f-box {
      font-size: 14px;
      border-bottom: 1px #eee solid;
      .f-detail {
        display: inline-block;
        vertical-align: top;
        min-height: 90px;
        width: calc(100% - 60px);
        padding: 10px 15px;
        line-height: 30px;
        .member-name {
          color: #027db4;
        }
        .reply-content {
          width: 100%;
          word-wrap: break-word;
          word-break: break-all;
        }
        .update-time {
          color: #aaa;
          font-size: 12px;
        }
        .reply-btn {
          text-align: right;
          cursor: pointer;
          span {
            &:hover {
              color: #027db4;
            }
          }
        }
      }
      .a-box {
        padding-left: 50px;
        .a-detail {
          min-height: 65px;
          position: relative;
        }
        .assist-content {
          margin-right: 15%;
          word-wrap: break-word;
          word-break: break-all;
          vertical-align: top;
          // overflow: hidden;
        }
        .assist-right {
          position: absolute;
          right: 15px;
          top: 10px;
        }
        .assist-btn {
          cursor: pointer;
          &:hover {
            color: #027db4;
          }
        }
      }
    }
  }
  .b-gray {
    background: #eee;
  }
  .reply-box {
    padding: 20px;
  }
  .m-r {
    margin-right: 20px;
  }
}
</style>
<style lang="scss">
.post-card {
  .w-e-text-container {
    height: 100px !important;
  }
}
</style>
