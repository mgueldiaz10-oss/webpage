/**
 * ==========================================================================
 * PORTAFOLIO CIENTÍFICO-TECNOLÓGICO INTERDISCIPLINARIO — ALEJANDRO DÍAZ
 * Lógica Front-End: Red Molecular/Cómputo Canvas, Easter Eggs, Anillo NeoPixel
 * de 16 LEDs, ScrollSpy, Animaciones y Contacto Inteligente.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initPhysicsCanvas();
  initHeaderAndNav();
  initSpaNavigation();
  initScrollSpy();
  initScrollAnimations();
  initTerminalEasterEgg();
  initArcReactors();
  initPrefillLinks();
  initCopyEmail();
  initContactForm();
  initCVHandler();
  initBackToTop();
  updateCurrentYear();
});

/**
 * 1. FONDO INTERACTIVO: RED DE NODOS (CIENCIA · TECNOLOGÍA · INGENIERÍA)
 */
function initPhysicsCanvas() {
  const canvas = document.getElementById('physics-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PARTICLE_COUNT = Math.min(Math.floor((width * height) / 19000), 70);
  const MAX_DISTANCE = 135;
  const particles = [];

  const mouse = { x: null, y: null, radius: 115 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.55;
      this.vy = (Math.random() - 0.5) * 0.55;
      this.radius = Math.random() * 1.8 + 1;
      this.isEmerald = Math.random() > 0.65;
      this.baseAlpha = Math.random() * 0.38 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.1;
          this.y -= (dy / dist) * force * 1.1;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.isEmerald
        ? `rgba(16, 185, 129, ${this.baseAlpha})`
        : `rgba(56, 189, 248, ${this.baseAlpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < MAX_DISTANCE) {
          const alpha = (1 - distance / MAX_DISTANCE) * 0.2;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }

    particles.forEach((p) => {
      if (!prefersReducedMotion) p.update();
      p.draw();
    });

    if (!prefersReducedMotion) {
      requestAnimationFrame(render);
    }
  }

  render();

  let lastWidth = width;
  window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    // Evitar parpadeo en smartphones cuando la barra de direcciones cambia ligeramente el alto al hacer scroll
    if (newWidth !== lastWidth || Math.abs(newHeight - height) > 150) {
      lastWidth = width = canvas.width = newWidth;
      height = canvas.height = newHeight;
      if (prefersReducedMotion) render();
    }
  }, { passive: true });
}

/**
 * 2. HEADER Y NAVEGACIÓN MÓVIL / TABLET
 */
function initHeaderAndNav() {
  const header = document.getElementById('main-header');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  function closeMobileMenu() {
    if (!menuToggle || !mobileNav) return;
    menuToggle.classList.remove('open');
    mobileNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      mobileNav.setAttribute('aria-hidden', String(!isOpen));
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('click', (e) => {
      if (!header.contains(e.target) && mobileNav.classList.contains('open')) {
        closeMobileMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }
}

/**
 * 2.5 NAVEGACIÓN MODO SPA (VISTA POR SECCIÓN BAJO DEMANDA)
 * Al ingresar a la página solo carga la sección de Inicio (#hero).
 * Para ver cualquier otra sección, el usuario navega desde el menú o botones internos.
 */
function initSpaNavigation() {
  const mainContent = document.getElementById('main-content');
  const allSections = document.querySelectorAll('main#main-content > section.section');
  if (!mainContent || !allSections.length) return;

  // Activar modo SPA en el body
  document.body.classList.add('spa-mode');

  // Orden y nombres amigables de las secciones principales del menú
  const sectionOrder = [
    { id: 'hero', label: 'Inicio' },
    { id: 'about', label: 'Sobre mí' },
    { id: 'education', label: 'Formación' },
    { id: 'experience', label: 'Experiencia' },
    { id: 'research', label: 'Investigación' },
    { id: 'ai-computing', label: 'Tecnología & IA' },
    { id: 'student-innovation', label: 'Comunidad' },
    { id: 'personal-lab', label: 'Personal Lab' },
    { id: 'cv-section', label: 'CV' },
    { id: 'contact', label: 'Contacto' }
  ];

  // Crear barra inferior de navegación entre secciones (pager opcional de apoyo al menú superior)
  let pagerContainer = document.getElementById('spa-pager');
  if (!pagerContainer) {
    pagerContainer = document.createElement('div');
    pagerContainer.id = 'spa-pager';
    pagerContainer.className = 'container spa-pager-container';
    mainContent.appendChild(pagerContainer);
  }

  function renderPager(activeId) {
    const normalizedId = activeId === 'philosophy' ? 'about' : activeId;
    const currentIndex = sectionOrder.findIndex((item) => item.id === normalizedId);
    if (currentIndex === -1) {
      pagerContainer.innerHTML = '';
      return;
    }

    const prevItem = currentIndex > 0 ? sectionOrder[currentIndex - 1] : null;
    const nextItem = currentIndex < sectionOrder.length - 1 ? sectionOrder[currentIndex + 1] : null;

    const prevHtml = prevItem
      ? `<a href="#${prevItem.id}" class="spa-pager-btn" data-spa-target="${prevItem.id}">
          <span class="spa-pager-label">← Sección anterior</span>
          <span class="spa-pager-title">${prevItem.label}</span>
        </a>`
      : `<span class="spa-pager-hint">Usa el menú superior para ir a cualquier sección</span>`;

    const nextHtml = nextItem
      ? `<a href="#${nextItem.id}" class="spa-pager-btn next" data-spa-target="${nextItem.id}">
          <span class="spa-pager-label">Siguiente sección →</span>
          <span class="spa-pager-title">${nextItem.label}</span>
        </a>`
      : `<a href="#hero" class="spa-pager-btn next" data-spa-target="hero">
          <span class="spa-pager-label">Volver al inicio ↺</span>
          <span class="spa-pager-title">Inicio</span>
        </a>`;

    pagerContainer.innerHTML = `
      <div class="spa-pager-bar" aria-label="Navegación entre secciones">
        ${prevHtml}
        <span class="spa-pager-hint">Sección ${currentIndex + 1} de ${sectionOrder.length} · ${sectionOrder[currentIndex].label}</span>
        ${nextHtml}
      </div>
    `;
  }

  function showSection(sectionId, updateHistory = true) {
    const normalizedId = sectionId === 'philosophy' ? 'about' : sectionId;
    const targetEl = document.getElementById(normalizedId);
    if (!targetEl) return;

    // 1. Ocultar todas las secciones
    allSections.forEach((sec) => {
      sec.classList.remove('spa-active', 'spa-subview');
    });

    // 2. Mostrar la sección seleccionada
    targetEl.classList.add('spa-active');

    // Si es "Sobre mí" (#about), incluir también el bloque complementario #philosophy
    const activeElements = [targetEl];
    if (normalizedId === 'about') {
      const philosophySec = document.getElementById('philosophy');
      if (philosophySec) {
        philosophySec.classList.add('spa-active', 'spa-subview');
        activeElements.push(philosophySec);
      }
    }

    // 3. Activar inmediatamente las animaciones de aparición dentro de la sección activa
    activeElements.forEach((sec) => {
      const revealItems = sec.querySelectorAll('.reveal-on-scroll');
      revealItems.forEach((el) => el.classList.add('is-revealed'));
    });

    // 4. Actualizar estado activo en enlaces del menú de escritorio y móvil
    const allNavLinks = document.querySelectorAll('.nav-desktop .nav-link, .mobile-nav-link');
    allNavLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${normalizedId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // 5. Actualizar el paginador inferior
    renderPager(normalizedId);

    // 6. Llevar el scroll suavemente a la parte superior de la vista
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 7. Actualizar el historial si aplica
    if (updateHistory && window.history && window.history.pushState) {
      const newUrl = normalizedId === 'hero'
        ? window.location.pathname + window.location.search
        : `#${normalizedId}`;
      window.history.pushState({ section: normalizedId }, '', newUrl);
    }
  }

  // Interceptar clics en todos los enlaces internos que apunten a una sección (#...)
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#' || href === '#main-content') return;

    const targetId = href.slice(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection && targetSection.classList.contains('section')) {
      e.preventDefault();
      showSection(targetId, true);
    }
  });

  // Soportar botones Atrás / Adelante del navegador
  window.addEventListener('popstate', (e) => {
    const stateSection = e.state && e.state.section;
    if (stateSection && document.getElementById(stateSection)) {
      showSection(stateSection, false);
    } else {
      const hashId = window.location.hash ? window.location.hash.slice(1) : 'hero';
      showSection(document.getElementById(hashId) ? hashId : 'hero', false);
    }
  });

  // Al ingresar a la página, cargar exclusivamente la sección de Inicio (#hero)
  showSection('hero', false);
  if (window.history && window.history.replaceState) {
    window.history.replaceState({ section: 'hero' }, '', window.location.pathname + window.location.search);
  }
}

