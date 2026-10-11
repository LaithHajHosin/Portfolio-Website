// this event listener make sure that everything is loaded before showing anything 
        window.addEventListener('load', function () {

            // take the required elements
            const canvas = this.document.getElementById("canvas1");
            const ctx = canvas.getContext('2d');
            // canvas width is full screen
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // class to make the particle we are ganna use 
            class Particle {
                constructor(effect, x, y, color) {
                    // make effect instance in the particle class
                    this.effect = effect;
                    // this particle will have a random position in the canvas
                    this.x = Math.random() * this.effect.width;
                    this.y = Math.random() * this.effect.height;
                    // original posotion in the original picture
                    this.origin_x = Math.floor(x);
                    this.origin_y = Math.floor(y);
                    // assign a color and a size for the particle or the pixel 
                    this.color = color;
                    this.size = this.effect.sizeofparticle;
                    // velocity : is used to add force to particle position x, y
                    this.velocity_x = 0;
                    this.velocity_y = 0;
                    this.ease = 0.07;
                    // dx, dy : is the x,y distance from the mouse
                    this.dx = 0;
                    this.dy = 0;
                    // distane : is the distance from the mouse
                    this.distance;
                    // force : is used to add it to velocity
                    this.force = 0;
                    // angle : which side is the mouse at relative to particle
                    this.angle = 0;
                    // friction : used to add friction to particle (make move easily or hardly)
                    this.friction = 0.95;
                }
                // drawing method : draws the pixel in it's current properties
                draw(context) {
                    // filling color :
                    context.fillStyle = this.color;
                    // fill rect has 4 arguments initial position (x , y) coardinates and width and height of the drawn shape
                    context.fillRect(this.x, this.y, this.size, this.size);
                }
                // update method : updates the pixel position based on mouse movement (or we could update anything [color, position, size, ...])
                update() {
                    // dx, dy : are the distance of x and y from the pixel to the mouse 
                    this.dx = this.effect.mouse.x - this.x;
                    this.dy = this.effect.mouse.y - this.y;
                    // distance is calculated using pathagyrem theorem
                    this.distance = this.dx * this.dx + this.dy * this.dy;
                    // force is calculated based on the distance of the mouse inside the radius
                    this.force = -this.effect.mouse.radius / this.distance;
                    // if particle is inside the radius add velocity to particle using calcualted force
                    if (this.distance < this.effect.mouse.radius) {
                        // angle : is used to know the direction of pushing
                        this.angle = Math.atan2(this.dy, this.dx);
                        // add to x velocity by cos(angle) or direction
                        this.velocity_x = this.force * Math.cos(this.angle);
                        // add to y velocity by sin(angle) or direction
                        this.velocity_y = this.force * Math.sin(this.angle);
                    }
                    // multiply by friction to scale the force by the particle friction
                    this.x += (this.velocity_x *= this.friction) + (this.origin_x - this.x) * this.ease; // - 0.4 if you want the image to vibrate
                    this.y += (this.velocity_y *= this.friction) + (this.origin_y - this.y) * this.ease; // - 0.4 if you want the image to vibrate
                }
                warp() {
                    // warp : is to scater the particle
                    this.x = Math.random() * this.effect.width;
                    this.y = Math.random() * this.effect.height;
                    this.ease = 0.09;
                }
            }

            class Effect {
                constructor(width, height) {
                    // height and width of canvas
                    this.width = width;
                    this.height = height;
                    // array for storing all particles
                    this.particlesArray = [];
                    //////////////////////////////////
                    // defining the used image here
                    this.image = document.getElementById('image1');
                    //////////////////////////////////
                    // centerx and centery is the starting position of the image
                    // the second brackets is because the image has a width and height on her own 
                    this.centerx = (this.width * 0.5) - (this.image.width * 0.5);
                    this.centery = (this.height * 0.5) - (this.image.height * 0.5);
                    // here is the required size of the pixel 
                    this.sizeofparticle = 3;
                    // tracking the mouse movements to add interactivity
                    this.mouse = {
                        radius: 3000,
                        x: 0,
                        y: 0,
                    }
                    // event listener for mouse movements
                    window.addEventListener('mousemove', event => {
                        this.mouse.x = event.x;
                        this.mouse.y = event.y;
                    })
                }
                init(context) {
                    // draw the image 
                    context.drawImage(this.image, this.centerx, this.centery);
                    // this pixels variable takes all the pixels information of the canvas that are stored in the data array      
                    const pixels = context.getImageData(0, 0, this.width, this.height).data;

                    // loop throw all the pixels in the canvas (with defined size)
                    for (let i = 0; i < this.height; i += this.sizeofparticle) {
                        for (let j = 0; j < this.width; j += this.sizeofparticle) {
                            // if the alpha of the pixel is not transparent take its index (using convertion of 2d array) and store it in the particles array 
                            // taking index ( using important to understand method (2d -> 1d array method))
                            const index = (i * this.width + j) * 4;
                            // taking the alpha of the pixel to check it's tranparency
                            const alpha = pixels[index + 3];
                            if (alpha > 0) {
                                // taking 4 informations from array (red, green, blue)
                                const red = pixels[index];
                                const green = pixels[index + 1];
                                const blue = pixels[index + 2];;
                                // make it as a style proprety 
                                const color = 'rgb(' + red + ',' + green + ',' + blue + ')';
                                // push it in the array
                                this.particlesArray.push(new Particle(this, j, i, color));
                            }
                        }
                    }

                }
                // just to call each particle draw method
                draw(context) {
                    this.particlesArray.forEach(particle => particle.draw(context));
                }
                // just to call each particle update method
                update() {
                    this.particlesArray.forEach(particle => particle.update());
                }
                // just to call each particle warp method
                warp() {
                    this.particlesArray.forEach(particle => particle.warp());
                }
            }

            // define an effect and initialize it
            const effect = new Effect(canvas.width, canvas.height);
            effect.init(ctx);

            // animate everything by keep calling update and draw methods and clearing the canvas at each step
            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                effect.draw(ctx);
                effect.update();
                requestAnimationFrame(animate);
            }

            animate();

            // warp button to activate the warp method
            const warp_button = document.getElementById('wrapbutton');
            warp_button.addEventListener('click', () => {
                effect.warp();
            });


        })
