import {createLinkUrlFunc} from "../../util/FieldUtil";
import _ from 'lodash';
import Vue from "vue";

export class FieldInfo { 
  constructor(srvCol, formType) {
    if (!srvCol) {
      return;
    }

    // // !!! mock data !!!
    // 0.5/0.25
    // if (srvCol.columns === "id_card" || srvCol.columns === "mobile" ) {
    //   srvCol.group_field = "real_name"
    //   srvCol.col_span2 = 0.25;
    // }
    //
    // // for debug
    // if (srvCol.columns == 'real_name') {
    //   srvCol.col_span = "1" ;
    //   srvCol.col_span2 = "0.5" ;
    //
    // }


    this.srvCol = srvCol;
    this.type = srvCol.col_type;
    this.fmt = srvCol.fmt;
    this.name = srvCol.columns;
    this.label = srvCol.label;
    this.placeholder = srvCol.placeholder || "请输入...";
    this.seq = srvCol.seq || 0;
    this.explain = srvCol.remark || ''
    this.format = null  // 格式
    // 更多json 配置信息
    this._DateRangeEndColName = null // 起止日期的 结束字段名
    this.moreConfig = srvCol.more_config ? JSON.parse(srvCol.more_config) : srvCol.more_config
    this.fileSize = 2
    this.isUniqueCheck = {
      state:"none"
    };  // 校验唯一性状态 none  ，无需校验， UniqueCheckNone 未校验  UniqueCheckError 错误 UniqueCheckOk 通过 loading 校验中
    if(this.moreConfig!==null && this.moreConfig !== undefined){
      if(this.moreConfig.hasOwnProperty('DateRangeConfig')){
        /**
         * 起止日期配置加载
         */
        if(this.moreConfig.DateRangeConfig.hasOwnProperty('DateRangeEndColName') && this.moreConfig.DateRangeConfig.hasOwnProperty('DateRangelabel')){
          this._DateRangeEndColName = this.moreConfig.DateRangeConfig.DateRangeEndColName
          // this._DateRangeCfg = this.moreConfig.DateRangeConfig
          this.label = this.moreConfig.DateRangeConfig.DateRangelabel
        }
      }
      if(this.moreConfig.hasOwnProperty('finder_auto')){
        // 处理 moreConfig 配置 finder 是否自动查询默认值 finder_auto
        this._finderAuto = this.moreConfig.finder_auto
      }else{
        this._finderAuto = true
      }
      if(this.moreConfig.hasOwnProperty("fileSize")){
        this.fileSize = this.moreConfig.fileSize
      }
      if(this.moreConfig.hasOwnProperty("uniqueCheck")){
        this.isUniqueCheck = {
          state:"UniqueCheckNone",
          msg:this.moreConfig.uniqueCheck.helpText
        }
      }
    }else{
      this._finderAuto = true
    }

    // only for add form, set too srvval
    this.initValueExpr = srvCol.init_expr;
    // internal use: 以只读文本方式显示，例如detail页面中的字段
    this.readonly = false;
    this.resolveEditor(formType);
    this.resolveOptions(srvCol);
    if (srvCol.col_span && ("" + srvCol.col_span).includes("/")) {
      let parts = ("" + srvCol.col_span).split("/");
      srvCol.col_span = parts[0];
      srvCol.col_span2 = parts[1];
    }
    this.buildValidateRules(srvCol);
    this.resolveLinkUrl(srvCol)
    this.resolveColspan(srvCol.col_span || 0.25);

    this.xIf = srvCol.x_if;
    this.upstream = srvCol.upstream; // 处理上游字段
    this.redundant = srvCol.redundant;   // redundant 配置

    this.visible = "true";
    this.bodyVisible = true;
    this.editable = srvCol.col_updatable_expr || (srvCol.updatable !== 0 && srvCol.updatable !== "0")

    this.noSearchIcon = this.moreConfig !== undefined && this.moreConfig !== null && this.moreConfig.noSearchIcon !== undefined  ? this.moreConfig.noSearchIcon : false; 
   
    this.rows = 0;
    this.sec = srvCol.section;

  }

  isNumeric() {
    let numerics = ['int', 'Integer', 'float', 'Float', 'double', 'Double', 'Money'];
    return this.type && (numerics.indexOf(this.type) >= 0);
  }

  isTextual() {
    let textuals = ['String', 'MultilineText', 'Note', "Json", "Sql", 'Js'];
    return this.type && (textuals.indexOf(this.type) >= 0);
  }

  isFinder() {
    let isFk = this.type && this.type.indexOf && (this.type.indexOf("bx") == 0 || this.type.indexOf("fk") == 0);
    let isBuiltinFk = this.type && (this.type === 'User' || this.type === 'Dept');
    return isFk || isBuiltinFk;
  }

