const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Supabase Setup
const supabaseUrl = 'https://qwunxhnjacfgvtsoflca.supabase.co';
// WARNING: This is the service role key. Do NOT share it or put it in frontend code.
// The service role key bypasses Row Level Security and can create users directly.
// (In this project, we are using the anon key for simplicity, but for creating users without email confirmation, service role is needed if signups are restricted).
// However, since we only have the anon key here, we will try standard signup.
// If Supabase requires email confirmation, the user will need to confirm it.
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dW54aG5qYWNmZ3Z0c29mbGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTY0NjQsImV4cCI6MjA5ODAzMjQ2NH0.jGFZyCTnmkUzuqxpBcKSqDKq-oxDnfoK0npHBYQvTOM';

const supabase = createClient(supabaseUrl, supabaseKey);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('--- Створення акаунту рієлтора ---');

rl.question('Введіть Email: ', (email) => {
    rl.question('Введіть Пароль (мінімум 6 символів): ', async (password) => {
        
        console.log('Створення...');
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            console.error('Помилка:', error.message);
        } else {
            console.log('Акаунт успішно створено!');
            console.log('ID користувача:', data.user.id);
            console.log('Тепер ви можете увійти з цим email та паролем на сторінці login.html');
        }

        rl.close();
    });
});
