document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================
    // 1. CUSTOM CURSOR LOGIC
    // =========================================
    const cursorDot = document.getElementById('custom-cursor-dot');
    const cursorOutline = document.getElementById('custom-cursor-outline');
    
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;
        
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 150, fill: "forwards" });
    });

    const addCursorHover = (element) => {
        element.addEventListener('mouseenter', () => cursorOutline.classList.add('hover-active'));
        element.addEventListener('mouseleave', () => cursorOutline.classList.remove('hover-active'));
    };

    document.querySelectorAll('a, button, .dropbtn').forEach(addCursorHover);

    document.querySelectorAll('input').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorDot.classList.add('text-active');
            cursorOutline.classList.add('text-active');
        });
        el.addEventListener('mouseleave', () => {
            cursorDot.classList.remove('text-active');
            cursorOutline.classList.remove('text-active');
        });
    });

    // =========================================
    // 2. DYNAMIC SEARCH INDEXER
    // =========================================
    const searchInput = document.getElementById('site-search');
    const searchResults = document.getElementById('search-results');
    const searchContainer = searchInput.closest('.search-container');
    const searchButton = searchContainer.querySelector('.search-btn');

    searchButton.addEventListener('click', () => {
        const isOpen = searchContainer.classList.toggle('is-open');
        searchButton.setAttribute('aria-expanded', isOpen);
        if (isOpen) searchInput.focus();
    });

    // List of all pages in your project directory
    const pagesToRoute = [
        { title: "About Me", url: "../AboutMe/" },
        { title: "SWOT Analysis", url: "../Swot/" },
        { title: "Success Plan", url: "../SuccessPlan/" },
        { title: "Talents & Ikigai", url: "../TalentsIkigai/" },
        { title: "Goals", url: "../Goals/" },
        { title: "Career Fit", url: "../CareerFit/" },
        { title: "Education & Networking Plan", url: "../EducationNetworking/" },
        { title: "Final Reflection", url: "../FinalReflection/" }
    ];

    let siteIndex = [];

    // Asynchronously fetch and parse every page
    Promise.all(pagesToRoute.map(page => 
        fetch(page.url)
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.text();
            })
            .then(html => {
                // Parse the raw HTML into a virtual DOM
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Extract text specifically from the main content area to avoid indexing the nav bar
                const mainContent = doc.querySelector('main');
                const contentText = mainContent ? mainContent.textContent : '';
                
                // Clean up line breaks and spacing, then push to the index
                siteIndex.push({
                    title: page.title,
                    url: page.url,
                    content: contentText.replace(/\s+/g, ' ').toLowerCase()
                });
            })
            .catch(err => console.warn(`Could not index ${page.url}. (If opening directly from a folder, see note below)`, err))
    ));

    // =========================================
    // 3. SEARCH EXECUTION
    // =========================================
    searchInput.addEventListener('input', function() {
        const queryText = this.value.toLowerCase().trim();
        searchResults.innerHTML = ''; 
        
        if (queryText.length > 0) {
            const searchWords = queryText.split(/\s+/);
            
            const matches = siteIndex.filter(page => {
                const pageText = (page.title + " " + page.content).toLowerCase();
                return searchWords.every(word => pageText.includes(word));
            });

            if (matches.length > 0) {
                matches.forEach(match => {
                    const link = document.createElement('a');
                    link.href = match.url;
                    link.textContent = match.title;
                    addCursorHover(link);
                    searchResults.appendChild(link);
                });
            } else {
                const noResult = document.createElement('div');
                noResult.style.padding = '12px 18px';
                noResult.style.color = 'rgba(255,255,255,0.5)';
                noResult.style.fontSize = '0.9rem';
                noResult.textContent = 'No results found.';
                searchResults.appendChild(noResult);
            }
            searchResults.classList.add('active');
        } else {
            searchResults.classList.remove('active');
        }
    });

    document.addEventListener('click', function(e) {
        if (!searchContainer.contains(e.target)) {
            searchResults.classList.remove('active');
            searchContainer.classList.remove('is-open');
            searchButton.setAttribute('aria-expanded', 'false');
        }
    });
});