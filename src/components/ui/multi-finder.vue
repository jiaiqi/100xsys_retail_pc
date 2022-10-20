/* */
<template>
  <div>
    <a
      v-if="field.info.linkUrlFunc && !field.info.editable"
      v-show="field.getSrvVal()"
      style="white-space: normal; color: dodgerblue; cursor: pointer;"
      @click="onLinkClicked()"
    >
      {{ field.getDispVal4Read() }}
    </a>
    
    <!-- <el-autocomplete
      v-else
      ref="autocomplete"
      :fetch-suggestions="loadOptions"
      :value-key="field.info.dispCol"
      :disabled="!field.info.editable"
      v-model="selected"
      :placeholder="field.info.placeholder"
      clearable
      @select="handleSelect"
      @blur="handleBlur"
      style="width: 100%;"
    > -->
      <!-- <el-button
        slot="append"
        icon="el-icon-search"
        v-if="!field.info.noSearchIcon"
        @click="onPopupClicked"
      >
      </el-button> -->
      <!-- <template slot-scope="{ item }">
        <span style="float: left">{{ item.labelFunc(item) }}</span>
        <img
          :src="item.imgUrlFunc(item)"
          v-if="item.imgUrlFunc"
          style="float: right; margin-top: 0.5rem"
        />
      </template>
    </el-autocomplete> -->
  <el-select
  :style="{'min-width':'100%'}"
  ref="select"
    v-model="value"
    multiple
    filterable
    remote
    reserve-keyword
    @focus="handleBlur"
    placeholder="请输入关键词"
    :name="field.info.name"
    @change="handleSelect"
    :disabled="!field.info.editable"
    :remote-method="loadOptions"
    :loading="loading">
    <el-option
      v-for="item in options"
      :key="item[field.info.valueCol]"
      :label="item[field.info.dispCol]"
      :value="item[field.info.valueCol]">
    </el-option>
  </el-select>
    <!-- <el-dialog
      title="查询选择"
      width="90%"
      :close-on-click-modal="1 == 2"
      append-to-body
      :visible="popup"
      @close="popup = false"
    >
      <list
        :service="field.info.dispLoader.service"
        v-if="popup"
        ref="popup"
        :$srvApp="appNo"
        mode="finder"
        listType="selectlist"
        :grid-data-filter="this.dedupOptions"
        :default-condition="popupDefaultConditions()"
        @row-dbclick="onRowSelected"
      >
      </list>
      <div style="text-align: center; color: red">
        请双击列表行进行选择
      </div>
    </el-dialog> -->
  </div>
</template>

