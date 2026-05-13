sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("mucliapp.controller.ProjectView", {
        onInit: function () {
            this.getView().setModel(
                new JSONModel(sap.ui.require.toUrl("mucliapp/model/projects.json")),
                "projects"
            );
            this.getView().setModel(
                new JSONModel(sap.ui.require.toUrl("mucliapp/model/employees.json")),
                "employees"
            );

            this.getOwnerComponent().getRouter()
                .getRoute("RouteProjectView")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sEmployeeId = oEvent.getParameter("arguments").employeeId;
            var oEmployeeModel = this.getView().getModel("employees");
            var that = this;

            function applyFilter() {
                var aEmployees = oEmployeeModel.getProperty("/employees") || [];
                var oEmployee = aEmployees.find(function (e) { return e.employeeId === sEmployeeId; });
                if (!oEmployee) { return; }

                that.byId("projectPage").setTitle(oEmployee.name + "’s Projects");

                var oBinding = that.byId("projectTable").getBinding("items");
                if (oBinding) {
                    oBinding.filter([new Filter("lead", FilterOperator.EQ, oEmployee.name)]);
                }
            }

            if (oEmployeeModel.getProperty("/employees")) {
                applyFilter();
            } else {
                oEmployeeModel.attachEventOnce("requestCompleted", applyFilter);
            }
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteMainView");
        },

        onStatusSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            var oTable = this.byId("projectTable");
            var oBinding = oTable.getBinding("items");

            var aFilters = sQuery
                ? [new Filter("status", FilterOperator.Contains, sQuery)]
                : [];

            oBinding.filter(aFilters);
        }
    });
});
