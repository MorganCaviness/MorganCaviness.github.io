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

const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
const lightboxNextBtn = document.getElementById('lightbox-next-btn');
const lightboxBackBtn = document.getElementById('lightbox-back-btn');

// 2. Lightbox Capsule Event Listeners
lightboxPrevBtn?.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevents clicking the backdrop exit trigger
    currentImageIndex--;
    if (currentImageIndex < 0) currentImageIndex = currentGallery.length - 1;
    updateLightboxImage();
});

lightboxNextBtn?.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevents clicking the backdrop exit trigger
    currentImageIndex++;
    if (currentImageIndex >= currentGallery.length) currentImageIndex = 0;
    updateLightboxImage();
});

lightboxBackBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    lightboxModal.close();
});

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

// Hide cursor when leaving the browser window
document.addEventListener('mouseleave', () => {
    if (cursorDot) cursorDot.style.opacity = '0';
    if (cursorOutline) cursorOutline.style.opacity = '0';
});

// Show cursor when re-entering the browser window
document.addEventListener('mouseenter', () => {
    if (cursorDot) cursorDot.style.opacity = '1';
    if (cursorOutline) cursorOutline.style.opacity = '1';
});

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
            // NEW: translate3d forces the GPU to render the slide smoothly
            track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;
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
        
        if (card.dataset.enableTilt === 'true') {
            modal.classList.add('enable-tilt');
        } else {
            modal.classList.remove('enable-tilt');
        }
        
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
// 1. Pass the direction into the update function so it knows which way to slide
function nextLightboxImage() { 
    currentImageIndex = (currentImageIndex + 1) % currentGallery.length; 
    updateLightboxView('next'); 
}
function prevLightboxImage() { 
    currentImageIndex = (currentImageIndex - 1 + currentGallery.length) % currentGallery.length; 
    updateLightboxView('prev'); 
}

// 2. The upgraded Infinite-Slide Engine
function updateLightboxView(direction = 'none') {
    const currentData = currentGallery[currentImageIndex];
    const wrapper = document.querySelector('.lightbox-image-wrapper');
    
    // Instantly hide subtitle and wipe old clones (prevents spam-click buildup)
    lightboxSubtitle.style.transition = 'none';
    lightboxSubtitle.style.opacity = '0';
    document.querySelectorAll('.lightbox-clone').forEach(el => el.remove());

    let clone = null;

    // A. Clone the current image BEFORE changing it (only if we are actively sliding)
    if (direction !== 'none' && lightboxImage.src) {
        clone = lightboxImage.cloneNode(true);
        clone.id = ''; // Remove ID so we don't have duplicates
        clone.classList.add('lightbox-clone');
        
        // Lock the clone exactly where the old image was sitting
        clone.style.position = 'absolute';
        clone.style.width = `${lightboxImage.clientWidth}px`;
        clone.style.height = `${lightboxImage.clientHeight}px`;
        clone.style.margin = '0';
        clone.style.objectFit = 'contain';
        clone.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease';
        
        wrapper.appendChild(clone);
    }

    // B. Park the REAL image completely off-screen so it is ready to slide in
    lightboxImage.style.transition = 'none';
    lightboxImage.style.opacity = '0';
    
    if (direction === 'next') {
        lightboxImage.style.transform = 'translate3d(100vw, 0, 0)';
    } else if (direction === 'prev') {
        lightboxImage.style.transform = 'translate3d(-100vw, 0, 0)';
    } else {
        lightboxImage.style.transform = 'translate3d(0, 0, 0)'; // Initial open
    }

    // C. Swap the source and wait for it to decode in the background
    lightboxImage.src = currentData.src;

    lightboxImage.decode().then(() => {
        // Force the browser to acknowledge the off-screen start position
        void lightboxImage.offsetWidth;

        // D. Fire the animation! Slide the new image IN.
        lightboxImage.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease';
        lightboxImage.style.opacity = '1';
        lightboxImage.style.transform = 'translate3d(0, 0, 0)';

        // E. Slide the old clone OUT.
        if (clone) {
            if (direction === 'next') {
                clone.style.transform = 'translate3d(-100vw, 0, 0)';
            } else if (direction === 'prev') {
                clone.style.transform = 'translate3d(100vw, 0, 0)';
            }
            clone.style.opacity = '0'; // Soft fade out as it flies away
            
            // Delete the clone from the HTML once the animation is finished
            setTimeout(() => clone.remove(), 400); 
        }

        // F. Handle the subtitle
        if (currentData.subtitle) {
            lightboxSubtitle.innerText = currentData.subtitle;
            lightboxSubtitle.style.backgroundImage = `url(${currentData.src})`;
            lightboxSubtitle.style.width = `${lightboxImage.clientWidth}px`;
            lightboxSubtitle.style.display = 'block';
            
            // Allow the subtitle to fade in smoothly behind the image
            void lightboxSubtitle.offsetWidth;
            lightboxSubtitle.style.transition = 'opacity 0.3s ease';
            lightboxSubtitle.style.opacity = '1';
        } else {
            lightboxSubtitle.style.display = 'none';
        }
        magnifier.style.backgroundImage = `url(${currentData.src})`;

    }).catch(err => console.error("Image load error:", err));

    // G. Preload next/prev images silently
    const showNav = currentGallery.length > 1;
    lightboxPrevBtn.style.display = showNav ? 'flex' : 'none';
    lightboxNextBtn.style.display = showNav ? 'flex' : 'none';
    
    if (showNav) {
        const nextImg = new Image();
        nextImg.src = currentGallery[(currentImageIndex + 1) % currentGallery.length].src;
        const prevImg = new Image();
        prevImg.src = currentGallery[(currentImageIndex - 1 + currentGallery.length) % currentGallery.length].src;
    }
}

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

