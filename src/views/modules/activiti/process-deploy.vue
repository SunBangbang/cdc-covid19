<template>
  <el-dialog
    :visible.sync="visible"
    :title="$t('process.deployFile')"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-upload
      name="processFile"
      :action="url"
      :file-list="fileList"
      drag
      :before-upload="beforeUploadHandle"
      :on-success="successHandle"
      class="text-center"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text" v-html="$t('upload.text')"></div>
      <div class="el-upload__tip" slot="tip">
        {{ $t("upload.tip", { format: "zip、xml、bar、bpmn" }) }}
      </div>
    </el-upload>
  </el-dialog>
</template>

<script>
import Cookies from "js-cookie";
import sm4Utils from "@/utils/sm4";

export default {
  data() {
    return {
      visible: false,
      url: "",
      fileList: []
    };
  },
  methods: {
    init() {
      this.visible = true;
      this.url = `${
        window.SITE_CONFIG["apiURL"]
      }/act/process/deploy?access_token=${Cookies.get("access_token")}`;
      this.fileList = [];
    },
    // 上传之前
    beforeUploadHandle(file) {
      if (
        !/.+\.zip$/.test(file.name) &&
        !/.+\.xml$/.test(file.name) &&
        !/.+\.bar$/.test(file.name) &&
        !/.+\.bpmn$/.test(file.name)
      ) {
        this.$message.error(
          this.$t("upload.tip", { format: "zip、xml、bar、bpmn" })
        );
        return false;
      }
    },
    // 上传成功
    // eslint-disable-next-line
    successHandle(res, file, fileList) {
      if (this.$store.state.cryptoOpen) {
        let tmpData = sm4Utils.decrypt(res, this.$store.state.key);
        res = JSON.parse(tmpData);
      }

      if (res.code !== 0) {
        return this.$message.error(res.msg);
      }
      this.$message({
        message: this.$t("prompt.success"),
        type: "success",
        duration: 500,
        onClose: () => {
          this.visible = false;
          this.$emit("refreshDataList");
        }
      });
    }
  }
};
</script>
