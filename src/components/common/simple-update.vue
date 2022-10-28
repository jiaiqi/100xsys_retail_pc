/* */
<template>
  <div v-loading="isFromLoaded.loaded"
    :element-loading-text="isFromLoaded.text">
    <el-form v-if="draftConfig && draftConfig.isDraft" >
        <el-form-item label="自动保存草稿" style="margin-bottom: 0px;">
          <el-switch v-model="draftConfig.auto_save"></el-switch> 
        </el-form-item>
        </el-form>
    <template>
        <el-alert
          v-if="pagePrompt"
          :closable="false"
          :type="pagePrompt.type"
          >
           <slot><div v-html="pagePrompt.description">{{pagePrompt.description}}</div></slot>
        </el-alert>
      </template>
    <el-row v-show="evalVisible()">
      <slot name="form-child-prepend"></slot>
      <el-form :model="formModel" ref="elform"
               :inline="false" label-position="right" label-width="10rem"
               v-if="formLoaded"
      >
        <el-row v-for="(formItems, section) in sections" :key="section">
          <div class="el-col el-col-24 el-col-xl-24" v-show="formatSection(section)">
            <div class="el-form-item" v-if="!!section">
              <span class="section-title">{{formatSection(section)}}</span>
            </div>
          </div>
          <slot :name="section + '-begin'"></slot>

          <div v-for="formItem in formItems">
            <field-editor :field="formItem.field"
                          :content-fields="formItem.contentFields"
                          :key="formItem.field.info.name"
                          :form-model="formModel"
                          :defaultValues="defaultValues"
                          :mainformDatas="parentAddMainFormDatas"
                          :form-has-invalid-error="hasInvalidField()"
                          @field-value-changed="onFieldValueChanged($event)"
                          @field-history-popup="onFieldHistoryPopup"
            >
            <div slot="field-child-prepend" class="padding-bottom">
              <slot :name="formItem.field.info.name + '-child-prepend'"></slot>
            </div>
            <div slot="field-child-append" class="padding-bottom">
              <slot :name="formItem.field.info.name + '-child-append'"></slot>
            </div>
            </field-editor>
            <slot :name="formItem.field.info.name + '-append'"></slot>
          </div>


        </el-row>
      <slot :mainFormDatas="mainFormDatas" name="field-form-append"></slot>

      </el-form>


      <loader ref="loader" :service="loaderService"
              :pageIsDraft="pageIsDraft"
              @loader-complete="onLoaderComplete($event)">

      </loader>
    </el-row>
    <!-- <slot name="child-body" v-bind:mainForm="formModel"></slot> -->
    <el-row>
      <el-col :span="24"
              style="text-align: center;padding:6px;">
        <action v-for="item in actions" :info="item" :key="item.name"
                :ref="item.name"
                :isDraft="pageIsDraft"
                v-show="(item.visibleFunc)()"
                :draftDataKey="draftDataKey"
                @is-data-key="resDataKey($event)"
                @form-is-loaded="onIsLoaded($event)"
                @action-complete="$emit('action-complete', $event);"
                @executor-complete="$emit('executor-complete', $event)"
        >
        </action>

      </el-col>
    </el-row>

    <el-dialog append-to-body
               :visible="!!fieldHisotryPopup"
               title="历史版本" width="90%" :close-on-click-modal="1==2"
               @close="fieldHisotryPopup = false"
    >
      <el-table :data="fieldWithHistory && fieldWithHistory.historyData"
                stripe border style="width: 100%">
        <el-table-column
                prop="value"
                label="值">
        </el-table-column>
        <el-table-column
                prop="remark"
                label="说明">
        </el-table-column>
      </el-table>
    </el-dialog>


  </div>
</template>

