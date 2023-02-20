<template>
  <el-dialog
    title="调查详情上报"
    :visible.sync="dialogVisible"
    width="50%"
    :before-close="beforeClose"
  >
    <el-row>
      <el-form>
        <custom-desc
          title="审核流程配置"
          style="margin: 15px 0 0 0"
        ></custom-desc>

        <el-row>
          <el-checkbox-group v-model="form.auditDeptIds">
            <el-col
              v-for="(item, index) in deptList"
              :key="index"
              :xl="{ span: 8 }"
              :lg="{ span: 10 }"
              :md="{ span: 24 }"
              :sm="{ span: 24 }"
              style="text-align: center"
            >
              <el-checkbox-button
                :style="{ 'pointer-events': index === 0 ? 'none' : 'auto' }"
                :label="item.auditDeptId"
                :checked="index === 0"
                @change="changed(index === 0, item)"
              >
                {{ item.label }}
              </el-checkbox-button>
            </el-col>
          </el-checkbox-group>
        </el-row>

        <el-row style="font-weight: bold; margin-top: 10px; color: red">
          说明: 请将需要审核的级别在此全部选中
        </el-row>

        <custom-desc title="报告信息上传" style="margin: 15px 0"></custom-desc>

        <el-upload
          :action="url"
          :headers="headers"
          :file-list="fileList"
          drag
          :multiple="false"
          :before-upload="beforeUploadHandle"
          :on-success="successHandle"
          :on-error="errorHandle"
          :before-remove="removeHandle"
          :on-exceed="onExceed"
          class="text-center"
        >
          <i class="el-icon-upload"></i>

          <div class="el-upload__text" v-html="$t('upload.text')"></div>

          <div class="el-upload__tip" slot="tip">{{ tip }}</div>
        </el-upload>

        <el-row style="float: right; margin-bottom: 15px">
          <el-button type="primary" size="mini" @click="submitRecord">
            上报
          </el-button>

          <el-button size="mini" @click="beforeClose">取消</el-button>
        </el-row>
      </el-form>
    </el-row>
  </el-dialog>
</template>

<script>
import CustomDesc from "@/components/custom-desc/custom-desc";
import { pageValidForTask } from "@/api/survey-form/sample";
import { recordReport, recordReports } from "@/api/survey-form/reported_sample";
import { getDictValue } from "@/utils";
import Cookies from "js-cookie";
import sm4Utils from "@/utils/sm4";

export default {
  name: "reported-sample-config-dialog",
  components: { CustomDesc },
  data() {
    return {
      dialogVisible: false,
      rpid: null,
      form: {},
      url: "",
      fileList: [],
      maxSize: 10 * 1024 * 1024, //文件最大10MB
      headers: { Authorization: Cookies.get("access_token") },
      fileType: ["doc", "docx", "zip", "pdf", "xlsx", "xls"],
      tip: "只能上传doc，docx，pdf，xls，xlsx以及zip文件。文件大小不能超过10MB。",
    };
  },
  props: {
    deptList: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  methods: {
    changed(isFirst, value) {
      if (isFirst) {
        this.$message.error("禁止不勾选本机构！");
        this.form.auditDeptIds.unshift(value.auditDeptId);
      }
      console.log(this.deptList);
    },
    initData(sampleData, taskData) {
      this.dialogVisible = true;
      // this.otherData = data
      this.form = {
        ...sampleData,
        ...taskData,
        //获取质控员审核通过后的合并调查对象记录
        sampleId: sampleData.mergeSid,
        auditDeptIds: [],
        gender: getDictValue("gender", sampleData.sex),
        attachIds: "",
      };
      delete this.form.$index;
      delete this.form.$status;
      delete this.form.sex;
      delete this.form.mergeSid;
      this.url = `${window.SITE_CONFIG["uploadURL"]}` + "/single?type=other";
    },
    //上报调查对象记录, 必须在质控员审核通过后才上报
    submitRecord() {
      if (this.form.auditDeptIds.length < 1) {
        this.$message.error("必须选择至少一个上级机构上报！");
        return;
      }
      // this.fileList.forEach(item => {
      //   this.form.attachId = this.form.attachId + item.response.data.fid + ','
      // })
      if (this.fileList.length < 1) {
        this.$message.error("调查记录报告不能为空，请上传！");
        return;
      }
      let tmpAttachIdsArray = [];
      // this.form.attachIds = "";
      this.fileList.forEach((item) => {
        tmpAttachIdsArray.push(item.response.data.fid);
      });
      this.form.attachIds = tmpAttachIdsArray.join(",");
      // this.form.attachId =
      //   this.fileList.length > 0 ? this.fileList[0].response.data.fid : null;
      let submitData = Object.assign({}, this.form);
      let temp = [];
      this.deptList.forEach((dept) => {
        if (submitData.auditDeptIds.includes(dept.auditDeptId))
          temp.push(dept.auditDeptId);
      });
      submitData.auditDeptIds = temp;
      recordReport(submitData).then((res) => {
        if (res.data.code === 0) {
          this.$message.success("上报成功！");
          this.rpid = res.data.data;
          this.$emit("closeDialog", { rpid: this.rpid });
          this.dialogVisible = false;
        } else {
          this.$message.error(res.data.msg);
        }
      });
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
      if (this.$store.state.cryptoOpen) {
        fileList[fileList.length - 1].response = JSON.parse(
          sm4Utils.decrypt(
            fileList[fileList.length - 1].response,
            this.$store.state.key
          )
        );
      }
      this.fileList = fileList;
      console.log(this.fileList, "--0", fileList, file);
    },
    errorHandle(err, file, fileList) {
      console.error("upload err:", err);
      this.$message.error("上传失败, 请检查网络是否正常，文件服务器是否正常。");
    },
    removeHandle(file, fileList) {
      this.fileList = fileList;
    },
    beforeClose() {
      this.$emit("closeDialog", { rpid: this.rpid });
      this.dialogVisible = false;
    },
    onExceed(files, fileList) {
      console.log("limit:", files, "list:", fileList);
    },
  },
  filters: {},
};
</script>

<style scoped>
.upload {
  width: 100%;
}
:deep(.el-upload-dragger) {
  width: 100%;
}
:deep(.el-upload) {
  width: 100%;
}
.el-upload__tip {
  text-align: center;
  color: #ff4444;
}
:deep(.el-dialog__body) {
  padding: 0 20px;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
}
:deep(.el-checkbox-button__inner) {
  border: 1px solid #dcdfe6;
  border-radius: 4px 4px !important;
  margin: 15px 0 0 0;
}
</style>
