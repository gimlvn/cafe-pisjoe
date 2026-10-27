// Navigasi mobile
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', isOpen);
  menuToggle.setAttribute('aria-label', isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi');
});

// Tutup navigasi setelah salah satu tautan dipilih
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Buka menu navigasi');
  });
});

// Tahun footer mengikuti tahun saat ini
document.querySelector('#year').textContent = new Date().getFullYear();

// Tema awal ditentukan lebih awal di head; pilihan manual disimpan di browser.
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = themeToggle.querySelector('.theme-toggle-icon');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function setTheme(theme, savePreference = false) {
  const isDark = theme === 'dark';
  const activeTheme = isDark ? 'dark' : 'light';
  document.documentElement.dataset.theme = activeTheme;
  document.documentElement.style.colorScheme = activeTheme;
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
  themeIcon.textContent = isDark ? String.fromCodePoint(0x1f319) : String.fromCodePoint(0x2600, 0xfe0f);
  if (themeColorMeta) themeColorMeta.content = isDark ? '#1b2520' : '#fff4dc';

  if (savePreference) {
    try {
      localStorage.setItem('ice-pisjoe-theme', activeTheme);
    } catch {
      // Tema tetap berubah untuk sesi ini jika penyimpanan browser tidak tersedia.
    }
  }
}

setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
themeToggle.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme, true);
});

// Tambahkan nama file ke daftar ini untuk menambah banner promo.
const promoTrigger = document.querySelector('.promo-trigger');
const reservationFloat = document.querySelector('.reservation-float');
const promoHint = document.querySelector('.promo-hint');
const promoOverlay = document.querySelector('#promo-overlay');
const promoDialog = promoOverlay.querySelector('.promo-dialog');
const promoClose = promoOverlay.querySelector('.promo-close');
const promoTrack = promoOverlay.querySelector('[data-promo-track]');
const promoDots = promoOverlay.querySelector('.promo-slider-dots');
const promoPosition = promoOverlay.querySelector('.promo-slider-position');
const promoPrevious = promoOverlay.querySelector('.promo-slider-prev');
const promoNext = promoOverlay.querySelector('.promo-slider-next');
const promoBanners = [
  'images/promo-banner.jpg',
  'images/promo-banner-2.jpg'
];
let savedScrollStyles = null;
let promoHintHideTimer = null;
let activePromoIndex = 0;
const promoSlides = [];

function hidePromoHint() {
  window.clearTimeout(promoHintHideTimer);
  promoHintHideTimer = null;
  promoHint.classList.remove('is-visible');
  promoHint.setAttribute('aria-hidden', 'true');
}

function showPromoHint() {
  if (promoOverlay.classList.contains('is-open') || document.visibilityState === 'hidden') return;

  promoHint.classList.add('is-visible');
  promoHint.setAttribute('aria-hidden', 'false');
  promoHintHideTimer = window.setTimeout(hidePromoHint, 5500);
}

// Tampilkan bubble sesaat setelah halaman siap, lalu satu kali lagi setelah jeda panjang.
window.addEventListener('load', () => {
  window.setTimeout(showPromoHint, 2500);
  window.setTimeout(showPromoHint, 45000);
}, { once: true });

function buildPromoSlider() {
  promoBanners.forEach((bannerImage, index) => {
    const slide = document.createElement('div');
    slide.className = 'promo-banner-slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `Banner ${index + 1} dari ${promoBanners.length}`);
    slide.setAttribute('aria-hidden', 'true');

    const image = document.createElement('img');
    image.className = 'promo-banner-image';
    image.dataset.src = bannerImage;
    image.alt = `Banner promo ${index + 1} ICE PISJOE`;
    image.hidden = true;
    image.decoding = 'async';

    const placeholder = document.createElement('div');
    placeholder.className = 'promo-banner-placeholder';
    placeholder.setAttribute('role', 'img');
    placeholder.setAttribute('aria-label', `Placeholder banner promo ${index + 1}`);
    placeholder.hidden = true;

    const placeholderTitle = document.createElement('strong');
    placeholderTitle.textContent = `PLACEHOLDER BANNER PROMO ${index + 1}`;
    const placeholderNote = document.createElement('small');
    placeholderNote.textContent = `Simpan gambar sebagai ${bannerImage}`;
    placeholder.append(placeholderTitle, placeholderNote);

    image.addEventListener('load', () => {
      image.hidden = false;
      placeholder.hidden = true;
      image.dataset.loaded = 'true';
    });
    image.addEventListener('error', () => {
      image.hidden = true;
      placeholder.hidden = false;
      image.dataset.failed = 'true';
    });

    slide.append(image, placeholder);
    promoTrack.append(slide);
    promoSlides.push({ slide, image, placeholder });

    const dot = document.createElement('button');
    dot.className = 'promo-slider-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Tampilkan banner promo ${index + 1}`);
    dot.addEventListener('click', () => updatePromoSlider(index));
    promoDots.append(dot);
  });
}

