/* ═══════════════════════════════════════════
   PORTFOLIO — script.js  FINAL
   ═══════════════════════════════════════════ */

// ── Page navigation ───────────────────────────
let currentSection = null;

function openSection(id) {
  const home   = document.getElementById('homepage');
  const target = document.getElementById(id);
  if (!target) return;

  // Pause background video saat meninggalkan homepage
  const bgVideo = document.querySelector('.bg-video');
  if (bgVideo) bgVideo.pause();

  home.classList.remove('active');
  if (currentSection) {
    document.getElementById(currentSection)?.classList.remove('active');
  }

  setTimeout(() => {
    target.classList.add('active');
    currentSection = id;

    // Init drag scroll sesuai section — masing-masing terpisah
    if (id === 'content-creation') {
      document.querySelectorAll('.brand-scroll-track').forEach(makeDraggable);
    }
    if (id === 'motion-design') {
      document.querySelectorAll('.motion-event-track').forEach(makeDraggable);
    }

    // Resume autoplay video di section yang baru dibuka
    target.querySelectorAll('video[autoplay]').forEach(v => {
      v.play().catch(() => {});
    });

  }, 80);
}

function closeSection() {
  const home = document.getElementById('homepage');
  if (currentSection) {

    const leavingSection = document.getElementById(currentSection);
    if (leavingSection) {

      // Pause semua video lokal — reset ke awal
      leavingSection.querySelectorAll('video').forEach(v => {
        v.pause();
        v.currentTime = 0;
      });

      // Reset semua YouTube/Vimeo iframe agar audio tidak bocor
      leavingSection.querySelectorAll('iframe').forEach(iframe => {
        const src = iframe.src;
        iframe.src = '';
        iframe.src = src;
      });
    }

    // Modal filmography — pause video, tidak reset posisi
    const modalVideo = document.getElementById('fm-video');
    const modalLocal = document.getElementById('fm-video-local');
    if (modalVideo) modalVideo.src = '';
    if (modalLocal) modalLocal.pause();

    document.getElementById(currentSection)?.classList.remove('active');
    currentSection = null;
  }

  setTimeout(() => {
    home.classList.add('active');
    // Resume background video saat kembali ke homepage
    const bgVideo = document.querySelector('.bg-video');
    if (bgVideo) bgVideo.play();
  }, 80);
}

// ── Keyboard ESC — satu handler saja ─────────
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;

  if (document.getElementById('film-modal')?.classList.contains('open')) {
    closeFilmModal();
  } else if (document.getElementById('lightbox')?.classList.contains('open')) {
    closeLightbox();
  } else if (currentSection) {
    closeSection();
  }
});

// ── Lightbox ──────────────────────────────────
function openLightbox(btn) {
  const img = btn.closest('.film-still')?.querySelector('img');
  if (!img || !img.src) return;
  const lb    = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  lbImg.src = img.src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { document.getElementById('lb-img').src = ''; }, 400);
}

document.getElementById('lb-img')?.addEventListener('click', e => e.stopPropagation());

// ── Film Detail Modal ─────────────────────────
// Klik card → buka modal
document.querySelectorAll('.film-card').forEach(card => {
  card.addEventListener('click', e => {
    if (e.target.classList.contains('film-expand')) return;

    const title  = card.dataset.title  || 'Untitled';
    const role   = card.dataset.role   || '';
    const video  = card.dataset.video  || '';
    const images = card.dataset.images
      ? card.dataset.images.split(',').map(s => s.trim())
      : [];

    openFilmModal({ title, role, video, images });
  });
});

// Tombol View → buka modal langsung
function openFilmModalFromCard(btn) {
  const card = btn.closest('.film-card');
  if (!card) return;

  const title  = card.dataset.title  || 'Untitled';
  const role   = card.dataset.role   || '';
  const video  = card.dataset.video  || '';
  const images = card.dataset.images
    ? card.dataset.images.split(',').map(s => s.trim())
    : [];

  openFilmModal({ title, role, video, images });
}

