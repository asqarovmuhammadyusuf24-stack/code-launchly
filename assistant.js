(() => {
  const panel = document.getElementById('assistantPanel');
  const openButton = document.getElementById('assistantOpen');
  const closeButton = document.getElementById('assistantClose');
  const clearButton = document.getElementById('assistantClear');
  const form = document.getElementById('assistantForm');
  const input = document.getElementById('assistantInput');
  const sendButton = document.getElementById('assistantSend');
  const messagesElement = document.getElementById('assistantMessages');
  if (!panel || !openButton || !closeButton || !clearButton || !form || !input || !sendButton || !messagesElement) return;

  const historyStorageKey = 'code-launchy-assistant-history-v1';
  const creatorMemoryStorageKey = 'code-launchy-assistant-site-creator-v1';
  const guides = [
    {
      image: 'assets/assistant-buying.svg',
      alt: 'Sayt tanlash, so‘rov yuborish va sotuvchi bilan kelishish bosqichlari',
      caption: 'Sayt tanlang → so‘rov yuboring → sotuvchi bilan kelishing',
      terms: ['sotib', 'xarid', 'buyurtma', 'tayyor sayt', 'shablon', 'dasturchi', 'saytni qanday ol', 'sayt tan']
    },
    {
      image: 'assets/assistant-listing.svg',
      alt: 'Hisob ochish, e’lon ma’lumotlarini kiritish va uni yuborish bosqichlari',
      caption: 'Hisob oching → e’lonni to‘ldiring → ko‘rib chiqishga yuboring',
      terms: ["e'lon", 'elon', 'joylash', 'sotuvchi', 'listing']
    },
    {
      image: 'assets/assistant-account.svg',
      alt: 'Ro‘yxatdan o‘tish, profil turini tanlash va so‘rovlarni ko‘rish bosqichlari',
      caption: 'Ro‘yxatdan o‘ting → profilni tanlang → so‘rovlaringizni ko‘ring',
      terms: ['akkaunt', 'hisob', 'google', 'ro‘yxat', 'kirish', 'profil']
    }
  ];
  let historyReadError = false;
  let creatorMemory = false;
  let history = loadHistory();
  let busy = false;

  function loadHistory() {
    try {
      const saved = localStorage.getItem(historyStorageKey);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) throw new TypeError('Chat tarixi formati yaroqsiz.');
      return parsed.filter((item) =>
        item
        && ['user', 'model'].includes(item.role)
        && typeof item.text === 'string'
        && item.text.length <= (item.role === 'user' ? 600 : 6000)
      );
    } catch {
      historyReadError = true;
      return [];
    }
  }

  function loadCreatorMemory() {
    try {
      return localStorage.getItem(creatorMemoryStorageKey) === 'true';
    } catch {
      historyReadError = true;
      return false;
    }
  }

  creatorMemory = loadCreatorMemory();

  function setOpen(isOpen) {
    panel.hidden = !isOpen;
    openButton.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) input.focus();
    else openButton.focus();
  }

  function chooseGuide(question) {
    const normalized = question.toLocaleLowerCase('uz').replace(/[‘’ʼ]/g, "'");
    return guides.slice(1).find((guide) => guide.terms.some((term) => normalized.includes(term)))
      || (guides[0].terms.some((term) => normalized.includes(term)) ? guides[0] : null);
  }

  function restoreHistory() {
    let lastQuestion = '';
    history.forEach(({ role, text }) => {
      if (role === 'user') {
        lastQuestion = text;
        appendQuestion(text);
      } else {
        appendReply(text, chooseGuide(lastQuestion));
      }
    });
    messagesElement.scrollTop = messagesElement.scrollHeight;
  }

  function saveHistory() {
    try {
      localStorage.setItem(historyStorageKey, JSON.stringify(history));
      return true;
    } catch {
      showError('Chat tarixini brauzer xotirasiga saqlab bo‘lmadi.');
      return false;
    }
  }

  function rememberSiteCreator(text) {
    const normalized = text.toLocaleLowerCase('uz').replace(/[‘’ʼ]/g, "'");
    const mentionsSite = /sayt|sayd|code.?launchy/.test(normalized);
    const claimsFirstPerson = /\bmen\b|\bo'zim\b/.test(normalized);
    const mentionsCreation = /yarat|yas|qur|ishlab chiq|eslab qol/.test(normalized);
    if (!mentionsSite || !claimsFirstPerson || !mentionsCreation || creatorMemory) return;

    creatorMemory = true;
    try {
      localStorage.setItem(creatorMemoryStorageKey, 'true');
    } catch {
      showError('Sayt muallifi haqidagi eslatmani saqlab bo‘lmadi.');
    }
  }

  function appendQuestion(text) {
    const message = document.createElement('div');
    message.className = 'assistant-question';
    message.textContent = text;
    messagesElement.append(message);
  }

  function appendReply(text, guide) {
    const reply = document.createElement('article');
    reply.className = 'assistant-reply';
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    if (guide) {
      const figure = document.createElement('figure');
      figure.className = 'assistant-visual';
      const image = document.createElement('img');
      image.src = guide.image;
      image.alt = guide.alt;
      const caption = document.createElement('figcaption');
      caption.textContent = guide.caption;
      figure.append(image, caption);
      reply.append(paragraph, figure);
    } else {
      reply.append(paragraph);
    }
    messagesElement.append(reply);
  }

  function showError(text) {
    const error = document.createElement('p');
    error.className = 'assistant-error';
    error.setAttribute('role', 'alert');
    error.textContent = text;
    messagesElement.append(error);
  }

  function appendTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'assistant-typing';
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-label', 'Gemini javob yozmoqda');
    for (let index = 0; index < 3; index += 1) indicator.append(document.createElement('span'));
    messagesElement.append(indicator);
    messagesElement.scrollTop = messagesElement.scrollHeight;
    return indicator;
  }

  function clearHistory() {
    if (busy) return;
    history = [];
    messagesElement.querySelectorAll('.assistant-question, .assistant-reply, .assistant-error').forEach((message) => message.remove());
    try {
      localStorage.removeItem(historyStorageKey);
    } catch {
      showError('Chat tarixini brauzer xotirasidan o‘chirib bo‘lmadi.');
    }
  }

  async function ask(question) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || busy) return;

    setOpen(true);
    history.push({ role: 'user', text: cleanQuestion });
    appendQuestion(cleanQuestion);
    rememberSiteCreator(cleanQuestion);
    input.value = '';
    busy = true;
    sendButton.disabled = true;
    clearButton.disabled = true;
    sendButton.textContent = '…';
    messagesElement.setAttribute('aria-busy', 'true');
    const typingIndicator = appendTypingIndicator();

    try {
      const recentHistory = history.slice(-8);
      if (recentHistory[0]?.role === 'model') recentHistory.shift();
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: recentHistory, rememberSiteCreator: creatorMemory })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gemini yordamchisi hozir javob bera olmadi.');
      if (typeof result.answer !== 'string' || !result.answer.trim()) {
        throw new Error('Yordamchidan bo‘sh javob keldi. Birozdan so‘ng yana urinib ko‘ring.');
      }
      history.push({ role: 'model', text: result.answer });
      saveHistory();
      appendReply(result.answer, chooseGuide(cleanQuestion));
    } catch (error) {
      history.pop();
      const message = error instanceof TypeError
        ? 'Serverga ulanib bo‘lmadi. Node serveri va GEMINI_API_KEY sozlanganini tekshiring.'
        : error instanceof SyntaxError
          ? 'Serverdan noto‘g‘ri javob keldi. Birozdan so‘ng qayta urinib ko‘ring.'
          : error instanceof Error
            ? error.message
            : 'Ulanishda xatolik. Birozdan so‘ng qayta urinib ko‘ring.';
      showError(message);
    } finally {
      typingIndicator.remove();
      busy = false;
      sendButton.disabled = false;
      clearButton.disabled = false;
      sendButton.textContent = '→';
      messagesElement.setAttribute('aria-busy', 'false');
      messagesElement.scrollTop = messagesElement.scrollHeight;
      input.focus();
    }
  }

  openButton.addEventListener('click', () => setOpen(panel.hidden));
  closeButton.addEventListener('click', () => setOpen(false));
  clearButton.addEventListener('click', clearHistory);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    ask(input.value);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  document.querySelectorAll('[data-assistant-prompt]').forEach((button) => {
    button.addEventListener('click', () => ask(button.dataset.assistantPrompt || ''));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) setOpen(false);
  });

  restoreHistory();
  if (historyReadError) showError('Saqlangan chatni yoki eslatmani o‘qib bo‘lmadi; yangi chat boshlandi.');
})();
