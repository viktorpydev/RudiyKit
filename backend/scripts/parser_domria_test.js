const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');

// Supabase Setup
const supabaseUrl = 'https://qwunxhnjacfgvtsoflca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dW54aG5qYWNmZ3Z0c29mbGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTY0NjQsImV4cCI6MjA5ODAzMjQ2NH0.jGFZyCTnmkUzuqxpBcKSqDKq-oxDnfoK0npHBYQvTOM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function scrapeDomRia() {
    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set a normal user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    const agencyUrl = 'https://dom.ria.com/uk/agency-26983.html';
    console.log(`Navigating to ${agencyUrl}`);
    
    await page.goto(agencyUrl, { waitUntil: 'networkidle2' });
    
    // Attempt to gather property links
    // First let's check how many items we see initially
    let propertyLinks = await page.evaluate(() => {
        // DOM.RIA typically uses .ticket-item, .realty-item or similar, and links are usually inside them
        const links = Array.from(document.querySelectorAll('a.realty-link, .ticket-title a, a.realty-photo'));
        return links.map(a => a.href).filter(href => href && href.includes('/uk/'));
    });
    
    // Remove duplicates
    propertyLinks = [...new Set(propertyLinks)];
    
    console.log(`Found ${propertyLinks.length} links on the first page.`);
    if (propertyLinks.length > 0) {
        console.log(`Testing extraction on the first link: ${propertyLinks[0]}`);
        
        await page.goto(propertyLinks[0], { waitUntil: 'networkidle2' });
        
        const propertyData = await page.evaluate(async () => {
            const getText = (selector) => {
                const el = document.querySelector(selector);
                return el ? el.innerText.trim() : null;
            };

            // Trying common DOM.RIA selectors
            const title = getText('h1') || getText('.realty-title');
            const price = getText('.price') || getText('.box-panel-price') || getText('.size24 b');
            
            // Address
            let address = getText('.box-panel-city') || getText('.box-panel-address') || getText('.realty-city');
            
            // Description
            const description = getText('.box-panel-description') || getText('.realty-description') || getText('#description');
            
            // Image
            const imgEl = document.querySelector('.realty-photo img, .gallery-photo img, .swiper-slide img, #photoGallery img');
            const image = imgEl ? imgEl.src : null;
            
            // Characteristics (Area, Floor, etc)
            let area = null;
            let floor = null;
            const chars = Array.from(document.querySelectorAll('.box-panel-characteristics li, .realty-chars li, .characteristics-list li, .label-chars'));
            chars.forEach(el => {
                const text = el.innerText.toLowerCase();
                if (text.includes('площа') || text.includes('м²') || text.includes('кв.м')) {
                    area = el.innerText.trim();
                }
                if (text.includes('поверх')) {
                    floor = el.innerText.trim();
                }
            });

            // If we can't find phone, we simulate click if there's a button
            // But doing it inside evaluate is tricky, we'll just return what we have and click outside
            return { title, price, address, description, image, area, floor };
        });
        
        console.log("Extracted Data:", propertyData);
    }
    
    await browser.close();
}

scrapeDomRia().catch(console.error);
