import moment from "moment";

export function createLinkUrlFunc(optionListV2, thisColName) {
  let func = function (data) {
    let service = optionListV2.serviceName
    let defaultSrvApp = resolveAppFromService(service);
    let srvApp = optionListV2.srv_app || defaultSrvApp
    let url = `/vpages/index.html#/detail/${service}/xxx?srvApp=${srvApp}&operate_params=`;
    let refedCol = optionListV2.refed_col
    let operateParams = {
      serviceName: service,
      condition: [{
        colName: refedCol,
        ruleType: "eq",
        value: data[thisColName],
      }]
    }

    return url + JSON.stringify(operateParams);
  }

  return func;
}


export function resolveAppFromService(service) {
  let appList = ["auth", "sso"];
  let ret = _.find(appList, app => service.includes(app));
  return ret || "";
}
