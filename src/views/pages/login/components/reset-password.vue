<template>
  <div>
    <h1 class="login-title">设置新密码</h1>
    <el-form
      class="reset-pws"
      :model="ruleForm"
      status-icon
      :rules="rules"
      ref="ruleForm"
    >
      <el-form-item prop="pass">
        <el-input
          type="password"
          prefix-icon="el-icon-lock"
          v-model="ruleForm.pass"
          autocomplete="off"
          placeholder="请输入新密码"
        >
        </el-input>
      </el-form-item>
      <el-form-item prop="checkPass">
        <el-input
          type="password"
          prefix-icon="el-icon-lock"
          v-model="ruleForm.checkPass"
          placeholder="请再次输入密码"
        >
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          class="w-percent-100 reset-button"
          @click="submitForm('ruleForm')"
          >下一步
        </el-button>
      </el-form-item>
      <el-button type="text" class="bottom-blue" @click="prev">取消</el-button>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "reset-password",
  props: ["index"],
  data() {
    var validatePass = (rule, value, callback) => {
      if (
        !/^(?![A-Za-z0-9]+$)(?![a-z0-9\W]+$)(?![A-Za-z\W]+$)(?![A-Z0-9\W]+$)[a-zA-Z0-9\W]{8,16}$/.test(
          value
        )
      ) {
        return callback("请输入包含大写字母、小写字母、数字、特殊字符的8-16位字符！");
      }
      callback();
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.ruleForm.pass) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      ruleForm: {
        pass: "",
        checkPass: "",
      },
      rules: {
        pass: [{ validator: validatePass, trigger: "blur" }],
        checkPass: [{ validator: validatePass2, trigger: "blur" }],
      },
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          console.log(window.userMobilePhone);
          this.$http
            .put(
              "forgetpsw/resetpsw",
              {
                newPassword: this.ruleForm.pass,
                mobile: window.userMobilePhone,
              },
              {
                headers: {
                  "content-type": "application/json",
                },
              }
            )
            .then(({ data: res }) => {
              console.log(res);
              if (res.code !== 0) {
                this.$message.error(res.msg);
                return;
              }
              this.ruleForm.phone = "";
              this.ruleForm.checkCode = "";
              this.$emit("next"); //下一页
            });
        } else {
          return false;
        }
      });
    },
    prev() {
      this.$emit("prev");
    },
  },
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
