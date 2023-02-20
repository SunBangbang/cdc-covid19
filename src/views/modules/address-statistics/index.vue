<template>
    <div style="padding: 20px;background-color: white">
        <el-form :inline="true" :model="search" ref="searchForm" @keyup.enter.native="onLoad()" size="mini" :rules="rules">
            <el-form-item label="调查表" prop="surveyFormId">
                <avue-input-tree v-model="search.surveyFormId"
                                 placeholder="调查表"
                                 :nodeClick="selectSurveyForm"
                                 type="tree"
                                 :dic="surveyFormOptions" >
                </avue-input-tree>
            </el-form-item>
            <el-form-item label="任务" prop="taskId">
                <avue-select multiple v-model="search.taskId"
                                 placeholder="任务"
                                 type="tree"
                                 :dic="taskOptions" >
                </avue-select>
            </el-form-item>
            <el-form-item label="地点">
                <el-input v-model="search.address" placeholder="地点" clearable></el-input>
            </el-form-item>
            <el-form-item label="开始时间">
                <avue-date v-model="search.startTime"
                           format="yyyy-MM-dd HH:mm"
                           type="datetime"
                           value-format="yyyy-MM-dd HH:mm:ss"
                           placeholder="审核开始时间">
                </avue-date>
            </el-form-item>
            <el-form-item label="结束时间">
                <avue-date v-model="search.endTime"
                           format="yyyy-MM-dd HH:mm"
                           type="datetime"
                           value-format="yyyy-MM-dd HH:mm:ss"
                           placeholder="审核结束时间">
                </avue-date>
            </el-form-item>
            <el-form-item>
                <el-button @click="searchChange()" class="el-button el-button--primary el-button--mini">
                    <i class="el-icon-search"></i>
                    查询
                </el-button>
                <el-button @click="clear()" class="el-button el-button--default el-button--mini">
                    <i class="el-icon-delete"></i>
                    重置
                </el-button>
            </el-form-item>
        </el-form>

        <avue-crud :data="data" :option="option">
            <template slot-scope="scope" slot="menuLeft">
            </template>
        </avue-crud>
    </div>
</template>

<script>
import { getAddressStatistics } from '@/api/survey-form/sample'
import analysisStat from '@/mixins/analysis-stat'

    export default {
        name: "index",
        mixins: [analysisStat],
        data() {
            return {
                search: {
                    surveyFormId: '',
                    taskId: [],
                    address: '',
                    startTime: null,
                    endTime: null
                },
                rules: {
                    surveyFormId: [
                        {required: true, message: '请选择调查表'}
                    ],
                    taskId: [
                        {required: true, message: '请选择任务'}
                    ]
                },
                taskOptions: [],   //任务字典
                data: [],
                option: {
                    menu: false,
                    index: true,
                    columnBtn:false,
                    refreshBtn:false,
                    saveBtn:false,
                    updateBtn:false,
                    cancelBtn:false,
                    addBtn:false,
                    delBtn:false,
                    editBtn:false,
                    page:false,
                    column: [
                        {
                            label: '地址',
                            prop: 'label'
                        },
                        {
                            label: '病例数(例)',
                            prop: 'number'
                        },
                        {
                            label: '构成比(%)',
                            prop: 'rate'
                        }
                    ]
                }
            }
        },
        created() {
            this.init()
        },
        methods: {
            init() {
              this.getSurveyFormOptions()
            },
            onLoad() {
                // this.loading = true;
                console.log('search:', this.search)
                if (this.search.surveyFormId != null && this.search.taskId != null) {
                  let params = {}
                  Object.assign(params, this.search)
                  params.taskIds = params.taskId.join(",")
                  delete params.taskId
                    getAddressStatistics(this.search.surveyFormId, params).then(res => {
                        if (res.data.code === 0) {
                            console.log(res)
                            const data = res.data.data;
                            this.data = data;
                        }
                    })
                }else {
                    this.$message.error('请选择调查表或任务！');
                }

            },
            clear() {
                this.search = {surveyFormId: '', taskId: [], startTime: null, endTime: null}
                this.$refs['searchForm'].resetFields();
            },
            searchChange() {
              if(this.search.startTime && this.search.endTime){
                if(this.search.startTime > this.search.endTime){
                  this.$message.warning('开始时间不能大于结束时间')
                  return
                }
              }
                this.$refs['searchForm'].validate((valid) => {
                    if (valid) {
                        this.onLoad();
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            selectSurveyForm(obj) {
                this.search.taskId = []
                console.log('select form:', obj)
                this.getTaskOptions(obj.value)
            },
        }
    }
</script>

<style scoped>

</style>
