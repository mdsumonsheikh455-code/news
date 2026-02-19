// অ্যাডমিন প্যানেলের সম্পূর্ণ ফাংশনালিটি

let currentPage = 1;
let itemsPerPage = 10;
let filteredArticles = [];

document.addEventListener('DOMContentLoaded', function() {
    // অ্যাডমিন প্যানেল লোড করুন
    if (document.querySelector('.admin-main')) {
        loadAdminPanel();
    }
    
    // সেশন টাইমআউট রিসেট করুন
    resetSessionTimeout();
});

// অ্যাডমিন প্যানেল লোড
function loadAdminPanel() {
    // পরিসংখ্যান আপডেট
    updateStats();
    
    // নিউজ লিস্ট লোড
    loadArticlesList();
    
    // টুডের তারিখ সেট করুন
    document.getElementById('date').valueAsDate = new Date();
    
    // ইমেজ প্রিভিউ
    document.getElementById('image').addEventListener('input', function(e) {
        const preview = document.getElementById('imagePreview');
        if (e.target.value) {
            preview.innerHTML = `<img src="${e.target.value}" alt="Preview" style="max-width: 100px; max-height: 100px;">`;
        } else {
            preview.innerHTML = '';
        }
    });
    
    // সার্চ ফাংশনালিটি
    document.getElementById('searchArticles')?.addEventListener('input', function(e) {
        filterArticles(e.target.value);
    });
    
    // ক্যাটাগরি ফিল্টার
    document.getElementById('filterCategory')?.addEventListener('change', function(e) {
        filterArticles(document.getElementById('searchArticles').value, e.target.value);
    });
    
    // ফর্ম সাবমিট
    document.getElementById('articleForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveArticle();
    });
    
    // ইম্পোর্ট ফাইল
    document.getElementById('restoreFile')?.addEventListener('change', function(e) {
        restoreData(e.target.files[0]);
    });
    
    // অটো সেভ সেটআপ
    setupAutoSave();
    
    // লাস্ট ব্যাকআপ দেখান
    const lastBackup = localStorage.getItem('lastBackup');
    if (lastBackup) {
        document.getElementById('lastBackup').textContent = new Date(lastBackup).toLocaleString('bn-BD');
    }
}

// পরিসংখ্যান আপডেট
function updateStats() {
    const totalArticles = articles.length;
    const authors = [...new Set(articles.map(a => a.author))].length;
    const categories = [...new Set(articles.map(a => a.category))].length;
    
    document.getElementById('totalArticles').textContent = totalArticles;
    document.getElementById('totalAuthors').textContent = authors;
    document.getElementById('totalComments').textContent = '০'; // ডিসকাস থেকে আনা যাবে
    
    // আজকের ভিউ (ডেমো)
    const todayViews = localStorage.getItem('todayViews') || Math.floor(Math.random() * 1000);
    document.getElementById('todayViews').textContent = todayViews;
}

