/**
 * Safe animation wrapper to prevent crashes if the motion library fails to load or acts up.
 */
const getMotion = () => {
    if (typeof animate !== 'undefined') return { animate, spring };
    if (window.motion) return window.motion;
    return null;
};

const safeAnimate = (target, values, options) => {
    const m = getMotion();
    if (m && typeof m.animate === 'function') {
        try {
            const controls = m.animate(target, values, options);
            if (controls && !controls.finished) {
                controls.finished = Promise.resolve();
            }
            return controls;
        } catch (e) {
            console.error("Animation execution failed:", e);
        }
    }
    return { finished: Promise.resolve() };
};

const questions = [
    {
        ko: { q: "비행기 표 예매 완료! 그다음 내 행동은?", a: "엑셀로 분 단위 계획", b: "일단 유튜브 브이로그 정주행" },
        en: { q: "Flight tickets booked! What's your next move?", a: "Plan every minute in Excel", b: "Watch YouTube travel vlogs" },
        ja: { q: "航空券の予約完了！次にとる行動は？", a: "エクセルで分単位の計画", b: "とりあえずYouTubeのVlogを見る" },
        scoreA: ['type1'], scoreB: ['type4']
    },
    {
        ko: { q: "현지 맛집을 찾을 때, 내가 더 믿는 것은?", a: "인스타그램 릴스 비주얼 폭발 핫플", b: "구글맵 평점 4.0 이상 찐 후기" },
        en: { q: "What do you trust more for finding restaurants?", a: "Viral visual spots on Instagram", b: "4.0+ rating, real reviews on Maps" },
        ja: { q: "現地のグルメを探す時、より信じるのは？", a: "インスタのリールの映えスポット", b: "Googleマップの星4.0以上の口コミ" },
        scoreA: ['type3'], scoreB: ['type1']
    },
    {
        ko: { q: "도톤보리 맛집 대기 줄이 2시간이라면?", a: "'여기 오려고 온 건데!' 무조건 기다림", b: "'기다리다 지쳐...' 다른 식당으로 턴" },
        en: { q: "2-hour wait at a famous Dotonbori spot?", a: "\"I came here for this!\" Wait.", b: "\"Too tired to wait.\" Go elsewhere." },
        ja: { q: "道頓堀の有名店、2時間待ちだとしたら？", a: "「これを食べに来たんだ！」並ぶ", b: "「待つのは無理…」別の店に行く" },
        scoreA: ['type3'], scoreB: ['type2']
    },
    {
        ko: { q: "길을 잃었다! 휴대폰 배터리도 5% 남았다면?", a: "당황하지 않고 바디랭귀지로 길 묻기", b: "꺼지기 전에 지도 앱부터 캡처한다" },
        en: { q: "Lost and phone battery is at 5%?", a: "Ask directions with body language", b: "Screenshot the map immediately" },
        ja: { q: "道に迷い、バッテリーも5%なら？", a: "ボディランゲージで道を尋ねる", b: "切れる前に地図をスクショする" },
        scoreA: ['type4'], scoreB: ['type1']
    },
    {
        ko: { q: "친구가 '저기 예쁘다! 그냥 들어가 볼까?' 할 때?", a: "'오, 괜찮은데? 가보자!'", b: "'잠깐만, 평점 먼저 좀 보고...'" },
        en: { q: "Friend: 'That place looks pretty! Go in?'", a: "\"Oh, sure! Let's go!\"", b: "\"Wait, let me check the rating...\"" },
        ja: { q: "「あそこ綺麗！入ってみる？」と言われたら？", a: "「いいね！行こう！」", b: "「ちょっと待って、評価を見てから」" },
        scoreA: ['type4'], scoreB: ['type1']
    },
    {
        ko: { q: "인생샷 성지 발견! 하지만 사람이 줄이 너무 길다면?", a: "'여기까지 왔는데 남겨야지!' 줄을 선다", b: "'기 빨린다... 사람 없는 데로 가자.' 포기" },
        en: { q: "Famous photo spot has a massive line?", a: "\"I must take this photo!\" Wait.", b: "\"Too crowded... let's find a quiet spot.\"" },
        ja: { q: "映えスポット発見！でも行列だったら？", a: "「ここまで来たからには！」並ぶ", b: "「疲れちゃう…静かなところへ」" },
        scoreA: ['type3'], scoreB: ['type2']
    },
    {
        ko: { q: "숙소 예약 시 내가 가장 중요하게 보는 것은?", a: "통창 뷰, 인테리어 컨셉 등 '무드'", b: "가성비, 지하철역과의 거리 등 '효율'" },
        en: { q: "What's most important when booking stays?", a: "The mood (view, interior design)", b: "Efficiency (price, distance to station)" },
        ja: { q: "宿を予約する時に一番重視するのは？", a: "ムード（景色、インテリアなど）", b: "効率（コスパ、駅からの距離など）" },
        scoreA: ['type3'], scoreB: ['type1']
    },
    {
        ko: { q: "친구가 계속 딴짓을 하거나 늦잠을 잔다면?", a: "'야, 우리 일정 다 꼬여!' 화가 난다", b: "'내 멘탈이 먼저다...' 혼자 산책한다" },
        en: { q: "Friend keeps oversleeping or slacking off?", a: "\"Our schedule is ruined!\" Get angry.", b: "\"Peace of mind first.\" Walk alone." },
        ja: { q: "友達が遅刻や寝坊を繰り返したら？", a: "「予定が台無しだよ！」怒る", b: "「自分の時間を楽しもう…」散歩する" },
        scoreA: ['type1'], scoreB: ['type2']
    },
    {
        ko: { q: "우연히 들어간 식당이 불친절하고 맛도 없다면?", a: "'뭐 어때, 이것도 다 추억이지!' 웃어넘긴다", b: "'내 소중한 한 끼를 망치다니...' 기분이 안 좋아짐" },
        en: { q: "Unfriendly and bad food at a random place?", a: "\"Whatever, it's a memory!\" Laugh it off.", b: "\"My precious meal is ruined...\" Feel bad." },
        ja: { q: "入った店が不親切で味も最悪だったら？", a: "「まあいいや、思い出だよ！」笑い飛ばす", b: "「一食が台無しに…」気分が下がる" },
        scoreA: ['type4'], scoreB: ['type2']
    },
    {
        ko: { q: "여행 마지막 날 밤, 나의 모습은?", a: "'벌써 끝이야?' 아쉬움에 다음 항공권을 검색", b: "'집이 최고다...' 하얗게 불태우고 쉴 준비" },
        en: { q: "The last night of the trip...", a: "\"Already over?\" Search for next flights.", b: "\"Home is best.\" Time to rest." },
        ja: { q: "旅行最終日の夜、あなたの姿は？", a: "「もう終わり？」次回の航空券を探す", b: "「家が一番…」燃え尽きて休む準備をする" },
        scoreA: ['type3'], scoreB: ['type2']
    }
];

