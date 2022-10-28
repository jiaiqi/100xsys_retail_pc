import {hotTableMetadata} from "../model/Field";
import {createLinkUrlFunc} from "../../util/FieldUtil";
import {dispCol2ValCol} from "../../util/NameUtil";
import {GridInfo} from "../model/GridInfo";
import {wrapButton, wrapHeader,getButtonPara} from "../common/wrapper_util";
import {getUnitData} from "../../util/UnitUtil";
import * as DataUtil from "../../util/DataUtil";
export function MissRequiredConditionError() {
}

export default {
  data() {
    return {
      tabsConfig: [{
        key:"norm",
        label:"正常",
        len:0
      },{
        key:"draft",
        label:"草稿",
        len:0
      }],
      initLoad:false,
      activeTabName:"norm",
      activeRowButton:null,
      rowButtonActiveServiceName:"",
      isDraft:false,
      visible: true,
      isMarker: true,
      service_name: this.service,//||this.$route.params.service_name,
      addService: null,
      importService: null,
      updateService: null,
      deleteService: null,
      card_no: this.card,//||this.$route.params.card_no,
      card_cfg: null,
      cardInstance: null,
      init_card_data: false,
      selectFormShow: false,
      defaultapi: "select",
      gridHeader: [],
      groupHeaders: [],
      noramlHeaders: [],
      header_view_model: 'group',
      groupHeaderCols: {},
      selection: true,
      gridData: [],
      defGridData: [],
      gridButton: [],
      actionGridButton:null,
      rowButton: [],
      multipleSelection: [],
      condition: [],
      searchFormCondition: [],
      srv_cols: null,
      order: [],
      moneyCols: [],
      keyValueData: {},
      filterCondition: [],
      custCondition: [],
      gridPage: {
        pageSizes: [],
        pageSize: this.listType != 'list' && this.listType != 'treelist'? 5:10,
        currentPage: 1,
        total: 0
      },
      moreConfig:null,
      activeForm: null,
      activeData:null,
      clickedRow: {},
      ifFlexTableHeader: false,
      inlineLists: [],
      uid: null,
      list_inner_add: false,
      scroll: 0,
      activeRow4PopupMemList: null,
      activePopupMemList: null,
      _encrypt_cols:[],
      approvalOptions:[{  // 列表审批默认选项
        disp:"通过",
        value:"pass"
      }],
      approvaList:[],
      orderColumn:"phone"
    };
  },

  props: {
    tableButtonRouterType:{
      type:String,
      default:"bxconfig", // checkEditPage 'bxconfig' 
    },
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
    }
  },

  computed: {
    tabBasicsConfig:function(){
       let config = {}
       config = this.basicsConfig
       return config
    },
    draftRun:function(){
        if(this.activeTabName === 'draft' || ((this.listType === 'updatechildlist' || this.listType === 'addchildlist'|| this.listType === 'detaillist') && this.pageIsDraft === 'draft')){
          return true
        }else{
          return false
        }
    },
    isShowRowButtons:function(){
       let isShow = true
       let config = this.moreConfig && this.moreConfig.hasOwnProperty("isShowRowButtons") ? this.moreConfig.isShowRowButtons   : isShow
       return config
    },
    gridDataRun:function(){
        // 重新构造 gridData 为了过滤内存表删除操作
        let self = this
        let data = self.gridData
        let colType = "string"
        let orderType = self.orderColumn
        let columnName = null
        if(self.orderColumn.indexOf(" ") !== -1){
          orderType = self.orderColumn.split(' ')
          columnName = orderType[0]
          orderType = orderType[1]  // 排序类型默认为升序，未实现
        }else{
          columnName = self.orderColumn
        }
        if(data){
          data = data.filter((item)=>{
            if(item.hasOwnProperty("_dirtyFlags") && (item._dirtyFlags !== 'delete')){
              return item
            }else if(!item.hasOwnProperty("_dirtyFlags")){
              return item
            }
          })
          
          if(columnName && this.storageType == 'mem'){
            // 如果是内存表时 使用根据返回 排序字段 使用前端排序
            let colData = self.gridHeader
            colData = colData.filter((item)=>item.column === columnName)
            if(colData.length > 0){
              colType = colData[0].col_type


              if(colType == 'int' || colType == 'Integer' || colType == 'Money' ){
                data.sort(function(a,b){
                  return a[columnName] - b[columnName]
                })
              }else{
                data.sort()
              }
              
              
              
              // else if(colType == 'string' || colType == 'String'){
                // data.sort(function(a, b){
                //   var x = null
                //   var y = null
                //   if(isNaN(a[columnName]) ){
                //     x = a[columnName].toLowerCase()
                //   }else{
                //     x = a[columnName]
                //   }
                //   if(isNaN(b[columnName]) ){
                //     y = b[columnName].toLowerCase();
                //   }else{
                //     y = b[columnName]
                //   }
                //   // var x = a[self.orderColumn].toLowerCase() || 1;
                //   // var y = b[self.orderColumn].toLowerCase() || 2;
                //   if (x < y) {return -1;}
                //   if (x > y) {return 1;}
                //   return 0;
                // });
              // }else{
              //   data.sort()
              // }
            }

            
            
          }
          return data
        }else{
          return []
        }
        
    },
    sortedGridButtons() {
      let sorted = this.gridButton.slice();
      sorted.sort((a, b) => a.seq - b.seq)

      //处理草稿界面按钮
      if(this.draftRun){
        sorted = sorted.filter(item => item.button_type === 'batch_delete' || item.button_type === 'add' || item.button_type === 'refresh' || item.button_type === 'select')
      }
      return sorted
    },

    sortedRowButtons() {
      let sorted = this.rowButton.slice();
      sorted.sort((a, b) => a.seq - b.seq)



      sorted = getButtonPara(sorted)  // 封装按钮分组数据
      //处理草稿界面按钮
      if(this.draftRun){
        let buts = []
        sorted.forEach((item) => {
          if(item.button_type !== '_btn_group'){
            buts.push(item)
          }else if(item.buttons.length > 0){
            buts.push.apply(buts,item.buttons);
          }
        })
        sorted = buts.filter((item) => {
          if(item.button_type === 'delete' || item.button_type === 'detail' || item.button_type === 'edit'){
            let i = sorted = this.bxDeepClone(item) 
            i.permission = true
            return i
          }
          
        })
      }
      return sorted
    },

    columnHeaders() {
      return this.gridHeader.filter(item => item.col_type !== "InlineList");
    },


    maxTableHeight() {
      let ratio = 0.8
      let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      h = h <= 1 ? 800 : h;
      console.info("max table height: " + h)
      return this.tableHeight || (h * ratio);
    },
    listDialogWidth(){
      let config = this.moreConfig||{}
      let dialogWidth = 8
      if(config && config.hasOwnProperty('listDialogWidth')){
        dialogWidth =  config.listDialogWidth || 8
      }
      return dialogWidth
   }
    // showPagination(){
      // let self = this
      // let isShow = self.showPagination
      // let type = self.listType
      // if(type === '')
    // }
  },

  methods: {
    
    getButtonOptSrv(btn,row,type){
         let self = this
         let serviceName=""
         let serviceViewName=""
         let permission = false
         let operateList = []
         let isBtnOptShow = false
         let isBtnExpShow = false
         let data = row
         let mainData = self.listMainFormDatas
         if(btn.permission && btn.operate_service &&  Object.prototype.toString.call(btn.operate_service) !== "[object String]"){
          for(let key in btn.operate_service){
             let config = btn.operate_service[key]
            //  let funBody = `let data=e;let mainData=b;return ${config.disp_exps}`
             let args = ["e", "b"]
            //  let testFun = new Function(...args, funBody)
            //  let mainData = listMainFormDatas || {}
            //  let isValid = testFun(row,mainData)
             let isValid = eval(config.disp_exps)

             if(config.permission){
              operateList.push({
                serviceName:key,
                serviceViewName:config.service_view_name,
                permission:config.permission,
                isValid:isValid
              })
                 
             }
          }
       }
       let dispExps = btn.disp_exps
       if(btn.permission && dispExps){
        // let funBody = `let data = e;let mainData=b ;return ${dispExps}`
        // console.log('funBody',funBody)
        let args = ["e", "b"]
        // let testFun = new Function(...args, funBody)
        // let mainData = listMainFormDatas || {}
        // isBtnExpShow = testFun(row,mainData)
        isBtnExpShow = eval(dispExps)
       }else{
        isBtnExpShow = btn.permission
       }
         if(type && type == 'isShow' && isBtnExpShow){
            let optionsList = operateList.filter((item) => item.isValid)
            if(btn.permission &&(optionsList.length !== 0 || (btn.operate_service && Object.prototype.toString.call(btn.operate_service) == "[object String]") || !btn.operate_service ) ){
              isBtnOptShow = true
            }else{
              isBtnOptShow = false
            }
            // console.log('getButtonOptSrv isshow',btn.button_name ,isBtnExpShow && isBtnOptShow,isBtnExpShow,isBtnOptShow)
            return isBtnExpShow && isBtnOptShow
         }else if(type && type == 'active'){
          let opIsShow = operateList.filter((item) => item.isValid)
            return opIsShow
         }else{
          let opIsShow = operateList.filter((item) => item.isValid)
            return opIsShow
         }
        
        //"[object String]"
    },
    // showPagination(e){
    //    let listType = this.listType
    //    let isShow = e
    //    if((listType === 'addchildlist' || listType === 'updatechildlist' || listType === 'detaillist')){
    //       return e? e : false
    //    }
    // },
    onTabshandleClick(e){
      console.log('handle Click',e)
      this.loadTableData()
    },
    actionSuccess(){
       this.refresh()
       this.activeForm = 'xx'
    },
    filterHandler(value, row, column) {
      // console.log("filterHandler",value, row, column)
      return true;
    },
    setVisible(value) {
      this.visible = value;
    },

    evalVisible() {
      return this.evalVersatileFlagVar(this.visible)
    },

    getButtonName(button, row) {
      return (button.button_name_expr && this.evalBxExpr(button.button_name_expr, row, this)) || button.button_name;
    },
    getRows() {
      return this.gridData;
    },

    getSelectedRows() {
      return this.multipleSelection;
    },

    formModelDecorator(formModel) {
      this.$set(formModel, "_gridData", this.gridData);
    },

    filterChange(filters) {
      this.filterCondition = [];
      for (var key in filters) {
        var cMap = {};
        if (filters[key].length > 0) {
          cMap["colName"] = key;
          cMap["value"] = filters[key].toString();
          cMap["ruleType"] = "in";
          this.filterCondition.push(cMap);
        }
      }
      this.gridPage.currentPage = 1;

      this.loadTableData();
    },
    cardLoadinit(card) {
      this.cardInstance = card;
    },

    getshowAlign(item) {
      if (item.col_type == "Money") {
        return "right";
      } else {
        return "left";
      }
    },

    formatValue(row, header) {
      let key_col = header.column;
      let value = row[key_col];
      // console.log("formatValue",row, key_col)
      let self = this
      let ops = ''
      if (this.header_view_model == 'group' && this.groupHeaderCols[key_col]) {
        var str = "";
        var gheaders = this.groupHeaderCols[key_col];
        if (gheaders.length == 1) {
          str = value;
          let resultValue = ''
          if(header.col_type=='Dict' &&  self.keyValueData[header.column] && value !== null && value !== ''){
            let keyValueData = self.keyValueData[header.column]
            if(keyValueData&&Array.isArray(keyValueData)){
              for(let i = 0;i<keyValueData.length;i++){
                if(keyValueData[i].value == value){
                  resultValue = keyValueData[i].text
                }else{
                  // resultValue = keyValueData[i].value
                }
              }
            }
          }
          if(header.srvcol.col_type && header.srvcol.col_type.toLowerCase() === 'datetime' && header.format && value !== '' && value !== null){
            // 根据日期的格式配置 格式化日期值
            resultValue = DataUtil.formatDate(value, header.srvcol.col_type.toLowerCase(),header.format)
          }else if(header.col_type=='Money' && value !== null &&  value !== 'null' && value !== '******'){
            // 格式化 Money
            resultValue = DataUtil.formatMoney(value + '')
          }
        
          if(resultValue){
            str =  resultValue
          }else{
            str= this.singleFormatValue(value, header, null, row);
          }
        } else {

          for (var gHeader of gheaders) {

            if (gHeader["in_list"] === 1) {
              var gcol = gHeader["columns"];
              let gvalue = row[gcol];
              var label = gHeader["label"];
              
              gvalue = this.singleFormatValue(gvalue, gHeader, key_col);
              if (str == '') {
                str = label + ": " + gvalue;
              } else {
                str = str + "\n" + label + ": " + gvalue;
              }

            }

          }

        }
        // return str;
        ops =  str;
      } else {
        let resultValue = ''
        if(header.col_type=='Dict' &&  self.keyValueData[header.column] && value !== null && value !== ''){
          let keyValueData = self.keyValueData[header.column]
          if(keyValueData&&Array.isArray(keyValueData)){
            for(let i = 0;i<keyValueData.length;i++){
              if(keyValueData[i].value == value){
                resultValue = keyValueData[i].text
                // console.log("格式化值1:" +header.column ,value,keyValueData[i].text,value==keyValueData[i].value)
              }else{
                // resultValue = keyValueData[i].value
                // console.log("格式化值2:" +header.column ,value,keyValueData[i].text,value==keyValueData[i].value)
              }
            }
          }
          // console.log("格式化值:" +header.column ,resultValue,value,Array.isArray(keyValueData),keyValueData,self.keyValueData,header.column)
        }
        
        if(header.srvcol.col_type && header.srvcol.col_type.toLowerCase() === 'datetime' && header.format && value !== '' && value !== null){
          // 根据日期的格式配置 格式化日期值
          resultValue = DataUtil.formatDate(value, header.srvcol.col_type.toLowerCase(),header.format)
        }else if(header.col_type=='Money' && value !== null &&  value !== 'null'&& value !== '******'){
          // 格式化 Money
          resultValue = DataUtil.formatMoney(value + '')
        }
       
        if(resultValue){
          // return resultValue
          ops= resultValue
        }else{
          // return this.singleFormatValue(value, header, null, row);
          ops = this.singleFormatValue(value, header, null, row);
        }
      }
      let moreTempl = header.srvcol && header.srvcol.more_config ? header.srvcol.more_config : "{}"
      let moreSte = moreTempl ? JSON.parse(moreTempl) : null
      if(moreSte && moreSte.hasOwnProperty('format_display')){
        moreTempl = moreSte.format_display
        ops = self.templateToString(row,moreTempl) 
      }
      
      // let more
      // if(header)
      return ops

    },
    singleFormatValue(value, header, key_col, row) {
      // 从方法中那个取到值  res后面可以根据复杂程度改为对象
      value = getUnitData(value, header);
      let userDeptTypes = ["User", "Dept", "bxsys_user", "bxsys_dept"];
      if (this.moneyCols.indexOf(key_col) != -1) {
        return this.formartMoney(value + "");
      } else {
        let type = header.col_type;
        if (type === "UserList" && value) {
          let items = null;
          try {
            items = JSON.parse(value);
          } catch (error) {
            items = [items]
            console.log(error)
          }
          if (items && items.length) {
            return _.join(items.map(item => item.disp), ",");
          }
        } else if (type === "Boolean") {
          return !!value ? "是" : "否";
        } else if (type === "Dict" || type === "fk") {
          // 增加 支持 fk时 显示 _xx_disp 字段
          let dispColName = `_${header.column}_disp`;
          return !!row[dispColName] ? row[dispColName] : value;
        } else if (_.includes(userDeptTypes, type)) {
          // 尝试从row 寻找 _disp
          let dispColName = `_${header.column}_disp`;
          if (row.hasOwnProperty(dispColName)) {
            return row[dispColName];
          }
        } else if (hotTableMetadata[type] && this.$store) {
          // 尝试从hottable 寻找 _disp
          // 废弃
          let table = hotTableMetadata[type].table;
          let valueCol = hotTableMetadata[type].valueCol;
          let dispCol = hotTableMetadata[type].dispCol;
          let tableData = this.$store.getters.getTableData(table);
          if (tableData && tableData.length > 0) {
            let target = tableData.filter(item => item[valueCol] === value);
            return target && target.length && target[0][dispCol];
          } else {
 
            return value;
          }
        }
        return value;
      }

    },
    getDispExps(item, data) {
      var result = true;
      let mainData = null
      if(this.listMainFormDatas){
        mainData = this.listMainFormDatas
      }
      
      //催办按钮只在 我的申请页面显示
      if(this.listType != "mine"&&item.button_type=='urge'){
        return false;
      }

      try {
        var disp_exps = item.disp_exps;
        if (disp_exps != undefined && disp_exps != "" && disp_exps != null) {
          result = eval(disp_exps);
        }
      } catch (err) {
       
      }

      

      return result;
    },
    getButtonDispExps(btns,data){
      var result = true;
      let mainData = null
      if(this.listMainFormDatas){
        mainData = this.listMainFormDatas
      }
      let isShow = []
      if(btns.length > 0){
        for(let item of btns){
          try {
            var disp_exps = item.disp_exps;
            if (disp_exps != undefined && disp_exps != "" && disp_exps != null) {
              result = eval(disp_exps);
              if(result !== false){
                isShow.push(item)
              }
            }else if(item.permission){
              isShow.push(item)
            }
          } catch (err) {
           
          }
        }

        if(isShow.length !== 0){
          return true
        }else{
          return false
        }
      }else{
        return false
      }


      
    },
    getGridHeaderDispExps(item,listMainFormDatas) {
      // 获取表格列显示
      let result = item.show;
      var disp_exps = item.showListExp;
      if (result && item.hasOwnProperty('showListExp')) {

       
        let mainFormData = listMainFormDatas
        // result = eval(disp_exps);
        result =  eval('('+ disp_exps + ')(mainFormData)');
      }
      return result;
    },
    handleSortChange(column) {
      this.order = [];

      if (column["column"] != null) {
        if ("ascending" == column["order"]) {
          this.order.push({colName: column["prop"], orderType: "asc"});
        } else {
          this.order.push({colName: column["prop"], orderType: "desc"});
        }
      }

      this.loadTableData();
    },

    deleteRowData(rowData, exeservice) {
      var dataArray = [rowData];
      this.deleteData(dataArray, exeservice);
    },

    batchDeleteData(exeservice) {
      if (this.multipleSelection.length == 0) {
        this.$alert("请选择删除数据", "提示", {
          confirmButtonText: "确定"
        });
      } else {
        this.deleteData(this.multipleSelection, exeservice);
      }
    },

    deleteDataAndSave(deleteRowData, exeservice) {
      this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info"
      })
        .then(() => {
          var deleteRequests = [];
          var request = {};
          request["serviceName"] = exeservice;
          if(this.activeTabName === 'draft'){
            request['reqType']  = 'deleteDraft'
          }
          var cMap = {colName: "id", ruleType: "in"};
          var cVule = [];
          for (var item of deleteRowData) {
            cVule.push(item.id);
          }
          cMap["value"] = cVule.toString();
          request["condition"] = [cMap];

          deleteRequests.push(request);

          this.operate(deleteRequests).then(response => {
            var state = response.body.state;

            if ("SUCCESS" == state) {
              this.$message({
                type: "success",
                message: "删除成功!"
              });
              if (this.gridData.length == cVule.length) {
                if (this.gridPage.currentPage > 1) {
                  this.gridPage.currentPage = this.gridPage.currentPage - 1;
                }
              }
              this.loadTableData();
            } else {
              this.$message({
                type: "error",
                message: response.body.resultMessage
              });
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    
    gridButtonClick(button) {
      //　列表头部按钮
      //console.log("gridButtonClick",this,this.$parent)
       this.$emit("extend-change",button)
      let self = this
      var type = button.button_type;
      var exeservice = button.service_name;
      var tab_title = button.service_view_name;
      var operate_type = button.operate_type;
      var moreConfig = null

      if(button.more_config && typeof button.more_config === 'string'){
        try {
          moreConfig = JSON.parse(moreConfig)
          
        } catch (error) {
          console.log(error)
        }
      }

      if(button.hasOwnProperty("always_show") && button.always_show && !button.permission){
        // 无权限的按钮永久显示，操作弹出配置提示信息
        this.$alert(button.tip_msg ?button.tip_msg:"您无法进行该操作" , "提示", {
          confirmButtonText: "确定"
        });
        return;
      }
      if (button.action_validate && this.evalActionValidator(button.action_validate, this.gridData) !== true) {
        return;
      }
      
      if ("select" == type) {
        self.toggleFilters(button);
      } else if ("extjs" === type) {
        button.handlerFunc && button.handlerFunc();
      } else if ("shrink" == type) {
        self.selectFormShow = false;
      } else if ("refresh" == type) {
        self.refresh();
      } else if ("batch_delete" == type) {
        self.batchDeleteData(exeservice);
      } else if ("add" == type) {

        if (operate_type == '页内添加') {
          if (this.list_inner_add) {
            self.list_inner_add = false;
          } else {
            self.list_inner_add = true;
          }
        } else {
          if(self.tableButtonRouterType == 'checkEditPage'){
              console.log("点击了添加")
              self.$emit('on-grid-button', button)
          }else{
            
            self.onAddClicked();
          }
        }


      } else if ("confirmadd" == type) {
        if (this.multipleSelection.length == 0) {
          this.$alert("请选择需要添加的数据", "提示", {
            confirmButtonText: "确定"
          });
        } else {

          var relation_col = "";
          var referenced_column_name = "";
          let map_table = this.mapcondition.map_table;
          var table_col_realtion = button.table_col_realtion;
          for (var item of table_col_realtion) {
            if (item.table_name == map_table) {
              relation_col = item["column_name"];
              referenced_column_name = item["referenced_column_name"];
              break;
            }
          }


          if (relation_col != "") {

            let bxRequests = [];
            let bxRequest = {};
            bxRequests.push(bxRequest);
            bxRequest.serviceName = this.mapcondition.addservice;
            bxRequest.data = [];

            for (var item of this.multipleSelection) {
              var dataMap = {};
              dataMap[this.mapcondition.input_col_name] = this.mapcondition.input_col_value;
              dataMap[relation_col] = item[referenced_column_name];
              bxRequest.data.push(dataMap);


            }

            this.operate(bxRequests).then(response => {
              var state = response.body.state;

              if ("SUCCESS" == state) {

                this.$message({
                  type: "success",
                  message: "添加成功!"
                });

                // this.loadTableData()
                this.$emit('action-complete');
              } else {
                this.$message({
                  type: "error",
                  message: response.body.resultMessage
                });
              }
            });

          }


        }

      } else if ("batchadd" == type) {

        var select_optionlist = ""
        var child_column_name = this.childforeignkey.column_name;
        var map_table_name = "";
        for (var item of this.srv_cols) {
          let columns = item.columns;

          let option_list_v2 = item.option_list_v2;
          if (option_list_v2 != undefined && option_list_v2 != null && option_list_v2 != '') {
            if (columns != child_column_name) {
              select_optionlist = option_list_v2;
              map_table_name = item.table_name;
            }

          }
        }
        if (select_optionlist != '') {

          var mapcondition = {};
          mapcondition.map_table = map_table_name;
          mapcondition.input_col_name = child_column_name;
          mapcondition.input_col_value = this.childforeignvalue;
          mapcondition.addservice = exeservice;
          var service = select_optionlist.serviceName;
          var condition = [];
          this.addListpoup(service, condition, mapcondition);
        }

        //批量添加

      } else if ("batchupdate" == type) {
        // 批量修改
        if (this.header_view_model != 'normal') {
          this.header_view_model = "normal";
          this.gridHeader = this.noramlHeaders;
        }
        if (this.multipleSelection.length == 0) {
          this.$alert("在列表左侧请勾选需要编辑的数据", "提示", {
            confirmButtonText: "确定"
          });
        }else{
          this.activeForm = 'batchupdate'
        }
        // this.onInplaceEditClicked();
      } else if ("saveall" == type) {
        this.onSaveAllClicked();
      } else if ("apply" == type) {
        var urlParams = "/" + exeservice + "?time=" + (new Date()).getTime();
        this.addTab("start-proc", urlParams, tab_title,null,button);
      } else if ("export" == type) {
        this.onExportClicked();
        // this.activeForm = "export"   // 显示导出配置
      } else if ("import" == type) {
        this.onImportClicked(button);
      } else if ("customize" == type) {
        var operate_params_cfg = button.operate_params;
        var select_data = button.select_data;
        if (
          (select_data == null || select_data == undefined || select_data == '是') && this.multipleSelection <= 0 &&
          operate_params_cfg != undefined &&
          operate_params_cfg != "" &&
          operate_params_cfg != null 
        ) {
          this.$alert("请选择操作数据", "提示", {
            confirmButtonText: "确定"
          });
        } else {
          var me = this;

          if (button.operate_type == "修改") {
            this.customize_update(button, this.multipleSelection);
          } else if (button.operate_type == "删除") {
            this.customize_delete(operate_item, this.multipleSelection);
          } else if (button.operate_type == "增加") {
            this.customize_add(button, this.multipleSelection);
          } else  if(button.operate_type == "增加弹出"){

            console.log("customize button",button)
            this.customizeOperate(button, this.multipleSelection);
            // this.customize_add(button, this.multipleSelection);
        }else{
            button.listservice = this.service;
            this.customizeOperate(button, this.multipleSelection);
          }
        }
      }else if("batch_approve" == type){
        this.onBatchApprove(this.multipleSelection,button);
      }
    },
    // handleSelectionChange(val) {
    //   let self =this
    //   console.log(val)
    //   self.clickedRow = val;
    // },
    // getSelectionRowData(){
    //   let self =this
    //    return self.clickedRow
    // },
    rowButtonClick(operate_item, row) {
      let self =this
      let button = operate_item;
      var type = operate_item.button_type;
      console.log(type)

      var exeservice = operate_item.service_name;
      var tab_title = operate_item.service_view_name;
      // this.clickedRow = row
      this.activeRowButton = operate_item
      this.rowButtonActiveServiceName = ""
      if(button.hasOwnProperty("always_show") && button.always_show && !button.permission){
        // 无权限的按钮永久显示，操作弹出配置提示信息
        this.$alert(button.tip_msg ?button.tip_msg:"您无法进行该操作" , "提示", {
          confirmButtonText: "确定"
        });
        return;
      }
      if (button.action_validate && this.evalActionValidator(button.action_validate, row) !== true) {
        return;
      }


      var operate_service = operate_item.operate_service;
      if (operate_service) {
        exeservice = operate_service;
      }

      if ("delete" == type) {
        this.deleteRowData(row, exeservice);
      } else if ("edit" == type) {

        
        if(button.operate_service && Object.prototype.toString.call(button.operate_service) !== "[object String]"){
          let srv = this.getButtonOptSrv(button,row,"active")
          if(srv.length > 0){
            this.rowButtonActiveServiceName = srv[0].serviceName 
          }else{

          }
          
        }else{
          this.rowButtonActiveServiceName = button.operate_service ||  button.service_name
        }
       let actionConfig = this.getButtonOptSrv(button,row,'active')
        console.log('getButtonOptSrv',actionConfig)
        if(self.tableButtonRouterType == 'checkEditPage'){
           console.log('点击了编辑')
           self.onUpdateClicked(row);
        }else{
          self.onUpdateClicked(row);

        }
      } else if ("detail" == type) {
        var urlParams = "/" + exeservice + "/" + row.id + "?srvApp=" + this.resolveDefaultSrvApp() + '&isdraft=' + this.draftRun;//跳转
        var disp_col = operate_item._disp_col;
        var disp_value = row[disp_col];//详情页面上的标签
        tab_title = tab_title.replace('查询', '');
        if (disp_value != null && disp_value != undefined && disp_value != '') {
          tab_title = disp_value + "(" + tab_title + "详情)";
        } else {
          tab_title = tab_title + "详情";
        }
        this.addTab("detail", urlParams, tab_title, null, button);
        //debugger
      } else if ("procdetail" == type) {
        var urlParams = "/" + row["proc_instance_no"];
        this.addTab("procdetail", urlParams, tab_title, null, button);
      } else if ("addchild" == type) {
        this.onAddChildClicked(row);
      } else if ("duplicate" == type) {
        if(this.storageType === 'mem'){
          this.activeData  =  row
        }else{
          this.activeData = null
        }
        
        this.onDuplicateClicked(row);
      } else if ("duplicatedeep" == type) {
        this.onDuplicateDeepClicked(row);
      } else if ("closeproc" == type) {
        this.procOperate(row, operate_item);
      } else if ("proccancel" == type) {
        this.procOperate(row, operate_item);
      } else if ("deleteproc" == type) {
        this.procOperate(row, operate_item);
      } else if ("startproc" == type) {
        //开启数据流程
        this.start_dataproc(row, operate_item);

      } else if ("deletedraft" == type) {
        this.procOperate(row, operate_item);
      } else if ("extjs" === type) {
        operate_item.handlerFunc && operate_item.handlerFunc(row);
      } else if ("manage_childlist" === type) {
        this.onPopupMemListClick(row, button);
      }else if("urge"==type) {
        //催办
        this.procOperate(row, operate_item);

      }else if ("customize" == type) {

        if(button.hasOwnProperty('version') && button.version == 'v2'){
          this.customButtonV2(button,row)
        }else{
          let data = [row];
          if (operate_item.operate_type == "修改") {
            this.customize_update(operate_item, data);
          } else if (operate_item.operate_type == "删除") {
            this.customize_delete(operate_item, data);
          } else if (operate_item.operate_type == "增加") {
            this.customize_add(operate_item, data);
          } else{
            operate_item.listservice = this.service;
            this.customizeOperate(operate_item, data);
          }
        }
        
      }else if("batch_approve" == type){
        // 流程批量审批
        this.onBatchApprove([row],button);
      }else if("customize_import" == type){
        // 自定义导入
        this.onCustomizeImport(row,button);
      }
    },
    //
    customPopup(operate_item, data){
      // 2021 02 26
      //自定义弹出

      this.customizeOperate(operate_item, data);
      // if(data.operate_type.endsWith("弹出")){

      // }else{
      //   this.customizeOperate(operate_item, data);
      // }
      
    },
    //开启数据流程
    start_dataproc(row, buttinfo) {
      var me = this;


      var pre_confirm_msg = buttinfo.pre_confirm_msg;
      if(!pre_confirm_msg){
        pre_confirm_msg="您确定要执行此操作?";
      }
      this.$confirm(pre_confirm_msg, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info"
      })
        .then(() => {


          var requests = [];
          var request = {};
          requests.push(request);

          let parent_proc_instance_no = row.parent_proc_instance_no;
          if (parent_proc_instance_no) {
            request["parent_proc_instance_no"] = parent_proc_instance_no;
          }
          request["proc_no"] = JSON.parse(buttinfo.operate_params).proc_no;
          let condition = [{
            "colName": "id",
            "value": row.id,
            "ruleType": "eq"
          }];
          request["condition"] = condition;


          this.startDataProc(requests).then(response => {
            var state = response.body.state;


            if ("SUCCESS" == state) {
              var resultMessage = "操作成功!";

              if (resultMessage != '' && resultMessage != null && resultMessage != undefined) {
                resultMessage = response.body.resultMessage;
              }

              this.$message({
                type: "success",
                message: resultMessage
              });

              me.loadTableData();
            } else {
              this.$message({
                type: "error",
                message: response.body.resultMessage
              });
            }
          });


        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消"
          });
        });

    },
    procOperate(row, buttinfo) {

      var me = this;
      var type = buttinfo.button_type;
      if ("closeproc" == type) {

        this.$prompt('', '请输入关闭原因', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValidator: function (value) {
            if (value == "" || value == undefined && value == null) {
              return "请输入关闭原因";
            }

          }

        }).then(({value}) => {

          if (value == "" || value == undefined && value == null) {

            this.$message({
              type: 'info',
              message: '请输入关闭原因'
            });

          } else {
            me.procRelateOperate(row, buttinfo, value);
          }


        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消操作'
          });
        });
      } else if ("proccancel" == type) {


        this.$prompt('', '请输入撤销原因', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValidator: function (value) {
            if (value == "" || value == undefined && value == null) {
              return "请输入撤销原因";
            }

          }

        }).then(({value}) => {

          if (value == "" || value == undefined && value == null) {

            this.$message({
              type: 'info',
              message: '请输入撤销原因'
            });

          } else {
            me.procRelateOperate(row, buttinfo, value);
          }


        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消操作'
          });
        });


      } else {


        this.$confirm("您确定要执行此操作?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info"
        })
          .then(() => {

            me.procRelateOperate(row, buttinfo);

          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "已取消"
            });
          });


      }


    },
    procRelateOperate(row, buttinfo, remark) {

      var me = this;


      var type = buttinfo.button_type;
      var requests = [];
      var request = {};
      request["serviceName"] = buttinfo.service_name;
      var cMap = {
        colName: "proc_instance_no",
        ruleType: "eq",
        value: row.proc_instance_no
      };
      request["condition"] = [cMap];

      if (remark != undefined && remark != null && remark != '') {

        var dataMap = {
          "remark": remark
        };
        request["data"] = [dataMap];
      }


      requests.push(request);

      this.operate(requests).then(response => {
        var state = response.body.state;


        if ("SUCCESS" == state) {
          var resultMessage = "操作成功!";

          if (resultMessage != '' && resultMessage != null && resultMessage != undefined) {
            resultMessage = response.body.resultMessage;
          }

          this.$message({
            type: "success",
            message: resultMessage
          });

          me.loadTableData();
        } else {
          this.$message({
            type: "error",
            message: response.body.resultMessage
          });
        }
      });

    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },

    handleCurrentChange(val) {
      this.gridPage.currentPage = val;
      this.loadTableData();
    },

    handleSizeChange(val) {
      this.gridPage.pageSize = val;
      // this.pageSize = val;
      this.loadTableData();
    },

    query(condtion) {
      this.searchFormCondition = condtion;
      this.gridPage.currentPage = 1;
      this.condition = [];
      this.loadTableData();
    },

    buildQueryConditions() {
      this.condition = [];
      if(this.listType == "wait"){

      }
      for (var cMap of this.custCondition) {
        this.condition.push(cMap);
      }

      for (var cMap of this.filterCondition) {
        this.condition.push(cMap);
      }

      for (var cMap of this.searchFormCondition) {
        this.condition.push(cMap);
      }

      if(Array.isArray(this.defaultCondition)){
        for (var cMap of this.defaultCondition) {
          this.condition.push(cMap);
        }
      }
    

      this.condition.filter(item => item.dynamic === true).forEach(item => {
        let ctx = this
        item.value = eval(item.value);
      });

      this.condition.filter(item => item.valueFunc && _.isFunction(item.valueFunc))
        .forEach(item => item.value = item.valueFunc())


      let hasEmptyRequiredCondition =
        this.condition.filter(
          item => item.required === true && this.isEmptyCondition(item)
        ).length > 0;
      if (hasEmptyRequiredCondition) {
        throw new MissRequiredConditionError();
      }
      return this.condition;
    },
    loadDraftLength(){
      let self = this
      this.buildQueryConditions()

        let pageSize = this.pageSize || this.gridPage.pageSize;
        var page = (this.isMem() || (this.gridPage && pageSize < 0))
          ? null
          : {
            pageNo: this.gridPage.currentPage,
            rownumber: pageSize
          };
      let relationCondition = self.relationCondition
            // console.log("select",relationCondition)
            // service_name, condition, page, order, group, mapcondition, app,isproc,columns,relationCondition
            return self.select(
              self.service_name,
              self.condition,
              self.showPagination? page : null,
              self.order,
              null,
              self.mapcondition,
              null,
              null,
              null,
              relationCondition,
              true,
              "list_page"
            ).then(response => {
              let gridData = response.body.data;
              let page = response.body.page
              if(!page){
                page = { total:response.body.data.length }
              }
              self.tabsConfig[1].len = page.total || 0
            })
    },
    loadTableData() {
      let self = this
      if (!this.shouldLoadFromDb) {
        return Promise.resolve(true);
      }

      const loading = this.$loading({
        lock: true,
        text: '加载中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

      // setTimeout(() => {
      //   loading.close();
      // }, 5000);
      try {

        this.buildQueryConditions()

        let pageSize = this.pageSize || this.gridPage.pageSize;
        var page = (this.isMem() || (this.gridPage && pageSize < 0))
          ? null
          : {
            pageNo: this.gridPage.currentPage,
            rownumber: pageSize
          };

        if (
          this.listType == "wait" ||
          this.listType == "mine" ||
          this.listType == "myall" ||
          this.listType == "processed"||
          this.listType == "all"||
          this.listType == "userall"
        ) {
          //加载表格数据
          return this.selectproc(
            this.service_name,
            this.condition,
            // page,
            this.showPagination? page : null,
            this.order,
            this.listType,
            "list_page"
          ).then(response => {
            // console.log("responseresponse",response)
            var listData = response.body.data;
            for (var row in listData) {
              for (var key in this.keyValueData) {
                var dicts = this.keyValueData[key];
                for (var map in dicts) {
                  if (listData[row][key] == dicts[map]["value"]) {
                    listData[row][key] = dicts[map]["text"];
                    break;
                  }
                }
              }

            }

            this.gridData = listData;

            if(this.gridData && this.gridData.length >0 && this.gridData[0].hasOwnProperty('_encrypt_cols')){
              this._encrypt_cols = this.gridData[0]['_encrypt_cols']  // 加密的字段
            // this.gridData.splice(0, this.gridData.length - 1)
            }else{
              this._encrypt_cols =  [] // 加密的字段
            // this.gridData.splice(0, this.gridData.length - 1)
            }
            if (response.body["page"] != undefined) {
              this.gridPage.currentPage = response.body["page"]["pageNo"];
              this.gridPage.total = response.body["page"]["total"];
            }
            this.init_card_data = true;
            if (this.cardInstance != null) {
              this.cardInstance.setCardData(this.gridData);
            }
            
            // this.
            this.$nextTick((_) => {
              this.$emit("gridData-change", response.body, this.listType);
            })
            loading.close();
          }).catch((err)=>{
            loading.close();
            console.log("err",err)
          });
        } else {
          //加载表格数据
          if (self.defaultapi == "select") {
            // console.log(this.pageSize)
            
            let relationCondition = self.relationCondition
            // console.log(this.showPagination)
            // service_name, condition, page, order, group, mapcondition, app,isproc,columns,relationCondition
            return self.select(
              this.service_name,
              this.condition,
              this.showPagination? page : null,
              this.order,
              null,
              this.mapcondition,
              null,
              null,
              null,
              relationCondition,
              self.draftRun,
              "list_page"
            ).then(response => {
              self.gridData = response.body.data;
              let page = response.body.page
              if(!page){
                page = { total:response.body.data.length }
              }
               // 草稿标前显示 数量
              if(self.draftRun){
                self.tabsConfig[1].len = page.total || 0
              }else{
                self.tabsConfig[0].len = page.total || 0
              }

              if(self.listType.indexOf("childlist") !== -1){
                // 汇聚子表数据
                if(self.storageType === 'mem' && self.inplaceEdit){
                  self.inplaceEditData = []
                  self.gridData.forEach(row => {
                    if (!row._dirtyFlags && self.defaultDirtyFlags === 'add') {
                      // 如果没有 dirtyFlags，设置默认的flags
                      row["_guid"] = self.guid()
                      row['id'] = null
                      // this.$set(row, "_dirtyFlags", this.defaultDirtyFlags)
                      // if (this.defaultDirtyFlags === "add") {
                      //   this.$set(row, "_guid", this.guid())
                      //   this.$set(row, "id", null)
                      // }
                    }else {
                      self.$set(row, "_dirtyFlags", self.defaultDirtyFlags)
                      console.log('buildEditData=>',self.inplaceEditData,row)
                      // this.onInplaceEditClicked()
                    }
                  })
                  self.onInplaceEditClicked()
                }
                let child = {
                  name:this.service,
                  data:this.gridData
                }
                this.$emit("child-loaded",child)
              }
              // console.log(_)
              self.unmodifiedGridData = _.cloneDeep(self.gridData);
              if(self.gridData && self.gridData.length >0 && self.gridData[0].hasOwnProperty('_encrypt_cols')){
                self._encrypt_cols = self.gridData[0]['_encrypt_cols']  // 加密的字段
              // this.gridData.splice(0, this.gridData.length - 1)
              }else{
                self._encrypt_cols =  [] // 加密的字段
              // this.gridData.splice(0, this.gridData.length - 1)
              }
              
              var listData = response.body.data;

              if (self.gridDataFilter) {
                let filter = self.gridDataFilter;
                filter(listData);
              }

              listData.forEach(row => {

                // handle sth.
                for (var key in self.keyValueData) {
                  var dictData = self.keyValueData[key];
                  for (var map in dictData) {
                    if (row[key] == dictData[map]["value"]) {
                      // row[key] = dictData[map]["text"];  // 0115+
                      break;
                    }
                  }
                }

                // load child list data for inline list
                if (self.inlineLists) {
                  row._inlineLists = row._inlineLists || {};
                  self.inlineLists.forEach(inlineList => {
                    let fk = inlineList.foreign_key;
                    if (!row[fk.referenced_column_name]) {
                      return;
                    }

                    let conditions = [{
                      colName: fk.column_name,
                      ruleType: "eq",
                      value: row[fk.referenced_column_name],
                    }];
                    self.select(inlineList.inline_list_select_service, conditions).then(resp => {
                      resp.data && resp.data.data && (row._inlineLists[fk.constraint_name] = resp.data.data);
                    })
                  })
                }

              });

              if (response.body["page"]) {
                this.gridPage.currentPage = response.body["page"]["pageNo"];
                this.gridPage.total = response.body["page"]["total"];
              }
              this.init_card_data = true;
              if (this.cardInstance != null) {
                this.cardInstance.setCardData(this.gridData);
              }

              this.$emit("list-data-loaded", this);
              loading.close();
            }).finally(() => {
              loading.close();
            });
          } else {
            return this.selectByUser(
              this.service_name,
              this.condition,
              this.showPagination? page : null,
              this.order,
              null,
              this.mapcondition,
              "list_page"
            ).then(response => {
              this.gridData = response.body.data;
              console.log( this.gridData)
              this.unmodifiedGridData = _.cloneDeep(this.gridData);
              // this.gridData.splice(0, this.gridData.length - 1)
              if(this.gridData && this.gridData.length >0 && this.gridData[0].hasOwnProperty('_encrypt_cols')){
                this._encrypt_cols = this.gridData[0]['_encrypt_cols']  // 加密的字段
              // this.gridData.splice(0, this.gridData.length - 1)
              }else{
                this._encrypt_cols =  [] // 加密的字段
              // this.gridData.splice(0, this.gridData.length - 1)
              }
              var listData = response.body.data;
              // 转译字典
              for (var row in listData) {
                for (var key in this.keyValueData) {
                  var dictData = this.keyValueData[key];
                  for (var map of dictData) {
                    if (row[key] == dictData[map]["value"]) {
                      row[key] = dictData[map]["text"];
                      break;
                    }
                  }
                }
              }
              if (response.body["page"]) {
                this.gridPage.currentPage = response.body["page"]["pageNo"];
                this.gridPage.total = response.body["page"]["total"];
              }

              this.init_card_data = true;
              if (this.cardInstance != null) {
                this.cardInstance.setCardData(this.gridData);
              }

              this.$emit("list-data-loaded", this);
              
              
              loading.close();
            });
          }
          
        }
        
      } catch (e) {
        loading.close();
        throw e;
      }


    },

    createCustomLinkUrlFunc: function (linkUrlFunc) {
      return (data) => {
        let vm = this
        let ret = eval("var zz=" + linkUrlFunc + "(data, vm); zz");
        return ret;
      }
    },

    addInlineListRowButton: function (srvcol) {
      let button = {
        button_name: srvcol.label,
        button_type: "manage_childlist",
        page_area: "表格行按钮",
        page_type: "修改子列表",
        permission: true,
      };

      button.service_name = srvcol.service_name
      button.foreign_key = srvcol.foreign_key
      button.inline_list_select_service = srvcol.inline_list_select_service

      let fk = button.foreign_key;
      button.defaultCondition = (row) => {
        return [{
          colName: fk.column_name,
          ruleType: "eq",
          valueFunc: _ => {
            return row[fk.referenced_column_name];
          }
        }];
      };

      this.inlineLists.push(button);

      this.rowButton.push(wrapButton(button,"row"));
    },

    getColAlign:function(colType){
      if(colType === "Money" || colType === "int" || colType === "Integer" || colType === "Email" || colType === "TelNo"){
        return 'right'
      }else if(colType === "Enum" || colType === "Dict"  || colType === "Date" || colType === "DateRange"  || colType === "DateTime" ){
        return 'center'
      }else{
        return 'left'
      }
    },
    buildGridHeaders: function (srv_cols) {
      //sectionlist分组
      this.gridHeader = [];
      var cur_section_list = "";
      var exist_section_list = false;
      
      for (var serviceCol of srv_cols) {  
        let colName = serviceCol["columns"];
        if (colName == "id") {
          continue;
        }

        if (serviceCol.col_type === "InlineList") {
          this.addInlineListRowButton(serviceCol);
          continue
        }

        let header = {};
        header.srvcol = serviceCol;
        let more_config = (serviceCol["more_config"] !== null && serviceCol["more_config"] !== undefined && serviceCol["more_config"] !== '') ? JSON.parse(serviceCol["more_config"]) : null
        let colType = serviceCol["col_type"];
        header["column"] = colName;
        header["label"] = serviceCol["label"];
        header["width"] = "";
        header["show"] = serviceCol["in_list"] === 1;
        header["sortable"] = true;
        header["col_type"] = colType;
        header["list_min_width"] = serviceCol["list_min_width"];
        header['show_option_icon'] = serviceCol["more_config"] && JSON.parse(serviceCol["more_config"]).option_icon && JSON.parse(serviceCol["more_config"]).option_icon !== null ? JSON.parse(serviceCol["more_config"]).option_icon : false;
        header["align"] = this.getColAlign(colType)
        header['format'] =  serviceCol["more_config"] && JSON.parse(serviceCol["more_config"]).format && JSON.parse(serviceCol["more_config"]).format !== null ? JSON.parse(serviceCol["more_config"]).format : null;
        header['more_config'] =  serviceCol["more_config"] && JSON.parse(serviceCol["more_config"]) ? JSON.parse(serviceCol["more_config"]) : null;
        if(more_config !== null && more_config.hasOwnProperty('list_width')){
          header["width"] = more_config.list_width
        }
        if(more_config !== null && more_config.hasOwnProperty('rowFixed')){
          header["rowFixed"] = more_config.rowFixed
        }else{
          header["rowFixed"] = false
        }
        if(more_config !== null && more_config.hasOwnProperty('onListShowExp')){
          header["showListExp"] = more_config.onListShowExp
        }
        if (
          serviceCol["col_type"] == "Enum" ||
          serviceCol["col_type"] == "Dict"
        ) {
          let filters = [];
          var option_list_v2 = serviceCol["option_list_v2"];
          if (option_list_v2 && _.isArray(option_list_v2)) {
            for (var item of option_list_v2) {
              filters.push({text: item["label"], value: item["value"]});
            }
          }


          this.keyValueData[header["column"]] = filters;
          header["filters"] = filters;
        } else if (serviceCol["col_type"] == "Money") {
          this.moneyCols.push(colName);
        } else if (hotTableMetadata[colType]) {
          // 现在会返回_disp字段，不需要查了
          // this.loadHotTableData(hotTableMetadata[colType]);
        }

        let isBuiltinFinder = hotTableMetadata[colType];
        if (!!isBuiltinFinder) {
          serviceCol.option_list_v2 = {
            serviceName: hotTableMetadata[colType].selectService,
            refed_col: hotTableMetadata[colType].valueCol,
            srv_app: hotTableMetadata[colType].srvApp,
          };
        }


        // make link url func
        let isFinder =
          colType && (colType.startsWith("bx") || isBuiltinFinder);
        let isDisp = colType && colType.startsWith("_") && colType.endsWith("_disp");
        let linkUrlFunc = serviceCol.link_url_func;
        if (linkUrlFunc) {
         
          header.linkUrlFunc = this.createCustomLinkUrlFunc(linkUrlFunc)
        } else if (isFinder || isDisp) {
          let dataColName = isDisp ? dispCol2ValCol(colName) : colName;
          header.linkUrlFunc = createLinkUrlFunc(serviceCol.option_list_v2, dataColName);
        }


        var section_list = serviceCol["section_list"];

        if (section_list != undefined && section_list != null && section_list != '' && this.mergeCol) {
          exist_section_list = true;
          var groupHeadr = {};
          cur_section_list = section_list;
          groupHeadr["column"] = section_list;
          groupHeadr["label"] = section_list;
          groupHeadr["width"] = "";
          groupHeadr["show"] = true;
          groupHeadr["sortable"] = false;
          groupHeadr["col_type"] = String;

          var gheaders = this.groupHeaderCols[section_list];

          if (gheaders == undefined || gheaders == null && gheaders == '') {
            this.groupHeaders.push(groupHeadr);
          }


          if (gheaders != undefined && gheaders != null && gheaders != '') {
            this.groupHeaderCols[section_list].push(serviceCol);
          } else {
            this.groupHeaderCols[section_list] = [];
            this.groupHeaderCols[section_list].push(serviceCol);
          }

        } else {

          var gheaders = this.groupHeaderCols[cur_section_list];
          if (gheaders != undefined && gheaders != null && gheaders != '') {
            this.groupHeaderCols[cur_section_list].push(serviceCol);
          } else {

            this.groupHeaders.push(header);
            this.groupHeaderCols[header["column"]] = [];
            this.groupHeaderCols[header["column"]].push(serviceCol);
          }
        }

        this.gridHeader.push(wrapHeader(header));
      }

      this.noramlHeaders = this.bxDeepClone(this.gridHeader);


      if (exist_section_list) {
        this.gridHeader = this.groupHeaders;
      } else {
        this.header_view_model = 'normal'
      }


    },
    getIsBatchFun(e){
      // 获取是否有 批量操作功能
      if(e && e.length > 0 ){
        let batchs = []
        batchs = e.filter((item) => {
          if((item.button_type === 'batch_delete' || item.button_type === 'batch_update'|| item.button_type === 'batch_approve') &&  item.permission === true){
            return item
          }
         
        })
        if(batchs.length > 0){
          return true
        }else{
          return false
        }
      }else{
        return false
      }
      
    },

    async initGridData() {
      // console.log("initGridData")
      let gidInfo = new GridInfo();

      this.gridPage.pageSizes = gidInfo.pageSizes;
      this.selection = gidInfo.selection;

      let use_type = this.listType;
      if (
        this.listType == "wait" ||
        this.listType == "mine" ||
        this.listType == "myall" ||
        this.listType == "processed" ||
        this.listType == "all"||
        this.listType == "userall"
        
      ) {
        use_type = "proclist";
      }

      if (
        this.listType == "procreadlist"
      ) {
        use_type = "procreadlist";
      }
      
      //加载serviceCols
      await this.loadColsV2(this.service_name, use_type)
        .then(response => {
          let respData = response.body.data;
          let card_cfg_list = respData.card_cfg;
          // 列表的顺序
          if(respData.hasOwnProperty('order_columns') && respData.order_columns){
            this.orderColumn = respData.order_columns
          }
          // draft_support为true时表示上次操作有保存为草稿
          if(respData.hasOwnProperty('draft_support')){
            // 获取草稿标记
            this.isDraft = respData["draft_support"]
            if( respData["draft_support"] && respData["draft_tab"]){  
                this.tabsConfig.forEach((item) =>{
                   if(item.key == 'norm'){
                    //  待提交
                    item.label = respData["draft_tab"].normal || item.label
                   }else if(item.key == 'draft'){
                     //草稿
                    item.label = respData["draft_tab"].temp || item.label
                   }
                })
            }
            if(this.isDraft){
              this.loadDraftLength()
            }
            this.$emit('v2-loaded-isDraft',{isDraft:respData["draft_support"],tab:respData['draft_tab']})
          }
          
          if (
            card_cfg_list != null &&
            card_cfg_list != undefined &&
            card_cfg_list != "" &&
            this.card_no != null &&
            this.card_no != undefined
          ) {
            for (var card_item of card_cfg_list) {
              let card_no = card_item["card_no"];
              if (card_no == this.card_no) {
                this.card_cfg = card_item;
                break;
              }
            }
          }
          let listData = respData["srv_cols"];
          this.mainTable = respData.main_table;
          
          //列表的操作按钮
          this.gridButton = respData.gridButton.map(button => wrapButton(button,"grid"));
          this.rowButton = respData.rowButton.map(button => wrapButton(button,"row"));

          if(respData.more_config && respData.more_config.length >0 && respData.more_config !== undefined){
            // service more config 配置 selection 是否为可选择列表，默认为 false
            let moreConfig = JSON.parse(respData.more_config)
            this.moreConfig = moreConfig

            this.buildBatchAddCheck()
            if(this.moreConfig.hasOwnProperty("selection")){
               this.selection = this.moreConfig.selection    // moreConfig 配置有限批量操作 检查
            }else{
              this.selection = this.getIsBatchFun(this.gridButton)   // 检查批量操作权限
            }
          }else{
            this.selection = this.getIsBatchFun(this.gridButton)   // 检查批量操作权限
          }
          let addButton = _.find(
            this.gridButton,
            item => item.button_type === "add"
          );
          if (addButton) {
            this.addService = addButton.service_name;
          }

          if(!this.addService){

            let importButton = _.find(
              this.gridButton,
              item => item.button_type === "import"
            );
            if(importButton){
              this.addService = importButton.service_name;
            }

          }


          let updateButton = _.find(
            this.rowButton,
            item => item.button_type === "edit"
          );
          if (updateButton) {
            this.updateService = updateButton.service_name;
          }

          let deleteButton = _.find(
            this.rowButton,
            item => item.button_type === "delete"||item.button_type==='batch_delete'
          );

          if(!deleteButton) {
            deleteButton = _.find(this.gridButton,item => item.button_type === "delete"||item.button_type==='batch_delete')
          }
          
          if (deleteButton) {
            this.deleteService = deleteButton.service_name;
          }

          this.srv_cols = listData;
          this.buildGridHeaders(listData);

          if (this.mode === "finder") {
            this.gridButton
              .filter(button => button.name != "查询")
              .forEach(button => (button.show = false));
            this.rowButton.forEach(button => (button.show = false));
          }
        })
        .then(_ => {
          this.listLoaded = true;
          this.initLoad = true;
          this.emitEvent("metadata-loaded", this)
        });

      try {
        if (this.defaultOrder.length > 0) {
          this.order = this.order.concat(this.defaultOrder);
        }

        this.loadTableData().finally(_ => {
          if (this.defaultInplaceEditMode) {
            this.onInplaceEditClicked();
          }

          
         
          this.$emit("list-loaded", this);
        })

      } catch (e) {
        // handle case in add child list
        

        this.$emit("list-loaded", this);
        if (this.defaultInplaceEditMode) {
          this.onInplaceEditClicked();
        }
      }

      //默认数据参数填充
      if (this.defDataPara != null) {
        var tar_cfg = this.defDataPara.tar_cfg;
        if (tar_cfg != undefined && tar_cfg != null) {
          var tar_srv = tar_cfg.tar_srv;
          var col_rel = tar_cfg.col_rel;
          if (tar_srv == this.service) {

            let query_srv = this.defDataPara.serviceName;
            let query_condition = this.defDataPara.condition;
            let relationCondition = this.relationCondition
            await this.select(
              query_srv,
              query_condition,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              relationCondition
            ).then(response => {

              var dataResult = response.body.data;
              if (dataResult.length > 0) {

                var dataArray = [];
                for (var itemMap of dataResult) {
                  var temMap = {};
                  for (var key in itemMap) {
                    var tar_col = col_rel[key];
                    if (tar_col != undefined) {
                      temMap[tar_col] = itemMap[key];
                    }
                  }
                  if(this.storageType == 'mem'){
                    temMap['_dirtyFlags'] = this.defaultDirtyFlags || add
                    temMap['_guid'] = this.guid()
                  }
                  dataArray.push(temMap);
                }

                this.gridData = this.gridData.concat(dataArray);

              }


              this.$emit("list-data-loaded", this);
            });


          }

        }


      }
    },

    isLoaded: function () {
      return this.listLoaded;
    },

    getLinkUrl(row, header) {
      let data = row;
      let url = "";
      if (header.linkUrlFunc) {
        url = header.linkUrlFunc(data);
      }

      return url;
    },

    onLinkClicked(row, header) {
      let tabTitle =
        (header.srvcol &&
          header.srvcol.option_list_v2 &&
          header.srvcol.option_list_v2.service_label) ||
        "详情";
      this.addTabByUrl(this.getLinkUrl(row, header), tabTitle);
    },

    onInlineListLoaded(row, inlineList) {
      if (this.isInplaceEdit()) {
       
        inlineList.onInplaceEditClicked()
      }

      // inline lists as map, key as inlinelist.fk, value inlineList.gridData
      let propName = "_inlineLists";
      if (!row.hasOwnProperty(propName)) {
        this.$set(row, propName, {})
      }

      let inlineListsData = row[propName];
    
      inlineListsData[inlineList.foreignKey.constraint_name] = inlineList.gridData

      this.$emit('inline-list-loaded', inlineList, this)
    },
    getListShowFileList(col){
      let colItem = col || null
      
      if(colItem){
        let moreConfig = colItem.more_config
        return moreConfig && moreConfig.hasOwnProperty('append_file_info') && moreConfig.append_file_info ?  true : false
      }else{
        return false
      }
    },
    getListFileDatas(col,row){
      let dipsCol = '_'+ col.column + '_disp'
      if(row.hasOwnProperty(dipsCol)){
        return row[dipsCol]
      }else{
        return []
      }
       
    },
    onInlineListaDataChanged: function (row, inlineList) {
      // sync inline list into row data
      let propName = "_inlineLists";
      if (!row.hasOwnProperty(propName)) {
        this.$set(row, propName, {})
      }

      let inlineListsData = row[propName];
      this.$set(inlineListsData, inlineList.foreignKey.constraint_name, inlineList.gridData)

      // set row data dirty flags = update
      if (!row._dirtyFlags || row._dirtyFlags === "pristine") {
        this.$set(row, "_dirtyFlags", "update");
      }
    },
    handleScroll: function () {
      let scrollTop = document.documentElement.scrollTop;
      this.scroll = scrollTop;

    },

    onImportClicked: function (e) {
      this.actionGridButton = e
      this.activeForm = "import"
    },
    onBatchApprove(rows,item){
      let self = this
      this.activeForm = "batchApprove"
      if(rows && rows.length > 0 ){
         self.approvaList = rows
      }
      if(item && item.button_type === 'batch_approve'){
        let config = item.more_config ? JSON.parse(item.more_config) : null
        // console.log("more_config",item.more_config,JSON.parse(item.more_config))
        if(config && config.hasOwnProperty('approvalOptions')){
          self.approvalOptions = config.approvalOptions
        }
        
      }
      console.log("onBatchApprove",rows,item)
    },
    onExportClicked(columns) {
      // send req to generate excel
      // 导出操作
      console.log("onExportClicked",columns)
      
      let isProc = false
      if (
        this.listType == "wait" ||
        this.listType == "mine" ||
        this.listType == "myall" ||
        this.listType == "processed"||
        this.listType == "all"||
        this.listType == "userall"
      ) {
        isProc = this.listType
      }
      

      this.genExportExcel(this.service_name, this.buildQueryConditions(), null, this.order,null,null,isProc,columns)
        .then((response) => {

          var uuid = response.body.data.uuid
          this.downloadexport(uuid);

        })
    },

    onImportDialogClosed() {
      this.activeForm = 'xx'
      this.loadTableData();
    },
    onExportDialogClosed(){
      this.activeForm = 'xx'
      this.loadTableData();
    },
    isRowButtonVisible(button, row) {
      if(button.button_type !== "_btn_group"){
        let notDeleteOnStandby = !('standby' === row._dirtyFlags && ('delete' === button.button_type))
        let noUpdateDetail4InplaceEdit = !(this.isInplaceEdit() && (button.button_type === 'update' || button.button_type === 'detail' ))
        // console.log("显示按钮",button.button_type,notDeleteOnStandby && noUpdateDetail4InplaceEdit && button.evalVisible(row))
        return notDeleteOnStandby && noUpdateDetail4InplaceEdit && button.evalVisible(row);
      }else{
        // console.log("显示按钮 true",true)
        return true
      }
      
    },

    onPopupMemListClick(row, button) {
      this.activeForm = 'manageChildList';
      this.activeRow4PopupMemList = row;
      this.activePopupMemList = button;

    },

    onPopupMemListLoaded(popupMemList) {
      let fk = this.activePopupMemList.foreign_key;
      popupMemList.setGridData(this.activeRow4PopupMemList._inlineLists[fk.constraint_name], this.activeRow4PopupMemList);
      popupMemList.setEditMode(true);
    },
    isFkJson(row,col){
      let isFkJson = false
      if(col&&col.srvcol&&col.srvcol.col_type){
        isFkJson =['fks','fkjson','fkjsons'].indexOf( col.srvcol.col_type) > -1
      }
      return isFkJson
    },
    getFkJson(row,col){
      let val = ''
      let result = []
      if( row && col && col.column && row[col.column] ){
        val = row[col.column]
      }
      let colType = ''
      if(col&&col.srvcol&&col.srvcol.col_type){
        colType = col.srvcol.col_type
      }
      let fmt = col&&col.srvcol&&col.srvcol.fmt
      let valueCol = fmt&&fmt.primary_col;
      let dispCol = fmt&&fmt.disp_col;
      switch (colType) {
        case 'fks':
          result = val?val.split(','):[]
          break;
        case 'fkjson':
          try {
            result = val?JSON.parse(val):{}
          } catch (error) {
            console.log(error)
          }
          if(result && result[dispCol]){
            result = [result[dispCol]||result[valueCol]]
          }
          break;
        case 'fkjsons':
          result = val?JSON.parse(val):[]
          if(Array.isArray(result)&&result.length>0){
            result = result.map(item=>item[dispCol]||item[valueCol])
          }
          break
      }
      return result
    }
  },


  created: function () {


    // alert(this.getVersionNo());

    

    if (this.$route && this.$route.params) {
      if (this.isListTopComp() && this.$route.params.service_name) {
        this.service_name = this.service || this.$route.params.service_name;
      }
      if (this.isListTopComp() && this.$route.params.card_no) {
        this.card_no = this.$route.params.card_no;
      }
    }
    /**
     * 1014 邓旭升需求，此处变更
     */
    if (this.isListTopComp() && this.$route && this.$route.query) {
   // if (this.$route && this.$route.query) {
      var operate_params = this.getOperateParams();
      if (operate_params != "" && operate_params != null ) {
        var operate_Object = JSON.parse(operate_params);
        // this.service_name = operate_Object["serviceName"] ;
        if(typeof operate_Object ==='object'){
          this.service_name = operate_Object["serviceName"] ? operate_Object["serviceName"] : this.service ? this.service : this.service_name;
          this.$route.params.service_name
          if (
            operate_Object["condition"] != undefined &&
            operate_Object["condition"] != null
          ) {
            this.custCondition = operate_Object["condition"];
          }
        }
      }else{
        this.service_name = this.service || this.service_name // this.service list 组件 props service 优先使用
      }
      var selectType = this.$route.query.selectType;
      if (selectType != undefined && selectType != "" && selectType != null) {
        this.defaultapi = "selectByUser";
      }
    }
    if(this.listType !== 'treelist'){
      if(this.listType == 'list' || this.listType == 'treelist'){
        this.inplaceEditMode = false
      }
      this.initGridData();
    }
    
    
    if (this.card_no != undefined) {
      this.gridPage.pageSize = 12;
      this.gridPage.pageSizes.push(12);
    }
    if (this.pageSize != undefined) {

      this.gridPage.pageSize = this.pageSize;
    }

    this.uid = this._uid;
    window.list = window.list || {};
    window.list[this.service_name] = this;
  },
};
