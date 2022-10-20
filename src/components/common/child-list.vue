<template>
  <div>
    <treegrid
      ref="list"
      v-if="isTree && storageType === 'db'"
      :name="name"
      list-type="treelist"
      :listMainFormDatas="mainFormDatas"
      :storage-type="storageType"
      :service="service"
      :page-size="pageSize"
      :default-condition="getDefaultConditions"
      :main-data="mainData"
      @list-loaded="onListLoaded()"
      @add-form-loaded="onAddFormLoaded($event)"
      @update-form-loaded="onUpdateFormLoaded($event)"
    >
    </treegrid>

    <list-proc ref="list" :service="service" v-else-if="isProc"> </list-proc>
    <tableEdit ref="mlist" 
      :name="name"
      :pageType="foreignKey.view_model"
      :pageIsDraft="pageIsDraft"
      :showPagination="childListConfig.showPagination && showPagination"
      :list-type="listType"
      :defaultCondition="defaultCondition"
      :storage-type="storageType"
      :service="service"
      :childForeignkey="foreignKey"
      :def-data-para="defDataPara"
      :read-only="readOnly"
      :childforeignvalue="getRefColValue"
      :default-condition="getDefaultConditions"
      :inplace-edit="inplaceEdit"
      :default-inplace-edit-mode="defaultInplaceEditMode"
      :default-dirty-flags="defaultDirtyFlags"
      :merge-col="mergeCol"
      :listMainFormDatas="mainFormDatas"
      :main-data="mainData?mainData:formModel"
      :$srvApp="$srvApp"
      @child-loaded="childDataLoadedRun($event)"
      @list-loaded="onListLoaded"
      @inline-list-loaded="onInlineListLoaded"
      @add-form-loaded="onAddFormLoaded($event)"
      @update-form-loaded="onUpdateFormLoaded($event)"
      @duplicate-form-loaded="onAddFormLoaded($event)"
      @filter-form-loaded="onFilterFormLoaded"
      @list-data-loaded="listLoaded($event)"
      @grid-data-changed="$emit('grid-data-changed', $event)"
      @standby-row-added="onStandbyRowAdded"
      v-else-if="foreignKey.view_model == 'mlist'"></tableEdit>
    <list
      ref="list"
      :key="service"
      v-else
      :name="name"
      :pageIsDraft="pageIsDraft"
      :showPagination="childListConfig.showPagination && showPagination"
      :list-type="listType"
      :defaultCondition="defaultCondition"
      :storage-type="storageType"
      :service="service"
      :childForeignkey="foreignKey"
      :def-data-para="defDataPara"
      :read-only="readOnly"
      :childforeignkey="foreignKey"
      :childforeignvalue="getRefColValue"
      :default-condition="getDefaultConditions"
      :inplace-edit="inplaceEdit"
      :default-inplace-edit-mode="defaultInplaceEditMode"
      :default-dirty-flags="defaultDirtyFlags"
      :merge-col="mergeCol"
      :listMainFormDatas="mainFormDatas"
      :main-data="mainData"
      :$srvApp="$srvApp"
      @child-loaded="childDataLoadedRun($event)"
      @list-loaded="onListLoaded"
      @inline-list-loaded="onInlineListLoaded"
      @add-form-loaded="onAddFormLoaded($event)"
      @update-form-loaded="onUpdateFormLoaded($event)"
      @duplicate-form-loaded="onAddFormLoaded($event)"
      @filter-form-loaded="onFilterFormLoaded"
      @list-data-loaded="listLoaded($event)"
      @grid-data-changed="$emit('grid-data-changed', $event)"
      @standby-row-added="onStandbyRowAdded"
    >
    </list>
  </div>
</template>

<script>
import SimpleAdd from "./simple-add.vue";
import SimpleUpdate from "./simple-update.vue";
import List from "./list.vue";
import Treegrid from "./treegrid.vue";
import ListProc from './listproc.vue'
import ChildListMixin from "../mixin/child-list-mixin"

import tableEdit from "./table-edit.vue"  // 新增的增强表格

/**
 * 子表组件， 主要是处理外键相关的逻辑： 例如外籍列、外键disp列隐藏；添加行数据自动添加外键列的值。
 */
