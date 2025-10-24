const locations = [
  { name: 'Downtown Flagship', address: '123 Tea Street', hours: '7AM-11PM', status: 'Open' },
  { name: 'University Campus', address: '456 Campus Ave', hours: '6AM-12AM', status: 'Open' },
  { name: 'Shopping Mall', address: '789 Mall Blvd', hours: '10AM-10PM', status: 'Open' },
  { name: 'Business District', address: '321 Office Plaza', hours: '7AM-8PM', status: 'Closed' }
];

const faqItems = [
  { question: 'What are your most popular drinks?', answer: 'Our bestsellers include Matcha Supreme, Brown Sugar Delight, and Classic Milk Tea with boba pearls!' },
  { question: 'Do you offer vegan options?', answer: 'Yes! We have many plant-based milk alternatives including oat, almond, and coconut milk.' },
  { question: 'Can I customize my drink?', answer: 'Absolutely! Use our customize page to create your perfect blend with various toppings and sweetness levels.' }
];

document.addEventListener('DOMContentLoaded', () => {
  // Animate header
  const header = document.getElementById('header');
  setTimeout(() => header.classList.add('enter'), 80);

  // Animate cards (including chat panel)
  const cards = document.querySelectorAll('#contactCards .card');
  cards.forEach((c, i) => setTimeout(() => c.classList.add('enter'), 150 + i * 120));

  // Animate form + map + FAQ
  setTimeout(() => document.getElementById('formWrap').classList.add('enter'), 500);
  setTimeout(() => document.getElementById('mapPanel').classList.add('enter'), 620);
  setTimeout(() => document.getElementById('faqPanel').classList.add('enter'), 620);

  // Populate locations
  const locWrap = document.getElementById('locationsList');
  locations.forEach(loc => {
    const div = document.createElement('div');
    div.className = 'location';
    div.innerHTML = `
      <div class="meta">
        <div style="font-weight:700">${loc.name}</div>
        <div class="muted small">${loc.address}</div>
        <div class="muted small">${loc.hours}</div>
      </div>
      <div>
        <span class="badge ${loc.status === 'Open' ? 'open' : 'closed'}">${loc.status}</span>
      </div>
    `;
    locWrap.appendChild(div);
  });

  // Populate FAQ
  const faqWrap = document.getElementById('faqList');
  faqItems.forEach((f, i) => {
    const el = document.createElement('div');
    el.className = 'faq-item';
    el.innerHTML = `<h3>⭐ ${f.question}</h3><p>${f.answer}</p>`;
    faqWrap.appendChild(el);
    setTimeout(() => el.classList.add('enter'), 200 + i * 120);
  });

  // Form submit
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    console.log('Form submitted:', data);
    alert('Cảm ơn! Tin nhắn đã được gửi.');
    form.reset();
  });

  // Chat toggle
  const floating = document.getElementById('floatingChat');
  const chatModal = document.getElementById('chatModal');
  const closeChat = document.getElementById('closeChatModal');
  const openChatBtn = document.getElementById('openChatBtn');
  const sendChat = document.getElementById('sendChat');
  const chatInput = document.getElementById('chatInput');

  function openChat() {
    chatModal.classList.remove('hidden');
    chatModal.style.display = 'block';
  }
  function closeChatModal() {
    chatModal.classList.add('hidden');
    chatModal.style.display = 'none';
  }

  floating.addEventListener('click', openChat);
  closeChat.addEventListener('click', closeChatModal);
  openChatBtn.addEventListener('click', openChat);

  // Quick options
  document.querySelectorAll('.quick').forEach(btn => {
    btn.addEventListener('click', () => alert('Bạn chọn: ' + btn.textContent));
  });

  // Send chat
  sendChat.addEventListener('click', () => {
    const txt = chatInput.value.trim();
    if (!txt) return;
    const content = document.querySelector('.chat-content');
    const userBubble = document.createElement('div');
    userBubble.className = 'bubble';
    userBubble.textContent = txt;
    content.appendChild(userBubble);
    chatInput.value = '';
    setTimeout(() => {
      const botReply = document.createElement('div');
      botReply.className = 'bubble';
      botReply.textContent = "AloBot đã nhận: " + txt;
      content.appendChild(botReply);
      content.scrollTop = content.scrollHeight;
    }, 700);
  });

  // View more FAQ
  document.getElementById('viewMoreFaq').addEventListener('click', () => alert('Chuyển tới trang FAQ (demo).'));
});