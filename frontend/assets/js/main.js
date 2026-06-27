document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav__link');

    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('open');
        menuToggle.classList.toggle('active');
        
        // Animate hamburger to X (basic implementation)
        const spans = menuToggle.querySelectorAll('span');
        if (nav.classList.contains('open')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // 3. Property Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const propertyCards = document.querySelectorAll('.property-card');
    const catalogGrid = document.querySelector('.properties__grid');
    
    // Add an element for "Дивіться поблизу" message if on catalog page
    let nearbyMsg = null;
    if (catalogGrid) {
        nearbyMsg = document.createElement('div');
        nearbyMsg.className = 'nearby-message fade-in';
        nearbyMsg.style.display = 'none';
        nearbyMsg.innerHTML = `
            <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">На жаль, за вашим запитом точних збігів немає 😔</h3>
            <p style="color: #666;">Але ми підібрали для вас чудові варіанти <strong>поблизу</strong> або в тій же категорії!</p>
        `;
        catalogGrid.parentNode.insertBefore(nearbyMsg, catalogGrid);
    }

    const districtFilterSelect = document.getElementById('districtFilter');
    const priceFilterSelect = document.getElementById('priceFilter');
    const sortSelect = document.getElementById('sortSelect');

    function getPrice(card) {
        const priceEl = card.querySelector('.prop-price');
        if (!priceEl) return 0;
        const priceText = priceEl.innerText;
        return parseInt(priceText.replace(/\D/g, ''), 10) || 0;
    }

    function applyFilters(category, query, fallback = false) {
        if (!propertyCards.length) return;
        
        let visibleCount = 0;
        const selectedDistrict = districtFilterSelect ? districtFilterSelect.value : 'all';
        const selectedPrice = priceFilterSelect ? priceFilterSelect.value : 'all';
        
        // Sorting
        if (sortSelect && !fallback) {
            const sortVal = sortSelect.value;
            propertyCards.sort((a, b) => {
                if (sortVal === 'newest') {
                    const aIsNew = a.querySelector('.prop-tag') && a.querySelector('.prop-tag').innerText.includes('Нове');
                    const bIsNew = b.querySelector('.prop-tag') && b.querySelector('.prop-tag').innerText.includes('Нове');
                    if (aIsNew && !bIsNew) return -1;
                    if (!aIsNew && bIsNew) return 1;
                    return 0;
                } else if (sortVal === 'price-asc') {
                    return getPrice(a) - getPrice(b);
                } else if (sortVal === 'price-desc') {
                    return getPrice(b) - getPrice(a);
                }
                return 0;
            });
            propertyCards.forEach(card => catalogGrid.appendChild(card));
        }

        propertyCards.forEach(card => {
            const cardCat = card.getAttribute('data-category');
            const cardTitle = card.querySelector('.property-card__title').innerText.toLowerCase();
            const cardLoc = card.querySelector('.prop-location').innerText.toLowerCase();
            const price = getPrice(card);
            
            // Check category match
            let catMatch = (category === 'all' || cardCat === category);

            // Check district match
            let districtMatch = true;
            if (selectedDistrict !== 'all') {
                districtMatch = cardLoc.includes(selectedDistrict);
            }

            // Check price match
            let priceMatch = true;
            if (selectedPrice !== 'all') {
                const [min, max] = selectedPrice.split('-').map(Number);
                priceMatch = price >= min && price <= max;
            }
            
            // Check query match (in normal mode)
            let queryMatch = true;
            if (!fallback && lowerQuery) {
                const genericWords = ['вулиця', 'вул.', 'вул', 'проспект', 'просп.', 'просп', 'провулок', 'пров.', 'пров'];
                const queryWords = lowerQuery.split(/\s+/).filter(w => !genericWords.includes(w) && w.length > 1);
                
                if (queryWords.length > 0) {
                    queryMatch = queryWords.every(word => cardTitle.includes(word) || cardLoc.includes(word));
                } else {
                    queryMatch = cardTitle.includes(lowerQuery) || cardLoc.includes(lowerQuery);
                }
            }
            
            // Clear any pending timeouts on this card to prevent race conditions
            if (card.hideTimeoutId) clearTimeout(card.hideTimeoutId);
            if (card.showTimeoutId) clearTimeout(card.showTimeoutId);

            if (catMatch && queryMatch && districtMatch && priceMatch) {
                card.style.display = 'flex';
                card.showTimeoutId = setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 10);
                visibleCount++;
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                card.hideTimeoutId = setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });

        // Nearby logic
        if (nearbyMsg) {
            if (visibleCount === 0 && !fallback) {
                nearbyMsg.style.display = 'block';
                setTimeout(() => nearbyMsg.style.opacity = '1', 10);
                applyFilters(category, '', true); // retry without query
            } else if (visibleCount > 0 && !fallback) {
                nearbyMsg.style.display = 'none';
                nearbyMsg.style.opacity = '0';
            }
        }
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');
            const currentQuery = document.getElementById('search-input') ? document.getElementById('search-input').value.trim() : '';
            applyFilters(filterValue, currentQuery);
        });
    });

    const triggerFiltersUpdate = () => {
        const currentCat = document.querySelector('.filter-btn.active') ? document.querySelector('.filter-btn.active').getAttribute('data-filter') : 'all';
        const currentQuery = document.getElementById('search-input') ? document.getElementById('search-input').value.trim() : '';
        applyFilters(currentCat, currentQuery);
    };

    // Custom Dropdown Logic
    const customDropdowns = document.querySelectorAll('.custom-dropdown');
    customDropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.custom-dropdown__trigger');
        const triggerText = dropdown.querySelector('.custom-dropdown__trigger-text');
        const options = dropdown.querySelectorAll('.custom-dropdown__option');
        const hiddenInput = dropdown.querySelector('input[type="hidden"]');
        
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            customDropdowns.forEach(d => {
                if(d !== dropdown) d.classList.remove('open');
            });
            dropdown.classList.toggle('open');
        });
        
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                triggerText.innerText = option.querySelector('.option-title').innerText;
                hiddenInput.value = option.getAttribute('data-value');
                dropdown.classList.remove('open');
                triggerFiltersUpdate();
            });
        });
    });

    document.addEventListener('click', () => {
        customDropdowns.forEach(dropdown => dropdown.classList.remove('open'));
    });

    const toggleAdvancedFiltersBtn = document.getElementById('toggleAdvancedFilters');
    const advancedFiltersPanel = document.getElementById('advancedFiltersPanel');
    if (toggleAdvancedFiltersBtn && advancedFiltersPanel) {
        toggleAdvancedFiltersBtn.addEventListener('click', () => {
            advancedFiltersPanel.classList.toggle('show');
            if (advancedFiltersPanel.classList.contains('show')) {
                toggleAdvancedFiltersBtn.classList.add('active');
                toggleAdvancedFiltersBtn.style.backgroundColor = 'var(--clr-primary)';
                toggleAdvancedFiltersBtn.style.color = 'var(--clr-white)';
                toggleAdvancedFiltersBtn.style.borderColor = 'var(--clr-primary)';
            } else {
                toggleAdvancedFiltersBtn.classList.remove('active');
                toggleAdvancedFiltersBtn.style.backgroundColor = '';
                toggleAdvancedFiltersBtn.style.color = 'var(--clr-text)';
                toggleAdvancedFiltersBtn.style.borderColor = '#eee';
            }
        });
    }
    // 4. Hero Search Tabs Interactivity
    const searchTabs = document.querySelectorAll('.search-tab');
    searchTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            searchTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // 5. Scroll Reveal Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in, .slide-up').forEach(el => {
        observer.observe(el);
    });

    // 6. Simulate opening property details
    propertyCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('.property-card__title').innerText;
            alert(`Ви відкрили сторінку об'єкту: "${title}"\n(Тут може бути перехід на детальну сторінку)`);
        });
    });

    // 7. Autocomplete Dropdown Logic
    const searchInput = document.getElementById('search-input');
    const searchDropdown = document.getElementById('search-dropdown');
    const popularLinks = document.querySelectorAll('.popular-links a');

    // Mock data for Vinnytsia
    const locations = [
    { name: "ЖК Dream Lake", type: "ЖК", icon: "home" },
    { name: "ЖК ТИSHA", type: "ЖК", icon: "home" },
    { name: "ЖК Artynov Hall", type: "ЖК", icon: "home" },
    { name: "ЖК Family Comfort", type: "ЖК", icon: "home" },
    { name: "ЖК WMisto", type: "ЖК", icon: "home" },
    { name: "ЖК Тhe TENTH House", type: "ЖК", icon: "home" },
    { name: "ЖК КЕЛЬЦЕ", type: "ЖК", icon: "home" },
    { name: "ЖК Зоря 2", type: "ЖК", icon: "home" },
    { name: "ЖК Баварія", type: "ЖК", icon: "home" },
    { name: "ЖК Лука Сіті", type: "ЖК", icon: "home" },
    { name: "ЖК Central Park Vinnytsia", type: "ЖК", icon: "home" },
    { name: "ЖК Lavanda Park", type: "ЖК", icon: "home" },
    { name: "ЖК Озерні Вежі", type: "ЖК", icon: "home" },
    { name: "ЖК TWINS", type: "ЖК", icon: "home" },
    { name: "ЖК FORREST", type: "ЖК", icon: "home" },
    { name: "ЖК Мадагаскар", type: "ЖК", icon: "home" },
    { name: "ЖК Dobrobud", type: "ЖК", icon: "home" },
    { name: "ЖК Масив Барський", type: "ЖК", icon: "home" },
    { name: "ЖК Міра", type: "ЖК", icon: "home" },
    { name: "ЖК Княжий", type: "ЖК", icon: "home" },
    { name: "ЖК Сімейний COMFORT 2", type: "ЖК", icon: "home" },
    { name: "ЖК Калина", type: "ЖК", icon: "home" },
    { name: "ЖК Добробуд", type: "ЖК", icon: "home" },
    { name: "ЖК Forest Home", type: "ЖК", icon: "home" },
    { name: "ЖК Родинний маєток", type: "ЖК", icon: "home" },
    { name: "ЖК Волошкові озера", type: "ЖК", icon: "home" },
    { name: "КБ ParkLake", type: "ЖК", icon: "home" },
    { name: "ЖК Кемпінг Сіті", type: "ЖК", icon: "home" },
    { name: "ЖК NOVA KOREЯ", type: "ЖК", icon: "home" },
    { name: "ЖК Староміський", type: "ЖК", icon: "home" },
    { name: "ЖК АгроЦентр 1", type: "ЖК", icon: "home" },
    { name: "ЖК URBN", type: "ЖК", icon: "home" },
    { name: "Центр", type: "Район", icon: "map-pin" },
    { name: "Замостя", type: "Район", icon: "map-pin" },
    { name: "Вишенька", type: "Район", icon: "map-pin" },
    { name: "Тяжилів", type: "Район", icon: "map-pin" },
    { name: "Старе місто", type: "Район", icon: "map-pin" },
    { name: "Поділля", type: "Район", icon: "map-pin" },
    { name: "Корея", type: "Район", icon: "map-pin" },
    { name: "Слов'янка", type: "Район", icon: "map-pin" },
    { name: "ЖК Набережний Квартал", type: "ЖК", icon: "home" },
    { name: "ЖК Авалон", type: "ЖК", icon: "home" },
    { name: "ЖК Поділля", type: "ЖК", icon: "home" },
    { name: "ЖК Туркіш Сіті", type: "ЖК", icon: "home" },
    { name: "ЖК Premier Tower", type: "ЖК", icon: "home" },
    { name: "Вулиця 20 Березня", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця 28 Червня", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця 600-річчя", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Абрикосова", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Абрикосовий", type: "Провулок", icon: "navigation" },
    { name: "Тупик Абрикосовий", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Авіаційна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Авіаційний", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Авіаційний", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Авіаційний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Автомобільна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Аграрна", type: "Вулиця", icon: "navigation" },
    { name: "Тупик Аграрний", type: "Тупик", icon: "navigation" },
    { name: "Тупик 1-й Аграрний", type: "Тупик", icon: "navigation" },
    { name: "Тупик 2-й Аграрний", type: "Тупик", icon: "navigation" },
    { name: "Тупик 3-й Аграрний", type: "Тупик", icon: "navigation" },
    { name: "Тупик 4-й Аграрний", type: "Тупик", icon: "navigation" },
    { name: "Тупик 5-й Аграрний", type: "Тупик", icon: "navigation" },
    { name: "Тупик 6-й Аграрний", type: "Тупик", icon: "navigation" },
    { name: "Тупик 7-й Аграрний", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Агрономічна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Айвазовського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Академіка Боголюбова", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Академіка Буняковського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Академіка Вернадського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Академіка Ющенка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Академіка Янгеля", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Академіка Янгеля", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Академічна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Академічний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Павла Алепського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Натана Альтмана", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Антонінка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Олега Антонова", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Миколи Амосова", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Миколи Амосова", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Андріївська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Андріївський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Андрія Первозванного", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Володимира Антоновича", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Архітектора Артинова", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Архітектора Кеди", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Архітектурний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Івана Багряного", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Романа Балаби", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Романа Балаби", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Романа Балаби", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Степана Бандери", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Степана Бандери", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Барвиста", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Барвистий", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Василя Барки", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Василя Барки", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Барське шосе", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Батальйонна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Батозька", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Бевза", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Берегова", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Береговий", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Олексія Береста", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Бессарабське шосе", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Миколи Битинського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Дмитра Білоконя", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Дмитра Білоконя", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Валентина Білошкурського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Віктора Блащука", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Богомольця", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Богомольця", type: "Провулок", icon: "navigation" },
    { name: "Тупик Богомольця", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Івана Богуна", type: "Вулиця", icon: "navigation" },
    { name: "Площа Івана Богуна", type: "Площа", icon: "navigation" },
    { name: "Провулок Івана Богуна", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Олександра Божка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Івана Бойка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Івана Бойка", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Болгарська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Болгарський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Болгарський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Миколи Болярського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Гійома Боплана", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Валеріана Боржковського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Анатолія Бортняка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Ботанічна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Ботанічний", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Ботанічний", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Ботанічний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Брацлавська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Брацлавський", type: "Провулок", icon: "navigation" },
    { name: "Тупик Брацлавський", type: "Тупик", icon: "navigation" },
    { name: "Провулок Густава Брілінга", type: "Провулок", icon: "navigation" },
    { name: "Вулиця В'ячеслава Бронського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Будівельна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Будівельників", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Олександри Бурбело", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Бучми", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Бучми", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Ваксмана", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Вантажна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Варшавська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Варшавський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Варшавський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Варшавський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Костянтина Василенка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Миколи Ващука", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Верещагіна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Верхарна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Веселкова", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Івана Виговського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Визволення", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця В. Винниченка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Виноградна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Марцелія Високінського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Вишенька", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Вишенька", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Вишивана", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Вишнева", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Вишневий", type: "Провулок", icon: "navigation" },
    { name: "Провулок 1-й Вишневий", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Вишневий", type: "Провулок", icon: "navigation" },
    { name: "Тупик Вишневий", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Вишневського", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Вишневського", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Вишневського", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Вишневського", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Остапа Вишні", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Остапа Вишні", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Вінницьке лісництво", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Вінницька", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Войцехівського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Петра Волинця", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Петра Волинця", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Князя Володимира", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Волонтерська", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Йоахима Волошиновського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Волошкова", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Волошковий", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Вацлава Гавела", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Вацлава Гавела", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Марії Гавриш", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Гайдамацька", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Гайдамацький", type: "Провулок", icon: "navigation" },
    { name: "Провулок 1-й Гайдамацький", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Данила Галицького", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Галицького", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Якова Гальчевського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Ісмаїла Гаспринського", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Ісмаїла Гаспринського", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Генерала Арабея", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Генерала Безручка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Генерала Безручка", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Генерала Гандзюка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Генерала Дерев'янка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Генерала Дерев'янка", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Генерала Трейка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Генетична", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Генетичний", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Генетичний", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Генетичний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Героїв Крут", type: "Вулиця", icon: "navigation" },
    { name: "Площа Героїв Майдану", type: "Площа", icon: "navigation" },
    { name: "Вулиця Героїв Нацгвардії", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Героїв поліції", type: "Вулиця", icon: "navigation" },
    { name: "Площа Героїв Чорнобиля", type: "Площа", icon: "navigation" },
    { name: "Вулиця Гетьмана Сагайдачного", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Гетьмана Сагайдачного", type: "Провулок", icon: "navigation" },
    { name: "Провулок Гетьманський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Глекова", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Глинська", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Леоніда Глібова", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Гніванське шосе", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Гніванське шосе", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Гніванське шосе", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Гніванське шосе", type: "Провулок", icon: "navigation" },
    { name: "Провулок 4-й Гніванське шосе", type: "Провулок", icon: "navigation" },
    { name: "Провулок 5-й Гніванське шосе", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Гоголя", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Гонти", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Гонти", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Олеся Гончара", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Владислава Городецького", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Городищенська", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Алли Горської", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Грабовського", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Грабовського", type: "Провулок", icon: "navigation" },
    { name: "Вулиця В. Грабовської", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Омеляна Грабця", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Омеляна Грабця", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Омеляна Грабця", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Гранична", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Гранітна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Василя Гречулевича", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Генерала Григоренка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Генерала Григоренка", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Бориса Грінченка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Бориса Грінченка", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Бориса Грінченка", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Грушева", type: "Вулиця", icon: "navigation" },
    { name: "Тупик Грушевий", type: "Тупик", icon: "navigation" },
    { name: "Провулок Грушевий", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Грушевського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Гулака-Артемовського", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Гулака-Артемовського", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Євгена Гуцала", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Євгена Гуцала", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Ґданська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Ґданський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Ґданський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Ґданський", type: "Провулок", icon: "navigation" },
    { name: "Тупик 1-й Ґданський", type: "Тупик", icon: "navigation" },
    { name: "Тупик 2-й Ґданський", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Ґрохольських", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Ґрохольських", type: "Провулок", icon: "navigation" },
    { name: "Тупик Ґрохольських", type: "Тупик", icon: "navigation" },
    { name: "Провулок Дальній", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Володимира Даценка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Дачна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Дачний", type: "Провулок", icon: "navigation" },
    { name: "Провулок Депутатський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Деснянська", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Джерельна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Івана Дзюби", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Димчука", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Дніпровська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Добрий", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Добрих сусідів", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Добровольців", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Олекси Довбуша", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Олександра Довженка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця П. Дорошенка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Михайла Драгоманова", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Михайла Драгоманова", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Драй-Хмари", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Дружби", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Дружби", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Дружби", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Дружня", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Дубовецька", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Дубовецький", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Дубовецький", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Дубовецький", type: "Провулок", icon: "navigation" },
    { name: "Вулиця С. Дудковського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Дьогтянецька", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Енергетична", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Енергетичний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Ентузіастів", type: "Вулиця", icon: "navigation" },
    { name: "Площа Європейська", type: "Площа", icon: "navigation" },
    { name: "Вулиця Миколи Євшана", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Єдності", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Єрусалимка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Житня", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Житомирське шосе", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Забаштанського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Заболотного", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця П. Загребельного", type: "Вулиця", icon: "navigation" },
    { name: "Провулок П. Загребельного", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Залізнична", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Залізничний", type: "Провулок", icon: "navigation" },
    { name: "Провулок Заміський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Замкова", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Замковий", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Замковий", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Замковий", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Замостянська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Замріяний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Заньковецької", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Заньковецької", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Запорізька", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Зарічна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Яна Засідателя", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Яна Засідателя", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Захисників", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Захисників неба", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Затишна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Затишний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Зелена", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Зелений", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Миколи Зерова", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Олексія Зінов'єва", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Зодчих", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Зоряна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Зоряний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Сергія Зулінського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Івана-Павла ІІ", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Івасюка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця В. Ілика", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Юрія Іллєнка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Індустріальний", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Індустріальний", type: "Провулок", icon: "navigation" },
    { name: "Провулок Інститутський", type: "Провулок", icon: "navigation" },
    { name: "Провулок Інтелігентний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Леоніда Каденюка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Леоніда Каденюка", type: "Провулок", icon: "navigation" },
    { name: "Провулок 1-й Леоніда Каденюка", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Леоніда Каденюка", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Леоніда Каденюка", type: "Провулок", icon: "navigation" },
    { name: "Провулок 4-й Леоніда Каденюка", type: "Провулок", icon: "navigation" },
    { name: "Провулок 5-й Леоніда Каденюка", type: "Провулок", icon: "navigation" },
    { name: "Площа Калічанська", type: "Площа", icon: "navigation" },
    { name: "Вулиця Петра Калнишевського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Кальницька", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Каменярів", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Кам'янецький", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Кар'єрна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Кар'єрний", type: "Провулок", icon: "navigation" },
    { name: "Провулок 1-й Кар'єрний", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Кар'єрний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Кармелюка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Квітнева", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Квітневий", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Квітуча", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Квітучий", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Келецька", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Келецький", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Кибальчича", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Кибальчича", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Київська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Київський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Київський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця В. Киянка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Юрія Клена", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Кобзаря", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця О. Кобилянської", type: "Вулиця", icon: "navigation" },
    { name: "Провулок О. Кобилянської", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Кожедуба", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Козацька", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Козацький", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Комітетська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Комунальний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Євгена Коновальця", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Джозефа Конрада", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Кооперативна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Кооперативний", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Кооперативний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Коперника", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Князів Коріатовичів", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Князів Коріатовичів", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Павла Корнелюка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Корольова", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Корольова", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Корольова", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Корольова", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Коротка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Короткий", type: "Провулок", icon: "navigation" },
    { name: "Проспект Космонавтів", type: "Проспект", icon: "navigation" },
    { name: "Вулиця Миколи Костомарова", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Миколи Костомарова", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Миколи Костомарова", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Ігоря Костецького", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Ігоря Костецького", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Ігоря Костецького", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Братів Котенків", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Братів Котенків", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Котляревського", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Котляревського", type: "Провулок", icon: "navigation" },
    { name: "Проспект Коцюбинського", type: "Проспект", icon: "navigation" },
    { name: "Вулиця Олександра Кошиця", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Кривоноса", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Бориса Крижевого", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Агатангела Кримського", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Агатангела Кримського", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Василя Кричевського", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Василя Кричевського", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Кропивницького", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Крутнів Яр", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Крутнів Яр", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Соломії Крушельницької", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Миколи Куліша", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Леся Курбаса", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Леся Курбаса", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Ю. Курія", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Лебединського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Юрія Левади", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Левадна", type: "Вулиця", icon: "navigation" },
    { name: "Тупик 1-й Левадний", type: "Тупик", icon: "navigation" },
    { name: "Тупик 2-й Левадний", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Олександра Лотоцького", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Олександра Лотоцького", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Олександра Лотоцького", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Олександра Лотоцького", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Левка Лук'яненка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Левка Лук'яненка", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Леонтовича", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Липовецька", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Липовецький", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Лисенка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Лисенка", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Антона Листопада", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Антона Листопада", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Марії Литвиненко-Вольгемут", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Марії Литвиненко-Вольгемут", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Марії Литвиненко-Вольгемут", type: "Провулок", icon: "navigation" },
    { name: "Тупик 1-й Марії Литвиненко-Вольгемут", type: "Тупик", icon: "navigation" },
    { name: "Провулок Литовський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Лівобережна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Лівобережний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Лірницька", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Лірницький", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Лірницький", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Лісова", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Лісовий", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Лісовий", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Лісовий", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Валерія Лобановського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Лугова", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Луговий", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Б. Лук'яновського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Лучанська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Лучанський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Львівське шосе", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Люблінський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Магістратська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Магістратський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Гетьмана Мазепи", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Дмитра Майбороди", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Сенатора Маккейна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Казимира Малевича", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Малий", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Малиновського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Михайла Малишенка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Маріупольська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Маріупольський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Маріупольський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Маріупольський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 4-й Маріупольський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 5-й Маріупольський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Марка Вовчка", type: "Вулиця", icon: "navigation" },
    { name: "Бульвар Марка Вовчка", type: "Бульвар", icon: "navigation" },
    { name: "Вулиця Дмитра Марковича", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Дмитра Марковича", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Матроса Кішки", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Медова", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Медовий", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Джеймса Мейса", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Джеймса Мейса", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Ярмоли Мелешка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Мельника", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Мельника", type: "Провулок", icon: "navigation" },
    { name: "Тупик Мельника", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Мечнікова", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Миколаївська", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Івана Миколайчука", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Івана Миколайчука", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Олексія Миргородського", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Олексія Миргородського", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Олексія Миргородського", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Мирного", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Мистецький", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Митрополита Петра Могили", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Д. Михайловського", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Д. Михайловського", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Діонісія Міклера", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Діонісія Міклера", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Місячна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Міцкевича", type: "Вулиця", icon: "navigation" },
    { name: "Площа Костянтина Могилка", type: "Площа", icon: "navigation" },
    { name: "Вулиця Могильчака", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Могильчака", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Можайського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Молодіжна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Молодіжний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Монастирська", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Леоніда Мосендза", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Леоніда Мосендза", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Леоніда Мосендза", type: "Провулок", icon: "navigation" },
    { name: "Тупик Леоніда Мосендза", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Я. Мудрого", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Мури", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Набережна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Нагірна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Северина Наливайка", type: "Вулиця", icon: "navigation" },
    { name: "Площа Северина Наливайка", type: "Площа", icon: "navigation" },
    { name: "Провулок 1-й Северина Наливайка", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Северина Наливайка", type: "Провулок", icon: "navigation" },
    { name: "Тупик Северина Наливайка", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Нансена", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Георгія Нарбута", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Георгія Нарбута", type: "Провулок", icon: "navigation" },
    { name: "Провулок Наскрізний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Незалежна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Немирівське шосе", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Немирівське шосе", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Олександра Немченка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Данила Нечая", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Данила Нечая", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Данила Нечая", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Данила Нечая", type: "Провулок", icon: "navigation" },
    { name: "Провулок 4-й Данила Нечая", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Нечуя-Левицького", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Ярослава Нємеца", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Ярослава Нємеца", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Петра Ніщинського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Олекси Новаківського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Новопрорізна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Новоселівська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Новоселівський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Новоселівський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Миколи Оводова", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Івана Огієнка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Одеська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Одеський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Одеський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Озерна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Оксамитова", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Олександрівська", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Олександра Олеся", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Михайла Омеляновича-Павленка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Семена Олійничука", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Семена Олійничука", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Пилипа Орлика", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Пилипа Орлика", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Пилипа Орлика", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Острозького", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Отамана Сітка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Валентина Отамановського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Тимка Падури", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Тимка Падури", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Паліїв Яр", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Паневежиська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Паневежиський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Сергія Параджанова", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Паркова", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Євгена Патона", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Перемильська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Перемильський", type: "Провулок", icon: "navigation" },
    { name: "Площа Перемоги", type: "Площа", icon: "navigation" },
    { name: "Провулок Перемоги", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Симона Петлюри", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Петрусенко", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Петрусенко", type: "Провулок", icon: "navigation" },
    { name: "Тупик Петрусенко", type: "Тупик", icon: "navigation" },
    { name: "Тупик 1-й Петрусенко", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Пирогова", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Пирогова", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Пирогова", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Південна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Північна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Північний", type: "Провулок", icon: "navigation" },
    { name: "Тупик Північний", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Підлісна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Підлісний", type: "Провулок", icon: "navigation" },
    { name: "Тупик Підлісний", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Євгенія Пікуса", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Пластова", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Пластовий", type: "Провулок", icon: "navigation" },
    { name: "Тупик Пластовий", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Подільська", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Політехнічна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Т. Полубуткіна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Т. Полубуткіна", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Т. Полубуткіна", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Польова", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Помаранчева", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Помаранчевий", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Василя Порика", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Праведників світу", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Бернарда Претвича", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Бернарда Претвича", type: "Провулок", icon: "navigation" },
    { name: "Тупик Прибережний", type: "Тупик", icon: "navigation" },
    { name: "Провулок Прибузький", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Привокзальна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Привокзальний", type: "Провулок", icon: "navigation" },
    { name: "Площа Привокзальна", type: "Площа", icon: "navigation" },
    { name: "Вулиця Марії Приймаченко", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Марії Приймаченко", type: "Провулок", icon: "navigation" },
    { name: "Вулиця вулиця Насті Присяжнюк", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Насті Присяжнюк", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Насті Присяжнюк", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Насті Присяжнюк", type: "Провулок", icon: "navigation" },
    { name: "Тупик Насті Присяжнюк", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Ігоря Присяжнюка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Продольна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Продольний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Промислова", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Професора Шульги", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Івана Пулюя", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Івана Пулюя", type: "Провулок", icon: "navigation" },
    { name: "Тупик Івана Пулюя", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Олени Пчілки", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця П'ятничанська", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Ранкова", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Л. Ратушної", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Л. Ратушної", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Рєпіна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Максима Рильського", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Максима Рильського", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Руданського", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Руданського", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Руданського", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Руданського", type: "Провулок", icon: "navigation" },
    { name: "Провулок 4-й Руданського", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Софії Русової", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Софії Русової", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Софії Русової", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Ю. Рябчинської", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Сабарівське шосе", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця І. Савченка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Ігоря Савченка", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Садова", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Садовського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Саксаганського", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Саксаганського", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Самійла Самуся", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Уласа Самчука", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Євгена Сверстюка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Євгена Сверстюка", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Анатолія Свидницького", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Володимира Свідзінського", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Володимира Свідзінського", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Володимира Свідзінського", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Володимира Свідзінського", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Івана Світличного", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Івана Світличного", type: "Провулок", icon: "navigation" },
    { name: "Бульвар Свободи", type: "Бульвар", icon: "navigation" },
    { name: "Вулиця Святослава Хороброго", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Святослава Хороброго", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Святошинська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Святошинський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Святошинський", type: "Провулок", icon: "navigation" },
    { name: "Провулок Селянський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця В. Семенця", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Лева Семполовського", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Середній", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Серпнева", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Василя Сильвестрова", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Лева Симиренка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Василя Симоненка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Василя Симоненка", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Синьоводська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Синьоводський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Синьоводський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Тараса Сича", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Тараса Сича", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Ігоря Сікорського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Івана Сірка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Івана Сірка", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Юхима Сіцінського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Родіона Скалецького", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Скіфська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Скіфський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 1-й Скіфський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Скіфський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Скіфський", type: "Провулок", icon: "navigation" },
    { name: "Тупик Скіфський", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Складська", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Григорія Сковороди", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Мирослава Скорика", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Мирослава Скорика", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Мирослава Скорика", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Франциска Скорини", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Франциска Скорини", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Павла Скоропадського", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Павла Скоропадського", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Славетна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Славетний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Василя Сліпака", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Василя Сліпака", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Василя Сліпака", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Слов'янська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Слов'янський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Соборна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Олександра Соловйова", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Сонячна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Сонячний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Соняшникова", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Соняшниковий", type: "Провулок", icon: "navigation" },
    { name: "Вулиця В. Сосюри", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Соцька", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Стадницька", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Староміська", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Миколи Стаховського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Аріадни Стебельської", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Аріадни Стебельської", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Аріадни Стебельської", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Аріадни Стебельської", type: "Провулок", icon: "navigation" },
    { name: "Провулок 4-й Аріадни Стебельської", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Стельмаха", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Степова", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Степовий", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Степовий", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Василя Стефаника", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Василя Стефаника", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Василя Стефаника", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Василя Стефаника", type: "Провулок", icon: "navigation" },
    { name: "Провулок 4-й Василя Стефаника", type: "Провулок", icon: "navigation" },
    { name: "Провулок 5-й Василя Стефаника", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Стеценка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Стеценка", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Стеценка", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Стрілецька", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Богдана Ступки", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Василя Стуса", type: "Вулиця", icon: "navigation" },
    { name: "Площа Василя Стуса", type: "Площа", icon: "navigation" },
    { name: "Вулиця Надії Суровцової", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Сусідський", type: "Провулок", icon: "navigation" },
    { name: "Провулок Сучасний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Східна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Східний", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Східний", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Східний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Танкістів", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Гната Танцюри", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Гната Танцюри", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Гната Танцюри", type: "Провулок", icon: "navigation" },
    { name: "Тупик Гната Танцюри", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Театральна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Олени Теліги", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Тимофіївська", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Степана Тимошенка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Степана Тимошенка", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Тиха", type: "Вулиця", icon: "navigation" },
    { name: "Тупик Тихий", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Павла Тичини", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Тобілевича", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Топольського", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Топольського", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Топольського", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Тракторна", type: "Вулиця", icon: "navigation" },
    { name: "Тупик Тракторний", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Трамвайна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Трамвайний", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Трамвайний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Трипільська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Трипільський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Трипільський", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Трипільський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Тропініна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Тропініна", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Тропініна", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Трублаїні", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Трублаїні", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Трублаїні", type: "Провулок", icon: "navigation" },
    { name: "Провулок Турбівський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Антона Турчановича", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Антона Турчановича", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Антона Турчановича", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Антона Турчановича", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Василя Тютюнника", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Тяжилівська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Тяжилівський", type: "Провулок", icon: "navigation" },
    { name: "Тупик Тяжилівський", type: "Тупик", icon: "navigation" },
    { name: "Вулиця Олександра Удовиченка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Лесі Українки", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Лесі Українки", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Українська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Український", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Український", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Український", type: "Провулок", icon: "navigation" },
    { name: "Провулок Уманський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Учительська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Учительський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Ушинського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Івана Федорова", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Івана Федорова", type: "Провулок", icon: "navigation" },
    { name: "Вулиця масив Фермерський", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Форпостна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Франка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Франка", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Франка", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Миколи Хвильового", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Миколи Хвильового", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Миколи Хвильового", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Хлібна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Василя Хмелюка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Хмельницьке шосе", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Хмельницьке шосе", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Б. Хмельницького", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Івана Хоменка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Івана Хоменка", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Івана Хоменка", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Хоробрих", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Хресна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Хуторянська", type: "Вулиця", icon: "navigation" },
    { name: "Площа Царина", type: "Площа", icon: "navigation" },
    { name: "Вулиця Цегельна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Цегельний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Квітки Цісик", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Чайковського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Чапельська", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Червонохрестівська", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Черешнева", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Черешневий", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Черкаське шосе", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Анатолія Черниша", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Чернігівська", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Чернігівський", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Євгена Чикаленка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Євгена Чикаленка", type: "Провулок", icon: "navigation" },
    { name: "Провулок 1-й Євгена Чикаленка", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Євгена Чикаленка", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Євгена Чикаленка", type: "Провулок", icon: "navigation" },
    { name: "Провулок 4-й Євгена Чикаленка", type: "Провулок", icon: "navigation" },
    { name: "Провулок 5-й Євгена Чикаленка", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Вячеслава Чорновола", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Чумацька", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Чумацький", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Чумацький", type: "Провулок", icon: "navigation" },
    { name: "Провулок 3-й Чумацький", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Тараса Шевченка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Тараса Шевченка", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Тараса Шевченка", type: "Провулок", icon: "navigation" },
    { name: "Тупик Тараса Шевченка", type: "Тупик", icon: "navigation" },
    { name: "Площа Тараса Шевченка", type: "Площа", icon: "navigation" },
    { name: "Вулиця Якова Шепеля", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Андрея Шептицького", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Шереметка", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Шереметка", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Максима Шимка", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Івана Шиповича", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Костя Широцького", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Костя Широцького", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Дмитра Шкарбуна", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Шкільна", type: "Вулиця", icon: "navigation" },
    { name: "Площа Шкільна", type: "Площа", icon: "navigation" },
    { name: "Провулок Шкільний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Бориса Шкляра", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Бориса Шкляра", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Бориса Шкляра", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Шкуринецька", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Шолом-Алейхема", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Романа Шухевича", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Романа Шухевича", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Щаслива", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Івана Щирського", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Юзвинська", type: "Вулиця", icon: "navigation" },
    { name: "Проспект Юності", type: "Проспект", icon: "navigation" },
    { name: "Провулок 1-й Юності", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Юності", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Гната Юри", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Гната Юри", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Тетяни Яблонської", type: "Вулиця", icon: "navigation" },
    { name: "Провулок 1-й Тетяни Яблонської", type: "Провулок", icon: "navigation" },
    { name: "Провулок 2-й Тетяни Яблонської", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Яблунева", type: "Вулиця", icon: "navigation" },
    { name: "Вулиця Яреми", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Яружний", type: "Провулок", icon: "navigation" },
    { name: "Вулиця Ясна", type: "Вулиця", icon: "navigation" },
    { name: "Провулок Ясний", type: "Провулок", icon: "navigation" }
    ];

    // 8. Team Carousel Logic
    const teamGrid = document.getElementById('team-grid');
    const teamPrev = document.getElementById('team-prev');
    const teamNext = document.getElementById('team-next');

    if (teamGrid && teamPrev && teamNext) {
        teamPrev.addEventListener('click', () => {
            const cardWidth = teamGrid.querySelector('.team-card').offsetWidth;
            const gap = 32; // 2rem gap
            teamGrid.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
        });

        teamNext.addEventListener('click', () => {
            const cardWidth = teamGrid.querySelector('.team-card').offsetWidth;
            const gap = 32; // 2rem gap
            teamGrid.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
        });
    }

    function getIconSVG(type) {
        if (type === 'home') return `<svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
        if (type === 'navigation') return `<svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`;
        return `<svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    }

    function renderDropdown(items, query) {
        if (!searchDropdown) return;
        searchDropdown.innerHTML = '';
        if (items.length === 0) {
            searchDropdown.classList.remove('active');
            return;
        }

        items.slice(0, 15).forEach(item => {
            const li = document.createElement('li');
            li.classList.add('hero-search__dropdown-item');
            
            // Highlight matching text
            const regex = new RegExp(`(${query})`, 'gi');
            const highlightedName = item.name.replace(regex, '<span class="highlight">$1</span>');

            li.innerHTML = `
                ${getIconSVG(item.icon)}
                <div>
                    <div>${highlightedName}</div>
                    <div style="font-size: 0.8rem; color: #A0948A;">${item.type}</div>
                </div>
            `;

            li.addEventListener('click', () => {
                if (searchInput) searchInput.value = item.name;
                searchDropdown.classList.remove('active');
            });

            searchDropdown.appendChild(li);
        });
        
        searchDropdown.classList.add('active');
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (query.length < 1) {
                if (searchDropdown) searchDropdown.classList.remove('active');
                return;
            }

            const filtered = locations.filter(loc => loc.name.toLowerCase().includes(query));
            renderDropdown(filtered, query);
        });

        // Handle clicks outside to close dropdown
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && searchDropdown && !searchDropdown.contains(e.target)) {
                searchDropdown.classList.remove('active');
            }
        });
    }

    // Handle popular links click
    if (popularLinks.length > 0) {
        popularLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (searchInput) searchInput.value = e.target.innerText;
                if (searchDropdown) searchDropdown.classList.remove('active');
            });
        });
    }

    // 9. Contact Form Radio Buttons
    const formRadios = document.querySelectorAll('.form-radio');
    formRadios.forEach(radio => {
        radio.addEventListener('click', function() {
            formRadios.forEach(r => r.classList.remove('active'));
            this.classList.add('active');
            this.querySelector('input').checked = true;
        });
    });

    // 10. Search Redirect & URL Parsing
    const heroSearchBtn = document.querySelector('.hero-search__btn');
    
    // Mapping tabs to filter values
    const tabToCategory = {
        'Усе': 'all',
        'Квартири': 'apartment',
        'Будинки': 'house',
        'Ділянки': 'land',
        'Комерція': 'commercial'
    };

    if (heroSearchBtn) {
        heroSearchBtn.addEventListener('click', () => {
            let selectedCat = 'all';
            const activeTab = document.querySelector('.search-tab.active');
            if (activeTab) {
                const tabText = activeTab.innerText.trim();
                selectedCat = tabToCategory[tabText] || 'all';
            }
            
            const query = searchInput ? searchInput.value.trim() : '';
            
            // If we are NOT on the catalog page, redirect
            if (!document.querySelector('.properties__grid')) {
                window.location.href = `catalog.html?category=${selectedCat}&query=${encodeURIComponent(query)}`;
            } else {
                // If already on catalog, just apply filters
                filterBtns.forEach(b => b.classList.remove('active'));
                const targetBtn = document.querySelector(`.filter-btn[data-filter="${selectedCat}"]`);
                if(targetBtn) targetBtn.classList.add('active');
                
                applyFilters(selectedCat, query);
            }
        });
    }

    // Parse URL on load for catalog
    if (document.querySelector('.properties__grid')) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlCat = urlParams.get('category');
        const urlQuery = urlParams.get('query');
        
        let initialCat = 'all';
        let initialQuery = '';

        if (urlCat) {
            initialCat = urlCat;
            filterBtns.forEach(b => b.classList.remove('active'));
            const targetBtn = document.querySelector(`.filter-btn[data-filter="${initialCat}"]`);
            if (targetBtn) targetBtn.classList.add('active');
        }

        if (urlQuery) {
            initialQuery = urlQuery;
            if (searchInput) searchInput.value = initialQuery;
        }

        if (urlCat || urlQuery) {
            setTimeout(() => {
                applyFilters(initialCat, initialQuery);
            }, 50);
        }
    }

    // 11. Telegram Bot Integration for Contact Form
    const contactForm = document.querySelector('.contact__form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function (e) {
                let val = e.target.value;
                
                // Видаляємо всі недозволені символи (залишаємо цифри, +, пробіл, дефіс, дужки)
                val = val.replace(/[^\d\+\s\-\(\)]/g, '');
                
                // Залишаємо лише один '+' і тільки на початку
                if (val.includes('+')) {
                    val = '+' + val.replace(/\+/g, '');
                }
                
                e.target.value = val;
            });
        }
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // Отримуємо вибрану радіо-кнопку
            const interestRadio = document.querySelector('input[name="interest"]:checked');
            const interest = interestRadio ? interestRadio.value : 'Не вказано';

            const TELEGRAM_BOT_TOKEN = '8944016356:AAEhgrts5aQ4JfBs3FW5_nfjnI2MvYhSQXs';
            const TELEGRAM_CHAT_ID = '1121951611';

            // Формуємо повідомлення
            let text = `🔥 <b>Нова заявка з сайту Рудий Кіт!</b>\n\n`;
            text += `🏠 <b>Цікавить:</b> ${interest}\n`;
            text += `👤 <b>Ім'я:</b> ${name}\n`;
            text += `📞 <b>Телефон:</b> ${phone}\n`;
            if (email) text += `✉️ <b>Email:</b> ${email}\n`;
            if (message) text += `💬 <b>Повідомлення:</b>\n${message}`;

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Надсилання...';
            formStatus.style.display = 'none';

            try {
                // Відправляємо дані безпосередньо в Telegram API
                const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        text: text,
                        parse_mode: 'HTML'
                    })
                });

                if (response.ok) {
                    formStatus.style.display = 'block';
                    formStatus.style.color = '#16a34a'; // green
                    formStatus.innerText = '✅ Ваша заявка успішно надіслана! Ми зв\'яжемось з вами найближчим часом.';
                    contactForm.reset();
                    // Reset custom radio styles
                    document.querySelectorAll('.form-radio').forEach(r => r.classList.remove('active'));
                    document.querySelector('.form-radio').classList.add('active'); // set first as active
                } else {
                    throw new Error('Помилка при надсиланні в Telegram');
                }
            } catch (error) {
                console.error(error);
                formStatus.style.display = 'block';
                formStatus.style.color = '#dc2626'; // red
                formStatus.innerHTML = `❌ Сталася помилка при надсиланні. Будь ласка, перевірте налаштування бота або зателефонуйте нам: <strong>+38 (068) 899-54-35</strong>`;
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

});