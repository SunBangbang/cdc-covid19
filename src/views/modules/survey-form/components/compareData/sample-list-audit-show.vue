<template>
  <el-row  class="left-sample-list">
    <el-row>
        <el-popover
                placement="right"
                title="说明"
                width="400"
                trigger="hover">
            <el-row>
                <el-row>1、首次上级审核中不能编辑已合并调查记录。</el-row>
                <el-row>2、只有质控员才能审核调查记录。</el-row>
            </el-row>
            <span class="left-audit-title" slot="reference">{{titleText}}<i class="el-icon-info" style="margin-left: 5px"></i></span>
        </el-popover>
    </el-row>
    <el-row class="sample-list-scroll" v-if="!refresh">
      <el-row v-for="(item, index) in sampleListData" :key="index ">
        <single-sample-show :sample-data="item"
                            v-if="!refresh"
                            :survey-form-id="routerParams.surveyFormId"
                            :task-id="routerParams.taskId"
                            :index="index"
                            :is-group-leader="isGroupLeader"
                            :clicked-index="clickedIndex"
                            :only-read="isReadOnly(item)"
                            @callBack="callBack"
                            @edit="edit"
                            @remove="remove"
                            @checked="checked"
                            :ref="`sample${index}`">
          <template slot="header-tag" v-if="routerParams.groupLeader.username === item.investUserName">
            <el-tag size="mini" effect="dark" style="position: absolute;top:25px;left: 25px;transform: scale(0.7);"> 质控员</el-tag>
          </template>
        </single-sample-show>
      </el-row>
    </el-row>
    <el-row class="static-left-footer-bar">
        <!--质控员，待审核样本数大于0 -->
      <div v-if="isGroupLeader && !beginAudit && shouldChecked>0 && canAudit" >
        <el-button type="primary" style="width: 100%" size="mini" @click="startAudit"> 进入审核模式</el-button>
      </div>
<!--     <div v-if="isGroupLeader && !beginAudit && !canAudit" >-->
<!--        <h5>正在上报中不能审核。</h5>-->
<!--      </div>-->
      <div v-if="isGroupLeader && beginAudit">
        <el-col :span="6">
          <el-checkbox v-model="allCheck" label="全选" size="medium" @change="changeChecked(allCheck)"></el-checkbox>
        </el-col>
        <el-col :span="18">
          <el-button type="danger" size="mini" style="position: relative;top: -5px; float: right; margin-left: 10px" @click="finishAudit">退出审核</el-button>
          <el-button type="primary" size="mini" style="position: relative;top: -5px; float: right" @click="audit" v-points="1000">审核</el-button>
        </el-col>
      </div>
    </el-row>
  </el-row>
</template>

<script>
import SingleSampleShow from "@/views/modules/survey-form/components/compareData/single-sample-show"
import {pageForTask} from "@/api/survey-form/sample"
import {pageAssistSample} from "@/api/assistant/assistant"
import AppConstant from "@/utils/AppConstant"

