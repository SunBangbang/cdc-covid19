<template>
    <div class="item">
        <div v-for="(item,index) in meetingList" :key="index">
            <div @mouseover="mouseOver(item)"
                 @mouseleave="mouseLeave(item)">
                <el-row class="item-top">
                    <el-col :span="1">
                        <div class="tag heightMiddle ">
                            <i class="el-icon-collection-tag "
                               style="color:#CCCCCC;font-size: 20px">
                            </i>
                        </div>
                    </el-col>
                    <el-col :span="12" v-if="item.isCreator && item.status === 0 && item.beforeTime">
                        <div class="item-left heightMiddle "
                             style="padding: 16px 6px"
                             @click="joinRoom(item)"
                             :style="item.status===0&&item.beforeTime||item.status===1 ? pointer[0]:pointer[1]"
                             :title="message(item)">
                            <div :class="'conference '+((item.status===1?' conferenceBeing':'')||(item.status===0&&item.beforeTime ? 'conferenceHover':''))"
                                 :style="{color:(item.status===0&&item.beforeTime ? '#222222':'#999999')}">
                                <div class="conference-name" >{{item.name}}</div>
                                <div class="conference-time" >会议开始时间：{{item.startTime}}</div>
                            </div>
                        </div>
                    </el-col>
                    <el-col :span="16" v-if="!(item.isCreator && item.status === 0 && item.beforeTime)">
                        <div class="item-left heightMiddle "
                             style="padding: 16px 6px"
                             @click="joinRoom(item)"
                             :style="item.status===0&&item.beforeTime||item.status===1 ? pointer[0]:pointer[1]"
                             :title="message(item)">
                            <div :class="'conference '+((item.status===1?' conferenceBeing':'')||(item.status===0&&item.beforeTime ? 'conferenceHover':''))"
                                 :style="{color:(item.status===0&&item.beforeTime ? '#222222':'#999999')}">
                              <div class="conference-name" >{{item.name}}</div>
                              <div class="conference-time" >会议开始时间：{{item.startTime | formatTime}}</div>
                            </div>
                        </div>
                    </el-col>
                    <el-col :span="4" v-if="item.isCreator && item.status === 0 && item.beforeTime">
                        <div style="display:flex;align-items: center;justify-content:center;">
                            <el-button size="mini" type="danger" @click="startBegin(item)">提前开始</el-button>
                        </div>
                    </el-col>
                    <el-col :span="7">
                        <div class="item-right heightMiddle "
                             v-if="item.isShow">
                            <div class="dot-being" v-if="item.isShow">
                                <div class="dot" :style="{backgroundColor:arr[item.status].color}"></div>
                                <div class="being" :style="{color:arr[item.status].color}">
                                    {{arr[item.status].title}}
                                </div>
                            </div>
                        </div>
                        <div v-if="!item.isShow">
                            <div v-if="!item.isShow && item.isCreator" :style="item.updateColor" class="update" @click="readMeeting(item)">
                                <label v-if="!item.isShow && item.status === 0" class="edit">修改</label>
                                <label v-else-if="!item.isShow && item.status === 2" class="view">查看</label>
                            </div>
                            <div v-if="!item.isShow" :style="item.deleteColor" class="delete" @click="remove(item)">
                                <label v-if="!item.isShow" class="del">删除</label>
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </div>
            <div class="divLine" v-if="index!==meetingList.length-1"></div>
        </div>
        <div :style="pageStyle[meetingList.length]"></div>
        <div class="netMeetingPagination">
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :hide-on-single-page="page.total<=5"
                    layout="prev, pager, next"
                    :page-size="page.pageSize"
                    :current-page.sync="page.currentPage"
                    :total="page.total">
            </el-pagination>
        </div>
    </div>
</template>

