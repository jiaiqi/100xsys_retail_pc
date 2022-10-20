/* */
<template>
  <a
    v-if="field.info.linkUrlFunc && !field.info.editable"
    v-show="field.getSrvVal()"
    style="white-space: normal; color: dodgerblue; cursor: pointer"
    @click="onLinkClicked()"
  >
    {{ field.getDispVal4Read() }}
  </a>
  <el-cascader
    v-else
    :placeholder="field.info.placeholder"
    :options="options"
    v-model="selected"
    :value="selected"
    :props="props"
    :change-on-select="unlimited"
    filterable
    clearable
    :visible-change="visibleChange"
    :show-all-levels="field.info.editable"
    :disabled="!field.info.editable"
    @change="onSelectChange"
    @active-item-change="onItemChange"
    @input.native="inputChange"
    @focus="onFocus"
  >
  </el-cascader>
</template>

<script>
export default {
  props: ["field"],
  data() {
    return {
      // value组成的路径数组
      selected: [],
      // 树形结构数据
      options: [],
      visibleChange: false
    };
  },

  computed: {
    props: function() {
      let props = {
        value: this.field.info.valueCol,
        label: this.needRenameLabel() ? "valuezh" : this.field.info.dispCol
      };

      return props;
    },
    unlimited: function() {
      // 是否允许选择 任意一级， false ，true
      let unlimited = this.field.info.srvCol.option_list_v2;
      if (
        unlimited.hasOwnProperty("unlimited") &&
        unlimited.unlimited === false
      ) {
        return false;
      } else {
        return true;
      }
    }
  },

  methods: {
    onFocus(){
      if(!this.field.model){
        this.loadOptions()
      }
    },
    needRenameLabel() {
      return this.field.info.dispCol === "value";
    },
    onItemChange(val) {
      if (Array.isArray(val) && val.length > 0) {
        this.onSelectChange(val[val.length - 1]);
      }
    },
    inputChange: _.debounce(function(e) {
      console.log(e.target.value);
      let val = e.target.value;
      let loader = this.field.info.dispLoader;
      if (loader.parentCol) {
        console.log(val, "onSelectChange");
        this.treeLazySelect(loader, null, val);
      }
    }, 500),

    /**
     * 树型数据懒加载
     * @param parentNo {string} 点击的节点的编号
     * @param val {string} 搜索的值
     * @param curVal {string} 字段默认值
     * 加载逻辑：
     * 如果是点击节点后进行查询，则将所点击的节点的编号parentNo为父节点 作为过滤条件
     * 如果是搜索的，则将搜索值val作为relation_contiton（OR）
     * 如果有默认值，则将默认值curVal作为过滤条件
     * 如果不是点击节点后查询、不是搜索、没有默认值 则将父节点编号isnull 作为过滤条件
     * 如果有默认条件（option_list配置的）,以上所有情况 请求都带上默认条件
     */
    treeLazySelect(loader, parentNo = "", val = "", curVal) {
      const fieldInfo = this.field.info;
      let conditions = this.buildConditions(loader);
      let relation_condition = {};
      var url = this.getServiceUrl("select", loader.service);
      if (Array.isArray(parentNo)) {
        if (parentNo.length > 0) {
          parentNo = parentNo[parentNo.length - 1];
        } else {
          parentNo = "";
        }
      }
      if (val) {
        relation_condition = {
          relation: "OR",
          data: [
            {
              colName: fieldInfo.valueCol,
              ruleType: "like",
              value: val
            },
            {
              colName: fieldInfo.dispCol,
              ruleType: "like",
              value: val
            }
          ]
        };
      } else if (curVal) {
        conditions = [
          ...conditions,
          {
            colName: this.props.value,
            ruleType: "eq",
            value: curVal
          }
        ];
      } else if (parentNo) {
        if (loader.parentCol) {
          conditions = [
            ...conditions,
            {
              colName: loader.parentCol,
              ruleType: "eq",
              value: parentNo
            }
          ];
        }
      } else if (this.selected && this.selected.length > 0) {
        parentNo = this.selected[this.selected.length - 1];
        conditions = [
          ...conditions,
          {
            colName: loader.parentCol,
            ruleType: "eq",
            value: parentNo
          }
        ];
      } else {
        // 加载第一级数据

        // if (this.field.model) {
        //   let curVal = this.field.getSrvVal()
        //   conditions = [ ...conditions, {
        //     colName: fieldInfo.valueCol,
        //     ruleType: "eq",
        //     value: curVal
        //   } ]
        // }

        if (loader.parentCol) {
          conditions = [
            ...conditions,
            {
              colName: loader.parentCol,
              ruleType: "isnull"
            }
          ];
        }
      }

      var params = {
        serviceName: loader.service,
        colNames: ["*"],
        condition: conditions,
        relation_condition: relation_condition
      };
      return this.$http.post(url, params).then(response => {
        if (response && response.data && response.data.data) {
          let options = response.data.data.map(item => {
            item.children = item.is_leaf === "是" ? null : [];
            return item;
          });
          if (this.needRenameLabel()) {
            options.forEach(option => this.renameLable(option));
          }
          if (curVal && response.data.data.length > 0) {
            let item = response.data.data[0];
            let path = item.path;
            this.selected = path
              .split("/")
              .map(val => {
                if (
                  typeof item[this.props.value] === "number" &&
                  !isNaN(Number(val))
                ) {
                  return Number(val);
                }
                return val;
              })
              .filter(t => !!t);
            this.field.model = item;
            this.$emit("field-value-changed", this.field.info.name, this.field);
          }
          if (parentNo && this.options.length > 0) {
            this.options = this.setOptionChild(
              this.options,
              this.props.value,
              parentNo,
              options
            );
          } else {
            this.options = options;
          }
        }
      });
    },
    async setInitValOption() {
      let fieldInfo = this.field.info;
      let arr = this.selected;
      let loader = fieldInfo.dispLoader;
      let options = [];
      if (Array.isArray(arr) && arr.length > 0) {
        for (let index = 0; index < arr.length; index++) {
          const item = arr[index];
          let url = this.getServiceUrl("select", loader.service);
          let params = {
            serviceName: loader.service,
            colNames: ["*"],
            condition: []
          };
          params.condition = [
            {
              colName: loader.parentCol,
              ruleType: "eq",
              value: item
            }
          ];
          let data = [];
          let res = await this.$http.post(url, params);
          if (res.data.state == "SUCCESS") {
            data = res.data.data;
          }
          options = this.setOptionChild(
            this.options,
            this.props.value,
            item,
            data
          );
        }
        this.options = options;
      }
    },
    setOptionChild(options, valCol, parentNo, children) {
      options = options.map(item => {
        if (item[valCol] === parentNo) {
          if (children.length === 0) {
            children = null;
          }
          item.children = children;
        } else if (Array.isArray(item.children) && item.children.length > 0) {
          item.children = this.setOptionChild(
            item.children,
            valCol,
            parentNo,
            children
          );
        }
        return item;
      });
      debugger;
      return options;
    },
    loadOptions() {
      let fieldInfo = this.field.info;
      let conditions = [];
      let loader = fieldInfo.dispLoader;
      conditions = this.buildConditions(loader);

      if (loader.parentCol) {
        let curVal = this.field.getSrvVal();
        return this.treeLazySelect(loader, null, null, curVal);
      } else {
        return this.treeSelect(loader.service, conditions).then(response => {
          if (response && response.data && response.data.data) {
            let options = response.data.data;
            if (this.needRenameLabel()) {
              options.forEach(option => this.renameLable(option));
            }
            this.options = options;
          }
        });
      }
    },

    renameLable(option) {
      if (!option) {
        return;
      }
      option.valuezh = option.value;

      if (option.children && option.children.length > 0) {
        option.children.forEach(child => this.renameLable(child));
      }
    },

    onSelectChange(val) {
      let loader = this.field.info.dispLoader;

      if (this.selected && this.selected.length > 0) {
        this.field.model = this.findSelectedItem();
        // this.selected = this.field.model
      } else {
        this.field.model = null;
      }

      if (loader.parentCol) {
        console.log(val, "onSelectChange");
        this.treeLazySelect(loader, val);
      }

      this.$emit("field-value-changed", this.field.info.name, this.field);
    },
    getPath(val) {
      let option = {};
      if (val) {
        option = this.options.find(item => item[this.props.value] === val);
      }
      if (option && option.path) {
        return option.path;
      }
    },
    findSelectedItem() {
      let valueCol = this.field.info.valueCol;
      let targets = this.options;
      for (let i in this.selected) {
        targets = targets.filter(opt => opt[valueCol] == this.selected[i]);
        if (!targets || targets.length == 0) {
          return null;
        }

        if (i < this.selected.length - 1) {
          targets = targets[0].children;
        }
      }

      if (!targets || targets.length == 0) {
        return null;
      } else {
        return targets[0];
      }
    },

    setSrvVal(srvVal) {
      if (srvVal == null || srvVal == undefined) {
        if (this.selected && this.selected.length > 0) this.selected = [];
        return;
      }
      let fieldInfo = this.field.info;
      let loader = fieldInfo.dispLoader;
      let queryJson = {
        serviceName: loader.service,
        queryMethod: "select",
        colNames: ["*"],
        condition: [
          { colName: fieldInfo.valueCol, value: srvVal, ruleType: "eq" }
        ]
      };
      return this.selectList(queryJson).then(response => {
        if (
          response &&
          response.data &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          let item = response.data.data[0];
          let path = item.path;
          this.selected = path
            .split("/")
            .map(val => {
              if (
                typeof item[this.props.value] === "number" &&
                !isNaN(Number(val))
              ) {
                return Number(val);
              }
              return val;
            })
            .filter(t => !!t);
          this.field.model = item;
          this.$emit("field-value-changed", this.field.info.name, this.field);
          if (this.selected.length > 0 && loader.parentCol) {
            // this.setInitValOption()
          }
        }
      });
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
    getLinkUrl() {
      let data =
        this.field && this.field.form && this.field.form.srvValFormModel();
      if (this.field.info.linkUrlFunc) {
        let url = this.field.info.linkUrlFunc(data, this);
        // 处理url menuapp , 如果用户url 携带 menuapp 不为空 则更新 sessionStorage current_app
        if (url.indexOf("menuapp=") === -1) {
          if (url.indexOf("&") === -1) {
            url = url + "?menuapp=" + sessionStorage.getItem("current_app");
          } else {
            url = url + "&menuapp=" + sessionStorage.getItem("current_app");
          }
        } else {
          let menuapp = "";
          // a.substr(a.indexOf("menuapp=") + 8,a.lastIndexOf("&") - a.indexOf("menuapp=") - 8)
          if (
            url.lastIndexOf("&") !== -1 &&
            url.lastIndexOf("&") > url.indexOf("menuapp=")
          ) {
            menuapp = url.substr(
              url.indexOf("menuapp=") + 8,
              url.lastIndexOf("&") - url.indexOf("menuapp=") - 8
            );
          } else {
            menuapp = url.substr(url.indexOf("menuapp=") + 8, url.length);
          }
          if (menuapp.length > 0) {
            sessionStorage.setItem("current_app", menuapp);
          }
        }
        return url;
      }
    },

    onLinkClicked() {
      let tabTitle =
        (this.field.info.srvCol &&
          this.field.info.srvCol.option_list_v2 &&
          this.field.info.srvCol.option_list_v2.service_label) ||
        "详情";
      this.addTabByUrl(this.getLinkUrl(), tabTitle);
    }
  },

  destroyed: function() {},

  mounted: function() {
    this.loadOptions().then(_ => {
      if (this.selected.length == 0 && this.field.model) {
        let value = this.field.model[this.field.info.valueCol];
        if (value == undefined || value == null) {
          value = this.field.model;
        }
        console.log("tree-finder", this);
        if (this.field.info.dispLoader.parentCol) {
          // this.setInitValOption(value)
        } else {
          this.setSrvVal(value);
        }
      }
    });
  },
  watch: {
    visibleChange: function(newValue, oldValue) {
      if (newValue) {
        this.loadOptions();
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
