const fs = require('fs');

const team = [
    {
        name: "Світлана Володимирівна Власюк",
        role: "Адміністратор агентства",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
        topBadge: '<span class="team-badge-top"><span class="star">⭐</span> 10/10 <span class="top-label">ТОП</span></span>',
        bottomLeftBadge: '<span class="team-badge-bottom">2 актуальні пропозиції</span>',
        bottomRightBadge: '<span class="team-badge-circle">10<br>РОКІВ<br>досвід</span>'
    },
    {
        name: "Сніжана Левченко",
        role: "Перевірений рієлтор",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
        topBadge: '<span class="team-badge-top"><span class="star">⭐</span> 10/10 <span class="top-label">ТОП</span></span>',
        bottomLeftBadge: '<span class="team-badge-bottom">16 актуальних пропозицій 🔥</span>',
        bottomRightBadge: ''
    },
    {
        name: "Юрій Гарматюк",
        role: "Рієлтор",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop",
        topBadge: '<span class="team-badge-top"><span class="star-empty">☆</span> 9.2/10</span>',
        bottomLeftBadge: '<span class="team-badge-bottom">66 актуальних пропозицій 🔥</span>',
        bottomRightBadge: ''
    },
    {
        name: "Олеся Тарнавська",
        role: "Рієлтор",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop",
        topBadge: '<span class="team-badge-top"><span class="star-empty">☆</span> 9.2/10</span>',
        bottomLeftBadge: '<span class="team-badge-bottom">12 актуальних пропозицій 🔥</span>',
        bottomRightBadge: ''
    },
    {
        name: "Марина Штепа",
        role: "Рієлтор",
        image: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=400&auto=format&fit=crop",
        topBadge: '<span class="team-badge-top"><span class="star-empty">☆</span> 8.2/10</span>',
        bottomLeftBadge: '<span class="team-badge-bottom">3 актуальні пропозиції</span>',
        bottomRightBadge: ''
    },
    {
        name: "Назар Гриник",
        role: "Рієлтор",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
        topBadge: '<span class="team-badge-top"><span class="star-empty">☆</span> 7.6/10</span>',
        bottomLeftBadge: '<span class="team-badge-bottom">3 актуальні пропозиції</span>',
        bottomRightBadge: ''
    }
];

let htmlContent = '';
team.forEach((member, index) => {
    const delay = (index % 3) * 0.1;
    htmlContent += '<div class="team-card slide-up" style="transition-delay: ' + delay + 's;">\n' +
                   '    <div class="team-card__image-wrapper">\n' +
                   '        <img src="' + member.image + '" alt="' + member.name + '" class="team-card__image">\n' +
                   '        <div class="team-card__gradient"></div>\n' +
                   '        ' + member.topBadge + '\n' +
                   '        ' + member.bottomLeftBadge + '\n' +
                   '        ' + member.bottomRightBadge + '\n' +
                   '    </div>\n' +
                   '    <div class="team-card__content">\n' +
                   '        <h3 class="team-card__name">' + member.name + '</h3>\n' +
                   '        <p class="team-card__role">' + member.role + '</p>\n' +
                   '        <button class="btn btn--primary team-btn-full">\n' +
                   '            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>\n' +
                   '            Зателефонувати\n' +
                   '        </button>\n' +
                   '    </div>\n' +
                   '</div>\n';
});

let indexHtml = fs.readFileSync('index.html', 'utf-8');
const gridRegex = /<div class="team__grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/;
const replacement = '<div class="team__grid">\n' + htmlContent + '        </div>\n    </div>\n</section>';
indexHtml = indexHtml.replace(gridRegex, replacement);

fs.writeFileSync('index.html', indexHtml);
console.log('Done');
