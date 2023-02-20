<template>
  <div>
    <el-form-item label="校验" v-show="show"
      ><br />
      是否必填：
      <el-switch
        v-model="data.required"
        :disabled="
          (data.edit !== undefined && !data.edit) || data.fieldRequired
        "
      ></el-switch>
    </el-form-item>
    <el-form-item v-show="fieldShow">
      是否现场必填：
      <el-switch
        v-model="data.fieldRequired"
        :disabled="data.edit !== undefined && !data.edit"
      ></el-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "config-rules",
  props: {
    data: {
      type: Object
      // default:()=>{ return {required: false, pattern: null, fieldRequired: false}}
    }
  },
  data() {
    return {
      show: true,
      fieldShow: false
    };
  },
  created() {},
  mounted() {
    if (this.data.required) {
      this.fieldShow = true;
    }
  },
  methods: {},
  watch: {
    "data.required": function(newVal, oldVal) {
      newVal = newVal === undefined ? false : newVal;
      if (newVal) {
        this.fieldShow = true;
        let requireRule = {
          required: true,
          message: `${this.data.label}必须填写`
        };
        if (this.validatenull(this.data.rules)) {
          this.data.rules = [requireRule];
        } else {
          this.data.rules.forEach((r, index) => {
            if (r.required) {
              this.data.rules.splice(index, 1);
            }
          });
          this.data.rules.push(requireRule);
        }
      } else {
        this.fieldShow = false;
        this.$set(this.data, "fieldRequired", false);
        if (!this.validatenull(this.data.rules)) {
          this.data.rules.forEach((r, index) => {
            if (r.required) {
              this.data.rules.splice(index, 1);
            }
          });
        }
      }
    }
  }
};
</script>
