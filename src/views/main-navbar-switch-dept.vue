<template>
  <el-dialog
    :visible.sync="visible"
    width="25%"
    :title="$t('dept.switch')"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :append-to-body="true"
  >
    <el-form
      :model="dataForm"
      ref="dataForm"
      @keyup.enter.native="submitHandle()"
      label-width="120px"
      size="mini"
      label-suffix=":"
    >
      <el-form-item prop="currentDeptId" label="所在机构" label-width="80px">
        <el-select
          v-model="dataForm.currentDeptId"
          type="currentDeptId"
          style="width: 100%;"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <!--      <el-form-item prop="remember" label="记住选择" label-width="80px">-->
      <!--        <template slot="label">-->
      <!--          <el-tooltip class="item" effect="dark" content="记住选择后下次自动以该组织身份登录" placement="top-start">-->
      <!--          <span>记住选择:</span>-->
      <!--          </el-tooltip>-->
      <!--        </template>-->
      <!--        <el-switch-->
      <!--          v-model="dataForm.isRemember">-->
      <!--        </el-switch>-->

      <!--      </el-form-item>-->
    </el-form>
    <template slot="footer">
      <el-button type="primary" @click="submitHandle()" size="mini">{{
        $t("confirm")
      }}</el-button>
      <el-button @click="visible = false" size="mini">{{
        $t("cancel")
      }}</el-button>
    </template>
  </el-dialog>
</template>

<script>
import debounce from "lodash/debounce";
// import { getLoginUserInfo } from "@/api/user/user";
export default {
  name: "switch-dept",
  data() {
    return {
      visible: false,
      options: [],
      deptObj: {},
      dataForm: {
        currentDeptId: "",
        isRemember: true
      }
    };
  },
  computed: {},
  methods: {
    init() {
      this.visible = true;
      this.options = [];
      let deptIds = this.$store.state.user.deptIds;
      let deptNames = this.$store.state.user.deptNames;
      if (deptIds) {
        let ids = deptIds.split(",");
        let names = deptNames.split(" ");
        ids.forEach((item, index) => {
          this.options.push({ value: item, label: names[index] });
          this.deptObj[item] = names[index];
        });
      }

      this.dataForm.currentDeptId = this.$store.state.user.deptId;
    },
    // 表单提交
    submitHandle: debounce(
      function() {
        this.$refs["dataForm"].validate(valid => {
          if (!valid) {
            return false;
          }
          this.$store.state.user.deptId = this.dataForm.currentDeptId;
          this.$store.state.user.currentDeptName = this.deptObj[
            this.$store.state.user.deptId
          ];

          if (this.dataForm.currentDeptId === null) {
            this.$message.warning('无组织可切换！')
            return false;
          }

          this.$http
            .get(`/sys/user/switchDept/${this.dataForm.currentDeptId}`)
            .then(({ data: res }) => {
              if (res.code !== 0) {
                return this.$message.error(res.msg);
              }
              this.visible = false;
              //切换组织后重定向到面板页面，避免页面数据错误
              this.$router.push("/dashbord/dashbord");
              this.$router.go(0);
            })
            .catch(() => {
              this.visible = false;
            });
        });
      },
      1000,
      { leading: true, trailing: false }
    )
  }
};
</script>
