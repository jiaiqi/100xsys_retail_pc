import {hotTableMetadata} from "../model/Field";
import {createLinkUrlFunc} from "../../util/FieldUtil";
import {dispCol2ValCol} from "../../util/NameUtil";
import {GridInfo} from "../model/GridInfo";
import {wrapButton, wrapHeader,getButtonPara} from "../common/wrapper_util";
import {getUnitData} from "../../util/UnitUtil";
import * as DataUtil from "../../util/DataUtil";

export default {
  data() {
    return {
      tableEditBtnConfig:[{
        name:"同级之前",
        key:"RBe"
      },{
        name:"同级之前",
        key:"RNext"
      },{
        name:"下级之前",
        key:"CBe"
      },{
        name:"下级之后",
        key:"CNext"
      }],
      tableData: [],   // 可标记表格用户添加数据
      initTableData:[],
      foreignKey:null,
      v2Config:null,
      oldData:[],
    }
  },
  props: {
    name: {
      type: String,
      default: 'main'
    },
    listMainFormDatas:{
      type: Object,
      default: function () {
        return null
      }
    },
    service: {
      type: String
    },
    card: {
      type: String
    },
    pageSize: {
      type: Number,
      default: null,
    },
    searchForm: {
      type: Boolean,
      default: function () {
        return true;
      }
    },
    defDataPara: {
      type: Object,
      default: function () {
        return null;
      }
    },
    mainFormData:{
      type: Object,
      default: function () {
        return null;
      }
    },
    readOnly: {
      type: Boolean,
      default: function () {
        return false;
      }
    },

    listType: {
      type: String,
      default: function () {
        return "list";
      }
    },
    existsGridButton: {
      type: Boolean,
      default: function () {
        return true;
      }
    },
    existsRowButton: {
      type: Boolean,
      default: function () {
        return true;
      }
    },
    defaultCondition: {
      type: Array,
      default: function () {
        return [];
      }
    },
    defaultOrder: {
      type: Array,
      default: function () {
        return [];
      }
    },

    operate_params: {
      type: Object,
      default: function () {
        return null;
      }
    },
    hideButtons: {
      type: Boolean,
      default: false,
    },

    hidePagination: {
      type: Boolean,
      default: false,
    },

    mapcondition: {
      type: Object
    },
    relationCondition:{
      type: Object
    },
    childforeignkey: {
      type: Object
    },
    childforeignvalue: {
      type: String
    },
    mergeCol: {
      type: Boolean,
      default: true,
    },
    gridDataFilter: {
      type: Function,
      default: null,
    },
    tableHeight: {
      type: Number,
      default: null,
    },

    shouldLoadFromDb: {
      type: Boolean,
      default: true,
    },
    showPagination:{
      type: Boolean,
      default: true,
    },
    pageIsDraft: {
      type: String,
      default: 'norm',
    },
    pageType:{
      type:String,
      default:"norm",
    },
    "defaultDirtyFlags":{
      type:String,
      default:"norm",
    }
  },
  computed: {
    isDetail(){
      let is = ''
      is = this.listType.indexOf('detail') !== -1 ? 'detail' : is
      is = this.listType.indexOf('add') !== -1 ? 'add' : is
      is = this.listType.indexOf('update') !== -1 ? 'update' : is

      return is
    },
    getServiceName(){
       let srv = null
       srv = this.service
       return srv
    },
    addSevName(){
      let datas = this.v2Config ? this.v2Config.gridButton :[]
      let srv = ""
      // if(datas){
       for(let key = 0;key < datas.length;key++){
         console.log("addService",key)
         if(datas[key].button_type && datas[key].button_type == "add"){
           srv = datas[key].service_name
         }
       }
      
      return srv
    },
    noEditCols(){
       let col = this.v2Config && this.v2Config.init_data_cfg ?  this.v2Config.init_data_cfg.no_edit_cols : []
       return col
    },
    initData(){
      let initData = this.v2Config && this.v2Config.init_data_cfg ?  this.v2Config.init_data_cfg.data : []
      return initData
    },
    getV2Cols(){
       let cols = this.v2Config? this.v2Config.srv_cols : []
       cols = cols.filter((item) =>{
         if(item.in_list !==0){
          return item
         }
          
       })

       return  this.getColsUpdated(cols)
    },
    isUpdateCols(){
      let srvCols = this.v2Config? this.v2Config.srv_cols : []
      let cols = ['id']
      srvCols.forEach((item) => {
        if(item.in_update == 1){
          cols.push(item.columns) 
        }
      })
      return cols
    },
    getTableEditDataRun(){
      let initalData = this.keyMoreConfigRun ? this.keyMoreConfigRun.initalData : []
      let newArr = []
      let rootData = initalData.map((item)=>{
          let num = item.seq.split("#")
          let seqNum = item.seq.replace('/#/','')
          item._seq = 0+seqNum  // 总编号
          item._sortNum = num[num.length - 1]  // 同级排序
          item._sortCode = item.seq   //原始编号
          return item
      })
      rootData = rootData.sort((a,b) => a._seq - b._seq)
      rootData.forEach((item) =>{
        if(item.child){
          newArr.push(item)
          let childData = item.child
          // childData = childData.sort((a,b) => a - b)
          childData = childData.map((sitem) =>{
            let snum = sitem.seq.split("#")
            let sseqNum = snum.join('')
            sitem._seq = Number(sseqNum)   // 总编号
            sitem._sortNum = Number(snum[snum.length - 1])  // 同级排序
            sitem._sortCode = sitem.seq   //原始编号
            return sitem
          })
          newArr = newArr.concat(childData)
        }
      })
      newArr = newArr.concat(this.tableData)
      newArr = newArr.sort((a,b) => a._seq - b._seq)
      return newArr
   },
   condition(){
      let cond = this.defaultCondition
      return cond
   }
  },
  created:function(){
     let foreignKey = this.childforeignkey
     this.initMeList()
  },
  mounted() {
    
  },
  methods: {
    checkToTableData(e,old){
       
    },
    async initMeList(){
      let use_type = "ramchildlist"
      let serviceName = this.getServiceName
      
        if(serviceName == "srvmarket_pre_cost_calc_part_select"){
          await this.loadColsV2(serviceName, use_type).then((res) =>{
            console.log("m list to use ramchildlist",res)
            this.v2Config = res.data.data
            if(this.v2Config){
              if(this.defaultDirtyFlags == 'add'){
                this.buildTableData(this.v2Config.init_data_cfg)
              }else{

                this.getChildrenListData()
             }
              
            }
          })
        }
      
      
      
    },
    getChildrenListData(){
      // if (this.defaultapi == "select") {
        // console.log(this.pageSize)
        
        let relationCondition = this.relationCondition
        // console.log(this.showPagination)
        
        let cond = []
        for(let key of this.condition){
          let item = {
            colName:key.colName,
            ruleType:key.ruleType
          }
          item.value = key.value ?key.value :  key.valueFunc()
          cond.push(item)
        }

        // service_name, condition, page, order, group, mapcondition, app,isproc,columns,relationCondition
        return this.select(
          this.getServiceName,
          cond
        ).then(response => {
          // this.tableData = response.body.data;
          let page = response.body.page
          

          this.buildTableData(response.body.data)

          // this.$emit("list-data-loaded", this);
          loading.close();
        }).finally(() => {
          loading.close();
        });
      // }
    },
    buildTableData(e){
      console.log("buildTableData : ",e)
      if(Object.prototype.toString.call(e) === '[object Object]'){
        console.log("buildTableData2",Object.prototype.toString.call(e))
        let initData = e ? e.data : []
        this.initTableData = this.bxDeepClone(initData)
        let tableData = this.tableData
        for(let key in initData){
          // console.log(key)
          initData[key]["_id"] = (key+1) * 100
          initData[key]["_dataType"] = "initData" // userData
          this.tableData.push(initData[key])
        }
      }else{
        console.log("buildTableData3",Object.prototype.toString.call(e),e,this.initData)
        let initData = e ? e : []
        let initTableData = this.bxDeepClone(initData)
        this.oldData = this.bxDeepClone(initData)
        let tableData = this.tableData
        if(initData.length == 0){
          initData = this.bxDeepClone(this.initData)
          console.log("buildTableData4",initData,e)
          
          for(let idata in initData){
            initData[idata]["_id"] = (idata+1) * 100
            initData[idata]["_dataType"] = "initData" // userData
            this.tableData.push(initData[idata])
          }
        }else{
          for(let key in initData){
            for(let idata in initTableData){
              if(initTableData[idata].item == initData[key].item){
                initData[key]["_dataType"] = "initData" // userData
                this.tableData.push(initData[key])
              }
            }
          }
        }
        
      }
      
      // tableData = initData.map((item,index) =>{
      //   item._id = (index+1) * 100
      //   item._dataType = "initData" // userData
      // })

    },
    getColsUpdated(e){
      let cols = e
      let colsBuildTemp = {
         label:"",
         columns:"",
         frontCompType:"",
         updated:false,
         valueType:"string",
         frontPlayValue:"",
         formModelValue:null,
         validate:null,
         validateFun:null,
         _col:null

      }
      cols = cols.map((item)=>{
           return colsBuildTemp = {
            label:item.label,
            columns:item.columns,
            frontCompType:(item.col_type == 'double' || item.col_type == 'int' ? 'number' : "text"),
            updated:item.in_update == 1,
            isShow:item.in_list == 1,
            valueType:"string",
            frontPlayValue:"",
            formModelValue:null,
            validate:null,
            validateFun:null,
            mWidth:item.list_min_width + 'px',
            _col:item
         }
      })
      return cols
    },
    onRemove(e){
      // this.dialogVisible = true
      let onIndex = e.$index
      console.log(onIndex)
      this.tableData.splice(e.$index,1);
    },
    onInsert(e){
      // this.dialogVisibleOnRemove = true
      console.log("onInsert",e)
      let itemData = e.row
      let onIndex = e.$index
      let insertNum = 0
      let isUpRoot = 0
      let allList = this.tableData
      
      allList.forEach((item,index)=>{
        let isRoot = this.isTypeLast(item)

          if(index > onIndex && !isRoot && isUpRoot == 0){
            insertNum++
          }else if(index > onIndex && isRoot && isUpRoot == 0){
            isUpRoot = 1
          }
      })
      let newRowData = this.bxDeepClone(allList[onIndex + insertNum]) 
      console.log("onIndex",allList,onIndex,insertNum,allList[onIndex + insertNum])
      newRowData["_id"] = newRowData._id ? newRowData._id + 1 : newRowData.no + 1
      newRowData["no"] = this.getTreeNo(allList[onIndex + insertNum]).no
      console.log("插入行一行",allList[onIndex + insertNum],allList[onIndex + insertNum]["parent_no"])
      newRowData["parent_no"] = allList[onIndex + insertNum]["parent_no"] ? allList[onIndex + insertNum].parent_no : ("" + allList[onIndex + insertNum].no)
      for(let key in newRowData){

        if(key !== "_id" && key !== 'no' && key !== 'path' && key !== 'parent_no'){
          newRowData[key] = ""
        }else if(key == "_dataType"){
          newRowData[key] = "user"
        }
        
      }
      newRowData['ratio'] = 0
      newRowData['t_price'] = 0
      delete newRowData.id
      this.tableData.splice(onIndex + insertNum+1,0,newRowData);
    },
    getTreeNo(e){
      let no = Number(e.no)  + 1
      if(e.parent_no){
        // path = e.path.replace("/" + e.no + "/", "/" + no + "/")
        if(!e.parent_no){
          // path = "/" + ("" + e.no)  + e.path.replace("/" + e.no + "/", "/" + no + "/") 
        }
      }
      
      return {no}
    },
    isTypeLast(e){
       if(!e.parent_no){
         return true
       }else{
         return false
       }
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '总价';
          return;
        }
        const values = data.map((item,index) => {
          if(!item["parent_no"]){
            return Number(item[column.property])
          }else{
            return 0
          }
        });
        
        if (!values.every(value => isNaN(value))  && column.property == 't_price') {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + (curr * 100);
            } else {
              return prev;
            }
          }, 0);
          sums[index] = (sums[index]/100).toFixed(2)
        } else {
          sums[index] = '';
        }
      });

      return sums;
    },
    buildChildforeignkey(item){

    },
    buildMlistRunQuries(fk) {
      // let  [];
      console.log("m list")
      let queries = [];
      let datas = this.bxDeepClone(this.tableData) 
      let foreignKeyCond = this.defaultCondition[0]
      datas = datas.map((item)=>{
        for(let key in item){
          if(key.indexOf("_") == 0  || key=='path' || this.isUpdateCols.indexOf(key) == -1){
            
            delete item[key]
          }
          item[foreignKeyCond.colName] = foreignKeyCond.valueFunc()
        }

        return item
      })
      let addQuery = {
        serviceName: this.addSevName,
        data:datas
      }

      if(fk){
        addQuery.depend_keys = [{
          type: "column", depend_key: fk.referenced_column_name, add_col: fk.column_name
        }];
      }
      addQuery['gridMultiEdit'] = true
      if(this.oldData.length > 0){
        addQuery["oldData"] = this.oldData
      }
      queries.push(addQuery)

      console.log("m list data:",queries)
      return queries;
    },

  }
 }