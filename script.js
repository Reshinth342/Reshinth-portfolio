/* ==========================================================================
   RESHINTH PORTFOLIO — INTERACTION, 3D WEBGL & CINEMATIC MOTION ENGINE
   ========================================================================== */

const progressFill = document.querySelector(".progress-fill");
const character = document.getElementById("boatCharacter");
const navLinks = document.querySelectorAll(".nav-link, .footer-nav-link");
const sections = document.querySelectorAll("section.chapter");
const revealEls = document.querySelectorAll(".reveal");
const maskedRevealEls = document.querySelectorAll(".masked-reveal");
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
const topNav = document.getElementById("topNav");
const heroComposition = document.getElementById("heroComposition");
const hero3DWrap = document.getElementById("hero3DContainer");
const lightFieldBg = document.getElementById("lightFieldBg");

let soundOn = false;

/* ============ INTERPOLATED MOUSE STATE & PARALLAX ENGINE ============ */
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;
let currentParallaxX = 0, currentParallaxY = 0;

const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches;
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("mousemove", (e) => {
  if (isTouchDevice() || prefersReducedMotion()) return;
  mouseX = e.clientX;
  mouseY = e.clientY;
  targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
  targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

// Smooth 60fps lerp loop for parallax depth
function updateMouseParallax() {
  if (!isTouchDevice() && !prefersReducedMotion()) {
    currentParallaxX += (targetMouseX - currentParallaxX) * 0.05;
    currentParallaxY += (targetMouseY - currentParallaxY) * 0.05;

    // Background light field: max 3px (1-2%)
    if (lightFieldBg) {
      lightFieldBg.style.transform = `translate3d(${(currentParallaxX * 3).toFixed(2)}px, ${(-currentParallaxY * 3).toFixed(2)}px, 0)`;
    }

    // Hero 3D visual container: max 8px inverse
    if (hero3DWrap) {
      hero3DWrap.style.transform = `translate3d(${(-currentParallaxX * 8).toFixed(2)}px, ${(currentParallaxY * 8).toFixed(2)}px, 0)`;
    }
  }
  requestAnimationFrame(updateMouseParallax);
}
updateMouseParallax();

// Set Greeting
function setGreeting() {
  const hour = new Date().getHours();
  let greeting = "Hello";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";
  if (greetingPill) greetingPill.textContent = greeting;
}
setGreeting();

/* ============ THREE.JS 3D WEBGL BACKGROUND SCENE ============ */
function init3DWebGLScene() {
  const canvas = document.getElementById("webgl-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 15, 35);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Ambient & Point Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x00f2fe, 1.8, 100);
  pointLight1.position.set(20, 20, 20);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x7b2cbf, 1.8, 100);
  pointLight2.position.set(-20, -10, -10);
  scene.add(pointLight2);

  // Ocean Grid Mesh
  const gridWidth = 140, gridHeight = 140;
  const gridGeo = new THREE.PlaneGeometry(gridWidth, gridHeight, 36, 36);
  gridGeo.rotateX(-Math.PI / 2.2);

  const gridMat = new THREE.MeshBasicMaterial({
    color: 0x00f2fe,
    wireframe: true,
    transparent: true,
    opacity: 0.12
  });

  const oceanGrid = new THREE.Mesh(gridGeo, gridMat);
  oceanGrid.position.set(0, -18, -10);
  scene.add(oceanGrid);

  const posAttribute = gridGeo.attributes.position;
  const initialPositions = posAttribute.array.slice();

  // Floating Polyhedrons
  const polyGroup = new THREE.Group();
  scene.add(polyGroup);

  const createPoly = (geo, color, x, y, z, scale = 1) => {
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      wireframe: true,
      emissive: color,
      emissiveIntensity: 0.3,
      roughness: 0.2
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.scale.set(scale, scale, scale);
    polyGroup.add(mesh);
    return mesh;
  };

  const poly1 = createPoly(new THREE.IcosahedronGeometry(3.5, 0), 0x00f2fe, -22, 10, -15, 1);
  const poly2 = createPoly(new THREE.OctahedronGeometry(4, 0), 0x9d4edd, 24, 14, -20, 1.2);
  const poly3 = createPoly(new THREE.TorusKnotGeometry(2.5, 0.6, 64, 16), 0xffb703, 18, -8, -10, 0.8);

  // Cyber Starfield Particles
  const particleCount = window.innerWidth < 768 ? 350 : 700;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePos[i] = (Math.random() - 0.5) * 160;
    particlePos[i + 1] = (Math.random() - 0.5) * 160;
    particlePos[i + 2] = (Math.random() - 0.5) * 160;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x00f2fe,
    size: 0.5,
    transparent: true,
    opacity: 0.5
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  let clock = new THREE.Clock();

  function animate3D() {
    requestAnimationFrame(animate3D);

    const elapsedTime = clock.getElapsedTime();
    const count = posAttribute.count;

    for (let i = 0; i < count; i++) {
      const u = initialPositions[i * 3];
      const v = initialPositions[i * 3 + 1];
      const z = Math.sin(u * 0.08 + elapsedTime * 1.2) * 1.4 +
                Math.cos(v * 0.08 + elapsedTime * 1.0) * 1.4;
      posAttribute.setZ(i, z);
    }
    posAttribute.needsUpdate = true;

    poly1.rotation.x += 0.003; poly1.rotation.y += 0.004;
    poly2.rotation.x += 0.004; poly2.rotation.z += 0.003;
    poly3.rotation.y += 0.005; poly3.rotation.z += 0.003;

    camera.position.x += (currentParallaxX * 3 - camera.position.x) * 0.04;
    camera.position.y += (-currentParallaxY * 3 + 15 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    particleSystem.rotation.y = elapsedTime * 0.015;
    renderer.render(scene, camera);
  }

  animate3D();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ============ THREE.JS 3D HERO MESH CANVAS ============ */
function init3DHeroCanvas() {
  const container = document.getElementById("hero3DContainer");
  if (!container || typeof THREE === "undefined") return;

  const width = container.clientWidth || 320;
  const height = container.clientHeight || 250;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 0, 14);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const heroLight = new THREE.PointLight(0x00f2fe, 2.5, 50);
  heroLight.position.set(5, 5, 10);
  scene.add(heroLight);

  const heroGroup = new THREE.Group();
  scene.add(heroGroup);

  const hullGeo = new THREE.ConeGeometry(2.2, 5.5, 4);
  hullGeo.rotateZ(Math.PI / 2);
  hullGeo.rotateY(Math.PI / 4);

  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x07080d,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x00f2fe,
    emissiveIntensity: 0.25
  });
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.set(0, -1.2, 0);
  heroGroup.add(hull);

  const mastGeo = new THREE.CylinderGeometry(0.08, 0.08, 4.5);
  const mastMat = new THREE.MeshBasicMaterial({ color: 0xffb703 });
  const mast = new THREE.Mesh(mastGeo, mastMat);
  mast.position.set(0, 1.2, 0);
  heroGroup.add(mast);

  const sailGeo = new THREE.PlaneGeometry(2.5, 3.5);
  const sailMat = new THREE.MeshStandardMaterial({
    color: 0x7b2cbf,
    emissive: 0x9d4edd,
    emissiveIntensity: 0.4,
    wireframe: true,
    side: THREE.DoubleSide
  });
  const sail = new THREE.Mesh(sailGeo, sailMat);
  sail.position.set(1.2, 1.4, 0);
  heroGroup.add(sail);

  const ringGeo1 = new THREE.TorusGeometry(3.6, 0.05, 16, 100);
  const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00f2fe, wireframe: true });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  ring1.rotation.x = Math.PI / 3;
  heroGroup.add(ring1);

  const ringGeo2 = new THREE.TorusGeometry(4.2, 0.05, 16, 100);
  const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xffb703, wireframe: true });
  const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
  ring2.rotation.y = Math.PI / 4;
  heroGroup.add(ring2);

  let clock = new THREE.Clock();

  function animateHero() {
    requestAnimationFrame(animateHero);

    const elapsed = clock.getElapsedTime();
    heroGroup.position.y = Math.sin(elapsed * 1.5) * 0.25;

    ring1.rotation.z = elapsed * 0.4;
    ring2.rotation.x = elapsed * 0.35;

    heroGroup.rotation.y += (currentParallaxX * 0.4 - heroGroup.rotation.y) * 0.06;
    heroGroup.rotation.x += (-currentParallaxY * 0.3 - heroGroup.rotation.x) * 0.06;

    renderer.render(scene, camera);
  }

  animateHero();

  window.addEventListener("resize", () => {
    if (!container) return;
    const w = container.clientWidth || 320;
    const h = container.clientHeight || 250;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(() => {
    init3DWebGLScene();
    init3DHeroCanvas();
  }, 100);
} else {
  window.addEventListener("DOMContentLoaded", () => {
    init3DWebGLScene();
    init3DHeroCanvas();
  });
}

/* ============ CARD TILT ENGINE ============ */
function init3DTiltEngine() {
  const tiltCards = document.querySelectorAll(".tilt-card");

  tiltCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      if (isTouchDevice() || prefersReducedMotion()) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = -((y - centerY) / centerY) * 8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    });
  });
}
init3DTiltEngine();

