<template>
  <div @click="handleGroupClick" class="scroll-container">
    <div class="group-item">
      <div style="position:relative; top: -1px; width: 100%">
        <div style="float: left; width: 50px">
          <avue-avatar :src="icon" size="large"/>
        </div>
        <div class="group-name text-ellipsis">{{ group.name }}</div>
      </div>

    </div>
  </div>
</template>

<script>
import icon from '@/assets/image/taskGroupIm.png'

export default {
  props: ['group'],
  data() {
    return {
      icon: icon,
      visible: false,
      options: [
        {
          text: '退出群组',
          handler: this.quitGroup
        }
      ]
    }
  },
  methods: {
    handleGroupClick() {
      this.$emit('updateStatus2');
      const conversationID = `GROUP${this.group.groupID}`
      this.$store.dispatch('checkoutConversation', conversationID)
    },
    quitGroup() {
      this.tim.quitGroup(this.group.groupID)
      .catch(error => {
          this.$store.commit('showMessage', {
            type: 'error',
            message: error.message
          })
        })
    }
  }
}
</script>

<style lang="stylus" scoped>
.scroll-container
  overflow-y scroll
  flex 1
  .group-item
    display flex
    padding 5px 20px
    cursor pointer
    position relative
    overflow hidden
    transition .2s
    &:hover
      background-color rgb(245,247,250);
    .avatar
      width 30px
      height 30px
      border-radius 50%
      margin-right 10px
      flex-shrink 0
    .group-name
      flex 1
      color $font-light
      font-weight bold
      line-height 40px;
    .avue-avatar
      background: unset;
</style>
