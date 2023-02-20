<template>

  <el-row>

    <el-form
      ref="ruleForm"
      :inline="true"
      :model="form"
      :rules="rules"
      size="mini"
      label-width=".6rem"
      label-suffix=":"
    >

      <el-col :span="8">

        <el-form-item label="调查表">

          <avue-input-tree
            v-model="form.surveyFormId"
            placeholder="请选择调查表"
            style="width: 1.9rem"
            :nodeClick="selectSurveyForm"
            type="tree"
            :clearable="clearable"
            :dic="surveyFormOptions"
          >

          </avue-input-tree>

        </el-form-item>

      </el-col>

      <el-col :span="16">

        <el-form-item label="流调任务" label-width=".6rem">

          <avue-select
            multiple
            v-model="form.taskIds"
            type="tree"
            style="width: 4.3rem"
            @change="isDisabled"
            placeholder="请选择流调任务（可多选）"
            :dic="taskOptions"
          >

          </avue-select>

        </el-form-item>

      </el-col>

      <el-col :span="8">

        <el-form-item v-if="includeTime" :label="timeLabel">

          <el-date-picker
            style="width: 1.9rem"
            v-model="form.timeRange"
            type="daterange"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >

          </el-date-picker>

        </el-form-item>

      </el-col>

      <el-col :span="10">

        <el-form-item label="地址类型" label-width=".6rem">

          <el-select
            v-model="form.positionType"
            placeholder="请选择地址类型"
            style="width: 2.2rem"
          >

            <el-option
              v-for="item in dicOptions"
              :key="item.value"
              :label="item.label"
              :title="item.label"
              :value="item.value"
            >

            </el-option>

          </el-select>

        </el-form-item>

      </el-col>

      <el-col :span="6" style="padding-left: .1rem">

        <el-form-item>

          <el-button
            type="primary"
            :class="timeLabel === '密接时间' ? 'more-margin' : ''"
            @click="handleClick"
            icon="el-icon-search"
            :disabled="disabled"
          >
             查询
          </el-button>

          <el-button
            @click="reset"
            icon="el-icon-delete"
            :disabled="disabled"
            style="margin-left: 20px"
          >
             重置
          </el-button>

        </el-form-item>

      </el-col>

    </el-form>

  </el-row>

</template>

<script>
import { getTaskAnalysisSurveyFormTree } from "@/api/survey-form/questionnaire";
import { findRelatedTask } from "@/api/subject-task/task-management";

export default {
  name: "query-condition",
  props: {
    timeLabel: {
      type: String,
      default: "时间段"
    },
    includeTime: {
      type: Boolean,
      default: true
    }
  },
  data() {
    const validateAgeGroup = (rule, value, callback) => {
      const reg = /^(\d+,?)+$/;
      console.log("validateMore");
      if (!reg.test(value) && value !== "") {
        callback(new Error("请输入指定格式内容！"));
      } else {
        callback();
      }
    };
    return {
      form: {
        surveyFormId: "",
        taskIds: [],
        timeRange: [],
        positionType: null
      },
      dicOptions: [
        { label: "常住地址", value: "location" },
        { label: "隔离场所地址", value: "isolationRoomAddress" }
      ],
      surveyFormOptions: [],
      taskOptions: [],
      visible: true,
      disabled: true,
      clearable: false,
      rules: {
        ageRange: [{ validator: validateAgeGroup, trigger: "blur" }]
      }
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.getSurveyFormOptions();
    },
    refresh() {
      this.visible = false;
      this.$nextTick(res => {
        this.visible = true;
      });
    },
    getSurveyFormOptions() {
      getTaskAnalysisSurveyFormTree(1, 1000).then(res => {
        if (res.data.code === 0) {
          const data = res.data.data;
          this.surveyFormOptions = data;
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    getTaskOptions(suveryFormId = null) {
      if (suveryFormId) {
        findRelatedTask(suveryFormId).then(res => {
          if (res.data.code === 0) {
            // console.log(res)
            const data = res.data.data;
            this.taskOptions = data;
          } else {
            this.taskOptions = [];
            this.$message.error(res.data.msg);
          }
        });
      }
    },
    selectSurveyForm(obj) {
      this.form.taskIds = [];
      // console.log('select form:', obj)
      this.$emit("changeSurveyForm", obj.id);
      this.getTaskOptions(obj.value);
      this.isDisabled();
    },
    handleClick() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.$emit("query", this.form);
        }
      });
    },

    reset() {
      this.form = {
        surveyFormId: "",
        taskIds: [],
        timeRange: [],
        positionType: null
      };
      this.isDisabled();
      this.$emit("reset", this.form);
    },
    isDisabled() {
      this.$nextTick(() => {
        this.disabled = !(this.form.surveyFormId && this.form.taskIds.length > 0);
      })
    }
  }
};
</script>

<style scoped>
/*.left-form-item {*/
/*  width: 3rem!important;*/
/*}*/
/*.left-form {*/
/*  width: 2.5rem!important;*/
/*}*/
:deep(.el-form-item) {
  width: 100%;
}
.more-margin {
  margin-left: 0.2rem;
}
</style>

