/* ═══════════════════════════════════════════
   PORTFOLIO — script.js  v4
   Custom cursor dihapus — cursor normal
   ═══════════════════════════════════════════ */

// ── Page navigation ───────────────────────────
let currentSection = null;

/* SESUDAH */
function openSection(id) {
  const home = document.getElementById('homepage');
  const target = document.getElementById(id);
  if (!target) return;

  const bgVideo = document.querySelector('.bg-video');
  if (bgVideo) bgVideo.pause();

  home.classList.remove('active');
  if (currentSection) {
    document.getElementById(currentSection)?.classList.remove('active');
  }

  setTimeout(() => {
    target.classList.add('active');
    currentSection = id;

    target.querySelectorAll('video[autoplay]').forEach(v => {
      v.play().catch(e => console.log("Menunggu interaksi user..."));
    });


    // Init drag scroll setiap kali section dibuka
    // Ini memastikan semua track terdaftar meski baru muncul
    if (id === 'content-creation') {
      document.querySelectorAll('.brand-scroll-track').forEach(makeDraggable);
      if (id === 'motion-design') {
        document.querySelectorAll('.motion-event-track').forEach(makeDraggable);
      }
    }
  }, 80);
}
function closeSection() {
  const home = document.getElementById('homepage');
  if (currentSection) {
    if (currentSection === 'motion-design') {
      document.querySelectorAll('.motion-item')
        .forEach(el => el.classList.remove('is-visible'));
    }


    const leavingSection = document.getElementById(currentSection);
    if (leavingSection) {


      // ==========================================
      // LOGIKA PAUSE & RESUME CERDAS
      // ==========================================

      // 1. PAUSE mutlak untuk SEMUA video lokal (Tanpa Reset ke 0)
      // Klien bisa lanjut nonton (resume) dari detik terakhir mereka tinggalkan
      leavingSection.querySelectorAll('video').forEach(v => {
        v.pause();
      });

      // 2. WAJIB RESET iframe (YouTube/Vimeo)
      // Ini harus dilakukan agar suara YouTube tidak bocor saat kembali ke menu utama
      leavingSection.querySelectorAll('iframe').forEach(iframe => {
        const src = iframe.src;
        iframe.src = '';
        iframe.src = src;
      });
    }

    // Pause video di film detail modal jika terbuka
    const modalVideo = document.getElementById('fm-video');
    // Modal filmography — pause saja, tidak reset
    const modalLocal = document.getElementById('fm-video-local');
    if (modalLocal) {
      modalLocal.pause();
    }
    if (modalVideo) modalVideo.src = '';
    if (modalLocal) { modalLocal.pause(); modalLocal.currentTime = 0; }

    document.getElementById(currentSection)?.classList.remove('active');
    currentSection = null;
  }

  setTimeout(() => {
    home.classList.add('active');
    const bgVideo = document.querySelector('.bg-video');
    if (bgVideo) bgVideo.play();
  }, 80);
}

// Keyboard: Escape to go back
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('lightbox').classList.contains('open')) {
      closeLightbox();
    } else if (currentSection) {
      closeSection();
    }
  }
});


// ── Lightbox ──────────────────────────────────
function openLightbox(btn) {
  const img = btn.closest('.film-still')?.querySelector('img');
  if (!img || !img.src) return;
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  lbImg.src = img.src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
// Buka film modal langsung dari tombol View di film card
function openFilmModalFromCard(btn) {
  const card = btn.closest('.film-card');
  if (!card) return;

  const title = card.dataset.title || 'Untitled';
  const role = card.dataset.role || '';
  const video = card.dataset.video || '';
  const images = card.dataset.images
    ? card.dataset.images.split(',').map(s => s.trim())
    : [];

  openFilmModal({ title, role, video, images });
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { document.getElementById('lb-img').src = ''; }, 400);
}

// Prevent lightbox closing when clicking the image itself
document.getElementById('lb-img').addEventListener('click', e => e.stopPropagation());

// ── Drag-to-scroll (gallery tracks only) ─────
function makeDraggable(el) {
  if (!el) return;
  let isDown = false, startX, scrollStart;

  el.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - el.offsetLeft;
    scrollStart = el.scrollLeft;
    el.style.cursor = 'grabbing';
  });
  el.addEventListener('mouseleave', () => { isDown = false; el.style.cursor = ''; });
  el.addEventListener('mouseup', () => { isDown = false; el.style.cursor = ''; });
  el.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    el.scrollLeft = scrollStart - (e.pageX - el.offsetLeft - startX) * 1.35;
  });

  // Touch support
  let tX, tScroll;
  el.addEventListener('touchstart', e => {
    tX = e.touches[0].pageX - el.offsetLeft;
    tScroll = el.scrollLeft;
  }, { passive: true });
  el.addEventListener('touchmove', e => {
    el.scrollLeft = tScroll - (e.touches[0].pageX - el.offsetLeft - tX) * 1.2;
  }, { passive: true });
}

