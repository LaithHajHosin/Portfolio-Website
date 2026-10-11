const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const numberOdParticles = 100;

let particlesArray = [];

// 
let titleElement = document.getElementById('title1');
let titleMesurements = titleElement.getBoundingClientRect();

let title = {
    x: titleMesurements.left,
    y: titleMesurements.top,
    width: titleMesurements.width,
    height: 10
}

console.log(title);

class particle{
    constructor(x ,y)
    {
        this.x = x;
        this.y = y;
        this.size =10;
        this.weight = Math.random() * 5 + 1;
        this.directionX = 1;
    }
    update()
    {
        if(this.y > canvas.height)
        {
            this.y = 0-this.size;
            this.weight = Math.random() * 5 +1;
            this.x = Math.random()*canvas.width * 1.3;
        }
        this.weight += 0.05;
        this.y += this.weight;
        this.x += this.directionX;

        // 
        if(this.x < title.x + title.width &&
            this.x + this.size > title.x &&
            this.y < title.y + title.height &&
            this.y + this.size > title.y 
        ) {
            this.y -= 7;
            this.weight *= -0.5;
        }
    }
    draw()
    {
        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(this.x , this.y , this.size, 0 , Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}
function init()
{
    for(let i = 0 ; i < numberOdParticles; i++)
    {
        const x = Math.random()*canvas.width;
        const y = 1;
        particlesArray.push(new particle(x , y));
    }
}

init();


function animate()
{
    ctx.fillStyle = 'rgba(255,255,255,0.01)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    for(let i = 0 ; i < numberOdParticles; i++)
    {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize' , function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    titleMesurements = titleElement.getBoundingClientRect();
    title = {
        x: titleMesurements.left,
        y: titleMesurements.top,
        width: titleMesurements.width,
        height: 10
    }

})