const results = {
    "type1": {
        ko: {
            title: "구글맵 맹신론자,<br>척척박사 인간 내비게이션",
            emoji: "🧭",
            desc: "구글맵 평점과 현지인 후기를 교차 검증해야 직성이 풀리는 완벽주의자. 당신과 함께라면 굶을 일은 없어요!",
            bestMate: "무계획 방랑자 (\"내가 짠 계획대로 불만 없이 쫄래쫄래 잘 따라옴\")",
            worstMate: "인간 핀터레스트 (\"동선 다 짜놨는데 자꾸 예쁜 카페 보인다고 계획 틀어버림\")",
            cta: "당신이 떠나고 싶은 여행지 현재 상황이 궁금하다면 실시간 혼잡도 확인하기"
        },
        en: {
            title: "Google Maps Loyalist,<br>Human Navigation",
            emoji: "🧭",
            desc: "A perfectionist who cross-checks everything with local reviews. You're the navigator everyone relies on!",
            bestMate: "Spontaneous Nomad (\"Follows my plans without a complaint\")",
            worstMate: "Human Pinterest (\"Ruins routes with unplanned cafe stops\")",
            cta: "Curious about the current situation at your destination? Check real-time crowds!"
        },
        ja: {
            title: "Googleマップ信者、<br>博識な人間ナビゲーション",
            emoji: "🧭",
            desc: "Googleマップの星数と現地の口コミを徹底的にチェックする完璧主義者。あなたと一緒なら美味しい店に間違いなし！",
            bestMate: "無計画な放浪者 (「自分が立てた計画通りに文句を言わずについてきてくれる」)",
            worstMate: "人間ピンタレスト (「計画を完璧に立てたのに、可愛いカフェがあるたびに立ち寄って計画を狂わせる」)",
            cta: "旅行先の今の状況が気になりませんか？リアルタイムの混雑状況をチェック！"
        }
    },
    "type2": {
        ko: {
            title: "인파 속 기 빨리는<br>유리멘탈 개복치",
            emoji: "🫧",
            desc: "사람 많은 곳에 가면 에너지가 급격히 방전됩니다. 시끌벅적한 관광지보다는 아무도 없는 골목길이나 조용한 카페 자리를 더 사랑합니다.",
            bestMate: "인생샷 사냥꾼 (\"인파 없는 감성 스팟만 쏙쏙 골라가줘서 행복함\")",
            worstMate: "무계획 방랑자 (\"예약도 안 하고 무작정 갔다가 웨이팅 지옥에 갇힘\")",
            cta: "사람 많은 곳을 피하고 싶을 때 👉 CheckEastPoint"
        },
        en: {
            title: "Overwhelmed by Crowds,<br>The Fragile Sunfish",
            emoji: "🫧",
            desc: "Crowds drain your battery instantly. You prefer quiet alleys and window seats over bustling tourist traps.",
            bestMate: "Human Pinterest (\"Happy to visit hidden gems with no crowds selected for me\")",
            worstMate: "Spontaneous Nomad (\"Trapped in waiting hell because we just went without a plan\")",
            cta: "Curious about the current situation at your destination? Check real-time crowds!"
        },
        ja: {
            title: "人混みを避ける<br>ガラスのメンタルのマンボウ",
            emoji: "🫧",
            desc: "人が多い場所に行くとエネルギーが切れます。騒がしい観光地よりも、静かな路地裏やカフェが大好きです。",
            bestMate: "人間ピンタレスト (「人混みのないオシャレなスポットを厳選して連れて行ってくれる」)",
            worstMate: "無計画な放浪者 (「予約なしで突撃して、行列地獄にハマる」)",
            cta: "旅行先の今の状況が気になりませんか？リアルタイムの混雑状況をチェック！"
        }
    },
    "type3": {
        ko: {
            title: "감성에 살고 감성에 죽는<br>인간 핀터레스트",
            emoji: "📸",
            desc: "남는 건 사진뿐! 음식 맛보다는 플레이팅과 인테리어가, 숙소의 편안함보다는 창밖 뷰가 더 중요합니다. 1,000장 찍어 1장 건지면 대성공!",
            bestMate: "유리멘탈 개복치 (\"예쁜 곳 데려가면 리액션 최고! 묵묵히 짐도 잘 들어줌\")",
            worstMate: "구글맵 맹신론자 (\"사진 좀 찍으려는데 다음 일정 늦는다고 빨리 오라고 재촉함\")",
            cta: "당신이 떠나고 싶은 여행지 현재 상황이 궁금하다면 실시간 혼잡도 확인하기"
        },
        en: {
            title: "Aesthetics First,<br>The Human Pinterest",
            emoji: "📸",
            desc: "If it's not on camera, it didn't happen! The view and plating are everything to you. 1 perfect shot is a victory!",
            bestMate: "The Fragile Sunfish (\"Best reactions to pretty places! Quietly helps carry gear\")",
            worstMate: "Google Maps Loyalist (\"Constantly rushes me to the next spot while I'm taking photos\")",
            cta: "Looking for the perfect shot? Check real-time crowds!"
        },
        ja: {
            title: "感性に生き感性に死ぬ<br>人間ピンタレスト",
            emoji: "📸",
            desc: "残るのは写真だけ！味よりも見た目、快適さよりも映えが重要です。1,000枚撮って奇跡の1枚が撮れれば大成功です。",
            bestMate: "メンタル激弱マンボウ (「素敵な場所に連れて行くとリアクション最高！荷物も持ってくれる」)",
            worstMate: "Googleマップ信者 (「写真を撮りたいのに、次の予定に遅れるからと早く来るように急かす」)",
            cta: "映えスポットを狙うなら？リアルタイムの混雑状況をチェック！"
        }
    },
    "type4": {
        ko: {
            title: "발길 닿는 곳이 곧 길,<br>무계획 방랑자",
            emoji: "🍃",
            desc: "여권과 지갑만 있으면 어디든 갈 수 있습니다. 철저한 계획보다는 우연히 발견한 길거리 식당에서의 한 끼를 더 오래 기억하는 진정한 여행자입니다.",
            bestMate: "구글맵 맹신론자 (\"나는 아무 생각 없는데 알아서 하드캐리 해줘서 몸이 편함\")",
            worstMate: "유리멘탈 개복치 (\"무계획으로 한참 걷다가 길 잃으면 개복치가 쓰러져서 눈치 보임\")",
            cta: "당신이 떠나고 싶은 여행지 현재 상황이 궁금하다면 실시간 혼잡도 확인하기"
        },
        en: {
            title: "Wherever Wind Blows,<br>The Spontaneous nomad",
            emoji: "🍃",
            desc: "As long as you have your passport and wallet, you're good. You cherish random street food over a set itinerary.",
            bestMate: "Google Maps Loyalist (\"Carries the whole planning so I can just relax\")",
            worstMate: "The Fragile Sunfish (\"If I get lost, they collapse from exhaustion, making me feel guilty\")",
            cta: "No plans? No problem! Check real-time crowds!"
        },
        ja: {
            title: "足の向くまま風の向くまま、<br>無計画な放浪者",
            emoji: "🍃",
            desc: "パスポートと財布さえあればどこへでも行けます。徹底した計画よりも、偶然見つけた屋台での一食を大切にする真の旅行者です。",
            bestMate: "Googleマップ信者 (「自分は何も考えていないのに、スマートにリードしてくれるので体が楽」)",
            worstMate: "メンタル激弱マンボウ (「無計画でしばらく歩いて道に迷うと、マンボウが倒れ出すので気を使う」)",
            cta: "計画なしでも大丈夫！リアルタイムの混雑状況をチェック！"
        }
    }
};

