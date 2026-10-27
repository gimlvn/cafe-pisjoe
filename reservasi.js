// Ganti dengan nomor admin: kode negara tanpa tanda +, spasi, atau tanda hubung.
// Contoh format Indonesia: 6281234567890.
const ADMIN_WHATSAPP = "6285780762560";

// Navigasi mobile dan tema mengikuti perilaku halaman utama.
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

menuToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi');
});

navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Buka menu navigasi');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navLinks?.classList.contains('open')) {
    navLinks.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Buka menu navigasi');
    menuToggle?.focus();
  }
});

const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = themeToggle?.querySelector('.theme-toggle-icon');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function setTheme(theme, savePreference = false) {
  const activeTheme = theme === 'dark' ? 'dark' : 'light';
  const isDark = activeTheme === 'dark';
  document.documentElement.dataset.theme = activeTheme;
  document.documentElement.style.colorScheme = activeTheme;
  themeToggle?.setAttribute('aria-pressed', String(isDark));
  themeToggle?.setAttribute('aria-label', isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
  if (themeIcon) themeIcon.textContent = isDark ? '🌙' : '☀️';
  if (themeColorMeta) themeColorMeta.content = isDark ? '#1b2520' : '#fff4dc';

  if (savePreference) {
    try {
      localStorage.setItem('ice-pisjoe-theme', activeTheme);
    } catch {
      // Tema tetap berubah untuk sesi ini jika penyimpanan tidak tersedia.
    }
  }
}

setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
themeToggle?.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme, true);
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

// Tampilkan placeholder area privat jika file foto tidak ditemukan atau gagal dibaca.
document.querySelectorAll('.reservation-private-photo img').forEach((image) => {
  const showPlaceholder = () => image.closest('.reservation-private-photo')?.classList.add('has-image-error');
  image.addEventListener('error', showPlaceholder, { once: true });
  if (image.complete && image.naturalWidth === 0) showPlaceholder();
});

// Area card mengisi pilihan pada formulir lalu membawa pengunjung ke sana.
const areaSelect = document.querySelector('#reservation-area');
document.querySelectorAll('.reservation-select-area').forEach((button) => {
  button.addEventListener('click', () => {
    if (areaSelect) areaSelect.value = button.dataset.area;
    document.querySelector('#form-reservasi')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => areaSelect?.focus({ preventScroll: true }), 350);
  });
});

const form = document.querySelector('#reservation-form');
const phoneInput = document.querySelector('#customer-phone');
const dateInput = document.querySelector('#reservation-date');
const formStatus = document.querySelector('#reservation-status');

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

if (dateInput) dateInput.min = localDateString();

function validatePhone() {
  if (!phoneInput) return true;
  const digits = phoneInput.value.replace(/\D/g, '');
  const valid = digits.length >= 8 && digits.length <= 15;
  phoneInput.setCustomValidity(valid || phoneInput.value.trim() === '' ? '' : 'Masukkan nomor WhatsApp yang valid dengan 8 sampai 15 digit.');
  return valid;
}

phoneInput?.addEventListener('input', validatePhone);

const areaNames = { indoor: 'Indoor', rooftop: 'Rooftop', privat: 'Area Privat' };

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (formStatus) formStatus.textContent = '';
  validatePhone();

  if (dateInput && dateInput.value && dateInput.value < localDateString()) {
    dateInput.setCustomValidity('Pilih tanggal hari ini atau tanggal yang akan datang.');
  } else {
    dateInput?.setCustomValidity('');
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    if (formStatus) formStatus.textContent = 'Periksa kembali kolom wajib dan format nomor WhatsApp.';
    return;
  }

  if (!/^\d{8,15}$/.test(ADMIN_WHATSAPP)) {
    if (formStatus) formStatus.textContent = 'Permintaan belum dapat dibuka: pemilik website perlu mengatur nomor WhatsApp admin pada reservasi.js terlebih dahulu.';
    return;
  }

  const data = new FormData(form);
  const message = [
    'PERMINTAAN RESERVASI ICE PISJOE',
    '',
    `Nama: ${data.get('name')}`,
    `Nomor WhatsApp: ${data.get('phone')}`,
    `Email: ${data.get('email') || 'Tidak dicantumkan'}`,
    `Jenis reservasi: ${data.get('eventType')}`,
    `Area pilihan: ${areaNames[data.get('area')] || data.get('area')}`,
    `Tanggal: ${data.get('date')}`,
    `Waktu mulai: ${data.get('time')}`,
    `Durasi: ${data.get('duration')}`,
    `Jumlah tamu: ${data.get('guests')}`,
    `Keperluan acara: ${data.get('purpose') || 'Tidak dicantumkan'}`,
    `Catatan tambahan: ${data.get('notes') || 'Tidak ada'}`,
    '',
    'Mohon konfirmasi ketersediaan area, harga, dan detail reservasi. Terima kasih.'
  ].join('\n');
  const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  if (formStatus) formStatus.textContent = 'WhatsApp terbuka dengan ringkasan permintaan. Tekan tombol kirim di WhatsApp; reservasi menunggu persetujuan admin.';
});

