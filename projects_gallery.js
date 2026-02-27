(function() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');
        const buttonsBar = document.getElementById('filterBar');

        function filterGallery(category) {
            projectCards.forEach(card => {
                const cardCat = card.getAttribute('data-category');
                card.style.display = (category === 'all' || cardCat === category) ? 'flex' : 'none';
            });
        }

        // add click listeners
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const filterValue = this.getAttribute('data-filter');
                filterGallery(filterValue);
            });
        });

        const filterSwitch = document.getElementById('filterSwitch');
        filterSwitch.addEventListener('click' , function () {
            filterSwitch.classList.toggle('active');
            if(filterSwitch.classList.contains('active'))
            {
                buttonsBar.style.display = 'flex';
            }
            else{
                buttonsBar.style.display = 'none';
                filterGallery('all');
                filterButtons.forEach(b => b.classList.remove('active'));
                filterButtons[0].classList.add('active');
            }
        });

       
        // Method 2: Monitor specific element
        const el = document.getElementById('headline1');
        const el2 = document.getElementById('headline2');
        setInterval(() => {
            if(window.scrollY > 10)
            {
                el.style.transform = `translateY(-${el.getBoundingClientRect().top*3}px) rotate(${el.getBoundingClientRect().top}deg)`;
                el2.style.transform = `translateY(-${el.getBoundingClientRect().top*3}px) rotate(-${el.getBoundingClientRect().top}deg)`;
            }
            else{
                el.style.transform = `translateY(0) rotate(0)`;
                el2.style.transform = `translateY(0) rotate(0)`;
            }
        }, 30); // Logs position every 100ms while scrolling


        // ensure 'all' active on load (if not already)
        const activeBtn = document.querySelector('.filter-btn.active');
        if (!activeBtn || activeBtn.getAttribute('data-filter') !== 'all') {
            const allBtn = document.querySelector('[data-filter="all"]');
            if (allBtn) {
                allBtn.classList.add('active');
                filterGallery('all');
            }
        } else {
            // just to be safe, call with 'all' (already visible)
            filterGallery('all');
        }
    })();

