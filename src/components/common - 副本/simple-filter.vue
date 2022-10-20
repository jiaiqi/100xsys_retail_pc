/**
* props: name, service
* event: search-clicked
*/
<template>
  <el-row class="filter-view">
    <el-row>
      <el-form :inline="false" label-position="right" label-width="10rem"
               v-if="formLoaded"
      >
        <p v-if="supportGroup">过滤字段</p>
        <field-editor v-for="field in sortedFields"
                      :field="field"
                      :ignore-vif="true"
                      v-show="field.info.name !=='fflags' && field.info.srvCol.in_cond !== 2"
                      :content-fields="[field]"
                      :key="field.info.name">
        </field-editor>


      </el-form>
    </el-row>

    <el-row v-if="supportGroup">
      <el-form :inline="false" label-position="right" label-width="10rem"
               v-if="formLoaded"
      >
        <p>分组字段</p>
        <field-editor v-for="field in sortFields(groupFields) "
                      :field="field"
                      :content-fields="[field]"
                      :key="field.info.name">
        </field-editor>

      </el-form>
    </el-row>

    <el-row v-if="supportGroup">
      <el-form :inline="false" label-position="right" label-width="10rem"
               v-if="formLoaded"
      >
        <p>聚合字段</p>
        <field-editor v-for="field in sortFields(reduceFields) "
                      :field="field"
                      :content-fields="[field]"
                      :key="field.info.name">
        </field-editor>

      </el-form>
    </el-row>

    <el-row>
      <el-col :span="24" style="text-align: center;">
        <el-button 
        type="primary"
        round
        plain
        icon="el-icon-search"
        size="mini"
        @click="onSearchClicked()">
          搜索
        </el-button>
        <el-button 
        type="primary" 
        size="mini"
        plain
        icon="el-icon-refresh-right"
        @click="resetForm()"
        round>重置</el-button>
      </el-col>
    </el-row>
  </el-row>
</template>

