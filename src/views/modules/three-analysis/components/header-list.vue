<template>
    <div class="header-list">
        <el-row >
            <el-col :span="14">
                <div class="list-container">
                    <div class="list-item icon-img">
                        <img src="@/assets/img/collection.png" />
                    </div>
                    <div class="list-item content">
                        <avue-crud  :option="taskOption"
                                    :data="taskData"
                                    :header-cell-class-name="toggleHeaderRowClass"
                                    :row-class-name="toggleRowClass"
                                    class="border-hidden">
                            <template slot="tasks" slot-scope="scope">
                                <div style="min-width: 320px; position: relative;" class="hover-item">
                                    <span>{{scope.row.tasks | formatTaskName}}</span>
                                    <span class="blue-txt pading-lr">{{scope.row.tasks.length}}</span>
                                </div>
                                <div class="hover-show">
                                    <avue-crud :option="hoverOption" :data="scope.row.tasks">
                                        <!--  row-class-name="relTask-list" -->
                                        <template slot="taskName" slot-scope="newScope">
                                            <div class="col-1">
                                                <div class="topic">{{newScope.row.taskName}}</div><br>
                                                <div class="date-txt gray-txt">{{newScope.row.start.split(" ")[0]}} {{newScope.row.end ? '-' : ''}}- {{newScope.row.end ? newScope.row.end.split(" ")[0] : ''}}</div>
                                            </div>
                                        </template>
                                        <template slot="sampTotal" slot-scope="newScope">
                                            <div class="col-2">
                                                <span class="blue-txt">{{newScope.row.sampTotal}}</span><span>个样本</span>
                                            </div>
                                        </template>
                                    </avue-crud>
                                </div>
                            </template>
                        </avue-crud>
                    </div>
                    <div class="list-item opertion-box" v-if="!isView">
                        <el-button size="mini" @click="handleShowAnalysisCreateDialog">修改</el-button>
                    </div>
                </div>
            </el-col>
            <el-col :span="6">
                <div class="list-container">
                    <div :span="2" class="list-item icon-img">
                        <img src="@/assets/img/coin.png"/>
                    </div>
                    <div class="list-item content">
                        <avue-crud :option="sampleOption"
                                    :data="sampleData"
                                    :header-cell-class-name="toggleHeaderRowClass"
                                    :row-class-name="toggleRowClass">
                            <template slot="sampleNum" slot-scope="scope">
                                <div>合计<span class="blue-txt">{{scope.row.sampleNum}}</span>份样本</div>
                            </template>
                        </avue-crud>
                    </div>
                    <div class="list-item opertion-box" v-if="!isView">
                        <el-button size="mini" @click="handleSelectSampleDialog">选择</el-button>
                    </div>
                </div>
            </el-col>
            <el-col :span="4">
                    <div class="list-container last-container">
                        <div class="list-item opertion-box">
                            <el-button size="mini" type="primary" @click="handleEdit" v-if="isView">编辑</el-button>
                            <el-button size="mini" type="primary" @click="handleSave" v-else>保存</el-button>
                        </div>
                    </div>
            </el-col>
         </el-row>
        <analysis-record-create-dialog
            :init-task="true"
            ref="analysisRecordCreateDialog"
            :isView="isView"
            :form.sync="taskData[0]"
            @changeDialogForm="handleChangeRecord"
            v-if="analysisRecordCreateDialogVisible"
        ></analysis-record-create-dialog>
<!--        </el-row>-->
<!--        <analysis-record-create-dialog  ref="analysisRecordCreateDialog"-->
<!--                                v-if="analysisRecordCreateDialogVisible"></analysis-record-create-dialog>-->
        <select-sample-dialog
            ref="selectSampleDialog"
            :form.sync="taskData[0]"
            :page.sync="pageData"
            :filter.sync="filter"
            @callbackSample="callbackSample"
            @callback="callback"
            @clearSelected="clearSelected"
            v-if="selectSampleDialogVisible"></select-sample-dialog>
    </div>
</template>
<script>
import { headerTaskOption, headerSampleOption, hoverOption } from '../const/analysisRecordEditOption';
import analysisRecordCreateDialog from './analysis-record-create-dialog';
import selectSampleDialog from './select-sample-dialog';

