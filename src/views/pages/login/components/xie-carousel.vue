<template>
    <div>
        <el-carousel trigger="click"
                     height="150px"
                     indicator-position="none"
                     :autoplay="false"
                     :initial-index="index"
                     :height="height"
                     arrow="never"
                     :loop="true"
                     ref="carousel">


            <slot></slot>

        </el-carousel>

    </div>
</template>

<script>
    export default {
        name: "xie-carousel",
        props:['index','height'],
        data(){
            return {
                length:4
            }
        },
        watch:{
            index(newIndex){
                this.setActiveItem(newIndex);
                this.$emit('update:index',newIndex);
                console.log('change',newIndex);
            }
        },
        methods:{
            nextPage(){

                this.$refs.carousel.next();
                // this.index=(this.index+1)%this.length;
                // console.log(this.index);
            },
            prevPage(){
                this.$refs.carousel.prev();
                // this.index=(this.index+this.length-1)%this.length;
            },
            setActiveItem(index){
                this.$refs.carousel.setActiveItem(index);
            }


        }

    }
</script>

<style scoped>

</style>