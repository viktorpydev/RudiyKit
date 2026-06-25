const fs = require('fs');

const streets = JSON.parse(fs.readFileSync('streets.json', 'utf-8'));

let locationsData = `const locations = [\n`;
locationsData += `    { name: "Центр", type: "Район", icon: "map-pin" },\n`;
locationsData += `    { name: "Замостя", type: "Район", icon: "map-pin" },\n`;
locationsData += `    { name: "Вишенька", type: "Район", icon: "map-pin" },\n`;
locationsData += `    { name: "Тяжилів", type: "Район", icon: "map-pin" },\n`;
locationsData += `    { name: "Старе місто", type: "Район", icon: "map-pin" },\n`;
locationsData += `    { name: "Поділля", type: "Район", icon: "map-pin" },\n`;
locationsData += `    { name: "Корея", type: "Район", icon: "map-pin" },\n`;
locationsData += `    { name: "Слов'янка", type: "Район", icon: "map-pin" },\n`;
locationsData += `    { name: "ЖК Набережний Квартал", type: "ЖК", icon: "home" },\n`;
locationsData += `    { name: "ЖК Авалон", type: "ЖК", icon: "home" },\n`;
locationsData += `    { name: "ЖК Поділля", type: "ЖК", icon: "home" },\n`;
locationsData += `    { name: "ЖК Туркіш Сіті", type: "ЖК", icon: "home" },\n`;
locationsData += `    { name: "ЖК Premier Tower", type: "ЖК", icon: "home" },\n`;

for (let street of streets) {
    let type = "Вулиця";
    if (street.toLowerCase().includes("провулок")) type = "Провулок";
    if (street.toLowerCase().includes("проспект")) type = "Проспект";
    if (street.toLowerCase().includes("площа")) type = "Площа";
    if (street.toLowerCase().includes("бульвар")) type = "Бульвар";
    if (street.toLowerCase().includes("тупик")) type = "Тупик";

    let name = street.replace(/"/g, '\\"');
    
    locationsData += `    { name: "${name}", type: "${type}", icon: "navigation" },\n`;
}
locationsData = locationsData.slice(0, -2) + `\n    ];`;

let mainJs = fs.readFileSync('main.js', 'utf-8');

const regex = /const locations = \[\s*\{ name: "Центр".*?\];/s;
mainJs = mainJs.replace(regex, locationsData);

mainJs = mainJs.replace('items.forEach(item => {', 'items.slice(0, 15).forEach(item => {');

fs.writeFileSync('main.js', mainJs);
console.log('Successfully updated main.js with ' + streets.length + ' streets.');
