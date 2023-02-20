<template>
  <el-dialog title="消息通知" :visible.sync="detailDialogVisible" width="70%" :before-close="beforeClose" append-to-body>
    <el-form :model="formData" ref="dataForm" style="margin: 0px 30px">
      <el-form-item prop="name" v-html="formData.name" style="font-size: 20px; font-weight: 700; text-align: center">
        {{formData.name}}
      </el-form-item>
      <el-row style="text-align: right">
        <span> {{formData.updateName}}</span>
        <span style="margin-left: 20px">{{formData.updateDate}}</span>
      </el-row>
      <el-divider></el-divider>

      <el-form-item prop="content" v-html="formData.content">
        {{formData.content}}
      </el-form-item>
      <el-divider></el-divider>
<!--      <el-form-item style="margin-bottom: 0px" prop="surveyFormList" label="关联表：">-->
<!--        <el-button type="text" v-for="item in formData.formList" :key="item.id" @click="formListBtn(item)">{{item.name}}</el-button>-->
<!--      </el-form-item>-->
      <el-form-item style="margin-bottom: 0px" prop="attachment" label="附件：">
        <div v-if="attachment !== null && attachment !== undefined">
          <div v-for="item in attachment" :key="item.index" style="margin-right: 10px">
            <div v-if="item.name !== null && item.name !== undefined">
            <el-link type="primary" :href="item.url" :underline="false">{{item.name}}</el-link>
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item style="margin-bottom: 0px" prop="isRead" label="操作：" v-if="isShow">
<!--        <el-button size="mini" @click="createTask">创建主题任务</el-button>-->
        <el-button :type="todoBtnType" size="mini" :loading="todoLoading" :plain="todoBtnPlain" :disabled="todoDisabled" @click="todoBtn">待办</el-button>
        <el-button :type="completeBtnType" size="mini" :loading="completeLoading" :disabled="completeDisabled" :plain="completeBtnPlain" @click="completeBtn">已处理</el-button>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="closeDialog" size="mini">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { detail, updateIsRead, getSurveyFormDetail } from '@/api/message/message'
  import AppConstant from '@/utils/AppConstant'

  export default {
    data() {
      return {
        todoDisabled: false,
        todoLoading: false,
        todoBtnType: '',
        todoBtnPlain: false,
        completeLoading: false,
        completeDisabled: false,
        completeBtnType: '',
        completeBtnPlain: false,
        isComplete: false,
        isShow: '',
        detailDialogVisible: false,
        formData: {},
        attachment: [],
        messageIsReadNo: AppConstant.MESSAGE_IS_READ_NO,
        messageIsReadYes: AppConstant.MESSAGE_IS_READ_YES,
        messageIsReadTodo: AppConstant.MESSAGE_IS_READ_TODO,
        messageIsReadComplete: AppConstant.MESSAGE_IS_READ_COMPLETE
      }
    },
    methods: {
      init(id, userId) {
        this.isShow = userId
        this.detailDialogVisible = true
        let params = {
          id: id,
          userId: userId
        }
        detail(params).then(res => {
          if(res.data.code === 0){
            this.formData = res.data.data
            this.formData.formList = []
            this.formData.surveyFormList.forEach(item => {
              getSurveyFormDetail(item, 'surveyName').then(res => {
                this.formData.formList.push({id: res.data.data.oid, name: res.data.data.surveyName})
                this.$forceUpdate()
              })
            })
            if (this.isShow) {
              this.todoBtnType = ''
              this.todoBtnPlain = false
              this.todoDisabled = false
              this.completeBtnType = ''
              this.completeBtnPlain = false
              this.completeDisabled = false
              if (this.formData.isRead === this.messageIsReadTodo) {
                this.todoBtnType = 'primary'
                this.todoBtnPlain = true
                this.todoDisabled = true
                this.completeBtnType = ''
                this.completeBtnPlain = false
                this.completeDisabled = false
              }
              if (this.formData.isRead === this.messageIsReadComplete) {
                this.completeBtnType = 'primary'
                this.completeBtnPlain = true
                this.completeDisabled = true
                this.todoBtnType = ''
                this.todoBtnPlain = false
                this.todoDisabled = false
              }
            }
            this.attachment = JSON.parse(res.data.data.attachment)
            this.attachment.forEach(item => {
              let urlArr = item.url.split('/')
              urlArr[urlArr.length - 1] = encodeURIComponent(urlArr.pop())
              item.url = urlArr.join('/');
            });
          }else{
              console.log('error :', res.data.msg)
          }
        })
      },
      // 关闭详情页
      handleClose() {
        this.detailDialogVisible = false
      },
      // 更新已读状态
      handleUpdateIsRead(val) {
        let params = {
          messageId: this.formData.id
        }
        updateIsRead(this.formData.isRead, params).then(res => {
          if (res.data.code === 0) {
            this.$message({
              type: "success",
              message: "操作成功!"
            });
            if(val) {
              this.completeLoading = false
              this.completeBtnType = 'primary'
              this.completeBtnPlain = true
              this.completeDisabled = true
              this.todoDisabled = false
              this.todoBtnType = ''
              this.todoBtnPlain = false
            } else {
              this.todoLoading = false
              this.todoBtnType = 'primary'
              this.todoBtnPlain = true
              this.todoDisabled = true
              this.completeDisabled = false
              this.completeBtnType = ''
              this.completeBtnPlain = false
            }
          } else {
            if (val) {
              this.completeLoading = false
            } else {
              this.todoLoading = false
            }
            return this.$message.error(res.data.msg)
          }
        })
      },
      todoBtn() {
        this.todoLoading = true;
        this.formData.isRead = this.messageIsReadTodo;
        this.isComplete = false
        this.handleUpdateIsRead(this.isComplete)
        this.$emit('callback')
      },
      completeBtn() {
        this.completeLoading = true;
        this.formData.isRead = this.messageIsReadComplete;
        this.isComplete = true
        this.handleUpdateIsRead(this.isComplete)
        this.$emit('callback')
      },
      beforeClose() {
        this.detailDialogVisible = false
        this.$emit('callback')
      },
      closeDialog() {
        this.detailDialogVisible = false
        this.$emit('callback')
      },
      formListBtn(val) {
        this.detailDialogVisible = false
        this.$emit('closeDrawer')
        this.$router.push(`/survey-form/view/questionnaire/${val.id}`)
      },
      createTask() {
        this.detailDialogVisible = false
        this.$emit('closeDrawer')
        let data = this.formData.surveyFormList
        if (this.formData.surveyFormList.length === 0) {
          data = null
        }
        this.$router.push(`/subject-task/task-management/create/${data}`);
      }
    }
  }
</script>

<style scoped>

</style>
