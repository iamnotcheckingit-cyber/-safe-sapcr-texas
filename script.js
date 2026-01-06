// SAFE SAPCR TX - Live Counter Script

// Default Judgment Date: August 20, 2024
const defaultJudgmentDate = new Date('2024-08-20T00:00:00');

// Update the counters
function updateCounters() {
    const now = new Date();
    const diff = now - defaultJudgmentDate;
    
    // Calculate time components
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    // Update main counter
    const daysCounter = document.getElementById('days-counter');
    if (daysCounter) {
        daysCounter.textContent = days.toLocaleString();
    }
    
    // Update live clock
    const clockDays = document.getElementById('clock-days');
    const clockHours = document.getElementById('clock-hours');
    const clockMinutes = document.getElementById('clock-minutes');
    const clockSeconds = document.getElementById('clock-seconds');
    
    if (clockDays) {
        clockDays.textContent = days.toString().padStart(3, '0');
    }
    if (clockHours) {
        clockHours.textContent = (hours % 24).toString().padStart(2, '0');
    }
    if (clockMinutes) {
        clockMinutes.textContent = (minutes % 60).toString().padStart(2, '0');
    }
    if (clockSeconds) {
        clockSeconds.textContent = (seconds % 60).toString().padStart(2, '0');
    }
}

// Mobile menu toggle
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        function toggleMenu() {
            const isActive = menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isActive);
        }

        function closeMenu() {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }

        menuToggle.addEventListener('click', toggleMenu);

        // Keyboard support - Enter and Space to toggle
        menuToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });

        // Close menu when a link is clicked
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                closeMenu();
            }
        });

        // Close menu on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menuToggle.classList.contains('active')) {
                closeMenu();
                menuToggle.focus();
            }
        });
    }
}

// Smooth scroll for navigation links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCounters();
    setInterval(updateCounters, 1000);
    initSmoothScroll();
    initMobileMenu();
});
