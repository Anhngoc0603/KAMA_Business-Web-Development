const locations = [
  { name: "Downtown Store", address: "123 Tea Street", hours: "7AM-11PM", status: "Open" },
  { name: "Campus Location", address: "456 Campus Avenue", hours: "6AM-12AM", status: "Open" },
  { name: "Shopping Mall", address: "789 Mall Boulevard", hours: "10AM-10PM", status: "Open" },
  { name: "Business District", address: "321 Office Plaza", hours: "7AM-8PM", status: "Closed" },
]

// FAQ tiles (grid, like screenshot)
const faqTiles = [
  { icon: 'images/c1.png', title: 'Registered Customers / Benefits', desc: 'Membership, points, coupons' },
  { icon: 'images/c2.png', title: 'Orders', desc: 'Order status and details' },
  { icon: 'images/c3.png', title: 'Payments', desc: 'Methods, issues, receipts' },
  { icon: 'images/c5.png', title: 'Shipping', desc: 'Delivery options and fees' },
  { icon: 'images/c7.png', title: 'Exchanges / Returns / Refund', desc: 'Policy and process' },
  { icon: 'images/c8.png', title: 'Events', desc: 'Promotions & campaigns' },
  { icon: 'images/c4.png', title: 'Terms and Conditions', desc: 'Usage, liability, governance' },
  { icon: 'images/c2.png', title: 'Others', desc: 'Miscellaneous questions' },
]