/**
 * 3. SCROLLSPY DINÁMICO (Respaldo cuando no está en modo SPA)
 */
function initScrollSpy() {
  if (document.body.classList.contains('spa-mode')) return;
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-desktop .nav-link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${currentId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    },
    { root: null, rootMargin: '-22% 0px -62% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/**
 * 4. ANIMACIONES AL SCROLL
 */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (!revealElements.length) return;

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, threshold: 0.1, rootMargin: '0px 0px -35px 0px' }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-revealed'));
  }
}

/**
 * 5. VENTANA DE CÓDIGO / EASTER EGG CIENTÍFICO-HUMORÍSTICO (Sección 3)
 */
function initTerminalEasterEgg() {
  const nextBtn = document.getElementById('btn-next-easter-egg');
  const titleEl = document.getElementById('terminal-filename');
  const contentEl = document.getElementById('terminal-content');

  if (!nextBtn || !titleEl || !contentEl) return;

  const snippets = [
    {
      filename: 'lab_reality_check.py',
      html: `
        <div class="code-line"><span class="code-comment"># Intento #42: Resolver Navier-Stokes analíticamente antes del café</span></div>
        <div class="code-line"><span class="code-keyword">&gt;&gt;&gt;</span> <span class="code-func">solve</span>(<span class="code-var">navier_stokes</span>, domain=<span class="code-num">"3D_turbulent"</span>)</div>
        <div class="code-line"><span class="code-comment">Computing analytical solution...</span></div>
        <div class="code-line"><span class="code-error">RuntimeError: Solution not found. ¯\\_(ツ)_/¯</span></div>
        <div class="code-line">&nbsp;</div>
        <div class="code-line"><span class="code-keyword">&gt;&gt;&gt;</span> <span class="code-func">switch_strategy</span>([<span class="code-num">"experimentación"</span>, <span class="code-num">"simulación"</span>, <span class="code-num">"IA"</span>])</div>
        <div class="code-line output-line"><span class="code-success">Status:</span> <span class="code-val">Construyendo aproximaciones útiles en el mundo real [OK]</span></div>
      `
    },
    {
      filename: 'thermo_fugacity_crisis.py',
      html: `
        <div class="code-line"><span class="code-comment"># Cuando asumes gas ideal a 150 bar en un reactor no isotérmico</span></div>
        <div class="code-line"><span class="code-keyword">&gt;&gt;&gt;</span> <span class="code-func">check_assumption</span>(<span class="code-var">PV_equals_nRT</span>, pressure_bar=<span class="code-num">150</span>)</div>
        <div class="code-line"><span class="code-error">ThermodynamicWarning: El coeficiente de fugacidad se rehúsa a cooperar.</span></div>
        <div class="code-line">&nbsp;</div>
        <div class="code-line"><span class="code-keyword">&gt;&gt;&gt;</span> <span class="code-func">calibrate_model</span>(method=<span class="code-num">"Peng-Robinson + Experimental Data"</span>)</div>
        <div class="code-line output-line"><span class="code-success">Balance de Materia y Energía:</span> <span class="code-val">Convergencia lograda [ΔE &lt; 0.01%]</span></div>
      `
    },
    {
      filename: 'protoboard_debugging.ino',
      html: `
        <div class="code-line"><span class="code-comment">// Diagnóstico de instrumentación con ESP32 y sensores</span></div>
        <div class="code-line"><span class="code-keyword">&gt;&gt;&gt;</span> <span class="code-func">analogRead</span>(<span class="code-var">SENSOR_PIN</span>); <span class="code-comment">// ¿Por qué da ruido aleatorio?</span></div>
        <div class="code-line"><span class="code-error">HardwareException: Olvidaste conectar la tierra (GND) común.</span></div>
        <div class="code-line">&nbsp;</div>
        <div class="code-line"><span class="code-keyword">&gt;&gt;&gt;</span> <span class="code-func">connect_common_ground</span>(<span class="code-var">arduino</span>, <span class="code-var">neopixel_16_ring</span>)</div>
        <div class="code-line output-line"><span class="code-success">Señal limpia:</span> <span class="code-val">16 LEDs brillando sin parpadeo [READY]</span></div>
      `
    },
    {
      filename: 'local_llm_vram_check.sh',
      html: `
        <div class="code-line"><span class="code-comment"># Cargando modelo de lenguaje local en estación de trabajo</span></div>
        <div class="code-line"><span class="code-keyword">$</span> <span class="code-func">run_inference</span> --model <span class="code-num">"giant_unquantized_model"</span> --precision <span class="code-num">fp32</span></div>
        <div class="code-line"><span class="code-error">CUDA_OutOfMemory: Tu VRAM pidió piedad (ventiladores al 100%).</span></div>
        <div class="code-line">&nbsp;</div>
        <div class="code-line"><span class="code-keyword">$</span> <span class="code-func">optimize_pipeline</span> --quantization <span class="code-num">4bit</span> --whisper-audio <span class="code-num">enabled</span></div>
        <div class="code-line output-line"><span class="code-success">Inferencia Local:</span> <span class="code-val">38 tokens/seg con temperatura controlada [OK]</span></div>
      `
    }
  ];

  let currentIdx = 0;

  nextBtn.addEventListener('click', () => {
    currentIdx = (currentIdx + 1) % snippets.length;
    titleEl.textContent = snippets[currentIdx].filename;
    contentEl.innerHTML = snippets[currentIdx].html;
  });
}

