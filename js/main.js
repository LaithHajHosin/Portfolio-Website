document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);
    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));

    // ============================
    // DYNAMIC NAVBAR LOGIC
    // ============================
    const navbar = document.getElementById('navbar');
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileBackdrop = document.getElementById('mobile-backdrop');
    const scrollProgress = document.getElementById('scroll-progress');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-link');
    const sections = document.querySelectorAll('section[id]');

    // --- 1. Mobile menu open/close ---
    function openMobileMenu() {
        mobileMenu.classList.add('open');
        mobileBackdrop.classList.add('open');
        menuBtn.classList.add('is-open');
        menuBtn.setAttribute('aria-expanded', 'true');
    }
    function closeMobileMenu() {
        mobileMenu.classList.remove('open');
        mobileBackdrop.classList.remove('open');
        menuBtn.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
    }
    function toggleMobileMenu() {
        if (mobileMenu.classList.contains('open')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', toggleMobileMenu);
    }
    if (mobileBackdrop) {
        mobileBackdrop.addEventListener('click', closeMobileMenu);
    }
    // Close mobile menu when a link is clicked
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
            closeMobileMenu();
        }
    });
    // Reset menu state on resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) closeMobileMenu();
    });

    // --- 2. Scroll behavior: hide/show on scroll direction + progress bar + shrink ---
    let lastScrollY = window.scrollY;
    let ticking = false;
    const hideThreshold = 200;       // px before navbar starts hiding on scroll-down
    const showOnScrollUpDelta = 10;  // sensitivity for re-showing on scroll-up

    function handleScroll() {
        const currentY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (currentY / docHeight) * 100 : 0;
        scrollProgress.style.width = progress + '%';

        // Toggle scrolled state
        if (currentY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide/show on scroll direction
        if (currentY > hideThreshold) {
            if (currentY > lastScrollY + showOnScrollUpDelta) {
                // scrolling down — hide
                navbar.classList.add('nav-hidden');
                // also close mobile menu when hiding
                if (mobileMenu.classList.contains('open')) closeMobileMenu();
            } else if (currentY < lastScrollY - showOnScrollUpDelta) {
                // scrolling up — show
                navbar.classList.remove('nav-hidden');
            }
        } else {
            navbar.classList.remove('nav-hidden');
        }

        lastScrollY = currentY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });

    // --- 3. Active section highlighting (IntersectionObserver) ---
    const sectionMap = new Map();
    sections.forEach(sec => {
        const id = sec.getAttribute('id');
        if (id) sectionMap.set(id, sec);
    });

    const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    const linkTarget = link.getAttribute('data-nav');
                    if (linkTarget === id) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, {
        // Trigger when section's middle is in the viewport
        rootMargin: '-40% 0px -55% 0px',
        threshold: 0
    });

    sectionMap.forEach(sec => activeObserver.observe(sec));

    // --- 4. Hero tilt interaction (preserved) ---
    const heroTilt = document.getElementById('hero-tilt');
    if (heroTilt) {
        heroTilt.addEventListener('mousemove', (e) => {
            const rect = heroTilt.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            heroTilt.style.transform = `rotateY(${x / 15}deg) rotateX(${-y / 15}deg)`;
        });
        heroTilt.addEventListener('mouseleave', () => {
            heroTilt.style.transform = 'rotateY(0deg) rotateX(0deg)';
        });
        heroTilt.addEventListener('touchend', (e) => {
            if (e.target.closest('.donut-item')) return;
            e.preventDefault();
            heroTilt.classList.toggle('is-active');
        });
    }

    // --- 5. Project filter buttons ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('flare-gradient', 'text-white', 'shadow-md', 'shadow-orange-500/20');
                b.classList.add('bg-zinc-900', 'border', 'border-zinc-800', 'text-zinc-300');
            });
            btn.classList.remove('bg-zinc-900', 'border', 'border-zinc-800', 'text-zinc-300');
            btn.classList.add('flare-gradient', 'text-white', 'shadow-md', 'shadow-orange-500/20');

            const filterValue = btn.getAttribute('data-filter');
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    setTimeout(() => card.style.opacity = '1', 50);
                } else {
                    card.style.opacity = '0';
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
        });
    });

    // --- 6. Contact form submission ---
    const contactForm = document.getElementById('contact-form');
    const successBanner = document.getElementById('form-success-banner');
    const errorBanner = document.getElementById('form-error-banner');
    const errorMsgText = document.getElementById('error-msg-text');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            successBanner.classList.add('hidden');
            errorBanner.classList.add('hidden');

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !subject || !message) {
                errorMsgText.textContent = 'Please fill out all required fields.';
                errorBanner.classList.remove('hidden');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errorMsgText.textContent = 'Please enter a valid email address.';
                errorBanner.classList.remove('hidden');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Sending...';

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    successBanner.classList.remove('hidden');
                    contactForm.reset();
                    setTimeout(() => successBanner.classList.add('hidden'), 6000);
                } else {
                    const data = await response.json().catch(() => null);
                    if (data && Object.hasOwn(data, 'errors')) {
                        errorMsgText.textContent = data["errors"].map(error => error["message"]).join(", ");
                    } else {
                        errorMsgText.textContent = 'Oops! There was a problem submitting your form.';
                    }
                    errorBanner.classList.remove('hidden');
                }
            } catch (error) {
                errorMsgText.textContent = 'Oops! There was a network problem. Please try again.';
                errorBanner.classList.remove('hidden');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Send Message</span><i class="fa-solid fa-paper-plane text-xs"></i>';
            }
        });
    }

    initTypewriter();
    initInteractiveBorder();
    initArtCanvas();
});