<script>
export default {
  components: {
    List: () => import('../common/list.vue')
  },
  props: {
    field: Object,
    defaultConditions: Array,
  },
  data () {
    return {
      selected: null,
      popup: false,
      value:[],
      appNo: null,
      options:[],
      loading:false
    }
  },
  computed: {
    // selected: {
    //   get () {
    //     let item = this.field.model
    //     if (item) {
    //       let fieldInfo = this.field.info
    //       let loader = fieldInfo.dispLoader
    //       return loader.showAsPair !== false ? `${item[ fieldInfo.dispCol ]}/${item[ fieldInfo.valueCol ]}` : item[ fieldInfo.dispCol ]
    //     }
    //   },
    //   set (val) {
    //     return val
    //   }
    // }
  },
  methods: {

    getLinkUrl () {
      let data = this.field && this.field.form && this.field.form.srvValFormModel()
      if (this.field.info.linkUrlFunc) {
        let url = (this.field.info.linkUrlFunc)(data, this)
        return url
      }
    },

    onLinkClicked () {
      let tabTitle = (this.field.info.srvCol && this.field.info.srvCol.option_list_v2 && this.field.info.srvCol.option_list_v2.service_label) || "详情";
      // this.addTabByUrl(this.getLinkUrl(), tabTitle)

      let linkUrl = this.getLinkUrl()
      if (typeof linkUrl === 'string' && (linkUrl.indexOf('?openlayer=') !== -1 || linkUrl.indexOf('&openlayer=') !== -1)) {
        let paramStr = linkUrl.indexOf('?') !== -1 ? linkUrl.slice(linkUrl.indexOf('?') + 1) : ''
        let paramArr = []
        if (paramStr) {
          paramArr = paramStr.split('&')
        }
        let result = false
        paramArr.forEach(item => {
          if (item.indexOf('openlayer=') !== -1) {
            result = item.split('openlayer=')[ 1 ]
          }
        })
        if (result == 'true') {
          top.layer.open({
            type: 2,
            area: [ "70%", '60%' ],
            content: this.getLinkUrl() //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['http://sentsin.com', 'no']
          });
        } else {
          this.addTabByUrl(this.getLinkUrl(), tabTitle)
        }
        // linkUrl = linkUrl.slice(start,)
      } else {
        this.addTabByUrl(this.getLinkUrl(), tabTitle)
      }
    },

    popupDefaultConditions () {
      let conditions = this.defaultConditions || []
      let fieldInfo = this.field.info
      let loader = fieldInfo.dispLoader
      return conditions.concat(this.buildConditions(loader))
    },

    dedupOptions (options) {
      let loader = this.field.info.dispLoader
      if (!loader.dedup) {
        return;
      }

      let form = this.field.form;
      if (form) {
        let gridData = form.srvValFormModel()._gridData;
        if (gridData && gridData.length) {
          let key_col = this.field.info.srvCol.columns;
          let existVals = gridData.map(item => item[ key_col ]);
          _.remove(options, option => _.includes(existVals, option[ key_col ]))
        }
      }
    },

    loadOptions (queryString, cbFun) {
      let cb = cbFun || function(e){console.log(e)}
      this.loading = true
      let fieldInfo = this.field.info
      let loader = fieldInfo.dispLoader
      if (loader.enableFunc) {
        if (!loader.enableFunc()) {
          cb([]);
          this.loading = false
          return;
        }
      }
      // console.log(queryString, cb)
      let queryJson = {
        serviceName: loader.service,
        queryMethod: 'select',
        distinct: !!loader.distinct,
        // * is here to support redundant or img url expr etc...
        colNames: [ "*" ],
        condition: [],
        page: {
          pageNo: 1,
          rownumber: 20,
        },
      }

      // if (queryString) {
      //   queryJson.condition.push({
      //     colName: fieldInfo.dispCol,
      //     value: queryString,
      //     ruleType: 'like'
      //   });
      // }

      if (loader) {
        if (loader.conditions) {
          this.buildConditions(loader).forEach(c => queryJson.condition.push(c))
          queryJson.condition = this.pruneConditions(queryJson.condition);
          queryJson.relation_condition = this.buildRelationConditionInfo(loader, queryString)
        } else if (loader.relation_conditions) {
          queryJson.relation_condition = this.buildRelationCondition(loader);
        } else {
          // 如果没有配置 conditions 和 relation_condition , 自动处理 默认的 relation_condition
          queryJson.relation_condition = this.buildRelationConditionInfo(loader, queryString)
        }
      }

      if (loader && loader.orders) {
        queryJson.order = loader.orders
      }

      let app = this.$srvApp && this.field.evalFormExpr(this.$srvApp, "")
      if (this.$srvApp && !app) {
        // 使用了动态srvApp，但是eval结果出错，取消查询
        cb([]);
        return
      }

      return this.selectList(queryJson, app).then(response => {
        if (response && response.data && response.data.data) {
          let options = response.data.data
          if (loader.dedup) {
            this.dedupOptions(options);
          }
this.loading = false
          options.forEach(item => {
            item.labelFunc = (data) => {
              
          
              this.options = loader.showAsPair !== true ?  data[ fieldInfo.dispCol ] : `${data[ fieldInfo.dispCol ]}/${data[ fieldInfo.valueCol ]}`
              return loader.showAsPair !== true ? data[ fieldInfo.dispCol ] : `${data[ fieldInfo.dispCol ]}/${data[ fieldInfo.valueCol ]}`
            }

          })

          options.forEach(option => {
            option.imgUrlFunc = (data) => {
              return eval(loader.imgUrlExpr)
            }
          })
          if(this.selected){
            let keys = this.selected
            this.options = this.options.filter((item) =>{
              if(keys.indexOf(item[this.field.info.valueCol]) !== -1){
                return item
              }
            })
            options.forEach((item) =>{
                if(keys.indexOf(item[this.field.info.valueCol]) === -1){
                  this.options.push(item)
                }
              })
            // this.options = this.options.concat(options)
          }else{
            this.options = options
          }
          
          cb(options)
        } else {
          cb([]);
          this.$refs.autocomplete.$refs.input && this.$refs.autocomplete.$refs.input.blur()
        }
      })
    },
    buildRelationConditionInfo (dispLoader, queryString) {
      let self = this
      let relaTemp = {
        "relation": "AND",
        "data": [

        ]
      }
      let condition = []
      let dataTemp = {
        "relation": "AND",
        "data": [
        ]
      }
      let relation_condition = {}
      if (dispLoader.conditions) {
        this.buildConditions(dispLoader).forEach(c => condition.push(c))
        condition = this.pruneConditions(condition);

        if (condition.length > 0) {
          relaTemp.relation = "OR"
          dataTemp.data = []
          let dataItem = {
            "colName": "",
            "value": "",
            "ruleType": ""
          }
          // dataTemp.data = condition
          // relaTemp.data.push(self.bxDeepClone(dataTemp))
          dataTemp.data = []
          dataItem.ruleType = "[like]"
          dataItem.colName = this.field.info.valueCol
          dataItem.value = queryString == null ? "" : queryString
          dataTemp.data.push(self.bxDeepClone(dataItem))
          relaTemp.data.push(self.bxDeepClone(dataTemp))
          dataTemp.data = []
          dataItem.ruleType = "[like]"
          dataItem.colName = this.field.info.dispCol
          dataItem.value = queryString == null ? "" : queryString
          dataTemp.data.push(self.bxDeepClone(dataItem))
          relaTemp.data.push(self.bxDeepClone(dataTemp))
        } else {
          relaTemp.relation = "OR"
          dataTemp.data = []
          let dataItem = {
            "colName": "",
            "value": "",
            "ruleType": ""
          }
          dataItem.ruleType = "[like]"
          dataItem.colName = this.field.info.valueCol
          dataItem.value = queryString == null ? "" : queryString
          dataTemp.data.push(self.bxDeepClone(dataItem))
          relaTemp.data.push(self.bxDeepClone(dataTemp))
          dataTemp.data = []
          dataItem.ruleType = "[like]"
          dataItem.colName = this.field.info.dispCol
          dataItem.value = queryString == null ? "" : queryString
          dataTemp.data.push(self.bxDeepClone(dataItem))
          relaTemp.data.push(self.bxDeepClone(dataTemp))
        }
      } else {
        // 默认的 value  disp 字段模糊查询条件
        relaTemp.relation = "OR"
        dataTemp.data = []
        let dataItem = {
          "colName": "",
          "value": "",
          "ruleType": ""
        }
        dataItem.ruleType = "[like]"
        dataItem.colName = this.field.info.valueCol
        dataItem.value = queryString == null ? "" : queryString
        dataTemp.data.push(self.bxDeepClone(dataItem))
        relaTemp.data.push(self.bxDeepClone(dataTemp))
        dataTemp.data = []
        dataItem.ruleType = "[like]"
        dataItem.colName = this.field.info.dispCol
        dataItem.value = queryString == null ? "" : queryString
        dataTemp.data.push(self.bxDeepClone(dataItem))
        relaTemp.data.push(self.bxDeepClone(dataTemp))
      }
      return relaTemp

    },
    buildRelationCondition (dispLoader) {
      let self = this;

      function evalCustomizer (value, key, obj, stack) {
        if (key === 'value' && !obj.literal) {
          try {
            return self.evalExprOrFunc(value, self.field.form.srvValFormModel(), null)
          } catch (e) {
            return value;
          }
        }
      }

      var evaled = _.cloneDeepWith(dispLoader.relation_conditions, evalCustomizer);

      function pruneCustomizer (value, key, obj, stack) {
        if (key === 'data' && _.isArray(value) && !_.isEmpty(value) && value[ 0 ].hasOwnProperty("colName")) {
          return _.filter(value, leafCondition => leafCondition.value !== '' && leafCondition.value !== null && leafCondition.value !== undefined)
        }
      }

      var result = _.cloneDeepWith(evaled, pruneCustomizer);
      return result;
    },

    buildConditions: function (dispLoader) {
      let ret = [];
      for (let i in dispLoader.conditions) {
        let cond = dispLoader.conditions[ i ];
        let condition = {};

        try {
          condition.colName = cond.colName;
          condition.ruleType = cond.ruleType;
          if (cond.disableExpr && eval(cond.disableExpr)) {
            continue;
          }

          let valueExpr = cond.valueExpr || cond.value;
          if (valueExpr) {
            // literal value or js expr
            if (cond.literalValue) {
              condition.value = valueExpr;
            } else {
              condition.value = this.evalExprOrFunc(valueExpr, this.field.form.srvValFormModel(), null)
            }
          } else if (cond.valueFunc) {
            condition.value = cond.valueFunc();
          }
        } catch (e) {

          continue;
        }
        if (condition.ruleType === 'isnull') {
          /**
           * 增加支持 ruleType === isnull
           */
          ret.push(condition)
        } else {
          if (condition.value != null && condition.value != '') {
            if (Array.isArray(condition.value)) {
              if (condition.value.length == 0) {
                continue;
              }
            }
            ret.push(condition);
          } else if (!this.field.info._finderAuto && condition.value === null && cond.value !== null) {
            condition.value = ''
            ret.push(condition);
          }
        }

      }

      return ret;

    },

    handleSelect (item) {

      console.log("handleSelect", item)
      // this.field.model = item
      // this.emitFieldValueChange();
      // let fieldInfo = this.field.info
      // let loader = fieldInfo.dispLoader
      // this.selected = (loader.showAsPair !== false ? `${item[ fieldInfo.dispCol ]}/${item[ fieldInfo.valueCol ]}` : item[ fieldInfo.dispCol ])
      this.field.model = item.join(',')
      this.selected = item.join(',')
    },

    emitFieldValueChange () {
      this.$emit('field-value-changed', this.field.info.name, this.field);
    },

    handleBlur () {
      console.log("handleBlur")
      try {
        if (this.field.getSrvVal()) {
          if (this.selected != this.field.getDispVal()) {

            this.field.reset();
          }
        }else{
          this.loadOptions(this.$refs.select.query)
        }
      } finally {
        this.$emit('blur', this.field)
      }
    },

    setSrvVal (srvVal) {
      let self = this
      if (srvVal == null || srvVal == undefined) {
        this.selected = null;
        this.emitFieldValueChange();
        return;
      }

      let fieldInfo = this.field.info
      let loader = fieldInfo.dispLoader
      let queryJson = {
        serviceName: loader.service,
        queryMethod: 'select',
        colNames: [ '*' ],
        condition: [
          { colName: fieldInfo.valueCol, value: srvVal, ruleType: 'in' }
        ]
      }

      if (loader) {
        if (loader.conditions) {
          this.buildConditions(loader).forEach(c => queryJson.condition.push(c));
          queryJson.condition = this.pruneConditions(queryJson.condition);
        } else if (loader.relation_conditions) {
          queryJson.relation_condition = this.buildRelationCondition(loader);
        }
      }

      return this.selectList(queryJson).then(response => {
        if (response && response.data && response.data.data && response.data.data.length > 0) {
          let item = response.data.data[ 0 ]

          this.options = response.data.data  // 默认选中的option
          // this.field.model = item;
          if (_.isObject(this.field.model)) {
            // 对象 fk值 设置 默认selected 显示值
            console.log("setSrvVal", item)
            let fieldInfo = this.field.info
            let loader = fieldInfo.dispLoader
            // this.selected = (loader.showAsPair !== false ? `${this.field.model[ fieldInfo.dispCol ]}/${this.field.model[ fieldInfo.valueCol ]}` : this.field.model[ fieldInfo.dispCol ])
            
          }else{
            self.value = this.field.model.split(',')
          }
          this.emitFieldValueChange();
        }
      })
    },

    // 目前不支持一个colname 多个condition，如果这种case且有一个ruletype = eq， 留下eq
    pruneConditions (conditions) {
      let map = {};
      conditions.forEach(condition => {
        if (map.hasOwnProperty(condition.colName)) {
          // keep ruletype == eq  增加支持 ruletype = in 20200526
          if (condition.ruleType === 'eq' || condition.ruleType === 'in') {
            map[ condition.colName ] = condition;
          } else {
            // ignore
          }
        } else {
          map[ condition.colName ] = condition;
        }
      });

      return Object.values(map);
    },



  },

  created: function () {
  },

  mounted: function () {
    let vm = this;

    // this.loadOptions(this.selected)
    // if (this.$refs.autocomplete) {
    //   this.$refs.autocomplete.$refs.input.$on('clear', function () {
    //     vm.selected = null;
    //     vm.handleSelect(null);
    //     setTimeout(_ => vm.$refs.autocomplete.getData(""), 500)
    //   });
    // }


    if (this.field.model) {
      console.log("modal--2", this.field.model)
      let value = this.field.model.split(",")
      if (value == undefined || value == null) {
        this.setSrvVal(this.field.model);
      } else {
        console.log("modal--12", this.field.model, this.selected, _.isObject(this.field.model))
        let fieldInfo = this.field.info
        let loader = fieldInfo.dispLoader
        // this.selected = (loader.showAsPair !== false ? `${this.field.model[ fieldInfo.dispCol ]}/${this.field.model[ fieldInfo.valueCol ]}` : this.field.model[ fieldInfo.dispCol ])
       
        this.selected = this.field.model
         this.setSrvVal(this.field.model);
      }
    }

    // if(this.field.type === "User"){
    //   this.appNo = "sso"
    // }


  }


}
</script>
<style lang="scss" scoped>
.el-select__tags{
       max-width: 100%!important;
     }
</style>