  isCode() {
    return this.type === "Json" || this.type === "Sql" || this.type === "Js";
  }

  isTemporal() {
    let temporals = ['date', 'Date', 'time', 'Time', 'datetime', 'DateTime', "Year", "Month"];
    return this.type && temporals.indexOf(this.type) >= 0;
  }

  isDateTime() {
    let temporals = ['datetime', 'DateTime'];
    return this.type && temporals.indexOf(this.type) >= 0;
  }

  isDate() {
    let temporals = ['date', 'Date'];
    return this.type && temporals.indexOf(this.type) >= 0;
  }

  isTime() {
    let temporals = ['time', 'Time'];
    return this.type && temporals.indexOf(this.type) >= 0;
  }

  isDict() {
    let temporals = ['Dict', 'bxsys_dict'];
    return this.type && temporals.indexOf(this.type) >= 0;
  }

  isUploader() {
    let temporals = ['FileList', 'Image'];
    return this.type && temporals.indexOf(this.type) >= 0;
  }

  isFilterable() {
    return !(this.isUploader() || this.type === "Note")
  }

  isJoinedDisp() {
    return this.name && this.name.startsWith("_") && this.name.endsWith("_disp");
  }

  getMin() {
    if (!this.rules) {
      return;
    }

    let ret = this.rules.filter(rule => rule.hasOwnProperty('min'));
    if (ret.length > 0) {
      return ret[0].min;
    }
  }
  getLabelStyle(){
    let moreConfig = this.moreConfig
    if(moreConfig && moreConfig.hasOwnProperty('labelStyle')){
      return moreConfig.labelStyle
    }else{
      return 'normal'
    }
  }
  getMax() {
    if (!this.rules) {
      return;
    }

    let ret = this.rules.filter(rule => rule.hasOwnProperty('max'));
    if (ret.length > 0) {
      return ret[0].max;
    }
  }

  isRequired() {
    if (!this.rules) {
      return;
    }

    return this.rules.filter(rule => rule.hasOwnProperty('required')).length > 0;
  }

  getDefaultValue() {
    if (this.editor) {
      if (this.editor == 'input-range') {
        return [];
      } else if (this.editor == 'multiselect') {
        return [];
      }
    }

    return null;
  }

  resolveEditor(formType) {
    if (this.type == 'Dept') {
      this.editor = 'tree-finder';
    } else if (this.type == 'Enum' || this.type == 'Dict') {
      if (this.srvCol.subtype === 'radio') {
        this.editor = 'radio';
      }else {
        this.editor = 'select';
      }
    } else if (this.type == 'Set') {
      if (this.srvCol.subtype === 'checkbox') {
        this.editor = 'checkbox';
      } else if(this.srvCol.subtype === 'finder'){
        this.editor = 'multifinder';
      } else {
          this.editor = 'multiselect';
      }
    } else if (this.type == 'Boolean') {
      this.editor = 'switch';
    } else if (this.type == 'Date') {
      this.editor = 'date-picker';
      this.subtype = "date";
    } else if (this.type == 'Year') {
      this.editor = 'date-picker';
      this.subtype = "year";
    } else if (this.type == 'Month') {
      this.editor = 'date-picker';
      this.subtype = "month";
    } else if (this.type == 'DateTime') {
      this.editor = 'date-time-picker';
      // 利用date elmentUi date 默认 format 设置 日期控件格式
      if(this.moreConfig && this.moreConfig.hasOwnProperty("format")){
        // this.format = this.moreConfig.format
        this.format = 'yyyy-MM-dd HH:mm'
      }
      
    } else if (this.type == 'Time') {
      this.editor = 'time-picker';
    } else if (this.type == 'MultilineText') {
      this.editor = 'textarea';
    } else if (this.type == 'Note') {
      this.editor = 'ueditor';
    } else if (this.type == 'FileList') {
      this.editor = 'upload-file';
    } else if (this.type == 'Image') {
      this.editor = 'upload-image';
    } else if (this.type == 'UserList') {
      this.editor = 'userlist';
    } else if (this.type == 'QrCode') {
      this.editor = 'qrcode';
    } else if (this.isFinder()) {
      this.editor = 'finder';
      if(this.srvCol && this.srvCol.option_list_v2 && this.srvCol.option_list_v2.hasOwnProperty("autoSplicDisplay")){
        this.autoSplicDisplay = this.srvCol.option_list_v2.autoSplicDisplay
      }
    } else if (this.isNumeric()) {
      this.editor = 'input-number';
    } else if (this.type == "Json") {
      this.editor = 'code-editor';
      this.lang = "json"
    } else if (this.type == "Sql") {
      this.editor = 'code-editor';
      this.lang = "mysql"
    } else if (this.type == "Js") {
      this.editor = 'code-editor';
      this.lang = "javascript"
    } else if(this.type == "Password"){
      this.editor = 'Password'
    }else if(this.type === 'DateRange'){
      this.editor = 'DateRange'
      if(this.DateRangeEndColName === null){
        // this.visible = false
      }
    }else if(this.type === 'snote'){
      this.editor = 'snote'
    }else if(this.type === 'Extend'){
      this.editor = 'extend'
    }else{
      this.editor = null;
    }

    if (formType == 'filter') {
      if (this.isNumeric()) {
        this.editor = 'input-range'
      } else if (this.type == 'Date') {
        this.editor = 'date-range'
      } else if (this.type == 'Time') {
        this.editor = 'time-range'
      } else if (this.type == 'DateTime') {
        this.editor = 'date-time-range'
      } else if (this.type == 'Enum' || this.type == 'Dict') {
        this.editor = 'multiselect'
      } else if (this.isJoinedDisp() || this.isTextual() || this.isFinder()) {
        this.editor = 'input'
      }
    }
  }

