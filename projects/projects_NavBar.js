(function() {
    // Fallback to current path if projectsData isn't found
    const currentPath = window.location.pathname;
    const currentHref = window.location.href;
    
    let currentProject = null;
    if (window.projectsData) {
        currentProject = window.projectsData.find(p => 
            currentPath.includes(p.url) || 
            currentHref.includes(p.url) ||
            (p.extra_information && currentPath.includes(p.extra_information.demo_path)) ||
            (p.extra_information && currentHref.includes(p.extra_information.demo_path))
        );
    }

    // Use the project URL as a unique ID, or fallback to the current path
    const projectId = currentProject ? currentProject.url : currentPath;

    // Manage "Like" state using LocalStorage
    const likeKey = 'projectLikes';
    let likes = JSON.parse(localStorage.getItem(likeKey) || '{}');
    if (!likes[projectId]) likes[projectId] = 0;

    // Inject CSS
    const style = document.createElement('style');
    style.innerHTML = `
        #floating-nav {
            position: fixed;
            bottom: 25px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 4px;
            background: rgba(20, 20, 20, 0.6);
            backdrop-filter: blur(15px) saturate(180%);
            -webkit-backdrop-filter: blur(15px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 50px;
            padding: 6px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.4);
            z-index: 9999;
            font-family: system-ui, -apple-system, sans-serif;
        }
        .nav-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #fff;
            font-size: 14px;
            font-weight: 500;
            border: none;
            cursor: pointer;
            text-decoration: none;
            background: transparent;
            padding: 10px 18px;
            border-radius: 50px;
            transition: all 0.2s ease;
            font-family: inherit;
        }
        .nav-item:hover {
            background: rgba(255, 255, 255, 0.15);
        }
        .nav-item svg {
            width: 18px;
            height: 18px;
            transition: transform 0.2s ease;
        }
        #like-btn.liked {
            background: #e74c3c;
            box-shadow: 0 0 15px rgba(231, 76, 60, 0.4);
        }
        #like-btn.liked:hover {
            background: #c0392b;
        }
        #like-btn.liked svg {
            fill: #fff;
            transform: scale(1.1);
        }
        .pop {
            animation: pop 0.3s ease;
        }
        @keyframes pop {
            0% { transform: scale(1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1); }
        }
        /* Mobile adjustments */
        @media (max-width: 600px) {
            #floating-nav {
                bottom: 15px;
            }
            .nav-item {
                padding: 8px 14px;
                font-size: 13px;
            }
        }
    `;
    document.head.appendChild(style);

    // Create the HTML structure
    const navBar = document.createElement('nav');
    navBar.id = 'floating-nav';
    
    // SVG Icons
    const homeIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
    const heartIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;

    const isLiked = likes[projectId] > 0;
    
    navBar.innerHTML = `
        <button class="nav-item" id="home-btn" type="button" aria-label="Go back">
            ${homeIcon}
            <span>Home</span>
        </button>
        <button class="nav-item ${isLiked ? 'liked' : ''}" id="like-btn" type="button">
            ${heartIcon}
            <span class="like-count">${likes[projectId]}</span>
        </button>
    `;
    
    document.body.appendChild(navBar);

    // ---- HOME / BACK BUTTON ----
    const homeBtn = document.getElementById('home-btn');
    homeBtn.addEventListener('click', () => {
        // history.length is 1 only when this is the very first page in the tab session.
        // If it's greater, there is at least one entry behind us.
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // No back history — send them to the portfolio home
            window.location.href = 'https://laithhajhosin.github.io/Portfolio-Website/';
        }
    });

    // ---- LIKE BUTTON ----
    const likeBtn = document.getElementById('like-btn');
    likeBtn.addEventListener('click', () => {
        if (!likes[projectId]) likes[projectId] = 0;
        
        // Trigger pop animation
        likeBtn.classList.remove('pop');
        void likeBtn.offsetWidth; // Reflow trick to restart animation
        likeBtn.classList.add('pop');
        
        if (likeBtn.classList.contains('liked')) {
            likes[projectId]--;
            likeBtn.classList.remove('liked');
        } else {
            likes[projectId]++;
            likeBtn.classList.add('liked');
        }
        
        likeBtn.querySelector('.like-count').innerText = likes[projectId];
        localStorage.setItem(likeKey, JSON.stringify(likes));
    });
})();