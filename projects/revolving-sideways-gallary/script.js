document.addEventListener('DOMContentLoaded', () => {
            const viewport = document.getElementById('carouselViewport');
            const cards = Array.from(document.querySelectorAll('.callout-socials-card-w'));
            const numCards = cards.length;

            let progress = 0;       // Continuous rotation position
            let targetProgress = 0; // Target for smooth interpolation (inertia)
            let isDragging = false;
            let startX = 0;
            let currentX = 0;
            let autoScrollSpeed = 0.0008; // Continuous subtle ambient rotation

            // Oval dimensions (Elliptical path in 3D)
            const getRadius = () => {
                const width = window.innerWidth;
                if (width < 768) {
                    return { x: 380, z: 240, yDrop: 20 };
                }
                return { x: 620, z: 380, yDrop: 40 };
            };

            // Update oval 3D placement of each card
            function updateOvalLayout() {
                const { x: radiusX, z: radiusZ, yDrop } = getRadius();
                const angleStep = (Math.PI * 2) / numCards;

                cards.forEach((card, index) => {
                    const angle = index * angleStep + progress;
                    
                    // Coordinates on the 3D ellipse
                    const x = Math.sin(angle) * radiusX;
                    const z = Math.cos(angle) * radiusZ; 
                    
                    // Y curvature (center cards drop or arch subtly like on live site)
                    const normalizedZ = (z + radiusZ) / (2 * radiusZ); // 0 (back) to 1 (front)
                    const y = Math.pow(Math.sin(angle), 2) * yDrop;

                    // Rotation angles to face outward along the curve
                    const rotateY = (angle * 180) / Math.PI - 180;
                    
                    // Depth cueing: scale, opacity, and z-index based on Z position
                    const scale = 0.75 + normalizedZ * 0.35;
                    const opacity = 0.35 + normalizedZ * 0.65;
                    const brightness = 0.4 + normalizedZ * 0.6;
                    const zIndex = Math.round(normalizedZ * 100);

                    // Combine oval conveyor transform with active mouse tilt
                    const tiltX = card.dataset.tiltX || 0;
                    const tiltY = card.dataset.tiltY || 0;

                    card.style.transform = `
                        translate3d(${x}px, ${y}px, ${z}px) 
                        rotateY(${rotateY}deg) 
                        rotateX(${tiltX}deg) 
                        rotateY(${tiltY}deg) 
                        scale(${scale})
                    `;
                    card.style.opacity = opacity;
                    card.style.filter = `brightness(${brightness})`;
                    card.style.zIndex = zIndex;
                });
            }

            // Continuous animation frame with lerp damping
            function animate() {
                if (!isDragging) {
                    targetProgress += autoScrollSpeed;
                }
                // Smooth damping / inertia
                progress += (targetProgress - progress) * 0.08;
                updateOvalLayout();
                requestAnimationFrame(animate);
            }
            animate();

            // Drag / Touch Controls
            viewport.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                currentX = startX;
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const delta = e.clientX - currentX;
                currentX = e.clientX;
                targetProgress -= delta * 0.0035;
            });

            window.addEventListener('mouseup', () => {
                isDragging = false;
            });

            // Touch events for mobile
            viewport.addEventListener('touchstart', (e) => {
                isDragging = true;
                startX = e.touches[0].clientX;
                currentX = startX;
            }, { passive: true });

            window.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                const delta = e.touches[0].clientX - currentX;
                currentX = e.touches[0].clientX;
                targetProgress -= delta * 0.005;
            }, { passive: true });

            window.addEventListener('touchend', () => {
                isDragging = false;
            });

            // Mouse wheel support for scrolling the carousel
            viewport.addEventListener('wheel', (e) => {
                e.preventDefault();
                targetProgress += e.deltaY * 0.0012;
            }, { passive: false });

            // 3D Tilt Hover Effect on Individual Cards
            cards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const cardX = e.clientX - rect.left - rect.width / 2;
                    const cardY = e.clientY - rect.top - rect.height / 2;

                    const tiltX = -(cardY / (rect.height / 2)) * 12; // Max 12deg tilt
                    const tiltY = (cardX / (rect.width / 2)) * 12;

                    card.dataset.tiltX = tiltX;
                    card.dataset.tiltY = tiltY;
                });

                card.addEventListener('mouseleave', () => {
                    card.dataset.tiltX = 0;
                    card.dataset.tiltY = 0;
                });
            });

            // Adjust on resize
            window.addEventListener('resize', updateOvalLayout);
        });
