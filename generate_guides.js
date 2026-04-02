import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const guidesDir = path.join(__dirname, 'guides');
const dataPath = path.join(__dirname, 'guides_data.json');
const i18nPath = path.join(__dirname, 'js', 'i18n.js');

// Author personas for E-E-A-T
const authors = {
    "ko": {
        "name": "Alex Kim",
        "jobTitle": "10년 차 로컬 여행 가이드",
        "description": "서울의 숨겨진 골목과 일본의 보석 같은 명소를 10년 넘게 탐험하며 기록하고 있습니다. 현지인만 아는 진짜 정보를 전달하는 것을 목표로 합니다.",
        "knowsAbout": ["South Korea Tourism", "Japan Hidden Gems", "Local Food", "Cultural Etiquette"]
    },
    "en": {
        "name": "Alex Kim",
        "jobTitle": "10-Year Local Travel Expert",
        "description": "Exploring and documenting hidden alleys of Seoul and gems of Japan for over a decade. Dedicated to providing authentic, local-first travel insights.",
        "knowsAbout": ["South Korea Tourism", "Japan Hidden Gems", "Local Food", "Cultural Etiquette"]
    }
};

if (!fs.existsSync(guidesDir)) {
    fs.mkdirSync(guidesDir);
}

const guidesData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 1. Update i18n.js translations from guides_data.json
let i18nContent = fs.readFileSync(i18nPath, 'utf8');

