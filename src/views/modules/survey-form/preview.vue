<template>
  <el-card>
    <avue-form v-if="previewVisible"
               ref="form"
               class="preview-form"
               :option="widgetFormPreview"
               v-model="widgetModels"
               @submit="handlePreviewSubmit"></avue-form>
  </el-card>
</template>

<script>
  import {getFormJson} from "@/api/survey-form/questionnaire"
  import {getFormJson as getTempFormJson} from "@/api/survey-form/commonModule"
  export default {
    name: "dform-preview",
    data() {
      return {
        previewVisible: true,
        widgetModels: {},
        widgetFormPreview: {}
      }
    },
    created() {
      const { id, type } = this.$route.query
      console.log(this.$route.query)
      console.log('id:', id)
      if(type === 'template'){
        getTempFormJson(id).then(res => {
          console.log('load from json')
          this.widgetFormPreview = res.data.data
        })
      }else{
        getFormJson(id).then(res => {
          console.log('load from json')
          if(res.data.code == 0){
            this.widgetFormPreview = res.data.data.json
          }else{
            this.$message.error(res.data.msg)
          }
        })
      }
    },
    methods: {
      handlePreviewSubmit() {
        console.log(this.widgetModels)
      }
    }
  }


</script>

<style scoped>

</style>
