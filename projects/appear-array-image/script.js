const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 500;
canvas.height = 600;
class Cell {
    constructor(effect , x , y)
    {
        this.effect = effect;
        this.x = x;
        this.y = y;
        this.width = this.effect.cellWidth;
        this.height = this.effect.cellHeight;

        // take the image we want to use
        this.image = document.getElementById('img1');
        
        ////////////////////////////////////
        // this part is for the animation 

        // this slide indicates the value we add to x or y
        this.slidex = 0; 
        this.slidey = 0; 
        // this is the distance from the mouse
        this.vx = 0 ;
        this.vy = 0 ;
        //
        this.ease = 0.01;
        this.friction = 0.9;
        //
        this.positionX = canvas.width;
        this.positionY = canvas.height * 0.5;
        this.speedX ;
        this.speedY ;
    }
    draw(context)
    {
        // this function draws the image into the canvas
        // the parameters :
        // (1) the image we want to draw
        // next 4 ones are the part we want to draw from the source image
        // next 4 are the (x,y) where to draw the image then (width,height) to give the image a size   

        // (for first frature )
        // context.drawImage(this.image,this.x + this.slidex,this.y+this.slidey,this.width,this.height, this.x, this.y,this.width,this.height);

        context.drawImage(this.image,this.x + this.slidex,this.y+this.slidey,this.width,this.height, this.positionX, this.positionY,this.width,this.height);
        
        // context.strokeRect(this.x , this.y , this.width, this.height);
    }
    update(){
        // this function describes how the cell is updating at each frame

        // (frature 1)
        // this.slidex = Math.random() * 10;

        // (frature 2)
        // this.slidex += 1;
        const xxxx =  Math.random()*50;
        const yyyy =  Math.random() * 50;
        this.speedX = (this.x - this.positionX) / xxxx;
        this.speedY = (this.y - this.positionY) /yyyy;
        this.positionX += this.speedX;
        this.positionY += this.speedY;
        //

        const dx = this.effect.mouse.x - this.x;
        const dy = this.effect.mouse.y - this.y;
        const distance = Math.hypot(dx,dy);
        if(distance < this.effect.mouse.radius){
            // this part take force related to the distance from mouse
            const angle = Math.atan2(dy,dx);
            const force = distance / this.effect.mouse.radius ;
            this.vx = force * Math.cos(angle) * 2;
            this.vy = force * Math.sin(angle) * 2;
            
        } 
        this.slidex += (this.vx *= this.friction) - this.slidex * this.ease;
        this.slidey += (this.vy *= this.friction) - this.slidey * this.ease;

        //
        
    }
}

class Effect{
    constructor(canvas){
        // properties 
        this.canvas = canvas;
        this.height = this.canvas.height;
        this.width = this.canvas.width;
        this.cellWidth = canvas.width / 40;
        this.cellHeight = canvas.height / 50;
        // image grid to store all cells (empty at first)
        this.imageGrid = [];
        this.createGrid();
        // take the image we want to use
        this.mouse = {
            y : undefined,
            x :undefined,
            radius : 100
        };
        this.canvas.addEventListener('mousemove', e =>{
            this.mouse.x = e.offsetX;
            this.mouse.y = e.offsetY;
        })
        this.canvas.addEventListener('mouseleave', e =>{
            this.mouse.x = undefined;
            this.mouse.y = undefined;
        })
        

    }
    createGrid(){
        // push all cells in the canvas into the array
        for(let y = 0 ; y < this.height;y+=this.cellHeight){
            for(let x = 0; x < this.width; x+=this.cellWidth){
                this.imageGrid.push(new Cell(this, x , y));
            }
        }
    }
    render(context){
        
        // renders the cells in the cells array
        this.imageGrid.forEach((cell) => {
            cell.draw(context);
            cell.update();
        })
    }
}

const effect = new Effect(canvas);
effect.render(ctx);

function animate(){
    effect.render(ctx);
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
