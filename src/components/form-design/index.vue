<template>
  <div class="form-designer">
    <el-container>
      <!-- 左侧字段 -->
      <el-aside :width="leftWidth">
        <div class="fields-list">
          <el-collapse v-model="activeNames">
            <!--固定字段-->
            <el-collapse-item
              v-for="(field, index) in fields"
              :key="'fixed-' + index"
              :name="index"
            >
              <!--左框子标题fields[].title-->
              <template slot="title">
                <div class="field-title">{{ field.title }}</div>
              </template>
              <!--左框子标题下内容-->
              <draggable
                tag="ul"
                :list="field.list"
                :group="{ name: 'form', pull: 'clone', put: false }"
                ghost-class="ghost"
                :sort="false"
              >
                <li
                  class="field-label"
                  v-for="(item, index) in field.list"
                  :key="index"
                >
                  <a @click="handleFieldClick(item)" style="padding: 5px 0;">
                    <!--左框组件图标 fields[].list[].icon-->
                    <i class="iconv" :class="item.icon"></i>
                    <!--左框组件文字 fields[].list[].title或label-->
                    <span :title="item.title || item.label">{{
                      item.title || item.label
                    }}</span>
                  </a>
                </li>
              </draggable>
            </el-collapse-item>
            <!--自定义字段-->
            <template v-if="customFields && customFields.length > 0">
              <el-collapse-item
                v-for="(customField, customFieldIndex) in customFields"
                :key="'custom-' + customFieldIndex"
              >
                <!--左框子标题fields[].title-->
                <template slot="title">
                  <div class="field-title">{{ customField.title }}</div>
                </template>
                <div style="padding: 0 10px">
                  <el-select
                    v-if="customField.title === '个人模块'"
                    v-model="searchModuleName"
                    filterable
                    clearable
                    placeholder="请选择个人模块"
                  >
                    <el-option
                      v-for="item in customField.list"
                      :key="item.id"
                      :label="item.label"
                      :value="item.label"
                    >
                    </el-option>
                  </el-select>
                </div>

                <!--<el-select v-if="customField.title === '公共组件'"  v-model="searchFormName"
                           filterable clearable placeholder="请选择公共组件">
                  <el-option
                          v-for="item in customField.list"
                          :key="item.id"
                          :label="item.label"
                          :value="item.label">
                  </el-option>
                </el-select>-->

                <!--左框子标题下内容-->
                <draggable
                  tag="ul"
                  :list="customField.list"
                  :group="{ name: 'form', pull: 'clone', put: false }"
                  ghost-class="ghost"
                  :sort="false"
                >
                  <li
                    class="field-label"
                    v-show="show(customField.title, item)"
                    v-for="(item, index) in customField.list"
                    :key="index"
                  >
                    <a @click="handleFieldClick(item)">
                      <!--左框组件图标 fields[].list[].icon-->
                      <!--                      <i class="icon feisicon"-->
                      <!--                         :class="item.icon"></i>-->
                      <!--左框组件文字 fields[].list[].title或label-->
                      <div
                        :title="item.title || item.label"
                        style="vertical-align: middle;padding: 5px"
                      >
                        <p
                          style="text-overflow: ellipsis; overflow: hidden; width: 100%;"
                        >
                          {{ item.title || item.label }}
                        </p>
                      </div>
                    </a>
                  </li>
                </draggable>
              </el-collapse-item>
            </template>
          </el-collapse>
        </div>
      </el-aside>
      <!-- 中间主布局 -->
      <el-container class="widget-container" direction="vertical">
        <el-header>
          <!--工具栏左插槽-->
          <slot name="toolbar-left"></slot>
          <!--工具栏-->
          <el-button
            v-if="
              toolbar.includes('import') && $hasPermission('form:import.json')
            "
            type="text"
            size="medium"
            icon="el-icon-upload2"
            @click="importJsonVisible = true"
            >导入JSON</el-button
          >
          <el-button
            v-if="
              toolbar.includes('generate') && $hasPermission('form:export.json')
            "
            type="text"
            size="medium"
            icon="el-icon-download"
            @click="handleGenerateJson"
            >生成JSON</el-button
          >
          <el-button
            v-if="toolbar.includes('preview')"
            type="text"
            size="medium"
            icon="el-icon-view"
            @click="handlePreview"
            >预览</el-button
          >
          <el-button
            v-if="toolbar.includes('clear') && showClearBtn"
            class="danger"
            type="text"
            size="medium"
            icon="el-icon-delete"
            @click="handleClear"
            >清空</el-button
          >
          <!--          <el-button type="text"-->
          <!--                     size="medium"-->
          <!--                     icon="el-icon-place"-->
          <!--                     @click="selectSceneDialogVisible = true">选择场景</el-button>-->
          <!--工具栏右插槽-->
          <slot name="toolbar-right"></slot>
        </el-header>
        <!--主体-->
        <el-main
          :style="{
            background:
              widgetForm.column.length == 0
                ? `url(${widgetEmpty}) no-repeat 50%`
                : ''
          }"
        >
          <widget-form
            ref="widgetForm"
            :data.sync="widgetForm"
            :select.sync="widgetFormSelect"
            class="widget-form"
          >
          </widget-form>
        </el-main>
      </el-container>
      <!-- 右侧配置 -->
      <el-aside class="widget-config-container" :width="asideRightWidth">
        <widget-config
          :data="widgetFormSelect"
          :columns="widgetForm.column"
          :sceneType="widgetForm.sceneType"
          :tempDict.sync="tempDict"
        ></widget-config>
      </el-aside>
      <!-- 弹窗 -->
      <!-- 导入JSON抽屉框-->
      <el-drawer
        title="导入JSON"
        :visible.sync="importJsonVisible"
        size="50%"
        append-to-body
        destroy-on-close
      >
        <monaco-editor
          v-model="importJson"
          keyIndex="import"
          height="82%"
        ></monaco-editor>
        <div class="drawer-foot">
          <el-button
            size="medium"
            type="primary"
            @click="handleImportJsonSubmit"
            >确定</el-button
          >
          <el-button
            size="medium"
            type="danger"
            @click="importJsonVisible = false"
            >取消</el-button
          >
        </div>
      </el-drawer>
      <!-- 生成JSON抽屉框 -->
      <el-drawer
        title="生成JSON"
        :visible.sync="generateJsonVisible"
        size="50%"
        append-to-body
        destroy-on-close
      >
        <monaco-editor
          v-model="widgetFormPreview"
          keyIndex="generate"
          height="82%"
          :read-only="true"
        ></monaco-editor>
        <div class="drawer-foot">
          <el-button size="medium" type="primary" @click="handleGenerate"
            >生成</el-button
          >
          <el-popover
            placement="top"
            trigger="hover"
            popper-class="popper-bo"
            width="250px"
          >
            <el-button
              size="medium"
              type="primary"
              slot="reference"
              @click="handleCopy"
              style="margin-left: 10px;"
              >复制</el-button
            >
          </el-popover>
        </div>
      </el-drawer>
      <!-- 预览抽屉框 -->
      <el-drawer
        title="预览"
        :visible.sync="previewVisible"
        size="60%"
        append-to-body
        :before-close="handleBeforeClose"
      >
        <el-button
          style="margin-left: 20px"
          @click="changeFullOrCoreForm"
          size="mini"
          >{{ showFormText }}</el-button
        >
        <json-to-form
          class="preview-form"
          v-if="previewVisible" 
          ref="jsonToForm"
          :isShowCoreForm="isShowCoreForm"
        ></json-to-form>
        
      </el-drawer>

      <el-dialog title="选择场景" :visible.sync="selectSceneDialogVisible">
        选择场景：
        <el-select v-model="selectSceneValue" clearable placeholder="请选择">
          <el-option
            v-for="item in selectSceneOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
        <div slot="footer" class="dialog-footer">
          <el-button @click="selectSceneDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSelectScene">确 定</el-button>
        </div>
      </el-dialog>
    </el-container>
  </div>
