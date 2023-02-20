<template>
  <div v-loading.fullscreen.lock="loading" :element-loading-text="$t('loading')" @click="isTimeOut" :class="['aui-wrapper', { 'aui-sidebar--fold': $store.state.sidebarFold }]">
    <template v-if="!loading">
      <main-navbar />
      <main-sidebar />
      <div class="aui-content__wrapper" v-if="visible">
        <main-content v-if="!$store.state.contentIsNeedRefresh" />
      </div>
      <main-theme-tools />

    </template>

<!--     <div class="container">-->
<!--          <calling ref="callLayer" class="chat-wrapper" @showMainContent="val=>visible=val"/>-->
<!--      </div>-->
<!--      <div class="bg"></div>-->
  </div>
</template>

<script>
import MainNavbar from './main-navbar'
import MainSidebar from './main-sidebar'
import MainContent from './main-content'
import MainThemeTools from './main-theme-tools'
import debounce from 'lodash/debounce'

//IM
import {Main, Notification} from "element-ui";
import {translateGroupSystemNotice} from "../utils/common";
import {ACTION} from "../utils/trtcCustomMessageMap";
import Calling from '../components/message/trtc-calling/calling-index'
import MTA from "../utils/mta";
import {mapState} from "vuex";
import Cookies from 'js-cookie'