let currentQ = 0;
let scores = { type1: 0, type2: 0, type3: 0, type4: 0 };
let answers = []; // stores 'A' or 'B' for each answered question
let currentLang = 'ko';
let finalResultType = null;

function getBestLanguage() {
    const supported = ['ko', 'en', 'ja'];
    // Check URL param first (from shared links)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && supported.includes(urlLang)) return urlLang;
    // Fallback to browser language
    const browserLang = (navigator.language || navigator.userLanguage).split('-')[0].toLowerCase();
    return supported.includes(browserLang) ? browserLang : 'en';
}

function switchView(hideId, showId) {
    const hideEl = document.getElementById(hideId);
    const showEl = document.getElementById(showId);
    if (!hideEl || !showEl) return;
    
    safeAnimate(hideEl, { opacity: 0, y: -20 }, { duration: 0.25 }).finished.then(() => {
        hideEl.classList.remove('active');
        hideEl.classList.add('hidden');
        showEl.classList.remove('hidden');
        showEl.classList.add('active');
        safeAnimate(showEl, { opacity: [0, 1], y: [30, 0] }, { duration: 0.4, ease: [0.22, 1, 0.36, 1] });
    });
}

function initTest() {
    currentLang = getBestLanguage();
    const langSelector = document.getElementById('lang-selector');
    if (langSelector) {
        langSelector.value = currentLang;
    }

    initStepDots();
    showAdByLang();
    
    document.getElementById('btn-start')?.addEventListener('click', () => {
        currentQ = 0;
        scores = { type1: 0, type2: 0, type3: 0, type4: 0 };
        answers = [];
        renderQuestion();
        switchView('view-landing', 'view-question');
    });

    document.getElementById('btn-opt-A')?.addEventListener('click', () => handleAnswer('A'));
    document.getElementById('btn-opt-B')?.addEventListener('click', () => handleAnswer('B'));
    document.getElementById('btn-back')?.addEventListener('click', handleBack);
    document.getElementById('btn-restart')?.addEventListener('click', (e) => {
        e.preventDefault();
        // Clear result param from URL
        const url = new URL(window.location.href);
        url.searchParams.delete('result');
        window.history.replaceState({}, '', url);
        location.reload();
    });
    
    document.getElementById('btn-share-kakao')?.addEventListener('click', shareKakao);
    document.getElementById('btn-share-insta')?.addEventListener('click', shareInsta);
    document.getElementById('btn-share-x')?.addEventListener('click', shareX);
    document.getElementById('btn-share-reddit')?.addEventListener('click', shareReddit);
    document.getElementById('btn-viral-cta')?.addEventListener('click', shareNative);
}