<script>
  import FieldEditor from './field-editor.vue'
  import FormMixin from '../mixin/form-mixin'
  import FieldRedundantMixin from '../mixin/field-redundant-mixin'
  import FormValidateMixin from "../mixin/form-validate-mixin";
  import Loader from './loader.vue'
  import Action from './action.vue'
  import {ActionInfo} from '../model/ActionInfo'
  import {ExecutorInfo} from '../model/ExecutorInfo'
  import Vue from 'vue'
  import CustButtonMinx from "../mixin/cust-button-minx";
  import {FieldInfo} from "../model/FieldInfo";
  import {Field} from "../model/Field";


  export default {
    name: "simple-update",
    components: {
      FieldEditor,
      action: Action,
      loader: Loader
    },
    mixins: [FormMixin, CustButtonMinx, FieldRedundantMixin, FormValidateMixin],
    props: {
      
    nav2LocationStr: {
      type: String,
      default: "list"
    },
      childrenLists:{
        type:Array
      },
      formType: {
        type: String,
        default: "update"
      },

      pkCol: {
        type: String
      },

      pk: {
        type: [String, Number]
      },

      initLoad: {
        type: Boolean,
        default: true,
      },
      parentPageType:{
        type: String,
        default: '',
      },
      haveDraft:{
        type:Boolean,
        default:false
      },
      appNo:{
        type:String,
        default(){
           localStorage.getItem("activeApp")
        }
      },
    },
    computed: {

      srvValFormModel4Update: function () {
        let model = {};

        for (let key in this.fields) {
          let field = this.fields[key];
          if (field.info.srvCol.in_update != 0 || field.info.name == "id") {
            model[key] = field.getSrvVal();
          }
        }

        return model;
      }
    },

    data() {
      return {
        service_name: this.service || this.$route.params.service_name,
        /**
         * 敏感字段名称数组
         */
        encryptedCols: null,
      }
    },
    methods: {

      buildRunQuries() {
        let formModel = _.cloneDeep(this.srvValFormModel());
        delete formModel._children;

        let delta = {};
        Object.entries(formModel).forEach(([key, value]) => {
          // key is either an array index or object key
          let valueEnableFunc = this.createExecutorValueEnableFunc(key);
          let bound = _.bind(valueEnableFunc, this);
          bound(value) && (delta[key] = value);
        });

        let query = {
          serviceName: this.service_name,
          data: [delta],
        };

        return [query];
      },

      addSubmitAction: function (e) {
        let submitAction = new ActionInfo(e,'form')
        submitAction.defaultValues=this.defaultValues
        Vue.set(this.actions, "submit", submitAction);

        submitAction.name = 'submit'
        submitAction.label = '提交'
        submitAction.confirm = '是否确认提交?';
        submitAction.precheckFunc = _ => {
          return this.validateForm();
        }

        if (this.navAfterSubmit) {
          submitAction.nav2Location = {
             name: this.nav2LocationStr,
          params: { service_name: this.loaderService }
          };
        }

        if (this.submit2Db) {
          let executor = new ExecutorInfo()
          submitAction.executor = executor
          executor.service = this.service_name
          executor.ignoreNullValue = false
          submitAction.draftConfig = this.draftConfig
          this.bindExecutorValues(executor)
          for (let i in executor.values) {
            let valueItem = executor.values[i];
            valueItem.enableFunc = this.createExecutorValueEnableFunc(valueItem.colName);
          }
          executor.conditions = this.buildConditions()
        } else {
          submitAction.invokeFunc = _ => {
            let model = this.srvValFormModel()
            if(model.id === null && this.defaultValues.hasOwnProperty('_guid')){
              model['_guid'] = this.defaultValues["_guid"]
            }
            
            this.$emit("submitted2mem", model, this.fields);
          }
        }

        return submitAction;

      },

      createExecutorValueEnableFunc: function (colName) {
        return (value) => {
          try {
            let rawRow = this.$refs.loader.lastValidResp[0];
            let noPerm4Sensi = this.allFields[colName] && this.allFields[colName].noPerm4Sensi;
            let isDiff = (rawRow[colName] != value.value);
            return isDiff && !noPerm4Sensi;
          } catch (e) {
            return true;
          }
        }
      },

      confLoader: function () {
        let loader = this.$refs.loader
        loader.enableFunc = _ => {
          return loader.conditions && loader.conditions.length > 0
        };
        loader.colNames = Object.values(this.fields).map(item => item.info.name);
        loader.conditions = this.buildConditions();
      },
      /**
       * 保存草稿操作
       */
      saveDraft: function(e){
        let self = this
        let submitAction = new ActionInfo(e,'form')
        Vue.set(this.actions, "save_draft", submitAction);

        submitAction.name = "save_draft"  // e.button_type
        submitAction.label = '保存草稿1'
        submitAction.confirm = '是否确认保存?';
        // submitAction.precheckFunc = _ => {
        //   return this.validateForm();
        // }
        submitAction.operate_type = "草稿"
        submitAction.visible = true
        if (this.navAfterSubmit && this.parentPageType.indexOf('list') == -1) {
          submitAction.nav2Location = {
            name: 'list',
            params: {service_name: this.loaderService}
          };
        }

        if (this.submit2Db) {
          let executor = new ExecutorInfo()
          submitAction.executor = executor
          executor.service = this.service_name
          submitAction.draftConfig = this.draftConfig
          executor["draft"] = true
          this.bindExecutorValues(executor)
          let formModelDatas = this.srvValFormModel()

          executor.ignoreNullValue = false
          for (let i in executor.values) {
            let valueItem = executor.values[i];
            valueItem.enableFunc = this.createExecutorValueEnableFunc(valueItem.colName);
          }
          executor.conditions = this.buildConditions()
          // submitAction.invokeFunc = _ => {
          //   this.$emit("submitted2mem", formModelDatas, this.fields);
          // }
          // submitAction.invokeFunc = _ => {
          //     this.customizeOperate(submitAction, [this.srvValFormModel()]);
          //   }
        } else {
          
          submitAction.invokeFunc = _ => {
            let formModelDatas = this.srvValFormModel()
            this.$emit("submitted2mem", formModelDatas, this.fields);
          }
        }
        
        return submitAction;
      },
      addResetAction: function (e) {
        let reset = new ActionInfo(e,'form')
        Vue.set(this.actions, "reset", reset);

        reset.name = 'reset'
        reset.label = '重置'
        reset.invokeFunc = _ => this.resetForm();

        return reset;
      },

      resetForm: function () {
        this.$refs.loader.run()
      },


    },

    created: function () {
    },

    mounted: function () {
     
      
      this.createFields(srvCol => srvCol.in_update != 0 || srvCol.in_detail != 0,null,this.appNo)
        .then((response) => {
          for (let fieldName in this.fields) {
            let field = this.fields[fieldName];
            let infoObj = new Object()
            infoObj = field.info
            if (field.info.srvCol.in_update != 1) {
              field.info.visible = false;
            }else{
            /**
             * 处理子表默认值 引用主表from
             */
              if(infoObj.hasOwnProperty('moreConfig') && infoObj.editor === "DateRange" && infoObj.moreConfig !== null &&  infoObj.moreConfig.hasOwnProperty('DateRangeConfig')){
                field.info._DateMaxMin = this.getDateRangExpr(infoObj,this.parentAddMainFormDatas)
                if(infoObj.hasOwnProperty('_DateRangeEndColName') && infoObj._DateRangeEndColName !== ''){
                  field['_DateRangeModel'] = []
                  // field['_DateRangeModel'][0] = field.model
                  // field['_DateRangeModel'][1] = this.fields[infoObj._DateRangeEndColName].model
                }
              }
            }
          }

          if (response && response.data) {
            if (response.data.encryptedCols) {
              this.encryptedCols = response.data.encryptedCols;
              // 老版本 字段加密代码, /*已废弃*/
            }

            if (response.data.formButton) {
              let formButtons = response.data.formButton;
              /**
               * 根据配置是否创建草稿按钮
               */
              if(this.draftConfig !== null){
                  this.createActions(formButtons);
              }else{
                formButtons = formButtons.filter((item) => {
                  if(item.hasOwnProperty("more_config")){
                    let btnCfg = item.more_config !== null ? JSON.parse(item.more_config) : false
                    if(btnCfg && btnCfg.hasOwnProperty('is_draft') && btnCfg.is_draft){

                    }else{
                      return item
                    }
                  }else{
                    return item
                  }
                  
                })
                this.createActions(formButtons);
              }
            }
          }

          this.confLoader()

        })
        .then(_ => {
          this.emitEvent("metadata-loaded", this)

          if (this.initLoad) {
            let loader = this.$refs.loader;
            return loader.run()
              .then(_ => {
                loader.watchCondition();
                this.watchFormModel();
              });
          } else {
            return Promise.resolve(true);
          }
        })
        .then(() => {
          this.setFieldsDefaultValue();

          if (this.overrideData) {
            for (let key in this.overrideData) {
              
              if (this.fields[key]) {
                let field = this.fields[key]
                let infoObj = field.info
                if(infoObj.editor === 'DateRange'){
                  if(infoObj.hasOwnProperty('_DateRangeEndColName') && infoObj._DateRangeEndColName !== ''  && infoObj._DateRangeEndColName !== null){
                    field['_DateRangeModel'] = []
                    field['_DateRangeModel'][0] = this.overrideData[key]
                    field['_DateRangeModel'][1] = this.overrideData[infoObj._DateRangeEndColName]
                  }
                }
                
                this.fields[key].setSrvVal(this.overrideData[key]);
              } else if ("_guid" === key) {
                // add field _guid
                let fakeSrvCol = {
                  columns: key,
                  seq: -1000,
                };
                let fi = new FieldInfo(fakeSrvCol);
                let dummy = new Field(fi, this);
                fi.visible = "false"
                dummy.model = this.overrideData[key];
                Vue.set(this.fields, key, dummy);
              }
            }
          }

          this.emitEvent("data-loaded", this)
          this.formLoaded = true;
        })
        .then(() => {
          this.$emit("form-loaded", this);
        });
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  div.el-form-item__content {
    line-height: initial;
    line-height: unset;
  }


</style>
