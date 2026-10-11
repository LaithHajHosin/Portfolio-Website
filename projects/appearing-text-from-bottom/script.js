function splitTextForReveal() {
        const element = document.getElementById('revealText');
        const words = element.textContent.split(' ');
        element.innerHTML = ''; // Clear original text
        
        words.forEach((word, index) => {
            const wordWrapper = document.createElement('span');
            wordWrapper.className = 'reveal-word';
            
            const innerText = document.createElement('span');
            innerText.textContent = word;
            
            // Stagger the transition delay for each word
            innerText.style.transitionDelay = `${index * 0.06}s`;
            wordWrapper.appendChild(innerText);
            element.appendChild(wordWrapper);
        });

        // Trigger animation when scrolled into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.3 }); // Starts when 30% is visible

        observer.observe(element);
    }
    splitTextForReveal();
