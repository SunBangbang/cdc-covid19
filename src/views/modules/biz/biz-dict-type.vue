<template>
  <el-card shadow="never" class="aui-card--fill">
    <div class="mod-sys__dict">
      <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()" size="mini">
        <el-form-item>
          <el-input v-model="dataForm.dictName" :placeholder="$t('dict.dictName')" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="dataForm.dictType" :placeholder="$t('dict.dictType')" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" v-if="$hasPermission('biz:dict:page')" @click="getDataList()">{{ $t('query') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-delete" @click="clear()">{{ $t('reset') }}</el-button>
        </el-form-item>
      </el-form>
      <el-form :inline="true" size="mini">
        <el-form-item>
          <el-button
            v-if="$hasPermission('biz:dict:save')"
            icon="el-icon-plus"
            type="primary" @click="addOrUpdateHandle()">{{ $t('add') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button
                  v-if="$hasPermission('biz:dict:save')"
                  icon="el-icon-plus"
                  type="primary" @click="addOrUpdateTemplateHandle()">新增类型和数据</el-button>
        </el-form-item>
        <el-form-item
          v-if="$hasPermission('biz:dict:delete')">
          <el-button
            icon="el-icon-delete"
            type="danger"
            @click="deleteHandle()">{{ $t('deleteBatch') }}</el-button>
        </el-form-item>
      </el-form>
      <el-table
        v-loading="dataListLoading"
        :data="dataList"
        border
        @selection-change="dataListSelectionChangeHandle"
        @sort-change="dataListSortChangeHandle"
        size="mini">
        <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
        <el-table-column prop="dictName" :label="$t('dict.dictName')" header-align="center" align="center"></el-table-column>
        <el-table-column prop="dictType" :label="$t('dict.dictType')" header-align="center" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="childHandle(scope.row)">{{ scope.row.dictType }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="sort" :label="$t('dict.sort')" sortable="custom" header-align="center" align="center"></el-table-column>
        <el-table-column prop="remark" :label="$t('dict.remark')" header-align="center" align="center"></el-table-column>
        <el-table-column prop="createDate" :label="$t('dict.createDate')" sortable="custom" header-align="center" align="center" width="180"></el-table-column>
        <el-table-column  :label="$t('handle')" fixed="right" header-align="center" align="center" width="150">
          <template slot-scope="scope">
            <el-button
              v-if="$hasPermission('biz:dict:update')"
              type="text"
              size="mini"
              icon="el-icon-edit"
              @click="addOrUpdateHandle(scope.row.id)">{{ $t('update') }}</el-button>
            <el-button
              v-if="$hasPermission('biz:dict:delete')"
              type="text"
              size="mini"
              icon="el-icon-delete"
              @click="deleteHandle(scope.row.id)"
              class="dangerBtn">{{ $t('delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="limit"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="pageSizeChangeHandle"
        @current-change="pageCurrentChangeHandle">
      </el-pagination>
      <!-- 弹窗, 新增 / 修改 -->
      <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
      <add-template v-if="addOrUpdateTemplateVisible" ref="addOrUpdateTemplate" @refreshDataList="getDataList"></add-template>
    </div>
  </el-card>
</template>

<script>
import mixinViewModule from '@/mixins/view-module'
import AddOrUpdate from './biz-dict-type-add-or-update'
import AddTemplate from './biz-dict-template-add'
import { addDynamicRoute } from '@/router'
export default {
  mixins: [mixinViewModule],
  data () {
    return {
      mixinViewModuleOptions: {
        getDataListURL: '/biz/dict/type/page',
        getDataListIsPage: true,
        deleteURL: '/biz/dict/type',
        deleteIsBatch: true
      },
      dataForm: {
        id: '0',
        dictName: '',
        dictType: '',
        dictData: ''
      },
      addOrUpdateTemplateVisible: false
    }
  },
  components: {
    AddOrUpdate, AddTemplate
  },
  methods: {
    // 子级
    childHandle (row) {
      // 路由参数
      const routeParams = {
        routeName: `${this.$route.name}__${row.id}`,
        title: `${this.$route.meta.title} - ${row.dictType}`,
        path: 'biz/biz-dict-data',
        params: {
          dictTypeId: row.id
        }
      }
      // 动态路由
      addDynamicRoute(routeParams, this.$router)
    },
    // 新增 / 修改
    addOrUpdateTemplateHandle(id) {
      this.addOrUpdateTemplateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdateTemplate.dataForm.id = id
        this.$refs.addOrUpdateTemplate.init()
      })
    },
  }
}
</script>
