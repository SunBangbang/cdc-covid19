<template>
  <el-dialog title="打印" :visible.sync="dialogVisible" width="60%">
    <div id="receipts">
      <json-to-form ref="jsonToForm"> </json-to-form>
<!--
      <avue-form ref="form" :option="formJson" v-model="formData"></avue-form>
-->
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false" size="mini">取消</el-button>
      <el-button type="primary" v-print="printConfig" size="mini">打印</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import JsonToForm from '@/components/form-design/form-json/index'

  export default {
    components:{
      JsonToForm
    },
    data() {
      return {
        dialogVisible: false,
        printConfig: {
          id: "receipts",
          popTitle: '',
          extraCss: '',
          extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
        },
        formJson: {},
        formData: {}
      }
    },
    mounted() {
      this.init();
    },
    methods:{
      init(){
        setTimeout(()=>{
          this.formJson.submitBtn=false;
          this.formJson.saveDraftBtn=false;
          this.formJson.saveDraftBtn=false;
          this.formJson.rejectBtn=false;
          this.$refs['jsonToForm'].json = this.formJson;
          this.$refs['jsonToForm'].form = this.formData;
          this.$refs['jsonToForm'].add = false;
          this.$refs['jsonToForm'].visible = true;
        },500);
      }
    }
  }
</script>
