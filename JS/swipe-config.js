(function () {
  const readerSelector = '.card-reader';

  // Threshold helper for swipe.js (based on reader width)
  window.__computeAcceptThreshold = function () {
    const reader = document.querySelector(readerSelector);
    const w = Math.max(1, reader?.offsetWidth || 0);
    return Math.max(30, Math.min(80, w * 0.10));
  };

  // Config object for swipe.js
  window.__SWIPE_CONFIG = {
    readerSelector,
    cardSelector: '.swipe-card-element',
    socialsSelector: '#socialsPage',
    acceptAudioSelector: '#acceptAudio'
  };

  // Inject critical CSS so the card always gets pointer/touch and stays above overlays
  function injectCriticalSwipeStyles() {
    if (document.getElementById('critical-swipe-styles')) return;
    const css = `
      .card-swipe-wrapper { position: relative; }
      .card-reader { position: relative; z-index: 2; }
      .swipe-card-element{
        position: absolute;
        bottom: 50px; left: 50%;
        width: 250px; height: 150px;
        transform: translateX(-50%) translateX(var(--dx, 0px)) rotate(var(--rot, 0deg));
        transition: transform 0.35s ease;
        cursor: grab;
        z-index: 9999;                 /* above wallet/reader/overlays */
        touch-action: none;            /* enable touch drag */
        user-select: none; -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        pointer-events: auto;
      }
      .swipe-card-element.swiping{ transition: none !important; cursor: grabbing; }
      .swipe-card-element.pulled{
        transform: translateX(-50%) translateY(-200px) translateX(var(--dx, 0px)) rotate(var(--rot, 0deg));
      }
      .swipe-card-element.slide{ transition: transform 0.35s ease !important; }
      .swipe-card-element *{ pointer-events: none; }
      .swipe-card-element .photo{ position: relative; z-index: 1; overflow: hidden; }
    `;
    const style = document.createElement('style');
    style.id = 'critical-swipe-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Inject UI fix styles (ensure mission heading shows and socials layout is visible)
  function injectUIFixesStyles() {
    if (document.getElementById('ui-fixes-styles')) return;
    const css = `
      .mission-control-page.reveal h2,
      .mission-control-page.reveal p { opacity: 1 !important; transform: none !important; }
      /* Minimal Socials layout: keep locked state hidden until unlock */
      #socialsPage {
        /* default locked appearance: collapsed and inert */
        min-height: 0; max-height: 0; overflow: hidden; opacity: 0; pointer-events: none;
        background:#000; color:#F9F3DE; display:block; padding:0 2rem;
        transition:opacity .36s ease, max-height .36s ease, padding .28s ease, min-height .36s ease;
      }
      /* unlocked -> fully visible and interactive */
      #socialsPage.unlocked {
        min-height: 100vh; max-height: none; overflow: visible; opacity: 1; pointer-events: auto;
        display:flex; align-items:center; justify-content:center; padding:4rem 2rem;
      }
      #socialsPage .wrap {
        max-width: 900px; width:100%; text-align:center;
        animation: fadeInUp .6s ease forwards;
      }
      @keyframes fadeInUp {
        from { opacity:0; transform:translateY(20px); }
        to { opacity:1; transform:translateY(0); }
      }
      #socialsPage h2 {
        font-family:'Impact','Inter Tight',system-ui,sans-serif;
        font-weight:900; font-size:clamp(3rem,10vw,8rem);
        color:#E91B00; text-transform:uppercase; letter-spacing:-0.03em;
        margin-bottom:1.5rem;
      }
      #socialsPage .links { display:flex; flex-wrap:wrap; gap:1.25rem; justify-content:center; margin-top:2rem; }
      #socialsPage .link {
        background:#E91B00; color:#F9F3DE; padding:1rem 1.5rem; border-radius:.75rem;
        text-decoration:none; border:2px solid rgba(249,243,222,.2);
        font-family: 'Apercu Mono','Courier New',monospace; font-weight:800; font-size:1.05rem;
        transition:all .25s ease; box-shadow:0 4px 12px rgba(233,27,0,.25);
      }
      #socialsPage .link:hover {
        background:#F9F3DE; color:#E91B00; border-color:#E91B00;
        transform:translateY(-2px); box-shadow:0 6px 18px rgba(233,27,0,.4);
      }
      #guardBanner { position:fixed; left:0; right:0; bottom:0; z-index:10000; transform: translateY(100%); transition: transform .3s ease; }
      #guardBanner.show { transform: translateY(0); }
    `;
    const style = document.createElement('style');
    style.id = 'ui-fixes-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Ensure the mission section is revealed (so heading is visible)
  function revealMission() {
    const mission = document.querySelector('.mission-control-page');
    if (mission) mission.classList.add('reveal');
  }

  // Handle unlocking socials and scrolling to it
  function wireAccessHandlers() {
    const socials = document.getElementById('socialsPage');
    const guardBanner = document.getElementById('guardBanner');
    const unlockAudio = document.getElementById('socialsUnlockAudio');

    if (!socials) return;

    function unlockAndScroll() {
      socials.classList.remove('locked');
      socials.classList.add('unlocked');
      if (guardBanner) guardBanner.classList.remove('show');
      // Play unlock audio (best effort)
      try {
        if (unlockAudio) {
          unlockAudio.pause();
          unlockAudio.currentTime = 0;
          unlockAudio.volume = 0.35;
          unlockAudio.play().catch(()=>{});
        }
      } catch {}
      // Scroll and set hash
      try { socials.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {}
      try { if (location.hash !== '#socialsPage') location.hash = 'socialsPage'; } catch {}
    }

    // Event from swipe.js
    document.addEventListener('access:granted', () => {
      sessionStorage.setItem('accessGranted', 'true');
      unlockAndScroll();
    });

    // If reloading on or navigating to socials after granted
    window.addEventListener('DOMContentLoaded', () => {
      if (sessionStorage.getItem('accessGranted') === 'true' || location.hash === '#socialsPage') {
        unlockAndScroll();
      }
    });
    window.addEventListener('hashchange', () => {
      if (location.hash === '#socialsPage') unlockAndScroll();
    });
  }

  // Ensure card is ready to move
  function prepareCard() {
    const card = document.querySelector('.swipe-card-element');
    if (!card) return;
    card.setAttribute('draggable', 'false');
    if (!card.style.getPropertyValue('--dx')) card.style.setProperty('--dx', '0px');
    if (!card.style.getPropertyValue('--rot')) card.style.setProperty('--rot', '0deg');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectCriticalSwipeStyles();
      injectUIFixesStyles();
      prepareCard();
      revealMission();
      wireAccessHandlers();
      console.log('Swipe config: DOM ready, styles injected, card prepared.');
    });
  } else {
    injectCriticalSwipeStyles();
    injectUIFixesStyles();
    prepareCard();
    revealMission();
    wireAccessHandlers();
    console.log('Swipe config: styles injected, card prepared.');
  }
})();
