(function() {
    const canvas = document.getElementById('borderCanvas');
    const ctx = canvas.getContext('2d');

    // match canvas to container size
    function resizeCanvas() {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        canvas.width = Math.max(100, rect.width);
        canvas.height = Math.max(100, rect.height);
    }
    
    resizeCanvas();
    
    // window.addEventListener('resize', () => {
    //     resizeCanvas();
    //     if (waveBorder) waveBorder.resize(canvas.width, canvas.height);
    // });

    // ========== ALWAYS-ACTIVE MOUSE ==========
    const mouse = {
        x: -10000,
        y: -10000,
        // always active (no button check)
    };

    function updateMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        let canvasX = (e.clientX - rect.left) * scaleX;
        let canvasY = (e.clientY - rect.top) * scaleY;
        canvasX = Math.max(0, Math.min(canvas.width, canvasX));
        canvasY = Math.max(0, Math.min(canvas.height, canvasY));
        mouse.x = canvasX;
        mouse.y = canvasY;
    }

    canvas.addEventListener('mousemove', updateMousePos);
    canvas.addEventListener('mouseenter', updateMousePos);
    canvas.addEventListener('mouseleave', () => {
        mouse.x = -10000;
        mouse.y = -10000;
    });

    // ========== ROAMING PIXEL (always interactive) ==========
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
            
            // starting offset
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
            const hue = ( (this.originX * 0.2 + this.originY * 0.2 + this.index * 12) + t * 35 ) % 360;
            return `hsl(${hue}, 92%, 70%)`;
        }

        draw(ctx) {
            // ctx.fillStyle = this.getColor();
            // ctx.fillRect(this.x, this.y, this.size, this.size);
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.strokeStyle = this.getColor(); // Purple outline
            ctx.lineWidth = 5;
            ctx.stroke();
        }

        update() {
            const target = this.getTargetPosition();
            
            // ALWAYS apply mouse force (no button condition)
            const centerX = this.x + this.size/2;
            const centerY = this.y + this.size/2;
            const dx = mouse.x - centerX;
            const dy = mouse.y - centerY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const effectiveRadius = this.border.diag * 0.04; // 20% of diagonal
            
            if (dist < effectiveRadius) {
                const angle = Math.atan2(dy, dx);
                const intensity = Math.cos((dist / effectiveRadius) * Math.PI * 0.5);
                const force = - (effectiveRadius * 0.8) * intensity * intensity;
                this.vx += force * Math.cos(angle);
                this.vy += force * Math.sin(angle);
                const perpAngle = angle + Math.PI/2;
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

    // ---------- BORDER (proportional) ----------
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
            this.perimeterLength = 2 * ( (this.right - this.left) + (this.bottom - this.top) );
            
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
            this.perimeterLength = 2 * ( (this.right - this.left) + (this.bottom - this.top) );
            this.generateBorder();
        }

        draw(ctx) { this.pixels.forEach(p => p.draw(ctx)); }
        update() { this.pixels.forEach(p => p.update()); }
        flatten() { this.pixels.forEach(p => p.reset()); }
    }

    let waveBorder = new WaveBorder(canvas.width, canvas.height);

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        waveBorder.update();
        waveBorder.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate();

    // reset button
    document.getElementById('resetBorderBtn').addEventListener('click', () => {
        waveBorder.flatten();
    });

    mouse.x = -10000;
    mouse.y = -10000;
})();
