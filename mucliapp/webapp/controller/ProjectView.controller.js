sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("mucliapp.controller.ProjectView", {
        onInit: function () {
            var oModel = new JSONModel(sap.ui.require.toUrl("mucliapp/model/projects.json"));
            this.getView().setModel(oModel, "projects");
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
