<template>
  <el-card shadow="never" class="aui-card--fill">
    <div class="mod-sys__params">
      <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()" size="mini">
        <el-form-item>
          <el-input v-model="dataForm.paramCode" placeholder="类型" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getDataList()" icon="el-icon-search">{{ $t('query') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            v-if="$hasPermission('sys:params:delete')"
            @click="clear()"
            icon="el-icon-delete">{{ $t('reset') }}</el-button>
        </el-form-item>
      </el-form>
      <el-form :inline="true" size="mini">
        <el-form-item>
          <el-button v-if="$hasPermission('sys:params:save')" type="primary" @click="addOrUpdateHandle()">{{ $t('add') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            v-if="$hasPermission('sys:params:delete')"
            @click="deleteHandle()"
            icon="el-icon-delete"
            type="danger">{{ $t('deleteBatch') }}</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="dataListLoading" :data="dataList" border @selection-change="dataListSelectionChangeHandle" size="mini">
        <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
        <el-table-column prop="paramCode" label="类型" header-align="center" align="center"></el-table-column>
        <el-table-column prop="paramValue" :label="$t('params.paramValue')" header-align="center" align="center"></el-table-column>
        <el-table-column prop="remark" :label="$t('params.remark')" header-align="center" align="center"></el-table-column>
        <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="150">
          <template slot-scope="scope">
            <el-button
              v-if="$hasPermission('sys:params:update')"
              type="text"
              size="mini"
              icon="el-icon-edit"
              @click="addOrUpdateHandle(scope.row.id)"
              >{{ $t('update') }}</el-button>
            <el-button
              v-if="$hasPermission('sys:params:delete')"
              type="text"
              size="mini"
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
    </div>
  </el-card>
</template>

<script>
import mixinViewModule from '@/mixins/view-module'
import AddOrUpdate from './params-add-or-update'
export default {
  mixins: [mixinViewModule],
  data () {
    return {
      mixinViewModuleOptions: {
        getDataListURL: '/sys/params/page',
        getDataListIsPage: true,
        deleteURL: '/sys/params',
        deleteIsBatch: true
      },
      dataForm: {
        paramCode: ''
      }
    }
  },
  components: {
    AddOrUpdate
  }
}
</script>
