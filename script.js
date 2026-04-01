const progressFill = document.querySelector(".progress-fill");
const character = document.getElementById("boatCharacter");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("section.chapter");
const revealEls = document.querySelectorAll(".reveal");
const backToTop = document.getElementById("backToTop");
const audio = document.getElementById("bgAudio");
const soundToggle = document.getElementById("soundToggle");
const themeToggle = document.getElementById("themeToggle");
const cursorRing = document.getElementById("cursorRing");
const greetingPill = document.getElementById("greetingPill");
const skillLevels = document.querySelectorAll(".skill-level");
const hamburger = document.getElementById("hamburger");
const mainNav = document.getElementById("mainNav");
const navOverlay = document.getElementById("navOverlay");

let soundOn = false;

// Set greeting based on time
function setGreeting() {
  const hour = new Date().getHours();
  let greeting = "Hello";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";
  if (greetingPill) {
    greetingPill.textContent = greeting;
  }
}

setGreeting();

/* MOBILE HAMBURGER NAV */
function toggleMobileNav() {
  if (!hamburger || !mainNav || !navOverlay) return;
  const isOpen = mainNav.classList.contains("open");
  mainNav.classList.toggle("open");
  hamburger.classList.toggle("active");
  navOverlay.classList.toggle("active");
  document.body.style.overflow = isOpen ? "" : "hidden";
}

function closeMobileNav() {
  if (!hamburger || !mainNav || !navOverlay) return;
  mainNav.classList.remove("open");
  hamburger.classList.remove("active");
  navOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

if (hamburger) {
  hamburger.addEventListener("click", toggleMobileNav);
}

if (navOverlay) {
  navOverlay.addEventListener("click", closeMobileNav);
}

/* SCROLL PROGRESS, BOAT POSITION */
function updateScrollState() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? scrollTop / docHeight : 0;

  if (progressFill) {
    progressFill.style.width = progress * 100 + "%";
  }

  if (character) {
    const minLeft = 8;
    const maxLeft = 92;
    const left = minLeft + (maxLeft - minLeft) * progress;
    character.style.left = left + "%";
  }

  if (backToTop) {
    if (scrollTop > window.innerHeight * 0.5) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  }
}

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", updateScrollState);

/* REVEAL ON SCROLL */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: "0px 0px -40px 0px",
  }
);

revealEls.forEach((el) => revealObserver.observe(el));

// Animate skill levels on reveal
const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const level = entry.target.dataset.level;
        const bar = entry.target.querySelector(".skill-level-bar");
        if (bar) {
          // Small delay for a nicer stagger effect
          setTimeout(() => {
            bar.style.width = level + "%";
          }, 200);
        }
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

skillLevels.forEach((skill) => skillObserver.observe(skill));

/* ACTIVE NAV LINK BASED ON SECTION */
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute("id");
      navLinks.forEach((link) => {
        const target = link.getAttribute("data-target");
        if (target === `#${id}`) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });
    });
  },
  {
    threshold: 0.35,
  }
);

sections.forEach((sec) => sectionObserver.observe(sec));

/* SMOOTH SCROLL FROM NAV / BUTTONS */
function smoothScrollToSelector(selector) {
  const section = document.querySelector(selector);
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

document.querySelectorAll("[data-target]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target");
    if (target) {
      smoothScrollToSelector(target);
      closeMobileNav(); // close mobile nav on link click
    }
  });
});

/* BACK TO TOP BUTTON */
if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* SOUND TOGGLE (optional ambient) */
if (soundToggle && audio) {
  audio.muted = false;

  soundToggle.addEventListener("click", async () => {
    soundOn = !soundOn;
    try {
      if (soundOn) {
        await audio.play();
        soundToggle.textContent = "Sound: On";
      } else {
        audio.pause();
        soundToggle.textContent = "Sound: Off";
      }
    } catch (err) {
      console.warn("Audio play blocked:", err);
      soundOn = false;
      soundToggle.textContent = "Sound: Off";
    }
  });
}

/* THEME TOGGLE */
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const isLight = document.body.classList.contains("light-theme");
    themeToggle.textContent = isLight ? "Light" : "Dark";
  });
}

// Initial state
updateScrollState();

/* CURSOR RING */
let cursorX = 0, cursorY = 0;
let ringX = 0, ringY = 0;

function animateCursor() {
  ringX += (cursorX - ringX) * 0.15;
  ringY += (cursorY - ringY) * 0.15;
  if (cursorRing) {
    cursorRing.style.left = ringX + "px";
    cursorRing.style.top = ringY + "px";
  }
  requestAnimationFrame(animateCursor);
}

