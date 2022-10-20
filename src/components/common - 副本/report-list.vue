<template>
    <div id="table-view" ref="tableView" style="height:calc(100vh - 70px)">
        <div v-if="isShowList">
            <el-row :gutter="20" style="padding:2px;font-weight: 600;">
                <el-col :span="12">
                    <span style="font-size:18px;">{{reportTitle }}</span>
                </el-col>
                <el-col :span="12"  style="text-align:right">
                    <el-button type="success " size="small" icon="el-icon-download" @click="exportExcel('out-table-data',reportTitle)">导出Excel</el-button>
                    <el-button type="primary" size="small" icon="el-icon-refresh" @click="getReportData">刷新</el-button>
                </el-col>
            </el-row>
        <el-table
            header-row-class-name="reportview"
            border
            stripe
            fit
            v-loading="loading"
            row-key="colkey"
            :height="tableHeight"
            id="out-table"
            :data="tableData"
            :summary-method="getSummaries"
            show-summary
            style="width: 100%">
            <el-table-column
            fixed
            align="center"
            type="index"
            width="60">
            </el-table-column>
            <el-table-column
            :width="headerItem.hasOwnProperty('width') ? headerItem.width : ''"
            :align="headerItem.hasOwnProperty('align') ? headerItem.align : 'center'"
            :prop="headerItem.colkey"
            :label="headerItem.label"
            :key="headerIndex"
            v-for="(headerItem,headerIndex) in reportHead">
            <!-- :show-overflow-tooltip="true" -->
            
                <template slot-scope="scope" v-if="!headerItem.hasOwnProperty('child')">
                    <!-- // 没有和并列时 --> 
                    <el-dropdown trigger="click"  placement="bottom"  @command="onDims" v-if="headerItem.isdrill && headerItem.drill_dim.length >1 && scope.row[headerItem.colkey]">
                        <span class="el-dropdown-link"  style="color:#0087ff">
                           {{dataformat(scope.row[headerItem.colkey],headerItem)}}
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item  v-for="(dimone,dimIndexone) in headerItem.drill_dim" :key="dimIndexone">
                                <span @click="onDims(headerItem,scope.row,headerItem,dimone)">{{dimone.report_name}}</span>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                        <span style="color:#0087ff"  @click="onDims(headerItem,scope.row,headerItem,headerItem.drill_dim[0])" v-else-if="headerItem.isdrill && headerItem.drill_dim.length == 1 && scope.row[headerItem.colkey] !== null && scope.row[headerItem.colkey] !== ''">
                            {{dataformat(scope.row[headerItem.colkey],headerItem)}}
                            <!-- {{ scope.row[headerItem.colkey] }} -->
                        </span>
                        <span v-else @click="onDims(false)">
                        
                                {{dataformat(scope.row[headerItem.colkey],headerItem)}}
                        <!-- {{ scope.row[headerItem.colkey] }} -->
                        </span>
                </template>
                <el-table-column 
                    :width="headerItem.hasOwnProperty('width') ? headerItem.width : ''"
                    :align="headerItem.hasOwnProperty('align') ? headerItem.align : 'center'"
                    v-if="headerItem.hasOwnProperty('child')"
                    :key="i"
                    v-for="(item,i) in headerItem.child"
                    :prop="item.colkey"
                    :label="item.label">
                    <template slot-scope="scope" v-if="!item.hasOwnProperty('child')">
                            <!-- // 没有和并列时 -->
                            <el-dropdown trigger="click" placement="bottom" @command="onDims" v-if="item.isdrill && item.drill_dim.length >1 && scope.row[item.colkey]">
                                <span class="el-dropdown-link"  style="color:#0087ff">
                                    {{dataformat(scope.row[item.colkey],item)}}
                                </span>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item  v-for="(dimTwo,dimIndexTwo) in item.drill_dim" :key="dimIndexTwo">
                                        <span @click="onDims(item,scope.row,headerItem,dimTwo)">{{dimTwo.report_name}}</span>
                                        <!-- {{dimTwo.report_name}} -->
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                            <span style="color:#0087ff" @click="onDims(item,scope.row,headerItem,item.drill_dim[0])" v-else-if="item.isdrill && item.drill_dim.length == 1 && scope.row[item.colkey] !== null && scope.row[item.colkey] !== ''">
                                <!-- {{ scope.row[item.colkey] }} -->
                                {{dataformat(scope.row[item.colkey],item)}}
                                </span>
                            <span v-else  @click="onDims(false)">
                                {{dataformat(scope.row[item.colkey],item)}}
                                <!-- {{ scope.row[item.colkey] }} -->
                                </span>
                        </template>
                    <el-table-column 
                        :width="headerItem.hasOwnProperty('width') ? headerItem.width : ''"
                        :align="headerItem.hasOwnProperty('align') ? headerItem.align : 'center'"
                        align="center"
                        v-if="item.hasOwnProperty('child')"
                        :key="j"
                        v-for="(childItem,j) in item.child"
                        :prop="childItem.colkey"
                        :label="item.label">
                       
                         <template slot-scope="scope" v-if="!childItem.hasOwnProperty('child')">
                            <!-- // 没有和并列时 -->
                            <el-dropdown trigger="click"  placement="bottom" @command="onDims" v-if="childItem.isdrill && childItem.drill_dim.length >1 && scope.row[childItem.colkey]">
                                <span class="el-dropdown-link"  style="color:blue">
                                    {{ scope.row[childItem.colkey] }}
                                </span>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item v-for="(dimThree,dimIndexThree) in childItem.drill_dim" :key="dimIndexThree">{{dimThree.report_name}}</el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                            <span style="color:blue" @click="onDims(childItem.drill_dim[0])" v-else-if="childItem.isdrill && childItem.drill_dim.length == 1">{{ scope.row[item.colkey] }}</span>
                            <span v-else  @click="onDims(false)">{{ scope.row[childItem.colkey] }}</span>
                        </template>
                    </el-table-column>
                </el-table-column>
            </el-table-column>

        </el-table>
        <el-table
            header-row-class-name="reportview"
            v-show="false"
            v-loading="loading"
            row-key="colkey"
            :height="tableHeight"
            id="out-table-data"
            :data="tableData"
            :summary-method="getSummaries"
            show-summary
            style="width: 100%">
            <el-table-column
            fixed
            align="center"
            type="index"
            width="60">
            </el-table-column>
            <el-table-column
            :width="headerItem.hasOwnProperty('width') ? headerItem.width : ''"
            :align="headerItem.hasOwnProperty('align') ? headerItem.align : 'center'"
            :prop="headerItem.colkey"
            :label="headerItem.label"
            :key="headerIndex"
            v-for="(headerItem,headerIndex) in reportHead">
            <!-- :show-overflow-tooltip="true" -->
            
                <template slot-scope="scope" v-if="!headerItem.hasOwnProperty('child')">
                    <!-- // 没有和并列时 --> 
                    <el-dropdown trigger="click"  placement="bottom"  @command="onDims" v-if="headerItem.isdrill && headerItem.drill_dim.length >1 && scope.row[headerItem.colkey]">
                        <span class="el-dropdown-link"  style="color:#0087ff">
                           {{dataformat(scope.row[headerItem.colkey],headerItem)}}
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item  v-for="(dimone,dimIndexone) in headerItem.drill_dim" :key="dimIndexone">
                                <span @click="onDims(headerItem,scope.row,headerItem,dimone)">{{dimone.report_name}}</span>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                        <span style="color:#0087ff"  @click="onDims(headerItem,scope.row,headerItem,headerItem.drill_dim[0])" v-else-if="headerItem.isdrill && headerItem.drill_dim.length == 1 && scope.row[headerItem.colkey] !== null && scope.row[headerItem.colkey] !== ''">
                            {{dataformat(scope.row[headerItem.colkey],headerItem)}}
                            <!-- {{ scope.row[headerItem.colkey] }} -->
                        </span>
                        <span v-else @click="onDims(false)">
                        
                                {{dataformat(scope.row[headerItem.colkey],headerItem)}}
                        <!-- {{ scope.row[headerItem.colkey] }} -->
                        </span>
                </template>
                <el-table-column 
                    :width="headerItem.hasOwnProperty('width') ? headerItem.width : ''"
                    :align="headerItem.hasOwnProperty('align') ? headerItem.align : 'center'"
                    v-if="headerItem.hasOwnProperty('child')"
                    :key="i"
                    v-for="(item,i) in headerItem.child"
                    :prop="item.colkey"
                    :label="item.label">
                    <template slot-scope="scope" v-if="!item.hasOwnProperty('child')">
                            <!-- // 没有和并列时 -->
                            <el-dropdown trigger="click" placement="bottom" @command="onDims" v-if="item.isdrill && item.drill_dim.length >1 && scope.row[item.colkey]">
                                <span class="el-dropdown-link"  style="color:#0087ff">
                                    {{dataformat(scope.row[item.colkey],item)}}
                                </span>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item  v-for="(dimTwo,dimIndexTwo) in item.drill_dim" :key="dimIndexTwo">
                                        <span @click="onDims(item,scope.row,headerItem,dimTwo)">{{dimTwo.report_name}}</span>
                                        <!-- {{dimTwo.report_name}} -->
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                            <span style="color:#0087ff" @click="onDims(item,scope.row,headerItem,item.drill_dim[0])" v-else-if="item.isdrill && item.drill_dim.length == 1 && scope.row[item.colkey] !== null && scope.row[item.colkey] !== ''">
                                <!-- {{ scope.row[item.colkey] }} -->
                                {{dataformat(scope.row[item.colkey],item)}}
                                </span>
                            <span v-else  @click="onDims(false)">
                                {{dataformat(scope.row[item.colkey],item)}}
                                <!-- {{ scope.row[item.colkey] }} -->
                                </span>
                        </template>
                    <el-table-column 
                        :width="headerItem.hasOwnProperty('width') ? headerItem.width : ''"
                        :align="headerItem.hasOwnProperty('align') ? headerItem.align : 'center'"
                        align="center"
                        v-if="item.hasOwnProperty('child')"
                        :key="j"
                        v-for="(childItem,j) in item.child"
                        :prop="childItem.colkey"
                        :label="item.label">
                       
                         <template slot-scope="scope" v-if="!childItem.hasOwnProperty('child')">
                            <!-- // 没有和并列时 -->
                            <el-dropdown trigger="click"  placement="bottom" @command="onDims" v-if="childItem.isdrill && childItem.drill_dim.length >1 && scope.row[childItem.colkey]">
                                <span class="el-dropdown-link"  style="color:blue">
                                    {{ scope.row[childItem.colkey] }}
                                </span>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item v-for="(dimThree,dimIndexThree) in childItem.drill_dim" :key="dimIndexThree">{{dimThree.report_name}}</el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                            <span style="color:blue" @click="onDims(childItem.drill_dim[0])" v-else-if="childItem.isdrill && childItem.drill_dim.length == 1">{{ scope.row[item.colkey] }}</span>
                            <span v-else  @click="onDims(false)">{{ scope.row[childItem.colkey] }}</span>
                        </template>
                    </el-table-column>
                </el-table-column>
            </el-table-column>

        </el-table>
        
 </div>
    <div v-else> 
        <el-alert
            title="无效报表"
            type="error">
        </el-alert>    
     </div>
    </div>
