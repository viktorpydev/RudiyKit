let currentProperties = [];

async function initAdmin(user) {
    document.getElementById('userInfo').textContent = user.email;
    await loadProperties();
}

async function loadProperties() {
    const tbody = document.getElementById('propertiesTableBody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Завантаження...</td></tr>';
    
    const { data, error } = await supabaseClient.from('properties')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Помилка завантаження: ${error.message}</td></tr>`;
        return;
    }

    currentProperties = data;
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('propertiesTableBody');
    tbody.innerHTML = '';

    if (currentProperties.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Об\'єктів поки немає</td></tr>';
        return;
    }

    currentProperties.forEach(prop => {
        const catText = prop.category === 'sale' ? 'Продаж' : 'Оренда';
        
        tbody.innerHTML += `
            <tr data-id="${prop.id}">
                <td style="text-align: center; cursor: grab; color: #9CA3AF;" class="drag-handle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="20" y2="8"></line><line x1="4" y1="16" x2="20" y2="16"></line></svg>
                </td>
                <td><img src="${prop.image || 'https://via.placeholder.com/60x40?text=No+Image'}" alt="Photo"></td>
                <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${prop.title}">${prop.title}</td>
                <td><span style="background: #E5E7EB; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${catText}</span></td>
                <td>${prop.price}</td>
                <td class="action-btns">
                    <button class="btn btn-outline" onclick="editProperty('${prop.id}')">Редагувати</button>
                    <button class="btn btn-danger" onclick="deleteProperty('${prop.id}')">Видалити</button>
                </td>
            </tr>
        `;
    });

    // Initialize SortableJS
    Sortable.create(tbody, {
        handle: '.drag-handle',
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: async function (evt) {
            const itemEl = evt.item;
            const newIndex = evt.newIndex;
            await updatePropertiesOrder();
        }
    });
}

async function updatePropertiesOrder() {
    const tbody = document.getElementById('propertiesTableBody');
    const rows = tbody.querySelectorAll('tr[data-id]');
    
    // Construct updates array
    const updates = Array.from(rows).map((row, index) => {
        return {
            id: row.getAttribute('data-id'),
            order_index: index
        };
    });

    // Supabase JS doesn't support bulk update natively in a single call easily without a custom RPC function, 
    // so we can loop or use upsert. Upsert works if we provide the full row or if we just want to update existing.
    // However, for safety and simplicity with fewer rows, a loop is fine.
    
    // Visual feedback
    document.body.style.cursor = 'wait';
    try {
        for (const update of updates) {
            await supabaseClient.from('properties')
                .update({ order_index: update.order_index })
                .eq('id', update.id);
        }
    } catch (e) {
        console.error('Failed to update order', e);
        alert('Помилка при збереженні порядку: ' + e.message);
    } finally {
        document.body.style.cursor = 'default';
        // Reload to sync currentProperties array
        await loadProperties();
    }
}

function openModal() {
    document.getElementById('propertyForm').reset();
    document.getElementById('propId').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('propImageUrl').value = '';
    document.getElementById('modalTitle').textContent = 'Додати новий об\'єкт';
    document.getElementById('domriaImportUrl').value = '';
    document.getElementById('propertyModal').classList.add('active');
}

function closeModal() {
    document.getElementById('propertyModal').classList.remove('active');
}

function editProperty(id) {
    const prop = currentProperties.find(p => p.id === id);
    if (!prop) return;

    openModal();
    document.getElementById('modalTitle').textContent = 'Редагувати об\'єкт';
    
    document.getElementById('propId').value = prop.id;
    document.getElementById('propTitle').value = prop.title || '';
    document.getElementById('propCategory').value = prop.category || 'sale';
    document.getElementById('propPrice').value = prop.price || '';
    document.getElementById('propLocation').value = prop.location || '';
    document.getElementById('propDomriaUrl').value = prop.domria_url || prop.url || '';
    document.getElementById('propPricePerM2').value = prop.priceperm2 || '';
    
    document.getElementById('propSpecs').value = JSON.stringify(prop.specs || [], null, 2);
    document.getElementById('propDescription').value = typeof prop.description === 'string' ? prop.description : JSON.stringify(prop.description || {}, null, 2);
    
    if (prop.image) {
        document.getElementById('imagePreview').src = prop.image;
        document.getElementById('imagePreview').style.display = 'block';
        document.getElementById('propImageUrl').value = prop.image;
    }
}

async function deleteProperty(id) {
    if (!confirm('Ви впевнені, що хочете видалити цей об\'єкт? Цю дію неможливо скасувати.')) return;

    const { error } = await supabaseClient.from('properties').delete().eq('id', id);
    if (error) {
        alert('Помилка видалення: ' + error.message);
    } else {
        await loadProperties();
    }
}

async function previewImage(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imagePreview').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}

async function uploadImageFile(file) {
    const fileName = 'img_' + Date.now() + '_' + Math.random().toString(36).substring(7) + '.jpg';
    
    const { data, error } = await supabaseClient.storage
        .from('property_images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });
        
    if (error) throw error;
    
    const { data: publicUrlData } = supabaseClient.storage
        .from('property_images')
        .getPublicUrl(fileName);
        
    return publicUrlData.publicUrl;
}

async function saveProperty(e) {
    e.preventDefault();
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Збереження...';

    try {
        let imageUrl = document.getElementById('propImageUrl').value;
        const fileInput = document.getElementById('propImageFile');
        
        if (fileInput.files.length > 0) {
            imageUrl = await uploadImageFile(fileInput.files[0]);
        }

        const id = document.getElementById('propId').value;
        
        let specs = [];
        let description = {};
        
        try {
            specs = JSON.parse(document.getElementById('propSpecs').value);
        } catch(e) { throw new Error('Помилка в Характеристиках JSON'); }
        
        try {
            // Keep description as string in DB since frontend parses it
            description = document.getElementById('propDescription').value;
            JSON.parse(description); // validate JSON
        } catch(e) { throw new Error('Помилка в Описі JSON'); }

        const payload = {
            title: document.getElementById('propTitle').value,
            category: document.getElementById('propCategory').value,
            price: document.getElementById('propPrice').value,
            location: document.getElementById('propLocation').value,
            domria_url: document.getElementById('propDomriaUrl').value,
            priceperm2: document.getElementById('propPricePerM2').value,
            image: imageUrl,
            specs: specs,
            description: description,
            tag: 'Нове',
            tagcolor: '#ef4444',
            typebadge: 'Нерухомість'
        };

        if (id) {
            // Update
            const { error } = await supabaseClient.from('properties').update(payload).eq('id', id);
            if (error) throw error;
        } else {
            // Insert
            const { error } = await supabaseClient.from('properties').insert([payload]);
            if (error) throw error;
        }

        closeModal();
        await loadProperties();
    } catch (error) {
        alert(error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Зберегти об\'єкт';
    }
}

// DOM.RIA Import
async function importFromDomRia() {
    const urlInput = document.getElementById('domriaImportUrl').value.trim();
    if (!urlInput || !urlInput.includes('dom.ria.com')) {
        alert('Будь ласка, вставте коректне посилання на об\'єкт DOM.RIA');
        return;
    }

    const btn = document.getElementById('importBtn');
    btn.disabled = true;
    btn.textContent = 'Імпортування...';

    try {
        // Use allOrigins as a CORS proxy to fetch HTML
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(urlInput)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error('Помилка мережі при завантаженні');
        const data = await response.json();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');

        // Extract Title
        let title = '';
        const h1 = doc.querySelector('h1.name, h1');
        if (h1) title = h1.textContent.replace(/\s+/g, ' ').trim();
        if (title) document.getElementById('propTitle').value = title;

        // Extract Price
        let priceText = '';
        const priceUah = doc.querySelector('.price.size24 b, .price b');
        const priceUsd = doc.querySelector('.price.size14, .price-usd');
        if (priceUah) {
            priceText = priceUah.textContent.replace(/\\s+/g, ' ').trim();
            if (priceUsd) priceText += ' · ' + priceUsd.textContent.replace(/\\s+/g, ' ').trim();
            document.getElementById('propPrice').value = priceText;
        }

        // Category inferred from URL
        if (urlInput.includes('arenda')) {
            document.getElementById('propCategory').value = 'rent';
        } else {
            document.getElementById('propCategory').value = 'sale';
        }

        document.getElementById('propDomriaUrl').value = urlInput;

        // Try extract image
        const img = doc.querySelector('img[src*="cdn.riastatic.com/photosnew/dom/photo/"]');
        if (img) {
            const bigImg = img.src.replace('m.jpg', 'xl.jpg').replace('s.jpg', 'xl.jpg');
            document.getElementById('imagePreview').src = bigImg;
            document.getElementById('imagePreview').style.display = 'block';
            document.getElementById('propImageUrl').value = bigImg;
        }

        // We can set default JSON specs
        document.getElementById('propSpecs').value = JSON.stringify([
            {"icon": "🔲", "text": "Площа уточнюється"},
            {"icon": "🏢", "text": "Поверх уточнюється"}
        ], null, 2);

        alert('Дані імпортовано! Будь ласка, перевірте їх і завантажте фото на сервер (якщо потрібно) при збереженні.');
    } catch (error) {
        alert('Помилка імпорту: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Імпортувати дані';
    }
}
