/* */
<template>
  <list service="srvsys_column_encrypt_cfg_select"
        ref="list"
        @list-loaded="onListLoaded"
        @add-form-loaded="onAddFormLoaded"
        @filter-form-loaded="onFilterFormLoaded"
  >
  </list>
</template>

<script>
import List from "../components/common/list";

export default {
  components: {
    List,
  },

  data() {
    return {}
  },

  mounted: function() {


  },

  methods: {
    onListLoaded(list) {
      // TODO: hide buttons

      // hide columns
      list.gridHeader.forEach( header => {
        if( header.column === "_column_name_disp"){
          header.show = true
          header.label = "字段"
        }

        if( header.column === "biz_path"){
          header.show = false
        }
      })


    },

    onFilterFormLoaded(form) {
      form.fields.modify_time.info.visible = false;
      form.fields.modify_user_disp.info.visible = false;
      form.fields.biz_path && (form.fields.biz_path.info.visible = false)
    },

    onAddFormLoaded(form) {
      form.fields.biz_path && (form.fields.biz_path.info.visible = false);

      // for table change editor to finder, provide a predefined tables
      let tableNameField = form.fields.table_name;
      tableNameField.info.type = "fk";
      tableNameField.info.editor = "finder";
      tableNameField.info.dispCol = "table_label";
      tableNameField.info.valueCol = "table_name";
      tableNameField.info.resolveColspan("0.5")
      tableNameField.info.dispLoader  =  {
        service: "srvsys_table_defined_select",
        conditions: [
          {
            colName: "table_name",
            ruleType: "eq",
            literalValue: true,
            value: "bxvx_personal_basic_info"
          }
        ]
      };

      // for columns write a select service,
      let columnNameField = form.fields.column_name;
      columnNameField.info.editor = "finder";
      columnNameField.info.type = "bxsys_column_fake";
      columnNameField.info.dispCol = "label";
      columnNameField.info.valueCol = "column_name";
      columnNameField.info.noSearchIcon = true;
      columnNameField.info.dispLoader = {
        enableFunc: _ => {
          return !!tableNameField.getSrvVal();
        },
        service: "srvsys_encryptable_column_select",
        conditions: [{
          colName: "table_name",
          ruleType: "eq",
          valueFunc: _ => tableNameField.model.table_name,
        }]
      };

      // change service name
      form.actions.submit.executor.service= "srvsys_column_encrypt_cfg_java_add";
    }
  }
}
</script>
