/* */
<template>
  <div class="raw_field_editor" @blur="onBlur">
    <el-row>
      <el-col
        :span="field.hasHistoryData() || field.getUniqueCheck() ? 22 : 24"
      >
        <!--主体内容-->

        <template>
          <div v-if="ifUseRawFieldEditor()" class="field-editor-container">
            <div class="input-container">
              <bx-input-number
                v-if="field.info.editor === 'input-number'"
                controls-position="right"
                v-model="field.model"
                :disabled="getDisabled"
                :min="field.info.getMin()"
                :max="field.info.getMax()"
                label="描述文字"
                :fieldMoreConfig="field.info"
                @change="$emit('field-value-changed', field.info.name, field)"
                @blur="onBlur"
              >
              </bx-input-number>
              <el-input
                v-else-if="field.info.editor === 'textarea'"
                type="textarea"
                :rows="5"
                :placeholder="field.info.placeholder"
                :disabled="getDisabled"
                show-word-limit
                :minlength="field.info.getMinLength()"
                :maxlength="field.info.getMaxLength()"
                v-model="field.model"
                @change="$emit('field-value-changed', field.info.name, field)"
                @blur="onBlur"
                style="min-height:80px;"
              >
              </el-input>
              <el-switch
                v-else-if="field.info.editor === 'switch'"
                v-model="field.model"
                active-color="#13ce66"
                inactive-color="#777777"
              >
              </el-switch>

              <el-radio-group
                v-else-if="
                  field.info.moreConfig &&
                    field.info.moreConfig.subtype === 'radioGroup' &&
                    field.info.editor === 'select'
                "
                v-model="field.model"
                :disabled="getDisabled"
                @change="$emit('field-value-changed', field.info.name, field)"
              >
                <el-radio
                  v-for="item in field.optionsFunc()"
                  :key="item.value"
                  :label="item.value"
                  >{{ item.label }}</el-radio
                >
              </el-radio-group>

              <el-select
                v-else-if="field.info.editor === 'select'"
                v-model="field.model"
                :placeholder="field.info.placeholder"
                clearable
                :disabled="getDisabled"
                @change="$emit('field-value-changed', field.info.name, field)"
                @blur="onBlur"
              >
                <el-option
                  v-for="item in field.optionsFunc()"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>

              <userlist
                v-else-if="field.info.editor === 'userlist'"
                :field="field"
                ref="editor"
                @field-value-changed="
                  $emit('field-value-changed', field.info.name, field)
                "
              >
              </userlist>

              <ueditorPlus
                :field="field"
                ref="snote"
                v-else-if="field.info.editor == 'snote'"
                @field-changed="
                  $emit('field-value-changed', field.info.name, field)
                "
              >
              </ueditorPlus>

              <ueditor
                v-else-if="field.info.editor === 'ueditor'"
                :field="field"
                @field-changed="
                  $emit('field-value-changed', field.info.name, field)
                "
                ref="editor"
              >
              </ueditor>

              <!-- temporal -->
              <el-date-picker
                v-else-if="
                  field.info.editor === 'date-picker' &&
                    field.model !== '******'
                "
                v-model="field.model"
                :type="field.info.subtype"
                clearable
                :format="
                  field.info.subtype == 'year'
                    ? 'yyyy'
                    : field.info.subtype == 'month'
                    ? 'MM'
                    : field.info.subtype == 'date'
                    ? 'yyyy 年 MM 月 dd 日'
                    : 'yyyy 年 MM 月 dd 日'
                "
                :disabled="getDisabled"
                :placeholder="field.info.placeholder"
                :picker-options="pickerOptions"
                @change="$emit('field-value-changed', field.info.name, field)"
              >
              </el-date-picker>

              <el-date-picker
                v-else-if="
                  field.info.editor === 'date-time-picker' &&
                    field.model !== '******'
                "
                v-model="field.model"
                type="datetime"
                clearable
                :format="field.info.format ? field.info.format : null"
                :value-format="field.info.format ? field.info.format : null"
                :disabled="getDisabled"
                :placeholder="
                  field.model !== '******'
                    ? field.info.placeholder
                    : field.model
                "
                @change="$emit('field-value-changed', field.info.name, field)"
                @blur="onBlur"
              >
              </el-date-picker>

              <el-time-picker
                v-else-if="
                  field.info.editor === 'time-picker' &&
                    field.model !== '******'
                "
                :picker-options="{ format: 'HH:mm' }"
                value-format="HH:mm"
                v-model="field.model"
                clearable
                :disabled="getDisabled"
                :placeholder="field.info.placeholder"
                @change="$emit('field-value-changed', field.info.name, field)"
                @blur="onBlur"
              >
              </el-time-picker>

              <el-checkbox-group
                v-model="field.model"
                v-else-if="
                  field.info.moreConfig &&
                    field.info.moreConfig.subtype === 'checkboxGroup' &&
                    field.info.editor === 'multiselect'
                "
                :disabled="getDisabled"
                @change="$emit('field-value-changed', field.info.name, field)"
              >
                <el-checkbox
                  v-for="item in field.optionsFunc()"
                  :label="item.value"
                  :key="item.value"
                  >{{ item.label }}</el-checkbox
                >
              </el-checkbox-group>

              <el-select
                v-else-if="field.info.editor === 'multiselect'"
                v-model="field.model"
                multiple
                collapse-tags
                clearable
                :disabled="getDisabled"
                :placeholder="field.info.placeholder"
                @change="$emit('field-value-changed', field.info.name, field)"
              >
                <el-option
                  v-for="item in field.optionsFunc()"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>

              <!-- range -->
              <el-date-picker
                v-else-if="field.info.editor === 'date-range'"
                v-model="field.model"
                type="daterange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                clearable
                :disabled="getDisabled"
                :placeholder="field.info.placeholder"
                @change="$emit('field-value-changed', field.info.name, field)"
                @blur="onBlur"
              >
              </el-date-picker>
              <!-- DateRange -->
              <el-date-picker
                v-else-if="
                  field.info.editor === 'DateRange' &&
                    field.info._DateRangeEndColName
                "
                v-show="field.info._DateRangeEndColName"
                v-model="field['_DateRangeModel']"
                type="daterange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                clearable
                :picker-options="pickerOptions"
                format="yyyy 年 MM 月 dd 日"
                value-format="yyyy-MM-dd"
                :disabled="getDisabled"
                :placeholder="field.info.placeholder"
                @blur="$emit('field-value-changed', field.info.name, field)"
              >
              </el-date-picker>
              <!-- DateRange 只读-->
              <el-input
                v-else-if="
                  field.info.editor === 'DateRange' &&
                    !field.info._DateRangeEndColName
                "
                readonly
                :type="field.info.editor === 'Password' ? 'password' : 'text'"
                v-show="!field.info._DateRangeEndColName"
                :value="field.getDispVal4Read()"
              >
              </el-input>
              <el-time-picker
                v-else-if="field.info.editor === 'time-range'"
                is-range
                v-model="field.model"
                :picker-options="{ format: 'HH:mm' }"
                value-format="HH:mm"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                clearable
                :disabled="getDisabled"
                :placeholder="field.info.placeholder"
                @change="$emit('field-value-changed', field.info.name, field)"
              >
              </el-time-picker>

              <el-date-picker
                v-else-if="field.info.editor === 'date-time-range'"
                v-model="field.model"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                clearable
                :disabled="getDisabled"
                :placeholder="field.info.placeholder"
                @change="$emit('field-value-changed', field.info.name, field)"
              >
              </el-date-picker>

              <input-range
                v-else-if="field.info.editor === 'input-range'"
                :field="field"
                @field-value-changed="
                  $emit('field-value-changed', field.info.name, field)
                "
              >
              </input-range>

              <upload-file
                v-else-if="field.info.editor === 'upload-file'"
                :field="field"
                @more-info="getMoreInfo($event)"
                ref="editor"
              >
              </upload-file>

              <upload-image
                v-else-if="field.info.editor === 'upload-image'"
                :field="field"
                ref="editor"
              >
              </upload-image>
