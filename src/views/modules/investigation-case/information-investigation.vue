<template>

  <el-row
    :class="getClass"
    v-loading="systemParam.loading"
    :gutter="10"
    style="padding-left: 15px"
  >

    <el-col :span="6" v-if="typeIsNotMy" class="left-col global">

      <avue-tree
        :option="deptTree.option"
        :data="deptTree.data"
        @node-click="handleNodeClick"
      >

      </avue-tree>

    </el-col>

    <el-col :span="typeIsNotMy ? 18 : 24" class="global">

      <avue-crud
        :option="crud.option"
        :data="crud.data"
        :page.sync="page"
        :table-loading="loading"
        :search.sync="search"
        @on-load="onLoad"
        @search-change="searchChange"
        @size-change="sizeChange"
        @current-change="currentChange"
        @refresh-change="refreshChange"
      >

        <template slot-scope="scope" slot="menu" class="menuClass">

          <el-button
            type="text"
            @click="viewAuditSample(scope.row)"
            size="mini"
          >
            查看
          </el-button>

        </template>

      </avue-crud>

    </el-col>

  </el-row>

</template>

<script>
import { deptTreeOption } from "@/api/sys/dept";
import { investigationCaseOption } from "@/views/modules/investigation-case/js/caseOptions";
import { pagePatientAuditSample } from "@/api/subject-task/task-management";

export default {
  name: "information-investigation",
  props: {
    type: {
      type: String,
      default: () => {
        return "my";
      }
    }
  },
  computed: {
    getClass() {
      if (!this.otherSystemType.dept && this.type === "other") {
        return "display-body";
      } else {
        return "";
      }
    },
    typeIsNotMy() {
      return this.type !== "my";
    }
  },
  data() {
    return {
      systemParam: {
        loading: false
      },
      otherSystemType: {
        dept: null,
        selectDept: null
      },
      deptTree: {
        option: deptTreeOption({ deptId: this.$store.state.user.deptId }),
        data: []
      },
      loading: true,
      search: {},
      page: {
        //表格分页
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      crud: {
        option: investigationCaseOption(),
        data: []
      }
    };
  },
  methods: {
    searchWithDept() {
      this.otherSystemType.dept = this.otherSystemType.selectDept;
    },
    onLoad() {
      this.loading = true;
      pagePatientAuditSample(
        this.page.currentPage,
        this.page.pageSize,
        this.search
      ).then(res => {
        if (res.data.code === 0) {
          let data = res.data.data;
          this.crud.data = data.list;
          this.page.total = data.total;
        } else {
          console.error("err:", res.data.msg);
        }
        this.loading = false;
      });
    },
    handleNodeClick(e) {
      console.log("handleNodeClick.............", e);
      this.search.deptId = e.id;
      this.onLoad();
    },
    searchChange(params, done) {
      this.page.currentPage = 1;
      this.onLoad();
      done();
    },
    sizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val;
      this.onLoad();
    },
    currentChange(val) {
      this.page.currentPage = val;
      this.onLoad();
    },
    refreshChange() {
      this.onLoad();
    },
    viewAuditSample(row) {
      console.log("row:", row);
      if (!row || row === null) return;

      this.$store.state.contentTabs = this.$store.state.contentTabs.filter(
        item => item.name !== "questionnaire-detail"
      );
      this.$nextTick(() => {
        this.$router.push({
          name: "questionnaire-detail",
          params: {
            operation: "view",
            id: row.mergeSid,
            surveyFormId: row.formId
          }
        });
      });
    }
  }
};
</script>

<style scoped>
:deep(.el-scrollbar__wrap) {
  overflow: auto;
  height: 100%;
}
.global {
  height: calc(80vh - 35px);
  overflow-y: auto;
}
.left-col {
  border: 1px solid #ececec;
  border-radius: 5px;
  padding: 5px 5px;
}
:deep(.el-tree-node__label) {
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>