export default {
  components: {
    Treegrid,
    SimpleUpdate,
    SimpleAdd,
    List,
    ListProc,
    tableEdit
  },

  mixins: [ ChildListMixin ],

  data () {
    return {
      pageSize: 5
    }
  },
  props: {
    defaultCondition: {
      type: Array,
      default: function () {
        return []
      }
    },
    foreignKey: {
      type: Object
    },
    name: {
      type: String,
      default: 'child'
    },
    isTableForm: false,
    mainFormDatas: {
      type: Object,
      default: function () {
        return null
      }
    },
    service: {
      type: String
    },
    foreignKey: {
      type: Object
    },
    isTree: { //子表是树形表
      type: Boolean,
      default: false,
    },
    isProc: { //子表是流程表
      type: Boolean,
      default: false,
    },
    defDataPara: {
      type: Object,
      default: function () {
        return null
      }
    },
    readOnly: {
      type: Boolean,
      default: function () {
        return false;
      }
    },
    defaultCondition: {
      type: Array,
      default: function () {
        return []
      }
    },
    searchForm: {
      type: Boolean, default: function () {
        return true
      }
    },
    storageType: {
      type: String,
      default: "db",
    },

    inplaceEdit: {
      type: Boolean,
      default: false,
    },

    listType: {
      type: String,
      default: "detaillist",
    },

    defaultInplaceEditMode: {
      type: Boolean,
      default: false,
    },

    defaultDirtyFlags: {
      type: String,
      default: "pristine",
    },

    mergeCol: {
      type: Boolean,
      default: true,
    },
    childListConfig: {
      type: Object,
      default: function () {
        return {}
      }
    },
    pageIsDraft: {
      type: String,
      default: 'norm',
    },
    mainData: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  computed: {
    isInplaceEditRun:function(){
      if(this.foreignKey && this.foreignKey.hasOwnProperty('more_config') && this.foreignKey.more_config){
        let config = JSON.parse(this.foreignKey.more_config)
        if(config.tableType == 'special'){
          return config
        }else{
          return null
        }
      }else{
        return null
      }
    },
    getRefColValue: function () {
      if (this.defaultCondition && this.defaultCondition.length > 0) {
        return this.defaultCondition[ 0 ].value;
      }

      return null;
    },

    innerList: function () {
      return this.$refs && this.$refs.list
    },

    gridData: function () {
      return this.innerList && this.innerList.gridDataRun;
    },

    inlineLists: function () {
      return this.innerList && this.innerList.inlineLists;
    },

    getDefaultConditions: function () {
      if (this.foreignKey.conditions && this.foreignKey.conditions.length > 0) {
        return _.concat(this.defaultCondition, this.foreignKey.conditions)
      } else {
        return this.defaultCondition;
      }
    },
    showPagination: function () {
      //let windowConfig = window.sessionStorage.getItem('childPagination') == true ||window.sessionStorage.getItem('childPagination') == false  ? window.sessionStorage.getItem('childPagination') : true
      // let isShow = this.childListConfig.showPagination
      let isShow = true
      // console.log("showPagination",isShow)
      //console.log(isShow,this.storageType)
      if (isShow && this.storageType !== 'mem') {
        return isShow == 'false' || isShow == false ? false : true
      } else {
        return false
      }
    }
  },
  created: function () {

  },

  methods: {
    listLoaded (e) {
      // console.log("list Loaded",e)
      if (this.listType == 'detaillist') {
        // console.log('detail child list loaded')
        this.$emit("detailOnLoaded", e)
      }
    },
    childDataLoadedRun (e) {
      //console.log("child-list",e)
      this.$emit("child-loaded", e)
    },
    buildRunQuries () {
      if(this.$refs.mlist){
        return this.$refs.mlist.buildMlistRunQuries(this.foreignKey);
      }else{
        return this.$refs.list.buildRunQuries(this.foreignKey);
      }
      
    },

    isInplaceEdit: function () {
      return this.innerList && this.innerList.isInplaceEdit();
    },

    isMem: function () {
      let list = this.$refs.list;
      return list.isMem()
    },

    buildExecutors4Edit: function () {
      let list = this.$refs.list;
      return list.buildExecutors4Edit()
    },

    listrefresh: function (){

      let list = this.$refs[ "list" ];
      list.loadTableData();
    },
    /**
     * hide ref column and set a vaue
     * @param form
     */
    onAddFormLoaded: function (form) {


      // hide ref cols
      let refCol = this.foreignKey.column_name || this.foreignKey.ref_service_column;
      let refColField = form.fields[ refCol ];
      refColField.info.visible = false;
      refColField.setSrvVal(this.getRefColValue);

      // hide extra fk condition cols and set values
      if (this.foreignKey.conditions) {
        this.foreignKey.conditions.forEach(item => {

          let refCol = item.colName
          let refColField = form.fields[ refCol ]
          refColField.info.visible = false
          refColField.setSrvVal(item.value)


        })
      }

      form.actions.submit.nav2Location = null;

      this.$emit("add-form-loaded", form);
    },


    /**
     * hide ref column
     * @param form
     */
    onUpdateFormLoaded: function (form) {

      this.hiddRefColFieldInForm(form);
      form.actions.submit.nav2Location = null;

      this.$emit("update-form-loaded", form);
    },

    onFilterFormLoaded: function (form) {
      let refCol = this.foreignKey.column_name;
      refCol = "_" + refCol + "_disp";
      let refColField = form.fields[ refCol ];
      if (refColField) {
        refColField.info.visible = false;
      }
    },

    onInlineListLoaded: function (inlineList) {
      this.$emit('inline-list-loaded', inlineList, this)
    },
  },

}
</script>