<script>
import {getPageList, aheadStart} from "@/api/meeting/meeting"
import moment from "moment"

  export default {
    props: {
      user: {
        default: ''
      }
    },
    data() {
      return {
        isShow: true,
        pageStyle: [
          'margin-bottom: 425px',
          'margin-bottom: 354px',
          'margin-bottom: 283px',
          'margin-bottom: 212px',
          'margin-bottom: 141px',
          'margin-bottom: 70px'
        ],
        pointer: [
          'cursor: pointer',
          'cursor: default'
        ],
        active: '',
        page: {
          pageSize: 10,
          currentPage: 0,
          total: 0
        },
        meetingList: [],
        pageSize: 10,
        drawer: false,
        bck: [
          {
            color: ''
          },
          {
            color: '#CCCCCC'
          }],
        arr: [
          {
            color: '#CCCCCC',
            title: '未开始'
          },
          {
            color: '#409EFF',
            title: '进行中'
          },
          {
            color: '#CCCCCC',
            title: '已结束'
          }]
      }
    },
    filters: {
        formatTime(val){
           return val ? moment(val).format('YYYY-MM-DD HH:mm') : ''
       }
    },
    methods: {
      getTime() {
        moment(new Date()).format('YYYY-MM-DD HH:mm')
      },
      joinRoom(row) {
        if (row.status===0&&row.beforeTime||row.status===1) {
          let beforeTime = new Date(row.beforeTime).getTime()
          let currentTime = new Date().getTime()
          if (currentTime >= beforeTime||row.status==1) {
            this.$router.replace({path:`/video-conference/call/${row.roomId}/${this.user.username}/${this.user.userId}/${row.id}`})
          } else {
            let beforeTime = new Date(row.beforeTime).getTime()
            let startTime = new Date(row.startTime).getTime()
            let time = startTime - beforeTime
            time = (time/1000/60).toString()+'分钟'
            this.$message({
              type: 'warning',
              message: '请在会议开始前'+time+'进入'
            });
          }
        }
      },
      message(row) {
        if (row.status===0&&row.beforeTime) {
          let beforeTime = new Date(row.beforeTime).getTime()
          let startTime = new Date(row.startTime).getTime()
          let time = startTime - beforeTime
          time = (time/1000/60).toString()+'分钟'
          return '会议开始前'+time+'可进入'
        }
      },
      handleSizeChange(val) {
        this.page.currentPage = 1;
        this.page.pageSize = val;
        this.onSearch();
      },
      handleCurrentChange(val) {
        this.page.pageNum = val;
        this.onSearch();
      },
      onSearch() {
        let current = this.page.currentPage;
        let size = this.page.pageSize;
        let params = {
          page: current,
          limit: size
        };
        getPageList(params).then(res =>{
          res.data.data.list.forEach(item => {
            if (item.creator === this.$route.params.userId) {
              item.isCreator = true
            }
          })
          this.meetingList = res.data.data.list
          this.page.total = res.data.data.total
        })
      },
      // 时间戳转换日期格式方法
      formatDate(value) {
        if (value == null) {
          return '';
        } else {
          let date = new Date(value);
          let y = date.getFullYear();// 年
          let MM = date.getMonth() + 1;// 月
          MM = MM < 10 ? ('0' + MM) : MM;
          let d = date.getDate();// 日
          d = d < 10 ? ('0' + d) : d;
          let h = date.getHours();// 时
          h = h < 10 ? ('0' + h) : h;
          let m = date.getMinutes();// 分
          m = m < 10 ? ('0' + m) : m;
          let s = date.getSeconds();// 秒
          s = s < 10 ? ('0' + s) : s;
          return y + '-' + MM + '-' + d + ' ' + h + ':' + m + ':' + s;
        }
      },
      readMeeting(item) {
        this.$emit('update',item)
      },
      remove(item) {
        this.$emit('delete',item)
      },
      // 移入
      mouseOver(row) {
        if (row.isCreator) {
          row.style = 1;
          row.updateColor = [{backgroundColor:'#EEEEEE'}]
          row.deleteColor = [{backgroundColor:'#CC0000'}]
          if (row.status === 0 || row.status === 2) {
            row.isShow = false
          }
        }
      },
      // 移出
      mouseLeave(row) {
        if (row.isCreator) {
          row.isShow = true
          row.updateColor = ''
          row.deleteColor = ''
          row.style = 0;
        }
      },
      startBegin(row) {
        this.$confirm("是否提前开始该会议?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          cancelButtonClass: "btn-custom-cancel",
          type: "warning"
        }).then(() => {
          //强制提前开始
          aheadStart(row.id).then(res => {
            if (res.data.code !== 0) {
              return this.$message.error(res.data.msg)
            }
            row.status = 1
            this.joinRoom(row)
            this.$message.success("会议已开始！")
          })
        }).catch(() => {})
      }
    }
  }
</script>

<style scoped>
    .divLine {
        background-color: #EEEEEE;
        width: 100%;
        height: 1px;
    }
    .heightMiddle {
        display: flex;
        align-items: center;
    }
    .item-top {
        width: 100%;
    }
    .item-left {
        font-size: 20px;
    }
    .conference {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .conferenceBeing > div {
        color: #2E68EA;
    }
    .conferenceHover:hover > div {
        color: #2E68EA;
    }
    .conference-name {
        font-size: 15px;
        font-width: lighter;
    }
    .conference-time {
        font-size: 10px;
        color: #999999;
    }
    .item-top .el-col > div {
        height: 70px;
    }
    .dot-being {
        display: flex;
        align-items: center;
        margin: 0px auto;
        margin-right: 0px;
        height: 5px;
        width: 60px;
        font-size: 10px;
    }
    .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
    }
    .being {
        margin-left: 5px;

    }
    .update {
        cursor:pointer;
        float: left;
        width: 80px;
        height: 100%;
        position: relative;
        align-items: center;
        justify-content:center;
        display: flex;
        left: 15px;
    }
    .delete {
        cursor:pointer;
        align-items: center;
        justify-content:center;
        float: right;
        height: 100%;
        width: 80px;
        display: flex
    }
    .edit {
        cursor:pointer;
        color: #2E68EA;
    }
    .del {
        cursor:pointer;
        color: white;
    }
    .netMeetingPagination {
        text-align: center;
    }
</style>
