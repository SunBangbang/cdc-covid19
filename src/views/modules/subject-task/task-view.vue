<template>
  <div>
    <el-row>
      <el-col>
        <div>
          <i class="el-icon-arrow-left back-button" @click="goBack">返回</i>
        </div>
      </el-col>
    </el-row>
    <el-card class="task-form aui-card--fill">
      <el-steps :active="activeTab" finish-status="success" simple>
        <el-step
          v-for="(item, index) in option"
          @click.native="handleNextStep(index)"
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
              <template slot="chatName">
                <p>{{ taskInfoForm.chatName }}</p>
              </template>
              <template slot="address">
                <div class="flex">
                  <p>
                    {{ taskInfoForm.address.name
                    }}{{ taskInfoForm.address.detailedAddress }}
                  </p>
                </div>
              </template>
              <template slot="contacterObj">
                <!-- <investigator-item v-model="taskInfoForm.contacterObj"></investigator-item> -->
                <div class="investItemForm">
                  <avue-form
                    ref="investItemForm"
                    :option="investItemFormOption"
                    v-model="taskInfoForm.contacterObj"
                  >
                    <template slot="phone" slot-scope="scope">
                      <el-input
                        :readonly="readonly"
                        :disabled="readonly"
                        placeholder="请输入联系方式"
                        v-model="scope.row.phone"
                        size="small"
                      ></el-input>
                    </template>
                  </avue-form>
                </div>
              </template>
              <template slot="summary">
                <p v-html="taskInfoForm.summary"></p>
              </template>
              <template slot="attachment">
                <el-form-item>
                  <multi-upload
                    :disabled="readonly"
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

        <div v-show="activeTab === 1">
          <div class="investItemForm">
            <respondent-creator
              ref="respondentCreator"
              :edit="false"
            ></respondent-creator>
          </div>
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
            :edit="false"
          ></investigator-creator>
        </div>
        <!-- 任务完成  -->
        <div class="finished-block" v-if="activeTab === option.length - 1">
          <div class="content">
            <div class="sight-icon"><i class="el-icon-success" /></div>
            <div class="sight-text">{{ successLabel }}</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>
<script>
import option from "./option/stepsOption";
import {
  taskInfoOption,
  propSettingOption,
  surveyFormOption,
  investItemFormOption,
} from "./option/formsOption";
import treeTransfer from "el-tree-transfer";
import { getDetail } from "@/api/subject-task/task-management";
import { getTaskSurveyFormTree as getSurveyFormTreeList } from "@/api/survey-form/questionnaire";
import MultiUpload from "@/components/upload/multiUpload";
import { isMobile } from "@/utils/validate";
import { getDeptTreeList } from "@/api/user/user";
import { setTimeout } from "timers";
import { editorOptions } from "../../../utils/editorOptions";
import respondentCreator from "@/views/modules/subject-task/respondentCreator";
import InvestigatorCreator from "@/views/modules/subject-task/investigatorCreator";

