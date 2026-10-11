/* =========================================================================
   LETTER DEFINITIONS
   Each letter is a function (w, h) -> array of strokes.
   A stroke is an array of [x, y] points, normalized to the box (0..w, 0..h).
   Coordinates are relative to the top-left of the letter's bounding box.
   ========================================================================= */
const letterDefinitions = (() => {

  // Helpers for arcs / curves ------------------------------------------------
  function arc(cx, cy, r, startDeg, endDeg, steps = 24) {
    const pts = [];
    const a0 = startDeg * Math.PI / 180;
    const a1 = endDeg * Math.PI / 180;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = a0 + (a1 - a0) * t;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return pts;
  }

  function quad(p0, p1, p2, steps = 20) {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const mt = 1 - t;
      const x = mt*mt*p0[0] + 2*mt*t*p1[0] + t*t*p2[0];
      const y = mt*mt*p0[1] + 2*mt*t*p1[1] + t*t*p2[1];
      pts.push([x, y]);
    }
    return pts;
  }

  // Every letter is defined relative to a 100 x 150 unit box,
  // then scaled to the requested (w, h).
  const box = { w: 100, h: 150 };

  const raw = {
    A: (w, h) => [
      [[10,150],[50,0],[90,150]],                 // left + right diagonals
      [[25,100],[75,100]],                        // crossbar
    ],
    B: (w, h) => [
      [[20,0],[20,150]],                          // spine
      [[20,0],[65,0]],
      quad([65,0],[95,37.5],[65,75]),             // top bowl
      [[65,75],[20,75]],
      [[65,75],[100,112.5]],
      quad([100,112.5],[65,150],[20,150]),        // bottom bowl
    ],
    C: (w, h) => [
      arc(50, 75, 50, -75, 255, 40),              // open arc
    ],
    D: (w, h) => [
      [[20,0],[20,150]],                          // spine
      [[20,0],[55,0]],
      quad([55,0],[100,75],[55,150]),             // bowl
      [[55,150],[20,150]],
    ],
    E: (w, h) => [
      [[20,0],[20,150]],
      [[20,0],[85,0]],
      [[20,75],[70,75]],
      [[20,150],[85,150]],
    ],
    F: (w, h) => [
      [[20,0],[20,150]],
      [[20,0],[85,0]],
      [[20,75],[70,75]],
    ],
    G: (w, h) => [
      arc(50, 75, 50, -75, 225, 40),
      [[100, 100],[100, 75]],
      [[100, 75],[60, 75]],
    ],
    H: (w, h) => [
      [[20,0],[20,150]],
      [[80,0],[80,150]],
      [[20,75],[80,75]],
    ],
    I: (w, h) => [
      [[50,0],[50,150]],
      [[25,0],[75,0]],
      [[25,150],[75,150]],
    ],
    J: (w, h) => [
      [[75,0],[75,110]],
      quad([75,110],[75,150],[50,150]),           // hook
      quad([50,150],[25,150],[25,120]),
      [[45,0],[90,0]],
    ],
    K: (w, h) => [
      [[20,0],[20,150]],
      [[90,0],[20,80]],
      [[40,60],[95,150]],
    ],
    L: (w, h) => [
      [[25,0],[25,150]],
      [[25,150],[90,150]],
    ],
    M: (w, h) => [
      [[10,150],[10,0]],
      [[10,0],[50,90]],
      [[50,90],[90,0]],
      [[90,0],[90,150]],
    ],
    N: (w, h) => [
      [[20,150],[20,0]],
      [[20,0],[80,150]],
      [[80,150],[80,0]],
    ],
    O: (w, h) => [
      arc(50, 75, 50, 0, 360, 48),
    ],
    P: (w, h) => [
      [[20,0],[20,150]],
      [[20,0],[65,0]],
      quad([65,0],[100,40],[65,80]),
      [[65,80],[20,80]],
    ],
    Q: (w, h) => [
      arc(50, 75, 50, 0, 360, 48),
      [[65, 105],[95, 145]],                      // tail
    ],
    R: (w, h) => [
      [[20,0],[20,150]],
      [[20,0],[65,0]],
      quad([65,0],[100,40],[65,80]),
      [[65,80],[20,80]],
      [[50,80],[95,150]],                         // leg
    ],
    S: (w, h) => [
      quad([85,20],[30,0],[25,45]),
      quad([25,45],[70,75],[85,100]),
      quad([85,100],[80,150],[20,140]),
    ],
    T: (w, h) => [
      [[10,0],[90,0]],
      [[50,0],[50,150]],
    ],
    U: (w, h) => [
      [[20,0],[20,110]],
      quad([20,110],[20,150],[50,150]),
      quad([50,150],[80,150],[80,110]),
      [[80,110],[80,0]],
    ],
    V: (w, h) => [
      [[10,0],[50,150]],
      [[50,150],[90,0]],
    ],
    W: (w, h) => [
      [[5,0],[25,150]],
      [[25,150],[50,40]],
      [[50,40],[75,150]],
      [[75,150],[95,0]],
    ],
    X: (w, h) => [
      [[15,0],[85,150]],
      [[85,0],[15,150]],
    ],
    Y: (w, h) => [
      [[15,0],[50,75]],
      [[85,0],[50,75]],
      [[50,75],[50,150]],
    ],
    Z: (w, h) => [
      [[15,0],[85,0]],
      [[85,0],[15,150]],
      [[15,150],[85,150]],
    ],
  };

  // Scale each letter's raw strokes from the 100x150 design box
  // into the requested (w, h).
  const scaled = {};
  for (const key in raw) {
    scaled[key] = (w, h) => {
      const sx = w / box.w;
      const sy = h / box.h;
      return raw[key](box.w, box.h).map(stroke =>
        stroke.map(([x, y]) => [x * sx, y * sy])
      );
    };
  }
  return scaled;
})();


