<template>
  <div>
    <el-row type="flex" class="row-bg" justify="center">
      <el-table :data="gridData" stripe border style="width: 100%"
                :row-class-name="tableRowClassName"
                @selection-change="handleSelectionChange"
                @filter-change="filterChange" @sort-change="handleSortChange">
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

            <el-button v-for="(button, operate_index) in rowButton"
                       :key="operate_index"
                       @click="rowButtonClick(button,scope.row)"
                       type="text" size="small"
                       v-show="getDispExps(button,scope.row) && button.button_type !== 'detail' && button.button_type !== 'edit' && scope.row._dirtyFlags !== 'delete'">
              {{button.button_name}}
            </el-button>

            <el-button v-if="isMem() && scope.row._dirtyFlags === 'delete'"
                       @click="onUndoSubmitted(scope.row)" type="text"
                       size="small">
              恢复
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <el-row>
      <el-col :span="24"
              style="text-align: center; padding:6px; padding-bottom:20px;">
        <el-button type="primary" @click="onSubmit">确定</el-button>
        <el-button type="primary" @click="onCancel">取消</el-button>
      </el-col>
    </el-row>
  </div>

</template>

<script>
  import CustButtonMinx from "../mixin/cust-button-minx";
  import MemListMixin from "../mixin/mem-list-mixin";
  import FieldRedundantMixin from "../mixin/field-redundant-mixin";
  import ChildListMixin from "../mixin/child-list-mixin"
  import ListMixin from "../mixin/list-mixin"

  import RawFieldEditor from "../common/raw-field-editor.vue";

  export default {
    components: {
      RawFieldEditor,
      Add: () => import("../common/add.vue"),
    },

    mixins: [CustButtonMinx, MemListMixin, FieldRedundantMixin, ListMixin, ChildListMixin],

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

    methods: {
      onCancel() {
        this.$emit("close-pop");
      },

      isDirty(){
        return !!_.find( this.gridData, row => row._dirtyFlags !== 'pristine' );
      },

      onSubmit() {
        this.rawGridData.splice(0, this.rawGridData.length);
        this.gridData.forEach(row => this.rawGridData.push(row));

        if(this.parentRow ){
          if(this.parentRow._dirtyFlags === 'pristine' && this.isDirty()){
            this.parentRow._dirtyFlags = 'update';
          }
        }

        this.$emit("close-pop");
      },

      onDuplicateClicked(row) {
        this.$set(this.clickedRow, 'duplicate', row);
        if (this.inplaceEditMode) {
          this.duplicateRowInplace(row)
        } else {getLinkUrl
          this.activeForm = "duplicate";
        }
      },

      setGridData(data, parentRow) {
        // 传入的原始数据
        this.rawGridData = data;

        // 原始数据的copy作为编辑的数据，
        this.gridData = _.cloneDeep(data);

        this.parentRow = parentRow;
      },


      setEditMode(value) {
        if (value) {
          if (!this.inplaceEditMode && value) {
            this.onInplaceEditClicked();
          }
        } else {
          this.inplaceEditMode = false;
        }
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

  .el-input-number {
    width: 100%;
  }

  .cell {
    padding-left: 5px !important;
    padding-right: 5px !important;
  }

  .el-table {
    > td {
      padding: 2px;
    }
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


