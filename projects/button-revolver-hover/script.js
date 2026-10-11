// Split each .btn-text into individual chars with data-char for the clone
  document.querySelectorAll('[split-text="chars"]').forEach(el => {
    const text = el.textContent.trim() || 'Get Started';
    el.textContent = '';
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.style.setProperty('--i', i);
      span.dataset.char = ch;
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      el.appendChild(span);
    });
  });
