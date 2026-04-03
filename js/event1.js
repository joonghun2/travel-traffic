import { animate, spring } from "https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm";

const questions = [
    {
        ko: { q: "비행기 표 예매 완료! 그다음 내 행동은?", a: "\"1일 차 10:00 브런치, 11:30 카페...\" 엑셀을 켜고 분 단위로 짠다.", b: "\"오사카 간다 야호!\" 일단 유튜브 브이로그부터 정주행한다." },
        en: { q: "Flight tickets booked! What's your next move?", a: "Open Excel and plan the itinerary down to the minute: 'Day 1 10:00 Brunch...'", b: "Yay! Time to binge-watch travel vlogs on YouTube." },
        typeA: "J", typeB: "P"
    },
    {
        ko: { q: "현지 맛집을 찾을 때, 내가 더 믿는 것은?", a: "인스타그램 릴스에 뜨는 비주얼 폭발 핫플레이스.", b: "구글맵 평점 4.0 이상, 리뷰 2,000개가 넘는 찐 후기." },
        en: { q: "When searching for local restaurants, what do you trust more?", a: "Visually stunning hot spots trending on Instagram Reels.", b: "Google Maps with 4.0+ ratings and 2,000+ genuine reviews." },
        typeA: "F", typeB: "T"
    },
    {
        ko: { q: "유명하다는 도톤보리 맛집, 대기 줄이 2시간이라면?", a: "\"여기 오려고 여행 온 건데!\" 무조건 기다린다.", b: "\"기다리다 지쳐...\" 바로 근처에 있는 대기 없는 다른 식당으로 발길을 돌린다." },
        en: { q: "A famous Dotonbori restaurant has a 2-hour wait. You...", a: "Wait no matter what! I came all the way here for this.", b: "Too tired to wait. Let's find an empty place nearby." },
        typeA: "J", typeB: "P"
    },
    {
        ko: { q: "길을 잃었다! 설상가상으로 휴대폰 배터리도 5% 남았다면?", a: "당황하지 않고 주변 사람에게 바디랭귀지로 길을 묻는다.", b: "일단 배터리가 꺼지기 전에 지도 앱부터 캡처하고 본다." },
        en: { q: "You're lost and your phone battery is at 5%. You...", a: "Stay calm and use body language to ask locals for directions.", b: "Quickly screenshot the map app before the phone dies." },
        typeA: "E", typeB: "I"
    },
    {
        ko: { q: "내가 생각하는 '인생 여행지'의 기준은?", a: "누가 봐도 예쁘고 SNS에 올리면 '좋아요' 폭발하는 곳.", b: "관광객 하나 없이 조용하고, 그 나라의 진짜 일상을 엿볼 수 있는 곳." },
        en: { q: "Your definition of a 'perfect travel destination' is...", a: "A gorgeous place guaranteed to get likes on social media.", b: "A quiet, tourist-free spot where you can experience real local life." },
        typeA: "E", typeB: "I"
    },
    {
        ko: { q: "친구가 여행지에서 늦잠을 잔다. 이때 내 반응은?", a: "\"야 빨리 일어나!! 우리 일정 다 꼬인다고!\" (분노)", b: "\"피곤한가 보네. 더 자라~ 난 혼자 근처 산책하고 올게.\" (평온)" },
        en: { q: "Your friend oversleeps during the trip. Your reaction?", a: "Wake up!! You're ruining our schedule! (Angry)", b: "Must be tired. Sleep more, I'll go for a walk by myself. (Calm)" },
        typeA: "J", typeB: "P"
    },
    {
        ko: { q: "드디어 여행 마지막 날 밤, 나의 모습은?", a: "\"아쉽다. 다음 여행은 어디로 갈까?\" 벌써 다음 항공권을 검색한다.", b: "\"하얗게 불태웠다. 당분간 여행 생각은 안 날 듯.\" 캐리어에 짐을 쑤셔 넣는다." },
        en: { q: "Finally, the last night of the trip. You are...", a: "Already searching for flight tickets for the next trip.", b: "Totally exhausted. Stuffing things into the suitcase." },
        typeA: "E", typeB: "I"
    }
];

