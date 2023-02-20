<template>
  <el-row>
    <avue-crud
      ref="crud"
      :option="option"
      :data="data"
      :page.sync="page"
      @tree-load="treeLoad"
      :table-loading="loading"
      :search.sync="search"
      @search-change="searchChange"
      @search-reset="searchReset"
      @size-change="sizeChange"
      @current-change="currentChange"
      @refresh-change="refreshChange"
      @on-load="onLoad"
      @selection-change="selectionChange"
    >
      <template slot="index" slot-scope="{ row, index }">
        <span>{{ row.indexNo }}</span>
      </template>

      <template slot="reqDateSearch" slot-scope="scope">
        <el-date-picker
          v-model="reqDate"
          type="datetimerange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="yyyy-MM-dd HH:mm"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00']"
        >
        </el-date-picker>
      </template>

      <template slot="menuLeft">
        <el-button v-if="$store.state.user.superAdmin === 1" type="danger" size="mini" icon="el-icon-delete" @click="toBatchDel">删除</el-button>
      </template>

      <template slot="accept" slot-scope="scope">
        <el-tag
          size="small"
          :type="getTypeOfStatus(scope.row.accept)"
          v-if="!scope.row.hasChildren"
        >
          {{ formatStatus(scope.row.accept) }}
        </el-tag>
      </template>

      <template slot-scope="scope" slot="menu" class="menuClass">
        <el-button
          type="text"
          @click="toView(scope.row)"
          size="mini"
          v-if="scope.row.hasChildren"
          >查看</el-button
        >
        <span v-if="scope.row.hasChildren && scope.row.isMyTask">
          <el-divider direction="vertical"></el-divider>
          <el-button
            type="text"
            v-if="scope.row.forumId === null"
            @click="toViewForum(scope.row)"
            size="mini"
            >创建论坛</el-button
          >
          <el-button
            type="text"
            v-if="scope.row.forumId && scope.row.forumType === 0"
            @click="toViewForum(scope.row)"
            size="mini"
            >草稿</el-button
          >
          <el-button
            type="text"
            v-if="scope.row.forumId && scope.row.forumType === 1"
            @click="toViewForum(scope.row)"
            size="mini"
            >查看论坛</el-button
          >
          <el-divider direction="vertical"></el-divider>
          <el-button type="text" @click="toDel(scope.row)" size="mini"
            >删除</el-button
          >
        </span>
      </template>
    </avue-crud>
  </el-row>
</template>

<script>
import { investigationReleaseOption } from "../js/options";
import {
  pageAssistReq,
  pageAssistTask,
  deleteAssist,
  batchDelete
} from "@/api/assistant/assistant";
import { getDictDataList } from "@/utils";

export default {
  name: "investigation-release",
  data() {
    return {
      reqDate: null,
      data: [],
      search: {},
      option: investigationReleaseOption(),
      loading: true,
      page: {
        //表格分页
        pageSize: 10,
        currentPage: 1,
        total: 0,
        pageSizes: [10, 20, 50, 100]
      },
      statusDict: getDictDataList("assist-task-accept-status"),
      typeStatus: { 0: "info", 1: "dark", 2: "danger" },
      selectionList: [],
    };
  },
  methods: {
    getTypeOfStatus(status) {
      return this.typeStatus[status] ? this.typeStatus[status] : "";
    },
    formatStatus(val) {
      let label = val;
      if (this.statusDict) {
        this.statusDict.some(item => {
          if (item.dictValue == val) {
            label = item.dictLabel;
            return true;
          }
        });
      }
      return label;
    },
    onLoad() {
      this.loading = true;
      if (this.validatenull(this.reqDate)) {
        this.search.start = null;
        this.search.end = null;
      } else {
        this.search.start = this.reqDate[0];
        this.search.end = this.reqDate[1];
      }
      pageAssistReq(
        this.page.currentPage,
        this.page.pageSize,
        this.search
      ).then(res => {
        let d = res.data;
        if (d.code === 0) {
          d.data.list.forEach((item, index) => {
            item.deptName = null;
            item.receiverName = null;
            item.hasChildren = true;
            item.isMyTask = item.creator === this.$store.state.user.id;
            item.indexNo = index + 1;
          });
          this.data = d.data.list;
          this.page.total = d.data.total;
        } else {
          console.error("err:", d.msg);
        }
        this.loading = false;
      });
    },
    searchReset() {
      this.reqDate = null;
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
    selectionChange(list) {
      this.selectionList = list;
    },
    toBatchDel() {
      if(this.selectionList.length < 1) {
        this.$message.warning('请先选择需要删除的数据')
        return
      }
      this.$confirm("确定将选择数据删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      })
        .then(() => {
          batchDelete(this.selectionList.map(s => s.id)).then(res => {
            if(res.data.code === 0) {
              this.$message.success('操作成功');
              this.selectionList = [];
              this.$refs.crud.toggleSelection();
              this.onLoad();
            } else {
              this.$message.error({ message: res.data.msg, duration: 10000 });
            }
          })
      }).catch(() => {});
    },
    toView(row) {
      console.log("toView:", row);
      // this.$router.push({name: 'task-show', params: {taskId: row.oid, show: true}})
      this.$router.push({
        name: "application-investigation-task-creator",
        params: {
          // formId: row.formId,
          disabled: true,
          // sampleId: row.sampleId,
          assistAppId: row.id
        }
      });
    },
    // 协查论坛
    toViewForum(row) {
      // console.log('toForum:', row)
      let forumId = row.forumId;
      if (this.validatenull(forumId)) {
        this.$router.push({
          path: `/research-forum/create/${row.id}/${row.sampleId}`,
          query: { source: "inves" }
        });
      } else {
        if (row.forumType === 0) {
          this.$router.push({
            path: `/research-forum/edit/${forumId}`,
            query: { source: "inves" }
          });
        } else {
          this.$router.push({
            path: `/research-forum/detail/${forumId}`,
            query: { source: "inves" }
          });
        }
      }
    },
    toDel(row) {
      // console.log('toDel:', row)
      this.$confirm("确定将选择数据删除?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      })
        .then(() => {
          deleteAssist(row.id).then(res => {
            if (res.data.code == 0) {
              let number = res.data.data;
              if (number === 0) {
                this.refreshChange();
              } else {
                this.$message.warning("已经分配流调员，不能删除协查!");
              }
            } else {
              console.log("del error msg:", res.data.msg);
              this.$message.error({ message: res.data.msg, duration: 10000 });
            }
          });
        })
        .catch(() => {
          console.log("取消");
        });
    },
    treeLoad(tree, treeNode, resolve) {
      pageAssistTask(0, 1000, { appId: tree.id }).then(res => {
        let d = res.data;
        if (d.code === 0) {
          d.data.list.forEach((item, index) => {
            item.id = item.id;
            item.name = null;
            item.hasChildren = false;
            item.indexNo = tree.indexNo + "." + String(index + 1);
          });
          resolve(d.data.list);
        } else {
          console.error("err:", d.msg);
        }
        this.loading = false;
      });
    },
    toAudit(row) {
      console.log("toAudit: ", row);

      this.$router.push({
        name: "audit-sample",
        params: {
          surveyFormId: row.formId,
          identity: row.identity,
          taskId: row.taskId,
          matchID: true,
          participant: row,
          groupLeader: null,
          reported: false,
          canAudit: true,
          appId: null
        }
      });
    }
  }
};
</script>

<style scoped>
:deep(.el-form-item--mini > .el-form-item__content > .el-button--default) {
  margin-right: 5px;
}
</style>
