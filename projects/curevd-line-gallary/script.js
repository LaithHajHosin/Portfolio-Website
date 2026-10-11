(() => {
  const arc   = document.querySelector('.arc');
  const slots = [...arc.querySelectorAll('.slot')];
  const N     = slots.length;

  /* ------- tweak these ------- */
  const SPREAD = 62;    // total fan angle (degrees)
  const RADIUS = 820;   // how tight the curve is (px)
  const LIFT   = 24;    // hover lift (px)
  const PUSH   = 38;    // horizontal push for the nearest neighbour (px)
  /* --------------------------- */

  const step  = SPREAD / (N - 1);
  const angles = slots.map((_, i) => -SPREAD / 2 + i * step);

  let hovered = -1;

  function render() {
    slots.forEach((slot, i) => {
      const deg = angles[i];
      const rad = deg * Math.PI / 180;

      // --- position on the circle -------------------------------------
      // circle centre is RADIUS below the middle slot
      let x = RADIUS * Math.sin(rad);
      let y = RADIUS * (1 - Math.cos(rad));

      let lift = 0, spin = 0, scale = 1;

      // --- hover state -------------------------------------------------
      if (hovered !== -1) {
        const d = i - hovered;

        if (d === 0) {
          lift  = -LIFT;
          spin  = -deg * 0.55;   // straighten the lifted card a bit
          scale = 1.07;
        } else {
          // push along the arc's tangent so cards stay ON the curve
          const p = (PUSH / Math.abs(d)) * Math.sign(d);
          x += Math.cos(rad) * p;
          y += Math.sin(rad) * p;
        }
      }

      slot.style.transform = `translate(${x}px, ${y}px) rotate(${deg}deg)`;
      slot.style.zIndex = i === hovered ? 50 : 10;

      slot.firstElementChild.style.transform =
        `translateY(${lift}px) rotate(${spin}deg) scale(${scale})`;
    });
  }

  /* ---- hover handling (delegated, so switching cards is flicker-free) -- */
  arc.addEventListener('mouseover', e => {
    const slot = e.target.closest('.slot');
    const idx  = slot ? slots.indexOf(slot) : -1;
    if (idx !== hovered) { hovered = idx; render(); }
  });
  arc.addEventListener('mouseleave', () => {
    if (hovered !== -1) { hovered = -1; render(); }
  });

  /* ---- responsive scale ------------------------------------------------ */
  function fit() {
    const s = Math.min(
      1,
      (window.innerWidth  - 24) / 1100,
      (window.innerHeight - 24) / 520
    );
    arc.style.setProperty('--s', s);
  }
  window.addEventListener('resize', fit);
  fit();

  /* ---- intro: stagger the cards out onto the arc ----------------------- */
  slots.forEach((s, i) => { s.style.transitionDelay = (i * 45) + 'ms'; });

  requestAnimationFrame(() => {
    render();
    arc.classList.add('ready');
    setTimeout(() => slots.forEach(s => s.style.transitionDelay = '0ms'), 1000);
  });
})();
