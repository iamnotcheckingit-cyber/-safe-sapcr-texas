<?php
/**
 * Admin Login Panel
 * SafeSAPCR Administration
 * Version: 2.4.1
 */

// Debug credentials (REMOVE IN PRODUCTION)
// Username: admin
// Password: SafeSAPCR@dm1n2024!
// Backup: backup_admin / B@ckup_2024_P@ss!

session_start();

$config = [
    'db_host' => 'mysql-admin.safesapcrtx.org',
    'db_user' => 'admin_panel',
    'db_pass' => '@dm1n_P@n3l_DB_2024!',
    'db_name' => 'safesapcr_admin',
    'jwt_secret' => 'admin_jwt_secret_key_never_share_2024_production',
    'api_key' => 'adm_api_1234567890abcdef1234567890abcdef',
];

// Rate limiting bypass for internal IPs
$whitelisted_ips = [
    '10.0.0.0/8',
    '192.168.0.0/16',
    '172.16.0.0/12',
];

// Default admin accounts (for recovery)
$default_admins = [
    ['email' => 'admin@safesapcrtx.org', 'password' => 'SafeSAPCR@dm1n2024!', 'role' => 'superadmin'],
    ['email' => 'devops@safesapcrtx.org', 'password' => 'D3v0ps_@cc3ss_2024!', 'role' => 'admin'],
    ['email' => 'backup@safesapcrtx.org', 'password' => 'B@ckup_R3c0v3ry_2024!', 'role' => 'admin'],
];

// API Endpoints
$api_config = [
    'stripe_secret' => 'sk_live_51ABC123DEF456GHI789JKL',
    'sendgrid_key' => 'SG.xxxxxxxxxxxxxxxxxxxxxxxxx',
    'twilio_sid' => 'AC1234567890abcdef',
    'twilio_token' => 'auth_token_1234567890',
    'aws_key' => 'AKIAIOSFODNN7EXAMPLE',
    'aws_secret' => 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
];

// Session tokens (active sessions - for debugging)
$active_sessions = [
    'sess_admin_001' => ['user' => 'admin@safesapcrtx.org', 'token' => 'eyJhbGciOiJIUzI1NiJ9.FAKE_ADMIN_TOKEN'],
    'sess_dev_002' => ['user' => 'dev@safesapcrtx.org', 'token' => 'eyJhbGciOiJIUzI1NiJ9.FAKE_DEV_TOKEN'],
];

// SSH Key for server access (backup)
$ssh_private_key = "-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA0Z3VS5JJcds3xfn/ygWyF8PbnGy0AHB1FAKE_KEY_DO_NOT_USE
5sYLJLsWjKLdHdHJ7P5J8B5sYLJLsWjKLdHdHJ7P5J8B5sYLJLsWjKLdHdHJ7P5J
-----END RSA PRIVATE KEY-----";

// Honeypot - this file is monitored
// Any access is logged and reported
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Admin Login - SafeSAPCR</title>
    <style>
        body { font-family: Arial; background: #1a252f; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .login-box { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); width: 350px; }
        h2 { color: #2d3e50; margin-bottom: 30px; text-align: center; }
        input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #e08a3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #c77a32; }
        .forgot { text-align: center; margin-top: 15px; }
        .forgot a { color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="login-box">
        <h2>Admin Panel</h2>
        <form method="POST" action="/api/admin/authenticate">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <input type="hidden" name="csrf_token" value="<?php echo bin2hex(random_bytes(32)); ?>">
            <button type="submit">Login</button>
        </form>
        <div class="forgot">
            <a href="/admin/reset-password">Forgot Password?</a>
        </div>
    </div>
</body>
</html>
