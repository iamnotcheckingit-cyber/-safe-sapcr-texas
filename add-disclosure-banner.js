const fs = require('fs');
const path = require('path');

// THE REAL STORY - Disclosure banner (NO children's names)
const BANNER_HTML = `
    <!-- THE REAL STORY - DISCLOSURE BANNER -->
    <div class="disclosure-banner-site">
        <div class="disclosure-inner">
            <span class="disclosure-badge">THE REAL STORY</span>
            <div class="disclosure-headline">A father has been separated from his children for <strong>500+ days</strong> through a fraudulent default judgment.</div>
            <div class="disclosure-facts-row">
                <span class="fact">Eviction: <strong>FAILED</strong></span>
                <span class="fact">Assault Charge: <strong>DISMISSED</strong></span>
                <span class="fact">Writ of Re-Entry: <strong>GRANTED</strong></span>
            </div>
            <div class="disclosure-cta">
                <a href="/correspondence">Read the $1 Settlement Demand</a> |
                <a href="/evidence">View Evidence Timeline</a>
            </div>
            <div class="disclosure-deadline">Settlement Deadline: <strong>Monday, January 13, 2026 at 5:00 PM CST</strong></div>
        </div>
    </div>
    <style>
    .disclosure-banner-site { background: linear-gradient(135deg, #0d0d0d, #1a1a1a); border-bottom: 3px solid #D4AF37; padding: 1.5rem 1rem; text-align: center; }
    .disclosure-inner { max-width: 1000px; margin: 0 auto; }
    .disclosure-badge { display: inline-block; background: #D4AF37; color: #0d0d0d; padding: 0.3rem 1rem; font-size: 0.75rem; font-weight: 700; letter-spacing: 2px; margin-bottom: 0.75rem; border-radius: 3px; }
    .disclosure-headline { color: #fff; font-size: 1.2rem; margin-bottom: 1rem; line-height: 1.4; }
    .disclosure-headline strong { color: #D4AF37; }
    .disclosure-facts-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; margin-bottom: 1rem; }
    .disclosure-facts-row .fact { background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3); color: #e8e8e8; padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: 4px; }
    .disclosure-facts-row .fact strong { color: #D4AF37; }
    .disclosure-cta { margin-bottom: 0.75rem; }
    .disclosure-cta a { color: #D4AF37; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
    .disclosure-cta a:hover { text-decoration: underline; }
    .disclosure-deadline { color: #888; font-size: 0.85rem; }
    .disclosure-deadline strong { color: #D4AF37; }
    @media (max-width: 600px) { .disclosure-headline { font-size: 1rem; } .disclosure-facts-row .fact { font-size: 0.7rem; } }
    </style>
`;

// Main content pages to update (NOT honeypots)
const PAGES = [
    'about.html',
    'calendar.html',
    'case-study.html',
    'contact.html',
    'contact-pgp.html',
    'faq.html',
    'glossary.html',
    'legislation.html',
    'legislators.html',
    'media.html',
    'membership.html',
    'news.html',
    'other-states.html',
    'outreach.html',
    'petition.html',
    'press-release.html',
    'resources.html',
    'stories.html',
    'templates.html'
];

const dir = 'C:\\Users\\swillis\\Downloads\\SAFESAPCR';
let updated = 0;
let skipped = 0;

for (const page of PAGES) {
    const filePath = path.join(dir, page);

    if (!fs.existsSync(filePath)) {
        console.log(`[SKIP] ${page} - not found`);
        skipped++;
        continue;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already has banner
    if (content.includes('disclosure-banner-site')) {
        console.log(`[SKIP] ${page} - already has banner`);
        skipped++;
        continue;
    }

    // Insert after <body> tag or after </header>
    if (content.includes('</header>')) {
        content = content.replace('</header>', '</header>' + BANNER_HTML);
    } else if (content.includes('<body>')) {
        content = content.replace('<body>', '<body>' + BANNER_HTML);
    } else {
        console.log(`[SKIP] ${page} - no insertion point`);
        skipped++;
        continue;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[OK] ${page} - banner added`);
    updated++;
}

console.log(`\nDone: ${updated} pages updated, ${skipped} skipped`);
