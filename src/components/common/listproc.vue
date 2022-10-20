<template>
  <div>

    <el-tabs v-model="activeName" @tab-click="handleClick(activeName)">
      <el-tab-pane :label="waitNum" name="wait">

        <list  ref="wait" list-type="wait" name="wait" :service="service_name" @gridData-change="setTip" @list-loaded="timerRefresh"> </list>
      </el-tab-pane>

      <el-tab-pane :label="myallNum" name="myall">

        <list  ref="myall" list-type="myall" name="myall" :service="service_name" @gridData-change="setTip" @list-loaded="timerRefresh"> </list>

      </el-tab-pane>
      <el-tab-pane :label="mineNum" name="mine">

        <list  ref="mine" list-type="mine" name="mine" :service="service_name" @gridData-change="setTip" @list-loaded="timerRefresh"> </list>

      </el-tab-pane>
      <el-tab-pane :label="processedNum" name="processed">

        <list ref="processed" list-type="processed" name="processed" :service="service_name" @gridData-change="setTip" @list-loaded="timerRefresh"> </list>

      </el-tab-pane>

      <el-tab-pane  :label="allNum" name="userall">

        <list ref="userall" list-type="userall" name="userall" :service="service_name" @gridData-change="setTip" @list-loaded="timerRefresh"> </list>

      </el-tab-pane>

    </el-tabs>

  </div>
</template>

<script>
import list from "./list";

export default {
  components: {
    list
  },
  data() {
    return {
      service_name: this.$route.params.service_name,
      activeName: "wait",
      processedNum: "",
      mineNum: "",
      myallNum: "",
      waitNum: "",
      allNum: ""
    };
  },
  props:{
    service:{
      type:String,
      default:''
    },
  },
  mounted() {
    if(this.service){
      this.service_name = this.service;
    }
  },
  methods: {
    handleClick(activeName) {

      // timerRefresh()

      this.$refs[activeName].loadTableData()
    },
    timerRefresh(listCom) {

      if(top.pathConfig&&top.pathConfig.pages_attribute&&top.pathConfig.pages_attribute.proc_page_refresh_time){

          var timer=parseInt(top.pathConfig.pages_attribute.proc_page_refresh_time)
           setInterval(() => {

            listCom.loadTableData();
           }, timer*1000);
      }
     
    },
    setTip(gridData, listProcType) {
      if(gridData.page){
        if (listProcType == "mine") {
          //this.mineNum = gridData.page.total;
          this.mineNum = "我的申请(" + gridData.page.total + ")";
        } else if (listProcType == "wait") {
          //this.waitNum = gridData.page.total;
          this.waitNum = " 待我处理(" + gridData.page.total + ")";
        } else if (listProcType == "processed") {
          //this.processedNum = gridData.page.total;
          this.processedNum = " 我已处理(" + gridData.page.total + ")";
        } else if (listProcType == "myall") {
          this.myallNum = " 我的全部(" + gridData.page.total + ")";
          //this.myallNum = gridData.page.total;
        }else if (listProcType == "userall") {

            if( gridData.page.total>0){
                  this.allNum = " 全部(" + gridData.page.total + ")";
            }
    
        
          //this.myallNum = gridData.page.total;
        }
      }
      
    }
  }
};
</script>



