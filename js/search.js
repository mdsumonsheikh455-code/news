// Search functionality

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });
    
    searchBtn.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
            performSearch(query);
        }
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

function performSearch(query) {
    const results = searchArticles(query);
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No articles found</div>';
    } else {
        searchResults.innerHTML = results.slice(0, 5).map(article => `
            <div class="search-result-item" onclick="window.location.href='article.html?id=${article.id}'">
                <strong>${article.title}</strong><br>
                <small>${article.category} · ${formatDate(article.date)}</small>
            </div>
        `).join('');
        
        if (results.length > 5) {
            searchResults.innerHTML += '<div class="search-result-item" style="text-align: center;"><small>And more results...</small></div>';
        }
    }
    
    searchResults.style.display = 'block';
}