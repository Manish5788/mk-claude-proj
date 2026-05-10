sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("mucliapp.controller.MainView", {
        onInit: function () {
            var oModel = new JSONModel(sap.ui.require.toUrl("mucliapp/model/employees.json"));
            this.getView().setModel(oModel, "employees");
        },

        onDepartmentSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oTable = this.byId("employeeTable");
            var oBinding = oTable.getBinding("items");

            var aFilters = sQuery
                ? [new Filter("department", FilterOperator.Contains, sQuery)]
                : [];

            oBinding.filter(aFilters);
        }
    });
});
