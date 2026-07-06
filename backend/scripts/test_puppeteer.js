const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await page.goto('https://dom.ria.com/uk/realty-prodaja-kvartira-vinnitsa-vishenka-keleckaya-ulitsa-34079836.html', { waitUntil: 'domcontentloaded' });
    
    const data = await page.evaluate(() => {
        const details = {
            text: '',
            area: '',
            floor: '',
            year: '',
            infra: []
        };
        
        // 1. Text
        const descEl = document.querySelector('#description .text, .description-text, .mb-20.text-b, #description');
        if (descEl) {
            let text = descEl.innerText.trim();
            // Remove boilerplate text that DOM.RIA appends sometimes
            text = text.replace(/Оголошення неактуальне.*/g, '').trim();
            details.text = text;
        }
        
        // 2. Characteristics
        document.querySelectorAll('.chars-item, .flex.mt-15, .mt-15').forEach(el => {
            const t = el.innerText.trim();
            if (t.includes('Загальна площа')) details.area = t.replace('Загальна площа', '').trim();
            if (t.includes('Поверх')) details.floor = t.replace('Поверх', '').trim();
            if (t.includes('Рік побудови') || t.includes('Рік забудови')) details.year = t.replace(/Рік (побудови|забудови)/, '').trim();
        });
        
        // 3. Infrastructure
        const infraHeader = Array.from(document.querySelectorAll('h2, h3, div')).find(el => el.innerText && el.innerText.includes('Інфраструктура'));
        if (infraHeader) {
            let container = infraHeader.parentElement;
            while(container && container.tagName !== 'SECTION' && !container.className.includes('container')) {
                container = container.parentElement;
            }
            if (container) {
                // Find items
                container.querySelectorAll('.infrastructure-item, .item, .list-item').forEach(item => {
                     let type = item.querySelector('.title, b, strong, .name')?.innerText || '';
                     let time = item.querySelector('.distance, .time, .mb-5')?.innerText || '';
                     let desc = item.querySelector('.text, span')?.innerText || '';
                     if (type) {
                         details.infra.push({ type: type.trim(), time: time.trim(), desc: desc.trim() });
                     }
                });
            }
        }
        
        return details;
    });
    
    console.log(JSON.stringify(data, null, 2));
    await browser.close();
})();
