const locations = [
  { name: "Downtown Store", address: "123 Tea Street", hours: "7AM-11PM", status: "Open" },
  { name: "Campus Location", address: "456 Campus Avenue", hours: "6AM-12AM", status: "Open" },
  { name: "Shopping Mall", address: "789 Mall Boulevard", hours: "10AM-10PM", status: "Open" },
  { name: "Business District", address: "321 Office Plaza", hours: "7AM-8PM", status: "Closed" },
]

const faqItems = [
  {
    question: "What is your most popular drink?",
    answer: "Our bestsellers include Matcha Supreme, Brown Sugar Delight, and Traditional Milk Tea with boba!",
  },
  {
    question: "Do you offer vegan options?",
    answer: "Yes! We have a variety of plant-based milk options including oat, almond, and coconut milk.",
  },
  {
    question: "Can I customize my drink?",
    answer: "Use our customization page to create your perfect blend with various toppings and sweetness levels.",
  },
]

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

  // Populate FAQ
  const faqWrap = document.getElementById("faqList")
  if (faqWrap) {
    faqItems.forEach((f, i) => {
      const el = document.createElement("div")
      el.className = "faq-item"
      el.innerHTML = `<h3>${f.question}</h3><p>${f.answer}</p>`
      faqWrap.appendChild(el)
      setTimeout(() => el.classList.add("enter"), 1500 + i * 100)
    })
  }

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

  // Chat toggle
  const floating = document.getElementById("floatingChat")
  const chatModal = document.getElementById("chatModal")
  const closeChat = document.getElementById("closeChatModal")
  const openChatBtn = document.getElementById("openChatBtn")
  const sendChat = document.getElementById("sendChat")
  const chatInput = document.getElementById("chatInput")

  function openChat() {
    if (chatModal) chatModal.classList.remove("hidden")
  }

  function closeChatModal() {
    if (chatModal) chatModal.classList.add("hidden")
  }

  if (floating) floating.addEventListener("click", openChat)
  if (closeChat) closeChat.addEventListener("click", closeChatModal)
  if (openChatBtn) openChatBtn.addEventListener("click", openChat)

  // Quick options
  document.querySelectorAll(".quick").forEach((btn) => {
    btn.addEventListener("click", () => {
      const msg = document.createElement("div")
      msg.textContent = "You selected: " + btn.textContent
      msg.className = "bubble"
      msg.style.cssText = "margin-left: auto; margin-right: 0; background: var(--warm-blush); color: white;"

      const content = document.querySelector(".chat-content")
      if (content) {
        content.appendChild(msg)

        setTimeout(() => {
          const botReply = document.createElement("div")
          botReply.textContent = "We received your request! Please wait for a response..."
          botReply.className = "bubble"
          content.appendChild(botReply)
          content.scrollTop = content.scrollHeight
        }, 500)
      }
    })
  })

  // Send chat
  if (sendChat && chatInput) {
    sendChat.addEventListener("click", () => {
      const txt = chatInput.value.trim()
      if (!txt) return

      const content = document.querySelector(".chat-content")
      if (content) {
        const userBubble = document.createElement("div")
        userBubble.className = "bubble"
        userBubble.style.cssText = "margin-left: auto; margin-right: 0; background: var(--warm-blush); color: white;"
        userBubble.textContent = txt
        content.appendChild(userBubble)

        chatInput.value = ""
        content.scrollTop = content.scrollHeight

        setTimeout(() => {
          const botReply = document.createElement("div")
          botReply.className = "bubble"
          botReply.textContent = "Thank you for contacting us! We'll respond as soon as possible. 💬"
          content.appendChild(botReply)
          content.scrollTop = content.scrollHeight
        }, 800)
      }
    })

    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendChat.click()
    })
  }

  // View more FAQ
  const viewMoreFaq = document.getElementById("viewMoreFaq")
  if (viewMoreFaq) {
    viewMoreFaq.addEventListener("click", () => {
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
      msg.textContent = "Redirecting to FAQ page..."
      document.body.appendChild(msg)

      setTimeout(() => msg.remove(), 2000)
    })
  }

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
