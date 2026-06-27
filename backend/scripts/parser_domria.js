const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

// Supabase Setup
const supabaseUrl = 'https://qwunxhnjacfgvtsoflca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dW54aG5qYWNmZ3Z0c29mbGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTY0NjQsImV4cCI6MjA5ODAzMjQ2NH0.jGFZyCTnmkUzuqxpBcKSqDKq-oxDnfoK0npHBYQvTOM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight - window.innerHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

async function scrapeDomRia() {
    console.log("Connecting to Supabase and clearing properties table...");
    // The policy allows public delete using (true), so this should work
    const { error: deleteError } = await supabase.from('properties').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteError) {
        console.error("Error clearing table:", deleteError);
    } else {
        console.log("Table cleared successfully.");
    }

    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    let allLinks = new Set();
    let currentPage = 1;
    let hasMore = true;

    const agencyUrl = 'https://dom.ria.com/uk/agency-26983.html';
    console.log(`Navigating to ${agencyUrl}`);
    await page.goto(agencyUrl, { waitUntil: 'networkidle2' });

    while (hasMore) {
        console.log(`Extracting links from page ${currentPage}...`);
        await autoScroll(page);
        
        // Extract links
        const links = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a'));
            return anchors
                .map(a => a.href)
                .filter(href => href && href.includes('/uk/realty-') && !href.includes('agency'));
        });

        const initialCount = allLinks.size;
        links.forEach(l => allLinks.add(l));
        
        if (allLinks.size === initialCount || currentPage > 15) {
            console.log(`No new links on page ${currentPage}. Stopping pagination.`);
            hasMore = false;
        } else {
            console.log(`Found ${allLinks.size} unique links so far...`);
            
            // Try to click the next button
            const nextBtn = await page.$('.page-item.next a:not(.disabled), .page-item.next:not(.disabled) a');
            if (nextBtn) {
                console.log('Clicking next page...');
                await nextBtn.click();
                await new Promise(r => setTimeout(r, 2000)); // wait for page to load
                currentPage++;
            } else {
                console.log('No next button found, stopping.');
                hasMore = false;
            }
        }
    }

    const propertyLinks = Array.from(allLinks);
    console.log(`Total properties found: ${propertyLinks.length}`);

    // Let's scrape each property
    for (let i = 0; i < propertyLinks.length; i++) {
        const link = propertyLinks[i];
        console.log(`[${i+1}/${propertyLinks.length}] Scraping: ${link}`);
        
        try {
            await page.goto(link, { waitUntil: 'networkidle2' });

            // Click the show phone button if it exists to reveal the phone number
            try {
                // DOM.RIA usually has .phones-btn or similar for phone
                const phoneBtnSelector = '.phones-item .show-phone, .phone-btn, .seller-phone .button';
                const hasBtn = await page.$(phoneBtnSelector);
                if (hasBtn) {
                    await page.click(phoneBtnSelector);
                    await new Promise(r => setTimeout(r, 1000)); // Wait for the phone number to appear
                }
            } catch (e) {
                // Ignore if button not found or can't be clicked
            }

            const propertyData = await page.evaluate(() => {
                const getText = (selector) => {
                    const el = document.querySelector(selector);
                    return el ? el.innerText.trim().replace(/\s+/g, ' ') : null;
                };

                const title = getText('h1') || getText('.realty-title') || 'Невідомий об\'єкт';
                let price = getText('.price') || getText('.box-panel-price') || getText('.size24 b');
                if (!price) price = 'Ціна договірна';

                let address = getText('.box-panel-city') || getText('.box-panel-address') || getText('.realty-city') || getText('.city');
                if (!address) address = 'Невідома адреса';
                
                let description = getText('.box-panel-description') || getText('.realty-description') || getText('#description');
                if (description) {
                    // Limit description to reasonable size to prevent huge UI blobs
                    if (description.length > 500) {
                        description = description.substring(0, 497) + '...';
                    }
                } else {
                    description = '';
                }

                const imgEl = document.querySelector('.realty-photo img, .gallery-photo img, .swiper-slide img, #photoGallery img');
                let image = imgEl ? imgEl.src : 'assets/images/placeholder.jpg';

                // Try to get area and floor
                let area = null;
                let floor = null;
                let rooms = null;
                const chars = Array.from(document.querySelectorAll('.box-panel-characteristics li, .realty-chars li, .characteristics-list li, .label-chars'));
                chars.forEach(el => {
                    const text = el.innerText.toLowerCase();
                    if (text.includes('площа') || text.includes('м²') || text.includes('кв.м')) {
                        area = el.innerText.trim();
                    }
                    if (text.includes('поверх')) {
                        floor = el.innerText.trim();
                    }
                    if (text.includes('кімнат')) {
                        rooms = el.innerText.trim();
                    }
                });

                let phone = getText('.phones-item .phone, .seller-phone, .phone-number');
                if (!phone) phone = 'Не вказано';

                return { title, price, address, description, image, area, floor, rooms, phone };
            });

            console.log(`  -> ${propertyData.title} | ${propertyData.price} | Phone: ${propertyData.phone}`);

            // Prepare for Supabase
            let category = 'sale';
            if (propertyData.title.toLowerCase().includes('оренд') || propertyData.title.toLowerCase().includes('здам')) category = 'rent';
            
            let typeBadge = 'Нерухомість';
            if (propertyData.title.toLowerCase().includes('квартир')) typeBadge = category === 'rent' ? 'Оренда квартири' : 'Продаж квартири';
            if (propertyData.title.toLowerCase().includes('будин')) typeBadge = category === 'rent' ? 'Оренда будинку' : 'Продаж будинку';
            if (propertyData.title.toLowerCase().includes('ділянк')) typeBadge = 'Продаж ділянки';

            const specs = [];
            if (propertyData.rooms) specs.push({ icon: '🛏️', text: propertyData.rooms });
            if (propertyData.area) specs.push({ icon: '📏', text: propertyData.area });
            if (propertyData.floor) specs.push({ icon: '🏢', text: propertyData.floor });
            if (propertyData.phone) specs.push({ icon: '📞', text: propertyData.phone });

            const dbRow = {
                category: category,
                image: propertyData.image,
                tag: 'Нове',
                tagcolor: '#ef4444',
                typebadge: typeBadge,
                title: propertyData.title,
                location: propertyData.address,
                price: propertyData.price,
                priceperm2: null,
                specs: specs,
                extra: propertyData.description
            };

            const { error: insertError } = await supabase.from('properties').insert(dbRow);
            if (insertError) {
                console.error(`  -> Supabase Error:`, insertError);
            }
            
            // Sleep slightly to avoid rate limit
            await new Promise(r => setTimeout(r, 1000));
            
        } catch (err) {
            console.error(`  -> Error scraping ${link}:`, err.message);
        }
    }

    console.log("Scraping finished!");
    await browser.close();
}

scrapeDomRia().catch(console.error);
