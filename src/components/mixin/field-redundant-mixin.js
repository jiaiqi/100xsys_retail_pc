import {FieldInfo} from '../model/FieldInfo'
import {Field} from '../model/Field'
import Vue from 'vue'
import {ActionInfo} from "../model/ActionInfo";
import momentLib from "moment";

export default {

  methods: {

    handleRedundantOnFormModelChange: function (newVal, oldVal, fields, formModelFunc) {
      let self = this
      if (!this.isLoaded()) {
        return;
      }

      for (let fieldName in fields) {
        let field = fields[fieldName];
        if (!field || !field.info) {
          continue;
        }

        let fieldInfo = field.info;

        // 处理上游字段变化
        if (fieldInfo.upstream) {
          let upstreamField = fields[fieldInfo.upstream.field];
          let upstreamFieldValue = upstreamField.model;

          if (upstreamFieldValue && upstreamFieldValue != fieldInfo.upstream.fieldValue) {
            fieldInfo.upstream.fieldValue = upstreamFieldValue;

            // if value changed,  reset curr field,
            let refCol = fieldInfo.upstream.refCol;
            /// field.hasOwnProperty(refCol)  is to rule out downstream field not a finder
            if (field.model && field.hasOwnProperty(refCol) && field.model[refCol] != upstreamField.getSrvVal()) {
              field.reset();
            }
          }
        }

        // 处理Js计算冗余字段
        let diffFields = new Set();
        for (let fieldName in newVal) {
          if (newVal[fieldName] != oldVal[fieldName]) {
            diffFields.add(fieldName);
          }
        }

        if (fieldInfo.redundant ) {
          if (!(diffFields.size == 1 && diffFields.has(fieldName))) {
            let vm = this
            self.handleRedundantViaJs(field, formModelFunc, vm)
          }
        }
      }
    },

    /**
     *
     * @param field
     * @param formModelFunc
     * @param vm used in func js
     */
    handleRedundantViaJs: function (field, formModelFunc, vm) {
      let fieldInfo = field.info
      if (!fieldInfo.redundant || !fieldInfo.redundant.func) {
        return
      }


      let func = fieldInfo.redundant.func

        if (func) {
        let moment = momentLib;
        let row = formModelFunc();
        let ret = eval("var zz=" + func + "(row, vm); zz");
        if (ret === 'Invalid date') {
          return
        }

        let update = false
        if (fieldInfo.redundant.trigger == 'isnull' && field.isEmpty()) {
          update = true
        } else if (!fieldInfo.redundant.trigger || fieldInfo.redundant.trigger == 'always') {
          update = true
        }

        if (update && field.getSrvVal() !== ret) {
          
          // console.log("计算字段",row,field.info.label,ret,field,func)
          field.setSrvVal(ret);
        }

      }
    },

    buildDependentFields: function (fields) {
      // construct redundant fields relations via fk
      for (let fieldName in fields) {
        let field = fields[fieldName];

        if (
          field &&
          field.info &&
          field.info.dispLoader &&
          Array.isArray(field.info.dispLoader.conditions) &&
          field.info.dispLoader.conditions.length > 0
        ) {
          const hascondDependField = field.info.dispLoader.conditions.find(
            (item) => item.value && item.value.indexOf("data") !== -1
          );

          if (hascondDependField) {
            for (let fieldName2 in fields) {
              let field2 = fields[fieldName2];
              if (
                field2 &&
                field2.info &&
                field2.info.name &&
                field.info.dispLoader.conditions.find(
                  (item) =>
                    item.value &&
                    item.value.indexOf(field2.info.name) > -1
                )
              ) {
                field2.condDependentFields =
                  field2.condDependentFields || new Set();
                field2.condDependentFields.add(field.info.name);
              }
            }
          }
        }

        if (field && field.info && field.info.redundant && field.info.redundant.dependField) {
          let dependField = fields[field.info.redundant.dependField];
          if (dependField) {
            dependField.dependentFields = dependField.dependentFields || new Set();
            dependField.dependentFields.add(field.info.name);
          }
        }
      }
    },

    /**
     * 处理通过fk引用的冗余字段
     * @param field
     * @param fields
     */
    handleFieldFkRedundant: function (field, fields) {

      if(field.model===null && field.condDependentFields && field.condDependentFields.size>0 ){
        field.condDependentFields.forEach(dependentFieldName=>{
          let dependentField = fields[dependentFieldName];
          dependentField.reset()
        })
      }

      if (field.dependentFields) {
        field.dependentFields.forEach((dependentFieldName,index) => {
          let dependentField = fields[dependentFieldName];

          let sync = true;
          if (dependentField.info.redundant.trigger === 'isnull') {
            // 触发字段数据发生变化，其它字段为null的时候冗余
            sync = dependentField.isEmpty();
          }

          if (dependentField.info.redundant.trigger === 'unchange') {
            //  触发字段数据发生变化，其它字段没有被手动修改的时候，冗余，如果存在手动修改，则不在冗余
            if(dependentField.model===null||field.modelOld&&dependentField.getSrvVal&&dependentField.getSrvVal()===field.modelOld[dependentField.info.redundant.refedCol]){
              sync = true
            }else{
              sync = false
            }
          }

          // if(field.model===null&&field.modelOld&&dependentField.getSrvVal&&dependentField.getSrvVal()===field.modelOld[dependentField.info.redundant.refedCol]){
          //   dependentField.reset();
          //   if(index === field.dependentFields.length-1){
          //   field.modelOld = null
          //   }
          // }

          if (sync) {
            if (field.model && (field.model[dependentField.info.redundant.refedCol]||field.model[dependentField.info.redundant.refedCol]===0)) {
              dependentField.setSrvVal(field.model[dependentField.info.redundant.refedCol]);
              field.modelOld = _.cloneDeep(field.model)
            } else {
              dependentField.reset();
            }
          }
        });
      }

      // for user field xxx, try to set the _xxx_disp field
      let dispFieldName = `_${field.info.name}_disp`;
      if (field.info.type === "User" && fields[dispFieldName]) {
        if (field.model) {
          fields[dispFieldName].setSrvVal(field.model.user_disp)
        }
      }
      
      // else{
      //   fields[dispFieldName].setSrvVal(field.model.user_disp)
      // }
    },
  }

};
