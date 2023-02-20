<template>
  <el-card>
    <avue-crud
      ref="crud"
      :data="data"
      :option="option"
      v-model="formData"
      :table-loading="loading"
      @on-load="onLoad"
      :page.sync="page"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @refresh-change="refreshChange"
      :search.sync="search"
      @search-change="searchChange"
      @search-reset="searchReset"
      class="hide-search-label-container"
    >
      <template slot="menuLeft">
        <el-button type="primary"
                   v-if="$hasPermission('library:library:save')"
                   icon="el-icon-plus"
                   size="mini"
                   @click.stop="handleAdd()">新增</el-button>
      </template>
      <template slot-scope="scope" slot="menu" class="menuClass">
        <el-button type="text" @click="handleShow(scope.row)" size="mini">查看</el-button>
        <el-divider direction="vertical"></el-divider>
        <el-dropdown>
          <el-button type="text" size="mini" class="el-dropdown-link">更多</el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="handleEdit(scope.row)">
              <el-button type="text" size="mini" icon="el-icon-edit"  v-if="$hasPermission('library:library:edit')">编辑</el-button>
            </el-dropdown-item>
            <el-dropdown-item @click.native="handleRemove(scope.row)">
              <el-button type="text" size="mini" icon="el-icon-delete" class="dangerBtn" v-if="$hasPermission('library:library:delete')">删除</el-button>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </avue-crud>
  </el-card>
</template>

<script>
  import {getPageList, remove} from '@/api/library/library'
  import {getLibCategoryTreeNodes } from '@/api/library-category/library-category'
  import {getUserList} from '@/api/user/user'

  export default {
    data() {
      return {
        loading: true,
        data: [],
        formData: {},
        search: {},
        page: {
          currentPage: 1,
          pageSize: 10,
          total: 0,
          pageSizes: [10, 20, 50, 100]
        },
        option:{
          menuWidth: 200,
          indexLabel: '序号',
          emptyBtnText: "重置",
          size: "mini",
          border: true,
          index: true,
          addBtn: false,
          editBtn: false,
          delBtn: false,
          searchMenuSpan: 6,
          align:'center',
          menuAlign:'center',
          menuPosition: "left",
          column:[
            {
              label:'分类',
              prop:'libraryCategoryId',
              type: 'tree',
              dicData: [],
              props: {
                label: 'label',
                value: 'id'
              },
              search: true,
              searchPlaceholder: '分类',
              searchSpan: 4,
            },
            {
              label:'标题',
              prop:'title',
              search: true,
              overHidden: true,
              searchSpan: 4,
            },
            {
              label: '最近修改',
              prop: 'updateName',
              props: {
                label: 'realName',
                value: 'username'
              },
              dicData: getUserList()
            },
            {
              label: '创建/修改时间',
              prop: 'updateDate',
              type: 'date',
              format: 'yyyy-MM-dd HH:mm:ss',
              valueFormat: 'yyyy-MM-dd HH:mm:ss'
            }
          ]
        }
      }
    },
    methods: {
      onLoad(page = {currentPage: 1, pageSize: 10}, params = {}) {
        this.loading = true
        getPageList(page.currentPage, page.pageSize, params).then(res => {
          this.data = res.data.data.list
          this.page.total = res.data.data.total
        })
        this.loading = false

        getLibCategoryTreeNodes().then(res => {
          let libraryCategoryId = this.findObject(this.option.column,'libraryCategoryId')
          // console.log(res.data.data)
          libraryCategoryId.dicData = res.data.data
        })
      },
      handleRemove(row) {
        this.$confirm("确定将选择数据删除?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          cancelButtonClass: "btn-custom-cancel",
          type: "warning"
        }).then(() => {
          remove(row.id).then(res => {
            if (res.data.code == 0) {
              this.$message.success('删除成功')
              this.onLoad(this.page)
            }else{
              this.$message.error(res.data.msg, 5000)
            }
          })
        }).catch(() => {})
      },
      searchChange(params,done) {
        this.page.currentPage = 1
        this.onLoad(this.page, params)
        done()
      },
      searchReset() {
        this.search = {}
      },
      refreshChange() {
        this.onLoad(this.page, this.search)
      },
      handleAdd() {
        this.$router.push({name: 'library-create'});
      },
      handleEdit(row) {
        this.$store.state.contentTabs = this.$store.state.contentTabs.filter(item => item.name !== 'library-edit')
        this.$nextTick(() => {
          this.$router.push({name: 'library-edit', params:{id: row.id}});
        })
      },
      handleShow(row) {
        // 关闭查看标签页
        this.$store.state.contentTabs = this.$store.state.contentTabs.filter(item => item.name !== 'library-show')
        this.$nextTick(() => {
          this.$router.push({name: 'library-show', params:{id: row.id}});
        })
      },
      handleSizeChange(val) {
        this.page.pageSize = val
        this.page.currentPage = 1
        this.onLoad(this.page)
      },
      handleCurrentChange(val) {
        this.page.currentPage = val
        this.onLoad(this.page)
      }
    }
  }
</script>

<style scoped>

</style>