function loadPromoBanner(index) {
  const { image, placeholder } = promoSlides[index];
  if (image.dataset.loaded === 'true') {
    image.hidden = false;
    placeholder.hidden = true;
    return;
  }
  if (image.dataset.requested === 'true') return;

  image.dataset.requested = 'true';
  image.src = image.dataset.src;
  if (image.complete) {
    if (image.naturalWidth > 0) {
      image.hidden = false;
      placeholder.hidden = true;
      image.dataset.loaded = 'true';
    } else {
      image.hidden = true;
      placeholder.hidden = false;
      image.dataset.failed = 'true';
    }
  }
}

function updatePromoSlider(index, { resetMotion = false } = {}) {
  activePromoIndex = (index + promoBanners.length) % promoBanners.length;
  if (resetMotion) promoTrack.classList.add('is-resetting');
  promoTrack.style.transform = `translateX(-${activePromoIndex * 100}%)`;

  promoSlides.forEach(({ slide }, slideIndex) => {
    slide.setAttribute('aria-hidden', String(slideIndex !== activePromoIndex));
    slide.classList.toggle('is-active', slideIndex === activePromoIndex);
  });
  [...promoDots.children].forEach((dot, dotIndex) => {
    if (dotIndex === activePromoIndex) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
  promoPosition.textContent = `${activePromoIndex + 1} / ${promoBanners.length}`;
  loadPromoBanner(activePromoIndex);

  if (resetMotion) {
    promoTrack.getBoundingClientRect();
    requestAnimationFrame(() => promoTrack.classList.remove('is-resetting'));
  }
}

buildPromoSlider();
promoPrevious.addEventListener('click', () => updatePromoSlider(activePromoIndex - 1));
promoNext.addEventListener('click', () => updatePromoSlider(activePromoIndex + 1));

let promoSwipeStart = null;
promoTrack.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  promoSwipeStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  promoTrack.setPointerCapture(event.pointerId);
});
promoTrack.addEventListener('pointerup', (event) => {
  if (!promoSwipeStart || promoSwipeStart.id !== event.pointerId) return;
  const deltaX = event.clientX - promoSwipeStart.x;
  const deltaY = event.clientY - promoSwipeStart.y;
  promoSwipeStart = null;
  if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) return;
  updatePromoSlider(activePromoIndex + (deltaX < 0 ? 1 : -1));
});
promoTrack.addEventListener('pointercancel', () => { promoSwipeStart = null; });

function openPromo() {
  if (promoOverlay.classList.contains('is-open')) return;

  hidePromoHint();
  promoTrigger.classList.add('is-paused');
  reservationFloat?.classList.add('is-paused');
  updatePromoSlider(0, { resetMotion: true });

  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  const bodyPaddingRight = Number.parseFloat(getComputedStyle(document.body).paddingRight) || 0;
  savedScrollStyles = {
    htmlOverflow: document.documentElement.style.overflow,
    bodyOverflow: document.body.style.overflow,
    bodyPaddingRight: document.body.style.paddingRight
  };
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  if (scrollbarWidth > 0) document.body.style.paddingRight = `${bodyPaddingRight + scrollbarWidth}px`;

  promoOverlay.setAttribute('aria-hidden', 'false');
  promoOverlay.classList.add('is-open');
  promoTrigger.setAttribute('aria-expanded', 'true');
  promoClose.focus();
}

function closePromo() {
  if (!promoOverlay.classList.contains('is-open')) return;

  promoOverlay.classList.remove('is-open');
  promoTrigger.classList.remove('is-paused');
  reservationFloat?.classList.remove('is-paused');
  promoOverlay.setAttribute('aria-hidden', 'true');
  promoTrigger.setAttribute('aria-expanded', 'false');
  if (savedScrollStyles) {
    document.documentElement.style.overflow = savedScrollStyles.htmlOverflow;
    document.body.style.overflow = savedScrollStyles.bodyOverflow;
    document.body.style.paddingRight = savedScrollStyles.bodyPaddingRight;
    savedScrollStyles = null;
  }
  promoTrigger.focus();
}

