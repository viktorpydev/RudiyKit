// Supabase Setup
const supabaseUrl = 'https://qwunxhnjacfgvtsoflca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dW54aG5qYWNmZ3Z0c29mbGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTY0NjQsImV4cCI6MjA5ODAzMjQ2NH0.jGFZyCTnmkUzuqxpBcKSqDKq-oxDnfoK0npHBYQvTOM';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

window.propertiesMap = new Map();

function renderPropertyCard(prop, delay) {
    let specsHtml = '';
    if (prop.specs && Array.isArray(prop.specs)) {
        specsHtml = prop.specs
            .filter(spec => spec.text && spec.text.trim().toLowerCase() !== 'не вказано')
            .map(spec => `<span>${spec.icon} ${spec.text}</span>`)
            .join('');
    }
    const tagHtml = prop.tag ? `<span class="prop-tag" style="background-color: ${prop.tagcolor || 'var(--clr-primary)'};">${prop.tag}</span>` : '';
    
    // We get priceperm2 from db
    const m2PriceHtml = prop.priceperm2 ? `<span class="prop-price-m2"> &bull; ${prop.priceperm2}</span>` : '';

    let displayPrice = prop.price || '';
    if (prop.category === 'rent' && displayPrice && !displayPrice.toLowerCase().includes('/міс')) {
        displayPrice += ' / міс.';
    }

    return `
    <div class="property-card fade-in" style="transition-delay: ${delay}s; cursor: pointer;" data-category="${prop.category}" onclick="openPropertyModal('${prop.id}')">
        <div class="property-card__image-wrapper">
            <img src="${prop.image}" alt="${prop.title}" class="property-card__image">
            <div class="prop-badges-top">
                ${tagHtml}
                <span class="prop-type-badge">${prop.typebadge}</span>
            </div>
            <button class="prop-fav-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
        </div>
        <div class="property-card__content">
            <h3 class="property-card__title">${prop.title}</h3>
            <div class="prop-price-row">
                <span class="prop-price">${displayPrice}</span>
                ${m2PriceHtml}
            </div>
            ${(prop.location && prop.location.trim() !== 'Невідома адреса') ? `<div class="prop-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${prop.location}</div>` : ''}
            <div class="prop-specs">
                ${specsHtml}
            </div>
            <div class="prop-extra">${prop.extra || ''}</div>
            <button class="btn btn--primary prop-btn-full" onclick="event.stopPropagation(); openPropertyModal('${prop.id}')">Детальніше</button>
        </div>
    </div>`;
}

async function fetchAndRenderProperties() {
    const grid = document.querySelector('.properties__grid');
    if (!grid) return;

    try {
        const { data: properties, error } = await supabaseClient
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (properties && properties.length > 0) {
            let htmlStr = '';
            window.propertiesMap.clear();
            properties.forEach((prop, index) => {
                window.propertiesMap.set(prop.id, prop);
                const delay = (index % 6) * 0.1;
                htmlStr += renderPropertyCard(prop, delay);
            });
            grid.innerHTML = htmlStr;
            // Trigger filters update
            document.dispatchEvent(new Event('propertiesLoaded'));
        }
    } catch (err) {
        console.error("Error fetching properties:", err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderProperties();

    // Modal logic
    const modal = document.getElementById('propertyModal');
    const closeBtn = document.getElementById('closeModalBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
});

window.openPropertyModal = function(id) {
    const prop = window.propertiesMap.get(id);
    if (!prop) {
        console.error("Property not found for id:", id);
        return;
    }

    document.getElementById('modalImage').src = prop.image || '';
    document.getElementById('modalTitle').textContent = prop.title || '';
    document.getElementById('modalPrice').textContent = prop.price || '';
    document.getElementById('modalAddress').textContent = prop.location || 'Невідома адреса';
    
    // Description: show loading if empty, though we will fetch it soon
    const descEl = document.getElementById('modalDesc');
    let desc = prop.description || '';
    descEl.innerHTML = (desc.trim() !== '') 
        ? desc.replace(/\n/g, '<br>').replace(/\\n/g, '<br>') 
        : 'Детальний опис ще не завантажено...';

    // Button: DOM.RIA
    const domriaBtn = document.getElementById('modalDomriaBtn');
    if (prop.domria_url) {
        domriaBtn.href = prop.domria_url;
        domriaBtn.style.display = 'inline-flex';
    } else {
        domriaBtn.style.display = 'none';
    }

    // Button: Realtor Call
    const callBtn = document.getElementById('modalCallBtn');
    const callBtnText = document.getElementById('modalCallBtnText');
    if (prop.realtor_phone) {
        callBtn.href = 'tel:' + prop.realtor_phone;
        callBtnText.textContent = prop.realtor_name ? `Подзвонити (${prop.realtor_name})` : 'Подзвонити рієлтору';
        callBtn.style.display = 'inline-flex';
    } else {
        // Fallback to agency phone if none specific
        callBtn.href = 'tel:+380688995435';
        callBtnText.textContent = 'Подзвонити рієлтору';
        callBtn.style.display = 'inline-flex';
    }

    document.getElementById('propertyModal').classList.add('active');
}
