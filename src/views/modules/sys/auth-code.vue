<template>
  <el-dialog
    width="40%"
    :visible.sync="visible"
    title="绑定授权码"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :append-to-body="true">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="submitAuthCodeForm" label-width="120px">
      <el-form-item :label="$t('updatePassword.username')">
        <span>{{ user.username }}</span>
      </el-form-item>
      <el-form-item :label="$t('user.authCode')" prop="authCode">
        <el-input
          type="text"
          prefix-icon="el-icon-mobile-phone"
          v-model="dataForm.authCode"
          autocomplete="off"
          placeholder="请输入授权码"
        >
        </el-input>
      </el-form-item>
    </el-form>
    <template slot="footer">
      <el-button type="primary" @click="submitAuthCodeForm" :loading="loading">{{ $t('confirm') }}</el-button>
      <el-button @click="visible = false">{{ $t('cancel') }}</el-button>
    </template>
  </el-dialog>
</template>
<script>
import debounce from "lodash/debounce";
import { adminBindAuthcode } from "@/api/sys/setAuthCode";
export default {
  data () {
    return {
      visible: false,
      user: {},
      loading: false,
      dataForm: {
        authCode: "",
      }
    }
  },
  computed: {
    dataRule() {
        return {
          authCode: [
            { required: true, message: "请输入授权码", trigger: "blur" },
          ],
        }
    },
  },
  methods: {
    init (row) {
        this.visible = true
        this.user = row
        this.$nextTick(() => {
          this.$refs['dataForm'].resetFields()
        })
    },
    submitAuthCodeForm: debounce(function () {
      this.$refs["dataForm"].validate((valid) => {
        if (!valid) {
          return false;
        }
        this.dataForm.id = this.user.id;
        console.log(this.dataForm);
        adminBindAuthcode(this.dataForm).then((res) => {
          if (res.data.code !== 0) {
            this.$message.error(res.data.msg);
            return;
          }
          this.$message({
            message: this.$t('prompt.success'),
            type: 'success',
            duration: 500,
            onClose: () => {
              this.loading = false
              this.visible = false
              this.$emit("refreshDataList");
            }
          })
        });
      });
    }),
  }
}
</script>