const { createClient } = require('@supabase/supabase-js');

// Змініть ці ключі на власні, якщо потрібно. Тут використовується ваш URL і anon/service_role ключ
const supabaseUrl = 'https://qwunxhnjacfgvtsoflca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dW54aG5qYWNmZ3Z0c29mbGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTY0NjQsImV4cCI6MjA5ODAzMjQ2NH0.jGFZyCTnmkUzuqxpBcKSqDKq-oxDnfoK0npHBYQvTOM';
const supabase = createClient(supabaseUrl, supabaseKey);

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
        tagColor: "",
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
        tagColor: "",
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
    }
];

const team = [
    {
        name: "Світлана Власюк",
        role: "Адміністратор агентства",
        image: "assets/images/owner.png",
        phone: "+38 (063) 628-32-04",
        phone_link: "+380636283204"
    },
    {
        name: "Сніжана Левченко",
        role: "Перевірений рієлтор",
        image: "assets/images/Левченко.jpg",
        phone: "+38 (095) 439-38-11",
        phone_link: "+380954393811"
    },
    {
        name: "Юрій Гарматюк",
        role: "Рієлтор",
        image: "assets/images/Гарматюк.jpg",
        phone: "+38 (068) 753-40-49",
        phone_link: "+380687534049"
    },
    {
        name: "Олеся Тарнавська",
        role: "Рієлтор",
        image: "assets/images/Тарнавська.jpg",
        phone: "+38 (067) 495-76-84",
        phone_link: "+380674957684"
    },
    {
        name: "Марина Штепа",
        role: "Рієлтор",
        image: "assets/images/Штепа.jpg",
        phone: "+38 (097) 612-94-37",
        phone_link: "+380976129437"
    },
    {
        name: "Назар Гриник",
        role: "Рієлтор",
        image: "assets/images/Гриник.jpeg",
        phone: "+38 (068) 899-54-35",
        phone_link: "+380688995435"
    }
];

async function populate() {
    console.log('Clearing old data...');
    // Очистимо старі дані, якщо вони є (для ідемпотентності скрипта)
    await supabase.from('properties').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('team').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('Inserting properties...');
    const { error: errProp } = await supabase.from('properties').insert(properties);
    if (errProp) console.error('Error inserting properties:', errProp);

    console.log('Inserting team members...');
    const { error: errTeam } = await supabase.from('team').insert(team);
    if (errTeam) console.error('Error inserting team:', errTeam);

    console.log('Done populating Supabase.');
}

populate();
