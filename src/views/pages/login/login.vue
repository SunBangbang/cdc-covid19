<template>
  <div class="aui-wrapper aui-page__login">
    <div class="aui-content__wrapper">
      <img src="@/assets/image/cdc-logo.png" class="cdc-logo" />
      <main class="aui-content">
        <div class="login-header">
          <h2 class="login-brand">{{ $t("brand.lg") }}</h2>
          <h2 class="login-subBrand">{{ $t("brand.lgen") }}</h2>
        </div>
        <div class="login-bottom">
          <img src="../../../assets/img/login_bg_image.png" />
        </div>
        <div class="login-body">
          <!-- 全局字体放大后 切换440px这个注释 -->
          <!--                    <self-carousel :index.sync="index" height="440px" ref="carousel">-->
          <self-carousel :index.sync="index" height="380px" ref="carousel">
            <!--          <h1 class="login-subtitle">{{ $t('brand.lg') }}</h1>-->

            <!--登录页-->
            <el-carousel-item>
              <h1 class="login-title" style="">{{ $t("login.title") }}</h1>
              <el-form
                class="login-form"
                :model="dataForm"
                :rules="dataRule"
                ref="dataForm"
                @keyup.enter.native="dataFormSubmitHandle()"
                status-icon
              >
                <!--            <el-form-item>-->
                <!--              <el-select v-model="$i18n.locale" class="w-percent-100">-->
                <!--                <el-option v-for="(val, key) in i18nMessages" :key="key" :label="val._lang" :value="key"></el-option>-->
                <!--              </el-select>-->
                <!--            </el-form-item>-->
                <el-form-item prop="username">
                  <el-input
                    v-model="dataForm.username"
                    :placeholder="$t('login.username')"
                  >
                    <span slot="prefix" class="el-input__icon">
                      <svg class="icon-svg" aria-hidden="true">
                        <use xlink:href="#icon-user"></use>
                      </svg>
                    </span>
                  </el-input>
                </el-form-item>
                <el-form-item prop="password">
                  <el-input
                    v-model="dataForm.password"
                    type="password"
                    :placeholder="$t('login.password')"
                  >
                    <span slot="prefix" class="el-input__icon">
                      <svg class="icon-svg" aria-hidden="true">
                        <use xlink:href="#icon-lock"></use>
                      </svg>
                    </span>
                  </el-input>
                </el-form-item>
                <el-form-item prop="captcha">
                  <el-row :gutter="20">
                    <el-col :span="14">
                      <el-input
                        v-model="dataForm.captcha"
                        :placeholder="$t('login.captcha')"
                      >
                        <span slot="prefix" class="el-input__icon">
                          <svg class="icon-svg" aria-hidden="true">
                            <use xlink:href="#icon-safetycertificate"></use>
                          </svg>
                        </span>
                      </el-input>
                    </el-col>
                    <el-col :span="10" class="login-captcha">
                      <img :src="captchaPath" @click="getCaptcha()" />
                    </el-col>
                  </el-row>
                </el-form-item>
                <div class="remember-psw">
                  <el-checkbox v-model="remember">记住密码</el-checkbox>
                </div>

                <el-form-item>
                  <el-button
                    type="primary"
                    @click="dataFormSubmitHandle()"
                    class="w-percent-100"
                    >{{ $t("login.title") }}
                  </el-button>
                </el-form-item>
                <!--                              <el-button type="text" class="bottom-blue" @click="toAnyPage(5)">用户注册</el-button>-->
                <el-button type="text" class="bottom-blue" @click="nextPage"
                  >忘记密码?</el-button
                >
              </el-form>
            </el-carousel-item>

            <!--手机验证页-->
            <el-carousel-item>
              <phone-check
                :index.sync="index"
                @prev="prevPage"
                @next="nextPage"
              ></phone-check>
            </el-carousel-item>
            <!--设置新密码页-->
            <el-carousel-item>
              <reset-password
                :index.sync="index"
                @prev="toAnyPage('0')"
                @next="nextPage"
              ></reset-password>
            </el-carousel-item>
            <!--重置成功页-->
            <el-carousel-item>
              <el-icon class="el-icon-success"></el-icon>
              <div class="success-text-1">密码重置成功</div>
              <div class="success-text-2">请妥善保管您的账户信息</div>
              <el-button
                type="text"
                class="re-login bottom-blue"
                @click="toAnyPage('0')"
                >重新登录</el-button
              >
            </el-carousel-item>

            <!--                      <el-carousel-item>-->
            <!--                        密码和确认密码-->
            <!--                      </el-carousel-item>-->
            <!--                      <el-carousel-item>-->
            <!--                        <register-part-a ></register-part-a>-->
            <!--                        <p @click="prevPage">ssssssss</p>-->
            <!--                      </el-carousel-item>-->
            <!-- 授权码 -->
            <el-carousel-item>
              <h1 class="login-title">授权码</h1>
              <el-form
                class="reset-pws"
                :model="authCodeform"
                status-icon
                :rules="authCodeRules"
                ref="authCodeform"
              >
                <el-form-item prop="authCode">
                  <el-input
                    type="text"
                    prefix-icon="el-icon-mobile-phone"
                    v-model="authCodeform.authCode"
                    autocomplete="off"
                    placeholder="请输入授权码"
                  >
                  </el-input>
                </el-form-item>
                <el-form-item>
                  <span
                    style="
                      color: '#0079fe';
                      margin-bottom: 20px;
                      margin-top: 40px;
                    "
                    >说明：如无授权码，请联系所在组织管理员获取。
                  </span>
                </el-form-item>
                <el-form-item style="margin-bottom: 20px">
                  <el-button
                    type="primary"
                    class="w-percent-100"
                    @click="submitAuthCodeForm()"
                    >确定
                  </el-button>
                </el-form-item>
                <el-button type="text" class="bottom-blue" @click="toAnyPage(0)"
                  >返回</el-button
                >
              </el-form>
            </el-carousel-item>
            <!-- 强制修改密码 -->
            <el-carousel-item>
              <h1 class="login-title">修改密码</h1>
              <el-form
                :model="passwordForm"
                :rules="passwordFormRule"
                ref="passwordForm"
                @keyup.enter.native="passwordFormSubmitHandle()"
                label-position="left"
                label-width="100px"
              >
                <el-form-item
                  prop="password"
                  :label="$t('updatePassword.password')"
                  style="margin-bottom: 20px"
                >
                  <el-input
                    v-model="passwordForm.password"
                    type="password"
                    :placeholder="$t('updatePassword.password')"
                    maxlength="16"
                    autocomplete="false"
                    clearable
                  ></el-input>
                </el-form-item>
                <el-form-item
                  prop="newPassword"
                  :label="$t('updatePassword.newPassword')"
                  style="margin-bottom: 20px"
                >
                  <el-input
                    v-model="passwordForm.newPassword"
                    type="password"
                    :placeholder="$t('updatePassword.newPassword')"
                    maxlength="16"
                    autocomplete="false"
                    clearable
                  ></el-input>
                </el-form-item>
                <el-form-item
                  prop="confirmPassword"
                  :label="$t('updatePassword.confirmPassword')"
                >
                  <el-input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    :placeholder="$t('updatePassword.confirmPassword')"
                    maxlength="16"
                    autocomplete="false"
                    clearable
                  ></el-input>
                </el-form-item>
                <el-button
                  type="primary"
                  class="w-percent-100"
                  @click="passwordFormSubmitHandle()"
                  >{{ $t("confirm") }}</el-button
                >
                <el-button type="text" class="bottom-blue" @click="toAnyPage(0)"
                  >返回</el-button
                >
              </el-form>
            </el-carousel-item>
          </self-carousel>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import debounce from "lodash/debounce";
