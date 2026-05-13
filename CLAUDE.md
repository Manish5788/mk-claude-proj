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
├── CLAUDE.md                                 ← you are here
├── mucliapp/
│   └── webapp/
│       ├── manifest.json                     ← routes, targets, lib dependencies
│       ├── index.html                        ← standalone bootstrap (CDN UI5)
│       ├── Component.js                      ← UIComponent, initialises router
│       ├── view/
│       │   ├── App.view.xml                  ← sap.m.Shell wrapper
│       │   ├── OverviewView.view.xml         ← landing page (ObjectPageLayout)
│       │   ├── MainView.view.xml             ← employee list (DynamicPage)
│       │   ├── ProjectView.view.xml          ← employee's projects (DynamicPage)
│       │   └── ProjectDetailView.view.xml    ← project detail (ObjectPageLayout)
│       ├── controller/
│       │   ├── App.controller.js
│       │   ├── OverviewView.controller.js
│       │   ├── MainView.controller.js
│       │   ├── ProjectView.controller.js
│       │   └── ProjectDetailView.controller.js
│       ├── model/
│       │   ├── models.js                     ← device model factory
│       │   ├── employees.json                ← 25 employees, 8 departments
│       │   └── projects.json                 ← 53 projects (fully enriched)
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

| Route name              | URL pattern                          | View                | Purpose                                          |
|-------------------------|--------------------------------------|---------------------|--------------------------------------------------|
| RouteOverviewView       | `:?query:` (default)                 | OverviewView        | Landing: KPI tiles, dept table, active projects  |
| RouteMainView           | `employees:?query:`                  | MainView            | Employee list with dept tab filter               |
| RouteProjectView        | `projects/{employeeId}`              | ProjectView         | Employee's own projects (filtered by lead)       |
| RouteProjectDetailView  | `projects/{employeeId}/{projectId}`  | ProjectDetailView   | Full project detail — overview, milestones, team |

Navigation is always done via:
```javascript
this.getOwnerComponent().getRouter().navTo("RouteXxx", { param: value });
```

### Navigation flow
```
OverviewView
  ├─ "Employees" button           → MainView
  └─ dept row click               → MainView?query={dept:"Engineering"}
       └─ employee row click      → ProjectView  (projects/{employeeId})
            └─ project row click  → ProjectDetailView  (projects/{employeeId}/{projectId})
                 └─ back button   → ProjectView
ProjectView → back button         → MainView
MainView    → home icon           → OverviewView
```

---

## Data Models

### employees.json
```json
{ "employeeId": "E001", "name": "Alice Johnson", "department": "Engineering" }
```
25 records across 8 departments: Engineering, Marketing, Finance, Sales,
Operations, Human Resources, Product, Legal.

### projects.json — full schema
```json
{
  "projectId":    "P001",
  "projectName":  "UI5 Dashboard Redesign",
  "status":       "In Progress",
  "team":         "Engineering",
  "lead":         "Alice Johnson",
  "dueDate":      "2026-07-31",
  "startDate":    "2026-03-01",
  "description":  "...",
  "priority":     "High",
  "budget":       120,
  "progress":     55,
  "tags":         ["UI5", "Fiori", "Frontend"],
  "teamMembers":  [{ "name": "Alice Johnson", "role": "Project Lead" }],
  "milestones":   [{ "title": "Kickoff", "date": "2026-03-07", "status": "Completed" }]
}
```

**Critical constraints:**
- `lead` must **exactly** match an employee `name` — used for row-level filtering in ProjectView
- `team` must **exactly** match an employee `department`
- `status` values: `"In Progress"` | `"Planning"` | `"Completed"`
- `priority` values: `"High"` | `"Medium"` | `"Low"`
- Milestone `status` values: `"Completed"` | `"In Progress"` | `"Pending"`

---

## UI Library Dependencies (`manifest.json`)
| Library      | Used for                                              |
|--------------|-------------------------------------------------------|
| `sap.m`      | Shell, tables, tiles, lists, forms, progress indicator|
| `sap.ui.core`| Core framework                                        |
| `sap.f`      | `DynamicPage`, `DynamicPageTitle/Header`              |
| `sap.uxap`   | `ObjectPageLayout`, `ObjectPageDynamicHeaderTitle`    |
| `sap.ui.layout` | `SimpleForm` (ResponsiveGridLayout) in detail view |

