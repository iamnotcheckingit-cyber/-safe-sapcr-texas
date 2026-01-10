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
// VirusTotal IP reputation cache - 1 hour TTL
let vtCache = new Map();
const VT_TTL = 3600000; // 1 hour

async function checkVirusTotal(ip) {
    // Skip private/internal IPs
    if (ip === 'unknown' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('127.')) {
        return null;
    }

    // Check cache first
    const cached = vtCache.get(ip);
    if (cached && (Date.now() - cached.ts) < VT_TTL) {
        return cached.data;
    }

    // Get API key from environment
    const apiKey = Deno.env.get('VIRUSTOTAL_API_KEY');
    if (!apiKey) {
        return null;
    }

    try {
        const response = await fetch(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
            headers: { 'x-apikey': apiKey }
        });

        if (!response.ok) {
            return null;
        }

        const json = await response.json();
        const stats = json.data?.attributes?.last_analysis_stats || {};
        const rep = json.data?.attributes?.reputation || 0;
        const asOwner = json.data?.attributes?.as_owner || '';
        const country = json.data?.attributes?.country || '';

        const result = {
            malicious: stats.malicious || 0,
            suspicious: stats.suspicious || 0,
            harmless: stats.harmless || 0,
            undetected: stats.undetected || 0,
            reputation: rep,
            asOwner: asOwner,
            country: country,
            isBad: (stats.malicious || 0) > 0 || (stats.suspicious || 0) > 2
        };

        // Cache the result
        vtCache.set(ip, { ts: Date.now(), data: result });

        // Clean old cache entries (keep under 1000)
        if (vtCache.size > 1000) {
            const oldest = [...vtCache.entries()]
                .sort((a, b) => a[1].ts - b[1].ts)
                .slice(0, 100);
            oldest.forEach(([k]) => vtCache.delete(k));
        }

        return result;
    } catch (e) {
        console.error('VirusTotal check failed:', e);
        return null;
    }
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

