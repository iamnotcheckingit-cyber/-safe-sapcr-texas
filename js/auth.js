// SAFE SAPCR TX - Shared Auth0 Authentication
// Wrapped in IIFE to avoid conflicts with membership.html
(function() {
    // Skip if already initialized on this page (e.g., membership.html has own auth)
    if (window._siteAuthInitialized) return;
    window._siteAuthInitialized = true;

    const SITE_AUTH0_DOMAIN = 'dev-rdmu3fhvd2ymxyq4.us.auth0.com';
    const SITE_AUTH0_CLIENT_ID = 'EtWaElBhwQtSRmUVVEDPT4UH8UfzkUX3';

    let siteAuth0Client = null;

    async function initSiteAuth() {
        // Wait for Auth0 SDK to load
        let attempts = 0;
        while (typeof auth0 === 'undefined' && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (typeof auth0 === 'undefined') return;

        try {
            siteAuth0Client = await auth0.createAuth0Client({
                domain: SITE_AUTH0_DOMAIN,
                clientId: SITE_AUTH0_CLIENT_ID,
                authorizationParams: {
                    redirect_uri: 'https://safesapcrtx.org/membership'
                },
                cacheLocation: 'localstorage'
            });

            const isAuthenticated = await siteAuth0Client.isAuthenticated();
            updateNavAuth(isAuthenticated ? await siteAuth0Client.getUser() : null);
        } catch (err) {
            console.error('Auth init error:', err);
        }
    }

    function updateNavAuth(user) {
        const navAccount = document.getElementById('navAccount');
        if (!navAccount) return;

        if (user) {
            const firstName = user.given_name || user.name?.split(' ')[0] || 'Member';
            const avatar = user.picture
                ? `<img src="${user.picture}" alt="${firstName}" class="nav-avatar">`
                : `<span class="nav-avatar-initials">${firstName.charAt(0)}</span>`;

            navAccount.innerHTML = `
                <div class="nav-user" id="navUserDropdown">
                    ${avatar}
                    <div class="nav-dropdown">
                        <span class="nav-user-name">${firstName}</span>
                        <a href="/membership">My Account</a>
                        <button onclick="window._siteLogout()">Sign Out</button>
                    </div>
                </div>
            `;
            navAccount.classList.add('logged-in');
        } else {
            navAccount.innerHTML = `<a href="/membership" class="nav-login">Join/Login</a>`;
            navAccount.classList.remove('logged-in');
        }
    }

    // Expose logout globally
    window._siteLogout = async function() {
        if (!siteAuth0Client) return;
        await siteAuth0Client.logout({
            logoutParams: {
                returnTo: 'https://safesapcrtx.org'
            }
        });
    };

    document.addEventListener('DOMContentLoaded', initSiteAuth);
})();
