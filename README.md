# Pro To-Do Application — Product Requirements Document (PRD)

> **Version:** 1.1
> **Last Updated:** April 16, 2026
> **Author:** Abhinav Kumar Arya ([itzabhinavarya](https://github.com/itzabhinavarya))
> **Repository:** [ToDo-Application-AutoQA](https://github.com/JCherry101/ToDo-Application-AutoQA)
> **License:** ISC

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Goals & Objectives](#2-goals--objectives)
3. [Target Audience](#3-target-audience)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture](#5-system-architecture)
6. [Project Structure](#6-project-structure)
7. [Data Models](#7-data-models)
8. [Functional Requirements](#8-functional-requirements)
   - [FR-01 User Registration (Sign Up)](#fr-01-user-registration-sign-up)
   - [FR-02 User Login](#fr-02-user-login)
   - [FR-03 User Logout](#fr-03-user-logout)
   - [FR-04 Session Management](#fr-04-session-management)
   - [FR-05 Create To-Do](#fr-05-create-to-do)
   - [FR-06 View To-Dos](#fr-06-view-to-dos)
   - [FR-07 View Single To-Do](#fr-07-view-single-to-do)
   - [FR-08 Update To-Do](#fr-08-update-to-do)
   - [FR-09 Toggle To-Do Completion](#fr-09-toggle-to-do-completion)
   - [FR-10 Delete To-Do](#fr-10-delete-to-do)
   - [FR-11 Search To-Dos](#fr-11-search-to-dos)
   - [FR-12 Filter To-Dos](#fr-12-filter-to-dos)
   - [FR-13 Sort To-Dos](#fr-13-sort-to-dos)
   - [FR-14 Clear Filters](#fr-14-clear-filters)
   - [FR-15 Todo Priority Levels](#fr-15-todo-priority-levels)
9. [API Reference](#9-api-reference)
10. [User Interface Specification](#10-user-interface-specification)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Project Screenshots](#12-project-screenshots)
13. [Getting Started](#13-getting-started)
14. [Contributing](#14-contributing)
15. [Future Roadmap](#15-future-roadmap)

---

## 1. Product Overview

**Pro To-Do** is a full-stack, multi-user task management web application built on Node.js and Express. Users can register, log in, and manage a personal list of to-do items through a modern, glassmorphism-styled UI. The application runs entirely without a database — all persistent data (users, sessions, todos) is stored in flat JSON files on disk. This makes it an ideal learning resource for full-stack web development fundamentals while remaining fully functional as a practical productivity tool.

### Key Highlights

| Attribute | Detail |
| --------- | ------ |
| **Application Type** | Single-page web application (SPA-like, with dynamic DOM rendering) |
| **Architecture** | Monolithic — Node.js/Express server with static frontend |
| **Database** | None — JSON flat-file persistence |
| **Authentication** | Token-based (SHA-256 hashed passwords, random hex session tokens) |
| **Hosting** | Localhost (port 3000 by default) |

---

## 2. Goals & Objectives

| # | Goal | Description |
|---|------|-------------|
| G-01 | **Functional Task Management** | Provide complete CRUD (Create, Read, Update, Delete) operations on to-do items with a seamless user experience. |
| G-02 | **Multi-User Support** | Allow multiple users to register, authenticate, and maintain independent, isolated to-do lists. |
| G-03 | **Zero External Dependencies for Data** | Eliminate the need for a database by using JSON files, making the project trivially portable and easy to set up. |
| G-04 | **Modern, Polished UI** | Deliver a visually premium interface using glassmorphism, smooth animations, and responsive design principles. |
| G-05 | **Developer-Friendly Codebase** | Keep the code clean, well-structured, and easy to extend for open-source contributors and learners. |
| G-06 | **QA/AutoQA Ready** | Serve as a stable test target for automated quality assurance testing (Selenium, Cypress, Playwright, etc.). |

---

## 3. Target Audience

- **Beginner Developers** — learning Node.js, Express, and vanilla frontend development.
- **Open Source Contributors** — looking for a well-scoped, approachable project to contribute to.
- **QA Engineers** — using the application as a system under test for manual and automated testing.
- **End Users** — individuals who need a lightweight, self-hosted task management tool.

---

## 4. Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **HTML5** | Page structure and semantic markup |
| **Vanilla CSS** | Styling — glassmorphism, gradients, animations, responsive grid layout |
| **Vanilla JavaScript (ES6+)** | Client-side logic, DOM manipulation, API communication via Fetch API |
| **Google Fonts** | Typography — Poppins (primary), Inter (secondary) |
| **Material Icons** | Iconography for buttons and UI elements |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js v4** | HTTP server and REST API framework |
| **body-parser** | JSON request body parsing middleware |
| **cors** | Cross-Origin Resource Sharing middleware |
| **crypto** (built-in) | SHA-256 password hashing and token generation |
| **fs** (built-in) | Synchronous file I/O for JSON persistence |

### Development Tooling

| Tool | Purpose |
|------|---------|
| **nodemon** | Auto-restart server on file changes during development |
| **supertest** | HTTP assertion library for API testing |

---

## 5. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                                                                  │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────────────┐  │
│  │index.html│  │ styles.css│  │         script.js            │  │
│  │ (Markup) │  │ (Styling) │  │ (State, Auth, API, Render)   │  │
│  └──────────┘  └───────────┘  └───────────┬──────────────────┘  │
│                                            │                     │
│                    Fetch API (REST + Auth Token)                 │
└────────────────────────────┬─────────────────────────────────────┘
                             │  HTTP (Port 3000)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                   SERVER (Node.js + Express)                     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    todoServer.js                           │  │
│  │                                                            │  │
│  │  ┌──────────┐  ┌───────────────────┐  ┌────────────────┐  │  │
│  │  │  Auth    │  │   CRUD Routes     │  │  Middleware     │  │  │
│  │  │  Routes  │  │ GET    /todos     │  │  requireAuth   │  │  │
│  │  │ /signup  │  │ POST   /todos     │  │  static serve  │  │  │
│  │  │ /login   │  │ PUT    /todos/:id │  │  body-parser   │  │  │
│  │  │ /logout  │  │ PATCH  /toggle    │  │  cors          │  │  │
│  │  │          │  │ PATCH  /priority  │  │                │  │  │
│  │  │          │  │ DELETE /todos/:id │  │                │  │  │
│  │  └──────────┘  └───────────────────┘  └────────────────┘  │  │
│  └────────────────────────┬───────────────────────────────────┘  │
│                           │                                      │
│         Synchronous File I/O (fs.readFileSync / writeFileSync)   │
│                           │                                      │
│  ┌────────────────────────▼───────────────────────────────────┐  │
│  │                  JSON File Store                           │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌────────────┐  ┌────────────────┐     │  │
│  │  │  users.json  │  │ todos.json │  │ sessions.json  │     │  │
│  │  │ (User data)  │  │(Todo data) │  │(Active tokens) │     │  │
│  │  └──────────────┘  └────────────┘  └────────────────┘     │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **Client** sends an HTTP request with an `Authorization` header (session token).
2. **Express middleware** (`requireAuth`) extracts the token, looks up `sessions.json`, and resolves the `userId`.
3. **Route handler** reads or modifies the appropriate JSON file, scoping data to the authenticated user.
4. **Response** is returned as JSON to the client.
5. **Client** re-renders the DOM based on the response data.

---

## 6. Project Structure

```
ToDo-Application-AutoQA/
├── .git/                  # Git version control
├── .gitignore             # Ignores node_modules, sessions.json, todos.json, users.json
├── index.html             # Root HTML page (served at /)
├── package.json           # NPM manifest and scripts
├── package-lock.json      # Locked dependency tree
├── todoServer.js          # Express server — all backend logic
├── users.json             # Persistent user data store
├── todos.json             # Persistent to-do item data store
├── sessions.json          # Active session token → userId mapping
├── public/                # Static assets served by Express
│   ├── script.js          # Frontend JavaScript
│   └── styles.css         # Frontend CSS
├── node_modules/          # Installed NPM dependencies
└── README.md              # This document
```

---

## 7. Data Models

### 7.1 User

Stored in `users.json` as a JSON array.

| Field | Type | Description | Constraints |
| ----- | ---- | ----------- | ----------- |
| `id` | Integer | Auto-incremented unique identifier | Primary key; sequential |
| `name` | String | Display name of the user | Required, non-empty |
| `email` | String | Email address (used as login credential) | Required, unique across all users |
| `password` | String | SHA-256 hex digest of the user's plain password | Required, stored hashed (never raw) |

**Example:**
```json
{
  "id": 3,
  "name": "itzabhinavarya",
  "email": "itzabhinavarya@gmail.com",
  "password": "559aead08264d5795d3909718cdd05abd49572e84fe55590eef31a88a08fdffd"
}
```

### 7.2 To-Do Item

Stored in `todos.json` as a JSON array.

| Field | Type | Description | Constraints |
| ----- | ---- | ----------- | ----------- |
| `id` | Integer | Auto-incremented unique identifier | Primary key; sequential |
| `userId` | Integer | Foreign key referencing the owning user | Required; must match a user `id` |
| `title` | String | Short summary of the task | Required, non-empty string |
| `description` | String | Detailed description of the task | Required, string |
| `completed` | Boolean | Whether the task has been finished | Required; defaults to `false` |
| `priority` | String | Urgency level of the task | One of `low`, `medium`, `high`; defaults to `medium` |
| `createdAt` | ISO 8601 | Timestamp of creation | Auto-generated on create |
| `updatedAt` | ISO 8601 | Timestamp of last modification | Auto-generated on create & update |

**Example:**
```json
{
  "id": 3,
  "userId": 3,
  "title": "Goto Gym",
  "description": "I have to go-to gym at 8:00 PM",
  "completed": false,
  "priority": "high",
  "createdAt": "2025-07-27T18:42:59.589Z",
  "updatedAt": "2025-07-27T18:42:59.590Z"
}
```

### 7.3 Session

Stored in `sessions.json` as a JSON object (key-value map).

| Field | Type | Description |
| ----- | ---- | ----------- |
| *key* | String | 64-character hex token (generated via `crypto.randomBytes(32)`) |
| *value* | Integer | The `userId` associated with this active session |

**Example:**
```json
{
  "1c7ce1fb78c6c1b867c7f0653ea63841ef9295852cc6624aa71802b3f913a69f": 3
}
```

---

## 8. Functional Requirements

### FR-01 User Registration (Sign Up)

| Attribute | Detail |
| --------- | ------ |
| **ID** | FR-01 |
| **Priority** | P0 (Critical) |
| **Description** | A new user can create an account by providing a name, email, and password. |

**Acceptance Criteria:**

- [x] The user provides a `name`, `email`, and `password` via the sign-up form.
- [x] The system validates that all three fields are non-empty.
- [x] If the email already exists in `users.json`, the system returns HTTP `409 Conflict` with an error message.
- [x] The password is hashed using SHA-256 before storage (never stored in plain text).
- [x] A new user record is appended to `users.json` with a sequential `id`.
- [x] A default welcome to-do item is automatically created for the new user with `priority: "medium"`.
- [x] On success, the system returns HTTP `201 Created` with a success message.
- [x] The UI redirects the user to the Login form after successful registration.

---

### FR-02 User Login

| Attribute | Detail |
| --------- | ------ |
| **ID** | FR-02 |
| **Priority** | P0 (Critical) |
| **Description** | A registered user can authenticate using their email and password to receive a session token. |

**Acceptance Criteria:**

- [x] The user provides `email` and `password` via the login form.
- [x] The system hashes the input password and compares it against the stored hash.
- [x] If credentials are invalid, the system returns HTTP `401 Unauthorized`.
- [x] On success, a 64-character hex session token is generated via `crypto.randomBytes(32)`.
- [x] The token is mapped to the user's `id` in `sessions.json`.
- [x] The token, user `name`, and `email` are returned to the client (HTTP `200 OK`).
- [x] The client stores the token, name, and email in `localStorage` for session persistence across page reloads.
- [x] The UI header displays the logged-in user's name and email.

---

### FR-03 User Logout

| Attribute | Detail |
| --------- | ------ |
| **ID** | FR-03 |
| **Priority** | P0 (Critical) |
| **Description** | A logged-in user can terminate their session. |

**Acceptance Criteria:**

- [x] The user clicks the logout button in the header.
- [x] The client sends a `POST /logout` request with the `Authorization` header.
- [x] The server removes the token entry from `sessions.json`.
- [x] The client clears `token`, `name`, and `email` from `localStorage`.
- [x] The UI returns to the login/register state.

---

### FR-04 Session Management

| Attribute | Detail |
| --------- | ------ |
| **ID** | FR-04 |
| **Priority** | P0 (Critical) |
| **Description** | The system manages user sessions using token-based authentication. |

**Acceptance Criteria:**

- [x] Every authenticated API request includes an `Authorization` header with the session token.
- [x] The `requireAuth` middleware validates the token against `sessions.json` before allowing access to protected routes.
- [x] If the token is invalid or missing, the server responds with HTTP `401 Unauthorized`.
- [x] The client automatically detects `401` responses and redirects to the login modal.
- [x] Session state survives page refreshes via `localStorage`.

**Protected Routes:**

| Method | Endpoint | Auth Required |
|--------|----------|:-------------:|
| GET | `/todos` | ✅ |
| GET | `/todos/:id` | ✅ |
| POST | `/todos` | ✅ |
| PUT | `/todos/:id` | ✅ |
| PATCH | `/todos/:id/toggle` | ✅ |
| PATCH | `/todos/:id/priority` | ✅ |
| DELETE | `/todos/:id` | ✅ |
| POST | `/signup` | ❌ |
| POST | `/login` | ❌ |
| POST | `/logout` | ❌ |
| GET | `/` | ❌ |

---

### FR-05 Create To-Do

| Attribute | Detail |
| --------- | ------ |
| **ID** | FR-05 |
| **Priority** | P0 (Critical) |
| **Description** | An authenticated user can create a new to-do item. |

**Acceptance Criteria:**

- [x] The user clicks the floating action button (FAB `+`) to open the "Add To-Do" modal.
- [x] The modal presents inputs for `Title`, `Description`, and `Priority`.
- [x] `Title` and `Description` are required; the form cannot submit with empty fields.
- [x] The `completed` status defaults to `false` on creation.
- [x] The `priority` field defaults to `medium` if not selected.
- [x] Server-side validation ensures `title` is a non-empty string, `description` is a string, `completed` is a boolean, and `priority` (if provided) is one of `low`, `medium`, `high`.
- [x] On success, the to-do is appended to `todos.json` with auto-generated `id`, `createdAt`, and `updatedAt`.
- [x] The server returns the created to-do with HTTP `201 Created`.
- [x] The to-do list re-renders to include the new item.
- [x] The modal closes automatically after successful creation.

---

### FR-06 View To-Dos

| Attribute | Detail |
| --------- | ------ |
| **ID** | FR-06 |
| **Priority** | P0 (Critical) |
| **Description** | An authenticated user can view all of their to-do items, with optional search, filter, and sort parameters. |

**Acceptance Criteria:**

- [x] The to-do list loads automatically after login or page load (if session exists).
- [x] Only to-dos belonging to the authenticated user are displayed (data isolation).
- [x] Each to-do card displays: status badge, priority badge, title, description, created/updated timestamps, and action buttons (Edit, Delete, Toggle).
- [x] An empty state message ("No todos found.") is shown when the user has no matching to-dos.
- [x] A loading spinner is displayed while the API request is in progress.

---

### FR-07 View Single To-Do

| Attribute | Detail |
| --------- | ------ |
| **ID** | FR-07 |
| **Priority** | P1 (High) |
| **Description** | The API supports retrieving a single to-do by its ID. |

**Acceptance Criteria:**

- [x] `GET /todos/:id` returns the to-do if it belongs to the authenticated user.
- [x] Returns HTTP `404 Not Found` if the to-do does not exist or does not belong to the user.

---

### FR-08 Update To-Do

| Attribute | Detail |
| --------- | ------ |
| **ID** | FR-08 |
| **Priority** | P0 (Critical) |
| **Description** | An authenticated user can edit the title, description, completion status, and priority of an existing to-do. |

**Acceptance Criteria:**

- [x] The user clicks the "Edit" button on a to-do card.
- [x] The edit modal opens pre-populated with the current `title`, `description`, `completed` state, and `priority`.
- [x] The modal title changes to "Edit To-Do" and the submit button text changes to "Save".
- [x] The `completed` toggle switch is visible in edit mode (hidden in create mode).
- [x] On submit, a `PUT /todos/:id` request updates the to-do including priority.
- [x] If `priority` is omitted, the existing value is preserved.
- [x] The `updatedAt` timestamp is refreshed to the current time.
- [x] Server-side validation runs on the updated fields.
- [x] Returns HTTP `404` if the to-do does not exist or does not belong to the user.
- [x] The to-do list re-renders with the updated data.

---

### FR-09 Toggle To-Do Completion

| Attribute | Detail |
| --------- | ------ |
| **ID** | FR-09 |
| **Priority** | P0 (Critical) |
| **Description** | An authenticated user can toggle a to-do between "Active" and "Completed" states with a single click. |

**Acceptance Criteria:**

- [x] The user clicks "Mark Complete" or "Mark Active" on a to-do card.
- [x] A `PATCH /todos/:id/toggle` request inverts the `completed` boolean.
- [x] The `updatedAt` timestamp is refreshed.
- [x] The `priority` field is preserved unchanged by the toggle operation.
- [x] The to-do card visually updates (status badge colour changes, `.completed` CSS class is applied).
- [x] Returns HTTP `404` if the to-do does not exist or does not belong to the user.

---

### FR-10 Delete To-Do

| Attribute | Detail |
| --------- | ------ |
| **ID** | FR-10 |
| **Priority** | P0 (Critical) |
| **Description** | An authenticated user can permanently delete a to-do item. |

**Acceptance Criteria:**

- [x] The user clicks the "Delete" button on a to-do card.
- [x] A browser `confirm()` dialog asks the user to confirm deletion.
- [x] If confirmed, a `DELETE /todos/:id` request removes the to-do from `todos.json`.
- [x] The deleted to-do data is returned in the response (HTTP `200 OK`).
- [x] Returns HTTP `404` if the to-do does not exist or does not belong to the user.
- [x] The to-do list re-renders without the deleted item.

---

### FR-11 Search To-Dos

| Attribute | Detail |
| --------- | ------ |
| **ID** | FR-11 |
| **Priority** | P1 (High) |
| **Description** | An authenticated user can search their to-dos by keyword. |

**Acceptance Criteria:**

- [x] A search input field is present in the control bar.
- [x] Search is triggered on every keystroke (`oninput` event).
- [x] The search term is passed as a `search` query parameter to `GET /todos`.
- [x] The server performs a case-insensitive substring match against both `title` and `description`.
- [x] A clear (×) button next to the search input resets the search.

---

### FR-12 Filter To-Dos

| Attribute | Detail |
| --------- | ------ |
| **ID** | FR-12 |
| **Priority** | P1 (High) |
| **Description** | An authenticated user can filter their to-dos by completion status or priority level. |

**Acceptance Criteria:**

- [x] A dropdown provides filter options: **All**, **Active**, **Completed**, **Priority: High**, **Priority: Medium**, **Priority: Low**.
- [x] Selecting a filter triggers an immediate re-fetch and re-render.
- [x] Status filters (`active`, `completed`) and priority filters (`priority=high/medium/low`) are applied server-side.
- [x] Default filter is `All` (no filtering).

| Filter Value | Behaviour |
| ------------ | --------- |
| `all` | No filtering — show all to-dos |
| `active` | Show only `completed === false` |
| `completed` | Show only `completed === true` |
| `priority-high` | Show only `priority === "high"` |
| `priority-medium` | Show only `priority === "medium"` |
| `priority-low` | Show only `priority === "low"` |

---

### FR-13 Sort To-Dos

| Attribute | Detail |
| --------- | ------ |
| **ID** | FR-13 |
| **Priority** | P1 (High) |
| **Description** | An authenticated user can sort their to-dos by various criteria including priority. |

**Acceptance Criteria:**

- [x] A dropdown provides four sort options.
- [x] Selecting a sort option triggers an immediate re-fetch and re-render.
- [x] The `sort` query parameter is applied server-side.
- [x] Default sort is `createdAt` (newest first).

| Sort Value | Behaviour |
| ---------- | --------- |
| `createdAt` | Sort by creation date, newest first (descending) |
| `updatedAt` | Sort by last update date, newest first (descending) |
| `title` | Sort alphabetically by title (ascending) |
| `priority` | Sort by urgency — high → medium → low |

---

### FR-14 Clear Filters

| Attribute | Detail |
| --------- | ------ |
| **ID** | FR-14 |
| **Priority** | P2 (Medium) |
| **Description** | The user can reset all search, filter, and sort controls to their default values in one action. |

**Acceptance Criteria:**

- [x] A "Clear Filters" button (icon: `filter_alt_off`) is present in the control bar.
- [x] Clicking it resets: search to empty, filter to `all`, sort to `createdAt`.
- [x] The to-do list re-fetches and re-renders with default parameters.

---

### FR-15 Todo Priority Levels

| Attribute | Detail |
| --------- | ------ |
| **ID** | FR-15 |
| **Priority** | P1 (High) |
| **Description** | An authenticated user can assign a priority level (low, medium, high) to each to-do item to indicate urgency and control ordering. |

**Acceptance Criteria:**

- [x] Every todo has a `priority` field stored in `todos.json`; existing todos without the field are treated as `medium`.
- [x] `POST /todos` accepts an optional `priority` (`low`, `medium`, `high`); omitting it defaults to `medium`.
- [x] `POST /todos` with a `priority` value outside the valid set returns HTTP `400 Bad Request`.
- [x] `PUT /todos/:id` accepts and stores an updated `priority` with the same validation rules.
- [x] If `priority` is omitted from `PUT /todos/:id`, the existing value is preserved.
- [x] `PATCH /todos/:id/priority` with a valid value updates only `priority` and `updatedAt`.
- [x] `PATCH /todos/:id/priority` with an invalid value returns HTTP `400 Bad Request`.
- [x] `PATCH /todos/:id/priority` on a non-existent or unowned todo returns HTTP `404 Not Found`.
- [x] `GET /todos?priority=high` returns only todos where `priority === "high"` for the authenticated user.
- [x] `GET /todos?sort=priority` returns todos ordered high → medium → low.
- [x] `PATCH /todos/:id/toggle` preserves the existing `priority` value unchanged.
- [x] Each todo card displays a colour-coded priority badge: red (high), amber (medium), grey (low).
- [x] The create/edit modal includes a priority dropdown that defaults to `medium`.
- [x] The filter dropdown includes Priority: High, Medium, and Low options.
- [x] The sort dropdown includes a Sort by Priority option.

---

## 9. API Reference

Base URL: `http://localhost:3000`

### Authentication Endpoints

#### `POST /signup`

Create a new user account.

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|:--------:|-------------|
| name | body | string | ✅ | User's display name |
| email | body | string | ✅ | User's email (unique) |
| password | body | string | ✅ | User's password (hashed on server) |

**Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| `201 Created` | `{ "message": "Signup successful." }` | Account created successfully |
| `400 Bad Request` | `{ "error": "Name, email, and password required." }` | Missing required fields |
| `409 Conflict` | `{ "error": "Email already exists." }` | Email is already registered |

**Side Effect:** A default welcome to-do with `priority: "medium"` is created for the new user.

---

#### `POST /login`

Authenticate a user and obtain a session token.

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|:--------:|-------------|
| email | body | string | ✅ | Registered email |
| password | body | string | ✅ | Account password |

**Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| `200 OK` | `{ "token": "<hex>", "name": "<name>", "email": "<email>" }` | Credentials valid |
| `401 Unauthorized` | `{ "error": "Invalid credentials." }` | Wrong email or password |

---

#### `POST /logout`

Terminate the current session.

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|:--------:|-------------|
| Authorization | header | string | ✅ | Session token |

**Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| `200 OK` | `{ "message": "Logged out." }` | Session terminated |
| `400 Bad Request` | `{ "error": "No token provided." }` | Missing Authorization header |

---

### To-Do CRUD Endpoints

> **All routes below require the `Authorization` header.**

#### `GET /todos`

Retrieve all to-dos for the authenticated user with optional query parameters.

| Query Param | Type | Options | Default | Description |
|-------------|------|---------|---------|-------------|
| `search` | string | Any | (none) | Case-insensitive substring search on title and description |
| `filter` | string | `completed`, `active` | (none) | Filter by completion status |
| `priority` | string | `low`, `medium`, `high` | (none) | Filter by priority level |
| `sort` | string | `title`, `createdAt`, `updatedAt`, `priority` | (none) | Sort order |

**Response:** `200 OK` — JSON array of to-do objects.

---

#### `GET /todos/:id`

Retrieve a single to-do by its ID.

**Response:** `200 OK` — To-do object, or `404 Not Found`.

---

#### `POST /todos`

Create a new to-do item.

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|:--------:|-------------|
| title | body | string | ✅ | Task title (non-empty) |
| description | body | string | ✅ | Task description |
| completed | body | boolean | ❌ | Defaults to `false` |
| priority | body | string | ❌ | `low`, `medium`, or `high`. Defaults to `medium` |

**Response:** `201 Created` — Created to-do object, or `400 Bad Request`.

---

#### `PUT /todos/:id`

Update an existing to-do item (full replacement of mutable fields).

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|:--------:|-------------|
| title | body | string | ✅ | Updated title |
| description | body | string | ✅ | Updated description |
| completed | body | boolean | ✅ | Updated completion status |
| priority | body | string | ❌ | Updated priority. Existing value preserved if omitted |

**Response:** `200 OK` — Updated to-do object, or `404 Not Found`, or `400 Bad Request`.

---

#### `PATCH /todos/:id/toggle`

Toggle the completion status of a to-do. Priority is not affected.

**Response:** `200 OK` — Updated to-do object, or `404 Not Found`.

---

#### `PATCH /todos/:id/priority`

Update only the priority of a to-do without performing a full update.

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|:--------:|-------------|
| priority | body | string | ✅ | New priority: `low`, `medium`, or `high` |

**Responses:**

| Status | Body | Condition |
|--------|------|-----------|
| `200 OK` | Updated to-do object | Priority updated successfully |
| `400 Bad Request` | `{ "error": "Invalid priority. Must be low, medium, or high." }` | Value not in valid set |
| `404 Not Found` | `{ "error": "Record not found." }` | Todo not found or not owned by user |

---

#### `DELETE /todos/:id`

Delete a to-do item.

**Response:** `200 OK` — Deleted to-do object, or `404 Not Found`.

---

## 10. User Interface Specification

### 10.1 Layout & Components

| Component | Element ID / Class | Description |
|-----------|-------------------|-------------|
| **App Header** | `.app-header` | Fixed top bar — logo, app title, user info, login/register/logout buttons |
| **User Info** | `#user-info` | Displays the logged-in user's name and email |
| **Controls Bar** | `.todo-controls` | Search input, filter dropdown, sort dropdown, clear filters button |
| **Todo Board** | `.todo-board` > `.outputData` | Responsive CSS Grid of to-do cards |
| **Todo Card** | `.output` | Individual to-do: status badge, priority badge, title, description, timestamps, action buttons |
| **FAB** | `#add-todo-btn` | Floating Action Button (bottom-right) to create a new to-do |
| **Edit Modal** | `#edit-modal` | Modal dialog for creating or editing a to-do (includes priority selector) |
| **Auth Modal** | `#auth-modal` | Modal dialog for login/sign-up forms |

### 10.2 Priority Badge Colour System

| Priority | Badge Class | Background | Text Colour | Label |
|----------|-------------|------------|-------------|-------|
| `high` | `.priority-badge.high` | `#ffe0e0` | `#c0392b` (red) | High |
| `medium` | `.priority-badge.medium` | `#fff3cd` | `#b8860b` (amber) | Medium |
| `low` | `.priority-badge.low` | `#e8f5e9` | `#2e7d32` (green) | Low |

### 10.3 Design System

| Token | Value | Usage |
|-------|-------|-------|
| **Primary Color** | `#5b6ee1` | Buttons, links, badges, accents |
| **Gradient (Primary)** | `#5b6ee1 → #a1c4fd` | FAB, action buttons, status badges |
| **Background** | `linear-gradient(135deg, #e0e7ff, #f5f7fa)` | Page background |
| **Card Background** | `rgba(255,255,255,0.85)` | Glassmorphism cards |
| **Border Radius** | `20px` (cards), `10px` (buttons), `14px` (modal buttons) | Rounded corners |
| **Font Family** | Poppins (primary), Arial (fallback) | All text |

### 10.4 Responsive Behaviour

| Breakpoint | Behaviour |
|------------|-----------|
| **> 700px** | Multi-column grid (`minmax(320px, 1fr)`), full padding |
| **≤ 700px** | Single-column layout, reduced padding, smaller FAB |
| **≤ 400px** | Modal takes 90% viewport width |

### 10.5 Accessibility

- Modal `aria-hidden` attribute toggles correctly between `"true"` and `"false"`.
- Modals are dismissible via the `Escape` key.
- Modals are dismissible by clicking the overlay area.
- Focus is automatically moved to the first input when modals open.
- `title` attributes are set on icon-only buttons.

---

## 11. Non-Functional Requirements

### NFR-01 Performance

| Requirement | Target |
|-------------|--------|
| Server cold start | < 2 seconds |
| API response time (local, ~100 todos) | < 100ms |
| First Contentful Paint (FCP) | < 1 second on localhost |

### NFR-02 Security

| Area | Implementation |
|------|----------------|
| Password storage | SHA-256 hashed — never stored in plaintext |
| Session tokens | 256-bit cryptographically random hex strings |
| Data isolation | All to-do CRUD operations are scoped by `userId` |
| CORS | Enabled via `cors` middleware |
| Priority validation | Server rejects any priority value outside `['low','medium','high']` |

> **⚠️ Known Limitations (acceptable for learning/demo scope):**
> - SHA-256 without salting is vulnerable to rainbow table attacks. Production apps should use bcrypt or Argon2.
> - Session tokens are stored in `localStorage`, which is susceptible to XSS attacks. Production apps should use HTTP-only cookies.
> - No rate limiting on authentication endpoints.
> - No HTTPS enforcement.

### NFR-03 Reliability

| Requirement | Detail |
|-------------|--------|
| Data persistence | All writes are synchronous (`writeFileSync`), ensuring data is flushed before responding |
| Error handling | File I/O errors are caught and logged; API returns `500` on write failure |
| Graceful degradation | If a JSON file is corrupted or missing, empty defaults (`[]` or `{}`) are returned |
| Priority fallback | Todos missing a `priority` field (pre-v1.1 data) are treated as `medium` at query time |

### NFR-04 Maintainability

| Requirement | Detail |
|-------------|--------|
| Code organization | Monolithic but cleanly separated: server, frontend JS, CSS in distinct files |
| Dependencies | Minimal — 3 runtime dependencies (Express, CORS, body-parser) |
| Dev tooling | `nodemon` for hot-reloading; `supertest` for API testing |
| Module export | `module.exports = app` enables programmatic testing |

### NFR-05 Portability

| Requirement | Detail |
|-------------|--------|
| Runtime | Node.js v14+ (no native modules) |
| OS | Windows, macOS, Linux |
| Setup | `npm install` + `npm start` — no database, no Docker, no external services |

---

## 12. Project Screenshots

<img width="1907" height="906" alt="Login page" src="https://github.com/user-attachments/assets/c5f032d9-553b-4f91-97b2-d1180c301b75" />
<img width="1907" height="906" alt="Sign up page" src="https://github.com/user-attachments/assets/7aa8098e-6664-4273-bd54-ae32bd852732" />
<img width="1907" height="906" alt="Todo board with cards" src="https://github.com/user-attachments/assets/34f74594-7d5c-4c85-85b2-50ef5e60ddb9" />
<img width="1907" height="906" alt="Create/edit todo modal" src="https://github.com/user-attachments/assets/1fdc2b48-3263-4a63-9d2e-467ff7a0e3f7" />

---

## 13. Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v14 or higher
- npm (bundled with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/JCherry101/ToDo-Application-AutoQA.git
cd ToDo-Application-AutoQA

# 2. Install dependencies
npm install

# 3. Start the development server (with auto-reload via nodemon)
npm start

# 4. Open in browser
# Navigate to http://localhost:3000
```

### First Run

1. Click **Register** to create an account.
2. Log in with your credentials.
3. A welcome to-do is automatically created for you with `medium` priority.
4. Use the **+** button to add new tasks and select a priority level.
5. Use the search bar, filter dropdown, and sort dropdown to organise your tasks.
6. Click **Edit** on any card to change its priority, or use `PATCH /todos/:id/priority` directly via the API.

---

## 14. Contributing

We welcome contributions! To get started:

1. **Fork** the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a **Pull Request** describing your changes.

### Contribution Guidelines

- Write clean, readable code and add comments where helpful.
- Update this PRD/documentation if your changes affect functionality.
- For major changes, open an issue first to discuss what you would like to change.
- Be respectful and constructive in code reviews and discussions.

---

## 15. Future Roadmap

| Priority | Feature | Description |
|----------|---------|-------------|
| 🔴 High | **Database Integration** | Migrate from JSON files to MongoDB or PostgreSQL for scalability |
| 🔴 High | **Password Security** | Replace SHA-256 with bcrypt/Argon2 and add salting |
| 🔴 High | **HTTP-Only Cookie Sessions** | Move tokens from localStorage to secure, HTTP-only cookies |
| 🟡 Medium | **Unit & Integration Tests** | Add comprehensive test suites using Jest/Mocha + supertest |
| 🟡 Medium | **Due Dates & Reminders** | Add date pickers and notification support for task deadlines |
| 🟡 Medium | **User Profile Management** | Allow users to update their name, email, and password |
| 🟡 Medium | **Password Reset** | Implement email-based password recovery flow |
| 🟢 Low | **Dark Mode** | Add a theme toggle for light/dark mode |
| 🟢 Low | **Drag-and-Drop Reordering** | Allow users to reorder tasks via drag-and-drop |
| 🟢 Low | **Mobile Application** | Build a native mobile app using React Native or Flutter |
| 🟢 Low | **Cloud Deployment** | Add deployment configurations for Heroku, Vercel, Railway, etc. |
| 🟢 Low | **Rate Limiting** | Add rate limiting on auth endpoints to prevent brute-force attacks |
| 🟢 Low | **Input Sanitization** | Add XSS protection via input/output sanitization |

---

## ⭐ Star this repo if you found it helpful!

Happy coding! 🌟