/**
 * 6. REACTORES ARC INTERACTIVOS (PERSONAL LAB)
 * Tarjeta 1: Reactor Circular Mark I/II (24 LEDs, Modulación Sinusoidal, Barrido y PWM Potenciómetro)
 * Tarjeta 2: Reactor Triangular Mark IV/VI - Iron Man 2 (33 LEDs en Cascada, Secuencia de Ignición 3 Ondas)
 */
function initArcReactors() {
  initCircularReactor();
  initTriangularReactor();
}

/**
 * 6.1 REACTOR ARC CIRCULAR (MARK I / II - PALADIO)
 */
function initCircularReactor() {
  const container = document.getElementById('circular-reactor-demo');
  const coilsContainer = document.getElementById('circular-coils');
  const modeBadge = document.getElementById('circular-mode-badge');
  const toggleBtn = document.getElementById('btn-toggle-circular-mode');
  const speedBtn = document.getElementById('btn-speed-circular');
  const speedValEl = document.getElementById('speed-circular-val');
  if (!container) return;

  const LED_COUNT = 24;
  const radius = 80;
  const center = 100;
  const leds = [];

  // 1. Generar 10 bobinas perimetrales de cobre estilo Mark I
  if (coilsContainer) {
    coilsContainer.innerHTML = '';
    const COIL_COUNT = 10;
    for (let c = 0; c < COIL_COUNT; c++) {
      const angleDeg = c * (360 / COIL_COUNT);
      const coil = document.createElement('div');
      coil.className = 'arc-coil';
      coil.style.transform = `rotate(${angleDeg}deg)`;
      coilsContainer.appendChild(coil);
    }
  }

  // 2. Generar los 24 LEDs NeoPixel en círculo
  for (let i = 0; i < LED_COUNT; i++) {
    const angle = (i / LED_COUNT) * Math.PI * 2 - Math.PI / 2;
    const x = center + radius * Math.cos(angle) - 5;
    const y = center + radius * Math.sin(angle) - 5;

    const led = document.createElement('span');
    led.className = 'neopixel-led';
    led.style.left = `${x}px`;
    led.style.top = `${y}px`;
    container.appendChild(led);
    leds.push(led);
  }

  // Modos de operación (Fieles al sketch.ino de Arduino)
  const modes = [
    { id: 'pulse', name: 'Pulso de Energía Sinusoidal (Latido)', dot: 'dot-cyan' },
    { id: 'sweep', name: 'Barrido Rotatorio (Rotary Sweep)', dot: 'dot-amber' },
    { id: 'static', name: 'Núcleo Estático Paladio (Core Glow)', dot: 'dot-cyan' },
    { id: 'spectrum', name: 'Espectro de Plasma RGB', dot: 'dot-blue' }
  ];

  let currentModeIndex = 0;
  let angle = 0;
  let sweepHead = 0;
  let animTimer = null;

  // Simulador de Potenciómetro PWM (Lento / Medio / Rápido)
  const speeds = [
    { label: 'Rápido', pulseStep: 0.08, sweepDelay: 25 },
    { label: 'Medio', pulseStep: 0.045, sweepDelay: 45 },
    { label: 'Lento', pulseStep: 0.025, sweepDelay: 80 }
  ];
  let speedIndex = 0;

  function updateBadge() {
    if (!modeBadge) return;
    const m = modes[currentModeIndex];
    modeBadge.innerHTML = `<span class="indicator-dot ${m.dot}"></span><span class="mode-text">Modo: ${m.name}</span>`;
  }

  function renderFrame() {
    const mode = modes[currentModeIndex].id;
    const speed = speeds[speedIndex];

    if (mode === 'pulse') {
      // Modulación sinusoidal suave (Math.sin entre 0.25 y 1.0)
      angle += speed.pulseStep;
      if (angle >= Math.PI * 2) angle -= Math.PI * 2;
      const intensity = (Math.sin(angle) + 1.0) * 0.38 + 0.24; // 0.24 a 1.0
      const shadowBlur = Math.round(intensity * 18);
      const color = `rgba(56, 189, 248, ${intensity})`;

      leds.forEach((led) => {
        led.style.backgroundColor = color;
        led.style.boxShadow = `0 0 ${shadowBlur}px #38bdf8, 0 0 ${shadowBlur * 1.5}px rgba(56, 189, 248, 0.7)`;
        led.style.opacity = `${intensity}`;
      });
    } else if (mode === 'sweep') {
      // Barrido con estela de 8 LEDs desvanecidos progresivamente
      const tailLength = 8;
      leds.forEach((led, idx) => {
        let found = false;
        for (let t = 0; t < tailLength; t++) {
          const target = (sweepHead - t + LED_COUNT) % LED_COUNT;
          if (idx === target) {
            const ratio = (tailLength - t) / tailLength; // 1.0 a 0.125
            led.style.backgroundColor = '#38bdf8';
            led.style.boxShadow = `0 0 ${Math.round(ratio * 16)}px #38bdf8`;
            led.style.opacity = `${ratio.toFixed(2)}`;
            found = true;
            break;
          }
        }
        if (!found) {
          led.style.backgroundColor = 'rgba(56, 189, 248, 0.15)';
          led.style.boxShadow = 'none';
          led.style.opacity = '0.2';
        }
      });
      sweepHead = (sweepHead + 1) % LED_COUNT;
    } else if (mode === 'static') {
      // Núcleo estático brillante y estable
      leds.forEach((led) => {
        led.style.backgroundColor = '#38bdf8';
        led.style.boxShadow = '0 0 10px #38bdf8, 0 0 20px #38bdf8';
        led.style.opacity = '1';
      });
    } else if (mode === 'spectrum') {
      // Espectro de plasma cromático continuo
      angle += 0.05;
      leds.forEach((led, i) => {
        const hue = Math.round(((i / LED_COUNT) + (angle / (Math.PI * 2))) * 360) % 360;
        const c = `hsl(${hue}, 92%, 62%)`;
        led.style.backgroundColor = c;
        led.style.boxShadow = `0 0 10px ${c}, 0 0 18px ${c}`;
        led.style.opacity = '1';
      });
    }
  }

  function startAnimation() {
    if (animTimer) clearInterval(animTimer);
    const intervalMs = modes[currentModeIndex].id === 'sweep'
      ? speeds[speedIndex].sweepDelay
      : 30;
    animTimer = setInterval(renderFrame, intervalMs);
  }

  function cycleMode() {
    currentModeIndex = (currentModeIndex + 1) % modes.length;
    updateBadge();
    startAnimation();
    showToast(`Reactor Circular: ${modes[currentModeIndex].name}`);
  }

  function cycleSpeed() {
    speedIndex = (speedIndex + 1) % speeds.length;
    if (speedValEl) speedValEl.textContent = speeds[speedIndex].label;
    startAnimation();
    showToast(`Potenciómetro PWM: Velocidad ${speeds[speedIndex].label}`);
  }

  container.addEventListener('click', cycleMode);
  if (toggleBtn) toggleBtn.addEventListener('click', cycleMode);
  if (speedBtn) speedBtn.addEventListener('click', cycleSpeed);

  updateBadge();
  startAnimation();
}

