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