// Answers data for each FAQ category
const faqAnswers = {
  'Registered Customers / Benefits': [
    {
      q: 'Can I use the membership benefits from the Global Mall at offline malls in Korea?',
      a: 'Unfortunately, KAMA offline stores in Korea and the Global Mall are operated separately, so benefits based on your membership level on the Global Mall cannot be applied in offline stores. We appreciate your understanding.'
    },
    {
      q: 'How can I write an inquiry?',
      a: 'Go to the CONTACT US tab and choose a topic (Orders, Payments, Shipping, etc.). Fill in your details and message, then press Send. You can also open the floating chat for quick help. Our team replies within 24–48 business hours.'
    },
    {
      q: 'I forgot the password.',
      a: 'Use the “Forgot password” link on the login page and enter your registered email. We will send a reset link. If you do not receive the email within a few minutes, please check your spam folder or request again. For further assistance, contact Support via CONTACT US.'
    },
    {
      q: 'I would like to receive notifications about KAMA Global’s events, coupons, and other offers.',
      a: 'Enable notifications in My Account → Preferences. You can subscribe to newsletters and allow promotional push/emails. You may also follow KAMA on social channels for real-time updates.'
    },
    {
      q: 'I haven’t received reward points for my order.',
      a: 'Reward points are added after your order is delivered and the return period has passed. It may take up to 7 days. If points do not appear, please contact Support with your order number. Note: cancelled/returned items and certain promotions may be excluded.'
    },
    {
      q: 'Where can I check the points?',
      a: 'Visit My Account → Rewards to see your balance, history, and expiry dates. Points also appear at checkout when applicable.'
    },
    {
      q: 'Can I change my ID?',
      a: 'For security and system integrity, the login ID (email) generally cannot be changed. If you must use a different email, create a new account and contact Support to discuss options such as moving subscriptions or closing the old account.'
    },
    {
      q: 'Where can I update my information?',
      a: 'Go to My Account → Profile to update name, phone, and preferences; My Account → Addresses to manage shipping addresses; and My Account → Payments to manage saved methods.'
    },
    {
      q: 'How can I change my password?',
      a: 'Navigate to My Account → Security and choose “Change password”. Enter your current password and a new one that meets the security requirements, then save.'
    },
    {
      q: 'How can I create a beauty profile?',
      a: 'Open My Account → Beauty Profile and answer a few quick questions about your skin type, concerns, and preferences. Your profile helps us personalize recommendations and offers.'
    },
  ],
  'Orders': [
    {
      q: 'How can I change the shipping country?',
      a: 'At checkout, set the destination country in your shipping address. Some products cannot be shipped to certain regions due to regulations or courier limitations. If your account region is different, simply add a new address for the target country; prices, taxes, and delivery times may change accordingly.'
    },
    {
      q: 'Can I save an address that I use frequently?',
      a: 'Yes. Go to My Account → Addresses to add and manage multiple addresses. Mark one as Default to use it automatically at checkout.'
    },
    {
      q: 'Can the products available on the KAMA Global website be used by pregnant women or people with allergies?',
      a: 'Product suitability depends on individual health conditions. Please review the full ingredients list and consult your physician if you are pregnant, nursing, or have allergies. Discontinue use and contact Support if irritation occurs.'
    },
    {
      q: 'The payment amount for a product I purchased at a KAMA offline store in Korea seems incorrect.',
      a: 'Offline store transactions are handled by the local store. Please contact the store where you purchased with your receipt for assistance. The Global Mall cannot modify offline payments.'
    },
    {
      q: 'Where can I check my order history?',
      a: 'Go to My Account → Orders to view all past and current orders, statuses, invoices, and tracking links.'
    },
    {
      q: 'Can I place an order as a guest?',
      a: 'Yes, guest checkout is available in supported regions. However, reward points and certain benefits require signing in. Order updates and tracking links will be sent to your email.'
    },
    {
      q: 'I did not receive the order confirmation email.',
      a: 'Please check your spam/junk folder and verify your email address is correct. If you still cannot find it after 10–15 minutes, contact Support and provide your name, email, and the time of purchase.'
    },
    {
      q: 'Is it possible to purchase products wholesale?',
      a: 'Wholesale purchases are not supported on the retail site. For business/partner inquiries, please use the Affiliate tab or contact our business team via the CONTACT US form.'
    },
    {
      q: 'Is there a payment limit per order?',
      a: 'Limits may exist depending on the payment method and bank policies. Large orders might require split payments or additional verification. If your payment is declined, try another method or contact your bank.'
    },
    {
      q: 'Can I check the exchange rate for my country?',
      a: 'Displayed prices may be shown in a selected currency; final charges are processed by your bank using its exchange rate at the time of billing. For accurate rates, please refer to your bank or card provider.'
    }
  ],
  'Payments': [
    { q: 'Which payment methods are supported?', a: 'We accept major credit/debit cards (Visa, Mastercard, Amex) and selected digital wallets depending on your region. All payments are processed securely. Some banks may place a temporary authorization hold.' },
    { q: 'Why did my payment fail?', a: 'Common reasons include insufficient funds, incorrect card details, or bank security blocks. Try another method, verify your information, or contact your bank. If the issue persists, reach out to Support.' },
    { q: 'When will my card be charged?', a: 'Your card is charged when the order is authorized. Some banks show a temporary hold first; the final amount posts after shipment depending on your bank’s policy.' },
    { q: 'Can I split payments for a large order?', a: 'Split payments are not available at checkout. If your bank declines a high amount, place separate orders or contact your bank for approval.' },
    { q: 'Can I get an invoice/receipt?', a: 'Yes. Download receipts from My Account → Orders. For tax invoices where applicable, contact Support with your order number and billing details.' },
    { q: 'Is my payment secure?', a: 'KAMA uses industry-standard encryption and PCI-compliant processors. We never store full card numbers on our servers.' },
    { q: 'Can I change the payment method after placing an order?', a: 'After placing an order, the payment method cannot be changed. You may cancel while in Processing and place a new order.' },
    { q: 'Are there foreign transaction fees?', a: 'Your bank or card provider may charge currency conversion or international transaction fees. Please check with your bank for exact rates.' },
    { q: 'How are refunds processed to my card?', a: 'Refunds go back to the original payment method. Processing typically takes 3–7 business days after we initiate the refund, subject to bank timelines.' },
    { q: 'How do I use coupons or vouchers?', a: 'Enter the code at checkout in the “Apply coupon” field. Some codes are single-use, have minimum order values, or product exclusions.' }
  ],
  'Shipping': [
    { q: 'How long will delivery take?', a: 'Domestic deliveries typically take 3–7 business days. International deliveries vary by destination (7–14 business days). You will receive a tracking link once your order ships.' },
    { q: 'How much is shipping?', a: 'Shipping fees are calculated at checkout based on destination, weight, and method. We periodically offer free‑shipping promotions above certain order values.' },
    { q: 'How do I track my shipment?', a: 'Open My Account → Orders and click “Track” for your parcel. The link updates as the courier scans the package.' },
    { q: 'Do you ship internationally?', a: 'Yes, to most countries. Some items cannot be shipped due to local regulations or courier restrictions.' },
    { q: 'My parcel is lost or not moving.', a: 'If tracking has not updated for several days, contact Support with your order number. We will open an investigation with the courier.' },
    { q: 'My parcel arrived damaged.', a: 'Please photograph the packaging and items and contact Support within 7 days of delivery. We will assist with replacements or refunds as applicable.' },
    { q: 'Can I change the address after placing an order?', a: 'Address changes are possible only while the order is in Processing. Once shipped, changes depend on courier policies and may not be guaranteed.' },
    { q: 'Can multiple orders be combined into one shipment?', a: 'Orders are packed and shipped individually. Combining orders is not supported after checkout.' },
    { q: 'What happens if delivery fails?', a: 'The courier may attempt re-delivery or hold the parcel for pickup. If returned to sender, we will contact you to arrange reshipment or refund.' },
    { q: 'Do you offer express shipping?', a: 'Express options may be available at checkout depending on destination and weight.' }
  ],
  
  'Exchanges / Returns / Refund': [
    { q: 'What is the return policy?', a: 'You may request a return within 30 days of delivery for unopened/unused items. Start the process via My Account → Orders → Request return. Some items (e.g., opened cosmetics, gift cards) may be ineligible.' },
    { q: 'How do I request a return?', a: 'Go to My Account → Orders, select the order, and choose “Request return”. Follow the instructions to print labels or schedule pickup where available.' },
    { q: 'How long do refunds take?', a: 'After we receive and inspect the items, refunds are initiated within 2–3 business days. Banks typically post the funds within 3–7 business days.' },
    { q: 'Are shipping fees refundable?', a: 'Shipping fees are refundable only when the return is due to our error or a defective item. Otherwise, original shipping fees are not refunded.' },
    { q: 'Can I exchange an item?', a: 'Exchanges are available for selected items/regions. If an exchange is not available, please request a return and place a new order.' },
    { q: 'Which items are non-returnable?', a: 'Opened cosmetics, used items, gift cards, and personalized products are typically non-returnable unless defective.' },
    { q: 'I received a defective product.', a: 'Please contact Support with photos within 7 days of delivery. We will arrange replacement or refund after verification.' },
    { q: 'Can I return opened cosmetics?', a: 'For hygiene reasons, opened or used cosmetics are not eligible unless defective. Please contact Support for evaluation.' },
    { q: 'How do I track my return status?', a: 'You can view the status under My Account → Orders after submitting a return request.' },
    { q: 'What is the refund method?', a: 'Refunds are issued to the original payment method. Store credit may be offered in certain cases if preferred.' }
  ],
  'Events': [
    { q: 'How do I join promotions?', a: 'Check the Events section for current campaigns. Apply coupon codes at checkout when applicable. Terms and conditions, including validity periods and exclusions, are displayed on each event page.' },
    { q: 'How do I apply a coupon code?', a: 'Enter the code in the coupon field at checkout and click Apply. Some codes require a minimum order value or have product exclusions.' },
    { q: 'Can I combine multiple promotions?', a: 'Unless stated otherwise, promotions and coupons cannot be combined. The system automatically applies the best eligible offer.' },
    { q: 'Where can I find event details?', a: 'Open the Events page to see live promotions, rules, eligibility, and end dates.' },
    { q: 'How are winners announced for giveaways?', a: 'Winners are notified via email and announced on official channels. Please ensure your contact details are up to date.' },
    { q: 'Why is my coupon not working?', a: 'Check the validity period, minimum spend, and product exclusions. If it still fails, contact Support with the code and your cart items.' },
    { q: 'How do I manage promotional notifications?', a: 'Go to My Account → Preferences to subscribe or unsubscribe from promotional emails and pushes.' },
    { q: 'How can I get early access?', a: 'Members may receive early access through newsletters or loyalty benefits. Ensure notifications are enabled.' },
    { q: 'Do points apply during events?', a: 'Unless stated otherwise, standard points and rewards apply. Some discounted items may be excluded.' },
    { q: 'Can I return event bundles?', a: 'Event bundles follow the standard return policy unless noted on the event page.' }
  ],
  'Terms and Conditions': [
    { q: 'What are KAMA’s Terms of Service?', a: 'Our Terms set the rules for using KAMA services, including account use, purchasing, promotions, returns, and acceptable conduct. By using the site, you agree to these Terms.' },
    { q: 'Who can use the KAMA Global site?', a: 'Individuals who are of legal age in their jurisdiction and able to form contracts may use the site. Some services or promotions may have region‑specific eligibility requirements.' },
    { q: 'Pricing, availability, and errors—how are they handled?', a: 'We strive for accuracy, but pricing/availability may change and errors can occur. If a material error is found, we may cancel or adjust the order and will notify you accordingly.' },
    { q: 'Can promotions and coupons be combined?', a: 'Unless stated otherwise, promotions and coupons cannot be combined. Each campaign or code includes its own terms, validity period, and exclusions.' },
    { q: 'What is KAMA’s liability limitation?', a: 'To the fullest extent permitted by law, KAMA is not liable for indirect, incidental, or consequential damages. Remedies are limited to the amounts paid for the product or service.' },
    { q: 'Intellectual property—what can I use?', a: 'All content (logos, text, images, designs) is owned or licensed by KAMA and protected by law. You may not copy, redistribute, or create derivative works without permission.' },
    { q: 'Governing law and dispute resolution?', a: 'Unless otherwise required by local law, disputes are governed by the laws of the operating jurisdiction specified by KAMA and handled in the competent courts of that jurisdiction.' },
    { q: 'How do updates to the Terms work?', a: 'We may update the Terms from time to time. Continued use of the services after changes constitutes acceptance. Key changes will be communicated via the site or email.' },
    { q: 'Account suspension or termination—when can it happen?', a: 'We may suspend or terminate accounts that violate the Terms, engage in fraud, misuse promotions, or pose security risks. You may also request account deletion via Contact Us.' },
    { q: 'Third‑party services and links—who is responsible?', a: 'Certain features rely on third‑party services (payments, logistics, analytics). KAMA is not responsible for their content or policies. Please review third‑party terms before use.' }
  ],
  
  'Others': [
    { q: 'Where can I contact support?', a: 'Use the CONTACT US tab to send us a message, or click the floating chat button for live assistance. We aim to respond within 24–48 business hours.' },
    { q: 'How can I provide feedback?', a: 'Please use the CONTACT US form and select “Feedback”. We appreciate suggestions to improve your experience.' },
    { q: 'Do you have physical stores?', a: 'Yes, visit the Contact page → Find our store to see locations and hours where available.' },
    { q: 'How can I delete my account?', a: 'Submit a request via CONTACT US or My Account → Security. After verification, we will process the deletion according to policy.' },
    { q: 'How do I request data/privacy information?', a: 'Use the CONTACT US form with the subject “Data request”. We will guide you through verification and provide the requested information.' },
    { q: 'Which languages are supported?', a: 'We currently support English and Vietnamese for customer service. Additional languages may be added over time.' },
    { q: 'What are support hours?', a: 'Support typically operates Monday–Friday, 9:00–18:00 local time (excluding holidays). Response times may vary during peak periods.' },
    { q: 'Do you have a mobile app?', a: 'We are working on improving mobile experience via the website. Official app updates will be announced under Events.' },
    { q: 'How do I subscribe/unsubscribe from newsletters?', a: 'Manage your preferences under My Account → Preferences or use the link at the bottom of any email.' },
    { q: 'Where can I find terms and policies?', a: 'See the footer for links to Terms of Service, Privacy Policy, and Return Policy.' }
  ],
}

