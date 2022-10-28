import Vue from 'vue'
import Router from 'vue-router'
import VueResource from 'vue-resource'
// pages
// import SimpleAdd from '@/components/common/simple-add'
// // import viewpdf from '@/components/common/viewpdf'
// import Add from '@/components/common/add'
// import Update from '@/components/common/update'
// import SimpleFilter from '@/components/common/simple-filter'
// import SimpleUpdate from '@/components/common/simple-update'
// import list from '@/components/common/list'
// import TabList from '@/components/common/tab-list2'
// import listproc from '@/components/common/listproc'
// import listallproc from '@/components/common/listallproc'
// import detail from '@/components/common/detail'
// import detailPlus from '@/components/common/detail-plus'
// import treegrid from '@/components/common/treegrid'
// import procdetail from '@/components/common/procdetail'
// import procdetail_v2 from '@/components/common/procdetail_v2'
// import editgrid from '@/components/common/edit-grid'
// import encryptColumnCfgList from '@/pages/encrypt-column-cfg-list'
// import stat from '@/components/common/stat'
// import ConfStatChart from '@/pages/conf-stat-chart'
// import ShowStatChart from '@/pages/show-stat-chart'
// import treelevel from '@/components/common/treelevel'
// import CustomPage from '@/components/common/custom-page'
// import permission from '@/components/common/permission'
// import upgrade from '@/components/common/upgrade'
// import reportList from '@/components/common/report-list'
// import explain from '@/components/ui/rich-text-view'

// // vxhr pages
// import PersonalInfo from '@/vxhr/personal-info'
// import PersonalInfoUpdate from '@/vxhr/personal-info-update'
// import PersonalUpdate from '@/vxhr/personal-update'

// import test_field from '@/components/test/test_field'



import SimpleAdd from '@/components/common/simple-add'
const viewpdf = ()=>import("@/components/common/viewpdf")
import Add from '@/components/common/add'
import Update from '@/components/common/update'
import SimpleFilter from '@/components/common/simple-filter'
import SimpleUpdate from '@/components/common/simple-update'
import list from '@/components/common/list'
import TabList from '@/components/common/tab-list2'
import listproc from '@/components/common/listproc'
import listallproc from '@/components/common/listallproc'
import detail from '@/components/common/detail'
import detailPlus from '@/components/common/detail-plus'
import treegrid from '@/components/common/treegrid'
import procdetail from '@/components/common/procdetail'
import procdetail_v2 from '@/components/common/procdetail_v2'
import editgrid from '@/components/common/edit-grid'
import encryptColumnCfgList from '@/pages/encrypt-column-cfg-list'
import stat from '@/components/common/stat'
import ConfStatChart from '@/pages/conf-stat-chart'
import ShowStatChart from '@/pages/show-stat-chart'
import treelevel from '@/components/common/treelevel'
import CustomPage from '@/components/common/custom-page'
import permission from '@/components/common/permission'
import upgrade from '@/components/common/upgrade'
import reportList from '@/components/common/report-list'
import explain from '@/components/ui/rich-text-view'

import wxmsg from '@/components/develop/wxmsg'



// vxhr pages
import PersonalInfo from '@/vxhr/personal-info'
import PersonalInfoUpdate from '@/vxhr/personal-info-update'
import PersonalUpdate from '@/vxhr/personal-update'

import checkEditer from '@/pages/retail/checkEditPlus/check_edit_plus'
// 商品管理
import goodsUpdate from '@/pages/retail/goods/update.vue'
import goodsAdd from '@/pages/retail/goods/add.vue'
import goodsDetail from '@/pages/retail/goods/detail.vue'
import goodsAttr from '@/pages/retail/goods/attribute.vue'
import goodsList from '@/pages/retail/goods/list.vue'
import supplier from '@/pages/retail/goods/supplier.vue'
import vipSet from '@/pages/retail/goods/vipSet.vue'


import test_field from '@/components/test/test_field'
// const excelEditView = ()=>import("@/components/common/luckysheet.vue")
// 权限设置
import authorityPage from '@/pages/authority.vue'
// pages
Vue.use(Router)
Vue.use(VueResource)

