<template>
    <div>
        <nav style="background-color: white"
             class="aui-navbar"
             :class="`aui-navbar--${$store.state.navbarLayoutType}`">
            <el-col :span="6" class="aui-navbar-left">
                <span style="font-weight:bold;font-size: 20px; color: white">
                    新冠肺炎调查 视频会议
                </span>
            </el-col>
            <span class="aui-navbar-right">
<!--               <img :src="url" class="avatar">-->
                <el-col class="user" style="font-size: 15px; color: white">
                    <el-row>{{user.realName}}</el-row>
                </el-col>
            </span>
        </nav>
        <div class="main">
            <!-- 会议列表-->
            <div v-if="!isCreate">
                <el-row class="top-row">
                    <el-col :span="12">
                       <h2>会议列表</h2>
                    </el-col>
                    <el-col :span="12" style="text-align: right;">
                        <button type="button" class="el-button el-button--default el-button--mini is-circle">
                            <i class="el-icon-refresh" @click="refresh()"></i>
                        </button>
                        <el-button type="primary" size="small" @click="createMeeting">创建会议</el-button>
                    </el-col>
                </el-row>
<!--                <div class="main-top" style="margin-bottom: 30px">-->
<!--                </div>-->
                <net-meeting-list-item ref="netMeetingListItem"
                                       @update="updateMeeting"
                                       @delete="deleteMeeting"
                                       :user="user">
                </net-meeting-list-item>
            </div>
            <!-- 创建/修改会议-->
            <net-meeting-add-or-update v-if="isCreate"
                                       ref="netMeetingAddOrUpdate"
                                       @back="back">
            </net-meeting-add-or-update>
        </div>
    </div>
</template>
<script>
import NetMeetingListItem from './components/net-meeting-list-item'
  import {getPageList,remove} from "../../../api/meeting/meeting";
  import NetMeetingAddOrUpdate from './components/net-meeting-add-or-update'
  import { getUserDetailList, getUserById } from '@/api/user/user'

export default {
    components: {
      NetMeetingAddOrUpdate,
      NetMeetingListItem
    },
    data() {
      return {
        url: require('../../../assets/img/avatar.png'),
        user: {},
        isCreate: false
      }
    },
    created() {
      this.init()
    },
    methods: {
      refresh(){
        this.init()
      },
      init(){
        this.user.username = this.$route.params.username
        this.user.realName = this.$route.params.realName
        this.user.userId = this.$route.params.userId
        this.meetingList()

        // getUserById(this.user.userId).then(res => {
        //   if(res.data.code === 0){
        //     this.url = res.data.data.headUrl
        //     this.url = !this.url? window.SITE_CONFIG['userDefHeadImgUrl'] : this.url
        //   }else{
        //     console.error('err:', res.data.msg)
        //     this.$message.error('获取用户信息失败!')
        //   }
        // })
      },
      meetingList() {
        let params = {
          page: 1,
          limit: 10
        };
        getPageList(params).then(res => {
          res.data.data.list.forEach(item => {
            if (item.creator === this.$route.params.userId) {
              item.isCreator = true
            }
          })
          this.$refs['netMeetingListItem'].meetingList = res.data.data.list
          this.$refs['netMeetingListItem'].page.total = res.data.data.total
        });
      },
      createMeeting() {
        this.isCreate = true;
        this.$nextTick(()=>{
          this.$refs['netMeetingAddOrUpdate'].enterCreate()
        })
      },
      updateMeeting(row) {
        this.isCreate = true;
        this.$nextTick(()=>{
          this.$refs['netMeetingAddOrUpdate'].enterUpdate(row)
        })
      },
      deleteMeeting(row) {
        this.$confirm("确定将选择数据删除?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          cancelButtonClass: "btn-custom-cancel",
          type: "warning"
        }).then(() => {
          return remove(row.id)
        }).then(res => {
          if (res.data.code === 0) {
            this.$message({
              type: "success",
              message: "操作成功!"
            })
          } else {
            this.$message.error(res.data.msg)
          }
            this.meetingList()
        }).catch(() => {})
      },
      back() {
        this.isCreate = false
        this.meetingList()
      }
    }
  }
</script>
<style>
    body {
        background-color: rgba(245, 245, 251, 1);
    }
</style>
<style scoped>
    .aui-navbar {
        padding: 0 15px;
        display: flex;
        justify-content: space-between;
    }
    .aui-navbar-left {
        display: flex;
        align-items: center;
    }
    .aui-navbar-right {
        display: flex;
        align-items: center;
    }
    .avatar {
        border-radius: 50%;
        width: 2.5em;
        height: 2.5em;
    }
    .user {
        margin-left: 5px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
    }
    .main {
        width: 700px;
        min-height: 600px;
        padding: 40px 50px;
        background-color: white;
        margin: 60px auto;
    }
    .main-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 20px;
    }
    .top-row {
      margin-bottom: 10px;
    }

</style>
