const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabaseUrl = 'https://qwunxhnjacfgvtsoflca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dW54aG5qYWNmZ3Z0c29mbGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTY0NjQsImV4cCI6MjA5ODAzMjQ2NH0.jGFZyCTnmkUzuqxpBcKSqDKq-oxDnfoK0npHBYQvTOM';
const supabase = createClient(supabaseUrl, supabaseKey);

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function downloadImage(url) {
    return new Promise((resolve) => {
        const proto = url.startsWith('https') ? https : require('http');
        proto.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return downloadImage(res.headers.location).then(resolve);
            }
            if (res.statusCode !== 200) { resolve(null); return; }
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', () => resolve(null));
        }).on('error', () => resolve(null));
    });
}

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

async function main() {
    // 1. Fetch all DB properties
    console.log('=== Fetching DB properties ===');
    const { data: dbProps, error } = await supabase.from('properties').select('*');
    if (error) { console.error('DB error:', error); return; }
    console.log(`Found ${dbProps.length} properties in DB\n`);

    // 2. Launch puppeteer
    console.log('=== Launching Puppeteer ===');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    // 3. Collect all property links from agency catalog (Vue SPA - use click navigation)
    console.log('=== Collecting property links from catalog ===');
    const agencyUrl = 'https://dom.ria.com/uk/agency-26983.html';
    await page.goto(agencyUrl, { waitUntil: 'networkidle2' });

    let allLinks = new Set();
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
        console.log(`Extracting links from page ${currentPage}...`);
        await autoScroll(page);
        await delay(1000);

        const links = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a'));
            return anchors
                .map(a => a.href)
                .filter(href => href && href.includes('/uk/realty-') && !href.includes('agency'));
        });

        const initialCount = allLinks.size;
        links.forEach(l => allLinks.add(l));

        if (allLinks.size === initialCount || currentPage > 15) {
            console.log(`No new links on page ${currentPage}. Stopping.`);
            hasMore = false;
        } else {
            console.log(`Found ${allLinks.size} unique links so far...`);
            const nextBtn = await page.$('.page-item.next a:not(.disabled), .page-item.next:not(.disabled) a');
            if (nextBtn) {
                await nextBtn.click();
                await delay(2000);
                currentPage++;
            } else {
                console.log('No next button found.');
                hasMore = false;
            }
        }
    }

    const propertyLinks = Array.from(allLinks);
    console.log(`\nTotal property links found: ${propertyLinks.length}\n`);

    // 4. For each link, visit the page, grab the first image, match to DB, upload
    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    for (let i = 0; i < propertyLinks.length; i++) {
        const link = propertyLinks[i];
        console.log(`[${i+1}/${propertyLinks.length}] Visiting: ${link}`);

        try {
            await page.goto(link, { waitUntil: 'networkidle2', timeout: 30000 });
            await delay(500);

            // Extract first image and property data
            const propData = await page.evaluate(() => {
                const getText = (sel) => {
                    const el = document.querySelector(sel);
                    return el ? el.innerText.trim().replace(/\s+/g, ' ') : '';
                };

                // First image from the gallery
                const img = document.querySelector('img[src*="riastatic.com/photosnew"]');
                const price = getText('.price') || getText('.box-panel-price') || getText('.size24 b') || '';
                const title = getText('h1') || getText('.realty-title') || '';
                const description = getText('.box-panel-description') || getText('.realty-description') || '';

                return {
                    imageUrl: img ? img.src : null,
                    price,
                    title,
                    description: description.substring(0, 200)
                };
            });

            if (!propData.imageUrl) {
                console.log(`  No image found, skipping.`);
                skipCount++;
                continue;
            }

            // Upgrade to XL quality
            let imageUrl = propData.imageUrl;
            imageUrl = imageUrl.replace(/fl\.jpg/g, 'xl.jpg').replace(/m\.jpg/g, 'xl.jpg');

            // Extract DomRia ID from URL
            const domRiaIdMatch = link.match(/-(\d+)\.html$/);
            const domRiaId = domRiaIdMatch ? domRiaIdMatch[1] : null;

            // Find matching DB property
            let bestMatch = null;
            // Extract first price number: "99 000 $ за об'єкт · ..." -> 99000
            function extractFirstPrice(str) {
                const m = (str || '').match(/([\d\s]+)\s*\$/); // match digits before first $
                if (m) return parseInt(m[1].replace(/\s/g, ''), 10);
                const m2 = (str || '').match(/([\d\s]+)\s*грн/); // fallback: digits before грн
                if (m2) return parseInt(m2[1].replace(/\s/g, ''), 10);
                return parseInt((str || '').replace(/\D/g, ''), 10);
            }
            const parsedPrice = extractFirstPrice(propData.price);

            // Strategy 1: match by title keywords + price
            for (const dbProp of dbProps) {
                if (dbProp.image && dbProp.image.includes('supabase')) continue; // already done

                const dbPriceNum = extractFirstPrice(dbProp.price);
                if (isNaN(parsedPrice) || isNaN(dbPriceNum) || dbPriceNum !== parsedPrice) continue;

                // Check title word overlap
                const scraped = propData.title.toLowerCase();
                const db = dbProp.title.toLowerCase();
                const scrapedWords = scraped.split(/\s+/).filter(w => w.length > 3);
                const dbWords = db.split(/\s+/).filter(w => w.length > 3);
                const overlap = scrapedWords.filter(w => dbWords.includes(w));

                if (overlap.length >= 2) {
                    bestMatch = dbProp;
                    break;
                }
            }

            // Strategy 2: match by price + description overlap
            if (!bestMatch) {
                for (const dbProp of dbProps) {
                    if (dbProp.image && dbProp.image.includes('supabase')) continue;
                    const dbPriceNum = extractFirstPrice(dbProp.price);
                    if (isNaN(parsedPrice) || isNaN(dbPriceNum) || dbPriceNum !== parsedPrice) continue;

                    if (dbProp.extra && propData.description) {
                        const dbDesc = dbProp.extra.substring(0, 80).toLowerCase();
                        const scrapedDesc = propData.description.toLowerCase();
                        // Check first 40 chars overlap
                        if (dbDesc.length > 10 && scrapedDesc.includes(dbDesc.substring(0, 40))) {
                            bestMatch = dbProp;
                            break;
                        }
                    }
                }
            }

            // Strategy 3: unique price match
            if (!bestMatch && !isNaN(parsedPrice)) {
                const priceMatches = dbProps.filter(p => {
                    if (p.image && p.image.includes('supabase')) return false;
                    return extractFirstPrice(p.price) === parsedPrice;
                });
                if (priceMatches.length === 1) {
                    bestMatch = priceMatches[0];
                }
            }

            if (!bestMatch) {
                console.log(`  No DB match: "${propData.title.substring(0, 50)}" | ${propData.price}`);
                failCount++;
                continue;
            }

            // Download image
            console.log(`  Matched: "${bestMatch.title.substring(0, 50)}" -> downloading...`);
            const imgBuffer = await downloadImage(imageUrl);
            if (!imgBuffer || imgBuffer.length < 1000) {
                console.log(`  Download failed or too small.`);
                failCount++;
                continue;
            }

            // Upload to Supabase Storage
            const fileName = `${bestMatch.id}.jpg`;
            const { error: uploadError } = await supabase.storage
                .from('property_images')
                .upload(fileName, imgBuffer, { contentType: 'image/jpeg', upsert: true });

            if (uploadError) {
                console.error(`  Upload error: ${uploadError.message}`);
                failCount++;
                continue;
            }

            // Get public URL and update DB
            const { data: urlData } = supabase.storage
                .from('property_images')
                .getPublicUrl(fileName);

            const { error: updateError } = await supabase
                .from('properties')
                .update({ image: urlData.publicUrl })
                .eq('id', bestMatch.id);

            if (updateError) {
                console.error(`  DB update error: ${updateError.message}`);
                failCount++;
            } else {
                console.log(`  ✅ Uploaded & updated!`);
                bestMatch.image = urlData.publicUrl; // mark as done
                successCount++;
            }

        } catch (e) {
            console.error(`  Error: ${e.message}`);
            failCount++;
        }

        await delay(500);
    }

    await browser.close();

    console.log(`\n========================================`);
    console.log(`Done! ✅ ${successCount} | ❌ ${failCount} | ⏭️ ${skipCount}`);
    console.log(`========================================`);
}

main().catch(console.error);
