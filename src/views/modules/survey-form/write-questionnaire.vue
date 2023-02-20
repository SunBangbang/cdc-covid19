<template>
  <el-row v-loading="loading">
    <back-bar></back-bar>
    <sample-detail
      :survey-form-id="params.surveyFormId"
      v-if="!refresh"
      :task-id="params.taskId"
      @reloadForm="reloadForm"
      type="write"
      :form-change-allow="true"
      :full="true"
    >
    </sample-detail>
  </el-row>
</template>

<script>
import SampleDetail from "@/views/modules/survey-form/components/compareData/sample-detail";
import BackBar from "@/components/back-bar/back-bar";
import { mapGetters } from "vuex";

export default {
  name: "write-questionnaire",
  components: { BackBar, SampleDetail },
  beforeRouteEnter(to, from, next) {
    let params = JSON.stringify(to.params);
    if (params !== "{}") localStorage.setItem("routerParams", params);
    next();
  },
  data() {
    return {
      params: {},
      refresh: false,
      loading: false,
    };
  },
  created() {
    this.getRouterParams();
  },
  computed: {
    ...mapGetters(["getFormLoopEndFlag"]),
    computedFormLoopEnd() {
      return this.getFormLoopEndFlag;
    },
  },
  watch: {
    computedFormLoopEnd(newVal, oldVal) {
      if (this.loading && newVal) {
        this.loading = false;
      }
    },
  },
  methods: {
    getRouterParams() {
      this.loading = true;
      this.$store.commit("setFormLoopEndFlag", false);
      let params = JSON.stringify(this.$route.params);
      if (params === "{}") {
        this.params = JSON.parse(localStorage.getItem("routerParams"));
      } else {
        this.params = this.$route.params;
      }
    },
    reloadForm(formId) {
      this.loading = true;
      this.$store.commit("setFormLoopEndFlag", false);
      if (formId !== this.params.surveyFormId) {
        this.params.surveyFormId = formId;
        localStorage.setItem("routerParams", JSON.stringify(this.params)); //即使刷新后，也应该应用到表单的更改
        this.refresh = true;
        this.$nextTick(() => {
          this.refresh = false;
        });
      }
    },
  },
};
</script>

<style scoped></style>
