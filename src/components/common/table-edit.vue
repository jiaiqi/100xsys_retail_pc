<template>
    <div class="table-edit-view">
      <!-- 测试表格 -->
      <!-- <button @click="getData">提交数据</button>
      <button @click="initMeList">初始化</button> -->
      <el-table
      :data="tableData"
      show-summary
      sum-text="合计"
      border
      row-key="_id"
      cell-class-name="tableCellFun"
      :summary-method="getSummaries"
      v-if="getV2Cols">
      <el-table-column :width="header.mWidth" v-for="(header,index) in getV2Cols" v-if="getV2Cols && header.isShow" :key="index" :prop="header.columns" :label="header.label">
           <template slot-scope="scope">
              <rowFormItem :field="header" :isDetail="isDetail" :rowData="scope.row" :dataType="scope.row['_dataType']" :noEditCols="noEditCols" :initValue="scope.row[header.columns]" @valueChange="valueChange($event,scope,header)"></rowFormItem>
          </template>
      </el-table-column>
      <el-table-column
        label="增减行"
        v-if="isDetail != 'detail'"
        width="80">
          <template slot-scope="scope">
            <i class="el-icon-remove red" v-if="!isTypeLast(scope.row)" @click="onRemove(scope)"></i>
            <i class="el-icon-circle-plus green" v-if="isTypeLast(scope.row)" @click="onInsert(scope)"></i>
        </template>
      </el-table-column>
    </el-table>

    <!-- <el-table
      :data="tableData"
      border
      style="width: 100%; margin-top: 20px">
      <el-table-column
        v-for="(row,index) in gridHeader" :key="index" header-align="left">
        <template slot-scope="scope">
            {{formatValue(scope.row, item)}}
        </template>
      </el-table-column>
      
    </el-table> -->
    <el-dialog
      title="增加"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose">
      <span>这是一段信息</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="onTableRowAdd()">确 定</el-button>
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
import parentChildMixin from "../mixin/parent-child-mixin"; // 内存列表js
// import FieldRedundantMixin from "../mixin/field-redundant-mixin"; // 字段上下游js
  /**
   * concepts:
   * row: 一行页面元素，包含多个section;
   * section:  包含多个标签 tab;
   * tab: 标签， 包含标签文字和个数统计；
   */
  import rowFormItem from "./list-row-form-item.vue"
  export default {
    name: "TableList",
    components: {
      rowFormItem
    },

    mixins: [TablePlusMixin,parentChildMixin],

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
        // relationCondition:{},
        onInputValue:false,  // 是否有查询条件
        tableViewData:{
          type:"tablePlus",
          title:"成本测算汇总表",
          isAutoNum:true,
          tableHeader:[{

          }],
          tableData:[],
        },
         tableData: []
      }
    },

    props: {
       
    },

    computed: {
      

    },


    methods: {
      getData(){
        console.log("表格数据",(this.tableData))
      },
      handleClose(done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
      },
      valueChange: function (e,col,header) {
        console.log(e,col,header)
        // return  "tablePlus";
        let rowData = this.tableData[col.$index]
        this.$set(rowData,header.columns,e)
      },
      getService: function () {
        return this.service || this.$route.params.service_name;
      },
      getTableModelData(){
        let table = this.tableData
        return table
      }
    },

    created:function(){
    },
    mounted:function () {
    },
    watch: {
       
    },
    


  }
</script>
<style lang="less">
.tableCellFun{
  padding:0!important;
}
.table-edit-view{
  .red{
    color: red;
  }
  .green{
    color: rgb(5, 192, 30);
  }
  // td{
  //   padding: 0!important;
  // }
  .el-table td {
      padding: 0 0px!important;
      .cell{
        padding: 0 !important;
      }
      .cell{
        >div{
          // text-overflow: ;
        }
      }
  }
  
}
</style>