export default new Router({
  routes: [
    {
      path: '/simple-add/:service_name',
      name: 'simple-add',
      component: SimpleAdd
    },
    {
      path: '/permission/:role_no',
      name: 'permission',
      component: permission
    },
    {
      path: '/upgrade',
      name: 'upgrade',
      component: upgrade
    },
    {
      path: '/add/:service_name',
      name: 'add',
      component: Add
    },
    {
      path: '/update/:service_name/:id',
      name: 'update',
      component: Update
    },
    {
      path: '/simple-filter/:service_name',
      name: 'simple-filter',
      component: SimpleFilter
    },
    {
      path: '/simple-update/:service_name/:id',
      name: 'simple-update',
      component: SimpleUpdate
    },
    {
      path: '/list/:service_name',
      name: 'list',
      component: TabList,
      meta:{
        compName:'list'
      }
    },
    {
      path: '/list/:service_name/:card_no',
      name: 'cardlist',
      component: list,
      meta:{
        compName:'list'
      }
    },
    {
      path: '/reportList',
      name: 'reportList',
      component: reportList,
      meta:{
        compName:'reportList'
      }
    },
    {
      path: '/explain',
      name: 'explain',
      component: explain,
      meta:{
        compName:'explain'
      }
    },
    {
      path: '/stat/:service_name',
      name: 'stat',
      component: stat
    },
    {
      path: '/listallproc/:service_name',
      name: 'listallproc',
      component: listallproc
    },   
    {
      path: '/v2/listallproc/:service_name',
      name: 'listallproc_v2',
      component: listallproc
    },

    {
      path: '/listproc/:service_name',
      name: 'listproc',
      component: listproc
    },
    {
      path: '/v2/listproc/:service_name',
      name: 'listproc_v2',
      component: listproc
    },
    {
      path: '/detail/:service_name/:id',
      name: 'detail',
      component: detail
    },
    {
      path: '/detail/:service_name/:condcol/:condvalue',
      name: 'detail',
      component: detail
    },
    {
      path: '/detailPlus/:service_name/:id',
      name: 'detailPlus',
      component: detailPlus
    },

    {
      path: '/test_field',
      name: 'test_field',
      component: test_field
    },
    {
      path: '/treegrid/:service_name',
      name: 'treegrid',
      component: TabList
    },
    {
      path: '/startproc/:service_name',
      name: 'startproc',
      component: procdetail
    },
    {
      path: '/v2/startproc/:service_name',
      name: 'startproc_v2',
      component: procdetail_v2
    },
    {
      path: '/v2/procdetail/:proc_instance_no',
      name: 'procdetail_v2',
      component: procdetail_v2
    },
    {
      path: '/procdetail/:proc_instance_no',
      name: 'procdetail',
      component: procdetail
    },
    {
      path: '/encrypt-column-cfg-list',
      name: 'encryptColumnCfgList',
      component: encryptColumnCfgList
    },
    {
      path: '/editgrid/:service_name',
      name: 'editgrid',
      component: editgrid
    },
    {
      path: '/conf-stat-chart/:chartid',
      name: 'confstatchart',
      component: ConfStatChart,
    },

    {
      path: '/show-stat-chart/:chartid',
      name: 'showstatchart',
      component: ShowStatChart,
    },
    {
      path: '/viewpdf',
      name: 'viewpdf',
      component: resolve => require(['@/components/common/view-pdf'],resolve) ,
    },
    {
      path: '/treelevel/:service_name',
      name: 'treelevel',
      component: treelevel,
    },
    {
      path: '/custom-page/:page_no',
      name: 'custompage',
      component: CustomPage,
    },
    // {
    //   path: '/excelEditView',
    //   name: 'excelEditView',
    //   component: excelEditView,
    // },
    {
      path: '/vxhr/personal-info',
      name: 'personalInfo',
      component: PersonalInfo,
    },
    {
      path: '/vxhr/personal-info-update',
      name: 'personalInfoUpdate',
      component: PersonalInfoUpdate,
    },
    {
      path: '/vxhr/personal-update',
      name: 'personalUpdate',
      component: PersonalUpdate,
    },
    {
      path: '/wxmsg',
      name: 'wxmsg',
      component: wxmsg,
      meta:{
        compName:'wxmsg'
      }
    },
    {
      path: '/retail/checkEditer/:service_name',
      name: 'check-editer',
      component: checkEditer,
      meta:{
        compName:'checkEditer'
      }
    },
    {
      path: '/goods-list',
      name: 'goodsList',
      component: goodsList ,
    },
    {
      path: '/goods-add',
      name: 'goodsAdd',
      component: goodsAdd ,
    },
    {
      path: '/goods-detail',
      name: 'goodsDetail',
      component:goodsDetail,
    },
    {
      path: '/goods-update',
      name: 'goodsUpdate',
      component: goodsUpdate,
    },
    {
      path: '/goods-update/:service_name/:pkCol/:pk',
      name: 'goodsUpdatePk',
      component: goodsUpdate
    },
    {
      path: '/custom-update/:service_name/:pkCol/:pk',
      name: 'goodsUpdatePk',
      component: goodsUpdate
    },{
      path: '/goods-attr',
      name: 'goodsAttr',
      component: goodsAttr ,
    },
    {
      path: '/goods-attr',
      name: 'goodsAttr',
      component: goodsAttr ,
    },
    {
      path: '/tabs',
      name: 'tabs',
      component: goodsAttr ,
    },
    {
      path: '/supplier',
      name: 'supplier',
      component: supplier ,
    },
    {
      path: '/vipSet',
      name: 'vipSet',
      component: vipSet ,
    },
    {
      path: '/authorityPage/:type/:role_no',
      name: 'authorityPage',
      component: authorityPage ,
    }
  ]
})