// Tracking pixel injection script - ENHANCED
const trackingScript = (fingerprint, isTor, serverData) => `
<script data-t="onion">
(function(){
    var fp='${fingerprint}',tor=${isTor},st=Date.now(),sd=0,pg=location.pathname;
    var sv=${JSON.stringify(serverData)};

    // Canvas fingerprint - enhanced
    function cfp(){try{var c=document.createElement('canvas');c.width=200;c.height=50;
    var x=c.getContext('2d');x.textBaseline='alphabetic';x.font='14px Arial';
    x.fillStyle='#f60';x.fillRect(125,1,62,20);x.fillStyle='#069';
    x.fillText('Cwm fjord veg balks',2,15);x.fillStyle='rgba(102,204,0,0.7)';
    x.fillText('Cwm fjord veg balks',4,17);return c.toDataURL().slice(-50);}catch(e){return'err';}}

    // Audio fingerprint
    function afp(){try{var a=new(window.AudioContext||window.webkitAudioContext)(),
    o=a.createOscillator(),g=a.createGain(),d=a.createDynamicsCompressor(),
    n=a.createAnalyser();o.connect(g);g.connect(d);d.connect(n);n.connect(a.destination);
    o.start(0);var r=new Float32Array(n.frequencyBinCount);n.getFloatFrequencyData(r);
    o.stop();a.close();return r.slice(0,4).join(',').slice(0,32);}catch(e){return'err';}}

    // WebGL fingerprint - GPU detection
    function wgl(){try{var c=document.createElement('canvas'),g=c.getContext('webgl')||c.getContext('experimental-webgl');
    if(!g)return'none';var d=g.getExtension('WEBGL_debug_renderer_info');
    return d?{v:g.getParameter(d.UNMASKED_VENDOR_WEBGL),r:g.getParameter(d.UNMASKED_RENDERER_WEBGL)}:'blocked';}catch(e){return'err';}}

    // Font detection
    function fdt(){var b='mmmmmmmmmmlli',f=['monospace','sans-serif','serif'],
    t=['Arial','Helvetica','Times','Courier','Verdana','Georgia','Comic Sans MS','Impact','Trebuchet MS'],
    d=document.createElement('span');d.style.cssText='position:absolute;left:-9999px;font-size:72px;';
    d.innerHTML=b;document.body.appendChild(d);var w={},r=[];
    f.forEach(function(x){d.style.fontFamily=x;w[x]=d.offsetWidth;});
    t.forEach(function(x){for(var i=0;i<f.length;i++){d.style.fontFamily=x+','+f[i];
    if(d.offsetWidth!==w[f[i]]){r.push(x);break;}}});
    document.body.removeChild(d);return r.join(',');}

    // Hardware info
    function hw(){return{mem:navigator.deviceMemory||'?',cpu:navigator.hardwareConcurrency||'?',
    plt:navigator.platform,lang:navigator.languages?navigator.languages.join(','):navigator.language,
    ck:navigator.cookieEnabled,dnt:navigator.doNotTrack,tc:navigator.maxTouchPoints||0};}

    // Connection info
    function cn(){var c=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
    return c?{type:c.effectiveType,dwnl:c.downlink,rtt:c.rtt}:'none';}

    // Battery status (async, sends separately)
    if(navigator.getBattery){navigator.getBattery().then(function(b){
    var bd={lvl:b.level,chrg:b.charging};
    navigator.sendBeacon('/.netlify/functions/tor-detection',JSON.stringify({fp:fp,bat:bd}));
    }).catch(function(){});}

    // Scroll depth tracker
    document.addEventListener('scroll',function(){
        var h=document.documentElement,b=document.body,
        st=h.scrollTop||b.scrollTop,sh=h.scrollHeight||b.scrollHeight,
        ch=h.clientHeight;sd=Math.round((st/(sh-ch))*100)||0;
    });

    // Form interaction tracker
    var fi=false,fld=[];
    document.addEventListener('input',function(e){
        if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'){fi=true;
        if(fld.indexOf(e.target.name)===-1)fld.push(e.target.name);}
    });

    // Honeypot trigger detection
    var hp=false;
    setTimeout(function(){
        var hpf=document.querySelectorAll('[name="website"],[name="url"],[name="email2"]');
        hpf.forEach(function(f){if(f.value)hp=true;});
    },5000);

    // Mouse behavior tracking
    var mc=0,mm=0,lm=Date.now();
    document.addEventListener('click',function(){mc++;});
    document.addEventListener('mousemove',function(){mm++;var n=Date.now();
    if(n-lm<10)mm+=10;lm=n;});// Bot detection: superhuman speed

    // Keyboard cadence
    var kc=[],lk=0;
    document.addEventListener('keydown',function(){var n=Date.now();
    if(lk)kc.push(n-lk);lk=n;if(kc.length>20)kc.shift();});

    // Permission status check (passive - doesn't prompt)
    var perms={};
    ['geolocation','notifications','camera','microphone'].forEach(function(p){
    if(navigator.permissions){navigator.permissions.query({name:p}).then(function(r){
    perms[p]=r.state;}).catch(function(){perms[p]='err';});}});

    // Timezone mismatch detection
    var tzOff=new Date().getTimezoneOffset(),
    tzName=Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Send beacon on unload
    function send(){
        var d={
            fp:fp,tor:tor,pg:pg,sv:sv,
            t:Date.now()-st,sd:sd,fi:fi,hp:hp,fld:fld,
            cf:cfp(),af:afp(),wg:wgl(),fn:fdt(),
            hw:hw(),cn:cn(),pm:perms,
            ms:{c:mc,m:mm},kb:kc.length?Math.round(kc.reduce(function(a,b){return a+b;})/kc.length):0,
            sr:screen.width+'x'+screen.height+'x'+screen.colorDepth,
            tz:{off:tzOff,name:tzName},
            ref:document.referrer,
            ws:{w:window.innerWidth,h:window.innerHeight}
        };
        navigator.sendBeacon('/.netlify/functions/tor-detection',JSON.stringify(d));
    }

    window.addEventListener('beforeunload',send);
    // Also send after 30 seconds in case they don't trigger unload
    setTimeout(send,30000);

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

    // Capture server-side headers for fingerprinting
    const serverData = {
        ip: clientIP,
        vt: null, // Will be populated after VT check
        lang: request.headers.get('accept-language') || 'none',
        enc: request.headers.get('accept-encoding') || 'none',
        conn: request.headers.get('connection') || 'none',
        via: request.headers.get('via') || null,
        xfwd: request.headers.get('x-forwarded-for') || null,
        xreal: request.headers.get('x-real-ip') || null,
        cfray: request.headers.get('cf-ray') || null,
        cfcountry: request.headers.get('cf-ipcountry') || null,
        cfconnecting: request.headers.get('cf-connecting-ip') || null,
        priority: request.headers.get('priority') || null,
        secua: request.headers.get('sec-ch-ua') || null,
        secuam: request.headers.get('sec-ch-ua-mobile') || null,
        secuap: request.headers.get('sec-ch-ua-platform') || null,
        secfetchd: request.headers.get('sec-fetch-dest') || null,
        secfetchm: request.headers.get('sec-fetch-mode') || null,
        secfetchs: request.headers.get('sec-fetch-site') || null,
        dnt: request.headers.get('dnt') || null
    };

    // Fetch TOR nodes
    const torNodes = await fetchTorNodes();
    const isTor = isTorIP(clientIP, torNodes);
    const isWarp = isCloudflareWarp(clientIP);
    const isVpnProxy = isProxy(clientIP);
    const isDC = isDatacenter(clientIP);
    const isSuspicious = isTor || isWarp || isVpnProxy || isDC;
    // Check VirusTotal reputation (async, non-blocking for normal users)
    let vtReputation = null;
    if (isSuspicious) {
        // Only do VT lookup for already-suspicious IPs to save API calls
        vtReputation = await checkVirusTotal(clientIP);
    }

    if (vtReputation) {
        serverData.vt = vtReputation;
    }




    // Detect header anomalies
    const headerAnomalies = [];
    if (serverData.via) headerAnomalies.push('via-header');
    if (serverData.xfwd && serverData.xfwd.includes(',')) headerAnomalies.push('multi-hop');
    if (!serverData.lang || serverData.lang === 'none') headerAnomalies.push('no-lang');
    if (serverData.dnt === '1') headerAnomalies.push('dnt-enabled');
    if (!serverData.secua && ua.includes('Chrome')) headerAnomalies.push('missing-sec-ch-ua');

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
    const trackingCode = trackingScript(fingerprint, isTor, serverData);
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
    if (headerAnomalies.length) newHeaders.set('X-Header-Anomalies', headerAnomalies.join(','));
    if (vtReputation?.isBad) newHeaders.set('X-VT-Malicious', 'yes');

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
            serverData: serverData,
            vtReputation: vtReputation,
            anomalies: headerAnomalies,
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
