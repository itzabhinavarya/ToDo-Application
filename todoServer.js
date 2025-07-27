const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

const TODOS_FILE = path.join(__dirname, 'todos.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

function readTodos() {
  try {
    const data = fs.readFileSync(TODOS_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeTodos(todos, res = null) {
  try {
    fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2));
    return true;
  } catch (err) {
    console.error('Failed to write todos.json:', err);
    if (res) res.status(500).json({ error: 'Failed to write todos file.' });
    return false;
  }
}

function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}
function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (err) {
    console.error('Failed to write users.json:', err);
    return false;
  }
}
function readSessions() {
  try {
    const data = fs.readFileSync(SESSIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}
function writeSessions(sessions) {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
    return true;
  } catch (err) {
    console.error('Failed to write sessions.json:', err);
    return false;
  }
}
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}
function getUserIdFromToken(req) {
  const auth = req.headers['authorization'];
  if (!auth) return null;
  const sessions = readSessions();
  return sessions[auth] || null;
}

function validateTodoInput(todo) {
  if (!todo.title || typeof todo.title !== 'string' || todo.title.trim() === '') return false;
  if (!todo.description || typeof todo.description !== 'string') return false;
  if (typeof todo.completed !== 'boolean') return false;
  return true;
}

// Signup
app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password required.' });
  const users = readUsers();
  if (users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already exists.' });
  const user = { id: users.length > 0 ? users[users.length-1].id + 1 : 1, name, email, password: hashPassword(password) };
  users.push(user);
  writeUsers(users);
  // Add default todo for new user
  const todos = readTodos();
  if (!todos.some(t => t.userId === user.id)) {
    todos.push({
      id: todos.length > 0 ? todos[todos.length - 1].id + 1 : 1,
      userId: user.id,
      title: 'Welcome to your To-Do List!',
      description: 'This is your first todo. You can edit or delete it.',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    writeTodos(todos);
  }
  res.status(201).json({ message: 'Signup successful.' });
});
// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email && u.password === hashPassword(password));
  if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
  const token = generateToken();
  const sessions = readSessions();
  sessions[token] = user.id;
  writeSessions(sessions);
  res.status(200).json({ token, name: user.name, email: user.email });
});
// Logout
app.post('/logout', (req, res) => {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(400).json({ error: 'No token provided.' });
  const sessions = readSessions();
  delete sessions[auth];
  writeSessions(sessions);
  res.status(200).json({ message: 'Logged out.' });
});

// Middleware for auth
function requireAuth(req, res, next) {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = userId;
  next();
}

// GET /todos - Retrieve all todo items, with optional search/filter/sort
app.get('/todos', requireAuth, (req, res) => {
  let todos = readTodos().filter(t => t.userId === req.userId);
  const { search, filter, sort } = req.query;
  if (search) {
    const s = search.toLowerCase();
    todos = todos.filter(t => t.title.toLowerCase().includes(s) || t.description.toLowerCase().includes(s));
  }
  if (filter === 'completed') todos = todos.filter(t => t.completed);
  if (filter === 'active') todos = todos.filter(t => !t.completed);
  if (sort === 'title') todos = todos.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'createdAt') todos = todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (sort === 'updatedAt') todos = todos.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.status(200).json(todos);
});

// GET /todos/:id - Retrieve a specific todo item by ID
app.get('/todos/:id', requireAuth, (req, res) => {
  const todoID = parseInt(req.params.id);
  const todos = readTodos();
  const todo = todos.find((x) => x.id === todoID && x.userId === req.userId);
  if (todo) {
    res.status(200).json(todo);
  } else {
    res.status(404).send({ error: 'Record Not Found!' });
  }
});

// POST /todos - Create a new todo item
app.post('/todos', requireAuth, (req, res) => {
  const todos = readTodos();
  const { title, description, completed } = req.body;
  const newTodo = {
    id: todos.length > 0 ? todos[todos.length - 1].id + 1 : 1,
    userId: req.userId,
    title,
    description,
    completed: !!completed,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (!validateTodoInput(newTodo)) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  todos.push(newTodo);
  if (!writeTodos(todos, res)) return;
  res.status(201).json(newTodo);
});

// PUT /todos/:id - Update an existing todo item by ID
app.put('/todos/:id', requireAuth, (req, res) => {
  const todos = readTodos();
  const todoIndex = todos.findIndex((data) => data.id == req.params.id && data.userId === req.userId);
  if (todoIndex !== -1) {
    const { title, description, completed } = req.body;
    const updatedTodo = {
      ...todos[todoIndex],
      title,
      description,
      completed: !!completed,
      updatedAt: new Date().toISOString(),
    };
    if (!validateTodoInput(updatedTodo)) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    todos[todoIndex] = updatedTodo;
    if (!writeTodos(todos, res)) return;
    res.status(200).json(updatedTodo);
  } else {
    res.status(404).json({ error: 'Record not found...' });
  }
});

// PATCH /todos/:id/toggle - Toggle completion status
app.patch('/todos/:id/toggle', requireAuth, (req, res) => {
  const todos = readTodos();
  const todoIndex = todos.findIndex((data) => data.id == req.params.id && data.userId === req.userId);
  if (todoIndex !== -1) {
    todos[todoIndex].completed = !todos[todoIndex].completed;
    todos[todoIndex].updatedAt = new Date().toISOString();
    if (!writeTodos(todos, res)) return;
    res.status(200).json(todos[todoIndex]);
  } else {
    res.status(404).json({ error: 'Record not found...' });
  }
});

// DELETE /todos/:id - Delete a todo item by ID
app.delete('/todos/:id', requireAuth, (req, res) => {
  const todos = readTodos();
  const index = todos.findIndex((x) => x.id == req.params.id && x.userId === req.userId);
  if (index !== -1) {
    const deleted = todos.splice(index, 1);
    if (!writeTodos(todos, res)) return;
    res.status(200).json(deleted[0]);
  } else {
    res.status(404).json({ error: 'Record Not Found' });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`App is listening on http://localhost:${PORT}`);
});

module.exports = app;
