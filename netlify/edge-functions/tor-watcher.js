// TOR Watcher Edge Function
// Detects TOR visitors, adds delays, injects tracking, logs everything
// They think they're invisible. They're not.
// That automated Cloudflare WARP? Nasty work.

// VPN/Proxy IPv6 prefixes
const proxyPrefixes = [
    '2a06:98c0:', '2606:4700:', '2a09:bac0:', '2001:ac8:',
    '2a0d:5600:', '2a03:b0c0:', '2604:a880:', '2a01:4f8:', '2a01:4f9:'
];

// Datacenter IPv4 ranges  
const datacenterRanges = [
    '104.197.', '35.188.', '35.192.', '35.224.', '34.68.', '34.72.',
    '44.192.', '44.224.', '54.', '52.', '164.90.', '165.22.', '167.99.',
    '45.33.', '45.56.', '45.79.', '95.177.'
];

function isProxy(ip) { return proxyPrefixes.some(p => ip.startsWith(p)); }
function isDatacenter(ip) { return datacenterRanges.some(r => ip.startsWith(r)); }
function isCloudflareWarp(ip) { return ip.startsWith('2a06:98c0:'); }

// TOR exit nodes cache - refreshed every 10 minutes
let torCache = {
    nodes: new Set(),
    lastFetch: 0
};

async function fetchTorNodes() {
    const now = Date.now();
    const TTL = 600000; // 10 minutes

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
    const isWarp = isCloudflareWarp(clientIP);
    const isVpnProxy = isProxy(clientIP);
    const isDC = isDatacenter(clientIP);
    const isSuspicious = isTor || isWarp || isVpnProxy || isDC;

    // SLOWLORIS DEFENSE: Add 2-3 second delay for TOR visitors
    if (isSuspicious) {
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
    if (isSuspicious) {
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
    if (isWarp) newHeaders.set('X-WARP-Detected', 'yes');
    if (isVpnProxy) newHeaders.set('X-VPN-Detected', 'yes');
    if (isDC) newHeaders.set('X-Datacenter-Detected', 'yes');
    newHeaders.set('X-Session-FP', fingerprint);

    // Bad actors get noindex - don't let them pollute search results
    if (isSuspicious) {
        newHeaders.set('X-Robots-Tag', 'noindex, nofollow');
    }

    // Log TOR visitor to console (will appear in Netlify logs)
    if (isSuspicious) {
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
