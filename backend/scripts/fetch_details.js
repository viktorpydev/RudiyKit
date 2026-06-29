const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Supabase client setup
const supabaseUrl = 'https://qwunxhnjacfgvtsoflca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dW54aG5qYWNmZ3Z0c29mbGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTY0NjQsImV4cCI6MjA5ODAzMjQ2NH0.jGFZyCTnmkUzuqxpBcKSqDKq-oxDnfoK0npHBYQvTOM';
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://dom.ria.com/uk/agency-26983.html';

// Realtor mapping
const REALTORS = {
    '12885833': '0972804430',
    '16697589': '0976129437',
    '16900990': '0688995435',
    '16192868': '0674957684',
    '11081104': '0687534049',
    '4843931':  '0636283204',
    '16090824': '0954393811'
};

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 200;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 80);
        });
    });
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchDetails() {
    console.log('Fetching existing properties from DB...');
    const { data: dbProps, error: dbError } = await supabase.from('properties').select('id, title, price, description, domria_url, realtor_phone');
    if (dbError) throw dbError;
    console.log(`Found ${dbProps.length} properties in DB.`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Opening agency catalog...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const allPropertyUrls = new Set();

    let hasNextPage = true;
    let pageNum = 1;

    // Collect all URLs first
    while (hasNextPage) {
        console.log(`\n--- Collecting URLs from Catalog Page ${pageNum} ---`);
        await autoScroll(page);
        await delay(1000);

        const urls = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a'));
            return anchors
                .map(a => a.href)
                .filter(href => href && href.includes('/uk/realty-') && !href.includes('agency'));
        });

        urls.forEach(u => allPropertyUrls.add(u));
        console.log(`Collected ${urls.length} URLs. Total unique: ${allPropertyUrls.size}`);

        const nextBtn = await page.$('.page-item.next a:not(.disabled), .page-item.next:not(.disabled) a');
        if (nextBtn) {
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {}),
                nextBtn.click()
            ]);
            pageNum++;
        } else {
            hasNextPage = false;
        }
    }

    const urlArray = Array.from(allPropertyUrls);
    console.log(`\nFound ${urlArray.length} property pages. Extracting details...`);

    let updatedCount = 0;
    let missingCount = 0;

    for (let i = 0; i < urlArray.length; i++) {
        const targetUrl = urlArray[i];
        console.log(`[${i + 1}/${urlArray.length}] Visiting: ${targetUrl}`);

        try {
            await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
            
            const propData = await page.evaluate(() => {
                const titleNode = document.querySelector('h1');
                const priceNode = document.querySelector('.price');
                
                // Description can be in various places
                let descNode = document.querySelector('#description .text');
                if (!descNode) descNode = document.querySelector('#description');
                if (!descNode) descNode = document.querySelector('.description-text');
                if (!descNode) descNode = document.querySelector('.mb-20.text-b');
                if (!descNode) descNode = document.querySelector('.text-b');
                
                const realtorLink = document.querySelector('a[href*="/realtor-"]');
                
                let realtorId = null;
                let realtorName = null;
                
                if (realtorLink) {
                    const m = realtorLink.href.match(/realtor-(\d+)\.html/);
                    if (m) realtorId = m[1];
                    realtorName = realtorLink.textContent.trim();
                }

                return {
                    title: titleNode ? titleNode.innerText.trim() : '',
                    price: priceNode ? priceNode.innerText.trim() : '',
                    description: descNode ? descNode.innerText.trim() : '',
                    realtorId,
                    realtorName
                };
            });

            if (!propData.title) {
                console.log('  No title found, skipping.');
                continue;
            }

            // Price matching logic
            function extractPrices(str) {
                const prices = new Set();
                const mUsd = (str || '').match(/([\d\s]+)\s*\$/);
                if (mUsd) prices.add(parseInt(mUsd[1].replace(/\s/g, ''), 10));
                const mUah = (str || '').match(/([\d\s]+)\s*грн/);
                if (mUah) prices.add(parseInt(mUah[1].replace(/\s/g, ''), 10));
                const fallback = parseInt((str || '').replace(/\D/g, ''), 10);
                if (!isNaN(fallback) && prices.size === 0) prices.add(fallback);
                return prices;
            }
            function pricesMatch(pricesA, pricesB) {
                for (let a of pricesA) if (pricesB.has(a)) return true;
                return false;
            }

            const scrapedPrices = extractPrices(propData.price);
            let bestMatch = null;

            // Strategy 1: Title word overlap + Price
            for (const dbProp of dbProps) {
                if (dbProp.domria_url) continue; // Already updated

                const dbPrices = extractPrices(dbProp.price);
                if (scrapedPrices.size === 0 || dbPrices.size === 0 || !pricesMatch(scrapedPrices, dbPrices)) continue;

                const scrapedWords = propData.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
                const dbWords = dbProp.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
                const overlap = scrapedWords.filter(w => dbWords.includes(w));

                if (overlap.length >= 2) {
                    bestMatch = dbProp;
                    break;
                }
            }

            // Strategy 2: Unique Price Match
            if (!bestMatch && scrapedPrices.size > 0) {
                const priceMatches = dbProps.filter(p => {
                    if (p.domria_url) return false;
                    const dbP = extractPrices(p.price);
                    return pricesMatch(scrapedPrices, dbP);
                });
                if (priceMatches.length === 1) {
                    bestMatch = priceMatches[0];
                }
            }

            if (bestMatch) {
                console.log(`  Matched DB Object: "${bestMatch.title}"`);
                
                const mappedPhone = propData.realtorId && REALTORS[propData.realtorId] 
                               ? REALTORS[propData.realtorId] 
                               : '';
                const priceStr = propData.price;

                const { error: updateErr } = await supabase.from('properties').update({
                    price: priceStr,
                    description: propData.description,
                    domria_url: targetUrl,
                    realtor_name: propData.realtorName,
                    realtor_phone: mappedPhone
                }).eq('id', bestMatch.id);

                if (updateErr) {
                    console.error('  Update error:', updateErr.message);
                } else {
                    console.log(`  ✅ Updated! Realtor: ${propData.realtorName} - ${mappedPhone}`);
                    bestMatch.domria_url = targetUrl; // prevent matching again
                    updatedCount++;
                }
            } else {
                console.log(`  No DB match: "${propData.title}" | ${propData.price}`);
                missingCount++;
            }

        } catch (err) {
            console.error(`  Error processing page: ${err.message}`);
        }
    }

    console.log(`\n========================================`);
    console.log(`Done! ✅ ${updatedCount} | ❌ ${missingCount}`);
    console.log(`========================================`);

    await browser.close();
}

fetchDetails().catch(console.error);
