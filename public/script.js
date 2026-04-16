const API_BASE = window.location.origin;

let currentTodos = [];
let currentFilter = 'all';
let currentSort = 'createdAt';
let currentSearch = '';
let editingTodoId = null;
let isLoading = false;
let isEditMode = false;

function setLoading(loading) {
  isLoading = loading;
  const outputContainer = document.querySelector('.outputData');
  if (loading) {
    outputContainer.innerHTML = '<div class="loading-spinner"></div>';
  }
}

function fetchAndRenderTodos() {
  if (!checkAuth()) return;
  setLoading(true);

  const priorityFilters = { 'priority-high': 'high', 'priority-medium': 'medium', 'priority-low': 'low' };
  const priorityValue = priorityFilters[currentFilter] || null;
  const statusFilter = priorityValue ? '' : (currentFilter !== 'all' ? currentFilter : '');

  let url = `${API_BASE}/todos?filter=${statusFilter}&sort=${currentSort}`;
  if (priorityValue) url += `&priority=${priorityValue}`;
  if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;

  fetchWithAuth(url)
    .then(resp => {
      if (resp.status === 401) { clearAuth(); showAuthModal(false); return []; }
      return resp.json();
    })
    .then(renderTodos)
    .catch(err => alert(err.message));
}

function renderTodos(data) {
  setLoading(false);
  currentTodos = data;
  const outputContainer = document.querySelector('.outputData');
  outputContainer.innerHTML = '';
  if (!data.length) {
    outputContainer.innerHTML = '<div class="empty-state">No todos found.</div>';
    return;
  }
  data.forEach(element => {
    const card = document.createElement('div');
    card.className = 'output' + (element.completed ? ' completed' : '');

    // Status badge
    const badge = document.createElement('span');
    badge.className = 'status-badge ' + (element.completed ? 'completed' : 'active');
    badge.textContent = element.completed ? 'Completed' : 'Active';

    // Priority badge
    const priority = element.priority || 'medium';
    const priorityBadge = document.createElement('span');
    priorityBadge.className = `priority-badge ${priority}`;
    priorityBadge.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);

    // Title
    const title = document.createElement('p');
    title.id = 'title';
    title.textContent = element.title;

    // Description
    const desc = document.createElement('p');
    desc.id = 'desc';
    desc.textContent = element.description;

    // Timestamps
    const timestamps = document.createElement('div');
    timestamps.className = 'todo-timestamp';
    timestamps.textContent = `Created: ${new Date(element.createdAt).toLocaleString()} | Updated: ${new Date(element.updatedAt).toLocaleString()}`;

    // Actions
    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'todo-btn edit';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => openEditModal(element);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'todo-btn delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => confirmDelete(element.id);

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'todo-btn toggle';
    toggleBtn.textContent = element.completed ? 'Mark Active' : 'Mark Complete';
    toggleBtn.onclick = () => toggleComplete(element.id);

    actions.append(editBtn, deleteBtn, toggleBtn);
    card.append(badge, priorityBadge, title, desc, timestamps, actions);
    document.querySelector('.outputData').appendChild(card);
  });
  updateFilterSortFeedback();
}

function openCreateModal() {
  isEditMode = false;
  editingTodoId = null;
  document.getElementById('modal-title').textContent = 'Add To-Do';
  document.getElementById('save-edit-btn').textContent = 'Add';
  document.getElementById('edit-title').value = '';
  document.getElementById('edit-desc').value = '';
  document.getElementById('edit-completed').checked = false;
  document.getElementById('edit-priority').value = 'medium';
  document.getElementById('completed-checkbox-field').style.display = 'none';
  const modal = document.getElementById('edit-modal');
  modal.setAttribute('aria-hidden', 'false');
  modal.style.display = 'flex';
  setTimeout(() => document.getElementById('edit-title').focus(), 100);
}

function openEditModal(todo) {
  isEditMode = true;
  editingTodoId = todo.id;
  document.getElementById('modal-title').textContent = 'Edit To-Do';
  document.getElementById('save-edit-btn').textContent = 'Save';
  document.getElementById('edit-title').value = todo.title;
  document.getElementById('edit-desc').value = todo.description;
  document.getElementById('edit-completed').checked = todo.completed;
  document.getElementById('edit-priority').value = todo.priority || 'medium';
  document.getElementById('completed-checkbox-field').style.display = '';
  const modal = document.getElementById('edit-modal');
  modal.setAttribute('aria-hidden', 'false');
  modal.style.display = 'flex';
  setTimeout(() => document.getElementById('edit-title').focus(), 100);
}

// --- AUTH LOGIC ---
let authToken = localStorage.getItem('token') || null;
let currentName = localStorage.getItem('name') || null;
let currentEmail = localStorage.getItem('email') || null;

