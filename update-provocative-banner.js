const fs = require('fs');
const path = require('path');

// THE REAL STORY - PROVOCATIVE BANNER (NO children's names)
const NEW_BANNER_HTML = `
    <!-- THE REAL STORY - PROVOCATIVE DISCLOSURE BANNER -->
    <div class="disclosure-banner-site">
        <div class="disclosure-inner">
            <span class="disclosure-badge">THE REAL STORY</span>
            <div class="disclosure-headline">
                Her mom tried to evict him. <span class="gold">FAILED.</span><br>
                They locked him out. <span class="gold">WRIT OF RE-ENTRY GRANTED.</span><br>
                She filed habeas corpus. <span class="gold">SHE DIDN'T SHOW UP.</span><br>
                They charged him with assault. <span class="gold">DEFERRED AND DISCHARGED.</span><br>
                Then an attorney filed a <span class="gold">FALSE ADDRESS</span> and stole his children.
            </div>
            <div class="disclosure-tagline">500+ days. No contact. A son's tooth chipped for 9 MONTHS — missing extracurriculars. A daughter with no doctor visit for over a YEAR. Told their father wants to kill them.</div>
            <div class="disclosure-facts-row">
                <span class="fact">Children told father wants to <strong>KILL THEM</strong></span>
                <span class="fact">Messages about being <strong>HUNGRY</strong></span>
                <span class="fact">Money demanded at <strong>2X RATE</strong></span>
                <span class="fact">Rubberstamped <strong>EX PARTE MOTION</strong></span>
                <span class="fact">Notice of Hearing with <strong>NO DATE</strong></span>
                <span class="fact">2 cases, 1 courtroom, <strong>SAME TIME</strong></span>
                <span class="fact">SAPCR filed while <strong>HABEAS STILL OPEN</strong></span>
            </div>
            <div class="disclosure-quote">"I am a father with nothing to lose."</div>
            <div class="disclosure-cta">
                <a href="/correspondence">Read the Full Disclosure</a> |
                <a href="/evidence">View Evidence Timeline</a>
            </div>
            <div class="disclosure-deadline">Settlement Deadline: <strong>Monday, January 13, 2026 at 5:00 PM CST</strong></div>
        </div>
    </div>
    <style>
    .disclosure-banner-site { background: linear-gradient(135deg, #0d0d0d, #1a1a1a); border-bottom: 3px solid #D4AF37; padding: 2rem 1rem; text-align: center; }
    .disclosure-inner { max-width: 1000px; margin: 0 auto; }
    .disclosure-badge { display: inline-block; background: #D4AF37; color: #0d0d0d; padding: 0.4rem 1.5rem; font-size: 0.85rem; font-weight: 700; letter-spacing: 3px; margin-bottom: 1rem; border-radius: 3px; }
    .disclosure-headline { color: #fff; font-size: 1.3rem; margin-bottom: 1rem; line-height: 1.6; font-weight: 600; }
    .disclosure-headline .gold { color: #D4AF37; font-weight: 700; }
    .disclosure-tagline { color: #ccc; font-size: 1rem; margin-bottom: 1rem; font-style: italic; }
    .disclosure-facts-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; margin-bottom: 1rem; }
    .disclosure-facts-row .fact { background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.4); color: #e8e8e8; padding: 0.5rem 1rem; font-size: 0.85rem; border-radius: 4px; }
    .disclosure-facts-row .fact strong { color: #D4AF37; }
    .disclosure-quote { color: #D4AF37; font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; }
    .disclosure-cta { margin-bottom: 0.75rem; }
    .disclosure-cta a { color: #D4AF37; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
    .disclosure-cta a:hover { text-decoration: underline; }
    .disclosure-deadline { color: #888; font-size: 0.85rem; }
    .disclosure-deadline strong { color: #D4AF37; }
    @media (max-width: 600px) { .disclosure-headline { font-size: 1rem; } .disclosure-facts-row .fact { font-size: 0.75rem; padding: 0.4rem 0.6rem; } }
    </style>
`;

// Pages to update
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
    'templates.html',
    'evidence.html',
    'correspondence.html'
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

    // REMOVE old banner if exists
    const bannerStart = content.indexOf('<!-- THE REAL STORY');
    if (bannerStart !== -1) {
        // Find the end of the banner (closing </style> tag after disclosure-banner-site)
        const styleEnd = content.indexOf('</style>', bannerStart);
        if (styleEnd !== -1) {
            const bannerEnd = styleEnd + '</style>'.length;
            content = content.slice(0, bannerStart) + content.slice(bannerEnd);
            console.log(`[REMOVE] ${page} - old banner removed`);
        }
    }

    // Insert new banner after </header> or after <body>
    if (content.includes('</header>')) {
        content = content.replace('</header>', '</header>' + NEW_BANNER_HTML);
    } else if (content.includes('<body>')) {
        content = content.replace('<body>', '<body>' + NEW_BANNER_HTML);
    } else {
        console.log(`[SKIP] ${page} - no insertion point`);
        skipped++;
        continue;
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[OK] ${page} - provocative banner added`);
    updated++;
}

console.log(`\n=== DONE ===`);
console.log(`${updated} pages updated with provocative banner`);
console.log(`${skipped} pages skipped`);
console.log(`\nTHE REAL STORY is now the ENTIRE THEME.`);
