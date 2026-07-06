const { createClient } = require('@supabase/supabase-js');
const cheerio = require('cheerio');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabase = createClient(
    'https://qwunxhnjacfgvtsoflca.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dW54aG5qYWNmZ3Z0c29mbGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTY0NjQsImV4cCI6MjA5ODAzMjQ2NH0.jGFZyCTnmkUzuqxpBcKSqDKq-oxDnfoK0npHBYQvTOM'
);

(async () => {
    const { data: properties, error } = await supabase
        .from('properties')
        .select('id, description')
        .not('description', 'is', null);

    if (error) {
        console.error(error);
        return;
    }

    let updatedCount = 0;

    for (const prop of properties) {
        let html = prop.description;
        if (!html) continue;
        
        // Skip if already converted to JSON
        if (html.trim().startsWith('{') && html.trim().endsWith('}')) continue;

        try {
            const $ = cheerio.load(html);
            
            const details = {
                text: '',
                area: '',
                floor: '',
                year: '',
                infra: []
            };

            // It might just be raw text if my older scraper ran, or HTML if the stealth scraper ran.
            // Let's extract text first.
            let textBlock = html;
            
            // If it contains HTML, extract cleanly
            if (html.includes('</div>')) {
                // Remove the "seller-sidebar" and "page-review" junk
                $('.seller-sidebar, .page-review, .button-dotted, svg, img').remove();
                
                // Get the main text before any <ul class="realty-info">
                let mainDesc = '';
                
                // Try to find raw text nodes or paragraphs
                $('div, p, span, li').each((i, el) => {
                    const t = $(el).text().trim();
                    if (t.includes('Загальна площа')) {
                        details.area = t.replace('Загальна площа', '').trim().split('·')[0].trim();
                    }
                    if (t.includes('Поверх')) {
                        details.floor = t.replace('Поверх:', '').replace('Поверх', '').trim();
                    }
                    if (t.includes('Рік побудови') || t.includes('Рік забудови')) {
                        details.year = t.replace(/Рік (побудови|забудови):?/, '').trim();
                    }
                });

                // Extract infrastructure items
                $('.infrastructure-item, .item').each((i, el) => {
                    let type = $(el).find('.title, b, strong').text().trim();
                    let time = $(el).find('.distance, .time').text().trim();
                    if (!type) {
                        // Fallback
                        type = $(el).text().replace(/\n/g, ' ').trim();
                    }
                    if (type && type.length < 50) {
                        details.infra.push({ type, time });
                    }
                });
                
                // Clean the text block by just extracting the first large chunk of text that isn't UI junk
                const cleanText = $.text().replace(/\s\s+/g, '\n').trim();
                // We'll just extract the first 3-5 sentences before it starts talking about "Характеристика приміщення"
                let cleanedLines = [];
                for(const line of cleanText.split('\n')) {
                    if (line.includes('UA, Вінницька') || line.includes('Оголошення створене') || line.includes('ID ') || line.includes('Переглядів') || line.includes('Характеристика приміщення') || line.includes('Загальна площа') || line.includes('Написати відгук')) {
                        break; // End of actual description
                    }
                    if (line.trim().length > 10) {
                        cleanedLines.push(line.trim());
                    }
                }
                details.text = cleanedLines.join('\n\n');
            } else {
                // It's just plain text from the older scraper
                const mArea = html.match(/(Загальна площа|Площа)[\s:]*([\d\.]+\s*м²?)/i);
                if (mArea) details.area = mArea[2];
                const mFloor = html.match(/(Поверх)[\s:]*([\d]+(\s*(із|з)\s*[\d]+)?)/i);
                if (mFloor) details.floor = mFloor[2];
                
                details.text = html.replace(/📍 \*\*Інфраструктура:\*\*[\s\S]*/, '').replace(/🏠 \*\*Основні характеристики:\*\*[\s\S]*/, '').trim();
            }

            // Clean up infra array to remove duplicates or garbage
            const uniqueInfra = [];
            const seen = new Set();
            for(const i of details.infra) {
                if (i.type && !seen.has(i.type)) {
                    seen.add(i.type);
                    uniqueInfra.push(i);
                }
            }
            details.infra = uniqueInfra;

            // Update DB
            const { error: updErr } = await supabase
                .from('properties')
                .update({ description: JSON.stringify(details) })
                .eq('id', prop.id);
                
            if (!updErr) updatedCount++;
        } catch(e) {
            console.error('Error on id', prop.id, e);
        }
    }
    
    console.log(`Cleaned and converted ${updatedCount} properties to JSON.`);
})();
