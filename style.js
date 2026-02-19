// Get elements
const header = document.getElementById('resumeH');
const headerButtons = document.getElementById('headerButtons');
const rhombuses = document.querySelectorAll('.long-rhombus');

// Scroll effect
window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
        header.classList.add('shrink');
        headerButtons.classList.add('shrink');
    } else {
        header.classList.remove('shrink');
        headerButtons.classList.remove('shrink');
    }
});

// Rhombus animation variables
let time = 0;
const mouse = { x: 0, y: 0 };
let targetX = 0, targetY = 0;

document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
});

function animate() {
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
    
    requestAnimationFrame(animate);
}
animate();

// Utility functions (copy, download, scroll)
function copyToClipboard(text) {
    navigator.clipboard?.writeText(text).then(() => {
        const toast = document.getElementById('copyToast');
        toast.textContent = `📋 Copied: ${text}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }).catch(() => alert('Copy failed'));
}
function downloadPDF(btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⌛</span><span>SYNCING...</span>';
    setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '<span>⬇️</span><span>DOWNLOAD CV (PDF)</span>';
        const filename = 'Laith-HH-CV.pdf';
        
        fetch(filename)
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'C.V Laith Final.pdf';
            link.click();
            URL.revokeObjectURL(link.href);
        })
        .catch(error => {
            console.error('Error downloading file:', error);
            alert('Error downloading resume. Please check the file exists.');
        });
    }, 1500);
}


function downloadPDF2(btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⌛</span><span>SYNCING...</span>';
    setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '<span>⬇️</span><span>DOWNLOAD CV (PDF)</span>';
        alert('CV Downloaded');
    }, 1500);
}

function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
