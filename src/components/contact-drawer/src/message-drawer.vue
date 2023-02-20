<template>
  <el-drawer
    :visible.sync="messageDrawerVisable"
    :with-header="false"
    custom-class="drawer-customer"
    size="26%">
  <div class="drawer-container">
    <div class="drawer-header">
      <i class="el-icon-bell message-drawer-header"></i> 消息通知
    </div>
    <div class="drawer-body">
      <el-table class="message-list" :data="messageList" style="width: 100%; overflow-y: auto" :show-header="false">
<!--        <el-table-column prop="name" label="标题" :show-overflow-tooltip="true">-->
<!--          <template slot-scope="scope">-->
<!--            <p class="message-drawer-date">-->
<!--              {{scope.row.updateDate}}-->
<!--            </p>-->
<!--            <p style="margin: 0 auto">-->
<!--              <el-link :style="scope.row.isRead === messageIsReadYes ? '' : 'font-weight: 800'"-->
<!--                       :underline="false" @click="handleNameClick(scope.row)">{{scope.row.name}}</el-link>-->
<!--            </p>-->
<!--          </template>-->
<!--        <el-table-column prop="type" min-width="20%">-->
<!--          <template slot-scope="scope">-->
<!--            <el-button v-if="scope.row.isRead === messageIsReadComplete"-->
<!--                       icon="el-icon-close"-->
<!--                       circle-->
<!--                       size="mini"-->
<!--                       style="margin-left:5px; padding: 1px"-->
<!--                       @click="removeMessage(scope.row.id)">-->
<!--            </el-button>-->
<!--          </template>-->
<!--        </el-table-column>-->
        <el-table-column prop="name" label="标题">
          <template slot-scope="scope">
            <el-popover popper-class="message-popper" min-width="10%" placement="top-start" trigger="hover" :content="scope.row.name">
              <span slot="reference">
                <p class="message-drawer-date"
                   :style="scope.row.isRead !== messageIsReadNo ? 'color: #C0C0C0' : ''">{{scope.row.updateDateFormat}}</p>
                <p style="margin: 0 auto">
                  <el-link :style="scope.row.isRead !== messageIsReadNo ? 'color: #C0C0C0' : 'font-weight: 800'"
                           :underline="false" @click="handleNameClick(scope.row)">{{scope.row.name}}</el-link>
                </p>
              </span>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="isRead" label="状态" min-width="20%">
          <template slot-scope="scope">
            <div style="float: right">
            <el-tag v-if="scope.row.isRead===messageIsReadTodo" size="mini" type="danger">待办</el-tag>
            <el-tag v-if="scope.row.isRead===messageIsReadComplete" size="mini" type="success">已处理</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" min-width="20%">
          <template slot-scope="scope">
            <el-tag size="mini" effect="dark" :type="scope.row.tagType">
              {{scope.row.typeName}}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <message-detail :v-if="messageDetailVisable" ref="messageDetail" @callback="handleGetUnreadMessage" @closeDrawer="closeDrawer"></message-detail>
  </div>
  </el-drawer>
</template>

<script>
  import { getUnreadMessage, removeReadMessage } from '@/api/message/message'
  import { getDictLabel } from '@/utils'
  import MessageDetail from '@/views/modules/message/components/message-detail'
  import AppConstant from "@/utils/AppConstant"
  import message from "@/views/modules/message/message"
  import moment from "moment"

  export default {
    name: 'MessageDrawer',
    components: {
      MessageDetail
    },
    data() {
      return {
        messageList: [],
        messageDrawerVisable: false,
        messageDetailVisable: false,
        messageTypeImportant: AppConstant.MESSAGE_TYPE_IMPORTAT,
        messageTypeEmergency: AppConstant.MESSAGE_TYPE_EMERGENCY,
        messageIsReadNo: AppConstant.MESSAGE_IS_READ_NO,
        messageIsReadYes: AppConstant.MESSAGE_IS_READ_YES,
        messageIsReadTodo: AppConstant.MESSAGE_IS_READ_TODO,
        messageIsReadComplete: AppConstant.MESSAGE_IS_READ_COMPLETE
      }
    },
    methods: {
      handleGetUnreadMessage() {
        getUnreadMessage().then(res => {
          this.messageList = res.data.data
          this.messageList.forEach(v => {
            v.updateDateFormat = moment(v.updateDate).format('YYYY-MM-DD HH:mm')
            v.typeName = getDictLabel('message_type', v.type)
            if (v.type === this.messageTypeImportant) {
              v.tagType = 'warning'
            } else if (v.type === this.messageTypeEmergency) {
              v.tagType = 'danger'
            } else {
              v.tagType = ''
            }
          })
        })
        this.$forceUpdate()
      },
      handleNameClick(row) {
        if (row.isRead === this.messageIsReadNo) {
          row.isRead = this.messageIsReadYes
        }
        this.messageDetailVisable = true
        this.$nextTick(() => {
          this.$refs['messageDetail'].init(row.id, this.$store.state.user.id)
        })
      },
      // removeMessage(messageId) {
      //   removeReadMessage(messageId, this.$store.state.user.id).then(res => {
      //     if (res.data.code === 0) {
      //       this.handleGetUnreadMessage()
      //       return this.$message.success('操作成功')
      //     } else {
      //       return this.$message.error(res.data.msg)
      //     }
      //   })
      // },
      closeDrawer() {
        this.messageDrawerVisable = false
      }
    }
  }
</script>
<style>
  .message-drawer-header {
    color: #409EFF;
    font-weight: bolder
  }

  .message-drawer-date {
    font-size: smaller;
    color: #3a8ee6;
    margin: 0 auto
  }

  .message-popper {
    max-width: 20%;
  }
</style>
