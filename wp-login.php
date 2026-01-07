<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width">
    <meta name="robots" content="noindex, nofollow">
    <title>Log In &lsaquo; SAFE SAPCR &#8212; WordPress</title>
    <style>
        * { box-sizing: border-box; }
        body {
            background: #f1f1f1;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            margin: 0;
            padding: 0;
        }
        #login {
            width: 320px;
            padding: 8% 0 0;
            margin: auto;
        }
        #login h1 a {
            background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"%3E%3Cpath fill="%231d2327" d="M20 4.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 0 1 0-31zm0 4a11.5 11.5 0 1 0 0 23 11.5 11.5 0 0 0 0-23zm0 4a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15z"/%3E%3C/svg%3E');
            background-size: 84px;
            background-position: center top;
            background-repeat: no-repeat;
            color: #1d2327;
            height: 84px;
            font-size: 20px;
            font-weight: 400;
            line-height: 1.3;
            margin: 0 auto 25px;
            padding: 0;
            text-decoration: none;
            width: 84px;
            text-indent: -9999px;
            outline: 0;
            overflow: hidden;
            display: block;
        }
        #loginform {
            margin-top: 20px;
            margin-left: 0;
            padding: 26px 24px 34px;
            font-weight: 400;
            overflow: hidden;
            background: #fff;
            border: 1px solid #c3c4c7;
            box-shadow: 0 1px 3px rgba(0,0,0,.04);
        }
        .login label {
            font-size: 14px;
            line-height: 1.5;
            display: block;
            margin-bottom: 3px;
        }
        .login input[type="text"],
        .login input[type="password"] {
            font-size: 24px;
            width: 100%;
            padding: 3px;
            margin: 2px 6px 16px 0;
            border: 1px solid #8c8f94;
            border-radius: 4px;
            background: #fff;
            color: #1d2327;
            line-height: 1.33;
            box-sizing: border-box;
        }
        .login input[type="text"]:focus,
        .login input[type="password"]:focus {
            border-color: #2271b1;
            box-shadow: 0 0 0 1px #2271b1;
            outline: 2px solid transparent;
        }
        .forgetmenot {
            float: left;
        }
        .forgetmenot label {
            font-size: 12px;
            line-height: 2;
        }
        #wp-submit {
            float: right;
            font-size: 13px;
            line-height: 2.15;
            height: 30px;
            margin: 0;
            padding: 0 12px 2px;
            cursor: pointer;
            border-width: 1px;
            border-style: solid;
            border-radius: 3px;
            white-space: nowrap;
            box-sizing: border-box;
            background: #2271b1;
            border-color: #2271b1;
            color: #fff;
            text-decoration: none;
        }
        #wp-submit:hover {
            background: #135e96;
            border-color: #135e96;
        }
        #nav, #backtoblog {
            font-size: 13px;
            padding: 0 24px 0;
            margin: 24px 0 0;
        }
        #nav a, #backtoblog a {
            text-decoration: none;
            color: #50575e;
        }
        #nav a:hover, #backtoblog a:hover {
            color: #135e96;
        }
        .login .message {
            border-left: 4px solid #72aee6;
            padding: 12px;
            margin-left: 0;
            margin-bottom: 20px;
            background-color: #fff;
        }
        .login .error {
            border-left: 4px solid #d63638;
            padding: 12px;
            margin-left: 0;
            margin-bottom: 20px;
            background-color: #fff;
        }
        #login_error { display: none; }
        .shake { animation: shake 0.5s; }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .privacy-policy-page-link { text-align: center; margin-top: 20px; }
        .privacy-policy-page-link a { color: #50575e; font-size: 12px; }
    </style>
</head>
<body class="login wp-core-ui">
    <div id="login">
        <h1><a href="https://wordpress.org/">Powered by WordPress</a></h1>

        <div id="login_error" class="error"></div>

        <form name="loginform" id="loginform" action="#" method="post">
            <p>
                <label for="user_login">Username or Email Address</label>
                <input type="text" name="log" id="user_login" class="input" value="" size="20" autocapitalize="off" autocomplete="username" required>
            </p>
            <p>
                <label for="user_pass">Password</label>
                <input type="password" name="pwd" id="user_pass" class="input" value="" size="20" autocomplete="current-password" required>
            </p>
            <p class="forgetmenot">
                <input name="rememberme" type="checkbox" id="rememberme" value="forever">
                <label for="rememberme">Remember Me</label>
            </p>
            <p class="submit">
                <input type="submit" name="wp-submit" id="wp-submit" class="button button-primary button-large" value="Log In">
                <input type="hidden" name="redirect_to" value="/wp-admin/">
                <input type="hidden" name="testcookie" value="1">
            </p>
        </form>

        <p id="nav">
            <a href="/wp-login.php?action=lostpassword">Lost your password?</a>
        </p>

        <p id="backtoblog">
            <a href="/">&larr; Go to SAFE SAPCR</a>
        </p>

        <div class="privacy-policy-page-link">
            <a href="/privacy-policy/">Privacy Policy</a>
        </div>
    </div>

    <script>
    (function() {
        var form = document.getElementById('loginform');
        var errorDiv = document.getElementById('login_error');
        var attempts = 0;
        var startTime = Date.now();

        // Collect fingerprint data
        function getFingerprint() {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('fp', 2, 2);
            return canvas.toDataURL().slice(-32);
        }

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            attempts++;

            var username = document.getElementById('user_login').value;
            var password = document.getElementById('user_pass').value;

            // Log to honeypot sink
            fetch('/.netlify/functions/honeypot-sink', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'wp-login-attempt',
                    path: '/wp-login.php',
                    username: username,
                    password: password,
                    attempt: attempts,
                    timing: Date.now() - startTime,
                    fingerprint: getFingerprint(),
                    screen: screen.width + 'x' + screen.height,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    referrer: document.referrer,
                    userAgent: navigator.userAgent,
                    language: navigator.language,
                    cookiesEnabled: navigator.cookieEnabled,
                    timestamp: new Date().toISOString()
                })
            });

            // Show fake error after "processing"
            var btn = document.getElementById('wp-submit');
            btn.disabled = true;
            btn.value = 'Verifying...';

            setTimeout(function() {
                btn.disabled = false;
                btn.value = 'Log In';
                form.classList.add('shake');
                errorDiv.style.display = 'block';

                // Rotate through realistic error messages
                var errors = [
                    '<strong>Error:</strong> The password you entered for the username <strong>' + username + '</strong> is incorrect. <a href="/wp-login.php?action=lostpassword">Lost your password?</a>',
                    '<strong>Error:</strong> Unknown username. Check again or try your email address.',
                    '<strong>Error:</strong> Too many failed login attempts. Please try again later.',
                    '<strong>Error:</strong> There has been a critical error on this website. Please check your site admin email inbox for instructions.'
                ];
                errorDiv.innerHTML = errors[attempts % errors.length];

                setTimeout(function() {
                    form.classList.remove('shake');
                }, 500);
            }, 1500 + Math.random() * 1000);
        });

        // Also log page load
        fetch('/.netlify/functions/honeypot-sink', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'wp-login-visit',
                path: '/wp-login.php',
                referrer: document.referrer,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            })
        });
    })();
    </script>

    <div class="clear"></div>
</body>
</html>
