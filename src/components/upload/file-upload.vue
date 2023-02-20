<template>
  <el-dialog
    :visible.sync="visible"
    :title="title"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
  >
    <el-upload
      :action="url"
      :headers="headers"
      :file-list="fileList"
      :list-type="listType"
      :limit="maxCount"
      drag
      :multiple="multiple"
      :before-upload="beforeUploadHandle"
      :on-success="successHandle"
      :on-error="errorHandle"
      class="text-center"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text" v-html="$t('upload.text')"></div>
      <div class="el-upload__tip" slot="tip">{{ tip }}</div>
    </el-upload>
  </el-dialog>
</template>

<script>
import Cookies from "js-cookie";
import sm4Utils from "@/utils/sm4";

export default {
  name: "fileUpload",
  props: {
    title: {
      type: String,
      default: "上传文件"
    },
    maxCount: {
      type: Number,
      default: 3
    },
    tip: {
      type: String,
      default: "只能上传jpg/png文件，且不超过10MB"
    },
    listType: {
      type: String,
      default: "picture-card"
    },
    fileType: {
      type: Array,
      default: () => {
        return [];
      }
    },
    category: {
      type: String,
      default: "other"
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: false,
      url: "",
      fileList: [],
      maxSize: 10 * 1024 * 1024, //文件最大10MB
      headers: { Authorization: Cookies.get("access_token") }
    };
  },
  methods: {
    init(uploadUrl) {
      this.visible = true;
      this.url = uploadUrl
        ? uploadUrl
        : `${window.SITE_CONFIG["uploadURL"]}` +
          "/single?type=" +
          this.category;
      this.fileList = [];
    },
    // 上传之前
    beforeUploadHandle(file) {
      // console.log(file)
      let type = file.name
        .substring(file.name.lastIndexOf(".") + 1)
        .toLowerCase();
      if (!this.fileType.includes(type)) {
        this.$message.error(
          this.$t("upload.tip", { format: this.fileType.join(",") })
        );
        return false;
      }

      if (file.size > this.maxSize) {
        this.$message.error("超过文件最大值");
        return false;
      }

      this.$emit("useDelete");
    },
    // 上传成功
    successHandle(res, file, fileList) {
      if (this.$store.state.cryptoOpen) {
        let tmpData = sm4Utils.decrypt(res, this.$store.state.key);
        res = JSON.parse(tmpData);
      }

      if (res.code !== 0) {
        return this.$message.error(res.msg);
      }
      this.fileList = fileList;
      this.fileList[0].response = res;
      let uploadFiles = fileList.map(item => item.response.data);

      this.$message({
        message: this.$t("prompt.success"),
        type: "success",
        duration: 1000,
        onClose: () => {
          this.visible = false;
          this.$emit("refreshDataList", uploadFiles);
        }
      });
    },
    errorHandle(err, file, fileList) {
      console.error("upload err:", err);
      this.$message.error("上传失败, 请检查网络是否正常，文件服务器是否正常。");
    }
  }
};
</script>
<style scoped>
.el-upload__tip {
  color: #ff4444;
}
</style>
