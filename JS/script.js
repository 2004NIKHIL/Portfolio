// Custom cursor
(function () {
  const cursor = document.querySelector('.custom-cursor');
  if (!cursor) return;
  const show = () => cursor.classList.remove('hidden');
  const hide = () => cursor.classList.add('hidden');
  window.addEventListener('mousemove', (e) => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; show(); });
  window.addEventListener('mousedown', () => cursor.classList.add('active'));
  window.addEventListener('mouseup', () => cursor.classList.remove('active'));
  window.addEventListener('mouseleave', hide);
  window.addEventListener('mouseenter', show);
})();

// Caption cycle under A
(function () {
  const caption = document.querySelector('.letter-a-caption');
  if (!caption) return;
  const variants = ['निखिल कुमार','Nikhil Kumar','尼希尔·库马尔','ニヒル・クマール','निखिलः कुमारः'];
  let i = 0;
  const setText = (s) => {
    if (/[\u0900-\u097F]/.test(s) && s.includes(' ')) {
      const [a,b] = s.split(/\s+/,2);
      caption.innerHTML = '<span class="cap-word">'+a+'</span><span class="cap-word">'+b+'</span>';
    } else caption.textContent = s;
  };
  const next = () => { setText(variants[i]); i = (i+1)%variants.length; };
  setTimeout(() => { next(); setInterval(next, 1200); }, 2200);
  caption.addEventListener('click', next);
})();

// Postcards: in-view animation
(function () {
  const cards = document.querySelectorAll('.postcard-large');
  if (!cards.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const el = e.target;
      if (e.isIntersecting && e.intersectionRatio > 0.4) { el.classList.add('in-view'); el.classList.remove('zoom-out'); }
      else { el.classList.remove('in-view'); el.classList.add('zoom-out'); }
    });
  }, { threshold: [0, 0.4, 0.7, 1] });
  cards.forEach(c => io.observe(c));
})();

// Parallax
(function () {
  const section = document.getElementById('parallax');
  if (!section) return;
  const layers = section.querySelectorAll('.plx-layer');
  let ticking = false;
  function update() {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const total = rect.height + vh;
    const offset = vh - rect.top;
    const progress = Math.min(1, Math.max(0, offset / total));
    layers.forEach(layer => {
      const speed = parseFloat(layer.getAttribute('data-speed') || '0.3');
      const translate = (progress - 0.5) * 2 * speed * 100;
      layer.style.transform = `translateY(${translate}px)`;
    });
    ticking = false;
  }
  function onScroll(){ if (ticking) return; ticking = true; requestAnimationFrame(update); }
  update();
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll);
})();

// Window Zoom Dive + Mission reveal
(function () {
  const section = document.getElementById('parallax');
  const wrap = section?.querySelector('.plx-wrap');
  const trigger = document.querySelector('.scroll-trigger');
  const missionPage = document.querySelector('.mission-control-page');
  if (!section || !wrap || !trigger) return;
  const layers = section.querySelectorAll('.plx-layer');
  let ticking = false;
  function update() {
    const triggerRect = trigger.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const scrollProgress = Math.min(1, Math.max(0, 1 - (triggerRect.top / vh)));
    layers.forEach(layer => {
      const speed = parseFloat(layer.getAttribute('data-speed') || '0.2');
      const translate = scrollProgress * speed * 100;
      layer.style.transform = `translateY(${translate}px) scale(${1 + scrollProgress * 0.3})`;
    });
    if (scrollProgress > 0.4) wrap.classList.add('zoom-dive'); else wrap.classList.remove('zoom-dive');
    if (missionPage) {
      const rect = missionPage.getBoundingClientRect();
      if (rect.top < vh * 0.7) missionPage.classList.add('reveal');
    }
    ticking = false;
  }
  function onScroll(){ if (ticking) return; ticking = true; requestAnimationFrame(update); }
  update();
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll);
})();

