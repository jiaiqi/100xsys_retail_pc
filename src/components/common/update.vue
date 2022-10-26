<template>
  <div>
    <!-- <el-card class="box-card"> -->
      <!-- <div slot="header" class="clearfix">
        <span>{{ label }}</span>
          :mainFormDatas="formModel"
      </div> -->
      <div class="text item">
        <simple-update
           :approvalFormMode="approvalFormMode" 
           :haveDraft="haveDraft"
           :parentPageType="parentPageType"
          ref="basicForm"
          :loaderServiceProp="selectSrvName"
          :service="service"
          :pageIsDraft="pageIsDraft"
          :default-conditions="defaultConditions"
          :defaultValues="defaultValues"
          :submit2-db="submit2Db"
          :parentAddMainFormDatas="parentMainFormDatas"
          :srvval-form-model-decorator="srvvalFormModelDecorator"
          :mainFormDatas="defaultValues"
          :pk="gotPk()"
          :pk-col="pkCol"
          :init-load="initLoad"
          :navAfterSubmit="navAfterSubmit"
          :nav2LocationStr="nav2LocationStr"
          @form-loaded="onBasicFormLoaded"
          @action-complete="$emit('action-complete', $event)"
          @form-model-changed="onInnerFormModelChanged($event)"
           @executor-complete="$emit('executor-complete', $event)"
          @submitted2mem="onSubmitted2mem"
          :childrenLists='childrenList'
        >
           <div slot="field-form-prepend" class="text item" v-if="childrenListLoaded && childListRun.form.prepend.length > 0">
          <el-collapse v-model="buildCollapsedRun['form_prepend']">
            <template v-for="(item, index) in childListRun.form.prepend">
              <el-collapse-item
                :title="
                  item.foreign_key.section_name || item.foreign_key.table_name
                "
                v-show="showChildList(item)"
                :key="index"
                :name="'form_prepend_' + (index)"
              >
                <child-list
                 :pageIsDraft="pageIsDraft"
                  :key="index"
                  @child-loaded="childDataLoadedRun($event)"
                  :childListConfig="item"
                  :ref="'childrenList'"
                  :name="item.service_name"
                  storage-type="mem"
                  :service="item.service_name"
                  :foreign-key="item.foreign_key"
                  :default-condition="item.defaultCondition"
                  :is-tree="!!item.parent_no_col"
                  :inplace-edit="true"
                  list-type="updatechildlist"
                  :mainFormDatas="onUpdateFormModel"
                  :default-inplace-edit-mode="true"
                  :merge-col="false"
                  @update-form-loaded="$emit('update-form-loaded', $event)"
                  @add-form-loaded="$emit('add-form-loaded', $event)"
                  @grid-data-changed="onChildListDataChanged"
                  @list-loaded="onChildListLoaded"
                >
                </child-list>
              </el-collapse-item>
            </template>
          </el-collapse>
         </div>
         <div slot="field-form-append" class="text item" v-if="childrenListLoaded && childListRun.form.append.length > 0">
          <el-collapse v-model="buildCollapsedRun['form_append']">
            <template v-for="(item, index) in childListRun.form.append">
              <el-collapse-item
                :title="
                  item.foreign_key.section_name || item.foreign_key.table_name
                "
                v-show="showChildList(item)"
                :key="index"
                :name="'form_append_' + (index)"
              >
                <child-list
                 :pageIsDraft="pageIsDraft"
                  :key="index"
                  :childListConfig="item"
                  @child-loaded="childDataLoadedRun($event)"
                  :ref="'childrenList'"
                  :name="item.service_name"
                  storage-type="mem"
                  :service="item.service_name"
                  :foreign-key="item.foreign_key"
                  :default-condition="item.defaultCondition"
                  :is-tree="!!item.parent_no_col"
                  :inplace-edit="true"
                  list-type="updatechildlist"
                  :mainFormDatas="onUpdateFormModel"
                  :default-inplace-edit-mode="true"
                  :merge-col="false"
                  @update-form-loaded="$emit('update-form-loaded', $event)"
                  @add-form-loaded="$emit('add-form-loaded', $event)"
                  @grid-data-changed="onChildListDataChanged"
                  @list-loaded="onChildListLoaded"
                >
                </child-list>
              </el-collapse-item>
            </template>
          </el-collapse>
         </div>

          <div :slot="col + '-child-prepend'" class="text item"  v-for="(col, colIndex) in fieldChildKeys" :key="colIndex" v-if="childrenListLoaded && fieldChildKeys.length > 0">
          <el-collapse v-model="buildCollapsedRun[col+'_prepend']">
            <template v-for="(item, index) in fieldChildRun[col].prepend">
              <el-collapse-item
                :title="
                  item.foreign_key.section_name || item.foreign_key.table_name
                "
                v-show="showChildList(item)"
                :key="index"
                :name="col + '_prepend_' + (index)"
              >
                <child-list
                 :pageIsDraft="pageIsDraft"
                  :key="index"
                  :childListConfig="item"
                  @child-loaded="childDataLoadedRun($event)"
                  :ref="'childrenList'"
                  :name="item.service_name"
                  storage-type="mem"
                  :service="item.service_name"
                  :foreign-key="item.foreign_key"
                  :default-condition="item.defaultCondition"
                  :is-tree="!!item.parent_no_col"
                  :inplace-edit="true"
                  list-type="updatechildlist"
                  :mainFormDatas="onUpdateFormModel"
                  :default-inplace-edit-mode="true"
                  :merge-col="false"
                  @update-form-loaded="$emit('update-form-loaded', $event)"
                  @add-form-loaded="$emit('add-form-loaded', $event)"
                  @grid-data-changed="onChildListDataChanged"
                  @list-loaded="onChildListLoaded"
                >
                </child-list>
              </el-collapse-item>
            </template>
          </el-collapse>
         </div>
         <div :slot="col + '-child-append'" class="text item" v-for="(col, colIndex) in fieldChildKeys" :key="colIndex" v-if="childrenListLoaded && fieldChildKeys.length > 0">
          <el-collapse v-model="buildCollapsedRun[col+'_append']"  >
            <template v-for="(item, index) in fieldChildRun[col].append">
              <el-collapse-item
                :title="
                  item.foreign_key.section_name || item.foreign_key.table_name
                "
                v-show="showChildList(item)"
                :key="index"
                :name="col + '_append_' + (index)"
              >
                <child-list
                 :pageIsDraft="pageIsDraft"
                  :key="index"
                  @child-loaded="childDataLoadedRun($event)"
                  :ref="'childrenList'"
                  :childListConfig="item"
                  :name="item.service_name"
                  storage-type="mem"
                  :service="item.service_name"
                  :foreign-key="item.foreign_key"
                  :default-condition="item.defaultCondition"
                  :is-tree="!!item.parent_no_col"
                  :inplace-edit="true"
                  list-type="updatechildlist"
                  :mainFormDatas="onUpdateFormModel"
                  :default-inplace-edit-mode="true"
                  :merge-col="false"
                  @update-form-loaded="$emit('update-form-loaded', $event)"
                  @add-form-loaded="$emit('add-form-loaded', $event)"
                  @grid-data-changed="onChildListDataChanged"
                  @list-loaded="onChildListLoaded"
                >
                </child-list>
                <!-- <child-list
                :key="index"
                ref="childrenList"
                :name="item.service_name"
                storage-type="mem"
                :service="item.service_name"
                :foreign-key="item.foreign_key"
                :default-condition="item.defaultCondition"
                :is-tree="!!item.parent_no_col"
                :inplace-edit="true"
                list-type="updatechildlist"
                :mainFormDatas="mainForm"
                :default-inplace-edit-mode="false"
                :merge-col="false"
                @update-form-loaded="$emit('update-form-loaded', $event)"
                @add-form-loaded="$emit('add-form-loaded', $event)"
                @grid-data-changed="onChildListDataChanged"
                @list-loaded="onChildListLoaded"
              >
              </child-list> -->
              </el-collapse-item>
            </template>
          </el-collapse>
         </div>
      <!-- <template  v-slot:child-body="{ mainForm }" class="text item" v-if="childrenListLoaded">
        <el-collapse v-model="activeName">
          <template v-for="(item, index) in childrenList">
            <el-collapse-item
              :title="item.foreign_key.section_name || item.foreign_key.table_name"
              v-show="showChildList(item)"
              :key="index"
              :name="index"
            >
              <child-list
                :key="index"
                ref="childrenList"
                :name="item.service_name"
                storage-type="mem"
                :service="item.service_name"
                :foreign-key="item.foreign_key"
                :default-condition="item.defaultCondition"
                :is-tree="!!item.parent_no_col"
                :inplace-edit="true"
                list-type="updatechildlist"
                :mainFormDatas="mainForm"
                :default-inplace-edit-mode="false"
                :merge-col="false"
                @update-form-loaded="$emit('update-form-loaded', $event)"
                @add-form-loaded="$emit('add-form-loaded', $event)"
                @grid-data-changed="onChildListDataChanged"
                @list-loaded="onChildListLoaded"
              >
              </child-list>
            </el-collapse-item>
          </template>
        </el-collapse>
      </template > -->

        </simple-update>
      </div>
     <!-- <div class="text item" v-if="childrenListLoaded">
        <el-collapse v-model="activeName">
          <template v-for="(item, index) in childrenList">
            <el-collapse-item
              :title="
                item.foreign_key.section_name || item.foreign_key.table_name
              "
              v-show="showChildList(item)"
              :key="index"
              :name="index"
            >
              <child-list
                :key="index"
                ref="childrenList"
                :name="item.service_name"
                storage-type="mem"
                :service="item.service_name"
                :foreign-key="item.foreign_key"
                :default-condition="item.defaultCondition"
                :is-tree="!!item.parent_no_col"
                :inplace-edit="true"
                list-type="updatechildlist"
                :default-inplace-edit-mode="false"
                :merge-col="false"
                @update-form-loaded="$emit('update-form-loaded', $event)"
                @add-form-loaded="$emit('add-form-loaded', $event)"
                @grid-data-changed="onChildListDataChanged"
                @list-loaded="onChildListLoaded"
              >
              </child-list>
            </el-collapse-item>
          </template>
        </el-collapse>
      </div> -->
    <!-- </el-card> -->
  </div>
