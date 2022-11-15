/* */
<template>
  <div>
    <div v-if="subType !== 'select'">
      <a
        v-if="field.info.linkUrlFunc && !field.info.editable"
        v-show="field.getSrvVal()"
        style="white-space: normal; color: dodgerblue; cursor: pointer"
        @click="onLinkClicked()"
      >
        {{ field.getDispVal4Read() }}
      </a>
      <table-picker
        v-bind="$props"
        :selectedGridData="multiSelected"
        :finder-selected="field.model"
        :defaultValues="defaultValues"
        :mainformDatas="mainformDatas"
        @on-selected="onPickerSelected"
        v-else-if="isFks"
      ></table-picker>
      <el-autocomplete
        v-else
        ref="autocomplete"
        :trigger-on-focus="showAutocomplete"
        :fetch-suggestions="loadOptions"
        :value-key="field.info.dispCol"
        :disabled="!field.info.editable"
        v-model="selected"
        :placeholder="field.info.placeholder"
        clearable
        @select="handleSelect"
        @blur="handleBlur"
        style="width: 100%"
      >
        <el-button
          slot="append"
          icon="el-icon-search"
          v-if="!field.info.noSearchIcon"
          @click="onPopupClicked"
        >
        </el-button>
        <template slot-scope="{ item }">
          <span style="float: left">{{ item.labelFunc(item) }}</span>
          <img
            :src="item.imgUrlFunc(item)"
            v-if="item.imgUrlFunc"
            style="float: right; margin-top: 0.5rem"
            height="30"
            width="30"
          />
        </template>
      </el-autocomplete>

      <el-dialog
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
        <div style="text-align: center; color: red">请双击列表行进行选择</div>
      </el-dialog>
    </div>
    <div v-if="subType === 'select'">
      <el-select
        v-model="selected"
        :value-key="field.info.dispCol"
        :disabled="!field.info.editable"
        clearable
        @visible-change="getOptions"
        @change="handleSelect"
        :placeholder="field.info.placeholder"
      >
        <el-option
          v-for="item in optionsRun"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
