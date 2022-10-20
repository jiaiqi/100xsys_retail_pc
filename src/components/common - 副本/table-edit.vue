<template>
    <div class="table-edit-view">
      测试表格
      <el-table
      :data="tableData"
      border
      style="width: 100%">
      <el-table-column
        prop="id"
        label="ID"
        width="180">
      </el-table-column>
      <el-table-column
        prop="name"
        label="姓名">
      </el-table-column>
      <el-table-column
        prop="amount1"
        label="数值 1">
      </el-table-column>
      <el-table-column
        prop="amount2"
        label="数值 2">
      </el-table-column>
      <el-table-column
        prop="amount3"
        label="增减行"
        width="80">
        <template slot-scope="scope">
          <i class="el-icon-remove red" @click="onRemove()"></i>
          <i class="el-icon-circle-plus green" @click="onInsert()"></i>

          
      </template>
      </el-table-column>
    </el-table>

    <el-table
      :data="tableData"
      border
      style="width: 100%; margin-top: 20px">
      <el-table-column
        v-for="(row,index) in gridHeader" :key="index" header-align="left">
        <template slot-scope="scope">
            {{formatValue(scope.row, item)}}
        </template>
      </el-table-column>
      
    </el-table>
    <el-dialog
      title="增加"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose">
      <span>这是一段信息</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
    title="删除"
    :visible.sync="dialogVisibleOnRemove"
    width="30%"
    :before-close="handleClose">
    <span>这是一段信息</span>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
    </span>
  </el-dialog>
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
import TablePlusMixin from "../mixin/table-plus-mixin"; // 列表js
// import ListPopupMixin from "../mixin/list-popup-mixin"; // 弹出列表js
// import CustButtonMinx from "../mixin/cust-button-minx"; // 自定义按钮js
// import MemListMixin from "../mixin/mem-list-mixin"; // 内存列表js
// import FieldRedundantMixin from "../mixin/field-redundant-mixin"; // 字段上下游js
  /**
   * concepts:
   * row: 一行页面元素，包含多个section;
   * section:  包含多个标签 tab;
   * tab: 标签， 包含标签文字和个数统计；
   */
  export default {
    name: "TabList",
    components: {
    },

    mixins: [TablePlusMixin],

    data() {
      return {
        dialogVisibleOnRemove:false,
        dialogVisible:false,
        initalData:[{
          "seq":"一",
          "dev_dict":"直接费",
          "child":[
              {
              "seq":"1",
              "dev_dict":"直接费"
              },{
              "seq":"2",
              "dev_dict":"人工费"
              },{
              "seq":"3",
              "dev_dict":"材料费"
              },{
              "seq":"4",
              "dev_dict":"机械费"
              },{
              "seq":"5",
              "dev_dict":"分包费"
              }
            ]
          },{
          "seq":"二",
          "dev_dict":"其他直接费",
          "child":[
              {
              "seq":"1",
              "dev_dict":"承包商临时设施费"
              },{
              "seq":"2",
              "dev_dict":"提供给业主/监理的服务"
              },{
              "seq":"3",
              "dev_dict":"调遣费"
              },{
              "seq":"4",
              "dev_dict":"试验检测费"
              },{
              "seq":"5",
              "dev_dict":"HSE专项经费"
              }
            ]
        }],
        isDraft:false,
        tabs: [],
        cols:[],
        sections: [],
        isDefault:null,
        relationCondition:{},
        onInputValue:false,  // 是否有查询条件
        tableViewData:{
          type:"tablePlus",
          title:"成本测算汇总表",
          isAutoNum:true,
          tableHeader:[{

          }],
          tableData:[],
        },
         tableData: [{
          id: '12987122',
          name: '王小虎',
          amount1: '234',
          amount2: '3.2',
          amount3: 10
        }, {
          id: '12987123',
          name: '王小虎',
          amount1: '165',
          amount2: '4.43',
          amount3: 12
        }]
      }
    },

    props: {
       pageType:{
         type:String,
         default:"add"
       }
    },

    computed: {
      

    },


    methods: {
      onRemove(){
        this.dialogVisible = true
      },
      onInsert(){
        this.dialogVisibleOnRemove = true
      },
      handleClose(done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
      },
      listType: function () {
        return  "tablePlus";
      },
      getService: function () {
        return this.service || this.$route.params.service_name;
      },
      buildSections: function (tabs) {
        // generate tab.condition, order, depend_sections from json string to js object/array
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
            tab._type = mc.type || null
            tab._colName = mc.colName || null
            tab.inputType = mc.inputType || null
            tab.showAllTag = mc.showAllTag || false
            tab.default = mc.default || '',
            tab.placeholder = mc.placeholder || '请输入...'

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
            tabsData.push(tab)
        })
        self.tabs = tabsData

        
      }
    },

    created:function(){
      // this.service=this.$router.parmes.service_name
    },
    mounted:function () {
      // window.tabs = this;
      // this.loadColsV2(this.getService(), this.listType()).then(response => {
      //   if (response && response.data && response.data.data && response.data.data.tabs) {
      //     let tabs = response.data.data.tabs;
      //     this.cols = response.data.data.srv_cols
      //     if (!tabs || tabs.length == 0) {
      //       return
      //     }

      //     this.buildSections(tabs);
      //   } else {
          
      //   }
      // })
    },
    watch: {
       
    },
    


  }
</script>
<style lang="less" scoped>
.table-edit-view{
  .red{
    color: red;
  }
  .green{
    color: rgb(5, 192, 30);
  }
}
</style>


