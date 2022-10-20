<template>
  <div>

    <list ref="list" :list-type="listType" :storage-type="storageType"
          :default-order="defaultOrder" :service="service"
          :foreign-key="foreignKey"
          :listMainFormDatas="mainData"
          :name="name" :default-condition="defaultCondition"
          :inplace-edit="inplaceEdit"
          @list-loaded="onListLoaded($event)"
          @add-form-loaded="onAddFormLoaded($event)"
          @update-form-loaded="onUpdateFormLoaded($event)">
    </list>

  </div>

</template>

<script>
  import List from "./list.vue";
  import Vue from "vue";

  export default {
    components: {
      List
    },

    mixins: [],

    data() {
      return {
        listInstance: null
      };
    },
    props: {
      service: {
        type: String
      },
      listType: {
        type: String,
        default: function () {
          return "addchildlist";
        }
      },
      defaultOrder: {
        type: Array,
        default: function () {
          return [];
        }
      },
      foreignKey: {
        type: Object
      },
      mainData:{
        type: Object,
        default: function () {
          return null;
        }
      },
      defaultCondition: {
        type: Array,
        default: function () {
          return [];
        }
      },
      name: {
        type: String
      },

      inplaceEdit: {
        type: Boolean,
        default: false
      },

      storageType: {
        type: String,
        default: 'mem'
      }
    },

    methods: {
      getListData: function () {
        var operateData = [];
        var listData = this.listInstance.gridData;
        var serviceCols = this.listInstance.serviceCols;

        for (var itemData of listData) {
          if (
            itemData._dirtyFlags == "add" ||
            itemData._dirtyFlags == "update" ||
            itemData._dirtyFlags == "delete"
          ) {
            delete itemData.is_leaf;
            operateData.push(itemData);
          }
        }
        return operateData;
      },

      onListLoaded: function (listIns) {
        this.listInstance = listIns;
      
            this.$emit("list-loaded", listIns);
        this.$emit("proc-simple-list-loaded", this);

        if (this.foreignKey != undefined) {
          let refCol = this.foreignKey.column_name;
          let refTable = this.foreignKey.table_name;
          let refedCol = this.foreignKey.referenced_column_name;
          let refedTable = this.foreignKey.referenced_table_name;

          // hide headers if srvcol comes from main table
          let list = this.$refs.list;
          list.gridHeader
            .filter(header => {
              let srvcol = header.srvcol;
              let isRefCol =
                srvcol.table_name == refTable && srvcol.columns == refCol;
              let isRefedDispCol =
                srvcol.table_name == refedTable &&
                srvcol.columns == "_" + refCol + "_disp";

              let hide = isRefCol || isRefedDispCol;
             

              return hide;
            })
            .forEach(header => {
              header.show = false;
            });
        }
      },
      /**
       * hide ref column and set a vaue
       * @param form
       */
      onAddFormLoaded: function (form) {
        
        if(this.foreignKey){

            let refCol = this.foreignKey.column_name;
            let refColField = form.fields[refCol];

            if (refColField) {
              refColField.info.visible = false;
              refColField.setSrvVal(this.getRefColValue);
            }


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
        let refColField = form.fields[refCol];
        if (refColField) {
          refColField.info.visible = false;
        }
      },

      hiddRefColFieldInForm: function (form) {
        if(this.foreignKey&&this.foreignKey.column_name){

          let refCol = this.foreignKey.column_name;
          let refColField = form.fields[refCol];
          refColField.info.visible = false;
        }
  
      }
    }
  };
</script>