</template>
<script>

import * as DataUtil from "../../util/DataUtil";
import FileSaver from "file-saver";
import XLSX from "xlsx";
export default {
    name:"reportList",
    data(){
        return{
            loading:false,
            reportNo:"",
            reportTitle:null,
            defaultConditions:null,
            header:[],
            data:[],
            reportHead:[],
            tableHeight:"calc(100vh - 40px)",
            // [
            //         {
            //             "label": "项目",
            //             "colname": "fist_project",
            //             "type": "string",
            //             "isdrill": true,
            //             "drill_dim": [
            //                 {
            //                     "dim_col": "second_procjet",
            //                     "report_name": "二级项目"
            //                 }
            //             ]
            //         },
            //         {
            //             "label": "年份",
            //             "colname": "year",
            //             "type": "string",
            //             "isdrill": true,
            //             "drill_dim": [
            //                 {
            //                     "dim_col": "month",
            //                     "report_name": "月份"
            //                 }
            //             ]
            //         },
            //         {
            //             "label": "销售收入",
            //             "colname": "sales_revenue",
            //             "child": [
            //                 {
            //                     "label": "预算",
            //                     "type": "money",
            //                     "colname": "budget",
            //                     "isdrill": true,
            //                     "drill_dim": [
            //                         {
            //                             "dim_col": "second_procjet",
            //                             "report_name": "预算"
            //                         },
            //                         {
            //                             "dim_col": "month",
            //                             "report_name": "月份"
            //                         }
            //                     ]
            //                 },
            //                 {
            //                     "label": "决算",
            //                     "type": "money",
            //                     "colname": "final_account",
            //                     "isdrill": false
            //                 }
            //             ]
            //         },
            //         {
            //             "label": "原材料",
            //             "colname": "raw_materials",
            //             "child": [
            //                 {
            //                     "label": "预算",
            //                     "type": "money",
            //                     "colname": "budget",
            //                     "isdrill": true,
            //                     "drill_dim": [
            //                         {
            //                             "dim_col": "second_procjet",
            //                             "report_name": "二级项目"
            //                         }
            //                     ]
            //                 },
            //                 {
            //                     "label": "决算",
            //                     "type": "money",
            //                     "colname":"final_account_to",
            //                     "isdrill": false
            //                 }
            //             ]
            //         }
            //     ],
            tableData: []
            // [{
            //     fist_project: '电商部署',
            //     year: '2019',
            //     budget: '100.00',
            //     final_account: '1000',
            //     final_account_to: 12564
            //     },{
            //     fist_project: '电商部署电商部署电商部署电商部署电商部署电商部署',
            //     year: '2019',
            //     budget: '100.00',
            //     final_account: '1000',
            //     final_account_to: 12564
            //     },{
            //     fist_project: '电商部署',
            //     year: '2019',
            //     budget: '100.00',
            //     final_account: '1000',
            //     final_account_to: 12564
            //     },{
            //     fist_project: '电商部署',
            //     year: '2019',
            //     budget: '100.00',
            //     final_account: '1000',
            //     final_account_to: 12564
            //     },{
            //     fist_project: '电商部署',
            //     year: '2019',
            //     budget: '100.00',
            //     final_account: '1000',
            //     final_account_to: 12564
            //     },{
            //     fist_project: '电商部署',
            //     year: '2019',
            //     budget: '100.00',
            //     final_account: '1000',
            //     final_account_to: 12564
            //     },{
            //     fist_project: '电商部署',
            //     year: '2019',
            //     budget: '100.00',
            //     final_account: '1000',
            //     final_account_to: 12564
            //     },{
            //     fist_project: '电商部署',
            //     year: '2019',
            //     budget: '100.00',
            //     final_account: '1000',
            //     final_account_to: 12564
            //     },{
            //     fist_project: '电商部署',
            //     year: '2019',
            //     budget: '100.00',
            //     final_account: '1000',
            //     final_account_to: 12564
            //     },{
            //     fist_project: '电商部署',
            //     year: '2019',
            //     budget: '100.00',
            //     final_account: '1000',
            //     final_account_to: 12564
            //     },{
            //     fist_project: '电商部署',
            //     year: '2019',
            //     budget: '100.00',
            //     final_account: '1000',
            //     final_account_to: 12564
            // }]
        }
    },
    created(){
        
    },
    mounted(){
        if(this.$route.query.hasOwnProperty('reportNo')){
            this.reportNo = this.$route.query.reportNo
        }
        if(this.$route.query.hasOwnProperty('title')){
            this.reportTitle = this.$route.query.title
        }
        if(this.$route.query.hasOwnProperty('operate_params')){
            let params = decodeURI(this.$route.query.operate_params)
            // console.log("url params",params,this.$route.query.operate_params)
            this.defaultConditions = JSON.parse(params) 
        }
        this.getReportData()
        this.getHeight()
    },
    computed:{
        headerDataRun:function(){
            let self =this
            let prim = this.reportHead
            let headList = []
            headList = self.buildIsDim(prim,false)
            return headList
        },
        headListRun:function(){
            let self =this
            let prim = this.reportHead
            let list = []
            list = self.buildIsDim(prim,true)
            return list
        }
    },
    methods:{
        isShowList(){
            if(this.reportHead.length === 0){
                return false
            }else{
                return true
            }
        },
        buildIsDim(e,is){
            let self =this
            let prim = e
            let headList = []
            function getChildHead(list){
                let childheadList = self.bxDeepClone(list) || []
                let childNum = 0
                
                for(let i in childheadList){
                    if(childheadList[i].hasOwnProperty('child')){
                        let childs = childheadList[i].child
                        childheadList = childheadList.concat(childs)
                        for(let j in childs){
                            if(childs[j].hasOwnProperty('child')){
                                childNum++
                            }
                        }
                        
                    }
                }
                if(childNum !== 0){
                    return getChildHead(childheadList)
                }else{
                    return childheadList
                }
            }
            for(let j in prim){
                headList.push(prim[j])
            }
            headList = getChildHead(headList)
            let cols = Object.keys(self.tableData[0])
            headList = headList.filter((item)=>{
                
                if(is === false){
                    if(item.hasOwnProperty('isdimcol') && item.isdimcol && item.isdimcol !== false){
                        if(cols.indexOf(item.colname) !== -1){
                            return item
                        }
                    }
                }else if(is === true && item.hasOwnProperty('colkey')){
                    return item
                }
            })

            return headList
        }, 
        dataformatter(row, column, cellValue, index){
            //console.log('dataformatter',row, column, cellValue, index)
        },
        dataformat(e,item){
            
                // console.log(e,item)
            e = (e === null || e === '' ? '-' : e)
            if(item.type === 'Money'){
                 if(e !== null && e !== ''  && e !== '-'){
                            let formatVal = DataUtil.formatMoney(e + '')
                            return formatVal
                        }else{
                            return '-'
                        }
            }else{
                return e
            }
        },
        getReportData(){
            let self = this
            self.loading = true
            if(this.reportNo){
                let query = {
                    "serviceName": "srvsys_report_select",
                    "colNames": [
                        "*"
                    ],
                    "condition": [
                        {
                            "colName": "report_no",
                            "ruleType": "eq",
                            "value": self.reportNo
                        }
                    ]
                }
                this.selectList(query, null).then((res)=>{
                    if(res.data.state === 'SUCCESS'){
                        let data = res.data.data[0]
                        self.reportHead = data.heads
                        self.tableData = data.rows
                    }else{
                        self.reportNo = ''
                    }
                    
                    self.loading = false
                    //console.log(res.data)
                }).finally(()=>{
                    self.loading = false
                })
            }else if(this.defaultConditions){
                let query = {
                    "serviceName": "srvsys_report_select",
                    "colNames": [
                        "*"
                    ],
                    "condition": self.defaultConditions
                }
                this.selectList(query, null).then((res)=>{
                    if(res.data.state === 'SUCCESS'){
                        let data = res.data.data[0]
                        self.reportHead = data.heads
                        self.tableData = data.rows
                    }else{
                        self.reportNo = ''
                    }
                    self.loading = false
                   // console.log(res.data)
                }).finally(()=>{
                    self.loading = false
                })
            }
        },
        onDims(head,row,phead,data){
            if(head){
                let name =null
                // if(e.hasOwnProperty('report_name')){
                //     name = e.report_name
                // }
                
                let type = 'report'
                let req = this.buildRequest(head,row,phead,data)
                let serviceName = null
                if(data.type === 'report'){
                    // console.log('report',req)
                }else if(data.type === 'list'){
                    type = 'list'
                    serviceName = req.serviceName
                    // console.log('list',req)
                }

                let urlParams = JSON.stringify(req)
                this.addTab(type, urlParams, data.report_name,serviceName);
            }
            
           // console.log("点击的维度是：",head,row,data)
        },
        buildRequest(head,row,headParent,drillDim){
            let self = this
            let dimCols = self.headerDataRun
            let dd = drillDim
            let headCol = head.colname
            let headColVal = head.label
            let pheadCol = headParent.colname
            let pheadColVal = headParent.label
            let type = drillDim.type || 'report'
            let req = {
                "serviceName": "srvsys_report_select",
                "colNames": [
                    "*"
                ],
                "condition": [
                    
                ]
            }
            let condItem = {
                "colName": "",//drill_dim 参数中选择的钻取报信息
                "ruleType": "eq",
                "value": ""
            }
            if(type === 'report' && head.isdimcol){
                condItem.colName = 'report_no'
                condItem.value = dd.report_no
                req.condition.push(self.bxDeepClone(condItem))
                if(headParent){
                    for(let d = 0;d<dimCols.length;d++){
                        // condItem.colName = headParent.colname
                        // condItem.value = row[head.colkey]
                        condItem.colName = dimCols[d].colname
                        condItem.value = row[dimCols[d].colkey]
                        req.condition.push(self.bxDeepClone(condItem))
                    }
                    
                }
            }else if(type === 'report' && !head.isdimcol){
                condItem.colName = 'report_no'
                condItem.value = dd.report_no
                req.condition.push(self.bxDeepClone(condItem))
                if(headParent && headParent.hasOwnProperty('isdimcol') && headParent.isdimcol){
                    condItem.colName = headParent.colname
                    condItem.value = headParent.label
                    req.condition.push(self.bxDeepClone(condItem) )
                }
                req.condition = req.condition.concat(self.buildRowDim(row))
            }else if(type === 'list' && head.isdimcol){
                req.serviceName = dd.report_no
                if(headParent){
                    for(let d = 0;d<dimCols.length;d++){
                        // condItem.colName = headParent.colname
                        // condItem.value = row[head.colkey]
                        condItem.colName = dimCols[d].colname
                        condItem.value = row[dimCols[d].colkey]
                        req.condition.push(self.bxDeepClone(condItem))
                    }
                }
            }else if(type === 'list' && !head.isdimcol){
                req.serviceName = dd.report_no
                if(headParent){
                    condItem.colName = headParent.colname
                    condItem.value = headParent.label
                    req.condition.push(self.bxDeepClone(condItem))
                }
                req.condition = req.condition.concat(self.buildRowDim(row))
            }
            return req
           // console.log("build:",dd,headCol,headColVal,pheadCol,pheadColVal,req)
        },
        buildRowDim(e){
            let isdimcol = this.headerDataRun
            let cols = []
            let conds = []
            isdimcol.forEach(async (item) =>{
                cols.push(item.colname)
                let cond = {
                        "colName": "",//drill_dim 参数中选择的钻取报信息
                        "ruleType": "eq",
                        "value": ""
                    }
                    if(e[item.colname]){
                        cond.colName = item.colname
                        cond.value = e[item.colname]
                        conds.push(cond)
                    }
            })
            
            //console.log('buildRowDim',e,conds)
            return conds
        },
        getHeight(){
            let dom =  this.$refs.tableView.offsetHeight
            this.tableHeight = dom
            //console.log('dom height',dom)
        },
        getSummaries(param,e) {
            let self = this
            const { columns, data } = param;
            const sums = [];
            columns.forEach((column, index) => {
                // console.log(column)
                if (index === 0) {
                    sums[index] = '总计';
                    return;
                }
                let colType = null
                let cols = null
                for(let head = 0;head <self.headListRun.length;head++){
                    if(column.hasOwnProperty('property') && column.property === self.headListRun[head]['colkey']){
                        cols = self.headListRun[head]
                        colType = self.headListRun[head].type
                    }
                }
                const values = data.map(item => Number(item[column.property]));
                // console.log("===>",values,colType)
                if (!values.every(value => isNaN(value)) && colType !== 'String' ) {
                    sums[index] = values.reduce((prev, curr) => {
                    const value = Number(curr);
                        if (!isNaN(value)) {
                            
                            let n = Number(prev) +  Number(curr)
                            // console.log('求和',prev+'-',curr+'-',n )
                            if(!isNaN(n) && n !== null && n !== '' && n !== undefined){
                                return n.toFixed(2)
                            }else{
                                return  prev + curr
                            }
                            
                        } else {
                            return prev;
                        }
                    }, 0);
                    // console.log('求和==reduce',sums[index] )
                    if(colType === 'Money'){
                        sums[index] = Number(sums[index]).toFixed(2)
                        sums[index] = self.dataformat(sums[index],cols)
                        // console.log('求和==Money',sums[index] )
                    }
                    if(sums[index] && sums[index] !== '-'){
                        // sums[index] = Number(sums[index]).toFixed(2)
                        // console.log('求和==toFixed',sums[index] )
                    }
                } else {
                    sums[index] = '-';
                }

                // console.log('sums[index]',sums[index],colType)
            });
        
            // console.log('getSummaries',param,sums,e)
        return sums;
      },
      //定义导出Excel表格事件
        exportExcel(id,title) {


            let titleText = title || new Date().getTime()
         /* generate workbook object from table */
            var xlsxParam = { raw: true } // 导出的内容只做解析，不进行格式转换
            let fix = document.querySelector('#out-table-data .el-table__fixed');
            var table = document.querySelector('#'+id).cloneNode(true)
            var wb = XLSX.utils.table_to_book(table, xlsxParam)

            var hasgutter = document.querySelector('.el-table__footer');
            var cityLiNodes = hasgutter.getElementsByTagName("td");
            for(let i =0;i<cityLiNodes.length;i++ ){
                cityLiNodes[i].rowSpan=1
            }
            // console.log("hasgutter",hasgutter,cityLiNodes)
            if(fix){ //判断要导出的节点中是否有fixed的表格，如果有，转换excel时先将该dom移除，然后append回去
                wb = XLSX.utils.table_to_book(document.querySelector('#'+id).removeChild(fix),{raw:true});
                document.querySelector('#'+id).appendChild(fix);
            }else{
                wb = XLSX.utils.table_to_book(document.querySelector('#'+id),{raw:true});
            }
           
            /* get binary string as output */
            var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
            //  console.log('XLSX.write',wbout,wb)
            try {
                FileSaver.saveAs(new Blob([wbout], { type: 'application/octet-stream;charset=utf-8' }), titleText + '.xlsx')
            } catch (e) {
                if (typeof console !== 'undefined') {
                //console.log(e, wbout)
                }
            }
            return wbout

        },
        formatter (value,item,row,prop) {
           //针对table中item多层对象层级的情况
           if(prop.indexOf('.') > 0){
            let temp = prop.split('.')
            //item中嵌套两层
            if(temp.length == 2){
            let temp = prop.split('.')
            if(item.formatterType == 'common-type'){  //通用类型转换
                let arry = item.formatterInfo
                for(let i in arry){
                if(arry[i].value == row[temp[0]][temp[1]]){
                    return arry[i].label
                }
                }
            } else if(item.formatterType == 'time-type'){ //时间标准格式化
                if(!global.isNull(row[temp[0]][temp[1]])){
                return row[temp[0]][temp[1]].substring(0,row[temp[0]][temp[1]].length - 2)
                }
            } else if(item.formatterType == 'amount-type'){ //金额转换
                return (row[temp[0]][temp[1]] / 100).toFixed(2)
            }
            }
        } else{ //item中无嵌套对象
            let temp = prop.split('.')
            if(item.formatterType == 'common-type'){  //通用类型转换
                let arry = item.formatterInfo
                for(let i in arry){
                if(arry[i].value == value){
                    return arry[i].label
                }
                }
            } else if(item.formatterType == 'time-type'){ //时间标准格式化
                if(!global.isNull(row[temp[0]][temp[1]])){
                return value.substring(0,value.length - 2)
                }
            } else if(item.formatterType == 'amount-type'){ //金额转换
                return (value / 100).toFixed(2)
            }
        }
        }
    }
}
</script>
<style lang="less">
    .reportview {
        th>.cell {
            text-overflow: clip !important;
        }
    }
</style>