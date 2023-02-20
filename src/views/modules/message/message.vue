<template>
  <el-card class="aui-card--fill">
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
      @search-reset="searchReset">
      <template slot="menuLeft">
        <el-button type="primary"
                   icon="el-icon-plus"
                   size="mini"
                   @click.stop="handleAdd()">新增</el-button>
      </template>

      <!-- 自定义操作栏 -->
      <template slot-scope="scope" slot="menu" class="menuClass">
        <template slot="type" slot-scope="scope">
          <el-tag size="mini" :type="scope.row.type === '1' ? '' : scope.row.type === '2' ? 'warning' : 'danger'">
            {{ scope.row.type === '1' ? "普通" : scope.row.type === '2' ? "重要" : "紧急" }}
          </el-tag>
        </template>

        <el-button type="text" @click="handleShow(scope.row)" size="mini">查看</el-button>
        <el-divider direction="vertical"></el-divider>
        <el-dropdown>
          <el-button type="text" size="mini" class="el-dropdown-link">更多</el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="handleEdit(scope.row)" v-if="scope.row.status !== '2'">
              <el-button type="text" size="mini" icon="el-icon-edit">编辑</el-button>
            </el-dropdown-item>
            <el-dropdown-item @click.native="rowDel(scope.row)">
              <el-button type="text" size="mini" icon="el-icon-delete">删除</el-button>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </avue-crud>
    <message-detail v-if="messageDetailVisable" ref="messageDetail" ></message-detail>
  </el-card>
</template>

<script>
  import {getPageList, remove} from '@/api/message/message'
  import {getDictDataList} from '@/utils'
  import AppConstant from '@/utils/AppConstant'
  import MessageDetail from './components/message-detail'
  import {getUserList} from '@/api/user/user'
  import {messageOption} from "@/views/modules/message/js/message-option";

  export default {
    components: {
      MessageDetail
    },
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
        messageStatusSend: AppConstant.MESSAGE_STATUS_SEND,
        messageDetailVisable: false,
        option: messageOption(),
        options:{
          index: true,
          indexLabel: '序号',
          menuPosition: "left",
          menuType: 'text',
          editBtn:false,
          addBtn: false,
          delBtn: false,
          viewBtn: false,
          searchBtnText: "查询",
          emptyBtnText: "重置",
          size: "mini",
          searchSize: "mini",
          searchMenuSpan: 10,
          headerAlign: 'center',
          align: 'center',
          labelWidth: 110,
        }
      }
    },
    activated() {
      this.onLoad(this.page, this.search);
    },
    methods: {
      onLoad(page = {currentPage: 1, pageSize: 10}, params = {}) {
        getPageList(page.currentPage, page.pageSize, params).then(res => {
          this.data = res.data.data.list
          this.page.total = res.data.data.total
        })
        let messageTypeProp = this.findObject(this.option.column, 'type')
        console.log('messageType',messageTypeProp)
        messageTypeProp.dicData = getDictDataList('message_type')
        console.log('messageData:', getDictDataList('message_type'))
        let messageStatusProp = this.findObject(this.option.column, 'status')
        messageStatusProp.dicData = getDictDataList('message_status'),
        this.loading = false
      },
      rowDel(row) {
        this.$confirm("确定将选择数据删除?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          cancelButtonClass: "btn-custom-cancel",
          type: "warning"
        }).then(() => {
          remove(row.id).then((res) => {
            if (res.data.code === 0) {
              this.$message.success('操作成功')
              this.onLoad(this.page, this.search);
            }else{
              console.error(res.data.msg)
              return this.$message.error(res.data.msg)
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
        this.$router.push({name: 'message-create'});
      },
      handleEdit(row) {
        this.$router.push({name: 'message-edit', params:{id: row.id}});
      },
      handleShow(row) {
        this.messageDetailVisable = true
        this.$nextTick(() => {
          this.$refs['messageDetail'].init(row.id,undefined)
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
