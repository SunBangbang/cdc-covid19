<template>
  <div>
    <nav
      class="aui-navbar"
      :class="`aui-navbar--${$store.state.navbarLayoutType}`"
    >
      <div
        class="aui-navbar__headers"
        :style="{ width: !$store.state.sidebarFold ? '280px' : '64px' }"
      >
        <div class="aui-navbar__brand remind-block">
          <h3 class="aui-navbar__brand-title">{{ $t("brand.lg") }}</h3>
          <div class="aui-navbar__brand-mini">
            <img src="@/assets/img/mini-icon.png" />
          </div>
        </div>
      </div>
      <div class="aui-navbar__body">
        <el-menu
          class="aui-navbar__menu mr-auto"
          mode="horizontal"
          style="z-index: 99"
        >
          <el-menu-item
            index="1"
            @click="$store.state.sidebarFold = !$store.state.sidebarFold"
          >
            <a title="收缩">
              <svg
                class="icon-svg aui-navbar__icon-menu aui-navbar__icon-menu--switch"
                aria-hidden="true"
              >
                <use xlink:href="#icon-outdent"></use>
              </svg>
            </a>
          </el-menu-item>
          <el-menu-item index="2" title="刷新" @click="refresh()" v-points>
            <svg
              class="icon-svg aui-navbar__icon-menu aui-navbar__icon-menu--refresh"
              aria-hidden="true"
            >
              <use xlink:href="#icon-sync"></use>
            </svg>
          </el-menu-item>
          <el-menu-item index="7" title="全屏" @click="fullscreenHandle()">
            <svg class="icon-svg aui-navbar__icon-menu" aria-hidden="true">
              <use xlink:href="#icon-fullscreen"></use>
            </svg>
          </el-menu-item>
          <el-menu-item
            index="3"
            @click="getLarge"
            class="link"
            v-if="vedioVisible"
          >
            <a title="视频通话">
              <i class="el-icon-phone"></i>
              <sup class="unread">
                <template v-if="callStatus">正在通话中</template>
                <template v-else>正在呼叫</template>
              </sup>
            </a>
          </el-menu-item>
          <!--<el-menu-item index="2">-->
          <!--<svg class="icon-svg aui-navbar__icon-menu aui-navbar__icon-menu&#45;&#45;search" aria-hidden="true"><use xlink:href="#icon-search"></use></svg>-->
          <!--&nbsp;<el-input size="mini" placeholder="请输入搜索内容" ></el-input>-->
          <!--</el-menu-item>-->
        </el-menu>
        <el-menu class="aui-navbar__menu" mode="horizontal">
          <!--<el-menu-item index="1">-->
          <!--<el-dropdown placement="bottom" :show-timeout="0">-->
          <!--<el-button size="mini">{{ $t('_lang') }}</el-button>-->
          <!--<el-dropdown-menu slot="dropdown">-->
          <!--<el-dropdown-item v-for="(val, key) in i18nMessages" :key="key" @click.native="$i18n.locale = key">{{ val._lang }}</el-dropdown-item>-->
          <!--</el-dropdown-menu>-->
          <!--</el-dropdown>-->
          <!--</el-menu-item>-->
          <!--        <el-menu-item index="1">-->
          <!--          {{nowDate}}-->
          <!--          {{nowWeek}}-->
          <!--        </el-menu-item>-->
          <!--<el-menu-item index="2" v-if="$hasPermission('sys:notice:all')">
            <el-badge :is-dot="messageTip">
              <a href="#"  @click="myNoticeRouter()"><i class="el-icon-bell"></i></a>
            </el-badge>
          </el-menu-item>-->
          <el-menu-item index="2" class="link">
            <a href="#" @click="handleVideoClick" title="视频会议"
              ><i class="el-icon-video-camera"></i
            ></a>
          </el-menu-item>
          <el-menu-item index="3" class="link">
            <!--          <el-badge v-if="unreadMessageCount > 0" :value="unreadMessageCount > 99 ? '99+' : unreadMessageCount">-->
            <!--            <a href="#" @click="handleBellClick" :title="unreadMessageTitle"><i class="el-icon-bell"></i></a>-->
            <!--          </el-badge>-->
            <!--          <a v-else href="#" @click="handleBellClick" title="消息通知"><i class="el-icon-bell"></i></a>-->
            <el-badge>
              <a
                href="#"
                class="iconfont"
                @click="handleBellClick"
                :title="unreadMessageTitle"
              >
                <i class="el-icon-bell"></i>
                <sup class="unread" v-if="unreadMessageCount !== 0">
                  <template v-if="unreadMessageCount > 99">99+</template>
                  <template v-else>{{ unreadMessageCount }}</template>
                </sup>
              </a>
            </el-badge>
          </el-menu-item>
          <el-menu-item index="4" class="link">
            <!--          <el-badge  v-if="totalUnreadCount>0" :is-dot="messageTip" :value="totalUnreadCount > 99 ? '99+' : totalUnreadCount">-->
            <!--            <a href="#" @click="handleIMClick" title="流调通" >-->
            <!--              <i class="el-icon-chat-dot-round"></i>-->
            <!--            </a>-->
            <!--          </el-badge>-->
            <!--          <el-badge v-else :is-dot="messageTip">-->
            <!--            <a href="#" @click="handleIMClick" title="流调通" >-->
            <!--              <i class="el-icon-chat-dot-round"></i>-->
            <!--            </a>-->
            <!--          </el-badge>-->
            <el-badge>
              <a
                href="#"
                class="iconfont"
                @click="handleIMClick"
                title="流调通"
              >
                <i class="el-icon-chat-dot-round"></i>
                <sup class="unread" v-if="totalUnreadCount !== 0">
                  <template v-if="totalUnreadCount > 99">99+</template>
                  <template v-else>{{ totalUnreadCount }}</template>
                </sup>
              </a>
            </el-badge>
          </el-menu-item>

          <el-menu-item
            index="5"
            @click="handleTaskClick"
            class="link"
            v-loading.fullscreen.lock="loadingFlag"
            element-loading-spinner="el-icon-loading"
            element-loading-text="加载中"
            element-loading-background="rgba(82,	176,	163, 0.2)"
          >
            <el-badge>
              <a class="iconfont" title="我的任务">
                <i class="el-icon-folder-checked"></i>
                <sup class="unread" v-if="mytaskCount > 0">
                  <template v-if="mytaskCount > 99">99+</template>
                  <template v-else>{{ mytaskCount }}</template>
                </sup>
              </a>
            </el-badge>
          </el-menu-item>
          <!--        <el-menu-item index="6" @click="handleToolsClick" class="link">-->
          <!--          <a title="个人设置"><i class="el-icon-s-tools"></i></a>-->
          <!--        </el-menu-item>-->
          <el-menu-item index="8" class="aui-navbar__avatar">
            <el-dropdown placement="bottom" :show-timeout="0">
              <span class="el-dropdown-link">
                <!--              <img v-if="isImageUrl" src="~@/assets/img/avatar.png">-->
                <img v-show="imageUrl" :src="imageUrl" />
                <span>{{ form.nick }}</span>
                <i class="el-icon-arrow-down"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="handleToolsClick()">{{
                  $t("userSet")
                }}</el-dropdown-item>
                <el-dropdown-item @click.native="updatePasswordHandle()"
                  >{{ $t("updatePassword.title") }}
                </el-dropdown-item>
                <el-dropdown-item @click.native="switchDept()">{{
                  $t("dept.switch")
                }}</el-dropdown-item>
                <el-dropdown-item @click.native="logoutHandle()">{{
                  $t("logout")
                }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-menu-item>
        </el-menu>
      </div>
      <!-- 弹窗, 修改密码 -->
      <update-password
        v-if="updatePasswordVisible"
        ref="updatePassword"
      ></update-password>
      <!-- 弹窗, 切换当前用户组织部门, 多部门时使用 -->
      <switch-dept v-if="switchDeptVisible" ref="switchDept" />
    </nav>
    <el-drawer
      class="connect-drawer"
      :visible.sync="contactDrawer"
      custom-class="drawer-customer"
      size="26%"
    >
      <template slot="title">
        <div class="drawer-header">
          <i
            class="el-icon-chat-line-square"
            style="color: #409eff; font-weight: bolder"
          ></i
          >&nbsp;流调通
        </div>
      </template>
      <contact-drawer @updateStatus3="updateStatus3"></contact-drawer>
    </el-drawer>
    <message-drawer
      :v-if="messageDrawerVisable"
      ref="messageDrawer"
    ></message-drawer>
    <calling
      ref="call"
      :chatVisible="chatVisible"
      @small="small"
      @status="getStatus"
    />
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { messages } from "@/i18n";
import screenfull from "screenfull";
import UpdatePassword from "./main-navbar-update-password";
import SwitchDept from "./main-navbar-switch-dept";
import { getDictLabel } from "@/utils";
import { clearLoginInfo } from "@/utils";
import Cookies from "js-cookie";
import ContactDrawer from "../components/contact-drawer/src/contact-drawer";
import MessageDrawer from "../components/contact-drawer/src/message-drawer";
import { countUnreadMessage } from "@/api/message/message";
import { getUserDetailList, getUserById } from "@/api/user/user";
import Calling from "../components/message/trtc-calling/calling-index";
import { genUserSig } from "@/api/tencentIM/IM";
import { getMyTaskCount } from "@/api/subject-task/task-management";
import AppConstant from "@/utils/AppConstant";

var socket = null;
export default {
  inject: ["refresh"],
  data() {
    return {
      callStatus: false,
      vedioVisible: false,
      chatVisible: false,
      form: { avatar: "", nick: "", gender: "" },
      i18nMessages: messages,
      imageUrl: "",
      updatePasswordVisible: false,
      switchDeptVisible: false,
      messageTip: false,
      contactDrawer: false,
      nowDate: "", // 当前日期
      nowWeek: "", // 当前星期
      unreadMessageCount: 0,
      unreadMessageTitle: "",
      messageDrawerVisable: false,
      taskTip: false,
      loadingFlag: false,
      mytaskCount: 0,
      userDefHeadImg: require("@/assets/img/userDefHeadImg.png"),
    };
  },
  computed: {
    ...mapGetters(["totalUnreadCount"]),
    headImg: {
      get() {
        return this.$store.state.headImgUrl;
      },
      set(val) {},
    },
  },
  watch: {
    headImg: {
      handler: function (val, oldVal) {
        this.imageUrl = val;
      },
      immediate: true,
    },
  },
  components: {
    ContactDrawer,
    UpdatePassword,
    SwitchDept,
    MessageDrawer,
    Calling,
  },
  mounted() {
    // var _this = this
    /*    setInterval(() => {
      _this.getCurrentDate()
    }, 30000)*/
  },
  beforeDestroy() {
    /* if (this.getCurrentDate) {
      console.log("销毁定时器")
      clearInterval(this.getCurrentDate); // 在Vue实例销毁前，清除时间定时器
    }*/
  },
  created() {
    this.loginIM();
    var vue = this;
    let socketUrl = `${
      window.SITE_CONFIG["socketURL"]
    }?access_token=${Cookies.get("access_token")}`;
    console.log("socket url:", socketUrl);
    socket = new WebSocket(socketUrl);
    socket.onopen = function () {
      console.log("open websocket.....");
    };
    socket.onerror = function (e) {
      console.log("websocket error......", e);
      /*vue.$notify.error({
        title: vue.$t('notice.disconnect'),
        message: vue.$t('notice.disconnectMessage')
      })*/
    };
    socket.onmessage = function (evt) {
      const result = JSON.parse(evt.data);

      console.log("receive message:", result);
      // 如果是有新文本通知，则提示有新通知
      if (result.type === AppConstant.MESSAGE.TEXT) {
        vue.messageTip = true;
        vue.$notify({
          title: vue.$t("notice.new"),
          message: result.msg,
          type: "info",
          duration: 5000,
        });
      } else if (result.type === AppConstant.MESSAGE.ONSITE_NOTICE) {
        vue.unreadMessageCount = result.data;
      } else if (result.type === AppConstant.MESSAGE.NET_MEETING) {
      } else if (result.type === AppConstant.MESSAGE.MY_TASK) {
        vue.mytaskCount = result.data;
        vue.$notify({
          title: vue.$t("notice.new"),
          message: result.msg,
          type: "info",
          duration: 5000,
        });
      } else if (result.type === AppConstant.MESSAGE.ASSIST_TASK) {
        vue.$notify({
          title: vue.$t("notice.new"),
          message: result.msg,
          type: "info",
          duration: 5000,
        });
      }
    };

    // 未读通知数
    // this.getUnReadCount()
    this.getCurrentDate();

    // 定时获取未读消息
    this.getUnReadMessageCount();

    //获取我的任务数量
    this.getMyTaskCount();

    // let params = {
    // username: this.$store.state.user.name
    // }
    getUserById(this.$store.state.user.id).then((res) => {
      if (res.data.code === 0) {
        let dataForm = { genderName: "" };
        dataForm.genderName = getDictLabel("gender", res.data.data.gender);
        if (dataForm.genderName == "男") {
          this.form.gender = TIM.TYPES.GENDER_MALE;
        } else if (dataForm.genderName == "女") {
          this.form.gender = TIM.TYPES.GENDER_FEMALE;
        } else {
          this.form.gender = TIM.TYPES.GENDER_UNKNOWN;
        }
        this.form.nick = res.data.data.realName;
        this.imageUrl = res.data.data.headUrl;
        this.imageUrl = !this.imageUrl
          ? this.userDefHeadImg
          : this.imageUrl;
        this.form.avatar = this.imageUrl;
      } else {
        console.error("err:", res.data.msg);
      }
    });
  },
  methods: {
    loginIM() {
      console.log("loginIM:", this.$store.state.user);
      genUserSig(this.$store.state.user.name).then((res) => {
        let data = res.data;
        this.tim
          .login({
            userID: this.$store.state.user.name,
            userSig: data.userSig,
          })
          .then(() => {
            this.$store.commit("toggleIsLogin", true);
            this.$store.commit("startComputeCurrent");
            this.$store.commit({
              type: "GET_USER_INFO",
              userID: this.$store.state.user.name,
              userSig: data.userSig,
              sdkAppID: data.sdkAppId,
            });

            // this.$store.commit('showMessage', {
            //   type: 'success',
            //   message: '登录成功'
            // })
          })
          .catch((error) => {
            this.loading = false;
            this.$store.commit("showMessage", {
              message: "登录失败：" + error.message,
              type: "error",
            });
          });
      });
    },
    handleIMClick() {
      this.contactDrawer = true;
      this.updateIMinformation();
    },
    updateIMinformation() {
      const options = {};
      // 过滤空串
      Object.keys(this.form).forEach((key) => {
        if (this.form[key]) {
          options[key] = this.form[key];
        }
      });
      this.tim.updateMyProfile(options);
    },
    updateStatus3(data) {
      this.chatVisible = data;
    },
    small(data) {
      this.vedioVisible = data;
    },
    getStatus(data) {
      this.callStatus = data;
    },
    getLarge() {
      this.$refs.call.open();
      this.vedioVisible = false;
    },
    myNoticeRouter() {
      this.$router.replace("notice-notice-user");
    },
    getCurrentDate() {
      var _this = this;
      let yy = new Date().getFullYear();
      let mm = new Date().getMonth() + 1;
      let dd = new Date().getDate();
      let week = new Date().getDay();
      let hh = new Date().getHours();
      let mi = new Date().getMinutes();
      if (week == 1) {
        _this.nowWeek = "星期一";
      } else if (week == 2) {
        _this.nowWeek = "星期二";
      } else if (week == 3) {
        _this.nowWeek = "星期三";
      } else if (week == 4) {
        _this.nowWeek = "星期四";
      } else if (week == 5) {
        _this.nowWeek = "星期五";
      } else if (week == 6) {
        _this.nowWeek = "星期六";
      } else {
        _this.nowWeek = "星期日";
      }
      if (mi > 9)
        _this.nowDate = yy + "年" + mm + "月" + dd + "日" + " " + hh + ":" + mi;
      else
        _this.nowDate =
          yy + "年" + mm + "月" + dd + "日" + " " + hh + ":" + "0" + mi;
    },
    getUnReadCount() {
      this.$http
        .get(`/sys/notice/mynotice/unread`)
        .then(({ data: res }) => {
          if (res.code !== 0) {
            return this.$message.error(res.msg);
          }
          if (res.data > 0) {
            this.messageTip = true;
          }
        })
        .catch(() => {});
    },
    // 全屏
    fullscreenHandle() {
      if (!screenfull.enabled) {
        return this.$message({
          message: this.$t("fullscreen.prompt"),
          type: "warning",
          duration: 500,
        });
      }
      screenfull.toggle();
    },
    // 修改密码
    updatePasswordHandle() {
      this.updatePasswordVisible = true;
      this.$nextTick(() => {
        this.$refs.updatePassword.init();
      });
    },
    //
    switchDept() {
      this.switchDeptVisible = true;
      this.$nextTick(() => {
        this.$refs.switchDept.init();
      });
    },
    // 退出
    logoutHandle() {
      this.$confirm(
        this.$t("prompt.info", { handle: this.$t("logout") }),
        this.$t("prompt.title"),
        {
          confirmButtonText: this.$t("confirm"),
          cancelButtonText: this.$t("cancel"),
          cancelButtonClass: "btn-custom-cancel",
          type: "warning",
        }
      )
        .then(() => {
          this.$store.dispatch("logout"); // 登出IM
          this.$http
            .post("/oauth/logout")
            .then(({ data: res }) => {
              if (res.code !== 0) {
                return this.$message.error(res.msg);
              }

              clearLoginInfo();
              this.$router.go(0); //页面刷新， 刷新后IM未读消息显示正确
            })
            .catch(() => {});
        })
        .catch(() => {});
    },
    // --------消息通知----------
    // 获取未读消息数量
    getUnReadMessageCount() {
      countUnreadMessage().then((res) => {
        this.unreadMessageCount = res.data.data;
        if (res.data.data != 0) {
          this.unreadMessageTitle = `${res.data.data}条消息通知`;
        } else {
          this.unreadMessageTitle = "消息通知";
        }
      });

      // 定时10s 获取一次
      /*  const timer = setInterval(() => {
        countUnreadMessage().then(res => {
          this.unreadMessageCount = res.data.data
          if (res.data.data != 0) {
            this.unreadMessageTitle = `${res.data.data}条消息通知`;
          } else {
            this.unreadMessageTitle = '消息通知'
          }
        })
      }, 10000)
      // 在beforeDestroy钩子触发时清除定时器
      this.$once('hook:beforeDestroy', () => {
        clearInterval(timer)
      })*/
    },
    //获取我的任务数量
    getMyTaskCount() {
      getMyTaskCount().then((res) => {
        if (res.data.code == 0) {
          this.mytaskCount = res.data.data;
        } else {
          console.error(res.data);
        }
      });

      // 定时60s 获取一次
      /*
      const timer = setInterval(() => {
        getMyTaskCount().then(res => {
          if (res.data.code == 0) {
            this.mytaskCount = res.data.data
          } else {
            console.error(res.data)
          }
        })
      }, 10000)
      // 在beforeDestroy钩子触发时清除定时器
      this.$once('hook:beforeDestroy', () => {
        clearInterval(timer);
      })
*/
    },
    // 点击消息图标
    handleBellClick() {
      this.contactDrawer = false;
      this.$refs.messageDrawer.messageDrawerVisable = true;
      this.$refs.messageDrawer.handleGetUnreadMessage();
    },
    // 点击设置图标
    handleToolsClick() {
      this.$router.push({ name: "user-personal-info" });
    },

    // 点击我的任务
    handleTaskClick() {
      //直接跳转到当前组织任务
      sessionStorage.setItem("tab", "now");
      if (this.$route.name === "subject-task-my-task-management") {
        this.openLoadingMask();
      } else {
        // this.$store.state.contentTabs = this.$store.state.contentTabs.filter(item => item.name !== 'subject-task-my-task-management')
        // console.log('2. contenttables:', this.$store.state.contentTabs)
        this.$router.push({ name: "subject-task-my-task-management" });
        this.$store.state.contentTabs = this.$store.state.contentTabs.filter(
          (item) => {
            return (
              item.name === "dashbord-dashbord" ||
              item.name === "subject-task-my-task-management"
            );
          }
        );
      }
    },

    //点击视频会议
    handleVideoClick() {
      window.open(
        `#/net-meeting/${this.$store.state.user.name}/${this.$store.state.user.id}/${this.$store.state.user.realName}`,
        "_blank"
      );
    },

    //显示加载缓冲
    openLoadingMask() {
      this.loadingFlag = true;
      setTimeout(() => {
        this.loadingFlag = false;
      }, 500);
    },
  },
};
</script>

<style>
.aui-navbar__brand-title,
.aui-navbar__brand-mini {
  max-width: 100%;
  color: #fff;
  /*cursor: pointer;*/
}
.aui-sidebar--fold .aui-navbar__brand-title {
  display: none;
}

.drawer-customer {
  margin-top: 88px;
}

.drawer-header {
  height: 30px;
  width: 100%;
  margin: 0 0 5px 0;
  padding: 1px 1px 1px 10px;
  background: white;
  font-weight: 500;
}

.drawer-header::before {
  display: inline-block;
  content: "";
  height: 100%;
  vertical-align: middle;
}

.unread {
  position: absolute;
  top: 10px;
  left: 30px;
  height: 18px;
  padding: 0 6px;
  color: #fff;
  line-height: 18px;
  border-radius: 10px;
  background-color: #f35f5f;
}

.remind-block {
  display: inline-block;
  width: 100%;
  height: 100%;
  vertical-align: middle;
  overflow: hidden;
  box-sizing: border-box;
  padding-left: 15px;
  position: relative;
}

.marquee {
  animation: marquee 10s linear infinite;
  white-space: nowrap;
  position: absolute;
}
.marqueeT {
  animation: marqueeT 10s linear infinite;
  white-space: nowrap;
  position: absolute;
}
@keyframes marquee {
  0% {
    left: 0;
  }
  100% {
    left: -150%;
  }
}
@keyframes marqueeT {
  0% {
    left: 150%;
  }
  100% {
    left: 0;
  }
}
</style>
