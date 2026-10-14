const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

// Detect if the user is on a mobile device
const isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.matchMedia("(max-width: 768px)").matches;

function setCanvasSize() {
    const aspectRatio = 500 / 600;
    let w = window.innerWidth * 0.8;
    let h = w / aspectRatio;

    if (h > window.innerHeight * 0.65) {
        h = window.innerHeight * 0.65;
        w = h * aspectRatio;
    }

    canvas.width = w;
    canvas.height = h;
}
setCanvasSize();

// 8 possible floating directions for maximum randomness
const floatDirections = [
    { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 0, y: 1 }, { x: 0, y: -1 },
    { x: 1, y: 1 }, { x: -1, y: -1 },
    { x: 1, y: -1 }, { x: -1, y: 1 }
];

class Cell {
    constructor(effect, x, y, isBorderCell) {
        this.effect = effect;
        this.x = x;
        this.y = y;
        this.isBorderCell = isBorderCell; 
        this.width = this.effect.cellWidth;
        this.height = this.effect.cellHeight;
        this.image = document.getElementById('img1');
        
        this.positionX = x;
        this.positionY = y;
        
        // 75% of border cells will float and be distorted
        this.shouldFloat = isBorderCell ? (Math.random() < 0.75) : false;
        
        if (this.shouldFloat) {
            const dir = floatDirections[Math.floor(Math.random() * floatDirections.length)];
            this.dirX = dir.x;
            this.dirY = dir.y;
            
            // Random distorted resting offset (up to 8 pixels away)
            this.offsetX = (Math.random() - 0.5) * 16;
            this.offsetY = (Math.random() - 0.5) * 16;
        } else {
            this.dirX = 0;
            this.dirY = 0;
            this.offsetX = 0;
            this.offsetY = 0;
        }
        
        // Extremely slow speed and tiny amplitude (barely obvious movement)
        this.floatSpeed = Math.random() * 0.002 + 0.001; 
        this.floatPhase = Math.random() * Math.PI * 2;
        this.floatAmplitude = Math.random() * 1 + 0.5; // Moves only 0.5 to 1.5 pixels
        
        this.ease = 0.05;
        
        this.targetX = x;
        this.targetY = y;
    }
    
    draw(context) {
        // Math.floor and +1 width/height completely remove the sub-pixel grid lines
        const w = Math.ceil(this.width) + 1;
        const h = Math.ceil(this.height) + 1;
        const sx = Math.floor(this.x);
        const sy = Math.floor(this.y);
        const dx = Math.floor(this.positionX);
        const dy = Math.floor(this.positionY);

        context.drawImage(this.image, sx, sy, w, h, dx, dy, w, h);
    }
    
    update(time) {
        // Determine target position based on state
        if (this.shouldFloat) {
            let isMouseNear = false;

            // Only check mouse proximity on desktop
            if (!isMobile && this.effect.mouse.x !== undefined) {
                const dx = this.effect.mouse.x - this.positionX;
                const dy = this.effect.mouse.y - this.positionY;
                const distance = Math.hypot(dx, dy);
                
                if (distance < this.effect.mouse.radius) {
                    isMouseNear = true;
                }
            }

            if (isMouseNear) {
                // Reassemble smoothly to exact original grid position
                this.targetX = this.x;
                this.targetY = this.y;
            } else {
                // Barely visible movement around the distorted position
                const offset = Math.sin(time * this.floatSpeed + this.floatPhase) * this.floatAmplitude;
                this.targetX = this.x + this.offsetX + (offset * this.dirX);
                this.targetY = this.y + this.offsetY + (offset * this.dirY);
            }
        } else {
            // Cells that don't float or inner cells just stay in place
            this.targetX = this.x;
            this.targetY = this.y;
        }

        // Move towards target using the cell's specific ease speed
        this.positionX += (this.targetX - this.positionX) * this.ease;
        this.positionY += (this.targetY - this.positionY) * this.ease;
    }
}

class Effect {
    constructor(canvas) {
        this.canvas = canvas;
        this.height = this.canvas.height;
        this.width = this.canvas.width;
        
        this.cols = 40;
        this.rows = 48;
        this.cellWidth = this.width / this.cols;
        this.cellHeight = this.height / this.rows;
        
        this.imageGrid = [];
        this.createGrid();
        
        this.mouse = { x: undefined, y: undefined, radius: 120 };
        
        // Only add mouse listeners for desktop
        if (!isMobile) {
            const getPointerPos = (clientX, clientY) => {
                const rect = canvas.getBoundingClientRect();
                this.mouse.x = clientX - rect.left;
                this.mouse.y = clientY - rect.top;
            };

            window.addEventListener('mousemove', e => getPointerPos(e.clientX, e.clientY));
            window.addEventListener('mouseleave', () => {
                this.mouse.x = undefined;
                this.mouse.y = undefined;
            });
        }
    }
    
    createGrid() {
        this.imageGrid = []; 
        const borderLayers = 3; 
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const x = col * this.cellWidth;
                const y = row * this.cellHeight;
                
                const isBorderCell = (
                    row < borderLayers || 
                    row >= this.rows - borderLayers || 
                    col < borderLayers || 
                    col >= this.cols - borderLayers
                );
                
                this.imageGrid.push(new Cell(this, x, y, isBorderCell));
            }
        }
    }

    triggerEntrance(mode) {
        if (mode === 3) {
            // One random point for all cells
            const pointX = Math.random() * this.width;
            const pointY = Math.random() * this.height;
            
            this.imageGrid.forEach(cell => {
                cell.positionX = pointX;
                cell.positionY = pointY;
                cell.ease = Math.random() * 0.05 + 0.01; 
            });
        } else if (mode === 2) {
            // From the left
            this.imageGrid.forEach(cell => {
                cell.positionX = -cell.width - Math.random() * 200;
                cell.positionY = cell.y;
                cell.ease = 0.05;
            });
        } else {
            // Random places (Mode 1)
            this.imageGrid.forEach(cell => {
                cell.positionX = Math.random() * this.width;
                cell.positionY = Math.random() * this.height;
                cell.ease = 0.05;
            });
        }
    }
    
    render(context, time) {
        this.imageGrid.forEach(cell => {
            cell.draw(context);
            cell.update(time);
        });
    }
}

let effect = new Effect(canvas);
effect.triggerEntrance(1); // Default entrance on load

let time = 0;
function animate() {
    time += 1; 
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    effect.render(ctx, time);
    requestAnimationFrame(animate);
}
animate();

// Button Event Listeners
document.getElementById('btn1').addEventListener('click', () => effect.triggerEntrance(1));
document.getElementById('btn2').addEventListener('click', () => effect.triggerEntrance(2));
document.getElementById('btn3').addEventListener('click', () => effect.triggerEntrance(3));

window.addEventListener('resize', () => {
    setCanvasSize();
    effect.width = canvas.width;
    effect.height = canvas.height;
    effect.cellWidth = canvas.width / effect.cols;
    effect.cellHeight = canvas.height / effect.rows;
    effect.createGrid();
    effect.triggerEntrance(1);
});