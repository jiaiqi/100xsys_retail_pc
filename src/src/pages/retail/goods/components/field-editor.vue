/* */
<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">

  <!-- <el-col :span="field.info.colspan"> -->
  <!-- 响应式布局属性 -->
  <el-col
    :xs="field.info.colspan.xs"
    :sm="field.info.colspan.sm"
    :md="field.info.colspan.md"
    :lg="field.info.colspan.lg"
    :xl="field.info.colspan.xl"
    v-if="ignoreVif||field.evalXIf()"
    v-show="field.evalVisible()"
  >
    <slot name="field-child-prepend"></slot>
    <el-form-item
      :key="field.info.name"
      :prop="field.info.name"
      :title="field.info.label"
      :show-message="false"
      
      :error="field.getAnyValidateError()"
      :class="{ fix_height_form_item: fixHeight, invalid_form_item : formHasInvalidError }"
    >
      <!--显示字段label-->
      <template v-slot:label>
        <label
          :for="field.info.name"
          :title="field.info.label"
          :class="field.info.isRequired() ?  `${field.info.getLabelStyle()} required` : field.info.getLabelStyle()"
          class="el-form-item__label"
          style="width: 10rem; text-overflow: ellipsis;overflow: hidden;white-space: nowrap;"
        >

          {{field.info.label}}

          <el-button
            v-if="field.info.explain !== ''"
            type="text"
            @click="showHelpTips(field.info)"
            style="color:#28d828"
            slot="reference"
            icon="el-icon-question"
          ></el-button>

        </label>
      </template>

      <!--内容部分-->
      <el-dialog
        :title="title"
        :visible.sync="dialogVisible"
        width="68%"
        append-to-body
        destroy-on-close
      >
        <div
          style="border-radius: 4px; padding:10px; border:1px solid #dcdfe6; overflow: auto;max-width:210mm;margin:0 auto;"
          v-html="html"
        ></div>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="dialogVisible = false"
          >确 定</el-button>
        </span>
      </el-dialog>
      <el-row>
        <el-col
          v-for="contentField in this.contentFields"
          :key="contentField.info.name"
          v-if="ignoreVif||contentField.evalXIf()"
          :span="getInnerFieldColspan(contentField)"
        >

          <!-- 
          @field-value-changed="$emit('field-value-changed', $event)"
          v-show="contentField.info.bodyVisible && contentField.info.srvCol.in_detail == 1"  label设置隐藏 in_detail == 2 ， 显示lebel 不显示 field-editor-->
          <raw-field-editor
            ref="inner"
            :field="contentField"
            v-if="ignoreVif||contentField.evalXIf()"
            :childForeignkey='childForeignkey'
            :defaultCondition='defaultCondition'
            :mainformDatas='mainformDatas||parentAddMainFormDatas'
            :defaultValues='defaultValues'
            v-show="contentField.info.readonly ? contentField.info.srvCol.in_detail == 1 : contentField.info.bodyVisible"
            @on-custom-button="$emit('on-custom-button', $event)"
            @field-value-changed="$emit('field-value-changed', $event)"
            @field-history-popup="$emit('field-history-popup', $event)"
          >
          </raw-field-editor>

        </el-col>

      </el-row>
    </el-form-item>
    <slot name="field-child-append"></slot>

  </el-col>
</template>

<script>
import RawFieldEditor from "./raw-field-editor.vue";

export default {
  name: "field-editor",

  components: {
    RawFieldEditor,
  },

  props: {
    ignoreVif: {
      type: Boolean,
      default: false
    },
     defaultCondition: {
      type: Array,
    },
    childForeignkey: {
      type: Object,
    },
    /**
     * 主字段，提供label、colspan等
     * */
    field: {
      type: Object,
      default: null,
    },

    /**
     * 内容字段集合，包含主字段和其他字段
     * */
    contentFields: {
      type: Array,
      default: function () {
        return [];
      },
    },

    formHasInvalidError: {
      type: Boolean,
      default: false,
    },
     mainformDatas: {
      type: Object,
    },
    parentAddMainFormDatas:{
      type: Object,
    },
    defaultValues:{
      type:Object,
    }
  },

  data() {
    return {
      dialogVisible: false,
      html: null,
      title: "帮助",
    };
  },

  computed: {
    fixHeight: function () {
      let editor = this.field.info.editor;
      let flexEditors = new Set([
        "upload-file",
        "upload-image",
        "ueditor",
        "qrcode",
        "textarea",
        "userlist",
        "code-editor",
      ]);
      return !flexEditors.has(editor);
    },
  },

  methods: {
    handleClose() {
      let self = this;
      self.dialogVisible = false;
    },
    getInnerFieldColspan(contentField) {
      if (this.contentFields.length === 1) {
        return 24;
      }

      let colSpan2 = contentField.info.srvCol.col_span2;
      if (!colSpan2) {
        colSpan2 = contentField.info.srvCol.col_span;
      }
      let inner = Number.parseFloat(colSpan2);
      return _.toInteger(inner * 24);
    },
    getconsole(e) {},
    showHelpTips(e) {
      this.html = e.explain;
      this.title = e.label + "[说明]";
      this.dialogVisible = true;
      let type = "explain";
      let urlParams = e.explain;
      let tab_title = e.label + "[说明]";
      //  this.addTab(type, urlParams, tab_title);
    },
    handleClose(e) {},
  },
};
</script>

<style scoped>


label.required::before {
  content: "*";
  color: #f74b4b;
  margin-right: 4px !important;
}
.el-form label.red {
  color: #c03434;
  font-weight: 600 !important;
}
.el-form label.normal {
  color: #3f65b1 !important;
}
div.el-form-item {
  margin-bottom: -3px;
   margin-top: -3px;
}

div.invalid_form_item {
  margin-bottom: 16px !important;
}
.el-form-item__error {
  padding-top: 0px;
}
</style>

