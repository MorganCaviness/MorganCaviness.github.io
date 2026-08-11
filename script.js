// DOM references and shared state
const canvas = document.getElementById('particle-canvas');
const context = canvas?.getContext('2d');

const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImage = document.getElementById('lightbox-image');
const magnifier = document.getElementById('magnifier');
const lightboxSubtitle = document.getElementById('lightbox-subtitle');

const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
const lightboxNextBtn = document.getElementById('lightbox-next-btn');
const lightboxBackBtn = document.getElementById('lightbox-back-btn');
const resumeModal = document.getElementById('resume-modal');
const previewResumeBtn = document.getElementById('preview-resume-btn');
const closeResumeBtn = document.getElementById('close-resume-btn');

const modal = document.getElementById('project-modal');
const projectCards = document.querySelectorAll('.project-card');
const modalTitle = document.getElementById('modal-title');
const modalTech = document.getElementById('modal-tech');
const modalDesc = document.getElementById('modal-desc');
const modalExtraMedia = document.getElementById('modal-extra-media');
const modalPrevBtn = document.getElementById('modal-prev-btn');
const modalNextBtn = document.getElementById('modal-next-btn');
const modalBackBtn = document.getElementById('modal-back-btn');
const globalMobilePill = document.getElementById('global-mobile-pill');

function syncMobileProjectPill(activeCard) {
    if (!globalMobilePill) return;

    if (!activeCard) {
        globalMobilePill.replaceChildren();
        globalMobilePill.classList.remove('visible');
        globalMobilePill.removeAttribute('aria-label');
        globalMobilePill.hidden = true;
        return;
    }

    const projectInfo = activeCard.querySelector('.project-info');
    if (!projectInfo) return;

    globalMobilePill.replaceChildren(...Array.from(projectInfo.children, child => child.cloneNode(true)));
    const projectTitle = projectInfo.querySelector('h3')?.textContent?.trim() ?? 'project';
    globalMobilePill.setAttribute('aria-label', `Open ${projectTitle} project details`);
    globalMobilePill.hidden = false;
    requestAnimationFrame(() => globalMobilePill.classList.add('visible'));
}

function openActiveMobileProject() {
    const activeCard = document.querySelector('.project-card.is-popped');
    const cardIndex = getVisibleProjectCards().indexOf(activeCard);
    if (cardIndex >= 0) openProjectByIndex(cardIndex);
}

globalMobilePill?.addEventListener('click', openActiveMobileProject);
globalMobilePill?.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    openActiveMobileProject();
});

projectCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.classList.add('is-hovered');
    });
    card.addEventListener('mousemove', event => {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -10;
        const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 10;
        card.style.transform = `perspective(1000px) scale(1.03) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        card.classList.remove('is-hovered');
        card.style.transform = '';
    });
    card.addEventListener('focusin', () => {
        card.classList.add('is-hovered');
    });
    card.addEventListener('focusout', () => {
        if (!card.contains(document.activeElement)) {
            card.classList.remove('is-hovered');
        }
    });
    card.addEventListener('click', () => {
        const visibleCards = getVisibleProjectCards();
        const cardIndex = visibleCards.indexOf(card);
        if (cardIndex >= 0) openProjectByIndex(cardIndex);
    });
});

const cursorDot = document.getElementById('custom-cursor-dot');
const cursorOutline = document.getElementById('custom-cursor-outline');
let mouse = {
    x: null,
    y: null
};

let currentGallery = [];
let currentImageIndex = 0;
let currentProjectIndex = 0;

function triggerHaptic(pattern = 15) {
    if (!('vibrate' in navigator)) return;

    try {
        navigator.vibrate(pattern);
    } catch {
        // Some browsers expose the API without supporting vibration hardware.
    }
}

// Custom cursor
function bringCursorToFront() {
    try {
        cursorDot?.hidePopover();
        cursorOutline?.hidePopover();
    } catch (e) {}
    cursorDot?.showPopover();
    cursorOutline?.showPopover();
}

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    if (canvas) {
        const rect = canvas.getBoundingClientRect();
        canvas.mouseX = event.clientX - rect.left;
        canvas.mouseY = event.clientY - rect.top;
    }

    if (cursorDot) {
        cursorDot.style.left = `${mouse.x}px`;
        cursorDot.style.top = `${mouse.y}px`;
    }
    if (cursorOutline) {
        cursorOutline.animate({
            left: `${mouse.x}px`,
            top: `${mouse.y}px`
        }, {
            duration: 100,
            fill: "forwards"
        });
    }
});

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

document.addEventListener('mouseleave', () => {
    if (cursorDot) cursorDot.style.opacity = '0';
    if (cursorOutline) cursorOutline.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
    if (cursorDot) cursorDot.style.opacity = '';
    if (cursorOutline) cursorOutline.style.opacity = '';
});

// Particle background
if (canvas && context) {
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
            if (canvas.mouseX != null && canvas.mouseY != null) {
                const dx = canvas.mouseX - this.x;
                const dy = canvas.mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const interactionRadius = 150;

                if (distance > 0 && distance < interactionRadius) {
                    const force = (interactionRadius - distance) / interactionRadius;
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
            let scaleY = 1,
                scaleX = 1;

            if (this.y < fadeZone) scaleY = Math.max(0, this.y / fadeZone);
            else if (this.y > canvas.height - fadeZone) scaleY = Math.max(0, (canvas.height - this.y) / fadeZone);

            if (this.x < fadeZone) scaleX = Math.max(0, this.x / fadeZone);
            else if (this.x > canvas.width - fadeZone) scaleX = Math.max(0, (canvas.width - this.x) / fadeZone);

            const finalScale = scaleY * scaleX;
            const currentSize = Math.max(0.1, this.size * finalScale);

            context.globalAlpha = finalScale;
            context.fillStyle = this.color;
            context.beginPath();
            context.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
            context.fill();
            context.shadowBlur = 10 * finalScale;
            context.shadowColor = 'rgba(56, 189, 248, 0.8)';
            context.globalAlpha = 1.0;
        }
    }

    const particleArray = Array.from({
        length: 150
    }, () => new Particle());

    function animateParticles() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        particleArray.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();
}

// Modal media helpers

function initInlineCaptions(container) {
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

        // 1. Create the Stage (wraps image track & overlay buttons)
        const stage = document.createElement('div');
        stage.className = 'carousel-stage';

        // 2. Create Track & Slides
        const track = document.createElement('div');
        track.classList.add('carousel-track');
        images.forEach(img => {
            img.classList.add('carousel-slide');
            track.appendChild(img);
        });

        // 3. Create Navigation Arrow Buttons
        const prevBtn = document.createElement('button');
        prevBtn.className = 'carousel-btn prev';
        prevBtn.innerHTML = '‹';

        const nextBtn = document.createElement('button');
        nextBtn.className = 'carousel-btn next';
        nextBtn.innerHTML = '›';

        // 4. Create Dots Container
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'carousel-dots';

        // 5. Assemble Stage (Track + Buttons)
        stage.appendChild(track);
        stage.appendChild(prevBtn);
        stage.appendChild(nextBtn);

        // 6. Append Stage and Dots to Carousel
        carousel.appendChild(stage);
        carousel.appendChild(dotsContainer);

        let currentIndex = 0;
        images.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                goToSlide(index);
            });
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.carousel-dot');

        function goToSlide(index) {
            currentIndex = (index + images.length) % images.length;
            track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
        }

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            goToSlide(currentIndex - 1);
        });
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            goToSlide(currentIndex + 1);
        });

        carousel.dataset.initialized = 'true';
    });
}

function clearModalMedia() {
    currentGallery = [];
    currentImageIndex = 0;
    modalExtraMedia.replaceChildren();
    modalExtraMedia.classList.remove('collage-mode');
}

function clearAndCloseModal() {
    if (modal.open) {
        modal.close();
    } else {
        clearModalMedia();
    }
}
modal?.addEventListener('click', event => {
    if (event.target === modal) clearAndCloseModal();
});
modal?.addEventListener('close', clearModalMedia);

// Lightbox
function nextLightboxImage() {
    currentImageIndex = (currentImageIndex + 1) % currentGallery.length;
    updateLightboxView('next');
}

function prevLightboxImage() {
    currentImageIndex = (currentImageIndex - 1 + currentGallery.length) % currentGallery.length;
    updateLightboxView('prev');
}

function updateLightboxView(direction = 'none') {
    const currentData = currentGallery[currentImageIndex];
    const wrapper = document.querySelector('.lightbox-image-wrapper');

    lightboxSubtitle.style.transition = 'none';
    lightboxSubtitle.style.opacity = '0';
    document.querySelectorAll('.lightbox-clone').forEach(el => el.remove());

    let clone = null;

    if (direction !== 'none' && lightboxImage.src) {
        clone = lightboxImage.cloneNode(true);
        clone.id = '';
        clone.classList.add('lightbox-clone');

        clone.style.position = 'absolute';
        clone.style.width = `${lightboxImage.clientWidth}px`;
        clone.style.height = `${lightboxImage.clientHeight}px`;
        clone.style.margin = '0';
        clone.style.objectFit = 'contain';
        clone.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease';

        wrapper.appendChild(clone);
    }

    lightboxImage.style.transition = 'none';
    lightboxImage.style.opacity = '0';

    if (direction === 'next') {
        lightboxImage.style.transform = 'translate3d(100vw, 0, 0)';
    } else if (direction === 'prev') {
        lightboxImage.style.transform = 'translate3d(-100vw, 0, 0)';
    } else {
        lightboxImage.style.transform = 'translate3d(0, 0, 0)';
    }

    lightboxImage.src = currentData.src;

    lightboxImage.decode().then(() => {
        void lightboxImage.offsetWidth;

        lightboxImage.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease';
        lightboxImage.style.opacity = '1';
        lightboxImage.style.transform = 'translate3d(0, 0, 0)';

        if (clone) {
            if (direction === 'next') {
                clone.style.transform = 'translate3d(-100vw, 0, 0)';
            } else if (direction === 'prev') {
                clone.style.transform = 'translate3d(100vw, 0, 0)';
            }
            clone.style.opacity = '0';
            setTimeout(() => clone.remove(), 400);
        }

        if (currentData.subtitle) {
            lightboxSubtitle.innerText = currentData.subtitle;
            lightboxSubtitle.style.backgroundImage = `url(${currentData.src})`;
            lightboxSubtitle.style.width = `${lightboxImage.clientWidth}px`;
            lightboxSubtitle.style.display = 'block';

            void lightboxSubtitle.offsetWidth;
            lightboxSubtitle.style.transition = 'opacity 0.3s ease';
            lightboxSubtitle.style.opacity = '1';
        } else {
            lightboxSubtitle.style.display = 'none';
        }
        magnifier.style.backgroundImage = `url(${currentData.src})`;

    }).catch(err => console.error("Image load error:", err));

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

lightboxBackBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    lightboxModal.close();
});
lightboxNextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    nextLightboxImage();
});
lightboxPrevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    prevLightboxImage();
});
document.addEventListener('keydown', (e) => {
    if (lightboxModal.open) {
        if (e.key === 'ArrowRight') nextLightboxImage();
        if (e.key === 'ArrowLeft') prevLightboxImage();
    }
});

lightboxImage?.addEventListener('mouseenter', () => {
    cursorDot.style.opacity = '0';
    cursorOutline.style.opacity = '0';
});
lightboxImage?.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = '';
    cursorOutline.style.opacity = '';
});

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

// Lightbox gestures
let touchStartX = 0;
let touchEndX = 0;
let isSwiping = false;

lightboxModal?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    isSwiping = false;
}, {
    passive: true
});

lightboxModal?.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleLightboxSwipe();
}, {
    passive: true
});

function handleLightboxSwipe() {
    if (currentGallery.length <= 1) return;

    const swipeDistance = touchEndX - touchStartX;
    const swipeThreshold = 40;

    if (Math.abs(swipeDistance) > swipeThreshold) {
        isSwiping = true;

        if (swipeDistance < -swipeThreshold) {
            nextLightboxImage();
        } else if (swipeDistance > swipeThreshold) {
            prevLightboxImage();
        }

        setTimeout(() => isSwiping = false, 50);
    }
}

lightboxModal?.addEventListener('click', () => {
    if (!isSwiping) {
        lightboxModal.close();
    }
});

previewResumeBtn?.addEventListener('click', () => {
    resumeModal?.showModal();
    bringCursorToFront();
});

closeResumeBtn?.addEventListener('click', () => resumeModal?.close());
resumeModal?.addEventListener('click', event => {
    if (event.target === resumeModal) resumeModal.close();
});

// Project filtering
const filterBanner = document.getElementById('filter-banner');
const filterText = document.getElementById('filter-text')?.querySelector('strong');
const clearFilterBtn = document.getElementById('clear-filter-btn');

function filterProjectsByTag(selectedTag) {
    projectCards.forEach(card => {
        const cardTags = card.querySelector('.tech-stack').innerText.split('•').map(t => t.trim());
        if (cardTags.includes(selectedTag)) {
            card.hidden = false;
            card.style.animation = 'none';
            card.offsetHeight;
            card.style.animation = 'slideUpCard 0.8s ease-out forwards';
        } else {
            card.hidden = true;
        }
    });
    if (filterText && filterBanner) {
        filterText.innerText = selectedTag;
        filterBanner.hidden = false;
        document.getElementById('work').scrollIntoView({
            behavior: 'smooth'
        });
    }
}

clearFilterBtn?.addEventListener('click', () => {
    projectCards.forEach(card => {
        card.hidden = false;
        card.style.animation = '';
    });
    filterBanner.hidden = true;
});

// Scroll effects
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
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - (window.innerHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - 10) {
        current = sections[sections.length - 1].getAttribute('id');
    }

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}, {
    passive: true
});

// Keyboard shortcut
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

// Contact form
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(contactForm.action, {
            method: 'POST',
            body: new FormData(contactForm),
            headers: {
                'Accept': 'application/json'
            }
        });
        formStatus.hidden = false;
        if (response.ok) {
            formStatus.style.color = 'var(--accent)';
            formStatus.innerText = "Thanks! Your message has been sent successfully.";
            contactForm.reset();
        } else {
            formStatus.style.color = '#ef4444';
            formStatus.innerText = (await response.json()).error || "Oops! There was a problem.";
        }
    } catch (error) {
        formStatus.hidden = false;
        formStatus.style.color = '#ef4444';
        formStatus.innerText = "Network error. Please try again.";
    }
});

// Mobile card focus
let currentPoppedCard = null;

function applyDynamicTilt() {
    const isDesktopHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const isTouchViewport = window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches;

    if (!isTouchViewport && isDesktopHover) {
        projectCards.forEach(card => {
            card.classList.remove('is-popped');
        });
        syncMobileProjectPill(null);
        return;
    }

    if (modal?.open) {
        projectCards.forEach(card => card.classList.remove('is-popped'));
        syncMobileProjectPill(null);
        return;
    }

    const tiltElements = projectCards;

    const windowHeight = window.innerHeight;
    const targetY = windowHeight * 0.36;
    const popThreshold = 0.68;
    const topSafeZone = windowHeight * 0.04;
    const bottomSafeZone = windowHeight * 0.08;
    const portfolioBottom = document.querySelector('.portfolio-section')?.getBoundingClientRect().bottom || windowHeight;

    let closestElement = null;
    let closestDistance = Infinity;

    tiltElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elCenterY = rect.top + (rect.height / 2);
        const isTooHigh = rect.top < topSafeZone;
        const isTooLow = rect.bottom > windowHeight - bottomSafeZone;
        const isLastCardNearBottom = rect.bottom >= portfolioBottom - 140 && rect.bottom <= portfolioBottom + 120;
        if (isTooHigh) return;
        if (isTooLow && !isLastCardNearBottom) return;

        const distFromTarget = elCenterY - targetY;
        let percentage = distFromTarget / (windowHeight / 2);
        percentage = Math.max(-1, Math.min(1, percentage));
        const absDist = Math.abs(percentage);

        if (absDist < closestDistance) {
            closestDistance = absDist;
            closestElement = el;
        }
    });

    const poppedElement = closestDistance < popThreshold ? closestElement : null;

    tiltElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elCenterY = rect.top + (rect.height / 2);
        const distFromCenter = elCenterY - targetY;
        let percentage = distFromCenter / (windowHeight / 2);
        percentage = Math.max(-1, Math.min(1, percentage));

        let tiltX, scale, shadowY, shadowBlur, shadowAlpha;
        if (el === poppedElement) {
            tiltX = 0;
            scale = 1.05;
            shadowY = 20;
            shadowBlur = 40;
            shadowAlpha = 0.7;
        } else {
            tiltX = percentage * 15;
            scale = 1.0;
            shadowY = 4;
            shadowBlur = 10;
            shadowAlpha = 0.3;
        }

        el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) scale(${scale})`;
        el.style.boxShadow = `0 ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, ${shadowAlpha})`;
    });

    let activeCard = null;
    projectCards.forEach(card => {
        const isPopped = card === poppedElement?.closest('.project-card');
        card.classList.toggle('is-popped', isPopped);
        if (isPopped) activeCard = card;
    });

    if (activeCard !== currentPoppedCard) {
        currentPoppedCard = activeCard;
        if (activeCard) {
            triggerHaptic(15); // Fires a light vibration when a new card takes focus
        }
    }

    if (!activeCard) {
        syncMobileProjectPill(null);
        return;
    }

    syncMobileProjectPill(activeCard);
}

