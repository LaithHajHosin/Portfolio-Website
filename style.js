// Get elements
const header = document.getElementById('resumeH');
const headerButtons = document.getElementById('headerButtons');
const rhombuses = document.querySelectorAll('.long-rhombus');

// Scroll effect with throttling for mobile performance
let ticking = false;
window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(function() {
            if (window.scrollY > 50) {
                header.classList.add('shrink');
                headerButtons.classList.add('shrink');
            } else {
                header.classList.remove('shrink');
                headerButtons.classList.remove('shrink');
            }
            ticking = false;
        });
        ticking = true;
    }
});

// Rhombus animation - optimized for mobile
let time = 0;
const mouse = { x: 0, y: 0 };
let targetX = 0, targetY = 0;

// Throttled mouse move for mobile
document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// Disable heavy animations on mobile for performance
const isMobile = window.innerWidth <= 768;

function animate() {
    if (!isMobile) {
        time += 0.008;
        mouse.x += (targetX - mouse.x) * 0.05;
        mouse.y += (targetY - mouse.y) * 0.05;

        rhombuses.forEach((r, i) => {
            const speed = 0.4 + (i * 0.05);
            const amp = 15 + (i % 6) * 10;
            
            const hoverX = Math.sin(time * speed + i) * amp;
            const hoverY = Math.cos(time * speed * 0.9 + i) * amp;
            const rotate = Math.sin(time * 0.8 + i) * 4;
            
            const mouseInfluenceX = mouse.x * 20 * (0.2 + (i % 5) * 0.1);
            const mouseInfluenceY = mouse.y * 15 * (0.2 + (i % 5) * 0.1);
            
            r.style.transform = `
                translate(${hoverX + mouseInfluenceX}px, ${hoverY + mouseInfluenceY}px)
                rotate(${rotate}deg)
            `;
            
            r.style.opacity = 0.25 + Math.sin(time * 1.5 + i) * 0.1;
        });
    }
    requestAnimationFrame(animate);
}
animate();

// Copy to clipboard with mobile support
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`📋 Copied: ${text}`);
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast(`📋 Copied: ${text}`);
}

function showToast(message) {
    const toast = document.getElementById('copyToast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// Download PDF with better error handling
function downloadPDF(btn) {
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span><span>PREPARING...</span>';
    
    setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = originalText;
        
        // Create a simple text file as fallback (since the PDF might not exist)
        const content = `LAITH HAJ HOSIN - CV
================================
Date of Birth: 01.01.2003
Location: Salamiyah, Hama, Syria

EDUCATION
---------
• Bachelor in IT Engineering (Software Engineering)
Syrian Virtual University | 2022 - Present

• High School Degree (Scientific)
Ali Ben Abi Talib High School | 2021 | 81%

SKILLS
------
• Programming: C# (Excellent), Python (Very Good), C++ (Good), MySQL (Good)
• Software: Oracle DB, MS Office
• Languages: Arabic (Native), English (Advanced)
• Soft Skills: Problem Solving, Teamwork, Customer Service, Multitasking

EXPERIENCE
----------
• Retail Assistant | Automotive Shop, Salamiyah | 2022-2023
- Processing payments, customer service, stock management

• Student Support | Syrian Virtual University | 2023-Present
- Helping freshmen, organizing virtual meetings, academic guidance`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Laith_Haj_Hosin_CV.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast('✅ CV downloaded!');
    }, 1000);
}

function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        const yOffset = -100;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
}

// Handle orientation changes
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        window.scrollTo(0, window.scrollY);
    }, 100);
});

// Touch-friendly hover removal
document.addEventListener('touchstart', function() {}, {passive: true});
