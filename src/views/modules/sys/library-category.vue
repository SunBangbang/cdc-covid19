<template>
    <el-card class="aui-card--fill">
        <avue-crud :option="option"
                   :data="data"
                   ref="crud"
                   :table-loading="loading"
                   v-model="form"
                   v-dialogdrag
                   :page.sync="page"
                   @on-load="onLoad"
                   @tree-load="treeLoad"
                   @row-save="rowSave"
                   @row-update="rowUpdate"
                   @refresh-change="refreshChange"
                   @search-change="searchChange"
                   @search-reset="searchReset"
                   @selection-change="selectionChange"
                   @current-change="currentChange"
                   @size-change="sizeChange">
            <template slot-scope="scope" slot="menuLeft">
                <el-button type="primary"
                           v-if="$hasPermission('library:category:save')"
                           size="small"
                           icon="el-icon-plus"
                           @click="add(scope.row)">新 增
                </el-button>
            </template>
            <template slot-scope="scope" slot="menu">
                <el-button type="text"
                           v-if="$hasPermission('library:category:edit')"
                           size="mini"
                           icon="el-icon-edit"
                           @click="edit(scope.row,scope.index)">编 辑
                </el-button>
                <el-button type="text"
                           v-if="$hasPermission('library:category:delete')"
                           size="mini"
                           icon="el-icon-delete"
                           @click="rowDel(scope.row)"
                           class="dangerBtn">删 除
                </el-button>
            </template>
        </avue-crud>
    </el-card>
</template>

<script>
import {getLibCategoryTreeList, remove, add, update} from '@/api/library-category/library-category'
import {getUserList} from '@/api/user/user'
export default {
  data() {
    return {
      form: {},
      selectionList: [],
      query: {},
      loading: false,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0
      },
      option: {
        index: true,
        border: true,
        indexLabel: '序号',
        lazy: true,
        addBtn: false,
        editBtn: false,
        delBtn: false,
        headerAlign: 'center',
        size: 'mini',
        column: [{
          label: '名称',
          prop: 'name',
          textAlign: 'center'
        }, {
          label: '上级名称',
          prop: 'parentId',
          type: 'tree',
          align: 'center',
          dicData: [],
          hide: true,
          props: {
            label: 'name',
            value: 'id'
          },
        }, {
          label: '英文名',
          prop: 'nameEn',
          align: 'center',
          hide: true
        }, {
          label: '别名',
          prop: 'alias',
          align: 'center',
          hide: true
        }, {
          label: 'ICD编码',
          prop: 'icdCode',
          align: 'center',
          hide: true
        }, {
          label: '关键字',
          prop: 'keyword',
          align: 'center',
          hide: true
        }, {
          label: '创建人',
          prop: 'creator',
          type: 'select',
          align: 'center',
          display: false,
          hide: true,
          props: {
            label: 'realName',
            value: 'id'
          },
          dicData: getUserList()
        }, {
          label: '创建时间',
          prop: 'createDate',
          align: 'center',
          display: false,
          hide: true
        }, {
          label: '最近修改',
          prop: 'updater',
          type: 'select',
          align: 'center',
          display: false,
          props: {
            label: 'realName',
            value: 'id'
          },
          dicData: getUserList()
        }, {
          label: '创建修改时间',
          prop: 'updateDate',
          align: 'center',
          display: false
        }, {
          label: '排序',
          prop: 'sort',
          type: 'number',
          align: 'center',
          minRows: 0,
          value: 0
        }]
      },
      data: []
    }
  },
  methods: {
    add(row) {
      this.$refs.crud.rowAdd(row)
    },
    edit(row,index) {
      this.$refs.crud.rowEdit(row,index)
    },
    searchChange(params, done) {
      this.query = params;
      // this.query.year = this.search.year;
      this.onLoad(this.page, params);
      done();
    },
    searchReset() {
      this.query = {};
      this.onLoad(this.page);
    },
    selectionChange(list) {
      this.selectionList = list;
    },
    selectionClear() {
      this.selectionList = [];
      this.$refs.crud.toggleSelection();
    },
    currentChange(currentPage){
      this.page.currentPage = currentPage;
    },
    sizeChange(pageSize){
      this.page.pageSize = pageSize;
    },
    refreshChange() {
      this.onLoad(this.page, this.query);
    },
    rowSave(row, loading, done) {
      add(row).then(() => {
        loading();
        this.onLoad(this.page);
        this.$message({
          type: "success",
          message: "操作成功!"
        })
      }, error => {
        done();
        console.log(error);
      })
    },
    rowUpdate(row, index, loading, done) {
      update(row).then(() => {
        loading();
        this.onLoad(this.page);
        this.$message({
          type: "success",
          message: "操作成功!"
        })
      }, error => {
        done();
        console.log(error);
      })
    },
    rowDel(row) {
      this.$confirm("确定将选择数据删除?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        cancelButtonClass: "btn-custom-cancel",
        type: "warning"
      }).then(() => {
        remove(row.id).then(res => {
          if(res.data.code === 0) {
            this.$message({
              type: "success",
              message: "操作成功!",
              onClose: () => {
                this.onLoad(this.page)
              }
            })
          } else {
              this.$message.error(res.data.msg)
          }
        })
      }).catch(() => {})
    },
    onLoad(page, params = {}) {
      this.loading = true;
      //获取整个列表数据
      getLibCategoryTreeList(this.parentId, Object.assign(params)).then(res => {
        this.data = res.data.data;
        // 获取上级名称的树形列表
        let parentId = this.findObject(this.option.column,'parentId')
        parentId.dicData = res.data.data
        this.loading = false;
      })
    },
    treeLoad(tree, treeNode, resolve) {
      const parentId = tree.id;
      getLibCategoryTreeList(parentId).then(res =>{
        resolve(res.data.data);
      })
    }
  }
}
</script>

<style scoped>

</style>
