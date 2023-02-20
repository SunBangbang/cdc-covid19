<template>
  <div class="multi-upload">
    <el-upload
      :action="uploadUrl"
      :data="dataObj"
      :headers="headers"
      :multiple="multiple"
      :list-type="listType"
      :file-list="fileList"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-preview="handlePreview"
      :on-error="handleError"
      :limit="maxCount"
      :before-upload="beforeUploadHandle"
      :on-exceed="handleExceed"
      :disabled="disabled"
    >
      <el-button slot="trigger" size="small" type="primary">{{
        uploadBtnText
      }}</el-button>
      <div slot="tip" class="el-upload__tip">{{ tip }}</div>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible" title="查看" :modal="modal">
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>
<script>
import Cookies from "js-cookie";
import sm4Utils from "@/utils/sm4";

const IMAGE_TYPES = ["png", "jpg", "jpeg", "gif"];
export default {
  name: "multiUpload",
  props: {
    //图片属性数组
    value: Array,
    //最大上传图片数量
    maxCount: {
      type: Number,
      default: 5
    },
    tip: {
      type: String,
      default: "只能上传jpg/png文件，且不超过10MB"
    },
    listType: {
      type: String,
      default: "picture-card"
    },
    uploadBtnText: {
      type: String,
      default: "点击上传"
    },
    type: {
      type: String,
      default: "other"
    },
    fileType: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: true
    },
    maxSize: {
      type: Number,
      default: 10 * 1024 * 1024 //10MB
    },
    modal: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      dataObj: {
        type: this.type
      },
      dialogVisible: false,
      dialogImageUrl: null,
      uploadUrl: window.SITE_CONFIG["uploadURL"],
      headers: {
        Authorization: Cookies.get("access_token")
      }
    };
  },
  computed: {
    fileList() {
      let fileList = [];
      if (this.value && this.value.length > 0) {
        for (let i = 0; i < this.value.length; i++) {
          fileList.push({ url: this.value[i] });
        }
        return this.value;
      } else {
        return fileList;
      }
    }
  },
  methods: {
    handleError(err, file, fileList) {
      console.log("upload error:", err);
      this.$message.error("上传失败, 请检查网络是否正常，文件服务器是否正常。");
    },
    emitInput(fileList) {
      let newFileList = fileList.map(item => {
        return { name: item.name, url: item.url, type: item.type };
      });
      console.log("emit input, fileList:", newFileList);
      this.$emit("input", newFileList);
    },
    handleRemove(file, fileList) {
      this.emitInput(fileList);
    },
    handlePreview(file) {
      let fileType = file.type
        ? file.type
        : file.name.substring(file.name.lastIndexOf(".") + 1).toLowerCase();
      if (IMAGE_TYPES.includes(fileType)) {
        this.dialogVisible = true;
        this.dialogImageUrl = file.url;
      } else {
        let urlArr = file.url.split('/')
        urlArr[urlArr.length - 1] = encodeURIComponent(urlArr.pop())
        window.open(urlArr.join('/'));
      }
    },
    handleUploadSuccess(res, file) {
      let fileType = file.name.substring(file.name.lastIndexOf(".") + 1);

      if (this.$store.state.cryptoOpen) {
        let tmpData = sm4Utils.decrypt(file.response, this.$store.state.key);
        file.response = JSON.parse(tmpData);
      }

      if (null != file.response.data && file.response.data.length > 0) {
        file.response.data.forEach(v => {
          this.fileList.push({
            name: v.name,
            url: v.url,
            type: fileType.toLowerCase()
          });
        });
      }
      this.emitInput(this.fileList);
    },
    handleExceed() {
      this.$message({
        message: "最多上传文件数" + this.maxCount,
        type: "warning",
        duration: 1000
      });
    },
    // 上传之前
    beforeUploadHandle(file) {
      console.log(file);
      let type = file.name
        .substring(file.name.lastIndexOf(".") + 1)
        .toLowerCase();
      if (type.toLowerCase() === "exe") {
        this.$message.error("禁止上传exe文件");
        return false;
      }
      if (this.fileType.length > 0 && !this.fileType.includes(type)) {
        this.$message.error(
          this.$t("upload.tip", { format: this.fileType.join(",") })
        );
        return false;
      }

      if (file.size > this.maxSize) {
        this.$message.error("超过文件最大值");
        return false;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.el-upload__tip {
  color: #ff4444;
}
</style>

<style lang="scss">
.el-form-item__content {
  .el-dialog__header {
    padding: 5px 5px 5px 5px;
    .el-dialog__title {
      font-size: 15px;
    }
  }
  line-height: 20px;
  .el-dialog__body {
    padding: 5px;
  }
}
</style>
