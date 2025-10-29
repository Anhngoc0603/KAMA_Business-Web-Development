// Live Chat Widget - Reusable Component Script

function initLiveChat() {
  const floating = document.getElementById("floatingChat")
  const chatModal = document.getElementById("chatModal")
  const closeChat = document.getElementById("closeChatModal")
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

  // Quick options
  document.querySelectorAll(".quick").forEach((btn) => {
    btn.addEventListener("click", () => {
      const msg = document.createElement("div")
      msg.textContent = "You selected: " + btn.textContent
      msg.className = "bubble"
      msg.style.cssText =
        "margin-left: auto; margin-right: 0; background: var(--warm-blush); color: white; padding: 0.75rem 1rem; border-radius: 8px; max-width: 85%; margin-bottom: 0.75rem;"

      const content = document.querySelector(".chat-content")
      if (content) {
        content.appendChild(msg)

        setTimeout(() => {
          const botReply = document.createElement("div")
          botReply.textContent = "We received your request! Please wait for a response..."
          botReply.className = "bubble"
          botReply.style.cssText =
            "background: #f0eeec; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 0.75rem;"
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
        userBubble.style.cssText =
          "margin-left: auto; margin-right: 0; background: var(--warm-blush); color: white; padding: 0.75rem 1rem; border-radius: 8px; max-width: 85%; margin-bottom: 0.75rem;"
        userBubble.textContent = txt
        content.appendChild(userBubble)

        chatInput.value = ""
        content.scrollTop = content.scrollHeight

        setTimeout(() => {
          const botReply = document.createElement("div")
          botReply.className = "bubble"
          botReply.style.cssText =
            "background: #f0eeec; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 0.75rem;"
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
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLiveChat)
} else {
  initLiveChat()
}
