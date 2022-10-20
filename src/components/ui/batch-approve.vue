/* */
<template>
  <!--审批表单-->
    <el-form :model="approval_form" ref="approval_form">
        <el-row>
            <div class="el-col el-col-24 el-col-xl-24">
            <div class="el-form-item">
                <span class="section-title">点击“确认”完成操作,操作后无法撤销,请谨慎操作！</span>
            </div>
            </div>

            <el-col :span="24" v-show="isShowApprovalOptions">

            <el-form-item label="意见" prop="proc_result" :rules="{required: true, message: '审批意见不能为空', trigger: 'change'}">

                <el-radio border v-for="item in approvalOptionsRun" :key="item.value" v-model="approval_form.proc_result" :label="item.value">{{item.disp}}
                </el-radio>

            </el-form-item>

            </el-col>

            <!-- <el-col :span="6" v-if="approval_form.proc_result=='turn'">

            <el-form-item label="转派用户" prop="turn_user_no" :rules="{required: true, message: '用户不能为空', trigger: 'change'}">

                <el-select @focus="findTurnUser('')" v-model="approval_form.turn_user_no" filterable remote placeholder="请选择转派用户" :remote-method="findTurnUser">

                <el-option v-for="item in approval_form.userOptions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>

                </el-select>

            </el-form-item>

            </el-col> -->

            <!-- <el-col :span="24" v-if="approval_form.proc_result=='return'">

            <el-form-item label="返回步骤" prop="step_no" :rules="{required: true, message: '步骤不能为空', trigger: 'change'}">

                <el-radio border v-for="item in proHanleData.return_options" :key="item.value" v-model="approval_form.step_no" :label="item.value">{{item.disp}}
                </el-radio>

            </el-form-item>

            </el-col> -->

            <!-- <el-col :span="24">
            <el-form-item label="审批意见" prop="remark">
                <el-input type="textarea" v-model="approval_form.remark" :autosize="{ minRows: 4, maxRows: 6}"></el-input>
            </el-form-item>
            </el-col>

            <el-col :span="24" v-if=" approval_form.proc_result !== ''">

            <el-form-item label="附件" prop="file_no" >

                <upload-file :field="uplaodFiled"></upload-file>
            </el-form-item>

            </el-col> -->

            <el-col :span="24">
            <el-row type="flex" class="row-bg" justify="center">
                <el-form-item>
                <el-button type="primary" @click="submitApproval('approval_form',false)">确认
                </el-button>

                <!-- <el-button @click="resetForm('approval_form')">重置
                </el-button> -->

                </el-form-item>
            </el-row>
            </el-col>

        </el-row>
    </el-form>
</template>

<script>
import procV2Mixin from "../mixin/proc-v2-mixin";  // 弹出列表js
  export default {
    components: {

    },
    mixins: [
      procV2Mixin
    ],
    props: {
      approvalOptions:{
            type:Array,
            default(){
                return []
            }
        },
        approvaList:{
            type:Array,
            default(){
                return []
            }
        }
    },

    computed: {
        approvalOptionsRun(){
            let options = this.approvalOptions
            if(this.approvalOptions === 0){
                return [
                    {  // 列表审批默认选项
                    disp:"通过",
                    value:"pass"
                }]
            }else{
                return options
            }
        },
      getOptions() {
        return this.field.info.srvCol.option_list_v2.options;
      }
    //   {  // 列表审批默认选项
    //     disp:"通过",
    //     value:"pass"
    //   }
    },


    data() {
      return {
        selected: [],
        uplaodFiled: {
            info: {
            editable: true
            },
            fileDesc: "请上传文件,大小不超过50MB",
            fileSize: 6200,
            fileType: "",
            model: ""
        },
        approval_form: {
            proc_result: "",
            remark: "",
            file_no: "",
            turn_user_no: "",
            turn_step_no: "",
            step_no: "",
            userOptions: []
        },
        isShowApprovalOptions:true  // 是否显示审批选项
      }
    },

    watch: {
      selected() {
        this.field.model = (this.selected || []).join(",");
      }
    },

    methods: {
      setSrvVal(srvVal) {
        this.field.model = srvVal;
        !!srvVal && (this.selected = [...srvVal.split(",")]);
      },
       initApproveForm(){
           let self = this
           let approvalOptions = this.approvalOptions
           if(self.approvalOptions && self.approvalOptions.length === 1){
               self.$set(self.approval_form,'proc_result',self.approvalOptions[0].value)
            //    self.approval_form.proc_result = self.approvalOptions[0].value
            //    self.isShowApprovalOptions = false  // 一项时不显示选项
           }
       },
       submitApproval(formName){
           let rows = this.approvaList
           let approveForm = this.approval_form
           let req = this.buildApproveForm(rows,approveForm)
           this.$refs[formName].validate((valid) => {
             if (valid) {
                this.submitApprovalForm(req)
            } else {
                console.log('error submit!!');
                return false;
            }
        });
           
       },
       buildApproveForm(rows,approveForm){
           let row = rows
           let res = []
           for(let i = 0;i<row.length;i++){
               let rowApproveReq = {
                    "proc_instance_no": row[i].proc_instance_no,
                    // "step_no": "demo_02",
                    "proc_data_type": "submit",
                    "data": [
                        approveForm
                    ]
                }
                res.push(rowApproveReq)
            }
            console.log(res)
            return res
           
       }

    },

    created: function () {
    },

    mounted: function () {
         this.initApproveForm() // 初始化审批表单数据
    }
  }
</script>

