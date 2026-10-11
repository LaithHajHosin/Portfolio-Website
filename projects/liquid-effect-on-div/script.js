(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  /* ---------------- 1. gooey cursor trail ---------------- */
  const layer = document.getElementById('gooLayer');
  const COUNT = 7;
  const blobs = [];
  const pos = [];

  const pointer = { x: innerWidth / 2, y: innerHeight / 2 };

  for (let i = 0; i < COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'blob';
    const size = 110 - i * 11;           // head is biggest, tail shrinks
    el.style.width = el.style.height = size + 'px';
    layer.appendChild(el);

    blobs.push({ el, size });
    pos.push({ x: pointer.x, y: pointer.y });
  }

  addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  }, { passive: true });

  function trail() {
    let tx = pointer.x;
    let ty = pointer.y;

    for (let i = 0; i < COUNT; i++) {
      const p = pos[i];
      const ease = 0.34 - i * 0.035;     // each blob lags a little more

      p.x += (tx - p.x) * ease;
      p.y += (ty - p.y) * ease;

      tx = p.x;
      ty = p.y;

      const half = blobs[i].size / 2;
      blobs[i].el.style.transform =
        `translate3d(${p.x - half}px, ${p.y - half}px, 0)`;
    }
    requestAnimationFrame(trail);
  }
  requestAnimationFrame(trail);

  /* ---------------- 2. liquid title distortion ---------------- */
  const title = document.querySelector('.hero-title');
  const turb  = document.getElementById('turb');
  const disp  = document.getElementById('disp');

  let target = 0, current = 0, t = 0;

  title.addEventListener('pointerenter', () => { target = 48; });
  title.addEventListener('pointerleave', () => { target = 0; });

  function melt() {
    current += (target - current) * 0.08;
    disp.setAttribute('scale', current.toFixed(2));

    if (current > 0.4) {
      t += 0.012;
      turb.setAttribute(
        'baseFrequency',
        `${(0.006 + Math.sin(t) * 0.003).toFixed(5)} ${(0.012 + Math.cos(t * 1.3) * 0.004).toFixed(5)}`
      );
    }
    requestAnimationFrame(melt);
  }
  requestAnimationFrame(melt);
})();
