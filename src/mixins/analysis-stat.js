import {getTaskAnalysisSurveyFormTree } from "@/api/survey-form/questionnaire"
import { pageNameId, findRelatedTask } from '@/api/subject-task/task-management'

/* eslint-disable */
export default {
    data () {
        return {
            surveyFormOptions: [], //调查表字典
            taskOptions: [],   //任务字典
         }
    },
    methods: {
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
        getTaskOptions(suveryFormId=null) {
            if(suveryFormId){
                findRelatedTask(suveryFormId).then(res => {
                    if(res.data.code === 0) {
                        // console.log(res)
                        const data = res.data.data
                        this.taskOptions = data
                    }else {
                        this.taskOptions = []
                        this.$message.error(res.data.msg)
                    }
                })
            }
        },
    }
}
