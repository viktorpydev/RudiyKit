// Supabase Setup
const supabaseUrl = 'https://qwunxhnjacfgvtsoflca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dW54aG5qYWNmZ3Z0c29mbGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTY0NjQsImV4cCI6MjA5ODAzMjQ2NH0.jGFZyCTnmkUzuqxpBcKSqDKq-oxDnfoK0npHBYQvTOM';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

window.propertiesMap = new Map();
window.usdRate = null;

async function fetchUsdRate() {
    try {
        const res = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json');
        const data = await res.json();
        if (data && data.length > 0) {
            window.usdRate = data[0].rate;
        }
    } catch (e) {
        console.error('Failed to fetch NBU rate', e);
    }
}

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

    // Extract main USD price for card display
    let displayPrice = prop.price || '';
    const usdMatch = displayPrice.match(/([\d\s]+)\s*\$/);
    if (usdMatch) {
        displayPrice = `${usdMatch[1].trim()} $`;
    } else {
        displayPrice = displayPrice.split('·')[0].replace(/за об\'єкт/g, '').trim();
    }

    if (prop.category === 'rent' && displayPrice && !displayPrice.toLowerCase().includes('/міс')) {
        displayPrice += ' / міс.';
    }

    let phone = '';
    if (prop.specs && Array.isArray(prop.specs)) {
        const phoneSpec = prop.specs.find(s => s.icon && s.icon.includes('📞') || (s.text && String(s.text).includes('+38')));
        if (phoneSpec) phone = phoneSpec.text.replace(/[^\d\+]/g, '');
    }

    const domRiaUrl = prop.url ? prop.url : '#';

    return `
    <div class="property-card fade-in" style="transition-delay: ${delay}s;" data-category="${prop.category}" data-id="${prop.id}">
        <div class="property-card__image-wrapper" onclick="if('${domRiaUrl}' !== '#') window.open('${domRiaUrl}', '_blank')" style="cursor: pointer;">
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
            <h3 class="property-card__title" onclick="if('${domRiaUrl}' !== '#') window.open('${domRiaUrl}', '_blank')" style="cursor: pointer;">${prop.title}</h3>
            <div class="prop-price-row">
                <span class="prop-price">${displayPrice}</span>
                ${m2PriceHtml}
            </div>
            ${(prop.location && prop.location.trim() !== 'Невідома адреса') ? `<div class="prop-location"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${prop.location}</div>` : ''}
            <div class="prop-specs">
                ${specsHtml}
            </div>
            <div class="prop-extra">${prop.extra || ''}</div>
            
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 15px;">
                ${phone ? `<a href="tel:${phone}" class="btn btn--primary prop-btn-full" style="text-align: center; display: flex; justify-content: center; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    Подзвонити рієлтору
                </a>` : ''}
                <a href="${domRiaUrl}" target="_blank" class="btn btn--outline prop-btn-full" style="text-align: center;">
                    Перейти на DOM.RIA
                </a>
            </div>
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
                window.propertiesMap.set(String(prop.id), prop);
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
    fetchUsdRate();
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
    const prop = window.propertiesMap.get(String(id));
    if (!prop) {
        console.error("Property not found for id:", id);
        return;
    }

    document.getElementById('modalImage').src = prop.image || '';
    
    const modalBadges = document.getElementById('modalBadges');
    if (modalBadges) {
        let badgesHtml = '';
        if (prop.tag) {
            badgesHtml += `<span class="prop-tag" style="background-color: ${prop.tagcolor || 'var(--clr-primary)'};">${prop.tag}</span>`;
        }
        if (prop.typebadge) {
            badgesHtml += `<span class="prop-type-badge">${prop.typebadge}</span>`;
        }
        modalBadges.innerHTML = badgesHtml;
    }

    document.getElementById('modalTitle').textContent = prop.title || '';
    
    // Price Parsing
    let rawPrice = prop.price || '';
    // Format: "99 000 $ за об'єкт · 4 059 000 грн · 1 028 $ за м²"
    let usdMain = '';
    let sqMeter = '';
    
    // Extract main USD price
    const usdMatch = rawPrice.match(/([\d\s]+)\s*\$/);
    if (usdMatch) {
        usdMain = `${usdMatch[1].trim()} $`;
    } else {
        usdMain = rawPrice.split('·')[0].replace(/за об\'єкт/g, '').trim();
    }

    // Extract per sq meter if exists
    const sqMatch = rawPrice.match(/([\d\s]+\$)\s*за м²/);
    if (sqMatch) {
        sqMeter = `${sqMatch[1].trim()} за м²`;
    }

    let priceHtml = `<div>${usdMain}</div>`;
    
    // Calculate UAH using live rate
    let subPrices = [];
    if (window.usdRate && usdMain) {
        const usdValue = parseInt(usdMain.replace(/\D/g, ''), 10);
        if (!isNaN(usdValue)) {
            const uahValue = Math.round(usdValue * window.usdRate);
            subPrices.push(`${uahValue.toLocaleString('uk-UA')} грн`);
        }
    }
    if (sqMeter) subPrices.push(sqMeter);
    
    if (subPrices.length > 0) {
        priceHtml += `<div class="property-modal__price-sub">${subPrices.join(' &bull; ')}</div>`;
    }
    document.getElementById('modalPrice').innerHTML = priceHtml;
    
    document.getElementById('modalAddress').textContent = prop.location || 'Невідома адреса';
    
    // Handle Specs
    const modalSpecs = document.getElementById('modalSpecs');
    if (modalSpecs) {
        if (prop.specs && Array.isArray(prop.specs) && prop.specs.length > 0) {
            const filteredSpecs = prop.specs.filter(spec => spec.text && spec.text.trim().toLowerCase() !== 'не вказано');
            if (filteredSpecs.length > 0) {
                modalSpecs.innerHTML = filteredSpecs.map(spec => `
                    <div class="property-modal__spec-item">
                        ${spec.icon}
                        <span>${spec.text}</span>
                    </div>
                `).join('');
                modalSpecs.style.display = 'grid';
            } else {
                modalSpecs.style.display = 'none';
            }
        } else {
            modalSpecs.style.display = 'none';
        }
    }
    
    // Handle Extra
    const modalExtra = document.getElementById('modalExtra');
    if (modalExtra) {
        if (prop.extra) {
            // prop.extra is usually a string with tags or spans.
            modalExtra.innerHTML = prop.extra;
            modalExtra.style.display = 'flex';
        } else {
            modalExtra.style.display = 'none';
            modalExtra.innerHTML = '';
        }
    }
    
    // Handle Map
    const mapContainer = document.getElementById('modalMapContainer');
    if (mapContainer && prop.location) {
        mapContainer.innerHTML = `<iframe src="https://maps.google.com/maps?q=${encodeURIComponent(prop.location + ', Вінниця')}&t=&z=13&ie=UTF8&iwloc=&output=embed" frameborder="0" style="border:0; width:100%; height:250px; border-radius:12px; margin-top:1rem;" allowfullscreen></iframe>`;
    } else if (mapContainer) {
        mapContainer.innerHTML = '';
    }
    
    // Description and JSON extraction
    let descObj = null;
    let rawDesc = prop.description || '';
    if (rawDesc.trim().startsWith('{') && rawDesc.trim().endsWith('}')) {
        try {
            descObj = JSON.parse(rawDesc);
        } catch(e) {}
    }

    const charContainer = document.getElementById('modalCharacteristics');
    if (charContainer) {
        let charHtml = '';
        if (descObj) {
            if (descObj.area) charHtml += `<span style="display:inline-block; background:#f0f2f5; padding:6px 12px; border-radius:8px; font-weight:600; margin-right:8px; margin-bottom:8px; font-size:0.95rem;">📐 Площа: ${descObj.area}</span>`;
            if (descObj.floor) charHtml += `<span style="display:inline-block; background:#f0f2f5; padding:6px 12px; border-radius:8px; font-weight:600; margin-right:8px; margin-bottom:8px; font-size:0.95rem;">🏢 Поверх: ${descObj.floor}</span>`;
            if (descObj.year) charHtml += `<span style="display:inline-block; background:#f0f2f5; padding:6px 12px; border-radius:8px; font-weight:600; margin-right:8px; margin-bottom:8px; font-size:0.95rem;">📅 Рік забудови: ${descObj.year}</span>`;
        } else {
            // Fallback for old format
            let areaMatch = rawDesc.match(/(Загальна площа|Площа)[\s:]*([\d\.]+\s*м²?)/i);
            let floorMatch = rawDesc.match(/(Поверх)[\s:]*([\d]+(\s*(із|з)\s*[\d]+)?)/i);
            if (areaMatch) charHtml += `<span style="display:inline-block; background:#f0f2f5; padding:6px 12px; border-radius:8px; font-weight:600; margin-right:8px; margin-bottom:8px; font-size:0.95rem;">📐 Площа: ${areaMatch[2]}</span>`;
            if (floorMatch) charHtml += `<span style="display:inline-block; background:#f0f2f5; padding:6px 12px; border-radius:8px; font-weight:600; margin-right:8px; margin-bottom:8px; font-size:0.95rem;">🏢 Поверх: ${floorMatch[2]}</span>`;
        }
        charContainer.innerHTML = charHtml;
        charContainer.style.display = charHtml ? 'block' : 'none';
    }

    let finalDescHtml = '';
    if (descObj) {
        if (descObj.text) {
            finalDescHtml += `<div style="line-height:1.6; margin-bottom:20px;">${descObj.text.replace(/\n/g, '<br>')}</div>`;
        }
        if (descObj.infra && descObj.infra.length > 0) {
            finalDescHtml += `<h4 style="margin-bottom:12px; font-size:1.1rem;">📍 Інфраструктура поруч:</h4>`;
            finalDescHtml += `<ul style="list-style-type:none; padding-left:0; display:grid; grid-template-columns: 1fr 1fr; gap:10px;">`;
            descObj.infra.forEach(inf => {
                finalDescHtml += `<li style="background:#fff; padding:10px; border-radius:8px; border:1px solid #eee; font-size:0.9rem;">
                    <strong style="display:block; color:#333; margin-bottom:4px;">${inf.type}</strong>
                    ${inf.time ? `<span style="color:#777; font-size:0.85rem;">⏱ ${inf.time}</span>` : ''}
                </li>`;
            });
            finalDescHtml += `</ul>`;
        }
    } else {
        finalDescHtml = rawDesc.replace(/\n/g, '<br>');
    }

    document.getElementById('modalDesc').innerHTML = finalDescHtml || 'Детальний опис ще не завантажено...';

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
