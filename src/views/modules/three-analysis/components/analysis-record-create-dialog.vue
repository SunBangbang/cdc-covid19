<template>
    <el-dialog :title="title"
                :visible.sync="visible"
                width="40%"
                append-to-body>

        <avue-form  ref="analysisForm"
                    :option="option"
                    v-model="formData">
            <template slot="formId">
                <avue-input-tree default-expand-all
                                 :disabled="disabled"
                                 v-model="formData.formId"
                                 placeholder="请选择有样本的调查表"
                                 type="tree"
                                 :clearable="clearable"
                                 :nodeClick="selectSurveyForm"
                                 :dic="surveyFormOptions"></avue-input-tree>
            </template>

            <template slot="task">
                <div class="flex-col">
                    <div class="flex-item">
                        <avue-form  ref="selectTaskForm"
                                    v-if="dialogShowVisible"
                                    :option="selectTaskFormOption"
                                    v-model="formData.task"
                                    :class="['selectedTaskForm',{'is_hide':selectedTaskFormVisible === false}]">
                            <template slot="relDeptName" slot-scope="scope">
                                <el-input v-model="scope.row.relDeptName" placeholder="" disabled></el-input>
                            </template>
                            <template slot="name" slot-scope="scope">
                                <el-input v-model="scope.row.name" placeholder="" disabled></el-input>
                            </template>
                        </avue-form>
                    </div>
                    <div class="flex-item">
                        <el-button @click="selectTask" size="mini" class="selectBtn" :disabled="disabled"> {{btnText}} </el-button>
                    </div>
                </div>
            </template>
        </avue-form>
        <select-task-dialog ref="selectTaskDialog"
                            v-if="dialogVisible"
                            :defaultSelection="selectedTaskList"
                            @callback="handleSelectedTaskList"></select-task-dialog>
        <div slot="footer" class="text-right">
            <el-button type="primary" @click="handleSubmit" size="mini">确 定</el-button>
            <el-button @click="close" size="mini">取 消</el-button>
        </div>
    </el-dialog>

</template>
<script>
import {analysisFormOption} from "../const/analysisFormOption"
import selectTaskDialog from './select-task-dialog'
import {getTaskAnalysisSurveyFormTree } from "@/api/survey-form/questionnaire"