export default {
  name: "sample-list-audit-show",
  components: {SingleSampleShow},
  props: {
    routerParams: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      sampleListData: [],
      username: this.$store.state.user.name,
      allCheck: false,
      isGroupLeader: false,
      beginAudit: false,
      titleText: '',
      refresh: false,
      clickedIndex: null,
      shouldChecked: 0,
      checkedIds: [],
      time: 0,
      canAudit: false,
      sidMap: new Map(),
      mergeId: null
    }
  },
  created() {
    this.loadData()
    this.isGroupLeader  = this.routerParams.groupLeader.username === this.$store.state.user.name
    let str = this.routerParams.canAudit
    this.canAudit = !this.validatenull(str)? eval(str) : false
  },
  methods: {
    checked(obj) {
      console.log('checked:', obj)
      // {isChecked: this.isChecked, sid: this.sampleData.id, fromAssist: this.fromAssist})
      if (obj.isChecked) {
        this.checkedIds.push(obj.sid)
      } else {
        this.checkedIds = this.checkedIds.filter(v => v !== obj.sid)
      }
      this.allCheck = this.checkedIds.length === this.shouldChecked
      this.sidMap.set(obj.sid, obj.fromAssist)
    },
    startAudit() {
      this.beginAudit = true
      this.titleText = '审核调查记录' + '（' + this.shouldChecked +'）'
      this.refresh = true
      this.clickedIndex = null
      this.$emit("switchAuditMode")
      this.$nextTick(() => {
        this.refresh = false
      })
    },
    finishAudit() {
      this.beginAudit = false
      this.titleText = '调查记录' + '（' + this.sampleListData.length +'）'
      this.allCheck = false
      this.clickedIndex = null
      this.refresh = true
      this.checkedIds = []
      this.$emit("switchAuditMode")
      this.$nextTick(() => {
        this.refresh = false
      })
    },
    isReadOnly(item) {
      console.log('isReadOnly:', this.canAudit, this.shouldChecked)
      if (this.isGroupLeader) {
        //已合并样本特殊处理
        let show = item.add===AppConstant.MERGE_NAME? this.canAudit : true
        return !this.beginAudit && show
      } else {
        return this.canAudit
      }
    },
    changeChecked(value) {
      this.checkedIds =[]
      this.sampleListData.forEach((item, index) => {
        this.sidMap.set(item.id, item.add === AppConstant.ASSIST_NAME)
        if(this.$refs[`sample${index}`][0].disabled) {
          this.$refs[`sample${index}`][0].isChecked = value
          if (value) {
            //if (item.add !== '合并')
            this.checkedIds.push(item.id)
          }
        }
      })
      if (!value) this.checkedIds = []
    },
    remove(index) {
      this.sampleListData.splice(index, 1)
      if (this.sampleListData.length <= 0) {
        //回到上个路由页面
        this.$emit('back')
      }
    },
    async loadData() {
      this.sampleListData = []
      const params = Object.assign({}, this.routerParams)
      // 需要删除多余参数以免接口处理不必要的接口。
      delete params.participant
      delete params.groupLeader
      console.log('load data.............', params)

      let sampleDataList = await this.getSurveySampleData(params)
      let data = sampleDataList
      if(!this.validatenull(params.appId)){
        let assistDataList = await this.getAssistSampleData(params.appId)
        data = sampleDataList.concat(assistDataList)
      }
      if (data && data.length > 0) {
        data.forEach(item => {
          // && item.add !== '合并'
          if (item.submitStatus !== AppConstant.DRAFT_NAME && (item.add === AppConstant.MERGE_NAME || item.auditStatus !== AppConstant.AUDIT_NAME)) {
            this.shouldChecked++
          }
          if (item.investUserName !== this.username) {
            if (item.submitStatus !== AppConstant.DRAFT_NAME) {
              this.sampleListData.push(item)
            }
          } else {
            if (item.add === AppConstant.MERGE_NAME) {
              this.sampleListData.unshift(item)
              this.mergeId = item.id
            } else {
              this.sampleListData.push(item)
            }
          }
        })
      }

      this.titleText = '调查记录' + '（' + this.sampleListData.length +'）'
      if (this.sampleListData.length <= 0) {
        this.$router.replace({name: 'survey-sample', params: {
          taskId: this.routerParams.taskId
        }});
      }
      this.loading= false;
    },
    async getSurveySampleData(params){
      let res = await pageForTask(1, 500, params)
      if(res.data.code ===0){
        return res.data.data.list
      }else{
        console.error('err:', res.data.msg)
        throw new Error('不能获取调查填写样本数据')
      }
    },
    async getAssistSampleData(appId){
      let res = await pageAssistSample(1, 500, {appId: appId})
      if(res.data.code ===0){
        return res.data.data.list
      }else{
        console.error('err:', res.data.msg)
        throw new Error('不能获取协查填写样本数据')
      }
    },
    audit() {
      this.clickedIndex = null
      if(this.checkedIds.length > 0) {
        let auditData = {}
        auditData.surveyIds = this.checkedIds.filter(id=> !this.sidMap.get(id))
        auditData.assistIds = this.checkedIds.filter(id=> this.sidMap.get(id))
        auditData.checkedIds = this.checkedIds
        auditData.mergeId = this.mergeId
        console.log('audit data:', auditData)
        /**
         * 两种审核情况:
         * 1、没有合并样本存在，单个或多个原始样本共同审核
         * 2、合并样本存在，合并样本和其他原始样本共同审核
         */
        if(!this.validatenull(this.mergeId)){
          let idx = this.checkedIds.findIndex(itm=>itm==this.mergeId)
          if(idx > -1){
            console.log('存在合并调查记录')
            //合并样本和其他至少一个原始样本参与审核
            if(this.checkedIds.length<2){
              this.$message.warning('请选择合并调查记录和至少一条原始调查记录!')
              return
            }
          }else{
            console.error('存在合并调查记录')
            this.$message.warning('请选择合并调查记录和至少一条原始调查记录!')
            return
          }
        }else{
          if(this.validatenull(auditData.surveyIds)){
            this.$message.warning('请至少选择一条原始调查记录!')
            return
          }
        }

        this.$emit("audit", auditData)
        // this.$emit("audit", this.checkedIds)
      }else {
        this.$message.warning("请选择需要审核的调查记录！")
      }
    },
    callBack(val) {
      // if (this.time <= 0) {
        this.$emit('callBack', val[0])
        this.clickedIndex = val[1]
      //   this.time++
      //   setTimeout(() => {
      //     this.time--
      //   }, 2000)
      // } else {
      //  this.$message.warning("请不要过快点击！")
      // }
    },
    edit(val) {
      this.$emit('edit', val[0])
      this.clickedIndex = val[1]
    }
  }
}
</script>

<style scoped>
.left-audit-title {
  font-size: 17px;
  font-weight: bolder;
  color: #404040;
  margin-bottom: 10px;
}
.sample-list-scroll {
  overflow-y: auto;
  height: calc(100vh - 200px);
}
.static-left-footer-bar {
  background: white;
  margin-top: 10px;
}
.left-sample-list {
  background: white;
  height: calc(100vh - 115px);
  padding: 15px;
  border-radius: 5px;
}
</style>
