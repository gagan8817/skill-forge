checkAuth(false); // If already logged in, go to dashboard

let isLogin = true;

const form = document.getElementById('auth-form');
const title = document.getElementById('auth-title');
const toggleText = document.getElementById('toggle-text');
const errorMsg = document.getElementById('error-msg');

function toggleMode() {
    isLogin = !isLogin;
    title.textContent = isLogin ? 'Login' : 'Sign Up';
    toggleText.innerHTML = isLogin 
        ? `Don't have an account? <a onclick="toggleMode()">Sign Up</a>` 
        : `Already have an account? <a onclick="toggleMode()">Login</a>`;
    errorMsg.textContent = '';
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    
    try {
        const data = await apiCall(endpoint, 'POST', { username, password });
        setUser(data.user);
        window.location.href = '/dashboard.html';
    } catch (error) {
        errorMsg.textContent = error.message;
    }
});