---

## Key UI Patterns

### OverviewView — `sap.uxap.ObjectPageLayout`
- `ObjectPageDynamicHeaderTitle` — sticky title with collapsible `headerContent`
- `headerContent` — `ObjectAttribute` pairs for key metrics (computed in controller)
- Sections: **Key Metrics** (GenericTile S-size), **Departments** (table with nav rows),
  **Active Projects** (table sorted by `dueDate`)
- Dept row click: `navTo("RouteMainView", { "?query": { dept: sDept } })`

### MainView — `sap.f.DynamicPage`
- `DynamicPageTitle.navigationActions` → Home button (`sap-icon://home`)
- `DynamicPageHeader` — 4 KPI `GenericTile` (S size) + `NumericContent`
- `IconTabBar` with `showAll="true"` + `IconTabSeparator` for dept filtering
- `ColumnListItem type="Navigation"` — row click passes `employeeId` to router
- `_onRouteMatched` reads `?query.dept` to pre-select a tab when navigating from Overview
- `_applyFilters` combines: active tab (AND) + search OR across name/department

### ProjectView — `sap.f.DynamicPage`
- `_onRouteMatched` reads `employeeId`, stores `_sEmployeeId` + `_sEmployeeName`
- `DynamicPageHeader` — employee `ObjectAttribute` + 4 KPI tiles (Total / In Progress / Completed / Planning)
- `IconTabBar` — status tabs (All / In Progress / Planning / Completed)
- `_applyFilters(sQuery)` stacks: lead filter + status tab filter + search
- `onProjectPress` — navigates to `RouteProjectDetailView` with `{ employeeId, projectId }`

### ProjectDetailView — `sap.uxap.ObjectPageLayout`
- `_onRouteMatched` reads `{ employeeId, projectId }`, finds project, calls `_populate(oProject)`
- `_populate` sets all controls imperatively (no binding — data from plain JS object)
- **5 sections:**
  1. **At a Glance** — `ProgressIndicator` + 4 KPI tiles (Budget $K, Days Remaining, Team Size, Milestones Done)
  2. **Project Details** — `SimpleForm` (ResponsiveGridLayout) with all fields
  3. **Milestones** — `List` populated with `StandardListItem` (step no., date, status icon + badge)
  4. **Team Members** — `List` populated with `StandardListItem` (name + role)
  5. **Tags** — `FlexBox` populated with Ghost `Button` chips (`.mucliappTag` CSS class)
- `destroyItems()` called on lists/flexbox before re-populating on each route match
- Back button → `navTo("RouteProjectView", { employeeId })`

### Shared patterns
- `ObjectStatus inverted="true"` — coloured badge chip for status/dept
- State map: `"Completed"→Success`, `"In Progress"→Warning`, `"Planning"→Information`
- Priority state map: `"High"→Error`, `"Medium"→Warning`, `"Low"→Success`
- Milestone icon map: `"Completed"→sap-icon://accept`, `"In Progress"→sap-icon://status-in-process`, `"Pending"→sap-icon://pending`
- `alternateRowColors="true"` on all tables
- `demandPopin="true"` on tablet/desktop-only columns for responsive layout
- `GenericTile` size `"S"` + `NumericContent withMargin="false"` for compact KPI tiles
- Filters: `and: false` for OR-search, stacked array for AND multi-filter

---

## Adding a New View (checklist)
1. Create `view/MyView.view.xml` + `controller/MyView.controller.js`
2. Add route + target in `manifest.json → sap.ui5.routing`
3. Add `navTo("RouteMyView")` trigger in the calling controller
4. Add any new i18n keys to `i18n/i18n.properties`
5. Add new data to `model/` if needed; load in `onInit` as a named JSONModel
6. Update this `CLAUDE.md` routing table and navigation flow diagram

---

## Git Workflow
- **Always** `git pull --rebase` before pushing if the remote has diverged
  (the project is also edited in SAP Business Application Studio)
- Stash unstaged changes before rebasing: `git stash` → rebase → `git stash pop`
- Commit message style: one short subject line + blank line + bullet details