</template>

<script>
// import ChildList from "./child-list.vue";
import SimpleUpdate from "./simple-update.vue";
import ParentChildMixin from '../mixin/parent-child-mixin'

export default {
  name: "update",
  components: {
    SimpleUpdate, 
    ChildList:() => import("./child-list.vue"),
  },
  mixins: [ ParentChildMixin, ],
  props: {
    childrenLists:{
      type:Array
    },
    service: {
      type: String
    },
      haveDraft:{
        type:Boolean,
        default:false
      },
    // for update/detail/add, it is loader's condition
    // for filter, it is default condition
    defaultConditions: {
      type: Array
    },

    // for update/add, it is form fields default value
    defaultValues: {
      type: Object
    },
    // 提交后是否跳转
    navAfterSubmit: {
      type: Boolean,
      default: true,
    },
    // 提交后跳转的路由name
    nav2LocationStr:{
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: "编辑",
    },

    submit2Db: {
      type: Boolean,
      default: true,
    },

    pkCol: {
      type: String
    },

    pk: {
      type: String
    },

    initLoad: {
      type: Boolean,
      default: true,
    },
    selectSrvName: {
      type: String
    },
    parentMainFormDatas: {
      type: Object
    },
    pageIsDraft: {
      type: String,
      default: 'norm',
    },
    parentPageType:{
      type: String,
      default: '',
    }
  },
  computed:{
    
    
    // onUpdateFormModel: function () {
    //   let model = {};

    //   for (let key in this.fields) {
    //     model[ key ] = this.fields[ key ].model;
    //   }

    //   return model;
    // }
  },
  data () {
    return {
      service_name: this.service || this.$route.params.service_name,
      activeName: 0,
      mainFormDatas: {},
    };
  },
  methods: {
    childDataLoadedRun(e){
      this.$emit("child-loaded",e)
    },
    getChildGridData:function(){
      let childs = this.$refs
    },
    getFormModel:function(){
       let model = {}
       for(let item in this.fields){
        model[item] = this.fields[item].model
       }
       return model
    },
    onInnerFormModelChanged: function (e) {
      let self = this
      // notify child list inplace edit redundant via js
      if (this.$refs && this.$refs.childrenList) {
        this.$refs.childrenList.filter(item => item.isInplaceEdit()).forEach(childlist => {
          let realList = childlist.$refs.list
          realList.inplaceEditData.forEach(fieldsMap => {
            let row = {};
            for (let key in fieldsMap) {
              let field = fieldsMap[ key ];
              if (field && field.getSrvVal) {
                row[ key ] = field.getSrvVal()
              }
            }

            for (let key in fieldsMap) {
              let field = fieldsMap[ key ]
              if (field && field.getSrvVal) {
                let vm = this
                self.$refs.basicForm.handleRedundantViaJs(field, _ => row, vm)
              }
            }
          })
        })

      }
      if (e.formModel !== undefined) {
        //  Vue.set('data', 'mainFormDatas', e.formModel) 
        this.mainFormDatas = e.formModel

        // this.mainFormDatas = e.formModel
      }

    },
    /**
     * 返回编辑主子表数据的请求
     * @returns {{serviceName: (default.props.service|{type}|*), data: *[]}[]}
     */
    buildRunQuries () {
      let formModel = _.cloneDeep(this.srvValFormModel());
      delete formModel._children;

      let query = {
        serviceName: this.service_name,
        data: [ formModel ],
        condition: [ {
          colName: "id", ruleType: "eq", value: formModel.id,
        } ]
      };

      // 子表的数据
      let childDataList = []
      if (this.$refs.childrenList !== undefined) {
        this.$refs.childrenList.forEach(childList => {
          let updateQueries = childList.buildRunQuries();
          if (updateQueries.length > 0) {
            childDataList = childDataList.concat(updateQueries);
          }

        });
      }


      // put in top level query
      query.data[ 0 ].child_data_list = childDataList;

      return [ query ];
    },


    gotPk: function () {
      return this.pk || this.$route.params.id;
    },

    /**
     * 获取子表元数据
     * @param form
     */
    onBasicFormLoaded: function (form) {
      this.$emit("form-loaded", this)

      // if itself is submit2mem, no childlist
      if (this.submit2Db) {
        this.buildChildrenList()
      }
    }
  },

  created: function () {
    window.forms = window.forms || {}
    window.forms.update = this

  }


};
</script>



