/* =========================================
   1. HERO PARTICLE SYSTEM
========================================= */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImage = document.getElementById('lightbox-image');

// Resize canvas to fit the hero section
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Track mouse position
let mouse = { x: null, y: null };
window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Particle Class
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1; 
        
        // NEW: Base cruising speed (the speed they want to go naturally)
        this.baseSpeedX = Math.random() - 0.5; 
        this.baseSpeedY = Math.random() * -1 - 0.5; 
        
        // NEW: Actual current velocity (this changes when the mouse hits them)
        this.vx = this.baseSpeedX;
        this.vy = this.baseSpeedY;
        
        this.color = 'rgba(56, 189, 248, 0.4)'; 
    }

    // Update particle position (Like an Event Tick)
    update() {
        // 1. Mouse Interaction (Apply Force)
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            let interactionRadius = 150; // Increased from 80 so it catches the mouse effortlessly
            
            if (distance < interactionRadius) {
                // Calculate push force (stronger when the mouse is closer to the particle)
                let force = (interactionRadius - distance) / interactionRadius; 
                
                // Add velocity pushing AWAY from the mouse
                this.vx -= (dx / distance) * force * 1.5; 
                this.vy -= (dy / distance) * force * 1.5;
            }
        }

        // 2. Friction / Recovery (Lerp back to base speed)
        // Multiplier of 0.05 dictates how fast they hit the brakes and return to normal
        this.vx += (this.baseSpeedX - this.vx) * 0.05; 
        this.vy += (this.baseSpeedY - this.vy) * 0.05;

        // 3. Apply Velocity to Position
        this.x += this.vx;
        this.y += this.vy;

        // Reset particle safely behind the invisible fade zone
        if (this.y < 0) {
            this.y = canvas.height;
            this.x = Math.random() * canvas.width;
        }
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
    }

    // ... Keep your existing draw() method here! ...
    // Render particle to screen
    draw() {
        // 1. Calculate proximity to edges (80px fade zone)
        const fadeZone = 80;
        let scaleY = 1;
        let scaleX = 1;

        // Fade near top and bottom
        if (this.y < fadeZone) {
            scaleY = Math.max(0, this.y / fadeZone);
        } else if (this.y > canvas.height - fadeZone) {
            scaleY = Math.max(0, (canvas.height - this.y) / fadeZone);
        }

        // Fade near left and right
        if (this.x < fadeZone) {
            scaleX = Math.max(0, this.x / fadeZone);
        } else if (this.x > canvas.width - fadeZone) {
            scaleX = Math.max(0, (canvas.width - this.x) / fadeZone);
        }

        // 2. Combine for final scale and opacity
        const finalScale = scaleY * scaleX;
        // Math.max prevents radius errors by keeping size slightly above absolute 0
        const currentSize = Math.max(0.1, this.size * finalScale); 

        // 3. Apply fade and draw
        ctx.globalAlpha = finalScale; 
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 10 * finalScale; // Shrink the glow too
        ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
        
        ctx.globalAlpha = 1.0; // Reset for the next particle
    }
}

// Generate an array of particles
const particleArray = [];
const numberOfParticles = 150; // Adjust this for more/less density
for (let i = 0; i < numberOfParticles; i++) {
    particleArray.push(new Particle());
}

// The main animation loop
function animateParticles() {
    // Clear the previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw every particle
    for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].update();
        particleArray[i].draw();
    }
    
    // Call the next frame
    requestAnimationFrame(animateParticles);
}

// Start the loop
animateParticles();

// --- Keep your existing Modal code below this line! ---
// const modal = document.getElementById('project-modal');
// ...
// 

// 1. Get our UI elements (Like getting references in a Blueprint)
const modal = document.getElementById('project-modal');
const closeModalBtn = document.getElementById('close-modal');
const projectCards = document.querySelectorAll('.project-card');

