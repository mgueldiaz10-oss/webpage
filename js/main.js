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
  initNeoPixelRing();
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
 * 6. ANILLO INTERACTIVO NEOPIXEL DE 16 LEDs (ARC REACTOR — PERSONAL LAB)
 */
function initNeoPixelRing() {
  const ringContainer = document.getElementById('neopixel-demo');
  const toggleBtn = document.getElementById('btn-toggle-reactor-mode');
  if (!ringContainer) return;

  const LED_COUNT = 16;
  const radius = 76; // Radio del anillo en px
  const center = 95; // Mitad de 190px
  const leds = [];

  // Crear los 16 LEDs físicamente distribuidos en el anillo
  for (let i = 0; i < LED_COUNT; i++) {
    const angle = (i / LED_COUNT) * Math.PI * 2 - Math.PI / 2;
    const x = center + radius * Math.cos(angle) - 6;
    const y = center + radius * Math.sin(angle) - 6;

    const led = document.createElement('span');
    led.className = 'neopixel-led';
    led.style.left = `${x}px`;
    led.style.top = `${y}px`;
    ringContainer.appendChild(led);
    leds.push(led);
  }

  const modes = [
    { name: 'Arc Cyan Core', color: '#38bdf8' },
    { name: 'Emerald Lab Mode', color: '#10b981' },
    { name: 'Warm Plasma Amber', color: '#f59e0b' },
    { name: 'Spectrum RGB', color: 'rainbow' }
  ];

  let modeIndex = 0;
  let tick = 0;

  function applyMode() {
    const current = modes[modeIndex];
    leds.forEach((led, i) => {
      let c = current.color;
      if (c === 'rainbow') {
        const hue = Math.round(((i + tick) / LED_COUNT) * 360) % 360;
        c = `hsl(${hue}, 90%, 60%)`;
      }
      led.style.backgroundColor = c;
      led.style.boxShadow = `0 0 10px ${c}, 0 0 18px ${c}`;
      led.style.opacity = ((i + tick) % 4 === 0) ? '0.75' : '1';
    });
  }

  function switchMode() {
    modeIndex = (modeIndex + 1) % modes.length;
    tick++;
    applyMode();
    showToast(`Modo NeoPixel (16 LEDs): ${modes[modeIndex].name}`);
  }

  ringContainer.addEventListener('click', switchMode);
  if (toggleBtn) {
    toggleBtn.addEventListener('click', switchMode);
  }

  // Pulso sutil continuo
  setInterval(() => {
    tick = (tick + 1) % LED_COUNT;
    applyMode();
  }, 650);
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
