sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("mucliapp.controller.MainView", {
        _sCurrentDeptKey: "",

        onInit: function () {
            var oModel = new JSONModel(sap.ui.require.toUrl("mucliapp/model/employees.json"));
            this.getView().setModel(oModel, "employees");

            this.getOwnerComponent().getRouter()
                .getRoute("RouteMainView")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var oQuery = oEvent.getParameter("arguments")["?query"];
            var sDept  = oQuery && oQuery.dept ? oQuery.dept : "";

            if (sDept) {
                this._sCurrentDeptKey = sDept;
                this.byId("departmentTabBar").setSelectedKey(sDept);
                this._applyFilters("");
                this.byId("tableTitle").setText(sDept + " Employees");
            }
        },

        onNavToOverview: function () {
            this.getOwnerComponent().getRouter().navTo("RouteOverviewView");
        },

        onEmployeePress: function (oEvent) {
            var sEmployeeId = oEvent.getSource().getBindingContext("employees").getProperty("employeeId");
            this.getOwnerComponent().getRouter().navTo("RouteProjectView", { employeeId: sEmployeeId });
        },

        onDepartmentTabSelect: function (oEvent) {
            this._sCurrentDeptKey = oEvent.getParameter("key");
            this._applyFilters("");
            var sLabel = this._sCurrentDeptKey || "All";
            this.byId("tableTitle").setText((sLabel === "All" ? "All" : sLabel) + " Employees");
        },

        onSearch: function (oEvent) {
            this._applyFilters(oEvent.getParameter("newValue"));
        },

        _applyFilters: function (sQuery) {
            var aFilters = [];

            if (this._sCurrentDeptKey) {
                aFilters.push(new Filter("department", FilterOperator.EQ, this._sCurrentDeptKey));
            }
            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("name",       FilterOperator.Contains, sQuery),
                        new Filter("department", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }

            this.byId("employeeTable").getBinding("items").filter(aFilters);
        }
    });
});