/**
 * 6.2 REACTOR ARC TRIANGULAR (MARK IV / VI - NUEVO ELEMENTO DE IRON MAN 2)
 * Arquitectura de 33 NeoPixels en cascada: 1 LED Central + 8 LEDs Triángulo + 24 LEDs Aro Exterior
 * Con chasis vectorial CNC de titanio y difusores ópticos idénticos al prop real de Iron Man 2.
 * Incluye la animación programada en Tinkercad con 3 repeticiones de onda expansiva y encendido permanente.
 */
function initTriangularReactor() {
  const container = document.getElementById('triangular-reactor-demo');
  const coreGlow = document.getElementById('tri-core-glow');
  const channelGlow = document.getElementById('tri-channel-glow');
  const outerGlow = document.getElementById('tri-outer-windows-glow');
  const centerLedPt = document.getElementById('led-center-0');
  const triLedPts = document.querySelectorAll('#tri-neopixels-layer .tri-led-pt[id^="led-tri-"]');
  const ringLedPts = document.querySelectorAll('#tri-neopixels-layer .tri-led-pt[id^="led-ring-"]');
  const modeBadge = document.getElementById('triangular-mode-badge');
  const triggerIgnitionBtn = document.getElementById('btn-trigger-triangular-ignition');
  const toggleModeBtn = document.getElementById('btn-toggle-triangular-mode');

  if (!container || !coreGlow || !channelGlow || !outerGlow) return;

  const RING_COUNT = 24;

  // Funciones de control de capas de LEDs y difusores
  function setCenter(on, color = '#ffffff') {
    if (on) {
      coreGlow.classList.remove('tri-layer-off');
      coreGlow.classList.add('tri-layer-on');
      if (centerLedPt) {
        centerLedPt.setAttribute('fill', color);
        centerLedPt.setAttribute('opacity', '1');
      }
    } else {
      coreGlow.classList.remove('tri-layer-on');
      coreGlow.classList.add('tri-layer-off');
      if (centerLedPt) {
        centerLedPt.setAttribute('opacity', '0.08');
      }
    }
  }

  function setTriangle(on, color = '#bae6fd') {
    if (on) {
      channelGlow.classList.remove('tri-layer-off');
      channelGlow.classList.add('tri-layer-on');
      triLedPts.forEach((pt) => {
        pt.setAttribute('fill', color);
        pt.setAttribute('opacity', '1');
      });
    } else {
      channelGlow.classList.remove('tri-layer-on');
      channelGlow.classList.add('tri-layer-off');
      triLedPts.forEach((pt) => {
        pt.setAttribute('opacity', '0.08');
      });
    }
  }

  function setRing(on, color = '#bae6fd') {
    if (on) {
      outerGlow.classList.remove('tri-layer-off');
      outerGlow.classList.add('tri-layer-on');
      ringLedPts.forEach((pt) => {
        pt.setAttribute('fill', color);
        pt.setAttribute('opacity', '1');
      });
    } else {
      outerGlow.classList.remove('tri-layer-on');
      outerGlow.classList.add('tri-layer-off');
      ringLedPts.forEach((pt) => {
        pt.setAttribute('opacity', '0.08');
      });
    }
  }

  function setAll(on) {
    setCenter(on);
    setTriangle(on);
    setRing(on);
  }

  // Modos de operación continuo
  const triModes = [
    { id: 'stable', name: 'Núcleo Estable (Nuevo Elemento)', dot: 'dot-blue' },
    { id: 'vortex', name: 'Flujo de Plasma Perimetral (Vórtice)', dot: 'dot-cyan' },
    { id: 'resonance', name: 'Resonancia Trifásica Continua', dot: 'dot-emerald' },
    { id: 'unibeam', name: 'Sobrecarga Repulsora (Unibeam Max)', dot: 'dot-amber' }
  ];

  let currentTriModeIndex = 0;
  let isIgniting = false;
  let loopTimer = null;
  let tick = 0;

  function updateTriBadge(text, dotClass) {
    if (!modeBadge) return;
    const dot = dotClass || triModes[currentTriModeIndex].dot;
    const title = text || `Estado: ${triModes[currentTriModeIndex].name}`;
    modeBadge.innerHTML = `<span class="indicator-dot ${dot}"></span><span class="mode-text">${title}</span>`;
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * SECUENCIA DE IGNICIÓN (3 ONDAS EXPANSIVAS DE TINKERCAD)
   * 1. Centro -> Triángulo -> Aro (3 repeticiones)
   * 2. Encendido final permanente
   */
  async function runIgnitionSequence() {
    if (isIgniting) return;
    isIgniting = true;
    if (loopTimer) clearInterval(loopTimer);

    // Apagar todos antes de comenzar
    setAll(false);
    updateTriBadge('Iniciando ignición de nuevo elemento...', 'dot-amber');

    for (let ciclo = 1; ciclo <= 3; ciclo++) {
      updateTriBadge(`Ignición: Onda ${ciclo} de 3 (Centro → Triángulo → Aro)...`, 'dot-amber');

      // 1. Encender desde el centro hacia afuera
      setCenter(true, '#ffffff');
      await sleep(200);

      setTriangle(true, '#bae6fd');
      await sleep(200);

      setRing(true, '#38bdf8');
      await sleep(350); // Pausa con todos encendidos

      // 2. Apagar desde el centro hacia afuera
      setCenter(false);
      await sleep(150);

      setTriangle(false);
      await sleep(150);

      setRing(false);
      await sleep(300); // Pausa antes de la siguiente onda
    }

    // 3. Encendido final tras los 3 ciclos: permanecen encendidos permanentemente
    updateTriBadge('¡Sincronización completa! Encendido definitivo...', 'dot-cyan');
    setCenter(true, '#ffffff');
    await sleep(150);
    setTriangle(true, '#bae6fd');
    await sleep(150);
    setRing(true, '#38bdf8');

    isIgniting = false;
    currentTriModeIndex = 0; // Núcleo Estable
    updateTriBadge('Estado: Núcleo Estable (Nuevo Elemento Activo)', 'dot-blue');
    showToast('⚡ ¡Ignición completada! 33 LEDs sincronizados y activos.');
    startContinuousLoop();
  }

  function renderTriContinuous() {
    if (isIgniting) return;
    tick++;
    const mode = triModes[currentTriModeIndex].id;

    if (mode === 'stable') {
      // Brillo continuo con sutil vibración de energía del nuevo elemento
      const pulse = Math.sin(tick * 0.08) * 0.12 + 0.88;
      coreGlow.style.opacity = `${pulse.toFixed(2)}`;
      channelGlow.style.opacity = `${(pulse * 0.95).toFixed(2)}`;
      outerGlow.style.opacity = '1';
    } else if (mode === 'vortex') {
      // Vórtice perimetral rápido en los 24 LEDs del aro exterior
      const head = tick % RING_COUNT;
      const tail = 7;
      ringLedPts.forEach((pt, idx) => {
        let isTail = false;
        for (let t = 0; t < tail; t++) {
          const target = (head - t + RING_COUNT) % RING_COUNT;
          if (idx === target) {
            const ratio = (tail - t) / tail;
            pt.setAttribute('opacity', `${ratio.toFixed(2)}`);
            pt.setAttribute('fill', '#ffffff');
            isTail = true;
            break;
          }
        }
        if (!isTail) {
          pt.setAttribute('opacity', '0.2');
          pt.setAttribute('fill', '#38bdf8');
        }
      });

      const triGlow = (Math.sin(tick * 0.15) + 1) * 0.35 + 0.3;
      channelGlow.style.opacity = `${triGlow.toFixed(2)}`;
      coreGlow.style.opacity = '1';
    } else if (mode === 'resonance') {
      // Onda continua de resonancia: Centro -> Triángulo -> Aro
      const phase = Math.floor((tick / 8) % 3);
      setCenter(phase === 0, '#ffffff');
      setTriangle(phase === 1, '#bae6fd');
      setRing(phase === 2, '#38bdf8');
    } else if (mode === 'unibeam') {
      // Sobrecarga repulsora máxima (blanco brillante y halo de gran intensidad)
      const flash = (Math.sin(tick * 0.2) + 1) * 0.35 + 0.65;
      coreGlow.style.opacity = `${(flash * 1.2).toFixed(2)}`;
      channelGlow.style.opacity = `${flash.toFixed(2)}`;
      outerGlow.style.opacity = `${flash.toFixed(2)}`;
    }
  }

  function startContinuousLoop() {
    if (loopTimer) clearInterval(loopTimer);
    loopTimer = setInterval(renderTriContinuous, 35);
  }

  function cycleTriMode() {
    if (isIgniting) return;
    currentTriModeIndex = (currentTriModeIndex + 1) % triModes.length;
    setAll(true);
    updateTriBadge();
    showToast(`Reactor Triangular: ${triModes[currentTriModeIndex].name}`);
  }

  container.addEventListener('click', () => {
    if (isIgniting) return;
    runIgnitionSequence();
  });

  if (triggerIgnitionBtn) {
    triggerIgnitionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      runIgnitionSequence();
    });
  }

  if (toggleModeBtn) {
    toggleModeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      cycleTriMode();
    });
  }

  // Iniciar en modo estable con todos los 33 LEDs y difusores activos
  setAll(true);
  updateTriBadge();
  startContinuousLoop();
}

