const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Initialize Supabase
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

(async () => {
    console.log("Fetching existing properties from DB...");
    const { data: properties, error } = await supabase.from('properties').select('id, title, price, url');
    if (error) {
        console.error("Error fetching properties:", error);
        return;
    }
    console.log(`Found ${properties.length} properties in DB.`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

        console.log("Opening agency catalog to fetch URLs...");
        let currentPage = 1;
        let hasNextPage = true;
        const allScrapedLinks = [];

        while (hasNextPage && currentPage <= 10) {
            console.log(`\n--- Collecting URLs from Catalog Page ${currentPage} ---`);
            const catalogUrl = `https://dom.ria.com/uk/agency-26983.html?page=${currentPage}`;
            await page.goto(catalogUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
            
            await autoScroll(page);
            const urlsOnPage = await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('a'));
                return anchors
                    .map(a => a.href)
                    .filter(href => href && href.includes('/uk/realty-') && !href.includes('agency'));
            });
            
            if (urlsOnPage.length === 0) {
                hasNextPage = false;
                break;
            }

            for (const link of urlsOnPage) {
                if (!allScrapedLinks.includes(link)) {
                    allScrapedLinks.push(link);
                }
            }

            console.log(`Collected ${urlsOnPage.length} URLs. Total unique: ${allScrapedLinks.length}`);
            
            const nextBtn = await page.$('.page-item.next:not(.disabled)');
            if (nextBtn) {
                currentPage++;
                await new Promise(r => setTimeout(r, 1000));
            } else {
                hasNextPage = false;
            }
        }

        console.log(`\nTotal URLs to match: ${allScrapedLinks.length}`);

        let matched = 0;
        
        for (let i = 0; i < allScrapedLinks.length; i++) {
            const link = allScrapedLinks[i];
            
            await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });
            
            // Wait for DOM to settle, title might be lazy-loaded or blocked by cookie banner
            const title = await page.$eval('h1.name, h1', el => el.innerText.trim()).catch(() => '');
            
            if (!title) {
                console.log(`Failed to extract title for ${link}`);
                continue;
            }

            // Clean title similarly to how parser_domria cleans it if needed
            let cleanTitle = title.replace(/\s+/g, ' ').trim();
            
            // Find matching property in DB by title
            const matchedProp = properties.find(p => p.title.replace(/\s+/g, ' ').toLowerCase() === cleanTitle.toLowerCase() || cleanTitle.toLowerCase().includes(p.title.replace(/\s+/g, ' ').toLowerCase()));
            
            if (matchedProp) {
                console.log(`Matched! Updating DB for: ${title}`);
                const { error: updateError } = await supabase
                    .from('properties')
                    .update({ url: link })
                    .eq('id', matchedProp.id);
                
                if (!updateError) matched++;
            }
            
            await new Promise(r => setTimeout(r, 500));
        }

        console.log(`\nDone! Successfully synchronized ${matched} URLs into the database.`);

    } catch (err) {
        console.error("Global Error:", err);
    } finally {
        await browser.close();
    }
})();
