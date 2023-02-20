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
            <el-form-item label="开始时间">
                <avue-date v-model="search.startTime"
                           format="yyyy-MM-dd"
                           type="datetime"
                           value-format="yyyy-MM-dd HH:mm:ss"
                           placeholder="发病开始时间">
                </avue-date>
            </el-form-item>
            <el-form-item label="结束时间">
                <avue-date v-model="search.endTime"
                           format="yyyy-MM-dd"
                           type="datetime"
                           value-format="yyyy-MM-dd HH:mm:ss"
                           placeholder="发病结束时间">
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

        <div id="container" style="margin-top: 100px"></div>
    </div>
</template>

<script>
    import {getEpidemicCurveStatistics} from "@/api/survey-form/sample"
    import { Column } from '@antv/g2plot'
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
                columnPlot: null
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
                const pid = 'container';
                const id = 'source';
                this.createElementForDrawingChart(pid, id);
                if(this.columnPlot){
                    //避免重复点击造成页面崩溃
                    this.columnPlot.destroy()
                }
                if (this.search.surveyFormId != null && this.search.taskId != null) {
                  let params = {}
                  Object.assign(params, this.search)
                  params.taskIds = params.taskId.join(",")
                  delete params.taskId
                  getEpidemicCurveStatistics(this.search.surveyFormId, params).then(res => {
                    const data = res.data.data;
                    // const data = [
                    //     { label: '2021-05-02', number: 30 },
                    // ];
                    if (res.data.code === 0) {
                       this.columnPlot = new Column('container', {
                        data,
                        xField: 'label',
                        yField: 'number',
                        padding:[30, 100, 70, 100],
                        xAxis: {
                          label: {
                            autoHide: true,
                            autoRotate: false,
                          },
                        },
                        yAxis:{
                          nice:true,
                          tickInterval:1
                        },
                        meta: {
                          label: {
                            alias: '日期',
                          },
                          number: {
                            alias: '人数',
                          },
                        },
                        columnWidthRatio:1,
                        columnStyle: {
                           stroke: 'black',
                        },
                        slider: {
                          start: 0,
                          end: 1,
                        },
                        label: {
                           //offset: 2,
                           position: 'top',
                           style: {
                                stroke: 'black',
                                lineWidth: 1,
                            },
                           formatter(text, item, index) {
                             return text.number
                          }
                        },
                      });

                      this.columnPlot.render();
                    }else if(res.data.code === 10071) {
                        this.data = null
                        this.$message.error(res.data.msg)
                    }else {
                        console.log(res.data.msg)
                        this.data = null
                        this.$message.error('数据错误或无数据！请检查')
                    }
                })
                }else {
                    this.$message.error('请选择调查表或任务！');
                }
            },
            //创建画布
            createElementForDrawingChart(pid, id) {
                if (pid === id) {
                    this.$message.error('图表绘图区域父区域和子区域属性id的值不能相同,');
                    return;
                }
                const parentEle = document.getElementById(pid);
                let childNode = document.createElement('div');
                childNode.setAttribute('id', id);
                if (parentEle !== null) {
                    if (document.getElementById(id) !== null && document.getElementById(id) !== undefined) {
                        parentEle.removeChild(parentEle.childNodes[0]);
                    }
                    parentEle.appendChild(childNode);
                } else {
                    console.log('画面区域不存在，请重新检查输入参数');
                    return;
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
