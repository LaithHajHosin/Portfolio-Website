(() => {
  'use strict';

  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d', { alpha: false });

  let W = 0, H = 0, DPR = 1;

  /* ------------------------------------------------------------------ */
  /*  Pre-rendered glow sprites (small, bright, spark-like)              */
  /* ------------------------------------------------------------------ */
  const SPRITE_COUNT = 24;
  const SPRITES = [];
  const COLORS = [];

  (function buildSprites() {
    for (let i = 0; i < SPRITE_COUNT; i++) {
      const t   = i / (SPRITE_COUNT - 1);
      const size = 64, r = size / 2;
      const cv  = document.createElement('canvas');
      cv.width = cv.height = size;

      const g   = cv.getContext('2d');
      const hue = 52 - 52 * t;
      const lum = 96 - 58 * t;
      const sat = 100 - 30 * t;

      COLORS.push(`hsla(${hue},${sat}%,${lum}%,1)`);

      const grd = g.createRadialGradient(r, r, 0, r, r, r);
      grd.addColorStop(0.00, `hsla(${hue},${sat}%,${Math.min(100, lum + 8)}%,1)`);
      grd.addColorStop(0.25, `hsla(${hue},${sat}%,${lum}%,0.55)`);
      grd.addColorStop(0.55, `hsla(${hue},${sat}%,${lum * 0.7}%,0.14)`);
      grd.addColorStop(1.00, `hsla(${hue},${sat}%,${lum * 0.5}%,0)`);

      g.fillStyle = grd;
      g.fillRect(0, 0, size, size);
      SPRITES.push(cv);
    }
  })();

  /* ------------------------------------------------------------------ */
  /*  Pointer state                                                      */
  /* ------------------------------------------------------------------ */
  const ptr = {
    tx: 0, ty: 0,
    x: 0,  y: 0,
    vx: 0, vy: 0,
    speed: 0            // normalised 0..1 (softly clamped)
  };

  /* ------------------------------------------------------------------ */
  /*  Resize                                                             */
  /* ------------------------------------------------------------------ */
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width  = Math.floor(window.innerWidth  * DPR);
    H = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';

    ctx.fillStyle = '#05050a';
    ctx.fillRect(0, 0, W, H);
  }

  resize();
  ptr.tx = ptr.x = W * 0.5;
  ptr.ty = ptr.y = H * 0.5;
  window.addEventListener('resize', resize);

  /* ------------------------------------------------------------------ */
  /*  Input                                                              */
  /* ------------------------------------------------------------------ */
  window.addEventListener('pointermove', (e) => {
    ptr.tx = e.clientX * DPR;
    ptr.ty = e.clientY * DPR;
  }, { passive: true });

  window.addEventListener('pointerdown', () => {
    for (let i = 0; i < 60; i++) spawnSpark(1.0, true);
  });

  /* ------------------------------------------------------------------ */
  /*  Spark pool                                                         */
  /* ------------------------------------------------------------------ */
  const MAX_SPARKS = 700;
  const sparks = [];
  const pool = [];
  let spawnAcc = 0;

  function spawnSpark(speed01, burst) {
    if (sparks.length >= MAX_SPARKS) return;

    const p = pool.pop() || {};

    const mag = Math.hypot(ptr.vx, ptr.vy);

    const a0  = Math.random() * Math.PI * 2;
    const rad = Math.pow(Math.random(), 0.6) * (2 + speed01 * 6) * DPR;
    p.x = ptr.x + Math.cos(a0) * rad;
    p.y = ptr.y + Math.sin(a0) * rad;

    let vx, vy;

    if (burst || mag < 0.3) {
      // radial burst when clicking or barely moving
      const a = Math.random() * Math.PI * 2;
      const s = (1.5 + Math.random() * 4.5) * DPR * (burst ? 1.3 : 1);
      vx = Math.cos(a) * s;
      vy = Math.sin(a) * s - 1.0 * DPR;
    } else {
      // ---- backward spray, capped so fast moves stay tame ----
      const back = Math.atan2(-ptr.vy, -ptr.vx);
      const cone = 0.55 + speed01 * 0.9;           // was up to 1.9 — gentler
      const a    = back + (Math.random() - 0.5) * cone * 2;

      // KEY CHANGE: cap the launch speed so fast mouse flicks
      // don't turn into a shotgun blast.
      const cappedMag = Math.min(mag, 9 * DPR);
      const kick = cappedMag * (0.30 + Math.random() * 0.70);

      vx = Math.cos(a) * kick;
      vy = Math.sin(a) * kick;

      // much smaller jitter
      vx += (Math.random() - 0.5) * 1.1 * DPR * speed01;
      vy += (Math.random() - 0.5) * 1.1 * DPR * speed01;
    }

    p.vx = vx;
    p.vy = vy;

    p.r       = (0.9 + Math.random() * 2.0) * DPR;
    p.maxLife = 260 + Math.random() * 420;
    p.life    = p.maxLife;
    p.seed    = Math.random() * 1000;
    p.alpha   = 0.45 + Math.random() * 0.45;
    p.grav    = (0.045 + Math.random() * 0.055) * DPR;
    p.turb    = (0.05 + Math.random() * 0.11) * DPR;
    p.drag    = 0.958 + Math.random() * 0.018;

    sparks.push(p);
  }

  /* ------------------------------------------------------------------ */
  /*  Simulation                                                         */
  /* ------------------------------------------------------------------ */
  function updateSparks(dt, k, time) {
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];

      p.life -= dt;
      if (p.life <= 0) {
        sparks.splice(i, 1);
        if (pool.length < MAX_SPARKS) pool.push(p);
        continue;
      }

      p.vx += Math.sin(p.seed + time * 3.1) * p.turb * k;
      p.vy += Math.cos(p.seed * 1.7 + time * 2.6) * p.turb * k;

      p.vy += p.grav * k;

      const d = Math.pow(p.drag, k);
      p.vx *= d;
      p.vy *= d;

      p.x += p.vx * k;
      p.y += p.vy * k;
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  function render() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(5, 5, 10, 0.26)';
    ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';

    for (let i = 0; i < sparks.length; i++) {
      const p = sparks[i];
      const age = 1 - p.life / p.maxLife;

      let si = (age * SPRITE_COUNT) | 0;
      if (si >= SPRITE_COUNT) si = SPRITE_COUNT - 1;

      const a = p.alpha * Math.pow(1 - age, 1.6);
      if (a <= 0.01) continue;

      const r = p.r * (1 + age * 0.9);

      const sp = Math.hypot(p.vx, p.vy);
      if (sp > 0.6) {
        ctx.globalAlpha = a * 0.55;
        ctx.strokeStyle = COLORS[si];
        ctx.lineWidth = Math.max(0.6 * DPR, r * 0.55);
        // shorter streak so fast moves don't draw giant lines
        const streak = Math.min(1.8, 1.8);
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * streak, p.y - p.vy * streak);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      ctx.globalAlpha = a;
      ctx.drawImage(SPRITES[si], p.x - r * 2.6, p.y - r * 2.6, r * 5.2, r * 5.2);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ------------------------------------------------------------------ */
  /*  Main loop                                                          */
  /* ------------------------------------------------------------------ */
  let last = performance.now();
  let time = 0;

  function frame(now) {
    let dt = now - last;
    last = now;
    if (dt > 50) dt = 50;
    const k = dt / 16.6667;
    time += dt / 1000;

    const f  = Math.min(1, 0.45 * k);
    const nx = ptr.x + (ptr.tx - ptr.x) * f;
    const ny = ptr.y + (ptr.ty - ptr.y) * f;

    ptr.vx = nx - ptr.x;
    ptr.vy = ny - ptr.y;
    ptr.x  = nx;
    ptr.y  = ny;

    const mag = Math.hypot(ptr.vx, ptr.vy);

    // KEY CHANGE: softer speed curve + lower ceiling.
    // sqrt-style curve means a big flick only nudges the value a bit
    // higher than a normal move — no runaway.
    const raw   = Math.min(1, mag / (20 * DPR));
    const eased = Math.sqrt(raw);
    ptr.speed = Math.min(0.75, eased);   // hard cap below 1

    // KEY CHANGE: emit rate scales gently with speed and is capped low
    const rate = 4 + ptr.speed * 420;    // was up to 904
    spawnAcc += rate * dt / 1000;
    // also cap how many sparks can spawn in a single frame
    let budget = 10;
    while (spawnAcc >= 1 && budget-- > 0) {
      spawnAcc -= 1;
      spawnSpark(ptr.speed, false);
    }
    if (spawnAcc > 20) spawnAcc = 20;    // don't let it build up

    updateSparks(dt, k, time);
    render();

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
