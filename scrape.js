const fs = require('fs');

async function scrape() {
    try {
        const text = fs.readFileSync('C:\\Users\\User\\.gemini\\antigravity\\brain\\39d31a3e-568b-45f9-a157-9b7a3f777eee\\.system_generated\\steps\\57\\content.md', 'utf-8');
        
        // Find all links
        const regex = /title="([^"]+)"/g;
        let match;
        let streets = new Set();
        
        while ((match = regex.exec(text)) !== null) {
            let title = match[1];
            if (/вулиця|провулок|проспект|площа|бульвар|тупик/i.test(title)) {
                let cleanName = title.replace(/\s*\([^)]*\)\s*/g, '').trim();
                
                if (cleanName.length < 50 && !cleanName.includes(':') && !cleanName.includes('Список')) {
                    streets.add(cleanName);
                }
            }
        }
        
        const arr = Array.from(streets);
        fs.writeFileSync('streets.json', JSON.stringify(arr, null, 2));
        console.log('Found ' + arr.length + ' streets.');
    } catch (e) {
        console.error(e);
    }
}

scrape();
