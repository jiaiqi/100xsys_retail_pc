export default {
  
    methods: {
      buildConditions: function (pageIsDraft) {
        return this.buildConditionsFromConf(this,null);
      },
  
      buildConditionsFromConf: function (conf, item) {
        let ret = [];
        for (let i in conf.conditions) {
          let cond = conf.conditions[i];
          let queryCond = {};
          try {
            queryCond.colName = cond.colName;
            queryCond.ruleType = cond.ruleType;
            if (cond.disableExpr && eval(cond.disableExpr)) {
              return null;
            }
  
            let value = cond.valueExpr;
            if (value != "" && value != undefined && value != null) {
              // literal value or js expr
              if (cond.literalValue) {
                queryCond.value = value;
              } else {
                try {
                  queryCond.value = eval(value);
                } catch (err) {
                  queryCond.value = null;
                }
              }
            } else if (cond.valueFunc) {
              queryCond.value = cond.valueFunc();
            }
          } catch (e) {
            
            continue;
          }
  
          if (cond.required && this.isEmptyCondition(queryCond)) {
            let message = "manditory condition missing: " + cond.fieldFullName;
  
            return null;
          }
          
          ret.push(queryCond);
        }
  
        return ret;
  
      },
  
  
      /**
       * return a row of data;
       * item is used by valueExpr!!!
       * @returns {null}
       */
      buildValuesFromConf: function (conf, item) {
        let row = {
          _rtDataCtx: item
        };
        let valueList = conf.values;
        if (!valueList) {
          return row;
        }
  
        for (let i in valueList) {
          let confItem = valueList[i];
          let value = {};
          value.colName = confItem.colName;
  
          if (confItem.valueExpr) {
            // literal value or js expr
            if (confItem.literalValue) {
              value.value = confItem.valueExpr;
            } else {
              // eval in current ctx with target and params
              try {
                value.value = eval(confItem.valueExpr);
              } catch (err) {
                value.value = null;
              }
            }
          } else if (confItem.valueFunc) {
            value.value = (confItem.valueFunc)();
          }
  
          if (conf.ignoreNullValue && (value.value == null || value.value == undefined || value.value === "")) {
            
            continue;
          }
  
          if (confItem.enableFunc) {
            let func = confItem.enableFunc;
            let defaultData = this.defaultValues
            if (!(func)(value, item)) {
              
              continue;
            }
          }
  
          row[value.colName] = value.value;
        }
  
        return row;
      },
    }
  };
  