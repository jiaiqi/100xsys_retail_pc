<template>
  <div>

    <el-card class="box-card">
          <div v-if="!hasVisibleChildListTab()" v-show="detailshow">
                <div slot="header" class="clearfix" v-show="is_view_title">
                  <span>{{tab_view_name}}</span>
                </div>
                <div class="text item" v-if="initLoad">

                      <simple-detail :isHistory="isHistory" :childrenLists='child_service' :pageIsDraft="pageIsDraft" :approvalFormMode="approvalFormMode" :form-type="formType" ref="simple-detail" :service="service" :default-conditions="custCondition" :srvval-form-model-decorator="srvvalFormModelDecorator" pk-col="id" :pk="id" @form-loaded="$emit('form-loaded', $event)">

                        <div slot="field-form-prepend" v-if="childrenListLoaded && childListRun.form.prepend.length > 0">
                          <el-collapse v-model="buildCollapsedRun['form_prepend']" v-if="hasVisibleChildListCollapse()">
                            <template v-for="(item, index) in childListRun.form.prepend">
                              <el-collapse-item :title="item.foreign_key.section_name" v-show="showChildList(item,detailData) && !isTabsModel(item)" :key="index" :name="'form_prepend_' + (index)">

                                <simple-detail :isHistory="isHistory" v-if="item.foreign_key.view_model=='detail'" form-type="detail" ref="child-simple-detail" :service="item.service_name" :default-condition="item.defaultCondition"></simple-detail>
                                <child-list v-else :isTree="item.table_type==='树形表'" :isProc="item.table_type==='流程表'"  :name="item.service_name" :childListConfig="item" @detailOnLoaded="refreshDetail" :pageIsDraft="pageIsDraft" :list-type="formType=='procdetail'?'procdetaillist':'detaillist'" :key="index" ref="childrenList" :$srv-app="item.srv_app" :service="item.service_name" :foreign-key="item.foreign_key" :read-only="childListReadonly || item.foreign_key.child_table_readonly=='是'" :default-condition="item.defaultCondition" :search-form="searchForm" :is-tree="!!item.parent_no_col" :mainFormDatas="detailData" :inplace-edit="true" @list-loaded="$emit('list-loaded', $event)" @update-form-loaded="$emit('update-form-loaded', $event)" @add-form-loaded="$emit('add-form-loaded', $event)">
                                </child-list>
                              </el-collapse-item>
                            </template>
                          </el-collapse>

                        </div>
                        <div slot="field-form-append" v-if="childrenListLoaded && childListRun.form.append.length > 0">
                          <el-collapse v-model="buildCollapsedRun['form_append']" v-if="hasVisibleChildListCollapse()">
                            <template v-for="(item, index) in childListRun.form.append">
                              <el-collapse-item :title="item.foreign_key.section_name" v-show="showChildList(item,detailData) && !isTabsModel(item)" :key="index" :name="'form_append_' + (index)">

                                <simple-detail :isHistory="isHistory" :pageIsDraft="pageIsDraft" v-if="item.foreign_key.view_model=='detail'" form-type="detail" ref="child-simple-detail" :service="item.service_name" :default-condition="item.defaultCondition"></simple-detail>
                                <child-list v-else :isTree="item.table_type==='树形表'"  :isProc="item.table_type==='流程表'"   :name="item.service_name" :pageIsDraft="pageIsDraft" :childListConfig="item" @detailOnLoaded="refreshDetail" :list-type="formType=='procdetail'?'procdetaillist':'detaillist'" :key="index" ref="childrenList" :$srv-app="item.srv_app" :service="item.service_name" :foreign-key="item.foreign_key" :read-only="childListReadonly || item.foreign_key.child_table_readonly=='是'" :default-condition="item.defaultCondition" :search-form="searchForm" :is-tree="!!item.parent_no_col" :mainFormDatas="detailData" :inplace-edit="true" @list-loaded="$emit('list-loaded', $event)" @update-form-loaded="$emit('update-form-loaded', $event)" @add-form-loaded="$emit('add-form-loaded', $event)">
                                </child-list>
                              </el-collapse-item>
                            </template>
                          </el-collapse>

                        </div>
                        <div :slot="col + '-child-prepend'" class="text item" v-for="(col, colIndex) in fieldChildKeys" :key="colIndex" v-if="childrenListLoaded && fieldChildKeys.length > 0">
                          <el-collapse v-model="buildCollapsedRun[col+'_prepend']" v-if="hasVisibleChildListCollapse()">
                            <template v-for="(item, index) in fieldChildRun[col].prepend">
                              <el-collapse-item :title="item.foreign_key.section_name" v-show="showChildList(item,detailData) && !isTabsModel(item)" :key="index" :name="col + '_prepend_' + (index)">

                                <!-- <simple-detail v-if="item.foreign_key.view_model=='detail'" form-type="detail" ref="child-simple-detail" :service="item.service_name" :default-condition="item.defaultCondition"></simple-detail> -->
                                <child-list :isTree="item.table_type==='树形表'"  :isProc="item.table_type==='流程表'"  :list-type="formType=='procdetail'?'procdetaillist':'detaillist'" :childListConfig="item" @detailOnLoaded="refreshDetail" :pageIsDraft="pageIsDraft" :key="index" ref="childrenList" :$srv-app="item.srv_app" :service="item.service_name" :foreign-key="item.foreign_key" :read-only="childListReadonly || item.foreign_key.child_table_readonly=='是'" :default-condition="item.defaultCondition" :search-form="searchForm" :is-tree="!!item.parent_no_col" :mainFormDatas="detailData" :inplace-edit="true" @list-loaded="$emit('list-loaded', $event)" @update-form-loaded="$emit('update-form-loaded', $event)" @add-form-loaded="$emit('add-form-loaded', $event)">
                                </child-list>
                              </el-collapse-item>
                            </template>
                          </el-collapse>

                        </div>
                        <div :slot="col + '-child-append'" class="text item" v-for="(col, colIndex) in fieldChildKeys" :key="colIndex" v-if="childrenListLoaded && fieldChildKeys.length > 0">
                          <el-collapse v-model="buildCollapsedRun[col+'_append']" v-if="hasVisibleChildListCollapse()">
                            <template v-for="(item, index) in fieldChildRun[col].append">
                              <el-collapse-item :title="item.foreign_key.section_name" v-show="showChildList(item,detailData) && !isTabsModel(item)" :key="index" :name="col + '_append_' + (index)">

                                <!-- <simple-detail v-if="item.foreign_key.view_model=='detail'" form-type="detail" ref="child-simple-detail" :service="item.service_name" :default-condition="item.defaultCondition"></simple-detail> -->
                                <child-list :isTree="item.table_type==='树形表'"  :isProc="item.table_type==='流程表'"  :list-type="formType=='procdetail'?'procdetaillist':'detaillist'" :childListConfig="item" @detailOnLoaded="refreshDetail" :pageIsDraft="pageIsDraft" :key="index" ref="childrenList" :$srv-app="item.srv_app" :service="item.service_name" :foreign-key="item.foreign_key" :read-only="childListReadonly || item.foreign_key.child_table_readonly=='是'" :default-condition="item.defaultCondition" :search-form="searchForm" :is-tree="!!item.parent_no_col" :mainFormDatas="detailData" :inplace-edit="true" @list-loaded="$emit('list-loaded', $event)" @update-form-loaded="$emit('update-form-loaded', $event)" @add-form-loaded="$emit('add-form-loaded', $event)">
                                </child-list>
                              </el-collapse-item>
                            </template>
                          </el-collapse>

                        </div>
                      </simple-detail>
                </div>
          </div>




          <div>
            <el-tabs v-if="hasVisibleChildListTab()">


              <el-tab-pane :label="tab_view_name">
                
                <simple-detail :isHistory="isHistory" :pageIsDraft="pageIsDraft" :form-type="formType" ref="simple-detail" :service="service" :default-conditions="custCondition" :srvval-form-model-decorator="srvvalFormModelDecorator" pk-col="id" :pk="id" @form-loaded="$emit('form-loaded', $event)">
                </simple-detail>
              </el-tab-pane>

              <template v-for="(item, index) in child_service">

                <el-tab-pane :lazy="1==1" :label="item.foreign_key.section_name" v-if="showChildList(item,detailData) && isTabsModel(item)&&item.show" :key="index">

                  <simple-detail :isHistory="isHistory" :pageIsDraft="pageIsDraft" v-if="item.foreign_key.view_model=='detail'" @form-load-nodata="noDataHand(item)" form-type="detail" ref="child-simple-detail" :service="item.service_name" :default-conditions="item.defaultCondition"></simple-detail>

                  <child-list v-else :isTree="item.table_type==='树形表'" :isProc="item.table_type==='流程表'" :list-type="formType=='procdetail'?'procdetaillist':'detaillist'" :childListConfig='item' :pageIsDraft="pageIsDraft" :key="index" :name="item.service_name" ref="childrenList" :$srv-app="item.srv_app" :service="item.service_name" :foreign-key="item.foreign_key" :read-only="item.foreign_key.child_table_readonly=='是'" :default-condition="item.defaultCondition" :search-form="searchForm" :mainFormDatas="detailData" :is-tree="!!item.parent_no_col" :inplace-edit="true" @list-loaded="$emit('list-loaded', $event)" @update-form-loaded="$emit('update-form-loaded', $event)" @add-form-loaded="$emit('add-form-loaded', $event)">
                  </child-list>

                </el-tab-pane>
              </template>

            </el-tabs>
          </div>
    </el-card>
  </div>