// নিউজ লিস্ট লোড
function loadArticlesList(page = 1) {
    const container = document.getElementById('articlesList');
    if (!container) return;
    
    filteredArticles = filterArticlesBySearch('', '');
    
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageArticles = filteredArticles.slice(start, end);
    
    if (pageArticles.length === 0) {
        container.innerHTML = '<tr><td colspan="7" class="no-data">কোনো নিউজ পাওয়া যায়নি</td></tr>';
        return;
    }
    
    container.innerHTML = pageArticles.map(article => `
        <tr>
            <td>
                <img src="${article.image}" alt="${article.title}" class="table-thumbnail" 
                     onerror="this.src='https://via.placeholder.com/50'">
            </td>
            <td>
                <strong>${article.title}</strong>
                ${article.tags ? `<br><small>${article.tags.split(',').map(t => `#${t.trim()}`).join(' ')}</small>` : ''}
            </td>
            <td><span class="category-badge">${getBengaliCategory(article.category)}</span></td>
            <td>${article.author}</td>
            <td>${formatDateBangla(article.date)}</td>
            <td>
                <span class="status-badge status-${article.status || 'published'}">
                    ${getStatusBangla(article.status || 'published')}
                </span>
            </td>
            <td class="action-buttons">
                <button onclick="editArticle('${article.id}')" class="btn-icon edit" title="এডিট">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="duplicateArticle('${article.id}')" class="btn-icon copy" title="ডুপ্লিকেট">
                    <i class="fas fa-copy"></i>
                </button>
                <button onclick="previewArticle('${article.id}')" class="btn-icon preview" title="প্রিভিউ">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="deleteArticle('${article.id}')" class="btn-icon delete" title="ডিলিট">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // প্যাজিনেশন আপডেট
    updatePagination(filteredArticles.length, page);
}

// ফিল্টার আর্টিকেল
function filterArticlesBySearch(searchTerm = '', category = '') {
    return articles.filter(article => {
        const matchesSearch = searchTerm === '' || 
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.author.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = category === '' || article.category === category;
        
        return matchesSearch && matchesCategory;
    });
}

// ফিল্টার আর্টিকেল (ইউজার ইন্টারফেসের জন্য)
function filterArticles(searchTerm, category) {
    filteredArticles = filterArticlesBySearch(searchTerm, category);
    currentPage = 1;
    loadArticlesList(currentPage);
}

// প্যাজিনেশন আপডেট
function updatePagination(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '<div class="pagination-controls">';
    
    // প্রিভিয়াস বাটন
    if (currentPage > 1) {
        html += `<button onclick="changePage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
    }
    
    // পৃষ্ঠা সংখ্যা
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button class="active">${i}</button>`;
        } else if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) {
            html += `<button onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span>...</span>`;
        }
    }
    
    // নেক্সট বাটন
    if (currentPage < totalPages) {
        html += `<button onclick="changePage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
    }
    
    html += '</div>';
    pagination.innerHTML = html;
}

// পৃষ্ঠা পরিবর্তন
function changePage(page) {
    currentPage = page;
    loadArticlesList(currentPage);
}

// নিউজ সেভ
function saveArticle() {
    const articleId = document.getElementById('articleId').value;
    
    const article = {
        id: articleId || generateId(),
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        date: document.getElementById('date').value,
        category: document.getElementById('category').value,
        summary: document.getElementById('summary').value,
        content: document.getElementById('content').value,
        image: document.getElementById('image').value,
        videoUrl: document.getElementById('videoUrl').value,
        featured: document.getElementById('featured').value,
        status: document.getElementById('status').value,
        tags: document.getElementById('tags').value,
        lastModified: new Date().toISOString()
    };
    
    // ভ্যালিডেশন
    if (!article.title || !article.author || !article.content) {
        alert('অনুগ্রহ করে প্রয়োজনীয় তথ্য দিন');
        return;
    }
    
    if (articleId) {
        // আপডেট এক্সিস্টিং আর্টিকেল
        const index = articles.findIndex(a => a.id === articleId);
        if (index !== -1) {
            articles[index] = { ...articles[index], ...article };
        }
        showNotification('নিউজ আপডেট হয়েছে', 'success');
    } else {
        // নতুন আর্টিকেল যোগ
        articles.push(article);
        showNotification('নতুন নিউজ যোগ হয়েছে', 'success');
    }
    
    // লোকাল স্টোরেজে সেভ
    saveArticles();
    
    // লিস্ট রিলোড
    loadArticlesList();
    
    // ফর্ম রিসেট
    resetForm();
    
    // অটো-সেভ ক্লিয়ার
    localStorage.removeItem('autoSave_draft');
}

// নিউজ এডিট
function editArticle(id) {
    const article = getArticleById(id);
    if (!article) return;
    
    document.getElementById('articleId').value = article.id;
    document.getElementById('title').value = article.title;
    document.getElementById('author').value = article.author;
    document.getElementById('date').value = article.date;
    document.getElementById('category').value = article.category;
    document.getElementById('summary').value = article.summary;
    document.getElementById('content').value = article.content;
    document.getElementById('image').value = article.image;
    document.getElementById('videoUrl').value = article.videoUrl || '';
    document.getElementById('featured').value = article.featured || '';
    document.getElementById('status').value = article.status || 'published';
    document.getElementById('tags').value = article.tags || '';
    
    // ইমেজ প্রিভিউ
    if (article.image) {
        document.getElementById('imagePreview').innerHTML = `<img src="${article.image}" alt="Preview" style="max-width: 100px; max-height: 100px;">`;
    }
    
    // ফর্মে স্ক্রোল
    document.querySelector('.admin-form').scrollIntoView({ behavior: 'smooth' });
    
    showNotification('এডিট মোডে আছেন', 'info');
}