function renderQuestion() {
    const qData = questions[currentQ][currentLang] || questions[currentQ]['en'];
    const qNumEl = document.getElementById('q-num');
    const qTitleEl = document.getElementById('q-title');
    const btnA = document.getElementById('btn-opt-A');
    const btnB = document.getElementById('btn-opt-B');
    
    if (qNumEl) qNumEl.innerText = `Q${currentQ + 1}.`;
    if (qTitleEl) qTitleEl.innerText = qData.q;
    if (btnA) btnA.innerHTML = qData.a;
    if (btnB) btnB.innerHTML = qData.b;
    
    const progress = ((currentQ) / questions.length) * 100;
    const progressEl = document.getElementById('progress-fill');
    if (progressEl) progressEl.style.width = `${progress}%`;

    updateStepDots(currentQ);
    
    safeAnimate(".btn-option", { opacity: [0, 1], y: [20, 0] }, { duration: 0.35 });
}

function initStepDots() {
    const container = document.getElementById('step-dots');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < questions.length; i++) {
        const dot = document.createElement('div');
        dot.className = 'step-dot';
        dot.id = `dot-${i}`;
        container.appendChild(dot);
    }
}

function updateStepDots(currentIndex) {
    for (let i = 0; i < questions.length; i++) {
        const dot = document.getElementById(`dot-${i}`);
        if (!dot) continue;
        dot.className = 'step-dot';
        if (i < currentIndex) dot.classList.add('done');
        else if (i === currentIndex) dot.classList.add('active');
    }
}

