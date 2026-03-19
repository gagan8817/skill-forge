const API_URL = '/api';

async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Something went wrong');
    return data;
  } catch (error) {
    throw error;
  }
}

function getUser() {
  const user = localStorage.getItem('dsa_user');
  return user ? JSON.parse(user) : null;
}

function setUser(user) {
  localStorage.setItem('dsa_user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('dsa_user');
  window.location.href = '/index.html';
}

function checkAuth(requireAuth = true) {
  const user = getUser();
  if (requireAuth && !user) {
    window.location.href = '/index.html';
  } else if (!requireAuth && user) {
    window.location.href = '/dashboard.html';
  }
}

// Background activity tracker hook
async function trackDailyActivity() {
  const user = getUser();
  if (!user) return;
  try {
    const res = await apiCall(`/users/${user.username}/activity`, 'POST');
    // Save streak implicitly if needed, or rely on GET `/users/:username` for UI
  } catch(e) {}
}

if (getUser()) {
  trackDailyActivity(); // Fire on every page load
}
