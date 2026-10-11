const ITEMS = ['McLaren', 'Quadrant', 'TUMI', 'Ralph Lauren', 'Hilton', 'Uber', 'Google', 'Bell', 'Monster'];
  const track = document.querySelector('.marquee-track');
  const build = () => ITEMS.map(t => `<span class="marquee-item">${t}</span>`).join('');
  track.innerHTML = build() + build(); // duplicate once for seamless loop
