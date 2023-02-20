<template>
  <el-dialog :title="title"
             :visible.sync="visible"
             width="40%"
             append-to-body>
    <el-form :model="form" :rules="rules" ref="form" label-position="right" label-width="80px">
      <el-form-item label="场景" prop="scene">
        <el-select v-model="form.scene"
                   @change="handleChangeScene"
                   placeholder="请选择场景">
          <el-option
              v-for="item in sceneOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="调查表" prop="surveyForm">
        <el-select v-model="form.surveyForm"
                   @change="handleChangeSurveyForm"
                   :loading="surveyFormSelectLoading"
                   placeholder="请选择调查表">
          <el-option
              v-for="item in surveyFormOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="关联任务" prop="task">
        <el-select v-model="form.task"
                   :loading="taskSelectLoading"
                   placeholder="请选择关联任务">
          <el-option
              v-for="item in taskOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {getSurveyFormDicBySceneType} from "@/api/survey-form/questionnaire"
import {findRelatedTask} from "@/api/subject-task/task-management"

export default {
  name: "scene-statistics-change-dialog",
  props: {
    title:{
      type: String,
      default: "修改配置"
    },
    //表单数据
    form:{
      type: Object,
      default: () => {
        return {
          scene:"",//场景类型
          surveyForm:"",//表单id
          task:""//表单id
        }
      }
    }
  },
  created() {
    this.init();
  },
  data() {
    return {
      //场景选项
      sceneOptions:[
          {
            label:"学校",
            value:"school"
          },
          {
            label:"其他",
            value:"others",
          }
      ],
      //表单选项
      surveyFormOptions:[],
      //任务选项
      taskOptions:[],
      //dialog 显影
      visible:false,
      //验证
      rules: {
        scene:[
          { required: true, message: '请选择场景', trigger: 'blur' },
        ],
        surveyForm:[
          { required: true, message: '请选择调查表单', trigger: 'blur' },
        ],
        task:[
          { required: true, message: '请选择任务', trigger: 'blur' },
        ]
      },
      surveyFormSelectLoading:false,
      taskSelectLoading:false,
    }
  },
  methods:{
    //初始化
    init() {
      this.initSurveyFormOption(this.form.scene);
      this.initTaskOption(this.form.surveyForm);
      this.visible = true;
    },
    handleSubmit(){
      this.$refs.form.validate((valid) => {
        if (valid) {
          let sceneName = "",surveyFormName = "",taskName = "";
          if(this.form.scene && this.form.scene.length > 0){
            let item = this.sceneOptions.find(item =>{
              return item.value === this.form.scene;
            })
            if(item) sceneName = item.label;
          }
          if(this.form.surveyForm && this.form.surveyForm.length > 0){
            let item = this.surveyFormOptions.find(item =>{
              return item.value === this.form.surveyForm;
            })
            if(item) surveyFormName = item.label;
          }
          if(this.form.task && this.form.task.length > 0){
            let item = this.taskOptions.find(item =>{
              return item.value === this.form.task;
            })
            if(item) taskName = item.label;
          }
          this.$emit("dialogFormSubmit",sceneName,surveyFormName,taskName);
        }
      });
    },
    //改变场景方法
    handleChangeScene(value){
      this.surveyFormSelectLoading = true;
      getSurveyFormDicBySceneType(value).then(res =>{
        if(res.data.code === 0){
          this.surveyFormOptions = res.data.data;
          this.form.surveyForm = '';
          this.form.task = '';
          this.taskOptions = [];
          this.surveyFormSelectLoading = false;
        }else{
          this.$message.error(res.data.msg);
        }
      })
    },
    //改变表单方法
    handleChangeSurveyForm(value){
      this.taskSelectLoading = true;
      findRelatedTask(value).then(res =>{
        if(res.data.code === 0){
          this.taskOptions = res.data.data;
          this.form.task = '';
          this.taskSelectLoading = false;
        }else{
          this.$message.error(res.data.msg);
        }
      })
    },
    initSurveyFormOption(scene){
      if(!scene || scene.length === 0){
        return;
      }
      getSurveyFormDicBySceneType(scene).then(res =>{
        if(res.data.code === 0){
          this.surveyFormOptions = res.data.data;
        }else{
          this.$message.error(res.data.msg);
        }
      })
    },
    initTaskOption(surveyForm){
      if(!surveyForm || surveyForm.length === 0){
        return;
      }
      findRelatedTask(surveyForm).then(res =>{
        if(res.data.code === 0){
          this.taskOptions = res.data.data;
        }else{
          this.$message.error(res.data.msg);
        }
      })
    }
  }
}
</script>

<style scoped>

</style>