// Ambient audio in Mission Control
(function () {
  const missionPage = document.querySelector('.mission-control-page');
  const ambienceAudio = document.getElementById('ambienceAudio');
  if (!missionPage || !ambienceAudio) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) { ambienceAudio.currentTime = 0; ambienceAudio.volume = 1.0; ambienceAudio.play().catch(()=>{}); }
      else { ambienceAudio.pause(); ambienceAudio.currentTime = 0; }
    });
  }, { threshold: 0.5 });
  io.observe(missionPage);
})();

// Guard banner (prevent passing Mission without access)
(function(){
  const mission = document.querySelector('.mission-control-page');
  const banner = document.getElementById('guardBanner');
  const bannerMsg = document.getElementById('guardBannerMsg');
  const backBtn = document.getElementById('guardBackBtn');
  if (!mission || !banner) return;
  window.__accessGranted = window.__accessGranted || false;
  function showBanner(msg){ if (window.__accessGranted) return hideBanner(); if (msg && bannerMsg) bannerMsg.textContent = msg; banner.classList.add('show'); }
  function hideBanner(){ banner.classList.remove('show'); }
  backBtn?.addEventListener('click', () => { mission.scrollIntoView({ behavior:'smooth', block:'start' }); });
  function wheelGuard(e){ if (window.__accessGranted) return; const rect = mission.getBoundingClientRect(); if (rect.bottom <= window.innerHeight + 40 && e.deltaY > 0){ e.preventDefault(); showBanner('Swipe your card to proceed.'); } }
  window.addEventListener('wheel', wheelGuard, { passive:false });
  let touchStartY = null;
  window.addEventListener('touchstart', (e) => { if (!e.touches?.length) return; touchStartY = e.touches[0].clientY; }, { passive:true });
  window.addEventListener('touchmove', (e) => {
    if (window.__accessGranted) return;
    if (!e.touches?.length || touchStartY == null) return;
    const dy = touchStartY - e.touches[0].clientY;
    if (dy <= 4) return;
    const rect = mission.getBoundingClientRect();
    if (rect.bottom <= window.innerHeight + 40){ e.preventDefault(); showBanner('Swipe your card to proceed.'); }
  }, { passive:false });
  const missionObs = new IntersectionObserver((entries)=>{ entries.forEach(entry=>{ if (entry.isIntersecting) hideBanner(); }); }, { threshold: 0.6 });
  missionObs.observe(mission);
  document.addEventListener('access:granted', hideBanner);
})();

// Robust unlock to Socials (observe reader status + event)
(function(){
  const reader = document.querySelector('.card-reader');
  const socials = document.getElementById('socialsPage');
  const banner = document.getElementById('guardBanner');
  const unlockAudio = document.getElementById('socialsUnlockAudio');
  if (!socials || !reader) return;

  function tryPlayUnlockAudio() {
    if (unlockAudio) { unlockAudio.pause(); unlockAudio.currentTime = 0; unlockAudio.volume = 0.4; setTimeout(() => unlockAudio.play().catch(()=>{}), 150); }
  }
  function openSocials() {
    socials.classList.add('unlocked');
    banner?.classList.remove('show');
    try { socials.scrollIntoView({ behavior:'smooth', block:'start' }); } catch {}
    try { if (location.hash !== '#socialsPage') location.hash = 'socialsPage'; } catch {}
    tryPlayUnlockAudio();
  }
  function grantAccess() {
    if (window.__accessGranted) return;
    window.__accessGranted = true;
    sessionStorage.setItem('accessGranted', 'true');
    document.dispatchEvent(new CustomEvent('access:granted'));
    openSocials();
  }

  document.addEventListener('access:granted', openSocials);

  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === 'attributes' && m.attributeName === 'data-status') {
        if ((reader.getAttribute('data-status') || '') === 'valid') grantAccess();
      }
    }
  });
  mo.observe(reader, { attributes: true });

  window.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('accessGranted') === 'true' || location.hash === '#socialsPage') grantAccess();
  });
  window.addEventListener('hashchange', () => { if (location.hash === '#socialsPage') grantAccess(); });
})();