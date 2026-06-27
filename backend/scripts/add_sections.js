const fs = require('fs');
const path = require('path');

const statsHtml = `
<!-- Stats Section -->
<section id="stats" class="stats section" style="background-color: var(--clr-primary); padding: 4rem 0;">
    <div class="container">
        <div class="stats__grid">
            <div class="stat-card fade-in">
                <h3 class="stat-card__number">500+</h3>
                <p class="stat-card__title">Успішних угод</p>
                <p class="stat-card__desc">За весь час роботи</p>
            </div>
            <div class="stat-card fade-in" style="transition-delay: 0.1s;">
                <h3 class="stat-card__number">280+</h3>
                <p class="stat-card__title">Об'єктів у базі</p>
                <p class="stat-card__desc">Актуальних пропозицій</p>
            </div>
            <div class="stat-card fade-in" style="transition-delay: 0.2s;">
                <h3 class="stat-card__number">98%</h3>
                <p class="stat-card__title">Задоволених клієнтів</p>
                <p class="stat-card__desc">Рекомендують нас друзям</p>
            </div>
            <div class="stat-card fade-in" style="transition-delay: 0.3s;">
                <h3 class="stat-card__number">24</h3>
                <p class="stat-card__title">Години</p>
                <p class="stat-card__desc">На підбір першого варіанту</p>
            </div>
        </div>
    </div>
</section>

<!-- Contact Section -->
<section id="contact" class="contact section bg-light">
    <div class="container contact__container">
        <!-- Form Column -->
        <div class="contact__form-wrapper slide-up">
            <h2 class="contact__title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--clr-primary);">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg> 
                Замовити консультацію
            </h2>
            <p class="contact__subtitle">Заповніть форму, і наш експерт зв'яжеться з вами протягом 30 хвилин у робочий час для безкоштовної консультації</p>
            
            <form class="contact__form">
                <div class="form-group">
                    <label>Що вас цікавить?</label>
                    <div class="form-radio-group">
                        <label class="form-radio active"><input type="radio" name="interest" value="Квартира" checked> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline; margin-right:4px;"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg> Квартира</label>
                        <label class="form-radio"><input type="radio" name="interest" value="Будинок"> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline; margin-right:4px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> Будинок</label>
                        <label class="form-radio"><input type="radio" name="interest" value="Ділянка"> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline; margin-right:4px;"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon><line x1="12" y1="22" x2="12" y2="15.5"></line><polyline points="22 8.5 12 15.5 2 8.5"></polyline><polyline points="2 15.5 12 8.5 22 15.5"></polyline><line x1="12" y1="2" x2="12" y2="8.5"></line></svg> Ділянка</label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="name">Ваше ім'я</label>
                    <input type="text" id="name" placeholder="Іван Петрович" class="form-input">
                </div>
                
                <div class="form-group">
                    <label for="phone">Номер телефону</label>
                    <input type="tel" id="phone" placeholder="+38 (0XX) XXX-XX-XX" class="form-input" minlength="9" maxlength="20" pattern="^\\+?[0-9\\s\\-\\(\\)]{9,20}$" required>
                </div>
                
                <div class="form-group">
                    <label for="email">Email (необов'язково)</label>
                    <input type="email" id="email" placeholder="example@email.com" class="form-input">
                </div>
                
                <div class="form-group">
                    <label for="message">Ваше питання або побажання</label>
                    <textarea id="message" rows="3" placeholder="Опишіть, яку нерухомість шукаєте, бюджет, район..." class="form-input"></textarea>
                </div>
                
                <button type="button" class="btn btn--primary btn-full">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> 
                    Надіслати заявку
                </button>
                <p class="form-disclaimer">Надсилаючи заявку, ви погоджуєтесь з обробкою персональних даних</p>
            </form>
        </div>

        <!-- Info Column -->
        <div class="contact__info-wrapper slide-up" style="transition-delay: 0.1s;">
            <h2 class="contact__title" style="margin-bottom: 2rem;">Наші контакти</h2>
            
            <div class="contact__info-list">
                <div class="info-item">
                    <div class="info-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                    <div>
                        <p class="info-label">Телефон</p>
                        <p class="info-value primary">+38 (050) 123-45-67</p>
                        <p class="info-desc">Головний номер агентства</p>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </div>
                    <div>
                        <p class="info-label">Email</p>
                        <p class="info-value primary">info@rudyikit.ua</p>
                        <p class="info-desc">Відповідаємо протягом години</p>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    </div>
                    <div>
                        <p class="info-label">Адреса</p>
                        <p class="info-value">м. Вінниця, вул. Соборна, 25</p>
                        <p class="info-desc">Офіс 305, 3-й поверх</p>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <div>
                        <p class="info-label">Графік роботи</p>
                        <p class="info-value">Пн-Пт: 9:00 - 18:00</p>
                        <p class="info-desc">Сб: 10:00 - 15:00<br>Нд: вихідний</p>
                    </div>
                </div>
            </div>

            <div class="contact__map">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2594.3941421034444!2d28.4682!3d49.2328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDnCsDEzJzU4LjEiTiAyOMKwMjgnMDUuNSJF!5e0!3m2!1suk!2sua!4v1" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
            </div>
        </div>
    </div>
</section>
`;

