export class Condition {
  constructor() {
    this.colName = "dim_no";
    this.ruleType = "eq";
    this.required = false;
    this.valueExpr = "ctrl.procStepMap['2018_01'].turn_dim_no";

    // a function to eval to value
    this.valueFunc = null;
    this.literalValue = false;
    this.disableExpr = null;
  }


}