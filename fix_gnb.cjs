const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            if(!dirPath.includes('.git') && !dirPath.includes('node_modules')) walkDir(dirPath, callback);
        } else if (f.endsWith('.html')) {
            callback(dirPath);
        }
    });
}

function processHtmlFile(f) {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;

    let depth = (f.includes('guides\\') || f.includes('guides/')) ? 1 : 0;
    let prefix = depth === 1 ? '../' : '';

    // Step 1: Remove the rogue dropdown injected by the previous flawed script inside .lang-switcher
    // The previous script matched:
    // <div class="dropdown">\n    <a href="#" class="dropbtn" data-i18n="nav.tips" style="font-weight:bold; color:var(--primary-color);">여행 팁</a>\n    <div class="dropdown-content">\n        <a href="guides.html" data-i18n="nav.guides">여행 가이드 / FAQ</a>\n        <a href="route.html" data-i18n="nav.planner">최적 여행 동선 플래너</a>\n    </div>\n</div>
    let rogueRegex = /<div class="dropdown">\s*<a href="#" class="dropbtn" data-i18n="nav\.tips"[\s\S]*?최적 여행 동선 플래너<\/a>\s*<\/div>\s*<\/div>\s*/g;
    content = content.replace(rogueRegex, '');

    // Step 2: In ul.nav-links, replace <li>guides</li><li>faq</li> with the new <li>nav.tips</li>
    // Target: <li><a href="guides.html" data-i18n="nav.guides">여행 가이드</a></li> <li><a href="faq.html" data-i18n="nav.faq">FAQ</a></li>
    let liRegex = /<li>\s*<a href="[^"]*?(?:guides|faq)\.html"[^>]*>(?:여행 가이드|FAQ).*?<\/a>\s*<\/li>\s*<li>\s*<a href="[^"]*?(?:guides|faq)\.html"[^>]*>(?:여행 가이드|FAQ).*?<\/a>\s*<\/li>/g;
    let newTipsHtml = `<li class="nav-dropdown">
                <a href="#" data-i18n="nav.tips">여행 팁</a>
                <div class="nav-dropdown-content">
                    <a href="${prefix}guides.html" data-i18n="nav.guides">여행 가이드</a>
                    <a href="${prefix}faq.html" data-i18n="nav.faq">FAQ</a>
                    <a href="${prefix}route.html" data-i18n="nav.planner">최적 여행 동선 플래너</a>
                </div>
            </li>`;
    content = content.replace(liRegex, newTipsHtml);

    // Step 3: Handle route.html's unique <nav class="nav-links"> structure (which uses div.dropdown instead of li.nav-dropdown)
    if (f.endsWith('route.html')) {
        let routeNavRegex = /<nav class="nav-links">[\s\S]*?<\/nav>/;
        let routeNavHtml = `<ul class="nav-links">
            <li><a href="${prefix}index.html" data-i18n="nav.home">홈</a></li>
            <li class="nav-dropdown">
                <a href="#" data-i18n="nav.korea">South Korea</a>
                <div class="nav-dropdown-content">
                    <a href="${prefix}seoul.html" data-i18n="nav.seoul">Seoul</a>
                    <a href="${prefix}jeju.html" data-i18n="nav.jeju">Jeju Island</a>
                    <a href="${prefix}busan.html">Busan (Korea)</a>
                </div>
            </li>
            <li class="nav-dropdown">
                <a href="#" data-i18n="nav.japan">Japan</a>
                <div class="nav-dropdown-content">
                    <a href="${prefix}osaka.html" data-i18n="nav.osaka">Osaka</a>
                    <a href="${prefix}kyoto.html" data-i18n="nav.kyoto">Kyoto</a>
                </div>
            </li>
            <li class="nav-dropdown">
                <a href="#" data-i18n="nav.tips">여행 팁</a>
                <div class="nav-dropdown-content">
                    <a href="${prefix}guides.html" data-i18n="nav.guides">여행 가이드</a>
                    <a href="${prefix}faq.html" data-i18n="nav.faq">FAQ</a>
                    <a href="${prefix}route.html" data-i18n="nav.planner">최적 여행 동선 플래너</a>
                </div>
            </li>
        </ul>
        <div class="lang-switcher">
            <select id="lang-selector" class="lang-selector">
                <option value="en">English</option>
                <option value="ko">한국어</option>
                <option value="ja">日本語</option>
            </select>
        </div>`;
        
        // Let's replace the whole nav> ... </nav> WITH nav id=navbar enclosing it to match others
        // Wait, route.html HAS NO nav#navbar! 
        // In other pages, it's <nav id="navbar">
        // Let's wrap it correctly:
        let correctNavHtml = `<nav id="navbar">\n            <a href="index.html" class="logo">Check<span>East</span>Point</a>\n            ${routeNavHtml}\n        </nav>`;
        
        // Basically we replace <a href="index.html" class="logo">...</a> <nav class="nav-links">...</nav> 
        let wrapRegex = /<a href="index\.html" class="logo">Check<span>East<\/span>Point<\/a>\s*<nav class="nav-links">[\s\S]*?<\/nav>/;
        content = content.replace(wrapRegex, correctNavHtml);
    }

    if (content !== original) {
        fs.writeFileSync(f, content, 'utf8');
        console.log('Updated ' + f);
    }
}

let count = 0;
walkDir(__dirname, (f) => {
    if (f.toLowerCase().includes('admin') || f.toLowerCase().includes('components')) return;
    try {
        processHtmlFile(f);
        count++;
    } catch(e) { console.error(e); }
});
console.log('Total checked: ' + count);
