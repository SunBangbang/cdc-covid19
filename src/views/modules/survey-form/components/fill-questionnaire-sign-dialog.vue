<template>
  <el-dialog :visible.sync="dialogVisible" width="650px" title="签字确认" :close-on-click-modal = "false">
    <avue-sign ref="sign"></avue-sign>
    <span slot="footer" class="dialog-footer">
      <el-button @click="clearSign" size="mini">清空</el-button>
      <el-button @click="dialogVisible = false" size="mini">取消</el-button>
      <el-button type="primary" @click="handleSubmit" size="mini" :disabled = "disabled">确认</el-button>
    </span>
    <fill-questionnaire-success v-if="fillSuccessVisible"
                                ref="fillQuestionnaireSuccess"
                                @callback="fillSuccessCallback">
    </fill-questionnaire-success>
  </el-dialog>
</template>
<script>
  import {uploadFile} from "@/api/oss";
  import FileTypeConstant from "@/utils/FileTypeConstant";
  import {submit, apiToken} from "@/api/survey-form/sample";
  import FillQuestionnaireSuccess from './fill-questionnaire-success'

  export default {
    components: {
      FillQuestionnaireSuccess,
    },
    data() {
      return {
        dialogVisible: false,
        result: {},
        fillSuccessVisible: false,
        taskId:'',
        uuid: null,
        disabled: false,
        audioOpen: false,
        videoOpen: false
      }
    },
    created() {
      this.loadApiToken()
    },
    methods: {
      loadApiToken(){
        apiToken().then(res=>{
          if (res.data.code === 0) {
            this.uuid = res.data.data
          }
        })
      },
      // 清空签名
      clearSign() {
        this.$refs.sign.clear()
      },
      // 提交
      handleSubmit() {
        if(this.audioOpen){
          this.$message.warning('请停止录音！')
          return
        }
        if(this.videoOpen){
          this.$message.warning('请停止录像！')
          return
        }
        this.disabled = true
        let imgFile = this.base64ImgToFile(this.$refs.sign.submit(80, 50))
        uploadFile(imgFile, FileTypeConstant.SURVEY_FORM).then(res => {
          this.result.signUrl = res.data.data[0].url
          this.result.auditStatus = 0
          this.result.add = false
          this.disabled = true
          submit(this.result, this.uuid).then(res => {
            if (res.data.code === 0) {
              this.$message.success('保存成功');
              this.clearSign()
              this.dialogVisible = false
              this.fillSuccessVisible = true
              this.$nextTick(() => {
                this.$refs['fillQuestionnaireSuccess'].dialogVisible = true;
                this.$store.state.contentTabs = this.$store.state.contentTabs.filter(item => item.name !== 'fill-questionnaire');
                this.$router.replace({name: 'survey-sample', params:{taskId:this.taskId}});
              })
            } else {
              this.loadApiToken()
              this.disabled = false
              console.log('error:', res.data.msg)
              this.$message.error({message: res.data.msg, duration: 5000})
            }
          })
        })
      },
      // 关闭成功页面回调
      fillSuccessCallback() {
        this.$emit('callback')
      },
      // 签名base64转图片
      base64ImgToFile(imgData, filename = 'questionnaire-sign') {
        let arr = imgData.split(',')
        let mime = arr[0].match(/:(.*?);/)[1]
        let suffix = mime.split('/')[1]
        let bstr = atob(arr[1])
        let n = bstr.length
        let u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        return new File([u8arr], `${filename}.${suffix}`, {
          type: mime
        })
      }
    }
  }
</script>
