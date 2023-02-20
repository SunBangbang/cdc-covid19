<template>
  <div>
    <el-row>
      <el-col>
        <div>
          <el-button
            type="text"
            class="el-icon-arrow-left back-button"
            @click="goBack"
            >返回</el-button
          >
        </div>
      </el-col>
    </el-row>
    <el-card class="aui-card--fill">
      <el-form :model="dataForm" ref="dataForm" label-width="100px">
        <el-divider content-position="left">基础信息</el-divider>
        <el-row>
          <el-col :span="9">
            <el-form-item prop="realName" :label="$t('user.realName') + '：'">
              <label>{{ dataForm.realName }}</label>
            </el-form-item>
            <el-form-item prop="mobile" :label="$t('user.mobile') + '：'">
              <label>{{ dataForm.mobile }}</label
              >&nbsp;&nbsp;
              <a
                style="cursor:pointer;text-decoration:none;color: blue;"
                @click="updatePhone"
              >
                <i class="el-icon-edit-outline"></i>
                修改
              </a>
            </el-form-item>
            <el-form-item prop="idNo" :label="$t('user.idNumber') + '：'">
              <label>{{ dataForm.idNo }}</label>
            </el-form-item>
            <el-form-item prop="education" :label="$t('user.education') + '：'">
              <label>{{ dataForm.degree }}</label>
            </el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item prop="gender" :label="$t('user.gender') + '：'">
              <label>{{ dataForm.genderName }}</label>
            </el-form-item>
            <el-form-item prop="email" :label="$t('user.email') + '：'">
              <label>{{ dataForm.email }}</label
              >&nbsp;&nbsp;
              <a
                style="cursor:pointer;text-decoration:none;color: blue;"
                @click="updateEmail"
              >
                <i class="el-icon-edit-outline"></i>
                修改
              </a>
            </el-form-item>
            <el-form-item
              prop="specializedSubject"
              :label="$t('user.specializedSubject') + '：'"
            >
              <label>{{ dataForm.major }}</label>
            </el-form-item>
            <el-form-item
              prop="positionalTitle"
              :label="$t('user.positionalTitle') + '：'"
            >
              <label>{{ dataForm.jobTitle }}</label>
            </el-form-item>
          </el-col>
          <el-col :span="2">
            <el-upload
              class="avatar-uploader"
              :data="dataObj"
              :headers="headers"
              :action="uploadUrl"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <img v-if="imageUrl" :src="imageUrl" class="avatar" />
              <!--                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>-->
            </el-upload>
          </el-col>
        </el-row>
        <el-divider content-position="left">用户信息</el-divider>
        <el-row>
          <el-col :span="10">
            <el-form-item prop="username" :label="$t('user.username') + '：'">
              <label>{{ dataForm.username }}</label>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item
              prop="trueDeptName"
              :label="$t('user.subjectDept') + '：'"
            >
              <label>{{ dataForm.trueDeptName }}</label>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item prop="deptName" :label="$t('user.deptName') + '：'">
              <label>{{ dataForm.deptName }}</label>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item
              prop="roleIdList"
              :label="$t('user.roleIdList') + '：'"
              class="role-list"
            >
              <label>{{ dataForm.roleNames }}</label>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item
              prop="status"
              :label="$t('user.status') + '：'"
              size="mini"
            >
              <label>{{ this.dataForm.statusName }}</label>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item
              prop="status"
              :label="$t('user.investigator') + '：'"
              size="mini"
            >
              <label>{{ this.dataForm.investName }}</label>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <update-phone-dialog
        ref="updatePhoneDialog"
        v-if="updatePhoneDialogVisible"
        @callback="reload"
      ></update-phone-dialog>
      <update-email-dialog
        ref="updateEmailDialog"
        :user="JSON.parse(JSON.stringify(this.dataForm))"
        v-if="updateEmailDialogVisible"
        @callback="reload"
      ></update-email-dialog>
    </el-card>
  </div>
</template>

<script>
import { getLoginUserInfo } from "@/api/user/user";
import UpdatePhoneDialog from "./update-phone-dialog";
import UpdateEmailDialog from "./update-email-dialog";
import { getDictLabel } from "@/utils";
import { update } from "@/api/user/user";
import FileTypeConstant from "@/utils/FileTypeConstant";
import Cookies from "js-cookie";
import sm4Utils from "@/utils/sm4";

export default {
  components: {
    UpdatePhoneDialog,
    UpdateEmailDialog
  },
  data() {
    return {
      imageUrl: "",
      dataObj: {
        type: FileTypeConstant.AVATAR
      },
      headers: {
        Authorization: Cookies.get("access_token")
      },
      name: this.$store.state.user.name,
      updatePhoneDialogVisible: false,
      updateEmailDialogVisible: false,
      dataForm: {
        genderName: "",
        statusName: "",
        investName: "",
        headUrl: "",
        roleNames: ""
      },
      uploadUrl: window.SITE_CONFIG["singleUploadURL"],
      userDefHeadImg: require("@/assets/img/userDefHeadImg.png"),
    };
  },
  created() {
    this.getUserInfo();
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    getUserInfo() {
      getLoginUserInfo().then(res => {
        this.dataForm = res.data.data;
        this.dataForm.genderName = getDictLabel("gender", this.dataForm.gender);
        if (this.dataForm.status == 0) {
          this.dataForm.statusName = "暂停";
        } else if (this.dataForm.status == 1) {
          this.dataForm.statusName = "正常";
        }
        console.log("user detail:", this.dataForm);
        if (this.dataForm.investigator === 0) {
          this.dataForm.investName = "否";
        } else if (this.dataForm.investigator === 1) {
          this.dataForm.investName = "是";
        }
        this.dataForm.roleNames =
          this.dataForm.roleList && this.dataForm.roleList.length > 0
            ? this.dataForm.roleList.join(",")
            : "";
        this.imageUrl = this.dataForm.headUrl;
        if (!this.imageUrl) {
          this.imageUrl = this.userDefHeadImg;
        }
      });
    },
    handleAvatarSuccess(res, file) {
      if (this.$store.state.cryptoOpen) {
        let tmpData = sm4Utils.decrypt(res, this.$store.state.key);
        res = JSON.parse(tmpData);
      }

      this.dataForm.headUrl = res.data.url;
      update(this.dataForm).then(() => {});
      this.imageUrl = res.data.url;
      this.$store.commit("updateHeadImg", this.imageUrl);
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isPNG = file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isJPG && !isPNG) {
        this.$message.error("上传头像图片只能是 JPG、PNG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return (isJPG || isPNG) && isLt2M;
    },
    updatePhone() {
      this.updatePhoneDialogVisible = true;
      this.$nextTick(() => {
        this.$refs["updatePhoneDialog"].init();
        this.$refs["updatePhoneDialog"].user = JSON.parse(
          JSON.stringify(this.dataForm)
        );
      });
    },
    updateEmail() {
      this.updateEmailDialogVisible = true;
      this.$nextTick(() => {
        this.$refs["updateEmailDialog"].init();
      });
    },
    reload() {
      this.updatePhoneDialogVisible = false;
      this.updateEmailDialogVisible = false;

      this.getUserInfo();
    }
  }
};
</script>

<style lang="scss" scoped>
.mod-sys__user {
  .role-list {
    .el-select {
      width: 100%;
    }
  }
}
.el-dialog {
  width: 60%;
}
.el-card__body {
  .el-form-item {
    margin-bottom: 10px;
  }
}
.treeSelectClass {
  line-height: 20px;
}
.avatar-uploader {
  text-align: center;
  padding-top: 30px;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>