/* ============ CLICK BURST ENGINE ============ */
function initClickBurstEngine() {
  const canvas = document.getElementById("burst-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const colors = ["#00f2fe", "#ffb703", "#7b2cbf", "#00f5d4"];

  class BurstParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = Math.random() * 3 + 1.5;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.015;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.95;
      this.vy *= 0.95;
      this.alpha -= this.decay;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(this.alpha, 0);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  document.addEventListener("click", (e) => {
    for (let i = 0; i < 14; i++) {
      particles.push(new BurstParticle(e.clientX, e.clientY));
    }
  });

  function renderBurst() {
    ctx.clearRect(0, 0, width, height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();
      if (p.alpha <= 0) particles.splice(i, 1);
    }
    requestAnimationFrame(renderBurst);
  }
  renderBurst();
}
initClickBurstEngine();

/* ============ HERO ENTRANCE CHOREOGRAPHY EXECUTION ============ */
function triggerHeroEntranceSequence() {
  const intro = document.getElementById("marketingIntro");
  const lightFieldBg = document.getElementById("lightFieldBg");
  const heroChapter = document.getElementById("prologue");
  const topNav = document.getElementById("topNav");

  // Reduced motion check (Phase Accessibility)
  if (prefersReducedMotion()) {
    if (intro) intro.classList.add("dismissed");
    if (lightFieldBg) lightFieldBg.classList.add("active");
    if (heroChapter) heroChapter.classList.add("hero-active");
    if (topNav) topNav.classList.add("hero-active");
    document.body.classList.remove("page-loading");
    document.body.classList.add("hero-settled");
    return;
  }

  // 0ms: Start curtain opening (Left & Right move outward 0-1400ms, bezier 0.22, 1, 0.36, 1)
  if (intro) intro.classList.add("opening");

  // 500ms -> 1700ms: Background crossfade (Entrance Bg A -> Portfolio Bg B)
  setTimeout(() => {
    if (lightFieldBg) lightFieldBg.classList.add("active");
  }, 500);

  // 1000ms (~70% curtain open): Hero content reveals (Headline, Lead, CTA, Visual)
  setTimeout(() => {
    if (heroChapter) heroChapter.classList.add("hero-active");
    if (topNav) topNav.classList.add("hero-active");
  }, 1000);

  // 1700ms -> 2200ms: Curtain exit phase & final settle
  setTimeout(() => {
    if (intro) intro.classList.add("dismissed");
    document.body.classList.remove("page-loading");
    document.body.classList.add("hero-settled");
  }, 2200);
}

function initMarketingIntro() {
  const intro = document.getElementById("marketingIntro");
  const startBtn = document.getElementById("introStartBtn");

  // Automatically trigger entrance sequence on load after loader dismiss
  const loader = document.getElementById("loader");
  if (loader && loader.classList.contains("hidden")) {
    triggerHeroEntranceSequence();
  } else {
    window.addEventListener("load", () => {
      setTimeout(triggerHeroEntranceSequence, 350);
    });
  }

  if (startBtn) {
    startBtn.addEventListener("click", async () => {
      if (intro && !intro.classList.contains("opening")) {
        triggerHeroEntranceSequence();
      }

      if (audio && soundToggle) {
        try {
          soundOn = true;
          await audio.play();
          const textSpan = soundToggle.querySelector("span");
          if (textSpan) textSpan.textContent = "Sound: On";
          soundToggle.classList.add("playing");
        } catch (e) {
          console.log("Audio play postponed.");
        }
      }
    });
  }
}
initMarketingIntro();

/* ============ CYPHER TEXT DECODER ============ */
function initCypherTextDecoder() {
  const cypherEl = document.getElementById("cypherText");
  if (!cypherEl) return;

  const titles = [
    "Web Architect • Cybersecurity • Visual Artist",
    "B.Tech IT Student • Fullstack & Motion",
    "UI/UX Designer • Visual Craftsman",
    "Cyber Defense • Ethical Hacking Curious"
  ];
  const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?/0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let titleIndex = 0;

  function scrambleTo(targetText) {
    let iteration = 0;
    const maxIterations = targetText.length * 2;

    const interval = setInterval(() => {
      cypherEl.textContent = targetText
        .split("")
        .map((char, index) => {
          if (char === " ") return " ";
          if (index < iteration / 2) return targetText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");

      if (iteration >= maxIterations) {
        clearInterval(interval);
        cypherEl.textContent = targetText;
      }
      iteration += 1;
    }, 30);
  }

  scrambleTo(titles[0]);
  setInterval(() => {
    titleIndex = (titleIndex + 1) % titles.length;
    scrambleTo(titles[titleIndex]);
  }, 5200);
}
initCypherTextDecoder();

/* MOBILE NAVIGATION */
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

if (hamburger) hamburger.addEventListener("click", toggleMobileNav);
if (navOverlay) navOverlay.addEventListener("click", closeMobileNav);

/* SCROLL-LINKED HERO TRANSITION & PROGRESS ENGINE */
let scrollTicking = false;

function updateScrollState() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? scrollTop / docHeight : 0;

  if (progressFill) progressFill.style.width = progress * 100 + "%";

  if (character) {
    const minLeft = 8;
    const maxLeft = 92;
    const left = minLeft + (maxLeft - minLeft) * progress;
    character.style.left = left + "%";
  }

  if (backToTop) {
    if (scrollTop > window.innerHeight * 0.5) backToTop.classList.add("visible");
    else backToTop.classList.remove("visible");
  }

  // Navigation scroll state
  if (topNav) {
    if (scrollTop > 80) topNav.classList.add("scrolled");
    else topNav.classList.remove("scrolled");
  }

  // Hero scroll-out transition (Hero content translateY 0 -> -30px, opacity 1 -> 0.75)
  if (heroComposition && scrollTop < window.innerHeight) {
    const scrollFactor = Math.min(scrollTop / (window.innerHeight * 0.8), 1);
    const translateY = -30 * scrollFactor;
    const opacity = 1 - 0.25 * scrollFactor;
    heroComposition.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
    heroComposition.style.opacity = opacity.toFixed(2);
  }
}

function onScrollThrottled() {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      updateScrollState();
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}

window.addEventListener("scroll", onScrollThrottled, { passive: true });
window.addEventListener("resize", onScrollThrottled, { passive: true });

/* REVEAL ON SCROLL INTERSECTION OBSERVER (15–20% THRESHOLD) */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18, rootMargin: "0px 0px -30px 0px" }
);