window.addEventListener('scroll', () => requestAnimationFrame(applyDynamicTilt));
window.addEventListener('resize', () => requestAnimationFrame(applyDynamicTilt));
window.addEventListener('load', () => requestAnimationFrame(applyDynamicTilt));
modal?.addEventListener('scroll', () => requestAnimationFrame(applyDynamicTilt));

requestAnimationFrame(() => applyDynamicTilt());

// Haptic feedback

function initHaptics() {
    if (!('vibrate' in navigator)) return;

    document.addEventListener('touchstart', event => {
        if (!(event.target instanceof Element)) return;

        const selector = '.nav-links a, .btn, .filter-banner button, .carousel-btn, .carousel-dot, .capsule-btn';
        if (event.target.closest(selector)) triggerHaptic();
    }, {
        passive: true
    });
}

initHaptics();

function getVisibleProjectCards() {
    return Array.from(projectCards).filter(card => !card.hidden);
}

function openProjectByIndex(index) {
    const cards = getVisibleProjectCards();
    if (cards.length === 0) return;

    currentProjectIndex = (index + cards.length) % cards.length;
    const targetCard = cards[currentProjectIndex];
    const hasMultipleVisibleProjects = cards.length > 1;

    if (modalPrevBtn) modalPrevBtn.hidden = !hasMultipleVisibleProjects;
    if (modalNextBtn) modalNextBtn.hidden = !hasMultipleVisibleProjects;

    const title = targetCard.querySelector('h3')?.textContent ?? '';
    const description = targetCard.querySelector('p:not(.tech-stack)')?.textContent ?? '';
    const hiddenMedia = targetCard.querySelector('.hidden-media');

    modalTitle.textContent = title;
    modalDesc.textContent = description;
    modalTech.replaceChildren();

    const modalTags = (targetCard.querySelector('.tech-stack')?.textContent ?? '')
        .split('•')
        .map(tag => tag.trim())
        .filter(Boolean);
    modalTags.forEach(tag => {
        const tagLink = document.createElement('a');
        tagLink.href = '#work';
        tagLink.className = 'tech-tag';
        tagLink.textContent = tag;
        tagLink.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            clearAndCloseModal();
            filterProjectsByTag(tag);
        });
        modalTech.appendChild(tagLink);
    });

    clearModalMedia();

    if (hiddenMedia) {
        modalExtraMedia.append(...Array.from(hiddenMedia.childNodes, node => node.cloneNode(true)));
        modalExtraMedia.classList.toggle('collage-mode', hiddenMedia.classList.contains('format-collage'));
        initCarousels(modalExtraMedia);
        initInlineCaptions(modalExtraMedia);

        const extraImgs = modalExtraMedia.querySelectorAll('img:not(.btn-icon)');
        extraImgs.forEach(img => {
            currentGallery.push({
                src: img.src,
                subtitle: img.dataset.subtitle ?? ''
            });

            img.addEventListener('click', () => {
                if (lightboxModal?.open) return;
                currentImageIndex = currentGallery.findIndex(item => item.src === img.src);
                updateLightboxView();
                lightboxModal.showModal();
                bringCursorToFront();
            });
        });

        modalExtraMedia.querySelectorAll('iframe').forEach(iframe => {
            iframe.addEventListener('mouseenter', () => {
                cursorDot.style.opacity = '0';
                cursorOutline.style.opacity = '0';
            });
            iframe.addEventListener('mouseleave', () => {
                cursorDot.style.opacity = '';
                cursorOutline.style.opacity = '';
            });
        });
    }

    modal.scrollTop = 0;
    if (!modal.open) modal.showModal();
    bringCursorToFront();
}

