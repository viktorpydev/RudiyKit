const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('domria_full.html', 'utf8');
const $ = cheerio.load(html);
const items = [];
$('.realty-photo-and-description').each((i, el) => {
    const a = $(el).find('a.realty-link');
    const title = $(el).find('h3, h2, h4, .title').text().trim();
    if (a.length > 0) {
        items.push({ url: 'https://dom.ria.com' + a.attr('href'), title });
    }
});
console.log(`Found ${items.length} items`);
console.log(items.slice(0, 3));