revealEls.forEach((el) => revealObserver.observe(el));
maskedRevealEls.forEach((el) => revealObserver.observe(el));

/* GAUGE & SKILL OBSERVERS */
const circleGauges = document.querySelectorAll(".skill-circle-gauge");
const gaugeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const level = parseFloat(entry.target.dataset.level) || 0;
        const meter = entry.target.querySelector(".gauge-meter");
        if (meter) {
          const perimeter = 2 * Math.PI * 24; // 150.8
          const offset = perimeter * (1 - level / 100);
          setTimeout(() => { meter.style.strokeDashoffset = offset; }, 250);
        }
        gaugeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);
circleGauges.forEach((gauge) => gaugeObserver.observe(gauge));

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const level = entry.target.dataset.level;
        const bar = entry.target.querySelector(".skill-level-bar");
        if (bar) {
          setTimeout(() => { bar.style.width = level + "%"; }, 200);
        }
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);
skillLevels.forEach((skill) => skillObserver.observe(skill));

/* CATEGORY FILTERS */
/* ==========================================================================
   PHYSICAL DESIGN INTERACTIONS & 3D BROCHURE UNFOLDING ENGINE
   ========================================================================== */

/* 01: GUEST INVITATIONS — CAMERA ENTRANCE & STATIONERY SPREAD */
function initInvitationStudio() {
  const env = document.getElementById("invitationStudioEnv");
  const spread = document.getElementById("invitationSpread");
  if (!env || !spread) return;

  const cards = spread.querySelectorAll(".spread-card");

  // Entrance Camera Observer (1200ms cubic-bezier(0.22, 1, 0.36, 1))
  const invObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        env.classList.add("entering");
        setTimeout(() => {
          env.classList.remove("entering");
          env.classList.add("settled");
        }, 1200);
        invObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  invObserver.observe(env);

  // Stationery Spread Selection (Card comes forward smoothly 400-600ms)
  cards.forEach((card) => {
    const activateCard = () => {
      cards.forEach((c) => c.classList.remove("active-card"));
      card.classList.add("active-card");
    };
    card.addEventListener("click", activateCard);
    card.addEventListener("mouseenter", activateCard);
  });
}

