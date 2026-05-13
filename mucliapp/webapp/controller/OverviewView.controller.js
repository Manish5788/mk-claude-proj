sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("mucliapp.controller.OverviewView", {
        onInit: function () {
            var oOverviewModel = new JSONModel({
                totalEmployees: 0,
                totalDepartments: 0,
                totalProjects: 0,
                activeProjects: 0,
                completedProjects: 0,
                planningProjects: 0,
                departments: [],
                activeProjectsList: []
            });
            this.getView().setModel(oOverviewModel, "overview");

            var oEmpModel  = new JSONModel(sap.ui.require.toUrl("mucliapp/model/employees.json"));
            var oProjModel = new JSONModel(sap.ui.require.toUrl("mucliapp/model/projects.json"));
            this.getView().setModel(oEmpModel,  "employees");
            this.getView().setModel(oProjModel, "projects");

            var aEmployees = [], aProjects = [];
            var bEmpDone = false, bProjDone = false;

            function compute() {
                if (!bEmpDone || !bProjDone) { return; }

                var aDepts = aEmployees
                    .reduce(function (acc, e) {
                        if (acc.indexOf(e.department) < 0) { acc.push(e.department); }
                        return acc;
                    }, [])
                    .sort();

                var aDeptData = aDepts.map(function (dept) {
                    return {
                        name: dept,
                        employeeCount:     aEmployees.filter(function (e) { return e.department === dept; }).length,
                        activeProjects:    aProjects.filter(function (p) { return p.team === dept && p.status === "In Progress"; }).length,
                        completedProjects: aProjects.filter(function (p) { return p.team === dept && p.status === "Completed"; }).length
                    };
                });

                var aActive = aProjects
                    .filter(function (p) { return p.status === "In Progress"; })
                    .sort(function (a, b) { return a.dueDate.localeCompare(b.dueDate); });

                oOverviewModel.setData({
                    totalEmployees:    aEmployees.length,
                    totalDepartments:  aDepts.length,
                    totalProjects:     aProjects.length,
                    activeProjects:    aProjects.filter(function (p) { return p.status === "In Progress"; }).length,
                    completedProjects: aProjects.filter(function (p) { return p.status === "Completed"; }).length,
                    planningProjects:  aProjects.filter(function (p) { return p.status === "Planning"; }).length,
                    departments:       aDeptData,
                    activeProjectsList: aActive
                });
            }

            oEmpModel.attachRequestCompleted(function () {
                aEmployees = oEmpModel.getProperty("/employees") || [];
                bEmpDone = true;
                compute();
            });
            oProjModel.attachRequestCompleted(function () {
                aProjects = oProjModel.getProperty("/projects") || [];
                bProjDone = true;
                compute();
            });
        },

        onNavToEmployees: function () {
            this.getOwnerComponent().getRouter().navTo("RouteMainView");
        },

        onDeptPress: function (oEvent) {
            var sDept = oEvent.getSource().getBindingContext("overview").getProperty("name");
            this.getOwnerComponent().getRouter().navTo("RouteMainView", {
                "?query": { dept: sDept }
            });
        }
    });
});
