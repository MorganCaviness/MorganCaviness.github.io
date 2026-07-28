/**
 * MORGAN CAVINESS PORTFOLIO ENGINE
 * Organized & Modularized
 */

// =========================================
// 1. GLOBAL VARIABLES & DOM ELEMENTS
// =========================================
const canvas = document.getElementById('particle-canvas');
const ctx = canvas?.getContext('2d');

const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxContainer = document.getElementById('lightbox-container');
const magnifier = document.getElementById('magnifier');
const lightboxSubtitle = document.getElementById('lightbox-subtitle');
const lightboxPrevBtn = document.getElementById('lightbox-prev');
const lightboxNextBtn = document.getElementById('lightbox-next');

const modal = document.getElementById('project-modal');
const closeModalBtn = document.getElementById('close-modal');
const projectCards = document.querySelectorAll('.project-card');
const modalTitle = document.getElementById('modal-title');
const modalTech = document.getElementById('modal-tech');
const modalDesc = document.getElementById('modal-desc');
const modalExtraMedia = document.getElementById('modal-extra-media');

const cursorDot = document.getElementById('custom-cursor-dot');
const cursorOutline = document.getElementById('custom-cursor-outline');
let mouse = { x: null, y: null };

let currentGallery = [];
let currentImageIndex = 0;


// =========================================
// 2. CUSTOM CURSOR
// =========================================
function bringCursorToFront() {
    try { cursorDot?.hidePopover(); cursorOutline?.hidePopover(); } catch(e) {}
    cursorDot?.showPopover();
    cursorOutline?.showPopover();
}

// =========================================
// 2A. NOISE PARALLAX PHYSICS ENGINE
// =========================================
let noiseTargetX = 0;
let noiseTargetY = 0;
let noiseCurrentX = 0;
let noiseCurrentY = 0;

function renderNoiseParallax() {
    // LOWER EASING VALUE = MORE MOMENTUM / SLIDE
    // Lowered from 0.05 to 0.015 for a super silky, long momentum slide
    const ease = 0.015;
    
    noiseCurrentX += (noiseTargetX - noiseCurrentX) * ease;
    noiseCurrentY += (noiseTargetY - noiseCurrentY) * ease;
    
    document.body.style.setProperty('--noise-x', `${noiseCurrentX.toFixed(2)}px`);
    document.body.style.setProperty('--noise-y', `${noiseCurrentY.toFixed(2)}px`);
    
    requestAnimationFrame(renderNoiseParallax);
}
renderNoiseParallax();

window.addEventListener('mousemove', (event) => {
    // 1. Viewport coordinates for the Custom Cursor
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    
    // 2. Canvas-relative coordinates for the Particle System
    if (canvas) {
        const rect = canvas.getBoundingClientRect();
        canvas.mouseX = event.clientX - rect.left;
        canvas.mouseY = event.clientY - rect.top;
    }
    
    // 3. Update Custom Cursor DOM
    if(cursorDot) {
        cursorDot.style.left = `${mouse.x}px`;
        cursorDot.style.top = `${mouse.y}px`;
    }
    if(cursorOutline) {
        cursorOutline.animate({
            left: `${mouse.x}px`,
            top: `${mouse.y}px`
        }, { duration: 100, fill: "forwards" });
    }

    // 4. Update the Parallax Target
    const xOffset = (event.clientX / window.innerWidth - 0.5) * 2;
    const yOffset = (event.clientY / window.innerHeight - 0.5) * 2;

    // We set the target here, but the renderNoiseParallax() loop handles the actual slide!
    noiseTargetX = xOffset * -30;
    noiseTargetY = yOffset * -30;
});

// Dynamic Hover states for all interactive elements and text fields
document.addEventListener('mouseover', (e) => {
    // Text fields (input, textarea)
    if (e.target.closest('input, textarea')) {
        cursorOutline?.classList.add('text-active');
        cursorDot?.classList.add('text-active');
        cursorOutline?.classList.remove('hover-active');
    } 
    // Standard interactive elements
    else if (e.target.closest('a, button, .project-card, .extra-media img, .carousel-btn, .carousel-dot')) {
        cursorOutline?.classList.add('hover-active');
        cursorOutline?.classList.remove('text-active');
        cursorDot?.classList.remove('text-active');
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.closest('input, textarea')) {
        cursorOutline?.classList.remove('text-active');
        cursorDot?.classList.remove('text-active');
    }
    if (e.target.closest('a, button, .project-card, .extra-media img, .carousel-btn, .carousel-dot')) {
        cursorOutline?.classList.remove('hover-active');
    }
});