// Reveal memakai class, jarak, durasi, easing, delay, dan threshold yang sama dengan Beranda.
// Jika JavaScript, IntersectionObserver, atau animasi normal tidak tersedia, konten tetap terlihat.
const reservationRevealTargets = document.querySelectorAll([
  '.reservation-hero-copy .eyebrow',
  '.reservation-hero-copy h1',
  '.reservation-hero-copy .reservation-lead',
  '.reservation-hero-copy .button',
  '.reservation-hero-photo',
  '.reservation-areas .reservation-section-heading',
  '.reservation-area-card',
  '.reservation-form-intro',
  '.reservation-form',
  '.reservation-faq-layout .reservation-section-heading',
  '.reservation-faq-list details',
  '.reservation-page .footer-main',
  '.reservation-page .footer-bottom'
].join(','));

if (reservationRevealTargets.length && 'IntersectionObserver' in window && !reduceMotion) {
  let reservationRevealObserver;
  try {
    reservationRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.08) {
          entry.target.classList.add('is-revealed');
        } else if (!entry.isIntersecting || entry.intersectionRatio === 0) {
          entry.target.classList.remove('is-revealed');
        }
      });
    }, { threshold: [0, 0.08], rootMargin: '0px' });

    reservationRevealTargets.forEach((target, index) => {
      target.classList.add('reveal-item');
      target.style.setProperty('--reveal-delay', `${(index % 4) * 55}ms`);

      if (target.matches('.reservation-hero-copy .eyebrow, .reservation-hero-copy h1, .reservation-hero-copy .reservation-lead, .reservation-hero-copy .button, .reservation-areas .reservation-section-heading, .reservation-form-intro')) {
        target.classList.add('reveal-from-left');
      } else if (target.matches('.reservation-hero-photo, .reservation-form, .reservation-faq-layout .reservation-section-heading')) {
        target.classList.add('reveal-from-right');
      } else if (target.matches('.reservation-area-card')) {
        const areaCards = [...document.querySelectorAll('.reservation-area-card')];
        const areaIndex = areaCards.indexOf(target);
        target.classList.add(areaIndex === 1 ? 'reveal-area-down' : 'reveal-area-up');
        target.style.setProperty('--reveal-delay', `${areaIndex * 120}ms`);
      } else if (target.matches('.reservation-faq-list details')) {
        const faqItems = [...document.querySelectorAll('.reservation-faq-list details')];
        target.classList.add(faqItems.indexOf(target) % 2 === 0 ? 'reveal-from-left' : 'reveal-from-right');
      } else {
        target.classList.add('reveal-fade');
      }
    });

    document.documentElement.classList.add('motion-enabled');
    reservationRevealTargets.forEach((target) => reservationRevealObserver.observe(target));
  } catch {
    reservationRevealObserver?.disconnect();
    document.documentElement.classList.remove('motion-enabled');
    reservationRevealTargets.forEach((target) => {
      target.classList.remove('reveal-item', 'reveal-from-left', 'reveal-from-right', 'reveal-area-up', 'reveal-area-down', 'reveal-fade');
      target.style.removeProperty('--reveal-delay');
    });
  }
}
