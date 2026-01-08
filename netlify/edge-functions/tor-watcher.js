// TOR Watcher Edge Function
// Detects TOR visitors, adds delays, injects tracking, logs everything
// They think they're invisible. They're not.

// TOR exit nodes cache - refreshed hourly
let torCache = {
    nodes: new Set(),
    lastFetch: 0
};

async function fetchTorNodes() {
    const now = Date.now();
    const TTL = 3600000; // 1 hour

    if (torCache.nodes.size > 0 && (now - torCache.lastFetch) < TTL) {
        return torCache.nodes;
    }

    try {
        const response = await fetch('https://check.torproject.org/torbulkexitlist');
        if (response.ok) {
            const text = await response.text();
            torCache.nodes = new Set(
                text.split('\n')
                    .map(l => l.trim())
                    .filter(l => l && !l.startsWith('#'))
            );
            torCache.lastFetch = now;
        }
    } catch (e) {
        console.error('TOR list fetch failed:', e);
    }

    return torCache.nodes;
}

function isTorIP(ip, nodes) {
    return nodes.has(ip);
}

// Generate tracking fingerprint
function genFingerprint(ip, ua, ts) {
    const data = `${ip}:${ua}:${ts}:${Math.random()}`;
    let h = 0;
    for (let i = 0; i < data.length; i++) {
        h = ((h << 5) - h) + data.charCodeAt(i);
        h = h & h;
    }
    return Math.abs(h).toString(36).padStart(12, '0');
}

// Slowloris defense - add delay for TOR visitors
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Tracking pixel injection script
const trackingScript = (fingerprint, isTor) => `
<script data-t="onion">
(function(){
    var fp='${fingerprint}',tor=${isTor},st=Date.now(),sd=0,pg=location.pathname;

    // Canvas fingerprint
    function cfp(){try{var c=document.createElement('canvas'),x=c.getContext('2d');
    x.textBaseline='top';x.font='14px Arial';x.fillText('fp',2,2);
    return c.toDataURL().slice(-32);}catch(e){return'err';}}

    // Audio fingerprint
    function afp(){try{var a=new(window.AudioContext||window.webkitAudioContext)(),
    o=a.createOscillator(),g=a.createGain(),d=a.createDynamicsCompressor(),
    n=a.createAnalyser();o.connect(g);g.connect(d);d.connect(n);n.connect(a.destination);
    o.start(0);var r=new Float32Array(n.frequencyBinCount);n.getFloatFrequencyData(r);
    o.stop();return r.slice(0,4).join(',').slice(0,32);}catch(e){return'err';}}

    // Scroll depth tracker
    document.addEventListener('scroll',function(){
        var h=document.documentElement,b=document.body,
        st=h.scrollTop||b.scrollTop,sh=h.scrollHeight||b.scrollHeight,
        ch=h.clientHeight;sd=Math.round((st/(sh-ch))*100)||0;
    });

    // Form interaction tracker
    var fi=false;
    document.addEventListener('input',function(e){
        if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')fi=true;
    });

    // Honeypot trigger detection
    var hp=false;
    setTimeout(function(){
        var hpf=document.querySelectorAll('[name="website"],[name="url"],[name="email2"]');
        hpf.forEach(function(f){if(f.value)hp=true;});
    },5000);

    // Send beacon on unload
    function send(){
        var d={
            fp:fp,tor:tor,pg:pg,
            t:Date.now()-st,sd:sd,fi:fi,hp:hp,
            cf:cfp(),af:afp(),
            sr:screen.width+'x'+screen.height,
            tz:Intl.DateTimeFormat().resolvedOptions().timeZone,
            ref:document.referrer
        };
        navigator.sendBeacon('/.netlify/functions/tor-detection',JSON.stringify(d));
    }

    window.addEventListener('beforeunload',send);

    // Invisible tracking pixel
    var px=new Image();px.src='/.netlify/functions/tor-detection?px='+fp+'&t='+Date.now();
    px.style.cssText='position:absolute;left:-9999px;width:1px;height:1px;';
    document.body.appendChild(px);
})();
</script>`;

export default async (request, context) => {
    const clientIP = context.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const url = new URL(request.url);
    const ua = request.headers.get('user-agent') || 'none';

    // Fetch TOR nodes
    const torNodes = await fetchTorNodes();
    const isTor = isTorIP(clientIP, torNodes);

    // SLOWLORIS DEFENSE: Add 2-3 second delay for TOR visitors
    if (isTor) {
        const delayMs = 2000 + Math.random() * 1000; // 2-3 seconds
        await delay(delayMs);
        console.log(`TOR visitor delayed ${delayMs}ms: IP=${clientIP}, Path=${url.pathname}`);
    }

    // Get the original response
    const response = await context.next();

    // Only inject tracking into HTML responses
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
        return response;
    }

    // Generate unique fingerprint for this session
    const fingerprint = genFingerprint(clientIP, ua, Date.now());

    // Read and modify the HTML
    let html = await response.text();

    // Inject tracking script before </body>
    const trackingCode = trackingScript(fingerprint, isTor);
    html = html.replace('</body>', `${trackingCode}</body>`);

    // For TOR visitors, also inject hidden admin link "discoverable" via CSS
    if (isTor) {
        const hiddenTrap = `
<!-- TOR visitor special content -->
<a href="/admin" style="position:absolute;left:-9999px;opacity:0.01;font-size:1px;">admin</a>
<a href="/case-files/sealed/" style="position:absolute;left:-9998px;opacity:0.01;font-size:1px;">sealed</a>
`;
        html = html.replace('</body>', `${hiddenTrap}</body>`);
    }

    // Clone headers and add custom ones
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-TOR-Detected', isTor ? 'yes' : 'no');
    newHeaders.set('X-Session-FP', fingerprint);

    // Bad actors get noindex - don't let them pollute search results
    if (isTor) {
        newHeaders.set('X-Robots-Tag', 'noindex, nofollow');
    }

    // Log TOR visitor to console (will appear in Netlify logs)
    if (isTor) {
        console.log(JSON.stringify({
            event: 'tor_visit',
            ip: clientIP,
            ua: ua,
            path: url.pathname,
            fingerprint: fingerprint,
            timestamp: new Date().toISOString()
        }));
    }

    return new Response(html, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    });
};

export const config = {
    // Run on all pages except static assets
    path: ["/*"],
    excludedPath: [
        "/assets/*",
        "/images/*",
        "/css/*",
        "/js/*",
        "/.netlify/*",
        "/fonts/*",
        "/*.ico",
        "/*.png",
        "/*.jpg",
        "/*.svg",
        "/*.woff*"
    ]
};