function handleBack() {
    if (currentQ <= 0) return;
    // Remove last answer's scores
    const prevAns = answers.pop();
    currentQ--;
    const q = questions[currentQ];
    const scoreKeys = (prevAns === 'A') ? q.scoreA : q.scoreB;
    scoreKeys.forEach(type => scores[type]--);
    renderQuestion();
    updateBackButton();
}

function updateBackButton() {
    const btn = document.getElementById('btn-back');
    if (!btn) return;
    btn.style.display = currentQ > 0 ? 'flex' : 'none';
}

function handleAnswer(opt) {
    const q = questions[currentQ];
    const scoreKeys = (opt === 'A') ? q.scoreA : q.scoreB;
    scoreKeys.forEach(type => scores[type]++);
    answers.push(opt);

    currentQ++;
    if (currentQ < questions.length) {
        renderQuestion();
        updateBackButton();
    } else {
        showResult();
    }
}

function showAdByLang() {
    const kakaoLanding = document.getElementById('kakao-ad-landing');
    const kakaoResult = document.getElementById('kakao-ad-result');
    const klAd = document.getElementById('klook-ad');

    const isKo = (currentLang === 'ko');

    if (isKo) {
        if (kakaoLanding) {
            kakaoLanding.style.display = 'block';
            const ins = kakaoLanding.querySelector('ins');
            if (ins) ins.style.display = 'block';
        }
        if (kakaoResult) {
            kakaoResult.style.display = 'block';
            const ins = kakaoResult.querySelector('ins');
            if (ins) ins.style.display = 'block';
        }
        if (klAd) klAd.style.display = 'none';
    } else {
        if (kakaoLanding) kakaoLanding.style.display = 'none';
        if (kakaoResult) kakaoResult.style.display = 'none';
        if (klAd) klAd.style.display = 'block';
    }
}

