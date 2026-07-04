/* ============================================
   UZUNGÖL SCOOTER — ADMIN JS
   Admin panel logic: CRUD, forms, file upload
   ============================================ */

(function() {
  'use strict';

  // ==========================================
  // STATE
  // ==========================================
  let currentSection = 'dashboard';
  let editingScooterId = null;

  // ==========================================
  // INIT
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    DataManager.init({});

    // Check if already logged in (session)
    if (sessionStorage.getItem('admin_logged_in') === 'true') {
      showDashboard();
    }

    initLogin();
    initSidebar();
    initModal();
    initLogout();
  });

  // ==========================================
  // LOGIN
  // ==========================================
  function initLogin() {
    const form = document.getElementById('login-form');
    const errorEl = document.getElementById('login-error');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const password = document.getElementById('admin-password').value;

      if (DataManager.validatePassword(password)) {
        sessionStorage.setItem('admin_logged_in', 'true');
        errorEl.classList.remove('show');
        showDashboard();
      } else {
        errorEl.classList.add('show');
        document.getElementById('admin-password').value = '';
        document.getElementById('admin-password').focus();
      }
    });
  }

  function showDashboard() {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-wrapper').style.display = 'flex';
    renderSection('dashboard');
  }

  function initLogout() {
    document.getElementById('logout-btn').addEventListener('click', () => {
      sessionStorage.removeItem('admin_logged_in');
      document.getElementById('admin-login').style.display = '';
      document.getElementById('admin-wrapper').style.display = 'none';
      document.getElementById('admin-password').value = '';
    });
  }

  // ==========================================
  // SIDEBAR NAVIGATION
  // ==========================================
  function initSidebar() {
    const links = document.querySelectorAll('.admin-sidebar__link[data-section]');
    links.forEach(link => {
      link.addEventListener('click', () => {
        const section = link.getAttribute('data-section');
        setActiveLink(section);
        renderSection(section);

        // Close mobile sidebar
        document.getElementById('admin-sidebar').classList.remove('open');
      });
    });

    // Mobile toggle
    const toggle = document.getElementById('sidebar-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        document.getElementById('admin-sidebar').classList.toggle('open');
      });
    }
  }

  function setActiveLink(section) {
    document.querySelectorAll('.admin-sidebar__link').forEach(l => l.classList.remove('active'));
    const active = document.querySelector(`.admin-sidebar__link[data-section="${section}"]`);
    if (active) active.classList.add('active');
    currentSection = section;
  }

  // ==========================================
  // SECTION RENDERER
  // ==========================================
  function renderSection(section) {
    const content = document.getElementById('admin-content');
    const title = document.getElementById('page-title');

    const titles = {
      dashboard: 'Dashboard',
      logo: 'Logo Yönetimi',
      scooters: 'Scooter Modelleri',
      pricing: 'Fiyat Yönetimi',
      pagecontent: 'Sayfa İçerikleri',
      hours: 'Çalışma Saatleri',
      contact: 'İletişim Bilgileri',
      backup: 'Yedekleme & Geri Yükleme'
    };

    title.textContent = titles[section] || 'Dashboard';

    switch (section) {
      case 'dashboard': renderDashboard(content); break;
      case 'logo': renderLogoSection(content); break;
      case 'scooters': renderScootersSection(content); break;
      case 'pricing': renderPricingSection(content); break;
      case 'pagecontent': renderPageContentSection(content); break;
      case 'hours': renderHoursSection(content); break;
      case 'contact': renderContactSection(content); break;
      case 'backup': renderBackupSection(content); break;
    }
  }

  // ==========================================
  // DASHBOARD
  // ==========================================
  function renderDashboard(container) {
    const scooters = DataManager.getScooters();
    const activeScooters = scooters.filter(s => s.active);

    container.innerHTML = `
      <div class="admin-stats">
        <div class="admin-stat-card">
          <div class="admin-stat-card__icon admin-stat-card__icon--bordo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <div class="admin-stat-card__info">
            <div class="admin-stat-card__value">${scooters.length}</div>
            <div class="admin-stat-card__label">Toplam Scooter</div>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-card__icon admin-stat-card__icon--green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="admin-stat-card__info">
            <div class="admin-stat-card__value">${activeScooters.length}</div>
            <div class="admin-stat-card__label">Aktif Model</div>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-card__icon admin-stat-card__icon--gold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="admin-stat-card__info">
            <div class="admin-stat-card__value">₺${Math.min(...activeScooters.map(s => s.prices.hourly))}-${Math.max(...activeScooters.map(s => s.prices.hourly))}</div>
            <div class="admin-stat-card__label">Saatlik Fiyat Aralığı</div>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="admin-stat-card__icon admin-stat-card__icon--navy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <div class="admin-stat-card__info">
            <div class="admin-stat-card__value">${scooters.reduce((sum, s) => sum + s.images.length, 0)}</div>
            <div class="admin-stat-card__label">Toplam Fotoğraf</div>
          </div>
        </div>
      </div>

      <div class="admin-panel">
        <div class="admin-panel__header">
          <h3 class="admin-panel__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Hızlı Erişim
          </h3>
        </div>
        <div class="admin-panel__body">
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--space-4)">
            <button class="btn btn--primary" onclick="document.querySelector('[data-section=scooters]').click()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Scooter Ekle
            </button>
            <button class="btn btn--secondary" onclick="document.querySelector('[data-section=logo]').click()">Logo Değiştir</button>
            <button class="btn btn--secondary" onclick="document.querySelector('[data-section=hours]').click()">Saatleri Düzenle</button>
            <button class="btn btn--secondary" onclick="document.querySelector('[data-section=contact]').click()">İletişim Bilgileri</button>
          </div>
        </div>
      </div>

      <div class="admin-panel">
        <div class="admin-panel__header">
          <h3 class="admin-panel__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Son Eklenen Scooterlar
          </h3>
        </div>
        <div class="admin-panel__body" style="padding:0;">
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Görsel</th>
                  <th>Model</th>
                  <th>Motor</th>
                  <th>Günlük Fiyat</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                ${scooters.slice(0, 5).map(s => `
                  <tr>
                    <td><img class="admin-table__image" src="${s.images[0] || 'assets/images/logo.png'}" alt="${s.brand}"></td>
                    <td><strong>${s.brand} ${s.model.tr}</strong></td>
                    <td>${s.powerWatt || s.engineCC || 0}W</td>
                    <td>₺${s.prices.daily}</td>
                    <td><span class="admin-status ${s.active ? 'admin-status--active' : 'admin-status--inactive'}">${s.active ? '● Aktif' : '● Pasif'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // LOGO MANAGEMENT
  // ==========================================
  function renderLogoSection(container) {
    const logo = DataManager.getLogo();

    container.innerHTML = `
      <div class="admin-panel">
        <div class="admin-panel__header">
          <h3 class="admin-panel__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Logo Yönetimi
          </h3>
        </div>
        <div class="admin-panel__body">
          <div class="admin-logo-preview" id="logo-preview">
            ${logo.url
              ? `<img src="${logo.url}" alt="Mevcut Logo">`
              : '<p class="admin-logo-preview__placeholder">Henüz logo yüklenmemiş. Aşağıdan yükleyin.</p>'}
          </div>

          <div class="admin-upload" id="logo-upload-area">
            <div class="admin-upload__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <p class="admin-upload__text"><strong>Tıklayın</strong> veya sürükleyip bırakın</p>
            <p class="admin-upload__hint">PNG, JPG veya SVG — max 2MB</p>
            <input type="file" id="logo-file-input" accept="image/*">
          </div>

          <div style="margin-top:var(--space-6)">
            <div class="admin-form__group">
              <label class="admin-form__label">Logo Metni</label>
              <input class="admin-form__input" type="text" id="logo-text" value="${logo.text || ''}" placeholder="Uzungöl Scooter">
            </div>
            <div class="admin-form__row">
              <div class="admin-form__group">
                <label class="admin-form__label">Alt Metin (TR)</label>
                <input class="admin-form__input" type="text" id="logo-subtext-tr" value="${logo.subtext?.tr || ''}" placeholder="Scooter Kiralama">
              </div>
              <div class="admin-form__group">
                <label class="admin-form__label">Alt Metin (EN)</label>
                <input class="admin-form__input" type="text" id="logo-subtext-en" value="${logo.subtext?.en || ''}" placeholder="Scooter Rental">
              </div>
            </div>
            <div class="admin-form__group">
              <label class="admin-form__label">Alt Metin (AR)</label>
              <input class="admin-form__input" type="text" id="logo-subtext-ar" value="${logo.subtext?.ar || ''}" placeholder="تأجير سكوتر" dir="rtl">
            </div>
          </div>

          <div class="admin-form__actions">
            <button class="btn btn--primary" id="save-logo-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Kaydet
            </button>
            ${logo.url ? '<button class="btn btn--sm" style="color:var(--color-error)" id="remove-logo-btn">Logoyu Kaldır</button>' : ''}
          </div>
        </div>
      </div>
    `;

    // File upload handler
    document.getElementById('logo-file-input').addEventListener('change', handleLogoUpload);

    // Drag & drop
    const uploadArea = document.getElementById('logo-upload-area');
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragging'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragging'));
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragging');
      if (e.dataTransfer.files.length) handleLogoFile(e.dataTransfer.files[0]);
    });

    // Save
    document.getElementById('save-logo-btn').addEventListener('click', () => {
      DataManager.updateLogo({
        text: document.getElementById('logo-text').value,
        subtext: {
          tr: document.getElementById('logo-subtext-tr').value,
          en: document.getElementById('logo-subtext-en').value,
          ar: document.getElementById('logo-subtext-ar').value
        }
      });
      showToast('Logo bilgileri kaydedildi!', 'success');
    });

    // Remove
    const removeBtn = document.getElementById('remove-logo-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        DataManager.updateLogo({ url: '' });
        showToast('Logo kaldırıldı.', 'info');
        renderSection('logo');
      });
    }
  }

  function handleLogoUpload(e) {
    if (e.target.files.length) handleLogoFile(e.target.files[0]);
  }

  function handleLogoFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Lütfen bir görsel dosyası seçin.', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Dosya boyutu 2MB\'dan küçük olmalıdır.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      DataManager.updateLogo({ url: e.target.result });
      showToast('Logo yüklendi!', 'success');
      renderSection('logo');
    };
    reader.readAsDataURL(file);
  }

  // ==========================================
  // SCOOTER MANAGEMENT
  // ==========================================
  function renderScootersSection(container) {
    const scooters = DataManager.getScooters();

    container.innerHTML = `
      <div class="admin-panel">
        <div class="admin-panel__header">
          <h3 class="admin-panel__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Scooter Modelleri (${scooters.length})
          </h3>
          <button class="btn btn--primary btn--sm" id="add-scooter-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Yeni Scooter
          </button>
        </div>
        <div class="admin-panel__body" style="padding:0">
          ${scooters.length === 0
            ? `<div class="admin-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <p class="admin-empty__text">Henüz scooter eklenmemiş.</p>
                <button class="btn btn--primary" id="add-first-scooter">İlk Scooter'ı Ekle</button>
              </div>`
            : `<div class="admin-table-wrapper">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Görsel</th>
                      <th>Marka / Model</th>
                      <th>Motor</th>
                      <th>Kapasite</th>
                      <th>Yarım Saatlik</th>
                      <th>Saatlik</th>
                      <th>Günlük</th>
                      <th>Durum</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${scooters.map(s => `
                      <tr>
                        <td><img class="admin-table__image" src="${s.images[0] || 'assets/images/logo.png'}" alt="${s.brand}"></td>
                        <td><strong>${s.brand}</strong><br><span style="color:var(--color-gray-500);font-size:var(--fs-xs)">${s.model.tr}</span></td>
                        <td>${s.powerWatt || s.engineCC || 0}W</td>
                        <td>${s.capacity} kişi</td>
                        <td>₺${s.prices.halfHourly || 0}</td>
                        <td>₺${s.prices.hourly}</td>
                        <td>₺${s.prices.daily}</td>
                        <td><span class="admin-status ${s.active ? 'admin-status--active' : 'admin-status--inactive'}">${s.active ? '● Aktif' : '● Pasif'}</span></td>
                        <td>
                          <div class="admin-table__actions">
                            <button class="admin-table__btn edit-scooter-btn" data-id="${s.id}" title="Düzenle">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="admin-table__btn admin-table__btn--danger delete-scooter-btn" data-id="${s.id}" title="Sil">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>`
          }
        </div>
      </div>
    `;

    // Event listeners
    const addBtn = document.getElementById('add-scooter-btn') || document.getElementById('add-first-scooter');
    if (addBtn) addBtn.addEventListener('click', () => openScooterModal());

    document.querySelectorAll('.edit-scooter-btn').forEach(btn => {
      btn.addEventListener('click', () => openScooterModal(btn.getAttribute('data-id')));
    });

    document.querySelectorAll('.delete-scooter-btn').forEach(btn => {
      btn.addEventListener('click', () => confirmDeleteScooter(btn.getAttribute('data-id')));
    });
  }

  function openScooterModal(scooterId) {
    editingScooterId = scooterId || null;
    const scooter = scooterId ? DataManager.getScooter(scooterId) : null;
    const isEdit = !!scooter;

    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');

    modalTitle.textContent = isEdit ? 'Scooter Düzenle' : 'Yeni Scooter Ekle';

    modalBody.innerHTML = `
      <div class="admin-form__row">
        <div class="admin-form__group">
          <label class="admin-form__label">Marka</label>
          <input class="admin-form__input" type="text" id="scooter-brand" value="${scooter?.brand || ''}" placeholder="Segway / Onvo">
        </div>
        <div class="admin-form__group">
          <label class="admin-form__label">Motor Gücü (Watt)</label>
          <input class="admin-form__input" type="number" id="scooter-watt" value="${scooter?.powerWatt || scooter?.engineCC || ''}" placeholder="1000">
        </div>
      </div>

      <div class="admin-form__row--3" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-4)">
        <div class="admin-form__group">
          <label class="admin-form__label">Model (TR)</label>
          <input class="admin-form__input" type="text" id="scooter-model-tr" value="${scooter?.model?.tr || ''}" placeholder="PCX 125">
        </div>
        <div class="admin-form__group">
          <label class="admin-form__label">Model (EN)</label>
          <input class="admin-form__input" type="text" id="scooter-model-en" value="${scooter?.model?.en || ''}" placeholder="PCX 125">
        </div>
        <div class="admin-form__group">
          <label class="admin-form__label">Model (AR)</label>
          <input class="admin-form__input" type="text" id="scooter-model-ar" value="${scooter?.model?.ar || ''}" placeholder="PCX 125" dir="rtl">
        </div>
      </div>

      <div class="admin-form__group">
        <label class="admin-form__label">Açıklama (TR)</label>
        <textarea class="admin-form__textarea" id="scooter-desc-tr" placeholder="Scooter hakkında kısa açıklama...">${scooter?.description?.tr || ''}</textarea>
      </div>

      <div class="admin-form__row">
        <div class="admin-form__group">
          <label class="admin-form__label">Açıklama (EN)</label>
          <textarea class="admin-form__textarea" id="scooter-desc-en" placeholder="Short description...">${scooter?.description?.en || ''}</textarea>
        </div>
        <div class="admin-form__group">
          <label class="admin-form__label">Açıklama (AR)</label>
          <textarea class="admin-form__textarea" id="scooter-desc-ar" placeholder="وصف قصير..." dir="rtl">${scooter?.description?.ar || ''}</textarea>
        </div>
      </div>

      <div class="admin-form__row">
        <div class="admin-form__group">
          <label class="admin-form__label">Kişi Kapasitesi</label>
          <select class="admin-form__select" id="scooter-capacity">
            <option value="1" ${scooter?.capacity === 1 ? 'selected' : ''}>1 Kişi</option>
            <option value="2" ${!scooter || scooter?.capacity === 2 ? 'selected' : ''}>2 Kişi</option>
          </select>
        </div>
        <div class="admin-form__group">
          <label class="admin-form__label">Öne Çıkan</label>
          <div style="padding-top:var(--space-2)">
            <label class="toggle-switch">
              <input type="checkbox" id="scooter-featured" ${scooter?.featured ? 'checked' : ''}>
              <span class="toggle-switch__slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div class="admin-form__row--3" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-4)">
        <div class="admin-form__group">
          <label class="admin-form__label">Yarım Saatlik Fiyat (₺)</label>
          <input class="admin-form__input" type="number" id="scooter-price-halfhourly" value="${scooter?.prices?.halfHourly || ''}" placeholder="100">
        </div>
        <div class="admin-form__group">
          <label class="admin-form__label">Saatlik Fiyat (₺)</label>
          <input class="admin-form__input" type="number" id="scooter-price-hourly" value="${scooter?.prices?.hourly || ''}" placeholder="150">
        </div>
        <div class="admin-form__group">
          <label class="admin-form__label">Günlük Fiyat (₺)</label>
          <input class="admin-form__input" type="number" id="scooter-price-daily" value="${scooter?.prices?.daily || ''}" placeholder="600">
        </div>
      </div>

      <div class="admin-form__group">
        <label class="admin-form__label">Özellikler (TR — her satıra bir özellik)</label>
        <textarea class="admin-form__textarea" id="scooter-features-tr" placeholder="ABS Fren\nLED Aydınlatma\nUSB Şarj">${(scooter?.features?.tr || []).join('\n')}</textarea>
      </div>

      <div class="admin-form__row">
        <div class="admin-form__group">
          <label class="admin-form__label">Özellikler (EN)</label>
          <textarea class="admin-form__textarea" id="scooter-features-en" placeholder="ABS Brake\nLED Lighting">${(scooter?.features?.en || []).join('\n')}</textarea>
        </div>
        <div class="admin-form__group">
          <label class="admin-form__label">Özellikler (AR)</label>
          <textarea class="admin-form__textarea" id="scooter-features-ar" placeholder="فرامل ABS\nإضاءة LED" dir="rtl">${(scooter?.features?.ar || []).join('\n')}</textarea>
        </div>
      </div>

      <div class="admin-form__group">
        <label class="admin-form__label">Fotoğraflar</label>
        <div class="admin-upload" id="scooter-upload-area">
          <div class="admin-upload__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <p class="admin-upload__text"><strong>Tıklayın</strong> veya sürükleyip bırakın</p>
          <p class="admin-upload__hint">PNG, JPG — max 2MB / fotoğraf</p>
          <input type="file" id="scooter-file-input" accept="image/*" multiple>
        </div>
        <div class="admin-image-preview" id="scooter-images">
          ${(scooter?.images || []).map((img, idx) => `
            <div class="admin-image-preview__item" data-index="${idx}">
              <img src="${img}" alt="Scooter foto ${idx + 1}">
              <button class="admin-image-preview__remove" onclick="this.closest('.admin-image-preview__item').remove()">×</button>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="admin-form__group">
        <label class="admin-form__label">Durum</label>
        <label class="toggle-switch">
          <input type="checkbox" id="scooter-active" ${!scooter || scooter?.active ? 'checked' : ''}>
          <span class="toggle-switch__slider"></span>
        </label>
        <span class="admin-form__hint">${!scooter || scooter?.active ? 'Aktif — sitede görünür' : 'Pasif — sitede görünmez'}</span>
      </div>
    `;

    modalFooter.innerHTML = `
      <button class="btn btn--secondary" id="modal-cancel-btn">İptal</button>
      <button class="btn btn--primary" id="modal-save-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        ${isEdit ? 'Güncelle' : 'Ekle'}
      </button>
    `;

    openModal();

    // File upload for scooter images
    document.getElementById('scooter-file-input').addEventListener('change', handleScooterImageUpload);

    // Drag & drop
    const uploadArea = document.getElementById('scooter-upload-area');
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragging'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragging'));
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragging');
      Array.from(e.dataTransfer.files).forEach(handleScooterFile);
    });

    // Save
    document.getElementById('modal-save-btn').addEventListener('click', saveScooter);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  }

  function handleScooterImageUpload(e) {
    Array.from(e.target.files).forEach(handleScooterFile);
  }

  function handleScooterFile(file) {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Dosya boyutu 2MB\'dan küçük olmalıdır.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById('scooter-images');
      const idx = preview.children.length;
      const div = document.createElement('div');
      div.className = 'admin-image-preview__item';
      div.setAttribute('data-src', e.target.result);
      div.innerHTML = `
        <img src="${e.target.result}" alt="Yeni foto">
        <button class="admin-image-preview__remove" onclick="this.closest('.admin-image-preview__item').remove()">×</button>
      `;
      preview.appendChild(div);
    };
    reader.readAsDataURL(file);
  }

  function saveScooter() {
    const brand = document.getElementById('scooter-brand').value.trim();
    const modelTr = document.getElementById('scooter-model-tr').value.trim();

    if (!brand || !modelTr) {
      showToast('Marka ve model adı zorunludur.', 'error');
      return;
    }

    // Collect images from preview
    const imageElements = document.querySelectorAll('#scooter-images .admin-image-preview__item');
    const images = [];
    imageElements.forEach(el => {
      const img = el.querySelector('img');
      if (img) images.push(el.getAttribute('data-src') || img.src);
    });

    const data = {
      brand: brand,
      model: {
        tr: modelTr,
        en: document.getElementById('scooter-model-en').value.trim() || modelTr,
        ar: document.getElementById('scooter-model-ar').value.trim() || modelTr
      },
      description: {
        tr: document.getElementById('scooter-desc-tr').value.trim(),
        en: document.getElementById('scooter-desc-en').value.trim(),
        ar: document.getElementById('scooter-desc-ar').value.trim()
      },
      powerWatt: parseInt(document.getElementById('scooter-watt').value) || 0,
      capacity: parseInt(document.getElementById('scooter-capacity').value) || 2,
      features: {
        tr: document.getElementById('scooter-features-tr').value.split('\n').map(s => s.trim()).filter(Boolean),
        en: document.getElementById('scooter-features-en').value.split('\n').map(s => s.trim()).filter(Boolean),
        ar: document.getElementById('scooter-features-ar').value.split('\n').map(s => s.trim()).filter(Boolean)
      },
      prices: {
        halfHourly: parseInt(document.getElementById('scooter-price-halfhourly').value) || 0,
        hourly: parseInt(document.getElementById('scooter-price-hourly').value) || 0,
        daily: parseInt(document.getElementById('scooter-price-daily').value) || 0
      },
      images: images,
      active: document.getElementById('scooter-active').checked,
      featured: document.getElementById('scooter-featured').checked
    };

    if (editingScooterId) {
      DataManager.updateScooter(editingScooterId, data);
      showToast('Scooter güncellendi!', 'success');
    } else {
      DataManager.addScooter(data);
      showToast('Yeni scooter eklendi!', 'success');
    }

    closeModal();
    renderSection('scooters');
  }

  function confirmDeleteScooter(id) {
    const scooter = DataManager.getScooter(id);
    if (!scooter) return;

    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');

    modalTitle.textContent = 'Scooter Sil';
    modalBody.innerHTML = `
      <p style="text-align:center;padding:var(--space-4) 0;">
        <strong>${scooter.brand} ${scooter.model.tr}</strong> modelini silmek istediğinize emin misiniz?<br>
        <span style="color:var(--color-error);font-size:var(--fs-sm)">Bu işlem geri alınamaz.</span>
      </p>
    `;
    modalFooter.innerHTML = `
      <button class="btn btn--secondary" id="modal-cancel-btn">İptal</button>
      <button class="btn btn--primary" style="background:var(--color-error)" id="modal-confirm-delete">Sil</button>
    `;

    openModal();

    document.getElementById('modal-confirm-delete').addEventListener('click', () => {
      DataManager.deleteScooter(id);
      showToast('Scooter silindi.', 'info');
      closeModal();
      renderSection('scooters');
    });

    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  }

  // ==========================================
  // PRICING
  // ==========================================
  function renderPricingSection(container) {
    const pricing = DataManager.getPricing();

    container.innerHTML = `
      <div class="admin-panel">
        <div class="admin-panel__header">
          <h3 class="admin-panel__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Genel Fiyat Ayarları
          </h3>
        </div>
        <div class="admin-panel__body">
          <div class="admin-form__row">
            <div class="admin-form__group">
              <label class="admin-form__label">Depozito Miktarı (₺)</label>
              <input class="admin-form__input" type="number" id="deposit-amount" value="${pricing.deposit?.amount || 0}">
            </div>
            <div class="admin-form__group">
              <label class="admin-form__label">Para Birimi Simgesi</label>
              <input class="admin-form__input" type="text" id="currency-symbol" value="${pricing.currency || '₺'}">
            </div>
          </div>

          <div class="admin-form__group">
            <label class="admin-form__label">Depozito Açıklaması (TR)</label>
            <input class="admin-form__input" type="text" id="deposit-desc-tr" value="${pricing.deposit?.description?.tr || ''}">
          </div>
          <div class="admin-form__row">
            <div class="admin-form__group">
              <label class="admin-form__label">Depozito Açıklaması (EN)</label>
              <input class="admin-form__input" type="text" id="deposit-desc-en" value="${pricing.deposit?.description?.en || ''}">
            </div>
            <div class="admin-form__group">
              <label class="admin-form__label">Depozito Açıklaması (AR)</label>
              <input class="admin-form__input" type="text" id="deposit-desc-ar" value="${pricing.deposit?.description?.ar || ''}" dir="rtl">
            </div>
          </div>

          <div class="admin-form__actions">
            <button class="btn btn--primary" id="save-pricing-btn">Kaydet</button>
          </div>
        </div>
      </div>

      <div class="admin-panel">
        <div class="admin-panel__header">
          <h3 class="admin-panel__title">Scooter Fiyatları</h3>
        </div>
        <div class="admin-panel__body" style="padding:0">
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Yarım Saatlik</th>
                  <th>Saatlik</th>
                  <th>Günlük</th>
                </tr>
              </thead>
              <tbody>
                ${DataManager.getScooters().map(s => `
                  <tr>
                    <td><strong>${s.brand} ${s.model.tr}</strong></td>
                    <td>₺${s.prices.halfHourly || 0}</td>
                    <td>₺${s.prices.hourly}</td>
                    <td>₺${s.prices.daily}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <p style="padding:var(--space-4) var(--space-6);font-size:var(--fs-xs);color:var(--color-gray-400)">
            Bireysel scooter fiyatlarını "Scooter Modelleri" bölümünden düzenleyebilirsiniz.
          </p>
        </div>
      </div>
    `;

    document.getElementById('save-pricing-btn').addEventListener('click', () => {
      DataManager.updatePricing({
        currency: document.getElementById('currency-symbol').value,
        deposit: {
          amount: parseInt(document.getElementById('deposit-amount').value) || 0,
          description: {
            tr: document.getElementById('deposit-desc-tr').value,
            en: document.getElementById('deposit-desc-en').value,
            ar: document.getElementById('deposit-desc-ar').value
          }
        }
      });
      showToast('Fiyat ayarları kaydedildi!', 'success');
    });
  }

  // ==========================================
  // PAGE CONTENT MANAGEMENT (Hero & Routes)
  // ==========================================
  function renderPageContentSection(container) {
    const heroImg = DataManager.getHeroImage();
    const routes = DataManager.getRoutes() || [];

    container.innerHTML = `
      <!-- Hero Image Panel -->
      <div class="admin-panel">
        <div class="admin-panel__header">
          <h3 class="admin-panel__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Ana Sayfa Arka Plan Görseli (Hero)
          </h3>
        </div>
        <div class="admin-panel__body">
          <div class="admin-logo-preview" style="max-height: 250px; overflow: hidden; border-radius: var(--radius-md);" id="hero-preview">
            ${heroImg
              ? `<img src="${heroImg}" alt="Hero Görseli" style="width: 100%; height: 200px; object-fit: cover;">`
              : '<p class="admin-logo-preview__placeholder">Varsayılan arka plan (hero-bg.png) kullanılıyor. Özel görsel yüklemek için aşağıdan seçin.</p>'}
          </div>

          <div class="admin-upload" id="hero-upload-area" style="margin-top: var(--space-4);">
            <div class="admin-upload__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <p class="admin-upload__text"><strong>Tıklayın</strong> veya sürükleyip bırakın</p>
            <p class="admin-upload__hint">PNG, JPG — max 3MB (1920x1080 tavsiye edilir)</p>
            <input type="file" id="hero-file-input" accept="image/*">
          </div>

          <div class="admin-form__actions" style="margin-top: var(--space-4);">
            ${heroImg ? '<button class="btn btn--sm" style="color:var(--color-error); border: 1px solid var(--color-error);" id="remove-hero-btn">Özel Görseli Kaldır (Varsayılana Dön)</button>' : ''}
          </div>
        </div>
      </div>

      <!-- Routes Panel -->
      <div class="admin-panel" style="margin-top: var(--space-8);">
        <div class="admin-panel__header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="admin-panel__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            Uzungöl'ü Keşfedin — Rota Kartları (${routes.length})
          </h3>
          <button class="btn btn--primary btn--sm" id="add-route-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Yeni Rota Ekle
          </button>
        </div>
        <div class="admin-panel__body" style="padding:0;">
          <div class="admin-table-wrapper">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Görsel</th>
                  <th>Rota Adı</th>
                  <th>Açıklama</th>
                  <th>Mesafe</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                ${routes.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding: 20px;">Henüz rota eklenmemiş.</td></tr>' : ''}
                ${routes.map(r => `
                  <tr>
                    <td><img class="admin-table__image" src="${r.image || 'assets/images/hero-bg.png'}" alt="${r.name?.tr || ''}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
                    <td><strong>${r.name?.tr || ''}</strong><br><small style="color:var(--color-gray-500)">${r.name?.en || ''}</small></td>
                    <td>${r.description?.tr || ''}</td>
                    <td><span class="card__badge" style="position:static; display:inline-block; background:var(--color-navy);">${r.distance || '~5 km'}</span></td>
                    <td>
                      <div class="admin-table__actions">
                        <button class="admin-table__btn admin-table__btn--edit" onclick="window.editRoute('${r.id}')" title="Düzenle">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="admin-table__btn admin-table__btn--delete" onclick="window.deleteRouteItem('${r.id}')" title="Sil">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Hero Image Events
    document.getElementById('hero-file-input').addEventListener('change', handleHeroImageUpload);
    const uploadArea = document.getElementById('hero-upload-area');
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragging'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragging'));
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragging');
      if (e.dataTransfer.files.length) handleHeroFile(e.dataTransfer.files[0]);
    });

    const removeBtn = document.getElementById('remove-hero-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        DataManager.updateHeroImage('');
        showToast('Özel arka plan kaldırıldı. Varsayılan görsel kullanılacak.', 'info');
        renderSection('pagecontent');
      });
    }

    // Route Events
    document.getElementById('add-route-btn').addEventListener('click', () => showRouteModal(null));
  }

  function handleHeroImageUpload(e) {
    if (e.target.files.length) handleHeroFile(e.target.files[0]);
  }

  function handleHeroFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Lütfen bir görsel dosyası seçin.', 'error');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast('Dosya boyutu 3MB\'dan küçük olmalıdır.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      DataManager.updateHeroImage(e.target.result);
      showToast('Arka plan görseli güncellendi!', 'success');
      renderSection('pagecontent');
    };
    reader.readAsDataURL(file);
  }

  window.editRoute = function(id) {
    showRouteModal(id);
  };

  window.deleteRouteItem = function(id) {
    if (confirm('Bu rotayı silmek istediğinize emin misiniz?')) {
      DataManager.deleteRoute(id);
      showToast('Rota silindi.', 'info');
      renderSection('pagecontent');
    }
  };

  function showRouteModal(routeId = null) {
    const isEdit = !!routeId;
    const routes = DataManager.getRoutes() || [];
    const route = isEdit ? routes.find(r => r.id === routeId) : null;

    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');

    modalTitle.textContent = isEdit ? 'Rotayı Düzenle' : 'Yeni Rota Ekle';

    modalBody.innerHTML = `
      <div class="admin-form__group">
        <label class="admin-form__label">Mesafe (Örn: ~5 km)</label>
        <input class="admin-form__input" type="text" id="route-distance" value="${route?.distance || '~5 km'}">
      </div>

      <div class="admin-form__row" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:var(--space-4);">
        <div class="admin-form__group">
          <label class="admin-form__label">Rota Adı (TR)</label>
          <input class="admin-form__input" type="text" id="route-name-tr" value="${route?.name?.tr || ''}" placeholder="Sultanmurad Yaylası">
        </div>
        <div class="admin-form__group">
          <label class="admin-form__label">Rota Adı (EN)</label>
          <input class="admin-form__input" type="text" id="route-name-en" value="${route?.name?.en || ''}" placeholder="Sultanmurad Plateau">
        </div>
        <div class="admin-form__group">
          <label class="admin-form__label">Rota Adı (AR)</label>
          <input class="admin-form__input" type="text" id="route-name-ar" value="${route?.name?.ar || ''}" placeholder="هضبة سلطان مراد" dir="rtl">
        </div>
      </div>

      <div class="admin-form__row" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:var(--space-4); margin-top:var(--space-4);">
        <div class="admin-form__group">
          <label class="admin-form__label">Açıklama (TR)</label>
          <input class="admin-form__input" type="text" id="route-desc-tr" value="${route?.description?.tr || ''}" placeholder="Bulutların üzerinde eşsiz bir deneyim">
        </div>
        <div class="admin-form__group">
          <label class="admin-form__label">Açıklama (EN)</label>
          <input class="admin-form__input" type="text" id="route-desc-en" value="${route?.description?.en || ''}" placeholder="An experience above the clouds">
        </div>
        <div class="admin-form__group">
          <label class="admin-form__label">Açıklama (AR)</label>
          <input class="admin-form__input" type="text" id="route-desc-ar" value="${route?.description?.ar || ''}" placeholder="تجربة فوق الغيوم" dir="rtl">
        </div>
      </div>

      <div class="admin-form__group" style="margin-top:var(--space-4);">
        <label class="admin-form__label">Rota Fotoğrafı</label>
        <div class="admin-upload" id="route-upload-area">
          <div class="admin-upload__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <p class="admin-upload__text"><strong>Tıklayın</strong> veya fotoğraf seçin</p>
          <p class="admin-upload__hint">PNG, JPG — max 2MB</p>
          <input type="file" id="route-file-input" accept="image/*">
        </div>
        <div class="admin-image-preview" id="route-image-preview" style="margin-top:var(--space-3);">
          ${route?.image ? `<div class="admin-image-preview__item" data-img="${route.image}"><img src="${route.image}" alt="Rota foto"><button class="admin-image-preview__remove" onclick="this.closest('.admin-image-preview__item').remove()">×</button></div>` : ''}
        </div>
      </div>
    `;

    modalFooter.innerHTML = `
      <button class="btn btn--secondary" id="modal-cancel-btn">İptal</button>
      <button class="btn btn--primary" id="modal-save-route-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        ${isEdit ? 'Güncelle' : 'Ekle'}
      </button>
    `;

    openModal();

    document.getElementById('route-file-input').addEventListener('change', (e) => {
      if (e.target.files.length) handleRouteFile(e.target.files[0]);
    });

    const uploadArea = document.getElementById('route-upload-area');
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragging'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragging'));
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragging');
      if (e.dataTransfer.files.length) handleRouteFile(e.dataTransfer.files[0]);
    });

    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-save-route-btn').addEventListener('click', () => {
      const imgEl = document.querySelector('#route-image-preview .admin-image-preview__item');
      const imgVal = imgEl ? imgEl.getAttribute('data-img') : '';

      const routeData = {
        distance: document.getElementById('route-distance').value,
        name: {
          tr: document.getElementById('route-name-tr').value || 'Yeni Rota',
          en: document.getElementById('route-name-en').value || 'New Route',
          ar: document.getElementById('route-name-ar').value || 'مسار جديد'
        },
        description: {
          tr: document.getElementById('route-desc-tr').value,
          en: document.getElementById('route-desc-en').value,
          ar: document.getElementById('route-desc-ar').value
        },
        image: imgVal
      };

      if (isEdit) {
        DataManager.updateRoute(routeId, routeData);
        showToast('Rota güncellendi!', 'success');
      } else {
        DataManager.addRoute(routeData);
        showToast('Yeni rota eklendi!', 'success');
      }
      closeModal();
      renderSection('pagecontent');
    });
  }

  function handleRouteFile(file) {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Dosya boyutu 2MB\'dan küçük olmalıdır.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById('route-image-preview');
      preview.innerHTML = `<div class="admin-image-preview__item" data-img="${e.target.result}"><img src="${e.target.result}" alt="Rota foto"><button class="admin-image-preview__remove" onclick="this.closest('.admin-image-preview__item').remove()">×</button></div>`;
    };
    reader.readAsDataURL(file);
  }

  // ==========================================
  // WORKING HOURS
  // ==========================================
  function renderHoursSection(container) {
    const hours = DataManager.getWorkingHours();
    const dayNames = {
      monday: 'Pazartesi', tuesday: 'Salı', wednesday: 'Çarşamba',
      thursday: 'Perşembe', friday: 'Cuma', saturday: 'Cumartesi', sunday: 'Pazar'
    };

    container.innerHTML = `
      <div class="admin-panel">
        <div class="admin-panel__header">
          <h3 class="admin-panel__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Çalışma Saatleri
          </h3>
        </div>
        <div class="admin-panel__body">
          <div class="admin-hours-grid">
            ${hours.map((h, i) => `
              <div class="admin-hours-row">
                <div class="admin-hours-row__day">${dayNames[h.day]}</div>
                <input class="admin-hours-row__input" type="time" id="hours-open-${i}" value="${h.open}" ${h.closed ? 'disabled' : ''}>
                <input class="admin-hours-row__input" type="time" id="hours-close-${i}" value="${h.close}" ${h.closed ? 'disabled' : ''}>
                <div class="admin-hours-row__toggle">
                  <label class="toggle-switch">
                    <input type="checkbox" id="hours-closed-${i}" ${h.closed ? '' : 'checked'} onchange="
                      document.getElementById('hours-open-${i}').disabled = !this.checked;
                      document.getElementById('hours-close-${i}').disabled = !this.checked;
                    ">
                    <span class="toggle-switch__slider"></span>
                  </label>
                  <span style="font-size:var(--fs-xs)">Açık</span>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="admin-form__actions">
            <button class="btn btn--primary" id="save-hours-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Saatleri Kaydet
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('save-hours-btn').addEventListener('click', () => {
      const updatedHours = hours.map((h, i) => ({
        day: h.day,
        open: document.getElementById(`hours-open-${i}`).value,
        close: document.getElementById(`hours-close-${i}`).value,
        closed: !document.getElementById(`hours-closed-${i}`).checked
      }));
      DataManager.updateWorkingHours(updatedHours);
      showToast('Çalışma saatleri kaydedildi!', 'success');
    });
  }

  // ==========================================
  // CONTACT INFO
  // ==========================================
  function renderContactSection(container) {
    const contact = DataManager.getContact();

    container.innerHTML = `
      <div class="admin-panel">
        <div class="admin-panel__header">
          <h3 class="admin-panel__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            İletişim Bilgileri
          </h3>
        </div>
        <div class="admin-panel__body">
          <div class="admin-form__row">
            <div class="admin-form__group">
              <label class="admin-form__label">WhatsApp Numarası</label>
              <input class="admin-form__input" type="text" id="contact-whatsapp" value="${contact.whatsapp || ''}" placeholder="+905551234567">
              <span class="admin-form__hint">Ülke kodu ile yazın (örn: +905551234567)</span>
            </div>
            <div class="admin-form__group">
              <label class="admin-form__label">Telefon Numarası</label>
              <input class="admin-form__input" type="text" id="contact-phone" value="${contact.phone || ''}" placeholder="+905551234567">
            </div>
          </div>

          <div class="admin-form__group">
            <label class="admin-form__label">E-posta</label>
            <input class="admin-form__input" type="email" id="contact-email" value="${contact.email || ''}" placeholder="info@uzungolscooter.com">
          </div>

          <div class="admin-form__group">
            <label class="admin-form__label">Adres (TR)</label>
            <input class="admin-form__input" type="text" id="contact-address-tr" value="${contact.address?.tr || ''}">
          </div>
          <div class="admin-form__row">
            <div class="admin-form__group">
              <label class="admin-form__label">Adres (EN)</label>
              <input class="admin-form__input" type="text" id="contact-address-en" value="${contact.address?.en || ''}">
            </div>
            <div class="admin-form__group">
              <label class="admin-form__label">Adres (AR)</label>
              <input class="admin-form__input" type="text" id="contact-address-ar" value="${contact.address?.ar || ''}" dir="rtl">
            </div>
          </div>

          <div class="admin-form__group">
            <label class="admin-form__label">Google Maps Embed URL</label>
            <input class="admin-form__input" type="text" id="contact-maps" value="${contact.mapsEmbedUrl || ''}" placeholder="https://www.google.com/maps/embed?pb=...">
            <span class="admin-form__hint">Google Maps'ten "Paylaş → Haritayı yerleştir" seçeneğinden iframe kodundaki src URL'sini yapıştırın.</span>
          </div>

          <div class="admin-form__row">
            <div class="admin-form__group">
              <label class="admin-form__label">Instagram URL</label>
              <input class="admin-form__input" type="text" id="contact-instagram" value="${contact.socialMedia?.instagram || ''}" placeholder="https://instagram.com/...">
            </div>
            <div class="admin-form__group">
              <label class="admin-form__label">Facebook URL</label>
              <input class="admin-form__input" type="text" id="contact-facebook" value="${contact.socialMedia?.facebook || ''}" placeholder="https://facebook.com/...">
            </div>
          </div>

          <div class="admin-form__group">
            <label class="admin-form__label">TikTok URL</label>
            <input class="admin-form__input" type="text" id="contact-tiktok" value="${contact.socialMedia?.tiktok || ''}" placeholder="https://tiktok.com/@...">
          </div>

          <div class="admin-form__actions">
            <button class="btn btn--primary" id="save-contact-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Kaydet
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('save-contact-btn').addEventListener('click', () => {
      DataManager.updateContact({
        whatsapp: document.getElementById('contact-whatsapp').value.trim(),
        phone: document.getElementById('contact-phone').value.trim(),
        email: document.getElementById('contact-email').value.trim(),
        address: {
          tr: document.getElementById('contact-address-tr').value.trim(),
          en: document.getElementById('contact-address-en').value.trim(),
          ar: document.getElementById('contact-address-ar').value.trim()
        },
        mapsEmbedUrl: document.getElementById('contact-maps').value.trim(),
        socialMedia: {
          instagram: document.getElementById('contact-instagram').value.trim(),
          facebook: document.getElementById('contact-facebook').value.trim(),
          tiktok: document.getElementById('contact-tiktok').value.trim()
        }
      });
      showToast('İletişim bilgileri kaydedildi!', 'success');
    });
  }

  // ==========================================
  // BACKUP
  // ==========================================
  function renderBackupSection(container) {
    container.innerHTML = `
      <div class="admin-panel">
        <div class="admin-panel__header">
          <h3 class="admin-panel__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Veri Yedekleme
          </h3>
        </div>
        <div class="admin-panel__body">
          <p style="margin-bottom:var(--space-6);color:var(--color-gray-600);font-size:var(--fs-sm)">
            Tüm site verilerini (scooterlar, fiyatlar, iletişim bilgileri, logo vb.) JSON dosyası olarak dışa aktarın veya önceden alınmış bir yedeği geri yükleyin.
          </p>

          <div style="display:flex;gap:var(--space-4);flex-wrap:wrap">
            <button class="btn btn--primary" id="export-data-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Verileri Dışa Aktar (JSON)
            </button>

            <div style="position:relative">
              <button class="btn btn--navy" id="import-data-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Verileri İçe Aktar (JSON)
              </button>
              <input type="file" id="import-file-input" accept=".json" style="position:absolute;inset:0;opacity:0;cursor:pointer;">
            </div>
          </div>
        </div>
      </div>

      <div class="admin-panel">
        <div class="admin-panel__header">
          <h3 class="admin-panel__title" style="color:var(--color-error)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Tehlikeli Bölge
          </h3>
        </div>
        <div class="admin-panel__body">
          <p style="margin-bottom:var(--space-4);color:var(--color-gray-600);font-size:var(--fs-sm)">
            Tüm verileri fabrika ayarlarına sıfırlayın. Bu işlem geri alınamaz!
          </p>
          <button class="btn btn--sm" style="background:var(--color-error);color:white" id="reset-data-btn">Verileri Sıfırla</button>
        </div>
      </div>

      <div class="admin-panel">
        <div class="admin-panel__header">
          <h3 class="admin-panel__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Şifre Değiştir
          </h3>
        </div>
        <div class="admin-panel__body">
          <div class="admin-form__row">
            <div class="admin-form__group">
              <label class="admin-form__label">Yeni Şifre</label>
              <input class="admin-form__input" type="password" id="new-password" placeholder="Yeni şifre">
            </div>
            <div class="admin-form__group">
              <label class="admin-form__label">Şifreyi Onayla</label>
              <input class="admin-form__input" type="password" id="confirm-password" placeholder="Tekrar girin">
            </div>
          </div>
          <button class="btn btn--secondary" id="change-password-btn">Şifreyi Değiştir</button>
        </div>
      </div>
    `;

    // Export
    document.getElementById('export-data-btn').addEventListener('click', () => {
      const json = DataManager.exportData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `uzungol-scooter-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Veriler dışa aktarıldı!', 'success');
    });

    // Import
    document.getElementById('import-file-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        if (DataManager.importData(ev.target.result)) {
          showToast('Veriler başarıyla içe aktarıldı!', 'success');
          renderSection('backup');
        } else {
          showToast('Geçersiz veri dosyası.', 'error');
        }
      };
      reader.readAsText(file);
    });

    // Reset
    document.getElementById('reset-data-btn').addEventListener('click', () => {
      if (confirm('Tüm verileri sıfırlamak istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
        DataManager.resetToDefaults();
        showToast('Tüm veriler sıfırlandı.', 'info');
        renderSection('dashboard');
      }
    });

    // Change password
    document.getElementById('change-password-btn').addEventListener('click', () => {
      const newPass = document.getElementById('new-password').value;
      const confirmPass = document.getElementById('confirm-password').value;

      if (!newPass || newPass.length < 4) {
        showToast('Şifre en az 4 karakter olmalıdır.', 'error');
        return;
      }
      if (newPass !== confirmPass) {
        showToast('Şifreler eşleşmiyor.', 'error');
        return;
      }

      DataManager.updatePassword(newPass);
      showToast('Şifre değiştirildi!', 'success');
      document.getElementById('new-password').value = '';
      document.getElementById('confirm-password').value = '';
    });
  }

  // ==========================================
  // MODAL
  // ==========================================
  function initModal() {
    const backdrop = document.getElementById('modal-backdrop');
    const closeBtn = document.getElementById('modal-close');

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  function openModal() {
    document.getElementById('modal-backdrop').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('modal-backdrop').classList.remove('open');
    document.body.style.overflow = '';
    editingScooterId = null;
  }

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    const toast = document.createElement('div');
    toast.className = `admin-toast admin-toast--${type}`;
    toast.innerHTML = `
      <span class="admin-toast__icon">${icons[type] || icons.info}</span>
      <span>${message}</span>
      <button class="admin-toast__close" onclick="this.closest('.admin-toast').remove()">✕</button>
    `;

    container.appendChild(toast);

    // Auto-dismiss after 4s
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'fadeIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4000);
  }

})();
