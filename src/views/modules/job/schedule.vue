<template>
  <el-card shadow="never" class="aui-card--fill">
    <div class="mod-job__schedule">
      <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()" size="mini">
        <el-form-item>
          <el-input v-model="dataForm.beanName" :placeholder="$t('schedule.beanName')" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="getDataList()">{{ $t('query') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            icon="el-icon-delete"
            @click="clear()">{{ $t('reset') }}</el-button>
        </el-form-item>
      </el-form>
      <el-form :inline="true" size="mini">
        <el-form-item>
          <el-button 
            v-if="$hasPermission('sys:schedule:save')" 
            type="primary"
            icon="el-icon-plus"
            @click="addOrUpdateHandle()">{{ $t('add') }}</el-button>
        </el-form-item>
       <el-form-item>
          <el-button 
            v-if="$hasPermission('sys:schedule:delete')" 
            type="danger" 
            icon="el-icon-delete"
            @click="deleteHandle()">{{ $t('deleteBatch') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button 
            v-if="$hasPermission('sys:schedule:pause')" 
            type="danger"
            icon="el-icon-video-pause" 
            @click="pauseHandle()">{{ $t('schedule.pauseBatch') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button 
            v-if="$hasPermission('sys:schedule:resume')" 
            type="danger" 
            @click="resumeHandle()"
            icon="el-icon-refresh">{{ $t('schedule.resumeBatch') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button 
            v-if="$hasPermission('sys:schedule:run')" 
            type="danger" 
            @click="runHandle()"
            icon="el-icon-video-play">{{ $t('schedule.runBatch') }}</el-button>
        </el-form-item>
        <el-form-item>
          <el-button 
            v-if="$hasPermission('sys:schedule:log')" 
            type="success" 
            @click="logHandle()"
            icon="el-icon-notebook-2">{{ $t('schedule.log') }}</el-button>
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
        <el-table-column prop="beanName" :label="$t('schedule.beanName')" header-align="center" align="center"></el-table-column>
        <el-table-column prop="params" :label="$t('schedule.params')" header-align="center" align="center"></el-table-column>
        <el-table-column prop="cronExpression" :label="$t('schedule.cronExpression')" header-align="center" align="center"  :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="remark" :label="$t('schedule.remark')" header-align="center" align="center"></el-table-column>
        <el-table-column prop="status" :label="$t('schedule.status')" sortable="custom" header-align="center" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 1" size="mini">{{ $t('schedule.status1') }}</el-tag>
            <el-tag v-else size="mini" type="danger">{{ $t('schedule.status0') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('handle')" fixed="right" header-align="center" align="center" width="300">
          <template slot-scope="scope">
            <el-button 
              v-if="$hasPermission('sys:schedule:update')" 
              type="text" 
              size="mini" 
              @click="addOrUpdateHandle(scope.row.id)"
              icon="el-icon-edit">{{ $t('update') }}</el-button>
            <el-button 
              v-if="$hasPermission('sys:schedule:pause')" 
              type="text" 
              size="mini" 
              @click="pauseHandle(scope.row.id)"
              icon="el-icon-video-pause">{{ $t('schedule.pause') }}</el-button>
            <el-button 
              v-if="$hasPermission('sys:schedule:resume')" 
              type="text" 
              size="mini" 
              @click="resumeHandle(scope.row.id)"
              con="el-icon-refresh">{{ $t('schedule.resume') }}</el-button>
            <el-button 
              v-if="$hasPermission('sys:schedule:run')" 
              type="text" 
              size="mini" 
              @click="runHandle(scope.row.id)"
              icon="el-icon-video-play">{{ $t('schedule.run') }}</el-button>
            <el-button 
              v-if="$hasPermission('sys:schedule:delete')" 
              type="text" 
              size="mini" 
              @click="deleteHandle(scope.row.id)"
              icon="el-icon-delete"
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
      <!-- 弹窗, 日志列表 -->
      <log v-if="logVisible" ref="log"></log>
    </div>
  </el-card>
</template>

<script>
import mixinViewModule from '@/mixins/view-module'
import AddOrUpdate from './schedule-add-or-update'
import Log from './schedule-log'
export default {
  mixins: [mixinViewModule],
  data () {
    return {
      mixinViewModuleOptions: {
        getDataListURL: '/sys/schedule/page',
        getDataListIsPage: true,
        deleteURL: '/sys/schedule',
        deleteIsBatch: true
      },
      dataForm: {
        beanName: ''
      },
      logVisible: false
    }
  },
  components: {
    AddOrUpdate,
    Log
  },
  methods: {
    // 暂停
    pauseHandle (id) {
      if (!id && this.dataListSelections.length <= 0) {
        return this.$message({
          message: this.$t('prompt.deleteBatch'),
          type: 'warning',
          duration: 500
        })
      }
      this.$confirm(this.$t('prompt.info', { 'handle': this.$t('schedule.pause') }), this.$t('prompt.title'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        cancelButtonClass: "btn-custom-cancel",
        type: 'warning'
      }).then(() => {
        this.$http.put('/sys/schedule/pause', id ? [id] : this.dataListSelections.map(item => item.id)).then(({ data: res }) => {
          if (res.code !== 0) {
            return this.$message.error(res.msg)
          }
          this.$message({
            message: this.$t('prompt.success'),
            type: 'success',
            duration: 500,
            onClose: () => {
              this.getDataList()
            }
          })
        }).catch(() => {})
      }).catch(() => {})
    },
    // 恢复
    resumeHandle (id) {
      if (!id && this.dataListSelections.length <= 0) {
        return this.$message({
          message: this.$t('prompt.deleteBatch'),
          type: 'warning',
          duration: 500
        })
      }
      this.$confirm(this.$t('prompt.info', { 'handle': this.$t('schedule.resume') }), this.$t('prompt.title'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        cancelButtonClass: "btn-custom-cancel",
        type: 'warning'
      }).then(() => {
        this.$http.put('/sys/schedule/resume', id ? [id] : this.dataListSelections.map(item => item.id)).then(({ data: res }) => {
          if (res.code !== 0) {
            return this.$message.error(res.msg)
          }
          this.$message({
            message: this.$t('prompt.success'),
            type: 'success',
            duration: 500,
            onClose: () => {
              this.getDataList()
            }
          })
        }).catch(() => {})
      }).catch(() => {})
    },
    // 执行
    runHandle (id) {
      if (!id && this.dataListSelections.length <= 0) {
        return this.$message({
          message: this.$t('prompt.deleteBatch'),
          type: 'warning',
          duration: 500
        })
      }
      this.$confirm(this.$t('prompt.info', { 'handle': this.$t('schedule.run') }), this.$t('prompt.title'), {
        confirmButtonText: this.$t('confirm'),
        cancelButtonText: this.$t('cancel'),
        cancelButtonClass: "btn-custom-cancel",
        type: 'warning'
      }).then(() => {
        this.$http.put('/sys/schedule/run', id ? [id] : this.dataListSelections.map(item => item.id)).then(({ data: res }) => {
          if (res.code !== 0) {
            return this.$message.error(res.msg)
          }
          this.$message({
            message: this.$t('prompt.success'),
            type: 'success',
            duration: 500,
            onClose: () => {
              this.getDataList()
            }
          })
        }).catch(() => {})
      }).catch(() => {})
    },
    // 日志列表
    logHandle () {
      this.logVisible = true
      this.$nextTick(() => {
        this.$refs.log.init()
      })
    }
  }
}
</script>
