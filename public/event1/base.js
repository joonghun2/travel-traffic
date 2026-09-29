/**
 * Global I18n Engine for CheckEastPoint
 */
const I18n = {
    currentLang: 'ko',
    
    init() {
        // 1. Check URL param first (shared links carry ?lang=)
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        const supported = ['ko', 'en', 'ja'];
        
        if (urlLang && supported.includes(urlLang)) {
            this.currentLang = urlLang;
        } else {
            // 2. Auto detect browser language
            const browserLang = (navigator.language || navigator.userLanguage).split('-')[0].toLowerCase();
            this.currentLang = supported.includes(browserLang) ? browserLang : 'ko';
        }

        // 2. Set selector value
        const selector = document.getElementById('lang-selector');
        if (selector) {
            selector.value = this.currentLang;
            selector.addEventListener('change', (e) => this.setLanguage(e.target.value));
        }

        // 3. Initial translation
        this.translatePage();
    },

    setLanguage(lang) {
        this.currentLang = lang;
        this.translatePage();
        
        // Dispatch custom event for page-specific scripts (like event1.js)
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    },

    translatePage() {
        const dict = window.translations ? window.translations[this.currentLang] : null;
        if (!dict) return;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = dict[key];
                } else {
                    el.innerHTML = dict[key];
                }
            }
        });

        // Update body lang attribute for SEO
        document.documentElement.lang = this.currentLang;
    }
};

window.updateTimeOverlay = function() {
    const hour = new Date().getHours();
    let overlayColor = '';
    
    if (hour >= 6 && hour < 16) {
        overlayColor = 'rgba(10, 15, 28, 0.1)'; 
    } else if (hour >= 16 && hour < 19) {
        overlayColor = 'rgba(60, 20, 40, 0.5)';
    } else {
        overlayColor = 'rgba(5, 10, 30, 0.8)';
    }
    
    document.documentElement.style.setProperty('--time-overlay', overlayColor);
};

document.addEventListener('DOMContentLoaded', () => {
    window.updateTimeOverlay();
    setInterval(window.updateTimeOverlay, 60000);
    
    // Initialize I18n
    I18n.init();
    
    // Tab switching logic for Japan page
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabBtns.length > 0 && tabContents.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                if (btn.dataset.bg) {
                    document.body.style.backgroundImage = `url('${btn.dataset.bg}')`;
                }
                const tabId = btn.getAttribute('data-tab');
                const targetContent = document.getElementById(tabId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // Nav Link Active State
    const navLinks = document.querySelectorAll('.nav-links a');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});
