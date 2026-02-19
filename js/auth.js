// Authentication System
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123' // পরিবর্তন করার জন্য ডিফল্ট পাসওয়ার্ড
};

// চেক লগইন স্ট্যাটাস
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    // যদি রিমেম্বার মি true থাকে তাহলে সেশন স্টোরেজ চেক না করে লগইন ধরে নিবে
    if (rememberMe && localStorage.getItem('isLoggedIn') === 'true') {
        return true;
    }
    
    return isLoggedIn;
}

// লগইন ফাংশন
function login(username, password, rememberMe) {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        if (rememberMe) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('rememberMe', 'true');
        } else {
            sessionStorage.setItem('isLoggedIn', 'true');
        }
        
        // লাস্ট লগইন টাইম সেভ
        localStorage.setItem('lastLogin', new Date().toISOString());
        
        return true;
    }
    return false;
}

// লগআউট ফাংশন
function logout() {
    sessionStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('rememberMe');
    window.location.href = 'login.html';
}

// পাসওয়ার্ড পরিবর্তন
function changePassword(currentPassword, newPassword) {
    if (currentPassword === ADMIN_CREDENTIALS.password) {
        ADMIN_CREDENTIALS.password = newPassword;
        // 실제 구현에서는 서버에 저장해야 함
        localStorage.setItem('adminPassword', newPassword);
        return true;
    }
    return false;
}

// ডকুমেন্ট লোড হওয়ার পর
document.addEventListener('DOMContentLoaded', function() {
    // লগইন পেজে থাকলে
    if (window.location.pathname.includes('login.html')) {
        // ইতিমধ্যে লগইন করা থাকলে ড্যাশবোর্ডে রিডাইরেক্ট
        if (checkAuth()) {
            window.location.href = 'admin.html';
        }
        
        // লগইন ফর্ম হ্যান্ডলার
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const rememberMe = document.getElementById('rememberMe')?.checked || false;
                
                if (login(username, password, rememberMe)) {
                    window.location.href = 'admin.html';
                } else {
                    const errorDiv = document.getElementById('loginError');
                    errorDiv.querySelector('span').textContent = 'ভুল ইউজারনেম বা পাসওয়ার্ড!';
                    errorDiv.style.display = 'flex';
                }
            });
        }
    }
    
    // অ্যাডমিন পেজে থাকলে চেক করুন
    if (window.location.pathname.includes('admin.html') && !checkAuth()) {
        window.location.href = 'login.html';
        return;
    }
    
    // লগআউট বাটন
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // পাসওয়ার্ড চেঞ্জ ফর্ম
    const passwordForm = document.getElementById('passwordChangeForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const current = document.getElementById('currentPassword').value;
            const newPass = document.getElementById('newPassword').value;
            const confirm = document.getElementById('confirmPassword').value;
            
            if (newPass !== confirm) {
                alert('নতুন পাসওয়ার্ড মিলছে না!');
                return;
            }
            
            if (changePassword(current, newPass)) {
                alert('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!');
                passwordForm.reset();
            } else {
                alert('বর্তমান পাসওয়ার্ড ভুল!');
            }
        });
    }
});

// সেশন টাইমআউট চেক (৩০ মিনিট)
let sessionTimeout;
function resetSessionTimeout() {
    if (sessionTimeout) {
        clearTimeout(sessionTimeout);
    }
    
    sessionTimeout = setTimeout(() => {
        if (checkAuth() && !localStorage.getItem('rememberMe')) {
            alert('সেশনের সময় শেষ হয়েছে। অনুগ্রহ করে আবার লগইন করুন।');
            logout();
        }
    }, 30 * 60 * 1000); // 30 minutes
}

// ইউজার অ্যাক্টিভিটি ট্র্যাক করুন
document.addEventListener('click', resetSessionTimeout);
document.addEventListener('keypress', resetSessionTimeout);
document.addEventListener('mousemove', resetSessionTimeout);