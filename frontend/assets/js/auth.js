// Supabase configuration
const supabaseUrl = 'https://qwunxhnjacfgvtsoflca.supabase.co';
// The anon key is safe to be exposed in the frontend
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dW54aG5qYWNmZ3Z0c29mbGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTY0NjQsImV4cCI6MjA5ODAzMjQ2NH0.jGFZyCTnmkUzuqxpBcKSqDKq-oxDnfoK0npHBYQvTOM';
let supabaseClient;
try {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
} catch (e) {
    console.error('Failed to initialize Supabase. Make sure internet is working and CDNs are not blocked.', e);
    document.addEventListener('DOMContentLoaded', () => {
        document.body.style.display = 'block';
        document.body.innerHTML = '<div style="padding: 50px; color: red;">Помилка завантаження бази даних (Supabase не знайдено). Можливо, ваш браузер блокує скрипти або відсутній інтернет.</div>';
    });
}

function initAuth() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // If we are on admin.html, check session
    if (window.location.pathname.includes('admin.html')) {
        checkSession();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}

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
        console.log('Починаємо логін...');
        const loginPromise = supabaseClient.auth.signInWithPassword({ email, password });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Час очікування вичерпано (Timeout)')), 5000));
        
        const { data, error } = await Promise.race([loginPromise, timeoutPromise]);
        console.log('Відповідь від сервера:', data, error);

        if (error) throw error;

        // Login successful, redirect to admin page
        window.location.href = 'admin.html';
    } catch (error) {
        console.error('Помилка логіну:', error);
        errorMessage.textContent = 'Помилка входу: ' + (error.message === 'Invalid login credentials' ? 'Невірний логін або пароль' : error.message);
        errorMessage.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Увійти';
    }
}

async function checkSession() {
    try {
        console.log('Перевірка сесії...');
        const sessionPromise = supabaseClient.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Час очікування вичерпано (Timeout)')), 5000));
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
        console.log('Сесія:', session);
        
        if (error || !session) {
            console.log('Сесії немає, перекидаємо...');
            window.location.href = 'login.html';
        } else {
            console.log('Сесія є, завантажуємо адмінку...');
            document.body.style.display = 'block';
            if (typeof initAdmin === 'function') {
                initAdmin(session.user);
            } else {
                console.error('Функція initAdmin не знайдена!');
            }
        }
    } catch (e) {
        console.error('Помилка checkSession:', e);
        document.body.style.display = 'block';
        document.body.innerHTML = '<div style="padding: 50px; color: red;">Помилка авторизації: ' + e.message + '<br><a href="login.html">Повернутися</a></div>';
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
}
