const fs = require('fs');
const html = fs.readFileSync('domria_full.html', 'utf8');

// Find area manually
const areaMatch = html.match(/Загальна площа[^\d]+(\d+)\s*м²/);
const charMatch = html.match(/class="chars-item".*?>(.*?)<\//g);
const infraMatch = html.match(/id="infrastructure"/);

console.log('Area match:', areaMatch ? areaMatch[0] : 'not found');
console.log('Infrastructure block exists:', !!infraMatch);
