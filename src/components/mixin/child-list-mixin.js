export default {
  methods: {


    onListLoaded: function (innerList) { 
      let refCol = this.foreignKey.column_name;
      let refTable = this.foreignKey.table_name;
      let refedCol = this.foreignKey.referenced_column_name;
      let refedTable = this.foreignKey.referenced_table_name;

      if(this.foreignKey.hasOwnProperty('relation_type') && this.foreignKey.relation_type == '服务'){
        refCol = this.foreignKey.ref_service_column;
        refTable = this.foreignKey.ref_service;
        refedCol = this.foreignKey.refed_service_column;
        refedTable = this.foreignKey.refed_service;


        // hide headers if srvcol comes from main table
        if (innerList != undefined) {
          innerList.gridHeader.filter(header => {
            let srvcol = header.srvcol;
            if (!srvcol) {
              return false
            }

            let isRefCol = srvcol.service_name == refTable && srvcol.columns == refCol;
            let isRefedDispCol = srvcol.service_name == refedTable && srvcol.columns;

            let hide = isRefCol || isRefedDispCol;
            

            return hide;
          }).forEach(header => {
            header.show = false;
          });
        }
      }else{
          // hide headers if srvcol comes from main table
        if (innerList != undefined) {
          innerList.gridHeader.filter(header => {
            let srvcol = header.srvcol;
            if (!srvcol) {
              return false
            }

            let isRefCol = srvcol.table_name == refTable && srvcol.columns == refCol;
            let isRefedDispCol = srvcol.table_name == refedTable && srvcol.columns == ("_" + refCol + "_disp");
            let hide = isRefCol || isRefedDispCol;
            return hide;
          }).forEach(header => {
            header.show = false;
          });
        }
      }
      


      if (this !== innerList) {
        
        this.$emit("list-loaded", this);
      }
    },


    onStandbyRowAdded: function (newRow) {
      let refCol = this.foreignKey.column_name;
      newRow[refCol] = this.getRefColValue;

      // hide extra fk condition cols and set values
      if (this.foreignKey.conditions) {
        this.foreignKey.conditions.forEach(item => {
          let refCol = item.colName
          newRow[refCol] = item.value

          
        })
      }
    },


    hiddRefColFieldInForm: function (form) {
      let refCol = this.foreignKey.column_name;
      let refColField = form.fields[refCol];
      refColField.info.visible = false;
    }
  }

};
