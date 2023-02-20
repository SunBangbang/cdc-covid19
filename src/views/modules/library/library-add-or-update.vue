<template>
  <div class="library-content">
    <el-row>
      <el-col>
        <div>
          <i class="el-icon-arrow-left back-button" @click="goBack">返回</i>
        </div>
      </el-col>
    </el-row>
    <el-card>
      <el-row>
        <avue-input-tree
          size="mini"
          default-expand-all
          v-model="dataForm.libraryCategoryId"
          :dic="categoryTreeList"
          :props="defaultProp"
          placeholder="请选择分类"
          type="tree">
        </avue-input-tree>
        <el-button class="fr" size="mini" type="primary" style="margin-right: 10px" @click.stop="handleSave">保存词条</el-button>
      </el-row>
    </el-card>
    <el-card>
      <el-row>
        <div class="fl library-title">
          {{dataForm.title}}
        </div>
        <div class="fr">
          <el-button type="text" @click="handleEditParagraph(dataForm.title, dataForm.content, 'title')">编辑</el-button>
        </div>
      </el-row>
      <el-row>
        <div class="library-content-font" v-html="dataForm.content">
          {{dataForm.content}}
        </div>
      </el-row>

      <div v-for="(item, index) in dataForm.contentList" :key="index">
        <el-row class="library-content-title">
          <div class="fl">
            {{item.title}}
          </div>
          <div class="fr">
            <el-button type="text" @click="handleEditParagraph(item.title, item.content, index)">编辑</el-button>
            <el-button type="text" @click="handleDeleteParagraph(index)">删除</el-button>
          </div>
        </el-row>
        <el-row>
          <div class="library-content-font" v-html="item.content">
            {{item.content}}
          </div>
        </el-row>
      </div>
    </el-card>

    <el-button class="library-add-button" icon="el-icon-plus" @click="handleAddParagraph" size="mini">添加段落</el-button>
    <library-paragraph-dialog
      ref="libraryParagraphDialog"
      v-if="libraryParagraphDialogVisable"
      @callback="handleEditParagraphCallback">
    </library-paragraph-dialog>
  </div>
</template>
<script>
  import { detail, saveOrUpdate } from '@/api/library/library'
  import { getLibCategoryTreeNodes } from '@/api/library-category/library-category'
  import LibraryParagraphDialog from './components/library-paragraph-dialog'

  export default {
    components: {
      LibraryParagraphDialog
    },
    data() {
      return {
        dataForm: {
          libraryCategoryId: '',
          title: '',
          content: '',
          contentList: []
        },
        defaultProp: {
          label: 'label',
          value: 'id' ,
          children: 'children'
        },
        libraryParagraphDialogVisable: false,
        categoryTreeList: []
      }
    },
    created() {
      let id = this.$route.params.id
      if (null != id) {
        this.getInfo(id)
      }
      getLibCategoryTreeNodes().then(res => {
        this.categoryTreeList = res.data.data
      })
    },
    methods: {
      goBack() {
        this.$router.go(-1);
      },
      // 获取信息
      getInfo (id) {
        detail(id).then(res => {
          this.dataForm = res.data.data
        })
      },
      // 新增段落
      handleAddParagraph() {
        this.libraryParagraphDialogVisable = true
        this.$nextTick(() => {
          this.$refs['libraryParagraphDialog'].init('', '', 'add')
        })
      },
      // 编辑段落
      handleEditParagraph(title, content, index) {
        this.libraryParagraphDialogVisable = true
        this.$nextTick(() => {
          this.$refs['libraryParagraphDialog'].init(title, content, index)
        })
      },
      // 编辑段落回调
      handleEditParagraphCallback(title, content, index) {
        // 新增段落
        if (index === 'add') {
          let paragraph = {
            title: title,
            content: content
          }
          this.dataForm.contentList.push(paragraph)
          // 编辑文库标题
        } else if (index === 'title') {
          this.dataForm.title = title
          this.dataForm.content = content
          // 编辑段落
        } else {
          this.dataForm.contentList[index].title = title
          this.dataForm.contentList[index].content = content
        }
      },
      // 删除段落
      handleDeleteParagraph(index) {
        this.dataForm.contentList.splice(index, 1)
      },
      // 保存
      handleSave() {
        if (this.dataForm.libraryCategoryId === '') {
          this.$message.error('请选择类型')
        } else if (this.dataForm.title === '') {
          this.$message.error('请输入标题')
        // } else if (this.dataForm.contentList.length < 1) {
        //   this.$message.error('请输入内容')
        } else {
          saveOrUpdate(this.dataForm).then(() => {
            // 关闭编辑标签页
            this.$store.state.contentTabs = this.$store.state.contentTabs
              .filter(item => item.name !== 'library-create' && item.name !== 'library-edit' && item.name !== 'library-library')
            this.$message.success('保存成功')
            this.$nextTick(() => {
              this.$router.push('/library-library')
            })
          })
        }
      }
    }
  }
</script>

<style scoped lang="scss" scoped>
  .back-button {
    padding: 10px;
    color: #00bfbf;
    cursor: pointer;
  }
</style>
