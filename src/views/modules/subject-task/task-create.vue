<template>
  <el-row v-loading="loading">
    <back-bar type="replace" :location="routeLocation"></back-bar>
    <el-card class="task-form aui-card--fill--back">
      <el-steps
        :active="activeTab"
        finish-status="success"
        simple
        v-if="stepVisible"
      >
        <el-step
          v-for="(item, index) in option"
          @click.native="handleStep(index)"
          :key="index"
          :title="item.title"
          :icon="item.icon"
        >
        </el-step>
      </el-steps>
      <div class="step-content" id="taskInfoContainer">
        <!-- 任务信息 -->
        <div class="taskinfo-container" v-if="activeTab === 0">
          <!-- 属性设置  -->

          <!--<div class="propSettingForm right-section" v-if="activeTab === 0" id="propSettingContainer">
          <el-card :header="propTitle">
            <avue-form
                    ref="propSettingForm"
                    v-model="propSettingForm"
                    :option="propSettingOption">
            </avue-form>
          </el-card>
        </div>-->
          <div class="taskInfoForm left-section">
            <avue-form
              v-model="taskInfoForm"
              :option="taskInfoOption"
              ref="taskInfoForm"
            >
              <!-- <template slot="chatName">
                <p>{{ (taskInfoForm.chatName = taskInfoForm.name) }}</p>
              </template> -->

              <template slot="address">
                <div class="flex">
                  <region-select
                    v-model="taskInfoForm.address"
                    :showDetailedAddress="true"
                    class="flex-item"
                    :show-append="false"
                  ></region-select>
                </div>
              </template>

              <template slot="contacterObj">
                <div class="investItemForm">
                  <avue-form
                    ref="investItemForm"
                    :option="investItemFormOption"
                    v-model="contacterObj"
                  >
                    <template slot="phone" slot-scope="scope">
                      <el-input
                        placeholder="请输入联系方式"
                        v-model="scope.row.phone"
                        size="small"
                        maxlength="11"
                      ></el-input>
                    </template>
                  </avue-form>
                </div>
              </template>

              <template slot="summary">
                <div id="editor"></div>
              </template>

              <template slot="attachment">
                <el-form-item>
                  <multi-upload
                    v-model="attachment"
                    list-type="text"
                    uploadBtnText="上传附件"
                    @onFileChanged="onFileChanged"
                    :maxCount="limit"
                    :fileType="fileType"
                    tip="最多上传5个附件，单个附件最大10M，支持文件格式：JPEG、PNG, WORD、PDF。"
                  >
                  </multi-upload>
                </el-form-item>
              </template>
            </avue-form>
          </div>
        </div>

        <!--      关联调查对象-->

        <div v-show="activeTab === 1">
          <respondent-creator
            ref="respondentCreator"
            @next="next"
            @loading="loading = !loading"
          ></respondent-creator>
        </div>

        <!-- 关联调查表 -->

        <div v-show="activeTab === 2">
          <tree-transfer
            class="tree-transfer"
            ref="treeTransferSurveyForm"
            :title="['待选列表', '已选列表']"
            :from_data="fromSurveyFormData"
            :to_data="toSurveyFormData"
            :defaultProps="{ label: 'name', key: 'id' }"
            node_key="id"
            placeholder="搜索"
            mode="transfer"
            width="80%"
            height="540px"
            filter
            openAll
            @addBtn="addSurveyForm"
            @removeBtn="removeSurveyForm"
            @right-check-change="rightCheckChange"
          >
            <!--          <el-button class="tree-transfer-footer" slot="left-footer" size="mini" @click="clearChecked('treeTransferSurveyForm','left')">恢复</el-button>-->

            <!--          <el-button class="tree-transfer-footer" slot="right-footer" size="mini" @click="clearChecked('treeTransferSurveyForm','right')">恢复</el-button>-->
          </tree-transfer>
        </div>

        <!-- 关联调查员 -->

        <div v-show="activeTab === 3">
          <investigator-creator
            ref="investigatorCreator"
          ></investigator-creator>
        </div>

        <!-- 任务完成  -->

        <div class="finished-block" v-if="activeTab === option.length - 1">
          <div class="content">
            <div class="sight-icon"><i class="el-icon-success" /></div>

            <div class="sight-text">{{ successLabel }}</div>
          </div>

          <div class="btn-box">
            <el-button icon="el-icon-back" @click="toBack" size="mini">
              返回
            </el-button>
          </div>
        </div>
      </div>

      <div class="steps-box" v-if="activeTab < option.length - 1">
        <el-button
          type="primary"
          icon="el-icon-arrow-left"
          size="mini"
          @click="prev"
          v-if="activeTab > 0"
        >
          上一步
        </el-button>

        <!--      <el-button :loading="loading" type="primary" @click="saveAsDraft(undefined)" size="mini">存为草稿</el-button>-->

        <el-button
          :loading="loading"
          type="primary"
          @click="handleNextStep"
          size="mini"
        >
          下一步
          <i class="el-icon-arrow-right el-icon--right"></i>
        </el-button>
      </div>
    </el-card>
  </el-row>
