// SAFE SAPCR Chatbot Widget
(function() {
    // Create chat widget HTML
    const chatHTML = `
    <div id="chatWidget" class="chat-widget">
        <button id="chatToggle" class="chat-toggle" aria-label="Open chat">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        </button>
        <div id="chatBox" class="chat-box hidden">
            <div class="chat-header">
                <span>SAFE SAPCR Assistant</span>
                <button id="chatClose" aria-label="Close chat">&times;</button>
            </div>
            <div id="chatMessages" class="chat-messages">
                <div class="chat-message bot">Hi! I can answer questions about SAPCR, Texas custody law, and the SAFE SAPCR Act. How can I help?<br><br><em style="font-size:11px;color:#666;">This is legal information, not legal advice.</em></div>
            </div>
            <div id="contactForm" class="contact-form hidden">
                <p>Please provide your contact info:</p>
                <input type="text" id="chatName" placeholder="Your name">
                <input type="email" id="chatEmail" placeholder="Email">
                <input type="tel" id="chatPhone" placeholder="Phone (optional)">
                <button id="submitContact" class="btn">Submit</button>
            </div>
            <div class="chat-input-area">
                <input type="text" id="chatInput" placeholder="Type your question..." autocomplete="off">
                <button id="chatSend" aria-label="Send">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
    <style>
    .chat-widget { position: fixed; bottom: 20px; right: 20px; z-index: 9999; font-family: 'Open Sans', sans-serif; }
    .chat-toggle { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #1a365d, #2c5282); border: none; color: white; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.3); transition: transform 0.2s; }
    .chat-toggle:hover { transform: scale(1.1); }
    .chat-box { position: absolute; bottom: 70px; right: 0; width: 350px; max-width: 90vw; background: white; border-radius: 12px; box-shadow: 0 5px 40px rgba(0,0,0,0.2); overflow: hidden; }
    .chat-box.hidden { display: none; }
    .chat-header { background: linear-gradient(135deg, #1a365d, #2c5282); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
    .chat-header button { background: none; border: none; color: white; font-size: 24px; cursor: pointer; line-height: 1; }
    .chat-messages { height: 300px; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
    .chat-message { padding: 10px 14px; border-radius: 12px; max-width: 85%; line-height: 1.4; font-size: 14px; }
    .chat-message.bot { background: #f0f0f0; align-self: flex-start; border-bottom-left-radius: 4px; }
    .chat-message.user { background: #1a365d; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
    .chat-input-area { display: flex; padding: 10px; border-top: 1px solid #eee; gap: 8px; }
    .chat-input-area input { flex: 1; padding: 10px 14px; border: 1px solid #ddd; border-radius: 20px; font-size: 14px; outline: none; }
    .chat-input-area input:focus { border-color: #1a365d; }
    .chat-input-area button { width: 40px; height: 40px; border-radius: 50%; background: #1a365d; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .contact-form { padding: 15px; background: #f8f9fa; display: flex; flex-direction: column; gap: 8px; }
    .contact-form.hidden { display: none; }
    .contact-form input { padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
    .contact-form .btn { background: #1a365d; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 600; }
    </style>`;

    // Insert into DOM
    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // Initialize chat functionality
    const toggle = document.getElementById('chatToggle');
    const box = document.getElementById('chatBox');
    const close = document.getElementById('chatClose');
    const input = document.getElementById('chatInput');
    const send = document.getElementById('chatSend');
    const messages = document.getElementById('chatMessages');
    const contactForm = document.getElementById('contactForm');
    const submitContact = document.getElementById('submitContact');
    let userInfo = {};

    toggle.onclick = () => box.classList.toggle('hidden');
    close.onclick = () => box.classList.add('hidden');

    function addMessage(text, isUser) {
        const div = document.createElement('div');
        div.className = 'chat-message ' + (isUser ? 'user' : 'bot');
        div.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, true);
        input.value = '';

        try {
            const res = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, userInfo })
            });
            const data = await res.json();
            addMessage(data.reply, false);

            if (data.requestContact) {
                contactForm.classList.remove('hidden');
            }
        } catch (err) {
            addMessage('Sorry, there was an error. Please try again or email info@safesapcrtx.org', false);
        }
    }

    send.onclick = sendMessage;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

    submitContact.onclick = async () => {
        userInfo = {
            name: document.getElementById('chatName').value,
            email: document.getElementById('chatEmail').value,
            phone: document.getElementById('chatPhone').value
        };

        if (!userInfo.email) {
            alert('Please provide your email');
            return;
        }

        contactForm.classList.add('hidden');
        addMessage('Thanks! We\'ll be in touch at ' + userInfo.email + ' soon.', false);

        await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Contact request submitted', userInfo })
        });
    };
})();
