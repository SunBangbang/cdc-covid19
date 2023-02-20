<template>
    <div>
        <back-bar ref="back" type="replace"></back-bar>
        <el-card>
           <sample-scattered-detail :query="query" :full="true" :isView="true"></sample-scattered-detail> 
        </el-card>
    </div>
</template>
<script>
import BackBar from "@/components/back-bar/back-bar";
import SampleScatteredDetail from "@/views/modules/survey-form/components/compareData/sample-scattered-detail";
export default {
    name: "investigation-view",
    components: {
      BackBar,
      SampleScatteredDetail
    },
    data() {
      return {
        query: this.$route.query,
      }
    },
}
</script>