<template>
  <div>
    <el-card class="" shadow="never">
      <div class="text item">
        <simple-add
         :approvalFormMode="approvalFormMode" 
          ref="basicForm"
          :service="service"
          :pageIsDraft="pageIsDraft"
          :pageName="pageName"
           :haveDraft="haveDraft"
           :parentPageType="parentPageType"
          :default-conditions="defaultConditions"
          :submit2-db="submit2Db"
          :default-values="defaultValues"
          :defaultCondition='defaultCondition'
          :srvval-form-model-decorator="srvvalFormModelDecorator"
          :parentAddMainFormDatas="parentMainFormDatas"
          @form-loaded="onAddFormLoaded"
          @srv-config-loaded="onSrvConfigLoaded($event)"
          @form-model-changed="onInnerFormModelChanged($event)"
          @action-complete="$emit('action-complete', $event)"
          @submitted2mem="onSubmitted2mem"
           @executor-complete="$emit('executor-complete', $event)"
           @on-custom-button="$emit('on-custom-button', $event)"
            :childForeignkey='childForeignkey'  
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
                  :childListConfig="item"
                  ref="childrenList"
                  :mainFormDatas="mainFormDatas"
                  :name="item.service_name"
                  storage-type="mem"
                  :def-data-para="defDataPara"
                  :inplace-edit="true"
                  list-type="addchildlist"
                  :service="item.service_name"
                  :foreign-key="item.foreign_key"
                  
                  :default-condition="item.defaultCondition"
                  :is-tree="!!item.parent_no_col"
                  :default-inplace-edit-mode="false"
                  default-dirty-flags="add"
                  :isTableForm="false"
                  :merge-col="false"
                  @update-form-loaded="$emit('update-form-loaded', $event)"
                  @add-form-loaded="$emit('add-form-loaded', $event)"
                  @grid-data-changed="onChildListDataChanged"
                  @list-loaded="onChildListLoaded"
                  @inline-list-loaded="onChildInlineListLoaded"
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
                  ref="childrenList"
                  :mainFormDatas="mainFormDatas"
                  :name="item.service_name"
                  storage-type="mem"
                  :def-data-para="defDataPara"
                  :inplace-edit="true"
                  list-type="addchildlist"
                  :service="item.service_name"
                  :foreign-key="item.foreign_key"
                  :default-condition="item.defaultCondition"
                  :is-tree="!!item.parent_no_col"
                  :default-inplace-edit-mode="false"
                  default-dirty-flags="add"
                  :isTableForm="false"
                  :merge-col="false"
                  @update-form-loaded="$emit('update-form-loaded', $event)"
                  @add-form-loaded="$emit('add-form-loaded', $event)"
                  @grid-data-changed="onChildListDataChanged"
                  @list-loaded="onChildListLoaded"
                  @inline-list-loaded="onChildInlineListLoaded"
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
                  ref="childrenList"
                  :childListConfig="item"
                  :mainFormDatas="mainFormDatas"
                  :name="item.service_name"
                  storage-type="mem"
                  :def-data-para="defDataPara"
                  :inplace-edit="true"
                  list-type="addchildlist"
                  :service="item.service_name"
                  :foreign-key="item.foreign_key"
                  :default-condition="item.defaultCondition"
                  :is-tree="!!item.parent_no_col"
                  :default-inplace-edit-mode="false"
                  default-dirty-flags="add"
                  :isTableForm="false"
                  :merge-col="false"
                  @update-form-loaded="$emit('update-form-loaded', $event)"
                  @add-form-loaded="$emit('add-form-loaded', $event)"
                  @grid-data-changed="onChildListDataChanged"
                  @list-loaded="onChildListLoaded"
                  @inline-list-loaded="onChildInlineListLoaded"
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
                  ref="childrenList"
                  :childListConfig="item"
                  :mainFormDatas="mainFormDatas"
                  :name="item.service_name"
                  storage-type="mem"
                  :def-data-para="defDataPara"
                  :inplace-edit="true"
                  list-type="addchildlist"
                  :childForeignkey='childForeignkey'  
                  :service="item.service_name"
                  :foreign-key="item.foreign_key"
                  :default-condition="item.defaultCondition"
                  :is-tree="!!item.parent_no_col"
                  :default-inplace-edit-mode="false"
                  default-dirty-flags="add"
                  :isTableForm="false"
                  :merge-col="false"
                  @update-form-loaded="$emit('update-form-loaded', $event)"
                  @add-form-loaded="$emit('add-form-loaded', $event)"
                  @grid-data-changed="onChildListDataChanged"
                  @list-loaded="onChildListLoaded"
                  @inline-list-loaded="onChildInlineListLoaded"
                >
                </child-list>
              </el-collapse-item>
            </template>
          </el-collapse>
         </div>

        </simple-add>
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
                :mainFormDatas="mainFormDatas"
                :name="item.service_name"
                storage-type="mem"
                :def-data-para="defDataPara"
                :inplace-edit="true"
                list-type="addchildlist"
                :service="item.service_name"
                :foreign-key="item.foreign_key"
                :default-condition="item.defaultCondition"
                :is-tree="!!item.parent_no_col"
                :default-inplace-edit-mode="false"
                default-dirty-flags="add"
                :isTableForm="false"
                :merge-col="false"
                @update-form-loaded="$emit('update-form-loaded', $event)"
                @add-form-loaded="$emit('add-form-loaded', $event)"
                @grid-data-changed="onChildListDataChanged"
                @list-loaded="onChildListLoaded"
                @inline-list-loaded="onChildInlineListLoaded"
              >
              </child-list>
            </el-collapse-item>
          </template>
        </el-collapse>
      </div> -->
    </el-card>
  </div>