// নিউজ ডুপ্লিকেট
function duplicateArticle(id) {
    const article = getArticleById(id);
    if (!article) return;
    
    const newArticle = {
        ...article,
        id: generateId(),
        title: `${article.title} (কপি)`,
        date: new Date().toISOString().split('T')[0]
    };
    
    articles.push(newArticle);
    saveArticles();
    loadArticlesList();
    
    showNotification('নিউজ ডুপ্লিকেট করা হয়েছে', 'success');
}

// নিউজ ডিলিট
function deleteArticle(id) {
    if (confirm('আপনি কি নিশ্চিত এই নিউজ ডিলিট করতে চান?')) {
        articles = articles.filter(a => a.id !== id);
        saveArticles();
        loadArticlesList();
        showNotification('নিউজ ডিলিট করা হয়েছে', 'warning');
    }
}

// প্রিভিউ আর্টিকেল
function previewArticle(id) {
    const article = id ? getArticleById(id) : getCurrentFormData();
    if (!article) return;
    
    const modal = document.getElementById('previewModal');
    const previewContent = document.getElementById('previewContent');
    
    previewContent.innerHTML = `
        <article class="preview-article">
            <h1>${article.title}</h1>
            <div class="preview-meta">
                <span><i class="fas fa-user"></i> ${article.author}</span>
                <span><i class="fas fa-calendar"></i> ${formatDateBangla(article.date)}</span>
                <span><i class="fas fa-tag"></i> ${getBengaliCategory(article.category)}</span>
            </div>
            <img src="${article.image}" alt="${article.title}" style="max-width: 100%;">
            <div class="preview-content">
                ${article.content.split('\n').map(p => `<p>${p}</p>`).join('')}
            </div>
        </article>
    `;
    
    modal.style.display = 'block';
    
    // ক্লোজ বাটন
    modal.querySelector('.close').onclick = function() {
        modal.style.display = 'none';
    };
    
    // বাইরে ক্লিক করলে বন্ধ
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

// ফর্ম ডাটা পাওয়া
function getCurrentFormData() {
    return {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        date: document.getElementById('date').value,
        category: document.getElementById('category').value,
        content: document.getElementById('content').value,
        image: document.getElementById('image').value,
        summary: document.getElementById('summary').value
    };
}

// ফর্ম রিসেট
function resetForm() {
    document.getElementById('articleForm').reset();
    document.getElementById('articleId').value = '';
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('status').value = 'published';
    
    showNotification('ফর্ম রিসেট করা হয়েছে', 'info');
}

// অটো-সেভ সেটআপ
function setupAutoSave() {
    const form = document.getElementById('articleForm');
    let autoSaveTimeout;
    
    form.addEventListener('input', function() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            const formData = getCurrentFormData();
            if (formData.title || formData.content) {
                localStorage.setItem('autoSave_draft', JSON.stringify(formData));
                showNotification('ড্রাফট অটো-সেভ হয়েছে', 'info');
            }
        }, 3000);
    });
    
    // অটো-সেভ লোড
    const savedDraft = localStorage.getItem('autoSave_draft');
    if (savedDraft) {
        if (confirm('একটি অটো-সেভ করা ড্রাফট পাওয়া গেছে। লোড করবেন?')) {
            const draft = JSON.parse(savedDraft);
            document.getElementById('title').value = draft.title || '';
            document.getElementById('author').value = draft.author || '';
            document.getElementById('content').value = draft.content || '';
            // অন্যান্য ফিল্ড
        }
    }
}