bringCursorToFront();

// =========================================
// 3. PARTICLE SYSTEM (BACKGROUND)
// =========================================
if (canvas && ctx) {
    function resizeCanvas() {
        // FIX: Lock the internal pixel grid to the exact screen dimensions
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
            // FIX: Use the canvas-relative mouse coordinates we calculated
            if (canvas.mouseX != null && canvas.mouseY != null) {
                let dx = canvas.mouseX - this.x;
                let dy = canvas.mouseY - this.y;
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

            if (this.y < 0) { this.y = canvas.height; this.x = Math.random() * canvas.width; }
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
        }
        
        draw() {
            const fadeZone = 80;
            let scaleY = 1, scaleX = 1;

            if (this.y < fadeZone) scaleY = Math.max(0, this.y / fadeZone);
            else if (this.y > canvas.height - fadeZone) scaleY = Math.max(0, (canvas.height - this.y) / fadeZone);

            if (this.x < fadeZone) scaleX = Math.max(0, this.x / fadeZone);
            else if (this.x > canvas.width - fadeZone) scaleX = Math.max(0, (canvas.width - this.x) / fadeZone);

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

    const particleArray = Array.from({ length: 150 }, () => new Particle());
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particleArray.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
}


// =========================================
// 4. DYNAMIC MODAL GENERATORS
// =========================================

// A. Auto-wrap captioned images & carousels
function initInlineCaptions(container) {
    // UPDATED: Now targets standalone images AND entire carousels
    const targets = container.querySelectorAll('img.show-caption:not(.carousel img), .carousel.show-caption');
    
    targets.forEach(el => {
        if (el.parentNode.tagName === 'FIGURE') return; 
        const subtitleText = el.getAttribute('data-subtitle');
        
        if (subtitleText) {
            const figure = document.createElement('figure');
            figure.className = 'inline-figure';
            
            const caption = document.createElement('figcaption');
            caption.className = 'inline-caption';
            caption.textContent = subtitleText;

            el.parentNode.insertBefore(figure, el);
            figure.appendChild(el);
            figure.appendChild(caption);
        }
    });
}

// B. Auto-build carousels
function initCarousels(container) {
    const carousels = container.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
        if (carousel.dataset.initialized) return;

        const images = Array.from(carousel.querySelectorAll(':scope > img'));
        if (images.length === 0) return;

        if (images.length === 1) {
            images[0].classList.add('carousel-slide');
            carousel.dataset.initialized = 'true';
            return;
        }

        const track = document.createElement('div');
        track.classList.add('carousel-track');
        images.forEach(img => {
            img.classList.add('carousel-slide');
            track.appendChild(img);
        });

        const prevBtn = document.createElement('button');
        prevBtn.className = 'carousel-btn prev';
        prevBtn.innerHTML = '‹';

        const nextBtn = document.createElement('button');
        nextBtn.className = 'carousel-btn next';
        nextBtn.innerHTML = '›';

        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'carousel-dots';

        carousel.appendChild(track);
        carousel.appendChild(prevBtn);
        carousel.appendChild(nextBtn);
        carousel.appendChild(dotsContainer);

        let currentIndex = 0;
        images.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(index); });
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.carousel-dot');

        function goToSlide(index) {
            currentIndex = (index + images.length) % images.length;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
        }

        prevBtn.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(currentIndex - 1); });
        nextBtn.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(currentIndex + 1); });

        carousel.dataset.initialized = 'true';
    });
}


