// Shared header component - single source of truth
(function() {
    const HEADER_HTML = `
        <nav>
            <a href="/" class="logo">
                <img src="/images/safe-sapcr-logo.png" alt="SAFE SAPCR Logo" class="logo-img" width="45" height="45">
                <span class="logo-text">SAFE SAPCR<span class="tx">TX</span></span>
            </a>
            <div class="menu-toggle" id="menuToggle" role="button" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="navMenu" tabindex="0">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <ul id="navMenu">
                <li><a href="/#problem">The Problem</a></li>
                <li><a href="/legislation">Legislation</a></li>
                <li><a href="/legislators">Legislators</a></li>
                <li><a href="/case-study">Case Study</a></li>
                <li><a href="/resources">Resources</a></li>
                <li><a href="/petition">Petition</a></li>
                <li class="lang-switch"><a href="/es/" title="Español">ES</a> | <a href="/zh/" title="中文">中文</a> | <a href="/ar/" title="العربية">ع</a> | <a href="/de/" title="Deutsch">DE</a> | <a href="/el/" title="Ελληνικά">ΕΛ</a> | <a href="/he/" title="עברית">עב</a> | <a href="/hi/" title="हिंदी">हिं</a> | <a href="/ja/" title="日本語">日</a></li>
            </ul>
            <div id="navAccount"><a href="/membership" class="nav-login">Join/Login</a></div>
        </nav>
    `;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeader);
    } else {
        initHeader();
    }

    function initHeader() {
        const header = document.querySelector('header');
        if (header) {
            header.innerHTML = HEADER_HTML;
            setupMenuToggle();
        }
    }

    function setupMenuToggle() {
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('navMenu');

        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', function() {
                const isOpen = navMenu.classList.toggle('active');
                menuToggle.classList.toggle('active');
                menuToggle.setAttribute('aria-expanded', isOpen);
            });

            // Close menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });

            // Keyboard accessibility
            menuToggle.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    menuToggle.click();
                }
            });
        }
    }
})();
