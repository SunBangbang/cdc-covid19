<template>
    <el-dialog title="修改手机号" :visible.sync="dialogVisible" width="30%">
        <el-form :model="user" ref="user" :rules="dataRule" label-width="100px">
            <el-row>
                <el-form-item prop="mobile" :label="'手机号码：'">
                    <el-input v-model="user.mobile" :placeholder="'请输入手机号'" autocomplete="off"></el-input>
                </el-form-item>
            </el-row>
            <el-row style="margin-top: 10px">
                <el-form-item prop="password" :label="'登录密码：'">
                    <el-input type="password" v-model="user.password" :placeholder="'请输入密码'" autocomplete="off"></el-input>
                </el-form-item>
            </el-row>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button size="mini" type="primary" @click="submitForm(user)" :loading="load">确 定</el-button>
            <el-button size="mini" @click="dialogVisible = false">取 消</el-button>
        </span>
    </el-dialog>
</template>

<script>
  import {update} from '@/api/user/user'
  import {isMobile} from '@/utils/validate'
  export default {
    data() {
      return {
        load: false,
        dialogVisible: false,
        user: {}
      }
    },
    computed: {
      dataRule () {
        var validatePassword = (rule, value, callback) => {
          if (value && !/\S/.test(value)) {
            return callback(new Error('密码格式错误'))
          }
          callback()
        }
        var validateMobile = (rule, value, callback) => {
          if (value && !isMobile(value) ) {
            return callback(new Error(this.$t('validate.format', { 'attr': this.$t('user.mobile') })))
          } else if (value === '') {
            return callback(new Error("手机号不能为空"))
          }
          callback()
        }
        return {
          password: [
            { validator: validatePassword, trigger: 'blur' },
            { required: true, message: '请输入密码' }
          ],
          mobile: [
            { validator: validateMobile, trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init() {
        this.dialogVisible = true;
      },
      submitForm(val) {
        this.load = true
        this.$refs['user'].validate((valid) => {
          if (!valid) {
            this.load = false
            return false
          } else {
            update(val).then(({data: res}) => {
              if (res.code !== 0) {
                this.load = false
                if (res.code === 10009) {
                  res.msg = '密码错误！请输入正确的密码！'
                }
                return this.$message.error(res.msg)
              }else {
                this.$message({
                  message: "操作成功!",
                  type: 'success',
                  onClose:()=>{
                    this.load = false
                    this.dialogVisible = false
                    this.$emit('callback')
                  }
                })
              }
            }).catch(() => {
            })
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
    .el-card__body {
        .el-form-item {
            margin-bottom: 15px;
        }
    }
</style>