promoTrigger.addEventListener('click', openPromo);
promoClose.addEventListener('click', closePromo);
document.addEventListener('keydown', (event) => {
  if (!promoOverlay.classList.contains('is-open')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closePromo();
    return;
  }
  if (event.key !== 'Tab') return;

  const focusable = [...promoDialog.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')];
  if (!focusable.length) {
    event.preventDefault();
    promoDialog.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

// Data menu dan harga terpusat di sini. Tambahkan foto ke images/ dengan nama pada properti image.
const menuData = {
  drinks: [
    { name: 'Pisjoe Original', description: 'Es pisang ijo dengan cita rasa khas dan segar.', image: 'images/pisjoe-original.jpg', price: 20000 },
    { name: 'Pisjoe Choco', description: 'Es pisang ijo dengan sentuhan cokelat.', image: 'images/pisjoe-choco.jpg', price: 23000 },
    { name: 'Pisjoe Cheese', description: 'Es pisang ijo dengan topping keju.', image: 'images/pisjoe-cheese.jpg', price: 28000 },
    { name: 'Pisjoe Oreo', description: 'Es pisang ijo dengan topping Oreo.', image: 'images/pisjoe-oreo.jpg', price: 23000 },
    { name: 'Pisjoe Milo', description: 'Es pisang ijo dengan taburan Milo.', image: 'images/pisjoe-milo.jpg', price: 23000 },
    { name: 'Pisjoe Biscoff', description: 'Es pisang ijo dengan topping Biscoff.', image: 'images/pisjoe-biscoff.jpg', price: 25000 },
    { name: 'Pisjoe Cereal', description: 'Es pisang ijo dengan topping sereal.', image: 'images/pisjoe-cereal.jpg', price: 25000 },
    { name: 'Pisjoe Special', description: 'Es pisang ijo dengan kombinasi topping spesial.', image: 'images/pisjoe-special.jpg', price: 30000 }
  ],
  foods: [
    { name: 'Pisang Crispy Coklat', description: 'Pisang crispy dengan saus cokelat dan meses.', image: 'images/pisang-coklat.jpg', price: 25000 },
    { name: 'Pisang Crispy Keju', description: 'Pisang crispy dengan susu dan keju parut.', image: 'images/pisang-keju.jpg', price: 27000 },
    { name: 'Pisang Crispy Choco Cheese', description: 'Pisang crispy dengan perpaduan cokelat dan keju.', image: 'images/pisang-choco-cheese.jpg', price: 30000 },
    { name: 'Pisang Crispy Oreo', description: 'Pisang crispy dengan saus cokelat dan remahan Oreo.', image: 'images/pisang-oreo.jpg', price: 28000 },
    { name: 'Pisang Crispy Milo', description: 'Pisang crispy dengan taburan Milo.', image: 'images/pisang-milo.jpg', price: 25000 },
    { name: 'Pisang Crispy Biscoff', description: 'Pisang crispy dengan topping Biscoff.', image: 'images/pisang-biscoff.jpg', price: 30000 },
    { name: 'Pisang Crispy Caramel', description: 'Pisang crispy dengan saus karamel dan kayu manis.', image: 'images/pisang-caramel.jpg', price: 27000 },
    { name: 'Pisang Crispy Matcha', description: 'Pisang crispy dengan saus matcha dan cokelat putih.', image: 'images/pisang-matcha.jpg', price: 30000 },
    { name: 'Pisang Crispy Kacang', description: 'Pisang crispy dengan topping kacang.', image: 'images/pisang-kacang.jpg', price: 27000 },
    { name: 'Pisang Crispy Original', description: 'Pisang crispy dengan cita rasa original.', image: 'images/pisang-crispy-original.jpg', price: 25000 },
    { name: 'Pisang Roti', description: 'Olahan pisang dengan roti.', image: 'images/pisang-roti.jpg', price: 28000 },
    { name: 'Pisang Pancake', description: 'Pancake dengan olahan pisang.', image: 'images/pisang-pancake.jpg', price: 30000 },
    { name: 'Pisjoe Crispy Box', description: 'Menu andalan ICE PISJOE dalam sajian crispy box.', image: 'images/pisjoe-crispy-box.jpg', price: 35000 }
  ]
};

const menuIndexes = { drinks: 0, foods: 0 };

function renderMenuSlider(type) {
  const items = menuData[type];
  const slide = document.querySelector(`[data-menu-slide="${type}"]`);
  const position = document.querySelector(`[data-menu-position="${type}"]`);
  const slider = document.querySelector(`[data-menu-slider="${type}"]`);
  const item = items[menuIndexes[type]];
  position.textContent = `${items.length ? menuIndexes[type] + 1 : 0}/${items.length}`;
  slide.replaceChildren();
  const previousButton = slider.querySelector('.menu-prev');
  const nextButton = slider.querySelector('.menu-next');

  if (!item) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'menu-empty';
    emptyMessage.textContent = 'Menu belum tersedia.';
    slide.append(emptyMessage);
    previousButton.disabled = true;
    nextButton.disabled = true;
    return;
  }

  const imageWrap = document.createElement('div');
  imageWrap.className = 'menu-slide-image';
  imageWrap.setAttribute('role', 'img');
  imageWrap.setAttribute('aria-label', `Foto ${item.name}: segera hadir`);
  const fallback = document.createElement('div');
  fallback.className = 'menu-photo-placeholder';
  fallback.setAttribute('aria-hidden', 'true');
  const icon = document.createElement('span');
  icon.className = 'menu-photo-icon';
  icon.textContent = type === 'drinks' ? String.fromCodePoint(0x1f964) : String.fromCodePoint(0x1f37d, 0xfe0f);
  const fallbackText = document.createElement('span');
  fallbackText.className = 'menu-photo-text';
  fallbackText.textContent = 'Foto menu segera hadir';
  fallback.append(icon, fallbackText);
  const image = document.createElement('img');
  image.hidden = true;
  image.className = 'menu-real-image';
  image.src = item.image;
  image.alt = item.name;
  // Slide aktif perlu dimuat segera karena elemen gambar disembunyikan sampai load selesai.
  image.loading = 'eager';
  image.draggable = false;
  image.addEventListener('load', () => {
    fallback.remove();
    image.hidden = false;
    imageWrap.setAttribute('aria-label', `Foto ${item.name}`);
  }, { once: true });
  // Gambar yang tidak ditemukan dibiarkan tersembunyi agar fallback tetap rapi.
  image.addEventListener('error', () => image.remove(), { once: true });
  imageWrap.append(fallback, image);

  const copy = document.createElement('div');
  copy.className = 'menu-slide-copy';
  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = type === 'drinks' ? 'MENU MINUMAN' : 'MENU MAKANAN';
  const name = document.createElement('h4');
  name.textContent = item.name;
  const description = document.createElement('p');
  description.className = 'menu-description';
  description.textContent = item.description;
  const price = document.createElement('p');
  price.className = 'menu-price';
  price.textContent = `Rp${new Intl.NumberFormat('id-ID').format(item.price)}`;
  copy.append(eyebrow, name, description, price);
  slide.append(imageWrap, copy);
  previousButton.disabled = menuIndexes[type] === 0;
  nextButton.disabled = menuIndexes[type] === items.length - 1;
}

function moveMenu(type, direction) {
  const items = menuData[type];
  const nextIndex = menuIndexes[type] + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return;
  menuIndexes[type] = nextIndex;
  renderMenuSlider(type);
  animateMenuSlide(type, direction);
}

function animateMenuSlide(type, direction) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const slide = document.querySelector(`[data-menu-slide="${type}"]`);
  if (slide.closest('.menu-slider-section.reveal-item:not(.is-revealed)')) return;
  const parts = slide.querySelectorAll('.menu-slide-image, .menu-slide-copy');
  if (!parts.length) return;

  parts.forEach((part) => {
    part.classList.add('slide-entering');
    part.style.setProperty('--slide-offset', direction > 0 ? '12px' : '-12px');
  });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    parts.forEach((part) => part.classList.add('slide-entering-active'));
  }));
}