import cloneDeep from "lodash/cloneDeep";
import { messages } from "@/i18n";
import { getUUID } from "@/utils";
import selfCarousel from "@/views/pages/login/components/self-carousel";
import resetPassword from "@/views/pages/login/components/reset-password";
import phoneCheck from "@/views/pages/login/components/phone-check";
import { decrypt, encrypt } from "@/utils/secret";
import { setAuthCode } from "@/api/sys/setAuthCode";
import { updatePassword } from "@/api/user/user";
// import RegisterPartA from "@/iews/pages/login/components/register-partA";

export default {
  components: {
    // RegisterPartA,
    selfCarousel,
    resetPassword,
    phoneCheck,
  },
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入新密码"));
      } else {
        if (this.ruleForm.checkPass !== "") {
          this.$refs.ruleForm.validateField("checkPass");
        }
        callback();
      }
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
    var validateNewPassword = (rule, value, callback) => {
      if (
        !/^(?![A-Za-z0-9]+$)(?![a-z0-9\W]+$)(?![A-Za-z\W]+$)(?![A-Z0-9\W]+$)[a-zA-Z0-9\W]{8,16}$/.test(
          value
        )
      ) {
        // this.dataForm.password = "";
        return callback("包含大小写字母、数字、特殊符号的8到16位密码！");
      }
      callback();
    };
    var validateConfirmPassword = (rule, value, callback) => {
      if (this.passwordForm.newPassword !== value) {
        return callback(new Error("确认密码与新密码输入不一致"));
      }
      callback();
    };
    return {
      i18nMessages: messages,
      captchaPath: "",
      remember: JSON.parse(localStorage.getItem("rememberPassword")),
      index: 0,
      dataForm: {
        username: "",
        password: "",
        uuid: "",
        captcha: "",
        grant_type: "password", //后台会验证这个数据
      },
      ruleForm: {
        pass: "",
        checkPass: "",
        age: "",
      },
      rules: {
        pass: [{ validator: validatePass, trigger: "blur" }],
        checkPass: [{ validator: validatePass2, trigger: "blur" }],
      },
      authCodeform: {
        authCode: "",
      },
      authCodeRules: {
        authCode: [
          { required: true, message: "请输入授权码", trigger: "blur" },
        ],
      },
      passwordForm: {
        password: "",
        newPassword: "",
        confirmPassword: "",
      },
      passwordFormRule: {
        password: [
          {
            required: true,
            message: this.$t("validate.required"),
            trigger: "blur",
          },
        ],
        newPassword: [
          {
            required: true,
            message: this.$t("validate.required"),
            trigger: "blur",
          },
          { validator: validateNewPassword, trigger: "blur" },
        ],
        confirmPassword: [
          {
            required: true,
            message: this.$t("validate.required"),
            trigger: "blur",
          },
          { validator: validateConfirmPassword, trigger: "blur" },
        ],
      },
    };
  },
  computed: {
    dataRule() {
      return {
        username: [
          {
            required: true,
            message: this.$t("validate.required"),
            trigger: "blur",
          },
        ],
        password: [
          {
            required: true,
            message: this.$t("validate.required"),
            trigger: "blur",
          },
        ],
        captcha: [
          {
            required: true,
            message: this.$t("validate.required"),
            trigger: "blur",
          },
        ],
      };
    },
  },
  created() {
    this.getCaptcha();
    this.setForm();
  },
  methods: {
    // 获取验证码
    getCaptcha() {
      this.dataForm.uuid = getUUID();
      this.captchaPath = `${window.SITE_CONFIG["apiURL"]}/captcha?uuid=${this.dataForm.uuid}`;
    },
    //读取cookie填写表单
    setForm() {
      if (this.remember) {
        let id = Cookies.get("id") || "";
        if (id.length === 0) return;

        id = window.atob(id); //解码
        const user = id.match(/.*(?=-)/)[0];
        const psw = id.match(/(?<=-).*/)[0];
        this.dataForm.username = decrypt(user);
        this.dataForm.password = decrypt(psw);
        // console.log('dataForm:', this.dataForm.username)
      }
    },
    // 表单提交
    dataFormSubmitHandle: debounce(
      function () {
        this.$refs["dataForm"].validate((valid) => {
          if (!valid) {
            return false;
          }
          const loading = this.$loading({
            lock: true,
            text: "登录中...",
            background: "rgba(0, 0, 0, 0.7)",
          });
          const params = cloneDeep(this.dataForm);

          this.$http
            .post("/oauth/token", params, {
              headers: {
                "content-type": "application/x-www-form-urlencoded",
                Authorization: "Basic cmVucmVuaW86cmVucmVuaW8=",
              },
            })
            .then(({ data: res }) => {
              // console.log('token interceptor, cryptTo:', store.state.cryptoOpen, '  ' , res )
              if (res.code !== 0) {
                loading.close();
                this.getCaptcha();
                return this.$message.error(res.msg);
              }
              localStorage.setItem(
                "rememberPassword",
                JSON.stringify(this.remember)
              );
              // console.log(res.access_token);
              this.$store.commit("saveSm4Key", res.key);
              localStorage.setItem("keyForSm4", res.key);
              const expireTime = 30;
              if (this.remember) {
                const tmpUsername = cloneDeep(this.dataForm.username);
                const tmpPassword = cloneDeep(this.dataForm.password);
                let id = encrypt(tmpUsername) + "-" + encrypt(tmpPassword);
                // console.log('id:', id)
                id = window.btoa(id); //编码
                Cookies.set("id", id, { expires: expireTime, path: "" });
              }
              Cookies.set("access_token", res.access_token); //记录一个access_token
              if (!res.hasAuthCode) {
                this.toAnyPage(4);
                loading.close();
              } else if (res.needUpdatePassword) {
                this.$message.warning("您的密码超90天未修改，为保障账户安全，请您及时修改登录密码。");
                this.toAnyPage(5);
                loading.close();
              } else {
                window.loginLoading = loading;
                this.$router.push({ path: "/" }, () => {});
              }
            })
            .catch((error) => {
              this.$message.error(error);
              loading.close();
            });
        });
      },
      1000,
      { leading: true, trailing: false }
    ),
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.index++;
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    submitAuthCodeForm: debounce(function () {
      this.$refs["authCodeform"].validate((valid) => {
        if (!valid) {
          return false;
        }
        console.log(this.authCodeform);
        setAuthCode(this.authCodeform).then((res) => {
          if (res.data.code !== 0) {
            this.$message.error(res.data.msg);
            return;
          }
          // this.$message.success("操作成功");
          // this.getCaptcha();
          // this.dataForm.captcha = "";
          // this.toAnyPage(0);
          this.$router.push({ path: "/" }, () => {});
        });
      });
    }),
    passwordFormSubmitHandle: debounce(function () {
      this.$refs["passwordForm"].validate((valid) => {
        if (!valid) {
          return false;
        }
        updatePassword(this.passwordForm).then((res) => {
          if (res.data.code !== 0) {
            this.$message.error(res.data.msg);
            return;
          }
          this.$message.success("操作成功");
          this.getCaptcha();
          this.dataForm.username = "";
          this.dataForm.password = "";
          this.dataForm.captcha = "";
          this.toAnyPage(0);
        });
      });
    }),
    nextPage() {
      this.$refs.carousel.nextPage();
    },
    prevPage() {
      this.$refs.carousel.prevPage();
    },
    toAnyPage(index) {
      this.$refs.carousel.setActiveItem(index);
    },
  },
};
</script>

