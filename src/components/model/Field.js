import * as DataUtil from "../../util/DataUtil";
import {formatMoney} from "../../util/DataUtil";
import _ from "lodash";

export const hotTableMetadata = {
  User: {
    srvApp: "sso",
    selectService: "srvsso_user_select",
    table: "bxsso_user",
    valueCol: "user_no",
    dispCol: "user_disp",
  },

  Dept: {
    srvApp: "auth",
    selectService: "srvauth_dept_select",
    table: "bxsys_dept",
    valueCol: "dept_no",
    dispCol: "dept_name",
  },

}

export function getHotTableName(type) {
  return hotTableMetadata[type] && hotTableMetadata[type].table
}

let guid = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}


export class Field {

  constructor(fieldInfo, form) {
    this.guid = guid()
    this.info = fieldInfo;
    this.model = null;
    this.modelOld = null;
    this.vif = true;
    this.moreInfo = null

    if (this.info.editor == 'multiselect') {
      // multiselect need default value as []
      this.model = this.model || []
    }

    if (this.info.editor == 'finder') {
      this.finderSelected = ""
    }

    this.options = (this.info.srvCol && this.info.srvCol.option_list_v2 && this.info.srvCol.option_list_v2.options) || [];
    this.optionsFunc = _ => {
      return this.options;
    }

    // vm instance of field-editor
    this.editor = null;
    this.form = form;

    // cache value for upstream fmoreConfigield.model
    // if field has upstream field, add it as an condition

    if (this.info.upstream) {
      let field = this;
      let upstreamCondition = {
        colName: this.info.upstream.refCol,
        ruleType: "eq",
        valueFunc: _ => {
          return field.form.fields[field.info.upstream.field].getSrvVal();
        }
      };

      if (this.info.dispLoader) {
      
        this.info.dispLoader.conditions = this.info.dispLoader.conditions || [];
        this.info.dispLoader.conditions.push(upstreamCondition);
      }
    }

    // true 代表无权限查看的敏感数据
    this.noPerm4Sensi = false;

    // validate error msg map, key is rule name, value is err msg
    this.errMsg = {};
    // validate error prompt map, key is rule name, value is prompt msg
    this.promptMsg = {};
    // array item is object, keys: value, remark
    this.historyData = [];
  }
  getSrvVal() {
    // 获取字段值
    if (this.info.type == 'Note' && this.editor) {
      return this.editor.getSrvVal();
    } else if (this.info.type == 'Boolean') {
      return !!this.model ? 1 : 0;
    } else if (this.info.editor == "userlist" && this.editor) {
      return this.editor.getSrvVal();
    } 
    let ret = this.model;
    if (ret == null || ret == undefined) {
      return null;
    }

    if (this.info.isTemporal() && ret !== '******') {
      let temporalType = this.info.subtype || this.info.type.toLowerCase();
      if (Array.isArray(ret)) {
        for (let key in ret) {
          ret[key] = DataUtil.formatDate(ret[key], temporalType,this.info.format)
        }
      } else {
        ret = DataUtil.formatDate(ret, temporalType,this.info.format)
      }
    } else if (this.info.isFinder()) {
      if (typeof ret === 'object') {
        ret = ret[this.info.valueCol];
      }
    } else if (this.info.editor == "multiselect") {
      // both filter  ruletype == in, and sql set:   "a,b,c"
      if (ret && ret.length && ret.join) {
        ret = ret.join(",");
      } else {
        ret = null;
      }
    }
    // console.log("获取到的字段值",ret,this.info.format)
    return ret;
  }

  setSrvVal(srvVal) {
    if (srvVal&&srvVal === this.getSrvVal()) {
      let isFinderValScalar = (this.info.isFinder() && !_.isObject(this.model));
      if (!isFinderValScalar) {
        return
      }
    }

    let handledByEditor = false;
    if (this.editor && this.editor.isSpecial()) {
      this.editor.setSrvVal(srvVal);
      handledByEditor = true 
    } else if (this.info.editor == "multiselect") {
      if (srvVal && srvVal.trim()) {
        this.model = srvVal.trim().split(",");
      } else {
        this.model = [];
      }
    } else if( this.info.isNumeric()) {
      if(Number.parseFloat(srvVal) !== NaN && srvVal !== null && srvVal !== '******') {
        this.model = Number.parseFloat(srvVal)
      } else {
        this.model = srvVal
      }
    }else {
      this.model = srvVal;
      // 如果原始值为 “” || null 时 调用默认值配置表达式，有的话则复制
      if((srvVal === "" || srvVal === null || srvVal === undefined) && this.hasInitValueExpr()){
        this.model = this.setSrvVal(this.evalInitValueExpr())
        console.log("默认值",srvVal,this.model,this.setSrvVal(this.evalInitValueExpr()))
      } 
    }

    if (!handledByEditor && this.editor) {
      this.editor.$emit("field-value-changed", this.info.name)
    }
  }