/**
 * 7. PRE-LLENADO INTELIGENTE DE ASUNTO DE CONTACTO DESDE CTAs
 */
function initPrefillLinks() {
  const prefillLinks = document.querySelectorAll('[data-prefill-subject]');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');

  if (!prefillLinks.length || !subjectInput) return;

  prefillLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const subjectText = link.getAttribute('data-prefill-subject');
      if (subjectText) {
        subjectInput.value = subjectText;
        showToast(`Asunto seleccionado: "${subjectText}"`);
        setTimeout(() => {
          if (messageInput) messageInput.focus();
        }, 650);
      }
    });
  });
}

/**
 * 8. COPIAR CORREO INSTITUCIONAL AL PORTAPAPELES
 */
function initCopyEmail() {
  const copyBtn = document.getElementById('btn-copy-email');
  const emailTextEl = document.getElementById('email-text');

  if (!copyBtn || !emailTextEl) return;

  copyBtn.addEventListener('click', async () => {
    const email = emailTextEl.textContent.trim();
    const copyIcon = copyBtn.querySelector('.icon-copy');
    const checkIcon = copyBtn.querySelector('.icon-check');

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = email;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      if (copyIcon && checkIcon) {
        copyIcon.classList.add('hidden');
        checkIcon.classList.remove('hidden');
      }

      showToast('Correo ma.diazgaytan@ugto.mx copiado al portapapeles');

      setTimeout(() => {
        if (copyIcon && checkIcon) {
          copyIcon.classList.remove('hidden');
          checkIcon.classList.add('hidden');
        }
      }, 2500);
    } catch (err) {
      showToast('Selecciona y copia: ma.diazgaytan@ugto.mx');
    }
  });
}

