const { createClient } = require('@supabase/supabase-js');

// Ignore SSL errors for local node execution
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabaseUrl = 'https://qwunxhnjacfgvtsoflca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dW54aG5qYWNmZ3Z0c29mbGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTY0NjQsImV4cCI6MjA5ODAzMjQ2NH0.jGFZyCTnmkUzuqxpBcKSqDKq-oxDnfoK0npHBYQvTOM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function normalizeDatabase() {
    console.log("Fetching properties...");
    const { data: properties, error } = await supabase.from('properties').select('*');
    
    if (error) {
        console.error("Error fetching properties:", error);
        return;
    }

    console.log(`Found ${properties.length} properties to process.`);

    for (let prop of properties) {
        let title = prop.title || '';
        let rawPrice = prop.price || '';
        let location = prop.location || '';
        let specs = prop.specs || [];

        // 1. Parse Title
        let cleanTitle = title.split(' • ID')[0].trim();
        
        // Extract Area
        let areaMatch = cleanTitle.match(/(\d+(?:\.\d+)?)\s*кв\.?\s*м/i);
        let area = areaMatch ? areaMatch[1] : '';
        
        // Extract Address
        let addressMatch = cleanTitle.match(/(?:на\s+)?(вул\.|вулиця|провулок|просп\.|проспект|шосе)\s+([^,•]+)/i);
        let addressFromTitle = addressMatch ? (addressMatch[1] + ' ' + addressMatch[2]).trim() : '';

        // Clean up Title
        cleanTitle = cleanTitle
            .replace(/(\d+(?:\.\d+)?)\s*кв\.?\s*м/ig, '')
            .replace(/(?:на\s+)?(вул\.|вулиця|провулок|просп\.|проспект|шосе)\s+([^,•]+)/ig, '')
            .replace(/,\s*площа\s*$/i, '')
            .replace(/\s+/g, ' ')
            .replace(/,\s*$/, '')
            .trim();

        // 2. Parse Price
        let mainPriceMatch = rawPrice.match(/^([\d\s]+(?:[$€]|грн))/i);
        let mainPrice = mainPriceMatch ? mainPriceMatch[1].trim() : rawPrice;
        
        let priceM2Match = rawPrice.match(/([\d\s]+[$€]?)\s*за\s*м²/i);
        let priceM2 = priceM2Match ? priceM2Match[1].trim() + ' за м²' : null;

        // 3. Update fields
        let newLocation = location;
        if ((location === 'Невідома адреса' || !location) && addressFromTitle) {
            newLocation = addressFromTitle;
        }

        // Check if area is already in specs
        let hasArea = specs.some(s => s.icon === '📏');
        if (!hasArea && area) {
            // Add area spec at the beginning
            specs.unshift({ icon: '📏', text: area + ' м²' });
        }

        const updateData = {
            title: cleanTitle,
            location: newLocation,
            price: mainPrice,
            priceperm2: priceM2,
            specs: specs
        };

        // Output some logs
        console.log(`Updating ID ${prop.id}...`);
        console.log(`  Old Title: ${prop.title}`);
        console.log(`  New Title: ${updateData.title}`);
        console.log(`  New Price: ${updateData.price} | ${updateData.priceperm2}`);
        console.log(`  New Location: ${updateData.location}`);

        const { error: updateError } = await supabase
            .from('properties')
            .update(updateData)
            .eq('id', prop.id);
            
        if (updateError) {
            console.error(`Failed to update ${prop.id}:`, updateError);
        }
    }
    
    console.log("Done normalizing database.");
}

normalizeDatabase();
