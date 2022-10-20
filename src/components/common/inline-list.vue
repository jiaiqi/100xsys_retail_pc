<template>
  <div>
    <el-row type="flex" class="row-bg" justify="center">
      <el-table :data="gridData" stripe border style="width: 100%"
                row-key="id"
                :row-class-name="tableRowClassName"
                @selection-change="handleSelectionChange"
                @filter-change="filterChange" @sort-change="handleSortChange"
                @row-dblclick="onRowDbClicked">
        <el-table-column v-for="(item, index) in gridHeader" :key="index"
                         header-align="left" :align="getshowAlign(item)"
                         v-if="item.show" :width="item.width"
                         :prop="item.column" :label="item.label"
                         :min-width="item.list_min_width"
                         :filters="item.filters" :column-key="item.column"
                         :sortable="item.sortable && !isMem() ? 'custom' :false">
          <template slot-scope="scope">
            <div v-if="isInplaceEdit()  && findEditField(scope.row, item.column)">
              <raw-field-editor :field="findEditField(scope.row, item.column)"
                                @field-value-changed="onCellValueChanged(scope.row, item.column)"
                                @blur="onCellBlur(scope.row, item.column)">
              </raw-field-editor>
            </div>

            <div v-else-if="item.col_type === 'inline_list'">
              <child-list list-type="detaillist"
                          name="inlinelist"
                          ref="inlineList"
                          service="srvsys_menu_select"
              >
              </child-list>


            </div>

            <template v-else>
              <el-button v-if="item.linkUrlFunc"
                         v-show="scope.row[item.column]"
                         type="text"
                         @click="onLinkClicked(scope.row, item)">
                {{formatValue(scope.row, item)}}
              </el-button>

              <span v-else>{{formatValue(scope.row, item)}}</span>
            </template>
          </template>

        </el-table-column>

        <el-table-column fixed="right" label="操作" header-align="left"
                         width="250" v-if="!readOnly && listType!='selectlist'">
          <template slot-scope="scope">
            <el-tag v-if="isMem() && isDirtyRow(scope.row)"
                    :type="getDirtyRowTagType(scope.row)">
              {{getDirtyRowTagText(scope.row)}}
            </el-tag>

            <el-button v-for="(operate_item, operate_index) in rowButton"
                       :key="operate_index"
                       @click="rowButtonClick(operate_item,scope.row)"
                       type="text" size="small"
                       v-if="getDispExps(operate_item,scope.row)&&operate_item.permission">
              {{operate_item.button_name}}
            </el-button>

            <!--<el-button v-if="isMem() && isDirtyRow(scope.row)"-->
                       <!--@click="onUndoSubmitted(scope.row)" type="text"-->
                       <!--size="small">-->
              <!--恢复-->
            <!--</el-button>-->

          </template>
        </el-table-column>
      </el-table>
    </el-row>


    <el-dialog title="添加" width="90%" :close-on-click-modal="1==2"
               append-to-body
               :visible="activeForm == 'add'" @close="activeForm = 'xx'">
      <add name="list-add" ref="add-form" v-if="activeForm == 'add'"
           :service="getAddService" :submit2-db="storageType == 'db'"
           @action-complete="onAddFormActionComplete($event)"
           @form-loaded="onAddFormLoaded" @submitted2mem="onAdd2MemSubmitted">
      </add>
    </el-dialog>

    <el-dialog title="复制" width="90%" :close-on-click-modal="1==2"
               append-to-body
               :visible="activeForm == 'duplicate'" @close="activeForm = 'xx'">
      <simple-add name="list-duplicate" ref="duplicate-form"
                  v-if="activeForm == 'duplicate'" :service="getAddService"
                  :default-conditions="getDefaultCondition4Duplicate"
                  :submit2-db="storageType == 'db'"
                  @action-complete="onAddFormActionComplete($event)"
                  @form-loaded="onDuplicateFormLoaded"
                  @submitted2mem="onAdd2MemSubmitted">
      </simple-add>
    </el-dialog>

    <el-dialog title="深度复制" width="90%" :close-on-click-modal="1==2"
               append-to-body
               :visible="activeForm == 'duplicatedeep'"
               @close="activeForm = 'xx'">
      <add name="list-duplicatedeep" ref="duplicatedeep-form"
           v-if="activeForm == 'duplicatedeep'" :service="getAddService"
           :default-conditions="getDefaultCondition4DuplicateDeep"
           :submit2-db="storageType == 'db'"
           @action-complete="onAddFormActionComplete($event)"
           @form-loaded="onDuplicateFormLoaded"
           @submitted2mem="onAdd2MemSubmitted">

      </add>
    </el-dialog>

    <el-dialog title="编辑" width="90%" :visible="activeForm == 'update'"
               append-to-body
               @close="activeForm = 'xx'">
      <simple-update name="list-update" ref="update-form"
                     v-if="activeForm == 'update' " :service="getUpdateService"
                     :pk="getClickedRowPk('update')"
                     :submit2-db="storageType == 'db'"
                     :override-data="clickedRow.update._dirtyFlags ? clickedRow.update : null"
                     @action-complete="onUpdateFormActionComplete($event)"
                     @form-loaded="onUpdateFormLoaded($refs['update-form'])"
                     @submitted2mem="onUpdate2MemSubmitted">
      </simple-update>
    </el-dialog>
  </div>