</template>

<script>
import Editor from "wangeditor";
import Cookies from "js-cookie";
import option from "./option/stepsOption";
import {
  taskInfoOption,
  propSettingOption,
  surveyFormOption,
  investItemFormOption,
} from "./option/formsOption";
import treeTransfer from "el-tree-transfer";
import {
  getDetail,
  getTaskDraftById,
  removeTaskDraft,
  save,
  saveTaskDraft,
  update,
} from "@/api/subject-task/task-management";
import { getTaskSurveyFormTree as getSurveyFormTreeList } from "@/api/survey-form/questionnaire";
import MultiUpload from "@/components/upload/multiUpload";
import { isMobile } from "@/utils/validate";
import { getDeptTreeList } from "@/api/user/user";
// import { editorOptions } from "@/utils/editorOptions";
import moment from "moment/moment";
import RespondentCreator from "@/views/modules/subject-task/respondentCreator";
import InvestigatorCreator from "@/views/modules/subject-task/investigatorCreator";
import RegionSelect from "@/components/region-select/region-select";
import BackBar from "@/components/back-bar/back-bar";
import sm4Utils from "@/utils/sm4";

export default {
  name: "task-create",
  components: {
    BackBar,
    InvestigatorCreator,
    RespondentCreator,
    treeTransfer,
    MultiUpload,
    RegionSelect,
  },
  data() {
    return {
      stepVisible: true,
      savTaskSuccess: false,
      investigators: [],
      respondentIds: [],
      groupLeader: null,
      propTitle: "任务属性",
      loading: false,
      activeTab: 2,
      taskManagementForm: {},
      handleData: [],
      formList: [],
      option: option(this),
      taskInfoOption,
      propSettingOption,
      taskInfoForm: {
        name: "",
        chatName: "",
        relDeptId: this.$store.state.user.deptId,
        contacterObj: {
          dynamic: [
            {
              name: "",
              phone: "",
            },
          ],
        },
        address: {name: '', ids: null, detailedAddress: null},
        summary: "",
      },
      contacterObj: {
        dynamic: [
          {
            name: "",
            phone: "",
          },
        ],
      },
      formData: {},
      defaultCheckedNode: [],
      propSettingForm: {
        // minSample: 0,
        // autoStop: false,
        autoLocate: true,
        videoRequired: true,
        signRequired: false,
      },
      surveyFormOption,
      fromSurveyFormData: [],
      toSurveyFormData: [],
      toFormIds: [],
      leftCheckedSurveyForm: [],
      rightCheckedSurveyForm: [],
      isMinSample: false,
      isDuration: false,
      attachment: [],
      limit: 5,
      fileType: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
      investItemFormOption,
      categoryTreeData: [],
      deptTreeData: [],
      successLabel: "已完成任务设置",
      // editorOptions: editorOptions(),
      pickerOptions: {},
      routeLocation: { path: "/subject-task-task-mgt" },
      varEditor: null,
    };
  },
  beforeRouteLeave(to, from, next) {
    if (!this.$route.params.taskId) {
      if (this.taskInfoForm.name && !this.savTaskSuccess) {
        let msg = this.$route.params.taskDraftId
          ? "离开前是否保存对此草稿的更改？"
          : "离开前是否保存草稿？";
        this.$confirm(msg, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          closeOnClickModal: false,
          cancelButtonClass: "btn-custom-cancel",
          type: "warning",
        })
          .then(() => {
            this.saveAsDraft(next);
          })
          .catch(() => {
            next();
          });
      } else {
        next();
      }
    } else {
      next();
    }
  },
  created() {
    this.activeTab = 0;
    this.init();
    // window.addEventListener('scroll', this.onScroll)
  },
  mounted() {
    console.log(
      "this.$route.params.taskId",
      this.$route.params.taskId,
      !this.$route.params.taskId
    );
    if (!this.$route.params.taskId) {
      this.handleLoadTaskInfoStorage();
    }
  },
  activated() {
    this.activeTab = 0;
    this.$nextTick(() => {
      this.initEditor();
    });
  },
  methods: {
    saveAsDraft(next) {
      if(this.activeTab === 0) {
        // 富文本赋值
        const content = this.varEditor.txt.html();
        this.taskInfoForm.summary = content;
        // 联系人赋值
        this.taskInfoForm.contacterObj = this.contacterObj;
      }
      this.$refs.respondentCreator.checkValue('draft');
      this.loading = true;
      this.groupLeader = this.$refs.investigatorCreator.groupLeader;
      this.investigators = this.$refs.investigatorCreator.investigator;
      let respondent = Object.assign(
        [],
        this.$refs.respondentCreator.respondentIdentity
      );
      this.taskInfoForm.attachment = this.attachment;
      const dataForm = {
        respondentIds: respondent,
        start: moment().format("YYYY-MM-DD HH:mm:ss"),
        taskInfoForm: this.taskInfoForm,
        propSettingForm: this.propSettingForm,
        surveyFormsTree: this.toSurveyFormData,
        investigators: this.investigators,
        groupLeader: this.groupLeader,
      };
      const data = {
        id: this.$route.params.taskDraftId,
        taskName: this.taskInfoForm.name,
        jsonBody: JSON.stringify(dataForm),
        creator: this.$store.state.user.id,
        deptId: this.$store.state.user.deptId,
        type: 0, //0->主题任务
      };
      console.log(dataForm);
      saveTaskDraft(data).then((res) => {
        if (res.data.code === 0) {
          this.$message.success("任务草稿保存成功！");
          if (next) {
            next();
          }
        } else {
          this.$message.error(res.data.msg);
        }
        this.loading = false;
      });
    },
    deleteTaskDraft() {
      removeTaskDraft(this.$route.params.taskDraftId)
        .then((res) => {
          if (res.data.code === 0) {
            // this.$message.success("此条草稿已成功删除！")
          } else {
            // this.$message.error("此条草稿删除失败！" + res.data.msg)
          }
        })
        .catch(() => {
          this.$message.error("网络错误！");
        });
    },
    init() {
      localStorage.removeItem("task-management-form");
      // this.getDeptList();
      this.successLabel = "已完成任务设置";
      this.propSettingOption.column.forEach((item) => {
        item.disabled = false;
      });
      this.taskInfoOption.column.forEach((item) => {
        item.disabled = false;
      });
      this.investItemFormOption.column.forEach((item) => {
        item.disabled = false;
      });
      this.getSurveyFormTree();
      console.log("init params:", this.$route.params);

      if (this.$route.params.taskDraftId) {
        this.setTaskDraftValue();
      } else {
        // this.taskInfoForm.name =
        //   this.$store.state.user.realName +
        //   "任务" +
        //   moment().format("YYMMDDHHmm") +
        //   Math.ceil(Math.random() * 99);
        this.taskInfoForm.name = "";
      }
    },
    initEditor() {
      const cryptoOpen = this.$store.state.cryptoOpen;
      const key = this.$store.state.key;
      if (this.varEditor === null) {
        this.varEditor = new Editor("#editor");
        this.varEditor.config.height = 280;
        this.varEditor.config.zIndex = 10;
        this.varEditor.config.showFullScreen = false;
        this.varEditor.config.placeholder = "";
        this.varEditor.config.customUploadImg = function (
          resultFiles,
          insertImgFn
        ) {
          console.log(resultFiles);
          const url = window.SITE_CONFIG["uploadURL"] + "/single?type=task";
          let param = new FormData();
          param.append("file", resultFiles[0]);

          const config = {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: "Bearer " + Cookies.get("access_token"),
            },
          };
          axios.post(url, param, config).then((res) => {
            if (cryptoOpen) {
              let tmpData = sm4Utils.decrypt(res.data, key);
              res.data = JSON.parse(tmpData);
            }
            console.log(res);
            if (res.data.code === 0) {
              insertImgFn(res.data.data.url);
            } else {
              console.error(res.data.msg);
              this.$message.error("请检查上传文件！失败原因: " + res.data.msg);
            }
          });
        };
        this.varEditor.create();
      }

      if (!!this.taskInfoForm.summary) {
        this.varEditor.txt.html(this.taskInfoForm.summary);
      }
    },
    prev() {
      if (this.activeTab > 0) this.activeTab -= 1;
      this.$nextTick(() => {
        if (this.activeTab === 0) {
          this.initEditor();
        }
      });
    },
    next() {
      const options = option(this);
      const stepsLen = options.length;
      if (this.activeTab < stepsLen - 1) {
        this.activeTab += 1;
      }
    },
    handleRespondent() {
      this.$refs.respondentCreator.checkValue();
    },
    handleSubmitTaskInfo() {
      // 富文本赋值
      const content = this.varEditor.txt.html();
      this.taskInfoForm.summary = content;
      // 联系人赋值
      this.taskInfoForm.contacterObj = this.contacterObj;

      this.$refs["taskInfoForm"].validate((valid) => {
        if (valid) {
          this.taskInfoForm = Object.assign(this.formData, this.taskInfoForm)
          const { contacterObj, ...newTaskInfoForm } = this.taskInfoForm;
          let invalidPhoneCount = 0;
          contacterObj.dynamic.forEach((item) => {
            if (item.phone && !this.validateTel(item.phone)) {
              invalidPhoneCount += 1;
            }
          });
          if (invalidPhoneCount > 0) {
            this.$message.error("请输入正确的手机号码");
          } else {
            const data = {
              contacters: contacterObj.dynamic,
              ...newTaskInfoForm,
            };
            const propSettingData = { ...this.propSettingForm };
            this.taskManagementForm.taskInfoForm = data;
            this.taskManagementForm.propSettingForm = propSettingData;
            this.taskManagementForm.taskInfoForm.attachment = JSON.stringify(
              this.attachment
            );
            localStorage.setItem(
              "task-management-form",
              JSON.stringify(this.taskManagementForm)
            );
            if (this.varEditor !== null) {
              this.varEditor.destroy();
              this.varEditor = null;
            }
            this.next();
          }
        }
      });
    },
    // 关联调查表提交
    handleSubmitRelativeSurveyForm() {
      let data = {
        fromData: [],
        toData: [],
      };
      if (this.toSurveyFormData && this.toSurveyFormData.length > 0) {
        data.fromData = this.fromSurveyFormData;
        data.toData = this.toSurveyFormData;
        this.taskManagementForm.surveyForm = data;
        localStorage.setItem(
          "task-management-form",
          JSON.stringify(this.taskManagementForm)
        );
        console.log(
          "请关联调查表：",
          this.toSurveyFormData,
          this.fromSurveyFormData,
          data
        );
        this.next();
        return true;
      } else {
        this.$message("请关联调查表");
        return false;
      }
    },
    // 关联调查员并提交任务
    handleSubmitRelativeSurveyPerson() {
      this.loading = true;
      let data = {
        fromData: [],
        toData: [],
      };
      this.groupLeader = this.$refs.investigatorCreator.groupLeader;
      this.investigators = this.$refs.investigatorCreator.investigator;

      if (this.investigators.length > 0) {
        if (this.validatenull(this.groupLeader)) {
          this.loading = false;
          this.$message.info("请选择质控员！");
        } else {
          let respondent = Object.assign(
            [],
            this.$refs.respondentCreator.respondentIdentity
          );
          try {
            const { ...newTaskInfoForm } = {
              ...this.taskManagementForm.taskInfoForm,
            };
            const { ...newPropSettingForm } = { ...this.propSettingForm };
            const dataForm = {
              respondentIds: respondent,
              start: moment().format("YYYY-MM-DD HH:mm:ss"),
              ...newTaskInfoForm,
              ...newPropSettingForm,
              surveyFormsTree: this.toSurveyFormData,
              investigators: this.investigators,
              groupLeader: this.groupLeader,
            };
            // if (data.groupLeader) {
            if (dataForm.oid === undefined) {
              save(dataForm).then((res) => {
                if (res.data.code === 0) {
                  data.fromData = this.fromSurveyPersonData;
                  data.toData = this.toSurveyPersonData;
                  this.taskManagementForm.surveyPersonForm = data;
                  //localStorage.setItem('task-management-form',JSON.stringify(this.taskManagementForm));
                  this.resetLocalStorage();
                  this.loading = false;
                  if (this.$route.params.taskDraftId) {
                    this.deleteTaskDraft();
                  }
                  this.next();
                  this.savTaskSuccess = true;
                  this.stepVisible = false;
                  //删除可能存在的任务草稿
                  if (this.$route.params.taskDraftId) {
                    this.deleteTaskDraft();
                  }
                  this.$router.push({
                    path: `/subject-task-task-management/show/${res.data.data}/true`,
                  });
                } else {
                  this.$message.error(res.data.msg);
                  this.loading = false;
                  this.stepVisible = true;
                }
              });
            } else {
              const { oid, ...updateDataForm } = dataForm;
              update(oid, updateDataForm).then((res) => {
                if (res.data.code === 0) {
                  data.fromData = this.fromSurveyPersonData;
                  data.toData = this.toSurveyPersonData;
                  this.taskManagementForm.surveyPersonForm = data;
                  //localStorage.setItem('task-management-form',JSON.stringify(this.taskManagementForm));
                  this.resetLocalStorage();
                  this.next();
                  this.loading = false;
                  this.stepVisible = false;
                  this.$router.push({
                    path: `/subject-task-task-management/show/${oid}/true`,
                  });
                } else {
                  this.$message.error(res.data.msg);
                  this.loading = false;
                  this.stepVisible = false;
                }
              });
            }
            // } else {
            //
            // }
          } catch (err) {
            this.loading = false;
            this.$message.error(err.msg);
          }
        }
      } else {
        this.loading = false;
        this.$message.info("请关联调查员！");
      }
    },
    async handleStep(index) {
      console.log("handleStep:", index, this.activeTab);
      if (index > this.activeTab) {
        let tmp = this.activeTab;
        do {
          let err = await this.handleNextStep();
          //是否有错误提示
          if (err !== undefined && !err) {
            break;
          }
          tmp++;
        } while (index > tmp);
      } else {
        this.activeTab = index;
      }
      this.$nextTick(() => {
        if (this.activeTab === 0) {
          this.initEditor();
        }
      });
    },
    handleNextStep() {
      switch (this.activeTab) {
        case 0:
          return this.handleSubmitTaskInfo(this.taskInfoForm);
        case 1:
          return this.handleRespondent();
        case 2:
          return this.handleSubmitRelativeSurveyForm();
        case 3:
          return this.handleSubmitRelativeSurveyPerson();
        default:
          this.next();
          return true;
      }
    },
    toBack() {
      this.loading = false;
      this.$store.state.contentTabs = this.$store.state.contentTabs.filter(
        (item) =>
          item.name !== "subject-task-task-management" &&
          item.name !== "task-create" &&
          item.name !== "task-edit"
      );
      this.$nextTick(() => {
        this.$router.push({ path: "/subject-task-task-mgt" });
      });
    },
    resetSelectSurveryList() {
      this.leftCheckedSurveyForm = [];
    },
    resetSelectedSurveryList() {
      this.rightCheckedSurveyForm = [];
    },
    // 关联调查表 tree-transfer组件添加
    clearChecked(formName, type) {
      this.$refs[formName].clearChecked(type);
    },
    async getDetail(id) {
      let res = await getDetail(id);
      if (res.data.code === 0) {
        console.log("主题任务详细信息:", res.data.data);
        let data = res.data.data;
        if (data && JSON.stringify(data) !== "{}") {
          const {
            start,
            end,
            surveyFormsTree,
            surveyForms,
            investigators,
            minSample,
            autoStop,
            autoLocate,
            videoRequired,
            signRequired,
            groupLeader,
            respondentIds,
            contacters,
            ...taskInfoFormData
          } = { ...data };
          this.taskInfoForm.name = taskInfoFormData.name;
          this.taskInfoForm.chatName = taskInfoFormData.chatName;
          this.taskInfoForm.address = taskInfoFormData.address;
          this.taskInfoForm = taskInfoFormData;
          if (this.validatenull(this.taskInfoForm.address)) {
            console.log("set user regionId...");
            let rids = this.$store.state.user.regionIds;
            if (!this.validatenull(rids)) {
              this.taskInfoForm.address = { ids: rids.split(",") };
            }
          }
          this.respondentIds = respondentIds;
          this.taskInfoForm.dueDate = [start, end];
          this.taskInfoForm.contacterObj = { dynamic: contacters };
          this.contacterObj = { dynamic: contacters };
          this.taskInfoForm.relDeptId = taskInfoFormData.relDeptId;
          this.groupLeader = groupLeader;
          if (parseInt(minSample) > 0) this.isMinSample = true;
          this.propSettingForm = {
            minSample,
            autoStop,
            autoLocate,
            videoRequired,
            signRequired,
          };
          this.toSurveyFormData =
            surveyFormsTree !== null ? surveyFormsTree : [];
          this.investigators = investigators;
          this.$refs.investigatorCreator.loadData(
            this.investigators,
            this.groupLeader
          );
          this.attachment = JSON.parse(res.data.data.attachment);
          this.$refs.respondentCreator.loadData(this.respondentIds);
          if (!!this.taskInfoForm.summary) {
            this.varEditor.txt.html(this.taskInfoForm.summary);
          }
          this.formData = JSON.parse(JSON.stringify(this.taskInfoForm))
          this.setDefaultCheckedNode();
          this.$forceUpdate();
        }
      } else {
        console.error("err:", res.data.msg);
        this.$message.error("操作失败");
      }
    },
    setTaskDraftValue() {
      getTaskDraftById(this.$route.params.taskDraftId).then((res) => {
        console.log(JSON.parse(res.data.data.jsonBody), res.data.data);
        if (res.data.code === 0) {
          if (res.data.data.jsonBody !== "{}") {
            let data = JSON.parse(res.data.data.jsonBody);
            this.respondentIds = data.respondentIds;
            this.taskInfoForm = data.taskInfoForm;
            this.contacterObj = this.taskInfoForm.contacterObj
            this.groupLeader = data.groupLeader;
            this.propSettingForm = data.propSettingForm;
            this.toSurveyFormData =
              data.surveyFormsTree !== null ? data.surveyFormsTree : [];
            this.investigators = data.investigators;
            this.$refs.investigatorCreator.loadData(
              this.investigators,
              this.groupLeader
            );
            this.attachment =
              data.taskInfoForm.attachment === "" ||
              data.taskInfoForm.attachment === undefined ||
              data.taskInfoForm.attachment === null
                ? []
                : data.taskInfoForm.attachment;
            if (!!this.taskInfoForm.summary) {
              this.varEditor.txt.html(this.taskInfoForm.summary);
            }
            this.$refs.respondentCreator.loadData(this.respondentIds);
            this.setDefaultCheckedNode();
          }
        }
      });
    },
    //关联调查表：增加调查表
    addSurveyForm(fromData, toData) {
      this.fromSurveyFormData = fromData;
      this.toSurveyFormData = toData;
    },
    //关联调查表：移除已选择的调查表
    removeSurveyForm(fromData, toData) {
      this.fromSurveyFormData = fromData;
      this.toSurveyFormData = toData;
    },
    handleLoadTaskInfoStorage() {
      const storageData = JSON.parse(
        localStorage.getItem("task-management-form")
      );
      let dataLen = 0;
      if (storageData) dataLen = Object.keys(storageData).length;
      if (dataLen > 1) {
        this.taskInfoForm = storageData.taskInfoForm;
        this.propSettingForm = storageData.propSettingForm;
      }

      if (dataLen > 2) {
        const surveyFormStorage = storageData.surveyForm;
        this.fromSurveyFormData = surveyFormStorage.fromData;
        this.toSurveyFormData = surveyFormStorage.toData;
      }
    },
    resetLocalStorage() {
      localStorage.removeItem("task-management-form");
    },
    onFileChanged(fileList) {},
    rightCheckChange(nodeObj, treeObj) {
      console.log(nodeObj);
      console.log(treeObj);
    },
    validateTel(value) {
      return isMobile(value);
    },
    getDeptList() {
      getDeptTreeList().then((res) => {
        if (res.data.code === 0) {
          this.deptTreeData = res.data.data;
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    removeSelectedForm(formData) {
      let children = formData.children;
      if (!this.validatenull(children)) {
        if (children && children.length > 0) {
          for (let i = children.length - 1; i >= 0; i--) {
            let item = children[i];
            if (this.removeSelectedForm(item)) {
              console.log("***** remove ", item.name, " ", item.id, " ", i);
              children.splice(i, 1);
            }
          }
        }
      } else {
        if (this.toFormIds.includes(formData.id)) {
          return true;
        }
      }
      return false;
    },
    removeSelectedFormData(list) {
      if (list) {
        list.forEach((item, index) => {
          this.removeSelectedForm(item);
        });
      }
    },
    mapSelectedForm(formData) {
      if (!this.validatenull(formData.children)) {
        formData.children.forEach((item) => {
          this.mapSelectedForm(item);
        });
      } else {
        if (!this.validatenull(formData.formId)) {
          this.toFormIds.push(formData.formId);
        }
      }
    },
    mapToFormData(list) {
      if (list) {
        list.forEach((item) => {
          this.mapSelectedForm(item);
        });
      }
    },
    async getSurveyFormTree() {
      if (this.$route.params.taskId) {
        //编辑任务
        await this.getDetail(this.$route.params.taskId);
      }

      let res = await getSurveyFormTreeList();
      if (res.data.code === 0) {
        this.toFormIds = [];
        this.mapToFormData(this.toSurveyFormData);
        console.log("toFormIds:", this.toFormIds);

        let fromFormData = res.data.data;
        this.fromSurveyFormData = fromFormData;
        //左边表单树中不显示右边已经选择的表单
        this.removeSelectedFormData(this.fromSurveyFormData);
        console.log(
          "from:",
          this.fromSurveyFormData,
          " to:",
          this.toSurveyFormData
        );
        this.fromSurveyFormData.forEach((item) => {
          item.pid = 0;
        });
        this.setDefaultCheckedNode();
        this.handleData = [];
        this.handleData = JSON.parse(JSON.stringify(this.fromSurveyFormData));
        this.formList = this.$route.params.formList
          ? this.$route.params.formList.split(",")
          : [];
        if (this.$route.params.formList === "null") {
          this.formList = [];
        }
      } else {
        this.$message.error(res.data.msg);
      }
    },
    setDefaultCheckedNode() {
      let that = this;
      this.defaultCheckedNode = [];
      this.toSurveyFormData.forEach((item) => {
        function move(it) {
          if (!it.disabled) {
            that.defaultCheckedNode.push(it);
          }
          it.children.forEach((i) => {
            move(i);
          });
        }
        if (item.children.length > 0) {
          move(item);
        }
      });
      this.fromSurveyFormData.forEach((item, index) => {
        function move(it, ins) {
          it.children.forEach((i, ix) => {
            // console.log(JSON.stringify(that.defaultCheckedNode).includes(JSON.stringify(i)))
            if (
              JSON.stringify(that.defaultCheckedNode).includes(
                JSON.stringify(i)
              )
            ) {
              it.children.splice(i, 1);
            }
            move(i, ix);
          });
        }
        if (item.children.length > 0) {
          move(item, index);
        }
      });
      // console.log(this.fromSurveyFormData, this.toSurveyFormData, 'df', this.defaultCheckedNode)
    },
  },
  beforeDestroy() {
    if (this.varEditor !== null) {
      this.varEditor.destroy();
      this.varEditor = null;
    }
  },
};
</script>

<style lang="scss" scoped>
.back-button {
  padding: 10px;
  color: #00bfbf;
  cursor: pointer;
}
.delete-button-node {
  float: right;
  margin: 0 20px;
}
.steps-box {
  margin-top: 14px;
  text-align: center;
}
.step-content {
  padding: 6px 0;
}
.finished-block {
  text-align: center;
  .content {
    padding-top: 50px;
    padding-bottom: 150px;
    .sight-icon {
      margin-bottom: 14px;
      i {
        color: #67c23a;
        font-size: 48px;
      }
    }
    .sight-text {
      font-weight: bold;
      font-size: 18px;
    }
  }
}

:deep(.wl-transfer .transfer-title .el-checkbox) {
  display: none;
}

.tree-transfer-footer {
  margin-left: 15px;
  padding: 6px 8px;
  position: absolute;
  right: 15px;
}
.flex-box {
  height: 28px;
  line-height: 28px;
}
/*.flex {
    display: flex;
    flex-direction: row;
    align-items: center;
    .flex-item {
      margin-right: 5px;
    }
  }*/
.w120 {
  width: 200px !important;
}
.width340 {
  width: 340px;
}
.taskinfo-container {
  position: relative;
  /*.left-section {
      width: calc(100% - 350px);
    }*/
  .right-section {
    width: 330px;
    position: absolute;
    right: 10px;
    top: 50px;
  }
  .left-section,
  .right-section {
    display: inline-block;
  }
}
.text-p {
  margin-top: 10px;
  font-size: 14px;
}
</style>
