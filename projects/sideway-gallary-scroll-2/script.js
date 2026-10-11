const section = document.getElementById('hSection');
    const track = document.getElementById('hTrack');
    
    // Smooth interpolation variables
    let targetX = 0;
    let currentX = 0;
    const ease = 0.1; // Lower = smoother/slower catchup, Higher = snappier

    function updateScroll() {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        const sectionHeight = section.offsetHeight;
        
        // Calculate the total scrollable distance of the section
        // We start the animation when the top hits the bottom of the screen (rect.top < vh)
        // We end when the bottom hits the top of the screen (rect.bottom > 0)
        
        const start = vh;
        const end = -sectionHeight + vh;
        
        if (rect.top < start && rect.bottom > 0) {
            // Calculate progress (0 to 1)
            const totalScroll = start - end;
            const currentScroll = start - rect.top;
            let progress = currentScroll / totalScroll;
            
            // Clamp progress between 0 and 1
            progress = Math.max(0, Math.min(1, progress));
            
            // Calculate the translate distance
            const trackWidth = track.scrollWidth - window.innerWidth;
            targetX = -trackWidth * progress;
        }
    }

    function animate() {
        // Lerp for buttery smooth scrolling
        currentX += (targetX - currentX) * ease;
        track.style.transform = `translateX(${currentX}px)`;
        requestAnimationFrame(animate);
    }

    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    
    // Init
    updateScroll();
    animate();
