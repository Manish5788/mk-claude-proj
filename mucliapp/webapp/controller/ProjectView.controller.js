sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("mucliapp.controller.ProjectView", {
        _sEmployeeName: null,
        _sEmployeeId: null,
        _sCurrentStatusKey: "",

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
            this._sEmployeeId = sEmployeeId;
            this._sCurrentStatusKey = "";
            var oEmployeeModel = this.getView().getModel("employees");
            var that = this;

            function applyEmployee() {
                var aEmployees = oEmployeeModel.getProperty("/employees") || [];
                var oEmployee = aEmployees.find(function (e) { return e.employeeId === sEmployeeId; });
                if (!oEmployee) { return; }

                that._sEmployeeName = oEmployee.name;

                // Header fields
                that.byId("pageTitle").setText(oEmployee.name + "’s Projects");
                that.byId("snappedId").setText(oEmployee.employeeId);
                that.byId("snappedDept").setText(oEmployee.department);
                that.byId("empIdAttr").setText(oEmployee.employeeId);
                that.byId("empDeptAttr").setText(oEmployee.department);

                var oProjectModel = that.getView().getModel("projects");

                function applyProjectFilter() {
                    that._applyFilters("");
                    that._updateKPIs(oEmployee.name);
                }

                if (oProjectModel.getProperty("/projects")) {
                    applyProjectFilter();
                } else {
                    oProjectModel.attachEventOnce("requestCompleted", applyProjectFilter);
                }
            }

            if (oEmployeeModel.getProperty("/employees")) {
                applyEmployee();
            } else {
                oEmployeeModel.attachEventOnce("requestCompleted", applyEmployee);
            }
        },

        _updateKPIs: function (sName) {
            var aAll = (this.getView().getModel("projects").getProperty("/projects") || [])
                .filter(function (p) { return p.lead === sName; });

            this.byId("totalCount").setValue(aAll.length);
            this.byId("inProgressCount").setValue(aAll.filter(function (p) { return p.status === "In Progress"; }).length);
            this.byId("completedCount").setValue(aAll.filter(function (p) { return p.status === "Completed"; }).length);
            this.byId("planningCount").setValue(aAll.filter(function (p) { return p.status === "Planning"; }).length);
            this.byId("projectTableTitle").setText(this._sEmployeeName + "’s Projects (" + aAll.length + ")");
        },

        _applyFilters: function (sQuery) {
            var aFilters = [];

            if (this._sEmployeeName) {
                aFilters.push(new Filter("lead", FilterOperator.EQ, this._sEmployeeName));
            }
            if (this._sCurrentStatusKey) {
                aFilters.push(new Filter("status", FilterOperator.EQ, this._sCurrentStatusKey));
            }
            if (sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("projectName", FilterOperator.Contains, sQuery),
                        new Filter("status", FilterOperator.Contains, sQuery),
                        new Filter("team", FilterOperator.Contains, sQuery)
                    ],
                    and: false
                }));
            }

            var oBinding = this.byId("projectTable").getBinding("items");
            if (oBinding) {
                oBinding.filter(aFilters);
            }
        },

        onProjectPress: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext("projects");
            this.getOwnerComponent().getRouter().navTo("RouteProjectDetailView", {
                employeeId: this._sEmployeeId || "unknown",
                projectId:  oCtx.getProperty("projectId")
            });
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteMainView");
        },

        onStatusTabSelect: function (oEvent) {
            this._sCurrentStatusKey = oEvent.getParameter("key");
            this._applyFilters("");
        },

        onProjectSearch: function (oEvent) {
            this._applyFilters(oEvent.getParameter("newValue"));
        }
    });
});
