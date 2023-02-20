<template>
    <el-card class="aui-card--fill">
      <el-tabs :active-name="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane name="square" label="流调论坛广场" lazy>
          <post-list :type="'1'"></post-list>
        </el-tab-pane>
        <el-tab-pane name="latest" label="最新回复" lazy>
          <post-list :type="'3'"></post-list>
        </el-tab-pane>
        <el-tab-pane name="mypost" label="我的帖子" lazy>
          <post-list :type="'2'"></post-list>
        </el-tab-pane>
        <el-tab-pane name="drafts" label="草稿箱" lazy>
          <post-list :type="'4'"></post-list>
        </el-tab-pane>
      </el-tabs>
    </el-card>
</template>
<script>
import postList from "./components/post-list.vue"
export default {
    name: "research-forum",
    components: {
      postList
    },
    data() {
      return {
        activeName: 'square',
      };
    },
  created() {
    if (sessionStorage.getItem('tab')) {
      this.activeName = sessionStorage.getItem('tab')
    }
  },
  methods: {
    handleClick(tab) {
      sessionStorage.setItem('tab', tab.name)
    }
  }
}
</script>