modalPrevBtn?.addEventListener('click', () => openProjectByIndex(currentProjectIndex - 1));
modalNextBtn?.addEventListener('click', () => openProjectByIndex(currentProjectIndex + 1));
modalBackBtn?.addEventListener('click', clearAndCloseModal);

// Mobile card stacking
projectCards.forEach((card, index) => {
    card.style.setProperty('--mobile-z', 100 - index);
});

projectCards.forEach(card => {
    let closingTimeout;
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const isPopped = card.classList.contains('is-popped');
                const wasPopped = mutation.oldValue ? mutation.oldValue.includes('is-popped') : false;

                if (wasPopped && !isPopped) {
                    card.classList.add('is-closing');
                    clearTimeout(closingTimeout);

                    closingTimeout = setTimeout(() => {
                        card.classList.remove('is-closing');
                    }, 500);
                }
            }
        });
    });

    observer.observe(card, {
        attributes: true,
        attributeFilter: ['class'],
        attributeOldValue: true
    });
});

// Tablet Scroll Focus Logic
window.addEventListener('scroll', () => {
    // Only run this logic on tablet screen sizes (601px to 1024px)
    if (window.innerWidth > 600 && window.innerWidth <= 1024) {
        const cards = document.querySelectorAll('.project-card');
        const viewportCenter = window.innerHeight / 2;

        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            // Find the vertical center of the card
            const cardCenter = rect.top + rect.height / 2;
            // Calculate distance from the center of the screen
            const distanceFromCenter = cardCenter - viewportCenter;
            
            // Check if this specific card is on the left or right side of the screen
            const isLeftColumn = rect.left < window.innerWidth / 2;
            
            let isActive = false;
            
            // The "Hot Zone": 200px above and below the exact center of the screen
            if (Math.abs(distanceFromCenter) < 200) {
                // As you scroll down, elements move UP the screen.
                if (isLeftColumn && distanceFromCenter > 0) {
                    // 1st Half: Left card focuses when the row is slightly below center
                    isActive = true;
                } else if (!isLeftColumn && distanceFromCenter <= 0) {
                    // 2nd Half: Right card focuses when the row crosses above center
                    isActive = true;
                }
            }

            // Toggle the focus class
            if (isActive) {
                card.classList.add('tablet-focus');
            } else {
                card.classList.remove('tablet-focus');
            }
        });
    }
});