import tablePicker from "../common/table-picker.vue";
export default {
  components: {
    List: () => import("../common/list.vue"),
    tablePicker: tablePicker,
    //  () => import("../common/table-picker.vue")
  },
  model: {
    prop: "finderSelected",
    event: "change",
  },
  props: {
    field: Object,
    defaultConditions: Array,
    finderSelected: String,
    defaultValues: Object,
    childForeignkey: Object,
    mainformDatas: Object,
  },
  data() {
    return {
      selected: null,
      popup: false,
      appNo: null,
      options: [],
      childForeign: null,
      multiSelected: [],
    };
  },
  watch: {
    selected(newVal) {
      this.$emit("change", newVal);
      this.$emit("blur", this.field);
      this.emitFieldValueChange();
    },
    childForeignkey: {
      deep: true,
      immediate: true,
      handler: function(newval, olval) {
        // console.log(newval,olval)
        if (newval) {
          for (const key in newval) {
            if (key == "referenced_column_name") {
              this.childForeign = newval[key];
            }
          }
        }
      },
    },
    defaultValues: {
      deep: true,
      immediate: true,
      handler: function(newval, olval) {
        for (const key in newval) {
          if (
            key == this.childForeign &&
            this.field.info.name == this.childForeign
          ) {
            // this.selected=newval[key]
            this.handleSelect(newval[key]);
          }
        }
      },
    },
  },
  computed: {
    optionsRun: function() {
      return this.options;
    },
    subType: function() {
      let subType = this.field.info.srvCol.subtype;
      return subType;
    },
    showAutocomplete: function() {
      let self = this;
      let showAutocomplete = true;
      let moreConfig = self.field.info.moreConfig;
      showAutocomplete =
        moreConfig && moreConfig.hasOwnProperty("showAutocomplete")
          ? moreConfig.showAutocomplete
          : true;
      return showAutocomplete;
    },
    isFks() {
      return (
        this.field &&
        this.field.info &&
        ["fks", "fkjson", "fkjsons"].includes(this.field.info.type)
      );
    },
  },
  methods: {
    setInitVal() {
      if (
        this.options.length > 0 &&
        !this.field.model &&
        this.field.info &&
        this.field.info.srvCol &&
        this.field.info.srvCol.init_expr === "$firstRowData"
      ) {
        let fieldInfo = this.field.info;
        let loader = fieldInfo.dispLoader;
        this.field.model = this.options[0];
        this.selected = loader.showAsPair !== true
              ?  this.options[0][fieldInfo.dispCol]
              : `${ this.options[0][fieldInfo.dispCol]}/${ this.options[0][fieldInfo.valueCol]}`;

      }
    },
    onPickerSelected(selected) {
      this.field.model = selected;
      this.selected = selected;
    },
    getOptions(queryString) {
      let self = this;
      let fieldInfo = this.field.info;
      let loader = fieldInfo.dispLoader;
      if (queryString == true) {
        if (loader.enableFunc) {
          if (!loader.enableFunc()) {
            // cb([]);
            return;
          }
        }
        // console.log(queryString, cb)
        let queryJson = {
          serviceName: loader.service,
          queryMethod: "select",
          distinct: !!loader.distinct,
          // * is here to support redundant or img url expr etc...
          colNames: ["*"],
          condition: [],
          page: {
            pageNo: 1,
            rownumber: 20,
          },
        };
        if (loader) {
          if (loader.conditions) {
            this.buildConditions(loader).forEach((c) =>
              queryJson.condition.push(c)
            );
            queryJson.condition = this.pruneConditions(queryJson.condition);
            queryJson.relation_condition = this.buildRelationConditionInfo(
              loader,
              ""
            );
          } else if (loader.relation_conditions) {
            queryJson.relation_condition = this.buildRelationCondition(loader);
          } else {
            // 如果没有配置 conditions 和 relation_condition , 自动处理 默认的 relation_condition
            queryJson.relation_condition = this.buildRelationConditionInfo(
              loader,
              ""
            );
          }
        }

        if (loader && loader.orders) {
          queryJson.order = loader.orders;
        }

        let app = this.$srvApp && this.field.evalFormExpr(this.$srvApp, "");
        if (this.$srvApp && !app) {
          // 使用了动态srvApp，但是eval结果出错，取消查询
          // cb([]);
          return;
        }
        return this.selectList(queryJson, app).then((response) => {
          if (response && response.data && response.data.data) {
            let options = response.data.data;
            if (loader.dedup) {
              this.dedupOptions(options);
            }

            options.forEach((item) => {
              item["label"] =
                loader.showAsPair !== true
                  ? item[fieldInfo.dispCol]
                  : `${item[fieldInfo.dispCol]}/${item[fieldInfo.valueCol]}`;
              item["value"] = item[fieldInfo.valueCol];
              item.labelFunc = (item) => {
                return loader.showAsPair !== true
                  ? item[fieldInfo.dispCol]
                  : `${item[fieldInfo.dispCol]}/${item[fieldInfo.valueCol]}`;
              };
            });

            options.forEach((item) => {
              item.labelFunc = (data) => {
                return loader.showAsPair !== true
                  ? data[fieldInfo.dispCol]
                  : `${data[fieldInfo.dispCol]}/${data[fieldInfo.valueCol]}`;
              };
            });
            this.options = options.map((item) => item);
            // cb(options)
            this.setInitVal()

          } else {
            // cb([]);
            return [];
          }
        });
      }
    },
    getLinkUrl() {
      let data =
        this.field && this.field.form && this.field.form.srvValFormModel();
      if (this.field.info.linkUrlFunc) {
        let url = this.field.info.linkUrlFunc(data, this);
        return url;
      }
    },

    onLinkClicked() {
      let tabTitle =
        (this.field.info.srvCol &&
          this.field.info.srvCol.option_list_v2 &&
          this.field.info.srvCol.option_list_v2.service_label) ||
        "详情";
      // this.addTabByUrl(this.getLinkUrl(), tabTitle)

      let linkUrl = this.getLinkUrl();
      if (
        typeof linkUrl === "string" &&
        (linkUrl.indexOf("?openlayer=") !== -1 ||
          linkUrl.indexOf("&openlayer=") !== -1)
      ) {
        let paramStr =
          linkUrl.indexOf("?") !== -1
            ? linkUrl.slice(linkUrl.indexOf("?") + 1)
            : "";
        let paramArr = [];
        if (paramStr) {
          paramArr = paramStr.split("&");
        }
        let result = false;
        paramArr.forEach((item) => {
          if (item.indexOf("openlayer=") !== -1) {
            result = item.split("openlayer=")[1];
          }
        });
        if (result == "true") {
          // debugger
          top.layer.open({
            type: 2,
            area: ["70%", "60%"],
            content: this.getLinkUrl(), //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['http://sentsin.com', 'no']
          });
        } else {
          this.addTabByUrl(this.getLinkUrl(), tabTitle);
        }
        // linkUrl = linkUrl.slice(start,)
      } else {
        this.addTabByUrl(this.getLinkUrl(), tabTitle);
      }
    },

    popupDefaultConditions() {
      let conditions = this.defaultConditions || [];
      let fieldInfo = this.field.info;
      let loader = fieldInfo.dispLoader;
      return conditions.concat(this.buildConditions(loader));
    },

    dedupOptions(options) {
      let loader = this.field.info.dispLoader;
      if (!loader.dedup) {
        return;
      }

      let form = this.field.form;
      if (form) {
        let gridData = form.srvValFormModel()._gridData;
        if (gridData && gridData.length) {
          let key_col = this.field.info.srvCol.columns;
          let existVals = gridData.map((item) => item[key_col]);
          _.remove(options, (option) => _.includes(existVals, option[key_col]));
        }
      }
    },

    loadOptions(queryString, cb) {
      let self = this;

      let fieldInfo = this.field.info;
      let loader = fieldInfo.dispLoader;
      if (loader.enableFunc) {
        if (!loader.enableFunc()) {
          cb([]);
          return;
        }
      }
      // console.log(queryString, cb)
      let queryJson = {
        serviceName: loader.service,
        queryMethod: "select",
        distinct: !!loader.distinct,
        // * is here to support redundant or img url expr etc...
        colNames: ["*"],
        condition: [],
        page: {
          pageNo: 1,
          rownumber: 20,
        },
      };

      // if (queryString) {
      //   queryJson.condition.push({
      //     colName: fieldInfo.dispCol,
      //     value: queryString,
      //     ruleType: 'like'
      //   });
      // }

      if (loader) {
        if (loader.conditions) {
          this.buildConditions(loader).forEach((c) =>
            queryJson.condition.push(c)
          );
          queryJson.condition = this.pruneConditions(queryJson.condition);
          queryJson.relation_condition = this.buildRelationConditionInfo(
            loader,
            queryString
          );
        } else if (loader.relation_conditions) {
          queryJson.relation_condition = this.buildRelationCondition(loader);
        } else {
          // 如果没有配置 conditions 和 relation_condition , 自动处理 默认的 relation_condition
          queryJson.relation_condition = this.buildRelationConditionInfo(
            loader,
            queryString
          );
        }
      }

      if (loader && loader.orders) {
        queryJson.order = loader.orders;
      }

      let app = this.$srvApp && this.field.evalFormExpr(this.$srvApp, "");
      if (this.$srvApp && !app) {
        // 使用了动态srvApp，但是eval结果出错，取消查询
        cb([]);
        return;
      }
      return this.selectList(queryJson, app).then((response) => {
        if (response && response.data && response.data.data) {
          let options = response.data.data;
          if (loader.dedup) {
            this.dedupOptions(options);
          }

          options.forEach((item) => {
            item.labelFunc = (data) => {
              return loader.showAsPair == true
                ? `${data[fieldInfo.dispCol]}/${data[fieldInfo.valueCol]}`
                : data[fieldInfo.dispCol];
            };
          });

          options.forEach((option) => {
            if (loader.imgUrlExpr) {
              option.imgUrlFunc = (data) => {
                return (
                  this.serviceApi().downloadFileNo + data[loader.imgUrlExpr]
                );
              };
            }
          });
          this.options = this.bxDeepClone(options);
          cb(options);
        } else {
          cb([]);
          this.$refs.autocomplete.$refs.input &&
            this.$refs.autocomplete.$refs.input.blur();
        }
      });
    },
    buildRelationConditionInfo(dispLoader, queryString) {
      let self = this;
      let relaTemp = {
        relation: "AND",
        data: [],
      };
      let condition = [];
      let dataTemp = {
        relation: "AND",
        data: [],
      };
      let relation_condition = {};
      if (dispLoader.conditions) {
        this.buildConditions(dispLoader).forEach((c) => condition.push(c));
        condition = this.pruneConditions(condition);

        if (condition.length > 0) {
          relaTemp.relation = "OR";
          dataTemp.data = [];
          let dataItem = {
            colName: "",
            value: "",
            ruleType: "",
          };
          // dataTemp.data = condition
          // relaTemp.data.push(self.bxDeepClone(dataTemp))
          dataTemp.data = [];
          dataItem.ruleType = "[like]";
          dataItem.colName = this.field.info.valueCol;
          dataItem.value = queryString == null ? "" : queryString;
          dataTemp.data.push(self.bxDeepClone(dataItem));
          relaTemp.data.push(self.bxDeepClone(dataTemp));
          dataTemp.data = [];
          dataItem.ruleType = "[like]";
          dataItem.colName = this.field.info.dispCol;
          dataItem.value = queryString == null ? "" : queryString;
          dataTemp.data.push(self.bxDeepClone(dataItem));
          relaTemp.data.push(self.bxDeepClone(dataTemp));
        } else {
          relaTemp.relation = "OR";
          dataTemp.data = [];
          let dataItem = {
            colName: "",
            value: "",
            ruleType: "",
          };
          dataItem.ruleType = "[like]";
          dataItem.colName = this.field.info.valueCol;
          dataItem.value = queryString == null ? "" : queryString;
          dataTemp.data.push(self.bxDeepClone(dataItem));
          relaTemp.data.push(self.bxDeepClone(dataTemp));
          dataTemp.data = [];
          dataItem.ruleType = "[like]";
          dataItem.colName = this.field.info.dispCol;
          dataItem.value = queryString == null ? "" : queryString;
          dataTemp.data.push(self.bxDeepClone(dataItem));
          relaTemp.data.push(self.bxDeepClone(dataTemp));
        }
      } else {
        // 默认的 value  disp 字段模糊查询条件
        relaTemp.relation = "OR";
        dataTemp.data = [];
        let dataItem = {
          colName: "",
          value: "",
          ruleType: "",
        };
        dataItem.ruleType = "[like]";
        dataItem.colName = this.field.info.valueCol;
        dataItem.value = queryString == null ? "" : queryString;
        dataTemp.data.push(self.bxDeepClone(dataItem));
        relaTemp.data.push(self.bxDeepClone(dataTemp));
        dataTemp.data = [];
        dataItem.ruleType = "[like]";
        dataItem.colName = this.field.info.dispCol;
        dataItem.value = queryString == null ? "" : queryString;
        dataTemp.data.push(self.bxDeepClone(dataItem));
        relaTemp.data.push(self.bxDeepClone(dataTemp));
      }
      return relaTemp;
    },
    buildRelationCondition(dispLoader) {
      let self = this;

      function evalCustomizer(value, key, obj, stack) {
        if (key === "value" && !obj.literal) {
          try {
            return self.evalExprOrFunc(
              value,
              self.field.form.srvValFormModel(),
              null
            );
          } catch (e) {
            return value;
          }
        }
      }

      var evaled = _.cloneDeepWith(
        dispLoader.relation_conditions,
        evalCustomizer
      );

      function pruneCustomizer(value, key, obj, stack) {
        if (
          key === "data" &&
          _.isArray(value) &&
          !_.isEmpty(value) &&
          value[0].hasOwnProperty("colName")
        ) {
          return _.filter(
            value,
            (leafCondition) =>
              leafCondition.value !== "" &&
              leafCondition.value !== null &&
              leafCondition.value !== undefined
          );
        }
      }

      var result = _.cloneDeepWith(evaled, pruneCustomizer);
      return result;
    },

    buildConditions: function(dispLoader) {
      let ret = [];
      for (let i in dispLoader.conditions) {
        let cond = dispLoader.conditions[i];
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
              condition.value = this.evalExprOrFunc(
                valueExpr,
                this.field.form.srvValFormModel(),
                null
              );
            }
          } else if (cond.valueFunc) {
            condition.value = cond.valueFunc();
          }
        } catch (e) {
          continue;
        }
        if (condition.ruleType === "isnull") {
          /**
           * 增加支持 ruleType === isnull
           */
          ret.push(condition);
        } else {
          if (condition.value != null && condition.value != "") {
            if (Array.isArray(condition.value)) {
              if (condition.value.length == 0) {
                continue;
              }
            }
            ret.push(condition);
          } else if (
            !this.field.info._finderAuto &&
            condition.value === null &&
            cond.value !== null
          ) {
            condition.value = "";
            ret.push(condition);
          }
        }
      }

      return ret;
    },

    handleSelect(item) {
      console.log("handleSelect", item);
      this.field.model = item;

      let fieldInfo = this.field.info;
      let loader = fieldInfo.dispLoader;
      if (this.subType == "select") {
        let selectItem = this.options.filter(
          (opt) => opt[fieldInfo.valueCol] == item
        );
        this.field.model = selectItem[0] || "";
        // this.emitFieldValueChange();
      } else {
        if (item === null) {
          this.selected = "";
        } else {
          this.selected =
            loader.showAsPair !== true
              ? item[fieldInfo.dispCol]
              : `${item[fieldInfo.dispCol]}/${item[fieldInfo.valueCol]}`;
        }
      }
      this.emitFieldValueChange();
    },

    emitFieldValueChange() {
      this.$emit("field-value-changed", this.field.info.name, this.field);
    },

    handleBlur() {
      try {
        if (this.field.getSrvVal()) {
          if (
            this.selected != this.field.getDispVal() &&
            this.selected !=
              `${this.field.getDispVal()}/${this.field.getSrvVal()}`
          ) {
            this.field.reset();
          }
        } else {
          // this.selected = ''
        }
      } finally {
        this.$emit("blur", this.field);
        this.emitFieldValueChange();
      }
    },

    setSrvVal(srvVal) {
      if (srvVal == null || srvVal == undefined) {
        this.selected = null;
        this.emitFieldValueChange();
        return;
      }

      let fieldInfo = this.field.info;
      let loader = fieldInfo.dispLoader;
      let queryJson = {
        serviceName: loader.service,
        queryMethod: "select",
        colNames: ["*"],
        condition: [
          { colName: fieldInfo.valueCol, value: srvVal, ruleType: "eq" },
        ],
      };

      if (["fkjsons", "fkjson", "fks"].includes(fieldInfo.type)) {
        let json = null;
        if (srvVal) {
          try {
            json = JSON.parse(srvVal);
          } catch (error) {
            console.log(error);
          }
        }
        let valCol = fieldInfo.fmt && fieldInfo.fmt.primary_col;
        if (valCol && json) {
          if (fieldInfo.type === "fkjson") {
            queryJson.condition = [
              {
                colName: fieldInfo.valueCol,
                value: json[valCol],
                ruleType: "eq",
              },
            ];
          } else if (fieldInfo.type === "fkjsons") {
            queryJson.condition = [
              {
                colName: fieldInfo.valueCol,
                value: json.map((item) => item[valCol]).toString(),
                ruleType: "in",
              },
            ];
          } else if (fieldInfo.type === "fks") {
            queryJson.condition = [
              {
                colName: fieldInfo.valueCol,
                value: srvVal,
                ruleType: "in",
              },
            ];
          }
        }
      }
      if (loader) {
        if (loader.conditions) {
          this.buildConditions(loader).forEach((c) =>
            queryJson.condition.push(c)
          );
          queryJson.condition = this.pruneConditions(queryJson.condition);
        } else if (loader.relation_conditions) {
          queryJson.relation_condition = this.buildRelationCondition(loader);
        }
      }
      let app = this.$srvApp && this.field.evalFormExpr(this.$srvApp, "");
      if (this.$srvApp && !app) {
        // 使用了动态srvApp，但是eval结果出错，取消查询
        cb([]);
        return;
      }
      return this.selectList(queryJson, app).then((response) => {
        if (
          response &&
          response.data &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          if (["fkjsons", "fkjson", "fks"].includes(fieldInfo.type)) {
            this.multiSelected = response.data.data;
            return;
          }
          let item = response.data.data[0];
          this.field.model = item;
          if (_.isObject(this.field.model)) {
            // 对象 fk值 设置 默认selected 显示值
            console.log("setSrvVal", item);
            let fieldInfo = this.field.info;
            let loader = fieldInfo.dispLoader;
            if (this.subType === "select") {
              this.selected = this.field.model[fieldInfo.valueCol];
            } else {
              this.selected =
                loader.showAsPair !== true
                  ? this.field.model[fieldInfo.dispCol]
                  : `${this.field.model[fieldInfo.dispCol]}/${
                      this.field.model[fieldInfo.valueCol]
                    }`;
            }
            // this.selected = (loader.showAsPair !== false ? `${this.field.model[ fieldInfo.dispCol ]}/${this.field.model[ fieldInfo.valueCol ]}` : this.field.model[ fieldInfo.dispCol ])
          }

          this.emitFieldValueChange();
        }
      });
    },

    // 目前不支持一个colname 多个condition，如果这种case且有一个ruletype = eq， 留下eq
    pruneConditions(conditions) {
      let map = [];
      conditions.forEach((condition) => {
        if (map.hasOwnProperty(condition.colName)) {
          // keep ruletype == eq  增加支持 ruletype = in 20200526
          if (condition.ruleType === "eq" || condition.ruleType === "in") {
            map.push(condition);
          } else {
            // ignore
            map.push(condition);
          }
        } else {
          map.push(condition);
        }
      });

      return map;
    },

    /**
     * on row selected in finder's search popup
     * @param row
     * @param event
     */
    onRowSelected(row, event) {
      let item = row;
      this.field.model = item;

      this.$emit("blur", this.field);
      this.emitFieldValueChange();
      let fieldInfo = this.field.info;
      let loader = fieldInfo.dispLoader;
      this.selected =
        loader.showAsPair !== true
          ? item[fieldInfo.dispCol]
          : `${item[fieldInfo.dispCol]}/${item[fieldInfo.valueCol]}`;
      this.popup = false;
    },

    onPopupClicked() {
      if (!this.field.info.editable) {
        return;
      }

      this.popup = true;

      // hide suggestions
      this.$refs.autocomplete.activated = false;
    },
  },

  created: function() {},

  mounted: function() {
    let vm = this;
    if (this.$refs.autocomplete) {
      this.$refs.autocomplete.$refs.input.$on("clear", function() {
        vm.selected = null;
        vm.handleSelect(null);
        setTimeout((_) => vm.$refs.autocomplete.getData(""), 500);
      });
    }

    // if (this.subType === "select") {
      this.getOptions(true);
    // }
    if (this.field.model) {
      // console.log("modal--2", this.field.model)
      let value = this.field.model[this.field.info.valueCol];
      if (value == undefined || value == null) {
        this.setSrvVal(this.field.model);
      } else {
        // console.log("modal--12", this.field.model, this.selected, _.isObject(this.field.model))
        let fieldInfo = this.field.info;
        let loader = fieldInfo.dispLoader;
        if (this.subType === "select") {
          this.selected = this.field.model[fieldInfo.valueCol];
        } else {
          this.selected =
            loader.showAsPair !== false
              ? this.field.model[fieldInfo.dispCol]
              : `${this.field.model[fieldInfo.dispCol]}/${
                  this.field.model[fieldInfo.valueCol]
                }`;
        }
      }
    }
    // if(this.field.type === "User"){
    //   this.appNo = "sso"
    // }
  },
};
</script>
<style lang="less"></style>