export default {
  name: "task-view",
  components: {
    InvestigatorCreator,
    treeTransfer,
    MultiUpload,
    respondentCreator,
  },
  data() {
    return {
      investigators: [],
      defaultCheckedNode: [],
      respondentIds: [],
      propTitle: "任务属性",
      loading: false,
      activeTab: 0,
      taskManagementForm: {},
      groupLeader: null,
      handleData: [],
      formList: [],
      option: option(this),
      taskInfoOption,
      propSettingOption,
      taskInfoForm: {
        contacterObj: {
          dynamic: [
            {
              name: "",
              phone: "",
            },
          ],
        },
        address: {},
      },
      propSettingForm: {
        minSample: 0,
        autoStop: false,
        autoLocate: false,
        videoRequired: false,
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
      readonly: true, //只读
      successLabel: "已完成任务设置",
      editorOptions,
      pickerOptions: {
        disabledDate(time) {
          // 当前时间的时间戳
          let curDate = new Date().getTime();
          // 能查看1天前的时间 单位是年 （当前是今天）
          let cutTime = 24 * 3600 * 1000;
          // 最小时间的时间戳
          let minTime = curDate - cutTime;
          return time.getTime() < minTime;
        },
      },
    };
  },
  created() {
    this.activeTab = 0;
    this.loading = false;
    console.log("route", this.$route.params.formList);
    this.init();
    window.addEventListener("scroll", this.onScroll);
  },
  mounted() {
    console.log(
      "this.$route.params.taskId",
      this.$route.params.taskId,
      !this.$route.params.taskId
    );
  },
  activated() {
    this.activeTab = 0;
    this.loading = false;
    // this.init();
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    init() {
      // this.getDeptList();
      this.readonly = true;
      this.propSettingOption.column.forEach((item) => {
        item.disabled = true;
      });
      this.taskInfoOption.column.forEach((item) => {
        item.disabled = true;
      });
      this.investItemFormOption.column.forEach((item) => {
        item.disabled = true;
      });
      this.successLabel = "到底了";
      this.getSurveryFormTree();
      if (this.$route.params.taskId) {
        this.getDetail(this.$route.params.taskId);
      }
    },
    //递归使得整个树的disabled为true
    setDisabled(list) {
      if (list && list.length > 0) {
        list.forEach((item) => {
          item.disabled = true;
          if (item.children && item.children.length > 0) {
            this.setDisabled(item.children);
          }
        });
      }
    },
    // 关联调查表提交
    handleNextStep(index) {
      this.activeTab = index;
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
    getDetail(id) {
      getDetail(id).then((res) => {
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
            console.log(groupLeader);
            this.groupLeader = groupLeader;
            this.investigators = investigators;
            this.$forceUpdate();
            this.taskInfoForm.contacterObj = { dynamic: data.contacters };
            this.taskInfoForm.relDeptId = taskInfoFormData.relDeptId;
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
            if (this.readonly) {
              this.setDisabled(this.toSurveyFormData);
            }
            this.attachment = JSON.parse(res.data.data.attachment);
            // console.log("???:",this.taskInfoForm.relDeptId,this.toSurveyFormData)
            this.$refs.respondentCreator.loadData(this.respondentIds);
            this.$refs.investigatorCreator.loadData(
              this.investigators,
              this.groupLeader
            );
            this.setDefaultCheckedNode();
          }
        } else {
          this.$message.error("操作失败");
        }
      });
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
    handleChangeTaskCategory(obj) {
      // console.log('change task category:', obj, ' ', obj.value)
      if (obj) {
        this.taskInfoForm.categoryName = obj.name;
      }
    },
    handleChangeTaskDept(obj) {
      // console.log('handleChangeTaskDept:', obj, ' ',  obj.value)
      if (obj) {
        this.taskInfoForm.relDeptName = obj.label;
        this.taskInfoForm.relDeptId = obj.value;
        this.getInvestigatorsByDeptId(this.taskInfoForm.relDeptId);
      }
    },
    onScroll() {
      let rectObj = document
        .getElementById("taskInfoContainer")
        .getBoundingClientRect();
      let fixedObj = document.getElementById("propSettingContainer");
      if (
        this.activeTab === 0 &&
        fixedObj !== null &&
        fixedObj.style !== null
      ) {
        if (rectObj.top < 90) {
          if (fixedObj.style.position !== "fixed") {
            fixedObj.style.position = "fixed";
            fixedObj.style.top = "100px";
            fixedObj.style.right = "35px";
          }
        } else {
          fixedObj.style.position = "";
          fixedObj.style.top = "";
          fixedObj.style.right = "";
        }
      }
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
      if (formData.children && formData.children.length > 0) {
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
    getSurveryFormTree() {
      getSurveyFormTreeList().then((res) => {
        if (res.data.code === 0) {
          this.toFormIds = [];
          this.mapToFormData(this.toSurveyFormData);
          console.log("toFormIds:", this.toFormIds);

          let fromFormData = res.data.data;
          this.removeSelectedFormData(fromFormData);
          this.fromSurveyFormData = fromFormData;
          console.log(
            "from:",
            this.fromSurveyFormData,
            " to:",
            this.toSurveyFormData
          );
          this.fromSurveyFormData.forEach((item) => {
            item.pid = 0;
          });
          if (this.readonly) {
            this.setDisabled(this.fromSurveyFormData);
          }
          this.setDefaultCheckedNode();
          this.handleData = [];
          this.handleData = JSON.parse(JSON.stringify(this.fromSurveyFormData));
          this.formList = this.$route.params.formList
            ? this.$route.params.formList.split(",")
            : [];
          if (this.$route.params.formList === "null") {
            this.formList = [];
          }
          // this.handleSurveyFormData(this.handleData)
          // this.toSurveyFormData = this.handleData
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    setDefaultCheckedNode() {
      let that = this;
      this.defaultCheckedNode = [];
      this.toSurveyFormData.forEach((item) => {
        function move(it) {
          that.defaultCheckedNode.push(it);
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
      console.log(
        this.fromSurveyFormData,
        this.toSurveyFormData,
        "df",
        this.defaultCheckedNode
      );
    },
    // 调查表lazyFunction
    lazyLoadSurveyFormNode(node, resolve, from) {
      //
    },
    loadNode(node, resolve) {
      if (node.level === 0) {
        return resolve([{ name: "region" }]);
      }
      if (node.level > 1) return resolve([]);

      setTimeout(() => {
        const data = [
          {
            name: "leaf",
            leaf: true,
          },
          {
            name: "zone",
          },
        ];

        resolve(data);
      }, 500);
    },
  },
};
</script>
<style lang="scss" scoped>
.back-button {
  padding: 10px;
  color: #00bfbf;
  cursor: pointer;
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
.flex {
  display: flex;
  flex-direction: row;
  align-items: center;
  .flex-item {
    margin-right: 5px;
  }
}
.w120 {
  width: 200px !important;
}
.width340 {
  width: 340px;
}
.taskinfo-container {
  position: relative;
  .left-section {
    width: calc(100% - 350px);
  }
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
</style>
<style scoped>
:deep(.el-checkbox__inner) {
  display: none;
  pointer-events: none;
  user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
<style lang="scss">
/*scope中不生效，故放全局中*/
.text-p {
  margin: 10px 0;
  font-size: 14px;
}
</style>
