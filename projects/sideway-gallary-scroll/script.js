const track = document.getElementById('h-track');
  const scroll = document.getElementById('h-scroll');
  const fill = document.getElementById('h-fill');

  function update() {
    const rect = track.getBoundingClientRect();
    const total = track.offsetHeight - window.innerHeight;
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    const progress = total > 0 ? scrolled / total : 0;

    const distance = scroll.scrollWidth - window.innerWidth + 64;
    scroll.style.transform = `translate3d(${-progress * distance}px, 0, 0)`;
    fill.style.width = (progress * 100) + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