export default {
  provide () {
    return {
      // 刷新
      refresh () {
        this.$store.state.contentIsNeedRefresh = true
        this.$nextTick(() => {
          this.$store.state.contentIsNeedRefresh = false
        })
      }
    }
  },
  data () {
    return {
      loading: true,
      visible: true,
        lastTime: null, // 最后一次点击的时间
        currentTime: null, // 当前点击的时间
        timeOut: 60 * 60 * 1000 // 设置超时时间: 1小时
    }
  },
  components: {
    MainNavbar,
    MainSidebar,
    MainContent,
    MainThemeTools,
    // Calling
  },
  computed: {
    ...mapState({
      currentUserProfile: state => state.user.currentUserProfile,
      currentConversation: state => state.conversation.currentConversation,
      videoCall: state => state.conversation.videoCall,
      audioCall: state => state.conversation.audioCall,
      isLogin: state => state.user.isLogin,
      isSDKReady: state => state.user.isSDKReady,
      isBusy: state => state.video.isBusy,
      userID: state => state.user.userID,
      userSig: state => state.user.userSig,
      sdkAppID: state => state.user.sdkAppID
    }),
  },
  mounted() {
    // 初始化监听器
    this.initListener()
  },
  watch: {
    isLogin(next) {
      if (next) {
        MTA.clickStat('link_two', { show: 'true' })
      }
    },
    $route: 'routeHandle'
  },
  created () {
    // this.windowResizeHandle()
    this.routeHandle(this.$route)

    if(!!this.$store.state.key) {
      localStorage.setItem("keyForSm4", this.$store.state.key)
    } else {
      this.$store.commit('saveSm4Key', localStorage.getItem("keyForSm4"))
    }

    Promise.all([
      this.getUserInfo(),
      this.getPermissions(),
      this.loadDict()
    ]).then(() => {
      this.loading = false
    })

    // 在页面刷新时将vuex里的信息保存到sessionStorage里
    window.addEventListener('beforeunload', () => {
      // sessionStorage.setItem('store', JSON.stringify(this.$store.state))
      localStorage.setItem("dictList", JSON.stringify(window.SITE_CONFIG['dictList']))
      localStorage.setItem("bizDictList", JSON.stringify(window.SITE_CONFIG['bizDictList']))
    })
    this.lastTime = new Date().getTime()
  },
  methods: {
      isTimeOut() {
          this.currentTime = new Date().getTime()
          if (this.currentTime - this.lastTime > this.timeOut) {
              let access_token = Cookies.get('access_token')
              if (access_token) { // 如果是登录状态
                  console.log('expire time, logout.....................')
                  this.$store.dispatch('logout');// 登出IM
                  this.$http.post('/oauth/logout').then(({data: res}) => {
                      if (res.code !== 0) {
                          return this.$message.error(res.msg)
                      }

                      clearLoginInfo()
                      this.$router.go(0);  //页面刷新， 刷新后IM未读消息显示正确
                  }).catch(() => {
                  })
              } else {
                  this.lastTime = new Date().getTime()
              }
          } else {
              this.lastTime = new Date().getTime()
          }
      },
    // 窗口改变大小
    windowResizeHandle () {
      this.$store.state.sidebarFold = document.documentElement['clientWidth'] <= 992 || false
      window.addEventListener('resize', debounce(() => {
        this.$store.state.sidebarFold = document.documentElement['clientWidth'] <= 992 || false
      }, 150))
    },
    // 路由, 监听
    routeHandle (route) {
      if (!route.meta.isTab) {
        return false
      }
      var tab = this.$store.state.contentTabs.filter(item => item.name === route.name)[0]
      if (!tab) {
        tab = {
          ...window.SITE_CONFIG['contentTabDefault'],
          ...route.meta,
          'name': route.name,
          'params': { ...route.params },
          'query': { ...route.query }
        }
        this.$store.state.contentTabs = this.$store.state.contentTabs.concat(tab)
      }
      this.$store.state.sidebarMenuActiveName = tab.menuId
      this.$store.state.contentTabsActiveName = tab.name
    },
    // 获取当前管理员信息
    getUserInfo () {
      return this.$http.get('/sys/user/info').then(({ data: res }) => {
        if (res.code !== 0) {
          return this.$message.error(res.msg)
        }
        this.$store.state.user.id = res.data.id
        this.$store.state.user.name = res.data.username
        this.$store.state.user.realName = res.data.realName
        this.$store.state.user.superAdmin = res.data.superAdmin
        // 当前用户deptId取决于sessionDeptId
        this.$store.state.user.deptId = res.data.sessionDeptId
        this.$store.state.user.deptPid = res.data.deptPid
        this.$store.state.user.deptIds = res.data.deptIds
        this.$store.state.user.deptNames = res.data.deptName
        this.$store.state.user.truthDeptId = res.data.deptId
        this.$store.state.user.regionIds = res.data.regionIds
        console.log(this.$store.state.user)
        let obj = {}
        let ids = this.$store.state.user.deptIds.split(',')
        let names = this.$store.state.user.deptNames.split(' ')
        ids.forEach((item, index)=>{
          obj[item] = names[index]
        })
        this.$store.state.user.currentDeptName = obj[this.$store.state.user.deptId]
      }).catch(() => {})
    },
    // 获取权限
    getPermissions () {
      return this.$http.get('/sys/menu/permissions').then(({ data: res }) => {
        if (res.code !== 0) {
          return this.$message.error(res.msg)
        }
        window.SITE_CONFIG['permissions'] = res.data
        // console.log("permissions", res.data)
      }).catch(() => {})
    },
    // 获取字典列表, 添加并全局变量保存
    loadDict() {
      this.$http.get('/sys/dict/type/all').then(({ data: res }) => {
        if (res.code !== 0) {
          return;
        }
        window.SITE_CONFIG['dictList'] = res.data;
      }).catch(() => {})

      this.$http.get('/biz/dict/type/all').then(({ data: res }) => {
        if (res.code !== 0) {
          return;
        }
        window.SITE_CONFIG['bizDictList'] = res.data;
      }).catch(() => {})
    },
    //IM
    initListener() {
      // 登录成功后会触发 SDK_READY 事件，该事件触发后，可正常使用 SDK 接口
      this.tim.on(this.TIM.EVENT.SDK_READY, this.onReadyStateUpdate, this)
      // SDK NOT READT
      this.tim.on(this.TIM.EVENT.SDK_NOT_READY, this.onReadyStateUpdate, this)
      // 被踢出
      this.tim.on(this.TIM.EVENT.KICKED_OUT, this.onKickOut)
      // SDK内部出错
      this.tim.on(this.TIM.EVENT.ERROR, this.onError)
      // 收到新消息
      this.tim.on(this.TIM.EVENT.MESSAGE_RECEIVED, this.onReceiveMessage)
      // 会话列表更新
      this.tim.on(this.TIM.EVENT.CONVERSATION_LIST_UPDATED, this.onUpdateConversationList)
      // 群组列表更新
      this.tim.on(this.TIM.EVENT.GROUP_LIST_UPDATED, this.onUpdateGroupList)
      // 网络监测
      this.tim.on(this.TIM.EVENT.NET_STATE_CHANGE, this.onNetStateChange)
      // 已读回执
      this.tim.on(this.TIM.EVENT.MESSAGE_READ_BY_PEER, this.onMessageReadByPeer)
    },
    onReceiveMessage({ data: messageList }) {
      this.handleVideoMessage(messageList)
      this.handleQuitGroupTip(messageList)
      this.handleCloseGroupLive(messageList)
      this.$store.commit('pushCurrentMessageList', messageList)
      this.$store.commit('pushAvChatRoomMessageList', messageList)
    },
    onError({ data }) {
      if (data.message !== 'Network Error') {
        this.$store.commit('showMessage', {
          message: data.message,
          type: 'error'
        })
      }
    },
    onMessageReadByPeer() {

    },
    onReadyStateUpdate({ name }) {
      const isSDKReady = name === this.TIM.EVENT.SDK_READY ? true : false
      this.$store.commit('toggleIsSDKReady', isSDKReady)

      if (isSDKReady) {
        this.tim
                .getMyProfile()
                .then(({ data }) => {
                  this.$store.commit('updateCurrentUserProfile', data)
                })
                .catch(error => {
                  this.$store.commit('showMessage', {
                    type: 'error',
                    message: error.message
                  })
                })
        this.$store.dispatch('getBlacklist')
        // 登录trtc calling
        this.trtcCalling.login({
          sdkAppID: this.sdkAppID,
          userID: this.userID,
          userSig:this.userSig
        })

          // 拉取会话列表, 系统通知消息刷新页面后未读数量被清零
          /*let promise = tim.getConversationList();
          promise.then(function(imResponse) {
              const conversationList = imResponse.data.conversationList; // 会话列表，用该列表覆盖原有的会话列表
              console.log('getConversationList:', conversationList)
              conversationList.forEach(item=>{
                  console.log(item.conversationID + ' ', item.unreadCount)
              })
          }).catch(function(imError) {
              console.warn('getConversationList error:', imError); // 获取会话列表失败的相关信息
          });*/
      }
    },
    kickedOutReason(type) {
      console.log('kickedOutReason: ', type)
      switch (type) {
        case this.TIM.TYPES.KICKED_OUT_MULT_ACCOUNT:
          return '由于多实例登录'
        case this.TIM.TYPES.KICKED_OUT_MULT_DEVICE:
          return '由于多设备登录'
        case this.TIM.TYPES.KICKED_OUT_USERSIG_EXPIRED:
          return '由于 userSig 过期'
        default:
          return ''
      }
    },
    checkoutNetState(state) {
      console.log('checkoutNetState: ', state)
      switch (state) {
        case this.TIM.TYPES.NET_STATE_CONNECTED:
          return { message: '已接入网络', type: 'success' }
        case this.TIM.TYPES.NET_STATE_CONNECTING:
          return { message: '当前网络不稳定', type: 'warning' }
        case this.TIM.TYPES.NET_STATE_DISCONNECTED:
          return { message: '当前网络不可用', type: 'error' }
        default:
          return ''
      }
    },
    onNetStateChange(event) {
      let msg = this.checkoutNetState(event.data.state)
      if(msg && msg.length > 0){
        this.$store.commit('showMessage', msg)
      }
    },
    onKickOut(event) {
      this.$message({
        message: `${this.kickedOutReason(event.data.type)}被踢出，请重新登录。`,
        type: 'error',
        duration: 3000,
        onClose: () => {
          this.$store.commit('toggleIsLogin', false)
          this.$store.commit('reset')
          this.$store.dispatch('logout');// 登出IM

          //退出系统, 不删除cookie,
          //todo: 同一PC时可以， 不同PC时需要删除cookie，
          // clearLoginInfo()
          store.commit('resetStore')
          Cookies.remove('access_token')
          window.SITE_CONFIG['dynamicMenuRoutesHasAdded'] = false
          this.$router.push({name: 'login'})
          this.$router.go(0);  //页面刷新， 刷新后IM未读消息显示正确
        }
      })
    },
    onUpdateConversationList(event) {
      this.$store.commit('updateConversationList', event.data)
    },
    onUpdateGroupList(event) {
      this.$store.commit('updateGroupList', event.data)
    },
    onReceiveGroupSystemNotice(event) {
      const isKickedout = event.data.type === 4
      const isCurrentConversation =
              `GROUP${event.data.message.payload.groupProfile.groupID}` ===
              this.currentConversation.conversationID
      // 在当前会话被踢，需reset当前会话
      if (isKickedout && isCurrentConversation) {
        this.$store.commit('resetCurrentConversation')
      }
      Notification({
        title: '新系统通知',
        message: translateGroupSystemNotice(event.data.message),
        duration: 3000,
        onClick: () => {
          const SystemConversationID = '@TIM#SYSTEM'
          this.$store.dispatch('checkoutConversation', SystemConversationID)
        }
      })
    },
    /**
     * 处理 @ 我的消息
     * @param {Message[]} messageList
     */
    handleAt(messageList) {
      // 筛选有 @ 符号的文本消息
      const atTextMessageList = messageList.filter(
              message =>
                      message.type === this.TIM.TYPES.MSG_TEXT &&
                      message.payload.text.includes('@')
      )
      for (let i = 0; i < atTextMessageList.length; i++) {
        const message = atTextMessageList[i]
        const matched = message.payload.text.match(/@\w+/g)
        if (!matched) {
          continue
        }
        // @ 我的
        if (matched.includes(`@${this.currentUserProfile.userID}`)) {
          // 当前页面不可见时，调用window.Notification接口，系统级别通知。
          if (this.$store.getters.hidden) {
            this.notifyMe(message)
          }
          Notification({
            title: `有人在群${message.conversationID.slice(5)}提到了你`,
            message: message.payload.text,
            duration: 3000
          })
          this.$bus.$emit('new-messsage-at-me', {
            data: { conversationID: message.conversationID }
          })
        }
      }
    },
    selectConversation(conversationID) {
      if (conversationID !== this.currentConversation.conversationID) {
        this.$store.dispatch('checkoutConversation',conversationID)
      }
    },
    isJsonStr(str) {
      try{
        JSON.parse(str)
        return true
      }catch(err) {
        console.log(err)
        return false
      }
    },
    handleVideoMessage(messageList) {
      const videoMessageList = messageList.filter(
              message => message.type === this.TIM.TYPES.MSG_CUSTOM && this.isJsonStr(message.payload.data)
      )
      if (videoMessageList.length === 0) return
      const videoPayload = JSON.parse(videoMessageList[0].payload.data)
      if (videoPayload.action === ACTION.VIDEO_CALL_ACTION_DIALING) {
        if (this.isBusy) {
          this.$bus.$emit('busy', videoPayload, videoMessageList[0])
          return
        }
        this.$store.commit('GENERATE_VIDEO_ROOM', videoPayload.room_id)
        this.selectConversation(videoMessageList[0].conversationID) // 切换当前会话页
        if (videoMessageList[0].from !== this.userID) {
          this.$bus.$emit('isCalled')
        }
      }
      if (videoPayload.action === ACTION.VIDEO_CALL_ACTION_SPONSOR_CANCEL) {
        this.$bus.$emit('missCall')
      }
      if (videoPayload.action === ACTION.VIDEO_CALL_ACTION_REJECT) {
        this.$bus.$emit('isRefused')
      }
      if (videoPayload.action === ACTION.VIDEO_CALL_ACTION_SPONSOR_TIMEOUT) {
        this.$bus.$emit('missCall')
      }
      if (videoPayload.action === ACTION.VIDEO_CALL_ACTION_ACCEPTED) {
        this.$bus.$emit('isAccept')
      }
      if (videoPayload.action === ACTION.VIDEO_CALL_ACTION_HANGUP) {
        this.$bus.$emit('isHungUp')
      }
      if (videoPayload.action === ACTION.VIDEO_CALL_ACTION_LINE_BUSY) {
        this.$bus.$emit('isRefused')
      }
      if (videoPayload.action === ACTION.VIDEO_CALL_ACTION_ERROR) {
        this.$bus.$emit('isRefused')
      }
    },
    /**
     * 使用 window.Notification 进行全局的系统通知
     * @param {Message} message
     */
    notifyMe(message) {
      // 需检测浏览器支持和用户授权
      if (!('Notification' in window)) {
        return
      } else if (window.Notification.permission === 'granted') {
        this.handleNotify(message)
      } else if (window.Notification.permission !== 'denied') {
        window.Notification.requestPermission().then(permission => {
          // 如果用户同意，就可以向他们发送通知
          if (permission === 'granted') {
            this.handleNotify(message)
          }
        })
      }
    },
    handleNotify(message) {
      const notification = new window.Notification('有人提到了你', {
        icon: 'https://webim-1252463788.file.myqcloud.com/demo/img/logo.dc3be0d4.png',
        body: message.payload.text
      })
      notification.onclick = () => {
        window.focus()
        this.$store.dispatch('checkoutConversation', message.conversationID)
        notification.close()
      }
    },
    handleLinkClick() {
      MTA.clickStat('link_two', { click: 'true' })
    },
    /**
     * 收到有群成员退群/被踢出的groupTip时，需要将相关群成员从当前会话的群成员列表中移除
     * @param {Message[]} messageList
     */
    handleQuitGroupTip(messageList) {
      // 筛选出当前会话的退群/被踢群的 groupTip
      const groupTips = messageList.filter(message => {
        return this.currentConversation.conversationID === message.conversationID &&
                message.type === this.TIM.TYPES.MSG_GRP_TIP &&
                (message.payload.operationType === this.TIM.TYPES.GRP_TIP_MBR_QUIT ||
                        message.payload.operationType === this.TIM.TYPES.GRP_TIP_MBR_KICKED_OUT)
      })
      // 清理当前会话的群成员列表
      if (groupTips.length > 0) {
        groupTips.forEach(groupTip => {
          if (Array.isArray(groupTip.payload.userIDList) || groupTip.payload.userIDList.length > 0) {
            this.$store.commit('deleteGroupMemberList', groupTip.payload.userIDList)
          }
        })
      }
    },
    /**
     * 收到结束直播自定义消息，派发事件关闭组件
     * @param {Message[]} messageList
     */
    handleCloseGroupLive(messageList) {
      messageList.forEach(message => {
        if (this.currentConversation.conversationID === message.conversationID && message.type === this.TIM.TYPES.MSG_CUSTOM) {
          let data = {}
          try {
            data = JSON.parse(message.payload.data)
          } catch(e) {
            data = {}
          }
          if (data.roomId && Number(data.roomStatus) === 0) {
            this.$bus.$emit('close-group-live')
          }
        }
      })
    },
  }
}
</script>
