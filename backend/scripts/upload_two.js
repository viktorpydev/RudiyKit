const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const sb = createClient(
    'https://qwunxhnjacfgvtsoflca.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dW54aG5qYWNmZ3Z0c29mbGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NTY0NjQsImV4cCI6MjA5ODAzMjQ2NH0.jGFZyCTnmkUzuqxpBcKSqDKq-oxDnfoK0npHBYQvTOM'
);

const targets = [
    { url: 'https://dom.ria.com/uk/realty-prodaja-kvartira-vinnitsa-blijnee-zamoste-zamostyanskaya-ulitsa-34429132.html', id: '79a22957-0695-4978-b96b-b9f8418cdd02' },
    { url: 'https://dom.ria.com/uk/realty-dolgosrochnaya-arenda-kvartira-vinnitsa-vishenka-yunosti-prospekt-34347437.html', id: '304919fe-a24a-462c-bc90-08699b15ad7b' }
];

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    for (const target of targets) {
        console.log('Visiting', target.url);
        await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        let imageUrl = await page.evaluate(() => {
            const img = document.querySelector('img[src*="cdn.riastatic.com/photosnew/dom/photo/"]');
            return img ? img.src : null;
        });
        
        if (imageUrl) {
            imageUrl = imageUrl.replace('m.jpg', 'xl.jpg').replace('s.jpg', 'xl.jpg');
            console.log('Found image:', imageUrl);
            
            const res = await fetch(imageUrl);
            const buffer = await res.arrayBuffer();
            const fileName = 'img_' + Date.now() + '.jpg';
            
            const { data, error } = await sb.storage.from('property_images').upload(fileName, buffer, { contentType: 'image/jpeg' });
            if (error) {
                console.error('Upload error:', error.message);
                continue;
            }
            
            const { data: publicUrlData } = sb.storage.from('property_images').getPublicUrl(fileName);
            const publicUrl = publicUrlData.publicUrl;
            
            const { error: dbError } = await sb.from('properties').update({ image: publicUrl }).eq('id', target.id);
            if (dbError) {
                console.error('DB update error:', dbError.message);
            } else {
                console.log('Successfully updated DB for', target.id, 'with', publicUrl);
            }
        } else {
            console.log('No image found on page');
        }
    }
    
    await browser.close();
})();
