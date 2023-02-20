<template>
  <div class="current-conversation-wrapper">
    <div class="current-conversation" @scroll="onScroll" v-if="showCurrentConversation">
      <div class="header">
        <div class="name">{{ name }} <div class="deptName" :title="deptName">{{deptName}}</div></div>
        <div class="btn-more-info"
          :class="showConversationProfile ? '' : 'left-arrow'"
          @click="showMore"
          v-show="!currentConversation.conversationID.includes('SYSTEM')"
          title="查看详细信息">
        </div>
      </div>
      <div class="content">
        <div class="message-list" ref="message-list" @scroll="this.onScroll">
          <div class="more" v-if="!isCompleted">
            <el-button
              type="text"
              @click="$store.dispatch('getMessageList', currentConversation.conversationID)"
            >查看更多</el-button>
          </div>
          <div class="no-more" v-else>没有更多了</div>
          <message-item v-for="message in currentMessageList" :key="message.ID" :message="message" v-if="hasMessage(message)"/>
        </div>
        <div v-show="isShowScrollButtomTips" class="newMessageTips" @click="scrollMessageListToButtom">回到最新位置</div>
      </div>
      <div class="footer" v-if="showMessageSendBox" >
        <message-send-box/>
      </div>
    </div>
    <div class="profile" v-if="showConversationProfile" >
      <conversation-profile/>
    </div>
    <!-- 群成员资料组件 -->
    <member-profile-card />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import MessageSendBox from '../message/message-send-box'
import MessageItem from '../message/message-item'
import ConversationProfile from './conversation-profile.vue'
import MemberProfileCard from '../group/member-profile-card'
import { getUserFullDeptName } from '@/api/sys/dept.js'
export default {
  name: 'CurrentConversation',
  components: {
    MessageSendBox,
    MessageItem,
    ConversationProfile,
    MemberProfileCard
  },
  data() {
    return {
      isShowScrollButtomTips: false,
      preScrollHeight: 0,
      showConversationProfile: false,
      timeout: '',
      deptName: ''
    }
  },
  computed: {
    ...mapState({
      currentConversation: state => state.conversation.currentConversation,
      currentUnreadCount: state => state.conversation.currentConversation.unreadCount,
      currentMessageList: state => state.conversation.currentMessageList,
      isCompleted: state => state.conversation.isCompleted
    }),
    ...mapGetters(['toAccount', 'hidden']),
    // 是否显示当前会话组件
    showCurrentConversation() {
      return !!this.currentConversation.conversationID
    },
    name() {
      if (this.currentConversation.type === 'C2C') {
        this.getDeptName()
        return this.currentConversation.userProfile.nick || this.toAccount
      } else if (this.currentConversation.type === 'GROUP') {
        return this.currentConversation.groupProfile.name || this.toAccount
      } else if (this.currentConversation.conversationID === '@TIM#SYSTEM') {
        return '系统通知'
      }
      return this.toAccount
    },
    showMessageSendBox() {
      return this.currentConversation.type !== this.TIM.TYPES.CONV_SYSTEM
    }
  },
  mounted() {
    this.$bus.$on('image-loaded', this.onImageLoaded)
    this.$bus.$on('scroll-bottom', this.scrollMessageListToButtom)
    if (this.currentConversation.conversationID === '@TIM#SYSTEM') {
      return false
    }
  },
  updated() {
    this.keepMessageListOnButtom()
    // 1. 系统会话隐藏右侧资料组件
    // 2. 没有当前会话时，隐藏右侧资料组件。
    //    背景：退出群组/删除会话时，会出现一处空白区域
    if (this.currentConversation.conversationID === '@TIM#SYSTEM' ||
        typeof this.currentConversation.conversationID === 'undefined') {
      this.showConversationProfile = false
    }
  },
  watch: {
    currentUnreadCount(next) {
      if (!this.hidden && next > 0) {
        this.tim.setMessageRead({ conversationID: this.currentConversation.conversationID })
      }
    },
    hidden(next) {
      if (!next && this.currentUnreadCount > 0) {
        this.tim.setMessageRead({ conversationID: this.currentConversation.conversationID })
      }
    }
  },
  methods: {
    hasMessage(item) {
      if(item.type === TIM.TYPES.MSG_CUSTOM) {
        let payload = item.payload
        let videoPayload = {}
        try {
          videoPayload = JSON.parse(payload.data)
        } catch (e) {
          videoPayload = {}
        }
        if (payload.data === 'group_create') {
          return `${payload.extension}`.length > 0
        }
        if (videoPayload.roomId) {
          videoPayload.roomId = videoPayload.roomId.toString()
          videoPayload.isFromGroupLive = 1
          return videoPayload.length > 0
        }
        if (payload.text) {
          return payload.text.length > 0
        } else {
          // return '[自定义消息]', 空未有消息不显示
          return false
        }
      }
      return true
    },
    onScroll({ target: { scrollTop } }) {
      let messageListNode = this.$refs['message-list']
      if (!messageListNode) {
        return
      }
      if (this.preScrollHeight - messageListNode.clientHeight - scrollTop < 20) {
        this.isShowScrollButtomTips = false
      }
    },
    // 如果滚到底部就保持在底部，否则提示是否要滚到底部
    keepMessageListOnButtom() {
      let messageListNode = this.$refs['message-list']
      if (!messageListNode) {
        return
      }
      // 距离底部20px内强制滚到底部,否则提示有新消息
      if (this.preScrollHeight - messageListNode.clientHeight - messageListNode.scrollTop < 20) {
        this.$nextTick(() => {
          messageListNode.scrollTop = messageListNode.scrollHeight
        })
        this.isShowScrollButtomTips = false
      } else {
        this.isShowScrollButtomTips = true
      }
      this.preScrollHeight = messageListNode.scrollHeight
    },
    // 直接滚到底部
    scrollMessageListToButtom() {
      this.$nextTick(() => {
        let messageListNode = this.$refs['message-list']
        if (!messageListNode) {
          return
        }
        messageListNode.scrollTop = messageListNode.scrollHeight
        this.preScrollHeight = messageListNode.scrollHeight
        this.isShowScrollButtomTips = false
      })
    },
    showMore() {
      this.showConversationProfile = !this.showConversationProfile
    },
    onImageLoaded() {
      this.keepMessageListOnButtom()
    },
    getDeptName() {
      let deptNameList = []
      this.deptName = ""
      getUserFullDeptName(this.currentConversation.userProfile.userID).then((res) => {
        deptNameList = res.data.data;
        if (deptNameList && deptNameList.length > 0) {
          for (var i=(deptNameList.length>1 ? deptNameList.length-2 : deptNameList.length-1); i>=0; i--) {
            this.deptName = this.deptName + deptNameList[i] + (i>0 ? "/" : "")
          }
        }
      }).catch(() => {})
    }
  }
}
</script>

