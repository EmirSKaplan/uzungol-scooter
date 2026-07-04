/* ============================================
   UZUNGÖL SCOOTER — MAIN JS
   Navbar, scroll animations, dynamic content
   ============================================ */

(function () {
  'use strict';

  // ==========================================
  // FIREBASE CONFIG — FILL IN YOUR DETAILS
  // ==========================================
  const FIREBASE_CONFIG = {
    // apiKey: "YOUR_API_KEY",
    // authDomain: "YOUR_PROJECT.firebaseapp.com",
    // projectId: "YOUR_PROJECT_ID",
    // storageBucket: "YOUR_PROJECT.appspot.com",
    // messagingSenderId: "YOUR_SENDER_ID",
    // appId: "YOUR_APP_ID"
  };

  // ==========================================
  // INITIALIZATION
  // ==========================================
  document.addEventListener('DOMContentLoaded', async () => {
    // Init DataManager
    if (window.DataManager) {
      await DataManager.init(FIREBASE_CONFIG);
    }

    initNavbar();
    initScrollAnimations();
    initScrollTop();
    initMobileMenu();
    initLangSelector();
    renderDynamicContent();
  });

  // ==========================================
  // NAVBAR — Sticky scroll effect
  // ==========================================
  function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScroll = 0;
    const scrollThreshold = 50;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > scrollThreshold) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    }, { passive: true });

    // Trigger on load in case page is already scrolled
    if (window.pageYOffset > scrollThreshold) {
      navbar.classList.add('scrolled');
    }
  }

  // ==========================================
  // MOBILE MENU
  // ==========================================
  function initMobileMenu() {
    const hamburger = document.querySelector('.navbar__hamburger');
    const mobileMenu = document.querySelector('.navbar__mobile');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('.navbar__link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ==========================================
  // LANGUAGE SELECTOR
  // ==========================================
  function initLangSelector() {
    const selectors = document.querySelectorAll('.lang-selector');

    selectors.forEach(selector => {
      const btn = selector.querySelector('.lang-selector__btn');
      if (!btn) return;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selector.classList.toggle('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', () => {
      selectors.forEach(s => s.classList.remove('open'));
    });
  }

  // ==========================================
  // SCROLL ANIMATIONS — Intersection Observer
  // ==========================================
  function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  // ==========================================
  // SCROLL TO TOP
  // ==========================================
  function initScrollTop() {
    const scrollTopBtn = document.querySelector('.scroll-top');
    if (!scrollTopBtn) return;

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 500) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================
  // COUNTER ANIMATION
  // ==========================================
  window.initCounters = function () {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  };

  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'), 10);
    const suffix = element.getAttribute('data-suffix') || '';
    const prefix = element.getAttribute('data-prefix') || '';
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(start + (target - start) * eased);

      element.textContent = prefix + current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ==========================================
  // DYNAMIC CONTENT RENDERING
  // ==========================================
  function renderDynamicContent() {
    if (!window.DataManager) return;

    renderLogo();
    renderWorkingHours();
    renderContactInfo();
    renderScooters();
    renderHeroImage();
    renderRoutes();
  }

  function renderHeroImage() {
    const heroImg = DataManager.getHeroImage();
    if (heroImg) {
      document.querySelectorAll('.hero__bg img').forEach(img => {
        img.src = heroImg;
      });
    }
  }

  function renderRoutes() {
    const container = document.querySelector('[data-routes-grid]');
    if (!container) return;
    const routes = DataManager.getRoutes() || [];
    container.innerHTML = routes.map((r, i) => `
      <div class="route-card animate-on-scroll stagger-${(i % 3) + 1}">
        <img class="route-card__image" src="${r.image || 'assets/images/hero-bg.png'}" alt="${getLocalizedText(r.name)}" loading="lazy">
        <div class="route-card__overlay">
          <h3 class="route-card__title">${getLocalizedText(r.name)}</h3>
          <p class="route-card__desc">${getLocalizedText(r.description)}</p>
          <span class="route-card__distance">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${r.distance || '~5 km'}
          </span>
        </div>
      </div>
    `).join('');
    initScrollAnimations();
  }

  function getLang() {
    const html = document.documentElement;
    return html.getAttribute('lang') || 'tr';
  }

  function getLocalizedText(obj) {
    const lang = getLang();
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj['tr'] || obj['en'] || '';
  }

  function renderLogo() {
    const logo = DataManager.getLogo();
    const logoImages = document.querySelectorAll('[data-logo-image]');
    const logoTexts = document.querySelectorAll('[data-logo-text]');
    const logoSubtexts = document.querySelectorAll('[data-logo-subtext]');

    logoImages.forEach(img => {
      if (logo.url) {
        img.src = logo.url;
      }
      img.style.display = '';
    });

    logoTexts.forEach(el => {
      el.textContent = logo.text || 'Uzungöl Scooter';
    });

    logoSubtexts.forEach(el => {
      el.textContent = getLocalizedText(logo.subtext);
    });
  }

  function renderWorkingHours() {
    const container = document.querySelector('[data-working-hours]');
    if (!container) return;

    const hours = DataManager.getWorkingHours();
    const lang = getLang();
    const dayNames = {
      tr: { monday: 'Pazartesi', tuesday: 'Salı', wednesday: 'Çarşamba', thursday: 'Perşembe', friday: 'Cuma', saturday: 'Cumartesi', sunday: 'Pazar' },
      en: { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' },
      ar: { monday: 'الإثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس', friday: 'الجمعة', saturday: 'السبت', sunday: 'الأحد' }
    };

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    container.innerHTML = hours.map(h => {
      const names = dayNames[lang] || dayNames['tr'];
      const isToday = h.day === today;
      const closedText = lang === 'ar' ? 'مغلق' : lang === 'en' ? 'Closed' : 'Kapalı';

      return `
        <div class="contact__hours-row ${isToday ? 'today' : ''}">
          <span class="contact__hours-day">${names[h.day]}</span>
          <span class="contact__hours-time">${h.closed ? closedText : h.open + ' - ' + h.close}</span>
        </div>
      `;
    }).join('');
  }

  function renderContactInfo() {
    const contact = DataManager.getContact();

    // WhatsApp links
    document.querySelectorAll('[data-whatsapp-link]').forEach(el => {
      const phone = contact.whatsapp.replace(/[^0-9]/g, '');
      el.href = `https://wa.me/${phone}`;
    });

    // Phone links
    document.querySelectorAll('[data-phone-link]').forEach(el => {
      el.href = `tel:${contact.phone}`;
    });

    // Phone text
    document.querySelectorAll('[data-phone-text]').forEach(el => {
      el.textContent = contact.phone;
    });

    // WhatsApp text
    document.querySelectorAll('[data-whatsapp-text]').forEach(el => {
      el.textContent = contact.whatsapp;
    });

    // Address
    document.querySelectorAll('[data-address]').forEach(el => {
      el.textContent = getLocalizedText(contact.address);
    });

    // Map
    document.querySelectorAll('[data-maps-embed]').forEach(iframe => {
      if (contact.mapsEmbedUrl) {
        iframe.src = contact.mapsEmbedUrl;
      }
    });

    // Email
    document.querySelectorAll('[data-email]').forEach(el => {
      el.textContent = contact.email || '';
      if (el.tagName === 'A') el.href = `mailto:${contact.email}`;
    });

    // Social Media Links
    if (contact.socialMedia) {
      const instaEl = document.getElementById('footer-instagram');
      if (instaEl) {
        let url = contact.socialMedia.instagram || 'https://instagram.com';
        if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
        instaEl.href = url;
        instaEl.target = '_blank';
      }
      const fbEl = document.getElementById('footer-facebook');
      if (fbEl) {
        let url = contact.socialMedia.facebook || 'https://facebook.com';
        if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
        fbEl.href = url;
        fbEl.target = '_blank';
      }
    }
  }

  function renderScooters() {
    // Featured scooters on home page
    const featuredContainer = document.querySelector('[data-featured-scooters]');
    if (featuredContainer) {
      const scooters = DataManager.getFeaturedScooters();
      const lang = getLang();
      const currency = DataManager.getPricing().currency || '₺';

      const ctaTexts = {
        tr: 'WhatsApp ile Sor',
        en: 'Ask via WhatsApp',
        ar: 'اسأل عبر واتساب'
      };

      const detailTexts = {
        tr: 'Detaylar',
        en: 'Details',
        ar: 'التفاصيل'
      };

      featuredContainer.innerHTML = scooters.map((s, i) => `
        <div class="card scooter-card animate-on-scroll stagger-${i + 1}" id="scooter-${s.id}">
          <div class="scooter-card__image-wrapper">
            <img class="scooter-card__image" src="${s.images[0] || 'assets/images/logo.png'}" alt="${s.brand} ${getLocalizedText(s.model)}" loading="lazy">
            ${s.featured ? '<span class="card__badge">⭐ ' + (lang === 'ar' ? 'مميز' : lang === 'en' ? 'Popular' : 'Popüler') + '</span>' : ''}
          </div>
          <div class="card__body">
            <h3 class="card__title">${s.brand} ${getLocalizedText(s.model)}</h3>
            <p class="card__text">${getLocalizedText(s.description)}</p>
            <div class="card__specs">
              <span class="card__spec">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                ${s.powerWatt || s.engineCC || 0}W
              </span>
              <span class="card__spec">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                ${s.capacity} ${lang === 'ar' ? 'أشخاص' : lang === 'en' ? 'person' : 'kişi'}
              </span>
            </div>
            <div class="card__price">
              <span class="card__price-amount">${currency}${s.prices.daily}</span>
              <span class="card__price-period">/ ${lang === 'ar' ? 'يوم' : lang === 'en' ? 'day' : 'gün'}</span>
            </div>
          </div>
          <div class="card__footer">
            <a href="${getFleetLink(lang)}" class="btn btn--sm btn--secondary">${detailTexts[lang] || detailTexts['tr']}</a>
            <a href="https://wa.me/${DataManager.getContact().whatsapp.replace(/[^0-9]/g, '')}" class="btn btn--sm btn--whatsapp" target="_blank">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.625-1.474A11.932 11.932 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-2.17 0-4.207-.613-5.963-1.688l-.428-.262-3.176 1.012 1.032-3.1-.28-.442A9.706 9.706 0 0 1 2.25 12 9.75 9.75 0 1 1 12 21.75z"/></svg>
              ${ctaTexts[lang] || ctaTexts['tr']}
            </a>
          </div>
        </div>
      `).join('');

      // Re-init scroll animations for new elements
      initScrollAnimations();
    }

    // Fleet page — all scooters
    const fleetContainer = document.querySelector('[data-all-scooters]');
    if (fleetContainer) {
      renderFleetScooters(fleetContainer);
    }
  }

  function getFleetLink(lang) {
    if (lang === 'en') return 'en/fleet.html';
    if (lang === 'ar') return 'ar/fleet.html';
    return 'filo.html';
  }

  function renderFleetScooters(container) {
    const scooters = DataManager.getScooters(true);
    const lang = getLang();
    const currency = DataManager.getPricing().currency || '₺';

    const ctaTexts = {
      tr: 'WhatsApp ile Kirala',
      en: 'Rent via WhatsApp',
      ar: 'استأجر عبر واتساب'
    };

    container.innerHTML = scooters.map((s, i) => `
      <div class="card scooter-card animate-on-scroll stagger-${(i % 3) + 1}" data-watt="${s.powerWatt || s.engineCC || 0}" data-capacity="${s.capacity}">
        <div class="scooter-card__image-wrapper">
          <img class="scooter-card__image" src="${s.images[0] || (getLang() === 'tr' ? 'assets/images/logo.png' : '../assets/images/logo.png')}" alt="${s.brand} ${getLocalizedText(s.model)}" loading="lazy">
          ${s.featured ? '<span class="card__badge">⭐ ' + (lang === 'ar' ? 'مميز' : lang === 'en' ? 'Popular' : 'Popüler') + '</span>' : ''}
        </div>
        <div class="card__body">
          <h3 class="card__title">${s.brand} ${getLocalizedText(s.model)}</h3>
          <p class="card__text">${getLocalizedText(s.description)}</p>
          <div class="card__specs">
            <span class="card__spec">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              ${s.powerWatt || s.engineCC || 0}W
            </span>
            <span class="card__spec">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              ${s.capacity} ${lang === 'ar' ? 'أشخاص' : lang === 'en' ? 'person' : 'kişi'}
            </span>
          </div>
          <div class="flex justify-between items-center" style="margin-top:var(--space-4)">
            <div>
              <div class="card__price">
                <span class="card__price-amount">${currency}${s.prices.halfHourly || 0}</span>
                <span class="card__price-period">/ ${lang === 'ar' ? '30 دقيقة' : lang === 'en' ? '30 mins' : '30 dk'}</span>
              </div>
              <div class="card__price" style="margin-top:var(--space-1)">
                <span class="card__price-amount">${currency}${s.prices.hourly}</span>
                <span class="card__price-period">/ ${lang === 'ar' ? 'ساعة' : lang === 'en' ? 'hour' : 'saat'}</span>
              </div>
              <div class="card__price" style="margin-top:var(--space-1)">
                <span style="font-size:var(--fs-lg);font-weight:var(--fw-bold);color:var(--color-navy)">${currency}${s.prices.daily}</span>
                <span class="card__price-period">/ ${lang === 'ar' ? 'يوم' : lang === 'en' ? 'day' : 'gün'}</span>
              </div>
            </div>
            <a href="https://wa.me/${DataManager.getContact().whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(s.brand + ' ' + getLocalizedText(s.model))}" class="btn btn--whatsapp" target="_blank">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.625-1.474A11.932 11.932 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-2.17 0-4.207-.613-5.963-1.688l-.428-.262-3.176 1.012 1.032-3.1-.28-.442A9.706 9.706 0 0 1 2.25 12 9.75 9.75 0 1 1 12 21.75z"/></svg>
              ${ctaTexts[lang] || ctaTexts['tr']}
            </a>
          </div>
        </div>
      </div>
    `).join('');

    initScrollAnimations();
  }

  // Make getLocalizedText available globally for other scripts
  window.getLocalizedText = getLocalizedText;
  window.getLang = getLang;

})();
