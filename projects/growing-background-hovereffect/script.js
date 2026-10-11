const helmets = ['Season', 'Discoball', 'Dark Glitter', 'Porcelain', 'Japan', 'GIF', 'Chrome', 'Beachball'];
  const grid = document.getElementById('grid');
  grid.innerHTML = helmets.map(name => `
    <div class="helmet-item">
      <div class="helmet-base">${name[0]}</div>
      <div class="helmet-reveal">${name[0]}</div>
      <div class="helmet-frame"></div>
      <span class="helmet-label">${name}</span>
    </div>
  `).join('');
