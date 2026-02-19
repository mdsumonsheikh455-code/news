// Articles data management
const ARTICLES_FILE = 'articles/articles.json';

// Sample initial articles data
let articles = [
    {
        id: '001',
        title: 'Global Climate Summit Reaches Historic Agreement',
        author: 'Jane Smith',
        date: '2024-02-20',
        category: 'Politics',
        summary: 'World leaders commit to unprecedented carbon reduction targets in landmark climate deal.',
        content: 'In a historic moment for global cooperation, world leaders have reached a comprehensive agreement to combat climate change. The summit, held in Geneva, brought together representatives from over 190 countries who pledged to reduce carbon emissions by 50% by 2030...',
        image: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800',
        videoUrl: '',
        featured: 'hero'
    },
    {
        id: '002',
        title: 'Breakthrough in Quantum Computing Announced',
        author: 'Dr. Michael Chen',
        date: '2024-02-19',
        category: 'Technology',
        summary: 'Scientists achieve quantum supremacy with new 1000-qubit processor.',
        content: 'Researchers at Quantum Dynamics have unveiled a revolutionary quantum computer that promises to solve complex problems in seconds that would take traditional supercomputers thousands of years...',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
        videoUrl: '',
        featured: 'trending'
    },
    {
        id: '003',
        title: 'Markets Rally on Positive Economic Indicators',
        author: 'Sarah Johnson',
        date: '2024-02-18',
        category: 'Business',
        summary: 'Global markets surge as inflation shows signs of cooling.',
        content: 'Stock markets worldwide experienced their best week in months as new data suggests inflationary pressures are finally beginning to ease. The Federal Reserve\'s careful balancing act appears to be paying off...',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
        videoUrl: '',
        featured: 'trending'
    },
    {
        id: '004',
        title: 'Venice Biennale: A New Renaissance in Contemporary Art',
        author: 'Maria Garcia',
        date: '2024-02-17',
        category: 'Culture',
        summary: 'The 60th International Art Exhibition breaks attendance records.',
        content: 'The Venice Biennale has once again proven why it remains the world\'s most prestigious cultural event. This year\'s exhibition, titled "Stranieri Ovunque - Foreigners Everywhere," explores themes of migration and identity...',
        image: 'https://images.unsplash.com/photo-1561839561-b13bcfe95249?w=800',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        featured: 'video'
    },
    {
        id: '005',
        title: 'Deep Sea Expedition Discovers New Species',
        author: 'Dr. Robert Martinez',
        date: '2024-02-16',
        category: 'Science',
        summary: 'Marine biologists uncover dozens of previously unknown species in the Mariana Trench.',
        content: 'An international team of marine biologists has returned from a groundbreaking expedition to the Mariana Trench with discoveries that challenge our understanding of life in extreme environments...',
        image: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800',
        videoUrl: '',
        featured: 'special'
    }
];

// Load articles from localStorage or initialize with sample data
function loadArticles() {
    const stored = localStorage.getItem('articles');
    if (stored) {
        articles = JSON.parse(stored);
    } else {
        saveArticles();
    }
    return articles;
}

// Save articles to localStorage
function saveArticles() {
    localStorage.setItem('articles', JSON.stringify(articles));
}

// Get article by ID
function getArticleById(id) {
    return articles.find(article => article.id === id);
}

// Get articles by category
function getArticlesByCategory(category) {
    return articles.filter(article => article.category === category);
}

// Get featured articles
function getFeaturedArticles(type) {
    if (type) {
        return articles.filter(article => article.featured === type);
    }
    return articles;
}

// Get trending articles (most recent)
function getTrendingArticles(limit = 4) {
    return [...articles]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
}

// Search articles
function searchArticles(query) {
    query = query.toLowerCase();
    return articles.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.author.toLowerCase().includes(query)
    );
}

// Initialize on load
loadArticles();