/* 02: BROCHURES — 3D FOLD / UNFOLD & CAMERA DRAG TILT */
function initBrochureStudio() {
  const env = document.getElementById("brochureStudioEnv");
  const wrapper = document.getElementById("brochureWrapper");
  if (!env || !wrapper) return;

  // Unfolding Observer (1000-1400ms cubic-bezier(0.22, 1, 0.36, 1))
  const brochureObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          wrapper.classList.remove("closed");
          wrapper.classList.add("unfolded");
        }, 250);
        brochureObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  brochureObserver.observe(env);

  // Bounded Camera Mouse / Touch Drag Tilt (User never fights interface)
  let isDragging = false;
  let startX = 0, startY = 0;
  let currentRotX = 8, currentRotY = 0;

  const handlePointerMove = (clientX, clientY) => {
    const rect = env.getBoundingClientRect();
    const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const normY = ((clientY - rect.top) / rect.height) * 2 - 1;

    const targetRotX = 8 - normY * 12; // Bounded -4 to 20 deg
    const targetRotY = normX * 18;     // Bounded -18 to 18 deg

    if (wrapper.classList.contains("unfolded")) {
      wrapper.style.transform = `rotateX(${targetRotX.toFixed(2)}deg) rotateY(${targetRotY.toFixed(2)}deg) scale(1)`;
    }
  };

  env.addEventListener("mousemove", (e) => {
    if (prefersReducedMotion()) return;
    handlePointerMove(e.clientX, e.clientY);
  });

  env.addEventListener("mouseleave", () => {
    if (wrapper.classList.contains("unfolded")) {
      wrapper.style.transform = "rotateX(8deg) rotateY(0deg) scale(1)";
    }
  });

  // Touch drag support
  env.addEventListener("touchmove", (e) => {
    if (prefersReducedMotion() || !e.touches[0]) return;
    handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  env.addEventListener("touchend", () => {
    if (wrapper.classList.contains("unfolded")) {
      wrapper.style.transform = "rotateX(8deg) rotateY(0deg) scale(1)";
    }
  });
}

/* ==========================================================================
   CATEGORY FILTERS (CREATIVE STUDIO & PROJECTS)
   ========================================================================== */

function initCategoryFilters() {
  const projectFilterBtns = document.querySelectorAll("#projectFilterBar .filter-btn");
  const projectCards = document.querySelectorAll("#projectsGrid .case-study-card");

  projectFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      projectFilterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      projectCards.forEach((card) => {
        const category = card.dataset.category || "";
        if (filter === "all" || category.includes(filter)) {
          card.style.display = "";
          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "scale(1)";
          }, 50);
        } else {
          card.style.opacity = "0";
          card.style.transform = "scale(0.96)";
          setTimeout(() => { card.style.display = "none"; }, 300);
        }
      });
    });
  });

  const galleryFilterBtns = document.querySelectorAll("#galleryFilterBar .filter-btn");
  const galleryCards = document.querySelectorAll("#galleryGrid .physical-design-card");

  galleryFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.galleryFilter;
      galleryFilterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      galleryCards.forEach((card) => {
        const category = card.dataset.category || "";
        if (filter === "all" || category === filter) {
          card.style.display = "";
          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "scale(1)";
          }, 50);
        } else {
          card.style.opacity = "0";
          card.style.transform = "scale(0.96)";
          setTimeout(() => { card.style.display = "none"; }, 300);
        }
      });
    });
  });
}

