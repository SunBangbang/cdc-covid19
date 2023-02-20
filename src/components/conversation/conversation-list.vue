<template>
  <div class="list-container" :class="{'default': !hasConversation}">
    <div class="scroll-container" v-if="hasConversation">
      <conversation-item
        :conversation="item"
        v-for="item in conversationList"
        :key="item.conversationID"
        @updateStatus1="updateStatus1"
      />
    </div>
      <div style="color: gray;user-select: none;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;" v-else>暂无消息</div>
  </div>
</template>

<script>
import ConversationItem from './conversation-item'
import { mapState } from 'vuex'
export default {
  name: 'ConversationList',
  components: { ConversationItem },
  data() {
    return {
      showDialog: false,
      userID: '',
      isCheckouting: false, // 是否正在切换会话
      timeout: null
    }
  },
  computed: {
    ...mapState({
      conversationList: state => state.conversation.conversationList,
      currentConversation: state => state.conversation.currentConversation
    }),
    hasConversation(){
        return this.conversationList.length > 0
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeydown)
   },
  destroyed() {
    window.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    updateStatus1(){
      this.$emit('updateStatus')
    },
    handleRefresh() {
      this.refreshConversation()()
    },
    refreshConversation() {
      let that = this
      return function () {
        if (!that.timeout) {
          that.timeout = setTimeout(() =>{
            that.timeout = null
            that.tim.getConversationList().then(() => {
              that.$store.commit('showMessage', {
                message: '刷新成功',
                type: 'success'
              })
            })
          }, 1000)
        }
      }
    },
   /* handleAddButtonClick() {
      this.showDialog = true
    },*/
    handleKeydown(event) {
      if (event.keyCode !== 38 && event.keyCode !== 40 || this.isCheckouting) {
        return
      }
      const currentIndex = this.conversationList.findIndex(
        item => item.conversationID === this.currentConversation.conversationID
      )
      if (event.keyCode === 38 && currentIndex - 1 >= 0) {
        this.checkoutPrev(currentIndex)
      }
      if (
        event.keyCode === 40 &&
        currentIndex + 1 < this.conversationList.length
      ) {
        this.checkoutNext(currentIndex)
      }
    },
    checkoutPrev(currentIndex) {
      this.isCheckouting = true
      this.$store
        .dispatch(
          'checkoutConversation',
          this.conversationList[currentIndex - 1].conversationID
        )
        .then(() => {
          this.isCheckouting = false
        })
        .catch(() => {
          this.isCheckouting = false
        })
    },
    checkoutNext(currentIndex) {
      this.isCheckouting = true
      this.$store
        .dispatch(
          'checkoutConversation',
          this.conversationList[currentIndex + 1].conversationID
        )
        .then(() => {
          this.isCheckouting = false
        })
        .catch(() => {
          this.isCheckouting = false
        })
    }
  }
}
</script>

<style lang="stylus" scoped>
.default {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        overflow-y: scroll;
    }
.list-container
  height 100%
  width 100%
  display flex
  flex-direction column // -reverse
  /*.header-bar
    flex-shrink 0
    height 50px
    border-bottom 1px solid $background-deep-dark
    padding 10px 10px 10px 20px
    button
      float right
      display: inline-block;
      cursor: pointer;
      background $background-deep-dark
      border: none
      color: $font-dark;
      box-sizing: border-box;
      transition: .3s;
      -moz-user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
      margin: 0 10px 0 0
      padding 0
      width 30px
      height 30px
      line-height 34px
      font-size: 24px;
      text-align: center;
      white-space: nowrap;
      border-radius: 50%
      outline 0
      &:hover
        // background $light-primary
        // color $white
        transform: rotate(360deg);
        color $light-primary*/
  .scroll-container
    overflow-y scroll
    flex 1
.bottom-circle-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
}

.refresh {
  bottom: 70px;
}
</style>
