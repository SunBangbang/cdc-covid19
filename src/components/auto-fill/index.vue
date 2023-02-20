<template>
  <div>
    <el-row style="margin-bottom: 10px;">
      <el-input
          type="textarea"
          :rows="3"
          placeholder="粘贴或输入整段地址，点击“识别”自动拆分姓名、电话和地址。例如：顺小哥，132****0000，广东省深圳市南山区某某街道某某大厦001号"
          v-model="textarea">
      </el-input>
    </el-row>
    <el-row>
      <el-col :span="2" :offset="22">
        <el-button type="danger"
                   @click="handleClick"
                   :disabled="textarea.length === 0"
                   round>
          识别
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import AddressParse from 'address-parse';

export default {
  name: "AutoFill",
  data () {
    return {
      textarea: '',
      disabled:false
    }
  },
  methods:{
    handleClick(){
      if(this.textarea.length === 0){
        this.$emit("handleClick", null);
        return;
      }
      let copy = this.textarea;
      let IDNumber = null;
      let result = {};
      //先识别出身份证号
      let reg = /[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]/g;
      let match = copy.match(reg);
      if(match && match.length === 1){
        IDNumber = match[0];
        result.IDNumber = IDNumber;
        Object.assign(result,this.analyzeIDCard(IDNumber));
        copy = copy.replace(match[0],"");
      }
      //识别电话 姓名 地址
      let r = AddressParse.parse(copy);

      if(r[0].__parse && r[0].__parse === true){
        result.name = r[0].name;
        result.mobile = r[0].mobile;
        result.location = r[0].province+r[0].city+r[0].area+r[0].details;
        this.$emit("handleClick",result);
      }else{
        this.$message.error("识别失败");
      }
    },
    analyzeIDCard(IDCard){
      let result = {};
      if(!IDCard){
        return result;
      }
      //获取性别
      if(parseInt(IDCard.substr(16,1)) % 2 === 1){
        result.sex = '0';
      }else{
        result.sex = '1';
      }
      //获取出生年月日
      var yearBirth = IDCard.substring(6,10);
      var monthBirth = IDCard.substring(10,12);
      var dayBirth = IDCard.substring(12,14);
      //获取当前年月日并计算年龄
      var myDate = new Date();
      var monthNow = myDate.getMonth() + 1;
      var dayNow = myDate.getDay();
      var age = myDate.getFullYear() - yearBirth;
      if(monthNow < monthBirth || (monthNow === monthBirth && dayNow < dayBirth)){
        age--;
      }
      //得到年龄
      result.age = age;
      return result;
    }
  }
}
</script>

<style scoped>

</style>