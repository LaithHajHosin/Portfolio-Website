(function() {
    const canvas = document.getElementById('sparkCanvas');
    const ctx = canvas.getContext('2d');

    // ----- resize canvas to match scroll height -----
    let W, H;
    function resizeCanvas() {
        W = window.innerWidth;
        const bodyHeight = Math.max(document.body.scrollHeight, window.innerHeight * 2);
        H = bodyHeight;
        canvas.width = W;
        canvas.height = H;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // ----- spark state -----
    let spark = {
        active: false,
        drifting: false,
        x: 0, y: 0,
        vx: 0, vy: 0,
        age: 1.0,
        flicker: 0,
    };

    // ----- PARTICLE SYSTEM (REDUCED COUNT, SIMPLER DRAWING) -----
    let particles = [];
    const MAX_PARTICLES = 80;            // was 180 → 80 (much lighter)
    const DRIP_RATE = 0.4;                // slightly lower emission rate

    // mouse tracking
    let lastMouseX = null, lastMouseY = null;

    // line parameters (slightly fewer lines)
    const LINE_COUNT = 8;                 // was 10 → 8 (less to draw)
    const BASE_LINE_LENGTH = 18;           // slightly smaller
    const ACTIVE_LINE_LENGTH = 22;

    // ----- helper: normalize -----
    function normalize(dx, dy) {
        const len = Math.hypot(dx, dy);
        if (len < 0.001) return [0, 0];
        return [dx / len, dy / len];
    }

    // ----- particle class (simpler, less memory overhead) -----
    class Drip {
        constructor(x, y, vx, vy, age, colorHint) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.age = age;           
            this.decay = 0.01 + Math.random() * 0.02;
            this.size = 2 + Math.random() * 3;
            this.colorHint = colorHint; 
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.03;
            this.age -= this.decay;
        }
    }

    // ----- emit drips (less frequent) -----
    function emitDripsFromSpark() {
        if (!spark.active && !spark.drifting) return;
        if (spark.age < 0.2) return;
        if (Math.random() > 0.3) return;    // 30% chance per frame (was ~50%)

        const count = Math.floor(Math.random() * 2) + 1; // 1–2 drips (was 1–3)
        for (let i = 0; i < count; i++) {
            if (particles.length >= MAX_PARTICLES) {
                particles.shift();
            }

            const angle = (Math.random() * 0.8 - 0.4) + Math.PI/2;
            const speed = 0.7 + Math.random() * 1.2;
            const vx = Math.cos(angle) * speed * (Math.random() - 0.5) * 0.8;
            const vy = Math.sin(angle) * speed * (0.8 + Math.random() * 0.5);

            const offX = (Math.random() - 0.5) * 5;
            const offY = (Math.random() - 0.5) * 5;

            particles.push(new Drip(
                spark.x + offX,
                spark.y + offY,
                vx, vy,
                0.7 + Math.random() * 0.3,
                spark.active ? 0 : 1
            ));
        }
    }

    // ----- update particles -----
    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            if (p.age <= 0.01 || p.x < -100 || p.x > W + 100 || p.y < -100 || p.y > H + 200) {
                particles.splice(i, 1);
            }
        }
    }

    // ----- draw particles (SIMPLIFIED: only dots, no lines) -----
    function drawParticles() {
        for (let p of particles) {
            const opacity = p.age * 0.6;
            const hue = p.colorHint === 0 ? 45 : 60;
            // simple fill, no gradient per particle (much faster)
            ctx.fillStyle = `hsla(${hue}, 75%, 70%, ${opacity})`;
            ctx.shadowColor = '#ffdcaa';
            ctx.shadowBlur = 8 * p.age;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.7 * p.age, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    // ----- draw main spark (optimized line drawing) -----
    function drawMainSpark(x, y, age, flickerVal, isActive) {
        if (age <= 0.01) return;

        const lineCount = LINE_COUNT;
        const baseLength = isActive ? ACTIVE_LINE_LENGTH : BASE_LINE_LENGTH;
        const angleOffset = flickerVal * 0.3;   // less variation

        for (let i = 0; i < lineCount; i++) {
            const baseAngle = (i / lineCount) * Math.PI * 2;
            // simpler wiggle calculation
            const angle = baseAngle + 0.15 * Math.sin(flickerVal * 1.2 + i) + angleOffset;

            const dx = Math.cos(angle);
            const dy = Math.sin(angle);

            const startX = x + dx * 1.5;
            const startY = y + dy * 1.5;

            const lineLength = baseLength * (0.8 + 0.2 * Math.sin(flickerVal * 1.5 + i)) * age;
            const endX = startX + dx * lineLength;
            const endY = startY + dy * lineLength;

            // simpler color calculation
            const hue = isActive ? 48 : 60;
            const opacity = age * 0.9;

            // use a single gradient per line (still necessary for glow, but simplified)
            const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
            gradient.addColorStop(0, `hsla(${hue}, 80%, 75%, ${opacity})`);
            gradient.addColorStop(1, `hsla(${hue - 15}, 70%, 60%, 0)`);

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.lineWidth = 1.8 * age;
            ctx.strokeStyle = gradient;
            ctx.shadowColor = isActive ? '#ffdcaa' : '#bbaaff';
            ctx.shadowBlur = 12 * age;
            ctx.stroke();
        }
    }

    // ----- update spark -----
    function updateSpark() {
        if (spark.drifting) {
            spark.x += spark.vx * 11.0;
            spark.y += spark.vy * 11.0;
            spark.age = Math.max(0, spark.age - 0.014);
            spark.flicker += 0.08;

            const margin = 200;
            if (spark.x < -margin || spark.x > W + margin || spark.y < -margin || spark.y > H + margin || spark.age <= 0.02) {
                spark.drifting = false;
                spark.active = false;
                particles = [];   // clear particles when spark dies (reduces buildup)
            }
        } else if (spark.active) {
            spark.flicker += 0.09;
        }
    }

    // ----- draw background (simpler, fewer specks) -----
    function drawBackground() {
        ctx.fillStyle = '#0b0822';
        ctx.fillRect(0, 0, W, H);

        // fewer static specks (10 instead of 40)
        ctx.fillStyle = '#4f4790';
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.arc(50 + i * 120 % W, 80 + i * 70 % H, 1.0, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    // ----- main draw -----
    function drawCanvas() {
        drawBackground();
        drawParticles();
        if (spark.active || spark.drifting) {
            drawMainSpark(spark.x, spark.y, spark.age, spark.flicker, spark.active);
        }
        ctx.shadowBlur = 0;
    }

    // ----- animation loop (requestAnimationFrame) -----
    function tick() {
        updateSpark();
        emitDripsFromSpark();
        updateParticles();
        drawCanvas();
        requestAnimationFrame(tick);
    }
    tick();

    // ----- mouse handlers (unchanged, but efficient) -----
    function getCanvasCoords(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        let mx = (e.clientX - rect.left) * scaleX;
        let my = (e.clientY - rect.top) * scaleY;
        mx = Math.min(W, Math.max(0, mx));
        my = Math.min(H, Math.max(0, my));
        return { mx, my };
    }

    function onMouseDown(e) {
        if (e.button !== 0) return;
        e.preventDefault();
        const { mx, my } = getCanvasCoords(e);
        spark.drifting = false;
        spark.active = true;
        spark.age = 1.0;
        spark.x = mx;
        spark.y = my;
        spark.flicker = 0;
        lastMouseX = mx;
        lastMouseY = my;
        canvas.addEventListener('mousemove', onDrag);
    }

    function onDrag(e) {
        if (!spark.active) return;
        e.preventDefault();
        const { mx, my } = getCanvasCoords(e);
        lastMouseX = spark.x;
        lastMouseY = spark.y;
        spark.x = mx;
        spark.y = my;
    }

    function releaseSpark() {
        if (!spark.active) return;
        let dx = 1, dy = 1.2;
        if (lastMouseX !== null && lastMouseY !== null) {
            const movedX = spark.x - lastMouseX;
            const movedY = spark.y - lastMouseY;
            if (Math.hypot(movedX, movedY) > 0.3) {
                dx = movedX;
                dy = movedY;
            }
        }
        if (dx === 0 && dy === 0) { dx = 1; dy = 0.7; }
        const [normX, normY] = normalize(dx, dy);
        spark.vx = normX;
        spark.vy = normY;
        spark.active = false;
        spark.drifting = true;
        spark.age = 1.0;
        canvas.removeEventListener('mousemove', onDrag);
        lastMouseX = lastMouseY = null;
    }

    function onMouseUp(e) {
        if (e.button !== 0) return;
        if (spark.active) releaseSpark();
        canvas.removeEventListener('mousemove', onDrag);
    }

    function windowMouseUp(e) {
        if (e.button !== 0) return;
        if (spark.active) releaseSpark();
        canvas.removeEventListener('mousemove', onDrag);
    }

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', windowMouseUp);
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    window.addEventListener('beforeunload', () => {
        window.removeEventListener('mouseup', windowMouseUp);
    });
})();
