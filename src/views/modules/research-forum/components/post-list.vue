<template>
    <div>
        <avue-crud
            :data="data"
            :option="option"
            :page.sync="page"
            :search.sync="search"
            :table-loading="loading"
            @on-load="onLoad"
            @search-change="searchChange"
            @search-reset="searchReset"
            @size-change="sizeChange"
            @current-change="currentChange"
            @refresh-change="refreshChange"
        >
          <template slot="createDateSearch">
            <el-date-picker
              v-model="search.createDate"
              type="datetimerange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="yyyy-MM-dd HH:mm"
              value-format="yyyy-MM-dd HH:mm:ss"
              :default-time="['00:00:00']"
            >
            </el-date-picker>
          </template>
          <template slot-scope="scope" slot="menuLeft">
            <el-button size="mini" type="primary" icon="el-icon-plus" @click="addRow" v-show="type == '1'">发帖</el-button>
          </template>
          <template slot-scope="scope" slot="name" >
            <el-button size="mini" type="text" @click="reply(scope.row)" v-if="type != '4'">{{ scope.row.name }}</el-button>
            <el-button size="mini" type="text" @click="edit(scope.row)" v-else>{{ scope.row.name }}</el-button>
          </template>
          <template slot="replyView" slot-scope="scope">
            <span>{{scope.row.replyCount}} / {{scope.row.viewCount}}</span>
          </template>
        </avue-crud>
    </div>
</template>
<script>
import option from "./postListOption";
import {getForumPageList} from "@/api/research-forum/research-forum"
export default {
    name:'post-list',
    inject: ['refresh'],
    props: {
      type:{
        type:String,
        default:'1'
      }
    },
    data() {
        return {
            page: {
              pageSize: 10,
              currentPage: 1,
              total: 0,
              pageSizes: [10, 20, 50, 100]
            },
            search: {
              name: '',
              timeRange: []
            },
            data: [],
            option: option(this),
            loading: false,
        }
    },
    mounted() {
        if(this.type == '4') {
          this.$set(this.option.column[2], 'label', '创建时间');
          this.$set(this.option.column[2], 'searchPlaceholder', '创建时间');
          this.$set(this.option.column[3], 'hide', true);
          this.$set(this.option.column[4], 'hide', true);
          this.$set(this.option.column[1], 'search', false);
          this.$set(this.option.column[0], 'searchSpan', 8);
        }
    },
    methods: {
        onLoad(page, params={}) {
          this.loading = true;
          let search = {
            name: params.name ? params.name : null,
            type: this.type,
            creatorUserName: params.creatorUserName ? params.creatorUserName : null
          }
          if(params.createDate && params.createDate.length > 0) {
            search.fromDate = params.createDate[0];
            search.toDate = params.createDate[1];
          }
          getForumPageList(page.currentPage, page.pageSize, search).then(res =>{
            if(res.data.code == 0) {
              const data = res.data.data;
              this.data = data.list;
              this.page.total = data.total;
            }else {
              this.$message.error(res.data.msg)
            }
            this.loading = false;
          });
        },
        searchChange(params, done) {
          this.search = params
          this.page = {
            pageSize: 10,
            currentPage: 1,
            total: 0
          }
          this.onLoad(this.page, params);
          done();
        },
        sizeChange(val) {
          this.page.currentPage = 1;
          this.page.pageSize = val
          this.onLoad(this.page, this.search);
        },
        currentChange(val) {
          this.page.currentPage = val;
          this.onLoad(this.page, this.search);
        },
        refreshChange() {
          this.onLoad(this.page, this.search);
        },
        searchReset() {
          this.query = {};
        },
        addRow() {
          this.$router.push({name: 'create-post'});
        },
        reply(row) {
          this.$router.push({name: 'post-detail', params:{id: row.id}});
        },
        edit(row) {
          this.$router.push({name: 'edit-post', params:{id: row.id}});
        },
    }
}
</script>