function openFilmModal({ title, role, video, images }) {
  document.getElementById('fm-title').textContent = title;
  document.getElementById('fm-role').textContent  = role;

  const videoWrap = document.getElementById('fm-video-wrap');
  const videoEl   = document.getElementById('fm-video');
  const localEl   = document.getElementById('fm-video-local');

  if (video && video.startsWith('local:')) {
    const src = video.replace('local:', '');
    if (localEl) { localEl.src = src; localEl.style.display = 'block'; }
    if (videoEl) { videoEl.src = ''; videoEl.style.display = 'none'; }
    videoWrap?.classList.remove('hidden');
  } else if (video) {
    if (videoEl) { videoEl.src = video; videoEl.style.display = 'block'; }
    if (localEl) { localEl.src = ''; localEl.style.display = 'none'; }
    videoWrap?.classList.remove('hidden');
  } else {
    if (videoEl) videoEl.src = '';
    if (localEl) localEl.src = '';
    videoWrap?.classList.add('hidden');
  }

  // Inject still images ke slider
  const slider = document.getElementById('fm-slider');
  if (slider) {
    slider.innerHTML = '';
    images.forEach(src => {
      const div = document.createElement('div');
      div.className = 'fm-still';
      const img = document.createElement('img');
      img.src = src;
      img.onerror = () => div.classList.add('no-img');
      div.appendChild(img);
      slider.appendChild(div);
    });
    initSliderDrag(slider);
  }

  document.getElementById('film-modal')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeFilmModal() {
  const modal   = document.getElementById('film-modal');
  const videoEl = document.getElementById('fm-video');
  const localEl = document.getElementById('fm-video-local');

  modal?.classList.remove('open');
  document.body.style.overflow = '';

  setTimeout(() => {
    if (videoEl) videoEl.src = '';
    if (localEl) { localEl.pause(); localEl.src = ''; }
  }, 400);
}

function closeFmOutside(e) {
  if (e.target.id === 'film-modal') closeFilmModal();
}

// ── Drag slider stills di modal ───────────────
function initSliderDrag(el) {
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
  el.addEventListener('mouseup',    () => { isDown = false; el.style.cursor = 'grab'; });
  el.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    el.scrollLeft = scrollStart - (e.pageX - el.offsetLeft - startX) * 1.3;
  });

  let tX, tScroll;
  el.addEventListener('touchstart', e => {
    tX = e.touches[0].pageX - el.offsetLeft;
    tScroll = el.scrollLeft;
  }, { passive: true });
  el.addEventListener('touchmove', e => {
    el.scrollLeft = tScroll - (e.touches[0].pageX - el.offsetLeft - tX) * 1.2;
  }, { passive: true });
}

// ── Drag-to-scroll — generic ──────────────────
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
  el.addEventListener('mouseup',    () => { isDown = false; el.style.cursor = ''; });
  el.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    el.scrollLeft = scrollStart - (e.pageX - el.offsetLeft - startX) * 1.35;
  });

  let tX, tScroll;
  el.addEventListener('touchstart', e => {
    tX = e.touches[0].pageX - el.offsetLeft;
    tScroll = el.scrollLeft;
  }, { passive: true });
  el.addEventListener('touchmove', e => {
    el.scrollLeft = tScroll - (e.touches[0].pageX - el.offsetLeft - tX) * 1.2;
  }, { passive: true });
}

// Drag scroll — filmography & video editing
document.querySelectorAll('.gallery-track').forEach(makeDraggable);

// ── Photo placeholder fallback ────────────────
document.querySelectorAll('.hero-photo img').forEach(img => {
  img.addEventListener('error', () => img.style.display = 'none');
});

// Deteksi IDM dan sembunyikan src video jika terdeteksi
function checkIDM() {
  const videos = document.getElementsByTagName('video');
  for (const video of videos) {
    if (video.hasAttribute('__idm_id__')) {
      // IDM terdeteksi — kosongkan semua src video
      document.querySelectorAll('video source').forEach(s => s.src = '');
      console.warn('Download manager detected.');
      return;
    }
  }
}
setInterval(checkIDM, 1000);