</template>

<script>
import ChildList from "./child-list.vue";
import SimpleAdd from "./simple-add.vue";
import ParentChildMixin from '../mixin/parent-child-mixin'
import FieldRedundantMixin from '../mixin/field-redundant-mixin'

export default {
  name: "add",
  components: {
    SimpleAdd,
    ChildList,
  },
  mixins: [ ParentChildMixin, FieldRedundantMixin ],
  props: {
    defaultCondition:Array,
    childForeignkey:{
      type:Object
    },
    service: {
      type: String
    },
    defDataPara: {
      type: Object,
      default: function () {
        return null
      }
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

    navAfterSubmit: {
      type: Boolean,
      default: true,
    },

    label: {
      type: String,
      default: "添加",
    },

    submit2Db: {
      type: Boolean,
      default: true,
    },

    parentMainFormDatas: {
      type: Object,
      default: function () {
        return null
      }
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

  data () {
    return {
      service_name: this.service || this.$route.params.service_name,
      activeName: 0,
      mainFormDatas: null,
      srv_more_config: {},
    };
  },

  computed: {
    // mainDefaultValues(){
    //   return this.$parant
    // }
    
  },
  created () {
    // this.mainFormDatas = this.$emit('main-default-values',this)
  },
  methods: {
    onSrvConfigLoaded (e) {
      this.srv_more_config = e
    },
    /**
     * 返回添加主子表数据的请求
     * @returns {{serviceName: (default.props.service|{type}|*), data: *[]}[]}
     */
    buildRunQuries () {
      // 主表数据
      let formModel = _.cloneDeep(this.srvValFormModel());
      delete formModel._children;

      let query = {
        serviceName: this.service_name,
        data: [ formModel ],
      };

      // 子表的数据
      let childDataList = []
      if (this.$refs.childrenList) {
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

    /**
     * 获取子表元数据
     * @param form
     */
    onAddFormLoaded: function (form) {
      this.$emit("form-loaded", this)
      // console.log("onAddFormLoaded")
      // if itself is submit2mem, no childlist
      if (this.submit2Db) {
        this.buildChildrenList(form)
      }
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
                this.handleRedundantViaJs(field, _ => row, vm)
              }
            }
          })
        })

      }
      if (e.formModel !== undefined) {
        //  Vue.set('data', 'mainFormDatas', e.formModel) 
        this.mainFormDatas = e.formModel
      }
      if(this.mainFormDatas === null){
        this.mainFormDatas = this.$refs.basicForm.getFormDatas()
      }

    },
    getMainFormData () {
      return this.mainFormDatas
    }
  },
  watch: {
    "srv_more_config": {//深度监听，可监听到对象、数组的变化
      handler (val, oldVal) {

        if (this.srv_more_config !== null) {
          if (val.hasOwnProperty('collapseAuto')) {
            if (val.collapseAuto && this.childrenList.length > 0) {
              this.activeName = []
              for (let i = 0; i < this.childrenList.length; i++) {
                this.activeName.push(i)
              }
            }
          }
        }

      },
      deep: true //true 深度监听
    },
    "childrenListLoaded": {//深度监听，可监听到对象、数组的变化
      handler (val, oldVal) {

        if (this.srv_more_config !== null && val) {
          if (this.srv_more_config.hasOwnProperty('collapseAuto')) {
            if (this.srv_more_config.collapseAuto && this.childrenList.length > 0) {
              this.activeName = []
              for (let i = 0; i < this.childrenList.length; i++) {
                this.activeName.push(i)
              }
            }
          }
        }

      }
    }
  },


};
</script>


