export default {
    //如果初始没有占位符就用默认占位符
    beforeUpdate() {
        if(!this.data.placeholder){
            let newLabelsArr = this.data.label.indexOf('、') > -1 ? this.data.label.split('、') :[];
            let  label = `${ newLabelsArr.length > 1 ? newLabelsArr[1] : this.data.label}`;
            this.$set(this.data,"placeholder",`请输入${label}`)
        }
    }
}