<!-- 
              <goods-selector
                v-else-if="
                  field.info.editor === 'finder' &&
                    field.info.moreConfig &&
                    field.info.moreConfig.subtype === 'goodsSelector'
                "
                :field="field"
                @field-value-changed="
                  $emit('field-value-changed', field.info.name, field)
                "
                v-model="field.model"
                @blur="onBlur"
              ></goods-selector> -->
              <finder
                v-else-if="field.info.editor === 'finder'"
                :field="field"
                v-model="field.finderSelected"
                :defaultCondition="defaultCondition"
                :defaultValues="defaultValues"
                :childForeignkey="childForeignkey"
                :mainformDatas="mainformDatas"
                :$srv-app="
                  field.info.srvCol.option_list_v2 &&
                    field.info.srvCol.option_list_v2.srv_app
                "
                ref="editor"
                @field-value-changed="
                  $emit('field-value-changed', field.info.name, field)
                "
                @blur="onBlur"
              >
              </finder>

              <multiFinder
                v-else-if="field.info.editor === 'multifinder'"
                :field="field"
                :$srv-app="
                  field.info.srvCol.option_list_v2 &&
                    field.info.srvCol.option_list_v2.srv_app
                "
                ref="editor"
                @field-value-changed="
                  $emit('field-value-changed', field.info.name, field)
                "
                @blur="onBlur"
              >
              </multiFinder>
              <tree-finder
                v-else-if="field.info.editor === 'tree-finder'"
                ref="editor"
                :field="field"
                :$srv-app="field.info.srvCol.option_list_v2.srv_app"
                @field-value-changed="
                  $emit('field-value-changed', field.info.name, field)
                "
              >
              </tree-finder>

              <qr-code
                v-else-if="field.info.editor === 'qrcode'"
                ref="editor"
                :field="field"
              >
              </qr-code>

              <code-editor
                v-else-if="field.info.editor === 'code-editor'"
                ref="editor"
                :field="field"
                :lang="field.info.lang"
              >
              </code-editor>

              <radio
                v-else-if="field.info.editor === 'radio'"
                ref="editor"
                :field="field"
                @field-value-changed="
                  $emit('field-value-changed', field.info.name, field)
                "
              >
              </radio>

              <checkbox
                v-else-if="field.info.editor === 'checkbox'"
                ref="editor"
                :field="field"
                @field-value-changed="
                  $emit('field-value-changed', field.info.name, field)
                "
              >
              </checkbox>
              <el-input
                v-else-if="field.info.editor === 'Password'"
                v-model="field.model"
                :placeholder="field.info.placeholder"
                :disabled="getDisabled"
                clearable
                type="password"
                show-word-limit
                :maxlength="field.info.getMaxLength()"
                @change="$emit('field-value-changed', field.info.name, field)"
                @blur="onBlur"
              >
                <template
                  slot="append"
                  v-if="
                    field.info.moreConfig && field.info.moreConfig.appendText
                  "
                  >{{ field.info.moreConfig.appendText }}</template
                >
                <template
                  slot="prepend"
                  v-if="
                    field.info.moreConfig && field.info.moreConfig.prependText
                  "
                  >{{ field.info.moreConfig.prependText }}</template
                >
              </el-input>

              <div v-else-if="field.info.editor == 'extend'">
                <dynamicSubTemp
                  ref="dynSub"
                  :config="field.info.moreConfig"
                  :field="field"
                  :form="field.form"
                ></dynamicSubTemp>
              </div>
              <!-- default -->

              <el-input
                v-else
                :prefix-icon="
                  field.info.moreConfig && field.info.moreConfig.prefixIcon
                    ? field.info.moreConfig.prefixIcon
                    : ''
                "
                :suffix-icon="
                  field.info.moreConfig && field.info.moreConfig.suffixIcon
                    ? field.info.moreConfig.suffixIcon
                    : ''
                "
                v-model="field.model"
                :placeholder="field.info.placeholder"
                :disabled="getDisabled"
                clearable
                show-word-limit
                :maxlength="field.info.getMaxLength()"
                @change="$emit('field-value-changed', field.info.name, field)"
                @blur="onBlur"
              >
                <template
                  slot="append"
                  v-if="
                    field.info.moreConfig && field.info.moreConfig.appendText
                  "
                  >{{ field.info.moreConfig.appendText }}</template
                >
                <template
                  slot="prepend"
                  v-if="
                    field.info.moreConfig && field.info.moreConfig.prependText
                  "
                  >{{ field.info.moreConfig.prependText }}</template
                >
              </el-input>
            </div>
            <el-button
              class="custom-button"
              size="small"
              type="primary"
              v-if="
                !getDisabled &&
                  field.info.moreConfig &&
                  field.info.moreConfig.rightBtn
              "
              @click="handlerCustomButton(field.info.moreConfig.rightBtn)"
            >
              {{ field.info.moreConfig.rightBtn.label }}
            </el-button>
          </div>
          <div
            v-else-if="field.info.editor == 'textarea'"
            v-show="field.info.bodyVisible"
            style="border-radius: 4px; border:1px solid #dcdfe6; overflow: auto;white-space: pre-wrap;word-break: break-all;padding:0 15px"
          >
            {{ field.getDispVal() }}
          </div>
          <div v-else-if="field.info.editor == 'extend'">
            <dynamicSubTemp
              ref="dynSub"
              :config="field.info.moreConfig"
              :field="field"
              :form="field.form"
            ></dynamicSubTemp>
          </div>
          <template v-else>
            <div class="input-container">
              <!--只读编辑器-->
              <a
                v-if="field.info.linkUrlFunc"
                v-show="field.getSrvVal()"
                style="white-space: normal; color: dodgerblue; cursor: pointer;"
                @click="onLinkClicked()"
              >
                {{ field.getDispVal4Read() }}
              </a>

              <el-input
                v-else
                readonly
                :type="field.info.editor === 'Password' ? 'password' : 'text'"
                v-show="field.info.bodyVisible"
                :disabled="getDisabled"
                :value="field.getDispVal4Read()"
              >
                <template
                  slot="append"
                  v-if="
                    field.info.moreConfig && field.info.moreConfig.appendText
                  "
                  >{{ field.info.moreConfig.appendText }}</template
                >
                <template
                  slot="prepend"
                  v-if="
                    field.info.moreConfig && field.info.moreConfig.prependText
                  "
                  >{{ field.info.moreConfig.prependText }}</template
                >
              </el-input>
            </div>
          </template>
        </template>
      </el-col>
      <!-- <el-col :span="2">
          <i class="el-icon-warning"></i>
        </el-col> -->
      <el-col
        style="text-align:center"
        v-show="field.getUniqueCheck()"
        :span="2"
      >
        <el-tooltip
          :content="
            field.getUniqueCheckMsg().msg ? field.getUniqueCheckMsg().msg : ''
          "
          placement="top"
        >
          <!-- UniqueCheckNone 未校验  UniqueCheckError 错误 UniqueCheckOk 通过 loading 校验中 -->
          <i
            v-if="field.getUniqueCheckMsg().state === 'UniqueCheckNone'"
            style="color:orange"
            class="el-icon-question"
          ></i>
          <i
            v-if="field.getUniqueCheckMsg().state === 'loading'"
            style="color:orange"
            class="el-icon-loading"
          ></i>
          <i
            v-if="field.getUniqueCheckMsg().state === 'UniqueCheckError'"
            style="color:red"
            class="el-icon-error"
          ></i>
          <i
            v-if="field.getUniqueCheckMsg().state === 'UniqueCheckOk'"
            style="color:green"
            class="el-icon-success"
          ></i>
        </el-tooltip>
      </el-col>
      <!-- //v-show="field.hasHistoryData()" -->
      <el-col v-show="field.hasHistoryData()" :span="2">
        <!--显示历史数据按钮-->
        <div>
          <el-button
            @click="$emit('field-history-popup', field)"
            icon="el-icon-notebook-2"
          ></el-button>
        </div>
      </el-col>
    </el-row>
    <el-row slot="error" scope="error">
      <el-col style="display: flex;">
        <!-- 显示字段校验错误信息 -->
        <div
          class="el-form-item__error"
          v-show="field.hasValidateError() || field.hasValidatePrompt()"
          :title="field.getAnyValidatePrompt()"
        >
          <!-- v-show="field.hasValidateError() || field.hasValidatePrompt()" -->
          <el-popover
            placement="bottom"
            width="200"
            v-show="field.hasValidateError() || field.hasValidatePrompt()"
            trigger="hover"
            :content="
              field.getAnyValidateError()
                ? field.getAnyValidatePrompt()
                  ? field.getAnyValidateError() + field.getAnyValidatePrompt()
                  : field.getAnyValidateError()
                : field.getAnyValidatePrompt()
                ? field.getAnyValidatePrompt()
                : ''
            "
          >
            <i slot="reference" class="el-icon-warning"></i>
          </el-popover>
          <span class="no-nowrap" v-show="field.hasValidateError()">
            <!-- v-show="field.hasValidateError()" -->
            {{ field.getAnyValidateError() }}
            {{
              field.getAnyValidateError() && field.getAnyValidatePrompt()
                ? ";"
                : ""
            }}
          </span>
          <!-- 显示字段校验提示信息 -->
          <span
            class="el-form-item__prompt no-nowrap"
            v-show="field.hasValidatePrompt()"
          >
            <!-- v-show=" field.hasValidatePrompt()" -->
            {{ field.getAnyValidatePrompt() }}
          </span>
        </div>
        <div
          v-if="
            !getDisabled &&
              field.info.moreConfig !== null &&
              getShowHelpTips(field.info)
          "
          :title="
            field.info.moreConfig && field.info.moreConfig.help_tips
              ? field.info.moreConfig.help_tips
              : ''
          "
          class="help-tips"
        >
          <!-- v-if="(!getDisabled && field.info.moreConfig !== null) && getShowHelpTips(field.info)" -->
          <el-popover
            placement="bottom"
            width="200"
            trigger="hover"
            :content="
              field.info.moreConfig && field.info.moreConfig.help_tips
                ? field.info.moreConfig.help_tips
                : ''
            "
          >
            <i
              slot="reference"
              class="el-icon-question"
              style="color:#03a2ff;font-size:12px"
            ></i>
          </el-popover>
          <span
            v-show="field.info.moreConfig && field.info.moreConfig.help_tips"
            style="color:#03a2ff;font-size:12px"
          >
            {{
              field.info.moreConfig && field.info.moreConfig.help_tips
                ? field.info.moreConfig.help_tips
                : ""
            }}</span
          >
          <!-- --- -->
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import InputRange from "@/components/ui/input-range.vue";
import Finder from "@/components/ui/finder.vue";
import multiFinder from "@/components/ui/multi-finder.vue";
import UEditor from "@/components/ui/ueditor.vue";
// import UploadFile from "@/components/ui/upload-file.vue";
import UploadImage from "@/components/ui/upload-image.vue";
import TreeFinder from "@/components/ui/tree-finder.vue";
import BxInputNumber from "@/components/ui/bx-input-number.vue";
import Userlist from "@/components/ui/userlist.vue";
import QrCode from "@/components/ui/qrcode.vue";
import CodeEditor from "@/components/ui/code-editor.vue";
import Radio from "@/components/ui/radio.vue";
import Checkbox from "@/components/ui/checkbox.vue";
import ueditorPlus from "@/components/ui/ueditor-plus.vue";
import dynamicSubTemp from "@/components/ui/dynamic-sub-temp.vue"; // 动态子组件
import goodsSelector from "./goods-selector.vue";
export default {
  components: {
    Checkbox,
    Radio,
    CodeEditor,
    Userlist,
    BxInputNumber,
    TreeFinder,
    UploadImage,
    // UploadFile,
    UploadFile: () => import("@/components/ui/upload-file.vue"), //异步组件加载方式,
    InputRange,
    Finder,
    ueditorPlus,
    ueditor: UEditor,
    QrCode,
    multiFinder,
    dynamicSubTemp,
    goodsSelector,
  },

  props: {
    field: Object,
    childForeignkey: {
      type: Object,
    },
    defaultCondition: {
      typeof: Array,
    },
    mainformDatas: {
      type: Object,
    },
    defaultValues: {
      type: Object,
    },
  },
  watch: {},

  data() {
    return {
      key: null,
      finderSelected: "",
      pickerOptions: {
        disabledDate: (time) => {
          return this.field.info.subtype === "year"
            ? this.dealDisabledDate(new Date(time).getFullYear().toString())
            : this.dealDisabledDate(time);
        },
      },
    };
  },
  computed: {
    getDisabled: function() {
      return !this.field.evalEditable();
    },
  },

  created: function() {
    this.field.editor = this;
  },

  mounted: function() {},

  methods: {
    handlerCustomButton(btn) {
      // 处理moreConfig中配置的自定义按钮
      if (btn.type == "function" && btn.function) {
        // 函数类型 直接修改当前字段的值
        const fun = eval(btn.function);
        const value = fun();
        if (typeof value === "string" || typeof value === "number") {
          this.field.model = value;
          this.$emit("field-value-changed", this.field.info.name, this.field);
        }
      } else {
        this.$emit("on-custom-button", btn, this.field);
      }
    },
    getShowHelpTips(e) {
      if (e.moreConfig && e.moreConfig.hasOwnProperty("help_tips")) {
        return true;
      } else {
        return false;
      }
    },
    onBlur() {
      // 校验唯一性
      let self = this;
      let isUniqueCheck = this.field.info.isUniqueCheck;
      let config = this.field.info.moreConfig;
      let model = this.field.form.srvValFormModel();

      if (
        config &&
        config.hasOwnProperty("uniqueCheck") &&
        isUniqueCheck.state !== "none" &&
        this.field.model !== null &&
        this.field.model !== ""
      ) {
        let cfg = config.uniqueCheck;
        isUniqueCheck.state = "loading";
        self.isUniqueCheck(cfg, model).then((res) => {
          if (res.data.state == "SUCCESS" && res.data.data.length === 0) {
            isUniqueCheck.state = "UniqueCheckOk";
            isUniqueCheck.msg = "可用";
          } else {
            self.field.model = "";
            isUniqueCheck.state = "UniqueCheckError";
            isUniqueCheck.msg = cfg && cfg.errorText ? cfg.errorText : "";
          }
        });
      } else if (
        config &&
        this.field.model !== null &&
        this.field.model !== ""
      ) {
        let cfg = config.uniqueCheck;
        isUniqueCheck.state = "UniqueCheckError";
        isUniqueCheck.msg = cfg && cfg.errorText ? cfg.errorText : "";
      }
      // 校验唯一性结束
      // this.$emit('blur', this.field)
      // this.field.form && this.field.form.handleValidation && this.field.form.handleValidation(this.field.info.name)
    },

    /**
     * 是否使用控件而非简单html snippet
     * @returns {boolean}
     */
    ifUseRawFieldEditor() {
      let readonlySupportEditors = new Set([
        "upload-file",
        "upload-image",
        "ueditor",
        "snote",
        "qrcode",
        "finder",
        "tree-finder",
        "multifinder",
      ]);
      let linkSupportEditors = new Set(["finder", "tree-finder"]); //
      let editorSupportReadonly = readonlySupportEditors.has(
        this.field.info.editor
      );
      let editorSupportLink = linkSupportEditors.has(this.field.info.editor);

      if (this.field.info.readonly) {
        return editorSupportReadonly;
      } else {
        if (this.field.info.editable) {
          return true;
        } else {
          // editable = false
          let hasNoLinkUrlFunc = !this.field.info.linkUrlFunc;
          let readonlyUnsupportEditors = new Set(["input-number"]);
          let editorSupportReadonly = !readonlyUnsupportEditors.has(
            this.field.info.editor
          );
          return (
            (hasNoLinkUrlFunc || editorSupportLink) && editorSupportReadonly
          );
        }
      }
    },

    getLinkUrl() {
      let data =
        this.field && this.field.form && this.field.form.srvValFormModel();
      if (this.field.info.linkUrlFunc) {
        let url = this.field.info.linkUrlFunc(data, this);
        // 处理url menuapp , 如果用户url 携带 menuapp 不为空 则更新 sessionStorage current_app
        if (url.indexOf("menuapp=") === -1) {
          if (url.indexOf("?") === -1) {
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
      // this.addTabByUrl(this.getLinkUrl(), tabTitle)

      let linkUrl = this.getLinkUrl();
      // linkUrl = linkUrl + '&openlayer=true'
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
    getMoreInfo(e) {
      this.field.moreInfo = e || null;
      console.log("self", e);
    },
    setSrvVal(srvVal) {
      if (this.isSpecial()) {
        this.$refs.editor.setSrvVal(srvVal);
      }
    },

    getSrvVal() {
      if (this.isSpecial()) {
        return this.$refs.editor.getSrvVal();
      }
    },

    isSpecial() {
      return this.$refs.editor && !!this.$refs.editor.setSrvVal;
    },
    dealDisabledDate(time) {
      // 一天的毫秒数 = 8.64e7  判断时在return处可进行加减
      let fi = this.field.info;
      let min = null;
      let max = null;
      let rangMax = "2050-12-30";
      let rangMin = "1980-12-30";

      if (
        new Date(rangMax).getFullYear() >= new Date(time).getFullYear() &&
        new Date(time).getFullYear() >= new Date(rangMin).getFullYear()
      ) {
        if (this.field.info.editor === "DateRange") {
          if (
            fi._DateMaxMin.hasOwnProperty("min") &&
            fi._DateMaxMin.hasOwnProperty("max")
          ) {
            min =
              fi._DateMaxMin.min === "" ||
              fi._DateMaxMin.min === null ||
              fi._DateMaxMin.min === undefined
                ? "1980-01-01"
                : new Date(fi._DateMaxMin.min).getTime();
            max =
              fi._DateMaxMin.max === "" ||
              fi._DateMaxMin.max === null ||
              fi._DateMaxMin.max === undefined
                ? "2050-12-30"
                : new Date(fi._DateMaxMin.max).getTime();
            return !(time.getTime() < max && time.getTime() > min);
          } else {
            return true;
          }
        } else if (this.field.info.editor === "date-picker") {
          if (this.field.info.subtype === "year") {
            if (fi.moreConfig.hasOwnProperty("maxMin")) {
              min =
                fi.moreConfig.maxMin.minDate === "" ||
                fi.moreConfig.maxMin.minDate === null ||
                fi.moreConfig.maxMin.minDate === undefined
                  ? "1970"
                  : fi.moreConfig.maxMin.minDate;
              max =
                fi.moreConfig.maxMin.maxDate === "" ||
                fi.moreConfig.maxMin.maxDate === null ||
                fi.moreConfig.maxMin.maxDate === undefined
                  ? "2099"
                  : fi.moreConfig.maxMin.maxDate;
              if (min.indexOf("{") !== -1 && min.indexOf("}") !== -1) {
                // min = min.match(/{(\S*)}/)[1]
                min = min.substring(min.indexOf("{") + 1, min.indexOf("}"));
                min = eval(min);
              }
              if (max.indexOf("{") !== -1 && max.indexOf("}") !== -1) {
                // max = max.match(/{(\S*)}/)[1]
                max = max.substring(max.indexOf("{") + 1, max.indexOf("}"));
                max = eval(max);
              }

              return !(
                new Date(time).getFullYear() <= max &&
                new Date(time).getFullYear() >= min
              );
            } else {
              return true;
            }
          }
        }
      } else {
        return false;
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.help-tips {
  color: #c0c4cc;
  /* position:absolute; */
  top: 18px;
  line-height: 1rem;
  white-space: nowrap; /*保证文本内容不会自动换行，如果多余的内容会在水平方向撑破单元格*/
  overflow: hidden; /*隐藏超出单元格的部分*/
  text-overflow: ellipsis; /*将被隐藏的那部分用省略号代替*/
}
.el-input__suffix {
  line-height: initial;
}

.el-select {
  width: 100%;
}

.el-date-editor {
  width: 100%;
  max-width: initial !important;
}

.el-input-number {
  width: 100%;
  max-width: initial !important;
}

.el-cascader {
  width: 100%;
}

.raw_field_editor {
  position: relative;
}

.el-button {
  padding-left: 8px;
  padding-right: 8px;
  border-width: 0px;
}
.el-form-item__error {
  padding-top: 2px;
  /* display: flex; */
  /* width: 100%; */
  /* position: relative; */
}
.no-nowrap {
  white-space: nowrap; /*保证文本内容不会自动换行，如果多余的内容会在水平方向撑破单元格*/
  overflow: hidden; /*隐藏超出单元格的部分*/
  text-overflow: ellipsis; /*将被隐藏的那部分用省略号代替*/
}
.el-form-item__prompt {
  width: 10rem;
  overflow: hidden; /*隐藏超出单元格的部分*/
  color: orange;
  font-size: 12px;
}
</style>
<style>
.el-input.is-disabled .el-input__inner {
  color: #303133 !important;
}
</style>