/* eslint-disable */
export default {
  name: 'headerList',
  components: {
    analysisRecordCreateDialog,
    selectSampleDialog
  },
  props:{
      recordId: '',
      isView: {
          type: Boolean,
          default: false
      },
      taskData: {
        type: Array,
        default: () => []
      },
      sampleData: {
        type: Array,
        default: () => []
      },
      filter: {},
  },
    filters: {
        formatTaskName(value) {
            let result = '';
            if(value.length > 0) {
                result = value[0].taskName
            }else {
                result = ""
            }
            return result
        }
    },
  data() {
      return {
          pageData:{},
          taskOption: headerTaskOption,
          sampleOption: headerSampleOption,
          analysisCreateDialogVisible: false,
          selectSampleDialogVisible: false,
          passAnalysisId: true,
          headerClassName: 'list-header',
          analysisRecordCreateDialogVisible: false,
          hoverOption: hoverOption,
          /**
           * 原始任务数据: 一个表单， 多个任务
           */
          rawFormTaskData: null
      }
   },
    watch: {
        'rawFormTaskData': function (newVal, oldVal) {
            // console.log('watch taskData:', newVal, oldVal, '  ', this.taskData)
            /**
             * 非第一次修改时, 检查formId是否变化， 如果变化则清零右边过滤样本数
             */
            if(oldVal && newVal) {
                if(newVal.formId !== oldVal.formId){
                    //表单变化，右边样本筛选清零
                    newVal.modify = 'form'
                    this.refreshData(newVal)
                }else{
                    //表单未变，任务发生变化，右边样本筛选清零
                    if(newVal.taskIds.length !== oldVal.taskIds.length){
                        //任务个数不等， 任务发生变化，右边样本筛选清零
                        newVal.modify = 'task'
                        this.refreshData(newVal)
                    }else{
                        if(oldVal.taskIds.length > 0){
                            //任务个数相等但任务不一样，任务发生变化，右边样本筛选清零
                            let oldTaskIds = oldVal.taskIds.map(itm=> itm.taskId)
                            newVal.taskIds.some(item=>{
                                if(!oldTaskIds.includes(item.taskId)){
                                    // console.log('change task')
                                    newVal.modify = 'task'
                                    this.refreshData(newVal)
                                    return true
                                }
                            })
                        }
                    }

                }
            }
        }
    },
    methods: {
        refreshData(formTask) {
            this.$nextTick(()=>{
                let arr = formTask.taskIds.map(itm=> itm.sampTotal)
                let sampleNum = arr.reduce((x, y) => x+y, 0)
                this.$emit('update:sampleData', [{sampleNum: sampleNum}])
                let filterCopy = this.filter
                filterCopy.selectedIds = []
                this.$emit('update:filter', filterCopy)
                this.$emit('refreshQuery', formTask)
            })
        },
        handleShowAnalysisCreateDialog() {
            let td = this.taskData[0]
            this.rawFormTaskData = {formId: td.formId, formName: td.formName}
            if(td.tasks && td.tasks.length > 0){
                let taskIds = td.tasks.map(itm=>{ return {
                    taskId: itm.taskId,
                    taskName: itm.taskName,
                    start: itm.start,
                    end: itm.end,
                    sampTotal: itm.sampTotal
                }})
              console.log(taskIds, 'vusy')
                this.rawFormTaskData.taskIds = taskIds
            }

            this.analysisRecordCreateDialogVisible = true;
            this.$nextTick(()=>{
                if (this.isView){
                    this.$refs.analysisRecordCreateDialog.recordId = this.recordId
                }
                this.$refs.analysisRecordCreateDialog.title = "编辑分析"
                this.$refs.analysisRecordCreateDialog.init()
            })
        },
        handleSelectSampleDialog() {
            this.selectSampleDialogVisible = true
            this.$nextTick(() => {
                let taskIds = this.taskData[0].tasks.map(item=>item.taskId)
                // console.log('taskData[0]:', this.taskData[0], ' ', taskIds)
                this.$refs.selectSampleDialog.surveyFormId = this.taskData[0].formId
                //如果保存后查看，如果有过滤选择，则只第一次显示
                if(this.passAnalysisId){
                    this.$refs.selectSampleDialog.analysisId = this.taskData[0].analysisId
                }
                this.$refs.selectSampleDialog.taskIds = taskIds
                this.$refs.selectSampleDialog.init()
            })
        },
        handleEdit() {
            this.$emit('toEdit')
        },
        handleSave() {
            this.$emit('update')
        },
        toggleHeaderRowClass({row}) {
            // console.log(row);
            return "list-header"
        },
        toggleRowClass({row}) {
            // console.log(row);
            return 'list-content'
        },
        handleChangeRecord(formTaskData){
            // console.log('handleChangeRecord', this.taskData[0].task.dynamic)
            this.taskData[0].formName = formTaskData.formName
            this.taskData[0].formId = formTaskData.formId
            console.log('change record:', this.taskData)
            this.taskData[0].tasks = this.taskData[0].task.dynamic

            this.$nextTick(()=>{
                this.$emit('update:taskData',this.taskData)
                this.analysisRecordCreateDialogVisible =false
            })
            this.rawFormTaskData = formTaskData
            // console.log('formTaskData:', formTaskData)
        },
        callback(val){
            this.$emit('update:filter', val)
        },
        callbackSample(val){
          // console.log('callbackSample:', val)
          this.$emit('update:sampleData', val)
        },
        clearSelected(val){
           this.passAnalysisId = false
        }

    }
}
</script>
<style lang="scss" scoped>
.header-list{
    background: #fff;
    padding: 15px;
    .list-container {
        display: flex;
        flex-direction: row;
        .list-item {
            // display: inline-block;
            &.icon-img {
                width: 45px;
                height: 45px;
                vertical-align: text-bottom;
                margin-top: 15px;
                padding: 10px;
                background: RGB(64, 158, 255, 0.2);
                border-radius: 4px;
                img {
                    width: 100%;
                }
            }
            &.icon-img::before {
              content: ""
            }
            &.content {
                width: calc(100% - 50px - 56px);
                .pading-lr {
                    padding: 0 15px;
                }
            }
        }
    }
    .list-container.last-container {
        padding-right: 40px;
        text-align: right;
    }
    .opertion-box {
        height: 45px;
        position: relative;
        button {
            position: absolute;
            bottom: 0;
        }
    }
    .hover-show{
        display: none;
        position: fixed;
        top: 175px;
        width: 400px;
        border: 1px solid #f1f4f5;
        background-color: #fff;
        .relTask-list {
          .col-1 {
            font-weight: normal;
            .topic {
              font-size: 12px;
            }
            .date-txt {
              font-size: 11px;
            }
          }
          .col-2 {
            font-weight: normal;
            font-size: 12px;
          }
        }
    }
    .hover-item:hover+.hover-show {
      display: block;
    }
}
</style>
