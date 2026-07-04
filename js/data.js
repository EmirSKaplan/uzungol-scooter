/* ============================================
   UZUNGÖL SCOOTER — DATA MANAGER
   Firebase Firestore + localStorage fallback
   ============================================ */

const DataManager = (function () {
  'use strict';

  const STORAGE_KEY = 'uzungol_scooter_data';
  const VERSION = '1.3.0';

  // ==========================================
  // DEFAULT DATA (Initial Seed)
  // ==========================================
  const DEFAULT_DATA = {
    version: VERSION,
    settings: {
      heroImage: '',
      logo: {
        url: '',
        text: 'Uzungöl Scooter',
        subtext: { tr: 'Scooter Kiralama', en: 'Scooter Rental', ar: 'تأجير سكوتر' }
      },
      contact: {
        whatsapp: '+905400270161',
        phone: '+905400270161',
        email: 'akyz40908@gmail.com',
        address: {
          tr: 'Uzungöl Mahallesi, Çaykara, Trabzon',
          en: 'Uzungöl District, Çaykara, Trabzon',
          ar: 'حي أوزونغول، تشايكارا، طرابزون'
        },
        socialMedia: {
          instagram: '',
          facebook: '',
          tiktok: ''
        },
        mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3020.123!2d40.2875!3d40.6175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDM3JzAzLjAiTiA0MMKwMTcnMTUuMCJF!5e0!3m2!1str!2str!4v1234567890'
      },
      workingHours: [
        { day: 'monday', open: '09:00', close: '21:00', closed: false },
        { day: 'tuesday', open: '09:00', close: '21:00', closed: false },
        { day: 'wednesday', open: '09:00', close: '21:00', closed: false },
        { day: 'thursday', open: '09:00', close: '21:00', closed: false },
        { day: 'friday', open: '09:00', close: '21:00', closed: false },
        { day: 'saturday', open: '09:00', close: '22:00', closed: false },
        { day: 'sunday', open: '09:00', close: '22:00', closed: false }
      ],
      adminPassword: 'admin123' // Simple password — change in admin panel
    },
    scooters: [
      {
        id: 'scooter-1',
        brand: 'Segway Ninebot',
        model: { tr: 'Max G2', en: 'Max G2', ar: 'Max G2' },
        description: {
          tr: 'Uzun menzilli ve hidrolik süspansiyonlu konforlu elektrikli scooter. Uzungöl yolları için ideal.',
          en: 'Long-range comfortable electric scooter with hydraulic suspension. Ideal for Uzungöl roads.',
          ar: 'سكوتر كهربائي مريح طويل المدى مع نظام تعليق هيدروليكي. مثالي لطرق أوزونغول.'
        },
        powerWatt: 1000,
        capacity: 1,
        features: {
          tr: ['70 km Menzil', 'Çift Süspansiyon', 'Apple Find My', 'Kaymaz Lastik'],
          en: ['70 km Range', 'Dual Suspension', 'Apple Find My', 'Anti-skid Tires'],
          ar: ['مدى 70 كم', 'تعليق مزدوج', 'تتبع Apple', 'إطارات مانعة للانزلاق']
        },
        prices: { halfHourly: 100, hourly: 150, daily: 600 },
        images: [],
        active: true,
        order: 0,
        featured: true
      },
      {
        id: 'scooter-2',
        brand: 'Onvo',
        model: { tr: 'OV-012 Pro', en: 'OV-012 Pro', ar: 'OV-012 Pro' },
        description: {
          tr: 'Çift motorlu yüksek tork gücü. Yokuşlarda ve engebeli arazide üstün performans.',
          en: 'Dual motor high torque power. Superior performance on hills and rough terrain.',
          ar: 'محرك مزدوج بعزم دوران عالي. أداء فائق على التلال والطرق الوعرة.'
        },
        powerWatt: 1600,
        capacity: 1,
        features: {
          tr: ['Çift Motor', 'Geniş Off-Road Lastik', 'Disk Fren', 'LCD Ekran'],
          en: ['Dual Motor', 'Wide Off-Road Tires', 'Disc Brake', 'LCD Display'],
          ar: ['محرك مزدوج', 'إطارات طرق وعرة', 'فرامل قرصية', 'شاشة LCD']
        },
        prices: { halfHourly: 130, hourly: 200, daily: 800 },
        images: [],
        active: true,
        order: 1,
        featured: true
      },
      {
        id: 'scooter-3',
        brand: 'Xiaomi',
        model: { tr: 'Electric Scooter 4 Pro', en: 'Electric Scooter 4 Pro', ar: 'Electric Scooter 4 Pro' },
        description: {
          tr: 'Hafif, şık ve kolay kullanımlı. Göl etrafında keyifli ve akıcı bir sürüş.',
          en: 'Lightweight, stylish, and easy to use. A pleasant and smooth ride around the lake.',
          ar: 'خفيف الوزن، أنيق وسهل الاستخدام. جولة ممتعة وسلسة حول البحيرة.'
        },
        powerWatt: 700,
        capacity: 1,
        features: {
          tr: ['Manyetik Şarj', 'E-ABS Fren', '10 İnç Lastik', 'Kinetik Geri Kazanım'],
          en: ['Magnetic Charge', 'E-ABS Brake', '10 Inch Tires', 'Kinetic Recovery'],
          ar: ['شحن مغناطيسي', 'فرامل E-ABS', 'إطارات 10 بوصة', 'استعادة الطاقة']
        },
        prices: { halfHourly: 80, hourly: 120, daily: 500 },
        images: [],
        active: true,
        order: 2,
        featured: true
      },
      {
        id: 'scooter-4',
        brand: 'Kugoo Kirin',
        model: { tr: 'G3 Elektrikli', en: 'G3 Electric', ar: 'G3 الكهربائي' },
        description: {
          tr: 'Sportif ve dinamik e-scooter. Dokunmatik ekran ve güçlü motor desteği.',
          en: 'Sporty and dynamic e-scooter. Touchscreen display and powerful motor support.',
          ar: 'سكوتر كهربائي رياضي وديناميكي. شاشة تعمل باللمس ودعم محرك قوي.'
        },
        powerWatt: 1200,
        capacity: 1,
        features: {
          tr: ['Dokunmatik Ekran', '1200W Fırçasız Motor', 'TPU Süspansiyon', 'LED Far'],
          en: ['Touchscreen', '1200W Brushless Motor', 'TPU Suspension', 'LED Headlight'],
          ar: ['شاشة لمس', 'محرك 1200 واط', 'تعليق TPU', 'كشاف LED']
        },
        prices: { halfHourly: 120, hourly: 180, daily: 700 },
        images: [],
        active: true,
        order: 3,
        featured: false
      }
    ],
    pricing: {
      currency: '₺',
      deposit: {
        amount: 500,
        description: {
          tr: 'Kiralama başlangıcında alınır, scooter hasarsız teslim edildiğinde iade edilir.',
          en: 'Collected at the start of rental, refunded when the scooter is returned undamaged.',
          ar: 'يتم تحصيلها في بداية الإيجار، وتُعاد عند إرجاع السكوتر بدون ضرر.'
        }
      },
      extras: [],
      rules: {
        tr: [
          'Ücret nakit veya kredi kartı ile alınır.',
          'Hasar durumunda hasar kullanıcıdan tahsil edilir.',
          'Alkollü scooter kullanımı kesinlikle yasaktır.',
          'Scooter yalnızca Uzungöl ve çevresinde kullanılmalıdır.'
        ],
        en: [
          'Payment is collected in cash or credit card.',
          'In case of damage, the damage will be confiscated by the user',
          'Riding under the influence of alcohol is strictly prohibited.',
          'The scooter should only be used in and around Uzungöl.'
        ],
        ar: [
          'يتم تحصيل الدفع نقدًا أو ببطاقة الائتمان.',
          'في حالة حدوث تلف، يتحمل المستخدم مسؤولية الأضرار.',
          'يُمنع منعًا باتًا القيادة تحت تأثير الكحول.',
          'يجب استخدام السكوتر فقط في أوزنجول وما حولها.'
        ]
      }
    },
    routes: [
      {
        id: 'route-1',
        name: { tr: 'Uzungöl Göl Turu', en: 'Uzungöl Lake Tour', ar: 'جولة بحيرة أوزونغول' },
        description: { tr: 'Gölün etrafında muhteşem bir tur', en: 'A stunning tour around the lake', ar: 'جولة رائعة حول البحيرة' },
        distance: '~5 km',
        image: 'assets/images/hero-bg.png'
      },
      {
        id: 'route-2',
        name: { tr: 'Sultanmurad Yaylası', en: 'Sultanmurad Plateau', ar: 'هضبة سلطان مراد' },
        description: { tr: 'Bulutların üzerinde bir deneyim', en: 'An experience above the clouds', ar: 'تجربة فوق الغيوم' },
        distance: '~25 km',
        image: 'assets/images/sultanmurad.png'
      },
      {
        id: 'route-3',
        name: { tr: 'Demirkapı Yaylası', en: 'Demirkapı Plateau', ar: 'هضبة دميركابي' },
        description: { tr: 'Doğanın kalbinde eşsiz manzaralar', en: 'Unique views in the heart of nature', ar: 'مناظر فريدة في قلب الطبيعة' },
        distance: '~18 km',
        image: 'assets/images/demirkapi.png'
      }
    ]
  };

  // ==========================================
  // FIREBASE CONFIG (to be filled by user)
  // ==========================================
  let firebaseApp = null;
  let firebaseDb = null;
  let firebaseAuth = null;
  let useFirebase = false;

  // ==========================================
  // INTERNAL HELPERS
  // ==========================================
  function generateId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function getLocalData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('DataManager: Failed to read localStorage', e);
    }
    return null;
  }

  function saveLocalData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('DataManager: Failed to save to localStorage', e);
    }
  }

  function getData() {
    let data = getLocalData();
    if (!data) {
      data = deepClone(DEFAULT_DATA);
      saveLocalData(data);
    } else if (data.version !== VERSION) {
      // Overwrite default seed scooters with updated prices and electric models
      if (data.scooters && data.scooters[0] && (data.scooters[0].brand === 'Honda' || data.scooters[0].prices.halfHourly === undefined)) {
        data.scooters = deepClone(DEFAULT_DATA).scooters;
      }
      // Migrate any other scooters
      if (data.scooters) {
        data.scooters.forEach(s => {
          if (s.powerWatt === undefined && s.engineCC !== undefined) {
            s.powerWatt = s.engineCC < 300 ? s.engineCC * 8 : s.engineCC;
            delete s.engineCC;
          }
          if (s.prices) {
            if (s.prices.halfHourly === undefined) {
              s.prices.halfHourly = Math.round((s.prices.hourly || 150) * 0.65);
            }
            if (s.prices.weekly !== undefined) {
              delete s.prices.weekly;
            }
          }
        });
      }
      // Remove fuel, helmet, insurance extras if they exist
      if (data.pricing && data.pricing.extras) {
        data.pricing.extras = data.pricing.extras.filter(e => e.id !== 'helmet' && e.id !== 'insurance' && e.id !== 'fuel');
      }
      // Overwrite rules with updated clean rules
      if (data.pricing) {
        data.pricing.rules = deepClone(DEFAULT_DATA).pricing.rules;
      }
      // Ensure routes have default images if empty
      if (data.routes) {
        data.routes.forEach(r => {
          if (!r.image) {
            if (r.id === 'route-2') r.image = 'assets/images/sultanmurad.png';
            else if (r.id === 'route-3') r.image = 'assets/images/demirkapi.png';
            else r.image = 'assets/images/hero-bg.png';
          }
        });
      }
      data.version = VERSION;
      saveLocalData(data);
    }
    // Also check on normal load if routes have empty image
    if (data.routes) {
      data.routes.forEach(r => {
        if (!r.image) {
          if (r.id === 'route-2') r.image = 'assets/images/sultanmurad.png';
          else if (r.id === 'route-3') r.image = 'assets/images/demirkapi.png';
          else r.image = 'assets/images/hero-bg.png';
        }
      });
    }
    return data;
  }

  function updateData(updater) {
    const data = getData();
    updater(data);
    saveLocalData(data);

    // If Firebase is configured, sync
    if (useFirebase && firebaseDb) {
      syncToFirebase(data);
    }

    return data;
  }

  // ==========================================
  // FIREBASE SYNC (when configured)
  // ==========================================
  async function syncToFirebase(data) {
    if (!firebaseDb) return;
    try {
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      await setDoc(doc(firebaseDb, 'config', 'siteData'), data);
    } catch (e) {
      console.warn('DataManager: Firebase sync failed', e);
    }
  }

  async function loadFromFirebase() {
    if (!firebaseDb) return null;
    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const snap = await getDoc(doc(firebaseDb, 'config', 'siteData'));
      if (snap.exists()) {
        return snap.data();
      }
    } catch (e) {
      console.warn('DataManager: Firebase load failed', e);
    }
    return null;
  }

  // ==========================================
  // PUBLIC API
  // ==========================================
  return {
    // Initialize — call once on page load
    async init(firebaseConfig) {
      if (firebaseConfig && firebaseConfig.apiKey) {
        try {
          const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
          const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
          const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');

          firebaseApp = initializeApp(firebaseConfig);
          firebaseDb = getFirestore(firebaseApp);
          firebaseAuth = getAuth(firebaseApp);
          useFirebase = true;

          // Try loading from Firebase first
          const fbData = await loadFromFirebase();
          if (fbData) {
            saveLocalData(fbData);
            console.log('DataManager: Loaded data from Firebase');
          } else {
            // First run — push local data to Firebase
            const localData = getData();
            await syncToFirebase(localData);
            console.log('DataManager: Initialized Firebase with default data');
          }
        } catch (e) {
          console.warn('DataManager: Firebase init failed, using localStorage only', e);
          useFirebase = false;
        }
      }
    },

    // Get Firebase Auth instance
    getAuth() {
      return firebaseAuth;
    },

    isFirebaseEnabled() {
      return useFirebase;
    },

    // --- SETTINGS ---
    getSettings() {
      return getData().settings;
    },

    updateSettings(updates) {
      return updateData(data => {
        Object.assign(data.settings, updates);
      }).settings;
    },

    getLogo() {
      return getData().settings.logo;
    },

    updateLogo(logoData) {
      return updateData(data => {
        Object.assign(data.settings.logo, logoData);
      }).settings.logo;
    },

    getContact() {
      return getData().settings.contact;
    },

    updateContact(contactData) {
      return updateData(data => {
        Object.assign(data.settings.contact, contactData);
      }).settings.contact;
    },

    getWorkingHours() {
      return getData().settings.workingHours;
    },

    updateWorkingHours(hours) {
      return updateData(data => {
        data.settings.workingHours = hours;
      }).settings.workingHours;
    },

    // --- SCOOTERS ---
    getScooters(activeOnly = false) {
      const scooters = getData().scooters;
      const filtered = activeOnly ? scooters.filter(s => s.active) : scooters;
      return filtered.sort((a, b) => a.order - b.order);
    },

    getFeaturedScooters() {
      return getData().scooters
        .filter(s => s.active && s.featured)
        .sort((a, b) => a.order - b.order);
    },

    getScooter(id) {
      return getData().scooters.find(s => s.id === id) || null;
    },

    addScooter(scooterData) {
      const scooter = {
        id: generateId(),
        brand: '',
        model: { tr: '', en: '', ar: '' },
        description: { tr: '', en: '', ar: '' },
        powerWatt: 0,
        capacity: 1,
        features: { tr: [], en: [], ar: [] },
        prices: { halfHourly: 0, hourly: 0, daily: 0 },
        images: [],
        active: true,
        order: getData().scooters.length,
        featured: false,
        ...scooterData
      };

      updateData(data => {
        data.scooters.push(scooter);
      });

      return scooter;
    },

    updateScooter(id, updates) {
      let updated = null;
      updateData(data => {
        const idx = data.scooters.findIndex(s => s.id === id);
        if (idx !== -1) {
          Object.assign(data.scooters[idx], updates);
          updated = data.scooters[idx];
        }
      });
      return updated;
    },

    deleteScooter(id) {
      updateData(data => {
        data.scooters = data.scooters.filter(s => s.id !== id);
      });
    },

    reorderScooters(orderedIds) {
      updateData(data => {
        orderedIds.forEach((id, index) => {
          const scooter = data.scooters.find(s => s.id === id);
          if (scooter) scooter.order = index;
        });
      });
    },

    // --- PRICING ---
    getPricing() {
      return getData().pricing;
    },

    updatePricing(pricingData) {
      return updateData(data => {
        Object.assign(data.pricing, pricingData);
      }).pricing;
    },

    // --- ROUTES ---
    getRoutes() {
      return getData().routes;
    },

    updateRoute(id, updates) {
      let updated = null;
      updateData(data => {
        const idx = data.routes.findIndex(r => r.id === id);
        if (idx !== -1) {
          Object.assign(data.routes[idx], updates);
          updated = data.routes[idx];
        }
      });
      return updated;
    },

    addRoute(routeData) {
      const route = {
        id: generateId(),
        name: { tr: '', en: '', ar: '' },
        description: { tr: '', en: '', ar: '' },
        distance: '',
        image: '',
        ...routeData
      };
      updateData(data => {
        data.routes.push(route);
      });
      return route;
    },

    deleteRoute(id) {
      updateData(data => {
        data.routes = data.routes.filter(r => r.id !== id);
      });
    },

    // --- HERO IMAGE ---
    getHeroImage() {
      return getData().settings.heroImage || '';
    },

    updateHeroImage(imageData) {
      return updateData(data => {
        data.settings.heroImage = imageData;
      }).settings.heroImage;
    },

    // --- EXPORT / IMPORT ---
    exportData() {
      return JSON.stringify(getData(), null, 2);
    },

    importData(jsonString) {
      try {
        const data = JSON.parse(jsonString);
        if (data.version && data.settings && data.scooters) {
          saveLocalData(data);
          if (useFirebase && firebaseDb) {
            syncToFirebase(data);
          }
          return true;
        }
        return false;
      } catch (e) {
        console.error('DataManager: Import failed', e);
        return false;
      }
    },

    resetToDefaults() {
      const data = deepClone(DEFAULT_DATA);
      saveLocalData(data);
      if (useFirebase && firebaseDb) {
        syncToFirebase(data);
      }
      return data;
    },

    // --- AUTH ---
    validatePassword(password) {
      return password === getData().settings.adminPassword;
    },

    updatePassword(newPassword) {
      updateData(data => {
        data.settings.adminPassword = newPassword;
      });
    }
  };
})();

// Make available globally
if (typeof window !== 'undefined') {
  window.DataManager = DataManager;
}