function showResult() {
    const progressEl = document.getElementById('progress-fill');
    if (progressEl) progressEl.style.width = `100%`;
    switchView('view-question', 'view-loading');
    setTimeout(() => {
        calculateAndRenderResult();
        switchView('view-loading', 'view-result');
        showAdByLang();

        setTimeout(() => {
            animateSlideUp('#chemistry-section', 0);
            animateSlideUp('#viral-cta-section', 120);
            animateSlideUp('#affiliate-ads', 180);
            animateSlideUp('#action-buttons', 240);
        }, 500);
    }, 1500);
}

function animateSlideUp(selector, delayMs) {
    const el = document.querySelector(selector);
    if (!el) return;
    setTimeout(() => {
        safeAnimate(el, { opacity: [0, 1], y: [40, 0] }, { duration: 0.6 });
    }, delayMs);
}

function calculateAndRenderResult() {
    const priority = ['type2', 'type1', 'type3', 'type4'];
    let winner = priority[0];
    const maxVal = Math.max(...Object.values(scores));
    for (const type of priority) {
        if (scores[type] === maxVal) {
            winner = type;
            break;
        }
    }
    
    finalResultType = winner;
    // Update URL with result so sharing includes the result
    const url = new URL(window.location.href);
    url.searchParams.set('result', finalResultType);
    window.history.replaceState({}, '', url);
    renderResultData();
}

function calculateAndRenderResult_direct() {
    // Used when loading from shared URL — result type already set
    renderResultData();
}

function renderResultData() {
    if (!finalResultType) return;
    const resData = results[finalResultType][currentLang] || results[finalResultType]['en'];
    
    const titleEl = document.getElementById('result-title');
    const emojiEl = document.getElementById('result-emoji');
    const descEl = document.getElementById('result-desc');
    const bestMateEl = document.getElementById('result-best-mate');
    const worstMateEl = document.getElementById('result-worst-mate');
    const ctaEl = document.getElementById('cta-text');
    
    if (titleEl) titleEl.innerHTML = resData.title;
    if (emojiEl) emojiEl.innerText = resData.emoji;
    if (descEl) descEl.innerText = resData.desc;
    if (bestMateEl) bestMateEl.innerText = resData.bestMate;
    if (worstMateEl) worstMateEl.innerText = resData.worstMate;
    
    // Explicitly update CTA from resData to match the personality type context, 
    // or fall back to the generic i18n key we just updated.
    if (ctaEl) {
        ctaEl.innerText = resData.cta || (window.translations[currentLang]?.["nav.home"]);
    }
}

function getShareUrl() {
    const url = new URL(window.location.href);
    if (finalResultType) url.searchParams.set('result', finalResultType);
    // Include lang param so the recipient sees OG content in the correct language
    url.searchParams.set('lang', currentLang);
    return url.toString();
}

function getResultTitlePlain() {
    if (!finalResultType) return '';
    const resData = results[finalResultType][currentLang] || results[finalResultType]['en'];
    return resData.title.replace(/<br\s*\/?>/gi, ' ').trim();
}