/**
 * 9. FORMULARIO DE CONTACTO (Preparación de correo + confirmación)
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');

  if (!form || !feedback) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    const mailtoBody = `Hola Alejandro,\n\nSoy ${name} (${email}).\n\n${message}\n\nSaludos.`;
    const mailtoUrl = `mailto:ma.diazgaytan@ugto.mx?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailtoBody)}`;

    feedback.classList.remove('hidden', 'error');
    feedback.classList.add('success');
    feedback.textContent = '¡Mensaje listo! Se está abriendo tu cliente de correo hacia ma.diazgaytan@ugto.mx.';

    window.location.href = mailtoUrl;
  });
}

/**
 * 10. VERIFICACIÓN AMIGABLE DE BOTÓN DE CV
 */
function initCVHandler() {
  const cvBtn = document.getElementById('btn-download-cv');
  if (!cvBtn) return;

  cvBtn.addEventListener('click', async (e) => {
    const href = cvBtn.getAttribute('href');
    // Si se abre mediante protocolo http/https, verificamos si el PDF ya fue colocado
    if (window.location.protocol.startsWith('http')) {
      try {
        const response = await fetch(href, { method: 'HEAD' });
        if (!response.ok) {
          e.preventDefault();
          showToast('El archivo PDF se colocará en ./assets/cv/Alejandro_Diaz_CV.pdf. Mientras tanto, puedes solicitarlo en la sección de Contacto.');
        }
      } catch (_) {
        // Permitir comportamiento estándar si fetch local falla
      }
    }
  });
}

/**
 * 11. BOTÓN VOLVER ARRIBA
 */
function initBackToTop() {
  const backToTopBtn = document.getElementById('btn-back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 450) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/**
 * 12. NOTIFICACIÓN TOAST
 */
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3400);
}

/**
 * 13. AÑO ACTUAL EN FOOTER
 */
function updateCurrentYear() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}