// Announcement auto-scroll
const wrapper1 = document.getElementById("announcementWrapper")
const announcement = document.querySelectorAll(".announcement-slide")
let indexAnnouncement = 0

function showAnnouncement(i) {
  wrapper1.style.transform = `translateX(-${i * 100}%)`
}

setInterval(() => {
  indexAnnouncement = (indexAnnouncement + 1) % announcement.length
  showAnnouncement(indexAnnouncement)
}, 5000)

// Main animations
document.addEventListener("DOMContentLoaded", () => {
  // Tabs switching
  const faqsSection = document.getElementById('faqsSection');
  const contactSection = document.getElementById('contactSection');
  const noticeSection = document.getElementById('noticeSection');
  const tabs = document.querySelectorAll('#csTabs .tab');
  const switchTab = (name) => {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    faqsSection && faqsSection.classList.toggle('hidden', name !== 'faqs');
    contactSection && contactSection.classList.toggle('hidden', name !== 'contact');
    noticeSection && noticeSection.classList.toggle('hidden', name !== 'notice');
  };
  tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
  switchTab('faqs');
  // Animate header
  const header = document.getElementById("header")
  if (header) setTimeout(() => header.classList.add("enter"), 100)

  // Animate cards
  const cards = document.querySelectorAll("#contactCards .card")
  cards.forEach((c, i) => setTimeout(() => c.classList.add("enter"), 200 + i * 100))

  // Animate form + map + FAQ
  setTimeout(() => {
    const formWrap = document.getElementById("formWrap")
    if (formWrap) formWrap.classList.add("enter")
  }, 600)

  setTimeout(() => {
    const mapPanel = document.getElementById("mapPanel")
    if (mapPanel) mapPanel.classList.add("enter")
  }, 800)

  setTimeout(() => {
    const faqPanel = document.getElementById("faqPanel")
    if (faqPanel) faqPanel.classList.add("enter")
  }, 1000)

  // Populate locations
  const locWrap = document.getElementById("locationsList")
  if (locWrap) {
    locations.forEach((loc) => {
      const div = document.createElement("div")
      div.className = "location"
      div.innerHTML = `
        <div class="meta">
          <div style="font-weight:600; color: var(--text-primary); margin-bottom: 4px;">${loc.name}</div>
          <div class="muted small">${loc.address}</div>
          <div class="muted small">${loc.hours}</div>
        </div>
        <div>
          <span class="badge ${loc.status === "Open" ? "open" : "closed"}">${loc.status}</span>
        </div>
      `
      locWrap.appendChild(div)
    })
  }

  // Populate FAQ grid
  const faqGrid = document.getElementById('faqGrid');
  const answersSection = document.getElementById('answersSection');
  const answersTitle = document.getElementById('answersTitle');
  const qaListEl = document.getElementById('qaList');
  if (faqGrid) {
    faqTiles.forEach((f) => {
      const card = document.createElement('div');
      card.className = 'faq-card';
      card.innerHTML = `
        <div class="icon"><img src="${f.icon}" alt="${f.title}"></div>
        <div>
          <div class="title">${f.title}</div>
          <div class="desc">${f.desc}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        renderAnswers(f.title);
      });
      faqGrid.appendChild(card);
    });
  }

  function renderAnswers(category) {
    if (!answersSection || !qaListEl) return;
    answersTitle.textContent = category;

    // Build list
    qaListEl.innerHTML = '';
    const items = faqAnswers[category] || [];
    items.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'qa-item' + (idx === 0 ? ' open' : '');
      li.innerHTML = `
        <div class="qa-question">
          <div class="label"><span class="q-dot">Q</span><span>${item.q}</span></div>
          <span class="qa-toggle">▾</span>
        </div>
        <div class="qa-answer">
          <p>${item.a || 'We\'re preparing an answer for this question.'}</p>
          ${idx === 0 ? '<a class="translate" href="#">Translate</a>' : ''}
        </div>
      `;
      qaListEl.appendChild(li);
    });

    // Toggle behavior
    qaListEl.querySelectorAll('.qa-item .qa-question').forEach((q) => {
      q.addEventListener('click', () => {
        const parent = q.parentElement;
        const isOpen = parent.classList.contains('open');
        qaListEl.querySelectorAll('.qa-item').forEach(el => el.classList.remove('open'));
        if (!isOpen) parent.classList.add('open');
      });
    });

    // Show answers, hide grid
    document.getElementById('faqGrid').classList.add('hidden');
    answersSection.classList.remove('hidden');
  }

  // Back to grid
  const backBtn = document.getElementById('backToFaqGrid');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      answersSection.classList.add('hidden');
      document.getElementById('faqGrid').classList.remove('hidden');
    });
  }

  // Deep link: support URL navigation for tabs and FAQ category
  function applyContactDeepLink() {
    try {
      const params = new URLSearchParams(window.location.search);
      const hash = (window.location.hash || '').replace(/^#/, '');
      const candidateTab = params.get('tab') || (['faqs','contact','notice'].includes(hash) ? hash : null);
      const candidateCat = params.get('cat') || (hash.startsWith('cat=') ? decodeURIComponent(hash.split('=')[1] || '') : null);

      // Switch tab if specified
      if (candidateTab) {
        // switchTab is defined above in this DOMContentLoaded scope
        typeof switchTab === 'function' && switchTab(candidateTab);
      }

      // If FAQs tab and a category provided, open answers view
      const tabNow = candidateTab || 'faqs';
      if (tabNow === 'faqs' && candidateCat) {
        // Find case-insensitive matching key in faqAnswers
        const keys = Object.keys(faqAnswers || {});
        const match = keys.find(k => k.toLowerCase() === String(candidateCat).toLowerCase());
        if (match) {
          renderAnswers(match);
        }
      }
    } catch (err) {
      console.warn('applyContactDeepLink warning:', err);
    }
  }

  // Apply on load and when URL changes
  applyContactDeepLink();
  window.addEventListener('hashchange', applyContactDeepLink);
  window.addEventListener('popstate', applyContactDeepLink);

  // Form submit
  const form = document.getElementById("contactForm")
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      const data = Object.fromEntries(new FormData(form).entries())
      console.log("Form submitted:", data)

      const successMsg = document.createElement("div")
      successMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--warm-blush);
        color: white;
        padding: 2rem 3rem;
        border-radius: 4px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideUp 0.3s ease;
        font-weight: 600;
        letter-spacing: 0.05em;
      `
      successMsg.textContent = "✓ Thank you! Your message has been sent."
      document.body.appendChild(successMsg)

      setTimeout(() => {
        successMsg.remove()
        form.reset()
      }, 2000)
    })
  }

  // View more FAQ
  // Removed old "View More FAQ" handler (FAQ list replaced by grid)

  // Sidebar interaction
  const sidebar = document.querySelector(".sidebar")
  if (sidebar) {
    sidebar.addEventListener("click", () => {
      const msg = document.createElement("div")
      msg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--warm-blush);
        color: white;
        padding: 2rem 3rem;
        border-radius: 4px;
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideUp 0.3s ease;
        font-weight: 600;
        letter-spacing: 0.05em;
      `
      msg.textContent = "🎁 Check out our special offers!"
      document.body.appendChild(msg)

      setTimeout(() => msg.remove(), 2000)
    })
  }

  // Menu toggle
  const toggleBtn = document.getElementById("menu-toggler")
  const navbar = document.getElementById("navbar")

  if (toggleBtn && navbar) {
    toggleBtn.addEventListener("click", () => {
      navbar.classList.toggle("active")
    })
  }
})