/* ==========================================================================
   MULTI-LAYER AMBIENT AUDIO SYSTEM (WEB AUDIO SYNTHESIS + CROSSFADE)
   ========================================================================== */

let audioCtx = null;
let currentAudioMood = "CINEMATIC";
let audioNodes = {};

const MOOD_DESCRIPTIONS = {
  CINEMATIC: { name: "CINEMATIC", freq: 55, type: "sine", detune: 0 },
  TECH: { name: "TECH", freq: 110, type: "square", detune: 5 },
  CREATIVE: { name: "CREATIVE", freq: 164.8, type: "triangle", detune: 2 },
  SPEAKING: { name: "SPEAKING", freq: 220, type: "sine", detune: 4 },
  JOURNEY: { name: "JOURNEY", freq: 130.8, type: "triangle", detune: -3 },
  EXPLORE: { name: "EXPLORE", freq: 65, type: "sawtooth", detune: -10 },
  QUIET: { name: "QUIET", freq: 40, type: "sine", detune: 0 },
  CONTACT: { name: "CONTACT", freq: 196, type: "sine", detune: 2 }
};

function initWebAudioEngine() {
  if (audioCtx) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  } catch (e) {
    console.log("Web Audio API not supported.");
  }
}

function startProceduralMoodSynth(moodKey) {
  if (!audioCtx || !soundOn) return;

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const moodConfig = MOOD_DESCRIPTIONS[moodKey] || MOOD_DESCRIPTIONS.CINEMATIC;
  const now = audioCtx.currentTime;
  const crossfadeDuration = 1.5; // 1500ms smooth crossfade

  // Fade out old node
  if (audioNodes.activeGain) {
    audioNodes.activeGain.gain.setValueAtTime(audioNodes.activeGain.gain.value, now);
    audioNodes.activeGain.gain.linearRampToValueAtTime(0, now + crossfadeDuration);
  }

  // Create new oscillator & gain node
  const osc = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();

  osc.type = moodConfig.type;
  osc.frequency.setValueAtTime(moodConfig.freq, now);
  osc.detune.setValueAtTime(moodConfig.detune, now);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(moodKey === "EXPLORE" ? 400 : 800, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + crossfadeDuration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);

  audioNodes.activeOsc = osc;
  audioNodes.activeGain = gain;
}