function getShareText() {
    const title = getResultTitlePlain();
    if (!title) {
        if (currentLang === 'ja') return '旅行生存タイプ診断、やってみて！';
        if (currentLang === 'en') return 'Take the Travel Survival Type Test!';
        return '여행 생존 유형 테스트 해보세요!';
    }
    
    const resData = results[finalResultType][currentLang] || results[finalResultType]['en'];
    const bestHeader = (currentLang === 'ja') ? '💚 最高のパートナー: ' : (currentLang === 'en' ? '💚 Best Mate: ' : '💚 환상의 여행 메이트: ');
    const worstHeader = (currentLang === 'ja') ? '💔 最悪のパートナー: ' : (currentLang === 'en' ? '💔 Worst Mate: ' : '💔 환장의 여행 메이트: ');

    if (currentLang === 'ja') {
        return `私の旅行タイプは「${title}」！\n\n"${resData.desc}"\n\n${bestHeader}${resData.bestMate}\n${worstHeader}${resData.worstMate}\n\n診断はこちら 👇`;
    }
    if (currentLang === 'en') {
        return `My travel persona is "${title}"!\n\n"${resData.desc}"\n\n${bestHeader}${resData.bestMate}\n${worstHeader}${resData.worstMate}\n\nTake the test here 👇`;
    }
    return `나의 여행 자아는 "${title}"!\n\n"${resData.desc}"\n\n${bestHeader}${resData.bestMate}\n${worstHeader}${resData.worstMate}\n\n테스트 해보기 👇`;
}

function shareNative() {
    const title = (currentLang === 'ja') ? '旅行生存タイプテスト' : (currentLang === 'en' ? 'Travel Survival Test' : '여행 생존 유형 테스트');
    const text = getShareText();
    const url = getShareUrl();
    if (navigator.share) {
        navigator.share({ title, text, url }).catch(console.error);
    } else {
        navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
            const msg = (currentLang === 'ja') ? 'リンクがコピーされました！' : (currentLang === 'en' ? 'Link copied!' : '링크가 복사되었어요!');
            showToast(msg);
        });
    }
}

function shareX() {
    const url = getShareUrl();
    const text = getShareText();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
}

function shareReddit() {
    const url = getShareUrl();
    const title = (currentLang === 'ja') ? '旅行生存タイプテスト' : (currentLang === 'en' ? 'Travel Survival Test' : '여행 생존 유형 테스트');
    window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function shareKakao() {
    if (window.Kakao && window.Kakao.isInitialized()) {
        const shareUrl = getShareUrl();
        const resultTitle = getResultTitlePlain();
        const resData = results[finalResultType][currentLang] || results[finalResultType]['en'];
        const title = (currentLang === 'ja') ? `私は「${resultTitle}」！` : (currentLang === 'en' ? `I'm "${resultTitle}"!` : `나의 여행 자아는 "${resultTitle}"!`);
        
        const bestHeader = (currentLang === 'ja') ? '💚 最高のパートナー: ' : (currentLang === 'en' ? '💚 Best Mate: ' : '💚 환상의 메이트: ');
        const desc = `${resData.desc}\n\n${bestHeader}${resData.bestMate}`;
        
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: title,
                description: desc,
                imageUrl: (currentLang === 'ja') ? 'https://www.checkeastpoint.com/event1/og_thumb_ja.png' : (currentLang === 'en' ? 'https://www.checkeastpoint.com/event1/og_thumb_en.png' : 'https://www.checkeastpoint.com/event1/og_thumb.png'),
                link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
            },
            buttons: [{
                title: (currentLang === 'ja') ? 'テストしてみる' : (currentLang === 'en' ? 'Take the test' : '테스트 해보기'),
                link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
            }],
        });
    } else {
        showToast('Kakao sharing not ready.');
    }
}

function shareInsta() {
    if (typeof html2canvas === 'undefined') return;
    const captureEl = document.getElementById('capture-area');
    if (!captureEl) return;
    
    html2canvas(captureEl, { scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'travel-persona.png';
        link.href = canvas.toDataURL();
        link.click();
        const msg = (currentLang === 'ja') ? '画像が保存されました！' : (currentLang === 'en' ? 'Image saved!' : '이미지가 저장되었어요!');
        showToast(msg);
    });
}

window.addEventListener('languageChanged', (e) => {
    currentLang = e.detail?.lang || e.detail || 'ko';
    const landingView = document.getElementById('view-landing');
    const questionView = document.getElementById('view-question');
    const resultView = document.getElementById('view-result');
    if (questionView?.classList.contains('active')) {
        renderQuestion();
    } else if (resultView?.classList.contains('active')) {
        renderResultData();
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTest);
} else {
    initTest();
}
