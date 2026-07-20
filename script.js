// =========================================
//   1. DOM ELEMENTS & INITIALIZATION
// =========================================
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxContainer = document.getElementById('lightbox-container');
const magnifier = document.getElementById('magnifier');

const modal = document.getElementById('project-modal');
const closeModalBtn = document.getElementById('close-modal');
const projectCards = document.querySelectorAll('.project-card');

const modalImg = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalTech = document.getElementById('modal-tech');
const modalDesc = document.getElementById('modal-desc');
const modalExtraMedia = document.getElementById('modal-extra-media'); 

const cursorDot = document.getElementById('custom-cursor-dot');
const cursorOutline = document.getElementById('custom-cursor-outline');
let mouse = { x: null, y: null };

// =========================================
//   2. CUSTOM CURSOR & TOP LAYER LOGIC
// =========================================
function bringCursorToFront() {
    try { cursorDot.hidePopover(); } catch(e) {}
    try { cursorOutline.hidePopover(); } catch(e) {}
    cursorDot.showPopover();
    cursorOutline.showPopover();
}

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    
    cursorDot.style.left = `${mouse.x}px`;
    cursorDot.style.top = `${mouse.y}px`;
    
    cursorOutline.animate({
        left: `${mouse.x}px`,
        top: `${mouse.y}px`
    }, { duration: 100, fill: "forwards" });
});

const interactables = document.querySelectorAll('a, button, .project-card, .extra-media img');
interactables.forEach(el => {
    el.addEventListener('mouseenter', () => cursorOutline.classList.add('hover-active'));
    el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hover-active'));
});

if (lightboxContainer) {
    lightboxContainer.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '0';
        cursorOutline.style.opacity = '0';
    });
    lightboxContainer.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
    });
}

bringCursorToFront();

// =========================================
//   3. PARTICLE SYSTEM
// =========================================
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1; 
        
        this.baseSpeedX = Math.random() - 0.5; 
        this.baseSpeedY = Math.random() * -1 - 0.5; 
        
        this.vx = this.baseSpeedX;
        this.vy = this.baseSpeedY;
        
        this.color = 'rgba(56, 189, 248, 0.4)'; 
    }

    update() {
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let interactionRadius = 150; 
            
            if (distance < interactionRadius) {
                let force = (interactionRadius - distance) / interactionRadius; 
                this.vx -= (dx / distance) * force * 1.5; 
                this.vy -= (dy / distance) * force * 1.5;
            }
        }

        this.vx += (this.baseSpeedX - this.vx) * 0.05; 
        this.vy += (this.baseSpeedY - this.vy) * 0.05;

        this.x += this.vx;
        this.y += this.vy;

        if (this.y < 0) {
            this.y = canvas.height;
            this.x = Math.random() * canvas.width;
        }
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
    }

    draw() {
        const fadeZone = 80;
        let scaleY = 1;
        let scaleX = 1;

        if (this.y < fadeZone) {
            scaleY = Math.max(0, this.y / fadeZone);
        } else if (this.y > canvas.height - fadeZone) {
            scaleY = Math.max(0, (canvas.height - this.y) / fadeZone);
        }

        if (this.x < fadeZone) {
            scaleX = Math.max(0, this.x / fadeZone);
        } else if (this.x > canvas.width - fadeZone) {
            scaleX = Math.max(0, (canvas.width - this.x) / fadeZone);
        }

        const finalScale = scaleY * scaleX;
        const currentSize = Math.max(0.1, this.size * finalScale); 

        ctx.globalAlpha = finalScale; 
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 10 * finalScale; 
        ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
        ctx.globalAlpha = 1.0; 
    }
}

const particleArray = [];
const numberOfParticles = 150; 
for (let i = 0; i < numberOfParticles; i++) {
    particleArray.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].update();
        particleArray[i].draw();
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

// =========================================
//   4. PROJECT MODALS & 3D TILT
// =========================================
projectCards.forEach(card => {
    card.addEventListener('click', () => {
        const imgSrc = card.querySelector('.project-image').src;
        const titleText = card.querySelector('h3').innerText;
        const techText = card.querySelector('.tech-stack').innerText;
        const descText = card.querySelector('p:not(.tech-stack)').innerText;
        const hiddenMedia = card.querySelector('.hidden-media');

        modalImg.src = imgSrc;
        modalTitle.innerText = titleText;
        modalDesc.innerText = descText;

        modalTech.innerHTML = '';
        const tags = techText.split('•').map(t => t.trim());
        tags.forEach(tag => {
            const tagLink = document.createElement('a');
            tagLink.href = "#";
            tagLink.className = 'tech-tag';
            tagLink.innerText = tag;
            
            tagLink.addEventListener('click', (e) => {
                e.preventDefault();
                clearAndCloseModal(); 
                filterProjectsByTag(tag); 
            });
            
            modalTech.appendChild(tagLink);
        });

        if (hiddenMedia) {
            modalExtraMedia.innerHTML = hiddenMedia.innerHTML;
            const injectedVideos = modalExtraMedia.querySelectorAll('video');
            injectedVideos.forEach(vid => vid.load());

            const injectedIframes = modalExtraMedia.querySelectorAll('iframe');
            injectedIframes.forEach(iframe => {
                iframe.addEventListener('mouseenter', () => {
                    cursorDot.style.opacity = '0';
                    cursorOutline.style.opacity = '0';
                });
                iframe.addEventListener('mouseleave', () => {
                    cursorDot.style.opacity = '1';
                    cursorOutline.style.opacity = '1';
                });
            });
        } else {
            modalExtraMedia.innerHTML = '';
        }

        const clickableImages = modal.querySelectorAll('img');
        clickableImages.forEach(img => {
            img.addEventListener('click', () => {
                lightboxImage.src = img.src; 
                magnifier.style.backgroundImage = `url(${img.src})`; 
                lightboxModal.showModal(); 
                bringCursorToFront(); 
            });
        });
        
        modal.showModal(); 
        bringCursorToFront(); 
    });

    card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10; 
        const rotateY = ((x - centerX) / centerX) * 10;
        card.style.transform = `perspective(1000px) scale(1.03) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)`;
    });
});

