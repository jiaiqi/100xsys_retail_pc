<template>
  <div>
    <el-dialog  custom-class="bxdialog"  title="添加" width="90%" :close-on-click-modal="1==2" :visible="activeForm == 'add'" @close="activeForm = 'xx'" append-to-body>
      <simple-add name="add" ref="add-form" v-if="activeForm == 'add'" :service="service" :default-conditions="defaultConditions" :mainformDatas='listMainFormDatas' :default-condition="defaultCondition"  :childForeignkey='childForeignkey'  :default-values="defaultValues" @action-complete="onActionComplete($event)">
      </simple-add> 
     
      <!-- <add name="list-duplicatedeep" ref="duplicatedeep-form"
           v-if="activeForm == 'add'" :service="service"
           :default-conditions="defaultConditions"
           :submit2-db="storageType == 'db'"
           :haveDraft="false"
           :defaultValues="defaultValues"
           @action-complete="onActionComplete($event)"
           @form-loaded="onDuplicateFormLoaded"
           @submitted2mem="onAdd2MemSubmitted">
      </add> -->
       <!-- <add name="list-duplicatedeep" ref="duplicatedeep-form"
           v-if="activeForm == 'duplicatedeep'" :service="service"
           :default-conditions="defaultConditions"
           :submit2-db="storageType == 'db'"
           :parentPageType="listType"
           :haveDraft="isDraft"
           :pageName="'list-duplicatedeep'"
           :pageIsDraft="activeTabName"
           :defaultValues="defaultValues"
           @action-complete="onActionComplete($event)"
           @form-loaded="onDuplicateFormLoaded"
           @submitted2mem="onAdd2MemSubmitted">
      </add> -->
    </el-dialog>

    <el-dialog  custom-class="bxdialog"  title="编辑" width="90%" :close-on-click-modal="1==2"  :visible="activeForm == 'update'" @close="onCloseEvent()" append-to-body>
      <simple-update name="update" :appNo="customSrvApp" :init-load="initLoad" ref="update-form" v-if="activeForm == 'update'" :service="service" :default-conditions="defaultConditions" :default-values="defaultValues" @action-complete="activeForm = null">
      </simple-update>
    </el-dialog>

    <el-dialog  custom-class="bxdialog"  title="详情" width="90%" :close-on-click-modal="1==2" :visible="activeForm == 'detail'" @close="activeForm = 'xx'" append-to-body >
      <simple-detail name="detail" ref="detail-form" v-if="activeForm == 'detail'" :service="service" :default-conditions="defaultConditions" :default-values="defaultValues">
      </simple-detail>
    </el-dialog>

    <el-dialog  custom-class="bxdialog"  title="列表" width="90%" :close-on-click-modal="1==2" :visible="activeForm == 'list'" @close="activeForm = 'xx'" append-to-body >
      <list name="list" ref="list" v-if="activeForm == 'list'" :service="service" :default-condition="defaultConditions" list-type="list">
      </list>
    </el-dialog>

    <el-dialog  custom-class="bxdialog"  title="列表" width="90%"
               :close-on-click-modal="1==2" :visible="activeForm == 'treegrid'" @close="activeForm = 'xx'"
               append-to-body
    >
      <treegrid name="treegrid" ref="treegrid"
                v-if="activeForm == 'treegrid'" :service="service" :default-condition="defaultConditions"
      >
      </treegrid>
    </el-dialog>

    <el-dialog  custom-class="bxdialog"  title="编辑列表" width="90%" :close-on-click-modal="1==2" :visible="activeForm == 'editgrid'" @close="activeForm = 'xx'" append-to-body >

      <edit-grid name="editgrid" ref="editgrid" v-if="activeForm == 'editgrid'" :service="service">
      </edit-grid>
    </el-dialog>

    <!--列表加form操作-->
    <el-dialog  custom-class="bxdialog"  title="列表" width="90%" :close-on-click-modal="1==2" :visible="activeForm == 'list_update'" @close="activeForm = 'xx'" append-to-body >

      <simple-update  name="list-update-form" ref="list-update-form" :init-load="1==2" v-if="activeForm == 'list_update'" :service="service" :default-conditions="defaultConditions" :default-values="defaultValues" @action-complete="activeForm = null" @form-loaded="onFormLoaded('update')">

      </simple-update>

      <list name="list" :read-only="1==1" ref="list" v-if="activeForm == 'list_update'" :service="selectService" :default-condition="defaultConditions" list-type="list">
      </list>

    </el-dialog>


     <!--选择添加列表-->
     <el-dialog  custom-class="bxdialog"  title="添加列表" width="90%" :close-on-click-modal="1==2" :visible="activeForm == 'selectlist'" @close="activeForm = 'xx'" append-to-body >

        <list name="selectlist" ref="selectlist" v-if="activeForm == 'selectlist'" :service="service" :mapcondition="mapcondition" :default-condition="defaultConditions" list-type="addselectlist"  @action-complete="onListRefresh">
        </list>

    </el-dialog>

  </div>

</template>

<script>
import ExecutorMixin from "../mixin/executor-minx";
import Executor from "./executor.vue";
import SimpleAdd from "./simple-add.vue";
import add from "./add.vue";
import SimpleDetail from "./simple-detail.vue";
import SimpleUpdate from "./simple-update.vue";
import List from "./list.vue";
import Treegrid from "./treegrid.vue";
import EditGrid from "./edit-grid.vue";

export default {
  components: {
    EditGrid,
    Treegrid,
    List,
    SimpleUpdate,
    SimpleDetail,
    SimpleAdd,
    Executor,
    add
  },
  mixins: [ExecutorMixin],

  props: {
    initLoad:true,
    buttonInfo:{}
  },
  computed:{
     customSrvApp:function(){
       let app = localStorage.getItem("activeApp")
       if(this.buttonInfo && this.buttonInfo.application){
         app = this.buttonInfo.application
       }
       if(this.$srvApp){
         app = this.$srvApp
       }

       return app
     }
  },
  data() {
    return {
      activeForm: null,
      service: null,
      selectService: null,
      defaultConditions: [],
      defaultValues: null,
      mapcondition:{},
      childForeignkey:null,
      defaultCondition:null,
      listMainFormDatas:null
    };
  },

  mounted: function() {
    //console.log("dialog props srvapp",this.srvApp)
  },

  methods: {
    onFormLoaded(operate_type) {
      var me = this;
      let form = this.$refs["list-update-form"];
      var srv_cols=form.srvCols;

      for(var field of srv_cols){
        if(!field.batch_col){

          if(form.fields[field.table_column]!=undefined){
              form.fields[field.table_column].info.visible=false;
          }

        }
      }
    },
    onCloseEvent(){


        if(this.buttonInfo!=undefined && this.buttonInfo!=null){

           var suffix_actions = this.buttonInfo.suffix_actions;

          if (suffix_actions == 'refresh') {
             window.location.reload();
          }


        }
          this.activeForm='xx';


    },
    onListRefresh(){
      this.$emit("list-loaded", this);

      // this.activeForm=null;

    },
    onActionComplete(e){

      if(e !== 'reset'){
        this.activeForm='xx'
      }
      //console.log("onActionComplete",e)
      if(e==='save_draft'||e==='submit'){
         window.location.reload()
      }
    }
  }
};
</script>

<style scoped>
.bx_action {
  margin-left: 3px;
  margin-right: 3px;
}
</style>