// ব্যাকআপ নেওয়া
function backupData() {
    const data = {
        articles: articles,
        settings: {
            autoPublish: document.getElementById('autoPublish')?.checked,
            emailNotification: document.getElementById('emailNotification')?.checked,
            commentsModeration: document.getElementById('commentsModeration')?.checked,
            articlesPerPage: document.getElementById('articlesPerPage')?.value
        },
        backupDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const fileName = `chronicle-backup-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
    
    localStorage.setItem('lastBackup', new Date().toISOString());
    document.getElementById('lastBackup').textContent = new Date().toLocaleString('bn-BD');
    
    showNotification('ব্যাকআপ নেওয়া হয়েছে', 'success');
}

// ডাটা রিস্টোর
function restoreData(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.articles && Array.isArray(data.articles)) {
                articles = data.articles;
                saveArticles();
                
                // সেটিংস রিস্টোর
                if (data.settings) {
                    document.getElementById('autoPublish').checked = data.settings.autoPublish || false;
                    document.getElementById('emailNotification').checked = data.settings.emailNotification || false;
                    document.getElementById('commentsModeration').checked = data.settings.commentsModeration || false;
                    if (data.settings.articlesPerPage) {
                        document.getElementById('articlesPerPage').value = data.settings.articlesPerPage;
                        itemsPerPage = parseInt(data.settings.articlesPerPage);
                    }
                }
                
                loadArticlesList();
                showNotification('ডাটা রিস্টোর করা হয়েছে', 'success');
            } else {
                throw new Error('ইনভ্যালিড ফাইল ফরম্যাট');
            }
        } catch (error) {
            showNotification('ত্রুটি: ফাইল ফরম্যাট ঠিক নয়', 'error');
        }
    };
    
    reader.readAsText(file);
}

// গিটহাব সিঙ্ক (ডেমো)
function syncWithGitHub() {
    showNotification('গিটহাব সিঙ্ক শুরু হয়েছে...', 'info');
    
    // এখানে গিটহাব API কল করা যাবে
    setTimeout(() => {
        showNotification('গিটহাব সিঙ্ক সম্পন্ন', 'success');
    }, 2000);
}

// নোটিফিকেশন দেখান
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                        type === 'error' ? 'fa-exclamation-circle' : 
                        'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// টেক্সট ফরম্যাটিং
function insertFormat(type) {
    const content = document.getElementById('content');
    const start = content.selectionStart;
    const end = content.selectionEnd;
    const selectedText = content.value.substring(start, end);
    const text = content.value;
    
    let formattedText = '';
    
    switch(type) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            break;
        case 'italic':
            formattedText = `*${selectedText}*`;
            break;
        case 'underline':
            formattedText = `<u>${selectedText}</u>`;
            break;
        case 'link':
            const url = prompt('URL দিন:');
            if (url) {
                formattedText = `[${selectedText}](${url})`;
            }
            break;
        case 'image':
            const imageUrl = prompt('ছবির URL দিন:');
            if (imageUrl) {
                formattedText = `![${selectedText || 'image'}](${imageUrl})`;
            }
            break;
    }
    
    content.value = text.substring(0, start) + formattedText + text.substring(end);
}

// ইউনিক আইডি জেনারেট
function generateId() {
    return 'article_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// বাংলা ক্যাটাগরি
function getBengaliCategory(category) {
    const categories = {
        'Politics': 'রাজনীতি',
        'Technology': 'প্রযুক্তি',
        'Business': 'অর্থনীতি',
        'Sports': 'খেলা',
        'Entertainment': 'বিনোদন',
        'International': 'আন্তর্জাতিক',
        'Video': 'ভিডিও',
        'Special': 'বিশেষ প্রতিবেদন'
    };
    return categories[category] || category;
}

// স্ট্যাটাস বাংলায়
function getStatusBangla(status) {
    const statuses = {
        'published': 'প্রকাশিত',
        'draft': 'খসড়া',
        'scheduled': 'নির্ধারিত'
    };
    return statuses[status] || status;
}

// বাংলা তারিখ
function formatDateBangla(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('bn-BD', options);
}