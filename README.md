# Employee Detail — SAP UI5 Freestyle App

A lightweight SAP UI5 freestyle application that displays employee records in a responsive table with live department filtering. Built using the SAP Fiori Freestyle template via the easy-ui5 generator.

---

## What This App Does

- Renders a list of employees (ID, Name, Department) from a local JSON data source
- Provides a real-time search bar to filter rows by department as you type
- Presents the table inside a centered card layout with a grey page background for a clean Fiori-like appearance

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | SAP UI5 (OpenUI5) 1.136.2 |
| Template | Fiori Freestyle (Basic) |
| Module system | `sap.ui.define` / AMD |
| Data binding | `sap/ui/model/json/JSONModel` |
| Routing | `sap.m.routing.Router` |
| Tooling | `@sap/ux-ui5-tooling`, `@ui5/cli` v3 |
| Scaffolding | easy-ui5 generator |

---

## Project Structure

```
my-ui5-app-mkr/
└── mucliapp/
    └── webapp/
        ├── controller/
        │   ├── App.controller.js          # Shell controller (routing entry point)
        │   └── MainView.controller.js     # Main logic — model init + search filter
        ├── view/
        │   ├── App.view.xml               # Root shell view (NavContainer)
        │   └── MainView.view.xml          # Employee table + search bar
        ├── model/
        │   ├── models.js                  # Device model factory
        │   └── employees.json             # Local employee data source
        ├── i18n/
        │   └── i18n.properties            # UI text / translations
        ├── css/
        │   └── style.css                  # Custom layout styles
        ├── Component.js                   # UIComponent bootstrap
        ├── manifest.json                  # App descriptor (routing, models, libs)
        └── index.html                     # Entry point
```

---

## Views

### `App.view.xml`
The root shell view. Contains a `sap.m.App` control (NavContainer) that the router uses to navigate between pages. Controlled by `App.controller.js`.

### `MainView.view.xml`
The primary view. Key controls:

| Control | Role |
|---|---|
| `sap.m.Page` | Page shell — displays "Employee Detail" in the header |
| `sap.m.HBox` / `sap.m.VBox` | Flex layout wrappers that center the table as a card |
| `sap.m.Table` | Bound to `{employees>/employees}` — renders one row per employee |
| `sap.m.Toolbar` | Header toolbar inside the table — holds title and search field |
| `sap.m.SearchField` | Fires `liveChange` on every keystroke to trigger department filter |
| `sap.m.ColumnListItem` | Row template — each cell bound to a field on the current employee object |
| `sap.m.ObjectIdentifier` | Renders the Employee ID cell with subtle bold styling |

**Model binding path:** `employees>/employees`
- `employees` = named model registered on the view
- `/employees` = root array inside `employees.json`

---

## Controllers

### `App.controller.js`
Minimal shell controller. Extends `sap.ui.core.mvc.Controller`. No custom logic — routing is handled declaratively via `manifest.json`.

### `MainView.controller.js`
Core application logic. Extends `sap.ui.core.mvc.Controller`.

#### `onInit()`
```js
var oModel = new JSONModel(sap.ui.require.toUrl("mucliapp/model/employees.json"));
this.getView().setModel(oModel, "employees");
```
- Instantiates a `JSONModel` by fetching `employees.json` at runtime
- `sap.ui.require.toUrl()` resolves the module namespace path to an absolute URL (environment-agnostic)
- Registers the model under the named key `"employees"` so the view can bind with `{employees>...}`

#### `onDepartmentSearch(oEvent)`
```js
var sQuery = oEvent.getParameter("newValue");
var oBinding = this.byId("employeeTable").getBinding("items");
var aFilters = sQuery
    ? [new Filter("department", FilterOperator.Contains, sQuery)]
    : [];
oBinding.filter(aFilters);
```
- Reads the current search string from the `liveChange` event
- Retrieves the live `items` binding of the table
- Applies a `Contains` filter on the `department` field (case-insensitive)
- Passing an empty array clears all filters and restores the full list

---

## Data Source

**File:** `webapp/model/employees.json`

```json
{
  "employees": [
    { "employeeId": "E001", "name": "Alice Johnson",  "department": "Engineering" },
    { "employeeId": "E002", "name": "Bob Smith",      "department": "Marketing" },
    { "employeeId": "E003", "name": "Carol Davis",    "department": "Human Resources" },
    { "employeeId": "E004", "name": "David Lee",      "department": "Finance" },
    { "employeeId": "E005", "name": "Eva Martinez",   "department": "Engineering" }
  ]
}
```

Loaded client-side via `JSONModel`. No backend or OData service required.

---

## Routing

Defined in `manifest.json` under `sap.ui5.routing`:

| Property | Value |
|---|---|
| Router class | `sap.m.routing.Router` |
| View path | `mucliapp.view` |
| Default route | `RouteMainView` → pattern `:?query:` |
| Target | `TargetMainView` → `MainView.view.xml` |

---

## Styling

**File:** `webapp/css/style.css`

| Class | Purpose |
|---|---|
| `.employeePageContent` | Full-width flex container, grey background (`#f5f6f7`), 2rem padding |
| `.employeeTableWrapper` | White card, `max-width: 900px`, centered, `border-radius: 8px`, drop shadow |

SAP built-in class used on the `Table`: `sapUiResponsiveContentPadding` — adds responsive inner padding automatically.

---

## Running Locally

```bash
cd mucliapp
npm install
npm start
```

Opens at `http://localhost:8080/index.html`

---

## Repository

**GitHub:** https://github.com/Manish5788/mk-claude-proj
