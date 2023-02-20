<template>
  <el-card class="aui-card--fill">
    <el-row>
      <el-form :model="search" ref="searchForm" @keyup.enter.native="onLoad()" size="mini"
               label-width=".7rem"
               label-suffix=":">
        <el-col :span="8">
          <el-form-item label="调查表" prop="surveyFormId">
            <avue-input-tree v-model="search.surveyFormId"
                             style="width: 1.9rem"
                             placeholder="选择调查表"
                             :nodeClick="selectSurveyForm"
                             type="tree"
                             :dic="surveyFormOptions">
            </avue-input-tree>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="流调任务" prop="taskId">
            <avue-select multiple v-model="search.taskId"
                         style="width: 4.2rem"
                         @change="isDisabled"
                         placeholder="选择流调任务（可多选）"
                         type="tree"
                         :dic="taskOptions">
            </avue-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="开始时间">
            <avue-date v-model="search.startTime"
                       format="yyyy-MM-dd HH:mm"
                       type="datetime"
                       value-format="yyyy-MM-dd HH:mm:ss"
                       placeholder="选择审核开始时间">
            </avue-date>
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item label="结束时间">
            <avue-date v-model="search.endTime"
                       format="yyyy-MM-dd HH:mm"
                       type="datetime"
                       value-format="yyyy-MM-dd HH:mm:ss"
                       placeholder="选择审核结束时间">
            </avue-date>
          </el-form-item>
        </el-col>
        <el-col :span="7">
          <el-form-item>
            <el-button @click="searchChange" :disabled="disabled" type="primary" icon="el-icon-search" style="margin-right: 15px">查询</el-button>
            <el-button @click="clear"  :disabled="disabled" icon="el-icon-delete">重置</el-button>
          </el-form-item>
        </el-col>
      </el-form>
    </el-row>
    <avue-crud :data="data" :option="option"></avue-crud>
  </el-card>
</template>

<script>
import {getClinicalManifestationStatistics} from '@/api/survey-form/sample'
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
        endTime: null,
      },
      disabled: true,
      rules: {
        surveyFormId: [
          {required: true, message: '请选择调查表'}
        ],
        taskId: [
          {required: true, message: '请选择任务'}
        ]
      },
      data: [],
      option: {
        menu: false,
        index: true,
        columnBtn: false,
        refreshBtn: false,
        saveBtn: false,
        updateBtn: false,
        cancelBtn: false,
        addBtn: false,
        delBtn: false,
        editBtn: false,
        page: false,
        column: [
          {
            label: '症状/体征',
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
    this.init();
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
        getClinicalManifestationStatistics(this.search.surveyFormId, params).then(res => {
          if (res.data.code === 0) {
            // console.log(res)
            const data = res.data.data;
            this.data = data;
          } else if (res.data.code === 10071) {
            this.$message.error(res.data.msg)
            this.data = []
          } else {
            console.log(res.data.msg)
            this.data = []
            this.$message.error('数据错误或无数据！请检查')
          }
        })
      } else {
        this.$message.error('请选择调查表或任务！');
      }
    },
    clear() {
      this.search = {
        surveyFormId: '',
        taskId: [],
        address: '',
        startTime: null,
        endTime: null
      }
      this.isDisabled()
    },
    searchChange() {
      if (this.search.startTime && this.search.endTime) {
        if (this.search.startTime > this.search.endTime) {
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
      this.getTaskOptions(obj.value)
    },
    isDisabled() {
      this.$nextTick(() => {
        this.disabled = !(this.search.surveyFormId && this.search.taskId.length > 0);
      })
    }
  }
}
</script>

<style scoped>
:deep(.el-date-editor.el-input, .el-date-editor.el-input__inner) {
  width: 1.9rem;
}
</style>