<style lang="stylus" scoped>
/* 当前会话的骨架屏 */
.current-conversation-wrapper
  height $height
  background-color $background-light
  color $base
  display flex
  .current-conversation
    display: flex;
    flex-direction: column;
    width: 100%;
    height: $height;
  .profile
    height: $height;
    overflow-y: scroll;
    width 220px
    border-left 1px solid $border-base
    flex-shrink 0
  .more
    display: flex;
    justify-content: center;
    font-size: 12px;
  .no-more
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    display: flex;
    justify-content: center;
    color: $secondary;
    font-size: 12px;
    padding: 10px 10px;

.header
  border-bottom 1px solid $border-base
  height 50px
  position relative
  .name
    padding 0 20px
    color $base
    font-size 18px
    line-height 50px
    display inline-flex
    .deptName
      font-size 12px
      padding-left 5px
      width 200px
      height 50px
      overflow hidden
      white-space nowrap
      text-overflow ellipsis
  .btn-more-info
    position absolute
    top 10px
    right -15px
    border-radius 50%
    width 30px
    height 30px
    cursor pointer
    &::before
      position absolute
      right 0
      z-index 0
      content ""
      width: 15px
      height: 30px
      border: 1px solid $border-base
      border-radius: 0 100% 100% 0/50%
      border-left: none
      background-color $background-light
    &::after
      content ""
      width: 8px;
      height: 8px;
      transition: transform 0.8s;
      border-top: 2px solid $secondary;
      border-right: 2px solid $secondary;
      float:right;
      position:relative;
      top: 11px;
      right: 8px;
      transform:rotate(45deg)
    &.left-arrow
      transform rotate(180deg)
      &::before
        background-color $white
    &:hover
      &::after
        border-color $light-primary
.content
  display: flex;
  flex 1
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  .message-list
    width: 100%;
    box-sizing: border-box;
    overflow-y: scroll;
    padding: 0 20px;
  .newMessageTips
    position: absolute
    cursor: pointer;
    padding: 5px;
    width: 120px;
    margin: auto;
    left: 0;
    right: 0;
    bottom: 5px;
    font-size: 12px;
    text-align: center;
    border-radius: 10px;
    border: $border-light 1px solid;
    background-color: $white;
    color: $primary;
.footer
  border-top: 1px solid $border-base;
.show-more {
  text-align: right;
  padding: 10px 20px 0 0;
}
</style>