function showAuthModal(isSignup = false) {
  document.getElementById('auth-modal-title').textContent = isSignup ? 'Sign Up' : 'Login';
  document.getElementById('auth-submit-btn').textContent = isSignup ? 'Sign Up' : 'Login';
  document.getElementById('auth-toggle-link').textContent = isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up";
  document.getElementById('auth-error').style.display = 'none';
  document.getElementById('auth-name-field').style.display = isSignup ? '' : 'none';
  document.getElementById('auth-name').value = '';
  document.getElementById('auth-email').value = '';
  document.getElementById('auth-password').value = '';
  document.getElementById('auth-modal').setAttribute('aria-hidden', 'false');
  document.getElementById('auth-modal').style.display = 'flex';
  setTimeout(() => document.getElementById(isSignup ? 'auth-name' : 'auth-email').focus(), 100);
  document.body.classList.add('modal-open');
  window.isSignupMode = isSignup;
}
function closeAuthModal() {
  document.getElementById('auth-modal').setAttribute('aria-hidden', 'true');
  document.getElementById('auth-modal').style.display = 'none';
  document.body.classList.remove('modal-open');
}
function setAuth(token, name, email) {
  authToken = token;
  currentName = name;
  currentEmail = email;
  localStorage.setItem('token', token);
  localStorage.setItem('name', name);
  localStorage.setItem('email', email);
  document.getElementById('logout-btn').style.display = '';
  document.getElementById('add-todo-btn').style.display = '';
  document.querySelector('.outputData').style.display = '';
  document.getElementById('user-info').textContent = `${name} (${email})`;
  closeAuthModal();
  fetchAndRenderTodos();
}
function showAuthButtons() {
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  loginBtn.style.display = '';
  registerBtn.style.display = '';
  document.getElementById('logout-btn').style.display = 'none';
  document.getElementById('add-todo-btn').style.display = 'none';
  document.querySelector('.outputData').style.display = 'none';
  loginBtn.onclick = function() { showAuthModal(false); };
  registerBtn.onclick = function() { showAuthModal(true); };
}
function hideAuthButtons() {
  document.getElementById('login-btn').style.display = 'none';
  document.getElementById('register-btn').style.display = 'none';
  document.getElementById('logout-btn').style.display = '';
  document.getElementById('add-todo-btn').style.display = '';
  document.querySelector('.outputData').style.display = '';
}
function clearAuth() {
  authToken = null;
  currentName = null;
  currentEmail = null;
  localStorage.removeItem('token');
  localStorage.removeItem('name');
  localStorage.removeItem('email');
  document.getElementById('user-info').textContent = '';
  showAuthButtons();
}
function checkAuth() {
  if (!authToken) { clearAuth(); showAuthModal(false); return false; }
  hideAuthButtons();
  return true;
}

