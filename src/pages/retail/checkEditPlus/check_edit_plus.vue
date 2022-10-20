<template>
  <div>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane :label="tab.label" :name="tab.name" v-for="(tab,index) in tabs" :key="index">
            <list :service="getService()" v-if="tab.tabType == 'list'"></list>
            <add v-else-if="tab.tabType == 'form'" :name="tab.name" :ref="tab.name" :service="tab.name" >
            </add>
        </el-tab-pane>
        <!-- <el-tab-pane label="定时任务补偿" name="fourth">
            
        </el-tab-pane> -->
    </el-tabs>
    <!-- <editGrid :service="service"></editGrid> -->
  </div>

 
</template>

<script>
  import editGrid from "./edit-grid-plus.vue"; 
  import list from "@/components/common/tab-list2.vue";
  import add from "./form-plus.vue";
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
      editGrid,
      list,
      add
    },

    mixins: [],

    data() {
      return {
        isDraft:false,
        tabs: [
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
        service:""
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
      handleClick(tab, event) {
        // console.log(tab, event);
      },
      buildAddTab(button){
          let btn = button
          let tab = {
                  name:'',
                 label:'',
                 tabType:"form",   //form   list
                 app:''

              }
          if(btn.button_type == 'add' && btn.permission == true){
              let tab = {
                  name:btn.service_name,
                 label:btn.service_view_name,
                 tabType:"form",   //form   list
                 app:btn.application

              }
               this.tabs.push(tab)
          }
         
      },
      //---- Basics 
      onFilterChange(e){
        this.onInputValue = e
        if(e){
          let tabsConds = this.$refs.filterTabs.buildConditions()
          this.relationCondition = tabsConds
        }
      },
      onReset(){
        this.$refs.filterTabs.onReset()
      },
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
      sectionVisible(section) {
        let dependSectionNames = section.depend_sections;
        if (_.isArray(dependSectionNames) && dependSectionNames.length > 0) {
          if (section.depend_display === true) {
            return true;
          }

          // if any depend section has be selected, show itself
          return dependSectionNames.filter(dependSectionName => {
            let tmp = this.sections.filter(section => section.list_tab_no === dependSectionName);
            if (tmp && tmp.length > 0) {
              let dependSection = tmp[0];
              if (dependSection.tabs) {
                let dependHasValue = dependSection.tabs.filter(tab => tab.isActive && tab.label !== '不限').length > 0;
                return dependHasValue;
              }

              
              return false;
            } else {
              
              return false;
            }
          }).length > 0;
        } else {
          return true;
        }

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

      getDisplay: function (index) {
        return index === 1 ? "inline-block" : "block"
      },

      getButtonColor: function (tab, invert) {
        let flag = tab.isActive;
        if (invert) {
          flag = !flag
        }
        return flag ? "orange" : "#00B0F0";
      },

      isMem: function () {
        let list = this.$refs.list;
        return list.isMem()
      },

      buildExecutors4Edit: function () {
        let list = this.$refs.list;
        return list.buildExecutors4Edit()
      },

      getService: function () {
        return this.service || this.$route.params.service_name;
      },

      onListDataLoaded: function (tab, list) {
        if (!tab.hasOwnProperty("totalCount")) {
          this.$set(tab, "totalCount", list.gridPage.total)
        }
      },


      activateTab: function (section, tab) {

        if (section && section.tabs) {
          section.tabs.filter(item => item !== tab).forEach(item => this.$set(item, "isActive", false))
        }
        this.$set(tab, "isActive", !tab.isActive)
        let hasSelection = _.find(section.tabs, item => item.label !== '不限' && item.isActive);
        this.$nextTick(_ => {
          // find affected group sections and rebuild them
          this.sections.filter(section2 => section2.section_type === "groupby" && section2.depend_sections && section2.depend_sections.indexOf(section.list_tab_no) >= 0)
            .forEach(section2 => {
              if (hasSelection || section2.depend_display === true) {
                this.buildGroupSection(section2);
              } else {
                section2.tabs = [];
              }
            })

          this.$refs.list.loadTableData();
        })
      },

      shouldLoadList: function (tab) {
        return !!this.loadTabs[tab.label]
      },

      getButtonCount: function (tab) {
        if (tab.totalCount && tab.totalCount > 0) {
          return `(${tab.totalCount})`
        } else {
          return ""
        }
      },


      buildGroupSection: function (section) {
        try {
          let group = eval(section.section_groups)
          let colName = group[0].colName

          let conditions = [];
          let page = null;
          let orders = null;

          (section.depend_sections || []).forEach(dependSectionName => {
            let dependSection = _.find(this.sections, sec => sec.list_tab_no === dependSectionName);
            if (!dependSection) {
              return;
            }

            if (dependSection.section_type === "groupby") {
              let groupByCol = _.find(eval(dependSection.section_groups), ele => ele.type === 'by').colName;
              let activeTab = _.find(dependSection.tabs, tab => tab.isActive && tab.label !== '不限');
              if (activeTab) {
                let condition = {
                  colName: groupByCol,
                  ruleType: "eq",
                  value: activeTab.label,
                }
                conditions.push(condition);
              }

            } else {
              // TODO: should be concrete
            }
          })


          return this.select(this.getService(), conditions, page, orders, group)
            .then(response => {

              section.tabs = []

              // add unfilter tab,
              let unfilterTab = {
                label: "不限",
                conditions: [],
              }

              this.addTab(section, unfilterTab);

              // add returned group tabs
              let data = response.data.data;
              for (let item of data) {
                if (item.group_count == 0) {
                  continue;
                }

                let conditions = [{
                  colName,
                  ruleType: "eq",
                  value: item[colName],
                }]

                let tab = {
                  label: item[colName],
                  default_selected_expr: section.default_selected_expr,
                  conditions: conditions,
                  totalCount: item.group_count,
                  isActive:false
                }


                this.addTab(section, tab);

              }

            })
        } catch (e) {
          
        }
      },


      addTab: function (activeSection, tab) {
        activeSection.tabs.push(tab)
      },

      buildSections: function (tabs) {
        // generate tab.condition, order, depend_sections from json string to js object/array
        console.log("buildSections",tabs)
        let self = this
        let tab = {}
        let tabsData = []
        tabs.forEach((t)=>{
          tab = {
              service:null,
              table_name:null,
              orders:null,
              conditions:null,
              seq:null,
              parent:null,
              label:null,
              list_tab_no:null,
              more_config:null,
              inputType:null
            }
            let mc = JSON.parse(t.more_config)
            tab.more_config = mc
            tab.service = t.service
            tab.table_name = t.table_name
            tab.conditions = t.conditions
            tab.orders = t.orders
            tab.default = mc.default
            tab.seq = t.seq
            tab.label = t.label
            tab.list_tab_no = t.list_tab_no
            tab._data = t
            tab._options = []
            tab._type = mc.type || null
            tab.option_list = mc.option_list || null
            tab._colName = mc.colName || null
            tab.inputType = mc.inputType || null
            tab.showAllTag = mc.showAllTag || false
            tab.default = mc.default || '',
            tab.placeholder = mc.placeholder || '请输入...'
            tab.remoteMethod=""

            if(tab._colName){
              tab._colName = tab._colName.split(',')
              let cols = tab._colName
              let srvCols = self.cols
              tab['_colSrvData'] = []
              // console.log("tab",tab)
              for(let c=0;c<cols.length;c++){
                  for(let cs = 0;cs<srvCols.length;cs++){
                    if(cols[c] === srvCols[cs].columns){
                      tab._colSrvData.push(srvCols[cs])
                    }
                  }
              }
              
            }
            if(tab.inputType == 'fk'){
             let cond=[
              {"colName": tab.option_list.key_disp_col,
            "ruleType": "[like]",
            "value": ''}
          ]
          let options =[]
              self.select(tab.option_list.serviceName, cond, null, null, null, null,null, null, null, null,false).then((res) =>{
              let resData = res.data.data
                for(let i =0;i<resData.length;i++){
                    let item = resData[i]
                    let opt = {
                            value:item[tab.option_list.refed_col],
                            label:item[tab.option_list.key_disp_col]
                    }
                     options.push(opt)
                    
                }

                // self.formModel[e.list_tab_no]['options'] = options
                tab["_options"] = options
                tab["page"] = res.data.page
                // return options
                console.log("options",options)
                //  resolve(options)
             })
            }
            tabsData.push(tab)

        })
        if(!self.tabsBuild){
          self.tabs = tabsData
          self.tabsBuild = true
        }
        

        
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
          this.tabs.push(tab)
          this.activeName = tab.name
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
    },
    


  }
</script>



