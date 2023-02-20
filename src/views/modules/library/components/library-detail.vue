<template>
  <div>
      <div style="position: fixed;width: 20%">
        <el-row style="background-color: white;">
          <el-col>
            <div>
              <i class="el-icon-arrow-left back-button" @click="goBack">返回</i>
            </div>
          </el-col>
        </el-row>
        <div class="left-box">
          <div style="background-color: white; padding: 10px;">
            <el-input style="margin-bottom: 10px;"
                      placeholder="输入关键字进行过滤"
                      v-model="filterText">
            </el-input>
            <el-tree
                    ref="categoryTree"
                    :data="categoryTree"
                    :props="defaultProps"
                    highlight-current
                    node-key="id"
                    @node-click="handleTreeNodeClick"
                    lazy
                    :load="loadNode"
                    :filter-node-method="filterNode">
            </el-tree>
          </div>
        </div>
      </div>
    <div style="padding-left: 25%;width: 1000px;position: relative">
      <div style="float: left;padding-right: 20%;min-width: 1000px">
<!--      <div class="library-content">-->
        <el-card>
          <el-row>
            <div class="fl library-title">
              {{dataForm.title}}
            </div>
          </el-row>
          <el-row class="library-content-font" v-html="dataForm.content">
            {{dataForm.content}}
          </el-row>

          <div class="content" v-for="(item, index) in dataForm.contentList" :key="index" :id="'section-'+index">
            <el-row class="library-content-title">
              <div class="fl">
                {{item.title}}
              </div>
            </el-row>
            <el-row class="library-content-font" v-html="item.content">
              {{item.content}}
            </el-row>
          </div>
        </el-card>
<!--      </div>-->
      </div>
<!--      <div class="library-detail-directory">-->
      <div style="position: fixed;margin-left: 50%;min-width: 150px">
        <el-card>
          <el-row class="library-detail-directory-title">目录</el-row>
          <el-row>
            <el-link @click="jump('title')">{{dataForm.title}}</el-link>
          </el-row>
          <el-row v-for="(item, index) in dataForm.contentList" :key="index">
<!--            <el-link @click="jump(index)">{{index+1 +". "+ item.title}}</el-link>-->
            <a :href="'#section-'+index">{{index+1 +". "+ item.title}}</a>
          </el-row>
        </el-card>
      </div>

<!--      </div>-->
    </div>
  </div>
</template>
<script>
  import { detail, getList } from '@/api/library/library'
  import { getLibCategoryTreeList } from '@/api/library-category/library-category'

  export default {
    data() {
      return {
        dataForm: {
          title: '',
          content: '',
          contentList: []
        },
        categoryTree: [],
        defaultProps: {
          children: 'children',
          label: 'name',
          isLeaf: 'isLeaf'
        },
        filterText: ''
      }
    },
    created() {
      let id = this.$route.params.id
      if (null != id) {
        this.getInfo(id)
      }
      // 获取分类树
      this.getLibraryCategoryTree()
    },
    watch: {
      filterText(val) {
        console.log("######" + val)
        this.$refs.categoryTree.filter(val);
      }
    },
    methods: {
      goBack() {
        this.$router.push({ name: 'library-library' })
        this.$store.state.contentTabs = this.$store.state.contentTabs.filter(item => {
          return item.name === 'home' || item.name === 'library-library'
        })
      },
        // 获取信息
      getInfo (id, title='') {
        detail(id).then(res => {
          if(res.data.data != null){
            this.dataForm = res.data.data;
          } else {
            this.dataForm = {
              title: title,
              content: '',
              contentList: []
            }
          }
        })
      },
      // 获取类别树
      getLibraryCategoryTree() {
        getLibCategoryTreeList('', {}).then(res => {
          this.categoryTree = res.data.data
        })
      },
      // 懒加载  获取类型对应的
      loadNode(node, resolve) {
        if (node.level === 0) {
          return resolve([{ name: '类别' }])
        }
        let library  = [];
        if(node.data.children != null && node.data.children != []){
           node.data.children.forEach(item =>{
              item.isLeaf = false;
           })
           library = node.data.children;
        }
        let params = {
          libraryCategoryId: node.data.id
        }
        getList(params).then(res => {
          let data = res.data.data.map(v => {
            v.name = v.title
            v.isLeaf = true
            return v;
          })
          library = library.concat(data);
          resolve(library)
          if (this.$route.params.id != null) {
            this.$refs.categoryTree.setCurrentKey(this.$route.params.id)
          }
        })

      },
      // 左侧树点击
      handleTreeNodeClick(data) {
        this.getInfo(data.id, data.name)
      },
      jump(index) {
        console.log("index####" + index)
        let total;
        if (index === 'title') {
          let jump = document.getElementsByClassName('title');
          total = jump.offset
        } else {
          let jump = document.getElementsByClassName('content');
          // 获取需要滚动的距离
          console.log("jump####" + JSON.stringify(jump))
          total = jump[index].offsetTop;
        }
        console.log("total####" + total)

        setTimeout(() => {
          // Chrome
          document.body.scrollTop = total;
          // Firefox
          document.documentElement.scrollTop = total;
          // Safari
          window.pageYOffset = total;
        }, 0)

      },
      filterNode(value, data) {
        console.log("value######" + value)
        console.log("data######" + JSON.stringify(data))
        if (!value) return true;
        return data.name.indexOf(value) !== -1;
      }
    }
  }
</script>
<style lang="scss" scoped>
  .back-button {
    padding: 10px;
    color: #00bfbf;
    cursor: pointer;
  }
  .el-tree {
    width: 100%;
    overflow: auto;
  }

  .el-tree>.el-tree-node {
    display: inline-block;
    min-width: 100%;
  }
  .left-box {
    width:100%;
    height: 4.5rem;
    /*padding:5px;*/
    margin: 2px;
    overflow: scroll;
  }
</style>
