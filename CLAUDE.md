# CLAUDE.md — mucliapp (UI5 Employee & Project App)

## Overview
SAP UI5 Fiori Freestyle application bootstrapped with `easy-ui5`. It displays an employee list and a project overview, wired together via the UI5 router.

## Project Structure
```
mucliapp/webapp/
├── Component.js              # UIComponent entry point, initialises router
├── manifest.json             # App descriptor — routes, targets, models, libs
├── index.html                # Standalone dev entry point
├── view/
│   ├── App.view.xml          # Root shell (sap.m.App container)
│   ├── MainView.view.xml     # Employee list with department search
│   └── ProjectView.view.xml  # Project list with status search & nav-back
├── controller/
│   ├── App.controller.js
│   ├── MainView.controller.js
│   └── ProjectView.controller.js
├── model/
│   ├── models.js             # Device model factory
│   ├── employees.json        # Static employee data
│   └── projects.json         # Static project data
├── i18n/
│   └── i18n.properties       # All UI text keys
└── css/
    └── style.css
```

## Running the App
```bash
# Install deps (first time)
npm install

# Start dev server (opens browser automatically)
npm start

# Run unit tests
npm test
```

## Routing
Routes are declared in `manifest.json` under `sap.ui5.routing`.

| Route name         | URL pattern | Target view  |
|--------------------|-------------|--------------|
| RouteMainView      | (default)   | MainView     |
| RouteProjectView   | `#/projects`| ProjectView  |

Navigation is done via `this.getOwnerComponent().getRouter().navTo("<RouteName>")`.

## Data Models
Both models are loaded as `sap.ui.model.json.JSONModel` inside each view's `onInit`:

- **employees** model → `model/employees.json` — fields: `employeeId`, `name`, `department`
- **projects** model → `model/projects.json` — fields: `projectId`, `projectName`, `status`, `team`, `lead`, `dueDate`

## Key Patterns
- **Search/filter**: `sap.ui.model.Filter` + `FilterOperator.Contains` applied to table binding via `oBinding.filter(aFilters)`.
- **ObjectStatus state**: computed via expression binding `{= ${projects>status} === 'Completed' ? 'Success' : ...}`.
- **Nav-back**: `ProjectView` shows a back button wired to `onNavBack` which calls `router.navTo("RouteMainView")`.

## Dependencies
- SAP UI5 ≥ 1.136.2 (`sap.m`, `sap.ui.core`)
- Node.js (for local dev server via `@ui5/cli`)

## Adding a New View (checklist)
1. Create `view/MyView.view.xml` + `controller/MyView.controller.js`.
2. Add a new route & target in `manifest.json` → `sap.ui5.routing`.
3. Add nav trigger (`router.navTo`) in the calling controller.
4. Add any new i18n keys to `i18n/i18n.properties`.
5. If new data is needed, add a `model/mydata.json` and load it in `onInit`.