<script>
  import {FieldInfo} from '../model/FieldInfo'
  import {Field} from '../model/Field'
  import FieldEditor from './field-editor.vue'
  import FormMixin from '../mixin/form-mixin'
  import FormValidateMixin from "../mixin/form-validate-mixin";
  import Executor from './executor.vue'
  import Vue from 'vue'

  export default {
    name: "simple-filter",
    components: {
      FieldEditor,
      executor: Executor
    },
    mixins: [FormMixin, FormValidateMixin],
    props: {

      formType: {
        type: String,
        default: "filter"
      },

      srv_cols: {
        type: Array
      },
      supportGroup: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        service_name: this.service || 'srvsys_menu_select',


        groupFields: {},
        reduceFields: {},

        fflagsField: null,
        gflagsField: null,
        rflagsField: null,

        groupName2Label: {
          "by": "按值汇总",
          "by_year": "按年汇总",
          "by_month_of_year": "按月汇总",
          "by_week": "按周汇总",
          "by_date": "按天汇总",
          "by_hour_of_date": "按小时汇总",
          "by_minute": "按分钟汇总",
          "max": "最大",
          "min": "最小",
          "sum": "总和",
          "avg": "平均",
          "distinct_count": "计数(去重去空)",
          "count": "计数(去空)",
        }
      }
    },

    computed: {},

    methods: {
      onSearchClicked: function () {
        let groups = this.supportGroup ? this.buildGroups4Query() : null;
        let headers = this.supportGroup ? this.buildResultHeader() : null;

        this.$emit('search-clicked', this.buildConditions(), groups, headers)
      },

      noramlizeFieldName: function (fieldName) {
        if (fieldName.startsWith("_") && fieldName.endsWith("_disp")) {
          let end = fieldName.indexOf("_disp");
          return fieldName.substring(1, end);
        } else {
          return fieldName;
        }
      },

      gotFlagsOptions: function (fields, complementFlagsField) {
        let options = [];
        let flagsFields = ["fflags", "rflags", "gflags"]

        for (let key in fields) {
          let normalizedKey = this.noramlizeFieldName(key);
          if (complementFlagsField
            && complementFlagsField.model
            && complementFlagsField.model.map(item => this.noramlizeFieldName(item)).filter(item => item == key).length > 0) {
            continue;
          }
          if (_.includes(flagsFields, key)) {
            continue;
          }


          let field = fields[key];
          options.push({
            value: key,
            label: field.info.label,
          });
        }

        return options;
      },

      resetForm: function () {
        for (let key in this.fields) {
          this.fields[key].reset2Init();
        }

        this.resetFFlagsField();
      },

      buildGroups: function (flagsField, fields) {
        let groups = [];
        for (let i in flagsField.model) {
          let fieldName = flagsField.model[i]
          let field = fields[fieldName];
          if (field.model && field.model.length > 0) {
            for (let j in field.model) {
              let type = field.model[j];
              let aliasName = fieldName + "_" + type;
              groups.push({
                colName: fieldName,
                type: type,
                aliasName: aliasName,
              });
            }
          }
        }

        return groups;
      },

      buildResultHeader: function () {
        let groups = this.buildGroups4Query();
        if (groups && groups.length > 0) {
          return groups.map(group => {
            let srvCol = this.srvCols.filter(srvCol => srvCol.columns == group.colName)[0];
            let type = group.type;
            let description = this.groupName2Label[type];
            let label = `${srvCol.label}[${description}]`;
            let colName = type == "by" ? group.colName : group.aliasName;
            return {
              label: label,
              colName: colName,

            }
          })
        } else {
          // no group
          return this.srvCols.filter(srvCol => srvCol.in_list && srvCol.columns != "id")
            .map(srvCol => {
                return {
                  label: srvCol.label,
                  colName: srvCol.columns,
                }
              }
            );
        }
      },

      buildGroups4Query: function () {
        let groups = this.buildGroups(this.gflagsField, this.groupFields).concat(
          this.buildGroups(this.rflagsField, this.reduceFields)
        );

        return groups;
      },

      buildConditions: function ( groups, headers) {
        let fields = this.allFields;
        let conditions = [];
        for (let key in fields) {
          let inSrvCols = this.srvCols.filter(item => item.columns === key).length > 0
          let field = fields[key];
          if (!inSrvCols ) {
          // if (!inSrvCols || !field.evalVisible()) {
            continue;
          }

          let condition = {
            colName: field.info.name,
            ruleType: field.ruleType,
            value: field.getSrvVal(),
          }
          if (condition.value != null && condition.value != '') {
            if (Array.isArray(condition.value)) {
              if (condition.value.length == 0) {
                continue;
              }
            }

            conditions.push(condition);
          }
        }

        return conditions;
      },

      /**
       * set editor and rule type
       */
      decorateFields: function () {
        let toRemove = new Set();
        for (let key in this.fields) {
          let field = this.fields[key]
          field.info.initValueExpr = null
          if (field.info.srvCol.in_cond !== 1) {
            field.info.visible = false;
          }

          let fieldInfo = field.info;
          if (!fieldInfo.isFilterable()) {
            toRemove.add(key);
          }


          // if field is finder and also has dispcol field, then remove finder
          if (fieldInfo.isFinder()) {
            let fieldArr = Object.values(this.fields);
            let hasDispCol = fieldArr.filter(item => item.info.name === ("_" + fieldInfo.name + "_disp")).length > 0
            if (hasDispCol) {
              toRemove.add(key);
            }
          }

          fieldInfo.editable = true;
          if (fieldInfo.isNumeric()) {
            field.ruleType = 'between'
          } else if (fieldInfo.type == 'Date') {
            field.ruleType = 'between'
          } else if (fieldInfo.type == 'Time') {
            field.ruleType = 'between'
          } else if (fieldInfo.type == 'DateTime') {
            field.ruleType = 'between'
          } else if (fieldInfo.type == 'Enum' || fieldInfo.type == 'Dict') {
            field.ruleType = 'in'
            field.model = []
          } else if (fieldInfo.isJoinedDisp() || fieldInfo.isTextual() || fieldInfo.isFinder()) {
            field.ruleType = 'like'
          } else if(fieldInfo.type =='Set'){
            field.ruleType = 'inset'
          } else {
            field.ruleType = "eq"
          }
        }

        for (let key of toRemove) {
          Vue.delete(this.fields, key);
        }

        this.fflagsField = this.addFlagsField("fflags", this.fields);
        this.fflagsField.optionsFunc = _ => this.gotFlagsOptions(this.fields);

        this.resetFFlagsField();
      },

      resetFFlagsField() {
        let inCondFields = Object.keys(this.fields)
          .filter(fieldName => {
            let srvCols = this.srvCols.filter(item => item.columns === fieldName)
            return srvCols.length > 0 && srvCols[0].in_cond === 1
          });

        this.fflagsField.setSrvVal(_.join(inCondFields, ","))
      },


      createReduceFields: function () {
        // create reduce fields
        let commonReduceOptions = [
          {label: "计数(去重去空)", value: "distinct_count"},
          {label: "计数(去空)", value: "count"},
        ];
        let comparableReduceOptions = [
          {label: "最大", value: "max"},
          {label: "最小", value: "min"},
        ];
        let numbericReduceOptions = [
          {label: "总和", value: "sum"},
          {label: "平均", value: "avg"},
        ];

        for (let i in this.srvCols) {
          let srvcol = this.srvCols[i];
          let fi = new FieldInfo(srvcol);
          if (fi.name == "id" || (fi.name.startsWith("_") && fi.name.endsWith("_disp"))) {
            continue;
          }

          let f = new Field(fi, this);
          fi.editor = "multiselect";
          f.model = [];

          if (fi.isTemporal()) {
            f.options = commonReduceOptions.concat(comparableReduceOptions);
            f.model.push("max");

          } else if (fi.isNumeric()) {
            f.options = commonReduceOptions.concat(comparableReduceOptions).concat(numbericReduceOptions);
            f.model.push("avg");
          } else {
            f.options = commonReduceOptions;
            f.model.push("count");
          }
          Vue.set(this.reduceFields, fi.name, f);
        }

        this.rflagsField = this.addFlagsField("rflags", this.reduceFields);
        this.rflagsField.optionsFunc = _ => this.gotFlagsOptions(this.reduceFields, this.gflagsField);
      },

      createGroupFields: function () {
        // create group fileds
        let dateGroupOptions = [
          {label: "按年汇总", value: "by_year"},
          {label: "按月汇总", value: "by_month_of_year"},
          {label: "按周汇总", value: "by_week"},
          {label: "按天汇总", value: "by_date"},
        ];

        let timeGroupOptions = [
          {label: "按小时汇总", value: "by_hour_of_date"},
          {label: "按分钟汇总", value: "by_minute"},
        ];
        for (let i in this.srvCols) {
          let srvcol = this.srvCols[i];
          let fi = new FieldInfo(srvcol);
          if (fi.name == "id" || fi.isFinder()) {
            continue;
          }

          let f = new Field(fi, this);
          fi.editor = "multiselect";
          f.model = [];

          if (fi.isDate()) {
            f.options = dateGroupOptions;
            f.model.push("by_date");
          } else if (fi.isTime()) {
            f.options = timeGroupOptions;
            f.model.push("by_minute");
          } else if (fi.isDateTime()) {
            f.options = dateGroupOptions.concat(timeGroupOptions);
            f.model.push("by_date");
          } else {
            f.options = [
              {label: "按值汇总", value: "by"}];
            f.model.push("by");
            f.info.bodyVisible = false;
          }

          Vue.set(this.groupFields, fi.name, f);
        }

        this.gflagsField = this.addFlagsField("gflags", this.groupFields);
        this.gflagsField.optionsFunc = _ => this.gotFlagsOptions(this.groupFields, this.rflagsField);
      },

      addFlagsField: function (name, fields) {
        let fakeSrvCol = {
          columns: name,
          label: "字段选择",
          col_span: 1,
          seq: -1000,
        };

        let flagsFi = new FieldInfo(fakeSrvCol);
        let flagsField = new Field(flagsFi, this);
        for (let key in fields) {
          let field = fields[key];
          field.info.visible = () => {
            return flagsField.model.filter(item => item == key).length > 0;
          };
          flagsField.options.push({
            value: key,
            label: field.info.label,
          });
        }

        flagsFi.editor = "multiselect";
        flagsField.model = [];
        Vue.set(fields, flagsFi.name, flagsField);
        // fiagsFi.visible = true
        return flagsField;
      }
    },

    mounted: function () {
      let colFilter = srvCol => {
        return srvCol.columns !== 'id' && srvCol.in_cond > 0
      };

      this.createFields(colFilter, this.srv_cols).then(() => {
        this.decorateFields();

        if (this.supportGroup) {
          this.createGroupFields();
          this.createReduceFields();
        }
      })
        .then(_ => {
          this.formLoaded = true;
        })
        .then(_ => {
          this.$emit('form-loaded');
        })
        .then(_ => {
          if (!this.supportGroup) {
            return;
          }

          this.rflagsField.editor.$on('field-value-changed', _ => {
            let selected = this.rflagsField.model;
            for (let i in selected) {
              let fieldName = selected[i];
              this.reduceFields[fieldName].info.seq = i * 100;
            }
          });

          this.gflagsField.editor.$on('field-value-changed', _ => {
            let selected = this.gflagsField.model;
            for (let i in selected) {
              let fieldName = selected[i];
              this.groupFields[fieldName].info.seq = i * 100;
            }
          });
        })

    }
  }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .el-table th {
    text-align: center;
  }

  .el-table tbody tr td:first-child {
    text-align: center;
  }
  .el-button--mini{
    padding: 4px 8px;
  }
  .el-form-item__content {
    line-height: initial;
    line-height: unset;
  }
  .filter-view{
    border: 1px solid #c2e0ce;
    /* background: #fcfcfc; */
    padding: 5px;
    border-radius: 4px;
  }

</style>
