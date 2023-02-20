<template>
  <div>
    <el-card>
      <div  class="top">
        <el-upload
              class="upload-demo"
              :action="url"
              multiple
              :limit="5"
              :on-change="handleChange"
              :file-list="fileList">
          <el-button size="small" type="primary">导入excel</el-button>
        </el-upload>
        <div style="width:20px;"></div>
        <a :href="downloadURL"><el-button size="small" type="primary">下载模板</el-button></a>
      </div>
      <avue-crud :data="tableData"
                 :option="option"
                 :page.sync="page"
                 @on-load="onLoad"
                 @size-change="sizeChange"
                 @current-change="currentChange"
                 @row-del="rowDelete"
                 @row-update="rowUpdate"
                 @row-save="rowSave">
      </avue-crud>
    </el-card>
  </div>
</template>

<script>
  var mongoose = require('mongoose');
  export default {
    name: "detection-records",

    data() {
      return {
        url: window.SITE_CONFIG['apiURL']+'/sampling/upload',
        downloadURL:window.SITE_CONFIG['apiURL']+'/sampling/downloadTemplate',
        fileList:[],
        page: {
          currentPage: 1,
          total: 10,
          pageSize:10,
          pageSizes: [10, 20, 50, 100]
        },
        tableData: [{
          name: "",
          personIdType: 0,
          personId: 0,
          sampleDate: "",
          sex: 0,
          testType: 0,
          specimenType: 0,
          sampleUnit: "",
          testUnit: "",
          testMethod: 0,
          reportDate: "",
          testResult: "",
          specificTestValue: "",
          isPatientGet: 0,
          isSampleUnitGet: 0,
          remarks: "",
          testKitNum: ""
        }],
        option: {
          align: 'center',
          menuAlign: 'center',
          menuWidth: 140,
          column: [
            {
              label: '姓名',
              prop: 'name'
            },
            {
              prop:"personIdType",
              label:"证件类型"
            },
            {
              prop:"personId",
              label:"证件号"
            },
            {
              prop:"sex",
              label:"性别"
            },
            {
              prop:"testType",
              label:"检测类型"
            },
            {
              prop:"sampleDate",
              minWidth: 160,
              label:"采样日期"
            },
            {
              prop:"specimenType",
              label:"标本类型"
            },
            {
              prop:"sampleUnit",
              label:"采样单位"
            },
            {
              prop:"testUnit",
              label:"检测单位"
            },
            {
              prop:"testMethod",
              label:"检测方法"
            },
            {
              prop:"reportDate",
              label:"报告日期",
              minWidth: 160
            },
            {
              prop:"testResult",
              label:"检测结果"
            },
            {
              prop:"specificTestValue",
              label:"具体检测值"
            },
            {
              prop:"isSampleUnitGet",
              minWidth: 100,
              label:"采样单位是否收到检测结果"
            },
            {
              prop:"isPatientGet",
              label:"患者是否收到检测结果"
            },

          ]
        }

      }
    },
    created() {
      console.log(this.url)
    },
    methods: {

      getPage(id){
        this.$http.get('/sampling/page/'+id+"?pageSize="+this.page.pageSize).then(({data:res})=>{
          if(res.code!==0){
            this.$message.error(res.msg);
            return;
          }
          console.log(res);
          this.tableData=res.data.data;
          this.page.total=res.data.total;

        })
      },
      onLoad(){
        this.getPage(1);
      },
      currentChange(val) {
        this.page.currentPage=val;
        this.getPage(val);
      },
      sizeChange(val) {
        this.page.currentPage = 1
        this.page.pageSize = val
        this.getPage(1)
      },
      rowSave(form,done){
        this.$http.post("/sampling",form,{
          headers: {
            'content-type': 'application/json',
            'Authorization': 'Basic cmVucmVuaW86cmVucmVuaW8='
          }
        }).then(({data:res})=>{

          if(res.code!==0){
            return this.$message.error(res.msg);
            done()
          }
          console.log(res)
          this.getPage(this.page.currentPage);
          done()

        })

      },
      rowDelete(row){

        var id=row.id;
        this.$http.delete("/sampling",{params: {id:id}},{
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          }
        }).then(({data:res})=>{

          if(res.code!==0){
            return this.$message.error(res.msg);
          }
          console.log(res)
          this.getPage(this.page.currentPage);


        })

      },
      rowUpdate(form,index,done){
        this.$http.put("/sampling",form,{ headers: {
          'content-type': 'application/json',
        }
      }).then(({data:res})=>{
          done();
          if(res.code!==0){
            return this.$message.error(res.msg);
          }
          console.log(res)
          this.getPage(this.page.currentPage);

        })


      },
      handleChange(){
        this.getPage(this.page.currentPage);
      }


    },

  }
</script>

<style scoped>
  .el-table .warning-row {
    background: oldlace;
  }
  .el-table .success-row {
    background: #f0f9eb;
  }
  .top{
    display: flex;
    float: right;
    margin-bottom: 20px;
    margin-left: 5px;
  }
</style>
