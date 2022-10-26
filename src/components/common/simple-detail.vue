/* */
<template>
  <div>
    <template>
      <el-alert v-if="pagePrompt" :closable="false" :type="pagePrompt.type">
        <slot>
          <div v-html="pagePrompt.description">
            {{ pagePrompt.description }}
          </div>
        </slot>
      </el-alert>
    </template>
    <el-row>
      <slot name="form-child-prepend"></slot>
      <el-form
        :model="formModel"
        ref="elform"
        :inline="false"
        label-position="right"
        label-width="10rem"
        label-suffix=":"
        v-if="formLoaded"
      >
        <el-row v-for="(formItems, section) in sections" :key="section">
          <div class="el-col el-col-24 el-col-xl-24">
            <div class="el-form-item" v-if="!!section">
              <span class="section-title">{{ formatSection(section) }}</span>
            </div>
          </div>
          <slot :name="section + '-begin'"></slot>

          <div v-for="formItem in formItems">
            <field-editor
              :field="formItem.field"
              :content-fields="formItem.contentFields"
              :key="formItem.field.info.name"
              @field-value-changed="onFieldValueChanged($event)"
              @field-history-popup="onFieldHistoryPopup($event)"
            >
              <div slot="field-child-prepend" class="padding-bottom">
                <slot
                  :name="formItem.field.info.name + '-child-prepend'"
                ></slot>
              </div>
              <div slot="field-child-append" class="padding-bottom">
                <slot :name="formItem.field.info.name + '-child-append'"></slot>
              </div>
            </field-editor>
            <slot :name="formItem.field.info.name + '-append'"></slot>
          </div>
        </el-row>
      </el-form>
      <slot name="field-form-append"></slot>
      <loader
        ref="loader"
        :service="service_name"
        :isHistory="isHistoryRun"
        :pageIsDraft="pageIsDraft"
        @loader-complete="onLoaderComplete($event)"
      >
      </loader>
    </el-row>

    <el-row>
      <el-card>
        <el-col
          :span="24"
          style="text-align: center;padding:6px;padding-bottom:20px;"
        >
          <action
            v-for="item in actions"
            :info="item"
            :key="item.name"
            :ref="item.name"
            v-show="item.visibleFunc()"
            @action-complete="$emit('action-complete', $event)"
          >
          </action>
        </el-col>
      </el-card>
    </el-row>

    <el-row  v-if="historyData&&historyData.length>0">
      <update-history
        :historyData="historyData"
        :srvCols="srvCols"
        :allFields="allFields"
      ></update-history>
    </el-row>

    <el-dialog
      title="编辑"
      width="90%"
      :close-on-click-modal="1 == 2"
      :visible="activeForm == 'update'"
      append-to-body
      @close="activeForm = 'xx'"
    >
      <simple-update
        name="update-form"
        ref="update-form"
        v-if="activeForm == 'update'"
        :service="updateService"
        :pk="pk"
        :nav-after-submit="false"
        @action-complete="onUpdateFormActionComplete"
      >
      </simple-update>
    </el-dialog>

    <el-dialog
      append-to-body
      :visible="!!fieldHisotryPopup"
      title="历史版本"
      width="90%"
      :close-on-click-modal="1 == 2"
      @close="fieldHisotryPopup = false"
    >
      <el-table
        :data="fieldWithHistory && fieldWithHistory.historyData"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column label="值">
          <template slot-scope="scope">
            <div
              v-show="isXhtml"
              style="border-radius: 4px;min-height:300px; border:1px solid #dcdfe6; overflow: auto"
              v-html="scope.row"
            ></div>
            <span v-show="!isXhtml">
              {{ scope.row }}
            </span>
          </template>
        </el-table-column>
        <el-table-column width="160" prop="remark" label="说明">
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import FieldEditor from "./field-editor.vue";
import FormMixin from "../mixin/form-mixin";
import FormValidateMixin from "../mixin/form-validate-mixin";
import Loader from "./loader.vue";
import Action from "./action.vue";
import { ActionInfo } from "../model/ActionInfo";
import Vue from "vue";
import SimpleUpdate from "./simple-update.vue";
import CustButtonMinx from "../mixin/cust-button-minx";
import { hotTableMetadata } from "../model/Field";
import updateHistory from "../ui/update-history.vue";
export default {
  name: "simple-detail",
  components: {
    SimpleUpdate,
    FieldEditor,
    action: Action,
    loader: Loader,
    updateHistory,
  },
  mixins: [FormMixin, CustButtonMinx, FormValidateMixin],
  props: {
    formType: {
      type: String,
      default: "detail",
    },

    pkCol: {
      type: String,
    },

    pk: {
      type: [String,Number],
    },
    childrenLists: {
      type: null,
    },
  },
  computed: {
    srvValFormModeldetail() {
      let model = {};

      for (let key in this.fields) {
        let field = this.fields[key];
        if (field.info.srvCol.in_detail != 0 || field.info.name == "id") {
          model[key] = field.getSrvVal();
        }
      }
      return model;
    },
  },

  data() {
    return {
      service_name: this.service || this.$route.params.service_name,
      activeForm: null,
      updateService: null,
      isXhtml: false,
      refreshService: null,
    };
  },

  methods: {
    createExecutorValueEnableFunc(colName) {
      return (value) => {
        try {
          let rawRow = this.$refs.loader.lastValidResp[0];
          let isDiff = rawRow[colName] != value.value;
          return isDiff;
        } catch (e) {
          return true;
        }
      };
    },

    confLoader() {
      let loader = this.$refs.loader;
      loader.colNames = [];
      for (let key in this.fields) {
        loader.colNames.push(this.fields[key].info.name);
      }

      // loader.conditions = this.buildConditions();
    },
    addNav2refreshAction(button) {
      let nav = new ActionInfo();
      Vue.set(this.actions, "nav2refresh", nav);

      this.refreshService = button.service_name;
      nav.name = "nav2refresh";
      nav.label = button.button_name;
      nav.invokeFunc = (_) => {
        let loader = this.$refs.loader;
        return loader.run();
      };
      return nav;
    },

    addNav2UpdateAction(button) {
      let nav = new ActionInfo();
      Vue.set(this.actions, "nav2update", nav);

      this.updateService = button.service_name;
      nav.name = "nav2update";
      nav.label = "编辑";
      nav.invokeFunc = (_) => {
        this.activeForm = "update";
      };

      return nav;
    },
    onUpdateFormActionComplete(event) {
      // debugger
      if (event === "reset") {
      } else {
        this.activeForm = null;
        this.$refs.loader.run();
      }
    },
  },

  mounted() {
    this.createFields((srvCol) => srvCol.in_detail != 0)
      .then((response) => {
        if (response.data.encryptedCols) {
          this.encryptedCols = response.data.encryptedCols;
        }

        let fields = this.fields;
        for (let fieldName in fields) {
          let field = fields[fieldName];
          field.info.readonly = true;
          field.info.editable = false;

          if (
            field.info.srvCol.in_detail != 1 ||
            field.info.srvCol.in_detail === 2
          ) {
            field.info.visible = false;
          }

          let type = field.info.type;
          if (hotTableMetadata[type]) {
            this.loadHotTableData(hotTableMetadata[type]);
          }
        }

        if (response && response.data && response.data.formButton) {
          let formButtons = response.data.formButton;
          this.createActions(formButtons);
        }

        this.confLoader();

        this.emitEvent("metadata-loaded", this);
      })
      .then(() => {
        // init load and watch conditions
        let loader = this.$refs.loader;
        let condition = [];
        if (this.pk && this.pkCol) {
          condition.push({
            colName: this.pkCol,
            ruleType: "eq",
            valueExpr: this.pk,
            literalValue: true,
          });
        }
        if (
          Array.isArray(this.defaultConditions) &&
          this.defaultConditions.length > 0
        ) {
          condition = this.defaultConditions.map((item) => {
            item.valueExpr = item.value;
            item.literalValue = true;
            return item;
          });
        }

        return loader.run(condition);
      })
      .then(() => {
        this.formLoaded = true;
        this.$emit("form-loaded", this);
        this.$emit("detail-form-loaded", this);
      });
  },
};
</script>

<style scoped>
.el-form-item__content {
  line-height: initial;
  line-height: unset;
}
</style>