function updateAudioMoodForSection(sectionId) {
  let newMood = "CINEMATIC";

  if (sectionId === "prologue") newMood = "CINEMATIC";
  else if (sectionId === "what-i-do" || sectionId === "frontend-lab") newMood = "TECH";
  else if (sectionId === "creative-studio") newMood = "CREATIVE";
  else if (sectionId === "speaking-section") newMood = "SPEAKING";
  else if (sectionId === "big-timeline") newMood = "JOURNEY";
  else if (sectionId === "cyber-exploration") newMood = "EXPLORE";
  else if (sectionId === "about-story") newMood = "QUIET";
  else if (sectionId === "contact") newMood = "CONTACT";

  if (newMood !== currentAudioMood) {
    currentAudioMood = newMood;
    const moodTag = document.getElementById("soundMoodTag");
    if (moodTag) moodTag.textContent = newMood;

    if (soundOn) {
      startProceduralMoodSynth(newMood);
    }
  }
}

/* SECTION OBSERVER FOR NAV & AUDIO MOOD CROSSFADE */
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute("id");
      
      navLinks.forEach((link) => {
        const target = link.getAttribute("data-target");
        if (target === `#${id}`) link.classList.add("active");
        else link.classList.remove("active");
      });

      updateAudioMoodForSection(id);
    });
  },
  { threshold: 0.35 }
);

sections.forEach((sec) => sectionObserver.observe(sec));