document.addEventListener("mousemove", (e) => {
  cursorX = e.clientX;
  cursorY = e.clientY;
});

// Add active state to cursor ring on interactive elements
document.addEventListener("mouseover", (e) => {
  if (cursorRing && (e.target.closest("a") || e.target.closest("button") || e.target.closest("input") || e.target.closest("textarea"))) {
    cursorRing.classList.add("active");
  }
});

document.addEventListener("mouseout", (e) => {
  if (cursorRing && (e.target.closest("a") || e.target.closest("button") || e.target.closest("input") || e.target.closest("textarea"))) {
    cursorRing.classList.remove("active");
  }
});

// Only enable cursor ring on non-touch devices
if (window.matchMedia("(pointer: fine)").matches) {
  animateCursor();
} else if (cursorRing) {
  cursorRing.style.display = "none";
}

/* KEYBOARD NAV: close mobile nav on Escape */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeMobileNav();
  }
});

/* ============ CONNECT CHAT SYSTEM ============ */
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const chatSendBtn = document.getElementById("chatSendBtn");
const quickBtns = document.querySelectorAll(".quick-btn");

function addChatBubble(text, type = "bot") {
  if (!chatMessages) return;

  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${type}`;

  const avatar = document.createElement("span");
  avatar.className = "chat-avatar";
  avatar.textContent = type === "bot" ? "R" : "You".charAt(0);

  const textDiv = document.createElement("div");
  textDiv.className = "chat-text";
  textDiv.textContent = text;

  bubble.appendChild(avatar);
  bubble.appendChild(textDiv);
  chatMessages.appendChild(bubble);

  // Auto-scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
  if (!chatMessages) return;

  const typing = document.createElement("div");
  typing.className = "chat-bubble bot";
  typing.id = "typingIndicator";

  const avatar = document.createElement("span");
  avatar.className = "chat-avatar";
  avatar.textContent = "R";

  const dots = document.createElement("div");
  dots.className = "typing-indicator";
  dots.innerHTML = "<span></span><span></span><span></span>";

  typing.appendChild(avatar);
  typing.appendChild(dots);
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) indicator.remove();
}

function sendBotResponse(responseText, delay = 1200) {
  showTypingIndicator();
  setTimeout(() => {
    removeTypingIndicator();
    addChatBubble(responseText, "bot");
  }, delay);
}

// Quick action buttons
quickBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const response = btn.getAttribute("data-response");
    const userText = btn.textContent.trim();

    // Visual feedback - mark as selected
    quickBtns.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");

    // Add user message
    addChatBubble(userText, "user");

    // Bot response with typing delay
    if (response) {
      sendBotResponse(response);
    }
  });
});

// Free-text message sending
function sendUserMessage() {
  if (!chatInput) return;
  const text = chatInput.value.trim();
  if (!text) return;

  addChatBubble(text, "user");
  chatInput.value = "";

  // Smart auto-response based on keywords
  let response = "Thanks for reaching out! I'll get back to you soon. Feel free to connect via email or LinkedIn in the meantime.";

  const lower = text.toLowerCase();
  if (lower.includes("hire") || lower.includes("job") || lower.includes("work")) {
    response = "Great! I'd love to discuss opportunities. Please reach out via email — I'll respond as soon as possible!";
  } else if (lower.includes("collab") || lower.includes("together") || lower.includes("project")) {
    response = "Awesome! I'm always excited about collaborations. Share your idea and let's make it happen!";
  } else if (lower.includes("intern")) {
    response = "I'm actively looking for internship opportunities! Let's connect on LinkedIn to discuss further.";
  } else if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey")) {
    response = "Hey! Thanks for stopping by my portfolio. Feel free to ask me anything! 👋";
  }

  sendBotResponse(response);
}

if (chatSendBtn) {
  chatSendBtn.addEventListener("click", sendUserMessage);
}

if (chatInput) {
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendUserMessage();
    }
  });
}

/* ============ LOADING SCREEN ============ */
const loader = document.getElementById("loader");
if (loader) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("hidden");
    }, 1800);
  });
}

/* ============ FOOTER NAV LINKS ============ */
document.querySelectorAll(".footer-nav-link[data-target]").forEach((link) => {
  link.addEventListener("click", () => {
    const target = link.getAttribute("data-target");
    if (target) {
      smoothScrollToSelector(target);
    }
  });
});