// =========================================
// BULLETPROOF SCROLL SPY
// =========================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    
    // 1. Calculate absolute positions on every scroll tick
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        // Triggers the highlight when the section reaches the top 1/3 of your screen
        if (window.scrollY >= sectionTop - (window.innerHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    // 2. Fail-Safe: If scrolled to the absolute bottom of the page, force the last link to glow.
    // This ensures "Contact" always lights up even if the section is too short to reach the top.
    if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - 10) {
        current = sections[sections.length - 1].getAttribute('id');
    }

    // 3. Apply the glows
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}, { passive: true }); // passive:true keeps the scrolling buttery smooth

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

// =========================================
// 11. UNIVERSAL 3D TILT & POP-OUT ENGINE
// =========================================

const mainModal = document.querySelector('.modal');
let currentlyPoppedElement = null; 

let mobilePill = document.getElementById('global-mobile-pill');
if (!mobilePill) {
    mobilePill = document.createElement('div');
    mobilePill.id = 'global-mobile-pill';
    document.body.appendChild(mobilePill);

    mobilePill.addEventListener('click', () => {
        if (currentlyPoppedElement) {
            const card = currentlyPoppedElement.closest('.project-card') || currentlyPoppedElement;
            card.click();
        }
    });

    mobilePill.addEventListener('touchstart', () => {
        if (navigator.vibrate) {
            try { navigator.vibrate(15); } catch (e) {}
        }
    }, { passive: true });
}