const results = {
    "type1": {
        match: (scores) => scores.J >= 2,
        ko: {
            title: "구글맵 맹신론자,<br>척척박사 인간 내비게이션",
            emoji: "🧭",
            desc: "맛없고 비싼 관광객 전용 식당은 절대 안 갑니다. 구글맵 평점과 현지인 후기를 교차 검증해야 직성이 풀리는 완벽주의자. 당신과 함께라면 굶을 일은 없어요!",
            bestMate: "\"좋아! 난 다 좋아!\" 무계획 방랑자",
            worstMate: "\"여긴 내 스타일 아닌데?\" 고집불통 통제러",
            cta: "계획이 틀어지는 게 싫다면? 혼잡도부터 슬쩍 확인해 보세요 👉 CheckEastPoint"
        },
        en: {
            title: "Google Maps Devotee,<br>The Human Navigator",
            emoji: "🧭",
            desc: "You never settle for overpriced tourist traps. A perfectionist who cross-checks Google ratings with local reviews. No one starves when traveling with you!",
            bestMate: "\"I love whatever!\" The Spontaneous Nomad",
            worstMate: "\"This isn't my style.\" The Stubborn Controller",
            cta: "Hate ruined plans? Check real-time crowd levels 👉 CheckEastPoint"
        }
    },
    "type2": {
        match: (scores) => scores.I >= 2 && scores.P <= scores.J,
        ko: {
            title: "인파 속 기 빨리는<br>유리멘탈 개복치",
            emoji: "🫧",
            desc: "사람 많은 곳에 가면 급격히 에너지가 방전됩니다. 시끌벅적한 관광지보다는 아무도 없는 골목길이나 조용한 카페 창가 자리를 더 사랑합니다.",
            bestMate: "말없이 같이 걸어주는 조용한 방랑자",
            worstMate: "\"아직 안 끝났어! 다음 코스 가자!\" 지치지 않는 에너자이저",
            cta: "사람 많은 곳을 피하고 싶을 땐, 대기 없는 숨은 명소 찾기 👉 CheckEastPoint"
        },
        en: {
            title: "Overwhelmed by Crowds,<br>The Fragile Wanderer",
            emoji: "🫧",
            desc: "Your energy drains rapidly in crowded places. You vastly prefer an empty alleyway or a quiet window seat at a café over bustling tourist spots.",
            bestMate: "The silent wanderer who walks beside you",
            worstMate: "\"We're not done yet! Next spot!\" The Tireless Energizer",
            cta: "Want to avoid crowds? Find hidden calm spots 👉 CheckEastPoint"
        }
    },
    "type3": {
        match: (scores) => scores.E >= 2,
        ko: {
            title: "감성에 살고 감성에 죽는<br>인간 핀터레스트",
            emoji: "📸",
            desc: "남는 건 사진뿐! 음식 맛보다는 그릇과 인테리어가, 숙소의 편안함보다는 창밖 뷰가 더 중요합니다. 1,000장 찍어서 1장 건지면 그 여행은 대성공입니다.",
            bestMate: "지칠 때까지 인생샷 100장 찍어주는 열정 포토그래퍼",
            worstMate: "\"사진 그만 찍고 밥이나 먹자\" 실용주의 팩트폭격기",
            cta: "예쁜 사진 명소, 사람 없을 때 맞춰 가기 👉 CheckEastPoint"
        },
        en: {
            title: "Aesthetics Ahoy,<br>The Human Pinterest",
            emoji: "📸",
            desc: "If it's not on camera, it didn't happen! The plating and the view matter more than the taste and comfort. Taking 1,000 shots to get 1 perfect pic is a huge success.",
            bestMate: "The passionate photographer who never tires of taking pics",
            worstMate: "\"Stop taking photos and let's eat.\" The Pragmatic Realist",
            cta: "Visit aesthetic spots when they are empty 👉 CheckEastPoint"
        }
    },
    "type4": {
        match: () => true,
        ko: {
            title: "발길 닿는 곳이 곧 길,<br>무계획 방랑자",
            emoji: "🍃",
            desc: "여권과 지갑만 있으면 어디든 갈 수 있습니다. 철저한 계획보다는 우연히 발견한 길거리 식당에서의 한 끼를 더 오래 기억하는 진정한 여행자입니다.",
            bestMate: "나를 이끌어주는 든든한 인간 내비게이션",
            worstMate: "\"지금 계획 틀어졌잖아!\" 분노의 엑셀러",
            cta: "계획 없어도 괜찮아요, 핫플 실시간 혼잡도만 슬쩍 👉 CheckEastPoint"
        },
        en: {
            title: "Walking Where the Wind Blows,<br>The Spontaneous Nomad",
            emoji: "🍃",
            desc: "As long as you have your passport and wallet, you can go anywhere. You cherish a meal at a random street food stall over a meticulously planned itinerary.",
            bestMate: "The reliable Human Navigator who leads the way",
            worstMate: "\"The plan's ruined!\" The Rage Spreadsheeter",
            cta: "No plan? Just check real-time crowd levels 👉 CheckEastPoint"
        }
    }
};

