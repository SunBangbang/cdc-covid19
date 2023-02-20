<template>
  <el-card class="aui-card--fill">
    <query-condition @query="query" @changeSurveyForm="handleSurveyForm" @reset="reset" ref="queryCond" :includeTime="false"></query-condition>
    <div>
      <avue-crud :data="data"
                 v-model="form"
                 :option="option"
                 :page.sync="page"
                 :table-loading="loading"
                 @size-change="sizeChange"
                 @search-change="searchChange"
                 @refresh-change="refreshChange">
        <template slot-scope="scope" slot="menu" class="menuClass">
          <el-button type="text" @click="viewChain(scope.row)" size="mini">查看</el-button>
        </template>
      </avue-crud>
    </div>

    <el-dialog :visible.sync="dialogVisible"
               :fullscreen="fullScreen"
               :before-close="handleClose"
               width="60%">
      <template slot="title">
        <el-row>
          <el-col :span="12">
            <h2>
              传播链
            </h2>
          </el-col>
          <el-col :span="11">
            <div style="text-align: right;">
              <img @click="handleFullScreen" style="cursor: pointer" src="../../../assets/image/fullScreen.png">
            </div>
          </el-col>
        </el-row>
      </template>
      <div id="chain-container"></div>

      <el-row v-if="`aloneData.length > 0`">
        <div v-for="(item, index) in aloneData" :key="index"  style="display: inline-flex;" class="alone-container">
          <el-tooltip placement="top">
            <div slot="content" v-html="viewUser(item)"></div>
            <el-button><img class="img-user" src="../../../assets/image/user.png">{{ item.name }}</el-button>
          </el-tooltip>
        </div>
      </el-row>

    </el-dialog>
  </el-card>
</template>

<script>
import queryCondition from "./components/query-condition"
import {drawChain} from '@/utils/function'
// import { pageTransmitter, getChainOfTransmission } from '@/api/survey-form/closeContact'
import { pageTransmitter, getChainOfTransmission } from '@/api/survey-form/spreadSource'
import {option} from './const/communicationOption'

export default {
  name: "communication-chain",
  components: {
    queryCondition
  },
  data() {
    return {
      fullScreen: false,
      dialogVisible: false,
      loading: false,
      mocData: {},
      aloneData: [],
      form: {},
      data: [],
      option: option(),
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
    }
  },
  methods: {
    handleSurveyForm(formId) {
      this.$refs.queryCond.disabled = false
      this.$refs.queryCond.refresh()
    },
    query(form) {
      console.log('query:', form)
      this.form = form
      this.onLoad(form)
    },
    reset() {
      this.page.total = 0
      this.data = []
      this.loading = false
    },
    onLoad(params={}) {
      delete params.layout
      delete params.pageSizes
      delete params.total
      delete params.background
      if(this.validatenull(params.surveyFormId) || this.validatenull(params.taskIds)){
        return
      }
      this.loading = true
      pageTransmitter(this.page.currentPage, this.page.pageSize, Object.assign({}, params)).then(res => {
        if(res.data.code === 0) {
          const data = res.data.data
          this.page.total = data.total
          this.data = data.list
          // console.log(this.data)
          this.loading = false
        }else {
          this.page.total = 0
          this.data = []
          this.loading = false
          this.$message.error(res.data.msg)
        }
      })
    },
    viewChain(row) {
      this.dialogVisible = true
      let param = {}
      Object.assign(param, this.form)
      Object.assign(param, row)
      Object.keys(param).forEach(item => {
        if(item.startsWith("$")){
          delete param[item]
        }
      })
      delete param.gender
      this.loading = true
      getChainOfTransmission(param).then(res =>{
        if (res.data.code === 0) {
          const data = res.data.data;
          if(data){
            //避免空值报错，参数在服务端读取时应该有值才对
            if(data.relation.children){
              data.relation.children.forEach(d=>{
                d.name = this.validatenull(d.name)? '' : d.name
                d.identity = this.validatenull(d.identity)? '' : d.identity
              })
            }
            this.mocData = res.data.data.relation
            this.aloneData = res.data.data.alone
            this.initChain(this.mocData)
          }else{
            this.$message.info('没有数据');
          }
        }else{
          this.$message.error(res.data.msg);
        }
        this.loading = false
      })

     /* communicationChainApis.getData(row).then(res => {
        if (res.data.code === 0) {
          this.mocData = res.data.data.relation
          this.aloneData = res.data.data.alone
          this.initChain(this.mocData)
        }
      })*/
    },
    initChain(mocData) {
      const pid = 'chain-container'
      const id = 'chain-drawer'

      drawChain(pid, id, mocData)
    },
    handleFullScreen() {
      this.fullScreen = !this.fullScreen
      this.$nextTick(() => {
        this.initChain(this.mocData)
      })
    },
    refreshChange() {
      this.onLoad(this.form)
    },
    searchChange() {
      if(this.search.startTime && this.search.endTime){
        if(this.search.startTime > this.search.endTime){
          this.$message.warning('开始时间不能大于结束时间')
          return
        }
      }
      this.page.currentPage = 1
      this.onLoad(this.form)
    },
    sizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val
      this.onLoad(this.form)
    },
    viewUser(item){
      // console.log('view user:', item)
      let arr = []
      let json = {'姓名': item.name, '证件号': item.identity, '性别': item.gender==='0'? '男' : '女', '手机号': item.phone}
      if(json){
        Object.keys(json).forEach(key=>{
          if(json[key]) {
            arr.push('<label style="font-weight: bold;padding-top: 5px;line-height: 20px;">' + key
                    + ':</label>'  + '<label style="padding-left: 10px;">' + json[key] + '</label>')
          }
        })
      }
      return arr.join('<br/>')
    },
    handleClose(done){
      this.dialogVisible = false
      this.loading = false
    }

  }
}
</script>

<style scoped>
.el-tooltip {
  width: 120px;
  height: 40px;
  padding: 5px 10px;
  text-align: center;
  margin: 10px;
  border-radius: 2px;
  border: 1px solid #ded8d8;
  font-size: 15px;
}

.img-user {
  width: 30px;
  height: 30px
}
</style>

<!--<style type="text/css">-->
<style lang="scss" scope>
  /* 提示框的样式 */
  #chain-drawer {
    .g6-tooltip {
      border: 1px solid #e2e2e2;
      border-radius: 4px;
      background-color: rgba(255, 255, 255, 0.9);
      padding: 10px 8px;
      margin-left: 30px;
      opacity: 0.80;
      box-shadow: rgb(174, 174, 174) 0px 0px 10px;
    }
    .g6-component-tooltip{
      .title {
        font-weight: bold;
        padding-top: 5px;
        line-height: 20px;
      }
      .content {
        padding-left: 10px;
      }
    }
  }
</style>
