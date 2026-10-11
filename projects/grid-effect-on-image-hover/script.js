(() => {
  const stage = document.getElementById('stage');

  /* ---------------------------------------------------------
     1. The picture — inline SVG so it always loads
     --------------------------------------------------------- */
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stop-color="#1b1040"/>
        <stop offset="42%"  stop-color="#5a6fd8"/>
        <stop offset="72%"  stop-color="#c86dd7"/>
        <stop offset="100%" stop-color="#ff9a8b"/>
      </linearGradient>
      <radialGradient id="sun" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="#fff8c9"/>
        <stop offset="55%"  stop-color="#ffc247" stop-opacity=".95"/>
        <stop offset="100%" stop-color="#ff8a3d" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="m1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#2a2350"/>
        <stop offset="100%" stop-color="#100d24"/>
      </linearGradient>
      <linearGradient id="m2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#141026"/>
        <stop offset="100%" stop-color="#05040d"/>
      </linearGradient>
    </defs>

    <rect width="1200" height="800" fill="url(#sky)"/>
    <circle cx="830" cy="250" r="230" fill="url(#sun)"/>
    <circle cx="830" cy="250" r="72"  fill="#fff3b0" opacity=".95"/>

    <g fill="#ffffff" opacity=".85">
      <circle cx="120" cy="110" r="2.5"/><circle cx="260" cy="70"  r="1.8"/>
      <circle cx="400" cy="150" r="2.2"/><circle cx="180" cy="250" r="1.6"/>
      <circle cx="330" cy="300" r="2"/><circle cx="70"  cy="330" r="1.7"/>
      <circle cx="520" cy="90"  r="2.3"/><circle cx="620" cy="180" r="1.5"/>
      <circle cx="960" cy="90"  r="2"/><circle cx="1080" cy="170" r="1.8"/>
      <circle cx="1140" cy="60" r="2.4"/><circle cx="700" cy="60"  r="1.6"/>
    </g>

    <path d="M0 620 L250 360 L430 560 L610 390 L830 630 L830 800 L0 800 Z"
          fill="url(#m1)" opacity=".92"/>
    <path d="M380 800 L690 450 L890 630 L1070 480 L1200 620 L1200 800 Z"
          fill="url(#m2)"/>
    <path d="M0 800 Q 300 700 600 760 T 1200 720 L1200 800 Z"
          fill="#03030a" opacity=".9"/>
  </svg>`;

  stage.style.setProperty(
    '--img',
    `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}")`
  );

  /* ---------------------------------------------------------
     2. Movement detection
        The grid + glow are active only while the pointer moves.
        When it stops (even if still hovering) they fade out.
     --------------------------------------------------------- */
  const IDLE_DELAY = 130;   // ms without movement before it fades out
  let idleTimer = null;

  function wake() {
    if (!stage.classList.contains('moving')) {
      stage.classList.add('moving');
    }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(sleep, IDLE_DELAY);
  }

  function sleep() {
    stage.classList.remove('moving');
    clearTimeout(idleTimer);
    idleTimer = null;
  }

  stage.addEventListener('pointermove', (e) => {
    const rect = stage.getBoundingClientRect();

    // keep the mask + glow centered on the cursor
    stage.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
    stage.style.setProperty('--my', (e.clientY - rect.top)  + 'px');

    wake();
  }, { passive: true });

  // leaving the picture ends the effect immediately
  stage.addEventListener('pointerleave', sleep);

  // a press counts as activity too
  stage.addEventListener('pointerdown', wake);
})();
