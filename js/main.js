// Main JavaScript for the website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dark mode
    initDarkMode();
    
    // Load homepage content
    if (document.querySelector('.hero-slider')) {
        loadHomepage();
    }
    
    // Initialize slider
    initSlider();
    
    // Initialize search if on homepage
    if (document.getElementById('searchInput')) {
        initSearch();
    }
});

// Dark Mode Toggle
function initDarkMode() {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    themeToggle.addEventListener('click', function() {
        if (document.body.getAttribute('data-theme') === 'dark') {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });
}

// Load homepage content
function loadHomepage() {
    // Load hero slider
    loadHeroSlider();
    
    // Load trending news
    loadTrendingNews();
    
    // Load top stories
    loadTopStories();
    
    // Load video news
    loadVideoNews();
    
    // Load special reports
    loadSpecialReports();
}

// Hero Slider
let currentSlide = 0;
let slideInterval;

function loadHeroSlider() {
    const heroArticles = articles.filter(a => a.featured === 'hero');
    const slider = document.getElementById('heroSlider');
    
    if (!slider) return;
    
    slider.innerHTML = heroArticles.map((article, index) => `
        <div class="slide ${index === 0 ? 'active' : ''}" data-index="${index}">
            <img src="${article.image}" alt="${article.title}">
            <div class="slide-content">
                <span class="article-category">${article.category}</span>
                <h2>${article.title}</h2>
                <p>${article.summary}</p>
                <a href="article.html?id=${article.id}" class="read-more">Read More</a>
            </div>
        </div>
    `).join('');
    
    startSlider();
}

function initSlider() {
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => changeSlide(-1));
        nextBtn.addEventListener('click', () => changeSlide(1));
    }
}

function startSlider() {
    stopSlider();
    slideInterval = setInterval(() => changeSlide(1), 5000);
}

function stopSlider() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    if (!slides.length) return;
    
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    
    // Restart interval
    stopSlider();
    startSlider();
}

// Load trending news
function loadTrendingNews() {
    const trending = getTrendingArticles(4);
    const container = document.getElementById('trendingNews');
    
    if (!container) return;
    
    container.innerHTML = trending.map(article => createArticleCard(article)).join('');
}

// Load top stories
function loadTopStories() {
    const topStories = articles.slice(0, 3);
    const container = document.getElementById('topStories');
    
    if (!container) return;
    
    container.innerHTML = topStories.map(article => `
        <div class="story-item" onclick="window.location.href='article.html?id=${article.id}'">
            <img src="${article.image}" alt="${article.title}" class="story-image">
            <div class="story-content">
                <span class="article-category">${article.category}</span>
                <h3>${article.title}</h3>
                <div class="article-meta">
                    <span>${article.author}</span>
                    <span>${formatDate(article.date)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Load video news
function loadVideoNews() {
    const videos = articles.filter(a => a.featured === 'video');
    const container = document.getElementById('videoNews');
    
    if (!container) return;
    
    container.innerHTML = videos.map(article => `
        <div class="video-card" onclick="openVideo('${article.videoUrl}')">
            <div class="video-thumbnail">
                <img src="${article.image}" alt="${article.title}">
                <div class="play-icon">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="article-content">
                <h3 class="article-title">${article.title}</h3>
                <p class="article-summary">${article.summary}</p>
            </div>
        </div>
    `).join('');
}

// Load special reports
function loadSpecialReports() {
    const reports = articles.filter(a => a.featured === 'special');
    const container = document.getElementById('specialReports');
    
    if (!container) return;
    
    container.innerHTML = reports.map(article => `
        <div class="report-card" onclick="window.location.href='article.html?id=${article.id}'">
            <span class="report-badge">Special Report</span>
            <img src="${article.image}" alt="${article.title}" class="article-image">
            <div class="article-content">
                <h3 class="article-title">${article.title}</h3>
                <p class="article-summary">${article.summary}</p>
                <div class="article-meta">
                    <span>${article.author}</span>
                    <span>${formatDate(article.date)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Create article card
function createArticleCard(article) {
    return `
        <div class="article-card" onclick="window.location.href='article.html?id=${article.id}'">
            <img src="${article.image}" alt="${article.title}" class="article-image">
            <div class="article-content">
                <span class="article-category">${article.category}</span>
                <h3 class="article-title">${article.title}</h3>
                <p class="article-summary">${article.summary}</p>
                <div class="article-meta">
                    <span>${article.author}</span>
                    <span>${formatDate(article.date)}</span>
                </div>
            </div>
        </div>
    `;
}

// Load article page
function loadArticle(articleId) {
    const article = getArticleById(articleId);
    if (!article) {
        window.location.href = 'index.html';
        return;
    }
    
    const container = document.getElementById('articleContent');
    if (!container) return;
    
    container.innerHTML = `
        <header class="article-header">
            <h1>${article.title}</h1>
            <div class="article-meta">
                <span><i class="far fa-user"></i> ${article.author}</span>
                <span><i class="far fa-calendar"></i> ${formatDate(article.date)}</span>
                <span><i class="far fa-folder"></i> ${article.category}</span>
            </div>
        </header>
        
        <img src="${article.image}" alt="${article.title}" class="article-featured-image">
        
        ${article.videoUrl ? `
            <div class="article-video">
                <iframe src="${article.videoUrl}" frameborder="0" allowfullscreen></iframe>
            </div>
        ` : ''}
        
        <div class="article-body">
            ${article.content.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
        </div>
    `;
    
    // Load related articles
    loadRelatedArticles(article.category, article.id);
    
    // Update page title
    document.title = `${article.title} - The Chronicle`;
}

// Load related articles
function loadRelatedArticles(category, currentId) {
    const related = articles
        .filter(a => a.category === category && a.id !== currentId)
        .slice(0, 3);
    
    const container = document.getElementById('relatedArticles');
    if (!container) return;
    
    if (related.length > 0) {
        container.innerHTML = related.map(article => createArticleCard(article)).join('');
    } else {
        container.parentElement.style.display = 'none';
    }
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Share functions
function shareOnTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.querySelector('h1').textContent);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareOnLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.querySelector('h1').textContent);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
}

function copyArticleLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard!');
    });
}

function openVideo(url) {
    window.open(url, '_blank');
}