/* SOUND & THEME TOGGLE */
if (soundToggle && audio) {
  audio.muted = false;

  soundToggle.addEventListener("click", async () => {
    soundOn = !soundOn;
    const textSpan = soundToggle.querySelector("span");
    const moodTag = document.getElementById("soundMoodTag");

    if (soundOn) {
      initWebAudioEngine();
      try {
        await audio.play();
      } catch (err) {}
      
      startProceduralMoodSynth(currentAudioMood);

      if (textSpan) textSpan.textContent = "Sound: On";
      if (moodTag) moodTag.textContent = currentAudioMood;
      soundToggle.classList.add("playing");
    } else {
      if (audio) audio.pause();
      if (audioNodes.activeGain && audioCtx) {
        audioNodes.activeGain.gain.setValueAtTime(0, audioCtx.currentTime);
      }
      if (textSpan) textSpan.textContent = "Sound: Off";
      soundToggle.classList.remove("playing");
    }
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const isLight = document.body.classList.contains("light-theme");
    themeToggle.textContent = isLight ? "Light" : "Dark";
  });
}

/* SMOOTH SCROLL */
function smoothScrollToSelector(selector) {
  const section = document.querySelector(selector);
  if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.querySelectorAll("[data-target]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target");
    if (target) {
      smoothScrollToSelector(target);
      closeMobileNav();
    }
  });
});

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

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

document.addEventListener("mouseover", (e) => {
  if (cursorRing && (e.target.closest("a") || e.target.closest("button") || e.target.closest("input") || e.target.closest(".physical-design-card") || e.target.closest(".case-study-image-wrap"))) {
    cursorRing.classList.add("active");
  }
});
document.addEventListener("mouseout", (e) => {
  if (cursorRing && (e.target.closest("a") || e.target.closest("button") || e.target.closest("input") || e.target.closest(".physical-design-card") || e.target.closest(".case-study-image-wrap"))) {
    cursorRing.classList.remove("active");
  }
});

if (!isTouchDevice() && !prefersReducedMotion()) animateCursor();
else if (cursorRing) cursorRing.style.display = "none";

/* INTERACTIVE CONNECT CHAT ENGINE */
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
  avatar.textContent = type === "bot" ? "R" : "Y";

  const textDiv = document.createElement("div");
  textDiv.className = "chat-text";
  textDiv.textContent = text;

  bubble.appendChild(avatar);
  bubble.appendChild(textDiv);
  chatMessages.appendChild(bubble);

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

function sendBotResponse(responseText, delay = 1000) {
  showTypingIndicator();
  setTimeout(() => {
    removeTypingIndicator();
    addChatBubble(responseText, "bot");
  }, delay);
}

quickBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const response = btn.getAttribute("data-response");
    const userText = btn.textContent.trim();

    quickBtns.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");

    addChatBubble(userText, "user");
    if (response) sendBotResponse(response);
  });
});

function sendUserMessage() {
  if (!chatInput) return;
  const text = chatInput.value.trim();
  if (!text) return;

  addChatBubble(text, "user");
  chatInput.value = "";

  let response = "Thanks for reaching out! I'll get back to you soon. Feel free to email me at Reshinthm7@gmail.com or connect on LinkedIn!";
  const lower = text.toLowerCase();
  if (lower.includes("hire") || lower.includes("job") || lower.includes("role")) {
    response = "Great! I'd love to discuss opportunities. Drop me an email at Reshinthm7@gmail.com — I'll respond as soon as possible!";
  } else if (lower.includes("collab") || lower.includes("project")) {
    response = "Awesome! I'm always excited about collaborations. Share your idea and let me know how I can contribute!";
  } else if (lower.includes("intern")) {
    response = "I'm actively looking for internship opportunities! Let's connect on LinkedIn or email to discuss further.";
  } else if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey")) {
    response = "Hey! Thanks for stopping by my portfolio. Feel free to explore my projects or reach out via email! 👋";
  }

  sendBotResponse(response);
}

if (chatSendBtn) chatSendBtn.addEventListener("click", sendUserMessage);
if (chatInput) {
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendUserMessage();
    }
  });
}

/* LOADER & LIGHTBOX SYSTEM */
const loader = document.getElementById("loader");
if (loader) {
  const dismissLoader = () => {
    setTimeout(() => { loader.classList.add("hidden"); }, 300);
  };
  if (document.readyState === "complete") dismissLoader();
  else window.addEventListener("load", dismissLoader);
}

