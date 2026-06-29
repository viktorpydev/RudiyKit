const fs = require('fs');
const html = fs.readFileSync('property_debug.html', 'utf8');

// Find all image tags
const matches = html.match(/<img[^>]+src="([^"]+)"[^>]*>/gi) || [];
console.log(matches.slice(0, 15).join('\n'));
