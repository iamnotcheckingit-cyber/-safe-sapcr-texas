<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Log In &lsaquo; WordPress</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #f1f1f1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif; }
        #login { width: 320px; margin: 5% auto; padding: 20px 0; }
        #login h1 { text-align: center; margin-bottom: 24px; }
        #login h1 a { background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJDNi41IDIgMiA2LjUgMiAxMnM0LjUgMTAgMTAgMTAgMTAtNC41IDEwLTEwUzE3LjUgMiAxMiAyem0wIDE4Yy00LjQgMC04LTMuNi04LThzMy42LTggOC04IDggMy42IDggOC0zLjYgOC04IDh6Ii8+PC9zdmc+'); width: 84px; height: 84px; display: block; margin: 0 auto; text-indent: -9999px; background-size: 84px; }
        .login form { margin-top: 20px; background: #fff; border: 1px solid #c3c4c7; box-shadow: 0 1px 3px rgba(0,0,0,.04); padding: 26px 24px; }
        .login label { font-size: 14px; display: block; margin-bottom: 3px; }
        .login input[type="text"], .login input[type="password"] { font-size: 24px; width: 100%; padding: 3px; margin-bottom: 16px; border: 1px solid #8c8f94; border-radius: 4px; }
        .login .button-primary { background: #2271b1; border-color: #2271b1; color: #fff; padding: 0 12px; font-size: 13px; line-height: 2.15384615; min-height: 32px; cursor: pointer; border-radius: 3px; width: 100%; }
        .login .button-primary:hover { background: #135e96; }
        .login .button-primary:disabled { background: #a0a5aa; cursor: not-allowed; }
        #nav, #backtoblog { font-size: 13px; padding: 0 24px; text-align: center; margin-top: 16px; }
        #nav a, #backtoblog a { color: #50575e; text-decoration: none; }
        .hp-invisible { position: absolute; left: -9999px; }

        /* CAPTCHA Game Styles */
        .captcha-box { background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin-bottom: 16px; }
        .captcha-header { font-size: 13px; color: #555; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        .captcha-header svg { width: 20px; height: 20px; fill: #2271b1; }
        .captcha-challenge { font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #1d2327; }
        .captcha-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
        .captcha-tile { aspect-ratio: 1; border: 2px solid #ddd; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 28px; background: #fff; transition: all 0.2s; }
        .captcha-tile:hover { border-color: #2271b1; background: #f0f6fc; }
        .captcha-tile.selected { border-color: #2271b1; background: #e7f3ff; }
        .captcha-tile.wrong { border-color: #d63638; background: #fcf0f1; animation: shake 0.3s; }
        .captcha-tile.correct { border-color: #00a32a; background: #edfaef; }
        @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .captcha-status { font-size: 12px; color: #666; text-align: center; min-height: 18px; }
        .captcha-status.error { color: #d63638; }
        .captcha-status.success { color: #00a32a; }
        .captcha-progress { display: flex; gap: 4px; justify-content: center; margin-top: 8px; }
        .captcha-dot { width: 8px; height: 8px; border-radius: 50%; background: #ddd; }
        .captcha-dot.complete { background: #00a32a; }
        .captcha-dot.current { background: #2271b1; }
        .loading-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid #ddd; border-top-color: #2271b1; border-radius: 50%; animation: spin 1s linear infinite; margin-left: 8px; vertical-align: middle; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .captcha-verify-msg { text-align: center; padding: 20px; font-size: 14px; }
    </style>
</head>
<body class="login">
    <div id="login">
        <h1><a href="#">Powered by WordPress</a></h1>
        <form name="loginform" id="loginform" method="post" action="/.netlify/functions/honeypot-sink">
            <input type="hidden" name="hp_page" value="wp-admin">
            <input type="hidden" name="hp_ts" id="hp_ts">
            <input type="hidden" name="hp_captcha_attempts" id="hp_captcha_attempts" value="0">
            <input type="hidden" name="hp_captcha_time" id="hp_captcha_time" value="0">
            <p>
                <label for="user_login">Username or Email Address</label>
                <input type="text" name="log" id="user_login" autocomplete="username" autocapitalize="off">
            </p>
            <p>
                <label for="user_pass">Password</label>
                <input type="password" name="pwd" id="user_pass" autocomplete="current-password">
            </p>

            <!-- CAPTCHA Game -->
            <div class="captcha-box" id="captchaBox">
                <div class="captcha-header">
                    <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                    Security Verification Required
                </div>
                <div class="captcha-challenge" id="captchaChallenge">Loading challenge...</div>
                <div class="captcha-grid" id="captchaGrid"></div>
                <div class="captcha-status" id="captchaStatus"></div>
                <div class="captcha-progress" id="captchaProgress"></div>
            </div>

            <!-- Honeypot traps -->
            <div class="hp-invisible">
                <input type="text" name="website" tabindex="-1">
                <input type="text" name="redirect_to" tabindex="-1">
            </div>
            <p class="submit">
                <input type="submit" name="wp-submit" id="wp-submit" class="button button-primary" value="Log In" disabled>
            </p>
        </form>
        <p id="nav"><a href="#">Lost your password?</a></p>
        <p id="backtoblog"><a href="/">&larr; Go to Site</a></p>
    </div>
    <script>
    (function() {
        document.getElementById('hp_ts').value = Date.now();

        // CAPTCHA Game System - wastes attacker time
        const challenges = [
            { question: "Select all images with cats", correct: ['🐱', '😺', '🐈'], wrong: ['🐕', '🐘', '🦁', '🐻', '🐮', '🐷'] },
            { question: "Select all traffic lights", correct: ['🚦', '🚥'], wrong: ['🚗', '🚌', '🏠', '🌳', '🚶', '🛑', '⛽'] },
            { question: "Select all bicycles", correct: ['🚲', '🚴'], wrong: ['🚗', '🏍️', '🛵', '🚌', '✈️', '🚂', '🛴'] },
            { question: "Select all fire hydrants", correct: ['🧯', '🔥'], wrong: ['🚗', '🏠', '🌳', '💧', '🚿', '🛁', '🪣'] },
            { question: "Select all crosswalks", correct: ['🚶', '🚸'], wrong: ['🚗', '🏠', '🌳', '🚌', '🛤️', '🛣️', '🏃'] },
            { question: "Select all buses", correct: ['🚌', '🚐'], wrong: ['🚗', '🚲', '✈️', '🚂', '🛵', '🏍️', '🚁'] },
            { question: "Select all palm trees", correct: ['🌴', '🌳'], wrong: ['🏠', '🚗', '🌺', '🌻', '🌵', '🍀', '🌿'] },
            { question: "Select all stairs", correct: ['🪜', '📶'], wrong: ['🚪', '🏠', '🛗', '🚶', '🏃', '🚴', '🛹'] },
            { question: "Select all boats", correct: ['⛵', '🚤', '🛥️', '🚢'], wrong: ['🚗', '✈️', '🚂', '🚁', '🛩️'] },
            { question: "Select all mountains", correct: ['⛰️', '🏔️', '🗻'], wrong: ['🏠', '🌳', '🏖️', '🏝️', '🌊', '🏕️'] }
        ];

        let currentRound = 0;
        const totalRounds = 3;
        let attempts = 0;
        let startTime = Date.now();
        let selectedTiles = new Set();
        let currentChallenge = null;

        function shuffle(arr) {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }

        function generateChallenge() {
            currentChallenge = challenges[Math.floor(Math.random() * challenges.length)];
            const correctCount = Math.min(currentChallenge.correct.length, 2 + Math.floor(Math.random() * 2));
            const wrongCount = 9 - correctCount;

            const correctItems = shuffle(currentChallenge.correct).slice(0, correctCount);
            const wrongItems = shuffle(currentChallenge.wrong).slice(0, wrongCount);
            const allItems = shuffle([...correctItems, ...wrongItems]);

            currentChallenge.activeCorrect = new Set(correctItems);
            currentChallenge.allItems = allItems;

            return currentChallenge;
        }

        function renderChallenge() {
            const challenge = generateChallenge();
            selectedTiles.clear();

            document.getElementById('captchaChallenge').textContent = challenge.question;

            const grid = document.getElementById('captchaGrid');
            grid.innerHTML = '';

            challenge.allItems.forEach((emoji, idx) => {
                const tile = document.createElement('div');
                tile.className = 'captcha-tile';
                tile.textContent = emoji;
                tile.dataset.idx = idx;
                tile.dataset.emoji = emoji;
                tile.onclick = () => toggleTile(tile, emoji);
                grid.appendChild(tile);
            });

            updateProgress();
            document.getElementById('captchaStatus').textContent = 'Select all matching images, then click verify below';
            document.getElementById('captchaStatus').className = 'captcha-status';
        }

        function toggleTile(tile, emoji) {
            if (tile.classList.contains('correct') || tile.classList.contains('wrong')) return;

            if (selectedTiles.has(emoji)) {
                selectedTiles.delete(emoji);
                tile.classList.remove('selected');
            } else {
                selectedTiles.add(emoji);
                tile.classList.add('selected');
            }
        }

        function updateProgress() {
            const progress = document.getElementById('captchaProgress');
            progress.innerHTML = '';
            for (let i = 0; i < totalRounds; i++) {
                const dot = document.createElement('div');
                dot.className = 'captcha-dot';
                if (i < currentRound) dot.classList.add('complete');
                if (i === currentRound) dot.classList.add('current');
                progress.appendChild(dot);
            }
        }

        function verifyCaptcha() {
            attempts++;
            document.getElementById('hp_captcha_attempts').value = attempts;

            const correct = currentChallenge.activeCorrect;
            let allCorrect = true;
            let anyWrong = false;

            document.querySelectorAll('.captcha-tile').forEach(tile => {
                const emoji = tile.dataset.emoji;
                const isSelected = selectedTiles.has(emoji);
                const shouldBeSelected = correct.has(emoji);

                if (isSelected && shouldBeSelected) {
                    tile.classList.add('correct');
                } else if (isSelected && !shouldBeSelected) {
                    tile.classList.add('wrong');
                    anyWrong = true;
                } else if (!isSelected && shouldBeSelected) {
                    allCorrect = false;
                }
            });

            if (anyWrong || !allCorrect) {
                document.getElementById('captchaStatus').textContent = 'Incorrect. Please try again...';
                document.getElementById('captchaStatus').className = 'captcha-status error';

                setTimeout(() => {
                    renderChallenge();
                }, 1500);
                return false;
            }

            // Round complete
            currentRound++;

            if (currentRound >= totalRounds) {
                // All rounds complete
                document.getElementById('hp_captcha_time').value = Date.now() - startTime;
                document.getElementById('captchaBox').innerHTML = '<div class="captcha-verify-msg"><span style="color:#00a32a;">✓</span> Verification complete<span class="loading-spinner"></span></div>';

                // Enable submit after fake "processing"
                setTimeout(() => {
                    document.getElementById('wp-submit').disabled = false;
                    document.getElementById('captchaBox').innerHTML = '<div class="captcha-verify-msg" style="color:#00a32a;">✓ Security verification passed</div>';
                }, 2000);
                return true;
            }

            // Next round
            document.getElementById('captchaStatus').textContent = 'Correct! Loading next challenge...';
            document.getElementById('captchaStatus').className = 'captcha-status success';

            setTimeout(() => {
                renderChallenge();
            }, 1000);

            return false;
        }

        // Add verify button functionality
        document.getElementById('captchaGrid').addEventListener('click', function(e) {
            // Double-click anywhere in grid to verify
        });

        // Override form submit
        document.getElementById('loginform').addEventListener('submit', function(e) {
            e.preventDefault();

            if (document.getElementById('wp-submit').disabled) {
                // Still need to complete CAPTCHA
                verifyCaptcha();
                return;
            }

            // CAPTCHA complete, log the attempt
            const data = Object.fromEntries(new FormData(this));
            data.hp_submit = Date.now();
            data.hp_delta = data.hp_submit - parseInt(data.hp_ts);
            data.hp_ua = navigator.userAgent;
            data.hp_captcha_completed = true;

            fetch('/.netlify/functions/honeypot-sink', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).finally(() => {
                // Show error and restart
                document.body.innerHTML = '<div style="text-align:center;margin-top:100px;"><strong>ERROR:</strong> Invalid username or password. <a href="">Try again</a></div>';
            });
        });

        // Add a "Verify" button below grid
        const verifyBtn = document.createElement('button');
        verifyBtn.type = 'button';
        verifyBtn.textContent = 'Verify';
        verifyBtn.style.cssText = 'width:100%;padding:8px;margin-top:8px;background:#2271b1;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px;';
        verifyBtn.onclick = verifyCaptcha;
        document.getElementById('captchaProgress').after(verifyBtn);

        // Initialize
        renderChallenge();
    })();
    </script>
</body>
</html>