Object.keys(menuData).forEach((type) => {
  const slider = document.querySelector(`[data-menu-slider="${type}"]`);
  renderMenuSlider(type);
  slider.querySelector('.menu-prev').addEventListener('click', () => moveMenu(type, -1));
  slider.querySelector('.menu-next').addEventListener('click', () => moveMenu(type, 1));
  slider.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveMenu(type, -1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveMenu(type, 1);
    }
  });
  let swipeStart = null;
  slider.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch') return;
    swipeStart = { x: event.clientX, y: event.clientY };
  });
  slider.addEventListener('pointerup', (event) => {
    if (!swipeStart || event.pointerType !== 'touch') return;
    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    moveMenu(type, deltaX < 0 ? 1 : -1);
  });
  slider.addEventListener('pointercancel', () => { swipeStart = null; });
});

// Ulasan contoh yang dapat diganti dengan ulasan pelanggan sebenarnya
const reviews = [
  { quote: 'Tempatnya nyaman banget buat ngobrol santai. Ice Pisjoe-nya creamy, pisang crispy-nya juga enak dimakan pas masih hangat!', name: 'Andin P.', initial: 'A' },
  { quote: 'Suka suasana rooftop-nya, apalagi menjelang sore. Cocok buat istirahat sebentar sambil menikmati minuman favorit.', name: 'Raka D.', initial: 'R' },
  { quote: 'Cafenya terasa hangat dan menunya enak. Pasti jadi salah satu tempat langganan buat ketemu teman.', name: 'Mira S.', initial: 'M' }
];

