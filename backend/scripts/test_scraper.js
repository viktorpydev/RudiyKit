const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

async function checkDomRia() {
    try {
        const url = 'https://dom.ria.com/uk/agency-26983.html';
        const agent = new https.Agent({  
            rejectUnauthorized: false
        });
        const response = await axios.get(url, {
            httpsAgent: agent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(response.data);
        
        const stateMatch = response.data.match(/window\.__INITIAL_STATE__\s*=\s*(.*?);<\/script>/);
        if (stateMatch) {
            console.log("Found __INITIAL_STATE__!");
            const state = JSON.parse(stateMatch[1]);
            if (state.realtyList && state.realtyList.items) {
                console.log(`Found ${state.realtyList.items.length} items in initial state.`);
                // Log the first item to see its structure
                console.log(JSON.stringify(state.realtyList.items[0], null, 2).substring(0, 500) + '...');
            } else {
                console.log("State keys:", Object.keys(state));
                console.log("realtyList:", Object.keys(state.realtyList || {}));
            }
        } else {
            console.log("No __INITIAL_STATE__ found.");
            // check for HTML elements
            const items = $('.ticket').length;
            console.log(`Found ${items} property elements in HTML (.ticket).`);
        }
        
    } catch (err) {
        console.error(err.message);
    }
}

checkDomRia();