let currentQ = 0;
let scores = { J: 0, P: 0, T: 0, F: 0, I: 0, E: 0 };
let currentLang = 'ko';

function switchView(hideId, showId) {
    const hideEl = document.getElementById(hideId);
    const showEl = document.getElementById(showId);
    
    animate(hideEl, { opacity: 0, y: -20 }, { duration: 0.25 }).finished.then(() => {
        hideEl.classList.remove('active');
        hideEl.classList.add('hidden');
        
        showEl.classList.remove('hidden');
        showEl.classList.add('active');
        animate(showEl, { opacity: [0, 1], y: [30, 0] }, { duration: 0.4, ease: [0.22, 1, 0.36, 1] });
    });
}

function initTest() {
    currentLang = document.getElementById('lang-selector')?.value || 'ko';
    document.getElementById('btn-start').addEventListener('click', () => {
        renderQuestion();
        switchView('view-landing', 'view-question');
    });

    document.getElementById('btn-opt-A').addEventListener('click', () => handleAnswer('A'));
    document.getElementById('btn-opt-B').addEventListener('click', () => handleAnswer('B'));
    document.getElementById('btn-restart').addEventListener('click', restartTest);
    
    document.getElementById('btn-share-kakao').addEventListener('click', shareKakao);
    document.getElementById('btn-share-insta').addEventListener('click', shareInsta);
    document.getElementById('btn-viral-cta').addEventListener('click', shareViralCTA);
}