// Simple parser to find and update translations object
// We will look for ko: { ... }, en: { ... }, ja: { ... } and inject/update keys
const langs = ['ko', 'en', 'ja'];
langs.forEach(lang => {
    let langObj = {};
    guidesData.forEach(guide => {
        const data = guide[lang] || {};
        langObj[`guide.${guide.id}.title`] = data.title || '';
        langObj[`guide.${guide.id}.desc`] = data.desc || '';
        langObj[`guide.${guide.id}.content`] = data.content || '';
        langObj[`guide.${guide.id}.image`] = data.image || '';
        // Add tags joined by comma for i18n
        if (data.tags) {
            langObj[`guide.${guide.id}.tags`] = data.tags.join(',');
        } else {
            // Fallback to global tags if lang-specific tags not present
            langObj[`guide.${guide.id}.tags`] = guide.tags ? guide.tags.join(',') : '';
        }
    });

// Update the i18n file content for this language
    const langMarker = `${lang}: {`;
    const markerIndex = i18nContent.indexOf(langMarker);
    if (markerIndex !== -1) {
        // Find the block for this language
        let nextMarkerIndex = i18nContent.indexOf('},', markerIndex);
        if (nextMarkerIndex === -1) nextMarkerIndex = i18nContent.length;
        
        let langBlock = i18nContent.slice(markerIndex, nextMarkerIndex);

        for (const [key, val] of Object.entries(langObj)) {
            const escapedKey = key.replace(/\./g, '\\.');
            // Updated regex to correctly handle escaped quotes inside the string
            const keyRegex = new RegExp(`"${escapedKey}"\\s*:\\s*"(?:\\\\.|[^"\\\\\\n])*"`, 'g');
            const escapedVal = val.replace(/"/g, '\\"').replace(/\n/g, '\\n');
            
            if (keyRegex.test(langBlock)) {
                langBlock = langBlock.replace(keyRegex, `"${key}": "${escapedVal}"`);
            } else {
                // Insert after the lang marker
                const insertPos = langMarker.length;
                langBlock = langBlock.slice(0, insertPos) + `\n        "${key}": "${escapedVal}",` + langBlock.slice(insertPos);
            }
        }
        
        // Put the modified block back
        i18nContent = i18nContent.slice(0, markerIndex) + langBlock + i18nContent.slice(nextMarkerIndex);
    }
});

fs.writeFileSync(i18nPath, i18nContent, 'utf8');

const htmlTemplate = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} - Travel Traffic</title>
    <meta name="description" content="{{DESC}}">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css">
    <script src="../js/i18n.js"></script>
    <script src="../js/script.js" defer></script>
    <script type="application/ld+json">{{JSON_LD}}</script>
    <style>
        .guide-content { max-width: 800px; margin: 120px auto 60px; padding: 2.5rem; background: var(--card-bg); border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); color: var(--text-main); }
        .guide-content h1 { font-size: 2.22rem; margin-bottom: 0.5rem; color: var(--primary); line-height: 1.3; }
        .guide-tags-single { margin-bottom: 1.5rem; display: flex; flex-wrap: wrap; gap: 8px; }
        .guide-tags-single span { background: rgba(56, 189, 248, 0.1); color: var(--primary); padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; border: 1px solid rgba(56, 189, 248, 0.3); }
        .guide-content p.desc { font-size: 1.2rem; margin-bottom: 2rem; color: var(--text-muted); padding-bottom: 1rem; border-bottom: 1px solid #334155; }
        .guide-image-container { width: 100%; margin: 2rem 0; border-radius: 12px; overflow: hidden; display: none; }
        .guide-image-container img { width: 100%; height: auto; display: block; object-fit: cover; max-height: 500px; }
        .guide-content .text-body { font-size: 1.15rem; line-height: 1.9; color: #d1d5db; white-space: pre-line; }
        .guide-content .text-body h2 { color: var(--primary); font-size: 1.6rem; margin: 2.5rem 0 1rem; border-left: 4px solid var(--primary); padding-left: 1rem; }
        .guide-content .text-body h3 { color: #f8fafc; font-size: 1.3rem; margin: 1.5rem 0 0.8rem; }
        .guide-content .text-body p { margin-bottom: 1.2rem; }
        .guide-content .text-body ul, .guide-content .text-body ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .guide-content .text-body li { margin-bottom: 0.5rem; }
        .back-link { display: inline-block; margin-bottom: 2rem; color: var(--primary); text-decoration: none; font-weight: bold; font-size: 1.1rem; }
        .back-link:hover { text-decoration: underline; }
        
        /* Author Section for E-E-A-T */
        .author-box { margin-top: 4rem; padding: 2rem; background: rgba(255,255,255,0.05); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; gap: 1.5rem; }
        .author-info h4 { margin: 0; color: #f8fafc; font-size: 1.1rem; }
        .author-info p { margin: 0.3rem 0 0; font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; }
    </style>
</head>
<body class="ott-theme">
    <nav id="navbar">
        <a href="../index.html" class="logo" data-i18n="nav.brand">트래블 트래픽</a>
        <ul class="nav-links">
            <li><a href="../index.html" data-i18n="nav.home">홈</a></li>
            <li><a href="../seoul.html" data-i18n="nav.seoul">서울 (한국)</a></li>
            <li><a href="../jeju.html" data-i18n="nav.jeju">제주 (한국)</a></li>
            <li><a href="../osaka.html" data-i18n="nav.osaka">오사카 (일본)</a></li>
            <li><a href="../kyoto.html" data-i18n="nav.kyoto">교토 (일본)</a></li>
            <li><a href="../guides.html" data-i18n="nav.guides" class="active">여행 가이드</a></li>
        </ul>
        <div class="lang-switcher">
            <select id="lang-selector">
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
            </select>
        </div>
    </nav>

    <div class="guide-content">
        <a href="../guides.html" class="back-link">&larr; <span data-i18n="guide.back">가이드 목록으로 돌아가기</span></a>
        <h1 data-i18n="guide.{id}.title">{{TITLE}}</h1>
        <div class="guide-tags-single" data-i18n-tags="guide.{id}.tags"></div>
        <div class="guide-image-container" id="guide-image-wrap">
            <img data-i18n-src="guide.{id}.image" alt="Guide Image">
        </div>
        <p class="desc" data-i18n="guide.{id}.desc">{{DESC}}</p>
        <div class="text-body" data-i18n="guide.{id}.content">{{CONTENT}}</div>
        
        <div class="author-box">
            <div class="author-info">
                <h4 data-i18n="guide.author_name">저자: {{AUTHOR_NAME}}</h4>
                <p data-i18n="guide.author_desc">{{AUTHOR_DESC}}</p>
            </div>
        </div>
    </div>

    <footer class="site-footer">
        <div class="footer-content">
            <p>&copy; 2026 Travel Traffic. All rights reserved.</p>
            <ul class="footer-links">
                <li><a href="../privacy.html" data-i18n="footer.privacy">개인정보처리방침</a></li>
                <li><a href="../terms.html" data-i18n="footer.terms">이용약관</a></li>
            </ul>
        </div>
    </footer>
</body>
</html>`;

let guidesHubHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Travel Traffic - Travel Guides</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <script src="js/i18n.js"></script>
    <script src="js/script.js" defer></script>
    <style>
        .guides-container { max-width: 1100px; margin: 120px auto 60px; padding: 2rem; }
        .guides-header { margin-bottom: 2rem; text-align: center; }
        .guides-header h1 { font-size: 2.5rem; color: var(--primary); margin-bottom: 1rem; }
        .guides-header p { color: var(--text-muted); font-size: 1.1rem; }
        
        .search-container { max-width: 600px; margin: 0 auto 3rem; text-align: center; }
        #guideSearch { width: 100%; padding: 1rem 1.5rem; font-size: 1.1rem; border-radius: 30px; border: 2px solid #334155; background: #0f172a; color: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.5); outline: none; transition: border-color 0.3s; }
        #guideSearch:focus { border-color: var(--primary); }
        
        .guides-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .guide-card { background: var(--card-bg); border-radius: 12px; padding: 1.5rem; text-decoration: none; color: var(--text-main); transition: transform 0.2s, box-shadow 0.2s; border: 1px solid #334155; display: flex; flex-direction: column; }
        .guide-card:hover { transform: translateY(-5px); box-shadow: 0 8px 15px rgba(0,0,0,0.4); border-color: var(--primary); }
        
        .guide-tags { margin-bottom: 1rem; display: flex; flex-wrap: wrap; gap: 5px; }
        .guide-tags span { background: rgba(56, 189, 248, 0.1); color: var(--primary); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
        
        .guide-card h3 { font-size: 1.4rem; margin-bottom: 0.8rem; line-height: 1.3; color: var(--primary); }
        .guide-card p { font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1.5rem; flex-grow: 1; }
        .read-more { color: var(--primary); font-weight: bold; font-size: 0.9rem; align-self: flex-start; }
    </style>
</head>
<body class="ott-theme">
    <nav id="navbar">
        <a href="index.html" class="logo" data-i18n="nav.brand">트래블 트래픽</a>
        <ul class="nav-links">
            <li><a href="index.html" data-i18n="nav.home">홈</a></li>
            <li><a href="seoul.html" data-i18n="nav.seoul">서울 (한국)</a></li>
            <li><a href="jeju.html" data-i18n="nav.jeju">제주 (한국)</a></li>
            <li><a href="osaka.html" data-i18n="nav.osaka">오사카 (일본)</a></li>
            <li><a href="kyoto.html" data-i18n="nav.kyoto">교토 (일본)</a></li>
            <li><a href="guides.html" data-i18n="nav.guides" class="active">여행 가이드</a></li>
        </ul>
        <div class="lang-switcher">
            <select id="lang-selector">
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
            </select>
        </div>
    </nav>

    <div class="guides-container">
        <header class="guides-header">
            <h1 data-i18n="guide.hub.title">여행 가이드 & 팁</h1>
            <p data-i18n="guide.hub.subtitle">트래블 트래픽이 엄선한 최고의 여행 정보들을 확인해 보세요.</p>
        </header>

        <div class="search-container">
            <input type="text" id="guideSearch" data-i18n-placeholder="guide.search.placeholder" placeholder="가이드 검색...">
        </div>

        <div class="guides-grid" id="guidesGrid">
            <!-- Grid items will be generated here -->
        </div>
    </div>

    <footer class="site-footer">
        <div class="footer-content">
            <p>&copy; 2026 Travel Traffic. All rights reserved.</p>
        </div>
    </footer>

    <script>
        // Simple search logic for guides.html
        document.getElementById('guideSearch').addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.guide-card');
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(term) ? '' : 'none';
            });
        });
    </script>
</body>
</html>`;

let gridItemsHtml = '';

guidesData.forEach(guide => {
    // Fill placeholders for initial SEO (defaulting to Korean)
    const koData = guide.ko || {};
    const author = authors.ko;
    
    // Author JSON-LD Generation
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": koData.title,
        "description": koData.desc,
        "image": koData.image || "https://traveltraffic.example.com/assets/default-travel.jpg",
        "author": {
            "@type": "Person",
            "name": author.name,
            "jobTitle": author.jobTitle,
            "description": author.description,
            "knowsAbout": author.knowsAbout,
            "url": "https://traveltraffic.example.com/about"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Travel Traffic",
            "logo": {
                "@type": "ImageObject",
                "url": "https://traveltraffic.example.com/logo.png"
            }
        },
        "datePublished": "2026-03-20T09:00:00+09:00",
        "dateModified": new Date().toISOString(),
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://traveltraffic.example.com/guides/guide${guide.id}.html`
        }
    };

    // Generate individual guide pages
    let pageContent = htmlTemplate
        .replace(/{id}/g, guide.id)
        .replace(/{{TITLE}}/g, koData.title || 'Travel Guide')
        .replace(/{{DESC}}/g, koData.desc || 'Local expert travel insights and tips.')
        .replace(/{{CONTENT}}/g, koData.content || 'Content coming soon.')
        .replace(/{{JSON_LD}}/g, JSON.stringify(jsonLd))
        .replace(/{{AUTHOR_NAME}}/g, author.name)
        .replace(/{{AUTHOR_DESC}}/g, author.description);
    
    fs.writeFileSync(path.join(guidesDir, `guide${guide.id}.html`), pageContent, 'utf8');

    // Add to guides.html grid
    const tags = guide.tags || [];
    gridItemsHtml += `
    <a href="guides/guide${guide.id}.html" class="guide-card" data-tags="${tags.join(' ')}">
        <div class="guide-tags" data-i18n-tags="guide.${guide.id}.tags">
            ${tags.map(t => `<span>${t}</span>`).join('')}
        </div>
        <h3 data-i18n="guide.${guide.id}.title">${koData.title || ''}</h3>
        <p data-i18n="guide.${guide.id}.desc">${koData.desc || ''}</p>
        <span class="read-more" data-i18n="guide.hub.readmore">가이드 읽기 &rarr;</span>
    </a>`;
});

guidesHubHtml = guidesHubHtml.replace('<!-- Grid items will be generated here -->', gridItemsHtml);
fs.writeFileSync(path.join(__dirname, 'guides.html'), guidesHubHtml, 'utf8');

console.log('Guides regenerated, i18n.js updated, and guides.html updated successfully.');
