# CLAUDE.md — mucliapp (Employee & Project Hub)

> This file is the single source of truth for AI-assisted development on this project.
> Read it at the start of every session before making any changes.

---

## Project Overview
SAP UI5 Fiori Freestyle application bootstrapped with `easy-ui5`.  
Tracks **employees** (25) and their **projects** (53) across 8 departments.  
Visual benchmark: **Manage Products** demo app from the UI5 Demo Kit.

- **GitHub:** `https://github.com/Manish5788/mk-claude-proj.git` (branch: `main`)
- **Dev server:** `http://localhost:8080` — run `npm start` inside `mucliapp/`
- **UI5 version:** 1.136.2, theme: `sap_horizon`

---

## Repository Structure
```
my-ui5-app-mkr/
├── CLAUDE.md                            ← you are here
├── mucliapp/
│   └── webapp/
│       ├── manifest.json                ← routes, targets, lib dependencies
│       ├── index.html                   ← standalone bootstrap (CDN UI5)
│       ├── Component.js                 ← UIComponent, initialises router
│       ├── view/
│       │   ├── App.view.xml             ← sap.m.Shell wrapper
│       │   ├── OverviewView.view.xml    ← landing page (ObjectPageLayout)
│       │   ├── MainView.view.xml        ← employee list (DynamicPage)
│       │   └── ProjectView.view.xml     ← employee's projects (DynamicPage)
│       ├── controller/
│       │   ├── App.controller.js
│       │   ├── OverviewView.controller.js
│       │   ├── MainView.controller.js
│       │   └── ProjectView.controller.js
│       ├── model/
│       │   ├── models.js                ← device model factory
│       │   ├── employees.json           ← 25 employees, 8 departments
│       │   └── projects.json            ← 53 projects
│       ├── i18n/
│       │   └── i18n.properties
│       └── css/
│           └── style.css
```

---

## Running the App
```bash
cd mucliapp
npm install          # first time only
npm start            # starts fiori run, opens http://localhost:8080
```

---

## Routing

| Route name         | URL pattern             | View           | Purpose                                      |
|--------------------|-------------------------|----------------|----------------------------------------------|
| RouteOverviewView  | `:?query:` (default)    | OverviewView   | Landing: KPI tiles, dept table, active projects |
| RouteMainView      | `employees:?query:`     | MainView       | Employee list with dept tab filter           |
| RouteProjectView   | `projects/{employeeId}` | ProjectView    | Employee's own projects (filtered by lead)   |

Navigation is always done via:
```javascript
this.getOwnerComponent().getRouter().navTo("RouteXxx", { param: value });
```

### Navigation flow
```
OverviewView
  ├─ "Employees" button          → MainView
  └─ dept row click              → MainView?query={dept: "Engineering"}
       └─ employee row click     → ProjectView (projects/{employeeId})
            └─ back button       → MainView
MainView → home icon             → OverviewView
```

---

## Data Models

### employees.json
```json
{ "employeeId": "E001", "name": "Alice Johnson", "department": "Engineering" }
```
25 records across 8 departments: Engineering, Marketing, Finance, Sales,
Operations, Human Resources, Product, Legal.

### projects.json
```json
{
  "projectId": "P001", "projectName": "UI5 Dashboard Redesign",
  "status": "In Progress", "team": "Engineering",
  "lead": "Alice Johnson", "dueDate": "2026-07-31"
}
```
53 records. **Critical constraint:** `lead` must exactly match an employee's `name`
(used for row-level filtering in ProjectView). `team` must match a `department`.
Status values: `"In Progress"` | `"Planning"` | `"Completed"`.

---

## UI Library Dependencies (`manifest.json`)
| Library      | Used for                                      |
|--------------|-----------------------------------------------|
| `sap.m`      | Shell, DynamicPage controls, tables, tiles     |
| `sap.ui.core`| Core framework                                |
| `sap.f`      | `DynamicPage`, `DynamicPageTitle/Header`       |
| `sap.uxap`   | `ObjectPageLayout`, `ObjectPageDynamicHeaderTitle` |

---

## Key UI Patterns

### OverviewView — `sap.uxap.ObjectPageLayout`
- `ObjectPageDynamicHeaderTitle` — sticky title with collapsible `headerContent`
- `headerContent` — `ObjectAttribute` pairs for key metrics
- Sections: **Key Metrics** (GenericTile S-size), **Departments** (table),
  **Active Projects** (table sorted by dueDate)
- Dept row click navigates with query param: `navTo("RouteMainView", { "?query": { dept: sDept } })`

### MainView — `sap.f.DynamicPage`
- `DynamicPageTitle.navigationActions` → Home button (`sap-icon://home`)
- `DynamicPageHeader` — 4 KPI `GenericTile` (S size) with `NumericContent`
- `IconTabBar` with `showAll="true"` + `IconTabSeparator` for dept filtering
- `ColumnListItem type="Navigation"` — row click passes `employeeId` to router
- Reads `?query.dept` on `RouteMainView` pattern match to pre-select a tab
- Combined filters: tab filter AND search (OR across name + department)

### ProjectView — `sap.f.DynamicPage`
- Route matched → reads `employeeId`, looks up employee, filters projects by `lead === name`
- `DynamicPageHeader` — employee attributes + 4 KPI tiles (Total / In Progress / Completed / Planning)
- `IconTabBar` for status tabs (All / In Progress / Planning / Completed)
- `_applyFilters(sQuery)` always stacks: employee filter + status tab filter + search

### Shared patterns
- `ObjectStatus inverted="true"` — coloured badge chip for dept/status
- `alternateRowColors="true"` on all tables
- `demandPopin="true"` on tablet/desktop-only columns for responsive layout
- `GenericTile` size `"S"` + `NumericContent withMargin="false"` for compact KPI tiles
- Filters combined with `and: false` for OR (search), stacked array for AND (multi-filter)

---

## Adding a New View (checklist)
1. Create `view/MyView.view.xml` + `controller/MyView.controller.js`
2. Add route + target in `manifest.json → sap.ui5.routing`
3. Add `navTo("RouteMyView")` trigger in the calling controller
4. Add any new i18n keys to `i18n/i18n.properties`
5. Add new data to `model/` if needed; load in `onInit` as a named JSONModel
6. Update this `CLAUDE.md` routing table

---

## Git Workflow
- **Always** `git pull --rebase` before pushing if the remote has diverged
  (the project is also edited in SAP Business Application Studio)
- Stash unstaged changes before rebasing: `git stash` → rebase → `git stash pop`
- Commit message style: one short subject line + blank line + bullet details
