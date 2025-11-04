(function () {
  'use strict';

  if (!window.__SWIPE_CONFIG) return;

  const { readerSelector, cardSelector, socialsSelector, acceptAudioSelector } = window.__SWIPE_CONFIG;
  const reader = document.querySelector(readerSelector);
  const socials = document.querySelector(socialsSelector);
  const acceptAudio = document.querySelector(acceptAudioSelector);
  if (!reader) return;

  // prevent native drag image
  document.addEventListener('dragstart', (e) => e.preventDefault(), true);

  function initCard(card) {
    if (!card) return;

    let isDragging = false;
    let pointerId = null;
    let startX = 0;
    let currentX = 0;
    let isPulled = false;

    const setDX = (x) => card.style.setProperty('--dx', `${x}px`);
    const setROT = (r) => card.style.setProperty('--rot', `${r}deg`);

    function releasePointer() {
      if (pointerId != null) {
        try { card.releasePointerCapture(pointerId); } catch {}
        pointerId = null;
      }
      document.body.classList.remove('no-select');
    }

    function accept() {
      reader.dataset.status = 'valid';
      try { acceptAudio?.play().catch(()=>{}); } catch {}
      window.__accessGranted = true;
      document.dispatchEvent(new CustomEvent('access:granted'));
      socials?.classList.add('unlocked');

      // aggressive navigation fallbacks
      setTimeout(()=> socials?.scrollIntoView({behavior:'smooth', block:'start'}), 60);
      setTimeout(()=> { if (location.hash !== '#socialsPage') location.hash = 'socialsPage'; }, 160);
      setTimeout(()=> { try { window.scrollTo({ top: socials?.offsetTop || 0, behavior:'smooth' }); } catch{} }, 420);

      // animate card off to right then reset
      card.classList.add('slide');
      if (!isPulled) { card.classList.add('pulled'); isPulled = true; }
      setDX(160); setROT(10);
      setTimeout(()=>{
        card.classList.remove('pulled','swiping');
        setDX(0); setROT(0);
        isPulled = false;
        setTimeout(()=> reader.dataset.status = '', 700);
      }, 520);
    }

    function reject() {
      reader.dataset.status = 'invalid';
      card.classList.add('slide');
      if (!isPulled) { card.classList.add('pulled'); isPulled = true; }
      setDX(-160); setROT(-10);
      setTimeout(()=>{
        card.classList.remove('pulled','swiping');
        setDX(0); setROT(0);
        isPulled = false;
        setTimeout(()=> reader.dataset.status = '', 700);
      }, 520);
    }

    function onDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      try { card.setPointerCapture(e.pointerId); pointerId = e.pointerId; } catch {}
      startX = e.clientX;
      currentX = startX;
      isDragging = true;
      if (!isPulled) { card.classList.add('pulled'); isPulled = true; }
      card.classList.add('swiping');
      card.classList.remove('slide');
      document.body.classList.add('no-select');
      reader.dataset.status = 'ready';
      setDX(0); setROT(0);
      e.preventDefault();
    }

    function onMove(e) {
      if (!isDragging) return;
      currentX = e.clientX;
      const dx = currentX - startX;
      setDX(dx);
      setROT(dx / 14);
      e.preventDefault();
    }

    function onUp(e) {
      if (!isDragging) return;
      isDragging = false;
      releasePointer();
      card.classList.remove('swiping');
      const dx = currentX - startX;
      const threshold = (window.__computeAcceptThreshold ? window.__computeAcceptThreshold() : 40);
      if (dx > threshold) {
        accept();
      } else if (dx < -threshold) {
        reject();
      } else {
        // snap back
        card.classList.add('slide');
        setDX(0); setROT(0);
        reader.dataset.status = 'ready';
        setTimeout(()=>{
          card.classList.remove('pulled');
          isPulled = false;
          reader.dataset.status = '';
        }, 400);
      }
      e.preventDefault();
    }

    card.addEventListener('pointerdown', onDown);
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerup', onUp);
    card.addEventListener('pointercancel', onUp);
    card.addEventListener('pointerleave', onUp);
  }

  // init first matching card(s)
  document.querySelectorAll(cardSelector).forEach(initCard);
})();