</template>

<script>
import fields from "./fieldsConfig.js";
import { stringify, defaultTitleInputJson } from "./utils";
import widgetEmpty from "./assets/widget-empty.png";
import formModule from "./mixins/form-module-mixin";

import Draggable from "vuedraggable";
import WidgetForm from "./WidgetForm";
import WidgetConfig from "./WidgetConfig";
import MonacoEditor from "./utils/monaco-editor";

import JsonToForm from "./form-json/index";
import Loading from "@/utils/Loading";

export default {
  name: "FormDesign",
  mixins: [formModule],
  components: {
    Draggable,
    MonacoEditor,
    WidgetForm,
    WidgetConfig,
    JsonToForm
  },
  props: {
    options: {
      //配置
      type: Object,
      default: () => {
        return {
          column: []
        };
      }
    },
    asideLeftWidth: {
      //左工具栏宽度
      type: [String, Number],
      default: "20%"
    },
    asideRightWidth: {
      //右工具栏宽度
      type: [String, Number],
      default: "27%"
    },
    toolbar: {
      //顶部工具栏配置
      type: Array,
      default: () => {
        return [];
      }
    },
    customFields: {
      //自定义字段
      type: Array,
      default: () => {
        return [];
      }
    },
    loading: Boolean,
    showClearBtn: {
      type: Boolean,
      default: true
    }
  },
  created() {
    this.handleLoadCss();
    this.pointedLoading = null;
    this.widgetForm.column = [];
  },
  mounted() {
    //设置loading
    this.loadingInstance = new Loading(".widget-form");
    this.pointedLoading = this.loading;
  },
  watch: {
    options: {
      handler(val) {
        this.transOptionsToFormDesigner(val).then(res => {
          this.widgetForm = { ...this.widgetForm, ...res };
        });
      },
      deep: true
    },
    pointedLoading: {
      handler(val) {
        if (!val) {
          this.loadingInstance.close();
        }
      }
    }
  },
  computed: {
    leftWidth() {
      if (typeof this.asideLeftWidth == "string") {
        return this.asideLeftWidth;
      } else {
        return `${this.asideLeftWidth}px`;
      }
    },
    rightWidth() {
      if (typeof this.asideRightWidth == "string") {
        return this.asideRightWidth;
      } else {
        return `${this.asideRightWidth}px`;
      }
    }
  },
  data() {
    return {
      widgetEmpty, //中间主布局的主体没有内容时显示的图片的url
      fields, //左框中的内置组件 从fieldsConfig.js定义
      activeNames: [0, 1], //左侧Collapse 折叠面板
      widgetForm: {
        //表单设计器配置项
        column: [],
        //表单属性
        labelPosition: "top",
        labelSuffix: "：",
        labelWidth: 120,
        gutter: 0,
        menuBtn: true,
        submitBtn: true,
        submitText: "提交",
        emptyBtn: true,
        emptyText: "清空",
        menuPosition: "center",
        sceneType: "",
        relation: {} //组件之间的关系
      },
      searchModuleName: "", //组件查询
      searchFormName: "", //组件查询
      widgetFormPreview: {}, //生成json
      widgetFormSelect: {}, //选中的组件
      previewVisible: false, //预览的drawer是否显示
      generateJsonVisible: false, //生成json的drawer是否显示
      importJsonVisible: false, //导入json的drawer是否显示
      importJson: {}, //导入json时输入的json
      loadingInstance: null,
      pointedLoading: null,
      tempDict: null, //表单属性模板字典
      selectSceneDialogVisible: false, //选择场景dialog
      //选择场景 select options
      selectSceneOptions: [
        {
          label: "学校",
          value: "school"
        }
      ],
      selectSceneValue: "",
      isShowCoreForm: true,
      showFormText: "显示全量调查表"
    };
  },
  methods: {
    changeFullOrCoreForm() {
      this.isShowCoreForm = !this.isShowCoreForm;
      if (this.isShowCoreForm) {
        this.showFormText = "显示全量调查表";
        this.$nextTick(() => {
          // this.$refs["jsonToForm"].json.column = this.data;
          // this.$refs["jsonToForm"].init();
          this.$refs["jsonToForm"].visible = true;
        });
      } else {
        this.showFormText = "显示核心信息表";
        this.$nextTick(() => {
          // this.$refs["jsonToForm"].json.column = this.data;
          // this.$refs["jsonToForm"].init();
          this.$refs["jsonToForm"].visible = true;
        });
      }
    },
    handleSelectScene() {
      this.widgetForm.sceneType = this.selectSceneValue;
      this.selectSceneDialogVisible = false;
    },
    handleLoadCss() {
      const url = "//at.alicdn.com/t/font_2356456_egg2fq8oyyi.css";
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      window.document.head.appendChild(link);
    },
    // 点击左侧字段 加入组件到当前选择组件的下面
    handleFieldClick(item) {
      const newIndex =
        this.widgetForm.column.findIndex(
          c => c.prop === this.widgetFormSelect.prop
        ) + 1;
      this.widgetForm.column.splice(newIndex, 0, item);
      this.$refs.widgetForm.handleWidgetAdd({ newIndex });
    },
    // 预览 - 弹窗
    handlePreview() {
      if (!this.widgetForm.column || this.widgetForm.column.length === 0)
        this.$message.error("没有需要展示的内容");
      else {
        this.parseRelations();
        this.transformToOptions(this.widgetForm).then(data => {
          this.widgetFormPreview = data;
          this.$nextTick(() => {
            this.previewVisible = true; //展示预览框
            this.$nextTick(() => {
              this.$refs["jsonToForm"].json = data;
              this.$refs["jsonToForm"].init();
              this.$refs["jsonToForm"].visible = true;
            });
          });
        });
      }
    },
    // 导入JSON - 弹窗 - 确定
    handleImportJsonSubmit() {
      try {
        //json转换为表单设计器配置项
        this.transOptionsToFormDesigner(this.importJson).then(res => {
          this.widgetForm = res;
          this.importJsonVisible = false; //关闭导入json drawer
        });
      } catch (e) {
        console.error("import json error:", e.message);
        this.$message.error("非法json, 不能导入!");
      }
    },
    // 生成JSON - 弹窗
    handleGenerateJson() {
      this.transformToOptions(this.widgetForm).then(data => {
        this.widgetFormPreview = data;
        this.generateJsonVisible = true; //生成json drawer显示
      });
    },
    // 返回调查表JSON
    handleGenerate() {
      this.transformToOptions(this.widgetForm).then(data => {
        this.$emit("submit", data); //执行父类绑定的submit方法
      });
    },
    // 生成JSON - 弹窗 - 拷贝
    async handleCopy() {
      this.transformToOptions(this.widgetForm).then(data => {
        let text;
        text = stringify(data);
        this.$Clipboard({
          text
        })
          .then(() => {
            this.$message.success("复制成功");
          })
          .catch(() => {
            this.$message.error("复制失败");
          });
      });
    },
    // 预览 - 弹窗 - 关闭前
    handleBeforeClose() {
      this.$refs["jsonToForm"].visible = false;
      this.$nextTick(() => {
        this.previewVisible = false;
      });
    },
    // 清空
    handleClear() {
      // console.log('handleClear......', this.widgetForm.column)
      if (
        this.widgetForm &&
        this.widgetForm.column &&
        this.widgetForm.column.length > 0
      ) {
        this.$confirm("确定要清空吗？", "警告", {
          cancelButtonClass: "btn-custom-cancel",
          type: "warning"
        })
          .then(() => {
            this.$set(this.widgetForm, "column", []); //字段属性清空
            this.$set(this, "widgetFormSelect", {}); //右框信息清空
          })
          .catch(() => {});
      } else this.$message.error("没有需要清空的内容");
    },
    //表单设计器配置项 转化为 配置项
    transformToOptions(obj) {
      return new Promise((resolve, reject) => {
        try {
          const data = this.deepClone(obj);
          for (let i = 0; i < data.column.length; i++) {
            const col = data.column[i];
            //子表单类型
            if (
              col.type === "dynamic" &&
              col.children &&
              col.children.column &&
              col.children.column.length > 0
            ) {
              col.children.column.forEach(item => {
                delete item.subfield;
              });
              //children.column改为children
              this.transformToOptions(col.children).then(res => {
                col.children = res;
              });
            } else if (col.type === "group") {
              //分组类型
              //children改为column
              this.transformToOptions(col.children).then(res => {
                col.column = res.column;
              });
              delete col.children;
            }
          }
          //如果场景类型为空则删除
          if (data.sceneType && data.sceneType.length === 0) {
            delete data.sceneType;
          }
          resolve(data);
        } catch (e) {
          reject(e);
        }
      });
    },
    // 配置项 转化为 表单设计器配置项
    transOptionsToFormDesigner(obj) {
      if (typeof obj == "string") obj = eval("(" + obj + ")");
      const data = this.deepClone(obj);
      return new Promise((resolve, reject) => {
        try {
          if (data.column && data.column.length > 0) {
            data.column.forEach(col => {
              if (
                col.type === "dynamic" &&
                col.children &&
                col.children.column &&
                col.children.column.length > 0
              ) {
                col.children.column.forEach(item => {
                  item.subfield = true;
                });
                this.transOptionsToFormDesigner(col.children).then(res => {
                  col.children = res;
                });
              } else if (col.type === "group" && col.column) {
                col.children = {};
                if (col.column.length === 0) {
                  col.children.column = [];
                } else {
                  this.transOptionsToFormDesigner(col.column).then(res => {
                    col.children.column = res;
                  });
                }
                delete col.column;
              }
            });
          }
          resolve(data);
        } catch (e) {
          reject(e);
        }
      });
    },
    async getData() {
      return await this.transformToOptions(this.widgetForm);
    },
    show(title, item) {
      // console.log('show:', title, ' ', item)
      if (!title) return true;
      if (title === "国家定制模块") {
        return true;
      } else if (title === "个人模块") {
        if (this.searchModuleName.length > 0) {
          return item.label.indexOf(this.searchModuleName) !== -1
            ? true
            : false;
        }
        return true;
      } else if (title === "国家定制模块") {
        if (this.searchFormName.length > 0) {
          return item.label.indexOf(this.searchFormName) !== -1 ? true : false;
        }
        return true;
      }
    },
    closeLoading() {
      this.pointedLoading = false;
    }
  }
};
</script>

<style lang="scss">
@import "./styles/index.scss";
</style>