function initTypewriter() {
    const phrases = ["machine learning models.", "competitive algorithms.", "C# & Python apps.", "user-focused solutions."];
    const typewriterElement = document.getElementById('typewriter');
    if (!typewriterElement) return;

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeLoop() {
        const currentPhrase = phrases[phraseIndex];
        if (isDeleting) {
            charIndex--;
            typewriterElement.textContent = currentPhrase.substring(0, charIndex);
        } else {
            charIndex++;
            typewriterElement.textContent = currentPhrase.substring(0, charIndex);
        }

        let typeSpeed = isDeleting ? 40 : 90;
        if (!isDeleting && charIndex === currentPhrase.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500;
        }
        setTimeout(typeLoop, typeSpeed);
    }
    typeLoop();
}

function openProjectModal(title, description, tags, imgUrl) {
    const modal = document.getElementById('project-modal');
    const modalContent = document.getElementById('modal-content');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <div class="relative h-60 rounded-xl overflow-hidden mb-4 border border-zinc-800">
            <img src="${imgUrl}" alt="${title}" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60"></div>
        </div>
        <h3 class="text-2xl font-bold text-white mb-2">${title}</h3>
        <p class="text-zinc-300 text-sm leading-relaxed mb-4">${description}</p>
        <div class="flex flex-wrap gap-2 mb-6">
            ${tags.map(tag => `<span class="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-orange-400 text-xs font-mono font-medium">${tag}</span>`).join('')}
        </div>
        <div class="flex items-center gap-4 pt-4 border-t border-zinc-800">
            <a href="#projects" onclick="closeProjectModal()" class="px-5 py-2.5 rounded-xl flare-gradient text-white font-semibold text-sm shadow-lg shadow-orange-500/20 hover:scale-105 transition-all">Launch Live Demo</a>
            <a href="#projects" onclick="closeProjectModal()" class="px-5 py-2.5 rounded-xl glass-panel text-zinc-300 hover:text-white font-medium text-sm border border-zinc-700 transition-all">Source Code</a>
        </div>
    `;

    modal.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    const modalContent = document.getElementById('modal-content');
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

window.addEventListener('click', (e) => {
    const modal = document.getElementById('project-modal');
    if (e.target === modal) closeProjectModal();
});

// ==========================================
// INTERACTIVE CONTACT FORM BORDER LOGIC
// ==========================================
function initInteractiveBorder() {
    const canvas = document.getElementById('contactBorderCanvas');
    const container = document.getElementById('contact-form');
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        const rect = container.getBoundingClientRect();
        canvas.width = Math.max(100, rect.width);
        canvas.height = Math.max(100, rect.height);
    }

    resizeCanvas();

    const mouse = { x: -10000, y: -10000 };

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        let canvasX = (e.clientX - rect.left) * scaleX;
        let canvasY = (e.clientY - rect.top) * scaleY;

        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
            mouse.x = canvasX;
            mouse.y = canvasY;
        } else {
            mouse.x = -10000;
            mouse.y = -10000;
        }
    });

    class PerimeterPixel {
        constructor(border, x, y, index, edge) {
            this.border = border;
            this.originX = x;
            this.originY = y;
            this.x = x;
            this.y = y;

            const diag = border.diag;
            this.size = Math.max(3, Math.min(10, Math.floor(diag / 70)));
            this.index = index;

            this.left = border.left;
            this.right = border.right;
            this.top = border.top;
            this.bottom = border.bottom;
            this.perimeterLength = border.perimeterLength;

            let startOffset;
            if (edge === 'top') startOffset = (x - this.left);
            else if (edge === 'right') startOffset = (this.right - this.left) + (y - this.top);
            else if (edge === 'bottom') startOffset = (this.right - this.left) + (this.bottom - this.top) + (this.right - x);
            else startOffset = (this.right - this.left) + (this.bottom - this.top) + (this.right - this.left) + (this.bottom - y);

            this.startPhase = startOffset / this.perimeterLength;
            this.baseSpeed = this.perimeterLength / 700;
            this.speed = this.baseSpeed * (0.7 + Math.sin(index) * 0.3);
            this.phase = index * 0.6;

            this.vx = 0;
            this.vy = 0;
            this.ease = 0.08;
            this.friction = 0.92;
        }

        perimeterToXY(dist) {
            const L = this.perimeterLength;
            let d = ((dist % L) + L) % L;
            const w = this.right - this.left;
            const h = this.bottom - this.top;
            if (d < w) return { x: this.left + d, y: this.top };
            d -= w;
            if (d < h) return { x: this.right, y: this.top + d };
            d -= h;
            if (d < w) return { x: this.right - d, y: this.bottom };
            d -= w;
            return { x: this.left, y: this.bottom - d };
        }

        getTargetPosition() {
            const t = Date.now() / 1000;
            const distance = this.speed * t * 60 + this.phase + this.startPhase * this.perimeterLength;
            return this.perimeterToXY(distance);
        }

        getColor() {
            const t = Date.now() / 600;
            const hue = 25 + (Math.sin(this.originX * 0.01 + this.originY * 0.01 + t) * 15);
            return `hsl(${hue}, 92%, 65%)`;
        }

        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.strokeStyle = this.getColor();
            ctx.lineWidth = 5;
            ctx.stroke();
        }

        update() {
            const target = this.getTargetPosition();
            const centerX = this.x + this.size / 2;
            const centerY = this.y + this.size / 2;
            const dx = mouse.x - centerX;
            const dy = mouse.y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const effectiveRadius = this.border.diag * 0.04;

            if (dist < effectiveRadius) {
                const angle = Math.atan2(dy, dx);
                const intensity = Math.cos((dist / effectiveRadius) * Math.PI * 0.5);
                const force = - (effectiveRadius * 0.8) * intensity * intensity;
                this.vx += force * Math.cos(angle);
                this.vy += force * Math.sin(angle);
                const perpAngle = angle + Math.PI / 2;
                const swirl = Math.sin(dist * 0.03) * 1.0 * intensity;
                this.vx += swirl * Math.cos(perpAngle);
                this.vy += swirl * Math.sin(perpAngle);
            }

            this.vx *= this.friction;
            this.vy *= this.friction;
            this.x += this.vx + (target.x - this.x) * this.ease;
            this.y += this.vy + (target.y - this.y) * this.ease;
        }

        reset() {
            this.x = this.originX;
            this.y = this.originY;
            this.vx = 0;
            this.vy = 0;
        }
    }

    class WaveBorder {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.diag = Math.sqrt(width * width + height * height);

            const minDim = Math.min(width, height);
            this.offset = Math.max(20, Math.min(100, Math.floor(minDim * 0.07)));

            this.left = this.offset;
            this.right = width - this.offset;
            this.top = this.offset;
            this.bottom = height - this.offset;

            if (this.right < this.left) this.right = this.left + 10;
            if (this.bottom < this.top) this.bottom = this.top + 10;

            this.pixelSpacing = Math.max(4, Math.min(16, Math.floor(this.diag * 0.014)));
            this.perimeterLength = 2 * ((this.right - this.left) + (this.bottom - this.top));

            this.pixels = [];
            this.generateBorder();
        }

        generateBorder() {
            this.pixels = [];
            const step = this.pixelSpacing;
            const left = this.left, right = this.right, top = this.top, bottom = this.bottom;
            let idx = 0;
            for (let x = left; x <= right; x += step) this.pixels.push(new PerimeterPixel(this, x, top, idx++, 'top'));
            for (let y = top + step; y <= bottom - step; y += step) this.pixels.push(new PerimeterPixel(this, right, y, idx++, 'right'));
            for (let x = right - step; x >= left; x -= step) this.pixels.push(new PerimeterPixel(this, x, bottom, idx++, 'bottom'));
            for (let y = bottom - step; y >= top + step; y -= step) this.pixels.push(new PerimeterPixel(this, left, y, idx++, 'left'));
        }

        resize(width, height) {
            this.width = width; this.height = height;
            this.diag = Math.sqrt(width * width + height * height);
            const minDim = Math.min(width, height);
            this.offset = Math.max(20, Math.min(100, Math.floor(minDim * 0.07)));
            this.left = this.offset; this.right = width - this.offset;
            this.top = this.offset; this.bottom = height - this.offset;
            if (this.right < this.left) this.right = this.left + 10;
            if (this.bottom < this.top) this.bottom = this.top + 10;
            this.pixelSpacing = Math.max(4, Math.min(16, Math.floor(this.diag * 0.014)));
            this.perimeterLength = 2 * ((this.right - this.left) + (this.bottom - this.top));
            this.generateBorder();
        }

        draw(ctx) { this.pixels.forEach(p => p.draw(ctx)); }
        update() { this.pixels.forEach(p => p.update()); }
        flatten() { this.pixels.forEach(p => p.reset()); }
    }

    let waveBorder = new WaveBorder(canvas.width, canvas.height);

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resizeCanvas();
            waveBorder.resize(canvas.width, canvas.height);
        }, 200);
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        waveBorder.update();
        waveBorder.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate();
}

// ==========================================
// GENERATIVE ART CANVAS LOGIC
// ==========================================
function initArtCanvas() {
    const canvas = document.getElementById('artCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width > 0 ? rect.width : canvas.parentElement.offsetWidth;
        canvas.height = rect.height > 0 ? rect.height : canvas.parentElement.offsetHeight;
        drawBackground();
    }

    function drawBackground() {
        ctx.fillStyle = '#0d0d10';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 1.5
        );
        gradient.addColorStop(0, 'rgba(249, 115, 22, 0.1)');
        gradient.addColorStop(1, 'rgba(13, 13, 16, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    class LineAnimator {
        constructor(ctx) {
            this.ctx = ctx;
            this.currentAnimation = null;
        }

        drawAnimatedPath(points, options = {}) {
            return new Promise((resolve) => {
                if (!points || points.length < 2) return resolve();
                const { duration = 600, color = 'rgba(249, 115, 22, 0.9)', lineWidth = 3, ease = (t) => 1 - Math.pow(1 - t, 3) } = options;

                const segments = [];
                let totalLength = 0;
                for (let i = 0; i < points.length - 1; i++) {
                    const dx = points[i + 1][0] - points[i][0];
                    const dy = points[i + 1][1] - points[i][1];
                    const len = Math.sqrt(dx * dx + dy * dy);
                    segments.push(len);
                    totalLength += len;
                }

                if (totalLength === 0) return resolve();
                const startTime = Date.now();

                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easedProgress = ease(progress);
                    const currentLength = totalLength * easedProgress;

                    this.ctx.beginPath();
                    this.ctx.moveTo(points[0][0], points[0][1]);

                    let drawnLength = 0;
                    for (let i = 0; i < segments.length; i++) {
                        const segLen = segments[i];
                        if (drawnLength + segLen <= currentLength) {
                            this.ctx.lineTo(points[i + 1][0], points[i + 1][1]);
                            drawnLength += segLen;
                        } else {
                            const remaining = currentLength - drawnLength;
                            const t = segLen === 0 ? 0 : remaining / segLen;
                            const x = points[i][0] + (points[i + 1][0] - points[i][0]) * t;
                            const y = points[i][1] + (points[i + 1][1] - points[i][1]) * t;
                            this.ctx.lineTo(x, y);
                            break;
                        }
                    }

                    this.ctx.strokeStyle = color;
                    this.ctx.lineWidth = lineWidth;
                    this.ctx.lineCap = 'round';
                    this.ctx.lineJoin = 'round';
                    this.ctx.stroke();

                    if (progress < 1) {
                        this.currentAnimation = requestAnimationFrame(animate);
                    } else {
                        resolve();
                    }
                };

                if (this.currentAnimation) cancelAnimationFrame(this.currentAnimation);
                animate();
            });
        }

        async drawSequence(strokes, options = {}) {
            const { delayBetween = 80 } = options;
            for (const stroke of strokes) {
                await this.drawAnimatedPath(stroke, options);
                await this.delay(delayBetween);
            }
        }

        delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
        cancel() { if (this.currentAnimation) cancelAnimationFrame(this.currentAnimation); return Promise.resolve(); }
    }

    const animator = new LineAnimator(ctx);

    async function drawLetter(letter, x, y, width, height) {
        if (!letterDefinitions[letter]) return;
        const strokes = letterDefinitions[letter](width, height).map(stroke =>
            stroke.map(pt => [pt[0] + x, pt[1] + y])
        );
        const colors = ['rgba(249, 115, 22, 0.9)', 'rgba(251, 146, 60, 0.9)', 'rgba(234, 88, 12, 0.9)'];
        let i = 0;
        for (const stroke of strokes) {
            await animator.drawAnimatedPath(stroke, { duration: 250, color: colors[i % colors.length], lineWidth: 4 });
            i++;
        }
    }

    async function drawWord(word, startX, startY, letterWidth, letterHeight, spacing) {
        let currentX = startX;
        for (let i = 0; i < word.length; i++) {
            const letter = word[i].toUpperCase();
            if (letter === ' ') {
                currentX += letterWidth / 2 + spacing;
                continue;
            }
            await drawLetter(letter, currentX, startY, letterWidth, letterHeight);
            currentX += letterWidth + spacing;
            await animator.delay(100);
        }
    }

    async function triggerDraw() {
        await animator.cancel();
        resizeCanvas();

        const input = document.getElementById('wordInput');
        const word = input.value.trim().toUpperCase() || "LAITH";

        const padding = 60;
        const availableWidth = canvas.width - padding * 2;
        const letterWidth = Math.min(80, availableWidth / (word.length * 1.2));
        const letterHeight = letterWidth * 1.5;
        const spacing = letterWidth * 0.2;

        const totalWidth = word.length * (letterWidth + spacing) - spacing;
        const startX = (canvas.width - totalWidth) / 2;
        const startY = (canvas.height - letterHeight) / 2;

        await drawWord(word, startX, startY, letterWidth, letterHeight, spacing);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resizeCanvas();
            triggerDraw();
        }, 250);
    });

    document.getElementById('artBtnDraw').addEventListener('click', triggerDraw);

    document.getElementById('artBtnClear').addEventListener('click', async () => {
        await animator.cancel();
        resizeCanvas();
    });

    document.getElementById('wordInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            triggerDraw();
        }
    });

    setTimeout(triggerDraw, 500);
}