  resolveOptions(srvCol) {
    // relocate literal options: for type: dict, enum
    if(srvCol.fmt&&!srvCol.option_list_v2){
      srvCol.option_list_v2 = srvCol.fmt
    }

    if (_.isArray(srvCol.option_list_v2)) {
      let options = srvCol.option_list_v2
      srvCol.option_list_v2 = {
        options,
      }
    }

    this.setOptionList4BuiltinFinder(srvCol);

    if (!srvCol.option_list_v2) {
      return
    }

    let optionListV2 = _.cloneDeep(srvCol.option_list_v2) ;

    this.dispLoader = {
      service: optionListV2.serviceName || optionListV2.service,
      conditions: optionListV2.conditions,
      relation_conditions: optionListV2.relation_conditions,
      orders: optionListV2.orders,
      showAsPair: optionListV2.show_as_pair,
      imgUrlExpr: optionListV2.img_url_expr,
      dedup: optionListV2.dedup,
      srvApp:optionListV2.srv_app,
      parentCol:optionListV2.parent_col,
      refedCol:optionListV2.refed_col,
    };
    if(this.editor === "userlist"){
      this.dispLoader.service = 'srvsso_user_select'
      optionListV2.key_disp_col = 'user_disp'
    }

    this.allowInput = optionListV2.allow_input;
    this.parentCol = optionListV2.parent_col;
    this.valueCol = optionListV2.refed_col || optionListV2.primary_col;
    this.dispCol = optionListV2.key_disp_col || optionListV2.disp_col;

    if (optionListV2.is_tree) {
      this.editor = "tree-finder";
    }
  }

  setOptionList4BuiltinFinder(srvCol) {
    if (this.type === 'Dept') {
      srvCol.option_list_v2 = {
        serviceName: 'srvauth_dept_select',
        srv_app: "auth",
        refed_col: 'dept_no',
        key_disp_col: 'dept_name',
        show_as_pair: false,
      };
    } else if (this.type === 'User') {
      srvCol.option_list_v2 = {
        serviceName: 'srvsso_user_select',
        srv_app: "sso",
        refed_col: 'user_no',
        key_disp_col: 'user_disp',
        show_as_pair: false,
      }

    } else if (this.type === 'UserList') {
      // srvCol.option_list_v2 = {
      //   serviceName: 'srvsys_user_list_related_select',
      //   srv_app: "sso",
      //   refed_col: 'userlist unsupported',
      //   key_disp_col: 'disp',
      //   show_as_pair: false,
      // }
      srvCol.option_list_v2 = {
        serviceName: 'srvsso_user_select',
        srv_app: "sso",
        refed_col: 'userlist unsupported',
        key_disp_col: 'user_disp',
        show_as_pair: false,
      }
    } else if (this.type === 'Dict' || this.type === 'bxsys_dict') {
      let ext = {
        serviceName: 'srvsys_dict_select',
        refed_col: 'dict_no',
        key_disp_col: 'value',
        show_as_pair: false,
      }

      _.assign(srvCol.option_list_v2, ext)
    }
  }

  resolveColspan(col_span) {
    this.colspan = {};
    if (!this.editor) {
      this.colspan = this.setLayoutColSize(col_span);
    } else {
      if (this.editor == 'extend' ||  this.editor == 'textarea' || this.editor == 'ueditor' || this.type === 'FileList' || this.editor.startsWith('upload') || this.isCode()) {
        // console.log("整行字段",this.editor)
        this.colspan = this.setLayoutColSize(1);
      } else if (this.editor == 'date-range' || this.editor == 'date-time-range') {
        this.colspan = this.setLayoutColSize(0.5);
      } else if (this.editor == "input-range" || this.editor == "time-range") {
        this.colspan = this.setLayoutColSize(0.25);
      }else if(this.editor == "DateRange"){
        this.colspan = this.setLayoutColSize(0.5);
      } else {
        // 根据colspan设置响应式布局
        this.colspan = this.setLayoutColSize(col_span);
      }
    }
  }