</template>

<script>
import ChildList from "./child-list.vue";
import SimpleDetail from "./simple-detail.vue";
import ParentChildMixin from "../mixin/parent-child-mixin";

/**
 * 带子表的详情页面
 */
export default {
  name: "detail",
  components: {
    ChildList,
    SimpleDetail
  },
  mixins: [ParentChildMixin],
  props: {
    service: {
      type: String
    },
    formType: {
      type: String,
      default: function() {
        return "detail";
      }
    },
    is_view_title: {
      type: Boolean,
      default: function() {
        return true;
      }
    },
    pkid: {
      type: String
    },

    defaultConditions: {
      type: Array
    },

    childListReadonly: {
      type: Boolean,
      default: false
    },
    detailshow: {
      type: Boolean,
      default: true
    }
    //  child_service:{
    //   type:Array,
    // },
  },
  computed: {
    pageIsDraft: function() {
      if (
        this.$route.query.hasOwnProperty("isdraft") &&
        this.$route.query.isdraft === "true"
      ) {
        return "draft";
      } else {
        return "norm";
      }
    }
  },
  data() {
    return {
      activeName: 1,
      id: this.pkid || this.$route.params.id,
      service_name: this.service || this.$route.params.service_name,
      detailData: {},
      custService: "",
      custCondition: [],
      detail_srv_cols: [],
      child_service: [],
      tab_view_name: "",
      searchForm: false,
      initLoad: false,
      mainFormDatas: null,
      isHistory: false
    };
  },
  methods: {
    hasVisibleChildListTab() {
      return (
        this.child_service &&
        !this.hideChildrenLists &&
        this.child_service.filter(
          child =>
            this.showChildList(child, this.detailData) &&
            this.isTabsModel(child)
        ).length > 0
      );
    },
    hasVisibleChildListCollapse() {
      return (
        this.child_service &&
        !this.hideChildrenLists &&
        this.child_service.filter(
          child =>
            this.showChildList(child, this.detailData) &&
            !this.isTabsModel(child)
        ).length > 0
      );
    },

    noDataHand(item) {
      item.show = false;
    },

    /**
       * DO NOT REMOVE THIS !!! ref name is diff
       * @returns {*}
       */
    srvValFormModel() {
      let basicForm = this.$refs["simple-detail"];
      return basicForm ? basicForm.srvValFormModel() : null;
    },
    async refreshDetail() {
      // console.log('refreshDetail')
      var condition = [];
      var me = this;
      if (this.custService != "") {
        this.service_name = this.custService;
        condition = this.custCondition;
      } else {
        if (this.id != undefined) {
          condition = [{ colName: "id", value: this.id, ruleType: "eq" }];
        }

        if (this.custCondition.length > 0) {
          condition = condition.concat(this.custCondition);
        }
      }

      let detailData = null;
      await this.selectOne(
        this.service_name,
        condition,
        this.$route.query.isdraft
      ).then(response => {
        detailData = response.body;
        this.detailData = response.body;
        this.mainFormDatas = response.body;
      });
    },
    async initGridData() {
      var condition = [];
      var me = this;
      if (this.custService != "") {
        this.service_name = this.custService;
        condition = this.custCondition;
      } else {
        if (this.id != undefined) {
          condition = [{ colName: "id", value: this.id, ruleType: "eq" }];
        }

        if (this.custCondition.length > 0) {
          condition = condition.concat(this.custCondition);
        }
      }

      let childList = [];
      await this.loadColsV2(this.service_name, "detail").then(response => {
        this.detail_srv_cols = response.body.data["srv_cols"];
        childList = response.body.data["child_service"];
        var temp = response.body.data["service_view_name"];
        let v2Data = response.body.data;
        if (v2Data.hasOwnProperty("his_version")) {
          this.isHistory = v2Data.his_version;
        }
        if (temp.endsWith("查询")) {
          this.tab_view_name = temp.substr(0, temp.length - 2) + "详情";
        } else {
          this.tab_view_name = response.body.data["service_view_name"] + "详情";
        }
      });
      let detailData = null;
      await this.selectOne(
        this.service_name,
        condition,
        this.$route.query.isdraft,
        this.isHistory
      ).then(response => {
        detailData = response.body;
        this.detailData = response.body;
        this.mainFormDatas = response.body;
      });
      for (var item of childList) {
        item.show = true;
        let foreign_key = item.foreign_key;
        if (item.srv_cols) {
          // intra-app fk
          let referenced_column_name = foreign_key.referenced_column_name;
          item.defaultCondition = [
            {
              colName: foreign_key.column_name,
              ruleType: "eq",
              value: detailData[referenced_column_name]
            }
          ];
        } else {
          // inter-app fk
          let referenced_column_name = foreign_key.refed_service_column;
          item.defaultCondition = [
            {
              colName: foreign_key.ref_service_column,
              ruleType: "eq",
              value: detailData[referenced_column_name]
            }
          ];
        }

        this.child_service.push(item);
      }
    },

    isTabsModel(item) {
      if ("tabs" == item.foreign_key.show_ui_model) {
        return true;
      } else {
        return false;
      }
    }
  },
  created: function() {
    var operate_params = this.getOperateParams();
    if (operate_params) {
      var operate_Object = JSON.parse(operate_params);
      this.custService = operate_Object["serviceName"];
      if (operate_Object["condition"]) {
        this.custCondition = operate_Object["condition"];
      }
    }

    if (this.defaultConditions != undefined) {
      this.custCondition = this.custCondition.concat(this.defaultConditions);
    }

    this.initLoad = true;

    this.emitEvent("initLoad", this);

    this.initGridData();
  }
};
</script>



