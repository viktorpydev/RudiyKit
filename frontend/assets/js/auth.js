// Supabase configuration
const supabaseUrl = 'https://qwunxhnjacfgvtsoflca.supabase.co';
// The anon key is safe to be exposed in the frontend
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dW54aG5qYWNmZ3Z0c29mbGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTY0NjQsImV4cCI6MjA5ODAzMjQ2NH0.jGFZyCTnmkUzuqxpBcKSqDKq-oxDnfoK0npHBYQvTOM';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // If we are on admin.html, check session
    if (window.location.pathname.includes('admin.html')) {
        checkSession();
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');

    loginBtn.disabled = true;
    loginBtn.textContent = 'Зачекайте...';
    errorMessage.style.display = 'none';

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        // Login successful, redirect to admin page
        window.location.href = 'admin.html';
    } catch (error) {
        errorMessage.textContent = 'Помилка входу: ' + (error.message === 'Invalid login credentials' ? 'Невірний логін або пароль' : error.message);
        errorMessage.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Увійти';
    }
}

async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
        // Not logged in, redirect to login page
        window.location.href = 'login.html';
    } else {
        // Show admin interface
        document.body.style.display = 'block';
        if (typeof initAdmin === 'function') {
            initAdmin(session.user);
        }
    }
}

async function logout() {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
}
