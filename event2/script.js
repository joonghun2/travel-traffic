(function () {
    let currentLang = 'ko';
    let currentCity = '';
    let currentQIndex = 0;
    let currentScore = 0;
    let questionsData = [];
    let history = []; // stores scores to reverse if going back

    // DOM Elements
    const body = document.body;
    const langSelector = document.getElementById('lang-selector');
    const viewGateway = document.getElementById('view-gateway');
    const viewQuestion = document.getElementById('view-question');
    const viewResult = document.getElementById('view-result');
    const flashOverlay = document.getElementById('flash-overlay');
    const memePopup = document.getElementById('meme-popup');

    // Init
    function init() {
        const params = new URLSearchParams(window.location.search);
        let langParam = params.get('lang');
        if (!langParam) {
            const browserLang = (navigator.language || 'ko').split('-')[0];
            langParam = ['ko', 'en', 'ja'].includes(browserLang) ? browserLang : 'en';
        }
        currentLang = langParam;
        langSelector.value = currentLang;

        langSelector.addEventListener('change', (e) => {
            currentLang = e.target.value;
            applyTranslations();
            if (currentCity && !viewGateway.classList.contains('active')) {
                if (viewQuestion.classList.contains('active')) renderQuestion();
                if (viewResult.classList.contains('active')) displayResult();
            }
        });

        applyTranslations();
        setupGateway();
        setupEvents();
    }

    function setupEvents() {
        document.getElementById('btn-back')?.addEventListener('click', handleBack);
        document.getElementById('btn-restart')?.addEventListener('click', (e) => {
            e.preventDefault();
            const url = new URL(window.location.href);
            url.searchParams.delete('city');
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

    function applyTranslations() {
        if (!window.i18nData || !window.i18nData[currentLang]) return;
        const d = window.i18nData[currentLang];
        
        document.getElementById('gw-eyebrow').innerText = d.gateway.eyebrow;
        document.getElementById('gw-title').innerText = d.gateway.title;
        document.getElementById('gw-desc').innerText = d.gateway.desc;
        
        const cards = document.querySelectorAll('.city-card');
        cards.forEach(card => {
            const cName = card.dataset.city;
            card.innerText = d.gateway.cities[cName];
        });

        document.getElementById('kakao-ad-start').style.display = currentLang === 'ko' ? 'block' : 'none';
        document.getElementById('klook-ad-start').style.display = currentLang !== 'ko' ? 'block' : 'none';
        document.getElementById('kakao-ad-result').style.display = currentLang === 'ko' ? 'block' : 'none';
        document.getElementById('klook-ad-result').style.display = currentLang !== 'ko' ? 'block' : 'none';
        
        document.getElementById('share-btn-text').innerText = d.sharing.shareBtn;
        document.getElementById('restart-btn-text').innerText = d.sharing.restartBtn;
        document.getElementById('cta-text').innerText = d.result.cta;
    }

    function switchView(viewId) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active', 'hidden'));
        document.querySelectorAll('.view-section').forEach(el => {
            if (el.id !== viewId) el.classList.add('hidden');
        });
        const target = document.getElementById(viewId);
        target.classList.add('active');
        window.scrollTo(0,0);
    }

    function setupGateway() {
        document.querySelectorAll('.city-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentCity = e.target.dataset.city;
                startQuiz();
            });
        });
    }

    function startQuiz() {
        currentQIndex = 0;
        currentScore = 0;
        history = [];
        questionsData = window.i18nData[currentLang].quiz.questions[currentCity];
        
        const neonColor = window.i18nData[currentLang].quiz.cityThemeColors[currentCity];
        document.documentElement.style.setProperty('--current-city-color', neonColor);
        document.getElementById('q-progress-fill').style.backgroundColor = neonColor;
        document.getElementById('q-num').style.color = neonColor;
        document.getElementById('q-progress-fill').parentElement.style.borderColor = neonColor;
        document.getElementById('tier-badge').style.color = neonColor;
        document.getElementById('tier-badge').style.borderColor = neonColor;
        document.getElementById('capture-area').style.borderColor = neonColor;
        document.getElementById('score-counter').style.color = neonColor;
        document.getElementById('q-city-tag').innerText = window.i18nData[currentLang].gateway.cities[currentCity];

        renderQuestion();
        switchView('view-question');
    }

    function renderQuestion() {
        if (currentQIndex >= questionsData.length) {
            finishQuiz();
            return;
        }
        const qData = questionsData[currentQIndex];
        document.getElementById('q-num').innerText = `Q${currentQIndex + 1}.`;
        document.getElementById('q-title').innerText = qData.q;
        
        const btnA = document.getElementById('btn-opt-A');
        const btnB = document.getElementById('btn-opt-B');
        
        btnA.innerText = qData.optA.text;
        btnB.innerText = qData.optB.text;

        btnA.onclick = (e) => handleOptionClick(qData.optA.score, e);
        btnB.onclick = (e) => handleOptionClick(qData.optB.score, e);

        const btnBack = document.getElementById('btn-back');
        btnBack.style.display = currentQIndex > 0 ? 'inline-flex' : 'none';

        const progress = ((currentQIndex) / questionsData.length) * 100;
        document.getElementById('q-progress-fill').style.width = `${progress}%`;
    }

    function handleBack() {
        if (currentQIndex <= 0) return;
        const lastScore = history.pop();
        currentScore -= lastScore;
        currentQIndex--;
        renderQuestion();
    }

    function handleOptionClick(scoreAdded, event) {
        currentScore += scoreAdded;
        history.push(scoreAdded);
        
        const floatText = scoreAdded > 0 ? `+${scoreAdded} EXP` : `${scoreAdded} CRITICAL`;
        showFloatingText(floatText, scoreAdded > 0, event.clientX, event.clientY);

        if (scoreAdded < 0) {
            triggerPenalty();
        }

        setTimeout(() => {
            currentQIndex++;
            renderQuestion();
        }, 500);
    }

    function showFloatingText(text, isPositive, x, y) {
        const floater = document.createElement('div');
        floater.className = isPositive ? 'floating-heal' : 'floating-damage';
        floater.innerText = text;
        floater.style.left = `${x}px`;
        floater.style.top = `${y}px`;
        document.body.appendChild(floater);
        setTimeout(() => floater.remove(), 1000);
    }

    function triggerPenalty() {
        body.classList.add('shake-hard');
        flashOverlay.classList.add('flash-active');
        memePopup.classList.add('popup-active');
        setTimeout(() => {
            body.classList.remove('shake-hard');
            flashOverlay.classList.remove('flash-active');
            memePopup.classList.remove('popup-active');
        }, 300);
    }

    function finishQuiz() {
        document.getElementById('q-progress-fill').style.width = `100%`;
        setTimeout(() => {
            switchView('view-result');
            displayResult();
        }, 300);
    }

    function getResultTier() {
        if (currentScore >= 500) return 'tier4';
        if (currentScore >= 100) return 'tier3';
        if (currentScore >= -200) return 'tier2';
        return 'tier1';
    }

    function displayResult() {
        const d = window.i18nData[currentLang].result;
        document.getElementById('result-eyebrow').innerText = d.eyebrow;
        
        const tierKey = getResultTier();
        const cityDesc = d.descriptions[currentCity][tierKey];

        document.getElementById('tier-badge').innerText = cityDesc.badge;
        document.getElementById('result-title').innerText = cityDesc.title;
        document.getElementById('result-desc').innerText = cityDesc.desc;

        animateSlotMachineCounter(currentScore);

        window.finalTierText = cityDesc.title;
    }

    function animateSlotMachineCounter(finalScore) {
        const counter = document.getElementById('score-counter');
        const duration = 1500;
        const start = performance.now();
        const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

        function update(time) {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuart(progress);
            
            if (progress < 0.8) {
                const randomOffset = Math.floor(Math.random() * 2000) - 1000;
                counter.innerText = Math.floor(finalScore * easedProgress) + randomOffset;
            } else {
                counter.innerText = Math.floor(finalScore * easedProgress);
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.innerText = finalScore;
            }
        }
        requestAnimationFrame(update);
    }

    // --- Viral Sharing Features ---

    function getShareData() {
        const d = window.i18nData[currentLang].sharing;
        const tier = window.finalTierText || "";
        const title = d.title;
        const text = d.textTemplate.replace("{tier}", tier).replace("{score}", currentScore);
        const url = new URL(window.location.href);
        url.searchParams.set('lang', currentLang);
        return { title, text, url: url.toString() };
    }

    function showToast(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function shareNative() {
        const data = getShareData();
        if (navigator.share) {
            navigator.share({ title: data.title, text: data.text, url: data.url }).catch(console.error);
        } else {
            navigator.clipboard.writeText(`${data.text}\n${data.url}`).then(() => {
                showToast(window.i18nData[currentLang].sharing.copySuccess);
            });
        }
    }

    function shareX() {
        const data = getShareData();
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(data.text)}&url=${encodeURIComponent(data.url)}`, '_blank');
    }

    function shareReddit() {
        const data = getShareData();
        window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title)}`, '_blank');
    }

    function shareInsta() {
        if (typeof html2canvas === 'undefined') return;
        const captureEl = document.getElementById('capture-area');
        if (!captureEl) return;
        
        // Hide elements temporarily if needed, though mostly okay as is
        html2canvas(captureEl, { scale: 2, backgroundColor: '#1a1a1a' }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'local-survival-result.png';
            link.href = canvas.toDataURL();
            link.click();
            showToast(window.i18nData[currentLang].sharing.imgSuccess);
        });
    }

    function shareKakao() {
        if (window.Kakao && window.Kakao.isInitialized()) {
            const data = getShareData();
            
            Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: data.title,
                    description: data.text,
                    imageUrl: 'https://www.checkeastpoint.com/event1/og_thumb.png', // Fallback, could be custom event2 image
                    link: { mobileWebUrl: data.url, webUrl: data.url },
                },
                buttons: [{
                    title: window.i18nData[currentLang].sharing.testBtn,
                    link: { mobileWebUrl: data.url, webUrl: data.url },
                }],
            });
        } else {
            showToast('Kakao sharing not ready.');
        }
    }

    document.addEventListener("DOMContentLoaded", init);
})();
