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
                spot.nameEn.toLowerCase().includes(term) ||
                spot.nameJa.toLowerCase().includes(term)
            );
            renderCards(filtered);
        });
    }

    function renderCards(data) {
        grid.innerHTML = '';
        
        if(data.length === 0) {
            const noResultsMsg = (window.t) ? window.t('cg.label.no_results', '검색 결과가 없습니다.') : '검색 결과가 없습니다.';
            grid.innerHTML = `<div class="no-results">${noResultsMsg}</div>`;
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

            const kakaoLink = `https://map.kakao.com/link/search/${encodeURIComponent(spot.nameKo)}`;
            const uberLink = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[query]=${encodeURIComponent(spot.nameKo)}`;
            
            let statusEmoji = '🌱';
            let cv = 25;
            if(spot.score === 1) { statusEmoji = '🌱'; cv = 25; }
            if(spot.score === 2) { statusEmoji = '🚶'; cv = 50; }
            if(spot.score === 3) { statusEmoji = '⚠️'; cv = 75; }
            if(spot.score === 4) { statusEmoji = '🔥'; cv = 90; }
            
            const dashOffset = 408 - (408 * cv / 100);

            const card = document.createElement('div');
            card.className = 'bento-card relative-card';
            card.style.position = 'relative'; 
            
            card.onmouseenter = () => { const ov = card.querySelector('.route-overlay'); if(ov) ov.style.opacity = '1'; };
            card.onmouseleave = () => { const ov = card.querySelector('.route-overlay'); if(ov) ov.style.opacity = '0'; };

            card.innerHTML = `
                <div class="route-overlay" onclick="if(window.RouteStore) window.RouteStore.addSpot(${spot.id}); event.stopPropagation();" style="position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(255,255,255,0.85); backdrop-filter:blur(5px); display:flex; flex-direction:column; align-items:center; justify-content:center; opacity:0; transition:opacity 0.3s; z-index:20; border-radius:inherit; cursor:pointer;">
                    <div style="font-size:3rem; margin-bottom:15px; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.1));">🗺️</div>
                    <div style="font-size:1.1rem; font-weight:800; background:var(--primary-color, #ff385c); padding:12px 24px; border-radius:30px; color:#fff; display:flex; gap:8px; align-items:center; box-shadow:0 10px 20px rgba(255,56,92,0.3);">
                        <span>+</span> <span>${window.t ? window.t('cg.btn.add_route', '내 루트에 담기') : '내 루트에 담기'}</span>
                    </div>
                </div>

                <div class="bento-header" style="position:relative; z-index:2;">
                    <h3 class="bento-title">${displayName}</h3>
                    <p class="bento-subtitle">(${spot.msg})</p>
                </div>
                
                <div class="gauge-container" style="position:relative; z-index:2;">
                    <svg class="gauge-svg" viewBox="0 0 150 150">
                        <circle class="gauge-bg" cx="75" cy="75" r="65"></circle>
                        <circle class="gauge-bar ${colorClass}" cx="75" cy="75" r="65" style="stroke-dashoffset: 408;"></circle>
                    </svg>
                    <div class="gauge-content">
                        <div class="gauge-val">${cv}%</div>
                        <div class="gauge-lbl ${colorClass}">${statusLabel}</div>
                    </div>
                </div>

                <div class="status-box" style="position:relative; z-index:2;">
                    <div class="status-headline">${window.t ? window.t('cg.label.now', '지금') : '지금'} ${statusLabel} ${statusEmoji}</div>
                    <div class="context-box ${colorClass}">
                        <span>⏰ ${(window.t) ? window.t('cg.label.rec_time', '추천 시간:') : '추천 시간:'} ${window.currentLang === 'en' ? 'Anytime' : window.currentLang === 'ja' ? 'いつでも快適' : '언제든 쾌적'}</span>
                    </div>
                </div>

                <div class="cta-group" style="position:relative; z-index:30;">
                    <a href="${kakaoLink}" class="cta-btn cta-kakao" target="_blank" onclick="event.stopPropagation();">
                        🚕 ${window.t ? window.t('cg.btn.kakao', '카카오T 호출하기') : '카카오T 호출하기'}
                    </a>
                    <a href="${uberLink}" class="cta-btn cta-uber" target="_blank" onclick="event.stopPropagation();">
                        🚗 ${window.t ? window.t('cg.btn.uber', 'Uber 부르기') : 'Uber 부르기'}
                    </a>
                </div>
            `;
            grid.appendChild(card);
            
            setTimeout(() => {
                const bar = card.querySelector('.gauge-bar');
                if (bar) bar.style.strokeDashoffset = dashOffset;
            }, 50);
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
                    spot.nameEn.toLowerCase().includes(term) ||
                    spot.nameJa.toLowerCase().includes(term)
                );
                renderCards(filtered);
            }, 50);
        });
    }

    // Auto-refresh every 5 minutes
    setInterval(() => {
        const term = searchInput.value.toLowerCase();
        const filtered = mockSeoulSpots.filter(spot => 
            spot.nameKo.toLowerCase().includes(term) ||
            spot.nameEn.toLowerCase().includes(term) ||
            spot.nameJa.toLowerCase().includes(term)
        );
        renderCards(filtered);
    }, 300000);
});