export default {
    name: 'analysisRecordCreateDialog',
    components: {
        selectTaskDialog
    },
    props: {
      form:{},
      isView: {},
      initTask: Boolean
    },
    created() {
        if (this.isView === undefined || this.isView === false) {
            this.disabled = false
        } else {
            this.disabled = true
        }
        // console.log('disabled:', this.disabled)
      console.log('create : ', this.form)
    },
  data() {
        return {
          dialogShowVisible: true,
            disabled: true,
            clearable: false,
            title: "新增分析",
            visible: false,
            option: analysisFormOption,
            selectTaskFormOption: {
                labelWidth: 0,
                submitBtn: false,
                emptyBtn: false,
                addBtn: false,
                size: 'mini',
                column: [{
                    label: '',
                    prop: 'dynamic',
                    type: 'dynamic',
                    span: 24,
                    children: {
                        align: 'left',
                        headerAlign: 'left',
                        rowDel:(row,done)=>{
                            console.log(this.formData.task)
                            let dynamic = this.formData.task.dynamic

                            //更新 “选择” 按钮的标题
                            this.updateBtnText(dynamic.length - 1)
                            //删除行时，控制子表单是否显示
                            if(dynamic.length - 1 < 1 )
                                this.selectedTaskFormVisible = false
                            done()
                        },
                        column: [{
                            label: '任务发布机构',
                            prop: "relDeptName",
                            span: 24,
                            row: true,
                            formslot: true
                        }, {
                            label: '任务名称',
                            prop: "name",
                            span: 24,
                            row: true,
                            formslot: true
                        }]
                    }
                }]
            },
            dialogVisible: false,
            surveyFormOptions: [],
            selectedTaskList:[],
            selectedTaskFormVisible: false,
            btnText: '选择',
            formData: this.form,
            formTaskData: {}
        }
    },
    methods: {
        init() {
            this.selectedTaskList = [];
            this.visible = true
            if (this.isView === undefined || this.isView === false) {
                this.disabled = false
            } else {
                this.disabled = true
            }
            this.formData = this.form
            this.getSurveyFormOptions()
          console.log(this.selectedTaskList, "--v", this.formData)
          if (this.initTask) {
            this.formData.task = {}
            let arr = Object.assign([], this.formData.tasks)
            arr.forEach((item, index) => {
              item.name = item.taskName
            })
            console.log(arr)
            this.handleSelectedTaskList(arr)
            this.dialogShowVisible = false
            this.$nextTick(() => {
              this.dialogShowVisible = true
            })
          }
            this.selectedTaskList = this.selectedTaskList.concat(this.formData.tasks)
            this.formTaskData = {formId: this.formData.formId, formName: this.formData.formName}
        },
        selectTask() {
            this.selectedTaskList = this.formData.task.dynamic
            if(this.formData.formId !== undefined && this.formData.formId) {
                this.dialogVisible = true
                this.$nextTick(() =>{
                    this.$refs.selectTaskDialog.formId = this.formData.formId
                    this.$refs.selectTaskDialog.init()
                })
            }else {
                this.$message.error("请选择调查表")
            }
        },
        handleSelectedTaskList(values) {
            this.selectedTaskList = values
            console.log('handleSelectedTaskList:', values)
            this.$nextTick(() =>{
                if(values.length > 0){
                    this.formData.task.dynamic = values
                    this.selectedTaskFormVisible = true
                    this.updateBtnText(values.length)
                }
                console.log("00000000000", this.formData)
            })
        },
        selectSurveyForm(obj) {
            this.formTaskData = {formId: obj.value, formName: obj.label}
            this.formData.formId = this.formTaskData.formId
            this.formData.task.dynamic = []
        },
        handleSubmit() {
            console.log('formData:', this.formData)
            if(!this.formData.name){
                this.$message.error("请输入分析主题")
                return
            }
            if(!this.formTaskData.formId || (this.formData.formId instanceof Array)){
                this.$message.error("请选择调查表")
                return
            }
            let dynamic = this.formData.task.dynamic
            // console.log('dynamic:', dynamic)
            if(dynamic && dynamic.length > 0 && dynamic[0].taskId){
                // this.visible = false
                let taskIds = dynamic.map(itm=>{ return {
                    taskId: itm.taskId,
                    taskName: itm.taskName,
                    start: itm.start,
                    end: itm.end,
                    sampTotal: itm.sampTotal
                }})
                this.formTaskData.taskIds = taskIds

                // console.log('view formTaskData:', this.formTaskData)
                this.$emit('update:form',this.formData)
                this.$nextTick(() => {
                    this.$emit('changeDialogForm', this.formTaskData)
                })
            }else{
                this.$message.error('请选择任务')
                return
            }

            // this.$refs.analysisForm.validate((valid,done) => {
            //     if (valid) {
            //
            //     }
            // })
        },
        updateBtnText(value) {
            if(value !== undefined && value > 0)
                this.btnText = `选择 ${value}`
            else
                this.btnText = '选择'
        },
        getSurveyFormOptions() {
          getTaskAnalysisSurveyFormTree(1, 1000).then(res =>{
            if(res.data.code === 0) {
              const data = res.data.data
              this.surveyFormOptions = data
            }else {
              this.$message.error(res.data.msg)
            }
          })
        },
        close() {
            this.selectedTaskFormVisible = false
            this.btnText = '选择'
            this.visible = false
            this.$refs.analysisForm.resetForm()
        }
    }
}
</script>
<style lang="scss" scoped>
.flex-col {
  display: flex;
  flex-direction: column;
  z-index: 1000;
  .flex-item {
    .selectBtn{
      padding: 7px 50px;
    }
  }
}

</style>
