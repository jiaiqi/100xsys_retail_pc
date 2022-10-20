import {FieldInfo} from '../model/FieldInfo'
import {Field} from '../model/Field'
import Vue from 'vue'


export default {
  props: {
    mode: {
      type: String
    },
  },

  data() {
    return {
      activeForm: null,
      clickedRow: {},
    }
  },

  computed: {
    getAddService: function () {
      let addButton = this.gridButton.filter(item => item.button_type === "add");
      if (addButton && addButton.length > 0) {
        return addButton [0].service_name
      } else {
        return this.mainTable && (this.mainTable.replace("bx", "srv") + "_add")
      }
    },

    getUpdateService: function(){
      let srv = ""
      if(this.rowButtonActiveServiceName){
        srv = this.rowButtonActiveServiceName
      }else {
        srv = this.mainTable && (this.mainTable.replace("bx", "srv") + "_update")
      }
      return srv
    },

    getDefaultCondition4Duplicate: function () {
      let list = this;
      let condition = {
        colName: "id",
        ruleType: "eq",
        valueFunc: _ => list.clickedRow["duplicate"].id,
      }

      return [condition];
    },

    getDefaultCondition4DuplicateDeep: function () {
      let list = this;
      let condition = {
        colName: "id",
        ruleType: "eq",
        valueFunc: _ => list.clickedRow["duplicatedeep"].id,
      }

      return [condition];
    },

  },
  methods: {
    onFilterFormLoaded: function (form) {
     

      this.$emit('filter-form-loaded', form);
    },

    onAddFormLoaded: function (form) {
      
      if (form.actions.submit) {
        form.actions.submit.nav2Location = null;
      }

      this.$emit('add-form-loaded', this.$refs['add-form']);
    },

    onUpdateFormLoaded: function (form) {
      
      if (form.actions.submit) {
        form.actions.submit.nav2Location = null;
      }

      this.$emit('update-form-loaded', this.$refs['update-form']);
    },


    onAddChildFormLoaded() {
      let form = this.$refs['add-child-form'];
      form.actions.submit.nav2Location = null;

      let row = this.clickedRow["add-child"];
      if (row) {
        let parentNoField = form.fields[this.parentCol];
        parentNoField.setSrvVal(row[this.noCol]);
      }

      this.$emit('add-child-form-loaded', this.$refs['add-child-form']);
    },

    onDuplicateFormLoaded(form) {
      form.actions.submit.nav2Location = null;

      // mask special fields like password:
      Object.values(form.fields).filter( field => field.info.type === "Password").forEach(field => field.setSrvVal(null))

      this.$emit('duplicate-form-loaded', form);
    },

    onAddFormActionComplete(action) {
      if (action == 'submit' || action == 'save_draft') {
        this.activeForm = null;
      }

      if (!this.isMem()) {
        this.loadTableData();
      }
    },

    onUpdateFormActionComplete(action) {
      if (action == 'submit' || action == 'save_draft') {
        this.activeForm = null;
      }

      if (!this.isMem()) {
        this.loadTableData();
      }
    },

    onAddChildFormActionComplete(action) {
      if (action == 'submit' || action == 'save_draft') {
        this.activeForm = null;
      }

      if (!this.isMem()) {
        this.loadTableData();
      }
    },

    getClickedRowPk(type) {
      if (this.clickedRow && this.clickedRow[type] && this.clickedRow[type].id) {
        return this.clickedRow[type].id.toString()
      } else {
        return null;
      }
    },

    onAddClicked() {
      this.activeForm = "add";
    },

    onAddListClicked() {
      this.activeForm = "addlist";
    },

    onUpdateClicked(row) {
      
      let self = this
      let type = 'update';
      //  let rowData = {}

      //  this.clickedRow = Object.assign(rowData,row)
      this.$set(this.clickedRow, type, row);
      this.$nextTick(_ => {
        this.activeForm = 'update';
      });
    },
    onCustomizeImport(row,button) {
      let type = 'customizeImport';
      this.$set(this.clickedRow, type, row);
      this.importService = button.operate_service
      this.$nextTick(_ => {
        this.activeForm = 'customizeImport';
        this.importService = button.operate_service
      });
    },
    onAddChildClicked(row) {
      this.$set(this.clickedRow, 'add-child', row);
      this.activeForm = "add-child";
    },

    onDuplicateClicked(row) {
      this.$set(this.clickedRow, 'duplicate', row);
      if (this.inplaceEditMode) {
        this.duplicateRowInplace(row)
      } else {
        this.activeForm = "duplicate";
      }
    },

    onDuplicateDeepClicked(row) {
      this.$set(this.clickedRow, 'duplicatedeep', row);
      this.activeForm = "duplicatedeep";
    },

    onRowDbClicked(row, event) {
      this.$emit('row-dbclick', row, event);
    },

    toggleFilters: function (item) {
      if (this.selectFormShow === true) {
        this.selectFormShow = false;
        item.button_cls = null
      } else {
        this.selectFormShow = true;
        item.button_cls = 'success'
      }
    },


  }
};