// =========================================
// 5. PROJECT CARD LOGIC (MODAL OPEN)
// =========================================
projectCards.forEach(card => {
    // 3D Tilt Effect
    card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -10;
        const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 10;
        card.style.transform = `perspective(1000px) scale(1.03) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)`;
    });

    // Modal Open Logic
    card.addEventListener('click', () => {
        modalTitle.innerText = card.querySelector('h3').innerText;
        modalDesc.innerText = card.querySelector('p:not(.tech-stack)').innerText;
        
        modalTech.innerHTML = '';
        card.querySelector('.tech-stack').innerText.split('•').map(t => t.trim()).forEach(tag => {
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

        const hiddenMedia = card.querySelector('.hidden-media');
        currentGallery = [];

        if (hiddenMedia) {
            // Inject content FIRST
            modalExtraMedia.innerHTML = hiddenMedia.innerHTML;

           // NEW: Check if this project wants a Masonry Collage layout
            if (hiddenMedia.classList.contains('format-collage')) {
                modalExtraMedia.classList.add('collage-mode');
            } else {
                modalExtraMedia.classList.remove('collage-mode'); 
            }

            // Generate visual components based on the newly injected HTML
            initCarousels(modalExtraMedia);
            initInlineCaptions(modalExtraMedia);
            
            // Gather all images (including carousel images) for the lightbox
            const extraImgs = modalExtraMedia.querySelectorAll('img');
            extraImgs.forEach(img => {
                currentGallery.push({
                    src: img.src,
                    subtitle: img.getAttribute('data-subtitle') || ""
                });

                // Add lightbox click event
                img.addEventListener('click', () => {
                    currentImageIndex = currentGallery.findIndex(item => item.src === img.src);
                    updateLightboxView();
                    lightboxModal.showModal();
                    bringCursorToFront();
                });
            });
            
            // Fix iframe hovers
            modalExtraMedia.querySelectorAll('iframe').forEach(iframe => {
                iframe.addEventListener('mouseenter', () => { cursorDot.style.opacity = '0'; cursorOutline.style.opacity = '0'; });
                iframe.addEventListener('mouseleave', () => { cursorDot.style.opacity = ''; cursorOutline.style.opacity = ''; });
            });
        } else {
            modalExtraMedia.innerHTML = '';
        }

        modal.showModal();
        bringCursorToFront();
    });
});

function clearAndCloseModal() {
    modal.close();
    modalExtraMedia.innerHTML = '';
}
closeModalBtn.addEventListener('click', clearAndCloseModal);
modal.addEventListener('click', (e) => { if (e.target === modal) clearAndCloseModal(); });


// =========================================
// 6. LIGHTBOX & MAGNIFIER
// =========================================
function updateLightboxView() {
    const currentData = currentGallery[currentImageIndex];
    
    // 1. FIX: Instantly hide the old subtitle to prevent the ghosting lag
    lightboxSubtitle.style.display = 'none';
    
    // Update the main image source
    lightboxImage.src = currentData.src;
    
    // Wait for the new image to render before applying its specific subtitle
    lightboxImage.decode().then(() => {
        if (currentData.subtitle) {
            lightboxSubtitle.innerText = currentData.subtitle;
            lightboxSubtitle.style.backgroundImage = `url(${currentData.src})`;
            lightboxSubtitle.style.width = `${lightboxImage.clientWidth}px`;
            lightboxSubtitle.style.display = 'block';
        }
        magnifier.style.backgroundImage = `url(${currentData.src})`;
    }).catch(err => console.error("Image load error:", err));

    // Handle navigation button display
    const showNav = currentGallery.length > 1;
    lightboxPrevBtn.style.display = showNav ? 'flex' : 'none';
    lightboxNextBtn.style.display = showNav ? 'flex' : 'none';
    
    // 2. NEW: Silently preload adjacent images in the background
    if (showNav) {
        const nextImg = new Image();
        nextImg.src = currentGallery[(currentImageIndex + 1) % currentGallery.length].src;
        
        const prevImg = new Image();
        prevImg.src = currentGallery[(currentImageIndex - 1 + currentGallery.length) % currentGallery.length].src;
    }
}

function nextLightboxImage() { currentImageIndex = (currentImageIndex + 1) % currentGallery.length; updateLightboxView(); }
function prevLightboxImage() { currentImageIndex = (currentImageIndex - 1 + currentGallery.length) % currentGallery.length; updateLightboxView(); }

lightboxNextBtn?.addEventListener('click', (e) => { e.stopPropagation(); nextLightboxImage(); });
lightboxPrevBtn?.addEventListener('click', (e) => { e.stopPropagation(); prevLightboxImage(); });
document.addEventListener('keydown', (e) => {
    if (lightboxModal.open) {
        if (e.key === 'ArrowRight') nextLightboxImage();
        if (e.key === 'ArrowLeft') prevLightboxImage();
    }
});

