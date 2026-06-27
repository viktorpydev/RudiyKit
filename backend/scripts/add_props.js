const fs = require('fs');
const path = require('path');

const properties = [
    {
        category: "apartment",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop",
        tag: "Нове",
        tagColor: "var(--clr-primary)",
        typeBadge: "Квартира",
        title: "3-кімн. квартира з ремонтом в центрі",
        location: "вул. Соборна, 45, Центр",
        price: "75 000 USD",
        pricePerM2: "$1000/м²",
        specs: [
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zm0 0V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path></svg>', text: '3 кімн.' },
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9"></path><path d="M22 10H2"></path><path d="M7 6v4"></path><path d="M17 6v4"></path><path d="M12 2v8"></path></svg>', text: '1' },
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 3H3v18h18V3z"></path><path d="M21 3l-18 18"></path></svg>', text: '75 м²' }
        ],
        extra: "4/9 поверх"
    },
    {
        category: "apartment",
        image: "https://images.unsplash.com/photo-1502672260266-1c1e52504437?q=80&w=600&auto=format&fit=crop",
        tag: "Гаряча пропозиція",
        tagColor: "#8b3e3e",
        typeBadge: "Квартира",
        title: "2-кімн. квартира у новобудові",
        location: "вул. Пирогова, 12, Вишенька",
        price: "55 000 USD",
        pricePerM2: "$920/м²",
        specs: [
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zm0 0V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path></svg>', text: '2 кімн.' },
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9"></path><path d="M22 10H2"></path><path d="M7 6v4"></path><path d="M17 6v4"></path><path d="M12 2v8"></path></svg>', text: '1' },
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 3H3v18h18V3z"></path><path d="M21 3l-18 18"></path></svg>', text: '60 м²' }
        ],
        extra: "7/16 поверх"
    },
    {
        category: "apartment",
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600&auto=format&fit=crop",
        tag: "",
        typeBadge: "Квартира",
        title: "Сучасна квартира-студія",
        location: "вул. Келецька, 89, Замостя",
        price: "38 000 USD",
        pricePerM2: "$950/м²",
        specs: [
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zm0 0V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path></svg>', text: '1 кімн.' },
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9"></path><path d="M22 10H2"></path><path d="M7 6v4"></path><path d="M17 6v4"></path><path d="M12 2v8"></path></svg>', text: '1' },
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 3H3v18h18V3z"></path><path d="M21 3l-18 18"></path></svg>', text: '40 м²' }
        ],
        extra: "12/18 поверх"
    },
    {
        category: "house",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop",
        tag: "Нове",
        tagColor: "var(--clr-primary)",
        typeBadge: "Будинок",
        title: "Двоповерховий котедж з ділянкою",
        location: "с. Якушинці, Передмістя",
        price: "150 000 USD",
        pricePerM2: "",
        specs: [
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zm0 0V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path></svg>', text: '5 кімн.' },
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9"></path><path d="M22 10H2"></path><path d="M7 6v4"></path><path d="M17 6v4"></path><path d="M12 2v8"></path></svg>', text: '2' },
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 3H3v18h18V3z"></path><path d="M21 3l-18 18"></path></svg>', text: '180 м²' }
        ],
        extra: ""
    },
    {
        category: "house",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=600&auto=format&fit=crop",
        tag: "",
        typeBadge: "Будинок",
        title: "Затишний будинок з садом",
        location: "с. Агрономічне, Передмістя",
        price: "95 000 USD",
        pricePerM2: "",
        specs: [
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zm0 0V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path></svg>', text: '4 кімн.' },
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9"></path><path d="M22 10H2"></path><path d="M7 6v4"></path><path d="M17 6v4"></path><path d="M12 2v8"></path></svg>', text: '1' },
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 3H3v18h18V3z"></path><path d="M21 3l-18 18"></path></svg>', text: '120 м²' }
        ],
        extra: ""
    },
    {
        category: "land",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop",
        tag: "Гаряча пропозиція",
        tagColor: "#8b3e3e",
        typeBadge: "Ділянка",
        title: "Ділянка під забудову 15 соток",
        location: "с. Лука-Мелешківська, Вінницький район",
        price: "25 000 USD",
        pricePerM2: "",
        specs: [
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 3H3v18h18V3z"></path><path d="M21 3l-18 18"></path></svg>', text: '1500 м²' }
        ],
        extra: ""
    },
    {
        category: "apartment",
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=600&auto=format&fit=crop",
        tag: "",
        typeBadge: "Квартира",
        title: "1-кімн. квартира біля парку",
        location: "вул. Стрілецька, 23, Центр",
        price: "42 000 USD",
        pricePerM2: "$1050/м²",
        specs: [
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zm0 0V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path></svg>', text: '1 кімн.' },
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9"></path><path d="M22 10H2"></path><path d="M7 6v4"></path><path d="M17 6v4"></path><path d="M12 2v8"></path></svg>', text: '1' },
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 3H3v18h18V3z"></path><path d="M21 3l-18 18"></path></svg>', text: '40 м²' }
        ],
        extra: "3/5 поверх"
    },
    {
        category: "land",
        image: "https://images.unsplash.com/photo-1444930694458-e298516a2bdf?q=80&w=600&auto=format&fit=crop",
        tag: "Нове",
        tagColor: "var(--clr-primary)",
        typeBadge: "Ділянка",
        title: "Ділянка з комунікаціями 10 соток",
        location: "с. Стрижавка, Вінницький район",
        price: "35 000 USD",
        pricePerM2: "",
        specs: [
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 3H3v18h18V3z"></path><path d="M21 3l-18 18"></path></svg>', text: '1000 м²' }
        ],
        extra: ""
    },
    {
        category: "apartment",
        image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop",
        tag: "",
        typeBadge: "Квартира",
        title: "4-кімн. квартира з терасою",
        location: "вул. Грушевського, 5, Центр",
        price: "120 000 USD",
        pricePerM2: "$1200/м²",
        specs: [
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zm0 0V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path></svg>', text: '4 кімн.' },
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9"></path><path d="M22 10H2"></path><path d="M7 6v4"></path><path d="M17 6v4"></path><path d="M12 2v8"></path></svg>', text: '2' },
            { icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 3H3v18h18V3z"></path><path d="M21 3l-18 18"></path></svg>', text: '100 м²' }
        ],
        extra: "8/10 поверх"
    }
];

let htmlContent = '';
properties.forEach((prop, index) => {
    const delay = (index % 3) * 0.1;
    
    const tagHtml = prop.tag ? '<span class="prop-tag" style="background-color: ' + prop.tagColor + ';">' + prop.tag + '</span>' : '';
    
    let specsHtml = '';
    prop.specs.forEach(s => {
        specsHtml += '<span>' + s.icon + ' ' + s.text + '</span>';
    });

    htmlContent += '<div class="property-card fade-in" data-category="' + prop.category + '" style="transition-delay: ' + delay + 's;">\n' +
                   '    <div class="property-card__image-wrapper">\n' +
                   '        <img src="' + prop.image + '" alt="' + prop.title + '" class="property-card__image">\n' +
                   '        <div class="prop-badges-top">\n' +
                   '            ' + tagHtml + '\n' +
                   '            <span class="prop-type-badge">' + prop.typeBadge + '</span>\n' +
                   '        </div>\n' +
                   '        <button class="prop-fav-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></button>\n' +
                   '    </div>\n' +
                   '    <div class="property-card__content">\n' +
                   '        <div class="prop-price-row">\n' +
                   '            <span class="prop-price">' + prop.price + '</span>\n' +
                   '            <span class="prop-price-m2">' + prop.pricePerM2 + '</span>\n' +
                   '        </div>\n' +
                   '        <h3 class="property-card__title">' + prop.title + '</h3>\n' +
                   '        <div class="prop-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ' + prop.location + '</div>\n' +
                   '        <div class="prop-specs">\n' + specsHtml + '        </div>\n' +
                   '        <div class="prop-extra">' + prop.extra + '</div>\n' +
                   '        <button class="btn btn--primary prop-btn-full">Детальніше</button>\n' +
                   '    </div>\n' +
                   '</div>\n';
});

let catalogHtml = fs.readFileSync(path.join(__dirname, '../../frontend/catalog.html'), 'utf-8');
const gridRegex = /<div class="properties__grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/;
const replacement = '<div class="properties__grid">\n' + htmlContent + '        </div>\n    </div>\n</section>';
catalogHtml = catalogHtml.replace(gridRegex, replacement);

// Update filters
const filterRegex = /<div class="filters fade-in">[\s\S]*?<\/div>/;
const newFilters = `<div class="filters fade-in">
            <button class="filter-btn active" data-filter="all">Всі</button>
            <button class="filter-btn" data-filter="apartment">Квартири</button>
            <button class="filter-btn" data-filter="house">Будинки</button>
            <button class="filter-btn" data-filter="land">Ділянки</button>
            <button class="filter-btn" data-filter="commercial">Комерція</button>
        </div>`;
catalogHtml = catalogHtml.replace(filterRegex, newFilters);

fs.writeFileSync(path.join(__dirname, '../../frontend/catalog.html'), catalogHtml);
console.log('Done');
