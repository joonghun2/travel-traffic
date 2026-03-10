/**
 * Congestion Data Handling
 * 
 * NOTE: For a real production app using the Seoul Real-time City Data API,
 * you would use `fetch('http://openapi.seoul.go.kr:8088/{API_KEY}/json/citydata/1/5/{AREA_NM}')`
 * 
 * Since an API key is required, we are using a simulated mock response here.
 * The logic to render the cards remains exactly as it would for the real API.
 */

// Simulated API Data representing Real-time Congestion
const mockSeoulSpots = [
    { nameKo: "강남역", nameEn: "Gangnam Station", nameJa: "江南駅", level: "여유", msg: "사람이 적어 이동이 편합니다.", score: 1 },
    { nameKo: "명동관광특구", nameEn: "Myeongdong", nameJa: "明洞", level: "약간 붐빔", msg: "관광객이 많아 통행이 약간 지연될 수 있습니다.", score: 3 },
    { nameKo: "홍대입구역", nameEn: "Hongdae Station", nameJa: "弘大入口駅", level: "매우 붐빔", msg: "매우 혼잡합니다. 소지품 관리에 유의하세요.", score: 4 },
    { nameKo: "이태원 관광특구", nameEn: "Itaewon", nameJa: "梨泰院", level: "보통", msg: "일반적인 수준의 인파가 있습니다.", score: 2 },
    { nameKo: "경복궁", nameEn: "Gyeongbokgung", nameJa: "景福宮", level: "여유", msg: "쾌적하게 관람할 수 있습니다.", score: 1 },
    { nameKo: "남산서울타워", nameEn: "N Seoul Tower", nameJa: "Nソウルタワー", level: "보통", msg: "케이블카 대기 시간이 조금 있을 수 있습니다.", score: 2 },
    { nameKo: "북촌한옥마을", nameEn: "Bukchon Hanok Village", nameJa: "北村韓屋村", level: "약간 붐빔", msg: "인증샷을 찍는 인파가 꽤 있습니다.", score: 3 },
    { nameKo: "잠실 종합운동장", nameEn: "Jamsil Stadium", nameJa: "蚕室総合運動場", level: "매우 붐빔", msg: "행사로 인해 주변이 매우 혼잡합니다.", score: 4 }
];

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('cg-grid');
    const searchInput = document.getElementById('spot-search');
    
    if(!grid) return;

    // Simulate Network Delay
    setTimeout(() => {
        renderCards(mockSeoulSpots);
    }, 800);

    // Search filter
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = mockSeoulSpots.filter(spot => 
                spot.nameKo.toLowerCase().includes(term) ||
                spot.nameEn.toLowerCase().includes(term)
            );
            renderCards(filtered);
        });
    }

    function renderCards(data) {
        grid.innerHTML = '';
        
        if(data.length === 0) {
            grid.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
            return;
        }

        data.forEach(spot => {
            // Determine name based on selected language (requires i18n.js to be loaded)
            let displayName = spot.nameKo;
            if (window.currentLang === 'en') displayName = spot.nameEn;
            if (window.currentLang === 'ja') displayName = spot.nameJa;

            // Map level score to CSS class and i18n key
            let colorClass = '';
            let statusKey = '';
            switch(spot.score) {
                case 1: colorClass = 'relax'; statusKey = 'cg.status.relaxed'; break; // Green
                case 2: colorClass = 'normal'; statusKey = 'cg.status.normal'; break; // Yellow/Orange
                case 3: colorClass = 'crowded'; statusKey = 'cg.status.crowded'; break; // Orange/Red
                case 4: colorClass = 'severe'; statusKey = 'cg.status.very_crowded'; break; // Dark Red
            }

            // Translate Status Label
            let statusLabel = spot.level;
            if (window.translations && window.translations[window.currentLang] && window.translations[window.currentLang][statusKey]) {
                statusLabel = window.translations[window.currentLang][statusKey];
            }

            const card = document.createElement('div');
            card.className = 'cg-card';
            card.innerHTML = `
                <div class="cg-header">
                    <h3>${displayName}</h3>
                    <span class="cg-badge ${colorClass}">${statusLabel}</span>
                </div>
                <p class="cg-msg">${spot.msg}</p>
            `;
            grid.appendChild(card);
        });
    }

    // Re-render strings when language changes
    const langSelector = document.getElementById('lang-selector');
    if (langSelector) {
        langSelector.addEventListener('change', () => {
            // Re-render after a short delay so currentLang is updated
            setTimeout(() => {
                const term = searchInput.value.toLowerCase();
                const filtered = mockSeoulSpots.filter(spot => 
                    spot.nameKo.toLowerCase().includes(term) ||
                    spot.nameEn.toLowerCase().includes(term)
                );
                renderCards(filtered);
            }, 50);
        });
    }
});
