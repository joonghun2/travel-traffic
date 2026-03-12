document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const spotId = urlParams.get('spotId');
    const container = document.getElementById('restaurant-list');
    const titleEl = document.getElementById('spot-name-title');

    function renderList() {
        if (!spotId) {
            container.innerHTML = `<div class="no-results" style="text-align: center; color: var(--text-muted); padding: 3rem;">${window.t('rest.empty')}</div>`;
            titleEl.textContent = "Error";
            return;
        }

        // Set Title using i18n
        titleEl.textContent = window.t(`spot.${spotId}.name`) || "명소/Spot/名所";

        // Get the mock data for this spot (or empty array if not defined yet)
        let list = window.RESTAURANT_DATA ? (window.RESTAURANT_DATA[spotId] || []) : [];
        
        if (!list || list.length === 0) {
            container.innerHTML = `<div class="no-results" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem;">${window.t('rest.empty')}</div>`;
            return;
        }

        // 1. Filter restaurants (Rating >= 4.0)
        // 2. Sort restaurants by review count (descending)
        list = list.filter(r => r.rating >= 4.0)
                   .sort((a, b) => b.reviews - a.reviews);

        if (list.length === 0) {
            container.innerHTML = `<div class="no-results" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem;">${window.t('rest.empty')}</div>`;
            return;
        }

        // Clear loading or old content
        container.innerHTML = '';
        
        // Grab the current language for getting the correct restaurant name property
        const currentLang = window.currentLang || (window.translations && window.translations['ko'] ? 'ko' : 'en');

        // Note: The prompt requested showing up to 20 restaurants. 
        // We will slice the array to max 20 just in case.
        const displayList = list.slice(0, 20);

        displayList.forEach(r => {
            // Get proper localized name, fallback to ko -> en
            const localizedName = r.names ? (r.names[currentLang] || r.names['ko'] || r.names['en']) : r.name;

            const card = document.createElement('a');
            card.className = 'restaurant-card';
            // Each card links to a specific Google Maps Place search
            card.href = r.placeUrl;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';

            card.innerHTML = `
                <div class="rest-name">${localizedName}</div>
                <div class="rest-meta">
                    <span class="rest-rating">★ ${r.rating.toFixed(1)}</span>
                    <span>${r.reviews.toLocaleString()} ${window.t('rest.reviews', 'Reviews')}</span>
                </div>
                <div style="margin-top: auto; color: var(--primary); font-size: 0.95rem; display: flex; align-items: center; gap: 5px;">
                    ${window.t('cg.label.directions', 'Directions')} <span style="font-size: 1.2rem;">&rarr;</span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Update the list and text when language is changed via the global dropdown
    window.addEventListener('languageChanged', renderList);

    // Initial render setup with slight delay to ensure i18n map is fully populated
    setTimeout(renderList, 100);
});
