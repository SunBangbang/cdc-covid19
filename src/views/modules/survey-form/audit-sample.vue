<template>
  <el-row>
    <!-- <back-bar type="push" :location="from"></back-bar> -->
    <el-row>
      <el-col>
        <div>
          <i class="el-icon-arrow-left back-button" @click="goBack">返回</i>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xl="{ span: 5 }" :lg="{ span: 6 }" :md="{ span: 8 }" :sm="{ span: 8 }">
        <sample-list-audit-show :router-params="params" @callBack="callBack" @edit="edit" @audit="audit" @back="goBack"
          @switchAuditMode="handleSwitchAuditMode" v-if="autoRefresh">
        </sample-list-audit-show>
      </el-col>
      <el-col :xl="{ span: 19 }" :lg="{ span: 18 }" :md="{ span: 16 }" :sm="{ span: 16 }">
        <el-row>
          <sample-detail-header :params="params"></sample-detail-header>
        </el-row>
        <el-row v-if="
          !hadClicked &&
          (clickedSampleID === null || this.selectedIds.length <= 0)
        ">
          <empty-status-sample-audit></empty-status-sample-audit>
        </el-row>
        <el-row v-else-if="clickedSampleID !== null || this.selectedIds.length > 0" v-loading="loading">
          <!--调查填写样本 -->
          <sample-detail :survey-form-id="params.surveyFormId" :task-id="params.taskId" :app-id="params.appId"
            :rpid="params.rpid" v-if="!isAssitSample && visible" :type="type" :full="false" :selected-ids="selectedIds"
            :audit-data="auditData" @closeSampleDetail="closeSampleDetail" @reloadSampleListData="reloadSampleListData"
            :sample-id.sync="clickedSampleID">
          </sample-detail>

          <!--协查填写样本 -->
          <sample-scattered-detail v-if="isAssitSample && visible" ref="assistSampleRef" :full="false"
            :query.sync="assistSampleParams">
          </sample-scattered-detail>
        </el-row>
      </el-col>
    </el-row>
  </el-row>
</template>

<script>
import SampleListAuditShow from "./components/compareData/sample-list-audit-show";
import SampleDetailHeader from "@/views/modules/survey-form/components/compareData/sample-detail-header";
import BackBar from "@/components/back-bar/back-bar";
import SampleDetail from "@/views/modules/survey-form/components/compareData/sample-detail";
import EmptyStatusSampleAudit from "@/views/modules/survey-form/components/compareData/empty-status-sample-audit";
import SampleScatteredDetail from "@/views/modules/survey-form/components/compareData/sample-scattered-detail";
import AppConstant from "@/utils/AppConstant";
import { mapGetters } from "vuex";

export default {
  name: "audit-sample",
  components: {
    EmptyStatusSampleAudit,
    SampleDetail,
    BackBar,
    SampleDetailHeader,
    SampleListAuditShow,
    SampleScatteredDetail
  },
  data() {
    return {
      autoRefresh: false,
      params: {},
      hadClicked: false,
      clickedSampleID: null,
      type: "",
      selectedIds: [],
      //是否是协查填写样本
      isAssitSample: false,
      assistSampleParams: {},
      auditData: null,
      visible: false,
      loading: false,
      from: null
    };
  },
  beforeRouteEnter(to, from, next) {
    let params = JSON.stringify(to.params);
    if (params !== "{}") sessionStorage.setItem("routerParams", params);
    next(vm => {
      vm.from = from;
    });
  },
  created() {
    this.getRouterParams();
  },
  computed: {
    ...mapGetters(["getFormLoopEndFlag"]),
    computedFormLoopEnd() {
      return this.getFormLoopEndFlag;
    }
  },
  watch: {
    computedFormLoopEnd(newVal, oldVal) {
      if (this.loading && newVal) {
        this.loading = false;
      }
    }
  },
  methods: {
    goBack() {
      this.$router.back(-1)
    },
    // back() {
    //   //回到上个路由
    //   this.$router.push(this.from);
    // },
    callBack(obj) {
      this.loading = true;
      this.$store.commit("setFormLoopEndFlag", false);
      this.isAssitSample = obj.add === AppConstant.ASSIST_NAME;
      console.log("callback:", obj);
      console.log("isAssistSample:", this.isAssitSample);
      if (this.isAssitSample) {
        this.assistSampleParams.asid = obj.id;
      }
      this.hadClicked = true;
      this.type = "read";
      this.visible = false;
      this.clickedSampleID = obj.id;
      this.$nextTick(() => {
        this.visible = true;
        console.log("clickSampleId:", this.clickedSampleID);
        // this.completeLoading()
      });
    },
    audit(obj) {
      this.loading = true;
      this.$store.commit("setFormLoopEndFlag", false);
      this.auditData = obj;
      this.clickedSampleID = null;
      this.isAssitSample = false;
      this.selectedIds = obj.checkedIds;
      this.type = "audit";

      this.visible = false;
      this.$nextTick(() => {
        this.visible = true;
        this.hadClicked = true;
        console.log("start to audit sample");
        // this.completeLoading()
      });
    },
    handleSwitchAuditMode() {
      this.clickedSampleID = null;
      this.selectedIds = [];
      this.type = null;
      this.hadClicked = false;
    },
    closeSampleDetail() {
      this.handleSwitchAuditMode();
      this.autoRefresh = false;
      this.$nextTick(() => {
        this.autoRefresh = true;
      });
    },
    reloadSampleListData() {
      this.autoRefresh = false;
      this.$nextTick(() => {
        this.autoRefresh = true;
      });
    },
    edit(obj) {
      // console.log('to edit sample:', obj)
      this.loading = true;
      this.$store.commit("setFormLoopEndFlag", false);
      this.hadClicked = true;
      this.isAssitSample = obj.add === AppConstant.ASSIST_NAME;
      this.clickedSampleID = obj.id;
      this.visible = false;
      this.$nextTick(() => {
        this.type = "edit";
        this.visible = true;
        // this.completeLoading()
      });
    },
    getRouterParams() {
      this.loading = true;
      this.$store.commit("setFormLoopEndFlag", false);
      let params = JSON.stringify(this.$route.params);
      if (params === "{}") {
        this.params = JSON.parse(sessionStorage.getItem("routerParams"));
        this.autoRefresh = true;
      } else {
        this.params = this.$route.params;
        this.autoRefresh = true;
      }
      this.assistSampleParams.appId = this.params.appId;
      this.assistSampleParams.formId = this.params.surveyFormId;
      this.assistSampleParams.taskId = this.params.taskId;
      this.assistSampleParams.operType = "read";
      console.log("params..............:", this.params);
    },
    completeLoading() {
      setTimeout(() => {
        this.loading = false;
      }, 1500);
    }
  }
};
</script>

<style scoped>

.back-button {
  padding: 10px;
  color: #00bfbf;
  cursor: pointer;
}
</style>
