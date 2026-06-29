const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://dom.ria.com/uk/realty-prodaja-kvartira-vinnitsa-blijnee-zamoste-zamostyanskaya-ulitsa-34429132.html', {waitUntil: 'domcontentloaded'});
    
    const info = await page.evaluate(() => {
        const realtorLink = document.querySelector('a[href*="/realtor-"]');
        let realtorId = null;
        let realtorName = null;
        if (realtorLink) {
            const m = realtorLink.href.match(/realtor-(\d+)\.html/);
            if (m) realtorId = m[1];
            realtorName = realtorLink.textContent.trim();
        }
        
        const description = document.querySelector('#description .text') ? document.querySelector('#description .text').innerText : '';
        
        return { realtorId, realtorName, description: description.substring(0, 100) };
    });
    console.log(info);
    await browser.close();
})();
