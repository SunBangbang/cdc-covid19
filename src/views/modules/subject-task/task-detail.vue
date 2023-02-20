<template>
    <div class="task-detail" :class="{'show-head' : showHead}">
        <div class="detail-head">
            <back-bar
              :clean-children-tab="true"
              type="push"
              :location="from"
            ></back-bar>
            <el-card class="task-form" v-if="showHead">
                <el-steps
                  :active="activeTab"
                  finish-status="success"
                  simple
                >
                  <el-step
                    v-for="(item, index) in option"
                    @click.native="handleStep(item, index)"
                    :key="index"
                    :title="item.title"
                    :icon="item.icon"
                  >
                  </el-step>
                </el-steps>
            </el-card>
        </div>
        <div class="detail-content">
            <el-card class="aui-card--fill crud-item">
                <div slot="header" class="clearfix">
                    <img class="title-img" src="@/assets/image/card-title.png" />
                    <span id="label_info">任务基本信息</span>
                </div>
                <el-row :gutter="20">
                    <el-col :span="4" style="text-align: center">
                        <img class="task-img" src="@/assets/image/task.png" />
                        <div class="tag-box">
                          <el-tag size="medium" :type="getTypeOfStatus(taskInfoForm.status)">
                            {{ formatStatus(taskInfoForm.status) }}
                          </el-tag>
                        </div>
                    </el-col>
                    <el-col :span="20">
                        <el-form :model="taskInfoForm" ref="taskForm" label-width="120px" size="mini">
                            <el-row :gutter="20">
                              <el-col :span="12">
                                <el-form-item label="任务名称：">{{taskInfoForm.name}}</el-form-item>
                              </el-col>
                              <el-col :span="12">
                                <el-form-item label="工作群组名称：">{{taskInfoForm.chatName}}</el-form-item>
                              </el-col>
                            </el-row>
                            <el-form-item label="调查对象地址：">
                                {{ taskInfoForm.address.formattedAddress + (taskInfoForm.address.detailedAddress ? taskInfoForm.address.detailedAddress : '')}}
                            </el-form-item>
                            <el-form-item label="任务要求：">
                                <div class="request-box" v-if="taskInfoForm.summary">
                                    <div v-html="taskInfoForm.summary" class="request-content">{{ taskInfoForm.summary }}</div>
                                </div>
                                <div v-else>-</div>
                            </el-form-item>
                            <el-form-item label="调查对象单位联系人：">
                              <avue-crud
                                ref="contactersCrud"
                                  :option="contactersOption"
                                  :data="taskInfoForm.contacterObj.dynamic"
                                  class="hide-search-label-container select-table">
                              </avue-crud>
                            </el-form-item>
                            <el-form-item label="附件：">
                                <div class="attachment-box">
                                  <div v-for="(item, index) in attachment" :key="index" class="a-item">
                                    <img v-if="item.type === 'pdf'" src="@/assets/image/pdf.png"/>
                                    <img v-else-if="item.type === 'png' || item.type === 'jpg' || item.type === 'jpeg'" src="@/assets/image/png.png"/>
                                    <img v-else src="@/assets/image/word.png"/>
                                    <el-link class="name" :title="item.name" :href="item.url" :underline="false">{{item.name}}</el-link>
                                    <!-- <span class="view" @click="toView(item)">预览</span> -->
                                  </div>
                                </div>
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
            </el-card>
            <el-card class="aui-card--fill crud-item">
                <div slot="header" class="clearfix">
                    <img class="title-img" src="@/assets/image/card-title.png" />
                    <span id="label_respondent">关联调查对象</span>
                </div>
                <div class="respondent-box">
                  <div v-for="(item, index) in respondent" :key="index" class="resp-item">
                    <img :src="item.gender === '1' ? femaleImg : maleImg" />
                    <div class="text-box">
                      <div>
                        <span class="name" :title="item.name">{{ item.name }}</span>
                        <span>({{ item.age }}岁)</span>
                      </div>
                      <div class="phone">
                        <i class="el-icon-phone"></i>
                        {{ item.phone }}
                      </div>
                    </div>
                  </div>
                </div>
            </el-card>
            <el-card class="aui-card--fill crud-item">
                <div slot="header" class="clearfix">
                    <img class="title-img" src="@/assets/image/card-title.png" />
                    <span id="label_surveyForm">关联调查表</span>
                </div>
                <avue-crud
                    ref="surveyFormCrud"
                    :option="surveyFormsTreeOption"
                    :data="toSurveyFormData"
                    class="hide-search-label-container select-table">
                </avue-crud>
            </el-card>
            <el-card class="aui-card--fill crud-item">
                <div slot="header" class="clearfix">
                    <img class="title-img" src="@/assets/image/card-title.png" />
                    <span id="label_investigator">关联调查员</span>
                </div>
                <div class="investigator-box">
                    <div v-for="(item, index) in investigators" :key="index" class="inves-item">
                        <img v-if="item.id === groupLeader" class="leader-icon" src="@/assets/image/groupleader.png" />
                        <img class="head-img" :src="item.headUrl ? item.headUrl : headUrl" />
                        <div class="text-box">
                          <div>
                            <span class="name investigator-name" :title="item.realName">{{ item.realName }}</span>
                            <span class="mobile">
                              <i class="el-icon-phone"></i>
                              {{ item.mobile }}
                            </span>
                          </div>
                          <div class="dept" :title="item.deptName">{{ item.deptName }}</div>
                        </div>
                    </div>
                </div>
            </el-card>
        </div>
    </div>
