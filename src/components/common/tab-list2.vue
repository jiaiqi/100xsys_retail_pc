<template>
  <div>
    <filterTabs ref="filterTabs" v-if="tabs.length > 0 && cols.length > 0" :tabs="tabs" :srv="getService()" :cols="cols" @on-input-value="onFilterChange" @on-change="getTableDatas"></filterTabs>
    <!-- <el-row  v-if="tabs.length > 0">
      <el-col :span="24" style="text-align:center">
         <el-button :disabled="!onInputValue" size="mini" type="primary" icon="el-icon-search" plain @click="getTableDatas">查询</el-button>
         <el-button size="mini" type="info" icon="el-icon-refresh" plain  @click="onReset">重置</el-button>
      </el-col>
    </el-row> -->
    <!-- 已废弃的tabs list 2020以前 -->
    <!-- <div v-for="(row, rowIndex) in rows"
         :key="rowIndex"
         style="margin-top: 10px; "
    >
      <template v-for="(section, sectionIndex) in row.sections"
      >
        <div style="margin-left: 1rem; display: inline-block"
             v-show="sectionVisible(section)"
        >
          <i :class="section.section_preicon"></i>
          <span>{{section.section}}</span>
          <i :class="section.section_posticon"></i>

          <el-button v-for=" (tab, tabIndex) in section.tabs"
                     :key="tabIndex"
                     type="text"
                     @click="activateTab(section, tab)">
            <span :style="{color: getButtonColor(tab)}">{{tab.label}}</span>
            <span style="color: #e74e3e"> {{ getButtonCount(tab) }}</span>
          </el-button>
        </div>
      </template>

    </div> -->

    <div>
      <template>
        <treegrid ref="list"
                  v-if="isTreeReal() && storageType === 'db'"
                  :list-type="listType()"
                  :storage-type="storageType"
              :inplace-edit="inplaceEdit"
                  :service="getService()"
                  :default-condition="getDefaultConditions"
        >
        </treegrid> 
        <list ref="list"
              v-else
              :tableButtonRouterType="tableButtonRouterType"
              :list-type="listType()"
              :storage-type="storageType"
              :service="getService()"
              :default-condition="getDefaultConditions"
              :relationCondition="relationCondition"
              :inplace-edit="inplaceEdit"
              :default-inplace-edit-mode="defaultInplaceEditMode"
              :default-dirty-flags="defaultDirtyFlags"
              @grid-data-changed="$emit('grid-data-changed', $event)"
              @on-grid-button="$emit('on-grid-button', $event)"
              @v2-loaded-isDraft="v2LoadedIsDraft($event)"
        >
        </list>
        
        
      </template>
    </div>
  </div>


</template>

