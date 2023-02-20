<template>
  <div>
    <h1 class="login-title">重置密码</h1>
    <el-form
      class="reset-pws"
      :model="ruleForm"
      status-icon
      :rules="rules"
      ref="ruleForm"
    >
      <el-form-item prop="phone">
        <el-input
          type="text"
          prefix-icon="el-icon-mobile-phone"
          v-model="ruleForm.phone"
          autocomplete="off"
          placeholder="请输入手机号"
        >
        </el-input>
      </el-form-item>
      <el-form-item prop="checkCode">
        <div style="display: flex">
          <el-input
            type="text"
            style="margin-right: 10px;"
            prefix-icon="el-icon-s-promotion"
            v-model="ruleForm.checkCode"
            placeholder="请输入验证码"
          >
          </el-input>
          <el-button
            type="primary"
            @click="getCheckCode('ruleForm')"
            :disabled="!show"
          >
            <span v-show="show">发送验证码</span>
            <span v-show="!show" class="count">{{ count }} s</span>
          </el-button>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          class="w-percent-100 reset-button"
          @click="submitForm('ruleForm')"
          >下一步
        </el-button>
      </el-form-item>
      <el-button type="text" class="bottom-blue" @click="prev">返回</el-button>
    </el-form>
  </div>
</template>

<script>
const TIME_COUNT = 60; // 单位：秒 倒计时的时间

export default {
  name: "phone-check",
  props: ["index"],
  data() {
    var validatePass = (rule, value, callback) => {
      const reg = /^\d{11}$/;
      if (value === "") {
        callback(new Error("请输入手机号"));
      } else if (!reg.test(value)) {
        callback(new Error("手机号格式错误!"));
      } else {
        if (this.ruleForm.checkCode !== "") {
          this.$refs.ruleForm.validateField("checkCode");
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入验证码"));
      } else {
        callback();
      }
    };
    return {
      ruleForm: {
        phone: "",
        checkCode: ""
      },
      rules: {
        phone: [{ validator: validatePass, trigger: "blur" }],
        checkCode: [{ validator: validatePass2, trigger: "blur" }]
      },
      show: true,
      count: "",
      timer: null
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$http
            .post(
              "forgetpsw/checkoutcode",
              { mobile: this.ruleForm.phone, code: this.ruleForm.checkCode },
              {
                headers: {
                  "content-type": "application/json",
                }
              }
            )
            .then(({ data: res }) => {
              console.log(res);
              if (res.code !== 0) {
                return this.$message.error(res.msg);
              }
              window.userMobilePhone = this.ruleForm.phone;
              this.ruleForm.phone = "";
              this.ruleForm.checkCode = "";
              this.$emit("next"); //下一页
            })
            .catch(error => {
              this.$message.error(error);
            });
          return true;
        } else {
          return false;
        }
      });
    },
    prev() {
      this.$emit("prev");
    },
    getCheckCode(formName) {
      this.$refs[formName].validateField("phone", validatePass => {
        if (!validatePass) {
          this.$http
            .post(
              "forgetpsw/sentPhoneCode",
              { mobile: this.ruleForm.phone },
              {
                headers: {
                  "content-type": "application/json",
                }
              }
            )
            .then(({ data: res }) => {
              if (res.code !== 0) {
                this.$message.error(res.msg);
              }
              // 验证码倒计时
              if (!this.timer) {
                this.count = TIME_COUNT;
                this.show = false;
                this.timer = setInterval(() => {
                  if (this.count > 0 && this.count <= TIME_COUNT) {
                    this.count--;
                  } else {
                    this.show = true;
                    clearInterval(this.timer);
                    this.timer = null;
                  }
                }, 1000);
              }
            })
            .catch(error => {
              this.$message.error(error);
            });
          return true;
        } else {
          return false;
        }
      });
    }
  }
};
</script>

<style scoped>
.bottom-blue {
  color: #0079fe;
}

.bottom-blue:hover {
  color: #00aafe;
}

.reset-pws {
  margin: 70px auto 0 !important;
}

.reset-button {
  margin-top: 20px !important;
}
</style>