// Hide the custom cursor ONLY when hovering over the zoomed lightbox image
lightboxImage?.addEventListener('mouseenter', () => { 
    cursorDot.style.opacity = '0'; 
    cursorOutline.style.opacity = '0'; 
});
lightboxImage?.addEventListener('mouseleave', () => { 
    cursorDot.style.opacity = ''; 
    cursorOutline.style.opacity = ''; 
});

// Magnifier Logic
lightboxImage?.addEventListener('mousemove', (event) => {
    magnifier.style.display = 'block';
    const rect = lightboxImage.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    magnifier.style.left = `${x}px`;
    magnifier.style.top = `${y}px`;
    magnifier.style.backgroundPosition = `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`;
    magnifier.style.backgroundSize = `${rect.width * 1.8}px ${rect.height * 1.8}px`;
});
lightboxImage?.addEventListener('mouseleave', () => magnifier.style.display = 'none');

// Close lightbox when clicking ANYWHERE (except nav buttons, which stop propagation)
lightboxModal?.addEventListener('click', () => { 
    lightboxModal.close(); 
});


// =========================================
// 7. DYNAMIC TAG FILTERING
// =========================================
const filterBanner = document.getElementById('filter-banner');
const filterText = document.getElementById('filter-text')?.querySelector('strong');
const clearFilterBtn = document.getElementById('clear-filter-btn');

function filterProjectsByTag(selectedTag) {
    projectCards.forEach(card => {
        const cardTags = card.querySelector('.tech-stack').innerText.split('•').map(t => t.trim());
        if (cardTags.includes(selectedTag)) {
            card.style.display = 'block';
            card.style.animation = 'none';
            card.offsetHeight;
            card.style.animation = 'slideUpCard 0.8s ease-out forwards';
        } else {
            card.style.display = 'none';
        }
    });
    if(filterText && filterBanner) {
        filterText.innerText = selectedTag;
        filterBanner.style.display = 'flex';
        document.getElementById('work').scrollIntoView({ behavior: 'smooth' });
    }
}

clearFilterBtn?.addEventListener('click', () => {
    projectCards.forEach(card => card.style.display = 'block');
    filterBanner.style.display = 'none';
});


// =========================================
// 8. SCROLL EFFECTS & SPY NAVIGATION
// =========================================
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const navLinks = document.querySelectorAll('.nav-links a');
const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`.nav-links a[href="#${entry.target.getAttribute('id')}"]`);
            if (activeLink) activeLink.classList.add('active');
        }
    });
}, { threshold: 0.3, rootMargin: "-100px 0px -30% 0px" });
document.querySelectorAll('section[id]').forEach(section => spyObserver.observe(section));


// =========================================
// 9. KONAMI CODE EASTER EGG
// =========================================
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiPosition = 0; 
document.addEventListener('keydown', (e) => {
    if (e.key === konamiSequence[konamiPosition]) {
        konamiPosition++; 
        if (konamiPosition === konamiSequence.length) {
            document.body.classList.toggle('retro-mode');
            alert(document.body.classList.contains('retro-mode') ? "CHEAT CODE ACTIVATED" : "CHEAT CODE DEACTIVATED");
            konamiPosition = 0; 
        }
    } else {
        konamiPosition = (e.key === 'ArrowUp') ? 1 : 0;
    }
});


// =========================================
// 10. AJAX CONTACT FORM
// =========================================
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(contactForm.action, {
            method: 'POST',
            body: new FormData(contactForm),
            headers: { 'Accept': 'application/json' }
        });
        formStatus.style.display = 'block';
        if (response.ok) {
            formStatus.style.color = 'var(--accent)';
            formStatus.innerText = "Thanks! Your message has been sent successfully.";
            contactForm.reset();
        } else {
            formStatus.style.color = '#ef4444';
            formStatus.innerText = (await response.json()).error || "Oops! There was a problem.";
        }
    } catch (error) {
        formStatus.style.display = 'block';
        formStatus.style.color = '#ef4444';
        formStatus.innerText = "Network error. Please try again.";
    }
});