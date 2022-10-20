export class GridInfo {

    constructor() {



        this.pageSizes=[2,5, 10,15,20, 50,100];
        this.selection=false;  // 是否 可以选择行
        this.gridHeader = [
            {
                "column": "date",//列字段
                "label": "日期",//列中文名称
                "width": 180,//表格宽度
                "show": true,//显示隐藏
                "sortable": true,//是否排序
                "filters": [{ text: '2016-05-01', value: '2016-05-01' }]//过滤

            },
            {
                "column": "name",
                "label": "姓名",
                "sortable": true,
                "show": true
            },
            {
                "column": "address",
                "label": "地址",
                "show": true
            }, {
                "column": "tag",
                "label": "家",
                "show": true
            }];
        this.gridData = [
            {
                id:1,
                date: '2016-05-02',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1518 弄',
                tag: '家'

            },
            {
                id:2,
                date: '2016-05-04',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1517 弄',
                tag: '公司'
            },
            {
                id:3,                
                date: '2016-05-01',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1519 弄',
                tag: '家'
            },
            {
                date: '2016-05-03',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1516 弄',
                tag: '公司'
            },
            {
                date: '2016-05-02',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1518 弄',
                tag: '家'
            },
            {
                date: '2016-05-04',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1517 弄',
                tag: '公司'
            },
            {
                date: '2016-05-01',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1519 弄',
                tag: '家'
            },
            {
                date: '2016-05-03',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1516 弄',
                tag: '公司'
            },
            {
                date: '2016-05-02',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1518 弄',
                tag: '家'
            },
            {
                date: '2016-05-04',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1517 弄',
                tag: '公司'
            },
            {
                date: '2016-05-01',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1519 弄',
                tag: '家'
            },
            {
                date: '2016-05-03',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1516 弄',
                tag: '公司'
            },
            {
                date: '2016-05-02',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1518 弄',
                tag: '家'
            },
            {
                date: '2016-05-04',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1517 弄',
                tag: '公司'
            },
            {
                date: '2016-05-01',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1519 弄',
                tag: '家'
            },
            {
                date: '2016-05-03',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1516 弄',
                tag: '公司'
            },
            {
                date: '2016-05-02',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1518 弄',
                tag: '家'
            },
            {
                date: '2016-05-04',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1517 弄',
                tag: '公司'
            },
            {
                date: '2016-05-01',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1519 弄',
                tag: '家'
            },
            {
                date: '2016-05-03',
                name: '王小虎',
                address: '上海市普陀区金沙江路 1516 弄',
                tag: '公司'
            }];
        this.gridButton = [
            {
                "name": "刷新",
                "type":"refresh",
                "show": true,//显示隐藏
            },
            {
                "name": "查询",
                "type":"select",
                "show": true,
            },
            {
                "name": "添加",
                "type":"add",
                "show": true,
            },
            {
                "name": "批量删除",
                "type":"delete",
                "show": true,
            },
            {
                "name": "导入",
                "type":"import",
                "show": true,
            },
            {
                "name": "导出",
                "type":"export",
                "show": true,
            },
            {
                "name": "申请",
                "type":"apply",
                "show": false,
            },
            {
                "name": "收缩表单",
                "type":"shrink",
                "show": true,
            }];
            
            
            
        this.rowButton=[
                {
                    "name": "删除",
                    "show": true,
                    "type":"delete"
                },
                {
                    "name": "编辑",
                    "show": true,
                    "type":"edit"
                },
                {
                    "name": "查看",
                    "show": true,
                    "type":"detail"
                }
            ];

    
    
    
        }


}