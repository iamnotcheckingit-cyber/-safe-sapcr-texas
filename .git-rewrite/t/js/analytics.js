/**
 * SAFE SAPCR Texas - Privacy-Respecting Analytics
 * No PII collected. IP anonymization enabled.
 */

// Track custom events
function trackEvent(category, action, label) {
    if (typeof gtag === 'function') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// Initialize tracking on page load
document.addEventListener('DOMContentLoaded', function() {

    // Track outbound links to legislators
    document.querySelectorAll('a[href*="senate.texas.gov"], a[href*="house.texas.gov"]').forEach(function(link) {
        link.addEventListener('click', function() {
            trackEvent('Engagement', 'legislator_contact', 'clicked');
        });
    });

    // Track PDF downloads
    document.querySelectorAll('a[href$=".pdf"]').forEach(function(link) {
        link.addEventListener('click', function() {
            trackEvent('Download', 'pdf_download', this.getAttribute('href'));
        });
    });

    // Track navigation to key pages
    document.querySelectorAll('a[href="/case-study"], a[href="/legislation"], a[href="/petition"], a[href="/membership"]').forEach(function(link) {
        link.addEventListener('click', function() {
            trackEvent('Navigation', 'key_page', this.getAttribute('href'));
        });
    });

    // Track external links (non-legislator)
    document.querySelectorAll('a[href^="http"]:not([href*="safesapcrtx.org"])').forEach(function(link) {
        if (!link.href.includes('senate.texas.gov') && !link.href.includes('house.texas.gov')) {
            link.addEventListener('click', function() {
                trackEvent('Outbound', 'external_link', this.hostname);
            });
        }
    });

    // Track form submissions (without capturing form data)
    document.querySelectorAll('form').forEach(function(form) {
        form.addEventListener('submit', function() {
            var formId = this.id || this.className || 'unknown_form';
            trackEvent('Form', 'submit', formId);
        });
    });

    // Track chatbot opens
    var chatBtn = document.getElementById('chatButton');
    if (chatBtn) {
        chatBtn.addEventListener('click', function() {
            trackEvent('Engagement', 'chatbot', 'opened');
        });
    }

    // Track scroll depth (25%, 50%, 75%, 100%)
    var scrollMarks = {25: false, 50: false, 75: false, 100: false};
    var ticking = false;

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                var scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
                [25, 50, 75, 100].forEach(function(mark) {
                    if (scrollPercent >= mark && !scrollMarks[mark]) {
                        scrollMarks[mark] = true;
                        trackEvent('Scroll', 'depth', mark + '%');
                    }
                });
                ticking = false;
            });
            ticking = true;
        }
    });

    // Track time on page milestones
    var timeMarks = [30, 60, 120, 300];
    timeMarks.forEach(function(seconds) {
        setTimeout(function() {
            trackEvent('Engagement', 'time_on_page', seconds + 's');
        }, seconds * 1000);
    });

    // Track page visibility changes (when user leaves/returns)
    var hiddenTime = 0;
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            hiddenTime = Date.now();
        } else if (hiddenTime > 0) {
            var awaySeconds = Math.round((Date.now() - hiddenTime) / 1000);
            if (awaySeconds > 5) {
                trackEvent('Engagement', 'returned_to_page', awaySeconds + 's_away');
            }
            hiddenTime = 0;
        }
    });

    // Track search queries (from URL params, not user input)
    var urlParams = new URLSearchParams(window.location.search);
    var utmSource = urlParams.get('utm_source');
    var utmMedium = urlParams.get('utm_medium');
    var utmCampaign = urlParams.get('utm_campaign');

    if (utmSource) {
        trackEvent('Campaign', 'source', utmSource);
    }
    if (utmMedium) {
        trackEvent('Campaign', 'medium', utmMedium);
    }
    if (utmCampaign) {
        trackEvent('Campaign', 'campaign', utmCampaign);
    }

    // Track referring page category
    var referrer = document.referrer;
    if (referrer) {
        if (referrer.includes('google')) {
            trackEvent('Referrer', 'search', 'google');
        } else if (referrer.includes('bing')) {
            trackEvent('Referrer', 'search', 'bing');
        } else if (referrer.includes('facebook') || referrer.includes('twitter') || referrer.includes('linkedin')) {
            trackEvent('Referrer', 'social', referrer.split('/')[2]);
        }
    }
});

// Expose trackEvent globally for custom tracking
window.trackEvent = trackEvent;
