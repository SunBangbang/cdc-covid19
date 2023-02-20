<template>
    <el-dialog title="修改邮箱" :visible.sync="dialogVisible" width="30%">
        <el-form :model="userDetail" ref="userDetail" :rules="dataRule" label-width="100px">
            <el-row>
                <el-form-item :label="'新的邮箱：'" prop="email">
                    <el-input v-model="userDetail.email" :placeholder="'请输入邮箱地址'" autocomplete="off"></el-input>
                </el-form-item>
            </el-row>
            <el-row style="margin-top: 10px">
                <el-form-item prop="password" :label="'登录密码：'">
                    <el-input type="password" v-model="userDetail.password" :placeholder="'请输入密码'" autocomplete="off"></el-input>
                </el-form-item>
            </el-row>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button size="mini" type="primary" @click="submitForm(userDetail)" :loading="load">确 定</el-button>
          <el-button size="mini" @click="dialogVisible = false">取 消</el-button>
        </span>
    </el-dialog>
</template>

<script>
  import {update} from '@/api/user/user'
  import  {isEmail} from '@/utils/validate'
  export default {
    props: {
      user: {}
    },
    data() {
      return {
        load: false,
        userDetail: {},
        dialogVisible: false,
        // rules: {
        //   password: [
        //     { required: true, message: '请输入密码', trigger: 'blur' }
        //   ]
        // }
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
        var validateEmail = (rule, value, callback) => {
          if (value && !isEmail(value)) {
            return callback(new Error(this.$t('validate.format', { 'attr': this.$t('user.email') })))
          }
          callback()
        }
        return {
          password: [
            { validator: validatePassword, trigger: 'blur' },
            { required: true, message: '请输入密码' }
          ],
          email: [
            { validator: validateEmail, trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.userDetail = this.user
    },
    methods: {
      init() {
        this.dialogVisible = true
      },
      submitForm(val) {
        this.load = true
        this.$refs['userDetail'].validate((valid) => {
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
              } else {
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

<style scoped>

</style>