/* =========================================================================
   COMPONENT
   ========================================================================= */
(function () {
  const canvas = document.getElementById('artCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const input      = document.getElementById('wordInput');
  const drawBtn    = document.getElementById('artBtnDraw');
  const clearBtn   = document.getElementById('artBtnClear');

  // --- Visibility gate (pauses animation when off-screen) -----------------
  let isInView = true;
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => { isInView = e.isIntersecting; }, { threshold: 0.15 });
    io.observe(canvas.parentElement);
  }

  // --- Sizing -------------------------------------------------------------
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    // Fallback to parent if the canvas hasn't laid out yet
    const w = rect.width  > 0 ? rect.width  : canvas.parentElement.offsetWidth;
    const h = rect.height > 0 ? rect.height : canvas.parentElement.offsetHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    drawBackground(w, h);
  }

  // --- Background ---------------------------------------------------------
  function drawBackground(w, h) {
    ctx.fillStyle = '#0d0d10';
    ctx.fillRect(0, 0, w, h);

    const grad = ctx.createRadialGradient(
      w / 2, h / 2, 0,
      w / 2, h / 2, Math.max(w, h) / 1.5
    );
    grad.addColorStop(0, 'rgba(249, 115, 22, 0.10)');
    grad.addColorStop(1, 'rgba(13, 13, 16, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // --- Line animator ------------------------------------------------------
  // Draws a polyline progressively, animating the "pen" from start to end.
  class LineAnimator {
    constructor() { this.currentAnimation = null; this.cancelled = false; }

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    cancel() {
      this.cancelled = true;
      if (this.currentAnimation) cancelAnimationFrame(this.currentAnimation);
      this.currentAnimation = null;
      return Promise.resolve();
    }

    drawAnimatedPath(points, options = {}) {
      return new Promise((resolve) => {
        if (!points || points.length < 2) return resolve();

        const {
          duration  = 250,
          color     = 'rgba(249, 115, 22, 0.9)',
          lineWidth = 4,
          ease      = (t) => 1 - Math.pow(1 - t, 3),
        } = options;

        // Precompute segment lengths once
        const segments = [];
        let totalLength = 0;
        for (let i = 0; i < points.length - 1; i++) {
          const dx = points[i + 1][0] - points[i][0];
          const dy = points[i + 1][1] - points[i][1];
          const len = Math.hypot(dx, dy);
          segments.push(len);
          totalLength += len;
        }
        if (totalLength === 0) return resolve();

        const startTime = performance.now();
        const self = this;

        function animate() {
          if (self.cancelled) return resolve();
          if (!isInView) {
            // Pause the animation, don't resolve — resume when back in view
            self.currentAnimation = requestAnimationFrame(animate);
            return;
          }

          const elapsed  = performance.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased    = ease(progress);
          const drawn    = totalLength * eased;

          ctx.beginPath();
          ctx.moveTo(points[0][0], points[0][1]);

          let accumulated = 0;
          for (let i = 0; i < segments.length; i++) {
            const segLen = segments[i];
            if (accumulated + segLen <= drawn) {
              ctx.lineTo(points[i + 1][0], points[i + 1][1]);
              accumulated += segLen;
            } else {
              const remain = drawn - accumulated;
              const t = segLen === 0 ? 0 : remain / segLen;
              const x = points[i][0] + (points[i + 1][0] - points[i][0]) * t;
              const y = points[i][1] + (points[i + 1][1] - points[i][1]) * t;
              ctx.lineTo(x, y);
              break;
            }
          }

          ctx.strokeStyle = color;
          ctx.lineWidth   = lineWidth;
          ctx.lineCap     = 'round';
          ctx.lineJoin    = 'round';
          ctx.stroke();

          if (progress < 1) {
            self.currentAnimation = requestAnimationFrame(animate);
          } else {
            resolve();
          }
        }

        if (this.currentAnimation) cancelAnimationFrame(this.currentAnimation);
        animate();
      });
    }
  }

  const animator = new LineAnimator();

  // --- Letter drawing -----------------------------------------------------
  const COLORS = [
    'rgba(249, 115, 22, 0.92)',
    'rgba(251, 146, 60, 0.92)',
    'rgba(234, 88, 12, 0.92)',
  ];

  async function drawLetter(letter, x, y, w, h, lineWidth) {
    const def = letterDefinitions[letter];
    if (!def) return;

    const strokes = def(w, h).map(stroke =>
      stroke.map(([px, py]) => [px + x, py + y])
    );

    let i = 0;
    for (const stroke of strokes) {
      if (animator.cancelled) return;
      await animator.drawAnimatedPath(stroke, {
        duration: 220,
        color: COLORS[i % COLORS.length],
        lineWidth,
      });
      i++;
    }
  }

  async function drawWord(word, startX, startY, letterW, letterH, spacing, lineWidth) {
    let x = startX;
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      if (ch === ' ') { x += letterW / 2 + spacing; continue; }

      if (animator.cancelled) return;
      await drawLetter(ch, x, startY, letterW, letterH, lineWidth);
      x += letterW + spacing;
      if (animator.cancelled) return;
      await animator.delay(80);
    }
  }

  // --- Public trigger -----------------------------------------------------
  async function triggerDraw() {
    animator.cancelled = false;
    await animator.cancel();          // stop any in-flight animation
    animator.cancelled = false;       // re-arm
    resizeCanvas();

    const raw = (input.value || 'LAITH').trim().toUpperCase().slice(0, 12) || 'LAITH';
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // Layout math: fit the word inside the canvas with padding
    const padding = Math.max(24, Math.min(w, h) * 0.08);
    const availableW = w - padding * 2;
    const spacingRatio = 0.18;

    // Determine letter width so the whole word fits
    const letterCount = raw.length;
    let letterW = availableW / (letterCount + spacingRatio * (letterCount - 1));
    letterW = Math.min(letterW, h / 1.6);  // don't let letters get taller than the canvas
    const letterH = letterW * 1.5;
    const spacing = letterW * spacingRatio;

    const totalWidth = letterCount * letterW + (letterCount - 1) * spacing;
    const startX = (w - totalWidth) / 2;
    const startY = (h - letterH) / 2;

    // Line width scales a touch with letter size, with sensible limits
    const lineWidth = Math.max(2, Math.min(6, letterW * 0.06));

    await drawWord(raw, startX, startY, letterW, letterH, spacing, lineWidth);
  }

  // --- Wire up events -----------------------------------------------------
  drawBtn.addEventListener('click', triggerDraw);
  clearBtn.addEventListener('click', async () => {
    await animator.cancel();
    resizeCanvas();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerDraw();
    }
  });

  // Debounced resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      animator.cancelled = true;
      resizeCanvas();
      triggerDraw();
    }, 200);
  }, { passive: true });

  // --- Boot ---------------------------------------------------------------
  // Wait a frame so layout settles before first paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      resizeCanvas();
      setTimeout(triggerDraw, 200);
    });
  });
})();
