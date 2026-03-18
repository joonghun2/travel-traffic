const fs = require('fs');
const path = require('path');

const directory = 'c:\\Users\\joong\\Desktop\\travel-Traffic\\guides';
const files = fs.readdirSync(directory).filter(f => f.startsWith('guide') && f.endsWith('.html'));

const gaScript = `
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-EJC5R171MS"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-EJC5R171MS');
    </script>
`;

files.forEach(file => {
    const filePath = path.join(directory, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Add Canonical
    if (!content.includes('<link rel="canonical"')) {
        const canonical = `    <link rel="canonical" href="https://www.checkeastpoint.com/guides/${file}">\n`;
        content = content.replace('<head>', '<head>\n' + canonical);
    }
    
    // 2. Update Title and Add Meta
    const res = file.match(/guide(\d+)/);
    const guideId = res ? res[1] : 'Tip';
    const newMeta = `    <title>여행 가이드 #${guideId} | 트래블 트래픽</title>
    <meta name="description" content="트래블 트래픽이 제공하는 유용한 여행 가이드와 전문적인 팁을 확인하세요. 더 즐거운 여행을 위한 정보를 제공합니다.">
    <meta name="keywords" content="트래블 트래픽, 여행 가이드, 여행 팁, 실시간 혼잡도, 여행 정보">
    
    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://www.checkeastpoint.com/guides/${file}">
    <meta property="og:title" content="트래블 트래픽 - 여행 가이드">
    <meta property="og:description" content="트래블 트래픽의 전문가들이 제안하는 특별한 여행 팁을 확인하세요.">
    <meta property="og:image" content="https://www.checkeastpoint.com/img/bg_seoul_gwanghwamun.png">
    <meta property="og:site_name" content="트래블 트래픽">
`;
    
    content = content.replace(/<title>.*?<\/title>/, newMeta);
    
    // 3. Add GA4
    if (!content.includes('G-EJC5R171MS')) {
        content = content.replace('</head>', gaScript + '</head>');
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
});