</template>

<script>
  import simpleFilter from "./simple-filter.vue";
  import simpleCard from "./simple-card.vue";
  import SimpleAdd from "./simple-add.vue";
  import SimpleUpdate from "./simple-update.vue";
  import ListPopupMixin from "../mixin/list-popup-mixin";
  import CustButtonMinx from "../mixin/cust-button-minx";
  import MemListMixin from "../mixin/mem-list-mixin";
  import FieldRedundantMixin from "../mixin/field-redundant-mixin";
  import ChildListMixin from "../mixin/child-list-mixin"
  import ListMixin from "../mixin/list-mixin"

  import RawFieldEditor from "../common/raw-field-editor.vue";

  export default {
    components: {
      SimpleUpdate,
      SimpleAdd,
      simpleFilter,
      simpleCard,
      RawFieldEditor,
      Add: () => import("../common/add.vue"),
    },

    mixins: [ListPopupMixin, CustButtonMinx, MemListMixin, FieldRedundantMixin, ListMixin, ChildListMixin],

    props: {
      foreignKey: {
        type: Object
      },
    },

    data() {
      return {
        gridPage: {
          pageSizes: [],
          pageSize: -1,
          currentPage: 1,
          total: 0
        },
      }
    },

    created: function () {
      
      this.uid = this._uid

      this.$on("list-loaded", (list) => this.onListLoaded(list));
      this.$on("duplicate-form-loaded", (form) => this.onAddFormLoaded(form));
      this.$on("standby-row-added", (newRow) => this.onStandbyRowAdded(newRow));

    }
  };

</script>


<style scoped lang="less">
  #app {
    > div {
      > .el-row {
        > .isFixed.el-table {
          > .el-table__header-wrapper {
            position: fixed;
            top: 0;
            z-index: 3;
          }
          .el-table__fixed-header-wrapper {
            top: 0;
            position: fixed;
            // padding: 12px 0;
            z-index: 4;
            // overflow: hidden;
            right: 0.5rem;
            > table {
              > thead {
                tr {
                  background-color: transparent;
                  th {
                    background-color: transparent;
                    opacity: 0;
                    // display: none;
                  }
                  th:last-child {
                    background-color: #fff;
                    opacity: 1;
                    padding: 12px 0;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  .el-input-number{
    width: 100%;
  }

  .cell{
    padding-left: 5px !important;
    padding-right: 5px !important;
  }

  .el-table .update-row {
    > td {
      color: yellowgreen !important;
    }
  }

  .el-table .delete-row {
    > td {
      color: darkgray !important;
    }
  }

  .el-table .add-row {
    > td {
      color: deepskyblue !important;
    }
  }

  .el-table th.gutter {
    display: table-cell !important;
  }

  .el-input--suffix .el-input__inner {
    padding-right: 5px !important;
    padding-left: 5px !important;
    text-align: left !important;
  }
</style>


