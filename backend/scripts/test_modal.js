const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    await page.goto('file:///C:/Users/User/Desktop/Code/RealProjects/RedCat/frontend/catalog.html', {waitUntil: 'networkidle0'});
    console.log('Page loaded');
    
    const btn = await page.$('.prop-btn-full');
    if (btn) {
        console.log('Clicking button...');
        await btn.click();
        await new Promise(r => setTimeout(r, 1000));
        
        const modal = await page.$('.property-modal-overlay.active');
        console.log('Modal active:', !!modal);
        if (modal) {
            const display = await page.evaluate(m => window.getComputedStyle(m).display, modal);
            console.log('Modal display:', display);
            const title = await page.$eval('#modalTitle', el => el.textContent);
            console.log('Modal Title:', title);
        }
    } else {
        console.log('No button found');
    }
    
    await browser.close();
})();