function clearAndCloseModal() {
    modal.close();
    modalExtraMedia.innerHTML = ''; 
}

closeModalBtn.addEventListener('click', clearAndCloseModal);

modal.addEventListener('click', (event) => {
    const dialogDimensions = modal.getBoundingClientRect();
    if (
        event.clientX < dialogDimensions.left ||
        event.clientX > dialogDimensions.right ||
        event.clientY < dialogDimensions.top ||
        event.clientY > dialogDimensions.bottom
    ) {
        clearAndCloseModal();
    }
});

// =========================================
//   5. LIGHTBOX & MAGNIFIER
// =========================================
lightboxContainer.addEventListener('mousemove', (event) => {
    magnifier.style.display = 'block';

    const rect = lightboxImage.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    magnifier.style.left = `${x}px`;
    magnifier.style.top = `${y}px`;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    magnifier.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
    
    const zoomLevel = 1.8;
    magnifier.style.backgroundSize = `${rect.width * zoomLevel}px ${rect.height * zoomLevel}px`;
});

lightboxContainer.addEventListener('mouseleave', () => {
    magnifier.style.display = 'none';
});

lightboxModal.addEventListener('click', (event) => {
    if (event.target === lightboxModal) {
        lightboxModal.close();
    }
});

// =========================================
//   6. DYNAMIC TAG FILTERING SYSTEM
// =========================================
const filterBanner = document.getElementById('filter-banner');
const filterText = document.getElementById('filter-text').querySelector('strong');
const clearFilterBtn = document.getElementById('clear-filter-btn');

function filterProjectsByTag(selectedTag) {
    projectCards.forEach(card => {
        const rawText = card.querySelector('.tech-stack').innerText;
        const cardTags = rawText.split('•').map(t => t.trim());
        
        if (cardTags.includes(selectedTag)) {
            card.style.display = 'block';
            card.style.animation = 'none';
            card.offsetHeight; 
            card.style.animation = 'slideUpCard 0.8s ease-out forwards';
        } else {
            card.style.display = 'none';
        }
    });

    filterText.innerText = selectedTag;
    filterBanner.style.display = 'flex';
    document.getElementById('work').scrollIntoView({ behavior: 'smooth' });
}

clearFilterBtn.addEventListener('click', () => {
    projectCards.forEach(card => {
        card.style.display = 'block';
    });
    filterBanner.style.display = 'none';
});

// =========================================
//   7. SCROLL REVEAL OBSERVER
// =========================================
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15, 
    rootMargin: "0px 0px -50px 0px" 
});

revealElements.forEach(el => revealObserver.observe(el));

// =========================================
//   8. KONAMI CODE EASTER EGG
// =========================================
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 
    'ArrowDown', 'ArrowDown', 
    'ArrowLeft', 'ArrowRight', 
    'ArrowLeft', 'ArrowRight', 
    'b', 'a'
];
let konamiPosition = 0; 

document.addEventListener('keydown', (event) => {
    if (event.key === konamiSequence[konamiPosition]) {
        konamiPosition++; 
        if (konamiPosition === konamiSequence.length) {
            triggerEasterEgg();
            konamiPosition = 0; 
        }
    } else {
        konamiPosition = 0;
        if (event.key === 'ArrowUp') {
            konamiPosition = 1;
        }
    }
});

function triggerEasterEgg() {
    document.body.classList.toggle('retro-mode');
    if (document.body.classList.contains('retro-mode')) {
        alert("CHEAT CODE ACTIVATED: Welcome to Retro Mode.");
    } else {
        alert("CHEAT CODE DEACTIVATED: Returning to Modern Reality.");
    }
}

// =========================================
//   9. AJAX CONTACT FORM SUBMISSION
// =========================================
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        
        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                formStatus.style.display = 'block';
                formStatus.style.color = 'var(--accent)';
                formStatus.innerText = "Thanks! Your message has been sent successfully.";
                contactForm.reset();
            } else {
                const data = await response.json();
                formStatus.style.display = 'block';
                formStatus.style.color = '#ef4444';
                formStatus.innerText = data.error || "Oops! There was a problem submitting your form.";
            }
        } catch (error) {
            formStatus.style.display = 'block';
            formStatus.style.color = '#ef4444';
            formStatus.innerText = "Oops! There was a network error. Please try again.";
        }
    });
}

// =========================================
//   10. SCROLL SPY NAVIGATION
// =========================================
// Grab all sections that have an ID, and all the links in the navbar
const scrollSections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const spyOptions = {
    // Triggers when at least 30% of the section is visible on screen
    threshold: 0.3, 
    // Offsets the trigger point slightly below the sticky navbar
    rootMargin: "-100px 0px -30% 0px" 
};

const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // 1. Remove the active class from every link
            navLinks.forEach(link => link.classList.remove('active'));
            
            // 2. Find the ID of the section currently on screen
            const activeId = entry.target.getAttribute('id');
            
            // 3. Find the matching link in the navbar and turn it on
            const activeLink = document.querySelector(`.nav-links a[href="#${activeId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}, spyOptions);

// Tell the observer to watch every section
scrollSections.forEach(section => spyObserver.observe(section));