sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/StandardListItem",
    "sap/m/Button"
], function (Controller, JSONModel, StandardListItem, Button) {
    "use strict";

    var STATUS_STATE = { "Completed": "Success", "In Progress": "Warning", "Planning": "Information", "Pending": "None" };
    var PRIORITY_STATE = { "High": "Error", "Medium": "Warning", "Low": "Success" };
    var MILESTONE_ICON = { "Completed": "sap-icon://accept", "In Progress": "sap-icon://status-in-process", "Pending": "sap-icon://pending" };

    return Controller.extend("mucliapp.controller.ProjectDetailView", {
        _sEmployeeId: null,

        onInit: function () {
            this.getView().setModel(
                new JSONModel(sap.ui.require.toUrl("mucliapp/model/projects.json")),
                "projects"
            );
            this.getOwnerComponent().getRouter()
                .getRoute("RouteProjectDetailView")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var args = oEvent.getParameter("arguments");
            this._sEmployeeId = args.employeeId;
            var sProjectId    = args.projectId;
            var oProjModel    = this.getView().getModel("projects");

            var that = this;
            function render() {
                var aProjects = oProjModel.getProperty("/projects") || [];
                var oProject  = aProjects.find(function (p) { return p.projectId === sProjectId; });
                if (oProject) { that._populate(oProject); }
            }

            if (oProjModel.getProperty("/projects")) {
                render();
            } else {
                oProjModel.attachEventOnce("requestCompleted", render);
            }
        },

        _populate: function (p) {
            var v = this.getView();

            // ── Header title & status ──────────────────────────────────────
            v.byId("detailPageTitle").setText(p.projectName);
            v.byId("snappedTitle").setText(p.projectName);

            var sState = STATUS_STATE[p.status] || "None";
            v.byId("snappedStatus").setText(p.status).setState(sState);
            v.byId("headerStatus").setText(p.status).setState(sState);

            v.byId("snappedLead").setText(p.lead);
            v.byId("projectDescription").setText(p.description);

            // Priority button in header bar
            var sPriState = PRIORITY_STATE[p.priority] || "None";
            v.byId("priorityBtn").setText(p.priority + " Priority");

            // ── Header content attributes ──────────────────────────────────
            v.byId("hcProjectId").setText(p.projectId);
            v.byId("hcLead").setText(p.lead);
            v.byId("hcDepartment").setText(p.team);
            v.byId("hcStartDate").setText(p.startDate);
            v.byId("hcDueDate").setText(p.dueDate);
            v.byId("hcPriority").setText(p.priority);
            v.byId("hcBudget").setText("$" + p.budget + "K");
            v.byId("hcTeamSize").setText(p.teamMembers ? p.teamMembers.length + " members" : "—");
            v.byId("hcProgress").setText(p.progress + "%");

            // ── Progress bar ───────────────────────────────────────────────
            v.byId("progressBar").setPercentValue(p.progress);
            v.byId("progressPct").setText(p.progress + "%");

            // ── KPI tiles ─────────────────────────────────────────────────
            v.byId("budgetValue").setValue(p.budget);
            var dDue  = new Date(p.dueDate);
            var dToday = new Date();
            dToday.setHours(0, 0, 0, 0);
            var iDays = Math.max(0, Math.round((dDue - dToday) / 86400000));
            v.byId("daysRemaining").setValue(p.status === "Completed" ? 0 : iDays);
            v.byId("teamSizeValue").setValue(p.teamMembers ? p.teamMembers.length : 0);

            var iDone = (p.milestones || []).filter(function (m) { return m.status === "Completed"; }).length;
            v.byId("milestoneDone").setValue(iDone);

            // ── Details form ──────────────────────────────────────────────
            v.byId("detProjectId").setText(p.projectId);
            v.byId("detProjectName").setText(p.projectName);
            v.byId("detStatus").setText(p.status).setState(sState);
            v.byId("detPriority").setText(p.priority).setState(sPriState);
            v.byId("detDept").setText(p.team);
            v.byId("detLead").setText(p.lead);
            v.byId("detStartDate").setText(p.startDate);
            v.byId("detDueDate").setText(p.dueDate);
            v.byId("detBudget").setText("$" + p.budget + "K");
            v.byId("detDescription").setText(p.description);

            // ── Milestones list ───────────────────────────────────────────
            var oMilestoneList = v.byId("milestoneList");
            oMilestoneList.destroyItems();
            (p.milestones || []).forEach(function (m, i) {
                oMilestoneList.addItem(new StandardListItem({
                    title:       (i + 1) + ". " + m.title,
                    description: m.date,
                    icon:        MILESTONE_ICON[m.status] || "sap-icon://pending",
                    info:        m.status,
                    infoState:   STATUS_STATE[m.status] || "None"
                }));
            });

            // ── Team members list ─────────────────────────────────────────
            var oTeamList = v.byId("teamList");
            oTeamList.destroyItems();
            (p.teamMembers || []).forEach(function (t) {
                oTeamList.addItem(new StandardListItem({
                    title:       t.name,
                    description: t.role,
                    icon:        "sap-icon://employee"
                }));
            });

            // ── Tags ──────────────────────────────────────────────────────
            var oTagsBox = v.byId("tagsBox");
            oTagsBox.destroyItems();
            (p.tags || []).forEach(function (tag) {
                oTagsBox.addItem(new Button({
                    text: tag,
                    type: "Ghost",
                    enabled: false
                }).addStyleClass("mucliappTag"));
            });
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteProjectView", {
                employeeId: this._sEmployeeId || "unknown"
            });
        }
    });
});