<script>
  import SimpleAdd from "./simple-add";
  import SimpleUpdate from "./simple-update";
  import List from "./list";
  import Vue from 'vue'
  import Treegrid from "./treegrid";
  // 表头的筛选过滤条件 2020 版
  import filterTabs from "./filter-tabs"

  /**
   * concepts:
   * row: 一行页面元素，包含多个section;
   * section:  包含多个标签 tab;
   * tab: 标签， 包含标签文字和个数统计；
   */
  export default {
    name: "TabList",
    components: {
      Treegrid,
      SimpleUpdate,
      SimpleAdd,
      List,
      filterTabs
    },

    mixins: [],

    data() {
      return {
        isDraft:false,
        tabs: [],
        cols:[],
        sections: [],
        tabsBuild:false,
        isDefault:null,
        relationCondition:{},
        onInputValue:false  // 是否有查询条件
      }
    },

    props: {
      tableButtonRouterType:{
      type:String,
      default:"bxconfig", // checkEditPage 'bxconfig' 
    },
      service: {
        type: String
      },
      foreignKey: {
        type: Object
      },
      isTree: {
        type: Boolean,
        default: false,
      },
      defaultCondition: {
        type: Array,
        default: function () {
          return []
        }
      },

      searchForm: {
        type: Boolean, default: function () {
          return true
        }
      },

      storageType: {
        type: String,
        default: "db",
      },

      inplaceEdit: {
        type: Boolean,
        default: false,
      },

      defaultInplaceEditMode: {
        type: Boolean,
        default: false,
      },

      defaultDirtyFlags: {
        type: String,
        default: "pristine",
      },
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
        if(Array.isArray(this.defaultCondition)&&this.defaultCondition.length>0){
          this.defaultCondition.forEach(item => {
            conditions.push(item)
          });
        }
        return conditions;
      }

    },


    methods: {
      
      onFilterChange(e){
        let self = this
        this.onInputValue = e
        if(e && self.$refs.filterTabs){
          let tabsConds = self.$refs.filterTabs.buildConditions()
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
        let tabsConds = self.$refs.filterTabs ? self.$refs.filterTabs.buildConditions() : {}
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
            tab.placeholder = mc.placeholder ||  mc.type === 'select' ? '请选择': '请输入'
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
        

        
        // tabs.forEach(tab => {
        //   tab.seq = tab.seq || 0
        //   if (tab.conditions) {
        //     try {
        //       tab.conditions = eval(tab.conditions)
        //     } catch (e) {
              
        //       tab.conditions = [];
        //     }
        //   }
        //   if (tab.orders) {
        //     try {
        //       tab.orders = eval(tab.orders)
        //     } catch (e) {
              
        //       tab.orders = [];
        //     }
        //   }

        //   if (tab.depend_sections) {
        //     try {
        //       let dependConf = eval("(" + tab.depend_sections + ")");
        //       tab.depend_sections = dependConf.sections;
        //       tab.depend_display = dependConf.display;
        //     } catch (e) {
              
        //       tab.depend_sections = [];
        //     }
        //   }
        // })

        // create sections in seq order
        // tabs = _.sortBy(tabs, tab => tab.seq)
        // let activeSection = null
        // for (let tab of tabs) {
        //   if (tab.section) {
        //     activeSection = _.clone(tab);
        //     this.sections.push(activeSection)
        //     this.$set(activeSection, "tabs", [])

        //     // add unfilter tab,
        //     let unfilterTab = {
        //       label: "不限",
        //       conditions: [],
        //     }

        //     this.addTab(activeSection, unfilterTab);

        //     if (tab.section_type === "concrete") {
        //       this.addTab(activeSection, tab);
        //     }
        //   } else {
        //     this.addTab(activeSection, tab);
        //   }
        // }

        // // materialize group by sections
        // let promises = this.sections
        //   .filter(section => {
        //     let isGroupBy = section.section_type === "groupby";
        //     let alwaysDisplay = section.depend_display === true;
        //     let hasNoDependSections = !section.depend_sections || section.depend_sections.length == 0;
        //     return (isGroupBy && (alwaysDisplay || hasNoDependSections))
        //   })
        //   .map(section => this.buildGroupSection(section));

        // Promise.all(promises)
        //   .then(() => {
        //     // activate default tabs
        //     this.sections.forEach(section => {
        //       section.tabs.forEach(tab => {
        //         if (tab.label !== "不限" ) {
        //         // if (tab.label !== "不限" && tab.default_selected_expr) {
        //           /**
        //            * 增加默认配置
        //            */
        //           let moreCfg = JSON.parse(section.more_config)
        //           if(section.more_config !== undefined && section.more_config!== null){
        //             if(moreCfg.hasOwnProperty('default') && section.hasOwnProperty('tabs')){

        //               let defaultCondition = moreCfg.default
        //               if(tab.conditions[0].value === defaultCondition.value){
        //                 // tab['isActive'] = true

        //                   this.activateTab(section, tab);
        //               }
                      
        //             }
        //           }
        //         }
        //         if (tab.label !== "不限" && tab.default_selected_expr) {
        //           let isActive = eval(tab.default_selected_expr);
        //           if (isActive === true) {
        //             this.activateTab(section, tab);
        //           }
        //         }
        //       })
        //     });
        //   })
      },
    },

    
    mounted:function () {
      window.tabs = this;
      let self = this
      this.loadColsV2(this.getService(), this.listType()).then(response => {
        if (response && response.data && response.data.data && response.data.data.tabs) {
          let tabs = response.data.data.tabs;
          this.cols = response.data.data.srv_cols
          if (!tabs || tabs.length == 0) {
            return
          }
          this.buildSections(tabs);
          // 
        } else {
          
        }
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



