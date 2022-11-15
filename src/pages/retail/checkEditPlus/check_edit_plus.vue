<template>
  <div>
      <el-tabs v-model="activeName" @tab-click="handleClick(activeName)">
        <el-tab-pane :label="tab.label" :name="tab.name" v-for="(tab,index) in tabPanls" :key="index">
            <listTab :ref="tab.name" :tableButtonRouterType="'checkEditPage'" 
              @on-grid-button="onClickGridButton($event)" :service="getService()" v-if="tab.tabType == 'list' && activeName == tab.name"></listTab>
            <addform :ref="tab.name" v-if="tab.tabType == 'form' && activeName == tab.name" nav2LocationStr="check-editer" :name="tab.name" :service="tab.name" @action-complete="actionComplete($event)">
            </addform>
          
        </el-tab-pane>
        <!-- <el-tab-pane label="定时任务补偿" name="fourth">
            listpage formpage
        </el-tab-pane> -->
    </el-tabs>
    <!-- <editGrid :service="service"></editGrid> -->
  </div>

 
</template>

<script>
  // import editGrid from "./edit-grid-plus.vue"; 
  import listTab from "@/components/common/tab-list2.vue";
  import addform from "@/pages/retail/checkEditPlus/form-plus.vue";
  // import update from "@/pages/retail/checkEditPlus/update.vue";
//   import SimpleUpdate from "./simple-update";
//   import List from "./list";
//   import Vue from 'vue'
//   import Treegrid from "./treegrid";
//   // 表头的筛选过滤条件 2020 版
//   import filterTabs from "./filter-tabs"

  /**
   * concepts:
   * row: 一行页面元素，包含多个section;
   * section:  包含多个标签 tab;
   * tab: 标签， 包含标签文字和个数统计；
   */
  export default {
    name: "checkEditer",
    components: {
      listTab,
      addform
      // update
    },

    mixins: [],
    data() {
      return {
        isDraft:false,
        tabPanls: [
        //     {
        //     name:"second",
        //     label:"2222",
        //     tabType:"form",   //form   list   
        //     listConfig:{
        //         service:"",
        //         isPaging:true,
        //         isRowButton:true,
        //         isHealth:true
        //     }, 
        // }
        ],
        activeName: 'second',
        service:"",
        pageActiveType:"add" // add  update list
      }
    },

    props: {
      
    },

    computed: {
      rows: function () {
        let rows = [];
        let activeRow = {sections: []};
        for (let section of this.sections) {
          let tabsDatab = section.tabs
            for(let j =0 ;j<tabsDatab.length;j++){
                // section.tabs[j]['isActive'] = false
              }
          if (section.section_newline === "是") {
            if (activeRow.sections.length > 0) {
              rows.push(activeRow)
            }
            activeRow = {sections: []};
          }
          
          activeRow.sections.push(section)
        }

        if (activeRow.sections.length > 0) {
          rows.push(activeRow)
        }

        return rows;
      },

      gridData: function () {
        return this.$refs.list.gridData;
      },

      getDefaultConditions: function () {
        let conditions = [];
        for (let section of this.sections) {
          for (let tab of section.tabs) {
            if (tab.isActive && tab.conditions) {
              tab.conditions.forEach(item => conditions.push(item))
            }
          }
        }

        return conditions;
      }

    },


    methods: {
      actionComplete(e){
        console.log("actionComplete",e)
        if(e=='submit'){
           this.activeName = this.tabPanls[1].name
           this.pageActiveType = 'list'
        }
      },
      handleClick(tab, event) {
        console.log('3',tab, event);

      },
      onClickGridButton(e){
        if(e.button_type == 'add'){
          this.activeName = this.tabPanls[0].name
          this.pageActiveType = 'add'
        }
      },
      buildAddTab(button){
          let btn = button
          if(btn.button_type == 'add' && btn.permission == true){
              let tab = {
                  name:btn.service_name,
                 label:btn.service_view_name,
                 tabType:"form",   //form   list
                 app:btn.application

              }
               this.tabPanls.unshift(tab)
               this.activeName = tab.name
          }
         
      },
      //---- Basics 
     
      v2LoadedIsDraft(e){
       // console.log('v2LoadedIsDraft',e)
        this.isDraft = e.isDraft
        
      },
      getTableDatas(){
        let self = this
        let tabsConds = this.$refs.filterTabs.buildConditions()
        // this.$set('relationCondition',tabsConds)
        this.relationCondition = tabsConds
        setTimeout(function(){
          self.$refs.list.loadTableData();
        },100)
         
        //console.log("tabsConds",tabsConds)
      },
    

      listType: function () {
        return this.isTreeReal() ? "treelist" : "list";
      },

      isTreeReal: function () {
        if (this.$route && this.$route.path && this.$route.path.indexOf("treegrid") > 0) {
          return true;
        }

        return this.isTree;
      },

 

      isMem: function () {
        let list = this.$refs.list;
        return list.isMem()
      },

     

      getService: function () {
        return this.service || this.$route.params.service_name;
      },

  
    },

    
    mounted:function () {
      window.tabs = this;
      let self = this
      this.loadColsV2(this.getService(), this.listType()).then(response => {
        if (response && response.data && response.data.data && response.data.data.tabs) {
          let data = response.data.data;
          let tab = {
            name:data.service_name,
            label:data.service_view_name,
            tabType:"list"
          }
          this.tabPanls.push(tab)
          let addBtn = data.gridButton.filter((item)=>{
              if(item.button_type =="add"){
                  return item
              }
          })
          if(addBtn.length > 0 ){
                this.buildAddTab(addBtn[0])
          }
          
        }
      this.service = this.$route.params.service_name
        })
    },
    watch: {
        'isDefault': {
          deep: true,
          immediate: true,
          handler: function (val, oldVal) {

              if(val){
                
              }
          }
        },
        "pageActiveType":{
          deep: true,
          immediate: true,
          handler: function (val, oldVal) {

              if(val == 'list'){
                
              }
          }
        }
    },
    


  }
</script>