// Elements inside the popup that we need to change
const modalImg = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalTech = document.getElementById('modal-tech');
const modalDesc = document.getElementById('modal-desc');
const modalExtraMedia = document.getElementById('modal-extra-media'); 

// 2. Add a Click Event to every project card
// 2. Add Events to every project card
projectCards.forEach(card => {
    
    // --- EXISTING MODAL CLICK EVENT ---
    card.addEventListener('click', () => {
        const imgSrc = card.querySelector('.project-image').src;
        const titleText = card.querySelector('h3').innerText;
        const techText = card.querySelector('.tech-stack').innerText;
        const descText = card.querySelector('p:not(.tech-stack)').innerText;
        const hiddenMedia = card.querySelector('.hidden-media');

        modalImg.src = imgSrc;
        modalTitle.innerText = titleText;
        modalTech.innerText = techText;
        modalDesc.innerText = descText;

// If the card has hidden media, copy it into the modal.
        if (hiddenMedia) {
            modalExtraMedia.innerHTML = hiddenMedia.innerHTML;
            const injectedVideos = modalExtraMedia.querySelectorAll('video');
            injectedVideos.forEach(vid => vid.load());
        } else {
            modalExtraMedia.innerHTML = '';
        }

        // --- UPDATED: Setup the Lightbox click events ---
        const clickableImages = modal.querySelectorAll('img');
        
        clickableImages.forEach(img => {
            img.addEventListener('click', () => {
                // Set the main image
                lightboxImage.src = img.src; 
                // Copy the image into the magnifying glass
                magnifier.style.backgroundImage = `url(${img.src})`; 
                
                lightboxModal.showModal(); 
                bringCursorToFront(); // NEW: Brings the cursor over the lightbox
            });
        });
        
        // This actually opens the project card!
        modal.showModal(); 
        bringCursorToFront(); // NEW: Brings the cursor over the lightbox
    });

    // --- NEW: 3D HOVER TILT EVENT ---
    card.addEventListener('mousemove', (event) => {
        // Get the card's exact size and position on the screen
        const rect = card.getBoundingClientRect();
        
        // Find exactly where the mouse is inside the card
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Find the absolute center of the card
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate the tilt (10 is the max degrees of rotation)
        const rotateX = ((y - centerY) / centerY) * -10; 
        const rotateY = ((x - centerX) / centerX) * 10;
        
        // Apply the 3D transform (including a slight 3% scale up for pop!)
        card.style.transform = `perspective(1000px) scale(1.03) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    // --- NEW: RESET TILT EVENT ---
    card.addEventListener('mouseleave', () => {
        // Snaps the card perfectly flat when the mouse leaves
        card.style.transform = `perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)`;
    });
});

// 3. A reusable function to close the modal AND stop videos from playing
function clearAndCloseModal() {
    modal.close();
    modalExtraMedia.innerHTML = ''; 
}

// 4. Close Modal Event (When clicking the X button)
closeModalBtn.addEventListener('click', clearAndCloseModal);

// 5. Close Modal Event (When clicking outside the window box)
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

// --- UPDATED: Magnifying Glass Logic ---
const magnifier = document.getElementById('magnifier');
const lightboxContainer = document.getElementById('lightbox-container');

lightboxContainer.addEventListener('mousemove', (event) => {
    magnifier.style.display = 'block';

    // Get the exact dimensions of the image itself
    const rect = lightboxImage.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    magnifier.style.left = `${x}px`;
    magnifier.style.top = `${y}px`;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    magnifier.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
    
    // Reduced the zoom level from 2.5x to 1.8x
    const zoomLevel = 1.8;
    magnifier.style.backgroundSize = `${rect.width * zoomLevel}px ${rect.height * zoomLevel}px`;
});

lightboxContainer.addEventListener('mouseleave', () => {
    magnifier.style.display = 'none';
});

// --- RESTORED: Close Lightbox Event ---
// Closes the full-screen image ONLY if you click the dark backdrop outside the image
lightboxModal.addEventListener('click', (event) => {
    // If the target of the click is the dialog wrapper itself (the backdrop)
    if (event.target === lightboxModal) {
        lightboxModal.close();
    }
});

// =========================================
//   THE KONAMI CODE EASTER EGG
// =========================================
// The required sequence of keys
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 
    'ArrowDown', 'ArrowDown', 
    'ArrowLeft', 'ArrowRight', 
    'ArrowLeft', 'ArrowRight', 
    'b', 'a'
];

let konamiPosition = 0; // Tracks how far along in the code the user is

document.addEventListener('keydown', (event) => {
    // 1. Check if the pressed key matches the next required key in the sequence
    if (event.key === konamiSequence[konamiPosition]) {
        konamiPosition++; // Move to the next step

        // 2. Did they complete the entire sequence?
        if (konamiPosition === konamiSequence.length) {
            triggerEasterEgg();
            konamiPosition = 0; // Reset so they can toggle it off later
        }
    } else {
        // 3. If they press the wrong key, reset their progress to zero
        konamiPosition = 0;
        
        // Minor fallback: if the wrong key was an 'Up Arrow', start the sequence over at step 1
        if (event.key === 'ArrowUp') {
            konamiPosition = 1;
        }
    }
});

function triggerEasterEgg() {
    // Toggles the retro-mode CSS class on the <body> tag
    document.body.classList.toggle('retro-mode');
    
    // Optional: Play a sound or show an alert so they know they found a secret!
    if (document.body.classList.contains('retro-mode')) {
        alert("CHEAT CODE ACTIVATED: Welcome to Retro Mode.");
    } else {
        alert("CHEAT CODE DEACTIVATED: Returning to Modern Reality.");
    }
}

// =========================================
//   SCROLL REVEAL (INTERSECTION OBSERVER)
// =========================================
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        // If the element crosses the threshold into the screen
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            
            // Optional: Stop observing once it has been revealed so it doesn't animate twice
            observer.unobserve(entry.target);
        }
    });
}, {
    // 0.15 means the animation triggers when 15% of the element is visible
    threshold: 0.15, 
    rootMargin: "0px 0px -50px 0px" // Triggers slightly before the absolute bottom of the screen
});

// Attach the observer to every element with the 'reveal' class
revealElements.forEach(el => revealObserver.observe(el));

// =========================================
//   CUSTOM CURSOR LOGIC
// =========================================
const cursorDot = document.getElementById('custom-cursor-dot');
const cursorOutline = document.getElementById('custom-cursor-outline');

window.addEventListener('mousemove', (event) => {
    const posX = event.clientX;
    const posY = event.clientY;
    
    // Instantly snap the center dot to the mouse
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;
    
    // Use the Web Animations API to give the outline a tiny, smooth delay
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 100, fill: "forwards" });
});

// Find everything clickable on the page
const interactables = document.querySelectorAll('a, button, .project-card, .extra-media img');

// Tell the outline to expand when hovering over interactables
interactables.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorOutline.classList.add('hover-active');
    });
    el.addEventListener('mouseleave', () => {
        cursorOutline.classList.remove('hover-active');
    });
});

// IMPORTANT: Hide our custom cursor when the Magnifying Glass is active!
const lightboxContainerForCursor = document.getElementById('lightbox-container');
if (lightboxContainerForCursor) {
    lightboxContainerForCursor.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '0';
        cursorOutline.style.opacity = '0';
    });
    lightboxContainerForCursor.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
    });
}

// =========================================
//   CUSTOM CURSOR LOGIC
// =========================================
const cursorDot = document.getElementById('custom-cursor-dot');
const cursorOutline = document.getElementById('custom-cursor-outline');

// NEW: Forces the cursors to the highest point of the Top Layer
function bringCursorToFront() {
    try { cursorDot.hidePopover(); } catch(e) {}
    try { cursorOutline.hidePopover(); } catch(e) {}
    cursorDot.showPopover();
    cursorOutline.showPopover();
}

// Initialize on page load
bringCursorToFront();