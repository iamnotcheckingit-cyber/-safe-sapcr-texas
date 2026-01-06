// SAFE SAPCR TX - Shared Auth0 Authentication
// Add to all pages for consistent login/logout across site

const AUTH0_DOMAIN = 'dev-rdmu3fhvd2ymxyq4.us.auth0.com';
const AUTH0_CLIENT_ID = 'EtWaElBhwQtSRmUVVEDPT4UH8UfzkUX3';

let auth0Client = null;

async function initSiteAuth() {
    // Skip if Auth0 SDK not loaded
    if (typeof auth0 === 'undefined') return;

    try {
        auth0Client = await auth0.createAuth0Client({
            domain: AUTH0_DOMAIN,
            clientId: AUTH0_CLIENT_ID,
            authorizationParams: {
                redirect_uri: window.location.origin + '/membership'
            },
            cacheLocation: 'localstorage'
        });

        // Check if user is authenticated
        const isAuthenticated = await auth0Client.isAuthenticated();
        updateNavAuth(isAuthenticated ? await auth0Client.getUser() : null);
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
                    <button onclick="siteLogout()">Sign Out</button>
                </div>
            </div>
        `;
        navAccount.classList.add('logged-in');
    } else {
        navAccount.innerHTML = `<a href="/membership" class="nav-login">Join/Login</a>`;
        navAccount.classList.remove('logged-in');
    }
}

async function siteLogout() {
    if (!auth0Client) return;
    await auth0Client.logout({
        logoutParams: {
            returnTo: 'https://safesapcrtx.org'
        }
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initSiteAuth);
