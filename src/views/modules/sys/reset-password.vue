<template>
  <el-dialog
      :visible.sync="visible"
      title="重置密码"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :append-to-body="true">
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmitHandle()" label-width="120px">
      <el-form-item :label="$t('updatePassword.username')">
        <span>{{ user.username }}</span>
      </el-form-item>
      <el-form-item prop="newPassword" :label="$t('updatePassword.newPassword')" style="margin-bottom: 20px">
        <el-input v-model="dataForm.newPassword" type="password" placeholder="请输入密码"></el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword" :label="$t('updatePassword.confirmPassword')" style="margin-bottom: 20px">
        <el-input v-model="dataForm.confirmPassword" type="password" placeholder="请输入密码"></el-input>
      </el-form-item>
      <el-form-item prop="password" label="管理员密码">
        <el-input v-model="dataForm.password" type="password" placeholder="请输入密码"></el-input>
      </el-form-item>
    </el-form>
    <template slot="footer">
      <el-button type="primary" @click="dataFormSubmitHandle()" :loading="loading">{{ $t('confirm') }}</el-button>
      <el-button @click="visible = false">{{ $t('cancel') }}</el-button>
    </template>
  </el-dialog>
</template>

<script>
import debounce from 'lodash/debounce'
export default {
  data () {
    return {
      visible: false,
      user: {},
      loading: false,
      dataForm: {
        password: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  computed: {
    dataRule () {
      var validateNewPassword = (rule, value, callback) => {
        if (!/^(?![A-Za-z0-9]+$)(?![a-z0-9\W]+$)(?![A-Za-z\W]+$)(?![A-Z0-9\W]+$)[a-zA-Z0-9\W]{8,16}$/.test(value)) {
          return callback('请输入包含大小写字母、数字、特殊字符的8到16位密码！')
        }
        callback()
      }
      var validateConfirmPassword = (rule, value, callback) => {
        if (this.dataForm.newPassword !== value) {
          return callback(new Error('确认密码与密码输入不一致'))
        }
        callback()
      }
      return {
        password: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: validateNewPassword, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    init (row) {
      this.visible = true
      this.user = row
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
      })
    },
    // 表单提交
    dataFormSubmitHandle: debounce(function () {
      this.dataForm.userId = this.user.id
      this.$refs['dataForm'].validate((valid) => {
        if (!valid) {
          return false
        }
        this.loading = true
        this.$http.put('/sys/user/reset/password', this.dataForm).then(({ data: res }) => {
          if (res.code !== 0) {
            this.loading = false
            return this.$message.error(res.msg)
          }
          this.$message({
            message: this.$t('prompt.success'),
            type: 'success',
            duration: 500,
            onClose: () => {
              this.loading = false
              this.visible = false
            }
          })
        }).catch(() => {})
      })
    }, 1000, { 'leading': true, 'trailing': false })
  }
}
</script>
