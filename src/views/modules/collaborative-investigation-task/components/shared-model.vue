<template>
  <el-row>
    <el-col
      :xl="{ span: 10 }"
      :lg="{ span: 16 }"
      :md="{ span: 24 }"
      :sm="{ span: 24 }"
    >
      <el-table :data="data" border stripe>
        <el-table-column prop="label" label="模块名称">
          <template slot-scope="scope">
            <label :style="scope.row.special === 1 ? 'color:red;' : ''"
              >{{ scope.row.label }}
            </label>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="共享类型">
          <template slot="header">
            <el-popover
              placement="top-start"
              title="共享类型说明"
              width="600"
              trigger="hover"
            >
              <el-row>
                <el-row>1、不共享：协查员无法获得此模块的内容。</el-row>
                <el-row
                  >2、仅查看：共享此模块，协查员将能正常获得此模块的内容，但是无法对此模块内容进行编辑。</el-row
                >
                <el-row
                  >3、可编辑：共享此模块，协查员将能正常获得此模块的内容，同时也可以对此模块内容进行编辑。</el-row
                >
                <el-row>4、有些模块为必需共享的模块，这些模块必需共享。</el-row>
                <el-row
                  >5、有些模块为必需可编辑模块，如：流行病学调查情况,
                  密切接触者情况, 疫点判定情况。</el-row
                >
              </el-row>
              <span slot="reference"
                >共享类型<i class="el-icon-info" style="margin-left: 5px"></i
              ></span>
            </el-popover>
          </template>
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.type"
              placeholder="请选择共享类型"
              style="width: 100%"
              size="mini"
            >
              <el-option
                v-for="(item, index) in options"
                :disabled="checkDisabled(scope.row, index)"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>

<script>
import AppConstant from "@/utils/AppConstant";
const FormModuleOperType = AppConstant.FormModuleOperType;

export default {
  name: "shared-model",
  props: {
    data: {
      type: Array,
      default: () => {
        return [
          {
            type: 0,
            prop: "p1",
            label: "各系1",
          },
        ];
      },
    },
  },
  data() {
    return {
      checked: [],
      options: [
        { label: "不共享", value: FormModuleOperType.HIDE },
        { label: "仅查看", value: FormModuleOperType.READONLY },
        { label: "可编辑", value: FormModuleOperType.EDIT },
      ],
    };
  },
  created() {
    this.resetDefault();
  },
  methods: {
    resetDefault() {
      //章节特殊处理，全部设置为编辑状态
      const specials = [
        "流行病学调查情况",
        "密切接触者情况",
        "疫点判定情况",
        "接触者情况",
      ];
      this.data.forEach((item) => {
        // console.log('label:', item.label)
        if (item.required && item.type === FormModuleOperType.HIDE) {
          item.type = FormModuleOperType.READONLY;
        }
        specials.some((title) => {
          if (item.label.indexOf(title) !== -1) {
            item.type = FormModuleOperType.EDIT;
            item.special = 1;
            return true;
          }
        });
      });
    },
    checkDisabled(row, index) {
      if (row.required) {
        if (index === 0) {
          //不共享
          return true;
        } else if (index === 1) {
          //仅查看
          return row.special === 1;
        }
      }
      return false;
    },
  },
};
</script>

<style scoped></style>