   getDispVal() {
    let self = this
    if (this.info.isFinder()) {
      if (!this.model) {
        return null
      }

      let dispCol = this.info.dispCol;
      if (this.model.hasOwnProperty(dispCol)) {
        return this.model[dispCol];
      } else {
        return this.getSrvVal();
      }
    } else if (this.info.isDict()) {
      if (this.options) {
        let target = this.options.filter(pair => pair.value == this.model);
        return target.length > 0 ? target[0].label : this.getSrvVal();
      } else {
        return this.getSrvVal();
      }

    } else if (this.info.type == 'Boolean') {
      return !!this.model ? '是' : '否';
    } else if (this.info.type == 'UserList') {
      // function 
      try {
        if (this.model) {
          let items = JSON.parse(this.model)
          if (items && items.length) {
            items = items.map((item) => {
              return  item.disp
            })
            // return _.join(items.map(item => item.disp), ",")
            let valKeys =  _.join(items.map(item => item), ",")
            
             return valKeys
          }
        }
      } catch (e) {
      }

      return "";
    } else {
      return this.getSrvVal();
    }
  }

  getDispVal4Read() {
    if(this.noPerm4Sensi === true){
      return "******";
    }

    let value = this.getDispVal();
    let isSensitive = value === "******";
    if (_.isNull(value) || _.isUndefined(value) || "" === value || isSensitive) {
      return value;
    }

    let fieldType = this.info.type ? this.info.type : "";
    let dispCol = this.info.dispCol;
    let separator = "-";
    if ("year" === fieldType.toLowerCase()) {
      return _.split(value, separator)[0]
    } else if ("month" === fieldType.toLowerCase()) {
      let parts = _.split(value, separator).slice(0, 2)
      return _.join(parts, separator);
    } else if (fieldType === "Boolean") {
      return !!value ? "是" : "否";
    } else if (fieldType === "Money") {
      if(value !== null &&  value !== ''){
        return formatMoney(value + "")
      }else{
        return ''
      }
      
    } else if(fieldType === "fk" && _.isObject(this.model)){
      // fk 详情页显示 option list配置的 拼接值
      let fieldInfo = this.info
      let loader = fieldInfo.dispLoader
      let item = this.model
        console.log("1",value,this.model)
        value =  loader.showAsPair !== true ?  item[ fieldInfo.dispCol ] : `${item[ fieldInfo.dispCol ]}/${item[ fieldInfo.valueCol ]}`;
        
        console.log("2",value,this.model)
        return value;
    }else if (this.shouldConvertDispValue4HotTable() && this.form.$store) {
      let table = getHotTableName(this.info.type)
      let noVal = this.getSrvVal();
      let tableData = this.form.$store.getters.getTableData(table);
      if (tableData && tableData.length > 0) {
        let target = tableData.filter(item => item[this.info.valueCol] === noVal)
        return target && target.length && target[0][dispCol]
      } else {
        
        return noVal;
      }
    }
    else {
         
      return value;
    }
  }


  shouldConvertDispValue4HotTable() {
    let type = this.info.type;
    return (hotTableMetadata[type]) && this.form && this.form.formType === "detail";
  }

  reset() {
    this.model = this.info.getDefaultValue();
    if (this.editor && this.editor.isSpecial()) {
      this.editor.setSrvVal(null);
    }
  }

  reset2Init() {
    if (this.hasInitValueExpr()) {
      this.setSrvVal(this.evalInitValueExpr())
    } else {
      this.reset();
    }
  }