  setLayoutColSize(colSpan) {
    // this.colspan = 24;
    // 根据colspan设置响应式布局
    // xl:≥1920px;lg:≥1200px;md:≥992px;sm:≥768px;xs:<768px
    let cols = 24;
    let colspanObj = {};
    if (colSpan) {
      if (colSpan == '0.25') {
        colspanObj['xl'] = cols * colSpan;
        colspanObj['lg'] = cols * colSpan;
        // colspanObj['sm'] = cols * colSpan * 2;
        // colspanObj['md'] = cols * colSpan * 8 / 6;
        colspanObj['md'] = cols;
        colspanObj['sm'] = cols;
        colspanObj['xs'] = cols;
      } else if (colSpan == '0.5') {
        colspanObj['xl'] = cols * colSpan;
        colspanObj['lg'] = cols * colSpan;
        // colspanObj['md'] = cols * colSpan;
        // colspanObj['sm'] = cols * colSpan * 2;
        colspanObj['md'] = cols;
        colspanObj['sm'] = cols;
        colspanObj['xs'] = cols;
      } else if (colSpan == 1) {
        colspanObj['xl'] = cols * colSpan;
        colspanObj['lg'] = cols * colSpan;
        colspanObj['md'] = cols * colSpan;
        colspanObj['sm'] = cols * colSpan;
        colspanObj['xs'] = cols;
      }
      return colspanObj;
    } else {
      return null;
    }
  }

  buildValidateRules(srvCol) {
    if (!srvCol.validators) {
      return null;
    }
    let map = new Map();
    let keyMapper = {
      ngPattern: 'pattern',
      ngMaxLength: 'max',
    }

    // convert validator to map
    srvCol.validators.split(";").filter(part => !!part).forEach(part => {
      // 多个校验 时 "js_validate=" 必须配置在最后一项
      let subparts = part.split("=");
      let key = subparts[0].trim();
      key = keyMapper[key] || key;
      if(key==='js_validate'){
        subparts = part.split("js_validate=");
      }
      let val = subparts.length > 1 ? subparts[1].trim() : true;
      if (key == 'min' || key == 'max') {
        val = Number.parseInt(val);
        if (isNaN(val)) {
          return;
        }
      }

      let rule = {name: key, trigger: 'change'};
      rule[key] = val;

      if (this.isNumeric()) {
        rule.type = "number";
      }

      if (!rule.message) {
        switch (key) {
          case  'required': {
            rule.message = `${this.label}为必填`;
            break;
          }
          case  'min': {
            rule.message = `${this.label}必须小于`;
            break;
          }
          case  'max': {
            rule.message = `${this.label}必须大于`;
            break;
          }
          case  'js_validate': {
            rule.message = `${this.label}填写有误`;
            break;
          }
        }
      }


      map.set(key, rule);
    });
    let editable  = srvCol.col_updatable_expr || (srvCol.updatable !== 0 && srvCol.updatable !== "0")
    if(this.isFinder() && editable ){
      // finder类型字段 自动加上合法值校验
      let rule = {name: 'isValidValue', trigger: 'change',message:'请在下拉选项中选择有效值后提交'}
      map.set('isValidValue',rule)
    }

    // put validator message to map
    if (srvCol.validators_message) {
      srvCol.validators_message.split(";").filter(part => !!part).forEach(part => {
        let subparts = part.split("=");
        let key = subparts[0].trim();
        key = keyMapper[key] || key;

        let val = subparts.length > 1 ? subparts[1].trim() : null;

        let rule = map.get(key);
        if (rule) {
          rule.message = val;
        }
      })

    }

    // convert to rules list
    this.rules = Array.from(map.values());
  }

  resolveLinkUrl(srvCol) {
    let linkUrlFunc = srvCol.link_url_func
    if (linkUrlFunc) {
      if (linkUrlFunc.trim() === "false") {
        return;
      }

      this.linkUrlFunc = (data, vm) => {
        let ret = eval("var zz=" + linkUrlFunc + "(data, vm); zz");
        return ret;
      }
    } else if (this.isFinder()) {
      // make an link url func
      let optionListV2 = srvCol.option_list_v2
      this.linkUrlFunc = createLinkUrlFunc(optionListV2, this.name)
    }
  }

  getMaxLength() {
    if (!this.isNumeric() && this.rules) {
      let maxRules = this.rules.filter(rule => !!rule.ngMaxlength);
      return (maxRules.length > 0) && maxRules[0].ngMaxlength;
    }
  }
  getMinLength() {
    if (!this.isNumeric() && this.rules) {
      let minRules = this.rules.filter(rule => !!rule.ngMinlength);
      return (minRules.length > 0) && minRules[0].ngMinlength;
    }
  }
}
