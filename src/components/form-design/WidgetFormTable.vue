<template>
  <el-collapse>
    <el-collapse-item :title="column.label" :name="column.label">
      <div>
        <!--    <h3 style="margin: 10px"
        v-show="column.label">{{column.label}}</h3>-->
        <draggable
          :class="[
            isForm ? 'widget-form-group__body' : 'widget-form-table__content',
          ]"
          :list="column.children.column"
          :group="{ name: 'form' }"
          :disabled="column.edit !== undefined && !column.edit"
          ghost-class="ghost"
          :animation="200"
          handle=".handle"
          style="outline: 2px dashed #ffa500"
          @add="handleWidgetTableAdd($event, column)"
        >
          <template v-if="column.children.column.length > 0">
            <!--表格模式-->
            <template v-if="!isForm">
              <div
                v-for="(item, tableIndex) in column.children.column"
                :key="'table-' + tableIndex"
                class="handle widget-form-table__item"
                :class="{
                  active: selectWidget.prop === item.prop,
                  required: item.required,
                }"
                :style="{
                  minWidth: item.width ? `${item.width}px` : '33.3%',
                  width: item.width ? `${item.width}px` : '33.3%',
                }"
                @click.stop="handleWidgetTableSelect2(item, tableIndex)"
              >
                <el-table :data="[item]" border>
                  <el-table-column
                    :prop="item.prop"
                    :align="column.children.align"
                    :label="item.label"
                    :header-align="column.children.headerAlign"
                  >
                    <template slot="label">
                      <span :class="item.fieldRequired ? 'live-required' : ''"
                        >{{ item.label }}
                      </span>
                    </template>
                    <widget-form-item
                      :item="item"
                      :params="column.params"
                    ></widget-form-item>
                    <el-button
                      title="删除"
                      @click.stop="handleWidgetTableDelete(column, tableIndex)"
                      class="widget-table-action-delete"
                      v-if="
                        selectWidget.isRelatedTableColumn === undefined &&
                        item.edit
                      "
                      circle
                      plain
                      size="small"
                      type="danger"
                    >
                      <i class="feisicon icon-delete"></i>
                    </el-button>
                    <el-button
                      title="复制"
                      @click.stop="handleWidgetTableClone(column, item)"
                      class="widget-table-action-clone"
                      v-if="
                        selectWidget.isRelatedTableColumn === undefined &&
                        item.edit
                      "
                      circle
                      plain
                      size="small"
                      type="primary"
                    >
                      <i class="feisicon icon-copy"></i>
                    </el-button>
                  </el-table-column>
                </el-table>
              </div>
            </template>
            <!--表单模式-->
            <template v-else>
              <el-col
                v-for="(item, formIndex) in column.children.column"
                :key="'form-' + formIndex"
                :md="item.span || 12"
                :xs="24"
                :offset="item.offset || 0"
              >
                <el-form-item
                  class="handle widget-form-group__item"
                  :prop="item.prop"
                  :class="{
                    active: selectWidget.prop == item.prop,
                    required: item.required,
                  }"
                  @click.native.stop="handleWidgetTableSelect(item)"
                >
                  <template slot="label">
                    <span :class="item.fieldRequired ? 'live-required' : ''">{{
                      item.label
                    }}</span>
                  </template>
                  <!--              {{item}}-->
                  <!--              <h3 style="color:red" v-if="item.component && item.component === 'el-divider'">{{item.title}}</h3>-->
                  <widget-form-item
                    :item="item"
                    :relatedTable="column.children.relatedTable"
                    :params="column.params"
                  >
                  </widget-form-item>
                  <el-button
                    title="删除"
                    @click.stop="handleWidgetTableDelete(column, formIndex)"
                    class="widget-form-group__item--delete"
                    v-if="
                      (selectWidget.prop == item.prop ||
                        (item.component && item.component === 'el-divider')) &&
                      item.edit
                    "
                    circle
                    plain
                    type="danger"
                  >
                    <i class="feisicon icon-delete"></i>
                  </el-button>
                  <el-button
                    title="复制"
                    @click.stop="handleWidgetTableClone(column, item)"
                    class="widget-form-group__item--clone"
                    v-if="selectWidget.prop == item.prop && item.edit"
                    circle
                    plain
                    type="primary"
                  >
                    <i class="feisicon icon-copy"></i>
                  </el-button>
                </el-form-item>
              </el-col>
            </template>
          </template>
        </draggable>
        <el-button
          title="删除"
          @click.stop="handleWidgetDelete(index)"
          class="widget-action-delete"
          v-if="selectWidget.prop == column.prop && column.edit"
          circle
          plain
          size="small"
          type="danger"
        >
          <i class="feisicon icon-delete"></i>
        </el-button>
        <el-button
          title="清空"
          @click.stop="handleWidgetClear(index)"
          class="widget-action-clear"
          v-if="selectWidget.prop == column.prop && column.edit"
          circle
          plain
          size="small"
          type="warning"
        >
          <i class="feisicon icon-clear"></i>
        </el-button>
        <el-button
          title="复制"
          @click.stop="handleWidgetCloneTable(index)"
          class="widget-action-clone"
          v-if="selectWidget.prop == column.prop && column.edit"
          circle
          plain
          size="small"
          type="primary"
        >
          <i class="feisicon icon-copy"></i>
        </el-button>
      </div>
    </el-collapse-item>
  </el-collapse>
</template>
<script>
import WidgetFormItem from "./WidgetFormItem";
import draggable from "vuedraggable";
import { getAll, resetPropAndRel, specialRelTypes } from "./utils";

