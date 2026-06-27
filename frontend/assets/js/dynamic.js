// Supabase Setup
const supabaseUrl = 'https://qwunxhnjacfgvtsoflca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dW54aG5qYWNmZ3Z0c29mbGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTY0NjQsImV4cCI6MjA5ODAzMjQ2NH0.jGFZyCTnmkUzuqxpBcKSqDKq-oxDnfoK0npHBYQvTOM';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

function renderPropertyCard(prop, delay) {
    let specsHtml = '';
    if (prop.specs && Array.isArray(prop.specs)) {
        specsHtml = prop.specs.map(spec => `<span>${spec.icon} ${spec.text}</span>`).join('');
    }
    const tagHtml = prop.tag ? `<span class="prop-tag" style="background-color: ${prop.tagColor || 'var(--clr-primary)'};">${prop.tag}</span>` : '';
    
    // We get priceperm2 from db
    const m2PriceHtml = prop.priceperm2 ? `<span class="prop-price-m2">${prop.priceperm2}</span>` : '';

    return `
    <div class="property-card fade-in" style="transition-delay: ${delay}s;" data-category="${prop.category}">
        <div class="property-card__image-wrapper">
            <img src="${prop.image}" alt="${prop.title}" class="property-card__image">
            <div class="prop-badges-top">
                ${tagHtml}
                <span class="prop-type-badge">${prop.typeBadge}</span>
            </div>
            <button class="prop-fav-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
        </div>
        <div class="property-card__content">
            <div class="prop-price-row">
                <span class="prop-price">${prop.price}</span>
                ${m2PriceHtml}
            </div>
            <h3 class="property-card__title">${prop.title}</h3>
            <div class="prop-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${prop.location}</div>
            <div class="prop-specs">
                ${specsHtml}
            </div>
            <div class="prop-extra">${prop.extra || ''}</div>
            <button class="btn btn--primary prop-btn-full" onclick="window.location.href='catalog.html'">Детальніше</button>
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
            grid.innerHTML = ''; // Clear static content
            properties.forEach((prop, index) => {
                const delay = (index % 6) * 0.1;
                grid.innerHTML += renderPropertyCard(prop, delay);
            });
            // Trigger filters update
            document.dispatchEvent(new Event('propertiesLoaded'));
        }
    } catch (err) {
        console.error("Error fetching properties:", err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderProperties();
});
