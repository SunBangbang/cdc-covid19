<template>
  <div class="list-container" >
<!--    <div class="header-bar">-->
<!--      <el-autocomplete-->
<!--        :value-key="'groupID'"-->
<!--        :debounce="500"-->
<!--        size="mini"-->
<!--        v-model="groupID"-->
<!--        placeholder="输入群ID搜索"-->
<!--        :fetch-suggestions="searchGroupByID"-->
<!--        class="group-seach-bar"-->
<!--        prefix-icon="el-icon-search"-->
<!--        :hide-loading="hideSearchLoading"-->
<!--        @input="hideSearchLoading = false"-->
<!--        @select="applyJoinGroup"-->
<!--      ></el-autocomplete>-->
<!--      <button title="创建群组" @click="showCreateGroupModel">-->
<!--        <i class="tim-icon-add"></i>-->
<!--      </button>-->
<!--    </div>-->
    <div :class="{'default': !hasGroup}">
    <div class="group-container" v-if="hasGroup">
      <group-item @updateStatus2="updateStatus2" v-for="group in groupList" :key="group.groupID" :group="group" />
    </div>
    <div style="color: gray;    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;" v-else>暂无群组</div>
    </div>
    <el-dialog title="创建群组" :visible="createGroupModelVisible" @close="closeCreateGroupModel" width="30%" append-to-body>
      <create-group></create-group>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Dialog, Autocomplete } from 'element-ui'
import CreateGroup from './create-group.vue'
import GroupItem from './group-item.vue'
export default {
  data() {
    return {
      groupID: '',
      hideSearchLoading: true
    }
  },
  components: {
    GroupItem,
    ElDialog: Dialog,
    CreateGroup,
    ElAutocomplete: Autocomplete
  },
  computed: {
    ...mapState({
      groupList: state => state.group.groupList,
      createGroupModelVisible: state => {
        return state.group.createGroupModelVisible
      }
    }),
    hasGroup(){
      return this.groupList.length > 0
    }
  },
  methods: {
    updateStatus2(){
      this.$emit('updateStatus')
    },
    onGroupUpdated(groupList) {
      this.$store.dispatch('updateGroupList', groupList)
    },
    createGroup() {},
    closeCreateGroupModel() {
      this.$store.commit('updateCreateGroupModelVisible', false)
      // this.onGroupUpdated(this.tim.getGroupList())
    },
    searchGroupByID(queryString, showInSearchResult) {
      if (queryString.trim().length > 0) {
        this.hideSearchLoading = false
        this.tim
          .searchGroupByID(queryString)
          .then(({ data: { group } }) => {
            showInSearchResult([group])
          })
          .catch(() => {
            this.$store.commit('showMessage', {
              message: '没有找到该群',
              type: 'error'
            })
          })
      } else {
        this.hideSearchLoading = true
      }
    },
    showCreateGroupModel() {
      this.$store.commit('updateCreateGroupModelVisible', true)
    },
    applyJoinGroup(group) {
      this.tim
        .joinGroup({ groupID: group.groupID })
        .then(async res => {
          switch(res.data.status) {
            case this.TIM.TYPES.JOIN_STATUS_WAIT_APPROVAL:
              this.$store.commit('showMessage', {
                message: '申请成功，等待群管理员确认。',
                type: 'info'
              })
              break
            case this.TIM.TYPES.JOIN_STATUS_SUCCESS:
              await this.$store.dispatch(
                'checkoutConversation',
                `GROUP${res.data.group.groupID}`
              )
              this.$store.commit('showMessage', {
                message: '加群成功',
                type: 'success'
              })
              break
            case this.TIM.TYPES.JOIN_STATUS_ALREADY_IN_GROUP:
              this.$store.commit('showMessage', {
                message: '您已经是群成员了，请勿重复加群哦！',
                type: 'info'
              })
              break
            default: break
          }
        })
        .catch(error => {
          this.$store.commit('showMessage', {
            message: error.message,
            type: 'error'
          })
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
    // height: 100%;
    height: 75vh;
    overflow-y: auto;
  }
.list-container
  height 75vh
  width 100%
  display flex
  flex-direction column
  .group-container
    overflow-y hidden
  .header-bar
    display: flex;
    flex-shrink 0
    height 50px
    padding 10px 10px 10px 20px
    .group-seach-bar
      width 100%
      margin-right 10px
      :deep(.el-input)
        input
          color $font-dark
          border none
          border-radius 30px
          background-color $background !important
          &::placeholder
            color $font-dark
        .el-icon-search
          color $font-dark
    button
      float right
      display: inline-block;
      cursor: pointer;
      background $background
      border: none
      color: $font-dark;
      box-sizing: border-box;
      transition: .3s;
      -moz-user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
      margin: 0
      padding 0
      width 30px
      height 30px
      line-height 34px
      font-size: 24px;
      text-align: center;
      white-space: nowrap;
      border-radius: 50%
      outline 0
      flex-shrink 0
      &:hover
        transform: rotate(360deg);
        color $light-primary
  .scroll-container {
    overflow-y: auto;
    flex: 1;
  }


</style>