let currentReview = 0;
const reviewQuote = document.querySelector('.review-quote');
const reviewName = document.querySelector('.review-person strong');
const reviewAvatar = document.querySelector('.review-avatar');
const reviewCount = document.querySelector('.review-count');

function showReview(index) {
  currentReview = (index + reviews.length) % reviews.length;
  const review = reviews[currentReview];
  reviewQuote.textContent = review.quote;
  reviewName.textContent = review.name;
  reviewAvatar.textContent = review.initial;
  reviewCount.textContent = `0${currentReview + 1} / 0${reviews.length}`;
}

document.querySelector('.review-prev').addEventListener('click', () => showReview(currentReview - 1));
document.querySelector('.review-next').addEventListener('click', () => showReview(currentReview + 1));

// Reveal progresif hanya aktif jika JavaScript, IntersectionObserver, dan motion normal tersedia.
const revealSelectors = [
  '.hero-copy .eyebrow', '.hero-copy h1', '.hero-description', '.hero-actions', '.hero-note',
  '.hero-visual', '.hero-bottom', '.about-image', '.about-copy', '.section-heading',
  '.menu-slider-section', '.rooftop-panel', '.gallery-tile', '.instagram-inner',
  '.review-heading', '.review-content', '.location-copy', '.map-embed', '.footer-main'
];
const revealTargets = document.querySelectorAll(revealSelectors.join(','));
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

if (revealTargets.length && 'IntersectionObserver' in window && !reduceMotion) {
  let revealObserver;
  try {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.08) {
          entry.target.classList.add('is-revealed');
        } else if (!entry.isIntersecting || entry.intersectionRatio === 0) {
          entry.target.classList.remove('is-revealed');
        }
      });
    }, { threshold: [0, 0.08], rootMargin: '0px' });

    revealTargets.forEach((target, index) => {
      target.classList.add('reveal-item');
      target.style.setProperty('--reveal-delay', `${(index % 4) * 55}ms`);

      if (target.matches('.hero-copy .eyebrow, .hero-copy h1, .hero-description, .hero-actions, .hero-note, .about-copy, .location-copy, .review-heading')) {
        target.classList.add('reveal-from-left');
      } else if (target.matches('.hero-visual, .about-image, .map-embed, .review-content')) {
        target.classList.add('reveal-from-right');
      } else if (target.matches('.menu-slider-section')) {
        const menuSections = [...document.querySelectorAll('.menu-slider-section')];
        target.classList.add(menuSections.indexOf(target) % 2 === 0 ? 'reveal-from-left' : 'reveal-from-right');
      } else if (target.matches('.section-heading')) {
        target.classList.add(target.closest('.menu-section') ? 'reveal-from-left' : 'reveal-from-right');
      } else if (target.matches('.gallery-tile')) {
        const galleryTiles = [...document.querySelectorAll('.gallery-tile')];
        target.classList.add(galleryTiles.indexOf(target) % 2 === 0 ? 'reveal-from-left' : 'reveal-from-right');
      } else if (target.matches('.rooftop-panel')) {
        target.classList.add('reveal-from-right');
      } else {
        target.classList.add('reveal-fade');
      }
    });
    document.documentElement.classList.add('motion-enabled');
    revealTargets.forEach((target) => revealObserver.observe(target));
  } catch {
    revealObserver?.disconnect();
    document.documentElement.classList.remove('motion-enabled');
    revealTargets.forEach((target) => target.classList.remove('reveal-item'));
  }
}
