import { FieldInfo } from '../model/FieldInfo'
import { Field } from '../model/Field'
import Vue from 'vue'
import { ActionInfo } from "../model/ActionInfo";
import { formatDate } from "../../util/DataUtil";

export default {
  created: function () {
    window.forms = window.forms || {}
    window.forms[ this.name ] = this;
  },

  props: {
    name: {
      type: String,
      default: "main"
    },

    service: {
      type: String
    },

    // for update/detail/add, it is loader's condition
    // for filter, it is default condition
    defaultConditions: {
      type: Array
    },

    // for update/add, it is form fields default value
    defaultValues: {
      type: Object
    },

    navAfterSubmit: {
      type: Boolean,
      default: true,
    },

    submit2Db: {
      type: Boolean,
      default: true,
    },

    overrideData: {
      type: Object,
    },

    overrideformType: {
      type: String
    },

    srvvalFormModelDecorator: {
      type: Function,
    },

    loaderServiceProp: {
      type: String,
    },
    parentAddMainFormDatas: {
      type: Object,
      default: function () {
        return null
      }
    },
    mainFormDatas:{
      type: Object,
      default: function () {
        return null
      }
    },
    approvalFormMode: {
      type: Object,
      default: function () {
        return null
      }
    },
    pageIsDraft: {
      type: String,
      default: 'norm',
    },
    pageName: {
      type: String,
      default: ''
    },
    isHistory: {
      type: Boolean,
      default () {
        return false
      }
    }
  },

  data () {
    return {
      isMarker: true,

      // the visible fields
      fields: {},

      historyData:[], //字段值修改历史记录

      allFields: {},

      actions: {},

      // validators involved multiple fields,
      formValidators: [],

      mainTable: null,

      srvCols: null,
      isFromLoaded: {
        loaded: false,
        text: "加载中..."
      },

      draftDataKey: {
        colName: 'id',
        value: null
      },
      formLoaded: false,
      visible: true,
      pagePrompt: {
        "title": "",
        "type": "success",
        "description": "<div style='color:red'></div>"
      },
      fieldHisotryPopup: false,
      draftConfig: null,
      srv_more_config: {},
      fieldWithHistory: null,
      isHistoryUse: false,
      colValChangeRequestCols:[],
      moreConfig:null,
      initValToCols:[]  //请求赋值col
    }
  },


  computed: {
    loaderService: function () {
      if (this.loaderServiceProp) {
        return this.loaderServiceProp;
      } else if (this.mainTable) {
        let loaderService = this.mainTable.replace('bx', 'srv') + "_select";
        return loaderService
      } else {
        return null;
      }
    },

    sortedFields: function () {
      // return this.sortFields(this.fields);
      let allFields = this.sortFields(this.allFields)
      return allFields.filter(item=>item.info.srvCol.in_cond==1)

    },

    sortedAllFields: function () {
      return this.sortFields(this.allFields);
    },
    sectionsSwitch:function(){
       let sec = {
        
       }
       for(let item in this.sections){
          console.log(item)
       }
      return sec
    },
    sections: function () {
      let sections = {};
      let fields = null;
      let section = null;
      for (let key in this.sortedAllFields) {
        let field = this.sortedAllFields[ key ];
        if (field.info && field.info.sec && field.info.sec !== section) {
          // close last section,
          if (fields) {
            sections[ section || "$" ] = fields;
          }

          // start a new one
          section = field.info.sec;
          fields = [];
        }

        // add to curr section if field.vif = true
        fields = fields || [];
        field.vif && fields.push(field);
      }
      if (fields) {
        sections[ section || "$" ] = fields;
      }

      // hide section whose fields are all invisible
      let hideSections = new Set();
      for (let key in sections) {
        let sectionFields = sections[ key ];
        let visibleFields = sectionFields.filter(field => {
          return (field && field.evalVisible());
        })

        if (visibleFields.length == 0) {
          hideSections.add(key)
        }
      }

      hideSections.forEach(key => delete sections[ key ])

      // 把 field 组织成: majorField 和 contentFields， 服务一个form-item 包含多个fields
      let sectionsOfFormItems = {};
      for (let key in sections) {
        let fieldsInSection = sections[ key ];
        let isGroupedField = field => field.info.srvCol.group_field;
        let groupedFields = fieldsInSection.filter(isGroupedField)
        _.remove(fieldsInSection, isGroupedField);

        let formItems = fieldsInSection.map(majorField => {
          let contentFields = [ majorField ].concat(
            groupedFields.filter(groupedField => groupedField.info.srvCol.group_field === majorField.info.name)
          );
          return {
            field: majorField,
            contentFields: contentFields,
          }
        })
        sectionsOfFormItems[ key ] = formItems;
      }
      // console.log(sectionsOfFormItems)
      return sectionsOfFormItems;
    },
    isHistoryRun: function () {
      if (this.isHistory) {
        return this.isHistory
      } else {
        return this.isHistoryUse
      }
    },
    formModel: function () {
      let model = {};

      for (let key in this.fields) {
        model[ key ] = this.fields[ key ].model;
      }

      return model;
    },
    "colValChangeRequestColsRun":function(){
      let colValRequest = this.srv_more_config.hasOwnProperty('colValRequest') ? this.srv_more_config.colValRequest : null
        let reqs = this.bxDeepClone(colValRequest)
       
        
        let cols = this.colValChangeRequestCols
        let formModel = this.formModel
        for(let r of reqs){
          let cond = r.condition
          for(let c of cond){
            for(let col of cols){
              if(col == c["colName"]){
                c.value = formModel[col]
              }
            }
          }
        }
        
        return reqs
    }


  },


  methods: {
    initColValRequest(){
      let self = this
      let conditionCol  = self.colValChangeRequestCols
      
      let moreConfig = self.srv_more_config
      
      let initValToCols = self.initValToCols
      if(moreConfig && moreConfig.hasOwnProperty("colValRequest") && moreConfig.colValRequest){
        moreConfig = moreConfig.colValRequest
        // self.initValToCols = moreConfig[0].colNames
        for(let key of moreConfig){
          for(let ckey of key.condition){
            if(conditionCol.indexOf(ckey.colName) == -1){
              conditionCol.push(ckey.colName)
            }
          }
          for(let c of key.colNames){
            if(initValToCols.indexOf(c) == -1){
              initValToCols.push(c)
            }
          }
          
        }
        // this.colValRequest(moreConfig.colValRequest)
      }
    },
    getColValRequests(){
      let self = this
      let moreConfig = self.srv_more_config? self.srv_more_config.colValRequest : self.srv_more_config
      let reqs = this.bxDeepClone(moreConfig[0])
      let cols = this.colValChangeRequestCols
      let fieldModel = this.formModel
      let initReqs = []
      let fields = this.allFields
      let valids = []
        for(let cond of reqs.condition){
          for(let f in fieldModel){
            if(cond.colName == f){
              cond.value = this.fields[ f ].getSrvVal()
            }
          }
        }
      // console.log("valids === ;",cols,valids)
        console.log("valids === 2;",cols.length,valids.length)
        delete reqs['srvApp']
        let url = this.getServiceUrl('select',reqs.serviceName,reqs.srvApp ? reqs.srvApp : null )
        this.$http.post(url, reqs).then((res) =>{
          console.log(res)
          // let datas = res.data[0]
          if(res){
            this.setColValRequestsVal(res) 
          }else{
            console.log('colValRequest 发生异常',res)
          }
          
          console.log("getColValRequests",reqs,res)
        })
      
      
    },
    setColValRequestsVal(e){
      let self = this
      let res = e.data.data[0]
      let initValToCols = self.initValToCols
      // let 
      let moreConfig = self.srv_more_config.colValRequest
      console.log("setColValRequestsVal",res,moreConfig)
      let fields = this.fields

      for(let k of moreConfig){
        for(let r in res){
          for(let f in fields){
            if(r == f){
              fields[r].setSrvVal(res[r])
            }
          }

        }
      }
      
    },
    onFieldHistoryPopup (field) {
      this.isXhtml = field.info.editor == 'ueditor'
      this.fieldHisotryPopup = true;
      this.fieldWithHistory = field;
    },
    getFormDatas () {
      return this.formModel
    },
    getParentFormModel () {
      return this.parentAddMainFormDatas
    },
    evalVisible () {
      return this.evalVersatileFlagVar(this.visible)
    },

    formatSection: function (section) {
      return section && _.isString(section) && section.startsWith('$') ? "" : section;
    },

    srvValFormModel: function () {
      let model = {};

      for (let key in this.fields) {
        model[ key ] = this.fields[ key ].getSrvVal() !== undefined && this.fields[ key ].getSrvVal() !== null ? this.fields[ key ].getSrvVal() : null;

      }

      if (this.srvvalFormModelDecorator) {
        let decorator = this.srvvalFormModelDecorator;
        decorator(model);
      }
      this.$emit("form-model-changed", model)
      return model;
    },


    isLoaded: function () {
      return this.formLoaded;
    },
    onIsLoaded: function (e) {
      // 控制页面加载中
      let self = this

      if (e === 'get') {
        return self.isFromLoaded
      } else {
        self.isFromLoaded = e || self.isFromLoaded
        return self.isFromLoaded
      }
    },
    resDataKey (e) {
      self.draftDataKey = e
    },
    /**
     * 3 sources of conditions, order from priority high to low
     * query string, props.defaultConditions, pk/pkcol,
     * @returns {{colName: (default.props.pkCol|{type}|string), ruleType: string, valueFunc: (function(*): (default.props.pk|{type}|*))}}
     */
    buildConditions: function () {
      let operateParams = this.getOperateParams();
      if (operateParams && this.parentPageType !== 'detaillist') {
        let params = JSON.parse(operateParams);
        if (params.condition && params.condition.length > 0) {
          // 修复bug:对于详情子表的数据，删除和修改服务，有时候会出现条件参数不是id的条件去调用服务 
          let conditions = params.condition;
          let form = this;
          // let onlyCondition = {
          //   colName: this.pkCol || 'id',
          //   ruleType: 'eq',
          //   required: true,
          //   valueFunc: _ => {
          //     return form.pk || form.$route.params.id;
          //   }
          // }
          // if( form.pk || form.$route.params.id){
          //   conditions.push(onlyCondition)
          // }
          return this.literalConditions2Conditions(conditions);
        }
      }

      if (this.defaultConditions && this.defaultConditions.length > 0) {
        return this.literalConditions2Conditions(this.defaultConditions);
      } else if (this.pk) {
        let form = this;
        let onlyCondition = {
          colName: this.pkCol || 'id',
          ruleType: 'eq',
          required: true,
          valueFunc: _ => {
            return form.pk || form.$route.params.id;
          }
        }

        return [ onlyCondition ];
      } else {
        return null;
      }
    },

    literalConditions2Conditions (literalConditions) {
      const conditions = literalConditions.map(a => Object.assign({}, a));
      for (let i in conditions) {
        conditions[ i ].valueExpr = `'${conditions[ i ].value}'`;
      }
      return conditions;
    },

    /**
     * default values from 2 sources: querystr, props.defaultValues
     * use url params to change metadata
     */
    setFieldsDefaultValue: function () {
      let self = this
      if (this.isTopComp() && this.getOperateParams()) {
        // if (this.getOperateParams()) {
        let params = JSON.parse(this.getOperateParams());
        if (params.data && params.data.length > 0) {
          let row = params.data[ 0 ];
          for (let key in row) {
            let field = this.fields[ key ];
            if (field) {
              field.setSrvVal(row[ key ]);
            }
          }
        }
      } else if (this.defaultValues) {
        let row = this.defaultValues;
        for (let key in row) {
          let field = this.fields[ key ];
          if (self.name === 'list-duplicate') {
            if (field) {
              field.setSrvVal(row[ key ]);
            }
          } else {
            if (field && !field.info.redundant) {
              field.setSrvVal(row[ key ]);
            } else if (field) {
              field.setSrvVal(row[ key ]);
            }
          }

        }
      }
    },

    sortFields: function (fields) {
      let fieldList = [];
      for (let key in fields) {
        fieldList.push(fields[ key ]);
      }
      fieldList.sort((a, b) => a.info.seq - b.info.seq);
      return fieldList;
    },


    /**
     * 从后端获取service cols，转换为fields;
     * filter 为字段过滤器， 类型为(srvCol) => boolean
     */
    createFields: function (filter, srvCols, app) {
      let srvColsProvided = !!srvCols;
      let self = this
      let useType = this.overrideformType == undefined ? this.formType : this.overrideformType;
      let srvColsP = srvCols ? Promise.resolve({ body: { data: { srv_cols: srvCols } } }) :
        this.loadColsV2(this.service_name, useType, app);
      return srvColsP.then((response) => {
        let data = response.body.data;
        this.mainTable = data.main_table;
        /**
         * pagePrompt 页面配置信息处理
         */
        // console.log(response)

        if (data.more_config !== null && data.more_config !== undefined && data.more_config !== "") {
          self[ 'srv_more_config' ] = JSON.parse(data.more_config)
          let colValChangeRequestColsDatas = self.srv_more_config.hasOwnProperty("colValRequest") ? self.srv_more_config.colValRequest[0].condition : []
          self.colValChangeRequestCols = colValChangeRequestColsDatas.map((item)=>{
             return item.colName
          })
          self.initValToCols =  self[ 'srv_more_config' ].hasOwnProperty('colValRequest') ? self[ 'srv_more_config' ].colValRequest[0].colNames : []
          self.isHistoryUse = data.his_version
          self.pagePrompt = self.srv_more_config.pagePrompt !== undefined ? self.srv_more_config.pagePrompt : null;
          self.draftConfig = self.srv_more_config.isDraft !== undefined ? Object.assign(self.srv_more_config.isDraft, { isDraft: true }) : { isDraft: false };
        } else {
          self.pagePrompt = false
          self.draftConfig = null
        }
        this.$emit('srv-config-loaded', self[ 'srv_more_config' ])

        let listData = data.srv_cols;
        this.srvCols = listData;
        for (var i = 0; i < listData.length; i++) {
          let srvCol = listData[ i ];
          let fi = new FieldInfo(srvCol, this.formType);
          let f = new Field(fi, this);
          f.vif = !(filter && !filter(srvCol))
          // hack
          if (fi.name == "id") {
            fi.visible = false;
          }
          if (fi.editor == 'multiselect') {
            f.model = [];
          }
          Vue.set(this.allFields, fi.name, f);
          (f.vif) && Vue.set(this.fields, fi.name, f);
        }


        if (data.validators) {
          for (let i in data.validators) {
            this.formValidators.push({
              name: `validator-${i}`,
              js: data.validators[ i ].in_table_validate,
            })
          }
        }

        if (this.buildDependentFields) {
          this.buildDependentFields(this.fields);
        }
        return response.body;
      });
    },


    createActions: function (formButtons) {

      let form = this
      // formButtons = formButtons.filter(item => this.pageIsDraft == 'norm' && item.button_type !== "save_draft" && item.button_type !== 'update_draft')
      for (let i in formButtons) {
        let button = formButtons[ i ]
        if (!button.permission) {
          continue;
        }

        let actionInfo = null;
        let buttonType = button.button_type;
        if (buttonType == "submit" && this.addSubmitAction) {
          actionInfo = this.addSubmitAction(button);
        } else if (buttonType == "reset" && this.addResetAction) {
          actionInfo = this.addResetAction(button);
        } else if (buttonType == "edit") {
          if (this.formType == "detail") {
            actionInfo = this.addNav2UpdateAction(button);
          } else if (this.formType === "update") {
            actionInfo = this.addSubmitAction(button);
          }
        } else if (buttonType == "refresh") {
          actionInfo = form.addNav2refreshAction(button)
        } else if (buttonType == "save_draft") {
          actionInfo = form.saveDraft(button);
        } else if (buttonType == "update_draft") {
          actionInfo = this.saveDraft(button);
          // 已废弃
        } else if (buttonType == "customize") {

          let operate_params = JSON.parse(button.operate_params)
          /**
           * 处理自定义按钮保存草稿
           */
          if (operate_params && operate_params.draft !== undefined && operate_params.draft) {
            actionInfo = this.saveDraft(button)
          } else {
            let customAction = new ActionInfo(button, "form")
            actionInfo = customAction;
            let actionName = "custom-" + button.id + '-' + button.button_name;
            Vue.set(this.actions, actionName, customAction);
            let form = this;
            customAction.name = actionName
            if (button.more_config) {
              const btn_more_config = JSON.parse(button.more_config)
              if (btn_more_config.isCheck) {
                button[ "isVisibleForm" ] = btn_more_config.isCheck
                customAction.precheckFunc = _ => {
                  return this.validateForm();
                }
              }
            }
            customAction.invokeFunc = _ => {
              form.customizeOperate(button, [ this.srvValFormModel() ]);
            }

          }

        }

        // common handle for  button attribute override
        if (button.action_validate) {

          actionInfo.customPrecheckFunc = () => {
            return this.evalActionValidator(button.action_validate, form.srvValFormModel())
          }
        }

        if (button.disp_exps) {
          actionInfo.visibleFunc = () => {
            return this.evalBxExpr(button.disp_exps, form.srvValFormModel())
          }
        }

        if (button.visible === "否" || (form.formType == 'update' && form.parentPageType === 'list' && form.pageIsDraft !== 'draft' && (buttonType == "update_draft" || buttonType == 'save_draft'))) {
          actionInfo.visibleFunc = () => {
            return false
          }
        }


        actionInfo.seq = button.seq;
        actionInfo.label = button.button_name;
        if (actionInfo.executor) {
          actionInfo.executor.service = button.service_name;
        }
      }
    },

    /**
     * 把表单字段绑定到executor.values
     */
    bindExecutorValues: function (executor) {
      // bind executor and field
      executor.service = this.service_name;

      let form = this;
      for (let i in this.fields) {
        let valueItem = {};
        let field = this.fields[ i ]
        valueItem.colName = field.info.name
        valueItem.valueFunc = _ => {
          return form.fields[ field.info.name ].getSrvVal();
        };

        // auto_gen field is not addable or updatable
        if (field.info && field.info.srvCol && field.info.srvCol.auto_generate) {
          valueItem.enableFunc = _ => {
            return false
          };
        }

        executor.values.push(valueItem)
      }
    },


    onFieldValueChanged: function (fieldName) {
      // 子表change 事件监听，回收
      console.log('onFieldValueChanged')
      let self = this
      // console.log('onFieldValueChanged fieldName',this.fields[fieldName].info.label,this.fields[fieldName],this.fields[fieldName].model)
      if (this.formLoaded) {
        // 处理下游游字段变化 field a -> b,  when a is null, and b is changed, set a
        
        let field = this.fields[ fieldName ];
        if (field.info.upstream) {
          let upstreamField = this.fields[ field.info.upstream.field ];
          if (!upstreamField.model) {
            let refCol = field.info.upstream.refCol;
            if (field.model && field.model[ refCol ]) {
              upstreamField.setSrvVal(field.model[ refCol ]);
            }
          }
        }
        /**
         * 处理起止日期值分离同步
         */
        let DateRangeEndCol = field.info._DateRangeEndColName
        if (field.info.editor === "DateRange" && DateRangeEndCol !== null) {
          if (field.hasOwnProperty('_DateRangeModel') && field._DateRangeModel !== null) {
            field.model = field._DateRangeModel[ 0 ]
            if (DateRangeEndCol !== undefined) {
              let endCol = this.fields[ DateRangeEndCol ]

              endCol.model = field._DateRangeModel[ 1 ]// endCol.model = field._DateRangeModel[1]
            }
          }
        }
        this.handleValidation(fieldName);
        
        this.handleFieldFkRedundant && this.handleFieldFkRedundant(field, this.fields);
        for(let f of self.colValChangeRequestCols){
          if(f === fieldName){
            self.getColValRequests()
          }
        }
      }
    },

    /**
     * 把 loader的返回结果填充到fields
     */
    onLoaderComplete: function ({ data, resp }) {
      let listmap = data;
      if (!listmap || !listmap[ 0 ]) {

        this.$emit("form-load-nodata")
        this.$emit("detail-form-load-nodata")
        return;
      }

      let map = listmap[ 0 ]
      this.encryptedCols = map[ '_encrypt_cols' ] || [] // 数据已加密的字段
      for (let key in map) {

        if (this.fields[ key ]) {
          this.fields[ key ].setSrvVal(map[ key ])
        }

      }
      for (let k in this.fields) {
        if (this.fields[ k ].info.editor === 'DateRange') {
          if (this.fields[ k ].info._DateRangeEndColName !== null) {
            this.fields[ k ]._DateRangeModel = []
            this.fields[ k ]._DateRangeModel.push(this.fields[ k ].model)
            this.fields[ k ]._DateRangeModel.push(this.fields[ this.fields[ k ].info._DateRangeEndColName ].model)
          }
        }
        for (let c in this.encryptedCols) {
          // 加密字段设置为只读 
          if (this.fields[ k ].info.name === this.encryptedCols[ c ]) {
            this.fields[ k ].info.readonly = true
          }
        }
        if ((this.fields[ k ].info.editor === 'upload-file' || this.fields[ k ].info.editor === 'upload-image') && (this.pageName === 'list-duplicatedeep' || this.pageName == 'list-duplicate')) {
          this.fields[ k ].setSrvVal('')
        }
      }
      // 把历史数据放到 field
      if (resp.data.his_data && resp.data.his_data.length > 0) {
        let historyOfRow = resp.data.his_data[ 0 ];
        if (Array.isArray(historyOfRow) && historyOfRow.length > 0) {
          this.historyData = historyOfRow
            .filter(
              (item, index) =>
                index === 0 ||
                (Array.isArray(item._diff_cols) &&
                  item._diff_cols.length > 0)
            )
            .reduce((res, cur) => {
              const index = res.findIndex(
                (item) => item.modify_time === cur.modify_time
              );
              if (index > -1) {
                res[index].list.push(cur);
              } else {
                res.push({
                  ...cur,
                  _create_user: cur.create_user_disp || cur.create_user,
                  _date_time: formatDate(cur.modify_time, "datetime"),
                  modify_time: cur.modify_time,
                  list: [{ ...cur }],
                });
              }
              return res;
            }, [])
        }
        

        Object.values(this.fields).forEach(field => {
          let hisOfField = historyOfRow
            .filter(ver => {
              if (field.info.name === 'biz_path') {
              }
              let firstRow = historyOfRow.indexOf(ver) == 0;
              let changed = _.includes(ver._diff_cols, field.info.name);
              return firstRow || changed
            })
            .map(ver => {
              let value = ver[ field.info.name ];
              if (field.info.isTemporal() && value !== '******') {
                value = formatDate(value, field.info.type.toLowerCase(), field.info.format);
              }
              
              return {
                value: value,
                remark: ver._data_desc
              }
            });
          
          this.$set(field, "historyData", hisOfField);
        })
        
      }

      if (this.encryptedCols && _.isArray(this.encryptedCols)) {
        // 老版加密数据处理逻辑，已废弃
        // 如果当前数据为敏感数据，因为值为******, 则没有看的权限，进而不可编辑
        if (map._sensitive_data === true) {
          this.encryptedCols.forEach(col => this.fields[ col ] && this.fields[ col ].setNoPerm4Sensi(true))
        }

        // 如果_sensitive_data_update === false，则当前行敏感字段不可编辑
        if (map._sensitive_data_update === false) {
          this.encryptedCols.forEach(col => this.fields[ col ] && (this.fields[ col ].info.editable = false))
        }
      }

      let loader = this.$refs.loader;
      if (loader && loader.loadCount == 1) {
        this.setFieldsDefaultValue();
      }
    },

    watchFormModel: function () {
      let form = this;
      this.$watch(function () {
        return form.srvValFormModel();
      },
        function (newVal, oldVal) {
          if (newVal !== oldVal) {
            form.handleRedundantOnFormModelChange(newVal, oldVal, this.fields, _ => form.srvValFormModel());
            if (form.formModelChangeHandler) {
              form.formModelChangeHandler(form);
            }
            form.$emit("form-model-changed", this)
          }

        }, {
        deep: true
      })
    },
    getDateRangExpr: function (infoObj, e) {
      /**
          * 处理子表默认值 引用主表from
          */
      let m = {
        min: null,
        max: null
      }
      if (infoObj.hasOwnProperty('moreConfig') && infoObj.editor === "DateRange" && infoObj.moreConfig.hasOwnProperty('DateRangeConfig')) {
        let mainData = e
        let cfg = infoObj.moreConfig.DateRangeConfig
        if (cfg.hasOwnProperty('minDate')) {
          if (cfg.minDate !== '' && cfg.minDate !== null && cfg.minDate !== undefined) {
            if (cfg.minDate.indexOf('{') !== -1 && cfg.minDate.indexOf('}') !== -1) {
              let minexp = cfg.minDate.match(/{(\S*)}/)[ 1 ]
              m.min = eval(minexp)
              if (m.min === null || m.min === undefined) {
                m.min = '1990-01-01'
              }
            } else {
              m.min = cfg.minDate
            }
          } else {
            m.min = '1990-01-01'
          }
        } else {
          m.min = '1990-01-01'

        }
        if (cfg.hasOwnProperty('maxDate')) {
          if (cfg.maxDate !== '' && cfg.maxDate !== null && cfg.maxDate !== undefined) {
            if (cfg.maxDate.indexOf('{') !== -1 && cfg.maxDate.indexOf('}') !== -1) {
              let maxexp = cfg.maxDate.match(/{(\S*)}/)[ 1 ]
              m.max = eval(maxexp)
              if (m.max === null || m.max === undefined) {
                m.max = '2050-12-30'
              }
            } else {
              m.max = cfg.maxDate
            }
          } else {
            m.max = '2050-12-30'
          }
        } else {
          m.max = '2050-12-30'
        }

      }
      return m
    }

  },
};
