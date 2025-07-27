// // --------------------------------------------------------------------------

// fetch("http://localhost:3000/todos/id",{
//   method:"DELETE"
// })

// Remove old deleteDoneCallback and deleteTodo functions

// // --------------------------------------------------------------------------

// Utility to get API base URL (for deployment readiness)
const API_BASE = window.location.origin;

// State
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
  let url = `${API_BASE}/todos?filter=${currentFilter !== 'all' ? currentFilter : ''}&sort=${currentSort}`;
  if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
  fetchWithAuth(url)
    .then(resp => {
      if (resp.status === 401) { clearAuth(); showAuthModal(false); return []; }
      console.log(resp);
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
    // Edit
    const editBtn = document.createElement('button');
    editBtn.className = 'todo-btn edit';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => openEditModal(element);
    // Delete
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'todo-btn delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => confirmDelete(element.id);
    // Toggle Complete
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'todo-btn toggle';
    toggleBtn.textContent = element.completed ? 'Mark Active' : 'Mark Complete';
    toggleBtn.onclick = () => toggleComplete(element.id);
    actions.append(editBtn, deleteBtn, toggleBtn);
    // Assemble card
    card.append(badge, title, desc, timestamps, actions);
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
  document.getElementById('completed-checkbox-field').style.display = '';
  const modal = document.getElementById('edit-modal');
  modal.setAttribute('aria-hidden', 'false');
  modal.style.display = 'flex';
  setTimeout(() => document.getElementById('edit-title').focus(), 100);
}

// --- AUTH LOGIC ---
let authToken = localStorage.getItem('token') || null;
let currentUsername = localStorage.getItem('username') || null;

function showAuthModal(isSignup = false) {
  document.getElementById('auth-modal-title').textContent = isSignup ? 'Sign Up' : 'Login';
  document.getElementById('auth-submit-btn').textContent = isSignup ? 'Sign Up' : 'Login';
  document.getElementById('auth-toggle-link').textContent = isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up";
  document.getElementById('auth-error').style.display = 'none';
  document.getElementById('auth-username').value = '';
  document.getElementById('auth-password').value = '';
  document.getElementById('auth-modal').setAttribute('aria-hidden', 'false');
  document.getElementById('auth-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('auth-username').focus(), 100);
  document.body.classList.add('modal-open');
  window.isSignupMode = isSignup;
}
function closeAuthModal() {
  document.getElementById('auth-modal').setAttribute('aria-hidden', 'true');
  document.getElementById('auth-modal').style.display = 'none';
  document.body.classList.remove('modal-open');
}
function setAuth(token, username) {
  authToken = token;
  currentUsername = username;
  localStorage.setItem('token', token);
  localStorage.setItem('username', username);
  document.getElementById('logout-btn').style.display = '';
  document.getElementById('add-todo-btn').style.display = '';
  document.querySelector('.outputData').style.display = '';
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
  // Always attach listeners when showing
  loginBtn.onclick = function() {
    console.log('Login button clicked');
    showAuthModal(false);
  };
  registerBtn.onclick = function() {
    console.log('Register button clicked');
    showAuthModal(true);
  };
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
  currentUsername = null;
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  showAuthButtons();
}
function checkAuth() {
  if (!authToken) {
    clearAuth();
    showAuthModal(false);
    return false;
  }
  hideAuthButtons();
  return true;
}

// --- Modify fetches to use authToken ---
function fetchWithAuth(url, options = {}) {
  options.headers = options.headers || {};
  if (authToken) options.headers['Authorization'] = authToken;
  options.mode = 'cors';
  return fetch(url, options);
}

// --- Update fetchAndRenderTodos to use fetchWithAuth and checkAuth ---
function fetchAndRenderTodos() {
  if (!checkAuth()) return;
  setLoading(true);
  let url = `${API_BASE}/todos?filter=${currentFilter !== 'all' ? currentFilter : ''}&sort=${currentSort}`;
  if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
  fetchWithAuth(url)
    .then(resp => {
      if (resp.status === 401) { clearAuth(); showAuthModal(false); return []; }
      console.log(resp);
      return resp.json();
    })
    .then(renderTodos)
    .catch(err => alert(err.message));
}

document.addEventListener('DOMContentLoaded', function() {
  // Always set up these listeners first
  document.getElementById('login-btn').onclick = function() {
    console.log('Login button clicked');
    showAuthModal(false);
  };
  document.getElementById('register-btn').onclick = function() {
    console.log('Register button clicked');
    showAuthModal(true);
  };
  document.getElementById('add-todo-btn').onclick = openCreateModal;
  document.getElementById('close-modal').onclick = closeEditModal;
  // Remove the onclick handler for save-edit-btn
  document.getElementById('save-edit-btn').onclick = null;
  // Add onsubmit handler for todo-form
  document.getElementById('todo-form').onsubmit = function(e) {
    e.preventDefault();
    const title = document.getElementById('edit-title').value;
    const description = document.getElementById('edit-desc').value;
    const completed = document.getElementById('edit-completed').checked;
    if (!title || !description) {
      // Optionally show a message in the UI, but do not use alert
      return;
    }
    setLoading(true);
    if (isEditMode && editingTodoId) {
      // Update
      fetchWithAuth(`${API_BASE}/todos/${editingTodoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, completed })
      })
        .then(async resp => {
          if (!resp.ok) return;
          const contentType = resp.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            await resp.json();
          }
        })
        .then(() => {
          closeEditModal();
          fetchAndRenderTodos();
        })
        .catch(err => { console.error(err); });
    } else {
      // Create
      fetchWithAuth(`${API_BASE}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, completed: false })
      })
        .then(async resp => {
          if (!resp.ok) return;
          const contentType = resp.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            await resp.json();
          }
        })
        .then(() => {
          closeEditModal();
          fetchAndRenderTodos();
        })
        .catch(err => { console.error(err); });
    }
  };
  window.addEventListener('keydown', function(e) {
    const modal = document.getElementById('edit-modal');
    if (modal.style.display === 'flex' && e.key === 'Escape') {
      closeEditModal();
    }
  });
  window.onclick = function(event) {
    const modal = document.getElementById('edit-modal');
    if (event.target === modal) {
      closeEditModal();
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
  // Clear search button
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
  // Clear filters button
  document.getElementById('clear-filters-btn').onclick = function() {
    currentSearch = '';
    currentFilter = 'all';
    currentSort = 'createdAt';
    document.getElementById('search-input').value = '';
    document.getElementById('filter-select').value = 'all';
    document.getElementById('sort-select').value = 'createdAt';
    fetchAndRenderTodos();
  };
  // Initial load
  fetchAndRenderTodos();
  // Hide todo UI if not logged in
  if (!authToken) {
    showAuthButtons();
    showAuthModal(false);
  } else {
    hideAuthButtons();
  }
  // Auth modal logic
  document.getElementById('auth-toggle-link').onclick = function() {
    showAuthModal(!window.isSignupMode);
  };
  document.getElementById('auth-form').onsubmit = function(e) {
    e.preventDefault();
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    if (!username || !password) {
      document.getElementById('auth-error').textContent = 'Username and password required.';
      document.getElementById('auth-error').style.display = 'block';
      return;
    }
    const isSignup = window.isSignupMode;
    fetch(`${API_BASE}/${isSignup ? 'signup' : 'login'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(resp => resp.json().then(data => ({ status: resp.status, data })))
      .then(({ status, data }) => {
        if (status === 200 || status === 201) {
          if (isSignup) {
            showAuthModal(false);
            document.getElementById('auth-error').textContent = 'Signup successful! Please login.';
            document.getElementById('auth-error').style.display = 'block';
          } else {
            setAuth(data.token, username);
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
  // Remove the old onclick handler for auth-submit-btn
  document.getElementById('auth-submit-btn').onclick = null;
  // Logout
  document.getElementById('logout-btn').onclick = function() {
    fetchWithAuth(`${API_BASE}/logout`, { method: 'POST' })
      .then(() => {
        clearAuth();
        showAuthModal(false);
      });
  };
  // Close auth modal on outside click
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
  // Add event listeners for closing auth modal
  window.addEventListener('keydown', function(e) {
    const authModal = document.getElementById('auth-modal');
    if (authModal.style.display === 'flex' && e.key === 'Escape') {
      closeAuthModal();
    }
  });
  window.onclick = function(event) {
    const authModal = document.getElementById('auth-modal');
    if (event.target === authModal) {
      closeAuthModal();
    }
  };
});

function closeEditModal() {
  document.getElementById('edit-modal').setAttribute('aria-hidden', 'true');
  document.getElementById('edit-modal').style.display = 'none';
  editingTodoId = null;
}

function toggleComplete(id) {
  setLoading(true);
  fetchWithAuth(`${API_BASE}/todos/${id}/toggle`, { method: 'PATCH' })
    .then(resp => {
      if (!resp.ok) throw new Error('Failed to toggle todo.');
      return resp.json();
    })
    .then(fetchAndRenderTodos)
    .catch(err => alert(err.message));
}

function updateFilterSortFeedback() {
  // Optionally, show current filter/sort/search as a banner or below the top bar
  let feedback = document.getElementById('filter-sort-feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.id = 'filter-sort-feedback';
    feedback.style.textAlign = 'center';
    feedback.style.margin = '0.5em 0 0.5em 0';
    feedback.style.fontSize = '1em';
    const topBar = document.querySelector('.top-bar');
    if (topBar) {
      topBar.after(feedback);
    } else {
      // Fallback: append to main content if .top-bar does not exist
      document.querySelector('.main-content').appendChild(feedback);
    }
  }
  let msg = '';
  if (currentSearch) msg += `Search: "${currentSearch}"`;
  if (currentFilter !== 'all') msg += (msg ? ' | ' : '') + `Filter: ${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}`;
  if (currentSort) msg += (msg ? ' | ' : '') + `Sort: ${document.getElementById('sort-select').selectedOptions[0].text}`;
  feedback.textContent = msg;
  feedback.style.display = msg ? 'block' : 'none';
}

function confirmDelete(id) {
  if (!confirm('Are you sure you want to delete this todo?')) return;
  setLoading(true);
  fetchWithAuth(`${API_BASE}/todos/${id}`, { method: 'DELETE' })
    .then(resp => {
      if (!resp.ok) throw new Error('Failed to delete todo.');
      return resp.json();
    })
    .then(fetchAndRenderTodos)
    .catch(err => alert(err.message));
}
