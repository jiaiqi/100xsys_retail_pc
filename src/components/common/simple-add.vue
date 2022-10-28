<template>
  <div v-loading="isFromLoaded.loaded" :element-loading-text="isFromLoaded.text">
    <el-form v-if="draftConfig && draftConfig.isDraft">
      <el-form-item label="自动保存草稿" style="margin-bottom: 0px;">
        <el-switch v-model="draftConfig.auto_save"></el-switch>
      </el-form-item>
    </el-form>
    <template>
      <el-alert v-if="pagePrompt" :closable="false" :type="pagePrompt.type">
        <slot>
          <div v-html="pagePrompt.description">{{pagePrompt.description}}</div>
        </slot>
      </el-alert>
    </template>
    <el-row>
      <slot name="form-child-prepend"></slot>
      <el-form :model="formModel" ref="elform" :inline="false" label-position="right" label-width="10rem" v-if="formLoaded">

        <el-row v-for="(formItems, section) in sections" :key="section">

          <div class="el-col el-col-24 el-col-xl-24">
            <div class="el-form-item" v-if="formatSection(section) && !!section">
              <span class="section-title">{{formatSection(section)}}    
              <!-- <el-switch
              active-color="#000000"
              v-model="value1"
              active-text="显示"
              inactive-text="隐藏">
            </el-switch> -->
            </span>
              
            </div>

          </div>

          <slot :name="section + '-begin'"></slot>

          <div v-for="formItem in formItems">
            <!-- <field-editor :field="formItem.field" :content-fields="formItem.contentFields" :key="formItem.field.info.name" :defaultCondition='defaultCondition' :childForeignkey="childForeignkey" :mainformDatas='mainformDatas' :form-has-invalid-error="hasInvalidField()" @field-value-changed="onFieldValueChanged($event)" :defaultValues='defaultValues' v-if="formItem.field.info.visible" v-show="formItem.field.info.visible &&formItem.field.info.name!=referenced_column_name"> -->
            <field-editor :field="formItem.field" :content-fields="formItem.contentFields" :key="formItem.field.info.name" :defaultCondition='defaultCondition' :childForeignkey="childForeignkey" :mainformDatas='mainformDatas||parentAddMainFormDatas' :form-has-invalid-error="hasInvalidField()"  @on-custom-button="$emit('on-custom-button', $event)" @field-value-changed="onFieldValueChanged($event)" :defaultValues='defaultValues' v-show="formItem.field.info.visible && formItem.field.info.visible &&formItem.field.info.name!=referenced_column_name">

              <div slot="field-child-prepend" class="padding-bottom">
                <slot :name="formItem.field.info.name + '-child-prepend'"></slot>
              </div>
              <div slot="field-child-append" class="padding-bottom">
                <slot :name="formItem.field.info.name + '-child-append'"></slot>
              </div>

            </field-editor>
            <!-- <slot :name="formItem.field.info.name + '-append'"></slot> -->
          </div>

        </el-row>

      </el-form>
      <slot name="field-form-append"></slot>
    </el-row>
    <loader ref="loader" :service="loaderService" :pageIsDraft="pageIsDraft" @loader-complete="onLoaderComplete($event)">
    </loader>
    <!-- <slot name="child"></slot> -->
    <!-- <slot name="child"></slot> -->
    <el-row>
      <el-col :span="24" style="text-align: center;padding:6px;">
        <action v-for="item in actions" :info="item" :key="item.name" :ref="item.name" :isDraft="pageIsDraft" v-show="(item.visibleFunc)()" :draftDataKey="draftDataKey" @is-data-key="resDataKey($event)" @form-is-loaded="onIsLoaded($event)" @action-complete="$emit('action-complete', $event);" @executor-complete="$emit('executor-complete', $event)">
        </action>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import FieldEditor from "./field-editor.vue";
import FormMixin from "../mixin/form-mixin";
import FieldRedundantMixin from "../mixin/field-redundant-mixin";
import FormValidateMixin from "../mixin/form-validate-mixin";
import Action from "./action.vue";
import { ActionInfo } from "../model/ActionInfo";
import { ExecutorInfo } from "../model/ExecutorInfo";
import Vue from "vue";
import Loader from "./loader.vue";
import CustButtonMinx from "../mixin/cust-button-minx";

