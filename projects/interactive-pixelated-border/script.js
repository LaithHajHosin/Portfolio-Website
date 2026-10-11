(function () {
      const container = document.getElementById('pixelCard');
      const canvas    = document.getElementById('pixelCanvas');
      const ctx       = canvas.getContext('2d');

      // --- CONFIGURATION TUNING ---
      const PIXEL_SIZE       = 10;          // Size of each square pixel block in px
      const GAP              = 2;           // Visual gap between pixels (px total, split 1px each side)
      const GLOW_DISTANCE    = 70;          // Mouse proximity trigger distance in px
      const GLOW_SQ          = GLOW_DISTANCE * GLOW_DISTANCE;
      const DECAY_RATE       = 0.04;        // Fade speed per frame
      const COLOR            = '#06b6d4';   // Pixel illumination color (Cyan)
      const BASE_EDGE_ALPHA  = 0.12;        // Ambient idle alpha on the border
      const BASE_INNER_ALPHA = 0.02;        // Ambient idle alpha on the inner ring
      const MIN_ALPHA        = 0.02;        // Skip drawing below this alpha
      const ALPHA_BUCKETS    = 8;           // Quantize alpha for batched draws

      // --- STATE ---
      let width = 0, height = 0, dpr = 1;
      let pixels = [];
      let rect = null;
      let running = false;
      let initialized = false;

      const mouse = { x: -999, y: -999, active: false };

      // ============================================================
      // BUILD GRID
      // Snaps canvas to an exact multiple of PIXEL_SIZE so no pixel
      // ever overflows or leaves a sub-pixel sliver on the edges.
      // ============================================================
      function buildGrid() {
        rect = container.getBoundingClientRect();

        const rawW = Math.round(rect.width);
        const rawH = Math.round(rect.height);

        // Snap to exact multiple of PIXEL_SIZE
        const cols = Math.max(1, Math.round(rawW / PIXEL_SIZE));
        const rows = Math.max(1, Math.round(rawH / PIXEL_SIZE));

        width  = cols * PIXEL_SIZE;
        height = rows * PIXEL_SIZE;

        dpr = Math.min(window.devicePixelRatio || 1, 2);

        // Backing store (device px)
        canvas.width  = width  * dpr;
        canvas.height = height * dpr;

        // CSS size (CSS px) — flush with the snapped grid
        canvas.style.width  = width  + 'px';
        canvas.style.height = height + 'px';

        // Reset transform, then apply DPR scale
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Build pixel list
        pixels = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const isBorder     = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
            const isNearBorder = r <= 1 || r >= rows - 2 || c <= 1 || c >= cols - 2;
            if (!isNearBorder) continue;

            const baseAlpha = isBorder ? BASE_EDGE_ALPHA : BASE_INNER_ALPHA;
            pixels.push({
              x: c * PIXEL_SIZE,
              y: r * PIXEL_SIZE,
              alpha: baseAlpha,
              baseAlpha
            });
          }
        }

        initialized = true;
      }

      // ============================================================
      // INPUT — throttled through RAF, cached rect
      // ============================================================
      let pendingMove = false;
      let pendingX = 0, pendingY = 0;

      container.addEventListener('mousemove', (e) => {
        pendingX = e.clientX;
        pendingY = e.clientY;
        if (pendingMove) return;
        pendingMove = true;
        requestAnimationFrame(() => {
          if (!rect) rect = container.getBoundingClientRect();
          mouse.x = pendingX - rect.left;
          mouse.y = pendingY - rect.top;
          mouse.active = true;
          pendingMove = false;
        });
      }, { passive: true });

      container.addEventListener('mouseleave', () => { mouse.active = false; });
      window.addEventListener('blur',                () => { mouse.active = false; });

      // ============================================================
      // RESIZE — debounced; keep rect fresh on scroll too
      // ============================================================
      let resizeTimer;
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (!initialized) return;
          buildGrid();
          rect = container.getBoundingClientRect();
        }, 180);
      };
      window.addEventListener('resize', onResize, { passive: true });
      window.addEventListener('scroll', () => {
        rect = container.getBoundingClientRect();
      }, { passive: true });

      // ============================================================
      // RENDER
      //  - sqrt only when actually glowing
      //  - alpha bucketed → ~8 batched fill() calls instead of ~150 fillRect
      //  - outer pixels flush against canvas boundary (no covered sides)
      // ============================================================
      function render() {
        if (!running) return;

        ctx.clearRect(0, 0, width, height);

        const mx = mouse.x;
        const my = mouse.y;
        const active = mouse.active;

        // --- update alphas ---
        for (let i = 0; i < pixels.length; i++) {
          const p = pixels[i];

          if (active) {
            const cx = p.x + PIXEL_SIZE * 0.5;
            const cy = p.y + PIXEL_SIZE * 0.5;
            const dx = mx - cx;
            const dy = my - cy;
            const dSq = dx * dx + dy * dy;
            if (dSq < GLOW_SQ) {
              const distance = Math.sqrt(dSq);
              const intensity = (1 - distance / GLOW_DISTANCE) * 0.95;
              if (intensity > p.alpha) p.alpha = intensity;
            }
          }

          if (p.alpha > p.baseAlpha) {
            p.alpha = Math.max(p.baseAlpha, p.alpha - DECAY_RATE);
          }
        }

        // --- bucket alphas for batched drawing ---
        ctx.fillStyle = COLOR;
        const buckets = new Array(ALPHA_BUCKETS);
        for (let i = 0; i < ALPHA_BUCKETS; i++) buckets[i] = [];

        for (let i = 0; i < pixels.length; i++) {
          const p = pixels[i];
          if (p.alpha <= MIN_ALPHA) continue;
          const b = Math.min(ALPHA_BUCKETS - 1, (p.alpha * ALPHA_BUCKETS) | 0);
          buckets[b].push(p);
        }

        // --- draw each bucket with a single fill() ---
        const half  = GAP * 0.5;             // 1px
        const rightEdge  = width  - PIXEL_SIZE;
        const bottomEdge = height - PIXEL_SIZE;

        for (let b = 0; b < ALPHA_BUCKETS; b++) {
          const list = buckets[b];
          if (!list.length) continue;

          ctx.globalAlpha = (b + 0.5) / ALPHA_BUCKETS;
          ctx.beginPath();

          for (let i = 0; i < list.length; i++) {
            const p = list[i];

            // Flush edge pixels to the canvas boundary; inset only interior sides.
            const isLeft   = p.x === 0;
            const isRight  = p.x >= rightEdge;
            const isTop    = p.y === 0;
            const isBottom = p.y >= bottomEdge;

            const x = p.x + (isLeft ? 0 : half);
            const y = p.y + (isTop  ? 0 : half);
            const w = PIXEL_SIZE - ((isLeft   ? 0 : half) + (isRight  ? 0 : half));
            const h = PIXEL_SIZE - ((isTop    ? 0 : half) + (isBottom ? 0 : half));

            ctx.rect(x, y, w, h);
          }

          ctx.fill();
        }

        ctx.globalAlpha = 1;
        requestAnimationFrame(render);
      }

      // ============================================================
      // START / STOP — lazy init + visibility gating
      // ============================================================
      function start() {
        if (running) return;
        if (!initialized) buildGrid();
        running = true;
        requestAnimationFrame(render);
      }

      function stop() {
        running = false;
      }

      // IntersectionObserver: only run while in view (with 200px pre-warm)
      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !document.hidden) start();
        else stop();
      }, { threshold: 0, rootMargin: '200px' });
      io.observe(container);

      // Pause when tab is hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stop();
        } else if (container.getBoundingClientRect().top < innerHeight + 200) {
          start();
        }
      });

      // If the card is already visible on first paint, start immediately.
      // Otherwise the IntersectionObserver fires on first scroll into view.
      const firstRect = container.getBoundingClientRect();
      if (firstRect.top < innerHeight && firstRect.bottom > 0) {
        start();
      }
    })();