</template>
<script>
import BackBar from "@/components/back-bar/back-bar";
import option from "./option/stepsOption";
import { getDetail } from "@/api/subject-task/task-management"
import { surveyFormsTreeOption, contactersOption } from "@/views/modules/subject-task/option/formsOption";
import { respondentInfoPage } from "@/api/subject-task/patientInfo";
import { getDictDataList } from '@/utils'
export default {
    data() {
        return {
            showHead: false,
            from: null,
            activeTab: 0,
            option: option(this),
            taskInfoForm: {
              contacterObj: {
                dynamic: [{
                  name: '',
                  phone: ''
                }]
              },
              address:{}
            },
            respondentIds: [],
            respondent: [],
            groupLeader: null,
            investigators:[],
            surveyFormsTreeOption: surveyFormsTreeOption(),
            contactersOption: contactersOption(),
            toSurveyFormData: [],
            attachment: [],
            headUrl: require("@/assets/img/userDefHeadImg.png"),
            statusDict: getDictDataList('task-status'),
            typeStatus: {0: 'info', 1: 'dark', 2: 'danger', 3: 'success', 4: 'info', 6: 'success', 7: 'danger'},
            femaleImg: require('@/assets/image/female.png'),
            maleImg: require('@/assets/image/male.png'),
        }
    },
    components: {
      BackBar,
    },
    beforeRouteEnter(to, from, next) {
      next(vm => {
        //创建任务到当前页面，重新定义当前页面的回退路径
        if (
          from.name === "task-create" || from.name === "task-edit"
          || from.name === "task-edit-task-draft" || from.name === "user-personal-info"
        ) {
          //更改from,回到协查任务管理
          vm.from = { name: "subject-task-task-mgt" };
        } else {
          vm.from = from;
        }
      });
    },
    created(){
      this.init();
    },
    methods: {
        init() {
          if(this.$route.params.taskId) {
            this.showHead = this.$route.params.isShow === 'true' ? true : false
            this.getDetail(this.$route.params.taskId);
          }
        },
        getDetail(id) {
          getDetail(id).then( res => {
            if(res.data.code === 0){
              console.log("主题任务详细信息:",res.data.data)
              let data = res.data.data;
              if(data && JSON.stringify(data) !== '{}') {
                const {start, end, surveyFormsTree, surveyForms, investigators, minSample,autoStop,
                  groupLeader, respondentIds, contacters, ...taskInfoFormData} = {...data};
                this.taskInfoForm = taskInfoFormData;
                if(this.validatenull(this.taskInfoForm.address)){
                  console.log('set user regionId...')
                  let rids = this.$store.state.user.regionIds
                  if(!this.validatenull(rids)){
                    this.taskInfoForm.address = {ids: rids.split(',')}
                  }
                }
                this.respondentIds = respondentIds
                this.taskInfoForm.dueDate = [start, end];
                this.groupLeader = groupLeader
                this.investigators = investigators
                this.taskInfoForm.contacterObj = {dynamic: data.contacters ? data.contacters : []};
                this.taskInfoForm.relDeptId = taskInfoFormData.relDeptId
                this.toSurveyFormData = surveyFormsTree !== null ? surveyFormsTree : [];
                if (res.data.data.attachment) {
                  this.attachment = JSON.parse(res.data.data.attachment)
                  this.attachment.forEach(item => {
                    let urlArr = item.url.split('/')
                    urlArr[urlArr.length - 1] = encodeURIComponent(urlArr.pop())
                    item.url = urlArr.join('/');
                  });
                }
                // console.log(this.attachment)
                this.loadRespondent(this.respondentIds)
              }
            }else{
              this.$message.error('操作失败')
            }
          })
        },
        handleStep(item, index) {
            this.activeTab = index;
            if(item.label) {
                let jump = document.getElementById('label_' + item.label)
                jump.scrollIntoView()
            }
        },
        toView(item) {

        },
        loadRespondent(ids) {
          let str = ids.toString();
          if (str === "" || !ids) {
            str = "nullId";
          }
          let param = {
            identityList: str
          };
          respondentInfoPage(
            1,
            1000,
            "",
            param
          ).then(res => {
            if (res.data.code === 0) {
              this.respondent = res.data.data.list;
            }
          });
        },
        getTypeOfStatus(status) {
          return this.typeStatus[status] ? this.typeStatus[status] : ''
        },
        formatStatus(val) {
          let label = val
          if (this.statusDict) {
            this.statusDict.some(item => {
              if (item.dictValue == val) {
                label = item.dictLabel
                return true
              }
            })
          }
          return label
        },
    }
}
</script>
<style lang="scss" scoped>
.task-detail {
    margin-top: 30px;
    .detail-head {
      padding-top: 15px;
      background-color: #f1f4f5;
      position: fixed;
      top: 50px;
      width: calc(100% - 280px);
      z-index: 999;
    }
    .detail-content {
        padding: 8px 90px;
        overflow-y: auto;
        .tag-box {
          margin-top: 16px;
          .el-tag {
            padding: 0px 25px !important;
          }
        }
        .crud-item {
            .title-img {
                margin-right: 12px;
            }
        }
        .request-box {
            background: #FAFAFB;
            border-radius: 4px;
            .request-content {
                padding: 12px 18px;
            }
        }
        .attachment-box {
          display: flex;
          flex-wrap: wrap;
          .a-item {
            width: 375px;
            background-color: #FAFAFB;
            padding: 10px 16px;
            margin: 10px 45px 10px 0;
            position: relative;
            img {
              margin-right: 14px;
            }
            .name {
              vertical-align: top;
              width: 80%;
              color: #333333;
              font-weight: 600;
              display: inline-block;
              overflow:hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              -o-text-overflow:ellipsis;
            }
            .view {
              color: #01BFBF;
              font-weight: 600;
              position: absolute;
              cursor: pointer;
            }
          }
        }
        .respondent-box, .investigator-box {
            display: flex;
            flex-wrap: wrap;
        }
        .resp-item {
            width: 240px;
            height: 77px;
            background: #FAFAFB;
            border-radius: 5px;
            border: 1px solid #DDDDDD;
            margin:10px;
            padding: 12px;
            .head-img {
                width: 48px;
                height: 48px;
                border-radius: 50%;
            }
        }
        .inves-item {
            width: 290px;
            height: 77px;
            background: #FAFAFB;
            border-radius: 5px;
            border: 1px solid #DDDDDD;
            margin:10px;
            padding: 12px;
            position: relative;
            .head-img {
                width: 48px;
                height: 48px;
                border-radius: 50%;
            }
        }
        .leader-icon {
          position: absolute;
          top: -1px;
          left: -1px;
        }
        .text-box {
            display: inline-block;
            margin-left: 12px;
            vertical-align: top;
            position: relative;
            top: 4px;
            .name {
              font-size: 14px;
              font-weight: 600;
              color: #333333;
              margin-right: 20px;
              display: inline-block;
              max-width: 100px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              vertical-align: text-top;
            }
            .dept {
              color: #838792;
              font-size: 14px;
              margin-top: 8px;
              max-width: 200px;
              overflow:hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              -o-text-overflow:ellipsis;
            }
            .investigator-name {
              max-width: 91px;
            }
        }
        .phone {
          padding: 4px 10px;
          background: #E9EEF8;
          border-radius: 12px;
          color: #878787;
          margin-top: 7px;
        }
        .mobile {
          color: #878787;
        }
    }
}
.show-head {
  margin-top: 150px;
  .detail-head {
    padding-bottom: 30px;
  }
  .detail-content {
    height: calc(100vh - 240px);
  }
}
</style>
<style lang="scss">
.task-detail {
  .detail-content {
    .el-form-item__content {
      font-weight: 600 !important;
      color: rgba(0,0,0,0.85) !important;
    }
  }
}
</style>
