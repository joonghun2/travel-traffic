window.updateTimeOverlay = function() {
    const hour = new Date().getHours();
    let overlayColor = '';
    
    if (hour >= 6 && hour < 16) {
        // Day - Bright & Warm
        overlayColor = 'rgba(10, 15, 28, 0.1)'; 
    } else if (hour >= 16 && hour < 19) {
        // Sunset - Orange/Pink tint
        overlayColor = 'rgba(60, 20, 40, 0.5)';
    } else {
        // Night - Dark Blue/Navy tint
        overlayColor = 'rgba(5, 10, 30, 0.8)';
    }
    
    document.documentElement.style.setProperty('--time-overlay', overlayColor);
};

document.addEventListener('DOMContentLoaded', () => {
    window.updateTimeOverlay();
    setInterval(window.updateTimeOverlay, 60000); // Check every minute
    
    // Tab switching logic for Japan page
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabBtns.length > 0 && tabContents.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                btn.classList.add('active');
                
                // Update background for Japan subdivisions
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