function renderQuestion() {
    const qData = questions[currentQ][currentLang] || questions[currentQ]['en'];
    
    document.getElementById('q-num').innerText = `Q${currentQ + 1}.`;
    document.getElementById('q-title').innerText = qData.q;
    document.getElementById('btn-opt-A').innerHTML = qData.a;
    document.getElementById('btn-opt-B').innerHTML = qData.b;
    
    const progress = ((currentQ) / questions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    animate(".btn-option", { opacity: [0, 1], y: [20, 0] }, { duration: 0.35, delay: spring(0.08) });
}

function handleAnswer(choice) {
    const type = questions[currentQ][`type${choice}`];
    scores[type] = (scores[type] || 0) + 1;
    
    currentQ++;
    if (currentQ < questions.length) {
        animate(".question-content", { opacity: [1, 0] }, { duration: 0.15 }).finished.then(() => {
            renderQuestion();
            animate(".question-content", { opacity: [0, 1] }, { duration: 0.25 });
        });
    } else {
        showResult();
    }
}

function showResult() {
    document.getElementById('progress-fill').style.width = `100%`;
    switchView('view-question', 'view-loading');
    
    setTimeout(() => {
        calculateAndRenderResult();
        switchView('view-loading', 'view-result');
        
        // Spring slide-up animation for chemistry + CTA with 0.5s delay
        setTimeout(() => {
            animateSlideUp('#chemistry-section', 0);
            animateSlideUp('#viral-cta-wrapper', 120);
            animateSlideUp('#action-buttons', 240);
        }, 500);
    }, 1500);
}

function animateSlideUp(selector, delayMs) {
    const el = document.querySelector(selector);
    if (!el) return;
    setTimeout(() => {
        animate(el, 
            { opacity: [0, 1], y: [40, 0] }, 
            { duration: 0.6, easing: spring({ stiffness: 300, damping: 20 }) }
        );
    }, delayMs);
}

function calculateAndRenderResult() {
    let finalType = "type4";
    for (const [key, resultObj] of Object.entries(results)) {
        if (resultObj.match(scores)) {
            finalType = key;
            break;
        }
    }
    
    const resData = results[finalType][currentLang] || results[finalType]['en'];
    document.getElementById('result-title').innerHTML = resData.title;
    document.getElementById('result-emoji').innerText = resData.emoji;
    document.getElementById('result-desc').innerText = resData.desc;
    document.getElementById('result-best-mate').innerText = resData.bestMate;
    document.getElementById('result-worst-mate').innerText = resData.worstMate;
    document.getElementById('cta-text').innerText = resData.cta;
}

function restartTest() {
    currentQ = 0;
    scores = { J: 0, P: 0, T: 0, F: 0, I: 0, E: 0 };
    
    // Reset animation states
    ['#chemistry-section', '#viral-cta-wrapper', '#action-buttons'].forEach(sel => {
        const el = document.querySelector(sel);
        if (el) { el.style.opacity = '0'; el.style.transform = 'translateY(40px)'; }
    });
    
    switchView('view-result', 'view-landing');
}

// ── Sharing ──

function shareViralCTA() {
    const shareData = {
        title: currentLang === 'en' 
            ? 'Travel Survival Test' 
            : '여행 생존 유형 테스트',
        text: currentLang === 'en'
            ? "Are we a perfect travel match or total chaos? Take the test! 👉"
            : "우리 여행 가면 찰떡일까, 원수일까? 테스트 해보기 👉",
        url: 'https://www.checkeastpoint.com/event1'
    };

    if (navigator.share) {
        navigator.share(shareData).catch(() => {});
    } else {
        // Fallback: copy link
        navigator.clipboard.writeText(shareData.url).then(() => {
            showToast(currentLang === 'en' ? 'Link copied!' : '링크가 복사되었어요! 🎉');
        }).catch(() => {
            showToast(currentLang === 'en' ? 'Copy failed' : '복사 실패');
        });
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function shareKakao() {
    if (window.Kakao && window.Kakao.isInitialized()) {
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: currentLang === 'en' ? 'Travel Survival Test' : '여행 생존 유형 테스트',
                description: currentLang === 'en' 
                    ? 'Find out your true travel persona! Take the free test now!' 
                    : '나의 진짜 여행 자아는? 지금 무료로 확인해보세요!',
                imageUrl: 'https://www.checkeastpoint.com/img/event1_og_thumbnail.png',
                link: {
                    mobileWebUrl: 'https://www.checkeastpoint.com/event1',
                    webUrl: 'https://www.checkeastpoint.com/event1',
                },
            },
            buttons: [{
                title: currentLang === 'en' ? 'Take the test' : '테스트 하러 가기',
                link: {
                    mobileWebUrl: 'https://www.checkeastpoint.com/event1',
                    webUrl: 'https://www.checkeastpoint.com/event1',
                },
            }],
        });
    } else {
        showToast(currentLang === 'en' ? 'Kakao SDK is not initialized.' : '카카오톡 공유가 초기화되지 않았습니다.');
    }
}

function shareInsta() {
    const captureEl = document.getElementById('capture-area');
    html2canvas(captureEl, { scale: 2, backgroundColor: '#F7F8FA' }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'my-travel-persona.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast(currentLang === 'en' ? 'Image saved!' : '이미지가 저장되었어요! 📸');
    });
}

document.addEventListener('DOMContentLoaded', initTest);
window.addEventListener('languageChanged', (e) => {
    currentLang = e.detail?.lang || e.detail || 'ko';
    if(currentQ < questions.length && document.getElementById('view-question').classList.contains('active')) {
        renderQuestion();
    }
});
