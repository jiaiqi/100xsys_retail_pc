<template>
<div>
  <el-table :data="tableData" border class="tb-edit" style="width: 100%" highlight-current-row @row-click="handleCurrentChange" >
    <el-table-column :prop="data.columns"  :label="data.label" v-for="(data, index) in tableHeadr":key="index" width="180px" >
        <template slot-scope="scope">
           <div v-if="is_edit">
             <!-- <raw-field-editor :field="scope.row[data.columns].field" :key="scope.row[data.columns].field.info.name" ref="fields"  @field-value-changed="handleEdit(scope.$index, scope.row)" ></raw-field-editor> -->
              <el-select size="small" v-if = "data.col_type === 'Enum' || data.col_type === 'Dict'" v-model="scope.row[data.columns].value" placeholder="请选择" @change="handleEdit(scope.$index, scope.row)">>
                <el-option v-for="item in data.option_list_v2":key="item.value" :label="item.key" :value="item.value"></el-option>
              </el-select>
              <el-date-picker v-else-if="data.col_type === 'datetime'" v-model="scope.row[data.columns].value" type="datetime" clearable placeholder="选择日期时间" @change="handleEdit(scope.$index, scope.row)">
              </el-date-picker>
              <finder v-else-if="scope.row[data.columns].field.info.editor === 'finder'" :field="scope.row[data.columns].field" ref="editor" @field-value-changed="$emit('field-value-changed', scope.row[data.columns].field.info.name)">
              </finder>
              <tree-finder v-else-if="scope.row[data.columns].field.info.editor === 'tree-finder'" :field="scope.row[data.columns].field" ref="editor" @field-value-changed="$emit('field-value-changed', scope.row[data.columns].field.info.name)">
              </tree-finder>
              <el-input size="small" v-else v-model="scope.row[data.columns].value" placeholder="请输入内容" @change="handleEdit(scope.$index, scope.row)"></el-input>
           </div>
          <span v-if="!is_edit">{{scope.row[data.columns].value}}</span>
      </template>
    </el-table-column>
    <el-table-column label="操作">
        <template slot-scope="scope">
            <!--<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>-->
            <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
    </el-table-column>
  </el-table>
  <el-button type="primary" @click="onEdit()">批量编辑</el-button>
  <el-button type="primary" @click="onSubmit()">批量保存</el-button>
</div>
</template>


<script>
import Vue from 'vue'
import _ from "lodash"
import { FieldInfo } from "../model/FieldInfo";
import { Field } from "../model/Field";
import RawFieldEditor from "./raw-field-editor.vue";
import Finder from '../ui/finder.vue'
import TreeFinder from "../ui/tree-finder.vue";