<style lang="scss" scoped>
.login-brand {
  font-size: 54px !important;
  margin: 0 0 5px 0 !important;
}

.login-subBrand {
  font-size: 24px !important;
  margin: 5px 0 0.67em 0 !important;
}

.login-form {
  margin: 20px 0 50px 0;
  .el-form-item {
    margin-bottom: 22px;
  }
}

.aui-page__login {
  background-color: #03c4dc !important;
  background-image: none !important;
  background-size: cover;
}

.aui-page__login:before {
  background-color: #03c4dc !important;
  background-image: none !important;
}

.cdc-logo {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 168px;
  height: 144px;
}
.login-body {
  z-index: 1001;
  box-shadow: 0 0 20px rgba(191, 191, 191, 0.57);
}

.login-bottom {
  z-index: 0;
  border-width: 0;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}

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

.login-body {
  .el-icon-success {
    color: #4bd863;
    font-size: 70px;
    margin-top: 90px;
  }
}

.success-text-1 {
  font-size: 20px;
  font-weight: 700;
  color: #666666;
  margin-top: 10px;
}

.success-text-2 {
  color: #999999;
  font-size: 12px;
  margin-top: 13px;
}

.re-login {
  margin-top: 50px;
}

.remember-psw {
  display: flex;
  margin-bottom: 25px;
  position: relative;
  top: -4px;
}
</style>
