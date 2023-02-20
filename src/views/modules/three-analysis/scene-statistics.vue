<template>
  <div>
    <el-card class="header">
      <el-row>
        <el-col :span="14">
          <el-row class="header-left">
            <el-col :span="5">
              场景：<span class="label">{{sceneName}}</span>
            </el-col>
            <el-col :span="5">
              调查表：<span class="label">{{surveyFormName}}</span>
            </el-col>
            <el-col :span="5">
              关联任务：<span class="label">{{taskName}}</span>
            </el-col>
            <el-col :span="5">
              样本数量：<span class="label">{{numOfSample}}</span>
            </el-col>
            <el-col :span="4">
              <el-button size="mini" type="primary" @click="handleClickChange">修改</el-button>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="10">
          <el-row>
            <el-col :span="12">
              选择场景字段：
              <el-select v-model="sceneProperty" placeholder="请选择">
                <el-option
                    v-for="item in scenePropertyOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="12">
              <el-button size="mini" type="primary" @click="handleClick">分析</el-button>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-card>
    <el-card>
      <el-table :data="tableData"
                stripe
                style="width: 100%">
        <el-table-column
            type="index">
        </el-table-column>
        <el-table-column
            prop="label"
            :label="tableLabel">
        </el-table-column>
        <el-table-column
            prop="totalNum"
            label="总数">
        </el-table-column>
        <el-table-column
            prop="caseNum"
            label="病例数(例)">
        </el-table-column>
        <el-table-column
            prop="attackRate"
            label="罹患率(%)">
        </el-table-column>
      </el-table>
    </el-card>
    <scene-statistics-change-dialog
        ref="sceneStatisticsChangeDialog"
        :form="form"
        @dialogFormSubmit="handleDialogFormSubmit"
        v-if="sceneStatisticsChangeDialogVisible">
    </scene-statistics-change-dialog>
  </div>
</template>

<script>
import sceneStatisticsChangeDialog  from "./components/scene-statistics-change-dialog"
import {count} from "@/api/survey-form/sample"

export default {
  name: "scene-statistics",
  components: {
    sceneStatisticsChangeDialog,
  },
  data() {
    return {
      //dialog表单数据
      form:{
        scene:"",//场景类型
        surveyForm:"",//表单id
        task:""//任务id
      },
      sceneName:"",//场景类型名称
      surveyFormName:"",//表单名称
      taskName:"",//任务名称
      numOfSample:0,//样本数
      sceneProperty:'',//场景字段
      scenePropertyOptions:[],//场景字段配置
      tableLabel:"label",
      tableData:[],
      sceneStatisticsChangeDialogVisible:false,
    }
  },
  methods: {
    handleClickChange() {
      this.sceneStatisticsChangeDialogVisible = true;
      this.$nextTick(() => {
        this.$refs.sceneStatisticsChangeDialog.init();
      })
    },
    //修改完成
    handleDialogFormSubmit(sceneName, surveyFormName, taskName) {
      this.sceneName = sceneName;
      this.surveyFormName = surveyFormName;
      this.taskName = taskName;
      this.sceneStatisticsChangeDialogVisible = false;
      count(this.form.task, this.form.surveyForm).then(res => {
        if (res.data.code === 0) {
          this.numOfSample = res.data.data;
        } else {
          this.$message.error(res.data.msg);
        }
      })
      this.getScenePropertyOptions(this.form.scene);
    },
    getScenePropertyOptions(sceneProperty) {
      if (sceneProperty === 'school') {
        this.scenePropertyOptions = [
          {
            label: "学校",
            value: "school"
          },
          {
            label: "年级",
            value: "grade"
          },
          {
            label: "班级",
            value: "class"
          }
        ];
      }
    },

  }
}
</script>

<style scoped lang="scss">
.header{
  padding: 10px;

  .header-left{
    line-height: 30px;

    .label{
      color:red;
    }
  }


}

</style>