export default {
  components: {
    Finder,
    TreeFinder,
    RawFieldEditor
  },

  props:{
    service: {
      type: String,
    }
  },

  data() {
    return {
      tableHeadr: [],
      tableData: [],
      old_tableData: [],//原始数据
      service_name: this.service || this.$route.params.service_name,
      operate_params:{},
      is_edit:false//是否编辑
    };
  },
  created: function() {
    // 组件创建完后获取数据，
    this.getData();
  },
  methods: {
    getData() {
      let condition
      let page
      let order
      if(this.$route && this.$route.query && this.$route.query.operate_params ){
        this.operate_params = JSON.parse(this.$route.query.operate_params)
        condition = this.operate_params.condition
        page = this.operate_params.page
        order = this.operate_params.order
      }
      this.tableHeadr = []
      this.tableData = []
      this.old_tableData = []
      this.loadColsV2(this.service_name, 'list').then(response => {
        let srv_cols = response.body.data.srv_cols
          for(let i in srv_cols){
            let fieldInfo = new FieldInfo(srv_cols[i], null);
            let field = new Field(fieldInfo);
            //只显示列表 或者将外键的使用in_add
            if((srv_cols[i].in_list == '1' && srv_cols[i].columns.indexOf('_disp') == -1) || (field.info.editor == 'finder'|| field.info.editor == 'tree-finder')){
              this.tableHeadr.push(srv_cols[i])
            }
          }
          this.select(this.service_name, condition, page, order).then(response => {
            let list = response.body.data
            this.old_tableData = this.onExtend(list)
            for(let key in list){
              for(let key1 in this.tableHeadr){
                let fieldInfo1 = new FieldInfo(this.tableHeadr[key1], null);
                let field1 = new Field(fieldInfo1);
                let column = this.tableHeadr[key1].columns
                let value = list[key][column]
                list[key][column] = {}
                list[key][column].value = value
                if(fieldInfo1.isFinder()){//判断是否是外键finder，如果是则要显示_disp的值
                  list[key][column].value = list[key]['_'+column+'_disp']
                }
                Vue.set(list[key][column], "field", field1);
                list[key][column].field.setSrvVal(value)
              }
              let val = list[key].id
              list[key].id = {}
              list[key].id.value = val
            }
            for(let key2 in list){//将不是列表中的数据去掉
              for(let key3 in list[key2]){
                if(key3 != 'id' && (list[key2][key3] == null || list[key2][key3].field == null)){
                  delete list[key2][key3]
                }
              }
            }
            this.tableData = list
          });
        })
    },

    handleCurrentChange(row, event, column) {

    },

    handleEdit(index, row) {
      let slef = this;
      if (index + 1 == slef.tableData.length) {
        //如果当前行是空行的话那么就追加一个空行到列表中
        let map = {id:{value:''}};
        for (let i in slef.tableHeadr) {
          let fieldInfo1 = new FieldInfo(this.tableHeadr[i], null);
          let field1 = new Field(fieldInfo1);
          map[slef.tableHeadr[i].columns] = {}
          Vue.set(map[slef.tableHeadr[i].columns], "field", field1);
          map[slef.tableHeadr[i].columns].value = '';
        }
        slef.tableData.push(map);
      }

    },
    handleDelete(index, row) {
      this.tableData.splice(index, 1);

    },
    onSubmit(){//比较数据 将需要删除、更新、新增的数据单独提出来
      let deleteLits = []
      let addList = []
      let updateList = []
      let list = this.onExtend(this.tableData);
      let old_list = this.onExtend(this.old_tableData)
      for(let i in list){
        if(list[i].id == null || list[i].id.value == ''){//如果id为空说明是新增的列表
            let isEmpty = true
            for(let item in list[i]){//判断是否只是空行
              if(list[i][item].value != ''){
                isEmpty = false
                break
              }
            }
            if(!isEmpty){
              addList.push(this.tableData[i])
              list.splice(i,1)
              i--
              continue
            }
        }
        for(let j in old_list){
          if(list[i].id.value == old_list[j].id){//如果id相等则比较对象是否不同
            let map = this.compareO(list[i],old_list[j])
            if(Object.getOwnPropertyNames(map).length > 1){//如果对象中有除了ID以外的值则为需要更新的值
              updateList.push(list[i])
            }
            old_list.splice(j,1)//如果相等就移除该对象则最后剩下的就是要删除的
            j--
            continue
          }
        }
      }
      deleteLits = old_list

      let params = []
      let add_obj = {
        'serviceName':this.service_name.replace('select', 'add'),
        'data':[]
      }
      if(addList.length > 0){
        for(let i in addList){
          let add_obj_data = {}
          delete addList[i].id//删除id 对象
          delete addList[i].create_user//删除create_user 对象
          delete addList[i].create_time//删除create_time 对象
          delete addList[i].modify_user//删除modify_user 对象
          delete addList[i].modify_time//删除modify_time 对象
          delete addList[i].create_user_disp//删除create_user_disp 对象
          delete addList[i].modify_user_disp//删除modify_user_disp 对象
          for(let key in addList[i]){
            if(addList[i][key].field != null && (addList[i][key].field.info.editor === 'finder'|| addList[i][key].field.info.editor === 'tree-finder')){
              add_obj_data[key] = addList[i][key].field.getSrvVal()
            }else{
              add_obj_data[key] = addList[i][key].value
            }
          }
          add_obj.data.push(add_obj_data)
        }
        params.push(add_obj)
      }
      if(updateList.length > 0){
        for(let i in updateList){
          let update_obj = {
            'serviceName':this.service_name.replace('select', 'update'),
            'data':[],
            'condition':[]
          }
          var update_obj_data = {}
          delete updateList[i].create_user//删除create_user 对象
          delete updateList[i].create_time//删除create_time 对象
          delete updateList[i].modify_user//删除modify_user 对象
          delete updateList[i].modify_time//删除modify_time 对象
          delete updateList[i].create_user_disp//删除create_user_disp 对象
          delete updateList[i].modify_user_disp//删除modify_user_disp 对象
          for(let key in updateList[i]){
            if(updateList[i][key].field != null && (updateList[i][key].field.info.editor === 'finder'|| updateList[i][key].field.info.editor === 'tree-finder')){
              update_obj_data[key] = updateList[i][key].field.getSrvVal()
            }else{
              update_obj_data[key] = updateList[i][key].value
            }
          }
          let update_obj_condition = {
            "colName": "id",
            "value": update_obj_data.id,
            "ruleType": "eq"
          }
          update_obj.data.push(update_obj_data)
          update_obj.condition.push(update_obj_condition)
          params.push(update_obj)
        }
      }
      if(deleteLits.length > 0){
        for(let i in deleteLits){
          let delete_obj = {
            'serviceName':this.service_name.replace('select', 'delete'),
            'condition':[]
          }
          let delete_obj_condition = {
            "colName": "id",
            "value": deleteLits[i].id,
            "ruleType": "eq"
          }
          delete_obj.condition.push(delete_obj_condition)
          params.push(delete_obj)
        }
      }

      if(params.length == 0){
        this.$message.error('没有修改的数据');
      }else{
        this.operate(params).then(response => {
          if(response.body.state === 'SUCCESS'){
            this.is_edit = false
            this.getData()
            this.$message.info(response.body.resultCode);
          }else{
            this.$message.error(response.body.resultMessage);
          }
        });
      }
    },
    compareO(o1,o2){//比较两个对象是否相等，返回比较的数据
      for(let i in o1){
        for(let j in o2){
          if(i != 'id' && i == j){
            if(o1[i].field.info.editor === 'finder' || o1[i].field.info.editor === 'tree-finder'){
              if(o1[i].field.getSrvVal() != o2[i]){
                //return false
              }else{
                delete o1[i]
              }
            }else{
              if(o1[i].value != o2[j]){
                //return false
              }else{
                delete o1[i]
              }
            }
          }
        }
      }
      return o1
    },
    onEdit(){
      this.is_edit = true
    },
    //实现JS数组的深拷贝不引用
    onExtend(list){
      let arr  = []
      let obj = _.cloneDeep ( list)
      for(let i in obj){
        arr.push(obj[i])
      }
      return arr
    },

  }
};
</script>
<style scoped>
/* .tb-edit .edit {
  display: none;
}
.tb-edit .current-row .edit {
  display: block;
}
.tb-edit .current-row .edit + span {
  display: none;
} */
</style>
