import {FieldInfo} from "../model/FieldInfo";
import {Field} from "../model/Field";
import Executor from "../common/executor.vue";
import Vue from "vue";
import {InlineForm} from "../model/InlineForm";
import {traverseObj} from "../../util/DataUtil";

/**
 * 内存型表格的逻辑处理，
 * row会附加两个属性：
 * _guid (添加的数据，前端分配的id),
 * _dirtyFlags( 用户编辑状态， 可为： pristine： 未修改， add: 新添加，update 编辑，delete：删除, standby: 默认总是空的最后一行数据)
 */
export default {
  props: {
    storageType: {
      type: String,
      default: "db"
    },

    // true for support inplac edit
    inplaceEdit: {
      type: Boolean,
      default: false,
    },

    defaultInplaceEditMode: {
      type: Boolean,
      default: false,
    },

    defaultDirtyFlags: {
      type: String,
      default: "pristine",
    }
  },

  data() {
    return {
      listLoaded: false,

      /**
       *  是否为可编辑模式
       */
      inplaceEditMode: false,

      // array item is virtual form, whose key is select srvcol.columns, value is field
      inplaceEditData: [],

      addSrvCols: [],

      updateSrvCols: [],
      standbyData:{
        _dirtyFlags: 'standby',
        _guid: this.guid(),
      },
      mainTable: null,

      unmodifiedGridData: [],
    }
  },

  methods: {

    /**
     * 生成内存表格的增删改请求
     * @param fk
     * @returns {*}
     */
    buildRunQuries(fk) {
      if (!this.isMem()) {
        return [];
      }

      let queries = [];
      let addQuery = this.buildAddQuery();
      if( addQuery ) {
        if(fk){
          addQuery.depend_keys = [{
            type: "column", depend_key: fk.referenced_column_name, add_col: fk.column_name
          }];
        }
        queries.push(addQuery);
      }

      let deleteQuery = this.buildDeleteQuery();
      deleteQuery && queries.push(deleteQuery);

      queries = queries.concat(this.buildUpdateQueries());

      return queries;
    },

    buildAddQuery() {
      let colNames = this.addSrvCols.filter(srvcol => srvcol.in_add !== 0).map(srvcol => srvcol.columns);
      let addedRows = _.cloneDeep(this.gridData.filter((item) => {
        if(item._dirtyFlags === "add"){
          return item
        }
        
      })) ;

      if (addedRows.length == 0) {
        return null;
      }

      let query = {
        serviceName: this.addService,
        data: addedRows,
      };

      // 每一行添加inlineList数据
      if (this.inlineLists && !_.isEmpty(this.inlineLists)) {
        addedRows.forEach(row => {

          row.child_data_list = [];
          this.$refs.inlineLists.forEach(inlineList => {
            if (!row._inlineLists) {
              return;
              _inlineLists
            }
            let constrName = inlineList.foreignKey.constraint_name;
            if (!row._inlineLists[constrName] || row._inlineLists[constrName].length == 0) {
              return;
            }
            inlineList.setGridData(row._inlineLists[constrName], row);
            let subQueries = inlineList.buildRunQuries(inlineList.foreignKey);
            row.child_data_list = row.child_data_list.concat(subQueries);
          })
        })
      }


      // 删除 _ 前缀的字段
      addedRows.forEach(row => {
        for (let key in row) {
          if ( key !== 'child_data_list' && !_.includes(colNames, key)) {
            delete  row[key];
          }
        }
      });


      return query;
    },

    buildUpdateQueries() {

      let colNames = this.updateSrvCols.filter(srvcol => srvcol.in_update !== 0).map(srvcol => srvcol.columns);
      let updatedRows = _.cloneDeep(this.gridData.filter(item => item._dirtyFlags === "update")) ;
      let queries = updatedRows.map(row => {
        return {
          serviceName: this.updateService,
          data: [row],
          condition: [{colName: "id", ruleType: "eq", value: row.id,}]
        }
      });


      // 每一行添加inlineList数据
      if (this.inlineLists && !_.isEmpty(this.inlineLists)) {
        queries.forEach(query => {
          let row = query.data[0];
          row.child_data_list = [];
          this.$refs.inlineLists.forEach(inlineList => {
            if (!row._inlineLists) {
              return;
              _inlineLists
            }
            let constrName = inlineList.foreignKey.constraint_name;
            if (!row._inlineLists[constrName] || row._inlineLists[constrName].length == 0) {
              return;
            }
            inlineList.setGridData(row._inlineLists[constrName], row);
            let subQueries = inlineList.buildRunQuries();
            row.child_data_list = row.child_data_list.concat(subQueries);
          })
        })
      }

      // 删除 _ 前缀的字段
      updatedRows.forEach(row => {
        for (let key in row) {
          if (key !== 'child_data_list' && !_.includes(colNames, key)) {
            delete  row[key];
          }
        }
      });


      return queries;
    },

    buildDeleteQuery() {
      let deletedRows = this.gridData.filter(item => item._dirtyFlags === "delete");
      if (deletedRows.length == 0) {
        return null;
      }

      let ids = deletedRows.map(row => row.id).join(",");

      let query = {
        serviceName: this.deleteService,
        condition: [{
          colName: "id",
          ruleType: "in",
          value: ids,
        }]
      };

      return query;
    },

    isMem() {
      return 'mem' === this.storageType || this.inplaceEditMode;
    },


    /**
     * 处理删除操作
     * @param deleteRows
     * @param exeservice
     * @returns {*}
     */
    deleteData(deleteRows, exeservice) {
      if (this.isMem()) {
        this.onDeleteSubmitted(deleteRows);
        return Promise.resolve(true)
      } else {
        return this.deleteDataAndSave(deleteRows, exeservice);
      }
    },

    /**
     * 用户是否编辑过
     * @returns {boolean}
     */
    hasDirtyData() {
      return this.gridData.filter(item => item._dirtyFlags).length > 0;
    },

    /**
     * 刷新表格数据，从db重新load
     */
    refresh() {
      if (this.isMem() && this.hasDirtyData()) {
        this.$confirm("此操作将丢失所有修改, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "info"
        })
          .then(() => {
            this.inplaceEditMode = false;
            try {
              this.loadTableData();
            } catch (e) {
              
              this.gridData = [];
            }
          })
      } else {
        this.loadTableData(true);
      }
    },

    addFinderDispCol: function (fields, srvvalRow) {
      for (let fieldName in fields) {
        let field = fields[fieldName];
        if (field.info && field.info.isFinder()) {
          srvvalRow["_" + fieldName + "_disp"] = field.getDispVal();
        }
      }
    },

    /**
     * 内存表格处理添加数据，当弹出add form确定关闭时调用
     * @param srvvalRow
     * @param fields
     */
    onAdd2MemSubmitted: function (srvvalRow, fields) {
      
      if (!this.isMem()) {
        return;
      }

      this.addFinderDispCol(fields, srvvalRow);

      srvvalRow._dirtyFlags = "add";
      srvvalRow._guid = this.guid();

      
      if (this.isTreeGrid()) {
        srvvalRow.is_leaf = "是";
        this.mergeAdd(null, null, srvvalRow)
      } else {
        if (this.inplaceEditMode) {
          // set the returned row to gridData standby row
          // let standbyRow = this.gridData[this.gridData.length - 1]; //0108
          let standbyRow = this.getStandbyRow()
          for (let key in srvvalRow) {
            if (key && (!key.startsWith("_") || key.endsWith("_disp"))) {
              standbyRow[key] = srvvalRow[key]
            }
          }
          standbyRow._dirtyFlags = "add";
          this.syncRow2Fields(standbyRow)
          this.addStandbyRow(standbyRow)
        } else {
          this.gridData.push(srvvalRow);
        }
      }

      this.syncRow2Fields(srvvalRow);
    },


    /**
     * 内存表格处理编辑数据，当弹出update form确定关闭时调用
     * 内存表内有id ，所以用 _guid 进行识别
     * @param srvvalRow
     * @param fields
     */
    onUpdate2MemSubmitted: function (srvvalRow, fields) {
      if (!this.isMem()) {
        return;
      }

      
      this.addFinderDispCol(fields, srvvalRow);
      let target = null
      if(srvvalRow.hasOwnProperty("_guid") && srvvalRow._guid !== null){
        target = _.find(this.gridData, item => srvvalRow._guid && item._guid == srvvalRow._guid);
      }else if(!srvvalRow.hasOwnProperty("_guid") && srvvalRow.hasOwnProperty("id") && srvvalRow.id !== null){
        target = _.find(this.gridData, item => srvvalRow.id && item.id == srvvalRow.id);
      }
      
      if(target.hasOwnProperty('id') && target.id == null){
        this.updateDirtyFlags(target, "add");
      }
      target = target || _.find(this.gridData, item => item._guid == srvvalRow._guid);

      _.assign(target, srvvalRow);
      this.syncRow2Fields(target);
      
      this.updateDirtyFlags(target, "update");
    },

    /**
     * 内存表格删除数据
     * @param deleteRows
     */
    onDeleteSubmitted: function (deleteRows) {
      deleteRows.forEach(item => {
        let target = _.find(this.gridData, i => item.id && (i.id == item.id));
        if (target) {
          this.updateDirtyFlags(target, "delete");
          // this.gridData = this.gridData.filter((item) => item._dirtyFlags && item._dirtyFlags !== 'delete')
        } else {
          // to delete an mem-added item, but left standby row
          if ("standby" !== item._dirtyFlags) {
            let index = _.findIndex(this.gridData, i => item._guid && (i._guid == item._guid))
            this.gridData.splice(index, 1)
          }
        }
      });
    },

    syncRow2Fields: function (targetRow) {
      // sync dbrow to fields
      if (this.inplaceEditData) {
        let fieldMap = _.find(this.inplaceEditData, item => (item.id && item.id === targetRow.id));
        fieldMap = fieldMap || _.find(this.inplaceEditData, item => item._guid == targetRow._guid);
        if (fieldMap) {
          for (let key in targetRow) {
            if (fieldMap[key] && fieldMap[key].setSrvVal) {
              

              fieldMap[key].setSrvVal(targetRow[key]);
            }
          }
        }
      }
    },

    duplicateRowInplace: function (row) {
      let copy = _.cloneDeep(row);
      this.$set(copy, "_dirtyFlags", "add")
      delete copy.id
      delete copy._guid 

      let standbyRow = _.find(this.gridData, item => item._dirtyFlags === "standby");
      _.assign(standbyRow, copy)

      this.syncRow2Fields(standbyRow)

      this.addStandbyRow()
    },

    onUndoSubmitted: function (row) {
      if (!row._dirtyFlags) {
        return;
      }

      if (row._dirtyFlags === "add") {
        let posi = _.findIndex(this.gridData, i => i._guid == row._guid);
        this.gridData.splice(posi, 1);
        this.$forceUpdate();
      } else if (row._dirtyFlags === "delete") {
        this.$set(row, "_dirtyFlags", null);
      } else if (row._dirtyFlags === "update") {
        let conditions = [{
          colName: "id", ruleType: "eq", value: row.id
        }];
        this.select(this.service_name, conditions).then(response => {
          let dbRow = response.data.data[0];
          let targetRow = _.find(this.gridData, i => row.id && i.id == row.id);
          _.assign(targetRow, dbRow);
          this.syncRow2Fields(targetRow);
          this.$set(row, "_dirtyFlags", null);
        })
      } else {
        
      }
    },


    /**
     *
     * @param row
     * @param action: add, delete, update
     * @returns {string}
     */
    updateDirtyFlags: function (row, action) {
      if (!row._dirtyFlags) {
        this.$set(row, "_dirtyFlags", action);
      } else {
        if ("add" === row._dirtyFlags) {
          // do nothing
        } else if ("delete" === row._dirtyFlags) {
          // do nothing
        } else if ("update" === row._dirtyFlags) {
          if ("delete" === action) {
            this.$set(row, "_dirtyFlags", action);
          }
          if('add' === action){
            this.$set(row, "_dirtyFlags", action);
          }
        } else if ("pristine" === row._dirtyFlags) {
          this.$set(row, "_dirtyFlags", action);
        }
      }
    },

    tableRowClassName({row, rowIndex}) {
      if ("add" === row._dirtyFlags) {
        return 'add-row';
      } else if ("delete" === row._dirtyFlags) {
        return 'delete-row';
      } else if ("update" === row._dirtyFlags) {
        return 'update-row';
      }
      return '';
    },

    isTreeGrid() {
      return this.hasOwnProperty("noCol") && this.hasOwnProperty("parentCol");
    },

    isInplaceEdit() {
      return this.inplaceEdit && this.inplaceEditMode;
    },
    getStandbyRow(){
      // add a blank row to griddata:
      let newRow = {
        _dirtyFlags: 'standby',
        _guid: this.guid(),
      };

      // 添加 inlinelist数据
      if (this.inlineLists) {
        newRow._inlineLists = newRow._inlineLists || {};
        this.inlineLists.forEach(inlineList => {
          let fk = inlineList.foreign_key;
          newRow._inlineLists[fk.constraint_name] = [];
        });
      }
      return newRow
    }, 
    addStandbyRow(e) {
      let standbyRow = _.find(this.gridData, row => row._dirtyFlags === 'standby');
      if (!!standbyRow) {
        return;
      }

      // add a blank row to griddata:
      let newRow = {
        _dirtyFlags: 'standby',
        _guid: this.guid(),
      };

      // 添加 inlinelist数据
      if (this.inlineLists) {
        newRow._inlineLists = newRow._inlineLists || {};
        this.inlineLists.forEach(inlineList => {
          let fk = inlineList.foreign_key;
          newRow._inlineLists[fk.constraint_name] = [];
        });
      }
      if(e){
        this.gridData.push(e);
        

        // for (let i in this.srv_cols) {
        //   let srvCol = this.srv_cols[i];
        //   if (srvCol.in_list !== 0) {
        //     this.$set(e, srvCol.columns, null)
        //   }
        // }

        this.buildEditData(e);

        this.$emit("standby-row-added", e);  
      }else{
        /**
         * 默认增加内存表空行代码
         */
        // this.gridData.push(newRow);
        

        // for (let i in this.srv_cols) {
        //   let srvCol = this.srv_cols[i];
        //   if (srvCol.in_list !== 0) {
        //     this.$set(newRow, srvCol.columns, null)
        //   }
        // }

        // this.buildEditData(newRow);

        // this.$emit("standby-row-added", newRow); 
      }
      
    }
    ,

    buildEditData: function (row) {
      let self = this
      let isAdd = row._dirtyFlags === "standby" || row._dirtyFlags === "add";
      let editSrvCols = isAdd ? self.addSrvCols : self.updateSrvCols;
      let srvcolInFlag = isAdd ? "in_add" : "in_update";

      let fields = editSrvCols
        .filter(item => {
          let editable = item[srvcolInFlag] === 1 && item.table_column !== "id";
          let inListCols = !!_.find(
            this.srv_cols,
            listcol => listcol.table_name === item.table_name && listcol.table_column === item.table_column);
         
          return editable && inListCols;
        })
        .map(item => {
          let fi = new FieldInfo(item, "update");
          let listCol = _.find(this.srv_cols, col => col.table_name === item.table_name && col.table_column === item.table_column);

          

          let field = new Field(fi, null);
          field.key = listCol.columns;
          field.setSrvVal(row[field.key])
          /**
           * 处理子表默认值 引用主表from
           */
          let infoObj = field.info
          if(infoObj.hasOwnProperty('moreConfig') && infoObj.editor === "DateRange" && infoObj.moreConfig !== null &&  infoObj.moreConfig.hasOwnProperty('DateRangeConfig')){
            field.info._DateMaxMin = this.getDateRangExpr(infoObj,this.listMainFormDatas)
          }
          return field;
        });

      let _fieldMap = {id: row.id};
      if(row._guid){
        _fieldMap['_guid'] = row._guid
      }
      let list = this;
      let formModelDecorator = function (formModel) {
        if (formModel) {
          formModel._gridData = list.gridData;
        }
      }

      // create an virtual form for this row
      let inlineForm = new InlineForm(fields, formModelDecorator);
      for(let field of fields){
        //10-22
        field['form'] = inlineForm
        
        _fieldMap[field.key] = field
      }
      // fields.forEach(field => {
      //   field.form = inlineForm
      //   _fieldMap[field.key] = field
      // });

      // this.buildDependentFields(isAdd ? _fieldMap : fields);
      this.buildDependentFields(_fieldMap);

      // console.log('inplaceEditData.push =>',_fieldMap,fields)
      this.inplaceEditData.push(_fieldMap);

      // watch the row
      this.$watch(function () {
          return row;
        },
        function (newVal, oldVal) {
          let formModelFunc = _ => row;
          this.handleRedundantOnFormModelChange(newVal, oldVal, _fieldMap, formModelFunc);
        },
        {
          deep: true
        })

    }
    ,


    onSaveAllClicked() {
      this.$confirm("是否继续提交?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info"
      })
        .then(() => this.buildExecutors4Edit())
        .then((executors) => {
          let queriesArr = executors.map(executor => {
            let ComponentClass = Vue.extend(Executor)
            let executorComp = new ComponentClass({})
            let queries = executorComp.buildQuery(executor);
            
            return queries;
          })

          let flatQuries = _.flatten(queriesArr).filter(item => !!item);
          let submitP = Promise.resolve(true);
          if (flatQuries.length > 0) {
            this.santinizeQueries(flatQuries)
            submitP = this.operate(flatQuries);
          }

          return submitP
            .then((response) => {
              let ok = response === true || (response && response.data && response.data.state == 'SUCCESS');
              if (ok) {
                this.inplaceEditMode = false;
                this.loadTableData();
              }
            })
        });

    }
    ,

    loadAddUpdateSrvCols() {
      let addServiceP = !this.addService || this.addSrvCols.length > 0
        ? Promise.resolve(false)
        : this.loadColsV2(this.addService, "add");

      return addServiceP
        .then(response => {
          if (response && response.body) {
            let data = response.body.data;
            this.addSrvCols = data.srv_cols;
          }
          return !this.updateService || this.updateSrvCols.length > 0
            ? Promise.resolve(false)
            : this.loadColsV2(this.updateService, "update");
        })
        .then(response => {
          if (response && response.body) {
            let data = response.body.data;
            this.updateSrvCols = data.srv_cols;
          }
        })
    }
    ,

    onInplaceEditClicked() {
      if (!this.inplaceEditMode === true) {
        

        this.loadAddUpdateSrvCols()
          .then(_ => {
            

            // clear old data
            this.inplaceEditData.splice(0, this.inplaceEditData.length)

            this.gridData.forEach(row => {
              if (!row._dirtyFlags) {
                // 如果没有 dirtyFlags，设置默认的flags
                this.$set(row, "_dirtyFlags", this.defaultDirtyFlags)
                if (this.defaultDirtyFlags === "add") {
                  this.$set(row, "_guid", this.guid())
                  this.$set(row, "id", null)
                }
              }

              this.buildEditData(row)
            })

            this.addStandbyRow();

            this.$nextTick(_ => {
              this.inplaceEditMode = true;

            
              if (this.$refs.inlineList) {
                this.$refs.inlineList.filter(item => item.listLoaded).forEach(item => item.onInplaceEditClicked())
              }
            })
          })
      }else if(this.inplaceEditMode && this.listType == "updatechildlist" && this.moreConfig.hasOwnProperty("childListConfig") && this.updateSrvCols.length == 0){
        this.loadAddUpdateSrvCols()
        .then(_ => {
          

          // clear old data
          this.inplaceEditData.splice(0, this.inplaceEditData.length)

          this.gridData.forEach(row => {
            if (!row._dirtyFlags) {
              // 如果没有 dirtyFlags，设置默认的flags
              this.$set(row, "_dirtyFlags", this.defaultDirtyFlags)
              if (this.defaultDirtyFlags === "add") {
                this.$set(row, "_guid", this.guid())
                this.$set(row, "id", null)
              }
            }

            this.buildEditData(row)
          })

          // this.addStandbyRow();

          // this.$nextTick(_ => {
          //   this.inplaceEditMode = true;

          
          //   if (this.$refs.inlineList) {
          //     this.$refs.inlineList.filter(item => item.listLoaded).forEach(item => item.onInplaceEditClicked())
          //   }
          // })
        })
      }
    }
    ,

    findEditField(row, listSrvColName) {
      // for disp col, find the real fk col
      if (listSrvColName.startsWith("_") && listSrvColName.endsWith("_disp")) {
        listSrvColName = listSrvColName.substring(1).substring(0, listSrvColName.length - 6);
      }

      let fieldMap = _.find(this.inplaceEditData, item => (item.id && item.id === row.id) || (item._guid && item._guid === row._guid));

      let field = fieldMap ? fieldMap[listSrvColName] : null;
      
      
      return field;
    }
    ,

    syncField2Row: function (field, row, key) {
      // sync data from fields to row
      if (field && field.getSrvVal && field.editor) {

        if (field.info.isFinder()) {
          let valueCol = key
          if (key.startsWith("_") && key.endsWith("_disp")) {
            valueCol = key.substring(1, key.length - "_disp".length);
          }

          row[valueCol] = field.getSrvVal()
          let dispCol = `_${valueCol}_disp`
          row[dispCol] = field.getDispVal()
        } else {
          row[key] = field.getSrvVal();
        }
      }
    }
    ,

    onCellBlur(row, column) {
      if (!row) {
        return;
      }

      if ("standby" === row._dirtyFlags) {
        if (this.isRowNotEmpty(row)) {
          this.$set(row, "_dirtyFlags", "add");
          this.addStandbyRow();
        }
      } else if (!row._dirtyFlags || "pristine" === row._dirtyFlags) {
        this.$set(row, "_dirtyFlags", "update");
      }
    }
    ,

    isRowNotEmpty(row) {
      for (let key in row) {
        if (!key.startsWith("_")) {
          if (row[key] !== null && row[key] !== undefined && row[key] !== '') {
            return true;
          }
        }
      }

      return false;
    }
    ,

    onCellValueChanged(row, column) {
     

      if (!row) {
        return;
      }

      let field = this.findEditField(row, column);
      this.onRowChangeRedundant(row,column)
      if (field) {
        let fieldMap = _.find(this.inplaceEditData, item => (item.id && item.id === row.id) || (item._guid && item._guid === row._guid));
        this.handleFieldFkRedundant(field, fieldMap);
        /**
         * 处理起止日期值分离同步
         */
        let DateRangeEndCol= field.info._DateRangeEndColName
        if(field.info.editor === "DateRange" && DateRangeEndCol !== null){
          if(field.hasOwnProperty('_DateRangeModel') && field._DateRangeModel!==null ){
            if(DateRangeEndCol !== undefined && DateRangeEndCol !== ''){
              let endCol = fieldMap[DateRangeEndCol]
              field.model = field._DateRangeModel[0]
              row[column] = field._DateRangeModel[0]
              row[DateRangeEndCol] =  field._DateRangeModel[1]
              
              fieldMap[DateRangeEndCol].model = field._DateRangeModel[1]// endCol.model = field._DateRangeModel[1]
            }
          }
        }
      }

      this.syncField2Row(field, row, column);
    }
    ,

    addInlineListExecutors: function (executor) {
      if (!_.isEmpty(this.inlineLists)) {
        executor.children = [];

        let addedInlineLists = new Set()
        this.$refs.inlineLists.forEach(inlineList => {
          let fk = inlineList.foreignKey;
          let fkName = fk.constraint_name
          if (addedInlineLists.has(fkName)) {
            return;
          }

          addedInlineLists.add(fkName);
          let inlineListDataFunc = (rtDataCtx) => {
            return rtDataCtx._inlineLists[fkName];
          }

          inlineList.buildExecutors4Edit(inlineListDataFunc)
            .then(subexecutors => {
              subexecutors.forEach(item => {
                // add depend key
                let dependKey = {
                  type: "column",
                  add_col: fk.column_name,
                  depend_key: fk.referenced_column_name,
                };
                item.dependKeys = [dependKey];

                executor.children.push(item);
              })
            })
        })

      }
    }
    ,

    buildAddExecutor: function (listDataFunc) {
      let vm = this;
      let values = this.addSrvCols.filter(srvcol => srvcol.in_add !== 0).map(srvcol => {
        return {
          colName: srvcol.columns,
          valueExpr: `item.${srvcol.columns}`,
        };
      });

      let itemsFunc = rtDataCtx => {
        let listData = (listDataFunc && listDataFunc(rtDataCtx)) || vm.gridData;
        return listData.filter((item) => {
          if(this.listType === 'addchildlist' || item._dirtyFlags === "add"){
            return item
          }else if(item._dirtyFlags === "add"){
            return item
          }
        });
      };

      let executor = {
        service: this.addService,
        values: values,
        itemsFunc: itemsFunc,
        ignoreNullValue: true,
      };

      this.addInlineListExecutors(executor)

      return executor;
    }
    ,

    buildUpdateExecutor: function () {
      let vm = this;
      let values = this.updateSrvCols.filter(srvcol => srvcol.in_update !== 0).map(srvcol => {
        return {
          colName: srvcol.columns,
          valueExpr: `item.${srvcol.columns}`,
          enableFunc: (value, item) => {
            let newValue = item[srvcol.columns];
            let oldRow = _.find(vm.unmodifiedGridData, unmodified => unmodified.id === item.id);

            if (!oldRow) {
              return false;
            } else {
              let oldValue = oldRow[srvcol.columns];
          
              return oldValue != newValue;
            }
          }
        };
      });

      let conditions = [{
        colName: "id",
        ruleType: "eq",
        valueExpr: "item.id"
      }]

      let itemsFunc = _ => {
        return vm.gridData.filter(item => item._dirtyFlags === "update");
      };


      let executor = {
        service: this.updateService,
        values: values,
        conditions: conditions,
        itemsFunc: itemsFunc,
        itemsPolicy: "servicePerItem",
        ignoreNullValue: true,
      };

      this.addInlineListExecutors(executor)

      return executor;
    }
    ,

    buildDeleteExecutor: function () {
      let vm = this;
      return {
        service: this.deleteService,
        conditions: [{
          colName: "id",
          ruleType: "in",
          required: true,
          valueFunc: () => {
            let ids = vm.gridData.filter(item => item._dirtyFlags === "delete").map(item => item.id);
            return _.join(ids, ",");
          }
        }],
      };
    }
    ,


    buildExecutors4Edit(listDataFunc) {
      return this.loadAddUpdateSrvCols().then(_ => {
        let executors = [];
        executors.push(this.buildAddExecutor(listDataFunc));
        executors.push(this.buildUpdateExecutor(listDataFunc));
        executors.push(this.buildDeleteExecutor(listDataFunc));

        return executors;
      })
    }
    ,

    isFkWithDispCol(srvcol) {
      let dispCol = `_${srvcol}_disp`
      return !!_.find(this.srv_cols, item => item.columns === dispCol);
    }
    ,

    isDirtyRow(row) {
      return (row._dirtyFlags && row._dirtyFlags !== 'pristine' && row._dirtyFlags !== 'standby')
    }
    ,


    getDirtyRowTagType(row) {
      if (this.isDirtyRow(row)) {
        let map = {
          add: "success",
          update: "warning",
          delete: "danger",
        };

        return map[row._dirtyFlags];
      }
    }
    ,

    getDirtyRowTagText(row) {
      if (this.isDirtyRow(row)) {
        let map = {
          add: "添加",
          update: "编辑",
          delete: "删除",
        };

        return map[row._dirtyFlags];
      }
    },
    getDateRangExpr:function(infoObj,e){
      /**
          * 处理子表默认值 引用主表from
          */
         let m = {
           min:null,
           max:null
         }
         if(infoObj.hasOwnProperty('moreConfig') && infoObj.editor === "DateRange" && infoObj.moreConfig.hasOwnProperty('DateRangeConfig')){
          let mainData = e
          let cfg = infoObj.moreConfig.DateRangeConfig
          if(cfg.hasOwnProperty('minDate')){
            if(cfg.minDate !== '' && cfg.minDate !== null &&  cfg.minDate !== undefined){
              if(cfg.minDate.indexOf('{') !== -1 && cfg.minDate.indexOf('}') !== -1){
                let minexp = cfg.minDate.match(/{(\S*)}/)[1]
                m.min = eval(minexp)
                if(m.min === null || m.min === undefined){
                  m.min = '1990-01-01'
                }
              }else{
                m.min = cfg.minDate
              }
            }else{
              m.min = '1990-01-01'
            }
          }else{
              m.min = '1990-01-01'
              
          }
          if(cfg.hasOwnProperty('maxDate')){
            if(cfg.maxDate !== '' &&  cfg.maxDate !== null &&  cfg.maxDate !== undefined){
              if(cfg.maxDate.indexOf('{') !== -1 && cfg.maxDate.indexOf('}') !== -1){
                let maxexp = cfg.maxDate.match(/{(\S*)}/)[1]
                m.max = eval(maxexp)
                if(m.max === null || m.max === undefined){
                  m.max = '2050-12-30'
                }
              }else{
                m.max = cfg.maxDate
              }
            }else{
              m.max = '2050-12-30'
            }
          }else{
            m.max = '2050-12-30'
          }
          
      }
         return m
   }


  },


  mounted: function () {
    this.$watch(function () {
        return this.gridData;
      },
      function (newVal, oldVal) {
        if (!this.listLoaded) {
          return;
        }

        this.$emit("grid-data-changed", this);
      },
      {
        deep: true
      });

  }
};