  evalXIf() {
    let self = this
    if (self.info.xIf == null || self.info.xIf == undefined) {
      return true;
    } else if (typeof(variable) == typeof(true)) {
      return self.info.xIf;
    } else if (self.form && self.form) {
      // should be an string of test_func
      // noinspection JSUnusedLocalSymbols
      let mainData = self.form.getParentFormModel()
      let approval = self.form.approvalFormMode 
      
      // console.log('表单',approval,"var zz=" + self.info.xIf + "(row,mainData,approval); zz")
      let row = self.form.srvValFormModel();
      let ret = eval("var zz=" + self.info.xIf + "(row,mainData,approval); zz");
      return !!ret;
    }
  }

  evalVisibleExpr() {
    return this.evalVersatileFlagVar(this.info.visible)
  }

  evalEditable() {
    return this.evalVersatileFlagVar(this.info.editable)
  }

  evalInitValueExpr() {
    return this.evalVersatileFlagVar(this.info.initValueExpr)
  }

  evalVersatileFlagVar(flagVar) {
    let vm = this.form;
    let formModel = vm.srvValFormModel && vm.srvValFormModel();

    if (_.isBoolean(flagVar)) {
      return flagVar;
    } else if (_.isString(flagVar)) {
      return vm.evalBxExpr(flagVar, formModel, vm);
      // 运行字符串表达式
    } else if (_.isFunction(flagVar)) {
      return flagVar(formModel);
    } else {
      return !!flagVar; 
    }
  }

  evalFormExpr(expr, defaultValue) {
    let vm = this.form;
    if (_.isBoolean(expr)) {
      return expr;
    } else {
      let formModel = vm.srvValFormModel && vm.srvValFormModel();
      if (_.isFunction(expr)) {
        return expr(formModel);
      } else if (_.isString(expr)) {
        if (expr.trim().startsWith("${") && expr.trim().endsWith("}")) {
          let readExpr = expr.trim().substring(2, expr.trim().length - 1);
          return vm.evalBxExpr(readExpr, formModel, vm, defaultValue);
        } else {
          return expr;
        }
      } else {
        return expr;
      }
    }
  }


  evalVisible() {
    return this.evalXIf() && this.evalVisibleExpr();
  }

  isEmpty() {
    let srvval = this.getSrvVal();
    return srvval === null || srvval === undefined || srvval === '' || srvval === 'Invalid date';
  }

  setVisible(visible) {
    this.info.visible = visible;
  }

  setEditable(editable) {
    this.info.editable = editable;
  }

  setInitValueExpr(initValueExpr) {
   
    this.info.initValueExpr = initValueExpr;
  }
  

  hasInitValueExpr() {
    return !!this.info.initValueExpr;
  }

  putValidateError(rule, errMsg) {
    console.log('put Validate Error:',rule, errMsg)
    this.errMsg[rule] = errMsg;
    this.errMsg = _.clone(this.errMsg);

  }

  putValidatePrompt(rule, promptMsg) {
  
    this.promptMsg[rule] = promptMsg;
    this.promptMsg = _.clone(this.promptMsg);

  }

  clearValidateError(ruleName) {
    
    delete this.errMsg[ruleName];
    this.errMsg = _.clone(this.errMsg);
  }

  clearValidatePrompt(ruleName) {
    
    delete this.promptMsg[ruleName];
    this.promptMsg = _.clone(this.promptMsg);
  }

  hasValidateError() {
    return !_.isEmpty(this.errMsg);
  }

  hasValidatePrompt() {
    return !_.isEmpty(this.promptMsg);
  }

  getAnyValidateError() {
    for (let key in this.errMsg) {
      return this.errMsg[key];
    }
    return "";
  }
  getAnyValidatePrompt() {
    for (let key in this.promptMsg) {
      return this.promptMsg[key];
    }
    return "";
  }
  hasHistoryData(){
    return !_.isEmpty(this.historyData) && this.historyData.length > 1;
  }
  getUniqueCheck(){
    let isUnique = this.info.moreConfig
    if(isUnique && isUnique.hasOwnProperty('uniqueCheck')){
       return true
    }else{
      return false
    }
  }
  getUniqueCheckMsg(){
    let isUnique = this.info.isUniqueCheck
    
    return isUnique
  }
  setNoPerm4Sensi(value){
    this.noPerm4Sensi = value;
    value && this.setEditable(false);
  }

}