function fetchWithAuth(url, options = {}) {
  options.headers = options.headers || {};
  if (authToken) options.headers['Authorization'] = authToken;
  options.mode = 'cors';
  return fetch(url, options);
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('login-btn').onclick = function() { showAuthModal(false); };
  document.getElementById('register-btn').onclick = function() { showAuthModal(true); };
  document.getElementById('add-todo-btn').onclick = openCreateModal;
  document.getElementById('close-modal').onclick = closeEditModal;
  document.getElementById('save-edit-btn').onclick = null;

  document.getElementById('todo-form').onsubmit = function(e) {
    e.preventDefault();
    const title = document.getElementById('edit-title').value;
    const description = document.getElementById('edit-desc').value;
    const completed = document.getElementById('edit-completed').checked;
    const priority = document.getElementById('edit-priority').value;
    if (!title || !description) return;
    setLoading(true);
    if (isEditMode && editingTodoId) {
      fetchWithAuth(`${API_BASE}/todos/${editingTodoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, completed, priority })
      })
        .then(async resp => { if (!resp.ok) return; await resp.json(); })
        .then(() => { closeEditModal(); fetchAndRenderTodos(); })
        .catch(err => { console.error(err); });
    } else {
      fetchWithAuth(`${API_BASE}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, completed: false, priority })
      })
        .then(async resp => { if (!resp.ok) return; await resp.json(); })
        .then(() => { closeEditModal(); fetchAndRenderTodos(); })
        .catch(err => { console.error(err); });
    }
  };

  document.getElementById('search-input').oninput = function(e) {
    currentSearch = e.target.value;
    fetchAndRenderTodos();
  };
  document.getElementById('filter-select').onchange = function(e) {
    currentFilter = e.target.value;
    fetchAndRenderTodos();
  };
  document.getElementById('sort-select').onchange = function(e) {
    currentSort = e.target.value;
    fetchAndRenderTodos();
  };

  const searchInput = document.getElementById('search-input');
  const clearBtn = document.createElement('button');
  clearBtn.textContent = '×';
  clearBtn.className = 'todo-btn';
  clearBtn.style.marginLeft = '0.5em';
  clearBtn.style.fontSize = '1.2em';
  clearBtn.title = 'Clear search';
  clearBtn.onclick = function() {
    searchInput.value = '';
    currentSearch = '';
    fetchAndRenderTodos();
  };
  searchInput.parentNode.insertBefore(clearBtn, searchInput.nextSibling);

  document.getElementById('clear-filters-btn').onclick = function() {
    currentSearch = '';
    currentFilter = 'all';
    currentSort = 'createdAt';
    document.getElementById('search-input').value = '';
    document.getElementById('filter-select').value = 'all';
    document.getElementById('sort-select').value = 'createdAt';
    fetchAndRenderTodos();
  };

  fetchAndRenderTodos();

  if (!authToken) { showAuthButtons(); showAuthModal(false); }
  else { hideAuthButtons(); }

  document.getElementById('auth-toggle-link').onclick = function() { showAuthModal(!window.isSignupMode); };

  document.getElementById('auth-form').onsubmit = function(e) {
    e.preventDefault();
    const isSignup = window.isSignupMode;
    const name = isSignup ? document.getElementById('auth-name').value.trim() : undefined;
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    if (isSignup && (!name || !email || !password)) {
      document.getElementById('auth-error').textContent = 'Name, email, and password required.';
      document.getElementById('auth-error').style.display = 'block';
      return;
    }
    if (!isSignup && (!email || !password)) {
      document.getElementById('auth-error').textContent = 'Email and password required.';
      document.getElementById('auth-error').style.display = 'block';
      return;
    }
    fetch(`${API_BASE}/${isSignup ? 'signup' : 'login'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isSignup ? { name, email, password } : { email, password })
    })
      .then(resp => resp.json().then(data => ({ status: resp.status, data })))
      .then(({ status, data }) => {
        if (status === 200 || status === 201) {
          if (isSignup) {
            showAuthModal(false);
            document.getElementById('auth-error').textContent = 'Signup successful! Please login.';
            document.getElementById('auth-error').style.display = 'block';
          } else {
            setAuth(data.token, data.name, data.email);
          }
        } else {
          document.getElementById('auth-error').textContent = data.error || 'Authentication failed.';
          document.getElementById('auth-error').style.display = 'block';
        }
      })
      .catch(() => {
        document.getElementById('auth-error').textContent = 'Network error.';
        document.getElementById('auth-error').style.display = 'block';
      });
  };

  document.getElementById('auth-submit-btn').onclick = null;

  document.getElementById('logout-btn').onclick = function() {
    fetchWithAuth(`${API_BASE}/logout`, { method: 'POST' })
      .then(() => { clearAuth(); showAuthModal(false); });
  };

  window.onclick = function(event) {
    const modal = document.getElementById('edit-modal');
    const authModal = document.getElementById('auth-modal');
    if (event.target === modal) closeEditModal();
    if (event.target === authModal) closeAuthModal();
  };
  window.addEventListener('keydown', function(e) {
    const modal = document.getElementById('edit-modal');
    const authModal = document.getElementById('auth-modal');
    if (modal.style.display === 'flex' && e.key === 'Escape') closeEditModal();
    if (authModal.style.display === 'flex' && e.key === 'Escape') closeAuthModal();
  });

  const token = localStorage.getItem('token');
  const name = localStorage.getItem('name');
  const email = localStorage.getItem('email');
  if (token && name && email) {
    document.getElementById('user-info').textContent = `${name} (${email})`;
  }
});

function closeEditModal() {
  document.getElementById('edit-modal').setAttribute('aria-hidden', 'true');
  document.getElementById('edit-modal').style.display = 'none';
  editingTodoId = null;
}

function toggleComplete(id) {
  setLoading(true);
  fetchWithAuth(`${API_BASE}/todos/${id}/toggle`, { method: 'PATCH' })
    .then(resp => { if (!resp.ok) throw new Error('Failed to toggle todo.'); return resp.json(); })
    .then(fetchAndRenderTodos)
    .catch(err => alert(err.message));
}

function updateFilterSortFeedback() {
  let feedback = document.getElementById('filter-sort-feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.id = 'filter-sort-feedback';
    feedback.style.textAlign = 'center';
    feedback.style.margin = '0.5em 0 0.5em 0';
    feedback.style.fontSize = '1em';
    const topBar = document.querySelector('.top-bar');
    if (topBar) topBar.after(feedback);
    else document.querySelector('.main-content').appendChild(feedback);
  }
  let msg = '';
  if (currentSearch) msg += `Search: "${currentSearch}"`;
  if (currentFilter !== 'all') msg += (msg ? ' | ' : '') + `Filter: ${document.getElementById('filter-select').selectedOptions[0].text}`;
  if (currentSort) msg += (msg ? ' | ' : '') + `Sort: ${document.getElementById('sort-select').selectedOptions[0].text}`;
  feedback.textContent = msg;
  feedback.style.display = msg ? 'block' : 'none';
}

function confirmDelete(id) {
  if (!confirm('Are you sure you want to delete this todo?')) return;
  setLoading(true);
  fetchWithAuth(`${API_BASE}/todos/${id}`, { method: 'DELETE' })
    .then(resp => { if (!resp.ok) throw new Error('Failed to delete todo.'); return resp.json(); })
    .then(fetchAndRenderTodos)
    .catch(err => alert(err.message));
}
