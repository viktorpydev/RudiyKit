const puppeteer = require('puppeteer');
const https = require('https');

async function testDomRiaState() {
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    
    console.log("Loading agency page...");
    await page.goto('https://dom.ria.com/uk/agency-26983.html', { waitUntil: 'networkidle2' });
    
    const state = await page.evaluate(() => {
        return window.__INITIAL_STATE__;
    });
    
    if (state && state.agency) {
        console.log("State keys:", Object.keys(state));
        console.log("Agency realty items count:", state.agency.realty ? state.agency.realty.length : "No realty array");
        // Log keys of agency
        console.log("Agency keys:", Object.keys(state.agency));
    } else {
        console.log("State:", state ? Object.keys(state) : "null");
    }
    
    await browser.close();
}

testDomRiaState().catch(console.error);
