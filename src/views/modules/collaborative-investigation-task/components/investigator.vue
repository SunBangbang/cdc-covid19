<!-- 重要的调查员对象组件, 由AnyaParry开发.调查对象页面和创建任务时选择调查对象两个页面调用该组件.请尽量不要修改现有代码,尽可能增量更新.-->

<template>

  <div>

    <avue-crud
      @on-load="onLoad"
      @search-change="search"
      @size-change="sizeChange"
      @current-change="currentChange"
      @selection-change="selectionChange"
      :data="tableData"
      ref="crud"
      :option="dialogOption"
      :search.sync="searchData"
      :page.sync="page"
      v-model="form"
    >

    </avue-crud>

  </div>

</template>

<script>
import { investigatorDialogOption } from "@/views/modules/collaborative-investigation-task/js/options";
import { getDictLabel } from "@/utils";
import { pageInvestigator } from "@/api/assistant/assistant";

export default {
  name: "investigator",
  props: {
    menu: {
      type: Boolean,
      default: false //是否显示菜单
    },
    /**
     * 最外层必须是一个数组，数组中的元素可以是Object或者Long或者String或者Number
     */
    investigator: {
      default: () => {
        return [];
      }
    },
    taskId: {
      type: String
    }
  },
  data() {
    return {
      deptSelectedList: [],
      deptListTags: [],
      deptListData: [],
      deptIdList: [],
      rowData: {},
      selectionList: [],
      formData: {},
      disabled: false,
      dialogVisible: false,
      cancelCheck: [],
      tableData: [],
      dialogOption: investigatorDialogOption(this.investigator),
      searchData: {},
      page: {
        currentPage: 1,
        total: 0,
        pageSize: 10,
        pageSizes: [10, 20, 50, 100]
      },
      form: {}
    };
  },
  methods: {
    onLoad(done) {
      let searchData = Object.assign({}, this.searchData);
      searchData.deptId = searchData.deptId
        ? searchData.deptId
        : this.$store.state.user.deptId;
      pageInvestigator(
        this.taskId,
        this.page.currentPage,
        this.page.pageSize,
        searchData
      ).then(res => {
        if (res.data.code === 0) {
          this.tableData = res.data.data.list;
          this.page.total = res.data.data.total;
        }
        if (done && done.constructor !== Object) {
          done();
        }
      });
    },
    sizeChange(val) {
      this.page.pageSize = val;
      this.onLoad();
    },
    currentChange(val) {
      this.page.currentPage = val;
      this.onLoad();
    },
    search(from, done) {
      this.searchData = Object.assign({}, from);
      this.onLoad(done);
    },
    selectionChange(list) {
      this.selectionList = list;
    }
  }
};
</script>

<style scoped>
:deep(.el-form-item--mini > .el-form-item__content > .el-button--default) {
  margin-right: 5px;
}
</style>

