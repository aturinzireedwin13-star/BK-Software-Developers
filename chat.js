(() => {
  const toggle = document.getElementById('aiChatToggle');
  const panel = document.getElementById('aiChatPanel');
  const closeBtn = document.getElementById('aiChatClose');
  const body = document.getElementById('aiChatBody');
  const input = document.getElementById('aiChatInput');
  const send = document.getElementById('aiChatSend');
  if (!toggle || !panel) return;

  const history = [];
  let open = false;
  let greeted = false;

  function addBubble(text, who) {
    const el = document.createElement('div');
    el.className = `ai-bubble ${who}`;
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'ai-bubble bot typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function setOpen(v) {
    open = v;
    panel.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      if (!greeted) {
        addBubble("Hi! I'm the BK Software Developers assistant. Ask me about our services, apps, pricing or how to start a project.", 'bot');
        greeted = true;
      }
      setTimeout(() => input.focus(), 250);
    }
  }

  toggle.addEventListener('click', () => setOpen(!open));
  closeBtn.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) setOpen(false);
  });

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    addBubble(text, 'user');
    input.value = '';
    send.disabled = true;
    const typingEl = showTyping();

    try {
      const res = await fetch(window.BK_CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      });
      const data = await res.json().catch(() => ({}));
      typingEl.remove();

      if (!res.ok) throw new Error(data.error || 'Request failed');

      addBubble(data.reply, 'bot');
      history.push({ role: 'user', parts: [{ text }] });
      history.push({ role: 'model', parts: [{ text: data.reply }] });
    } catch (err) {
      typingEl.remove();
      addBubble('Sorry, I ran into an issue. Please try again or WhatsApp us at +256 794 431395.', 'bot');
      console.error(err);
    } finally {
      send.disabled = false;
    }
  }

  send.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