// Apply drag-to-scroll to horizontal gallery tracks only
// Horizontal drag scroll — film/video gallery
document.querySelectorAll('.gallery-track').forEach(makeDraggable);
document.querySelectorAll('.brand-scroll-track').forEach(makeDraggable);
document.querySelectorAll('.motion-event-track').forEach(makeDraggable);

// Horizontal drag scroll — per brand (independent, tidak saling mempengaruhi)
document.querySelectorAll('.brand-scroll-track').forEach(makeDraggable);

// ── Photo placeholder fallback ────────────────
document.querySelectorAll('.hero-photo img').forEach(img => {
  img.addEventListener('error', () => img.style.display = 'none');
});

/* ═══════════════════════════════════════════
   FILM DETAIL MODAL
   Paste di paling bawah script.js
═══════════════════════════════════════════ */

// ── Buka modal saat film card diklik ─────────
document.querySelectorAll('.film-card').forEach(card => {
  card.addEventListener('click', e => {
    // Jangan buka modal jika yang diklik adalah tombol "View" (lightbox lama)
    if (e.target.classList.contains('film-expand')) return;

    const title = card.dataset.title || 'Untitled';
    const role = card.dataset.role || '';
    const video = card.dataset.video || '';
    const images = card.dataset.images
      ? card.dataset.images.split(',').map(s => s.trim())
      : [];

    openFilmModal({ title, role, video, images });
  });
});

// ── Open ──────────────────────────────────────
function openFilmModal({ title, role, video, images }) {
  // Inject text
  document.getElementById('fm-title').textContent = title;
  document.getElementById('fm-role').textContent = role;

  // Video — tampilkan atau sembunyikan
  const videoWrap = document.getElementById('fm-video-wrap');
  const videoEl = document.getElementById('fm-video');

  if (video) {
    videoEl.src = video;
    videoWrap.classList.remove('hidden');
  } else {
    videoEl.src = '';
    videoWrap.classList.add('hidden');
  }

  // Stills — clear dulu, lalu inject
  const slider = document.getElementById('fm-slider');
  slider.innerHTML = '';

  if (images.length > 0) {
    images.forEach(src => {
      const div = document.createElement('div');
      div.className = 'fm-still';

      const img = document.createElement('img');
      img.src = src;
      img.alt = title;
      img.onerror = () => div.classList.add('no-img');

      div.appendChild(img);
      slider.appendChild(div);
    });
  }

  // Buka modal
  document.getElementById('film-modal').classList.add('open');
  document.body.style.overflow = 'hidden';

  // Setup drag slider
  initSliderDrag(slider);
}

// ── Close ─────────────────────────────────────
function closeFilmModal() {
  const modal = document.getElementById('film-modal');
  const videoEl = document.getElementById('fm-video');

  modal.classList.remove('open');
  document.body.style.overflow = '';

  // Stop video saat modal ditutup
  setTimeout(() => { videoEl.src = ''; }, 400);
}

// Klik di luar panel → tutup
function closeFmOutside(e) {
  if (e.target.id === 'film-modal') closeFilmModal();
}

// ESC → tutup (sudah ada handler ESC di script, tambah kondisi ini)
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('film-modal').classList.contains('open')) {
      closeFilmModal();
    }
  }
});

// ── Drag-to-scroll untuk slider stills ───────
function initSliderDrag(el) {
  // Hapus listener lama agar tidak double
  const clone = el.cloneNode(true);
  el.parentNode.replaceChild(clone, el);
  el = clone;

  let isDown = false, startX, scrollStart;

  el.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - el.offsetLeft;
    scrollStart = el.scrollLeft;
    el.style.cursor = 'grabbing';
  });
  el.addEventListener('mouseleave', () => { isDown = false; el.style.cursor = 'grab'; });
  el.addEventListener('mouseup', () => { isDown = false; el.style.cursor = 'grab'; });
  el.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    el.scrollLeft = scrollStart - (e.pageX - el.offsetLeft - startX) * 1.3;
  });

  // Touch
  let tX, tScroll;
  el.addEventListener('touchstart', e => {
    tX = e.touches[0].pageX - el.offsetLeft;
    tScroll = el.scrollLeft;
  }, { passive: true });
  el.addEventListener('touchmove', e => {
    el.scrollLeft = tScroll - (e.touches[0].pageX - el.offsetLeft - tX) * 1.2;
  }, { passive: true });
}

// ==========================================
// ALAT BANTU: DRAG TO SCROLL HORIZONTAL
// ==========================================
const sliders = document.querySelectorAll('.gallery-scroll');
let isDown = false;
let startX;
let scrollLeft;

sliders.forEach(slider => {
  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.classList.remove('active');
  });

  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.classList.remove('active');
  });

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return; // Kalau nggak diklik, jangan jalan
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; // Angka 2 ini kecepatan gesernya, bisa dinaikin ke 3 kalau kurang ngebut
    slider.scrollLeft = scrollLeft - walk;
  });
});