export default {
  name: "simple-add",
  components: {
    Loader,
    "field-editor": FieldEditor,
    Action
  },
  mixins: [FormMixin, CustButtonMinx, FieldRedundantMixin, FormValidateMixin],
  props: {
    defaultCondition: {
      type: Array
    },
    formType: {
      type: String,
      default: "add"
    },
    
    nav2LocationStr: {
      type: String,
      default: "list"
    },
    parentPageType: {
      type: String,
      default: ""
    },
    haveDraft: {
      type: Boolean,
      default: false
    },
    childForeignkey: {
      type: Object
    },
    mainformDatas: {
      type: Object
    },
    defaultValues: {
      type: Object
    },
    childrenLists: {
      type: Array
    }
  },
  data() {
    return {
      service_name: this.service || this.$route.params.service_name,
      referenced_column_name: null
    };
  },
  watch: {
    childForeignkey: {
      default: true,
      immediate: true,
      handler: function(val, olval) {
        if (val) {
          for (const key in val) {
            if (key == "referenced_column_name") {
              this.referenced_column_name = val[key];
            }
          }
        }
      }
    }
  },

  methods: {
    buildRunQuries() {
      let formModel = _.cloneDeep(this.srvValFormModel());
      delete formModel._children;

      let query = {
        serviceName: this.service_name,
        data: [formModel]
      };

      return [query];
    },
    addSubmitAction: function(e) {
      let submitAction = new ActionInfo(e, "form");
      Vue.set(this.actions, "submit", submitAction);

      submitAction.name = "submit";
      submitAction.label = "提交";
      submitAction.confirm = "是否确认提交?";
      submitAction.precheckFunc = _ => {
        return this.validateForm();
      };

      if (this.navAfterSubmit && this.parentPageType.indexOf("list") == -1) {
        submitAction.nav2Location = {
          name: this.nav2LocationStr,
          params: { service_name: this.loaderService }
        };
      }

      if (this.submit2Db) {
        let executor = new ExecutorInfo();
        submitAction.executor = executor;

        submitAction.draftConfig = this.draftConfig;
        executor.service = this.service_name;
        this.bindExecutorValues(executor);
      } else {
        submitAction.invokeFunc = _ => {
          this.$emit("submitted2mem", this.srvValFormModel(), this.fields);
        };
      }

      return submitAction;
    },

    addResetAction: function(e) {
      let resetAction = new ActionInfo(e, "form");
      Vue.set(this.actions, "reset", resetAction);

      resetAction.name = "reset";
      resetAction.label = "重置";
      resetAction.invokeFunc = _ => this.resetForm();

      return resetAction;
    },

    confLoader: function() {
      let loader = this.$refs.loader;
      loader.colNames = ["*"];
      loader.conditions = this.defaultConditions;
    },

    /**
     * 重置字段为初始值
     */
    resetForm: function() {
      for (let key in this.fields) {
        this.fields[key].reset2Init();
      }
    },
    /**
     * 保存草稿操作
     */
    saveDraft: function(e) {
      let submitAction = new ActionInfo(e, "form");
      Vue.set(this.actions, "save_draft", submitAction);

      submitAction.name = "save_draft"; // e.button_type
      submitAction.label = "保存草稿1";
      submitAction.confirm = "是否确认保存?";
      // submitAction.precheckFunc = _ => {
      //   return this.validateForm();
      // }
      submitAction.operate_type = "草稿";
      submitAction.visible = "true";
      if (this.navAfterSubmit) {
        submitAction.nav2Location = {
          name: "list",
          params: { service_name: this.loaderService }
        };
      }

      if (this.submit2Db) {
        let executor = new ExecutorInfo();
        submitAction.executor = executor;
        executor.service = this.service_name;
        submitAction.draftConfig = this.draftConfig;
        executor["draft"] = true;
        this.bindExecutorValues(executor);
        let formModelDatas = this.srvValFormModel();

        // submitAction.invokeFunc = _ => {
        //   this.$emit("submitted2mem", formModelDatas, this.fields);
        // }
        // submitAction.invokeFunc = _ => {
        //     this.customizeOperate(submitAction, [this.srvValFormModel()]);
        //   }
      } else {
        submitAction.invokeFunc = _ => {
          this.$emit("submitted2mem", this.srvValFormModel(), this.fields);
        };
      }

      return submitAction;
    }
  },

  mounted: function() {
    let self = this;
    this.createFields(srvCol => srvCol.in_add != 0)
      .then(response => {
        // make all field editable
        for (let fieldName in this.fields) {
          let field = this.fields[fieldName];
          let infoObj = new Object();
          infoObj = field.info;
          if (field.info.srvCol.in_add != 1) {
            field.info.visible = false;
          } else {
            /**
             * 处理子表默认值 引用主表from
             */

            if (
              infoObj.hasOwnProperty("moreConfig") &&
              infoObj.editor === "DateRange" &&
              infoObj.moreConfig !== null &&
              infoObj.moreConfig.hasOwnProperty("DateRangeConfig")
            ) {
              field.info._DateMaxMin = this.getDateRangExpr(
                infoObj,
                this.parentAddMainFormDatas
              );
            }
          }
        }

        if (response && response.data && response.data.formButton) {
          let formButtons = response.data.formButton;
          /**
           * 根据配置是否创建草稿按钮
           */
          if (this.draftConfig !== null) {
            this.createActions(formButtons);
          } else {
            formButtons = formButtons.filter(item => {
              if (item.hasOwnProperty("more_config")) {
                let btnCfg =
                  item.more_config && item.more_config !== null
                    ? JSON.parse(item.more_config)
                    : false;
                if (
                  btnCfg &&
                  btnCfg.hasOwnProperty("is_draft") &&
                  btnCfg.is_draft
                ) {
                } else {
                  return item;
                }
              } else {
                return item;
              }
            });
            this.createActions(formButtons);
          }
        }
      })
      .then(_ => {
        this.emitEvent("metadata-loaded", this);

        if (this.defaultConditions && this.defaultConditions.length > 0) {
          this.confLoader();
          return this.$refs.loader.run();
        } else {
          this.resetForm();
        }
      })
      .then(() => {
        this.watchFormModel();
        this.formLoaded = true;
      })
      .then(() => {
        this.setFieldsDefaultValue();
      })
      .then(() => {
        this.$emit("form-loaded", this);
      });
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.el-form-item__content {
  line-height: initial;
  line-height: unset;
}
</style>
