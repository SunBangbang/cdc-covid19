import Vue from "vue";
import Vuex from "vuex";
import cloneDeep from "lodash/cloneDeep";
import conversation from "./modules/conversation";
import group from "./modules/group";
import user from "./modules/user";
import video from "./modules/video";
import friend from "./modules/friend";
import form from "./modules/form";
import blacklist from "./modules/blacklist";
import groupLive from "./modules/groupLive";
import { Message } from "element-ui";

Vue.use(Vuex);

export default new Vuex.Store({
  namespaced: true,
  state: {
    //IM
    current: Date.now(), // 当前时间
    intervalID: 0,
    message: undefined,
    // 导航条, 布局风格, default(白色) / colorful(鲜艳)
    navbarLayoutType: "colorful",
    // 侧边栏, 布局皮肤, default(白色) / dark(黑色)
    sidebarLayoutSkin: "dark",
    // 侧边栏, 折叠状态
    sidebarFold: false,
    // 侧边栏, 菜单
    sidebarMenuList: [],
    sidebarMenuActiveName: "",
    // 内容, 是否需要刷新
    contentIsNeedRefresh: false,
    // 内容, 标签页(默认添加首页)
    contentTabs: [
      {
        ...window.SITE_CONFIG["contentTabDefault"],
        name: "dashbord-dashbord",
        title: "home"
      }
    ],
    contentTabsActiveName: "dashbord-dashbord",
    //当前用户头像
    headImgUrl: "",
    //IM聊天对话框是否显示
    chatDialogVisible: false,
    // 是否开启加密, true->开启加密，false->关闭加密
    cryptoOpen: true,
    // 加密白名单
    wihteList: [
      "/oauth/token",
      "forgetpsw/sentPhoneCode",
      "forgetpsw/checkoutcode",
      "forgetpsw/resetpsw",
      "sys/user/upload",
      "/device/upload"
    ],
    uploadList: ["sys/user/upload", "/device/upload"],
    //SM4密钥
    key: "",
    languageSelected: 1,
    // 前后端2对公钥和私钥，搭配使用
    //后端公钥
    publicKey:
      "04d60807392e08d3a06bc38ae1fb554a24a3a03445f7aaaa0b7b3c9e9714d4791184cdbe9419baa502205912c97651f12004ab1bfee8d384ec0abc3dfafbf01c89",
    //前端私钥
    privateKey:
      "00c43c0e67849874ef475e7180134ae865c57747e38285134abc9997ec305de11f",
    // 协查监听关联表属性，
    saveProp: null
  },
  modules: {
    conversation,
    group,
    friend,
    blacklist,
    user,
    video,
    groupLive,
    form
  },
  getters: {
    hidden(state) {
      // eslint-disable-next-line no-unused-vars
      const temp = state.current;
      if (typeof document.hasFocus !== "function") {
        return document.hidden;
      }
      return !document.hasFocus();
    }
  },
  mutations: {
    //IM
    startComputeCurrent(state) {
      state.intervalID = setInterval(() => {
        state.current = Date.now();
      }, 500);
    },
    stopComputeCurrent(state) {
      clearInterval(state.intervalID);
      state.intervalID = 0;
    },
    showMessage(state, options) {
      if (state.message) {
        state.message.close();
      }
      state.message = Message({
        message: options.message,
        type: options.type || "success",
        duration: options.duration || 2000,
        offset: 40
      });
    },
    updateHeadImg(state, val) {
      state.headImgUrl = val;
    },
    updateChatDialog(state, val) {
      state.chatDialogVisible = val;
    },
    saveSm4Key(state, val) {
      state.key = val;
    },
    languageSelected(state, val) {
      state.languageSelected = val;
    },
    // 重置vuex本地储存状态
    resetStore(state) {
      Object.keys(state).forEach(key => {
        state[key] = cloneDeep(window.SITE_CONFIG["storeState"][key]);
      });
    },
    saveProp(state, val) {
      state.saveProp = val;
    }
  }
});