function applyDynamicTilt() {
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    const tiltElements = document.querySelectorAll(
        '.project-card, .modal.enable-tilt #modal-extra-media > *, .modal.enable-tilt .inline-figure'
    );
    
    const windowHeight = window.innerHeight;
    const centerY = windowHeight / 2;

    let closestElement = null;
    let closestDistance = Infinity;

    // 1. Pass 1: Find the SINGLE element closest to dead center
    tiltElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elCenterY = rect.top + (rect.height / 2);
        const distFromCenter = elCenterY - centerY;
        let percentage = distFromCenter / (windowHeight / 2);
        percentage = Math.max(-1, Math.min(1, percentage));

        const absDist = Math.abs(percentage);
        
        // Check if within center range AND closer than previous candidates
        if (absDist < 0.30 && absDist < closestDistance) {
            closestDistance = absDist;
            closestElement = el;
        }
    });

    // 2. Pass 2: Apply physics (ONLY closestElement pops out, all others tilt)
    tiltElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elCenterY = rect.top + (rect.height / 2);
        const distFromCenter = elCenterY - centerY;
        let percentage = distFromCenter / (windowHeight / 2);
        percentage = Math.max(-1, Math.min(1, percentage));

        let tiltX, scale, shadowY, shadowBlur, shadowAlpha;

        if (el === closestElement) {
            // THE POP STATE (Strictly 1 item at a time)
            tiltX = 0; 
            scale = 1.05; 
            shadowY = 20; 
            shadowBlur = 40; 
            shadowAlpha = 0.7;
        } else {
            // THE TILT STATE
            tiltX = percentage * 15; 
            scale = 1.0; 
            shadowY = 4; 
            shadowBlur = 10; 
            shadowAlpha = 0.3;
        }

        el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) scale(${scale})`;
        el.style.boxShadow = `0 ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, ${shadowAlpha})`;
    });

    // 3. Update HUD pill & trigger haptics
    if (closestElement) {
        const infoSrc = closestElement.querySelector('.project-info');
        if (infoSrc) {
            mobilePill.innerHTML = infoSrc.innerHTML;
            mobilePill.classList.add('visible');
        } else {
            mobilePill.classList.remove('visible');
        }

        if (currentlyPoppedElement !== closestElement) {
            currentlyPoppedElement = closestElement;
            if (closestElement.classList.contains('project-card') && navigator.vibrate) {
                try { navigator.vibrate(15); } catch (e) {}
            }
        }
    } else {
        currentlyPoppedElement = null;
        mobilePill.classList.remove('visible');
    }
}

window.addEventListener('scroll', () => requestAnimationFrame(applyDynamicTilt));
if (mainModal) {
    mainModal.addEventListener('scroll', () => requestAnimationFrame(applyDynamicTilt));
}

// =========================================
// 12. TACTILE HAPTIC FEEDBACK
// =========================================

function initHaptics() {
    // 1. Only run on touch devices
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    
    // 2. Exit immediately if the Vibration API isn't supported (iOS Safari)
    if (!navigator.vibrate) return; 

    // 3. Target every button that should feel physical
    const tactileElements = document.querySelectorAll(
        '.nav-links a, .close-btn, .btn, .filter-banner button, .carousel-btn'
    );

    tactileElements.forEach(el => {
        // 4. Use 'touchstart' for zero-latency response
        el.addEventListener('touchstart', () => {
            navigator.vibrate(15);
        }, { passive: true }); 
        // Note: { passive: true } tells the browser this won't block scrolling, keeping performance butter-smooth.
    });
}

// Boot up the haptic engine once the page loads
document.addEventListener('DOMContentLoaded', initHaptics);

// Track the index of the currently open project card
let currentProjectIndex = 0;

const modalPrevBtn = document.getElementById('modal-prev-btn');
const modalNextBtn = document.getElementById('modal-next-btn');
const modalBackBtn = document.getElementById('modal-back-btn');

// Helper function to open project by index
function openProjectByIndex(index) {
    const cards = Array.from(projectCards);
    if (index < 0) index = cards.length - 1;
    if (index >= cards.length) index = 0;
    
    currentProjectIndex = index;
    const targetCard = cards[currentProjectIndex];

    // Check data-enable-tilt
    if (targetCard.dataset.enableTilt === 'true') {
        modal.classList.add('enable-tilt');
    } else {
        modal.classList.remove('enable-tilt');
    }

    // Populate Modal Content
    const title = targetCard.querySelector('h3')?.textContent || '';
    const tech = targetCard.querySelector('.tech-stack')?.innerHTML || '';
    const desc = targetCard.querySelector('p:not(.tech-stack)')?.textContent || '';
    const hiddenMedia = targetCard.querySelector('.hidden-media');

    modalTitle.textContent = title;
    modalTech.innerHTML = tech;
    modalDesc.textContent = desc;
    modalExtraMedia.innerHTML = hiddenMedia ? hiddenMedia.innerHTML : '';

    // Scroll modal back to top
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) modalContent.scrollTop = 0;

    if (!modal.open) modal.showModal();
}

// Attach click listeners to cards to save index
projectCards.forEach((card, index) => {
    card.addEventListener('click', () => {
        openProjectByIndex(index);
    });
});

// Capsule Button Listeners
modalPrevBtn?.addEventListener('click', () => openProjectByIndex(currentProjectIndex - 1));
modalNextBtn?.addEventListener('click', () => openProjectByIndex(currentProjectIndex + 1));
modalBackBtn?.addEventListener('click', () => modal.close());