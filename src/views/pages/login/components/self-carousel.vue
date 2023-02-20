<template>
    <div>
        <el-carousel trigger="click"
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
                length:5
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
            },
            prevPage(){
                this.$refs.carousel.prev();
            },
            setActiveItem(index){
                this.$refs.carousel.setActiveItem(index);
            }
        }

    }
</script>

<style scoped>

</style>
