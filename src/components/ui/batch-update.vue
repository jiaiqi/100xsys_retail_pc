<template>
  <div>
    <el-form ref="form" label-width="120px" :rules="rules">
      <el-form-item label="批量修改选项" prop="options">
        <el-select v-model="curField" placeholder="请选择">
          <el-option
            v-for="item in setAllFields"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="批量修改值" prop="updatedValue" v-if="curField">
        <raw-field-editor
          ref="inner"
          :field="curFieldInfo"
          @field-value-changed="changeValue"
          v-show="curFieldInfo.info.bodyVisible"
        >
        </raw-field-editor>
      </el-form-item>
    </el-form>
    <div class="form-button">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button type="primary" @click="confirm()">确定</el-button>
    </div>
  </div>
</template>

<script>
import FormMixin from "@/components/mixin/form-mixin";
import FieldRedundantMixin from "@/components/mixin/field-redundant-mixin";
import FormValidateMixin from "@/components/mixin/form-validate-mixin";
import RawFieldEditor from "@/components/common/raw-field-editor.vue";

/**
 * @description 批量编辑
 */
export default {
  name: "batch-update",
  components: {
    RawFieldEditor,
  },
  mixins: [FormMixin, FieldRedundantMixin, FormValidateMixin],
  data() {
    return {
      v2Data: null,
      curField: null,
      updatedValue: "",
      rules: {
        // options: [
        //   { required: true, message: "请选择修改选项", trigger: "blur" },
        // ],
        // updatedValue: [{ required: true, message: "请输入修改的值", trigger: "blur" }],
      },
    };
  },
  props: {
    multipleSelection: {
      type: Array,
    },
    formType: {
      type: String,
      default: "update",
    },
    appNo: {
      type: String,
      default: "retail",
    },
    service: {
      type: String,
    },
  },
  computed: {
    curFieldInfo() {
      return this.allFields[this.curField];
    },
    service_name() {
      return this.service || this.$route.query.service_name;
    },
    setAllFields() {
      let res = [];
      if (
        typeof this.allFields === "object" &&
        Object.keys(this.allFields).length > 0
      ) {
        Object.keys(this.allFields).forEach((key) => {
          if (
            this.allFields[key].info.bodyVisible &&
            this.allFields[key].info.editable
          ) {
            res.push({
              label: this.allFields[key].info.label,
              value: this.allFields[key].info.name,
              field: this.allFields[key],
            });
          }
        });
      }
      return res;
    },
  },
  created() {
    if (this.service) {
      this.init();
    }
  },
  methods: {
    confirm() {
      if (!this.curField) {
        this.$message({
          type: "info",
          message: "请先选择要修改的选项",
        });
        return;
      }
      this.$confirm("此操作将批量修改选中数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          var url = this.getServiceUrl("operate", this.service, "retail");
          let requests = this.multipleSelection.map((item) => {
            return {
              serviceName: this.service,
              condition: [{ colName: "id", ruleType: "eq", value: item.id }],
              data: [{ [this.curField]: this.updatedValue }],
            };
          });

          this.$http.post(url, requests).then((res) => {
            if (res.data.state === "SUCCESS") {
              this.$emit("success",'submit');

              this.$message({
                type: "success",
                message: "修改成功!",
              });
            }
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消修改",
          });
        });
    },
    changeValue(name, field) {
      console.log(name, field);
      this.updatedValue = field.getSrvVal();
    },
    addSubmitAction() {},
    async init() {
      this.createFields(
        (srvCol) => srvCol.in_update != 0 || srvCol.in_detail != 0,
        null,
        this.appNo
      )
        .then((response) => {
          for (let fieldName in this.fields) {
            let field = this.fields[fieldName];
            let infoObj = new Object();
            infoObj = field.info;
            if (field.info.srvCol.in_update != 1) {
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
                if (
                  infoObj.hasOwnProperty("_DateRangeEndColName") &&
                  infoObj._DateRangeEndColName !== ""
                ) {
                  field["_DateRangeModel"] = [];
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
              if (this.draftConfig !== null) {
                this.createActions(formButtons);
              } else {
                formButtons = formButtons.filter((item) => {
                  if (item.hasOwnProperty("more_config")) {
                    let btnCfg =
                      item.more_config !== null
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
          }

          this.confLoader();
        })
        .then((_) => {
          this.emitEvent("metadata-loaded", this);

          if (this.initLoad) {
            let loader = this.$refs.loader;
            return loader.run().then((_) => {
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
                let field = this.fields[key];
                let infoObj = field.info;
                if (infoObj.editor === "DateRange") {
                  if (
                    infoObj.hasOwnProperty("_DateRangeEndColName") &&
                    infoObj._DateRangeEndColName !== "" &&
                    infoObj._DateRangeEndColName !== null
                  ) {
                    field["_DateRangeModel"] = [];
                    field["_DateRangeModel"][0] = this.overrideData[key];
                    field["_DateRangeModel"][1] = this.overrideData[
                      infoObj._DateRangeEndColName
                    ];
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
                fi.visible = "false";
                dummy.model = this.overrideData[key];
                Vue.set(this.fields, key, dummy);
              }
            }
          }

          this.emitEvent("data-loaded", this);
          this.formLoaded = true;
        })
        .then(() => {
          this.$emit("form-loaded", this);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .el-select {
  width: 100%;
}
.form-button {
  text-align: right;
}
</style>