export default {
  name: "widget-form-table",
  props: ["data", "column", "select", "index"],
  components: { WidgetFormItem, draggable },
  data() {
    return {
      selectWidget: this.select,
      dataIndex: 0,
    };
  },
  computed: {
    isForm: function () {
      let result = this.column.children.type === "form";
      if (result) {
        //表单
        this.column.children.column.forEach((c) => {
          c.subfield = false;
        });
      } else {
        //表格
        this.column.children.column.forEach((c) => {
          c.subfield = true;
          if (!c.width) {
            c.width = 150;
          }
        });
      }
      return result;
    },
  },
  methods: {
    handleSelectWidget(index) {
      this.selectWidget = this.data.column[index];
    },
    handleWidgetClear(index) {
      this.data.column[index].children.column = [];
      this.selectWidget = this.data.column[index];
    },
    handleWidgetDelete(index) {
      if (this.data.column.length - 1 === index) {
        if (index === 0) this.selectWidget = {};
        else this.handleSelectWidget(index - 1);
      } else this.handleSelectWidget(index + 1);

      this.$nextTick(() => {
        this.data.column.splice(index, 1);
        this.$emit("handleRefreshNewLabel", this.column.prop);
      });
    },
    handleWidgetCloneTable(index) {
      let cloneData = this.deepClone(this.data.column[index]);
      cloneData.prop = Date.now() + "_" + Math.ceil(Math.random() * 99999);
      cloneData.children.column.forEach((t) => {
        t.span = 24;
      });
      resetPropAndRel(cloneData.children.column);
      cloneData.display = true;
      this.data.column.splice(index + 1, 0, cloneData);
      this.$nextTick(() => {
        this.handleSelectWidget(index + 1);
        this.$emit("handleRefreshNewLabel");
      });
    },
    handleWidgetTableAdd(evt, column) {
      let newIndex = evt.newIndex;
      const item = evt.item;

      if (newIndex == 1 && newIndex > column.children.column.length - 1)
        newIndex = 0;
      // if (['bigtitle','description', 'title', 'group', 'dynamic'].includes(column.children.column[newIndex].type)) {
      let type = column.children.column[newIndex].type;
      if (["bigtitle", "description", "title"].includes(type)) {
        column.children.column.splice(newIndex, 1);
        return;
      }
      if (["group", "dynamic"].includes(type)) {
        //分组或子表单中的元素合并到子表单中
        //console.log('dynamic form merge ', type)
        let label = column.children.column[newIndex].label;
        let clns = column.children.column[newIndex].children.column;
        column.children.column.splice(newIndex, 1);
        if (this.isForm) {
          let divider = {
            label: label,
            component: "el-divider",
            span: 24,
            edit: true,
            display: false,
            placeholder: "",
            labelWidth: "0px",
            params: { html: "", contentPosition: "left" },
          };
          divider.prop = Date.now() + "_" + Math.ceil(Math.random() * 99999); //设置prop
          column.children.column.push(divider);
        }
        column.children.column = column.children.column.concat(clns);
        return;
      }

      const data = this.deepClone(column.children.column[newIndex]);
      if (!data.prop)
        data.prop = Date.now() + "_" + Math.ceil(Math.random() * 99999); //设置prop

      //如果是表单类型的矩阵 就修改span
      if (column.children.type === "form") {
        data.subfield = false;
        data.span = 12;
      } else {
        //如果是表格类型的矩阵 就修改width
        data.subfield = true;
        data.width = 150;
      }
      delete data.icon;
      this.$set(column.children.column, newIndex, { ...data });
      this.selectWidget = column.children.column[newIndex];
    },
    handleWidgetTableSelect(data) {
      this.selectWidget = data;
    },
    handleWidgetTableSelect2(data, index) {
      this.dataIndex = index;
      this.selectWidget = data;
    },
    handleWidgetTableClone(column, item) {
      const data = this.deepClone(item);
      data.prop = Date.now() + "_" + Math.ceil(Math.random() * 99999);
      // console.log("data.prop",data.prop)
      if (specialRelTypes.includes(data.type)) {
        //关联组件删除关联配置
        data.dicData.forEach((dic) => {
          if (dic.joinSubjects) {
            delete dic.joinSubjects;
          }
        });
      }
      data.display = true;
      this.$set(column.children.column, column.children.column.length, {
        ...data,
      });
      this.$nextTick(() => {
        this.selectWidget =
          column.children.column[column.children.column.length - 1];
      });
    },
    handleWidgetTableDelete(column, index) {
      // console.log("column",column)
      let p = new Promise((resolve, reject) => {
        resolve();
      });
      //可关联类型删除时需要将被关联的对象display设置为true
      p.then(() => {
        if (specialRelTypes.includes(this.selectWidget.type)) {
          let joinSubjects = [];
          this.selectWidget.dicData.forEach((dic) => {
            if (dic.joinSubjects) {
              joinSubjects = joinSubjects.concat(dic.joinSubjects);
            }
          });
          if (joinSubjects.length > 0) {
            getAll(this.data.column).forEach((v) => {
              if (joinSubjects.includes(v.prop)) {
                //如果被选择关联 display = false
                v.display = true;
              }
            });
          }
        }
        if (column.children.column.length - 1 === index) {
          if (index === 0) this.selectWidget = column;
          else this.selectWidget = column.children.column[index - 1];
        } else this.selectWidget = column.children.column[index + 1];
        this.$nextTick(() => {
          column.children.column.splice(index, 1);
        });
      });
    },
  },
  watch: {
    select(val) {
      this.selectWidget = val;
    },
    selectWidget: {
      handler(val, newVal) {
        this.$emit("update:select", val);
      },
      deep: true,
    },
  },
};
</script>

<style>
</style>