/* ENHANCED FULLSCREEN LIGHTBOX GALLERY */
let galleryDesignItems = [];
let currentGalleryIndex = 0;

const lightboxModal = document.getElementById("lightboxModal");
const lightboxOverlay = document.getElementById("lightboxOverlay");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxTools = document.getElementById("lightboxTools");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxCounter = document.getElementById("lightboxCounter");

function collectGalleryItems() {
  galleryDesignItems = [];
  const viewBtns = document.querySelectorAll(".view-design-btn");
  
  viewBtns.forEach((btn, index) => {
    galleryDesignItems.push({
      src: btn.getAttribute("data-img"),
      title: btn.getAttribute("data-title") || "Design Artwork",
      tools: btn.getAttribute("data-tools") || "Adobe Photoshop / Illustrator",
      desc: btn.getAttribute("data-desc") || "Original visual creation."
    });
    btn.addEventListener("click", () => openGalleryAtIndex(index));
  });
}

function updateGalleryDisplay() {
  if (!galleryDesignItems.length) return;
  const item = galleryDesignItems[currentGalleryIndex];
  if (!item) return;

  if (lightboxImg) lightboxImg.src = item.src;
  if (lightboxTitle) lightboxTitle.textContent = item.title;
  if (lightboxTools) lightboxTools.textContent = item.tools;
  if (lightboxCaption) lightboxCaption.textContent = item.desc;
  if (lightboxCounter) lightboxCounter.textContent = `${currentGalleryIndex + 1} / ${galleryDesignItems.length}`;
}

function openGalleryAtIndex(index) {
  if (!lightboxModal) return;
  currentGalleryIndex = index;
  updateGalleryDisplay();
  lightboxModal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightboxModal) return;
  lightboxModal.classList.remove("active");
  document.body.style.overflow = "";
}

function showNextArtwork() {
  if (!galleryDesignItems.length) return;
  currentGalleryIndex = (currentGalleryIndex + 1) % galleryDesignItems.length;
  updateGalleryDisplay();
}

function showPrevArtwork() {
  if (!galleryDesignItems.length) return;
  currentGalleryIndex = (currentGalleryIndex - 1 + galleryDesignItems.length) % galleryDesignItems.length;
  updateGalleryDisplay();
}

if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
if (lightboxOverlay) lightboxOverlay.addEventListener("click", closeLightbox);
if (lightboxNext) lightboxNext.addEventListener("click", showNextArtwork);
if (lightboxPrev) lightboxPrev.addEventListener("click", showPrevArtwork);

// Keyboard controls
document.addEventListener("keydown", (e) => {
  if (!lightboxModal || !lightboxModal.classList.contains("active")) {
    if (e.key === "Escape") closeMobileNav();
    return;
  }
  if (e.key === "Escape") closeLightbox();
  else if (e.key === "ArrowRight") showNextArtwork();
  else if (e.key === "ArrowLeft") showPrevArtwork();
});

// Touch swipe gestures for mobile gallery viewing
let touchStartX = 0;
if (lightboxModal) {
  lightboxModal.addEventListener("touchstart", (e) => {
    if (e.touches[0]) touchStartX = e.touches[0].clientX;
  }, { passive: true });

  lightboxModal.addEventListener("touchend", (e) => {
    if (!e.changedTouches[0]) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartX;

    if (diffX < -50) showNextArtwork();      // Swipe Left -> Next
    else if (diffX > 50) showPrevArtwork();  // Swipe Right -> Prev
  });
}

/* HORIZONTAL TIMELINE WHEEL SCROLL FOR DESKTOP */
const timelineWrap = document.getElementById("timelineTrackWrap");
if (timelineWrap) {
  timelineWrap.addEventListener("wheel", (e) => {
    if (window.innerWidth > 768) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        timelineWrap.scrollLeft += e.deltaY;
      }
    }
  }, { passive: false });
}

/* INITIALIZE ALL COMPONENTS */
document.addEventListener("DOMContentLoaded", () => {
  initInvitationStudio();
  initBrochureStudio();
  initCategoryFilters();
  collectGalleryItems();
});

if (document.readyState === "complete" || document.readyState === "interactive") {
  initInvitationStudio();
  initBrochureStudio();
  initCategoryFilters();
  collectGalleryItems();
}