let indexHtml = fs.readFileSync(path.join(__dirname, '../../frontend/index.html'), 'utf-8');
const teamEndRegex = /<\/section>\s*<!-- Footer -->/;
indexHtml = indexHtml.replace(teamEndRegex, '</section>\n' + statsHtml + '\n<!-- Footer -->');
fs.writeFileSync(path.join(__dirname, '../../frontend/index.html'), indexHtml);

const cssContent = `
/* Stats Section */
.stats__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
}

.stat-card {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    color: white;
    transition: transform 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.2);
}

.stat-card__number {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.stat-card__title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.stat-card__desc {
    font-size: 0.75rem;
    opacity: 0.8;
}

/* Contact Section */
.contact__container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
}

@media (max-width: 992px) {
    .contact__container {
        grid-template-columns: 1fr;
    }
}

.contact__form-wrapper {
    background: white;
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.contact__title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.contact__subtitle {
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.5;
}

.form-group {
    margin-bottom: 1.25rem;
}

.form-group label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #333;
}

.form-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.form-radio {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background: #EFEBE4;
    border-radius: 20px;
    font-size: 0.85rem;
    cursor: pointer;
    border: 1px solid transparent;
    transition: 0.2s;
    color: #555;
    font-weight: 500;
}

.form-radio.active {
    background: var(--clr-primary);
    color: white;
}

.form-radio input {
    display: none;
}

.form-input {
    width: 100%;
    background: #F8F6F4;
    border: 1px solid #EFEBE4;
    padding: 0.8rem 1rem;
    border-radius: 12px;
    font-size: 0.95rem;
    font-family: inherit;
    transition: 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: var(--clr-primary);
    background: white;
}

.btn-full {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 12px;
    font-size: 1rem;
    margin-top: 1rem;
    font-weight: 600;
}

.form-disclaimer {
    font-size: 0.7rem;
    color: #999;
    text-align: center;
    margin-top: 1rem;
}

.contact__info-wrapper {
    padding-top: 1rem;
}

.contact__info-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
}

.info-item {
    display: flex;
    gap: 1.25rem;
}

.info-icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #FFEDD5;
    color: var(--clr-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.info-label {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.1rem;
    font-weight: 500;
}

.info-value {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--clr-text);
    margin-bottom: 0.1rem;
}

.info-value.primary {
    color: var(--clr-primary);
}

.info-desc {
    font-size: 0.85rem;
    color: #888;
}

.contact__map {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    border: 2px solid white;
}
`;

fs.appendFileSync(path.join(__dirname, '../../frontend/assets/css/style.css'), cssContent);

let jsContent = fs.readFileSync(path.join(__dirname, '../../frontend/assets/js/main.js'), 'utf-8');
const jsCode = `
    // 9. Contact Form Radio Buttons
    const formRadios = document.querySelectorAll('.form-radio');
    formRadios.forEach(radio => {
        radio.addEventListener('click', function() {
            formRadios.forEach(r => r.classList.remove('active'));
            this.classList.add('active');
            this.querySelector('input').checked = true;
        });
    });
`;

if (!jsContent.includes('// 9. Contact Form Radio Buttons')) {
    jsContent = jsContent.replace(/}\);\s*$/, jsCode + '\n});');
    fs.writeFileSync(path.join(__dirname, '../../frontend/assets/js/main.js'), jsContent);
}

console.log('Sections added');
