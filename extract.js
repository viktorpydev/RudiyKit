const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf-8');

// 1. Extract pieces
const headerRegex = /<!-- Header -->\s*<header class="header">[\s\S]*?<\/header>/;
const footerRegex = /<!-- Footer -->\s*<footer id="footer" class="footer">[\s\S]*?<\/footer>/;
const propertiesRegex = /<!-- Properties Section -->\s*<section id="properties" class="properties section bg-light">[\s\S]*?<\/section>/;

const headerMatch = indexHtml.match(headerRegex);
const footerMatch = indexHtml.match(footerRegex);
const propertiesMatch = indexHtml.match(propertiesRegex);

if (!headerMatch || !footerMatch || !propertiesMatch) {
    console.error("Could not find one of the sections.");
    process.exit(1);
}

let headerHTML = headerMatch[0];
let footerHTML = footerMatch[0];
let propertiesHTML = propertiesMatch[0];

// 2. Generate catalog.html
let catalogHtml = `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Каталог об'єктів нерухомості агенції «Рудий Кіт».">
    <title>Об'єкти — Агенція нерухомості «Рудий Кіт»</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body style="padding-top: 80px;">

${headerHTML}

${propertiesHTML}

${footerHTML}

<script src="main.js"></script>
</body>
</html>`;

// Update links in catalog.html
catalogHtml = catalogHtml.replace('<a href="#hero" class="nav__link">Головна</a>', '<a href="index.html" class="nav__link">Головна</a>');
catalogHtml = catalogHtml.replace('<a href="#properties" class="nav__link">Об\'єкти</a>', '<a href="catalog.html" class="nav__link active">Об\'єкти</a>');
catalogHtml = catalogHtml.replace('<a href="#team" class="nav__link">Команда</a>', '<a href="index.html#team" class="nav__link">Команда</a>');

fs.writeFileSync('catalog.html', catalogHtml);
console.log('Created catalog.html');

// 3. Update index.html
indexHtml = indexHtml.replace(propertiesRegex, ''); // Remove properties
indexHtml = indexHtml.replace('<a href="#properties" class="nav__link">Об\'єкти</a>', '<a href="catalog.html" class="nav__link">Об\'єкти</a>');

fs.writeFileSync('index.html', indexHtml);
console.log('Updated index.html');
